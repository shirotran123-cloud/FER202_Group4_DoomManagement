import React, { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import type {
  MaintenanceTicket,
  MaintenanceScope,
  MaintenanceCategory,
  MaintenanceStatus,
  MaintenanceUrgency,
  ReplacedMaterial,
} from "@/types/maintenance"
import { ApiError, ticketApi } from "@/lib/api"
import { Wrench, TriangleAlert, CircleCheck, CircleAlert, Plus, Search, Star, UserCheck, Info, Pencil, Trash2, X } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import type { PhotoRecord } from "@/lib/photo-upload"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ExpandableText } from "@/components/ui/expandable-text"
import { LoadingSkeleton } from "@/components/ui/shared"
import { canEditTicket } from "@/lib/role-access"

/* ------------------------------------------------------------------
   NGUỒN DỮ LIỆU: `GET /api/tickets` — trang không còn mảng phiếu mẫu nào.

   Máy chủ là nguồn chân lý duy nhất. Trang chỉ giữ danh sách trong state để
   lọc và hiển thị; mọi thao tác ghi (tạo, sửa, xóa, phân công, báo hoàn
   thành, đánh giá) đều gọi API rồi ghép lại đúng bản ghi máy chủ trả về.
   Khi tải lỗi, giao diện nói rõ thông điệp tiếng Việt của backend kèm nút
   "Thử lại" — tuyệt đối không âm thầm vẽ lại dữ liệu mẫu.
   ------------------------------------------------------------------ */

/** Trạng thái một lượt tải danh sách phiếu. */
type TicketsState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string }

/** Lỗi của thao tác ghi, hiện ngay trong modal đang mở. */
interface MutationError {
  scope: "CREATE" | "EDIT" | "DELETE" | "ASSIGN" | "COMPLETE" | "REVIEW"
  message: string
}

/**
 * Quyền thao tác máy chủ cấp cho TỪNG phiếu theo vai trò đang đăng nhập.
 *
 * `GET /api/tickets` trả kèm `permissions` đã tính sẵn ở backend; dùng nó để
 * ẩn/hiện nút thay vì đoán lại ở frontend — nhờ vậy nút "Đánh giá sao" không
 * hiện cho người không phải chủ phiếu (backend sẽ trả 403).
 */
interface TicketPermissions {
  canEdit?: boolean
  canDelete?: boolean
  canAssign?: boolean
  canComplete?: boolean
  canReview?: boolean
  canCancel?: boolean
}

/** Phiếu kèm quyền máy chủ gửi kèm — state của trang dùng kiểu này. */
type TicketRow = MaintenanceTicket & { permissions: TicketPermissions }

/** Đọc khối `permissions` máy chủ gửi kèm (thiếu thì trả object rỗng). */
function readPermissions(raw: unknown): TicketPermissions {
  const source = (raw as { permissions?: unknown } | null)?.permissions
  if (!source || typeof source !== "object") return {}
  const p = source as Record<string, unknown>
  return {
    canEdit: p.canEdit === true,
    canDelete: p.canDelete === true,
    canAssign: p.canAssign === true,
    canComplete: p.canComplete === true,
    canReview: p.canReview === true,
    canCancel: p.canCancel === true,
  }
}

/** Khung báo lỗi thao tác ghi — in đúng thông điệp tiếng Việt của backend. */
const MutationErrorBox: React.FC<{ error: MutationError | null; scope: MutationError["scope"] }> = ({
  error,
  scope,
}) => {
  if (!error || error.scope !== scope) return null
  return (
    <div className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-soft p-3">
      <CircleAlert className="h-4 w-4 shrink-0 text-danger-soft-foreground" />
      <ExpandableText className="min-w-0" textClassName="text-xs font-semibold text-danger-soft-foreground">
        {error.message}
      </ExpandableText>
    </div>
  )
}

/** Thông điệp lỗi tiếng Việt: ưu tiên `ApiError.message` do backend trả về. */
function describeError(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "Không rõ nguyên nhân."
}

function isMaintenanceScope(value: unknown): value is MaintenanceScope {
  return value === "ROOM_SHARED" || value === "COMPARTMENT_PRIVATE"
}

function isMaintenanceCategory(value: unknown): value is MaintenanceCategory {
  return (
    value === "ELECTRIC" ||
    value === "PLUMBING" ||
    value === "HVAC" ||
    value === "FURNITURE" ||
    value === "NETWORK" ||
    value === "OTHER"
  )
}

function isMaintenanceStatus(value: unknown): value is MaintenanceStatus {
  return (
    value === "PENDING" ||
    value === "IN_PROGRESS" ||
    value === "RESOLVED" ||
    value === "CLOSED" ||
    value === "CANCELLED"
  )
}

/** Danh sách chuỗi ảnh máy chủ trả về (bỏ phần tử rỗng). */
function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === "string" && v.length > 0)
}

/**
 * Chuẩn hoá một phiếu máy chủ trả về sang `TicketRow`.
 *
 * Vì sao cần: `ticketApi.list()` khai báo `unknown[]`, còn dữ liệu thật có thêm
 * `slaDeadline`/`permissions` và có thể thiếu `compartment`, `resolution`,
 * `review`. Chuẩn hoá tại một chỗ giúp phần JSX bên dưới không phải phòng thủ
 * từng trường, và không trường nào bị bịa ra: thiếu thì để rỗng/`undefined`.
 */
