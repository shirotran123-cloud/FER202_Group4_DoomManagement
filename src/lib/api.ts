/**
 * API client frontend ↔ backend DMS.
 *
 * Nguyên tắc:
 *  - Frontend gọi qua proxy Vite `/api` nên không cần cấu hình cổng khi dev.
 *  - Vai trò gửi bằng header `X-Demo-Role` (dữ liệu demo, không có mật khẩu).
 *  - Mọi hàm trả về dữ liệu đã bóc `{ success, data }` và ném lỗi kèm thông điệp
 *    tiếng Việt từ backend để UI hiển thị thẳng.
 *  - Có timeout, nên UI không treo khi backend tắt.
 */
import type { UserProfile, UserRole } from "@/types/auth"

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api"
const TIMEOUT_MS = 12_000

export class ApiError extends Error {
  status: number
  details?: string[]
  constructor(message: string, status: number, details?: string[]) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

/** Đọc vai trò đang đăng nhập từ localStorage (nguồn giữ phiên của AuthContext). */
function currentRole(): UserRole | null {
  try {
    const raw = localStorage.getItem("dms_auth_user_session")
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserProfile
    return parsed?.role ?? null
  } catch {
    return null
  }
}

/** Đọc token truy cập nếu có. */
function currentToken(): string | null {
  try {
    const raw = localStorage.getItem("dms_auth_tokens_session")
    if (!raw) return null
    const parsed = JSON.parse(raw) as { accessToken?: string }
    return parsed?.accessToken ?? null
  } catch {
    return null
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  /** Ghi đè vai trò, dùng khi test hoặc khi chưa đăng nhập. */
  role?: UserRole | null
  /** Bỏ qua việc bóc `{ success, data }`, trả nguyên phản hồi. */
  raw?: boolean
  signal?: AbortSignal
}

export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, role, raw, signal } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  // Nếu caller truyền signal riêng thì hủy theo cả hai.
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true })

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const effectiveRole = role === undefined ? currentRole() : role
  if (effectiveRole) headers["X-Demo-Role"] = effectiveRole
  const token = currentToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if ((err as Error).name === "AbortError") {
      throw new ApiError("Máy chủ phản hồi quá lâu. Vui lòng thử lại.", 408)
    }
    throw new ApiError("Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.", 0)
  }
  clearTimeout(timer)

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  if (!res.ok) {
    const obj = payload as { message?: string; details?: string[] } | null
    throw new ApiError(obj?.message || `Yêu cầu thất bại (HTTP ${res.status})`, res.status, obj?.details)
  }

  if (raw) return payload as T
  const wrapped = payload as { success?: boolean; data?: T } | null
  return (wrapped?.data ?? (payload as T)) as T
}

/* ==================== Xác thực & hồ sơ ==================== */

export const authApi = {
  /** Đăng nhập Google (backend kiểm tra domain email). */
  login: (email: string, role: UserRole) =>
    request<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string; expiresAt: number } }>(
      "/auth/login",
      { method: "POST", body: { email, role }, role: null },
    ),
  /** Đăng nhập nhanh theo vai trò (nút demo). */
  demo: (role: UserRole) =>
    request<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string; expiresAt: number } }>(
      "/auth/demo",
      { method: "POST", body: { role }, role: null },
    ),
  me: () => request<UserProfile>("/auth/me"),
  updateMe: (patch: { phone?: string; emergencyContact?: Record<string, string> }) =>
    request<UserProfile>("/auth/me", { method: "PUT", body: patch }),
  refresh: () => request<{ tokens: { accessToken: string; refreshToken: string; expiresAt: number } }>("/auth/refresh", { method: "POST" }),
}

/* ==================== Đặt giường & hợp đồng ==================== */

