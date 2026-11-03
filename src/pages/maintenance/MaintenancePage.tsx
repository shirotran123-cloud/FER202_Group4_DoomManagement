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
import {
  Wrench,
  Plus,
  Search,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
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
    showToast(`Đã tạo thành công phiếu yêu cầu ${newId}!`)
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
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.studentName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      filterStatus === "ALL" || ticket.status === filterStatus
    const matchesUrgency =
      filterUrgency === "ALL" || ticket.urgency === filterUrgency
    const matchesScope = filterScope === "ALL" || ticket.scope === filterScope

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

      {/* Header & Quick Action (8pt Grid: p-6 sm:p-8) */}
      <ScrollReveal>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10 text-secondary">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {user?.role === "manager" || user?.role === "admin"
                    ? "Điều Phối Báo Hỏng & Bảo Trì Tòa A"
                    : "Báo Hỏng & Yêu Cầu Sửa Chữa Thiết Bị"}
                </h1>
                <p className="text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
                  {user?.role === "manager" || user?.role === "admin"
                    ? "Theo dõi tiến độ, phân công kỹ thuật viên Tòa A xử lý sự cố cơ sở vật chất"
                    : "Gửi yêu cầu sửa chữa thiết bị buồng & theo dõi tiến độ nghiệm thu"}
                </p>
              </div>
            </div>

            {user?.role === "student" && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="lg"
                className="shrink-0 gap-2 font-bold shadow-xs"
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
        <Card className="space-y-4 p-6">
          <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Input
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã phiếu, phòng, tên sinh viên hoặc sự cố..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Urgency & Scope Selects */}
            <div className="flex items-center gap-4">
              <Select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="w-44"
              >
                <option value="ALL">Mức độ: Tất cả</option>
                <option value="NORMAL">Bình thường</option>
                <option value="EMERGENCY">Khẩn cấp</option>
              </Select>

              <Select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
                className="w-44"
              >
                <option value="ALL">Phạm vi: Tất cả</option>
                <option value="ROOM_SHARED">Phòng chung</option>
                <option value="COMPARTMENT_PRIVATE">Buồng cá nhân</option>
              </Select>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-t border-border pt-4">
            {[
              { id: "ALL", label: "Tất cả phiếu" },
              { id: "PENDING", label: "Chờ tiếp nhận" },
              { id: "IN_PROGRESS", label: "Đang sửa chữa" },
              { id: "RESOLVED", label: "Chờ nghiệm thu" },
              { id: "CLOSED", label: "Đã hoàn thành" },
            ].map((tab) => {
              const isActive = filterStatus === tab.id
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterStatus(tab.id)}
                  className="font-semibold whitespace-nowrap"
                >
                  <span>{tab.label}</span>
                </Button>
              )
            })}
          </div>
        </Card>
      </ScrollReveal>

      {/* Tickets List View (Staggered 100ms) */}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setFilterStatus("ALL")
                setFilterUrgency("ALL")
                setFilterScope("ALL")
              }}
              className="mt-6"
            >
              <span>Đặt lại bộ lọc</span>
            </Button>
          </Card>
        </ScrollReveal>
      ) : (
        <StaggerContainer staggerDelay={0.1} className="flex flex-col gap-4">
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
    </div>
  )
}
