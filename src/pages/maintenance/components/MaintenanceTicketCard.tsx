import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Star,
  Info,
  Edit2,
  Trash2,
} from "lucide-react"
import type { MaintenanceTicket } from "@/types/maintenance"

interface MaintenanceTicketCardProps {
  ticket: MaintenanceTicket
  isManagerOrAdmin: boolean
  isTechnician: boolean
  onView: (ticket: MaintenanceTicket) => void
  onEdit: (ticket: MaintenanceTicket) => void
  onDelete: (id: string) => void
  onAssign: (ticket: MaintenanceTicket) => void
  onComplete: (ticket: MaintenanceTicket) => void
  onReview: (ticket: MaintenanceTicket) => void
}

export const MaintenanceTicketCard: React.FC<MaintenanceTicketCardProps> = ({
  ticket,
  isManagerOrAdmin,
  isTechnician,
  onView,
  onEdit,
  onDelete,
  onAssign,
  onComplete,
  onReview,
}) => {
  const isEmergency = ticket.urgency === "EMERGENCY"
  const isPending = ticket.status === "PENDING"
  const isInProgress = ticket.status === "IN_PROGRESS"
  const isResolved = ticket.status === "RESOLVED"
  const isClosed = ticket.status === "CLOSED"

  return (
    <Card
      className={`flex flex-col justify-between p-5 transition-all hover:shadow-md ${
        isEmergency ? "border-destructive/40" : ""
      }`}
    >
      <div>
        {/* Card Header: Code, Badges, Status */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
              {ticket.id}
            </span>

            {/* Scope Badge */}
            <Badge variant="outline" className="font-semibold">
              {ticket.scope === "ROOM_SHARED" ? "Phòng chung" : "Buồng cá nhân"}
            </Badge>

            {/* Urgency Badge */}
            {isEmergency ? (
              <Badge variant="maintenance" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Khẩn cấp (2h)</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="font-normal text-muted-foreground"
              >
                Bình thường
              </Badge>
            )}
          </div>

          {/* Status Badge */}
          {isPending && <Badge variant="holding">Chờ tiếp nhận</Badge>}
          {isInProgress && <Badge variant="occupied">Đang xử lý</Badge>}
          {isResolved && <Badge variant="available">Chờ nghiệm thu</Badge>}
          {isClosed && <Badge variant="outline">Đã hoàn thành</Badge>}
        </div>

        {/* Title & Description */}
        <h3 className="line-clamp-1 text-base font-bold text-foreground">
          {ticket.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {ticket.description}
        </p>

        {/* Location Meta Box */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted p-2.5 text-xs">
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
            <span className="font-mono text-foreground/80">
              {ticket.createdAt}
            </span>
          </div>
        </div>

        {/* Assigned Technician if available */}
        {ticket.assignedTechnician && (
          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-secondary/20 bg-muted p-2 text-xs text-secondary">
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              <span>
                Kỹ thuật: <strong>{ticket.assignedTechnician.name}</strong> (
                {ticket.assignedTechnician.phone})
              </span>
            </div>
            <span className="text-[11px] font-medium">
              ETA: {ticket.assignedTechnician.etaMinutes}p
            </span>
          </div>
        )}

        {/* Review Stars if closed */}
        {ticket.review && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-primary/20 bg-muted p-2 text-xs text-primary">
            <div className="flex text-cyan-500">
              {[...Array(ticket.review.rating)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="text-[11px] text-foreground/80 italic">
              "{ticket.review.comment}"
            </span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(ticket)}
            className="gap-1 text-xs"
          >
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Chi tiết</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(ticket)}
            className="gap-1 text-xs"
            title="Sửa phiếu"
          >
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Sửa</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(ticket.id)}
            className="gap-1 text-xs text-destructive hover:bg-destructive/10"
            title="Xóa phiếu"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Xóa</span>
          </Button>
        </div>

        {/* Contextual Workflow Action Buttons */}
        <div className="flex items-center gap-1.5">
          {isManagerOrAdmin && isPending && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAssign(ticket)}
              className="gap-1 text-xs font-bold"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Phân công thợ</span>
            </Button>
          )}

          {isTechnician && isInProgress && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onComplete(ticket)}
              className="gap-1 text-xs font-bold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Báo hoàn thành</span>
            </Button>
          )}

          {isResolved && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onReview(ticket)}
              className="gap-1 bg-cyan-500 text-xs font-bold text-white hover:bg-cyan-600"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>Đánh giá sao</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