export const dormApi = {
  inventory: () => request<unknown[]>("/dorm/inventory"),
  beds: (params?: { room?: string; status?: string }) =>
    request<unknown[]>(`/dorm/beds${toQuery(params)}`),
  holdBed: (bedCode: string) => request<{ id: string; secondsLeft: number }>("/dorm/holds", { method: "POST", body: { bedCode } }),
  currentHold: () => request<{ id: string; secondsLeft: number } | null>("/dorm/holds/current"),
  releaseHold: (id: string) => request<{ id: string }>(`/dorm/holds/${id}`, { method: "DELETE" }),
  createBooking: (bedCode: string, paymentMethod = "vietqr") =>
    request<unknown>("/dorm/bookings", { method: "POST", body: { bedCode, paymentMethod } }),
  payBooking: (id: string) => request<unknown>(`/dorm/bookings/${id}/pay`, { method: "POST" }),
  bookings: () => request<unknown[]>("/dorm/bookings"),
  approveBooking: (id: string) => request<unknown>(`/dorm/bookings/${id}/approve`, { method: "POST" }),
  rejectBooking: (id: string, reason?: string) =>
    request<unknown>(`/dorm/bookings/${id}/reject`, { method: "POST", body: { reason } }),
  contracts: () => request<unknown[]>("/dorm/contracts"),
  requestRoomSwitch: (fromRoom: string, toRoom: string, reason: string) =>
    request<unknown>("/dorm/room-switches", { method: "POST", body: { fromRoom, toRoom, reason } }),
  roomSwitches: () => request<unknown[]>("/dorm/room-switches"),
  decideRoomSwitch: (id: string, approve: boolean, notes?: string) =>
    request<unknown>(`/dorm/room-switches/${id}/decide`, { method: "POST", body: { approve, notes } }),
  checkout: (studentId: string, damages: { name: string; cost: number }[], deposit?: number, unpaidBills = 0) =>
    request<{ deposit: number; damageTotal: number; deduction: number; refund: number }>("/dorm/checkout", {
      method: "POST",
      body: { studentId, damages, deposit, unpaidBills },
    }),

  /* ---------- Đơn xin trả phòng ---------- */

  /** Nộp đơn xin trả phòng (sinh viên). Lưu thật trên máy chủ để BQL thấy được. */
  createCheckoutRequest: (input: {
    reason?: string
    expectedLeaveDate?: string
    deposit?: number
    damages?: { name: string; cost: number }[]
    unpaidBills?: number
  }) => request<CheckoutRequest>("/dorm/checkout-requests", { method: "POST", body: input }),

  /** Danh sách đơn trả phòng: sinh viên thấy đơn của mình, quản lý thấy tất cả. */
  checkoutRequests: () => request<CheckoutRequest[]>("/dorm/checkout-requests"),

  /** Duyệt / từ chối đơn trả phòng (quản lý/admin). Duyệt thì quyết toán luôn. */
  decideCheckoutRequest: (id: string, approve: boolean, notes?: string) =>
    request<CheckoutRequest>(`/dorm/checkout-requests/${id}/decide`, {
      method: "POST",
      body: { approve, notes },
    }),
}

/** Một đơn xin trả phòng (check-out) của sinh viên. */
export interface CheckoutRequest {
  id: string
  studentId: string
  studentName: string
  room: string
  bedCode: string
  reason: string
  expectedLeaveDate: string
  deposit: number
  deduction: number
  refund: number
  damages: { name: string; cost: number }[]
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNotes: string
}

/* ==================== Điện nước ==================== */

export const billingApi = {
  invoices: (params?: { room?: string; studentId?: string }) =>
    request<unknown[]>(`/billing/invoices${toQuery(params)}`),
  invoice: (id: string) => request<unknown>(`/billing/invoices/${id}`),
  calculate: (input: Record<string, number | string>) =>
    request<unknown>("/billing/calculate", { method: "POST", body: input }),
  issue: (input: Record<string, unknown>) => request<unknown>("/billing/issue", { method: "POST", body: input }),
  payInvoice: (id: string, amount?: number) =>
    request<unknown>(`/billing/invoices/${id}/pay`, { method: "POST", body: { amount } }),
  dispute: (id: string, reason: string) =>
    request<unknown>(`/billing/invoices/${id}/dispute`, { method: "POST", body: { reason } }),
  utilityRecords: (room?: string) => request<unknown[]>(`/billing/utility-records${toQuery({ room })}`),
  reconcile: (input: { expectedAmount: number; expectedContent: string; actualAmount: number; actualContent: string }) =>
    request<{ matched: boolean; reason: string }>("/billing/reconcile", { method: "POST", body: input }),
}

