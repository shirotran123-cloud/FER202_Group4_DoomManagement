/**
 * DMS backend — khớp domain frontend (src/types, src/lib/dorm-ops.ts).
 *
 * Chạy: npm run server   (PORT mặc định 3001, start.bat dùng 3101)
 *
 * Phục vụ:
 *  - REST CRUD trên db.json qua json-server (/api/users, /api/beds, /api/tickets, ...)
 *  - Nghiệp vụ khớp 1:1 công thức frontend:
 *      POST /api/billing/calculate   tính hóa đơn chia đều (điện bậc thang)
 *      POST /api/billing/issue       ghi chỉ số + phát hành hóa đơn + thông báo
 *      POST /api/bookings/approve    auto-approval 3 điều kiện
 *      POST /api/gate/scan           quét cổng 23:00 (ON_TIME/APPROVED_LATE/UNAUTHORIZED_LATE)
 *      POST /api/visitors            đăng ký khách (12 số CCCD, rời trước 21:00)
 *      POST /api/visitors/:id/check-in | /check-out
 *      POST /api/tickets/:id/transition   luồng PENDING→IN_PROGRESS→RESOLVED→CLOSED
 *      GET  /api/config              hằng số giá + giới nghiêm
 *      GET  /api/health              healthcheck
 *      GET  /api/events              SSE realtime
 */
import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- hằng số khớp src/lib/dorm-ops.ts ---------- */
const ELECTRICITY_TIERS = [
  { upToKwh: 50, pricePerKwh: 1800 },
  { upToKwh: 100, pricePerKwh: 2200 },
  { upToKwh: 200, pricePerKwh: 2600 },
  { upToKwh: Infinity, pricePerKwh: 3100 },
];
const WATER_PRICE_PER_M3 = 18000;
const CURFEW_HOUR = 23;
const VISITOR_LATEST_HOUR = 21;
const MAX_RATING = 5;
const TICKET_FLOW = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

function calculateTieredElectricity(kwh) {
  if (!Number.isFinite(kwh) || kwh <= 0) return 0;
  let remaining = Math.floor(kwh);
  let total = 0;
  let prevCap = 0;
  for (const tier of ELECTRICITY_TIERS) {
    const usable = Math.min(remaining, tier.upToKwh - prevCap);
    if (usable > 0) {
      total += usable * tier.pricePerKwh;
      remaining -= usable;
    }
    prevCap = tier.upToKwh;
    if (remaining <= 0) break;
  }
  return total;
}

function splitEvenly(total, numPeople) {
  if (!Number.isFinite(total) || total < 0) return 0;
  if (!Number.isFinite(numPeople) || numPeople <= 0) return 0;
  return Math.round(total / Math.floor(numPeople));
}

function buildMonthlyInvoice(input) {
  const deltaElec = Math.max(0, Math.floor(input.elecNew - input.elecOld));
  const deltaWater = Math.max(0, Math.floor(input.waterNew - input.waterOld));
  const elecCost = calculateTieredElectricity(deltaElec);
  const waterCost = deltaWater * WATER_PRICE_PER_M3;
  const sharedFees = Math.max(0, input.wifiFeeTotal) + Math.max(0, input.cleaningFeeTotal);
  const roomTotal = Math.max(0, input.roomFeePerStudent) * Math.max(1, Math.floor(input.numStudents));
  const utilityTotal = elecCost + waterCost + sharedFees;
  const perStudentUtility = splitEvenly(utilityTotal, input.numStudents);
  return {
    room: input.room,
    month: input.month,
    deltaElec,
    deltaWater,
    elecCost,
    waterCost,
    sharedFees,
    roomTotal,
    grandTotal: utilityTotal + roomTotal,
    perStudentUtility,
    perStudentTotal: perStudentUtility + Math.max(0, input.roomFeePerStudent),
  };
}

function evaluateGateScan(scanHour, hasApprovedRequest) {
  const late = scanHour >= CURFEW_HOUR || scanHour < 5;
  if (!late) return 'ON_TIME';
  return hasApprovedRequest ? 'APPROVED_LATE' : 'UNAUTHORIZED_LATE';
}

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

