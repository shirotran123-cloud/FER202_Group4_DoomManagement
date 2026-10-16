/**
 * Kiểm thử API backend theo 4 vai trò — chạy: npm run test:api
 *
 * Giả định backend đang chạy (mặc định http://localhost:3001, đổi qua API_BASE).
 * Script xác nhận: phân quyền đúng, nghiệp vụ đúng, shape khớp frontend.
 * Thoát code 1 nếu có test hỏng.
 */
const BASE = process.env.API_BASE || "http://localhost:3001"

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

async function api(method, path, { role, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role ? { "X-Demo-Role": role } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  return { status: res.status, data }
}

async function main() {
  console.log(`\n=== DMS API test @ ${BASE} ===\n`)

  /* ---------- 0. Hạ tầng ---------- */
  console.log("Hạ tầng")
  const health = await api("GET", "/api/health")
  ok("GET /api/health trả ok", health.status === 200 && health.data?.ok === true)
  ok("health có counts", typeof health.data?.counts?.beds === "number")
  const cfg = await api("GET", "/api/config")
  ok("GET /api/config trả biểu giá", cfg.status === 200 && Array.isArray(cfg.data?.data?.electricityTiers))
  ok("config có mốc giới nghiêm 23h", cfg.data?.data?.curfewHour === 23)
  ok("config có giới hạn khách 21h", cfg.data?.data?.visitorLatestHour === 21)

  /* ---------- 1. GUEST (khách vãng lai) ---------- */
  console.log("\nGuest — chưa đăng nhập")
  const guestTickets = await api("GET", "/api/tickets")
  ok("guest không đọc được phiếu (401/403)", [401, 403].includes(guestTickets.status))
  const guestDash = await api("GET", "/api/dashboard/overview")
  ok("guest không vào dashboard (401/403)", [401, 403].includes(guestDash.status))
  const guestConfig = await api("GET", "/api/config")
  ok("guest vẫn xem được config công khai", guestConfig.status === 200)

  /* ---------- 2. AUTH ---------- */
  console.log("\nĐăng nhập")
  const demoStudent = await api("POST", "/api/auth/demo", { body: { role: "student" } })
  ok("đăng nhập demo sinh viên", demoStudent.status === 200 && demoStudent.data?.data?.user?.role === "student")
  const studentId = demoStudent.data?.data?.user?.studentId
  ok("hồ sơ sinh viên có studentId QE200xxx", /^QE200\d{3}$/.test(studentId || ""), studentId)
  ok("hồ sơ có permissions[]", Array.isArray(demoStudent.data?.data?.user?.permissions))

  const badStaffLogin = await api("POST", "/api/auth/login", { body: { email: "abc@gmail.com", role: "manager" } })
  ok("cán bộ phải dùng email FPT (bị chặn)", badStaffLogin.status === 400)
  const badStudentLogin = await api("POST", "/api/auth/login", { body: { email: "sv@fpt.edu.vn", role: "student" } })
  ok("sinh viên không dùng email trường (bị chặn)", badStudentLogin.status === 400)
  const goodStaff = await api("POST", "/api/auth/login", { body: { email: "namvt@fpt.edu.vn", role: "manager" } })
  ok("quản lý đăng nhập bằng @fpt.edu.vn", goodStaff.status === 200)

  /* ---------- 3. STUDENT ---------- */
  console.log("\nSinh viên")
  const myTickets = await api("GET", "/api/tickets", { role: "student" })
  ok("sinh viên đọc được phiếu của mình", myTickets.status === 200)
  ok("mọi phiếu trả về đều thuộc sinh viên", (myTickets.data?.data || []).every((t) => t.studentId === studentId))

  const createTicket = await api("POST", "/api/tickets", {
    role: "student",
    body: {
      title: "Test API — đèn hành lang hỏng",
      scope: "ROOM_SHARED",
      building: "Tòa A",
      room: "A205",
      category: "ELECTRIC",
      urgency: "NORMAL",
      description: "Kiểm thử tự động.",
    },
  })
  ok("sinh viên tạo được phiếu", createTicket.status === 201)
  const newTicketId = createTicket.data?.data?.id
  ok("phiếu mới ở trạng thái PENDING", createTicket.data?.data?.status === "PENDING")

  const badTicket = await api("POST", "/api/tickets", {
    role: "student",
    body: { title: "", scope: "ROOM_SHARED", room: "A205", category: "ELECTRIC", urgency: "NORMAL" },
  })
  ok("phiếu thiếu tiêu đề bị chặn (400)", badTicket.status === 400)

  const studentApprove = await api("POST", `/api/tickets/${newTicketId}/transition`, {
    role: "student",
    body: { to: "IN_PROGRESS" },
  })
  ok("sinh viên không được phân công thợ (403)", studentApprove.status === 403)

  const illegalJump = await api("POST", `/api/tickets/${newTicketId}/transition`, {
    role: "manager",
    body: { to: "CLOSED" },
  })
  ok("nhảy sai luồng bị chặn (400)", illegalJump.status === 400)

  const myInvoices = await api("GET", "/api/billing/invoices", { role: "student" })
  ok("sinh viên xem được hóa đơn", myInvoices.status === 200)
  const studentIssue = await api("POST", "/api/billing/issue", {
    role: "student",
    body: { room: "A205", month: "2026-10" },
  })
  ok("sinh viên KHÔNG được phát hành hóa đơn (403)", studentIssue.status === 403)

  const visitorCreate = await api("POST", "/api/visitors", {
    role: "student",
    body: { fullName: "Khách Test API", citizenId: "079204018293" },
  })
  ok("sinh viên đăng ký được khách", visitorCreate.status === 201)
  ok("khách không có thời lượng (expectedMinutes=0)", visitorCreate.data?.data?.expectedMinutes === 0)
  const badVisitor = await api("POST", "/api/visitors", {
    role: "student",
    body: { fullName: "Khách Sai CCCD", citizenId: "12345" },
  })
  ok("CCCD sai 12 số bị chặn (400)", badVisitor.status === 400)

  const studentScan = await api("POST", "/api/curfew/gate/scan", {
    role: "student",
    body: { studentId, scanHour: 23 },
  })
  ok("sinh viên không được quét cổng (403)", studentScan.status === 403)

  const studentPublish = await api("POST", "/api/community/notices", {
    role: "student",
    body: { title: "SV tự đăng", body: "Không được phép" },
  })
  ok("sinh viên không được đăng bảng tin (403)", studentPublish.status === 403)

  const studentMeter = await api("GET", "/api/billing/utility-records", { role: "student" })
  ok("sinh viên không xem được sổ công tơ (403)", studentMeter.status === 403)

  /* ---------- 4. TECHNICIAN ---------- */
  console.log("\nKỹ thuật & Bảo vệ")
  const techAssign = await api("POST", `/api/tickets/${newTicketId}/transition`, {
    role: "technician",
    body: { to: "IN_PROGRESS" },
  })
  ok("kỹ thuật KHÔNG được tự phân công (403)", techAssign.status === 403)

  const managerAssign = await api("POST", `/api/tickets/${newTicketId}/transition`, {
    role: "manager",
    body: { to: "IN_PROGRESS", technicianName: "Chú Đỗ Mạnh Hùng", etaMinutes: 60 },
  })
  ok("quản lý phân công được thợ", managerAssign.status === 200 && managerAssign.data?.data?.status === "IN_PROGRESS")
  ok("phiếu có assignedTechnician", Boolean(managerAssign.data?.data?.assignedTechnician))

  const techComplete = await api("POST", `/api/tickets/${newTicketId}/transition`, {
    role: "technician",
    body: { to: "RESOLVED", technicianNotes: "Đã thay bóng.", materials: [{ id: "m1", name: "Bóng LED", quantity: 1, unitCost: 65000, paidBy: "DORMITORY" }] },
  })
  ok("kỹ thuật báo hoàn thành được", techComplete.status === 200 && techComplete.data?.data?.status === "RESOLVED")
  ok("tổng chi phí vật tư tính đúng", techComplete.data?.data?.resolution?.totalMaterialCost === 65000)

  const techScan = await api("POST", "/api/curfew/gate/scan", {
    role: "technician",
    body: { studentId, scanHour: 23 },
  })
  ok("kỹ thuật/bảo vệ quét cổng được", techScan.status === 200)
  ok("quét đúng mã trạng thái cổng", ["ON_TIME", "APPROVED_LATE", "UNAUTHORIZED_LATE"].includes(techScan.data?.data?.status))
  const techApprove = await api("POST", "/api/curfew/requests/REQ-NOPE/decide", {
    role: "technician",
    body: { approve: true },
  })
  ok("bảo vệ KHÔNG được duyệt đơn (403)", techApprove.status === 403)
  const techMeter = await api("POST", "/api/billing/issue", {
    role: "technician",
    body: { room: "A205", month: "2026-10", elecOld: 1, elecNew: 2, waterOld: 1, waterNew: 2 },
  })
  ok("kỹ thuật KHÔNG phát hành hóa đơn (403)", techMeter.status === 403)
  const techVisitorCreate = await api("POST", "/api/visitors", {
    role: "technician",
    body: { fullName: "Khách của thợ", citizenId: "079204018293" },
  })
  ok("kỹ thuật KHÔNG đăng ký khách (403)", techVisitorCreate.status === 403)

  /* ---------- 5. MANAGER ---------- */
  console.log("\nQuản lý KTX")
  const dash = await api("GET", "/api/dashboard/overview", { role: "manager" })
  ok("quản lý xem dashboard được", dash.status === 200)
  ok("dashboard có tỷ lệ lấp đầy", typeof dash.data?.data?.occupancy?.occupancyRate === "number")
  ok("dashboard có ticket summary", typeof dash.data?.data?.tickets?.pending === "number")

  const calc = await api("POST", "/api/billing/calculate", {
    role: "manager",
    body: {
      room: "A205",
      month: "2026-09",
      elecOld: 12450,
      elecNew: 12620,
      waterOld: 840,
      waterNew: 854,
      roomFeePerStudent: 950000,
      wifiFeeTotal: 120000,
      cleaningFeeTotal: 60000,
      numStudents: 6,
    },
  })
  const inv = calc.data?.data
  ok("điện bậc thang = 382.000đ", inv?.elecCost === 382000, String(inv?.elecCost))
  ok("chia đều = 135.667đ/người", inv?.perStudentUtility === 135667, String(inv?.perStudentUtility))
  ok("tổng/người = 1.085.667đ", inv?.perStudentTotal === 1085667, String(inv?.perStudentTotal))

  const badMeter = await api("POST", "/api/billing/calculate", {
    role: "manager",
    body: { room: "A205", month: "2026-09", elecOld: 100, elecNew: 50, waterOld: 1, waterNew: 2 },
  })
  ok("chỉ số mới < cũ bị chặn (400)", badMeter.status === 400)

  const issue = await api("POST", "/api/billing/issue", {
    role: "manager",
    body: {
      room: "A205",
      month: "2026-11",
      elecOld: 12000,
      elecNew: 12180,
      waterOld: 800,
      waterNew: 815,
      studentIds: ["QE200001", "QE200047"],
      dueDate: "2026-12-05",
    },
  })
  ok("quản lý phát hành hóa đơn được", issue.status === 200)
  ok("hóa đơn có mã INV", String(issue.data?.data?.invoice?.id || "").startsWith("INV-"))
  ok("phát hành kèm thông báo", Boolean(issue.data?.data?.notice?.id))

  const residents = await api("GET", "/api/dashboard/reports/residents", { role: "manager" })
  ok("báo cáo tạm trú chạy", residents.status === 200 && Array.isArray(residents.data?.data))
  const debts = await api("GET", "/api/dashboard/reports/debts", { role: "manager" })
  ok("báo cáo công nợ chạy", debts.status === 200 && Array.isArray(debts.data?.data))

  const notice = await api("POST", "/api/community/notices", {
    role: "manager",
    body: { title: "Thông báo test", body: "Nội dung test", audience: "ALL", startsAt: "2026-01-01", endsAt: "2026-12-31" },
  })
  ok("quản lý đăng bảng tin được", notice.status === 201)

  const managerBook = await api("POST", "/api/dorm/holds", { role: "manager", body: { bedCode: "A101-A1-G01" } })
  ok("quản lý KHÔNG giữ giường (403)", managerBook.status === 403)

  /* ---------- 6. ADMIN ---------- */
  console.log("\nQuản trị viên")
  const settings = await api("GET", "/api/dashboard/settings", { role: "admin" })
  ok("admin đọc cấu hình hệ thống", settings.status === 200)
  const managerSettings = await api("GET", "/api/dashboard/settings", { role: "manager" })
  ok("quản lý KHÔNG đọc cấu hình hệ thống (403)", managerSettings.status === 403)

  const simBill = await api("POST", "/api/dashboard/simulate/billing", { role: "admin", body: { month: "2026-09" } })
  ok("admin mô phỏng hóa đơn toàn tòa", simBill.status === 200 && Array.isArray(simBill.data?.data?.rooms))

  const simElec = await api("POST", "/api/dashboard/simulate/electricity", { role: "admin", body: { kwh: 170 } })
  ok("mô phỏng điện 170kWh = 382.000đ", simElec.data?.data?.cost === 382000, String(simElec.data?.data?.cost))

  const demerits = await api("GET", "/api/dashboard/discipline-summary", { role: "admin" })
  ok("admin xem bảng điểm rèn luyện", demerits.status === 200 && Array.isArray(demerits.data?.data))

  /* ---------- 7. Dọn dữ liệu test ---------- */
  await api("DELETE", `/api/tickets/${newTicketId}`, { role: "manager" })

  /* ---------- Tổng kết ---------- */
  console.log(`\n=== ${passed} pass, ${failed} fail ===`)
  if (failed > 0) {
    console.log("\nTest hỏng:")
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("\nLỗi chạy test:", err.message)
  console.error("Backend đã chạy chưa? Thử: npm run server")
  process.exit(1)
})
