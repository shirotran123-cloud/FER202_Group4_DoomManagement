/**
 * Route: giới nghiêm & kỷ luật — khớp CurfewPage.tsx.
 *
 * - Sinh viên: nộp đơn về muộn (trước 21:00), xem đơn của mình, xem điểm rèn luyện.
 * - Kỹ thuật/bảo vệ: quét cổng, điểm danh. KHÔNG duyệt đơn.
 * - Quản lý/admin: duyệt/từ chối đơn, lập biên bản kỷ luật.
 */
import { Router } from "express"
import { all, find, insert, updateById, nextId } from "../db.js"
import { asyncHandler, rateLimit, broadcastEvent } from "../middleware.js"
import { assertCan, isManagerOrAdmin } from "../domain/rbac.js"
import {
  evaluateGateScan,
  isLateScan,
  isSubmittedBeforeCutoff,
  validateCurfewRequest,
  buildDisciplineRecord,
  summarizeDemerits,
  findOverdueAbsentees,
  GATE_STATUS,
} from "../domain/curfew.js"
import { INFRACTION_POINTS, INFRACTION_TITLES } from "../config.js"

const router = Router()

/* ---------- Đơn xin về muộn ---------- */

/** GET /api/curfew/requests — sinh viên thấy đơn của mình, staff thấy tất cả. */
router.get(
  "/requests",
  asyncHandler((req, res) => {
    if (!req.actor) return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    let rows = all("curfewRequests")
    if (req.actor.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((r) => r.studentId === me)
    } else {
      assertCan(req.actor.role, "discipline:read:all")
    }
    const { status } = req.query
    if (status) rows = rows.filter((r) => r.status === status)
    res.json({ success: true, data: rows })
  }),
)

/** POST /api/curfew/requests — sinh viên nộp đơn. */
router.post(
  "/requests",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "curfew:request")
    const b = req.body || {}
    const studentId = req.actor.studentId || req.actor.mssv
    const check = validateCurfewRequest({ ...b, studentId })
    if (!check.ok) {
      return res.status(400).json({ success: false, message: check.errors.join("; "), details: check.errors })
    }
    const now = new Date()
    const submittedAt = now.toISOString().replace("T", " ").slice(0, 16)
    const request = insert("curfewRequests", {
      id: nextId("curfewRequests", "REQ"),
      studentId,
      studentName: req.actor.fullName || req.actor.name || studentId,
      room: req.actor.room || b.room || "",
      phone: req.actor.phone || "",
      requestType: b.requestType || "LATE_RETURN",
      date: b.date,
      expectedReturnTime: String(b.expectedReturnTime).trim(),
      reasonCategory: b.reasonCategory || "OTHER",
      reasonDetail: String(b.reasonDetail).trim(),
      parentPhone: b.parentPhone || "",
      parentConfirmed: b.parentConfirmed === true,
      submittedAt,
      // BR-06: đơn nộp sau 21:00 bị đánh dấu muộn
      isSubmittedBefore2100: isSubmittedBeforeCutoff(now),
      status: "PENDING",
    })
    broadcastEvent("CURFEW_REQUESTED", `${request.studentName} nộp đơn về muộn`)
    res.status(201).json({ success: true, data: request })
  }),
)

/** POST /api/curfew/requests/:id/decide — chỉ quản lý/admin duyệt. */
router.post(
  "/requests/:id/decide",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "curfew:approve")
    const row = find("curfewRequests", (r) => r.id === req.params.id)
    if (!row) return res.status(404).json({ success: false, message: "Không tìm thấy đơn" })
    if (row.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Đơn đã được xử lý" })
    }
    const approve = req.body?.approve === true
    if (approve && row.requestType === "OVERNIGHT" && row.parentConfirmed !== true) {
      return res.status(400).json({ success: false, message: "Đơn qua đêm chưa có xác nhận phụ huynh" })
    }
    const updated = updateById("curfewRequests", row.id, {
      status: approve ? "APPROVED" : "REJECTED",
      reviewedBy: req.actor.fullName || req.actor.role,
      reviewedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      reviewNotes: approve
        ? "Đã đối chiếu thông tin phụ huynh và phê duyệt hợp lệ."
        : req.body?.notes || "Từ chối vì lý do không phù hợp quy chế KTX.",
    })
    broadcastEvent(
      approve ? "CURFEW_APPROVED" : "CURFEW_REJECTED",
      `Đơn ${row.id} của ${row.studentName}`,
    )
    res.json({ success: true, data: updated })
  }),
)

