import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  MOCK_RESIDENTS_REGISTRY,
  MOCK_OCCUPANCY_STATS,
} from "@/data/mockDashboard"
import { INITIAL_CURFEW_REQUESTS } from "@/data/mockCurfew"
import { INITIAL_MAINTENANCE_TICKETS } from "@/data/mockMaintenance"
import type { CurfewRequest } from "@/types/curfew"
import type { MaintenanceTicket } from "@/types/maintenance"
import type { ResidentTemporaryRecord } from "@/types/dashboard"
import {
  Users,
  FileText,
  Clock,
  Wrench,
  Search,
  Building2,
  ArrowRight,
  ShieldCheck,
  Filter,
  Bed,
  Check,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react"

const STORAGE_KEY_CURFEW_REQS = "dms_curfew_requests_v1"
const STORAGE_KEY_TICKETS = "dms_maintenance_tickets_v1"

export const AdminOverviewView: React.FC = () => {
  const { user } = useAuth()

  // Active view tab
  const [activeTab, setActiveTab] = useState<"STUDENTS" | "REQUESTS">(
    "STUDENTS"
  )

  // Requests state
  const [curfewRequests, setCurfewRequests] = useState<CurfewRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURFEW_REQS)
      return saved ? JSON.parse(saved) : INITIAL_CURFEW_REQUESTS
    } catch {
      return INITIAL_CURFEW_REQUESTS
    }
  })

  const [maintenanceTickets, setMaintenanceTickets] = useState<
    MaintenanceTicket[]
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS)
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TICKETS
    } catch {
      return INITIAL_MAINTENANCE_TICKETS
    }
  })

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Student list search & filter
  const [studentSearch, setStudentSearch] = useState("")
  const [buildingFilter, setBuildingFilter] = useState("ALL")
  const [selectedStudent, setSelectedStudent] =
    useState<ResidentTemporaryRecord | null>(null)

  // Request list filter
  const [requestTypeFilter, setRequestTypeFilter] = useState<
    "ALL" | "CURFEW" | "MAINTENANCE"
  >("ALL")
  const [requestStatusFilter, setRequestStatusFilter] = useState<
    "ALL" | "PENDING" | "RESOLVED"
  >("ALL")

  // Handle Curfew Review
  const handleReviewCurfew = (id: string, status: "APPROVED" | "REJECTED") => {
    const updated = curfewRequests.map((r) =>
      r.id === id
        ? { ...r, status, reviewedBy: user?.fullName || "Quản trị viên DMS" }
        : r
    )
    setCurfewRequests(updated)
    localStorage.setItem(STORAGE_KEY_CURFEW_REQS, JSON.stringify(updated))
    showToast(
      `Đã ${status === "APPROVED" ? "phê duyệt" : "từ chối"} đơn ${id}!`
    )
  }

  // Handle Maintenance Status Update
  const handleUpdateMaintenanceStatus = (
    id: string,
    status: "IN_PROGRESS" | "CLOSED"
  ) => {
    const updated = maintenanceTickets.map((t) =>
      t.id === id ? { ...t, status } : t
    )
    setMaintenanceTickets(updated)
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated))
    showToast(
      `Đã cập nhật phiếu ${id} sang trạng thái ${status === "IN_PROGRESS" ? "Đang xử lý" : "Đã hoàn thành"}!`
    )
  }

  // Filtered Students
  const filteredStudents = MOCK_RESIDENTS_REGISTRY.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.room.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.phone.includes(studentSearch)
    const matchesBuilding =
      buildingFilter === "ALL" || s.building.includes(buildingFilter)
    return matchesSearch && matchesBuilding
  })

  // Pending counts
  const pendingCurfewCount = curfewRequests.filter(
    (r) => r.status === "PENDING"
  ).length
  const pendingMaintenanceCount = maintenanceTickets.filter(
    (t) => t.status === "PENDING"
  ).length
  const totalPendingRequests = pendingCurfewCount + pendingMaintenanceCount

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex animate-in items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Welcome & Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#233944] via-[#2c4755] to-[#1c2e37] p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#cee6ef]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-40 -bottom-20 h-60 w-60 rounded-full bg-sky-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#cee6ef]/20 px-3 py-1 text-xs font-semibold text-[#cee6ef] backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                {user?.roleTitle || "Ban Quản Lý Ký Túc Xá"}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Tổng Quan Điều Hành Quản Trị Ký Túc Xá 👋
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/80">
                Tra cứu danh bạ sinh viên nội trú, giám sát tình trạng lưu trú
                và trực tiếp phê duyệt đơn từ, yêu cầu học viên toàn trường.
              </p>
            </div>
          </div>

          {/* Quick Shortcuts for Admin */}
          <div className="flex shrink-0 flex-wrap items-center gap-2.5 self-start lg:self-center">
            <Link
              to="/manager"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-xs backdrop-blur-md transition-all hover:bg-white/20"
            >
              <Building2 className="h-4 w-4" />
              <span>Bàn Làm Việc </span>
            </Link>

            <Link
              to="/curfew"
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-700"
            >
              <Clock className="h-4 w-4" />
              <span>Cổng Giới Nghiêm</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI 4-Card Grid for Admin */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {/* Card 1: Total Residents */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Sinh Viên Đang Ở
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {MOCK_OCCUPANCY_STATS.occupiedBeds}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                sinh viên
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Chiếm {MOCK_OCCUPANCY_STATS.occupancyRate}% công suất phòng
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
            <span className="text-muted-foreground">Còn trống:</span>
            <span className="font-bold text-emerald-600">
              {MOCK_OCCUPANCY_STATS.availableBeds} Giường
            </span>
          </div>
        </div>

        {/* Card 2: Pending Requests */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Yêu Cầu & Đơn Chờ Duyệt
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-cyan-600">
              {totalPendingRequests}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                hồ sơ
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {pendingCurfewCount} đơn về muộn • {pendingMaintenanceCount} phiếu
              bảo trì
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
            <span className="text-muted-foreground">Ưu tiên:</span>
            <button
              onClick={() => {
                setActiveTab("REQUESTS")
                setRequestStatusFilter("PENDING")
              }}
              className="flex items-center gap-1 font-bold text-cyan-600 hover:underline"
            >
              <span>Xem & Duyệt ngay</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Maintenance in queue */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Sự Cố Kỹ Thuật Đang Xử Lý
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {
                maintenanceTickets.filter((t) => t.status === "IN_PROGRESS")
                  .length
              }{" "}
              <span className="text-sm font-normal text-muted-foreground">
                phiếu đang sửa
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Đội kỹ thuật đang xử lý tại các buồng
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
            <span className="text-muted-foreground">Đã hoàn thành:</span>
            <span className="font-bold text-emerald-600">
              {maintenanceTickets.filter((t) => t.status === "CLOSED").length}{" "}
              phiếu
            </span>
          </div>
        </div>

        {/* Card 4: Curfew & Discipline Status */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Kiểm Soát Giới Nghiêm 23:00
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {curfewRequests.filter((r) => r.status === "APPROVED").length}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                đơn hợp lệ
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Cho phép ra vào ngoài giờ sau 23:00
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
            <span className="text-muted-foreground">Trạng thái cổng:</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Cổng bảo vệ sẵn sàng
            </span>
          </div>
        </div>
      </div>

      {/* Main Switcher: Danh Sách Sinh Viên VS Yêu Cầu, Đơn Từ */}
      <div className="flex max-w-md rounded-2xl border border-border bg-muted/70 p-1.5">
        <button
          onClick={() => setActiveTab("STUDENTS")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === "STUDENTS"
              ? "bg-card font-extrabold text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4 text-blue-600" />
          <span>Danh Sách Sinh Viên ({MOCK_RESIDENTS_REGISTRY.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === "REQUESTS"
              ? "bg-card font-extrabold text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4 text-cyan-600" />
          <span>
            Yêu Cầu & Đơn Từ (
            {curfewRequests.length + maintenanceTickets.length})
          </span>
          {totalPendingRequests > 0 && (
            <span className="py-0.2 ml-1 rounded-full bg-cyan-500 px-1.5 text-[10px] font-black text-white">
              {totalPendingRequests}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: DANH SÁCH SINH VIÊN NỘI TRÚ                    */}
      {/* ========================================================= */}
      {activeTab === "STUDENTS" && (
        <div className="space-y-4">
          {/* Controls: Search and Filter */}
          <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo MSSV, Họ tên, Phòng hoặc Số điện thoại..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2 pr-4 pl-10 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tòa nhà:</span>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium"
              >
                <option value="ALL">Tất cả các tòa</option>
                <option value="Tòa A">Tòa A (Nam - High-Rise)</option>
                <option value="Tòa B">Tòa B (Nữ)</option>
                <option value="Tòa C">Tòa C</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/60 text-[11px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">MSSV</th>
                    <th className="px-4 py-3">Họ và Tên</th>
                    <th className="px-4 py-3">Phòng & Giường</th>
                    <th className="px-4 py-3">Số Điện Thoại</th>
                    <th className="px-4 py-3">Quê Quán</th>
                    <th className="px-4 py-3">Hạn Hợp Đồng</th>
                    <th className="px-4 py-3 text-center">Rèn Luyện</th>
                    <th className="px-4 py-3 text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((st) => (
                    <tr
                      key={st.studentId}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() => setSelectedStudent(st)}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                        {st.studentId}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground">
                          {st.fullName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {st.gender === "Nam" ? "Nam" : "Nữ"} • CCCD:{" "}
                          {st.citizenId}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-bold text-foreground">
                          <Bed className="h-3 w-3 text-blue-600" />
                          {st.room} • {st.bedCode}
                        </span>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {st.building}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">
                          {st.phone}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          PH: {st.parentPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {st.hometown}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {st.endDate}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          100/100 đ
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStudent(st)
                          }}
                          className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          Hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Không tìm thấy sinh viên nào khớp với điều kiện tìm kiếm.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: YÊU CẦU & ĐƠN TỪ CẦN XỬ LÝ                     */}
      {/* ========================================================= */}
      {activeTab === "REQUESTS" && (
        <div className="space-y-4">
          {/* Controls: Filter by Type & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold text-muted-foreground">
                Phân loại:
              </span>
              <button
                type="button"
                onClick={() => setRequestTypeFilter("ALL")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  requestTypeFilter === "ALL"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Tất cả đơn ({curfewRequests.length + maintenanceTickets.length})
              </button>
              <button
                type="button"
                onClick={() => setRequestTypeFilter("CURFEW")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  requestTypeFilter === "CURFEW"
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Đơn Về Muộn / Vắng Mặt ({curfewRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setRequestTypeFilter("MAINTENANCE")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  requestTypeFilter === "MAINTENANCE"
                    ? "bg-sky-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Phiếu Báo Hỏng Bảo Trì ({maintenanceTickets.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                Trạng thái:
              </span>
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value as any)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chỉ đơn chờ duyệt / chưa xử lý</option>
                <option value="RESOLVED">Đã duyệt / Đã hoàn thành</option>
              </select>
            </div>
          </div>

          {/* List of Applications & Requests */}
          <div className="space-y-3">
            {/* 1. Curfew Requests */}
            {(requestTypeFilter === "ALL" || requestTypeFilter === "CURFEW") &&
              curfewRequests
                .filter((r) => {
                  if (requestStatusFilter === "PENDING")
                    return r.status === "PENDING"
                  if (requestStatusFilter === "RESOLVED")
                    return r.status !== "PENDING"
                  return true
                })
                .map((req) => (
                  <div
                    key={req.id}
                    className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-blue-500/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
                          <Clock className="h-3.5 w-3.5" />
                          Đơn Về Muộn
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold">
                          {req.id}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {req.studentName} ({req.studentId})
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • Phòng {req.room}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            req.isSubmittedBefore2100
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-blue-500/10 text-blue-600"
                          }`}
                        >
                          {req.isSubmittedBefore2100
                            ? "Nộp trước 21:00"
                            : "Nộp muộn sau 21:00"}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            req.status === "APPROVED"
                              ? "bg-emerald-600 text-white"
                              : req.status === "REJECTED"
                                ? "bg-blue-600 text-white"
                                : "border border-cyan-500/30 bg-cyan-500/20 text-cyan-700 dark:text-cyan-400"
                          }`}
                        >
                          {req.status === "APPROVED" && "Đã phê duyệt"}
                          {req.status === "REJECTED" && "Đã từ chối"}
                          {req.status === "PENDING" && "Chờ BQL duyệt"}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-foreground">
                      <p className="font-medium">
                        Lý do giải trình:{" "}
                        <span className="font-normal">{req.reasonDetail}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                        <span>
                          Ngày vắng:{" "}
                          <strong className="text-foreground">
                            {req.date}
                          </strong>
                        </span>
                        <span>
                          Giờ về dự kiến:{" "}
                          <strong className="text-foreground">
                            {req.expectedReturnTime}
                          </strong>
                        </span>
                        <span>
                          SĐT liên hệ:{" "}
                          <strong className="text-foreground">
                            {req.phone}
                          </strong>
                        </span>
                        <span>
                          SĐT Phụ huynh xác nhận:{" "}
                          <strong className="text-foreground">
                            {req.parentPhone}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Action buttons for admin */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {req.reviewedBy
                          ? `Người duyệt: ${req.reviewedBy}`
                          : "Chờ ban quản lý ký duyệt trực tuyến"}
                      </span>

                      {req.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleReviewCurfew(req.id, "APPROVED")
                            }
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Duyệt đơn hợp lệ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleReviewCurfew(req.id, "REJECTED")
                            }
                            className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          Thao tác đã hoàn tất
                        </span>
                      )}
                    </div>
                  </div>
                ))}

            {/* 2. Maintenance Tickets */}
            {(requestTypeFilter === "ALL" ||
              requestTypeFilter === "MAINTENANCE") &&
              maintenanceTickets
                .filter((t) => {
                  if (requestStatusFilter === "PENDING")
                    return t.status === "PENDING"
                  if (requestStatusFilter === "RESOLVED")
                    return t.status === "CLOSED"
                  return true
                })
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-sky-500/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-400">
                          <Wrench className="h-3.5 w-3.5" />
                          Phiếu Báo Hỏng
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold">
                          {ticket.id}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {ticket.title}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          ticket.status === "CLOSED"
                            ? "bg-emerald-600 text-white"
                            : ticket.status === "IN_PROGRESS"
                              ? "bg-blue-600 text-white"
                              : "border border-cyan-500/30 bg-cyan-500/20 text-cyan-700 dark:text-cyan-400"
                        }`}
                      >
                        {ticket.status === "PENDING" && "Chờ tiếp nhận"}
                        {ticket.status === "IN_PROGRESS" &&
                          "Đang điều phối sửa"}
                        {ticket.status === "CLOSED" && "Đã sửa xong"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap gap-4 rounded-xl border border-border/60 bg-muted/40 p-2.5 text-[11px]">
                      <span>
                        Vị trí:{" "}
                        <strong className="text-foreground">
                          {ticket.building} - Phòng {ticket.room}
                        </strong>
                      </span>
                      <span>
                        Người báo:{" "}
                        <strong className="text-foreground">
                          {ticket.studentName} ({ticket.studentId})
                        </strong>
                      </span>
                      <span>
                        Thời gian:{" "}
                        <span className="font-mono">{ticket.createdAt}</span>
                      </span>
                      <span>
                        Mức độ:{" "}
                        <strong className="text-blue-600">
                          {ticket.urgency}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        to="/maintenance"
                        className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
                      >
                        <span>Mở phân hệ Điều phối Kỹ thuật</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {ticket.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateMaintenanceStatus(
                              ticket.id,
                              "IN_PROGRESS"
                            )
                          }
                          className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-sky-700"
                        >
                          Tiếp nhận xử lý
                        </button>
                      )}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg animate-in space-y-5 rounded-3xl border border-border bg-card p-6 shadow-2xl zoom-in-95 fade-in">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Hồ Sơ Sinh Viên Lưu Trú
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    MSSV: {selectedStudent.studentId} • Hợp đồng:{" "}
                    {selectedStudent.contractCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/40 p-3">
                <div>
                  <span className="text-muted-foreground">Họ và tên:</span>
                  <p className="mt-0.5 text-sm font-bold text-foreground">
                    {selectedStudent.fullName}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Giới tính & Ngày sinh:
                  </span>
                  <p className="mt-0.5 font-semibold text-foreground">
                    {selectedStudent.gender} • {selectedStudent.dob}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Số CCCD / CMND:</span>
                  <p className="mt-0.5 font-mono font-semibold text-foreground">
                    {selectedStudent.citizenId}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quê quán:</span>
                  <p className="mt-0.5 font-semibold text-foreground">
                    {selectedStudent.hometown}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-blue-500/15 bg-blue-500/5 p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vị trí lưu trú:</span>
                  <strong className="text-foreground">
                    {selectedStudent.building} • Phòng {selectedStudent.room}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Mã giường cá nhân:
                  </span>
                  <span className="font-mono font-bold text-blue-600">
                    {selectedStudent.bedCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Thời hạn hợp đồng:
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {selectedStudent.startDate} ➔ {selectedStudent.endDate}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 rounded-2xl border border-border bg-muted/40 p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Số điện thoại sinh viên:
                  </span>
                  <strong className="text-foreground">
                    {selectedStudent.phone}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Họ tên phụ huynh:
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedStudent.parentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SĐT Phụ huynh:</span>
                  <strong className="text-foreground">
                    {selectedStudent.parentPhone}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl bg-foreground px-4 py-2 text-xs font-bold text-background"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