/* ---------- CORS cho Vite dev (5173 / 4173 preview) ---------- */
server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

/* ---------- Security headers ---------- */
server.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

/* ---------- Rate limit + cache + job queue + SSE ---------- */
const WINDOW_MS = 60_000;
const LIMITS = { public: 200, sensitive: 20 };
const buckets = new Map();
function rateLimit(kind) {
  return (req, res, next) => {
    const key = `${kind}:${req.ip}`;
    const now = Date.now();
    const entry = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + WINDOW_MS;
    }
    entry.count += 1;
    buckets.set(key, entry);
    res.setHeader('X-RateLimit-Limit', String(LIMITS[kind]));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, LIMITS[kind] - entry.count)));
    if (entry.count > LIMITS[kind]) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
    next();
  };
}

const cache = new Map();
function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}
function cacheSet(key, value, ttlMs = 30_000) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
function cacheDel(prefix) {
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key);
}

const jobQueue = [];
const jobResults = new Map();
function enqueueJob(type, payload) {
  const job = { id: `job_${Date.now()}_${Math.floor(Math.random() * 1e4)}`, type, payload, status: 'QUEUED', createdAt: new Date().toISOString() };
  jobQueue.push(job);
  setTimeout(() => {
    job.status = 'DONE';
    job.finishedAt = new Date().toISOString();
    jobResults.set(job.id, job);
  }, 50);
  return job;
}

const sseClients = new Set();
function broadcastEvent(kind, title) {
  const evt = { id: `evt_${Date.now()}`, kind, title, at: new Date().toISOString() };
  for (const res of sseClients) res.write(`data: ${JSON.stringify(evt)}\n\n`);
  return evt;
}

server.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify({ id: 'hello', kind: 'HELLO', title: 'Realtime KTX connected', at: new Date().toISOString() })}\n\n`);
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

/* ---------- Helpers tra cứu db ---------- */
const DB = () => router.db;
const read = (coll) => DB().get(coll).value() || [];
const findStudent = (mssv) => read('users').find((u) => (u.mssv || u.studentId) === mssv);
const findBedByCode = (code) => read('beds').find((b) => b.fullCode === code);

/* ---------- Healthcheck ---------- */
server.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'dms-backend',
    time: new Date().toISOString(),
    queue: jobQueue.length,
    sseClients: sseClients.size,
    collections: Object.keys(DB().value() || {}).length,
  });
});

/* ---------- Config dùng chung ---------- */
server.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      electricityTiers: ELECTRICITY_TIERS,
      waterPricePerM3: WATER_PRICE_PER_M3,
      curfewHour: CURFEW_HOUR,
      visitorLatestHour: VISITOR_LATEST_HOUR,
      maxRating: MAX_RATING,
      vat: 0.08,
    },
  });
});

/* ---------- Billing: tính + phát hành ---------- */
server.post('/api/billing/calculate', rateLimit('public'), (req, res) => {
  const b = req.body || {};
  const required = ['room', 'month', 'elecOld', 'elecNew', 'waterOld', 'waterNew', 'roomFeePerStudent', 'wifiFeeTotal', 'cleaningFeeTotal', 'numStudents'];
  const missing = required.filter((k) => b[k] === undefined || b[k] === null);
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Thiếu trường: ${missing.join(', ')}` });
  }
  if (b.elecNew < b.elecOld) {
    return res.status(400).json({ success: false, message: 'Chỉ số điện mới không được nhỏ hơn chỉ số cũ' });
  }
  if (b.waterNew < b.waterOld) {
    return res.status(400).json({ success: false, message: 'Chỉ số nước mới không được nhỏ hơn chỉ số cũ' });
  }
  res.json({ success: true, data: buildMonthlyInvoice(b) });
});

