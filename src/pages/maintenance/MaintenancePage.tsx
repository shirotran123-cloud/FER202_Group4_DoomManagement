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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal"
import { RollingText } from "@animate-ui/react/primitives/texts/rolling"
import {
  Wrench,
  Plus,
  Search,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
  RotateCcw,
} from "lucide-react"

// Decomposed components
import { MaintenanceTicketCard } from "./components/MaintenanceTicketCard"
import { TechnicianBountyBoard } from "./components/TechnicianBountyBoard"
import { CreateTicketModal } from "./components/CreateTicketModal"
import { EditTicketModal } from "./components/EditTicketModal"
import { ViewTicketModal } from "./components/ViewTicketModal"
import { AssignTechnicianModal } from "./components/AssignTechnicianModal"
import { CompleteTicketModal } from "./components/CompleteTicketModal"
import { ReviewTicketModal } from "./components/ReviewTicketModal"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { TicketCreatedSuccessModal } from "./components/TicketCreatedSuccessModal"

const STORAGE_KEY_TICKETS = "dms_maintenance_tickets_v2"

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

  // Modals & Active ticket state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [deleteConfirmTicketId, setDeleteConfirmTicketId] = useState<
    string | null
  >(null)
  const [activeTicket, setActiveTicket] = useState<MaintenanceTicket | null>(
    null
  )
  const [createdTicketSuccess, setCreatedTicketSuccess] = useState<MaintenanceTicket | null>(
    null
  )

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Handlers
  const handleCreateSubmit = (data: {
    title: string
    scope: MaintenanceScope
    category: MaintenanceCategory
    urgency: MaintenanceUrgency
    description: string
    image?: string
  }) => {
    const newId = `MT-2026-${String(tickets.length + 1).padStart(3, "0")}`
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`

    const newTicket: MaintenanceTicket = {
      id: newId,
      title: data.title,
      scope: data.scope,
      category: data.category,
      urgency: data.urgency,
      description: data.description,
      status: "PENDING",
      createdAt: timeStr,
      studentId: user?.id || "STU-8492",
      studentName: user?.fullName || "Nguyễn Hoàng Vinh",
      studentPhone: "0912 345 678",
      building: "Tòa A",
      room: "A205",
      compartment: "Buồng B",
      bedCode: "B-G03",
      evidenceImages: data.image ? [data.image] : [],
    }

    setTickets([newTicket, ...tickets])
    setCreatedTicketSuccess(newTicket)
  }

  const handleEditSubmit = (data: {
    title: string
    urgency: MaintenanceUrgency
    category: MaintenanceCategory
    description: string
  }) => {
    if (!activeTicket) return
    setTickets(
      tickets.map((t) => (t.id === activeTicket.id ? { ...t, ...data } : t))
    )
    showToast(`Đã cập nhật thông tin phiếu ${activeTicket.id}!`)
  }

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter((t) => t.id !== ticketId))
    showToast(`Đã xóa vĩnh viễn phiếu ${ticketId}.`)
  }

  const handleAssignSubmit = (data: {
    techName: string
    techPhone: string
    etaMinutes: number
  }) => {
    if (!activeTicket) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`

    setTickets(
      tickets.map((t) => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: "IN_PROGRESS",
            assignedTechnician: {
              id: "TECH-01",
              name: data.techName,
              phone: data.techPhone,
              assignedAt: timeStr,
              etaMinutes: data.etaMinutes,
            },
          }
        }
        return t
      })
    )
    showToast(`Đã phân công ${data.techName} xử lý phiếu ${activeTicket.id}!`)
  }

  const handleTechAccept = (ticket: MaintenanceTicket) => {
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`

    const updatedTickets = tickets.map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          status: "IN_PROGRESS" as const,
          assignedTechnician: {
            id: user?.id || "usr_tech_01",
            name: user?.fullName || "Đỗ Mạnh Hùng",
            phone: user?.phone || "0977 112 233",
            assignedAt: timeStr,
            etaMinutes: 30,
          },
        }
      }
      return t
    })
    setTickets(updatedTickets)
    showToast(
      `⚔️ Đã tiếp nhận nhiệm vụ ${ticket.id}! Đang di chuyển tới Phòng ${ticket.room}.`
    )
  }

  const handleCompleteSubmit = (data: {
    notes: string
    materials: ReplacedMaterial[]
    completionImage?: string
  }) => {
    if (!activeTicket) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`

    const totalCost = data.materials.reduce(
      (sum, m) => sum + m.unitCost * m.quantity,
      0
    )

    setTickets(
      tickets.map((t) => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: "RESOLVED",
            resolution: {
              completedAt: timeStr,
              technicianNotes: data.notes,
              materials: data.materials,
              totalMaterialCost: totalCost,
              completionImages: data.completionImage
                ? [data.completionImage]
                : [],
            },
          }
        }
        return t
      })
    )
    showToast(`Đã báo hoàn thành sửa chữa phiếu ${activeTicket.id}!`)
  }

  const handleReviewSubmit = (data: { stars: number; comment: string }) => {
    if (!activeTicket) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`

    setTickets(
      tickets.map((t) => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            status: "CLOSED",
            review: {
              rating: data.stars,
              comment: data.comment,
              reviewedAt: timeStr,
              isSatisfied: data.stars >= 4,
            },
          }
        }
        return t
      })
    )
    showToast(`Cảm ơn bạn! Đã ghi nhận đánh giá ${data.stars} sao cho phiếu.`)
  }

  // Filter Logic
  const filteredTickets = tickets.filter((ticket) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (ticket.id || "").toLowerCase().includes(q) ||
      (ticket.title || "").toLowerCase().includes(q) ||
      (ticket.room || "").toLowerCase().includes(q) ||
      (ticket.studentName || "").toLowerCase().includes(q)

    const matchesStatus =
      filterStatus === "ALL" || ticket.status === filterStatus
    const matchesUrgency =
      filterUrgency === "ALL" || ticket.urgency === filterUrgency
    const matchesScope =
      filterScope === "ALL" || ticket.scope === filterScope

    return matchesSearch && matchesStatus && matchesUrgency && matchesScope
  })

  // Giao diện riêng cho Kỹ thuật viên Tòa A: Bounty Hunter Quest Board
  if (user?.role === "technician") {
    return (
      <div className="space-y-8 pb-16">
        {toastMessage && (
          <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-xl slide-in-from-bottom-5 fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
            <span>{toastMessage}</span>
          </div>
        )}

        <ScrollReveal>
          <TechnicianBountyBoard
            tickets={tickets}
            technicianName={user?.fullName || "Đỗ Mạnh Hùng"}
            building="Tòa A"
            onAccept={handleTechAccept}
            onComplete={(t) => {
              setActiveTicket(t)
              setIsCompleteModalOpen(true)
            }}
            onView={(t) => {
              setActiveTicket(t)
              setIsViewModalOpen(true)
            }}
          />
        </ScrollReveal>

        <CompleteTicketModal
          isOpen={isCompleteModalOpen}
          onClose={() => {
            setIsCompleteModalOpen(false)
            setActiveTicket(null)
          }}
          ticket={activeTicket}
          onSubmit={handleCompleteSubmit}
        />

        <ViewTicketModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setActiveTicket(null)
          }}
          ticket={activeTicket}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-xl slide-in-from-bottom-5 fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action (8pt Grid: p-4 sm:p-6 sm:p-8) */}
      <ScrollReveal>
        <Card className="p-4 sm:p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-secondary/20 bg-secondary/10 text-secondary">
                <Wrench className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                  <RollingText
                    text={
                      user?.role === "manager" || user?.role === "admin"
                        ? "Điều Phối Báo Hỏng & Bảo Trì Tòa A"
                        : "Báo Hỏng & Yêu Cầu Sửa Chữa"
                    }
                  />
                </h1>
                <p className="text-xs sm:text-sm leading-relaxed font-normal text-muted-foreground line-clamp-2 sm:line-clamp-none">
                  {user?.role === "manager" || user?.role === "admin"
                    ? "Theo dõi tiến độ, phân công kỹ thuật viên Tòa A xử lý sự cố cơ sở vật chất"
                    : "Gửi yêu cầu sửa chữa thiết bị buồng & theo dõi tiến độ nghiệm thu"}
                </p>
              </div>
            </div>

            {user?.role === "student" && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="default"
                className="w-full sm:w-auto shrink-0 justify-center gap-2 font-bold shadow-xs text-xs sm:text-sm h-10 sm:h-11"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo phiếu báo hỏng mới</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </ScrollReveal>

      {/* Filters & Search Control Bar */}
      <ScrollReveal delay={0.05}>
        <Card className="space-y-3 sm:space-y-4 p-3.5 sm:p-6">
          <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <Input
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã phiếu, phòng, sinh viên..."
                className="h-9 sm:h-10 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Urgency & Scope Selects - Grid 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:gap-3">
              <div className="w-full sm:w-44">
                <Select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="w-full text-xs font-semibold"
                >
                  <option value="ALL">Mức độ: Tất cả</option>
                  <option value="NORMAL">Bình thường</option>
                  <option value="EMERGENCY">Khẩn cấp</option>
                </Select>
              </div>

              <div className="w-full sm:w-44">
                <Select
                  value={filterScope}
                  onChange={(e) => setFilterScope(e.target.value)}
                  className="w-full text-xs font-semibold"
                >
                  <option value="ALL">Phạm vi: Tất cả</option>
                  <option value="ROOM_SHARED">Phòng chung</option>
                  <option value="COMPARTMENT_PRIVATE">Buồng cá nhân</option>
                </Select>
              </div>

              {(filterStatus !== "ALL" || filterUrgency !== "ALL" || filterScope !== "ALL" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterStatus("ALL")
                    setFilterUrgency("ALL")
                    setFilterScope("ALL")
                  }}
                  title="Đặt lại toàn bộ bộ lọc về mặc định"
                  className="h-9 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground col-span-2 sm:col-span-1"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  <span>Xóa lọc</span>
                </Button>
              )}
            </div>
          </div>

          {/* Status Filter Tabs - Scrollable with no-scrollbar */}
          <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pt-2.5 pb-0.5 border-t border-border">
            {[
              { id: "ALL", label: "Tất cả phiếu" },
              { id: "PENDING", label: "Chờ tiếp nhận" },
              { id: "IN_PROGRESS", label: "Đang sửa chữa" },
              { id: "RESOLVED", label: "Chờ nghiệm thu" },
              { id: "CLOSED", label: "Đã hoàn thành" },
            ].map((tab) => {
              const isActive = filterStatus === tab.id
              const tabCount =
                tab.id === "ALL"
                  ? tickets.length
                  : tickets.filter((t) => t.status === tab.id).length

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterStatus(tab.id)}
                  className={`h-8 shrink-0 px-2.5 sm:px-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive ? "shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tabCount}
                  </span>
                </Button>
              )
            })}
          </div>
        </Card>
      </ScrollReveal>

      {/* Tickets List View (Staggered with dynamic key for clean animation) */}
      {filteredTickets.length === 0 ? (
        <ScrollReveal>
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Info className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Không tìm thấy phiếu yêu cầu nào
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc trạng
              thái.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setFilterStatus("ALL")
                  setFilterUrgency("ALL")
                  setFilterScope("ALL")
                }}
              >
                <span>Đặt lại bộ lọc</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setTickets(INITIAL_MAINTENANCE_TICKETS)
                  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_MAINTENANCE_TICKETS))
                  setSearchQuery("")
                  setFilterStatus("ALL")
                  setFilterUrgency("ALL")
                  setFilterScope("ALL")
                  showToast("Đã khôi phục toàn bộ danh sách phiếu mẫu!")
                }}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Khôi phục dữ liệu mẫu</span>
              </Button>
            </div>
          </Card>
        </ScrollReveal>
      ) : (
        <StaggerContainer
          key={`tickets-${filterStatus}-${filterUrgency}-${filterScope}-${searchQuery}`}
          staggerDelay={0.06}
          className="flex flex-col gap-4"
        >
          {filteredTickets.map((ticket) => (
            <StaggerItem key={ticket.id}>
              <MaintenanceTicketCard
                ticket={ticket}
                currentUser={user}
                isManagerOrAdmin={isManagerOrAdmin}
                isTechnician={isTechnician}
                onView={(t) => {
                  setActiveTicket(t)
                  setIsViewModalOpen(true)
                }}
                onEdit={(t) => {
                  setActiveTicket(t)
                  setIsEditModalOpen(true)
                }}
                onDelete={(id) => setDeleteConfirmTicketId(id)}
                onAssign={(t) => {
                  setActiveTicket(t)
                  setIsAssignModalOpen(true)
                }}
                onComplete={(t) => {
                  setActiveTicket(t)
                  setIsCompleteModalOpen(true)
                }}
                onReview={(t) => {
                  setActiveTicket(t)
                  setIsReviewModalOpen(true)
                }}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        userLocation={{
          building: "Tòa A",
          room: "A205",
          compartment: "Buồng B",
        }}
      />

      <EditTicketModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setActiveTicket(null)
        }}
        ticket={activeTicket}
        onSubmit={handleEditSubmit}
      />

      <ViewTicketModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setActiveTicket(null)
        }}
        ticket={activeTicket}
      />

      <AssignTechnicianModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false)
          setActiveTicket(null)
        }}
        ticket={activeTicket}
        onSubmit={handleAssignSubmit}
      />

      <CompleteTicketModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false)
          setActiveTicket(null)
        }}
        ticket={activeTicket}
        onSubmit={handleCompleteSubmit}
      />

      <ReviewTicketModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false)
          setActiveTicket(null)
        }}
        ticket={activeTicket}
        onSubmit={handleReviewSubmit}
      />

      <DeleteConfirmModal
        isOpen={!!deleteConfirmTicketId}
        ticketId={deleteConfirmTicketId}
        onClose={() => setDeleteConfirmTicketId(null)}
        onConfirm={handleDeleteTicket}
      />

      {/* Màn hình nổi thông báo đã gửi yêu cầu thành công với dấu tick xanh to */}
      <TicketCreatedSuccessModal
        isOpen={!!createdTicketSuccess}
        onClose={() => setCreatedTicketSuccess(null)}
        ticket={createdTicketSuccess}
        onViewTicket={(t) => {
          setActiveTicket(t)
          setIsViewModalOpen(true)
        }}
      />
    </div>
  )
}
