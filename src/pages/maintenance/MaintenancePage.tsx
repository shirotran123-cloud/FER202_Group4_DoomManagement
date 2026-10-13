import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import type {
  MaintenanceTicket,
  MaintenanceScope,
  MaintenanceCategory,
  MaintenanceUrgency,
  ReplacedMaterial,
} from "@/types/maintenance"
import { INITIAL_MAINTENANCE_TICKETS } from "@/data/mockMaintenance"
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Star,
  UserCheck,
  Info,
  Edit2,
  Trash2,
  X,
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [filterUrgency, setFilterUrgency] = useState<string>("ALL")
  const [filterScope, setFilterScope] = useState<string>("ALL")

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [deleteConfirmTicketId, setDeleteConfirmTicketId] = useState<string | null>(null)

  const [activeTicket, setActiveTicket] = useState<MaintenanceTicket | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State (used for Create & Edit)
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

  // Assign Modal State
  const [assignTechName, setAssignTechName] = useState("Chú Đỗ Mạnh Hùng")
  const [assignTechPhone, setAssignTechPhone] = useState("0977 112 233")
  const [assignEtaMinutes, setAssignEtaMinutes] = useState(60)

  // Complete Modal State
  const [completionNotes, setCompletionNotes] = useState("")
  const [completionImage, setCompletionImage] = useState(
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  )
  const [materials, setMaterials] = useState<ReplacedMaterial[]>([])
  const [newMatName, setNewMatName] = useState("")
  const [newMatQty, setNewMatQty] = useState(1)
  const [newMatCost, setNewMatCost] = useState(50000)
  const [newMatPayer, setNewMatPayer] = useState<"DORMITORY" | "STUDENT">("DORMITORY")

  // Review Modal State
  const [ratingStars, setRatingStars] = useState(5)
  const [ratingComment, setRatingComment] = useState("")

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormTitle("")
    setFormScope("COMPARTMENT_PRIVATE")
    setFormBuilding("Tòa A (Nam)")
    setFormRoom("A205")
    setFormCompartment("Buồng B1")
    setFormBedCode("A205-B1-G03")
    setFormCategory("ELECTRIC")
    setFormUrgency("NORMAL")
    setFormDescription("")
    setFormImage("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80")
    setIsCreateModalOpen(true)
  }

  // Handle Create Ticket (C in CRUD)
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      showToast("Vui lòng nhập tiêu đề sự cố!")
      return
    }

    const nextId = `TKT-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, "0")}`
    const newTicket: MaintenanceTicket = {
      id: nextId,
      title: formTitle.trim(),
      scope: formScope,
      building: formBuilding,
      room: formRoom,
      compartment: formScope === "COMPARTMENT_PRIVATE" ? formCompartment : undefined,
      bedCode: formScope === "COMPARTMENT_PRIVATE" ? formBedCode : undefined,
      category: formCategory,
      urgency: formUrgency,
      description: formDescription.trim() || "Cần kỹ thuật kiểm tra và khắc phục sự cố.",
      studentId: user?.studentId || "SE182049",
      studentName: user?.fullName || "Nguyễn Hoàng Vinh",
      studentPhone: "0912 345 678",
      evidenceImages: formImage ? [formImage] : [],
      status: "PENDING",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    }

    setTickets([newTicket, ...tickets])
    setIsCreateModalOpen(false)
    showToast(`Đã tạo thành công phiếu yêu cầu ${newTicket.id}`)
  }

  // Open Edit Modal (U in CRUD)
  const handleOpenEdit = (ticket: MaintenanceTicket) => {
    setActiveTicket(ticket)
    setFormTitle(ticket.title)
    setFormScope(ticket.scope)
    setFormBuilding(ticket.building)
    setFormRoom(ticket.room)
    setFormCompartment(ticket.compartment || "Buồng B1")
    setFormBedCode(ticket.bedCode || "A205-B1-G03")
    setFormCategory(ticket.category)
    setFormUrgency(ticket.urgency)
    setFormDescription(ticket.description)
    setFormImage(ticket.evidenceImages?.[0] || "")
    setIsEditModalOpen(true)
  }

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTicket) return

    setTickets(
      tickets.map((t) => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            title: formTitle.trim(),
            scope: formScope,
            building: formBuilding,
            room: formRoom,
            compartment: formScope === "COMPARTMENT_PRIVATE" ? formCompartment : undefined,
            bedCode: formScope === "COMPARTMENT_PRIVATE" ? formBedCode : undefined,
            category: formCategory,
            urgency: formUrgency,
            description: formDescription.trim(),
            evidenceImages: formImage ? [formImage] : t.evidenceImages,
          }
        }
        return t
      })
    )

    setIsEditModalOpen(false)
    setActiveTicket(null)
    showToast(`Đã cập nhật thông tin phiếu ${activeTicket.id}`)
  }

  // Handle Delete Ticket (D in CRUD)
  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter((t) => t.id !== ticketId))
    setDeleteConfirmTicketId(null)
    showToast(`Đã xóa thành công phiếu ${ticketId}`)
  }

  // Handle Assign Technician
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTicket) return

    setTickets(
      tickets.map((t) => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: "IN_PROGRESS",
            assignedTechnician: {
              id: `tech_${Date.now()}`,
              name: assignTechName,
              phone: assignTechPhone,
              assignedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
              etaMinutes: assignEtaMinutes,
            },
          }
        }
        return t
      })
    )

    setIsAssignModalOpen(false)
    setActiveTicket(null)
    showToast(`Đã phân công ${assignTechName} xử lý phiếu!`)
  }

  // Handle Complete Ticket
  const handleAddMaterial = () => {
    if (!newMatName.trim()) return
    const item: ReplacedMaterial = {
      id: `mat_${Date.now()}`,
      name: newMatName.trim(),
      quantity: Number(newMatQty),
      unitCost: Number(newMatCost),
      paidBy: newMatPayer,
    }
    setMaterials([...materials, item])
    setNewMatName("")
  }

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id))
  }

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTicket) return

    const totalCost = materials.reduce((acc, cur) => acc + cur.quantity * cur.unitCost, 0)

    setTickets(
      tickets.map((t) => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: "RESOLVED",
            resolution: {
              completedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
              technicianNotes: completionNotes || "Đã kiểm tra và xử lý xong sự cố đạt chuẩn an toàn.",
              completionImages: completionImage ? [completionImage] : [],
              materials,
              totalMaterialCost: totalCost,
            },
          }
        }
        return t
      })
    )

    setIsCompleteModalOpen(false)
    setActiveTicket(null)
    showToast("Đã nghiệm thu hoàn tất và gửi cho sinh viên đánh giá!")
  }

  // Handle Student Rating Review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTicket) return

    setTickets(
      tickets.map((t) => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: "CLOSED",
            review: {
              rating: ratingStars,
              comment: ratingComment || "Dịch vụ sửa chữa nhanh chóng và tận tình.",
              reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
              isSatisfied: ratingStars >= 4,
            },
          }
        }
        return t
      })
    )

    setIsReviewModalOpen(false)
    setActiveTicket(null)
    showToast(`Cảm ơn bạn! Đã ghi nhận đánh giá ${ratingStars} sao cho phiếu.`)
  }

  // Filter Logic (R in CRUD)
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.studentName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "ALL" || ticket.status === filterStatus
    const matchesUrgency = filterUrgency === "ALL" || ticket.urgency === filterUrgency
    const matchesScope = filterScope === "ALL" || ticket.scope === filterScope

    return matchesSearch && matchesStatus && matchesUrgency && matchesScope
  })

  // Quick statistics
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "PENDING").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
    emergency: tickets.filter((t) => t.urgency === "EMERGENCY" && t.status !== "CLOSED").length,
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Wrench className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Quản lý Báo hỏng & Sửa chữa</h1>
          </div>
          <p className="text-sm text-slate-600">
            Theo dõi, điều phối kỹ thuật và nghiệm thu sửa chữa cơ sở vật chất KTX FPT
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo phiếu báo hỏng mới</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số phiếu</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="mt-1 text-xs text-slate-500">Tất cả các thời điểm</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Chờ tiếp nhận</span>
          <div className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="mt-1 text-xs text-amber-700">Cần phân công kỹ thuật</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-xs">
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Đang xử lý</span>
          <div className="mt-2 text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="mt-1 text-xs text-blue-700">Thợ đang làm việc</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Chờ nghiệm thu</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{stats.resolved}</div>
          <div className="mt-1 text-xs text-emerald-700">Chờ sinh viên đánh giá</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Sự cố khẩn cấp</span>
          <div className="mt-2 text-2xl font-bold text-rose-600">{stats.emergency}</div>
          <div className="mt-1 text-xs text-rose-700">Cam kết có mặt 2h</div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã phiếu, phòng, tên sinh viên hoặc sự cố..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Urgency & Scope Selects */}
          <div className="flex items-center gap-2">
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="ALL">Mức độ: Tất cả</option>
              <option value="NORMAL">Bình thường</option>
              <option value="EMERGENCY">Khẩn cấp (2h)</option>
            </select>

            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="ALL">Phạm vi: Tất cả</option>
              <option value="ROOM_SHARED">Phòng chung</option>
              <option value="COMPARTMENT_PRIVATE">Buồng cá nhân</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          {[
            { id: "ALL", label: "Tất cả phiếu" },
            { id: "PENDING", label: "Chờ tiếp nhận" },
            { id: "IN_PROGRESS", label: "Đang sửa chữa" },
            { id: "RESOLVED", label: "Chờ nghiệm thu" },
            { id: "CLOSED", label: "Đã hoàn thành" },
          ].map((tab) => {
            const isActive = filterStatus === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tickets List View (R in CRUD) */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Không tìm thấy phiếu yêu cầu nào</h3>
          <p className="text-sm text-slate-500 mt-1">
            Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc trạng thái.
          </p>
          <button
            onClick={() => {
              setSearchQuery("")
              setFilterStatus("ALL")
              setFilterUrgency("ALL")
              setFilterScope("ALL")
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Đặt lại bộ lọc
          </button>
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
                className={`rounded-2xl border bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between ${
                  isEmergency ? "border-rose-300 bg-rose-50/10" : "border-slate-200"
                }`}
              >
                <div>
                  {/* Card Header: Code, Badges, Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {ticket.id}
                      </span>

                      {/* Scope Badge */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          ticket.scope === "ROOM_SHARED"
                            ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                            : "bg-teal-50 text-teal-800 border-teal-200"
                        }`}
                      >
                        {ticket.scope === "ROOM_SHARED" ? "Phòng chung" : "Buồng cá nhân"}
                      </span>

                      {/* Urgency Badge */}
                      {isEmergency ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Khẩn cấp (2h)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          Bình thường
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                        isPending
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : isInProgress
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : isResolved
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {isPending && "Chờ tiếp nhận"}
                      {isInProgress && "Đang xử lý"}
                      {isResolved && "Chờ nghiệm thu"}
                      {isClosed && "Đã hoàn thành"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{ticket.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {ticket.description}
                  </p>

                  {/* Location Meta Box */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500">Vị trí: </span>
                      <strong className="text-slate-800">
                        {ticket.building} - {ticket.room}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Khu vực: </span>
                      <strong className="text-slate-800">
                        {ticket.bedCode || ticket.compartment || "Phòng chung"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Người báo: </span>
                      <strong className="text-slate-800">{ticket.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Thời gian: </span>
                      <span className="font-mono text-slate-700">{ticket.createdAt}</span>
                    </div>
                  </div>

                  {/* Assigned Technician if available */}
                  {ticket.assignedTechnician && (
                    <div className="mt-2.5 flex items-center justify-between text-xs bg-blue-50 border border-blue-200 p-2 rounded-xl text-blue-900">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-blue-700" />
                        <span>
                          Kỹ thuật: <strong>{ticket.assignedTechnician.name}</strong> ({ticket.assignedTechnician.phone})
                        </span>
                      </div>
                      <span className="text-[11px] text-blue-700 font-medium">
                        ETA: {ticket.assignedTechnician.etaMinutes}p
                      </span>
                    </div>
                  )}

                  {/* Review Stars if closed */}
                  {ticket.review && (
                    <div className="mt-2.5 flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-emerald-900">
                      <div className="flex text-amber-500">
                        {[...Array(ticket.review.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-emerald-800 italic">
                        "{ticket.review.comment}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* View Details Modal Trigger */}
                    <button
                      onClick={() => {
                        setActiveTicket(ticket)
                        setIsViewModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <Info className="h-3.5 w-3.5 text-slate-500" />
                      <span>Chi tiết</span>
                    </button>

                    {/* Edit Ticket (U in CRUD) */}
                    <button
                      onClick={() => handleOpenEdit(ticket)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                      title="Sửa phiếu"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>Sửa</span>
                    </button>

                    {/* Delete Ticket (D in CRUD) */}
                    <button
                      onClick={() => setDeleteConfirmTicketId(ticket.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                      title="Xóa phiếu"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      <span>Xóa</span>
                    </button>
                  </div>

                  {/* Contextual Workflow Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* For Manager: Assign Tech */}
                    {isManagerOrAdmin && isPending && (
                      <button
                        onClick={() => {
                          setActiveTicket(ticket)
                          setIsAssignModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Phân công thợ</span>
                      </button>
                    )}

                    {/* For Technician: Mark Completed */}
                    {isTechnician && isInProgress && (
                      <button
                        onClick={() => {
                          setActiveTicket(ticket)
                          setMaterials([])
                          setIsCompleteModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Báo hoàn thành</span>
                      </button>
                    )}

                    {/* For Student: Review when Resolved */}
                    {isResolved && (
                      <button
                        onClick={() => {
                          setActiveTicket(ticket)
                          setRatingStars(5)
                          setRatingComment("")
                          setIsReviewModalOpen(true)
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>Đánh giá sao</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL 1: CREATE TICKET (C in CRUD) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Tạo phiếu báo hỏng thiết bị</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề sự cố <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Vỡ vòi sen nhà tắm, Chập ổ điện đầu giường..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phạm vi khu vực</label>
                  <select
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value as MaintenanceScope)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="COMPARTMENT_PRIVATE">Buồng cá nhân (Giường riêng)</option>
                    <option value="ROOM_SHARED">Khu vực phòng chung (WC, Ban công)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as MaintenanceUrgency)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="NORMAL">Bình thường (Trong 24h)</option>
                    <option value="EMERGENCY">Khẩn cấp (Cháy, nổ, vỡ ống - Trong 2h)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại sự cố</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MaintenanceCategory)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ELECTRIC">Hệ thống Điện</option>
                    <option value="PLUMBING">Nước & Thiết bị WC</option>
                    <option value="HVAC">Điều hòa không khí</option>
                    <option value="FURNITURE">Nội thất / Giường tủ</option>
                    <option value="NETWORK">Mạng Internet / Wifi</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phòng & Vị trí</label>
                  <input
                    type="text"
                    value={`${formBuilding} - ${formRoom} (${formCompartment})`}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết sự cố</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả cụ thể hiện trạng hư hỏng, vị trí hoặc dấu hiệu bất thường..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link ảnh chụp hiện trường</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TICKET (U in CRUD) */}
      {isEditModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Edit2 className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Chỉnh sửa phiếu {activeTicket.id}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề sự cố</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as MaintenanceUrgency)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="NORMAL">Bình thường</option>
                    <option value="EMERGENCY">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MaintenanceCategory)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ELECTRIC">Hệ thống Điện</option>
                    <option value="PLUMBING">Nước & Thiết bị WC</option>
                    <option value="HVAC">Điều hòa không khí</option>
                    <option value="FURNITURE">Nội thất / Giường tủ</option>
                    <option value="NETWORK">Mạng Internet</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả sự cố</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW DETAILS (R in CRUD) */}
      {isViewModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {activeTicket.id}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                    {activeTicket.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{activeTicket.title}</h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Mô tả sự cố</span>
                <p className="mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed">
                  {activeTicket.description}
                </p>
              </div>

              {activeTicket.evidenceImages && activeTicket.evidenceImages.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Ảnh hiện trường</span>
                  <div className="mt-1.5 flex gap-2 overflow-x-auto">
                    {activeTicket.evidenceImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Evidence"
                        className="h-28 w-40 object-cover rounded-xl border border-slate-200 shadow-2xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Technician Info */}
              {activeTicket.assignedTechnician && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-xs font-bold text-blue-900 block mb-1">Thông tin Kỹ thuật viên</span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                    <div>Tên: <strong>{activeTicket.assignedTechnician.name}</strong></div>
                    <div>Điện thoại: <strong>{activeTicket.assignedTechnician.phone}</strong></div>
                    <div>Thời gian nhận: {activeTicket.assignedTechnician.assignedAt}</div>
                    <div>Dự kiến hoàn thành: {activeTicket.assignedTechnician.etaMinutes} phút</div>
                  </div>
                </div>
              )}

              {/* Resolution Info */}
              {activeTicket.resolution && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-emerald-900 block">Biên bản nghiệm thu sửa chữa</span>
                  <p className="text-xs text-emerald-800">{activeTicket.resolution.technicianNotes}</p>
                  {activeTicket.resolution.materials.length > 0 && (
                    <div className="mt-2 text-xs">
                      <strong className="text-emerald-900 block mb-1">Vật tư thay thế:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-emerald-800">
                        {activeTicket.resolution.materials.map((m) => (
                          <li key={m.id}>
                            {m.name} x {m.quantity} = {m.unitCost.toLocaleString("vi-VN")} đ ({m.paidBy === "DORMITORY" ? "KTX chi trả" : "Sinh viên chi trả"})
                          </li>
                        ))}
                      </ul>
                      <div className="mt-1.5 font-bold text-emerald-900">
                        Tổng chi phí: {activeTicket.resolution.totalMaterialCost.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ASSIGN TECHNICIAN */}
      {isAssignModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Phân công Kỹ thuật viên</h3>
            <p className="text-xs text-slate-500 mb-4">Gán thợ sửa chữa cho phiếu {activeTicket.id}</p>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kỹ thuật viên phụ trách</label>
                <select
                  value={assignTechName}
                  onChange={(e) => {
                    setAssignTechName(e.target.value)
                    if (e.target.value === "Chú Đỗ Mạnh Hùng") setAssignTechPhone("0977 112 233")
                    if (e.target.value === "Anh Lê Quốc Tuấn") setAssignTechPhone("0918 889 900")
                    if (e.target.value === "Anh Vũ Trọng Nghĩa") setAssignTechPhone("0934 567 890")
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900"
                >
                  <option value="Chú Đỗ Mạnh Hùng">Chú Đỗ Mạnh Hùng (Trưởng ban Điện lạnh)</option>
                  <option value="Anh Lê Quốc Tuấn">Anh Lê Quốc Tuấn (Kỹ thuật Điện dân dụng)</option>
                  <option value="Anh Vũ Trọng Nghĩa">Anh Vũ Trọng Nghĩa (Thợ nước & Vệ sinh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  value={assignTechPhone}
                  onChange={(e) => setAssignTechPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian dự kiến có mặt (phút)</label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={assignEtaMinutes}
                  onChange={(e) => setAssignEtaMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Xác nhận phân công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: COMPLETE TICKET */}
      {isCompleteModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <h3 className="font-bold text-slate-900 text-base mb-1">Báo cáo hoàn thành sửa chữa</h3>
            <p className="text-xs text-slate-500 mb-4">Nghiệm thu sự cố {activeTicket.id}</p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú xử lý kỹ thuật</label>
                <textarea
                  rows={2}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Đã thay thế linh kiện, đo nguồn điện ổn định..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900"
                ></textarea>
              </div>

              {/* Material Logging */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-2">Vật tư thay thế (nếu có)</span>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Tên vật tư..."
                    value={newMatName}
                    onChange={(e) => setNewMatName(e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                  <input
                    type="number"
                    placeholder="SL"
                    value={newMatQty}
                    onChange={(e) => setNewMatQty(Number(e.target.value))}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Đơn giá (VNĐ)"
                    value={newMatCost}
                    onChange={(e) => setNewMatCost(Number(e.target.value))}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                  <select
                    value={newMatPayer}
                    onChange={(e) => setNewMatPayer(e.target.value as any)}
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="DORMITORY">KTX chi trả</option>
                    <option value="STUDENT">SV bồi thường</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white"
                  >
                    Thêm
                  </button>
                </div>

                {materials.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {materials.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200"
                      >
                        <span>
                          {m.name} x {m.quantity} ({m.unitCost.toLocaleString("vi-VN")} đ)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(m.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ảnh sau khi hoàn thành</label>
                <input
                  type="url"
                  value={completionImage}
                  onChange={(e) => setCompletionImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Xác nhận hoàn thành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: STUDENT REVIEW & STAR RATING */}
      {isReviewModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Đánh giá chất lượng sửa chữa</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Ý kiến của bạn giúp cải thiện dịch vụ quản lý KTX tốt hơn.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= ratingStars ? "text-amber-400 fill-amber-400" : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Chia sẻ nhận xét về thời gian, thái độ của kỹ thuật viên..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: DELETE CONFIRMATION (D in CRUD) */}
      {deleteConfirmTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Xác nhận xóa phiếu yêu cầu</h3>
            <p className="text-xs text-slate-600 mt-2 mb-5">
              Bạn có chắc chắn muốn xóa vĩnh viễn phiếu <strong>{deleteConfirmTicketId}</strong> không? Hành động này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmTicketId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteTicket(deleteConfirmTicketId)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              >
                Xóa phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