server.post('/api/billing/issue', rateLimit('sensitive'), (req, res) => {
  const b = req.body || {};
  if (!b.room || !b.month) {
    return res.status(400).json({ success: false, message: 'Cần room và month' });
  }
  const invoice = buildMonthlyInvoice(b);
  const record = {
    id: `util_${b.room}_${b.month}`,
    room: b.room,
    month: b.month,
    elecOld: b.elecOld,
    elecNew: b.elecNew,
    waterOld: b.waterOld,
    waterNew: b.waterNew,
    meterPhotoIds: b.meterPhotoIds || [],
    recordedBy: b.recordedBy || 'unknown',
    recordedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  DB().get('utilityRecords').remove({ id: record.id }).write();
  DB().get('utilityRecords').push(record).write();

  const inv = {
    id: `INV-${b.month}-${b.room}`,
    invoiceCode: `INV-${b.month}-${b.room}`,
    ...invoice,
    utilityRecordId: record.id,
    numStudents: b.numStudents,
    studentIds: b.studentIds || [],
    status: 'ISSUED',
    dueDate: b.dueDate || null,
    issuedAt: record.recordedAt,
  };
  DB().get('invoices').remove({ id: inv.id }).write();
  DB().get('invoices').push(inv).write();
  cacheDel('rooms:');

  const notice = {
    id: `NTC-${Date.now().toString().slice(-6)}`,
    title: `Hóa đơn tháng ${b.month} phòng ${b.room} đã phát hành`,
    body: `Điện ${invoice.deltaElec} kWh, nước ${invoice.deltaWater} m³. Mỗi sinh viên đóng ${invoice.perStudentTotal.toLocaleString('vi-VN')}đ.`,
    audience: 'ROOM',
    startsAt: new Date().toISOString().slice(0, 10),
    endsAt: b.dueDate || '2026-12-31',
  };
  DB().get('notices').push(notice).write();
  broadcastEvent('INVOICE_ISSUED', notice.title);
  res.json({ success: true, data: { invoice: inv, utilityRecord: record, notice } });
});

/* ---------- Auto-Approval 3 điều kiện ---------- */
server.post('/api/bookings/approve', rateLimit('sensitive'), (req, res) => {
  const { bookingId } = req.body || {};
  const booking = DB().get('bookings').find({ id: bookingId }).value();
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const user = DB().get('users').find({ id: booking.userId }).value();
  const bed = DB().get('beds').find({ id: booking.bedId }).value();
  if (!user || !bed) return res.status(400).json({ success: false, message: 'Invalid User or Bed' });

  const compartment = DB().get('compartments').find({ id: bed.compartmentId }).value();
  const room = DB().get('rooms').find({ id: compartment?.roomId }).value();
  const floor = DB().get('floors').find({ id: room?.floorId }).value();
  const building = DB().get('buildings').find({ id: floor?.buildingId }).value();

  // Điều kiện 1: giới tính khớp tòa
  if (building && user.gender && user.gender !== building.genderType) {
    return res.status(400).json({
      success: false,
      message: `Giới tính không khớp: sinh viên ${user.gender}, tòa ${building.genderType}`,
    });
  }
  // Điều kiện 2: không nợ, không bị đình chỉ
  if ((user.previousDebt || 0) > 0 || user.isSuspended) {
    return res.status(400).json({ success: false, message: 'Sinh viên còn nợ hoặc đang bị đình chỉ' });
  }
  // Điều kiện 3: cọc đã thanh toán 100%
  if (booking.status !== 'PAID') {
    return res.status(400).json({ success: false, message: 'Cọc phải ở trạng thái PAID mới duyệt' });
  }

  DB().get('bookings').find({ id: bookingId }).assign({ status: 'APPROVED' }).write();
  DB().get('beds').find({ id: booking.bedId }).assign({ status: 'OCCUPIED', studentId: user.id }).write();
  cacheDel('rooms:');

  const contract = {
    id: `ct_${Date.now()}`,
    bookingId,
    userId: user.id,
    bedCode: bed.fullCode,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };
  DB().get('contracts').push(contract).write();
  broadcastEvent('BOOKING_APPROVED', `Đã duyệt đặt giường ${bookingId}`);
  res.json({ success: true, message: 'Auto-Approval successful', data: { contract } });
});

/* ---------- Quét cổng giới nghiêm ---------- */
server.post('/api/gate/scan', rateLimit('public'), (req, res) => {
  const { studentId, scanHour, guardName } = req.body || {};
  if (!studentId || scanHour === undefined) {
    return res.status(400).json({ success: false, message: 'Cần studentId và scanHour' });
  }
  const approved = read('curfewRequests').some(
    (r) => r.studentId === studentId && r.status === 'APPROVED',
  );
  const status = evaluateGateScan(Number(scanHour), approved);
  const log = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    studentId,
    studentName: findStudent(studentId)?.fullName || findStudent(studentId)?.name || studentId,
    room: findStudent(studentId)?.room || '',
    timestamp: new Date().toISOString(),
    scanTimeFormatted: new Date().toTimeString().slice(0, 8),
    curfewStatus: status,
    penaltyPointsDeducted: status === 'UNAUTHORIZED_LATE' ? 10 : undefined,
    guardName: guardName || 'Bảo vệ trực cổng',
  };
  DB().get('gateLogs').push(log).write();

  let discipline = null;
  if (status === 'UNAUTHORIZED_LATE') {
    discipline = {
      id: `VIO-${Date.now().toString().slice(-6)}`,
      studentId,
      studentName: log.studentName,
      room: log.room,
      date: new Date().toISOString().slice(0, 10),
      infractionType: 'CURFEW_VIOLATION',
      infractionTitle: 'Vi phạm giờ giới nghiêm 23:00 không phép',
      pointsDeducted: 10,
      description: `Quét cổng lúc ${log.scanTimeFormatted} không có đơn xin phép.`,
      officerName: log.guardName,
      status: 'RECORDED',
    };
    DB().get('disciplineRecords').push(discipline).write();
    broadcastEvent('CURFEW_VIOLATION', `${log.studentName} vi phạm giới nghiêm`);
  }
  res.json({ success: true, data: { log, discipline, status } });
});

