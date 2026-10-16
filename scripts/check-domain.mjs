/**
 * Kiểm tra tầng nghiệp vụ thuần (không cần HTTP) — chạy: npm run check:domain
 *
 * Xác nhận công thức backend khớp đúng các ví dụ đã chốt với frontend,
 * và các quy tắc nghiệp vụ quan trọng không bị hồi quy.
 */
import { buildMonthlyInvoice, calculateTieredElectricity, splitEvenly, computeCheckoutSettlement, proRataShares, detectConsumptionAnomaly } from "../server/domain/pricing.js"
import { evaluateGateScan, summarizeDemerits, buildDisciplineRecord, isSubmittedBeforeCutoff } from "../server/domain/curfew.js"
import { canTransition, ticketPermissions, slaDeadline, validateRating } from "../server/domain/ticket.js"
import { evaluateAutoApproval, isHoldExpired, holdSecondsLeft } from "../server/domain/booking.js"
import { isValidCitizenId, detectOverstay } from "../server/domain/visitor.js"
import { can, permissionsFor } from "../server/domain/rbac.js"

let passed = 0
let failed = 0
const failures = []

function eq(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    failures.push(`${name} (nhận ${a}, mong ${e})`)
    console.log(`  \x1b[31m✗\x1b[0m ${name} — nhận ${a}, mong ${e}`)
  }
}

console.log("\n=== Kiểm tra tầng nghiệp vụ ===\n")

console.log("Điện bậc thang")
eq("0 kWh = 0đ", calculateTieredElectricity(0), 0)
eq("50 kWh (bậc 1) = 90.000đ", calculateTieredElectricity(50), 90000)
eq("100 kWh (2 bậc) = 200.000đ", calculateTieredElectricity(100), 200000)
eq("170 kWh (3 bậc) = 382.000đ", calculateTieredElectricity(170), 382000)
eq("250 kWh (4 bậc) = 615.000đ", calculateTieredElectricity(250), 615000)
eq("số âm = 0đ", calculateTieredElectricity(-5), 0)

console.log("\nChia đều")
eq("814.000 / 6 = 135.667", splitEvenly(814000, 6), 135667)
eq("chia 0 người = 0", splitEvenly(1000, 0), 0)

console.log("\nHóa đơn A205 tháng 09/2026 (kịch bản đã chốt)")
const inv = buildMonthlyInvoice({
  room: "A205", month: "2026-09",
  elecOld: 12450, elecNew: 12620, waterOld: 840, waterNew: 854,
  roomFeePerStudent: 950000, wifiFeeTotal: 120000, cleaningFeeTotal: 60000, numStudents: 6,
})
eq("Δ điện = 170 kWh", inv.deltaElec, 170)
eq("Δ nước = 14 m³", inv.deltaWater, 14)
eq("tiền điện = 382.000đ", inv.elecCost, 382000)
eq("tiền nước = 252.000đ", inv.waterCost, 252000)
eq("phí chung = 180.000đ", inv.sharedFees, 180000)
eq("utility/người = 135.667đ", inv.perStudentUtility, 135667)
eq("tổng/người = 1.085.667đ", inv.perStudentTotal, 1085667)

console.log("\nPro-rata & quyết toán")
const shares = proRataShares(1000000, [{ studentId: "A", daysStayed: 30 }, { studentId: "B", daysStayed: 15 }], 30)
eq("tổng pro-rata khớp 2 người", shares.reduce((s, r) => s + r.amount, 0), 2000000)
eq("người ở đủ tháng nhận phần lớn hơn", shares[0].amount > shares[1].amount, true)
eq("quyết toán: cọc 1tr, hỏng 250k -> hoàn 750k", computeCheckoutSettlement(1000000, [{ name: "Vòi sen", cost: 250000 }], 0).refund, 750000)
eq("khấu trừ không vượt cọc", computeCheckoutSettlement(100000, [{ name: "x", cost: 999999 }], 0).refund, 0)
eq("cảnh báo điện tăng >200%", detectConsumptionAnomaly({ deltaElec: 300, deltaWater: 0, prevDeltaElec: 100, prevDeltaWater: 0 }).length, 1)
eq("tiêu thụ bình thường không cảnh báo", detectConsumptionAnomaly({ deltaElec: 150, deltaWater: 10, prevDeltaElec: 100, prevDeltaWater: 9 }).length, 0)

console.log("\nGiới nghiêm")
eq("22:00 -> ON_TIME", evaluateGateScan(22, false), "ON_TIME")
eq("23:00 không đơn -> UNAUTHORIZED_LATE", evaluateGateScan(23, false), "UNAUTHORIZED_LATE")
eq("23:00 có đơn -> APPROVED_LATE", evaluateGateScan(23, true), "APPROVED_LATE")
eq("02:00 không đơn -> UNAUTHORIZED_LATE", evaluateGateScan(2, false), "UNAUTHORIZED_LATE")
eq("06:00 -> ON_TIME", evaluateGateScan(6, false), "ON_TIME")

console.log("\nĐiểm rèn luyện")
const viol = [
  { studentId: "S1", pointsDeducted: 10 },
  { studentId: "S1", pointsDeducted: 15 },
  { studentId: "S2", pointsDeducted: 35 },
]
eq("S1 trừ 25 -> WARNING", summarizeDemerits("S1", "A", "A205", viol).status, "WARNING")
eq("S1 còn 75 điểm", summarizeDemerits("S1", "A", "A205", viol).remainingPoints, 75)
eq("S2 trừ 35 -> SUSPENDED", summarizeDemerits("S2", "B", "A204", viol).status, "SUSPENDED")
eq("S1 có 2 vi phạm", summarizeDemerits("S1", "A", "A205", viol).violationCount, 2)
const rec = buildDisciplineRecord({ studentId: "S1", studentName: "A", room: "A205", infractionType: "SMOKING_VAPING", officerName: "BQL" })
eq("hút thuốc trừ 20 điểm", rec.pointsDeducted, 20)
eq("có tiêu đề vi phạm", typeof rec.infractionTitle, "string")