/* ---------- Quét cổng ---------- */

/**
 * POST /api/curfew/gate/scan — bảo vệ quét thẻ.
 * body: { studentId, scanHour, guardName, matchedRequestId? }
 */
router.post(
  "/gate/scan",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "gate:scan")
    const { studentId, scanHour, guardName, matchedRequestId } = req.body || {}
    if (!studentId || scanHour === undefined) {
      return res.status(400).json({ success: false, message: "Cần studentId và scanHour" })
    }
    const student =
      find("users", (u) => (u.mssv || u.studentId) === String(studentId).toUpperCase()) || null

    const approvedRequest =
      find("curfewRequests", (r) => r.studentId === studentId && r.status === "APPROVED") ||
      (matchedRequestId ? find("curfewRequests", (r) => r.id === matchedRequestId) : null)

    const status = evaluateGateScan(Number(scanHour), Boolean(approvedRequest))
    const now = new Date()
    const log = insert("gateLogs", {
      id: nextId("gateLogs", "LOG"),
      studentId,
      studentName: student?.fullName || student?.name || studentId,
      room: student?.room || "",
      timestamp: now.toISOString(),
      scanTimeFormatted: now.toTimeString().slice(0, 8),
      curfewStatus: status,
      matchedRequestId: approvedRequest?.id,
      penaltyPointsDeducted: status === GATE_STATUS.UNAUTHORIZED_LATE ? INFRACTION_POINTS.CURFEW_VIOLATION : undefined,
      guardNotes: status === GATE_STATUS.ON_TIME
        ? "Về trước 23:00, thẻ sinh viên hợp lệ."
        : approvedRequest
          ? `Đối chiếu đơn ${approvedRequest.id}: có phép hợp lệ.`
          : "Về muộn sau 23:00 không có đơn xin phép trên hệ thống.",
      guardName: guardName || req.actor?.fullName || "Bảo vệ trực cổng",
    })

    // Vi phạm -> tự động lập biên bản + cập nhật điểm rèn luyện
    let discipline = null
    let demerit = null
    if (status === GATE_STATUS.UNAUTHORIZED_LATE) {
      const record = buildDisciplineRecord({
        studentId,
        studentName: log.studentName,
        room: log.room,
        infractionType: "CURFEW_VIOLATION",
        description: `Quét cổng lúc ${log.scanTimeFormatted} không có đơn xin phép.`,
        officerName: log.guardName,
        now,
      })
      discipline = insert("disciplineRecords", { ...record, id: nextId("disciplineRecords", "VIO") })
      demerit = refreshDemerits(studentId, log.studentName, log.room)
      broadcastEvent("CURFEW_VIOLATION", `${log.studentName} vi phạm giới nghiêm`)
    }

    res.json({ success: true, data: { log, discipline, demerit, status } })
  }),
)

/** GET /api/curfew/gate/logs — nhật ký quét cổng. */
router.get(
  "/gate/logs",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "discipline:read:all")
    const { studentId, date } = req.query
    let rows = all("gateLogs")
    if (studentId) rows = rows.filter((l) => l.studentId === studentId)
    if (date) rows = rows.filter((l) => String(l.timestamp).startsWith(date))
    res.json({ success: true, data: rows })
  }),
)

