/**
 * Route: dashboard quản lý, báo cáo, cấu hình hệ thống.
 * Khớp ManagerDashboardPage.tsx và AdminOverviewView.tsx.
 *
 * Quyền: dashboard:read (manager/admin), report:export, system:configure (admin).
 *
 * Báo cáo dùng chung một hàm dựng dòng cho CẢ endpoint JSON lẫn tệp xuất
 * (xem buildResidentRows / buildDebtRows) để hai đường không bao giờ lệch nhau.
 */
import { Router } from "express"
import { all, find, insert, updateById, nextId } from "../db.js"
import {
  asyncHandler,
  rateLimit,
  cacheGet,
  cacheSet,
  cacheDel,
  enqueueJob,
  getJob,
  getJobArtifact,
  broadcastEvent,
} from "../middleware.js"
import { assertCan } from "../domain/rbac.js"
import { buildMonthlyInvoice } from "../domain/pricing.js"
import { summarizeTickets } from "../domain/ticket.js"
import { summarizeDemerits } from "../domain/curfew.js"
import { publicConfig, WATER_PRICE_PER_M3, ROOM_FEE_PER_STUDENT } from "../config.js"
import { calculateTieredElectricity } from "../domain/pricing.js"
import { buildReportArtifact } from "../domain/report-export.js"

const router = Router()

/** Tổng hợp dữ liệu dashboard — công suất, doanh thu, tiêu thụ, ticket. */
router.get(
  "/overview",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "dashboard:read")
    const cached = cacheGet("dashboard:overview")
    if (cached) return res.json({ success: true, cached: true, data: cached })

    const beds = all("beds")
    const byStatus = beds.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    }, {})
    const totalBeds = beds.length
    const occupiedBeds = byStatus.OCCUPIED || 0
    const occupancy = {
      totalBeds,
      availableBeds: byStatus.AVAILABLE || 0,
      holdingBeds: byStatus.HOLDING || 0,
      occupiedBeds,
      maintenanceBeds: byStatus.MAINTENANCE || 0,
      occupancyRate: totalBeds ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0,
      totalRooms: all("rooms").length,
      totalCompartments: all("compartments").length,
    }

    const invoices = all("invoices")
    const revenueByMonth = new Map()
    for (const inv of invoices) {
      const key = inv.month || "unknown"
      const prev = revenueByMonth.get(key) || { month: key, roomFee: 0, utilityFee: 0, total: 0 }
      prev.roomFee += inv.roomTotal || 0
      prev.utilityFee += (inv.elecCost || 0) + (inv.waterCost || 0) + (inv.sharedFees || 0)
      prev.total += inv.grandTotal || 0
      revenueByMonth.set(key, prev)
    }

    const buildings = all("buildings")
    const consumption = buildings.map((b) => {
      const rooms = all("rooms")
        .filter((r) => all("floors").some((f) => f.id === r.floorId && f.buildingId === b.id))
        .map((r) => r.name)
      const records = all("utilityRecords").filter((u) => rooms.includes(u.room))
      const elecDeltas = records.map((u) => u.elecNew - u.elecOld)
      const waterDeltas = records.map((u) => u.waterNew - u.waterOld)
      const avg = (arr) => (arr.length ? Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)) : 0)
      return {
        building: b.name,
        electricityAvgKwh: avg(elecDeltas),
        waterAvgM3: avg(waterDeltas),
        anomalyNote: records.some((u) => (u.warnings || []).length > 0)
          ? "Có phòng tiêu thụ bất thường"
          : undefined,
      }
    })

    const data = {
      occupancy,
      revenue: Array.from(revenueByMonth.values()),
      consumption,
      tickets: summarizeTickets(all("tickets")),
      invoices: {
        total: invoices.length,
        issued: invoices.filter((i) => i.status === "ISSUED").length,
        paid: invoices.filter((i) => i.status === "PAID").length,
        overdue: invoices.filter((i) => i.status === "OVERDUE").length,
      },
      visitors: {
        total: all("visitors").length,
        checkedIn: all("visitors").filter((v) => v.status === "CHECKED_IN").length,
        overstay: all("visitors").filter((v) => v.status === "OVERSTAY").length,
      },
      generatedAt: new Date().toISOString(),
    }
    cacheSet("dashboard:overview", data, 15_000)
    res.json({ success: true, cached: false, data })
  }),
)

