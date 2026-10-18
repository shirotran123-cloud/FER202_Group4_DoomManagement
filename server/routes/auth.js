/**
 * Route: xác thực & hồ sơ — khớp AuthContext.tsx.
 *
 * Frontend đăng nhập demo bằng cách chọn role (loginAsDemoUser) hoặc Google
 * (kiểm tra domain email). Backend cấp token giả + hồ sơ đúng shape UserProfile.
 */
import { Router } from "express"
import { all, find } from "../db.js"
import { asyncHandler,rateLimit } from "../middleware.js"
import { permissionsFor } from "../domain/rbac.js"

const router = Router()

/** Chuẩn hóa hồ sơ db -> shape UserProfile frontend dùng. */
function toProfile(user) {
  const role = String(user.role).toLowerCase()
  const isStudent = role === "student"

  /**
   * Tên tòa suy ra từ mã phòng (A205 -> Tòa A, B101 -> Tòa B) để hồ sơ luôn khớp
   * dữ liệu giường, thay vì mặc định cứng "Tòa A" cho mọi sinh viên — sinh viên
   * Tòa B trước đây bị ghi nhầm sang Tòa A.
   */
  const buildingOfRoom = (room) => {
    const letter = String(room || "").trim().charAt(0).toUpperCase()
    const found = all("buildings").find((b) => String(b.name).trim().endsWith(letter))
    return found?.name || user.building || `Tòa ${letter}`
  }

  return {
    id: user.id,
    fullName: user.fullName || user.name || "",
    email: user.email || "",
    role,
    roleTitle: user.roleTitle || titleFor(role),
    ...(isStudent ? { studentId: user.mssv || user.studentId } : { staffId: user.staffId }),
    phone: user.phone || "",
    citizenId: user.citizenId || "",
    dob: user.dob || "",
    gender: String(user.gender || "").toLowerCase() === "female" ? "female" : "male",
    hometown: user.hometown || "",
    ...(isStudent ? { major: user.major, cohort: user.cohort } : { department: user.department }),
    // Thông tin liên hệ khẩn cấp: trước đây bị bỏ sót nên trang Hồ sơ luôn hiện
    // "Chưa cập nhật" dù dữ liệu đã có sẵn trong db.
    emergencyContact: {
      parentName: user.emergencyContact?.parentName || "",
      relationship: user.emergencyContact?.relationship || "",
      phone: user.emergencyContact?.phone || "",
      address: user.emergencyContact?.address || "",
      ...(user.emergencyContact?.email ? { email: user.emergencyContact.email } : {}),
    },
    ...(isStudent && (user.bedCode || user.room)
      ? {
          dormitoryStatus: {
            building: buildingOfRoom(user.room),
            room: user.room || "",
            compartment: user.compartment || "",
            bedCode: user.bedCode || "",
            contractStart: user.contractStart || "2026-09-01",
            contractEnd: user.contractEnd || "2027-01-15",
            debtStatus: user.previousDebt || 0,
            checkInDate: user.checkInDate || "2026-09-05",
            roomStatus: "OCCUPIED",
          },
        }
      : {}),
    status: user.isSuspended ? "suspended" : "active",
    joinedDate: user.joinedDate || "2024-09-01",
    permissions: permissionsFor(role),
  }
}

function titleFor(role) {
  return {
    student: "Sinh viên lưu trú",
    manager: "Quản lý Ký túc xá",
    technician: "Cán bộ An ninh & Kỹ thuật",
    admin: "Quản trị viên Hệ thống",
  }[role] || role
}

/**
 * POST /api/auth/login
 * body: { email, role } — role: student|manager|technician|admin
 * Quy tắc domain email khớp AuthContext:
 *  - student phải là Gmail cá nhân
 *  - manager/technician/admin phải là @fpt.edu.vn hoặc @fe.edu.vn
 */
