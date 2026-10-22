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

  // Kiểm tra quyền: Báo cáo sự cố do mình gửi thì mới có quyền sửa / xóa
  // Nếu trạng thái đã chuyển sang Đang xử lý, Chờ nghiệm thu hoặc Đã hoàn thành thì KHÔNG sửa và KHÔNG xóa được
  const isMyTicket =
    ticket.studentId === currentUser?.studentId ||
    ticket.studentName === currentUser?.fullName ||
    ticket.studentId === currentUser?.id

  const canEditOrDelete =
    isManagerOrAdmin || (isMyTicket && ticket.status === "PENDING")

  // Manager/Admin nghiệm thu khi kỹ thuật viên đã báo xong (RESOLVED)
  const canReview = isManagerOrAdmin && isResolved

  return (
    <Card
      className={`group relative flex flex-col justify-between p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40 ${
        isEmergency ? "border-destructive/40" : ""
      }`}
    >
      <div>
        {/* Tiêu đề & Mô tả (Luôn hiển thị) */}
        <h3 className="text-base font-bold text-foreground leading-snug">
          {ticket.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {ticket.description}
        </p>

        {/* CHI TIẾT BỔ SUNG (Chỉ hiển thị khi rê chuột vào - Group Hover) */}
        <div className="hidden group-hover:block pt-3 border-t border-border mt-3 space-y-2.5 animate-in fade-in duration-200">
          {/* Thông tin vị trí, khu vực, người báo, thời gian */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-border bg-muted/60 p-2.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                Vị trí
              </span>
              <strong className="text-foreground text-xs">
                {ticket.building} - {ticket.room}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                Khu vực
              </span>
              <strong className="text-foreground text-xs truncate block">
                {ticket.bedCode || ticket.compartment || "Phòng chung"}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                Người báo
              </span>
              <strong className="text-foreground text-xs truncate block">
                {ticket.studentName} {isMyTicket ? "(Bạn)" : ""}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                Thời gian
              </span>
              <span className="font-mono text-foreground/90 text-xs">
                {ticket.createdAt}
              </span>
            </div>
          </div>

          {/* Kỹ thuật & Dự kiến hoàn thành */}
          {ticket.assignedTechnician ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl border border-secondary/20 bg-muted/50 p-2.5 text-xs text-secondary">
              <div className="flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 shrink-0 text-secondary" />
                <span>
                  Kỹ thuật phụ trách: <strong>{ticket.assignedTechnician.name}</strong> ({ticket.assignedTechnician.phone})
                </span>
              </div>
              <span className="text-[11px] font-semibold bg-background px-2 py-0.5 rounded border border-border shrink-0 self-start sm:self-auto">
                Dự kiến hoàn thành: {ticket.assignedTechnician.etaMinutes} phút
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground italic px-1">
              Kỹ thuật: Chưa phân công điều phối
            </div>
          )}

          {/* Biên bản nghiệm thu sửa chữa (nếu có) */}
          {ticket.resolution && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-emerald-600" />
                  Biên bản nghiệm thu sửa chữa
                </span>
                <span className="font-mono text-[11px] font-normal text-muted-foreground">
                  Hoàn tất: {ticket.resolution.completedAt}
                </span>
              </div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                {ticket.resolution.technicianNotes}
              </p>
              {ticket.resolution.materials && ticket.resolution.materials.length > 0 && (
                <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-emerald-500/10 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Vật tư: {ticket.resolution.materials.map((m) => `${m.name} (x${m.quantity})`).join(", ")}
                  </span>
                  {ticket.resolution.totalMaterialCost ? (
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      Chi phí: ₫{ticket.resolution.totalMaterialCost.toLocaleString()}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Đánh giá sao (nếu có) */}
          {ticket.review && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 p-2.5 text-xs">
              <div className="flex text-amber-500">
                {[...Array(ticket.review.rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-foreground/90 italic">
                "{ticket.review.comment}"
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                {ticket.review.reviewedAt}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer: Nhãn thông tin nằm dưới cùng bên trái, nút hành động bên phải */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-2.5">
        {/* Left: Un-pilled Labels + Sửa/Xóa */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono font-bold text-foreground">{ticket.id}</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-muted-foreground font-medium">
            {ticket.scope === "ROOM_SHARED" ? "Phòng chung" : "Buồng cá nhân"}
          </span>
          <span className="text-muted-foreground/40">•</span>
          {isEmergency ? (
            <span className="inline-flex items-center gap-1 font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>Khẩn cấp</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Bình thường</span>
          )}
          <span className="text-muted-foreground/40">•</span>
          {isPending && (
            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Chờ tiếp nhận</span>
            </span>
          )}
          {isInProgress && (
            <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Đang xử lý</span>
            </span>
          )}
          {isResolved && (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Chờ nghiệm thu</span>
            </span>
          )}
          {isClosed && (
            <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>Đã hoàn thành</span>
            </span>
          )}
          {isMyTicket && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="font-bold text-primary text-[11px]">Của bạn</span>
            </>
          )}

          {canEditOrDelete && (
            <div className="flex items-center gap-1.5 ml-1 border-l border-border pl-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(ticket)}
                className="gap-1 text-xs h-6 px-2 font-medium"
                title="Sửa thông tin phiếu"
              >
                <Edit2 className="h-3 w-3 text-muted-foreground" />
                <span>Sửa</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(ticket.id)}
                className="gap-1 text-xs h-6 px-2 text-destructive hover:bg-destructive/10 font-medium"
                title="Xóa phiếu"
              >
                <Trash2 className="h-3 w-3" />
                <span>Xóa</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right: Nút nghiệm thu (chỉ manager/admin khi phiếu RESOLVED) */}
        {canReview && (
          <Button
            size="sm"
            onClick={() => onReview(ticket)}
            className="gap-1.5 text-xs h-7 px-3 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            title="Nghiệm thu và đóng phiếu"
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Nghiệm Thu</span>
          </Button>
        )}
      </div>
    </Card>
  )
}