/* ---------- Dựng dòng báo cáo (dùng chung cho JSON và tệp xuất) ---------- */

/**
 * Dựng dòng "danh sách tạm trú" (cho công an địa phương).
 * @returns {object[]} Mỗi dòng đúng shape trả cho frontend.
 */
function buildResidentRows() {
  const beds = all("beds").filter((b) => b.status === "OCCUPIED" && b.studentId)
  return beds.map((bed, idx) => {
    const user =
      find("users", (u) => u.id === bed.studentId) ||
      find("users", (u) => (u.mssv || u.studentId) === bed.studentId)
    const contract = all("contracts").find((c) => c.bedCode === bed.fullCode && c.status === "ACTIVE")
    return {
      stt: idx + 1,
      contractCode: contract?.id || "—",
      fullName: user?.fullName || user?.name || bed.studentId,
      studentId: user?.mssv || user?.studentId || bed.studentId,
      gender: String(user?.gender || "").toUpperCase() === "FEMALE" ? "Nữ" : "Nam",
      citizenId: user?.citizenId || "",
      dob: user?.dob || "",
      hometown: user?.hometown || "",
      phone: user?.phone || "",
      building: "Tòa A",
      room: bed.roomName,
      compartment: bed.compartmentName,
      bedCode: bed.fullCode,
      startDate: contract?.startDate || "2026-09-01",
      endDate: contract?.endDate || "2027-01-15",
      parentName: user?.emergencyContact?.parentName || "",
      parentPhone: user?.emergencyContact?.phone || "",
    }
  })
}

/**
 * Dựng dòng "công nợ quá hạn" từ hóa đơn OVERDUE/ISSUED còn nợ.
 * @param {Date} [today] Mốc tính số ngày quá hạn (để test tất định).
 * @returns {object[]}
 */
function buildDebtRows(today = new Date()) {
  return all("invoices")
    .filter((inv) => inv.status === "OVERDUE" || inv.status === "ISSUED")
    .map((inv, idx) => {
      const studentId = (inv.studentIds || [])[0] || ""
      const user =
        find("users", (u) => (u.mssv || u.studentId) === studentId) ||
        find("users", (u) => u.room === inv.room)
      const due = inv.dueDate ? new Date(inv.dueDate) : null
      const overdueDays = due && today > due ? Math.floor((today - due) / 86400000) : 0
      const roomDebt = inv.roomTotal ? Math.round(inv.roomTotal / (inv.numStudents || 1)) : 0
      const utilityDebt = inv.perStudentUtility || 0
      const totalDebt = roomDebt + utilityDebt
      let status = "QUÁ HẠN 3 NGÀY"
      if (overdueDays >= 30) status = "CẢNH BÁO ĐÌNH CHỈ"
      else if (overdueDays >= 7) status = "QUÁ HẠN 7 NGÀY"
      return {
        stt: idx + 1,
        invoiceCode: inv.invoiceCode || inv.id,
        studentId: user?.mssv || user?.studentId || studentId,
        fullName: user?.fullName || user?.name || "—",
        room: inv.room,
        bedCode: user?.bedCode || "",
        billingPeriod: `Tháng ${inv.month || ""}`,
        roomDebt,
        utilityDebt,
        totalDebt,
        dueDate: inv.dueDate || "",
        overdueDays,
        status,
        phone: user?.phone || "",
      }
    })
    .filter((r) => r.totalDebt > 0)
}