/** GET /api/curfew/gate/overdue — MSSV còn vắng mặt sau 23:00. */
router.get(
  "/gate/overdue",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "discipline:read:all")
    const nowHour = req.query.hour !== undefined ? Number(req.query.hour) : new Date().getHours()
    const residentIds = all("beds")
      .filter((b) => b.status === "OCCUPIED" && b.studentId)
      .map((b) => String(b.studentId))
    const today = new Date().toISOString().slice(0, 10)
    const todayLogs = all("gateLogs").filter((l) => String(l.timestamp).startsWith(today))
    const overdue = findOverdueAbsentees(todayLogs, residentIds, nowHour)
    res.json({ success: true, data: overdue, data2: { nowHour } })
  }),
)

/* ---------- Kỷ luật & điểm rèn luyện ---------- */

function refreshDemerits(studentId, studentName, room) {
  const summary = summarizeDemerits(studentId, studentName, room, all("disciplineRecords"))
  const existing = find("demeritSummaries", (d) => d.studentId === studentId)
  if (existing) return updateById("demeritSummaries", existing.id, summary)
  return insert("demeritSummaries", { id: nextId("demeritSummaries", "DMR"), ...summary })
}

/** GET /api/curfew/discipline — sinh viên xem của mình, staff xem tất cả. */
router.get(
  "/discipline",
  asyncHandler((req, res) => {
    if (!req.actor) return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    let rows = all("disciplineRecords")
    if (req.actor.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((d) => d.studentId === me)
    } else {
      assertCan(req.actor.role, "discipline:read:all")
    }
    res.json({ success: true, data: rows })
  }),
)

/** POST /api/curfew/discipline — quản lý lập biên bản vi phạm. */
router.post(
  "/discipline",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "discipline:write")
    const { studentId, infractionType, description, evidenceImage, evidenceNote } = req.body || {}
    if (!studentId) return res.status(400).json({ success: false, message: "Thiếu MSSV sinh viên vi phạm" })
    const student = find("users", (u) => (u.mssv || u.studentId) === studentId)
    if (!student) return res.status(404).json({ success: false, message: "Không tìm thấy sinh viên" })
    if (!INFRACTION_POINTS[infractionType]) {
      return res.status(400).json({ success: false, message: `Hành vi không hợp lệ: ${infractionType}` })
    }
    const record = buildDisciplineRecord({
      studentId,
      studentName: student.fullName || student.name,
      room: student.room,
      infractionType,
      description,
      officerName: req.actor?.fullName || req.actor?.role,
    })
    const saved = insert("disciplineRecords", {
      ...record,
      id: nextId("disciplineRecords", "VIO"),
      evidenceImage,
      evidenceNote,
    })
    const demerit = refreshDemerits(studentId, record.studentName, record.room)
    broadcastEvent("DISCIPLINE_RECORDED", `${record.studentName}: ${record.infractionTitle}`)
    res.status(201).json({ success: true, data: { record: saved, demerit } })
  }),
)

/** GET /api/curfew/demerits — bảng điểm rèn luyện. */
router.get(
  "/demerits",
  asyncHandler((req, res) => {
    if (!req.actor) return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    let rows = all("demeritSummaries")
    if (req.actor.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((d) => d.studentId === me)
    } else {
      assertCan(req.actor.role, "discipline:read:all")
    }
    res.json({ success: true, data: rows })
  }),
)

/** GET /api/curfew/config — mốc giờ cho UI. */
router.get(
  "/config",
  asyncHandler((_req, res) => {
    res.json({
      success: true,
      data: {
        curfewHour: 23,
        curfewOpenHour: 5,
        lateRequestCutoffHour: 21,
        infractionPoints: INFRACTION_POINTS,
        infractionTitles: INFRACTION_TITLES,
        demeritWarningAt: 20,
        demeritSuspendAt: 30,
      },
    })
  }),
)

export default router
