/**
 * Route: khách thăm — khớp VisitorPage.tsx.
 *
 * Chỉ sinh viên đăng ký khách của mình (admin hỗ trợ).
 * Bảo vệ chỉ check-in/check-out tại cổng.
 * Khách ở trong ngày, rời trước 21:00, không lưu trú qua đêm.
 */
import { Router } from "express"
import { all, find, insert, updateById, nextId } from "../db.js"
import { asyncHandler, rateLimit, broadcastEvent } from "../middleware.js"
import { assertCan, isManagerOrAdmin } from "../domain/rbac.js"
import {
  validateVisitorInput,
  buildVisitor,
  assertCanCheckIn,
  assertCanCheckOut,
  detectOverstay,
  overstayingVisitors,
  VISITOR_STATUS,
} from "../domain/visitor.js"
import { VISITOR_LATEST_HOUR } from "../config.js"

const router = Router()

/** GET /api/visitors — sinh viên xem khách của mình, quản lý xem tất cả. */
router.get(
  "/",
  asyncHandler((req, res) => {
    if (!req.actor) return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    const now = new Date()
    let rows = all("visitors").map((v) => detectOverstay(v, now))
    if (req.actor.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((v) => v.studentId === me)
    } else {
      assertCan(req.actor.role, "visitor:read:all")
    }
    const { status } = req.query
    if (status) rows = rows.filter((v) => v.status === status)
    res.json({ success: true, data: rows, meta: { latestHour: VISITOR_LATEST_HOUR } })
  }),
)

/** POST /api/visitors — sinh viên đăng ký khách. */
router.post(
  "/",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "visitor:create")
    const b = req.body || {}
    const studentId = req.actor.studentId || req.actor.mssv
    const check = validateVisitorInput({ ...b, studentId })
    if (!check.ok) {
      return res.status(400).json({ success: false, message: check.errors.join("; "), details: check.errors })
    }
    const visitor = buildVisitor({ ...b, studentId })
    const saved = insert("visitors", { ...visitor, id: nextId("visitors", "VST") })
    broadcastEvent("VISITOR_REGISTERED", `${saved.fullName} đăng ký thăm ${studentId}`)
    res.status(201).json({ success: true, data: saved })
  }),
)

/** POST /api/visitors/:id/check-in — bảo vệ/quản lý. */
router.post(
  "/:id/check-in",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "visitor:gate")
    const v = find("visitors", (x) => x.id === req.params.id)
    if (!v) return res.status(404).json({ success: false, message: "Không tìm thấy khách" })
    assertCanCheckIn(v)
    const updated = updateById("visitors", v.id, {
      status: VISITOR_STATUS.CHECKED_IN,
      checkInAt: new Date().toISOString(),
      gateOfficer: req.actor?.fullName || req.actor?.role,
    })
    res.json({ success: true, data: updated })
  }),
)

/** POST /api/visitors/:id/check-out — bảo vệ/quản lý. */
router.post(
  "/:id/check-out",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "visitor:gate")
    const v = find("visitors", (x) => x.id === req.params.id)
    if (!v) return res.status(404).json({ success: false, message: "Không tìm thấy khách" })
    assertCanCheckOut(v)
    const updated = updateById("visitors", v.id, {
      status: VISITOR_STATUS.CHECKED_OUT,
      checkOutAt: new Date().toISOString(),
      gateOfficer: req.actor?.fullName || req.actor?.role,
    })
    res.json({ success: true, data: updated })
  }),
)

/** GET /api/visitors/overstaying — khách còn trong KTX sau 21:00. */
router.get(
  "/overstaying",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "visitor:gate")
    res.json({ success: true, data: overstayingVisitors(all("visitors"), new Date()) })
  }),
)

/** DELETE /api/visitors/:id — sinh viên hủy đăng ký khi chưa check-in. */
router.delete(
  "/:id",
  asyncHandler((req, res) => {
    const v = find("visitors", (x) => x.id === req.params.id)
    if (!v) return res.status(404).json({ success: false, message: "Không tìm thấy khách" })
    const isOwner = v.studentId === (req.actor?.studentId || req.actor?.mssv)
    if (!isOwner && !isManagerOrAdmin(req.actor?.role)) {
      return res.status(403).json({ success: false, message: "Không có quyền hủy đăng ký này" })
    }
    if (v.status !== VISITOR_STATUS.PRE_REGISTERED) {
      return res.status(400).json({ success: false, message: "Khách đã tới cổng, không hủy được" })
    }
    updateById("visitors", v.id, { status: "CANCELLED" })
    res.json({ success: true, data: { id: v.id } })
  }),
)

export default router
