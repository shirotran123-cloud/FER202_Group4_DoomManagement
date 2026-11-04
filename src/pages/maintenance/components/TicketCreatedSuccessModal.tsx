import React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import type { MaintenanceTicket } from "@/types/maintenance"
import { Clock, MapPin, AlertTriangle, ArrowRight } from "lucide-react"

interface TicketCreatedSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  onViewTicket?: (ticket: MaintenanceTicket) => void
}

export const TicketCreatedSuccessModal: React.FC<TicketCreatedSuccessModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onViewTicket,
}) => {
  if (!ticket) return null

  const isEmergency = ticket.urgency === "EMERGENCY"

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      className="text-center"
    >
      <div className="space-y-4 py-2">
        {/* Dấu tick xanh to ở trong hình tròn viền xanh */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/20 animate-in zoom-in-75 duration-300">
          <svg
            className="h-10 w-10 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {/* Subtle pulse ring */}
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400 opacity-40 animate-ping pointer-events-none" />
        </div>

        {/* Tiêu đề */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Đã gửi yêu cầu thành công!
          </h2>
        </div>

        {/* Thẻ tóm tắt thông tin phiếu vừa tạo */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <span className="text-muted-foreground font-medium">Mã phiếu yêu cầu:</span>
            <span className="font-mono font-bold text-primary dark:text-emerald-400 text-sm">
              {ticket.id}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground font-medium shrink-0">Sự cố:</span>
            <span className="font-semibold text-foreground text-right line-clamp-1">
              {ticket.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Vị trí:</span>
            </span>
            <span className="font-semibold text-foreground">
              {ticket.building} · Phòng {ticket.room} {ticket.compartment ? `(${ticket.compartment})` : ""}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Thời gian gửi:</span>
            </span>
            <span className="font-mono text-muted-foreground">
              {ticket.createdAt}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/60">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <AlertTriangle className={`h-3.5 w-3.5 ${isEmergency ? "text-rose-500" : "text-amber-500"}`} />
              <span>Mức độ:</span>
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isEmergency
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isEmergency ? "Khẩn cấp" : "Tiêu chuẩn (24h)"}
            </span>
          </div>
        </div>

        {/* Nút hành động ngắn gọn, không tràn dòng */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {onViewTicket && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose()
                onViewTicket(ticket)
              }}
              className="w-full font-semibold text-xs h-10 gap-1.5 px-2"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            type="button"
            variant="default"
            onClick={onClose}
            className={`w-full font-bold text-xs h-10 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white px-2 ${
              !onViewTicket ? "col-span-2" : ""
            }`}
          >
            Đã hiểu
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TicketCreatedSuccessModal
