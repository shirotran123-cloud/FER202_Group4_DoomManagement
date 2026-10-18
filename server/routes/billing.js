/**
 * Route: hóa đơn, công tơ, thanh toán — khớp BillingPage.tsx.
 *
 * Chỉ manager/admin ghi chỉ số và phát hành hóa đơn (khớp canRecordMeter).
 * Sinh viên đọc hóa đơn của mình, thanh toán, và gửi khiếu nại số đo.
 */
import { Router } from "express"
import { all, find, insert, updateById, nextId, save } from "../db.js"
import { asyncHandler, rateLimit, cacheDel, broadcastEvent } from "../middleware.js"
import { assertCan, isManagerOrAdmin, isSelf } from "../domain/rbac.js"
import { buildMonthlyInvoice, validateMeterReading, detectConsumptionAnomaly } from "../domain/pricing.js"
import { ROOM_FEE_PER_STUDENT, WIFI_FEE_TOTAL, CLEANING_FEE_TOTAL } from "../config.js"

const router = Router()

/** Sinh viên đang ở trong phòng (theo beds OCCUPIED). */
function studentsInRoom(room) {
  const beds = all("beds").filter((b) => b.roomName === room && b.status === "OCCUPIED")
  return beds.map((b) => b.studentId).filter(Boolean)
}

function numStudentsInRoom(room) {
  return Math.max(1, studentsInRoom(room).length)
}

/** GET /api/billing/invoices?room=&studentId= — danh sách hóa đơn. */
router.get(
  "/invoices",
  asyncHandler((req, res) => {
    const actorRole = req.actor?.role
    const { room, studentId } = req.query
    let rows = all("invoices")

    if (actorRole === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((inv) => (inv.studentIds || []).includes(me) || inv.room === req.actor.room)
    } else {
      assertCan(actorRole, "invoice:read:all")
    }
    if (room) rows = rows.filter((inv) => inv.room === room)
    if (studentId) rows = rows.filter((inv) => (inv.studentIds || []).includes(String(studentId)))

    res.json({ success: true, data: rows })
  }),
)

/** GET /api/billing/invoices/:id */
router.get(
  "/invoices/:id",
  asyncHandler((req, res) => {
    const inv = find("invoices", (i) => i.id === req.params.id)
    if (!inv) return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" })
    if (req.actor?.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      const allowed = (inv.studentIds || []).includes(me) || inv.room === req.actor.room
      if (!allowed) return res.status(403).json({ success: false, message: "Không có quyền xem hóa đơn này" })
    }
    res.json({ success: true, data: inv })
  }),
)

/** POST /api/billing/calculate — tính thử, không lưu. */
router.post(
  "/calculate",
  rateLimit("public"),
  asyncHandler((req, res) => {
    const b = req.body || {}
    const check = validateMeterReading({
      elecOld: b.elecOld ?? 0,
      elecNew: b.elecNew ?? 0,
      waterOld: b.waterOld ?? 0,
      waterNew: b.waterNew ?? 0,
    })
    if (!check.ok) {
      return res.status(400).json({ success: false, message: check.errors.join("; "), details: check.errors })
    }
    const invoice = buildMonthlyInvoice({
      room: b.room,
      month: b.month,
      elecOld: b.elecOld ?? 0,
      elecNew: b.elecNew ?? 0,
      waterOld: b.waterOld ?? 0,
      waterNew: b.waterNew ?? 0,
      roomFeePerStudent: b.roomFeePerStudent ?? ROOM_FEE_PER_STUDENT,
      wifiFeeTotal: b.wifiFeeTotal ?? WIFI_FEE_TOTAL,
      cleaningFeeTotal: b.cleaningFeeTotal ?? CLEANING_FEE_TOTAL,
      numStudents: b.numStudents ?? numStudentsInRoom(b.room),
    })
    res.json({ success: true, data: invoice })
  }),
)

/**
 * POST /api/billing/issue — ghi chỉ số + phát hành hóa đơn + thông báo.
 * Chỉ manager/admin (quyền meter:write + invoice:issue).
 */
