/**
 * Route: đặt giường, giữ chỗ, auto-approval, hợp đồng, đổi/trả phòng.
 * Khớp BookingPage.tsx, MyRoomPage.tsx và server.js cũ.
 */
import { Router } from "express"
import { all, find, insert, updateById, nextId } from "../db.js"
import { asyncHandler, rateLimit, cacheDel, broadcastEvent } from "../middleware.js"
import { assertCan, isManagerOrAdmin } from "../domain/rbac.js"
import {
  BED_STATUS,
  BOOKING_STATUS,
  evaluateAutoApproval,
  holdSecondsLeft,
  isHoldExpired,
  bookingQrContent,
  bookingTotal,
  validateRoomSwitch,
} from "../domain/booking.js"
import { computeCheckoutSettlement } from "../domain/pricing.js"
import { DEPOSIT_AMOUNT, ROOM_FEE_PER_STUDENT } from "../config.js"

const router = Router()

/** Bản đồ tầng/phòng/buồng/giường đầy đủ để trả cho BookingPage. */
router.get(
  "/inventory",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "inventory:read")
    const buildings = all("buildings")
    const floors = all("floors")
    const rooms = all("rooms")
    const compartments = all("compartments")
    const beds = all("beds")
    res.json({
      success: true,
      data: buildings.map((b) => ({
        ...b,
        floors: floors
          .filter((f) => f.buildingId === b.id)
          .map((f) => ({
            ...f,
            rooms: rooms
              .filter((r) => r.floorId === f.id)
              .map((r) => ({
                ...r,
                compartments: compartments
                  .filter((c) => c.roomId === r.id)
                  .map((c) => ({
                    ...c,
                    beds: beds.filter((bd) => bd.compartmentId === c.id),
                  })),
              })),
          })),
      })),
    })
  }),
)

/** Danh sách giường trống theo phòng. */
router.get(
  "/beds",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "inventory:read")
    const { room, status } = req.query
    let rows = all("beds")
    if (room) rows = rows.filter((b) => b.roomName === room)
    if (status) rows = rows.filter((b) => b.status === status)
    res.json({ success: true, data: rows })
  }),
)

/** Giữ chỗ giường 15 phút — chỉ sinh viên. */
router.post(
  "/holds",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "bed:hold")
    const bedCode = String(req.body?.bedCode || "").trim()
    const bed = find("beds", (b) => b.fullCode === bedCode)
    if (!bed) return res.status(404).json({ success: false, message: "Không tìm thấy giường" })
    if (bed.status !== BED_STATUS.AVAILABLE) {
      return res.status(409).json({ success: false, message: `Giường đang ở trạng thái ${bed.status}, không thể giữ` })
    }

    const studentId = req.actor.studentId || req.actor.mssv
    // Nhả lượt giữ chỗ cũ của chính sinh viên này nếu còn.
    for (const old of all("bedHolds").filter((h) => h.studentId === studentId && h.status === "ACTIVE")) {
      updateById("bedHolds", old.id, { status: "RELEASED" })
      updateById("beds", old.bedId, { status: BED_STATUS.AVAILABLE, studentId: null })
    }

    const now = new Date()
    const hold = insert("bedHolds", {
      id: nextId("bedHolds", "HOLD"),
      studentId,
      bedId: bed.id,
      bedCode: bed.fullCode,
      room: bed.roomName,
      status: "ACTIVE",
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
    })
    updateById("beds", bed.id, { status: BED_STATUS.HOLDING, studentId })
    cacheDel("rooms:")
    broadcastEvent("BED_HELD", `${studentId} giữ giường ${bed.fullCode}`)
    res.status(201).json({ success: true, data: { ...hold, secondsLeft: holdSecondsLeft(hold) } })
  }),
)