/* ---------- Khách thăm: đăng ký + check-in/out ---------- */
server.post('/api/visitors', rateLimit('public'), (req, res) => {
  const { studentId, fullName, citizenId, visitDate } = req.body || {};
  if (!studentId || !fullName?.trim()) {
    return res.status(400).json({ success: false, message: 'Thiếu studentId hoặc họ tên khách' });
  }
  if (!/^\d{12}$/.test(String(citizenId || '').replace(/\s/g, ''))) {
    return res.status(400).json({ success: false, message: 'Số CCCD phải gồm đúng 12 chữ số' });
  }
  const record = {
    id: `VST-${Date.now().toString().slice(-6)}`,
    studentId,
    fullName: fullName.trim(),
    citizenId: String(citizenId).replace(/\s/g, ''),
    visitDate: visitDate || new Date().toISOString().slice(0, 10),
    expectedMinutes: 0,
    status: 'PRE_REGISTERED',
    checkInAt: null,
    checkOutAt: null,
  };
  DB().get('visitors').push(record).write();
  res.json({ success: true, data: record });
});

server.post('/api/visitors/:id/check-in', rateLimit('public'), (req, res) => {
  const v = DB().get('visitors').find({ id: req.params.id }).value();
  if (!v) return res.status(404).json({ success: false, message: 'Không tìm thấy khách' });
  if (v.status !== 'PRE_REGISTERED') {
    return res.status(400).json({ success: false, message: 'Chỉ check-in được khách đã đăng ký trước' });
  }
  DB().get('visitors').find({ id: v.id }).assign({ status: 'CHECKED_IN', checkInAt: new Date().toISOString() }).write();
  res.json({ success: true, data: DB().get('visitors').find({ id: v.id }).value() });
});

server.post('/api/visitors/:id/check-out', rateLimit('public'), (req, res) => {
  const v = DB().get('visitors').find({ id: req.params.id }).value();
  if (!v) return res.status(404).json({ success: false, message: 'Không tìm thấy khách' });
  if (v.status !== 'CHECKED_IN' && v.status !== 'OVERSTAY') {
    return res.status(400).json({ success: false, message: 'Khách chưa check-in' });
  }
  DB().get('visitors').find({ id: v.id }).assign({ status: 'CHECKED_OUT', checkOutAt: new Date().toISOString() }).write();
  res.json({ success: true, data: DB().get('visitors').find({ id: v.id }).value() });
});