function normalizeTicket(raw: unknown): TicketRow {
  const t = (raw ?? {}) as Record<string, unknown>
  const tech = (t.assignedTechnician ?? null) as Record<string, unknown> | null
  const resolution = (t.resolution ?? null) as Record<string, unknown> | null
  const review = (t.review ?? null) as Record<string, unknown> | null

  const rawMaterials = Array.isArray(resolution?.materials)
    ? (resolution.materials as Record<string, unknown>[])
    : []
  const materials: ReplacedMaterial[] = rawMaterials.map((m, index) => ({
    id: String(m?.id ?? `mat_${index + 1}`),
    name: String(m?.name ?? ""),
    quantity: Number(m?.quantity ?? 0),
    unitCost: Number(m?.unitCost ?? 0),
    paidBy: m?.paidBy === "STUDENT" ? "STUDENT" : "DORMITORY",
  }))

  const rating = Number(review?.rating ?? 0)

  return {
    id: String(t.id ?? ""),
    title: String(t.title ?? ""),
    scope: isMaintenanceScope(t.scope) ? t.scope : "ROOM_SHARED",
    building: String(t.building ?? ""),
    room: String(t.room ?? ""),
    compartment: t.compartment ? String(t.compartment) : undefined,
    bedCode: t.bedCode ? String(t.bedCode) : undefined,
    category: isMaintenanceCategory(t.category) ? t.category : "OTHER",
    urgency: t.urgency === "EMERGENCY" ? "EMERGENCY" : "NORMAL",
    description: String(t.description ?? ""),
    studentId: String(t.studentId ?? ""),
    studentName: String(t.studentName ?? ""),
    studentPhone: String(t.studentPhone ?? ""),
    evidenceImages: toStringList(t.evidenceImages),
    status: isMaintenanceStatus(t.status) ? t.status : "PENDING",
    createdAt: String(t.createdAt ?? ""),
    assignedTechnician: tech
      ? {
          id: String(tech.id ?? ""),
          name: String(tech.name ?? ""),
          phone: String(tech.phone ?? ""),
          assignedAt: String(tech.assignedAt ?? ""),
          etaMinutes: Number(tech.etaMinutes ?? 0),
        }
      : undefined,
    resolution: resolution
      ? {
          completedAt: String(resolution.completedAt ?? ""),
          technicianNotes: String(resolution.technicianNotes ?? ""),
          completionImages: toStringList(resolution.completionImages),
          materials,
          totalMaterialCost: Number(resolution.totalMaterialCost ?? 0),
        }
      : undefined,
    review: review
      ? {
          rating: Number.isFinite(rating) ? rating : 0,
          reviewedAt: String(review.reviewedAt ?? ""),
          comment: String(review.comment ?? ""),
          isSatisfied: review.isSatisfied === true,
        }
      : undefined,
    permissions: readPermissions(raw),
  }
}