/** Trạng thái lượt giữ chỗ hiện tại của sinh viên. */
router.get(
  "/holds/current",
  asyncHandler((req, res) => {
    if (!req.actor) return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    const studentId = req.actor.studentId || req.actor.mssv || ""
    const hold = all("bedHolds").find((h) => h.studentId === studentId && h.status === "ACTIVE")
    if (!hold) return res.json({ success: true, data: null })
    if (isHoldExpired(hold)) {
      updateById("bedHolds", hold.id, { status: "EXPIRED" })
      updateById("beds", hold.bedId, { status: BED_STATUS.AVAILABLE, studentId: null })
      return res.json({ success: true, data: null, expired: true })
    }
    res.json({ success: true, data: { ...hold, secondsLeft: holdSecondsLeft(hold) } })
  }),
)

/** Nhả lượt giữ chỗ. */
router.delete(
  "/holds/:id",
  asyncHandler((req, res) => {
    const hold = find("bedHolds", (h) => h.id === req.params.id)
    if (!hold) return res.status(404).json({ success: false, message: "Không tìm thấy lượt giữ chỗ" })
    const isOwner = hold.studentId === (req.actor?.studentId || req.actor?.mssv)
    if (!isOwner && !isManagerOrAdmin(req.actor?.role)) {
      return res.status(403).json({ success: false, message: "Không có quyền nhả lượt giữ chỗ này" })
    }
    updateById("bedHolds", hold.id, { status: "RELEASED" })
    updateById("beds", hold.bedId, { status: BED_STATUS.AVAILABLE, studentId: null })
    cacheDel("rooms:")
    res.json({ success: true, data: { id: hold.id } })
  }),
)

/** Tạo đơn đặt giường (kèm thông tin thanh toán). */
router.post(
  "/bookings",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "booking:create")
    const bedCode = String(req.body?.bedCode || "").trim()
    const bed = find("beds", (b) => b.fullCode === bedCode)
    if (!bed) return res.status(404).json({ success: false, message: "Không tìm thấy giường" })
    if (bed.status === BED_STATUS.OCCUPIED) {
      return res.status(409).json({ success: false, message: "Giường đã có người ở" })
    }
    const studentId = req.actor.studentId || req.actor.mssv
    const booking = insert("bookings", {
      id: nextId("bookings", "BK"),
      userId: req.actor.id,
      studentId,
      bedId: bed.id,
      bedCode: bed.fullCode,
      room: bed.roomName,
      deposit: DEPOSIT_AMOUNT,
      roomFee: ROOM_FEE_PER_STUDENT,
      total: bookingTotal(),
      status: BOOKING_STATUS.PENDING,
      paymentMethod: req.body?.paymentMethod || "vietqr",
      qrContent: bookingQrContent(studentId, bed.fullCode),
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ success: true, data: booking })
  }),
)

/** Xác nhận thanh toán cọc -> booking chuyển PAID. */
router.post(
  "/bookings/:id/pay",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    const booking = find("bookings", (b) => b.id === req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: "Không tìm thấy đơn" })
    if (booking.status !== BOOKING_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: `Đơn đang ở trạng thái ${booking.status}` })
    }
    const updated = updateById("bookings", booking.id, {
      status: BOOKING_STATUS.PAID,
      paidAt: new Date().toISOString(),
    })
    insert("payments", {
      id: nextId("payments", "PAY"),
      bookingId: booking.id,
      studentId: booking.studentId,
      amount: booking.deposit,
      content: booking.qrContent,
      method: booking.paymentMethod,
      status: "CONFIRMED",
      paidAt: new Date().toISOString(),
    })
    broadcastEvent("BOOKING_PAID", `Đơn ${booking.id} đã thanh toán cọc`)
    res.json({ success: true, data: updated })
  }),
)

/** Danh sách đơn: sinh viên xem của mình, quản lý xem tất cả. */
router.get(
  "/bookings",
  asyncHandler((req, res) => {
    let rows = all("bookings")
    if (req.actor?.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((b) => b.studentId === me)
    } else {
      assertCan(req.actor?.role, "booking:read:all")
    }
    res.json({ success: true, data: rows })
  }),
)

