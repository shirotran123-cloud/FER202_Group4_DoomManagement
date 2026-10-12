import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import type {
  MaintenanceTicket,
  MaintenanceScope,
  MaintenanceCategory,
  MaintenanceUrgency,
  MaintenanceStatus,
  ReplacedMaterial,
} from "@/types/maintenance"
import { INITIAL_MAINTENANCE_TICKETS } from "@/data/mockMaintenance"
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  Search,
  Star,
  UserCheck,
  ChevronRight,
  Sparkles,
  Info,
  Package,
} from "lucide-react"

const STORAGE_KEY_TICKETS = "dms_maintenance_tickets_v1"

export const MaintenancePage: React.FC = () => {
  const { user } = useAuth()
  const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin"
  const isTechnician = user?.role === "technician" || isManagerOrAdmin

  // Tickets state with localStorage persistence
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS)
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TICKETS
    } catch {
      return INITIAL_MAINTENANCE_TICKETS
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets))
  }, [tickets])

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"list" | "create">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterScope, setFilterScope] = useState<string>("ALL")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [filterUrgency, setFilterUrgency] = useState<string>("ALL")

  // Selected Ticket for Modal Actions
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null)
  const [actionModalType, setActionModalType] = useState<
    "ASSIGN" | "COMPLETE" | "REVIEW" | "VIEW" | null
  >(null)

  // UC-20 Form State
  const [formTitle, setFormTitle] = useState("")
  const [formScope, setFormScope] = useState<MaintenanceScope>("COMPARTMENT_PRIVATE")
  const [formBuilding, setFormBuilding] = useState("Tòa A (Nam)")
  const [formRoom, setFormRoom] = useState("A205")
  const [formCompartment, setFormCompartment] = useState("Buồng B1")
  const [formBedCode, setFormBedCode] = useState("A205-B1-G03")
  const [formCategory, setFormCategory] = useState<MaintenanceCategory>("ELECTRIC")
  const [formUrgency, setFormUrgency] = useState<MaintenanceUrgency>("NORMAL")
  const [formDescription, setFormDescription] = useState("")
  const [formImage, setFormImage] = useState(
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // UC-21 Assignment Modal State
  const [assignTechName, setAssignTechName] = useState("Chú Đỗ Mạnh Hùng")
  const [assignTechPhone, setAssignTechPhone] = useState("0977 112 233")
  const [assignEtaMinutes, setAssignEtaMinutes] = useState(60)

  // UC-22 Completion Modal State
  const [completionNotes, setCompletionNotes] = useState("")
  const [completionImage, setCompletionImage] = useState(
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  )
  const [materials, setMaterials] = useState<ReplacedMaterial[]>([])
  const [newMatName, setNewMatName] = useState("")
  const [newMatQty, setNewMatQty] = useState(1)
  const [newMatCost, setNewMatCost] = useState(50000)
  const [newMatPayer, setNewMatPayer] = useState<"DORMITORY" | "STUDENT">("DORMITORY")

  // UC-23 Review Modal State
  const [ratingStars, setRatingStars] = useState(5)
  const [ratingComment, setRatingComment] = useState("")

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Handle UC-20 Ticket Submission
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDescription.trim()) {
      showToast("Vui lòng điền đầy đủ tiêu đề và mô tả sự cố!")
      return
    }

    const newTicket: MaintenanceTicket = {
      id: `TKT-2026-${String(tickets.length + 1).padStart(3, "0")}`,
      title: formTitle,
      scope: formScope,
      building: formBuilding,
      room: formRoom,
      compartment: formScope === "COMPARTMENT_PRIVATE" ? formCompartment : undefined,
      bedCode: formScope === "COMPARTMENT_PRIVATE" ? formBedCode : undefined,
      category: formCategory,
      urgency: formUrgency,
      description: formDescription,
      studentId: user?.studentId || "SE182049",
      studentName: user?.fullName || "Nguyễn Hoàng Vinh",
      studentPhone: user?.phone || "0912 345 678",
      evidenceImages: formImage ? [formImage] : [],
      status: "PENDING",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    }

    setTickets([newTicket, ...tickets])
    setActiveTab("list")
    setFormTitle("")
    setFormDescription("")
    showToast(`Đã tạo thành công phiếu ${newTicket.id}! Kỹ thuật viên sẽ tiếp nhận trong thời gian sớm nhất.`)
  }

  // Handle UC-21 Technician Assignment
  const handleAssignTechnician = () => {
    if (!selectedTicket) return
    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: "IN_PROGRESS" as MaintenanceStatus,
          assignedTechnician: {
            id: "usr_tech_01",
            name: assignTechName,
            phone: assignTechPhone,
            assignedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            etaMinutes: assignEtaMinutes,
          },
        }
      }
      return t
    })
    setTickets(updated)
    setActionModalType(null)
    setSelectedTicket(null)
    showToast(`Đã điều phối kỹ thuật viên ${assignTechName} tiếp nhận phiếu ${selectedTicket.id}!`)
  }

  // Add material row in completion modal
  const handleAddMaterial = () => {
    if (!newMatName.trim()) return
    const newMat: ReplacedMaterial = {
      id: "mat_" + Date.now(),
      name: newMatName,
      quantity: newMatQty,
      unitCost: newMatCost,
      paidBy: newMatPayer,
    }
    setMaterials([...materials, newMat])
    setNewMatName("")
    setNewMatQty(1)
    setNewMatCost(50000)
  }

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id))
  }

  // Handle UC-22 Completion
  const handleCompleteRepair = () => {
    if (!selectedTicket) return
    const totalCost = materials.reduce((acc, curr) => acc + curr.quantity * curr.unitCost, 0)
    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: "RESOLVED" as MaintenanceStatus,
          resolution: {
            completedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            technicianNotes:
              completionNotes.trim() ||
              "Đã hoàn thành kiểm tra và thay thế linh kiện, hệ thống vận hành an toàn.",
            completionImages: completionImage ? [completionImage] : [],
            materials: materials,
            totalMaterialCost: totalCost,
          },
        }
      }
      return t
    })
    setTickets(updated)
    setActionModalType(null)
    setSelectedTicket(null)
    setMaterials([])
    setCompletionNotes("")
    showToast(`Đã cập nhật hoàn tất sửa chữa cho phiếu ${selectedTicket.id}! Đang chờ sinh viên nghiệm thu.`)
  }

  // Handle UC-23 Review
  const handleReviewTicket = () => {
    if (!selectedTicket) return
    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: "CLOSED" as MaintenanceStatus,
          review: {
            rating: ratingStars,
            reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            comment: ratingComment.trim() || "Rất hài lòng với chất lượng sửa chữa.",
            isSatisfied: ratingStars >= 3,
          },
        }
      }
      return t
    })
    setTickets(updated)
    setActionModalType(null)
    setSelectedTicket(null)
    setRatingComment("")
    showToast(`Cảm ơn bạn đã đánh giá ${ratingStars} sao cho dịch vụ bảo trì! Phiếu ${selectedTicket.id} đã hoàn tất đóng.`)
  }

  // Student visibility filter: Sinh viên chỉ xem các phiếu do chính mình gửi, BQL/KTV xem toàn bộ
  const isStudent = user?.role === "student"
  const currentStudentId = user?.studentId || "SE182049"

  const visibleTickets = isStudent
    ? tickets.filter((t) => t.studentId === currentStudentId)
    : tickets

  // Filtered tickets
  const filteredTickets = visibleTickets.filter((t) => {
    const matchesScope = filterScope === "ALL" || t.scope === filterScope
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus
    const matchesUrgency = filterUrgency === "ALL" || t.urgency === filterUrgency
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.bedCode && t.bedCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesScope && matchesStatus && matchesUrgency && matchesSearch
  })

  // Statistics
  const totalCount = visibleTickets.length
  const pendingCount = visibleTickets.filter((t) => t.status === "PENDING").length
  const inProgressCount = visibleTickets.filter((t) => t.status === "IN_PROGRESS").length
  const resolvedCount = visibleTickets.filter((t) => t.status === "RESOLVED").length
  const emergencyCount = visibleTickets.filter((t) => t.urgency === "EMERGENCY" && t.status !== "CLOSED").length

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-foreground text-background px-4 py-3 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-amber-500/5 to-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Wrench className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <span>Module 5</span>
                <span>•</span>
                <span>UC-20 ➔ UC-23</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                Hệ Thống Báo Hỏng Cơ Sở Vật Chất & Điều Phối Kỹ Thuật
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Phân định thiết bị Phòng chung vs Buồng cá nhân • Xử lý khẩn cấp 2h • Nghiệm thu đánh giá 1-5 sao
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/90 px-4 py-2.5 text-right shadow-xs shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Phụ trách kỹ thuật & an ninh:
            </p>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1 mt-0.5">
              <span>🛡️ Đinh Thanh Trung</span>
            </p>
            {isTechnician && (
              <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                Kỹ thuật / Quản lý: {user?.fullName}
              </p>
            )}
            {!isTechnician && isManagerOrAdmin && (
              <p className="text-[10px] text-blue-600 font-bold mt-0.5">
                Quản lý: {user?.fullName}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 text-xs">
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-muted-foreground text-[11px] font-medium">Tổng số phiếu</p>
            <p className="text-2xl font-black text-foreground mt-1">{totalCount}</p>
            <span className="text-[10px] text-muted-foreground">Toàn hệ thống KTX</span>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-amber-700 dark:text-amber-400 text-[11px] font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Chờ tiếp nhận
            </p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80">Cần phân công kỹ thuật</span>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-blue-700 dark:text-blue-400 text-[11px] font-medium flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5" /> Đang sửa chữa
            </p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
            <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80">Kỹ thuật viên đang xử lý</span>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Chờ nghiệm thu
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">Đã sửa xong, chờ review</span>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-red-700 dark:text-red-400 text-[11px] font-medium flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Ca khẩn cấp (&lt;2h)
            </p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{emergencyCount}</p>
            <span className="text-[10px] text-red-700/80 dark:text-red-400/80">Nguy cơ chập điện/ngập</span>
          </div>
        </div>
      </div>

      {/* Tabs & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex rounded-2xl bg-muted/60 p-1 border border-border">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "list"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>{isStudent ? "Phiếu Báo Hỏng Của Tôi" : "Danh Sách Phiếu Sự Cố"} ({filteredTickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "create"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Tạo phiếu báo hỏng mới (UC-20)</span>
          </button>
        </div>

        {activeTab === "list" && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã vé, phòng, giường..."
                className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
            {/* Scope Filter */}
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="ALL">Khu vực: Tất cả</option>
              <option value="ROOM_SHARED">Phòng chung</option>
              <option value="COMPARTMENT_PRIVATE">Buồng cá nhân</option>
            </select>
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="PENDING">Chờ tiếp nhận</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Chờ nghiệm thu</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
            {/* Urgency Filter */}
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="rounded-xl border border-border bg-card px-2.5 py-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="ALL">Mức độ: Tất cả</option>
              <option value="EMERGENCY">Khẩn cấp (2h)</option>
              <option value="NORMAL">Bình thường</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: LIST OF TICKETS */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
              <Wrench className="mx-auto h-12 w-12 opacity-30 mb-3" />
              <p className="text-sm font-semibold">Không tìm thấy phiếu yêu cầu sửa chữa phù hợp</p>
              <p className="text-xs mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc tạo một phiếu báo hỏng mới.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.map((ticket) => {
                const isEmergency = ticket.urgency === "EMERGENCY"
                const isPending = ticket.status === "PENDING"
                const isInProgress = ticket.status === "IN_PROGRESS"
                const isResolved = ticket.status === "RESOLVED"
                const isClosed = ticket.status === "CLOSED"

                return (
                  <div
                    key={ticket.id}
                    className={`rounded-3xl border bg-card p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                      isEmergency
                        ? "border-red-500/40 bg-gradient-to-br from-card to-red-500/5"
                        : "border-border"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                            {ticket.id}
                          </span>

                          {/* Scope Badge */}
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                              ticket.scope === "ROOM_SHARED"
                                ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20"
                                : "bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20"
                            }`}
                          >
                            {ticket.scope === "ROOM_SHARED" ? "Phòng chung" : "Buồng cá nhân"}
                          </span>

                          {/* Urgency Badge */}
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                              isEmergency
                                ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isEmergency ? (
                              <>
                                <AlertTriangle className="h-3 w-3" />
                                <span>KHẨN CẤP (XỬ LÝ TRONG 2H)</span>
                              </>
                            ) : (
                              <span>Bình thường</span>
                            )}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${
                            isPending
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              : isInProgress
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                              : isResolved
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-gray-500/10 text-gray-700 dark:text-gray-400 border border-gray-500/20"
                          }`}
                        >
                          {isPending && "Chờ tiếp nhận"}
                          {isInProgress && "Đang sửa chữa"}
                          {isResolved && "Chờ nghiệm thu"}
                          {isClosed && "Đã hoàn thành"}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-sm text-foreground line-clamp-1">{ticket.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {ticket.description}
                      </p>

                      {/* Location Information */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-muted/40 p-2.5 rounded-xl border border-border/60">
                        <div>
                          <span className="text-muted-foreground">Vị trí: </span>
                          <strong className="text-foreground">
                            {ticket.building} - {ticket.room}
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Chi tiết: </span>
                          <strong className="text-foreground">
                            {ticket.bedCode || ticket.compartment || "Khu vực chung"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Người báo: </span>
                          <strong className="text-foreground">{ticket.studentName}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Thời gian: </span>
                          <span className="font-mono text-muted-foreground">{ticket.createdAt}</span>
                        </div>
                      </div>

                      {/* Assigned Tech Info if any */}
                      {ticket.assignedTechnician && (
                        <div className="mt-2.5 flex items-center justify-between text-[11px] bg-blue-500/5 border border-blue-500/15 p-2 rounded-xl text-blue-700 dark:text-blue-400">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>
                              Kỹ thuật: <strong>{ticket.assignedTechnician.name}</strong> ({ticket.assignedTechnician.phone})
                            </span>
                          </div>
                          <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-md font-mono">
                            ETA: {ticket.assignedTechnician.etaMinutes}p
                          </span>
                        </div>
                      )}

                      {/* Completed Resolution Info if any */}
                      {ticket.resolution && (
                        <div className="mt-2.5 text-[11px] bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-xl space-y-1">
                          <div className="flex items-center justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Đã khắc phục xong
                            </span>
                            <span className="font-mono text-[10px]">{ticket.resolution.completedAt}</span>
                          </div>
                          <p className="text-muted-foreground text-[10px] italic">
                            "{ticket.resolution.technicianNotes}"
                          </p>
                          {ticket.resolution.materials.length > 0 && (
                            <p className="text-[10px] text-foreground font-medium pt-0.5">
                              Vật tư thay: {ticket.resolution.materials.map((m) => m.name).join(", ")} (Tổng:{" "}
                              {ticket.resolution.totalMaterialCost.toLocaleString("vi-VN")} đ)
                            </p>
                          )}
                        </div>
                      )}

                      {/* Student Review Star Rating if closed */}
                      {ticket.review && (
                        <div className="mt-2.5 flex items-center justify-between bg-amber-500/5 border border-amber-500/20 p-2 rounded-xl text-[11px]">
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < ticket.review!.rating ? "fill-amber-400 text-amber-500" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="font-bold text-foreground ml-1">{ticket.review.rating}/5</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                            "{ticket.review.comment}"
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons depending on role & status */}
                    <div className="mt-4 pt-3 border-t border-border/80 flex flex-wrap items-center justify-end gap-2">
                      {/* UC-21: Assign Technician (For Manager/Technician ONLY, NOT for student) */}
                      {!isStudent && isPending && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setActionModalType("ASSIGN")
                          }}
                          className="flex items-center gap-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Tiếp nhận & Phân công (UC-21)</span>
                        </button>
                      )}

                      {/* UC-22: Complete Repair & Upload Result (For Technician/Manager ONLY, NOT for student) */}
                      {!isStudent && isInProgress && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setActionModalType("COMPLETE")
                          }}
                          className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Báo xong & Nghiệm thu (UC-22)</span>
                        </button>
                      )}

                      {/* For student when ticket is pending */}
                      {isStudent && isPending && (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl">
                          Đang chờ kỹ thuật viên tiếp nhận
                        </span>
                      )}

                      {/* For student when ticket is in progress */}
                      {isStudent && isInProgress && (
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-xl">
                          Kỹ thuật viên đang xử lý sự cố
                        </span>
                      )}

                      {/* UC-23: Review & Rate 1-5 Stars (For Student) */}
                      {isResolved && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket)
                            setActionModalType("REVIEW")
                          }}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>Nghiệm thu & Đánh giá sao (UC-23)</span>
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setActionModalType("VIEW")
                        }}
                        className="flex items-center gap-1 rounded-xl border border-border hover:bg-muted text-foreground px-3 py-1.5 text-xs font-medium transition-colors"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE TICKET FORM (UC-20) */}
      {activeTab === "create" && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Tạo Phiếu Báo Hỏng Thiết Bị Cơ Sở Vật Chất (UC-20)
              </h2>
              <p className="text-xs text-muted-foreground">
                Được tiếp nhận bởi Bộ phận Vận hành & Kỹ thuật KTX FPT
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-5 text-xs">
            {/* Step 1: Scope Selection (Phòng chung vs Buồng cá nhân) */}
            <div className="space-y-2">
              <label className="font-bold text-foreground flex items-center justify-between">
                <span>1. Phân cấp Vị trí sự cố:</span>
                <span className="text-[10px] text-amber-600 font-semibold uppercase">
                  Quy chuẩn SRS IEEE-830
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormScope("ROOM_SHARED")}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    formScope === "ROOM_SHARED"
                      ? "border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="font-bold text-sm text-foreground">Khu vực Phòng chung</span>
                  <span className="text-[11px] mt-1 text-muted-foreground">
                    Máy nước nóng WC, vòi sen, lavabo, đèn ban công, cửa ra vào chính.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormScope("COMPARTMENT_PRIVATE")}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                    formScope === "COMPARTMENT_PRIVATE"
                      ? "border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="font-bold text-sm text-foreground">Khu vực Buồng cá nhân</span>
                  <span className="text-[11px] mt-1 text-muted-foreground">
                    Điều hòa buồng, quạt cá nhân, ổ cắm giường, khóa hộc tủ, giát giường.
                  </span>
                </button>
              </div>
            </div>

            {/* Location Inputs */}
            <div className={`grid grid-cols-1 ${formScope === "COMPARTMENT_PRIVATE" ? "sm:grid-cols-4" : "sm:grid-cols-2"} gap-3`}>
              <div>
                <label className="font-semibold text-foreground">Tòa nhà</label>
                <select
                  value={formBuilding}
                  onChange={(e) => setFormBuilding(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Tòa A (Nam)">Tòa A (Khu Nam)</option>
                  <option value="Tòa B (Nữ)">Tòa B (Khu Nữ)</option>
                  <option value="Tòa C (Nam)">Tòa C (Khu Nam)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-foreground">Phòng</label>
                <input
                  type="text"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>
              {formScope === "COMPARTMENT_PRIVATE" && (
                <>
                  <div>
                    <label className="font-semibold text-foreground">Buồng</label>
                    <select
                      value={formCompartment}
                      onChange={(e) => setFormCompartment(e.target.value)}
                      className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Buồng A1">Buồng A1</option>
                      <option value="Buồng B1">Buồng B1</option>
                      <option value="Buồng C1">Buồng C1</option>
                      <option value="Buồng D1">Buồng D1</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-foreground">Mã Giường</label>
                    <input
                      type="text"
                      value={formBedCode}
                      onChange={(e) => setFormBedCode(e.target.value)}
                      placeholder="VD: A205-B1-G03"
                      className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Category & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground">Nhóm thiết bị</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MaintenanceCategory)}
                  className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                >
                  <option value="ELECTRIC">Điện / Chiếu sáng / Ổ cắm</option>
                  <option value="PLUMBING">Nước / Vòi sen / Bình nóng lạnh / Thoát sàn</option>
                  <option value="HVAC">Điều hòa / Quạt thông gió / Quạt trần</option>
                  <option value="FURNITURE">Khóa cửa / Bản lề / Tủ cá nhân / Giường</option>
                  <option value="NETWORK">Mạng Internet LAN / Wifi</option>
                  <option value="OTHER">Hạng mục khác</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground flex items-center justify-between">
                  <span>Mức độ khẩn cấp</span>
                  {formUrgency === "EMERGENCY" && (
                    <span className="text-[10px] text-red-600 font-bold">Xử lý ngay trong 2h!</span>
                  )}
                </label>
                <select
                  value={formUrgency}
                  onChange={(e) => setFormUrgency(e.target.value as MaintenanceUrgency)}
                  className={`w-full mt-1 rounded-xl border px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-amber-500 ${
                    formUrgency === "EMERGENCY"
                      ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  <option value="NORMAL">Bình thường (Xử lý trong 24h - 48h)</option>
                  <option value="EMERGENCY">Khẩn cấp (Rò điện, chập cháy, ngập nước - Trong 2h)</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="font-semibold text-foreground">Tiêu đề sự cố</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="VD: Chập ổ cắm điện đầu giường phát ra tia lửa"
                className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-semibold text-foreground">Mô tả chi tiết hiện trường</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Mô tả cụ thể dấu hiệu hư hỏng, thời điểm bắt đầu xảy ra sự cố..."
                className="w-full mt-1 rounded-xl border border-border bg-card p-3 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Ảnh chụp minh chứng hiện trường (Chống tranh chấp)</span>
                <span className="text-[10px] text-muted-foreground">URL ảnh hoặc ảnh mẫu</span>
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormImage(
                      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
                    )
                  }
                  className="rounded-xl border border-border bg-muted/60 px-3 py-2 text-[11px] font-medium hover:bg-muted shrink-0"
                >
                  Ảnh mẫu
                </button>
              </div>
              {formImage && (
                <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                  <img src={formImage} alt="Proof" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors"
              >
                Gửi Phiếu Báo Hỏng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 1: UC-21 ASSIGN TECHNICIAN */}
      {actionModalType === "ASSIGN" && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <UserCheck className="h-5 w-5" />
                <h3 className="font-bold text-sm text-foreground">
                  Tiếp Nhận & Điều Phối Kỹ Thuật (UC-21)
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{selectedTicket.id}</span>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 rounded-2xl bg-muted/50 border border-border space-y-1">
                <p className="font-bold text-foreground">{selectedTicket.title}</p>
                <p className="text-muted-foreground text-[11px]">
                  Vị trí: {selectedTicket.building} - {selectedTicket.room} (
                  {selectedTicket.bedCode || "Phòng chung"})
                </p>
                <p className="text-[11px] font-semibold text-red-600">
                  Mức độ: {selectedTicket.urgency === "EMERGENCY" ? "KHẨN CẤP (Xử lý trong 2h)" : "Bình thường"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-foreground">Chỉ định kỹ thuật viên</label>
                <select
                  value={assignTechName}
                  onChange={(e) => {
                    setAssignTechName(e.target.value)
                    setAssignTechPhone(
                      e.target.value === "Chú Đỗ Mạnh Hùng" ? "0977 112 233" : "0905 444 555"
                    )
                  }}
                  className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs"
                >
                  <option value="Chú Đỗ Mạnh Hùng">Chú Đỗ Mạnh Hùng (Tổ An ninh & Bảo trì Điện Nước)</option>
                  <option value="Anh Nguyễn Văn Sang">Anh Nguyễn Văn Sang (Kỹ thuật viên Điện Lạnh Daikin)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  value={assignTechPhone}
                  onChange={(e) => setAssignTechPhone(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">
                  Hẹn giờ có mặt tại phòng (ETA)
                </label>
                <select
                  value={assignEtaMinutes}
                  onChange={(e) => setAssignEtaMinutes(Number(e.target.value))}
                  className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold"
                >
                  <option value={30}>Trong vòng 30 phút (Ưu tiên đặc biệt)</option>
                  <option value={60}>Trong vòng 1 giờ</option>
                  <option value={120}>Trong vòng 2 giờ (Chuẩn khẩn cấp)</option>
                  <option value={1440}>Trong vòng 24 giờ</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <button
                onClick={() => setActionModalType(null)}
                className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold hover:bg-muted"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignTechnician}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold shadow-xs"
              >
                Xác nhận Điều phối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UC-22 COMPLETION & MATERIALS */}
      {actionModalType === "COMPLETE" && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-bold text-sm text-foreground">
                  Báo Cáo Kết Quả Sửa Chữa & Vật Tư Thay Thế (UC-22)
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{selectedTicket.id}</span>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="font-semibold text-foreground">Ghi chú công việc đã thực hiện</label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="VD: Đã thay thế van khóa nước 21mm, thử áp lực nước bình thường không rò rỉ..."
                  className="w-full mt-1 rounded-xl border border-border bg-card p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Ảnh hiện trường sau khi sửa</label>
                <input
                  type="text"
                  value={completionImage}
                  onChange={(e) => setCompletionImage(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-border bg-card px-3 py-2 text-xs"
                />
              </div>

              {/* Materials Section */}
              <div className="rounded-2xl border border-border p-3 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" /> Danh mục vật tư / linh kiện thay thế
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Tổng: {materials.reduce((a, c) => a + c.quantity * c.unitCost, 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>

                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-card border border-border text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{m.name}</span>
                      <span className="text-muted-foreground ml-2">
                        x{m.quantity} ({m.unitCost.toLocaleString("vi-VN")} đ/cái)
                      </span>
                      <span
                        className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          m.paidBy === "DORMITORY" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {m.paidBy === "DORMITORY" ? "KTX đài thọ" : "Sinh viên bồi thường"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveMaterial(m.id)}
                      className="text-red-500 hover:text-red-700 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add Material Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border/60">
                  <input
                    type="text"
                    value={newMatName}
                    onChange={(e) => setNewMatName(e.target.value)}
                    placeholder="Tên linh kiện..."
                    className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-card px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={newMatCost}
                    onChange={(e) => setNewMatCost(Number(e.target.value))}
                    placeholder="Đơn giá"
                    className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    value={newMatQty}
                    onChange={(e) => setNewMatQty(Number(e.target.value))}
                    placeholder="Số lượng"
                    className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs"
                  />
                  <select
                    value={newMatPayer}
                    onChange={(e) => setNewMatPayer(e.target.value as "DORMITORY" | "STUDENT")}
                    className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs"
                  >
                    <option value="DORMITORY">KTX đài thọ</option>
                    <option value="STUDENT">SV bồi thường</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="col-span-2 sm:col-span-1 rounded-xl bg-muted hover:bg-muted/80 text-foreground px-2 py-1.5 text-xs font-bold"
                  >
                    + Thêm
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <button
                onClick={() => setActionModalType(null)}
                className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold hover:bg-muted"
              >
                Hủy
              </button>
              <button
                onClick={handleCompleteRepair}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-xs"
              >
                Hoàn Tất & Gửi Sinh Viên Nghiệm Thu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UC-23 STUDENT REVIEW & RATING */}
      {actionModalType === "REVIEW" && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Star className="h-5 w-5 fill-current" />
                <h3 className="font-bold text-sm text-foreground">
                  Nghiệm Thu & Đánh Giá Dịch Vụ 1-5 Sao (UC-23)
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{selectedTicket.id}</span>
            </div>

            <div className="text-xs space-y-4">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                <p className="font-bold text-foreground">{selectedTicket.title}</p>
                <p className="text-muted-foreground text-[11px]">
                  Kỹ thuật viên: {selectedTicket.assignedTechnician?.name || "Chú Đỗ Mạnh Hùng"}
                </p>
                {selectedTicket.resolution && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                    Ghi chú kỹ thuật: "{selectedTicket.resolution.technicianNotes}"
                  </p>
                )}
              </div>

              {/* Star Rating Selector */}
              <div className="text-center py-2 space-y-2">
                <p className="font-bold text-foreground">Bạn đánh giá chất lượng sửa chữa thế nào?</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= ratingStars ? "fill-amber-400 text-amber-500" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-amber-600">
                  {ratingStars === 5 && "⭐ Tuyệt vời - Rất hài lòng"}
                  {ratingStars === 4 && "⭐ Tốt - Hài lòng"}
                  {ratingStars === 3 && "⭐ Đạt yêu cầu"}
                  {ratingStars === 2 && "⭐ Cần cải thiện"}
                  {ratingStars === 1 && "⭐ Không hài lòng"}
                </p>
              </div>

              <div>
                <label className="font-semibold text-foreground">Ý kiến nhận xét thêm (Tùy chọn)</label>
                <textarea
                  rows={2}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Gửi lời cảm ơn hoặc phản hồi về thái độ phục vụ..."
                  className="w-full mt-1 rounded-xl border border-border bg-card p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <button
                onClick={() => setActionModalType(null)}
                className="rounded-xl border border-border px-3.5 py-2 text-xs font-semibold hover:bg-muted"
              >
                Để sau
              </button>
              <button
                onClick={handleReviewTicket}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-xs"
              >
                Xác Nhận Nghiệm Thu & Đóng Phiếu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW FULL DETAILS */}
      {actionModalType === "VIEW" && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Chi Tiết Phiếu Sự Cố: {selectedTicket.id}
              </h3>
              <button
                onClick={() => setActionModalType(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-bold">Tiêu đề:</span>
                <p className="font-bold text-sm text-foreground">{selectedTicket.title}</p>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Khu vực:</span>{" "}
                  <strong>{selectedTicket.scope === "ROOM_SHARED" ? "Phòng chung" : "Buồng cá nhân"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Mức độ:</span>{" "}
                  <strong className={selectedTicket.urgency === "EMERGENCY" ? "text-red-600" : ""}>
                    {selectedTicket.urgency === "EMERGENCY" ? "Khẩn cấp 2h" : "Bình thường"}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Vị trí:</span>{" "}
                  <strong>{selectedTicket.building} - {selectedTicket.room}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Mã giường:</span>{" "}
                  <strong>{selectedTicket.bedCode || "Khu vệ sinh/Phòng khách"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Người báo:</span>{" "}
                  <strong>{selectedTicket.studentName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">SĐT:</span>{" "}
                  <strong>{selectedTicket.studentPhone}</strong>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-bold">Mô tả sự cố:</span>
                <p className="p-3 rounded-xl bg-card border border-border mt-1 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.evidenceImages && selectedTicket.evidenceImages.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">Ảnh hiện trường báo ban đầu:</span>
                  <div className="mt-1 flex gap-2 overflow-x-auto py-1">
                    {selectedTicket.evidenceImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Evidence"
                        className="h-28 w-40 object-cover rounded-xl border border-border shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedTicket.resolution && (
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Kết quả xử lý của kỹ thuật:</span>
                  <p className="italic text-muted-foreground">"{selectedTicket.resolution.technicianNotes}"</p>
                  {selectedTicket.resolution.completionImages.length > 0 && (
                    <div className="flex gap-2">
                      {selectedTicket.resolution.completionImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Resolved"
                          className="h-24 w-36 object-cover rounded-xl border border-border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 text-right border-t border-border">
              <button
                onClick={() => setActionModalType(null)}
                className="rounded-xl bg-muted hover:bg-muted/80 px-4 py-1.5 text-xs font-semibold"
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
