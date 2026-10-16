/**
 * Route: bảng tin, chợ & thất lạc, thông báo.
 * Khớp NoticesPage.tsx, MarketplacePage.tsx.
 *
 * Bảng tin: mọi vai trò xem; chỉ manager/admin đăng (khớp canPublish).
 * Chợ: chỉ sinh viên đăng/gỡ bài của mình; manager/admin kiểm duyệt.
 */
import { Router } from "express"
import { all, find, insert, updateById, nextId } from "../db.js"
import { asyncHandler, rateLimit, broadcastEvent } from "../middleware.js"
import { assertCan, isManagerOrAdmin } from "../domain/rbac.js"

const router = Router()

/* ---------- Bảng tin ---------- */

function isActive(notice, nowIso) {
  const now = Date.parse(nowIso)
  return Date.parse(notice.startsAt) <= now && now <= Date.parse(notice.endsAt)
}

/** GET /api/community/notices?active=true */
router.get(
  "/notices",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "notice:read")
    let rows = all("notices")
    if (req.query.active === "true") rows = rows.filter((n) => isActive(n, new Date().toISOString()))
    rows = rows.slice().sort((a, b) => (a.startsAt < b.startsAt ? 1 : -1))
    res.json({ success: true, data: rows })
  }),
)

/** POST /api/community/notices — chỉ manager/admin. */
router.post(
  "/notices",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "notice:publish")
    const { title, body, audience, startsAt, endsAt } = req.body || {}
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ success: false, message: "Tiêu đề và nội dung bắt buộc" })
    }
    const from = startsAt || new Date().toISOString().slice(0, 10)
    const to = endsAt || "2026-12-31"
    if (Date.parse(to) < Date.parse(from)) {
      return res.status(400).json({ success: false, message: "Ngày kết thúc phải sau ngày bắt đầu" })
    }
    const notice = insert("notices", {
      id: nextId("notices", "NTC"),
      title: title.trim(),
      body: body.trim(),
      audience: audience || "ALL",
      startsAt: from,
      endsAt: to,
      publishedBy: req.actor?.fullName || req.actor?.role,
      publishedAt: new Date().toISOString(),
    })
    broadcastEvent("NOTICE_PUBLISHED", notice.title)
    res.status(201).json({ success: true, data: notice })
  }),
)

/** DELETE /api/community/notices/:id */
router.delete(
  "/notices/:id",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "notice:delete")
    const n = find("notices", (x) => x.id === req.params.id)
    if (!n) return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" })
    updateById("notices", n.id, { deletedAt: new Date().toISOString() })
    res.json({ success: true, data: { id: n.id } })
  }),
)

/* ---------- Chợ đồ cũ ---------- */

/** GET /api/community/marketplace */
router.get(
  "/marketplace",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "marketplace:read")
    let rows = all("marketplace").filter((m) => m.status !== "REMOVED")
    if (req.query.sellerId) rows = rows.filter((m) => m.sellerId === req.query.sellerId)
    res.json({ success: true, data: rows })
  }),
)

/** POST /api/community/marketplace — chỉ sinh viên (admin hỗ trợ). */
router.post(
  "/marketplace",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "marketplace:create")
    const { title, price, category, photoIds } = req.body || {}
    if (!title?.trim() || title.trim().length < 4) {
      return res.status(400).json({ success: false, message: "Tiêu đề phải có ít nhất 4 ký tự" })
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: "Giá tiền không hợp lệ" })
    }
    const sellerId = req.actor.studentId || req.actor.mssv
    const listing = insert("marketplace", {
      id: nextId("marketplace", "MKT"),
      sellerId,
      sellerName: req.actor.fullName || req.actor.name,
      title: title.trim(),
      price: Math.floor(Number(price)),
      category: (category || "DO_CU").trim(),
      photoIds: (photoIds || []).slice(0, 5),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    })
    broadcastEvent("MARKETPLACE_LISTED", `${listing.title} — ${listing.price}đ`)
    res.status(201).json({ success: true, data: listing })
  }),
)