/**
 * POST /api/dorm/bookings/:id/approve — auto-approval 3 điều kiện.
 */
router.post(
  "/bookings/:id/approve",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "booking:approve")
    const booking = find("bookings", (b) => b.id === req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: "Không tìm thấy đơn" })

    const bed = find("beds", (b) => b.id === booking.bedId)
    const student =
      find("users", (u) => u.id === booking.userId) ||
      find("users", (u) => (u.mssv || u.studentId) === booking.studentId)
    if (!bed || !student) {
      return res.status(400).json({ success: false, message: "Đơn thiếu thông tin giường hoặc sinh viên" })
    }

    const compartment = find("compartments", (c) => c.id === bed.compartmentId)
    const room = find("rooms", (r) => r.id === compartment?.roomId)
    const floor = find("floors", (f) => f.id === room?.floorId)
    const building = find("buildings", (b) => b.id === floor?.buildingId)

    const verdict = evaluateAutoApproval({ student, building, booking })
    if (!verdict.approved) {
      return res.status(400).json({
        success: false,
        message: verdict.reasons.join("; "),
        details: verdict.reasons,
      })
    }

    updateById("bookings", booking.id, { status: BOOKING_STATUS.APPROVED, approvedAt: new Date().toISOString() })
    updateById("beds", bed.id, { status: BED_STATUS.OCCUPIED, studentId: student.id })
    for (const h of all("bedHolds").filter((x) => x.bedId === bed.id && x.status === "ACTIVE")) {
      updateById("bedHolds", h.id, { status: "CONVERTED" })
    }

    const contract = insert("contracts", {
      id: nextId("contracts", "CTR"),
      bookingId: booking.id,
      userId: student.id,
      studentId: student.mssv || student.studentId,
      bedCode: bed.fullCode,
      room: bed.roomName,
      deposit: booking.deposit,
      status: "ACTIVE",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "2027-01-15",
      createdAt: new Date().toISOString(),
    })
    cacheDel("rooms:")
    broadcastEvent("BOOKING_APPROVED", `Đã duyệt đặt giường ${booking.id}`)
    res.json({ success: true, message: "Auto-Approval thành công", data: { contract, booking: find("bookings", (b) => b.id === booking.id) } })
  }),
)

/** Từ chối đơn (quản lý/admin) — nhả giường về AVAILABLE. */
router.post(
  "/bookings/:id/reject",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "booking:reject")
    const booking = find("bookings", (b) => b.id === req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: "Không tìm thấy đơn" })
    updateById("bookings", booking.id, {
      status: BOOKING_STATUS.REJECTED,
      rejectReason: req.body?.reason || "Không đủ điều kiện",
    })
    updateById("beds", booking.bedId, { status: BED_STATUS.AVAILABLE, studentId: null })
    cacheDel("rooms:")
    res.json({ success: true, data: find("bookings", (b) => b.id === booking.id) })
  }),
)

/** Hợp đồng: sinh viên xem của mình, quản lý xem tất cả. */
router.get(
  "/contracts",
  asyncHandler((req, res) => {
    let rows = all("contracts")
    if (req.actor?.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((c) => c.studentId === me)
    } else {
      assertCan(req.actor?.role, "contract:read:all")
    }
    res.json({ success: true, data: rows })
  }),
)