/** Dựng dòng theo `kind`; ném lỗi 400 nếu kind lạ. */
function buildReportRows(kind) {
  if (kind === "residents") return buildResidentRows()
  if (kind === "debts") return buildDebtRows()
  const err = new Error("Loại báo cáo không hợp lệ")
  err.status = 400
  throw err
}

/** Báo cáo danh sách tạm trú (cho công an địa phương). */
router.get(
  "/reports/residents",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "report:export")
    const rows = buildResidentRows()
    res.json({ success: true, data: rows, meta: { count: rows.length } })
  }),
)

/** Báo cáo công nợ quá hạn. */
router.get(
  "/reports/debts",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "report:export")
    const rows = buildDebtRows()
    res.json({ success: true, data: rows, meta: { count: rows.length, total: rows.reduce((s, r) => s + r.totalDebt, 0) } })
  }),
)

/* ---------- Xuất báo cáo (tác vụ nền sinh tệp thật) ---------- */

/** Đường dẫn tải tệp của một tác vụ. */
function downloadUrlFor(jobId) {
  return `/api/dashboard/reports/export/${jobId}/download`
}

/** Shape job trả ra ngoài — thêm downloadUrl, không lộ buffer. */
function presentJob(job) {
  if (!job) return null
  return {
    ...job,
    ...(job.status === "DONE" ? { downloadUrl: downloadUrlFor(job.id) } : {}),
  }
}

/** Giữ nguyên giá trị format hợp lệ, mặc định xlsx. */
function normalizeFormat(format) {
  const f = String(format || "xlsx").toLowerCase()
  return f === "csv" ? "csv" : "xlsx"
}

/**
 * POST /api/dashboard/reports/export — xếp tác vụ xuất báo cáo.
 *
 * body: { kind: "residents"|"debts", format?: "xlsx"|"csv" }
 * Quyền: report:export (manager/admin). Trả ngay job QUEUED kèm downloadUrl
 * khi đã xong; client theo dõi qua GET /reports/export/:jobId.
 */
router.post(
  "/reports/export",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "report:export")
    const kind = req.body?.kind || "residents"
    if (!["residents", "debts"].includes(kind)) {
      return res.status(400).json({ success: false, message: "Loại báo cáo không hợp lệ" })
    }
    const format = normalizeFormat(req.body?.format)
    const rows = buildReportRows(kind)
    const job = enqueueJob(
      `export-${kind}`,
      {
        kind,
        format,
        rowCount: rows.length,
        requestedBy: req.actor?.fullName || req.actor?.role,
      },
      () => buildReportArtifact(rows, kind, format),
    )
    broadcastEvent("JOB_QUEUED", `Đang xuất báo cáo ${kind}`)
    res.json({ success: true, data: presentJob(job) })
  }),
)

/**
 * GET /api/dashboard/reports/export/:jobId — trạng thái tác vụ.
 * Khi DONE kèm downloadUrl, bytes, filename; 404 nếu tác vụ đã bị dọn.
 */
router.get(
  "/reports/export/:jobId",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "report:export")
    const job = getJob(req.params.jobId)
    if (!job) return res.status(404).json({ success: false, message: "Không tìm thấy tác vụ xuất báo cáo" })
    res.json({ success: true, data: presentJob(job) })
  }),
)

/**
 * GET /api/dashboard/reports/export/:jobId/download — tải tệp thật.
 *
 * 404 nếu tác vụ không tồn tại/đã hết hạn, 409 nếu chưa chạy xong.
 * Content-Type lấy từ artifact (.xlsx OOXML hoặc CSV UTF-8).
 */
