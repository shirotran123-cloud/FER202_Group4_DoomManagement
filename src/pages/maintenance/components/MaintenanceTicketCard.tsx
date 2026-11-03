import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  UserCheck,
  Star,
  Edit2,
  Trash2,
  FileCheck2,
} from "lucide-react"
import type { MaintenanceTicket } from "@/types/maintenance"
import type { UserProfile } from "@/types/auth"

interface MaintenanceTicketCardProps {
  ticket: MaintenanceTicket
  currentUser?: UserProfile | null
  isManagerOrAdmin: boolean
  isTechnician: boolean
  onView?: (ticket: MaintenanceTicket) => void
  onEdit: (ticket: MaintenanceTicket) => void
  onDelete: (id: string) => void
  onAssign: (ticket: MaintenanceTicket) => void
  onComplete: (ticket: MaintenanceTicket) => void
  onReview: (ticket: MaintenanceTicket) => void
}

export const MaintenanceTicketCard: React.FC<MaintenanceTicketCardProps> = ({
  ticket,
  currentUser,
  isManagerOrAdmin,
  isTechnician: _isTechnician,
  onEdit,
  onDelete,
  onAssign: _onAssign,
  onComplete: _onComplete,
  onReview,
}) => {
  const isEmergency = ticket.urgency === "EMERGENCY"
  const isPending = ticket.status === "PENDING"
  const isInProgress = ticket.status === "IN_PROGRESS"
  const isResolved = ticket.status === "RESOLVED"
  const isClosed = ticket.status === "CLOSED"

  const isMyTicket =
    ticket.studentId === currentUser?.studentId ||
    ticket.studentName === currentUser?.fullName ||
    ticket.studentId === currentUser?.id

  const canEditOrDelete =
    isManagerOrAdmin || (isMyTicket && ticket.status === "PENDING")

  const canReview = isManagerOrAdmin && isResolved

  return (
    <Card
      className={`group relative flex flex-col justify-between p-6 ${
        isEmergency ? "border-destructive/40" : ""
      }`}
    >
      <div>
        {/* Tiêu đề & Mô tả (Luôn hiển thị) */}
        <h3 className="text-lg font-bold leading-snug text-foreground">
          {ticket.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed font-normal text-muted-foreground">
          {ticket.description}
        </p>

        {/* CHI TIẾT BỔ SUNG (Chỉ hiển thị khi rê chuột vào - Group Hover) */}
        <div className="mt-4 hidden animate-in space-y-4 border-t border-border pt-4 duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] fade-in group-hover:block">
          {/* Thông tin vị trí, khu vực, người báo, thời gian */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/60 p-4 text-xs sm:grid-cols-4">
            <div>
              <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Vị trí
              </span>
              <strong className="text-xs text-foreground">
                {ticket.building} - {ticket.room}
              </strong>
            </div>
            <div>
              <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Khu vực
              </span>
              <strong className="block truncate text-xs text-foreground">
                {ticket.bedCode || ticket.compartment || "Phòng chung"}
              </strong>
            </div>
            <div>
              <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Người báo
              </span>
              <strong className="block truncate text-xs text-foreground">
                {ticket.studentName} {isMyTicket ? "(Bạn)" : ""}
              </strong>
            </div>
            <div>
              <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Thời gian
              </span>
              <span className="font-mono text-xs text-foreground/90">
                {ticket.createdAt}
              </span>
            </div>
          </div>

          {/* Kỹ thuật & Dự kiến hoàn thành */}
          {ticket.assignedTechnician ? (
            <div className="flex flex-col justify-between gap-2 rounded-2xl border border-secondary/20 bg-muted/50 p-4 text-xs text-secondary sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 shrink-0 text-secondary" />
                <span>
                  Kỹ thuật phụ trách:{" "}
                  <strong>{ticket.assignedTechnician.name}</strong> (
                  {ticket.assignedTechnician.phone})
                </span>
              </div>
              <span className="shrink-0 self-start rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold sm:self-auto">
                Dự kiến hoàn thành: {ticket.assignedTechnician.etaMinutes} phút
              </span>
            </div>
          ) : (
            <div className="px-1 text-xs italic text-muted-foreground">
              Kỹ thuật: Chưa phân công điều phối
            </div>
          )}

          {/* Biên bản nghiệm thu sửa chữa (nếu có) */}
          {ticket.resolution && (
            <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs">
              <div className="flex items-center justify-between font-bold text-primary">
                <span className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" />
                  Biên bản nghiệm thu sửa chữa
                </span>
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  Hoàn tất: {ticket.resolution.completedAt}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/80">
                {ticket.resolution.technicianNotes}
              </p>
              {ticket.resolution.materials &&
                ticket.resolution.materials.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-2 text-xs text-muted-foreground">
                    <span>
                      Vật tư:{" "}
                      {ticket.resolution.materials
                        .map((m) => `${m.name} (x${m.quantity})`)
                        .join(", ")}
                    </span>
                    {ticket.resolution.totalMaterialCost ? (
                      <span className="font-mono font-bold text-primary">
                        Chi phí: ₫
                        {ticket.resolution.totalMaterialCost.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                )}
            </div>
          )}

          {/* Đánh giá sao (nếu có) */}
          {ticket.review && (
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 p-4 text-xs">
              <div className="flex text-amber-500">
                {[...Array(ticket.review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-xs italic text-foreground/90">
                "{ticket.review.comment}"
              </span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {ticket.review.reviewedAt}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        {/* Left: Labels + Sửa/Xóa */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono font-bold text-foreground">
            {ticket.id}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-medium text-muted-foreground">
            {ticket.scope === "ROOM_SHARED" ? "Phòng chung" : "Buồng cá nhân"}
          </span>
          <span className="text-muted-foreground/40">•</span>
          {isEmergency ? (
            <span className="inline-flex items-center gap-1 font-bold text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Khẩn cấp</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Bình thường</span>
          )}
          <span className="text-muted-foreground/40">•</span>
          {isPending && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              <span>Chờ tiếp nhận</span>
            </span>
          )}
          {isInProgress && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span>Đang xử lý</span>
            </span>
          )}
          {isResolved && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Chờ nghiệm thu</span>
            </span>
          )}
          {isClosed && (
            <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span>Đã hoàn thành</span>
            </span>
          )}
          {isMyTicket && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs font-bold text-primary">Của bạn</span>
            </>
          )}

          {canEditOrDelete && (
            <div className="ml-2 flex items-center gap-2 border-l border-border pl-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => onEdit(ticket)}
                className="gap-1 font-semibold"
                title="Sửa thông tin phiếu"
              >
                <Edit2 className="h-3 w-3 text-muted-foreground" />
                <span>Sửa</span>
              </Button>

              <Button
                variant="ghost"
                size="xs"
                onClick={() => onDelete(ticket.id)}
                className="gap-1 font-semibold text-destructive hover:bg-destructive/10"
                title="Xóa phiếu"
              >
                <Trash2 className="h-3 w-3" />
                <span>Xóa</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right: Nút nghiệm thu */}
        {canReview && (
          <Button
            size="sm"
            onClick={() => onReview(ticket)}
            className="gap-2 font-bold shadow-xs"
            title="Nghiệm thu và đóng phiếu"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Nghiệm Thu</span>
          </Button>
        )}
      </div>
    </Card>
  )
}