/* ==================== Báo hỏng ==================== */

export const ticketApi = {
  list: (params?: { status?: string; urgency?: string; scope?: string; room?: string }) =>
    request<unknown[]>(`/tickets${toQuery(params)}`),
  get: (id: string) => request<unknown>(`/tickets/${id}`),
  stats: () => request<Record<string, number>>("/tickets/stats"),
  create: (input: Record<string, unknown>) => request<unknown>("/tickets", { method: "POST", body: input }),
  update: (id: string, patch: Record<string, unknown>) => request<unknown>(`/tickets/${id}`, { method: "PUT", body: patch }),
  remove: (id: string) => request<{ id: string }>(`/tickets/${id}`, { method: "DELETE" }),
  transition: (id: string, to: string, extra: Record<string, unknown> = {}) =>
    request<unknown>(`/tickets/${id}/transition`, { method: "POST", body: { to, ...extra } }),
  review: (id: string, rating: number, comment: string) =>
    request<unknown>(`/tickets/${id}/review`, { method: "POST", body: { rating, comment } }),
}

/* ==================== Giới nghiêm ==================== */

/** Kết quả một lượt quét cổng (POST /api/curfew/gate/scan). */
export interface GateScanResult {
  log: Record<string, unknown>
  discipline: Record<string, unknown> | null
  demerit: Record<string, unknown> | null
  status: "ON_TIME" | "APPROVED_LATE" | "UNAUTHORIZED_LATE"
  /** Thông tin mã QR đã xác thực ở backend; `null` khi quét bằng MSSV nhập tay. */
  qr: { issuedAt: string; ageMinutes: number } | null
}

/** Tham số quét cổng bằng mã QR (`DMS-GATE|<MSSV>|<issuedAt>`). */
export interface GateScanInput {
  /** Ưu tiên: payload QR thô; backend tự bóc và kiểm hạn dùng (5 phút). */
  qrPayload?: string
  /** Đường cũ: nhập tay MSSV khi không quét được mã. */
  studentId?: string
  scanHour: number
  /** `YYYY-MM-DD`; mặc định hôm nay. Dùng để đối chiếu đơn về muộn theo ngày. */
  scanDate?: string
  guardName?: string
  matchedRequestId?: string
}

export const curfewApi = {
  requests: (status?: string) => request<unknown[]>(`/curfew/requests${toQuery({ status })}`),
  createRequest: (input: Record<string, unknown>) => request<unknown>("/curfew/requests", { method: "POST", body: input }),
  decide: (id: string, approve: boolean, notes?: string) =>
    request<unknown>(`/curfew/requests/${id}/decide`, { method: "POST", body: { approve, notes } }),
  /**
   * Quét cổng. Truyền `qrPayload` để backend xác thực mã QR (khuyến nghị), hoặc
   * `studentId` khi bảo vệ nhập tay MSSV.
   */
  scan: (input: GateScanInput) => request<GateScanResult>("/curfew/gate/scan", { method: "POST", body: input }),
  /** Tương thích ngược: quét theo chữ ký cũ (studentId, scanHour, guardName). */
  scanLegacy: (studentId: string, scanHour: number, guardName?: string) =>
    request<GateScanResult>("/curfew/gate/scan", { method: "POST", body: { studentId, scanHour, guardName } }),
  /** Tiện ích: quét thẳng bằng payload QR thô. */
  scanQr: (qrPayload: string, scanHour: number, extra: Omit<GateScanInput, "qrPayload" | "scanHour"> = {}) =>
    request<GateScanResult>("/curfew/gate/scan", {
      method: "POST",
      body: { qrPayload, scanHour, ...extra },
    }),
  gateLogs: (params?: { studentId?: string; date?: string }) => request<unknown[]>(`/curfew/gate/logs${toQuery(params)}`),
  overdue: (hour?: number) => request<string[]>(`/curfew/gate/overdue${toQuery({ hour })}`),
  discipline: () => request<unknown[]>("/curfew/discipline"),
  createDiscipline: (input: Record<string, unknown>) => request<unknown>("/curfew/discipline", { method: "POST", body: input }),
  demerits: () => request<unknown[]>("/curfew/demerits"),
  config: () => request<Record<string, unknown>>("/curfew/config"),
}

