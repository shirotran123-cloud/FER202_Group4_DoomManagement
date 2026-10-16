/**
 * DMS backend — điểm vào duy nhất.
 *
 * Chạy: npm run server        (mặc định :3001)
 *       PORT=3101 node server/index.js
 *
 * Kiến trúc:
 *   server/config.js       hằng số nghiệp vụ dùng chung
 *   server/db.js           store JSON (đọc đồng bộ, ghi atomic + debounce)
 *   server/middleware.js   CORS, security, rate limit, cache, SSE, actor
 *   server/domain/*        luật nghiệp vụ thuần (pricing, curfew, ticket, booking, visitor, rbac)
 *   server/routes/*        REST khớp shape frontend
 */
import express from "express"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { load, saveNow, all } from "./db.js"
import {
  cors,
  securityHeaders,
  rateLimit,
  sseHandler,
  sseClientCount,
  attachActor,
  notFound,
  errorHandler,
} from "./middleware.js"
import { publicConfig } from "./config.js"

import authRoutes from "./routes/auth.js"
import billingRoutes from "./routes/billing.js"
import ticketRoutes from "./routes/tickets.js"
import bookingRoutes from "./routes/bookings.js"
import curfewRoutes from "./routes/curfew.js"
import visitorRoutes from "./routes/visitors.js"
import communityRoutes from "./routes/community.js"
import dashboardRoutes from "./routes/dashboard.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 3001)

const app = express()
app.disable("x-powered-by")
app.set("trust proxy", true)

app.use(cors)
app.use(securityHeaders)
app.use(express.json({ limit: "8mb" }))
app.use(attachActor)

/* ---------- Nhịp tim & realtime ---------- */
app.get("/api/health", (req, res) => {
  const data = load()
  res.json({
    ok: true,
    service: "dms-backend",
    version: "2.0.0",
    time: new Date().toISOString(),
    sseClients: sseClientCount(),
    collections: Object.keys(data).length,
    counts: {
      users: data.users?.length || 0,
      beds: data.beds?.length || 0,
      tickets: data.tickets?.length || 0,
      invoices: data.invoices?.length || 0,
      visitors: data.visitors?.length || 0,
    },
  })
})

app.get("/api/events", sseHandler)

/** Cấu hình công khai cho frontend (biểu giá, giới nghiêm, mô hình 1:4:6). */
app.get("/api/config", (req, res) => res.json({ success: true, data: publicConfig() }))

/* ---------- Nghiệp vụ theo phân hệ ---------- */
app.use("/api/auth", authRoutes)
app.use("/api/billing", billingRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/dorm", bookingRoutes)
app.use("/api/curfew", curfewRoutes)
app.use("/api/visitors", visitorRoutes)
app.use("/api/community", communityRoutes)
app.use("/api/dashboard", dashboardRoutes)

/* ---------- Tra cứu nhanh dùng chung (read-only) ---------- */
app.get(
  "/api/users",
  rateLimit("public"),
  (req, res) => {
    const { role, room } = req.query
    let rows = all("users")
    if (role) rows = rows.filter((u) => String(u.role).toLowerCase() === String(role).toLowerCase())
    if (room) rows = rows.filter((u) => u.room === room)
    // Không trả thông tin định danh nhạy cảm cho người chưa xác thực.
    const safe = rows.map((u) => ({
      id: u.id,
      fullName: u.fullName || u.name,
      role: String(u.role).toLowerCase(),
      studentId: u.mssv || u.studentId,
      staffId: u.staffId,
      room: u.room,
      bedCode: u.bedCode,
      email: req.actor ? u.email : undefined,
    }))
    res.json({ success: true, data: safe })
  },
)

app.get(
  "/api/buildings",
  rateLimit("public"),
  (req, res) => res.json({ success: true, data: all("buildings") }),
)

app.get(
  "/api/rooms",
  rateLimit("public"),
  (req, res) => {
    const { buildingId } = req.query
    let rows = all("rooms")
    if (buildingId) {
      const floorIds = all("floors").filter((f) => f.buildingId === buildingId).map((f) => f.id)
      rows = rows.filter((r) => floorIds.includes(r.floorId))
    }
    res.json({ success: true, data: rows })
  },
)

/** Tóm tắt công suất (cache 30s). */
app.get(
  "/api/rooms/summary",
  rateLimit("public"),
  async (req, res) => {
    const beds = all("beds")
    const byStatus = beds.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    }, {})
    res.json({ success: true, data: { totalBeds: beds.length, byStatus, at: new Date().toISOString() } })
  },
)

/* ---------- 404 & xử lý lỗi ---------- */
app.use(notFound)
app.use(errorHandler)

/* ---------- Khởi động ---------- */
load()
const server = app.listen(PORT, () => {
  console.log(`DMS backend v2 chạy tại http://localhost:${PORT}`)
  console.log(`  Healthcheck : http://localhost:${PORT}/api/health`)
  console.log(`  Config      : http://localhost:${PORT}/api/config`)
  console.log(`  Frontend proxy /api -> cổng này`)
})

function shutdown(signal) {
  console.log(`\n[${signal}] đang lưu db.json và tắt server...`)
  try {
    saveNow()
  } catch (err) {
    console.error("Lưu db.json thất bại:", err.message)
  }
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 3000).unref()
}
process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))

export default app