/* ---------- Ticket: kiểm tra luồng trạng thái ---------- */
server.post('/api/tickets/:id/transition', rateLimit('public'), (req, res) => {
  const { to } = req.body || {};
  const t = DB().get('tickets').find({ id: req.params.id }).value();
  if (!t) return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' });
  const allowed = TICKET_FLOW[t.status] || [];
  if (!allowed.includes(to)) {
    return res.status(400).json({
      success: false,
      message: `Không thể chuyển từ ${t.status} sang ${to}. Cho phép: ${allowed.join(', ') || 'không có'}`,
    });
  }
  DB().get('tickets').find({ id: t.id }).assign({ status: to }).write();
  broadcastEvent('TICKET_UPDATED', `Phiếu ${t.id} → ${to}`);
  res.json({ success: true, data: DB().get('tickets').find({ id: t.id }).value() });
});

/* ---------- Cache-aside: tóm tắt phòng ---------- */
server.get('/api/rooms/summary', rateLimit('public'), (req, res) => {
  const hit = cacheGet('rooms:summary');
  if (hit) return res.json({ success: true, cached: true, data: hit });
  const beds = read('beds');
  const byStatus = beds.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const data = { totalBeds: beds.length, byStatus, at: new Date().toISOString() };
  cacheSet('rooms:summary', data);
  res.json({ success: true, cached: false, data });
});

/* ---------- Jobs ---------- */
server.post('/api/jobs/export', rateLimit('sensitive'), (req, res) => {
  const job = enqueueJob('export', req.body || {});
  broadcastEvent('JOB_QUEUED', `Export job ${job.id} queued`);
  res.json({ success: true, job });
});
server.get('/api/jobs/:id', (req, res) => {
  const job = jobResults.get(req.params.id) || jobQueue.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job });
});

/* ---------- RAG-lite cho trợ lý AI ---------- */
const KNOWLEDGE = [
  { id: 'curfew', text: 'Gioi nghiem 23:00. Nop don ve muon truoc 21:00, quet QR cong. Qua gio khong don tru diem ren luyen.' },
  { id: 'billing', text: 'Hoa don gom tien phong + dien bac thang + nuoc + wifi + ve sinh, chia deu dau nguoi, VietQR DIENNUOC_[phong]_[MSSV].' },
  { id: 'maintenance', text: 'Bao hong kem anh, muc Khan cap 2h, thuong 24h. Phan cong tho, nghiem thu, danh gia 1-5 sao.' },
  { id: 'room', text: 'Doi phong: submit, BQL duyet, cap nhat so do. Tra phong: kiem ke, tru hu hong, hoan coc.' },
  { id: 'visitor', text: 'Khach tham chi o trong ngay, roi KTX truoc 21:00, khong luu tru qua dem. Dang ky ho ten + CCCD 12 so.' },
  { id: 'emergency', text: 'Khan cap chay no chap dien: ngat aptomat, goi bao ve 1900 6868.' },
];
function ragAnswer(query) {
  const q = String(query || '').toLowerCase();
  const scored = KNOWLEDGE.map((doc) => {
    const words = q.split(/[^a-z0-9à-ỹ]+/i).filter(Boolean);
    let score = 0;
    for (const w of words) if (doc.text.toLowerCase().includes(w)) score += 1;
    return { doc, score };
  }).sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 2).filter((s) => s.score > 0).map((s) => s.doc);
  return top.length
    ? { answer: top.map((d) => d.text).join(' '), sources: top.map((d) => d.id) }
    : { answer: 'Lien he BQL hoac bao ve 1900 6868 de duoc ho tro.', sources: [] };
}
server.post('/api/ai/chat', rateLimit('sensitive'), (req, res) => {
  const { query } = req.body || {};
  const rag = ragAnswer(query || '');
  enqueueJob('ai-log', { query });
  res.json({ success: true, mode: 'rag-stub', ...rag });
});

/* ---------- json-server REST cho mọi collection còn lại ---------- */
server.use('/api', router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`DMS backend khớp frontend đang chạy tại http://localhost:${PORT}`);
  console.log(`Healthcheck: http://localhost:${PORT}/api/health`);
});