/** Yêu cầu đổi phòng — sinh viên gửi. */
router.post(
  "/room-switches",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "roomswitch:create")
    const studentId = req.actor.studentId || req.actor.mssv
    const { fromRoom, toRoom, reason } = req.body || {}
    const check = validateRoomSwitch({ studentId, fromRoom, toRoom })
    if (!check.ok) {
      return res.status(400).json({ success: false, message: check.errors.join("; ") })
    }
    const target = find("rooms", (r) => r.name === String(toRoom).trim())
    if (!target) return res.status(404).json({ success: false, message: `Không tìm thấy phòng ${toRoom}` })
    const freeBeds = all("beds").filter((b) => b.roomName === target.name && b.status === BED_STATUS.AVAILABLE).length
    if (freeBeds === 0) {
      return res.status(409).json({ success: false, message: `Phòng ${target.name} đã hết giường trống` })
    }
    const row = insert("roomSwitchRequests", {
      id: nextId("roomSwitchRequests", "RSW"),
      studentId,
      fromRoom: String(fromRoom).trim(),
      toRoom: target.name,
      reason: String(reason || "").trim() || "Sinh viên yêu cầu đổi phòng",
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ success: true, data: row })
  }),
)

/** Danh sách yêu cầu đổi phòng. */
router.get(
  "/room-switches",
  asyncHandler((req, res) => {
    let rows = all("roomSwitchRequests")
    if (req.actor?.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((r) => r.studentId === me)
    } else {
      assertCan(req.actor?.role, "roomswitch:review")
    }
    res.json({ success: true, data: rows })
  }),
)

/** Duyệt / từ chối đổi phòng. */
router.post(
  "/room-switches/:id/decide",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "roomswitch:review")
    const row = find("roomSwitchRequests", (r) => r.id === req.params.id)
    if (!row) return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu" })
    if (row.status !== "SUBMITTED") {
      return res.status(400).json({ success: false, message: "Yêu cầu đã được xử lý" })
    }
    const approve = req.body?.approve === true
    const updated = updateById("roomSwitchRequests", row.id, {
      status: approve ? "APPROVED" : "REJECTED",
      reviewedBy: req.actor?.fullName || req.actor?.role,
      reviewedAt: new Date().toISOString(),
      reviewNotes: req.body?.notes || "",
    })

    // Khi duyệt: chuyển giường từ phòng cũ sang phòng mới.
    if (approve) {
      const oldBed = all("beds").find(
        (b) => b.roomName === row.fromRoom && b.studentId && b.studentId.includes(row.studentId),
      )
      const newBed = all("beds").find((b) => b.roomName === row.toRoom && b.status === BED_STATUS.AVAILABLE)
      if (newBed) {
        updateById("beds", newBed.id, { status: BED_STATUS.OCCUPIED, studentId: oldBed?.studentId || row.studentId })
        if (oldBed) updateById("beds", oldBed.id, { status: BED_STATUS.AVAILABLE, studentId: null })
        updateById("roomSwitchRequests", row.id, { status: "COMPLETED" })
        broadcastEvent("ROOM_SWITCHED", `${row.studentId}: ${row.fromRoom} → ${row.toRoom}`)
      }
      cacheDel("rooms:")
    }
    res.json({ success: true, data: find("roomSwitchRequests", (r) => r.id === row.id) })
  }),
)

/** Quyết toán trả phòng (check-out): cọc - hư hỏng - nợ. Quản lý thực hiện. */
router.post(
  "/checkout",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "handover:checkout")
    const { studentId, damages, deposit, unpaidBills } = req.body || {}
    if (!studentId) return res.status(400).json({ success: false, message: "Thiếu MSSV" })
    const settlement = computeCheckoutSettlement(
      deposit ?? DEPOSIT_AMOUNT,
      damages || [],
      unpaidBills ?? 0,
    )
    const bed = all("beds").find((b) => b.studentId && String(b.studentId).includes(studentId))
    if (bed) {
      updateById("beds", bed.id, { status: BED_STATUS.AVAILABLE, studentId: null })
      cacheDel("rooms:")
    }
    for (const c of all("contracts").filter((x) => x.studentId === studentId && x.status === "ACTIVE")) {
      updateById("contracts", c.id, { status: "CLOSED", closedAt: new Date().toISOString() })
    }
    broadcastEvent("CHECKOUT", `${studentId} đã trả phòng, hoàn ${settlement.refund}đ`)
    res.json({ success: true, data: settlement })
  }),
)

export default router
