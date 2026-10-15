import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ---- Security headers (WAF-baseline + HSTS, CSP) ----
server.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; img-src 'self' data: https://images.unsplash.com https://api.qrserver.com; connect-src 'self'"
  );
  next();
});

// ---- In-memory rate limiter (Redis-ready interface) ----
const WINDOW_MS = 60_000;
const LIMITS = { public: 100, sensitive: 5 };
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
      return res.status(429).json({ success: false, message: 'Too many requests, slow down.' });
    }
    next();
  };
}

// ---- In-memory cache (Redis-ready: get/set/del with TTL) ----
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

// ---- Async job queue (BullMQ-ready: enqueue + worker) ----
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

// ---- SSE realtime hub ----
const sseClients = new Set();
function broadcastEvent(kind, title) {
  const evt = { id: `evt_${Date.now()}`, kind, title, at: new Date().toISOString() };
  for (const res of sseClients) {
    res.write(`data: ${JSON.stringify(evt)}\n\n`);
  }
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

// ---- Healthcheck ----
server.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'dms-backend', time: new Date().toISOString(), queue: jobQueue.length, sseClients: sseClients.size });
});

// ---- RAG-lite knowledge base (internal dorm docs) ----
const KNOWLEDGE = [
  { id: 'curfew', text: 'Gioi nghiem 23:00. Nop don ve muon truoc 21:00, quet QR cong. Qua gio khong don tru diem ren luyen.' },
  { id: 'billing', text: 'Hoa don gom tien phong + dien bac thang + nuoc + wifi + ve sinh, chia deu dau nguoi, VietQR DIENNUOC_[phong]_[MSSV].' },
  { id: 'maintenance', text: 'Bao hong kem anh, muc Khan cap 2h, thuong 24h. Phan cong tho, nghiem thu, danh gia 1-5 sao.' },
  { id: 'room', text: 'Doi phong: submit, BQL duyet, cap nhat so do. Tra phong: kiem ke, tru hu hong, hoan coc.' },
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
  return { answer: top.length ? top.map((d) => d.text).join(' ') : 'Lien he BQL hoac bao ve 1900 6868 de duoc ho tro.', sources: top.map((d) => d.id) };
}

function moderate(text) {
  const banned = ['spam', 'lừa đảo', 'hack', 'xxx'];
  const lower = String(text || '').toLowerCase();
  for (const w of banned) if (lower.includes(w)) return { ok: false, reason: `BANNED_WORD:${w}` };
  if (String(text || '').length > 2000) return { ok: false, reason: 'TOO_LONG' };
  return { ok: true, reason: 'OK' };
}

// Function-calling stub: AI suggests actions, server validates + executes safe ones
function runAssistantAction(action, args) {
  if (action === 'create_maintenance_ticket') {
    return { ok: true, ticketId: `TKT-${Date.now().toString().slice(-6)}`, note: 'Ticket created from AI assistant (stub). Attach photos in Maintenance page.' };
  }
  if (action === 'locate_invoice') {
    return { ok: true, room: args?.room || 'A205', content: `DIENNUOC_${args?.room || 'A205'}_${args?.studentId || 'SE182049'}` };
  }
  return { ok: false, note: `Unknown action ${action}` };
}

server.post('/api/ai/chat', rateLimit('sensitive'), (req, res) => {
  const { query, action, args } = req.body || {};
  const mod = moderate(query || '');
  if (!mod.ok) return res.status(400).json({ success: false, ...mod });
  if (action) {
    const result = runAssistantAction(action, args || {});
    return res.json({ success: result.ok, mode: 'function-calling', result });
  }
  const rag = ragAnswer(query || '');
  enqueueJob('ai-log', { query });
  return res.json({ success: true, mode: 'rag-stub', ...rag });
});

// Cached room list example (cache-aside; Redis swap-in ready)
server.get('/api/rooms/summary', rateLimit('public'), (req, res) => {
  const hit = cacheGet('rooms:summary');
  if (hit) return res.json({ success: true, cached: true, data: hit });
  const db = router.db;
  const rooms = db.get('rooms').value?.() || db.get('rooms').value || [];
  const data = { count: Array.isArray(rooms) ? rooms.length : 0, at: new Date().toISOString() };
  cacheSet('rooms:summary', data);
  res.json({ success: true, cached: false, data });
});

server.post('/api/jobs/export', rateLimit('sensitive'), (req, res) => {
  const job = enqueueJob('export-pdf', req.body || {});
  broadcastEvent('JOB_QUEUED', `Export job ${job.id} queued`);
  res.json({ success: true, job });
});

server.get('/api/jobs/:id', (req, res) => {
  const job = jobResults.get(req.params.id) || jobQueue.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job });
});

// Custom Route for Auto-Approval Engine
server.post('/api/bookings/approve', rateLimit('sensitive'), (req, res) => {
  const { bookingId } = req.body;
  const db = router.db; // lowdb instance

  const booking = db.get('bookings').find({ id: bookingId }).value();
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const user = db.get('users').find({ id: booking.userId }).value();
  const bed = db.get('beds').find({ id: booking.bedId }).value();

  if (!user || !bed) {
    return res.status(400).json({ success: false, message: 'Invalid User or Bed' });
  }

  const compartment = db.get('compartments').find({ id: bed.compartmentId }).value();
  const room = db.get('rooms').find({ id: compartment.roomId }).value();
  const floor = db.get('floors').find({ id: room.floorId }).value();
  const building = db.get('buildings').find({ id: floor.buildingId }).value();

  // Condition 1: Gender match
  if (user.gender !== building.genderType) {
    return res.status(400).json({
      success: false,
      message: `Gender mismatch. Student is ${user.gender}, Building is ${building.genderType}`
    });
  }

  // Condition 2: No previous debt and not suspended
  if (user.previousDebt > 0 || user.isSuspended) {
    return res.status(400).json({
      success: false,
      message: 'Student has previous debt or is currently suspended.'
    });
  }

  // Condition 3: Payment status
  if (booking.status !== 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'Deposit must be 100% PAID to approve.'
    });
  }

  // Auto-Approve logic executed successfully:
  db.get('bookings').find({ id: bookingId }).assign({ status: 'APPROVED' }).write();
  db.get('beds').find({ id: booking.bedId }).assign({ status: 'OCCUPIED', studentId: user.id }).write();
  cacheDel('rooms:');

  const contractId = `ct_${Date.now()}`;
  const contract = { id: contractId, bookingId, userId: user.id, bedCode: bed.fullCode, status: 'ACTIVE', createdAt: new Date().toISOString() };
  db.get('contracts').push(contract).write();
  broadcastEvent('BOOKING_APPROVED', `Booking ${bookingId} approved`);

  return res.json({ success: true, message: 'Auto-Approval successful', data: { booking: db.get('bookings').find({ id: bookingId }).value(), contract } });
});

// Use default router for everything else
server.use('/api', router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server with Auto-Approval Engine is running on port ${PORT}`);
});