/* ==================== Khách thăm ==================== */

export const visitorApi = {
  list: (status?: string) => request<unknown[]>(`/visitors${toQuery({ status })}`),
  create: (fullName: string, citizenId: string) =>
    request<unknown>("/visitors", { method: "POST", body: { fullName, citizenId } }),
  checkIn: (id: string) => request<unknown>(`/visitors/${id}/check-in`, { method: "POST" }),
  checkOut: (id: string) => request<unknown>(`/visitors/${id}/check-out`, { method: "POST" }),
  overstaying: () => request<unknown[]>("/visitors/overstaying"),
  cancel: (id: string) => request<{ id: string }>(`/visitors/${id}`, { method: "DELETE" }),
}

/* ==================== Cộng đồng ==================== */

export const communityApi = {
  notices: (activeOnly = false) => request<unknown[]>(`/community/notices${toQuery({ active: activeOnly ? "true" : undefined })}`),
  publishNotice: (input: { title: string; body: string; audience?: string; startsAt?: string; endsAt?: string }) =>
    request<unknown>("/community/notices", { method: "POST", body: input }),
  deleteNotice: (id: string) => request<{ id: string }>(`/community/notices/${id}`, { method: "DELETE" }),
  marketplace: (sellerId?: string) => request<unknown[]>(`/community/marketplace${toQuery({ sellerId })}`),
  createListing: (input: { title: string; price: number; category?: string; photoIds?: string[] }) =>
    request<unknown>("/community/marketplace", { method: "POST", body: input }),
  markSold: (id: string) => request<unknown>(`/community/marketplace/${id}/sold`, { method: "POST" }),
  removeListing: (id: string) => request<{ id: string }>(`/community/marketplace/${id}`, { method: "DELETE" }),
  lostFound: () => request<unknown[]>("/community/lost-found"),
  createLostFound: (input: { kind: "LOST" | "FOUND"; item: string; location?: string; photoIds?: string[] }) =>
    request<unknown>("/community/lost-found", { method: "POST", body: input }),
  claimLostFound: (id: string) => request<unknown>(`/community/lost-found/${id}/claim`, { method: "POST" }),
  /**
   * Thông báo của CHÍNH người đang đăng nhập.
   *
   * Dùng `raw: true` vì cần cả `meta.unreadCount` — đó là căn cứ để hiện chấm đỏ,
   * thay cho việc luôn hiện chấm đỏ như trước.
   */
  notifications: () =>
    request<NotificationsPayload>("/community/notifications", { raw: true }),
  /** Đánh dấu đã đọc một thông báo (`id`) hoặc tất cả (`all: true`). */
  markNotificationsRead: (input: { id?: string; all?: boolean }) =>
    request<NotificationsPayload>("/community/notifications/read", {
      method: "POST",
      body: input,
      raw: true,
    }),
}

/** Một thông báo hệ thống gửi tới người đang đăng nhập. */
export interface AppNotification {
  id: string
  title: string
  body: string
  kind: "INVOICE" | "CURFEW" | "TICKET" | "CONTRACT" | "SYSTEM"
  at: string
  room?: string | null
  read: boolean
}

