/**
 * Kiểm thử luồng nghiệp vụ đầy đủ (end-to-end) — chạy: npm run test:flows
 *
 * Bổ sung cho test-api.mjs: đi trọn từng quy trình nhiều bước mà một vai trò
 * thực hiện trong thực tế, xác nhận trạng thái chuyển đúng và dữ liệu nhất quán.
 *
 * Cần backend đang chạy. DB sẽ bị thay đổi; chạy lại `npm run db:seed` nếu muốn sạch.
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
    failures.push(detail ? `${name} — ${detail}` : name)
    console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

async function api(method, path, { role, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(role ? { "X-Demo-Role": role } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

async function main() {
  console.log(`\n=== Kiểm thử luồng nghiệp vụ @ ${BASE} ===\n`)

  /* ============ LUỒNG 1: Sinh viên đặt giường trọn quy trình ============ */
  console.log("Luồng 1 — Sinh viên đặt giường (giữ chỗ → thanh toán → duyệt)")

  // Tìm một giường trống
  const beds = await api("GET", "/api/dorm/beds?status=AVAILABLE", { role: "student" })
  const freeBed = beds.data?.data?.find((b) => b.roomName === "A206") || beds.data?.data?.[0]
  ok("có giường trống để đặt", Boolean(freeBed), freeBed?.fullCode)

  const hold = await api("POST", "/api/dorm/holds", { role: "student", body: { bedCode: freeBed.fullCode } })
  ok("sinh viên giữ chỗ được", hold.status === 201)
  ok("có đếm ngược giữ chỗ", typeof hold.data?.data?.secondsLeft === "number")
  ok("giường chuyển HOLDING", (await api("GET", `/api/dorm/beds?room=${freeBed.roomName}`, { role: "student" })).data?.data?.find((b) => b.fullCode === freeBed.fullCode)?.status === "HOLDING")

  const holdAgain = await api("POST", "/api/dorm/holds", { role: "student", body: { bedCode: freeBed.fullCode } })
  ok("không giữ chỗ trùng giường đang HOLDING (409)", holdAgain.status === 409)

  const booking = await api("POST", "/api/dorm/bookings", {
    role: "student",
    body: { bedCode: freeBed.fullCode, paymentMethod: "vietqr" },
  })
  ok("tạo được đơn đặt giường", booking.status === 201)
  ok("đơn có mã VietQR", Boolean(booking.data?.data?.qrContent))
  const bookingId = booking.data?.data?.id

  const approveBeforePay = await api("POST", `/api/dorm/bookings/${bookingId}/approve`, { role: "manager" })
  ok("chưa thanh toán thì chưa duyệt được (400)", approveBeforePay.status === 400)

  const pay = await api("POST", `/api/dorm/bookings/${bookingId}/pay`, { role: "student" })
  ok("sinh viên thanh toán cọc được", pay.status === 200 && pay.data?.data?.status === "PAID")

  const approve = await api("POST", `/api/dorm/bookings/${bookingId}/approve`, { role: "manager" })
  ok("quản lý duyệt auto-approval thành công", approve.status === 200)
  ok("sinh ra hợp đồng", String(approve.data?.data?.contract?.id || "").startsWith("CTR-"))
  ok("giường chuyển OCCUPIED", (await api("GET", `/api/dorm/beds?room=${freeBed.roomName}`, { role: "student" })).data?.data?.find((b) => b.fullCode === freeBed.fullCode)?.status === "OCCUPIED")

  const myContracts = await api("GET", "/api/dorm/contracts", { role: "student" })
  ok("sinh viên thấy hợp đồng của mình", myContracts.status === 200 && myContracts.data?.data?.length > 0)

  /* ============ LUỒNG 2: Báo hỏng trọn vòng đời ============ */
  console.log("\nLuồng 2 — Báo hỏng (tạo → phân công → sửa xong → nghiệm thu → đóng)")

  const create = await api("POST", "/api/tickets", {
    role: "student",
    body: {
      title: "Luồng test — bóng đèn buồng B cháy",
      scope: "COMPARTMENT_PRIVATE",
      building: "Tòa A",
      room: "A205",
      compartment: "B1",
      bedCode: "A205-B1-G03",
      category: "ELECTRIC",
      urgency: "NORMAL",
      description: "Bóng cháy, cần thay.",
    },
  })
  ok("sinh viên tạo phiếu", create.status === 201)
  const tid = create.data?.data?.id

  const viewOwn = await api("GET", `/api/tickets/${tid}`, { role: "student" })
  ok("sinh viên xem được phiếu của mình", viewOwn.status === 200)
  ok("phiếu có hạn SLA", Boolean(viewOwn.data?.data?.slaDeadline))
  ok("phiếu trả kèm quyền thao tác", typeof viewOwn.data?.data?.permissions === "object")

  const notMine = await api("GET", "/api/tickets", { role: "student" })
  const otherTicket = notMine.data?.data?.find((t) => t.id !== tid)
  ok("sinh viên chỉ thấy phiếu của mình", !otherTicket || otherTicket.studentId === viewOwn.data?.data?.studentId)

  const editOwn = await api("PUT", `/api/tickets/${tid}`, { role: "student", body: { description: "Đã bổ sung: bóng cháy kèm mùi khét." } })
  ok("chủ phiếu sửa được khi PENDING", editOwn.status === 200)

  const assign = await api("POST", `/api/tickets/${tid}/transition`, {
    role: "manager",
    body: { to: "IN_PROGRESS", technicianName: "Chú Đỗ Mạnh Hùng", etaMinutes: 90 },
  })
  ok("quản lý phân công", assign.status === 200)
  ok("ETA ghi vào phân công", assign.data?.data?.assignedTechnician?.etaMinutes === 90)

  const editAfterAssign = await api("PUT", `/api/tickets/${tid}`, { role: "student", body: { description: "Sửa khi đang xử lý" } })
  ok("chủ phiếu không sửa được khi đã IN_PROGRESS (403)", editAfterAssign.status === 403)

  const complete = await api("POST", `/api/tickets/${tid}/transition`, {
    role: "technician",
    body: {
      to: "RESOLVED",
      technicianNotes: "Đã thay bóng LED 18W.",
      materials: [
        { id: "m1", name: "Bóng LED 18W", quantity: 1, unitCost: 45000, paidBy: "DORMITORY" },
        { id: "m2", name: "Đui đèn", quantity: 1, unitCost: 20000, paidBy: "DORMITORY" },
      ],
    },
  })
  ok("kỹ thuật báo hoàn thành", complete.status === 200)
  ok("tổng vật tư = 65.000đ", complete.data?.data?.resolution?.totalMaterialCost === 65000)

  const reviewBad = await api("POST", `/api/tickets/${tid}/review`, { role: "student", body: { rating: 9, comment: "x" } })
  ok("đánh giá ngoài 1–5 bị chặn", reviewBad.status === 400)

  const review = await api("POST", `/api/tickets/${tid}/review`, { role: "student", body: { rating: 5, comment: "Nhanh, sạch sẽ." } })
  ok("sinh viên đánh giá 5 sao", review.status === 200 && review.data?.data?.review?.rating === 5)
  ok("đánh giá 5 sao đánh dấu hài lòng", review.data?.data?.review?.isSatisfied === true)

  const close = await api("POST", `/api/tickets/${tid}/transition`, { role: "student", body: { to: "CLOSED" } })
  ok("chủ phiếu nghiệm thu đóng phiếu", close.status === 200 && close.data?.data?.status === "CLOSED")

  const closeAgain = await api("POST", `/api/tickets/${tid}/transition`, { role: "student", body: { to: "IN_PROGRESS" } })
  ok("phiếu đã đóng không mở lại (400)", closeAgain.status === 400)

  /* ============ LUỒNG 3: Xin về muộn → duyệt → quét cổng hợp lệ ============ */
  console.log("\nLuồng 3 — Giới nghiêm (nộp đơn → duyệt → quét cổng hợp lệ)")

  const req = await api("POST", "/api/curfew/requests", {
    role: "student",
    body: {
      requestType: "LATE_RETURN",
      date: "2026-10-20",
      expectedReturnTime: "23:30",
      reasonCategory: "STUDY",
      reasonDetail: "Họp nhóm đồ án tại thư viện.",
      parentPhone: "0903 123 456",
      parentConfirmed: true,
    },
  })
  ok("sinh viên nộp đơn về muộn", req.status === 201)
  ok("đơn mặc định PENDING", req.data?.data?.status === "PENDING")
  const reqId = req.data?.data?.id
  const studentId = req.data?.data?.studentId

  const techDecide = await api("POST", `/api/curfew/requests/${reqId}/decide`, { role: "technician", body: { approve: true } })
  ok("bảo vệ không duyệt được đơn (403)", techDecide.status === 403)

  const decide = await api("POST", `/api/curfew/requests/${reqId}/decide`, { role: "manager", body: { approve: true } })
  ok("quản lý duyệt đơn", decide.status === 200 && decide.data?.data?.status === "APPROVED")

  const scanLate = await api("POST", "/api/curfew/gate/scan", { role: "technician", body: { studentId, scanHour: 23 } })
  ok("quét 23:00 có đơn -> APPROVED_LATE", scanLate.data?.data?.status === "APPROVED_LATE")
  ok("có đơn hợp lệ không bị trừ điểm", scanLate.data?.data?.log?.penaltyPointsDeducted === undefined)
  ok("không lập biên bản khi có phép", scanLate.data?.data?.discipline === null)

  /* ============ LUỒNG 4: Quét cổng vi phạm → tự lập biên bản → trừ điểm ============ */
  console.log("\nLuồng 4 — Vi phạm giới nghiêm (quét → tự lập biên bản → trừ điểm)")

  const scanViolation = await api("POST", "/api/curfew/gate/scan", {
    role: "technician",
    body: { studentId: "QE200094", scanHour: 23, guardName: "Chú Hùng" },
  })
  ok("quét 23:00 không đơn -> UNAUTHORIZED_LATE", scanViolation.data?.data?.status === "UNAUTHORIZED_LATE")
  ok("trừ 10 điểm rèn luyện", scanViolation.data?.data?.log?.penaltyPointsDeducted === 10)
  ok("tự động lập biên bản", Boolean(scanViolation.data?.data?.discipline?.id))
  ok("biên bản đúng loại vi phạm", scanViolation.data?.data?.discipline?.infractionType === "CURFEW_VIOLATION")
  ok("cập nhật điểm rèn luyện", scanViolation.data?.data?.demerit?.totalDeducted >= 10)

  const demerits = await api("GET", "/api/curfew/demerits", { role: "manager" })
  const qe94 = demerits.data?.data?.find((d) => d.studentId === "QE200094")
  ok("bảng điểm phản ánh vi phạm", qe94 && qe94.totalDeducted >= 10)
  ok("điểm còn lại = 100 - trừ", qe94?.remainingPoints === 100 - qe94.totalDeducted)

  const manual = await api("POST", "/api/curfew/discipline", {
    role: "manager",
    body: { studentId: "QE200158", infractionType: "SMOKING_VAPING", description: "Phát hiện pod trong buồng." },
  })
  ok("quản lý lập biên bản thủ công", manual.status === 201)
  ok("hút thuốc trừ 20 điểm", manual.data?.data?.record?.pointsDeducted === 20)

  const techManual = await api("POST", "/api/curfew/discipline", {
    role: "technician",
    body: { studentId: "QE200158", infractionType: "OTHER", description: "x" },
  })
  ok("bảo vệ không lập biên bản được (403)", techManual.status === 403)

  /* ============ LUỒNG 5: Khách thăm trọn quy trình ============ */
  console.log("\nLuồng 5 — Khách thăm (đăng ký → check-in → check-out)")

  const visitor = await api("POST", "/api/visitors", {
    role: "student",
    body: { fullName: "Nguyễn Thị Khách", citizenId: "079204019988" },
  })
  ok("sinh viên đăng ký khách", visitor.status === 201)
  const vid = visitor.data?.data?.id

  const studentCheckIn = await api("POST", `/api/visitors/${vid}/check-in`, { role: "student" })
  ok("sinh viên không check-in hộ khách (403)", studentCheckIn.status === 403)

  const checkIn = await api("POST", `/api/visitors/${vid}/check-in`, { role: "technician" })
  ok("bảo vệ check-in khách", checkIn.status === 200 && checkIn.data?.data?.status === "CHECKED_IN")
  ok("ghi mốc giờ check-in", Boolean(checkIn.data?.data?.checkInAt))

  const doubleCheckIn = await api("POST", `/api/visitors/${vid}/check-in`, { role: "technician" })
  ok("check-in hai lần bị chặn (400)", doubleCheckIn.status === 400)

  const checkOut = await api("POST", `/api/visitors/${vid}/check-out`, { role: "technician" })
  ok("bảo vệ check-out khách", checkOut.status === 200 && checkOut.data?.data?.status === "CHECKED_OUT")

  const doubleOut = await api("POST", `/api/visitors/${vid}/check-out`, { role: "technician" })
  ok("check-out hai lần bị chặn (400)", doubleOut.status === 400)

  /* ============ LUỒNG 6: Hóa đơn → thanh toán → đối soát ============ */
  console.log("\nLuồng 6 — Điện nước (ghi chỉ số → phát hành → thanh toán)")

  const issue = await api("POST", "/api/billing/issue", {
    role: "manager",
    body: {
      room: "A206",
      month: "2026-12",
      elecOld: 5000,
      elecNew: 5180,
      waterOld: 300,
      waterNew: 314,
      studentIds: ["QE200001"],
      dueDate: "2027-01-05",
    },
  })
  ok("quản lý phát hành hóa đơn", issue.status === 200)
  const invId = issue.data?.data?.invoice?.id
  ok("hóa đơn có nội dung VietQR", Boolean(issue.data?.data?.invoice?.vietQrContent))

  const invoices = await api("GET", "/api/billing/invoices?room=A206", { role: "manager" })
  ok("tra được hóa đơn vừa phát hành", invoices.data?.data?.some((i) => i.id === invId))

  const payInv = await api("POST", `/api/billing/invoices/${invId}/pay`, { role: "student", body: { method: "vietqr" } })
  ok("sinh viên thanh toán hóa đơn", payInv.status === 200 && payInv.data?.data?.status === "CONFIRMED")

  const reconBad = await api("POST", "/api/billing/reconcile", {
    role: "manager",
    body: { expectedAmount: 100000, expectedContent: "DIENNUOC", actualAmount: 90000, actualContent: "DIENNUOC" },
  })
  ok("đối soát phát hiện lệch tiền", reconBad.data?.data?.matched === false)

  const reconOk = await api("POST", "/api/billing/reconcile", {
    role: "manager",
    body: { expectedAmount: 100000, expectedContent: "DIENNUOC_A205", actualAmount: 100000, actualContent: "diennuoc_a205" },
  })
  ok("đối soát khớp (không phân biệt hoa thường)", reconOk.data?.data?.matched === true)

  const dispute = await api("POST", "/api/billing/invoices/INV-2026-09-A205/dispute", {
    role: "student",
    body: { reason: "Chỉ số điện tháng này cao bất thường, đề nghị kiểm tra lại." },
  })
  ok("sinh viên gửi khiếu nại số đo", dispute.status === 200 || dispute.status === 201)

  const noReason = await api("POST", "/api/billing/invoices/INV-2026-09-A205/dispute", { role: "student", body: {} })
  ok("khiếu nại thiếu lý do bị chặn", noReason.status === 400)

  /* ============ LUỒNG 7: Đổi phòng ============ */
  console.log("\nLuồng 7 — Đổi phòng (gửi → duyệt → chuyển giường)")

  const switchReq = await api("POST", "/api/dorm/room-switches", {
    role: "student",
    body: { fromRoom: "A205", toRoom: "A203", reason: "Muốn ở gần bạn cùng lớp." },
  })
  ok("sinh viên gửi yêu cầu đổi phòng", switchReq.status === 201)
  const swId = switchReq.data?.data?.id

  const sameRoom = await api("POST", "/api/dorm/room-switches", {
    role: "student",
    body: { fromRoom: "A205", toRoom: "A205", reason: "x" },
  })
  ok("đổi sang chính phòng cũ bị chặn (400)", sameRoom.status === 400)

  const notFound = await api("POST", "/api/dorm/room-switches", {
    role: "student",
    body: { fromRoom: "A205", toRoom: "Z999", reason: "x" },
  })
  ok("phòng không tồn tại bị chặn (404)", notFound.status === 404)

  const rejectSwitch = await api("POST", `/api/dorm/room-switches/${swId}/decide`, { role: "manager", body: { approve: false, notes: "Chưa có giường trống phù hợp." } })
  ok("quản lý từ chối đổi phòng", rejectSwitch.status === 200 && rejectSwitch.data?.data?.status === "REJECTED")

  const decideAgain = await api("POST", `/api/dorm/room-switches/${swId}/decide`, { role: "manager", body: { approve: true } })
  ok("không xử lý lại yêu cầu đã quyết (400)", decideAgain.status === 400)

  /* ============ LUỒNG 8: Trả phòng & quyết toán ============ */
  console.log("\nLuồng 8 — Trả phòng (kiểm kê → trừ hư hỏng → hoàn cọc)")

  const checkout = await api("POST", "/api/dorm/checkout", {
    role: "manager",
    body: {
      studentId: "QE200001",
      deposit: 1000000,
      damages: [{ name: "Vòi sen rò rỉ", cost: 250000 }],
      unpaidBills: 0,
    },
  })
  ok("quản lý quyết toán trả phòng", checkout.status === 200)
  ok("trừ đúng tiền hư hỏng", checkout.data?.data?.damageTotal === 250000)
  ok("hoàn cọc = 750.000đ", checkout.data?.data?.refund === 750000)

  const checkoutOver = await api("POST", "/api/dorm/checkout", {
    role: "manager",
    body: { studentId: "QE200047", deposit: 100000, damages: [{ name: "Hư nặng", cost: 999999 }], unpaidBills: 0 },
  })
  ok("khấu trừ không vượt cọc", checkoutOver.data?.data?.refund === 0 && checkoutOver.data?.data?.deduction === 100000)

  const techCheckout = await api("POST", "/api/dorm/checkout", { role: "technician", body: { studentId: "QE200094" } })
  ok("kỹ thuật không quyết toán trả phòng (403)", techCheckout.status === 403)

  /* ============ LUỒNG 9: Chợ & thất lạc ============ */
  console.log("\nLuồng 9 — Chợ đồ cũ & thất lạc (đăng → gỡ)")

  const listing = await api("POST", "/api/community/marketplace", {
    role: "student",
    body: { title: "Quạt tích điện cũ", price: 250000, category: "DO_CU" },
  })
  ok("sinh viên đăng bán", listing.status === 201)
  const lid = listing.data?.data?.id

  const shortTitle = await api("POST", "/api/community/marketplace", { role: "student", body: { title: "ab", price: 1000 } })
  ok("tiêu đề dưới 4 ký tự bị chặn", shortTitle.status === 400)

  const badPrice = await api("POST", "/api/community/marketplace", { role: "student", body: { title: "Đồ cũ tốt", price: -5 } })
  ok("giá âm bị chặn", badPrice.status === 400)

  const managerRemove = await api("POST", "/api/community/marketplace", { role: "manager", body: { title: "Quản lý tự đăng", price: 1000 } })
  ok("quản lý không đăng bán được (403)", managerRemove.status === 403)

  const sold = await api("POST", `/api/community/marketplace/${lid}/sold`, { role: "student" })
  ok("chủ bài đánh dấu đã bán", sold.status === 200 && sold.data?.data?.status === "SOLD")

  const lost = await api("POST", "/api/community/lost-found", {
    role: "student",
    body: { kind: "LOST", item: "Ví da màu đen", location: "Sân A" },
  })
  ok("sinh viên báo mất đồ", lost.status === 201)

  const badKind = await api("POST", "/api/community/lost-found", { role: "student", body: { kind: "MAYBE", item: "Ví da" } })
  ok("loại tin sai bị chặn", badKind.status === 400)

  /* ============ LUỒNG 10: Bảng tin & báo cáo ============ */
  console.log("\nLuồng 10 — Bảng tin, báo cáo, xuất file")

  const notice = await api("POST", "/api/community/notices", {
    role: "manager",
    body: { title: "Lịch cắt nước", body: "Cắt nước 8:00–10:00 ngày 20/10.", startsAt: "2026-10-01", endsAt: "2026-12-31" },
  })
  ok("quản lý đăng bảng tin", notice.status === 201)

  const badDates = await api("POST", "/api/community/notices", {
    role: "manager",
    body: { title: "Sai ngày", body: "x", startsAt: "2026-12-31", endsAt: "2026-01-01" },
  })
  ok("ngày kết thúc trước bắt đầu bị chặn", badDates.status === 400)

  const techNotice = await api("POST", "/api/community/notices", { role: "technician", body: { title: "x", body: "y" } })
  ok("kỹ thuật không đăng bảng tin (403)", techNotice.status === 403)

  const job = await api("POST", "/api/dashboard/reports/export", { role: "manager", body: { kind: "residents" } })
  ok("quản lý xếp hàng xuất báo cáo", job.status === 200 && job.data?.data?.status === "QUEUED")

  const jobStatus = await api("GET", `/api/dashboard/reports/export/${job.data?.data?.id}`, { role: "manager" })
  ok("tra được trạng thái tác vụ", jobStatus.status === 200)

  const simBill = await api("POST", "/api/dashboard/simulate/billing", { role: "admin", body: { month: "2026-11" } })
  ok("admin mô phỏng hóa đơn toàn tòa", simBill.status === 200 && simBill.data?.data?.rooms?.length > 0)
  ok("mô phỏng trả tổng doanh thu", typeof simBill.data?.data?.totalRevenue === "number")

  /* ============ LUỒNG 11: An toàn & chống lạm dụng ============ */
  console.log("\nLuồng 11 — An toàn (token, hồ sơ, cấu hình)")

  const meStudent = await api("GET", "/api/auth/me", { role: "student" })
  ok("sinh viên lấy được hồ sơ của mình", meStudent.status === 200 && meStudent.data?.data?.role === "student")

  const meAnon = await api("GET", "/api/auth/me")
  ok("chưa đăng nhập không lấy được hồ sơ (401)", meAnon.status === 401)

  const updateMe = await api("PUT", "/api/auth/me", {
    role: "student",
    body: { phone: "0999 888 777", emergencyContact: { parentName: "Nguyễn Văn Hùng", phone: "0903 123 456", relationship: "Bố", address: "TP.HCM" } },
  })
  ok("sinh viên cập nhật liên hệ khẩn cấp", updateMe.status === 200)
  ok("số điện thoại mới được lưu", updateMe.data?.data?.phone === "0999 888 777")

  const settingsManager = await api("PUT", "/api/dashboard/settings", { role: "manager", body: { vat: 0.1 } })
  ok("quản lý không đổi được cấu hình hệ thống (403)", settingsManager.status === 403)

  const settingsAdmin = await api("PUT", "/api/dashboard/settings", { role: "admin", body: { note: "kiểm thử" } })
  ok("admin đổi được cấu hình", settingsAdmin.status === 200)

  const health = await api("GET", "/api/health")
  ok("healthcheck vẫn ổn sau các luồng", health.status === 200 && health.data?.ok === true)

  console.log(`\n=== ${passed} pass, ${failed} fail ===`)
  if (failed > 0) {
    console.log("\nLuồng hỏng:")
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("\nLỗi chạy luồng:", err.message)
  console.error("Backend đã chạy chưa? Thử: npm run server")
  process.exit(1)
})