router.post(
  "/login",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    const { email, role } = req.body || {}
    const targetRole = String(role || "student").toLowerCase()
    const cleanEmail = String(email || "").trim().toLowerCase()

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: "Thiếu email đăng nhập" })
    }

    const isFptDomain = cleanEmail.endsWith("@fpt.edu.vn") || cleanEmail.endsWith("@fe.edu.vn")
    const isGmailDomain = cleanEmail.endsWith("@gmail.com")

    if (targetRole === "student") {
      if (isFptDomain) {
        return res.status(400).json({
          success: false,
          message:
            "Sinh viên vui lòng đăng nhập bằng Gmail cá nhân đã đăng ký trong hồ sơ tuyển sinh.",
        })
      }
      if (!isGmailDomain) {
        return res.status(400).json({
          success: false,
          message: "Email không hợp lệ. Vui lòng dùng Gmail cá nhân.",
        })
      }
    } else if (!isFptDomain) {
      return res.status(400).json({
        success: false,
        message:
          "Cán bộ / Kỹ thuật / Quản lý phải dùng email tổ chức FPT Education (@fpt.edu.vn hoặc @fe.edu.vn).",
      })
    }

    // Tìm hồ sơ theo email, nếu không có thì dùng hồ sơ mẫu của role.
    const byEmail = find("users", (u) => String(u.email || "").toLowerCase() === cleanEmail)
    const byRole = all("users").find((u) => String(u.role).toLowerCase() === targetRole)
    const user = byEmail || byRole
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ cho vai trò này" })
    }

    const profile = toProfile({ ...user, role: targetRole, email: cleanEmail })
    res.json({
      success: true,
      data: {
        user: profile,
        tokens: issueTokens(profile),
      },
    })
  }),
)

/** POST /api/auth/demo — đăng nhập nhanh theo role (nút demo ở /login). */
router.post(
  "/demo",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    const role = String(req.body?.role || "student").toLowerCase()
    const user = all("users").find((u) => String(u.role).toLowerCase() === role)
    if (!user) {
      return res.status(404).json({ success: false, message: `Không có tài khoản demo cho ${role}` })
    }
    const profile = toProfile(user)
    res.json({ success: true, data: { user: profile, tokens: issueTokens(profile) } })
  }),
)

/** GET /api/auth/me — hồ sơ hiện tại theo token. */
router.get(
  "/me",
  asyncHandler((req, res) => {
    if (!req.actor) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    }
    const user =
      find("users", (u) => u.id === req.actor.id) ||
      all("users").find((u) => String(u.role).toLowerCase() === req.actor.role)
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ" })
    res.json({ success: true, data: toProfile(user) })
  }),
)

/** PUT /api/auth/me — cập nhật liên hệ khẩn cấp & SĐT (ProfilePage). */
router.put(
  "/me",
  asyncHandler((req, res) => {
    if (!req.actor) return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    const user = find("users", (u) => u.id === req.actor.id)
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ" })
    const { phone, emergencyContact } = req.body || {}
    if (phone !== undefined) user.phone = String(phone).trim()
    if (emergencyContact) user.emergencyContact = { ...(user.emergencyContact || {}), ...emergencyContact }
    res.json({ success: true, data: toProfile(user) })
  }),
)

/** Refresh token giả — khớp refreshSession frontend (15 phút). */
router.post(
  "/refresh",
  asyncHandler((req, res) => {
    if (!req.actor) return res.status(401).json({ success: false, message: "Chưa đăng nhập" })
    const role = req.actor.role
    res.json({ success: true, data: { tokens: issueTokens({ role }) } })
  }),
)

function issueTokens(profile) {
  const ttlMs = 15 * 60 * 1000
  const seed = profile.studentId || profile.staffId || profile.id || "demo"
  return {
    accessToken: `jwt_${Buffer.from(`${seed}:${Date.now()}`).toString("base64url")}`,
    refreshToken: `rft_${Math.random().toString(36).slice(2)}`,
    expiresAt: Date.now() + ttlMs,
  }
}

export default router