export const MaintenancePage: React.FC = () => {
  const { user } = useAuth()
  /* ------------------------------------------------------------------
     Nạp danh sách phiếu từ backend + trạng thái tải/lỗi.
     ------------------------------------------------------------------ */
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [ticketsState, setTicketsState] = useState<TicketsState>({ status: "loading" })
  /** Số thứ tự lượt tải: bấm "Thử lại" tăng lên để effect gọi lại API. */
  const [reloadToken, setReloadToken] = useState(0)
  /** Lỗi của thao tác ghi gần nhất, hiện trong modal tương ứng. */
  const [mutationError, setMutationError] = useState<MutationError | null>(null)
  /** Phiếu đang chờ máy chủ xử lý (khóa nút để tránh bấm hai lần). */
  const [savingTicketId, setSavingTicketId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ticketApi
      .list()
      .then((rows) => {
        if (cancelled) return
        setTickets((Array.isArray(rows) ? rows : []).map(normalizeTicket))
        setTicketsState({ status: "ready" })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        // Không có dữ liệu mẫu dự phòng: lỗi thì danh sách để rỗng và báo rõ.
        setTickets([])
        setTicketsState({ status: "error", message: describeError(error) })
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  /** Gọi lại API và trả về trạng thái "đang tải" ngay trong sự kiện bấm. */
  const reloadTickets = useCallback(() => {
    setTicketsState({ status: "loading" })
    setReloadToken((token) => token + 1)
  }, [])

  /**
   * Ghép một phiếu máy chủ vừa trả về vào danh sách đang hiển thị.
   *
   * Dùng chung cho mọi thao tác ghi để giao diện luôn phản ánh đúng dữ liệu
   * máy chủ (kể cả trường máy chủ tự sinh như `assignedTechnician`,
   * `resolution`, `review`), thay vì tự đoán rồi sửa state tại chỗ.
   */
  const mergeTicket = useCallback((raw: unknown) => {
    const fresh = normalizeTicket(raw)
    if (!fresh.id) return
    setTickets((prev) =>
      prev.some((t) => t.id === fresh.id)
        ? prev.map((t) => (t.id === fresh.id ? fresh : t))
        : [fresh, ...prev],
    )
  }, [])

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

  const [activeTicket, setActiveTicket] = useState<TicketRow | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State (used for Create & Edit) — mặc định khớp dữ liệu máy chủ thật
  // (tên buồng dạng "B1", mã giường dạng "A205-B1-G03"); phiếu của nhân viên
  // không có hồ sơ nội trú sẽ dùng đúng bộ mặc định này.
  const [formTitle, setFormTitle] = useState("")
  const [formScope, setFormScope] = useState<MaintenanceScope>("COMPARTMENT_PRIVATE")
  const [formBuilding, setFormBuilding] = useState("Tòa A")
  const [formRoom, setFormRoom] = useState("A205")
  const [formCompartment, setFormCompartment] = useState("B1")
  const [formBedCode, setFormBedCode] = useState("A205-B1-G03")
  const [formCategory, setFormCategory] = useState<MaintenanceCategory>("ELECTRIC")
  const [formUrgency, setFormUrgency] = useState<MaintenanceUrgency>("NORMAL")
  const [formDescription, setFormDescription] = useState("")
  const [formPhotos, setFormPhotos] = useState<PhotoRecord[]>([])

  // Assign Modal State
  const [assignTechName, setAssignTechName] = useState("Chú Đỗ Mạnh Hùng")
  const [assignTechPhone, setAssignTechPhone] = useState("0977 112 233")
  const [assignEtaMinutes, setAssignEtaMinutes] = useState(60)

  // Complete Modal State
  const [completionNotes, setCompletionNotes] = useState("")
  const [completionPhotos, setCompletionPhotos] = useState<PhotoRecord[]>([])
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
    setMutationError(null)
    setFormTitle("")
    setFormScope("COMPARTMENT_PRIVATE")
    setFormBuilding(user?.dormitoryStatus?.building || "Tòa A")
    setFormRoom(user?.dormitoryStatus?.room || "A205")
    setFormCompartment(user?.dormitoryStatus?.compartment || "B1")
    setFormBedCode(user?.dormitoryStatus?.bedCode || "A205-B1-G03")
    setFormCategory("ELECTRIC")
    setFormUrgency("NORMAL")
    setFormDescription("")
    setIsCreateModalOpen(true)
  }

  // Handle Create Ticket (C in CRUD) — POST /api/tickets
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      showToast("Vui lòng nhập tiêu đề sự cố!")
      return
    }

    setMutationError(null)
    try {
      const created = await ticketApi.create({
        title: formTitle.trim(),
        scope: formScope,
        building: formBuilding,
        room: formRoom,
        compartment: formScope === "COMPARTMENT_PRIVATE" ? formCompartment : undefined,
        bedCode: formScope === "COMPARTMENT_PRIVATE" ? formBedCode : undefined,
        category: formCategory,
        urgency: formUrgency,
        description: formDescription.trim(),
        evidenceImages: formPhotos.map((p) => p.dataUrl).slice(0, 5),
      })
      mergeTicket(created)
      setIsCreateModalOpen(false)
      setFormPhotos([])
      showToast(`Đã tạo thành công phiếu yêu cầu ${normalizeTicket(created).id}`)
    } catch (error) {
      // Máy chủ từ chối (thiếu quyền, dữ liệu sai) -> nói thẳng, không giả thành công.
      setMutationError({ scope: "CREATE", message: describeError(error) })
    }
  }

  // Open Edit Modal (U in CRUD)
  const handleOpenEdit = (ticket: TicketRow) => {
    setMutationError(null)
    setActiveTicket(ticket)
    setFormTitle(ticket.title)
    setFormScope(ticket.scope)
    setFormBuilding(ticket.building)
    setFormRoom(ticket.room)
    setFormCompartment(ticket.compartment || "B1")
    setFormBedCode(ticket.bedCode || "A205-B1-G03")
    setFormCategory(ticket.category)
    setFormUrgency(ticket.urgency)
    setFormDescription(ticket.description)
    setIsEditModalOpen(true)
  }

  // Handle Edit Submit — PUT /api/tickets/:id
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTicket) return

    setMutationError(null)
    setSavingTicketId(activeTicket.id)
    try {
      const updated = await ticketApi.update(activeTicket.id, {
        title: formTitle.trim(),
        scope: formScope,
        building: formBuilding,
        room: formRoom,
        compartment: formScope === "COMPARTMENT_PRIVATE" ? formCompartment : undefined,
        bedCode: formScope === "COMPARTMENT_PRIVATE" ? formBedCode : undefined,
        category: formCategory,
        urgency: formUrgency,
        description: formDescription.trim(),
      })
      mergeTicket(updated)
      setIsEditModalOpen(false)
      setActiveTicket(null)
      showToast(`Đã cập nhật thông tin phiếu ${activeTicket.id}`)
    } catch (error) {
      setMutationError({ scope: "EDIT", message: describeError(error) })
    } finally {
      setSavingTicketId(null)
    }
  }

  // Handle Delete Ticket (D in CRUD) — DELETE /api/tickets/:id
  const handleDeleteTicket = async (ticketId: string) => {
    setMutationError(null)
    setSavingTicketId(ticketId)
    try {
      await ticketApi.remove(ticketId)
      setTickets((prev) => prev.filter((t) => t.id !== ticketId))
      setDeleteConfirmTicketId(null)
      showToast(`Đã xóa thành công phiếu ${ticketId}`)
    } catch (error) {
      // Ví dụ: phiếu đã sang IN_PROGRESS — backend chặn xóa, hiện đúng thông điệp.
      setMutationError({ scope: "DELETE", message: describeError(error) })
    } finally {
      setSavingTicketId(null)
    }
  }

  // Handle Assign Technician — POST /api/tickets/:id/transition (to: IN_PROGRESS)
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTicket) return

    setMutationError(null)
    setSavingTicketId(activeTicket.id)
    try {
      // Máy chủ tự ghi `assignedTechnician` kèm giờ phân công thật; chỉ gửi ai làm.
      const updated = await ticketApi.transition(activeTicket.id, "IN_PROGRESS", {
        technicianName: assignTechName,
        technicianPhone: assignTechPhone,
        etaMinutes: assignEtaMinutes,
      })
      mergeTicket(updated)
      setIsAssignModalOpen(false)
      setActiveTicket(null)
      showToast(`Đã phân công ${assignTechName} xử lý phiếu!`)
    } catch (error) {
      setMutationError({ scope: "ASSIGN", message: describeError(error) })
    } finally {
      setSavingTicketId(null)
    }
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

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTicket) return

    setMutationError(null)
    setSavingTicketId(activeTicket.id)
    try {
      // Máy chủ tự tính `totalMaterialCost` và ghi giờ nghiệm thu thật.
      const updated = await ticketApi.transition(activeTicket.id, "RESOLVED", {
        technicianNotes: completionNotes,
        completionImages: completionPhotos.map((p) => p.dataUrl).slice(0, 5),
        materials,
      })
      mergeTicket(updated)
      setIsCompleteModalOpen(false)
      setActiveTicket(null)
      showToast("Đã nghiệm thu hoàn tất và gửi cho sinh viên đánh giá!")
    } catch (error) {
      setMutationError({ scope: "COMPLETE", message: describeError(error) })
    } finally {
      setSavingTicketId(null)
    }
  }

  // Handle Student Rating Review — POST /api/tickets/:id/review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTicket) return

    setMutationError(null)
    setSavingTicketId(activeTicket.id)
    try {
      /* Máy chủ ghi đánh giá nhưng GIỮ trạng thái RESOLVED — đúng luồng nghiệp vụ
         PENDING → IN_PROGRESS → RESOLVED → CLOSED, bước đóng phiếu là một lượt
         chuyển trạng thái riêng. Gọi nốt lượt đó để phiếu rời khỏi "Chờ nghiệm thu"
         như trước, và vẫn lấy trạng thái CUỐI CÙNG từ máy chủ. */
      const reviewed = await ticketApi.review(activeTicket.id, ratingStars, ratingComment)
      mergeTicket(reviewed)

      try {
        const closed = await ticketApi.transition(activeTicket.id, "CLOSED")
        mergeTicket(closed)
      } catch {
        // Đánh giá đã ghi thành công; chỉ bước đóng phiếu không xong thì vẫn báo đúng
        // phần đã làm được, không nuốt kết quả của máy chủ.
        showToast(`Đã ghi nhận đánh giá ${ratingStars} sao. Phiếu vẫn đang chờ đóng.`)
        setIsReviewModalOpen(false)
        setActiveTicket(null)
        return
      }

      setIsReviewModalOpen(false)
      setActiveTicket(null)
      showToast(`Cảm ơn bạn! Đã ghi nhận đánh giá ${ratingStars} sao cho phiếu.`)
    } catch (error) {
      // Chỉ chủ phiếu đánh giá được — vai trò khác sẽ nhận 403 kèm thông điệp.
      setMutationError({ scope: "REVIEW", message: describeError(error) })
    } finally {
      setSavingTicketId(null)
    }
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

  // Quick statistics — tính từ danh sách máy chủ vừa tải, không từ mảng mẫu.
  const statsReady = ticketsState.status === "ready"
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CircleCheck className="h-5 w-5 text-success shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary">
              <Wrench className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Quản lý Báo hỏng & Sửa chữa</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Điều phối kỹ thuật, nghiệm thu sửa chữa KTX FPT
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          <span>Tạo phiếu báo hỏng mới</span>
        </Button>
      </div>

      {/* Metric Cards — chưa tải xong thì hiện "—", không hiện số 0 dễ bị đọc
          thành "không có phiếu nào" trong khi máy chủ còn đang trả lời. */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng số phiếu</span>
          <div className="mt-2 text-2xl font-bold text-foreground">{statsReady ? stats.total : "—"}</div>
          <div className="mt-1 text-xs text-muted-foreground">Tất cả các thời điểm</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-primary/25 bg-primary-soft shadow-xs">
          <span className="text-xs font-semibold text-primary-soft-foreground uppercase tracking-wider">Chờ tiếp nhận</span>
          <div className="mt-2 text-2xl font-bold text-primary-soft-foreground">{statsReady ? stats.pending : "—"}</div>
          <div className="mt-1 text-xs text-primary-soft-foreground">Cần phân công kỹ thuật</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-primary/20 bg-primary-soft shadow-xs">
          <span className="text-xs font-semibold text-primary-soft-foreground uppercase tracking-wider">Đang xử lý</span>
          <div className="mt-2 text-2xl font-bold text-primary">{statsReady ? stats.inProgress : "—"}</div>
          <div className="mt-1 text-xs text-primary-soft-foreground">Thợ đang làm việc</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-success/25 bg-success-soft shadow-xs">
          <span className="text-xs font-semibold text-success-soft-foreground uppercase tracking-wider">Chờ nghiệm thu</span>
          <div className="mt-2 text-2xl font-bold text-success-soft-foreground">{statsReady ? stats.resolved : "—"}</div>
          <div className="mt-1 text-xs text-success-soft-foreground">Chờ sinh viên đánh giá</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-danger/25 bg-danger-soft shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-danger-soft-foreground uppercase tracking-wider">Sự cố khẩn cấp</span>
          <div className="mt-2 text-2xl font-bold text-danger-soft-foreground">{statsReady ? stats.emergency : "—"}</div>
          <div className="mt-1 text-xs text-danger-soft-foreground">Cam kết có mặt 2h</div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã phiếu, phòng, tên sinh viên hoặc sự cố..."
              className="pl-10 pr-4"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Urgency & Scope Selects */}
          <div className="flex items-center gap-2">
            <Select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="font-medium text-muted-foreground"
            >
              <option value="ALL">Mức độ: Tất cả</option>
              <option value="NORMAL">Bình thường</option>
              <option value="EMERGENCY">Khẩn cấp · xử lý trong 2h</option>
            </Select>

            <Select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="font-medium text-muted-foreground"
            >
              <option value="ALL">Phạm vi: Tất cả</option>
              <option value="ROOM_SHARED">Phòng chung</option>
              <option value="COMPARTMENT_PRIVATE">Buồng cá nhân</option>
            </Select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-border">
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
                    ? "bg-foreground text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tickets List View (R in CRUD) */}
      {ticketsState.status === "loading" ? (
        /* Đang tải: khung xương, tuyệt đối không vẽ bảng rỗng rồi nhảy số. */
        <div className="bg-card rounded-2xl border border-border p-6">
          <LoadingSkeleton rows={4} />
        </div>
      ) : ticketsState.status === "error" ? (
        /* Tải lỗi: in đúng thông điệp tiếng Việt của backend, cho bấm thử lại. */
        <div className="bg-card rounded-2xl border border-danger/25 bg-danger-soft p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-danger-soft text-danger-soft-foreground mx-auto flex items-center justify-center mb-3">
            <CircleAlert className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-danger-soft-foreground text-base">
            Không tải được danh sách phiếu báo hỏng
          </h3>
          <p className="text-sm text-danger-soft-foreground mt-1">{ticketsState.message}</p>
          <Button variant="outline" className="mt-4 text-xs font-bold" onClick={reloadTickets}>
            Thử lại
          </Button>
        </div>
      ) : tickets.length === 0 ? (
        /* Máy chủ trả về rỗng thật: nói rõ chưa có phiếu nào, khác hẳn "lọc không ra". */
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-3">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-foreground text-base">Chưa có phiếu báo hỏng nào</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Máy chủ chưa ghi nhận phiếu nào. Tạo phiếu đầu tiên để đội kỹ thuật tiếp nhận.
          </p>
          <Button className="mt-4 text-xs font-bold" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            <span>Tạo phiếu báo hỏng mới</span>
          </Button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-3">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-foreground text-base">Không tìm thấy phiếu yêu cầu nào</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc trạng thái.
          </p>
          <button
            onClick={() => {
              setSearchQuery("")
              setFilterStatus("ALL")
              setFilterUrgency("ALL")
              setFilterScope("ALL")
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-muted hover:bg-muted text-foreground transition-colors"
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
                className={`rounded-2xl border bg-card p-5 shadow-xs hover:border-border transition-all flex flex-col justify-between ${
                  isEmergency ? "border-danger/25 bg-danger-soft" : "border-border"
                }`}
              >
                <div>
                  {/* Card Header: Code, Badges, Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
                        {ticket.id}
                      </span>

                      {/* Scope Badge */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          ticket.scope === "ROOM_SHARED"
                            ? "bg-primary-soft text-primary-soft-foreground border-primary/25"
                            : "bg-success-soft text-success-soft-foreground border-success/25"
                        }`}
                      >
                        {ticket.scope === "ROOM_SHARED" ? "Phòng chung" : "Buồng cá nhân"}
                      </span>

                      {/* Urgency Badge */}
                      {isEmergency ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-danger-soft text-danger-soft-foreground border border-danger/25 flex items-center gap-1">
                          <TriangleAlert className="h-3 w-3" />
                          <span>Khẩn cấp · 2h</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                          Bình thường
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                        isPending
                          ? "bg-primary-soft text-primary-soft-foreground border-primary/25"
                          : isInProgress
                          ? "bg-primary-soft text-primary-soft-foreground border-primary/20"
                          : isResolved
                          ? "bg-success-soft text-success-soft-foreground border-success/25"
                          : "bg-muted text-foreground border-border"
                      }`}
                    >
                      {isPending && "Chờ tiếp nhận"}
                      {isInProgress && "Đang xử lý"}
                      {isResolved && "Chờ nghiệm thu"}
                      {isClosed && "Đã hoàn thành"}
                    </span>
                  </div>

                  {/* Title & Description — một dòng, cắt bằng dấu ba chấm; mô tả dài
                      có nút "Xem thêm" để đọc trọn nội dung (lúc đó mới xuống dòng). */}
                  <h3 className="font-bold text-base text-foreground truncate">{ticket.title}</h3>
                  <ExpandableText className="mt-1" textClassName="text-xs text-muted-foreground">
                    {ticket.description}
                  </ExpandableText>

                  {/* Location Meta Box */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-muted p-2.5 rounded-xl border border-border">
                    <div>
                      <span className="text-muted-foreground">Vị trí: </span>
                      <strong className="text-foreground">
                        {ticket.building} - {ticket.room}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Khu vực: </span>
                      <strong className="text-foreground">
                        {ticket.bedCode || ticket.compartment || "Phòng chung"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Người báo: </span>
                      <strong className="text-foreground">{ticket.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thời gian: </span>
                      <span className="font-mono text-foreground">{ticket.createdAt}</span>
                    </div>
                  </div>

                  {/* Assigned Technician if available */}
                  {ticket.assignedTechnician && (
                    <div className="mt-2.5 flex items-center justify-between text-xs bg-primary-soft border border-primary/20 p-2 rounded-xl text-primary-soft-foreground">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-primary-soft-foreground" />
                        <span>
                          Kỹ thuật: <strong>{ticket.assignedTechnician.name}</strong> ({ticket.assignedTechnician.phone})
                        </span>
                      </div>
                      <span className="text-[11px] text-primary-soft-foreground font-medium">
                        ETA: {ticket.assignedTechnician.etaMinutes}p
                      </span>
                    </div>
                  )}

                  {/* Review Stars if closed */}
                  {ticket.review && (
                    <div className="mt-2.5 flex items-center gap-2 text-xs bg-success-soft border border-success/25 p-2 rounded-xl text-success-soft-foreground">
                      <div className="flex text-primary">
                        {[...Array(ticket.review.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-success-soft-foreground italic">
                        "{ticket.review.comment}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* View Details Modal Trigger */}
                    <button
                      onClick={() => {
                        setActiveTicket(ticket)
                        setIsViewModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Chi tiết</span>
                    </button>

                    {/* Edit: chủ phiếu (khi còn chờ) hoặc quản lý/admin */}
                    {canEditTicket(user?.role, ticket.studentId, user?.studentId) && isPending && (
                      <button
                        onClick={() => handleOpenEdit(ticket)}
                        disabled={savingTicketId === ticket.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                        title="Sửa phiếu"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Sửa</span>
                      </button>
                    )}

                    {/* Delete: chủ phiếu (khi còn chờ) hoặc quản lý/admin */}
                    {canEditTicket(user?.role, ticket.studentId, user?.studentId) && isPending && (
                      <button
                        onClick={() => setDeleteConfirmTicketId(ticket.id)}
                        disabled={savingTicketId === ticket.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-danger/25 bg-danger-soft hover:bg-danger-soft text-danger-soft-foreground transition-colors disabled:opacity-50"
                        title="Xóa phiếu"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-danger-soft-foreground" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>

                  {/* Contextual Workflow Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Phân công thợ: theo quyền máy chủ cấp cho chính phiếu này
                        (chỉ manager/admin và chỉ khi phiếu còn PENDING). */}
                    {ticket.permissions.canAssign && (
                      <Button disabled={savingTicketId === ticket.id} onClick={() => {
                          setMutationError(null)
                          setActiveTicket(ticket)
                          setIsAssignModalOpen(true)
                        }}>
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Phân công thợ</span>
                      </Button>
                    )}

                    {/* Báo hoàn thành: technician/manager/admin khi phiếu IN_PROGRESS. */}
                    {ticket.permissions.canComplete && (
                      <Button variant="success" className="hover:bg-success" disabled={savingTicketId === ticket.id} onClick={() => {
                          setMutationError(null)
                          setActiveTicket(ticket)
                          setMaterials([])
                          setCompletionNotes("")
                          setCompletionPhotos([])
                          setIsCompleteModalOpen(true)
                        }}>
                        <CircleCheck className="h-3.5 w-3.5" />
                        <span>Báo hoàn thành</span>
                      </Button>
                    )}

                    {/* Đánh giá: CHỈ chủ phiếu, chỉ khi RESOLVED — máy chủ quyết định. */}
                    {isResolved && ticket.permissions.canReview && (
                      <Button className="hover:bg-primary" disabled={savingTicketId === ticket.id} onClick={() => {
                          setMutationError(null)
                          setActiveTicket(ticket)
                          setRatingStars(5)
                          setRatingComment("")
                          setIsReviewModalOpen(true)
                        }}>
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>Đánh giá sao</span>
                      </Button>
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
          <div className="bg-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border my-8">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-foreground text-base">Tạo phiếu báo hỏng thiết bị</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Tiêu đề sự cố <span className="text-danger">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Vỡ vòi sen nhà tắm, chập ổ điện đầu giường…"
                  
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Phạm vi khu vực</label>
                  <Select
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value as MaintenanceScope)}
                    className="font-medium"
                  >
                    <option value="COMPARTMENT_PRIVATE">Buồng cá nhân · Giường riêng</option>
                    <option value="ROOM_SHARED">Khu vực phòng chung · WC, ban công</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Mức độ ưu tiên</label>
                  <Select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as MaintenanceUrgency)}
                    className="font-medium"
                  >
                    <option value="NORMAL">Bình thường · xử lý trong 24h</option>
                    <option value="EMERGENCY">Khẩn cấp · cháy nổ, vỡ ống, xử lý trong 2h</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Phân loại sự cố</label>
                  <Select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MaintenanceCategory)}
                    className="font-medium"
                  >
                    <option value="ELECTRIC">Hệ thống Điện</option>
                    <option value="PLUMBING">Nước & Thiết bị WC</option>
                    <option value="HVAC">Điều hòa không khí</option>
                    <option value="FURNITURE">Nội thất / Giường tủ</option>
                    <option value="NETWORK">Mạng Internet / Wifi</option>
                    <option value="OTHER">Khác</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Phòng & Vị trí</label>
                  <Input
                    type="text"
                    value={`${formBuilding} - ${formRoom} (${formCompartment})`}
                    disabled
                    className="text-muted-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Mô tả chi tiết sự cố</label>
                <Textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả hiện trạng hư hỏng, vị trí hoặc dấu hiệu bất thường..."
                  
                />
              </div>

              <div>
                <ImageUpload
                  storageKey="dms_maintenance_create_photos"
                  label="Ảnh chụp hiện trường"
                  hint="JPG/PNG/WebP, mỗi ảnh ≤ 5MB, tối đa 5 ảnh, lưu kèm phiếu."
                  value={formPhotos}
                  onChange={setFormPhotos}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
                >
                  Hủy bỏ
                </button>
                <Button type="submit">
                  Gửi yêu cầu
                </Button>
              </div>

              {/* Lỗi máy chủ khi tạo phiếu (thiếu quyền, dữ liệu sai) — nói thẳng. */}
              <MutationErrorBox error={mutationError} scope="CREATE" />
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TICKET (U in CRUD) */}
      {isEditModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border my-8">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted text-foreground flex items-center justify-center">
                  <Pencil className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-foreground text-base">Chỉnh sửa phiếu {activeTicket.id}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề sự cố</label>
                <Input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Mức độ ưu tiên</label>
                  <Select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as MaintenanceUrgency)}
                    className="font-medium"
                  >
                    <option value="NORMAL">Bình thường</option>
                    <option value="EMERGENCY">Khẩn cấp</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Phân loại</label>
                  <Select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MaintenanceCategory)}
                    className="font-medium"
                  >
                    <option value="ELECTRIC">Hệ thống Điện</option>
                    <option value="PLUMBING">Nước & Thiết bị WC</option>
                    <option value="HVAC">Điều hòa không khí</option>
                    <option value="FURNITURE">Nội thất / Giường tủ</option>
                    <option value="NETWORK">Mạng Internet</option>
                    <option value="OTHER">Khác</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Mô tả sự cố</label>
                <Textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
                >
                  Hủy
                </button>
                <Button type="submit" disabled={savingTicketId === activeTicket.id}>
                  Lưu thay đổi
                </Button>
              </div>

              {/* Lỗi máy chủ khi sửa phiếu (ví dụ phiếu đã sang trạng thái khác). */}
              <MutationErrorBox error={mutationError} scope="EDIT" />
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW DETAILS (R in CRUD) */}
      {isViewModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-border my-8">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                    {activeTicket.id}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary-soft text-primary-soft-foreground border border-primary/20">
                    {activeTicket.status}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-lg mt-1">{activeTicket.title}</h3>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-foreground">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Mô tả sự cố</span>
                <ExpandableText
                  className="mt-1 rounded-xl border border-border bg-muted p-3"
                  textClassName="text-xs text-foreground"
                >
                  {activeTicket.description}
                </ExpandableText>
              </div>

              {activeTicket.evidenceImages && activeTicket.evidenceImages.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Ảnh hiện trường</span>
                  <div className="mt-1.5 flex gap-2 overflow-x-auto">
                    {activeTicket.evidenceImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Evidence"
                        className="h-28 w-40 object-cover rounded-xl border border-border shadow-2xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Technician Info */}
              {activeTicket.assignedTechnician && (
                <div className="p-3.5 bg-primary-soft border border-primary/20 rounded-xl">
                  <span className="text-xs font-bold text-primary-soft-foreground block mb-1">Thông tin Kỹ thuật viên</span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-primary-soft-foreground">
                    <div>Tên: <strong>{activeTicket.assignedTechnician.name}</strong></div>
                    <div>Điện thoại: <strong>{activeTicket.assignedTechnician.phone}</strong></div>
                    <div>Thời gian nhận: {activeTicket.assignedTechnician.assignedAt}</div>
                    <div>Dự kiến hoàn thành: {activeTicket.assignedTechnician.etaMinutes} phút</div>
                  </div>
                </div>
              )}

              {/* Resolution Info */}
              {activeTicket.resolution && (
                <div className="p-3.5 bg-success-soft border border-success/25 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-success-soft-foreground block">Biên bản nghiệm thu sửa chữa</span>
                  <p className="text-xs text-success-soft-foreground">{activeTicket.resolution.technicianNotes}</p>
                  {activeTicket.resolution.materials.length > 0 && (
                    <div className="mt-2 text-xs">
                      <strong className="text-success-soft-foreground block mb-1">Vật tư thay thế:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-success-soft-foreground">
                        {activeTicket.resolution.materials.map((m) => (
                          <li key={m.id}>
                            {m.name} x {m.quantity} = {m.unitCost.toLocaleString("vi-VN")} đ ({m.paidBy === "DORMITORY" ? "KTX chi trả" : "Sinh viên chi trả"})
                          </li>
                        ))}
                      </ul>
                      <div className="mt-1.5 font-bold text-success-soft-foreground">
                        Tổng chi phí: {activeTicket.resolution.totalMaterialCost.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-foreground text-white hover:bg-black transition-colors"
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
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border">
            <h3 className="font-bold text-foreground text-base mb-1">Phân công Kỹ thuật viên</h3>
            <p className="text-xs text-muted-foreground mb-4">Gán thợ sửa chữa cho phiếu {activeTicket.id}</p>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Kỹ thuật viên phụ trách</label>
                <Select
                  value={assignTechName}
                  onChange={(e) => {
                    setAssignTechName(e.target.value)
                    if (e.target.value === "Chú Đỗ Mạnh Hùng") setAssignTechPhone("0977 112 233")
                    if (e.target.value === "Anh Lê Quốc Tuấn") setAssignTechPhone("0918 889 900")
                    if (e.target.value === "Anh Vũ Trọng Nghĩa") setAssignTechPhone("0934 567 890")
                  }}
                  
                >
                  <option value="Chú Đỗ Mạnh Hùng">Chú Đỗ Mạnh Hùng · Trưởng ban Điện lạnh</option>
                  <option value="Anh Lê Quốc Tuấn">Anh Lê Quốc Tuấn · Kỹ thuật điện dân dụng</option>
                  <option value="Anh Vũ Trọng Nghĩa">Anh Vũ Trọng Nghĩa · Thợ nước và vệ sinh</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Số điện thoại liên hệ</label>
                <Input
                  type="text"
                  value={assignTechPhone}
                  onChange={(e) => setAssignTechPhone(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Thời gian dự kiến có mặt (phút)</label>
                <Input
                  type="number"
                  min={15}
                  max={240}
                  value={assignEtaMinutes}
                  onChange={(e) => setAssignEtaMinutes(Number(e.target.value))}
                  
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-foreground"
                >
                  Hủy
                </button>
                <Button type="submit" disabled={savingTicketId === activeTicket.id}>
                  Xác nhận phân công
                </Button>
              </div>

              {/* Lỗi máy chủ khi phân công (ví dụ không phải quản lý/admin -> 403). */}
              <MutationErrorBox error={mutationError} scope="ASSIGN" />
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: COMPLETE TICKET */}
      {isCompleteModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border my-8">
            <h3 className="font-bold text-foreground text-base mb-1">Báo cáo hoàn thành sửa chữa</h3>
            <p className="text-xs text-muted-foreground mb-4">Nghiệm thu sự cố {activeTicket.id}</p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Ghi chú xử lý kỹ thuật</label>
                <Textarea
                  rows={2}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Đã thay thế linh kiện, đo nguồn điện ổn định..."
                  
                />
              </div>

              {/* Material Logging */}
              <div className="p-3 bg-muted rounded-xl border border-border">
                <span className="text-xs font-bold text-foreground block mb-2">Vật tư thay thế</span>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    type="text"
                    placeholder="Tên vật tư..."
                    value={newMatName}
                    onChange={(e) => setNewMatName(e.target.value)}
                    className="col-span-2"
                  />
                  <Input
                    type="number"
                    placeholder="SL"
                    value={newMatQty}
                    onChange={(e) => setNewMatQty(Number(e.target.value))}
                    
                  />
                </div>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="number"
                    placeholder="Đơn giá VNĐ"
                    value={newMatCost}
                    onChange={(e) => setNewMatCost(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Select
                    value={newMatPayer}
                    onChange={(e) => setNewMatPayer(e.target.value as "DORMITORY" | "STUDENT")}
                    
                  >
                    <option value="DORMITORY">KTX chi trả</option>
                    <option value="STUDENT">SV bồi thường</option>
                  </Select>
                  <Button type="button"
                    onClick={handleAddMaterial}>
                    Thêm
                  </Button>
                </div>

                {materials.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {materials.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between text-xs bg-card p-2 rounded-lg border border-border"
                      >
                        <span>
                          {m.name} × {m.quantity} · {m.unitCost.toLocaleString("vi-VN")} đ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(m.id)}
                          className="text-danger hover:text-danger-soft-foreground text-xs font-bold"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ImageUpload
                storageKey="dms_maintenance_complete_photos"
                label="Ảnh sau khi hoàn thành"
                hint="Chụp rõ hạng mục đã sửa. Tối đa 5 ảnh JPG/PNG/WebP ≤ 5MB."
                value={completionPhotos}
                onChange={setCompletionPhotos}
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-foreground"
                >
                  Hủy
                </button>
                <Button variant="success" className="hover:bg-success" type="submit" disabled={savingTicketId === activeTicket.id}>
                  Xác nhận hoàn thành
                </Button>
              </div>

              {/* Lỗi máy chủ khi nghiệm thu (ví dụ vai trò không được phép -> 403). */}
              <MutationErrorBox error={mutationError} scope="COMPLETE" />
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: STUDENT REVIEW & STAR RATING */}
      {isReviewModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border text-center">
            <div className="h-12 w-12 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <h3 className="font-bold text-foreground text-base">Đánh giá chất lượng sửa chữa</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
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
                        star <= ratingStars ? "text-primary fill-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <Textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Chia sẻ nhận xét về thời gian, thái độ của kỹ thuật viên..."
                  
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-foreground"
                >
                  Bỏ qua
                </button>
                <Button className="hover:bg-primary" type="submit" disabled={savingTicketId === activeTicket.id}>
                  Gửi đánh giá
                </Button>
              </div>

              {/* Lỗi máy chủ khi đánh giá (chỉ chủ phiếu được đánh giá -> 403). */}
              <MutationErrorBox error={mutationError} scope="REVIEW" />
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: DELETE CONFIRMATION (D in CRUD) */}
      {deleteConfirmTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border text-center">
            <div className="h-12 w-12 rounded-full bg-danger-soft text-danger-soft-foreground flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-foreground text-base">Xác nhận xóa phiếu yêu cầu</h3>
            <p className="text-xs text-muted-foreground mt-2 mb-5">
              Bạn có chắc chắn muốn xóa vĩnh viễn phiếu <strong>{deleteConfirmTicketId}</strong> không? Hành động này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setDeleteConfirmTicketId(null)
                  setMutationError(null)
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-foreground hover:bg-muted"
              >
                Hủy bỏ
              </button>
              <Button
                variant="destructive"
                className="hover:bg-danger"
                disabled={savingTicketId === deleteConfirmTicketId}
                onClick={() => handleDeleteTicket(deleteConfirmTicketId)}
              >
                Xóa phiếu
              </Button>
            </div>

            {/* Lỗi máy chủ khi xóa (ví dụ phiếu đã sang IN_PROGRESS -> 403). */}
            <div className="mt-3 text-left">
              <MutationErrorBox error={mutationError} scope="DELETE" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