/** Phản hồi của hai endpoint thông báo, kèm số chưa đọc. */
export interface NotificationsPayload {
  success: boolean
  data: AppNotification[]
  meta: { unreadCount: number; total: number; updated?: number }
}

/* ==================== Dashboard & hệ thống ==================== */

/** Loại báo cáo xuất được. */
export type ReportKind = "residents" | "debts"
/** Định dạng tệp xuất: `.xlsx` (OOXML thật) hoặc `.csv` (UTF-8 kèm BOM). */
export type ReportFormat = "xlsx" | "csv"

/**
 * Tác vụ xuất báo cáo chạy nền.
 *
 * Vòng đời `status`: `QUEUED` → `RUNNING` → `DONE` | `FAILED`.
 * Tác vụ đã kết thúc bị dọn khỏi bộ nhớ sau ~10 phút (`expiresAt`), sau đó
 * `downloadUrl` trả 404 — client nên tải ngay khi thấy `DONE`.
 */
export interface ExportJob {
  id: string
  type: string
  status: "QUEUED" | "RUNNING" | "DONE" | "FAILED"
  payload?: Record<string, unknown>
  createdAt: string
  startedAt: string | null
  finishedAt: string | null
  expiresAt: string | null
  filename: string | null
  contentType: string | null
  bytes: number
  error: string | null
  /** Chỉ có khi `status === "DONE"` — đường dẫn tải tệp thật. */
  downloadUrl?: string
}

export const dashboardApi = {
  overview: () => request<Record<string, unknown>>("/dashboard/overview"),
  residents: () => request<unknown[]>("/dashboard/reports/residents"),
  debts: () => request<unknown[]>("/dashboard/reports/debts"),
  exportReport: (kind: ReportKind, format: ReportFormat = "xlsx") =>
    request<ExportJob>("/dashboard/reports/export", { method: "POST", body: { kind, format } }),
  exportStatus: (jobId: string) => request<ExportJob>(`/dashboard/reports/export/${jobId}`),
  /** URL tải tệp (ghép thẳng vào href/`window.open`; backend đã set Content-Disposition). */
  exportDownloadUrl: (jobId: string) => `${BASE}/dashboard/reports/export/${jobId}/download` as string,
  settings: () => request<Record<string, unknown>>("/dashboard/settings"),
  updateSettings: (patch: Record<string, unknown>) => request<unknown>("/dashboard/settings", { method: "PUT", body: patch }),
  simulateBilling: (month?: string) => request<Record<string, unknown>>("/dashboard/simulate/billing", { method: "POST", body: { month } }),
  simulateElectricity: (kwh: number) => request<{ kwh: number; cost: number }>("/dashboard/simulate/electricity", { method: "POST", body: { kwh } }),
  disciplineSummary: () => request<unknown[]>("/dashboard/discipline-summary"),
}

/* ==================== Tiện ích ==================== */

export const systemApi = {
  health: () => request<{ ok: boolean; version: string; counts: Record<string, number> }>("/health", { raw: false }),
  config: () => request<Record<string, unknown>>("/config"),
  users: (params?: { role?: string; room?: string }) => request<unknown[]>(`/users${toQuery(params)}`),
  buildings: () => request<unknown[]>("/buildings"),
  rooms: (buildingId?: string) => request<unknown[]>(`/rooms${toQuery({ buildingId })}`),
  roomSummary: () => request<{ totalBeds: number; byStatus: Record<string, number> }>("/rooms/summary"),
}

/* ==================== Nội bộ ==================== */

function toQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return ""
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  if (entries.length === 0) return ""
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))
  return `?${search.toString()}`
}

/**
 * Kiểm tra backend có sống không, dùng để hiện banner cảnh báo trong UI.
 * Không ném lỗi — trả false nếu không kết nối được.
 */
export async function isBackendUp(): Promise<boolean> {
  try {
    const health = await systemApi.health()
    return health?.ok === true
  } catch {
    return false
  }
}