router.get(
  "/reports/export/:jobId/download",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "report:export")
    const job = getJob(req.params.jobId)
    if (!job) {
      return res.status(404).json({ success: false, message: "Tác vụ không tồn tại hoặc tệp đã hết hạn lưu trữ" })
    }
    if (job.status !== "DONE") {
      return res.status(409).json({
        success: false,
        message: `Tác vụ chưa hoàn tất (trạng thái ${job.status}), vui lòng thử lại sau.`,
      })
    }
    const artifact = getJobArtifact(job.id)
    if (!artifact) {
      return res.status(404).json({ success: false, message: "Tệp của tác vụ đã hết hạn lưu trữ" })
    }
    res.setHeader("Content-Type", artifact.contentType)
    res.setHeader("Content-Length", String(artifact.buffer.length))
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${artifact.filename}"; filename*=UTF-8''${encodeURIComponent(artifact.filename)}`,
    )
    res.end(artifact.buffer)
  }),
)

/* ---------- Cấu hình hệ thống (admin) ---------- */

router.get(
  "/settings",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "system:configure")
    res.json({ success: true, data: { config: publicConfig(), stored: all("configs") } })
  }),
)

router.put(
  "/settings",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "system:configure")
    const patch = req.body || {}
    const cfg = all("configs")[0] || insert("configs", { id: "cfg_pricing", type: "PRICING" })
    const updated = updateById("configs", cfg.id, { ...patch, updatedAt: new Date().toISOString(), updatedBy: req.actor?.fullName })
    cacheDel("dashboard:")
    broadcastEvent("SETTINGS_UPDATED", "Cấu hình hệ thống đã thay đổi")
    res.json({ success: true, data: updated })
  }),
)

/** Công cụ mô phỏng: dựng hóa đơn tháng cho toàn bộ phòng đang có người. */
router.post(
  "/simulate/billing",
  rateLimit("sensitive"),
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "invoice:issue")
    const month = req.body?.month || new Date().toISOString().slice(0, 7)
    const rooms = [...new Set(all("beds").filter((b) => b.status === "OCCUPIED").map((b) => b.roomName))]
    const results = rooms.map((room, idx) => {
      const numStudents = all("beds").filter((b) => b.roomName === room && b.status === "OCCUPIED").length || 1
      const elecOld = 12000 + idx * 100
      const elecNew = elecOld + 150 + idx * 5
      const waterOld = 800 + idx * 2
      const waterNew = waterOld + 12
      return {
        room,
        ...buildMonthlyInvoice({
          room,
          month,
          elecOld,
          elecNew,
          waterOld,
          waterNew,
          roomFeePerStudent: ROOM_FEE_PER_STUDENT,
          wifiFeeTotal: 120000,
          cleaningFeeTotal: 60000,
          numStudents,
        }),
      }
    })
    res.json({
      success: true,
      data: {
        month,
        rooms: results,
        totalRevenue: results.reduce((s, r) => s + r.grandTotal, 0),
        waterPricePerM3: WATER_PRICE_PER_M3,
      },
    })
  }),
)

/** Kiểm tra công thức điện bậc thang (dùng cho QA / test case). */
router.post(
  "/simulate/electricity",
  asyncHandler((req, res) => {
    const kwh = Number(req.body?.kwh ?? 0)
    if (!Number.isFinite(kwh) || kwh < 0) {
      return res.status(400).json({ success: false, message: "kwh không hợp lệ" })
    }
    res.json({ success: true, data: { kwh, cost: calculateTieredElectricity(kwh) } })
  }),
)

/** Bảng điểm rèn luyện toàn KTX. */
router.get(
  "/discipline-summary",
  asyncHandler((req, res) => {
    assertCan(req.actor?.role, "dashboard:read")
    const violations = all("disciplineRecords")
    const students = all("beds")
      .filter((b) => b.status === "OCCUPIED" && b.studentId)
      .map((b) => b.studentId)
    const rows = [...new Set(students)].map((sid) => {
      const user =
        find("users", (u) => u.id === sid) ||
        find("users", (u) => (u.mssv || u.studentId) === sid)
      return summarizeDemerits(
        user?.mssv || user?.studentId || sid,
        user?.fullName || user?.name || sid,
        user?.room || "",
        violations,
      )
    })
    res.json({ success: true, data: rows })
  }),
)

export default router