router.post(
  "/issue",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "invoice:issue")
    const b = req.body || {}
    if (!b.room || !b.month) {
      return res.status(400).json({ success: false, message: "Cần room và month" })
    }
    const check = validateMeterReading({
      elecOld: b.elecOld ?? 0,
      elecNew: b.elecNew ?? 0,
      waterOld: b.waterOld ?? 0,
      waterNew: b.waterNew ?? 0,
    })
    if (!check.ok) {
      return res.status(400).json({ success: false, message: check.errors.join("; "), details: check.errors })
    }

    const studentIds = b.studentIds?.length ? b.studentIds : studentsInRoom(b.room)
    const numStudents = Math.max(1, studentIds.length)

    // Cảnh báo tiêu thụ bất thường so với kỳ trước
    const prev = all("utilityRecords")
      .filter((r) => r.room === b.room && r.month < b.month)
      .sort((x, y) => (x.month < y.month ? 1 : -1))[0]
    const warnings = detectConsumptionAnomaly({
      deltaElec: (b.elecNew ?? 0) - (b.elecOld ?? 0),
      deltaWater: (b.waterNew ?? 0) - (b.waterOld ?? 0),
      prevDeltaElec: prev ? prev.elecNew - prev.elecOld : 0,
      prevDeltaWater: prev ? prev.waterNew - prev.waterOld : 0,
    })

    const utilityRecord = {
      id: `util_${b.room}_${b.month}`,
      room: b.room,
      month: b.month,
      elecOld: b.elecOld ?? 0,
      elecNew: b.elecNew ?? 0,
      waterOld: b.waterOld ?? 0,
      waterNew: b.waterNew ?? 0,
      meterPhotoIds: b.meterPhotoIds || [],
      recordedBy: req.actor?.id || req.actor?.role || "unknown",
      recordedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      warnings,
    }
    const existingUtil = find("utilityRecords", (r) => r.id === utilityRecord.id)
    if (existingUtil) updateById("utilityRecords", utilityRecord.id, utilityRecord)
    else insert("utilityRecords", utilityRecord)

    const invoice = buildMonthlyInvoice({
      room: b.room,
      month: b.month,
      elecOld: utilityRecord.elecOld,
      elecNew: utilityRecord.elecNew,
      waterOld: utilityRecord.waterOld,
      waterNew: utilityRecord.waterNew,
      roomFeePerStudent: b.roomFeePerStudent ?? ROOM_FEE_PER_STUDENT,
      wifiFeeTotal: b.wifiFeeTotal ?? WIFI_FEE_TOTAL,
      cleaningFeeTotal: b.cleaningFeeTotal ?? CLEANING_FEE_TOTAL,
      numStudents,
    })

    const inv = {
      id: `INV-${b.month}-${b.room}`,
      invoiceCode: `INV-${b.month}-${b.room}`,
      ...invoice,
      utilityRecordId: utilityRecord.id,
      studentIds,
      status: "ISSUED",
      dueDate: b.dueDate || null,
      issuedAt: utilityRecord.recordedAt,
      vietQrContent: `DIENNUOC_${b.room}_${studentIds[0] || ""}`,
      warnings,
    }
    const existingInv = find("invoices", (i) => i.id === inv.id)
    if (existingInv) updateById("invoices", inv.id, inv)
    else insert("invoices", inv)

    const notice = insert("notices", {
      id: nextId("notices", "NTC"),
      title: `Hóa đơn tháng ${b.month} phòng ${b.room} đã phát hành`,
      body: `Điện ${invoice.deltaElec} kWh, nước ${invoice.deltaWater} m³. Mỗi sinh viên đóng ${invoice.perStudentTotal.toLocaleString("vi-VN")}đ.`,
      audience: "ROOM",
      startsAt: new Date().toISOString().slice(0, 10),
      endsAt: b.dueDate || "2026-12-31",
    })

    /*
      Bảng tin (`notices`) là để mọi người đọc chung, còn CHUÔNG thông báo
      (`notifications`) phải gửi tới đúng từng sinh viên đang ở phòng đó — nếu
      không thì sinh viên không bao giờ nhận được tin hóa đơn mới của mình.
    */
    const bedsInRoom = all("beds").filter(
      (bed) => bed.roomName === b.room && bed.status === "OCCUPIED" && bed.studentId,
    )
    const notifiedStudents = new Set()
    for (const bed of bedsInRoom) {
      if (notifiedStudents.has(bed.studentId)) continue
      notifiedStudents.add(bed.studentId)
      insert("notifications", {
        id: nextId("notifications", "NOTI"),
        title: `Hóa đơn tháng ${b.month} đã phát hành`,
        body: `Phòng ${b.room}: điện ${invoice.deltaElec} kWh, nước ${invoice.deltaWater} m³. ` +
          `Phần của bạn là ${invoice.perStudentTotal.toLocaleString("vi-VN")}đ, hạn ${b.dueDate || "cuối tháng"}.`,
        kind: "INVOICE",
        at: new Date().toISOString(),
        studentId: bed.studentId,
        room: b.room,
        role: null,
        read: false,
      })
    }

    cacheDel("rooms:")
    broadcastEvent("INVOICE_ISSUED", notice.title)
    res.json({
      success: true,
      data: { invoice: inv, utilityRecord, notice, warnings, notifiedCount: notifiedStudents.size },
    })
  }),
)