/** DELETE /api/community/marketplace/:id — chủ bài hoặc quản lý kiểm duyệt. */
router.delete(
  "/marketplace/:id",
  asyncHandler((req, res) => {
    const m = find("marketplace", (x) => x.id === req.params.id)
    if (!m) return res.status(404).json({ success: false, message: "Không tìm thấy tin" })
    const isOwner = m.sellerId === (req.actor?.studentId || req.actor?.mssv)
    if (!isOwner && !isManagerOrAdmin(req.actor?.role)) {
      return res.status(403).json({ success: false, message: "Không có quyền gỡ tin này" })
    }
    updateById("marketplace", m.id, { status: "REMOVED", removedBy: req.actor?.role })
    broadcastEvent("MARKETPLACE_REMOVED", `Gỡ tin ${m.id}`)
    res.json({ success: true, data: { id: m.id } })
  }),
)

/** POST /api/community/marketplace/:id/sold — đánh dấu đã bán. */
router.post(
  "/marketplace/:id/sold",
  asyncHandler((req, res) => {
    const m = find("marketplace", (x) => x.id === req.params.id)
    if (!m) return res.status(404).json({ success: false, message: "Không tìm thấy tin" })
    if (m.sellerId !== (req.actor?.studentId || req.actor?.mssv) && !isManagerOrAdmin(req.actor?.role)) {
      return res.status(403).json({ success: false, message: "Không có quyền cập nhật tin này" })
    }
    res.json({ success: true, data: updateById("marketplace", m.id, { status: "SOLD" }) })
  }),
)

/* ---------- Thất lạc ---------- */

/** GET /api/community/lost-found */
router.get(
  "/lost-found",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "marketplace:read")
    res.json({ success: true, data: all("lostFound").filter((p) => p.status !== "CLOSED") })
  }),
)

/** POST /api/community/lost-found — chỉ sinh viên. */
router.post(
  "/lost-found",
  rateLimit("public"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "marketplace:create")
    const { kind, item, location, photoIds } = req.body || {}
    if (!["LOST", "FOUND"].includes(kind)) {
      return res.status(400).json({ success: false, message: "Loại tin phải là LOST hoặc FOUND" })
    }
    if (!item?.trim() || item.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Mô tả món đồ phải có ít nhất 3 ký tự" })
    }
    const post = insert("lostFound", {
      id: nextId("lostFound", "LAF"),
      reporterId: req.actor.studentId || req.actor.mssv,
      reporterName: req.actor.fullName || req.actor.name,
      kind,
      item: item.trim(),
      location: (location || "KTX").trim(),
      photoIds: (photoIds || []).slice(0, 5),
      status: "OPEN",
      createdAt: new Date().toISOString(),
    })
    broadcastEvent("LOSTFOUND_POSTED", `[${post.kind}] ${post.item}`)
    res.status(201).json({ success: true, data: post })
  }),
)

/** POST /api/community/lost-found/:id/claim — đánh dấu đã nhận lại. */
router.post(
  "/lost-found/:id/claim",
  asyncHandler((req, res) => {
    const p = find("lostFound", (x) => x.id === req.params.id)
    if (!p) return res.status(404).json({ success: false, message: "Không tìm thấy tin" })
    const isOwner = p.reporterId === (req.actor?.studentId || req.actor?.mssv)
    if (!isOwner && !isManagerOrAdmin(req.actor?.role)) {
      return res.status(403).json({ success: false, message: "Không có quyền cập nhật tin này" })
    }
    res.json({ success: true, data: updateById("lostFound", p.id, { status: "CLAIMED" }) })
  }),
)

/* ---------- Thông báo hệ thống ---------- */

/** GET /api/community/notifications — thông báo tự động (hóa đơn, vi phạm). */
router.get(
  "/notifications",
  asyncHandler((req, res) => {
    if (!req.actor) return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    const rows = all("notifications").slice().sort((a, b) => (a.at < b.at ? 1 : -1))
    res.json({ success: true, data: rows })
  }),
)

export default router
