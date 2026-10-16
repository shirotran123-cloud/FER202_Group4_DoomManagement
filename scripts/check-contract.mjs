/**
 * Đối chiếu hợp đồng dữ liệu backend ↔ frontend — chạy: npm run check:contract
 *
 * Đọc type frontend trong src/types/*.ts và src/lib/dorm-ops.ts, rồi xác nhận
 * mọi phản hồi backend có đủ trường mà UI cần đọc. Bắt lệch shape trước khi
 * frontend nối API.
 *
 * Cần backend đang chạy (API_BASE, mặc định http://localhost:3001).
 */
const BASE = process.env.API_BASE || "http://localhost:3001"

let passed = 0
let failed = 0
const failures = []

async function api(method, path, { role, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(role ? { "X-Demo-Role": role } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

/** Xác nhận object có đủ trường bắt buộc. */
function hasFields(name, obj, fields) {
  if (!obj || typeof obj !== "object") {
    failed++
    failures.push(`${name}: không phải object`)
    console.log(`  \x1b[31m✗\x1b[0m ${name} — không phải object`)
    return
  }
  const missing = fields.filter((f) => !(f in obj))
  if (missing.length === 0) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    failures.push(`${name}: thiếu ${missing.join(", ")}`)
    console.log(`  \x1b[31m✗\x1b[0m ${name} — thiếu: ${missing.join(", ")}`)
  }
}

/** Xác nhận danh sách không rỗng và mọi phần tử đủ trường. */
function allHaveFields(name, rows, fields) {
  if (!Array.isArray(rows) || rows.length === 0) {
    failed++
    failures.push(`${name}: danh sách rỗng`)
    console.log(`  \x1b[31m✗\x1b[0m ${name} — danh sách rỗng`)
    return
  }
  const bad = rows.find((r) => fields.some((f) => !(f in r)))
  if (bad) {
    const missing = fields.filter((f) => !(f in bad))
    failed++
    failures.push(`${name}: thiếu ${missing.join(", ")}`)
    console.log(`  \x1b[31m✗\x1b[0m ${name} — thiếu: ${missing.join(", ")}`)
  } else {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name} (${rows.length} bản ghi)`)
  }
}

async function main() {
  console.log(`\n=== Đối chiếu hợp đồng backend ↔ frontend @ ${BASE} ===\n`)

  /* --- UserProfile (src/types/auth.ts) --- */
  console.log("UserProfile — src/types/auth.ts")
  const demo = await api("POST", "/api/auth/demo", { body: { role: "student" } })
  const profile = demo.data?.data?.user
  hasFields("hồ sơ sinh viên đủ trường UserProfile", profile, [
    "id", "fullName", "email", "role", "roleTitle", "studentId", "phone",
    "citizenId", "dob", "gender", "hometown", "status", "joinedDate",
  ])
  hasFields("sinh viên có dormitoryStatus", profile?.dormitoryStatus, [
    "building", "room", "compartment", "bedCode", "contractStart",
    "contractEnd", "debtStatus", "checkInDate", "roomStatus",
  ])
  const staffDemo = await api("POST", "/api/auth/demo", { body: { role: "manager" } })
  hasFields("hồ sơ cán bộ có staffId", staffDemo.data?.data?.user, ["staffId", "department"])

  /* --- Bed (BookingPage.tsx) --- */
  console.log("\nBed — BookingPage.tsx")
  const beds = await api("GET", "/api/dorm/beds?room=A205", { role: "student" })
  allHaveFields("giường phòng A205", beds.data?.data, [
    "id", "compartmentId", "name", "fullCode", "status", "tier", "price",
  ])
  const bed = beds.data?.data?.[0]
  if (bed) {
    const okFormat = /^A\d{3}-[A-D]1-G\d{2}$/.test(bed.fullCode)
    if (okFormat) {
      passed++
      console.log(`  \x1b[32m✓\x1b[0m mã giường đúng [Phòng]-[Buồng]1-[Giường]: ${bed.fullCode}`)
    } else {
      failed++
      failures.push(`mã giường sai định dạng: ${bed.fullCode}`)
      console.log(`  \x1b[31m✗\x1b[0m mã giường sai định dạng: ${bed.fullCode}`)
    }
  }

  /* --- Cây kiểm kê cho BookingPage --- */
  console.log("\nCây kiểm kê — BookingPage dựng sơ đồ 1:4:6")
  const inv = await api("GET", "/api/dorm/inventory", { role: "student" })
  const building = inv.data?.data?.[0]
  hasFields("tòa nhà có floors[]", building, ["id", "name", "genderType", "floors"])
  const floor = building?.floors?.[0]
  hasFields("tầng có rooms[]", floor, ["id", "level", "rooms"])
  const room = floor?.rooms?.[0]
  hasFields("phòng có compartments[]", room, ["id", "name", "compartments"])
  const comp = room?.compartments?.[0]
  hasFields("buồng có beds[]", comp, ["id", "name", "beds"])
  if (comp) {
    const counts = [building.floors[0].rooms[0].compartments.length, comp.beds.length]
    const okShape = counts[0] === 4 && counts[1] === 6
    if (okShape) {
      passed++
      console.log(`  \x1b[32m✓\x1b[0m mô hình 1:4:6 đúng (4 buồng × 6 giường)`)
    } else {
      failed++
      failures.push(`mô hình 1:4:6 sai: ${counts.join(" buồng × ")} giường`)
      console.log(`  \x1b[31m✗\x1b[0m mô hình 1:4:6 sai: ${counts[0]} buồng × ${counts[1]} giường`)
    }
  }

  /* --- MonthlyInvoice (dorm-ops.ts) --- */
  console.log("\nMonthlyInvoice — src/lib/dorm-ops.ts")
  const calc = await api("POST", "/api/billing/calculate", {
    role: "manager",
    body: { room: "A205", month: "2026-09", elecOld: 12450, elecNew: 12620, waterOld: 840, waterNew: 854, roomFeePerStudent: 950000, wifiFeeTotal: 120000, cleaningFeeTotal: 60000, numStudents: 6 },
  })
  hasFields("hóa đơn đủ trường MonthlyInvoice", calc.data?.data, [
    "room", "month", "deltaElec", "deltaWater", "elecCost", "waterCost",
    "sharedFees", "roomTotal", "grandTotal", "perStudentUtility", "perStudentTotal",
  ])

  /* --- MaintenanceTicket (types/maintenance.ts) --- */
  console.log("\nMaintenanceTicket — src/types/maintenance.ts")
  const tickets = await api("GET", "/api/tickets", { role: "manager" })
  allHaveFields("phiếu báo hỏng", tickets.data?.data, [
    "id", "title", "scope", "building", "room", "category", "urgency",
    "description", "studentId", "studentName", "studentPhone",
    "evidenceImages", "status", "createdAt",
  ])
  const resolved = tickets.data?.data?.find((t) => t.resolution)
  if (resolved) {
    hasFields("phiếu đã xử lý có resolution", resolved.resolution, [
      "completedAt", "technicianNotes", "completionImages", "materials", "totalMaterialCost",
    ])
  }
  const assigned = tickets.data?.data?.find((t) => t.assignedTechnician)
  if (assigned) {
    hasFields("phiếu đã phân công có assignedTechnician", assigned.assignedTechnician, [
      "id", "name", "phone", "assignedAt", "etaMinutes",
    ])
  }
  const reviewed = tickets.data?.data?.find((t) => t.review)
  if (reviewed) {
    hasFields("phiếu đã đánh giá có review", reviewed.review, [
      "rating", "reviewedAt", "comment", "isSatisfied",
    ])
  }

  /* --- VisitorRecord (dorm-ops.ts) --- */
  console.log("\nVisitorRecord — src/lib/dorm-ops.ts")
  const visitors = await api("GET", "/api/visitors", { role: "manager" })
  allHaveFields("khách thăm", visitors.data?.data, [
    "id", "studentId", "fullName", "citizenId", "visitDate", "status",
    "checkInAt", "checkOutAt",
  ])

  /* --- CurfewRequest (types/curfew.ts) --- */
  console.log("\nCurfewRequest — src/types/curfew.ts")
  const reqs = await api("GET", "/api/curfew/requests", { role: "manager" })
  allHaveFields("đơn về muộn", reqs.data?.data, [
    "id", "studentId", "studentName", "room", "phone", "requestType", "date",
    "expectedReturnTime", "reasonCategory", "reasonDetail", "parentPhone",
    "parentConfirmed", "submittedAt", "isSubmittedBefore2100", "status",
  ])

  /* --- GateAccessLog (types/curfew.ts) --- */
  console.log("\nGateAccessLog — src/types/curfew.ts")
  const logs = await api("GET", "/api/curfew/gate/logs", { role: "manager" })
  allHaveFields("nhật ký quét cổng", logs.data?.data, [
    "id", "studentId", "studentName", "room", "timestamp",
    "scanTimeFormatted", "curfewStatus", "guardName",
  ])

  /* --- DisciplineRecord & StudentDemeritSummary (types/curfew.ts) --- */
  console.log("\nDisciplineRecord & DemeritSummary — src/types/curfew.ts")
  const disc = await api("GET", "/api/curfew/discipline", { role: "manager" })
  allHaveFields("biên bản kỷ luật", disc.data?.data, [
    "id", "studentId", "studentName", "room", "date", "infractionType",
    "infractionTitle", "pointsDeducted", "description", "officerName", "status",
  ])
  const dms = await api("GET", "/api/curfew/demerits", { role: "manager" })
  allHaveFields("điểm rèn luyện", dms.data?.data, [
    "studentId", "studentName", "room", "initialPoints", "totalDeducted",
    "remainingPoints", "status", "violationCount",
  ])

  /* --- DormNotice, MarketplaceListing, LostFoundPost (dorm-ops.ts) --- */
  console.log("\nDormNotice / MarketplaceListing / LostFoundPost — src/lib/dorm-ops.ts")
  const notices = await api("GET", "/api/community/notices", { role: "student" })
  allHaveFields("bảng tin", notices.data?.data, ["id", "title", "body", "audience", "startsAt", "endsAt"])
  const mkt = await api("GET", "/api/community/marketplace", { role: "student" })
  allHaveFields("chợ đồ cũ", mkt.data?.data, ["id", "sellerId", "title", "price", "category", "photoIds", "status"])
  const laf = await api("GET", "/api/community/lost-found", { role: "student" })
  allHaveFields("thất lạc", laf.data?.data, ["id", "reporterId", "kind", "item", "location", "photoIds", "status"])

  /* --- OccupancyStats & báo cáo (types/dashboard.ts) --- */
  console.log("\nDashboard — src/types/dashboard.ts")
  const dash = await api("GET", "/api/dashboard/overview", { role: "manager" })
  hasFields("OccupancyStats", dash.data?.data?.occupancy, [
    "totalBeds", "availableBeds", "holdingBeds", "occupiedBeds",
    "maintenanceBeds", "occupancyRate", "totalRooms", "totalCompartments",
  ])
  const residents = await api("GET", "/api/dashboard/reports/residents", { role: "manager" })
  allHaveFields("ResidentTemporaryRecord", residents.data?.data, [
    "stt", "contractCode", "fullName", "studentId", "gender", "citizenId",
    "dob", "hometown", "phone", "building", "room", "compartment", "bedCode",
    "startDate", "endDate", "parentName", "parentPhone",
  ])
  const debts = await api("GET", "/api/dashboard/reports/debts", { role: "manager" })
  if (debts.data?.data?.length) {
    allHaveFields("OverdueDebtRecord", debts.data.data, [
      "stt", "invoiceCode", "studentId", "fullName", "room", "bedCode",
      "billingPeriod", "roomDebt", "utilityDebt", "totalDebt", "dueDate",
      "overdueDays", "status", "phone",
    ])
  } else {
    passed++
    console.log("  \x1b[32m✓\x1b[0m OverdueDebtRecord — bỏ qua (chưa có công nợ)")
  }

  /* --- Tương thích giá trị enum --- */
  console.log("\nTương thích giá trị enum")
  const scopeOk = tickets.data?.data?.every((t) => ["ROOM_SHARED", "COMPARTMENT_PRIVATE"].includes(t.scope))
  const statusOk = tickets.data?.data?.every((t) => ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"].includes(t.status))
  const catOk = tickets.data?.data?.every((t) => ["ELECTRIC", "PLUMBING", "HVAC", "FURNITURE", "NETWORK", "OTHER"].includes(t.category))
  for (const [name, cond] of [["scope phiếu khớp enum", scopeOk], ["status phiếu khớp enum", statusOk], ["category phiếu khớp enum", catOk]]) {
    if (cond) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${name}`) }
    else { failed++; failures.push(name); console.log(`  \x1b[31m✗\x1b[0m ${name}`) }
  }

  const bedStatuses = new Set(beds.data?.data?.map((b) => b.status))
  const bedOk = [...bedStatuses].every((s) => ["AVAILABLE", "HOLDING", "OCCUPIED", "MAINTENANCE"].includes(s))
  if (bedOk) { passed++; console.log("  \x1b[32m✓\x1b[0m trạng thái giường khớp enum") }
  else { failed++; failures.push("trạng thái giường lạ"); console.log(`  \x1b[31m✗\x1b[0m trạng thái giường lạ: ${[...bedStatuses].join(", ")}`) }

  console.log(`\n=== ${passed} pass, ${failed} fail ===`)
  if (failed > 0) {
    console.log("\nLệch hợp đồng:")
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("\nLỗi:", err.message)
  console.error("Backend đã chạy chưa? Thử: npm run server")
  process.exit(1)
})
