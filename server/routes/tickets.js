/**
 * Route: phiếu báo hỏng — khớp MaintenancePage.tsx.
 *
 * Quyền theo ticketPermissions (domain/ticket.js):
 *  - Sinh viên: tạo, sửa/xóa khi PENDING, đánh giá khi RESOLVED.
 *  - Kỹ thuật: báo hoàn thành khi IN_PROGRESS.
 *  - Quản lý/admin: phân công thợ, xóa, mọi quyền.
 */
import { Router } from "express"
import { all, find, insert, updateById, removeById, nextId } from "../db.js"
import { asyncHandler, rateLimit, broadcastEvent } from "../middleware.js"
import { assertCan } from "../domain/rbac.js"
import {
  validateTicketInput,
  assertTransition,
  ticketPermissions,
  validateRating,
  totalMaterialCost,
  summarizeTickets,
  slaDeadline,
} from "../domain/ticket.js"

const router = Router()

function decorate(ticket, actor) {
  const perms = ticketPermissions(actor?.role, ticket, actor?.studentId || actor?.mssv)
  return { ...ticket, slaDeadline: slaDeadline(ticket.createdAt, ticket.urgency), permissions: perms }
}

/** GET /api/tickets — sinh viên chỉ thấy phiếu của mình. */
router.get(
  "/",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "ticket:read")
    let rows = all("tickets")
    if (req.actor.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      rows = rows.filter((t) => t.studentId === me)
    }
    const { status, urgency, scope, room } = req.query
    if (status) rows = rows.filter((t) => t.status === status)
    if (urgency) rows = rows.filter((t) => t.urgency === urgency)
    if (scope) rows = rows.filter((t) => t.scope === scope)
    if (room) rows = rows.filter((t) => t.room === room)
    res.json({ success: true, data: rows.map((t) => decorate(t, req.actor)) })
  }),
)

/** GET /api/tickets/stats — thống kê cho dashboard quản lý. */
router.get(
  "/stats",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "ticket:read")
    res.json({ success: true, data: summarizeTickets(all("tickets")) })
  }),
)

/** GET /api/tickets/:id */
router.get(
  "/:id",
  asyncHandler((req, res) => {
    const t = find("tickets", (x) => x.id === req.params.id)
    if (!t) return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" })
    if (req.actor?.role === "student") {
      const me = req.actor.studentId || req.actor.mssv
      if (t.studentId !== me) {
        return res.status(403).json({ success: false, message: "Không có quyền xem phiếu này" })
      }
    }
    res.json({ success: true, data: decorate(t, req.actor) })
  }),
)

/** POST /api/tickets — sinh viên tạo phiếu báo hỏng. */
router.post(
  "/",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "ticket:create")
    const b = req.body || {}
    const check = validateTicketInput(b)
    if (!check.ok) {
      return res.status(400).json({ success: false, message: check.errors.join("; "), details: check.errors })
    }
    const studentId = req.actor.studentId || req.actor.mssv || b.studentId
    const ticket = insert("tickets", {
      id: nextId("tickets", "TKT"),
      title: b.title.trim(),
      scope: b.scope,
      building: b.building || "Tòa A",
      room: b.room,
      compartment: b.scope === "COMPARTMENT_PRIVATE" ? b.compartment : undefined,
      bedCode: b.scope === "COMPARTMENT_PRIVATE" ? b.bedCode : undefined,
      category: b.category,
      urgency: b.urgency,
      description: b.description?.trim() || "Cần kỹ thuật kiểm tra và khắc phục sự cố.",
      studentId,
      studentName: req.actor.fullName || req.actor.name || b.studentName || studentId,
      studentPhone: req.actor.phone || b.studentPhone || "",
      evidenceImages: (b.evidenceImages || []).slice(0, 5),
      status: "PENDING",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    })
    broadcastEvent("TICKET_CREATED", `Phiếu mới ${ticket.id}: ${ticket.title}`)
    res.status(201).json({ success: true, data: decorate(ticket, req.actor) })
  }),
)

/** PUT /api/tickets/:id — chủ phiếu (PENDING) hoặc quản lý/admin. */
router.put(
  "/:id",
  asyncHandler((req, res) => {
    const t = find("tickets", (x) => x.id === req.params.id)
    if (!t) return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" })
    const perms = ticketPermissions(req.actor?.role, t, req.actor?.studentId || req.actor?.mssv)
    if (!perms.canEdit) {
      return res.status(403).json({ success: false, message: "Không có quyền sửa phiếu ở trạng thái này" })
    }
    const b = req.body || {}
    const patch = {}
    for (const key of ["title", "description", "category", "urgency", "scope", "room", "building", "compartment", "bedCode", "evidenceImages"]) {
      if (b[key] !== undefined) patch[key] = b[key]
    }
    const updated = updateById("tickets", t.id, patch)
    res.json({ success: true, data: decorate(updated, req.actor) })
  }),
)

