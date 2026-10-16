/**
 * Kiểm thử thuần tầng nghiệp vụ cho mã QR cổng & quy tắc ngày của giới nghiêm.
 * Chạy: node scripts/test-backend-qr.mjs   (KHÔNG cần backend đang chạy)
 *
 * Chỉ import server/domain/curfew.js nên không chạm db.json, không mở cổng.
 * Thoát code 1 nếu có test hỏng.
 */
import {
  buildGateQrPayload,
  parseGateQrPayload,
  isGateQrValid,
  verifyGateQrPayload,
  curfewNightOf,
  isRequestValidForScanDate,
  findApprovedRequestForScan,
  GATE_QR_PREFIX,
  GATE_QR_TTL_MINUTES,
} from "../server/domain/curfew.js"

let passed = 0
let failed = 0
const failures = []

function ok(name, condition, detail) {
  if (condition) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    failures.push(name)
    console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

function eq(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  ok(name, a === e, `nhận ${a}, mong ${e}`)
}

/* ============ 1. Payload QR: round-trip với frontend ============ */
console.log("\n=== Kiểm thử QR cổng & quy tắc ngày giới nghiêm ===\n")
console.log("Payload QR — round-trip & định dạng dây")

eq("TTL mặc định = 5 phút", GATE_QR_TTL_MINUTES, 5)
eq("tiền tố = DMS-GATE", GATE_QR_PREFIX, "DMS-GATE")
eq(
  "buildGateQrPayload khớp đúng định dạng frontend",
  buildGateQrPayload("qe200001", "2026-10-16T11:00:00.000Z"),
  "DMS-GATE|QE200001|2026-10-16T11:00:00.000Z",
)

const issuedAt = "2026-10-16T11:00:00.000Z"
const built = buildGateQrPayload("QE200001", issuedAt)
const parsedRoundTrip = parseGateQrPayload(built)
ok("payload tự sinh parse được", parsedRoundTrip.ok === true, JSON.stringify(parsedRoundTrip))
eq("round-trip giữ nguyên MSSV", parsedRoundTrip.studentId, "QE200001")
eq("round-trip giữ nguyên issuedAt", parsedRoundTrip.issuedAt, issuedAt)
ok("payload sinh ra có đúng 3 phần", built.split("|").length === 3, built)

// Chuỗi do frontend (src/lib/dorm-ops.ts) tạo phải parse được y hệt.
const frontendPayload = `DMS-GATE|QE200047|${new Date().toISOString().slice(0, 16)}`
const parsedFrontend = parseGateQrPayload(frontendPayload)
ok("parse được payload kiểu frontend (YYYY-MM-DD HH:mm)", parsedFrontend.ok === true, JSON.stringify(parsedFrontend))
eq("MSSV viết HOA đúng", parsedFrontend.studentId, "QE200047")

/* ============ 2. Payload sai định dạng ============ */
console.log("\nPayload hỏng — phải bị từ chối")

const malformed = [
  ["chuỗi rỗng", ""],
  ["chỉ có 2 phần", "DMS-GATE|QE200001"],
  ["có 4 phần", "DMS-GATE|QE200001|2026-10-16T11:00:00.000Z|extra"],
  ["thiếu MSSV", "DMS-GATE||2026-10-16T11:00:00.000Z"],
  ["thiếu issuedAt", "DMS-GATE|QE200001|"],
  ["không có dấu |", "DMSGATEQE200001"],
  ["null", null],
]
for (const [label, payload] of malformed) {
  const out = parseGateQrPayload(payload)
  ok(`từ chối: ${label}`, out.ok === false && typeof out.reason === "string", JSON.stringify(out))
}

const wrongPrefix = parseGateQrPayload("DMS-OTHER|QE200001|2026-10-16T11:00:00.000Z")
ok("từ chối: sai tiền tố", wrongPrefix.ok === false, JSON.stringify(wrongPrefix))
ok("thông điệp sai tiền tố nói rõ DMS-GATE", String(wrongPrefix.reason).includes("DMS-GATE"), wrongPrefix.reason)

const wrongCase = parseGateQrPayload("dms-gate|QE200001|2026-10-16T11:00:00.000Z")
ok("từ chối: tiền tố sai chữ hoa/thường", wrongCase.ok === false, JSON.stringify(wrongCase))

/* ============ 3. Hạn dùng TTL ============ */
console.log("\nHạn dùng mã QR (TTL 5 phút)")

const base = new Date("2026-10-16T11:00:00.000Z")
const at = (minutes) => new Date(base.getTime() + minutes * 60_000)

ok("vừa phát hành -> hợp lệ", isGateQrValid(base.toISOString(), at(0)).valid === true)
ok("sau 4 phút -> hợp lệ", isGateQrValid(base.toISOString(), at(4)).valid === true)
ok("sau đúng 5 phút -> hợp lệ (biên)", isGateQrValid(base.toISOString(), at(5)).valid === true)
ok("sau 5 phút 1 giây -> hết hạn", isGateQrValid(base.toISOString(), at(5.02)).valid === false)
ok("sau 60 phút -> hết hạn", isGateQrValid(base.toISOString(), at(60)).valid === false)

const expired = isGateQrValid(base.toISOString(), at(6))
ok("lý do hết hạn có tiếng Việt 'hết hạn'", String(expired.reason).includes("hết hạn"), expired.reason)
eq("TTL trả về trong kết quả", expired.ttlMinutes, 5)

const future = isGateQrValid(at(10).toISOString(), base)
ok("mốc phát hành ở tương lai xa -> từ chối", future.valid === false, future.reason)

const badDate = isGateQrValid("không-phải-ngày", base)
ok("issuedAt không đọc được -> từ chối", badDate.valid === false, badDate.reason)

const customTtl = isGateQrValid(base.toISOString(), at(10), 30)
ok("TTL tuỳ chỉnh 30 phút -> hợp lệ ở phút 10", customTtl.valid === true)

/* ============ 4. verifyGateQrPayload (bóc + kiểm hạn) ============ */
console.log("\nverifyGateQrPayload — bóc & kiểm hạn trong một bước")

// Lưu ý: frontend phát hành `issuedAt` theo giờ ĐỊA PHƯƠNG (`YYYY-MM-DD HH:mm`),
// nên ở đây dùng mốc ISO tuyệt đối để tuổi mã không phụ thuộc múi giờ máy chạy test.
const good = verifyGateQrPayload(buildGateQrPayload("qe200001", base.toISOString()), at(2))
ok("payload hợp lệ, còn hạn -> ok", good.ok === true, JSON.stringify(good))
eq("MSSV chuẩn hoá HOA", good.studentId, "QE200001")

const localStyle = verifyGateQrPayload(
  buildGateQrPayload("QE200001", "2026-10-16 11:00"),
  new Date(new Date("2026-10-16T11:00").getTime() + 2 * 60_000),
)
ok("issuedAt kiểu địa phương 'YYYY-MM-DD HH:mm' đọc được", localStyle.ok === true, JSON.stringify(localStyle))

const lateOne = verifyGateQrPayload(buildGateQrPayload("QE200001", base.toISOString()), at(30))
ok("payload hợp lệ nhưng quá hạn -> từ chối", lateOne.ok === false, JSON.stringify(lateOne))

const broken = verifyGateQrPayload("BAD|QE200001|2026-10-16 11:00", at(0))
ok("payload sai tiền tố -> từ chối kèm lý do", broken.ok === false && Boolean(broken.reason), JSON.stringify(broken))

/* ============ 5. Quy tắc NGÀY (sửa lỗi đơn cũ hợp thức hoá) ============ */
console.log("\nQuy tắc ngày — đơn cũ KHÔNG được hợp thức hoá đêm khác")

eq("đêm của 23:00 ngày 20 vẫn là ngày 20", curfewNightOf("2026-10-20", 23), "2026-10-20")
eq("đêm của 02:00 ngày 21 là ngày 20", curfewNightOf("2026-10-21", 2), "2026-10-20")
eq("đêm của 04:59 ngày 21 là ngày 20", curfewNightOf("2026-10-21", 4), "2026-10-20")
eq("05:00 ngày 21 là ngày 21", curfewNightOf("2026-10-21", 5), "2026-10-21")
eq("đêm của 22:00 ngày 21 là ngày 21", curfewNightOf("2026-10-21", 22), "2026-10-21")

const lateReturn = {
  id: "REQ-A",
  studentId: "QE200001",
  requestType: "LATE_RETURN",
  date: "2026-10-10",
  status: "APPROVED",
}

ok(
  "LATE_RETURN đúng ngày -> hợp lệ",
  isRequestValidForScanDate(lateReturn, { studentId: "QE200001", scanDate: "2026-10-10", scanHour: 23 }) === true,
)
ok(
  "LATE_RETURN cũ (ngày khác) -> BỊ TỪ CHỐI (lỗi đã sửa)",
  isRequestValidForScanDate(lateReturn, { studentId: "QE200001", scanDate: "2026-10-16", scanHour: 23 }) === false,
)
ok(
  "LATE_RETURN ngày khác + sau nửa đêm -> vẫn từ chối",
  isRequestValidForScanDate(lateReturn, { studentId: "QE200001", scanDate: "2026-10-16", scanHour: 2 }) === false,
)
ok(
  "đơn PENDING -> không hợp lệ",
  isRequestValidForScanDate({ ...lateReturn, status: "PENDING" }, {
    studentId: "QE200001",
    scanDate: "2026-10-10",
    scanHour: 23,
  }) === false,
)
ok(
  "đơn REJECTED -> không hợp lệ",
  isRequestValidForScanDate({ ...lateReturn, status: "REJECTED" }, {
    studentId: "QE200001",
    scanDate: "2026-10-10",
    scanHour: 23,
  }) === false,
)
ok(
  "đơn của sinh viên khác -> không hợp lệ",
  isRequestValidForScanDate(lateReturn, { studentId: "QE200999", scanDate: "2026-10-10", scanHour: 23 }) === false,
)
ok(
  "thiếu scanDate -> không hợp lệ",
  isRequestValidForScanDate(lateReturn, { studentId: "QE200001", scanHour: 23 }) === false,
)

// OVERNIGHT phủ cả đêm: đơn ngày 20 hợp lệ cho lượt về 02:00 ngày 21.
const overnight = {
  id: "REQ-B",
  studentId: "QE200286",
  requestType: "OVERNIGHT",
  date: "2026-10-20",
  status: "APPROVED",
  parentConfirmed: true,
}
ok(
  "OVERNIGHT 23:00 đúng ngày -> hợp lệ",
  isRequestValidForScanDate(overnight, { studentId: "QE200286", scanDate: "2026-10-20", scanHour: 23 }) === true,
)
ok(
  "OVERNIGHT sau nửa đêm (02:00 ngày 21) -> hợp lệ",
  isRequestValidForScanDate(overnight, { studentId: "QE200286", scanDate: "2026-10-21", scanHour: 2 }) === true,
)
ok(
  "OVERNIGHT của đêm trước (19) ở 02:00 ngày 21 -> từ chối",
  isRequestValidForScanDate({ ...overnight, date: "2026-10-19" }, {
    studentId: "QE200286",
    scanDate: "2026-10-21",
    scanHour: 2,
  }) === false,
)
ok(
  "OVERNIGHT đêm khác -> BỊ TỪ CHỐI",
  isRequestValidForScanDate(overnight, { studentId: "QE200286", scanDate: "2026-10-25", scanHour: 23 }) === false,
)
ok(
  "OVERNIGHT ngày 21 lúc 23:00 (không còn là đêm 20) -> từ chối",
  isRequestValidForScanDate(overnight, { studentId: "QE200286", scanDate: "2026-10-21", scanHour: 23 }) === false,
)

/* ============ 6. findApprovedRequestForScan ============ */
console.log("\nfindApprovedRequestForScan — chọn đơn theo ngày")

const requests = [
  lateReturn, // APPROVED ngày 2026-10-10
  { ...lateReturn, id: "REQ-OLD", date: "2026-09-01", studentId: "QE200001" },
  { ...overnight, id: "REQ-ON", date: "2026-10-20" },
  { ...lateReturn, id: "REQ-PENDING", date: "2026-10-16", status: "PENDING" },
]

ok(
  "đơn cũ ngày 2026-09-01 KHÔNG được chọn cho ngày 2026-10-16",
  findApprovedRequestForScan(requests, { studentId: "QE200001", scanDate: "2026-10-16", scanHour: 23 }) === null,
  "đã chọn nhầm đơn cũ",
)
eq(
  "chọn đúng đơn khớp ngày",
  findApprovedRequestForScan(requests, { studentId: "QE200001", scanDate: "2026-10-10", scanHour: 23 })?.id,
  "REQ-A",
)
eq(
  "đơn PENDING cùng ngày không được tính",
  findApprovedRequestForScan(requests, { studentId: "QE200001", scanDate: "2026-10-16", scanHour: 23 }),
  null,
)
eq(
  "OVERNIGHT được chọn cho lượt 02:00 ngày 21",
  findApprovedRequestForScan(requests, { studentId: "QE200286", scanDate: "2026-10-21", scanHour: 2 })?.id,
  "REQ-ON",
)
eq(
  "matchedRequestId trỏ đơn cũ vẫn bị chặn",
  findApprovedRequestForScan(requests, {
    studentId: "QE200001",
    scanDate: "2026-10-16",
    scanHour: 23,
    matchedRequestId: "REQ-OLD",
  }),
  null,
)
eq(
  "matchedRequestId trỏ đơn đúng ngày được chấp nhận",
  findApprovedRequestForScan(requests, {
    studentId: "QE200001",
    scanDate: "2026-10-10",
    scanHour: 23,
    matchedRequestId: "REQ-A",
  })?.id,
  "REQ-A",
)

/* ============ Tổng kết ============ */
console.log(`\n=== ${passed} pass, ${failed} fail ===`)
if (failed > 0) {
  console.log("\nTest hỏng:")
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