/** POST /api/billing/invoices/:id/pay — sinh viên xác nhận đã chuyển khoản. */
router.post(
  "/invoices/:id/pay",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    const inv = find("invoices", (i) => i.id === req.params.id)
    if (!inv) return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" })
    if (req.actor?.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      if (!(inv.studentIds || []).includes(me)) {
        return res.status(403).json({ success: false, message: "Không có quyền thanh toán hóa đơn này" })
      }
    }
    const me = req.actor?.studentId || req.actor?.mssv || "unknown"
    const payment = insert("payments", {
      id: nextId("payments", "PAY"),
      invoiceId: inv.id,
      studentId: me,
      amount: req.body?.amount ?? inv.perStudentTotal,
      content: req.body?.content || inv.vietQrContent,
      method: req.body?.method || "vietqr",
      status: "CONFIRMED",
      paidAt: new Date().toISOString(),
    })
    updateById("invoices", inv.id, { status: "PAID", paidAt: payment.paidAt })
    broadcastEvent("INVOICE_PAID", `${me} đã thanh toán ${inv.invoiceCode}`)
    res.json({ success: true, data: payment })
  }),
)

/** POST /api/billing/invoices/:id/dispute — khiếu nại số đo. */
router.post(
  "/invoices/:id/dispute",
  rateLimit("public"),
  asyncHandler((req, res) => {
    const inv = find("invoices", (i) => i.id === req.params.id)
    if (!inv) return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" })
    if (!req.body?.reason?.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập lý do khiếu nại" })
    }
    const dispute = insert("payments", {
      id: nextId("payments", "DSP"),
      invoiceId: inv.id,
      studentId: req.actor?.studentId || req.actor?.mssv || "unknown",
      kind: "DISPUTE",
      reason: String(req.body.reason).trim(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    })
    broadcastEvent("INVOICE_DISPUTED", `Khiếu nại hóa đơn ${inv.invoiceCode}`)
    res.json({ success: true, data: dispute })
  }),
)

/** GET /api/billing/utility-records?room= — lịch sử công tơ. */
router.get(
  "/utility-records",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "meter:read")
    const { room } = req.query
    let rows = all("utilityRecords")
    if (room) rows = rows.filter((r) => r.room === room)
    res.json({ success: true, data: rows })
  }),
)

/** POST /api/billing/reconcile — đối soát giao dịch ngân hàng. */
router.post(
  "/reconcile",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "invoice:reconcile")
    const { expectedAmount, expectedContent, actualAmount, actualContent } = req.body || {}
    const amountOk = Number(expectedAmount) === Number(actualAmount)
    const contentOk =
      String(expectedContent || "").toUpperCase() === String(actualContent || "").toUpperCase()
    const matched = amountOk && contentOk
    res.json({
      success: true,
      data: {
        matched,
        reason: matched
          ? "Số tiền và nội dung khớp"
          : !amountOk
            ? `Lệch số tiền: cần ${expectedAmount}, nhận ${actualAmount}`
            : "Nội dung chuyển khoản không khớp",
      },
    })
  }),
)

export default router