/** DELETE /api/tickets/:id */
router.delete(
  "/:id",
  asyncHandler((req, res) => {
    const t = find("tickets", (x) => x.id === req.params.id)
    if (!t) return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" })
    const perms = ticketPermissions(req.actor?.role, t, req.actor?.studentId || req.actor?.mssv)
    if (!perms.canDelete) {
      return res.status(403).json({ success: false, message: "Không có quyền xóa phiếu này" })
    }
    removeById("tickets", t.id)
    res.json({ success: true, data: { id: t.id } })
  }),
)

/** POST /api/tickets/:id/transition — chuyển trạng thái theo luồng. */
router.post(
  "/:id/transition",
  rateLimit("public"),
  asyncHandler((req, res) => {
    const t = find("tickets", (x) => x.id === req.params.id)
    if (!t) return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" })
    const to = String(req.body?.to || "")
    assertTransition(t.status, to)
    const perms = ticketPermissions(req.actor?.role, t, req.actor?.studentId || req.actor?.mssv)

    if (to === "CANCELLED" && !perms.canCancel) {
      return res.status(403).json({ success: false, message: "Không có quyền hủy phiếu này" })
    }
    if (to === "IN_PROGRESS" && !perms.canAssign) {
      return res.status(403).json({ success: false, message: "Chỉ quản lý/admin được phân công thợ" })
    }
    if (to === "RESOLVED" && !perms.canComplete) {
      return res.status(403).json({ success: false, message: "Chỉ kỹ thuật được báo hoàn thành" })
    }
    if (to === "CLOSED" && !perms.canReview) {
      return res.status(403).json({ success: false, message: "Chỉ chủ phiếu được nghiệm thu đóng phiếu" })
    }

    const patch = { status: to }
    if (to === "IN_PROGRESS") {
      patch.assignedTechnician = {
        id: req.body?.technicianId || `tech_${Date.now()}`,
        name: req.body?.technicianName || "Chú Đỗ Mạnh Hùng",
        phone: req.body?.technicianPhone || "0977 112 233",
        assignedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        etaMinutes: req.body?.etaMinutes ?? (t.urgency === "EMERGENCY" ? 120 : 1440),
      }
    }
    if (to === "RESOLVED") {
      const materials = req.body?.materials || []
      patch.resolution = {
        completedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        technicianNotes: req.body?.technicianNotes || "Đã xử lý xong.",
        completionImages: (req.body?.completionImages || []).slice(0, 5),
        materials,
        totalMaterialCost: totalMaterialCost(materials),
      }
    }

    const updated = updateById("tickets", t.id, patch)
    broadcastEvent("TICKET_UPDATED", `Phiếu ${t.id} → ${to}`)
    res.json({ success: true, data: decorate(updated, req.actor) })
  }),
)

/** POST /api/tickets/:id/review — sinh viên đánh giá 1–5 sao sau nghiệm thu. */
router.post(
  "/:id/review",
  rateLimit("public"),
  asyncHandler((req, res) => {
    const t = find("tickets", (x) => x.id === req.params.id)
    if (!t) return res.status(404).json({ success: false, message: "Không tìm thấy phiếu" })
    const perms = ticketPermissions(req.actor?.role, t, req.actor?.studentId || req.actor?.mssv)
    if (!perms.canReview) {
      return res.status(403).json({ success: false, message: "Chỉ chủ phiếu đánh giá khi phiếu chờ nghiệm thu" })
    }
    const rating = Number(req.body?.rating)
    if (!validateRating(rating)) {
      return res.status(400).json({ success: false, message: "Đánh giá phải là số nguyên từ 1 đến 5" })
    }
    const updated = updateById("tickets", t.id, {
      review: {
        rating,
        reviewedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        comment: String(req.body?.comment || "").trim(),
        isSatisfied: rating >= 4,
      },
    })
    broadcastEvent("TICKET_REVIEWED", `Phiếu ${t.id} được đánh giá ${rating} sao`)
    res.json({ success: true, data: decorate(updated, req.actor) })
  }),
)

export default router
