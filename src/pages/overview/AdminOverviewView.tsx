import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { MOCK_RESIDENTS_REGISTRY, MOCK_OCCUPANCY_STATS } from "@/data/mockDashboard"
import { INITIAL_CURFEW_REQUESTS } from "@/data/mockCurfew"
import { INITIAL_MAINTENANCE_TICKETS } from "@/data/mockMaintenance"
import type { CurfewRequest } from "@/types/curfew"
import type { MaintenanceTicket } from "@/types/maintenance"
import type { ResidentTemporaryRecord } from "@/types/dashboard"
import { Users, FileText, Clock, Wrench, Search, Building2, ArrowRight, ShieldCheck, Filter, BedDouble, Check, X, Sparkles, ExternalLink } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
const STORAGE_KEY_CURFEW_REQS = "dms_curfew_requests_v1"
const STORAGE_KEY_TICKETS = "dms_maintenance_tickets_v1"

export const AdminOverviewView: React.FC = () => {
  const { user } = useAuth()

  // Active view tab
  const [activeTab, setActiveTab] = useState<"STUDENTS" | "REQUESTS">("STUDENTS")

  // Requests state
  const [curfewRequests, setCurfewRequests] = useState<CurfewRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURFEW_REQS)
      return saved ? JSON.parse(saved) : INITIAL_CURFEW_REQUESTS
    } catch {
      return INITIAL_CURFEW_REQUESTS
    }
  })

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
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
  const [selectedStudent, setSelectedStudent] = useState<ResidentTemporaryRecord | null>(null)

  // Request list filter
  const [requestTypeFilter, setRequestTypeFilter] = useState<"ALL" | "CURFEW" | "MAINTENANCE">("ALL")
  const [requestStatusFilter, setRequestStatusFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL")

  // Handle Curfew Review
  const handleReviewCurfew = (id: string, status: "APPROVED" | "REJECTED") => {
    const updated = curfewRequests.map((r) =>
      r.id === id ? { ...r, status, reviewedBy: user?.fullName || "Quản trị viên DMS" } : r
    )
    setCurfewRequests(updated)
    localStorage.setItem(STORAGE_KEY_CURFEW_REQS, JSON.stringify(updated))
    showToast(`Đã ${status === "APPROVED" ? "phê duyệt" : "từ chối"} đơn ${id}!`)
  }

  // Handle Maintenance Status Update
  const handleUpdateMaintenanceStatus = (id: string, status: "IN_PROGRESS" | "CLOSED") => {
    const updated = maintenanceTickets.map((t) =>
      t.id === id ? { ...t, status } : t
    )
    setMaintenanceTickets(updated)
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated))
    showToast(`Đã cập nhật phiếu ${id} sang trạng thái ${status === "IN_PROGRESS" ? "Đang xử lý" : "Đã hoàn thành"}!`)
  }

  // Filtered Students
  const filteredStudents = MOCK_RESIDENTS_REGISTRY.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.room.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.phone.includes(studentSearch)
    const matchesBuilding = buildingFilter === "ALL" || s.building.includes(buildingFilter)
    return matchesSearch && matchesBuilding
  })

  // Pending counts
  const pendingCurfewCount = curfewRequests.filter((r) => r.status === "PENDING").length
  const pendingMaintenanceCount = maintenanceTickets.filter((t) => t.status === "PENDING").length
  const totalPendingRequests = pendingCurfewCount + pendingMaintenanceCount

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-foreground text-background px-4 py-3 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Welcome & Header Banner */}
      <div className="dms-card p-6 sm:p-8">

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Quản Trị Viên Hệ Thống DMS
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono">
                Vai trò: {user?.roleTitle || "Ban Quản Lý & Admin Toàn Quyền"}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Tổng Quan Điều Hành Ký Túc Xá
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Tra cứu danh bạ sinh viên nội trú, giám sát tình trạng lưu trú và trực tiếp phê duyệt đơn từ, yêu cầu học viên toàn trường.
              </p>
            </div>
          </div>

          {/* Quick Shortcuts for Admin */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            <Link
              to="/manager"
              className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-foreground text-xs font-semibold flex items-center gap-2 border border-border transition-all shadow-xs"
            >
              <Building2 className="h-4 w-4" />
              <span>Bàn Làm Việc Ops</span>
            </Link>

            <Link
              to="/curfew"
              className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-xs font-bold text-background shadow-sm transition-all hover:opacity-90"
            >
              <Clock className="h-4 w-4" />
              <span>Cổng Giới Nghiêm 23h</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI 4-Card Grid for Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Residents */}
        <div className="rounded-2xl bg-card p-5 sm:p-6 shadow-xs border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                Sinh Viên Đang Ở
              </span>
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {MOCK_OCCUPANCY_STATS.occupiedBeds} <span className="text-sm font-normal text-muted-foreground">sinh viên</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Chiếm {MOCK_OCCUPANCY_STATS.occupancyRate}% công suất phòng
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Còn trống:</span>
            <span className="font-bold text-success-soft-foreground">{MOCK_OCCUPANCY_STATS.availableBeds} Giường</span>
          </div>
        </div>

        {/* Card 2: Pending Requests */}
        <div className="rounded-2xl bg-card p-5 sm:p-6 shadow-xs border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                Yêu Cầu & Đơn Chờ Duyệt
              </span>
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {totalPendingRequests} <span className="text-sm font-normal text-muted-foreground">hồ sơ</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {pendingCurfewCount} đơn về muộn • {pendingMaintenanceCount} phiếu bảo trì
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Ưu tiên:</span>
            <button
              onClick={() => {
                setActiveTab("REQUESTS")
                setRequestStatusFilter("PENDING")
              }}
              className="font-bold text-primary-soft-foreground hover:underline flex items-center gap-1"
            >
              <span>Xem & Duyệt ngay</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Maintenance in queue */}
        <div className="rounded-2xl bg-card p-5 sm:p-6 shadow-xs border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                Sự Cố Kỹ Thuật Đang Xử Lý
              </span>
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {maintenanceTickets.filter((t) => t.status === "IN_PROGRESS").length}{" "}
              <span className="text-sm font-normal text-muted-foreground">phiếu đang sửa</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Đội kỹ thuật đang xử lý tại các buồng
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Đã hoàn thành:</span>
            <span className="font-bold text-success-soft-foreground">
              {maintenanceTickets.filter((t) => t.status === "CLOSED").length} phiếu
            </span>
          </div>
        </div>

        {/* Card 4: Curfew & Discipline Status */}
        <div className="rounded-2xl bg-card p-5 sm:p-6 shadow-xs border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                Kiểm Soát Giới Nghiêm 23:00
              </span>
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {curfewRequests.filter((r) => r.status === "APPROVED").length}{" "}
              <span className="text-sm font-normal text-muted-foreground">đơn hợp lệ</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Cho phép ra vào ngoài giờ sau 23:00
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Trạng thái cổng:</span>
            <span className="font-bold text-success-soft-foreground flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Cổng bảo vệ sẵn sàng
            </span>
          </div>
        </div>
      </div>

      {/* Main Switcher: Danh Sách Sinh Viên VS Yêu Cầu, Đơn Từ */}
      <div className="flex rounded-2xl bg-muted/70 p-1.5 border border-border max-w-md">
        <button
          onClick={() => setActiveTab("STUDENTS")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === "STUDENTS"
              ? "bg-card text-foreground shadow-xs font-extrabold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4 text-primary-soft-foreground" />
          <span>Danh Sách Sinh Viên ({MOCK_RESIDENTS_REGISTRY.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === "REQUESTS"
              ? "bg-card text-foreground shadow-xs font-extrabold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4 text-primary-soft-foreground" />
          <span>Yêu Cầu & Đơn Từ ({curfewRequests.length + maintenanceTickets.length})</span>
          {totalPendingRequests > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-black text-white">
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm theo MSSV, Họ tên, Phòng hoặc Số điện thoại..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-10 pr-4 focus:outline-hidden focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tòa nhà:</span>
              <Select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="font-medium"
              >
                <option value="ALL">Tất cả các tòa</option>
                <option value="Tòa A">Tòa A (Nam - High-Rise)</option>
                <option value="Tòa B">Tòa B (Nữ)</option>
                <option value="Tòa C">Tòa C</option>
              </Select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground text-[11px] uppercase border-b border-border font-bold">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 align-middle">MSSV</th>
                    <th className="whitespace-nowrap px-4 py-3 align-middle">Họ và Tên</th>
                    <th className="whitespace-nowrap px-4 py-3 align-middle">Phòng & Giường</th>
                    <th className="whitespace-nowrap px-4 py-3 align-middle">Số Điện Thoại</th>
                    <th className="whitespace-nowrap px-4 py-3 align-middle">Quê Quán</th>
                    <th className="whitespace-nowrap px-4 py-3 align-middle">Hạn Hợp Đồng</th>
                    <th className="whitespace-nowrap px-4 py-3 align-middle text-center">Rèn Luyện</th>
                    <th className="whitespace-nowrap px-4 py-3 align-middle text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((st) => (
                    <tr
                      key={st.studentId}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(st)}
                    >
                      <td className="whitespace-nowrap px-4 py-3 align-middle font-mono font-bold text-foreground">
                        {st.studentId}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle">
                        <div className="font-bold text-foreground">{st.fullName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {st.gender === "Nam" ? "Nam" : "Nữ"} • CCCD: {st.citizenId}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle">
                        <span className="inline-flex items-center gap-1 font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                          <BedDouble className="h-3 w-3 text-primary-soft-foreground" />
                          {st.room} • {st.bedCode}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{st.building}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle">
                        <div className="font-medium text-foreground">{st.phone}</div>
                        <div className="text-[10px] text-muted-foreground">
                          PH: {st.parentPhone}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle text-muted-foreground">{st.hometown}</td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle font-mono text-[11px] text-muted-foreground">
                        {st.endDate}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success-soft-foreground">
                          100/100 đ
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-middle text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStudent(st)
                          }}
                          className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-[11px] font-semibold text-foreground transition-colors"
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
              <div className="p-8 text-center text-muted-foreground text-xs">
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
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground mr-1">Phân loại:</span>
              <button
                type="button"
                onClick={() => setRequestTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  requestTypeFilter === "CURFEW"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Đơn Về Muộn / Vắng Mặt ({curfewRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setRequestTypeFilter("MAINTENANCE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  requestTypeFilter === "MAINTENANCE"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Phiếu Báo Hỏng Bảo Trì ({maintenanceTickets.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Trạng thái:</span>
              <Select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value as "ALL" | "PENDING" | "RESOLVED")}
                className="font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chỉ đơn chờ duyệt / chưa xử lý</option>
                <option value="RESOLVED">Đã duyệt / Đã hoàn thành</option>
              </Select>
            </div>
          </div>

          {/* List of Applications & Requests */}
          <div className="space-y-3">
            {/* 1. Curfew Requests */}
            {(requestTypeFilter === "ALL" || requestTypeFilter === "CURFEW") &&
              curfewRequests
                .filter((r) => {
                  if (requestStatusFilter === "PENDING") return r.status === "PENDING"
                  if (requestStatusFilter === "RESOLVED") return r.status !== "PENDING"
                  return true
                })
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary-soft-foreground dark:text-primary text-xs font-bold">
                          <Clock className="h-3.5 w-3.5" />
                          Đơn về muộn
                        </span>
                        <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md">
                          {req.id}
                        </span>
                        <span className="font-bold text-sm text-foreground">
                          {req.studentName} ({req.studentId})
                        </span>
                        <span className="text-xs text-muted-foreground">• Phòng {req.room}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.isSubmittedBefore2100
                              ? "bg-success/10 text-success-soft-foreground "
                              : "bg-danger/10 text-danger-soft-foreground"
                          }`}
                        >
                          {req.isSubmittedBefore2100 ? "Nộp trước 21:00" : "Nộp muộn sau 21:00"}
                        </span>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            req.status === "APPROVED"
                              ? "bg-success text-white"
                              : req.status === "REJECTED"
                              ? "bg-danger text-white"
                              : "bg-primary/20 text-primary-soft-foreground  border border-primary/25"
                          }`}
                        >
                          {req.status === "APPROVED" && "Đã phê duyệt"}
                          {req.status === "REJECTED" && "Đã từ chối"}
                          {req.status === "PENDING" && "Chờ BQL duyệt"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-xl border border-border/60 text-xs text-foreground">
                      <p className="font-medium">
                        Lý do giải trình: <span className="font-normal">{req.reasonDetail}</span>
                      </p>
                      <div className="flex flex-wrap gap-4 text-muted-foreground mt-2 text-[11px]">
                        <span>Ngày vắng: <strong className="text-foreground">{req.date}</strong></span>
                        <span>Giờ về dự kiến: <strong className="text-foreground">{req.expectedReturnTime}</strong></span>
                        <span>SĐT liên hệ: <strong className="text-foreground">{req.phone}</strong></span>
                        <span>SĐT Phụ huynh xác nhận: <strong className="text-foreground">{req.parentPhone}</strong></span>
                      </div>
                    </div>

                    {/* Action buttons for admin */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {req.reviewedBy ? `Người duyệt: ${req.reviewedBy}` : "Chờ ban quản lý ký duyệt trực tuyến"}
                      </span>

                      {req.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <Button variant="success" className="flex hover:bg-success" type="button" onClick={() => handleReviewCurfew(req.id, "APPROVED")}>
                            <Check className="h-3.5 w-3.5" />
                            <span>Duyệt đơn hợp lệ</span>
                          </Button>
                          <Button variant="destructive" className="flex hover:bg-danger" type="button" onClick={() => handleReviewCurfew(req.id, "REJECTED")}>
                            <X className="h-3.5 w-3.5" />
                            <span>Từ chối</span>
                          </Button>
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
            {(requestTypeFilter === "ALL" || requestTypeFilter === "MAINTENANCE") &&
              maintenanceTickets
                .filter((t) => {
                  if (requestStatusFilter === "PENDING") return t.status === "PENDING"
                  if (requestStatusFilter === "RESOLVED") return t.status === "CLOSED"
                  return true
                })
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3 hover:border-primary/25 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary-soft-foreground text-xs font-bold">
                          <Wrench className="h-3.5 w-3.5" />
                          Phiếu báo hỏng
                        </span>
                        <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded-md">
                          {ticket.id}
                        </span>
                        <span className="font-bold text-sm text-foreground">{ticket.title}</span>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          ticket.status === "CLOSED"
                            ? "bg-success text-white"
                            : ticket.status === "IN_PROGRESS"
                            ? "bg-primary text-white"
                            : "bg-primary/20 text-primary-soft-foreground  border border-primary/25"
                        }`}
                      >
                        {ticket.status === "PENDING" && "Chờ tiếp nhận"}
                        {ticket.status === "IN_PROGRESS" && "Đang điều phối sửa"}
                        {ticket.status === "CLOSED" && "Đã sửa xong"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">{ticket.description}</p>

                    <div className="flex flex-wrap gap-4 text-[11px] bg-muted/40 p-2.5 rounded-xl border border-border/60">
                      <span>Vị trí: <strong className="text-foreground">{ticket.building} - Phòng {ticket.room}</strong></span>
                      <span>Người báo: <strong className="text-foreground">{ticket.studentName} ({ticket.studentId})</strong></span>
                      <span>Thời gian: <span className="font-mono">{ticket.createdAt}</span></span>
                      <span>Mức độ: <strong className="text-danger-soft-foreground">{ticket.urgency}</strong></span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        to="/maintenance"
                        className="text-xs font-bold text-primary-soft-foreground hover:text-primary-soft-foreground flex items-center gap-1"
                      >
                        <span>Mở phân hệ Điều phối Kỹ thuật</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {ticket.status === "PENDING" && (
                        <Button className="hover:bg-primary" type="button" onClick={() => handleUpdateMaintenanceStatus(ticket.id, "IN_PROGRESS")}>
                          Tiếp nhận xử lý
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary-soft-foreground flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Hồ Sơ Sinh Viên Lưu Trú
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    MSSV: {selectedStudent.studentId} • Hợp đồng: {selectedStudent.contractCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-2xl border border-border">
                <div>
                  <span className="text-muted-foreground">Họ và tên:</span>
                  <p className="font-bold text-sm text-foreground mt-0.5">{selectedStudent.fullName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Giới tính & Ngày sinh:</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedStudent.gender} • {selectedStudent.dob}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Số CCCD:</span>
                  <p className="font-mono font-semibold text-foreground mt-0.5">{selectedStudent.citizenId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quê quán:</span>
                  <p className="font-semibold text-foreground mt-0.5">{selectedStudent.hometown}</p>
                </div>
              </div>

              <div className="p-3 bg-primary/5 rounded-2xl border border-primary/15 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vị trí lưu trú:</span>
                  <strong className="text-foreground">
                    {selectedStudent.building} • Phòng {selectedStudent.room}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã giường cá nhân:</span>
                  <span className="font-mono font-bold text-primary-soft-foreground">{selectedStudent.bedCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời hạn hợp đồng:</span>
                  <span className="font-mono text-muted-foreground">
                    {selectedStudent.startDate} ➔ {selectedStudent.endDate}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số điện thoại sinh viên:</span>
                  <strong className="text-foreground">{selectedStudent.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Họ tên phụ huynh:</span>
                  <span className="font-semibold text-foreground">{selectedStudent.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SĐT Phụ huynh:</span>
                  <strong className="text-foreground">{selectedStudent.parentPhone}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold"
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