console.log("\nLuồng phiếu báo hỏng")
eq("PENDING -> IN_PROGRESS hợp lệ", canTransition("PENDING", "IN_PROGRESS"), true)
eq("PENDING -> CLOSED bị chặn", canTransition("PENDING", "CLOSED"), false)
eq("RESOLVED -> CLOSED hợp lệ", canTransition("RESOLVED", "CLOSED"), true)
eq("CLOSED -> bất kỳ bị chặn", canTransition("CLOSED", "IN_PROGRESS"), false)
eq("đánh giá 5 sao hợp lệ", validateRating(5), true)
eq("đánh giá 0 sao không hợp lệ", validateRating(0), false)
eq("SLA khẩn cấp 2 giờ", slaDeadline("2026-10-10 08:30", "EMERGENCY").getTime() - new Date("2026-10-10T08:30:00").getTime(), 2 * 3600 * 1000)

const ticket = { studentId: "S1", status: "PENDING" }
eq("chủ phiếu sửa được khi PENDING", ticketPermissions("student", ticket, "S1").canEdit, true)
eq("người khác không sửa được", ticketPermissions("student", ticket, "S9").canEdit, false)
eq("sinh viên không phân công thợ", ticketPermissions("student", ticket, "S1").canAssign, false)
eq("quản lý phân công được", ticketPermissions("manager", ticket, "M1").canAssign, true)
eq("kỹ thuật hoàn thành khi IN_PROGRESS", ticketPermissions("technician", { ...ticket, status: "IN_PROGRESS" }, "T1").canComplete, true)
eq("chỉ chủ phiếu đánh giá khi RESOLVED", ticketPermissions("student", { ...ticket, status: "RESOLVED" }, "S1").canReview, true)

console.log("\nAuto-approval đặt giường")
const base = { student: { gender: "MALE", previousDebt: 0, isSuspended: false }, building: { name: "Tòa A (Nam)" }, booking: { status: "PAID" } }
eq("đủ điều kiện -> duyệt", evaluateAutoApproval(base).approved, true)
eq("nợ kỳ trước -> từ chối", evaluateAutoApproval({ ...base, student: { ...base.student, previousDebt: 500000 } }).approved, false)
eq("bị đình chỉ -> từ chối", evaluateAutoApproval({ ...base, student: { ...base.student, isSuspended: true } }).approved, false)
eq("sai giới tính tòa -> từ chối", evaluateAutoApproval({ ...base, student: { ...base.student, gender: "FEMALE" } }).approved, false)
eq("chưa thanh toán -> từ chối", evaluateAutoApproval({ ...base, booking: { status: "PENDING" } }).approved, false)
const hold = { status: "PENDING", createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() }
eq("giữ chỗ quá 15 phút đã hết hạn", isHoldExpired(hold), true)
eq("giữ chỗ mới còn thời gian", holdSecondsLeft({ status: "PENDING", createdAt: new Date().toISOString() }) > 800, true)

console.log("\nKhách thăm")
eq("CCCD 12 số hợp lệ", isValidCitizenId("079204018293"), true)
eq("CCCD 9 số không hợp lệ", isValidCitizenId("079204018"), false)
eq("CCCD có chữ không hợp lệ", isValidCitizenId("07920401829a"), false)
eq("quá 21:00 -> OVERSTAY", detectOverstay({ status: "CHECKED_IN" }, new Date("2026-10-15T21:30:00")).status, "OVERSTAY")
eq("trước 21:00 giữ nguyên", detectOverstay({ status: "CHECKED_IN" }, new Date("2026-10-15T20:00:00")).status, "CHECKED_IN")
eq("chưa check-in không bị đánh dấu", detectOverstay({ status: "PRE_REGISTERED" }, new Date("2026-10-15T23:00:00")).status, "PRE_REGISTERED")

console.log("\nPhân quyền")
eq("sinh viên giữ được giường", can("student", "bed:hold"), true)
eq("kỹ thuật không giữ giường", can("technician", "bed:hold"), false)
eq("chỉ quản lý phát hành hóa đơn", can("manager", "invoice:issue") && !can("technician", "invoice:issue"), true)
eq("chỉ quản lý duyệt đơn về muộn", can("manager", "curfew:approve") && !can("technician", "curfew:approve"), true)
eq("bảo vệ quét cổng được", can("technician", "gate:scan"), true)
eq("sinh viên không quét cổng", can("student", "gate:scan"), false)
eq("chỉ sinh viên đăng ký khách", can("student", "visitor:create") && !can("technician", "visitor:create"), true)
eq("chỉ quản lý đăng bảng tin", can("manager", "notice:publish") && !can("student", "notice:publish"), true)
eq("chỉ admin cấu hình hệ thống", can("admin", "system:configure") && !can("manager", "system:configure"), true)
eq("sinh viên có quyền hợp lệ", permissionsFor("student").includes("ticket:create"), true)
eq("vai trò lạ không có quyền", permissionsFor("hacker").length, 0)

console.log(`\n=== ${passed} pass, ${failed} fail ===`)
if (failed > 0) {
  console.log("\nHỏng:")
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
