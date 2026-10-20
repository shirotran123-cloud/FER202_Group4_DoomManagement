import React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MaintenanceTicket } from "@/types/maintenance"

interface ViewTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
}

export const ViewTicketModal: React.FC<ViewTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  if (!ticket) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              {ticket.id}
            </span>
            <Badge variant="outline" className="font-semibold">
              {ticket.status === "PENDING"
                ? "Chờ tiếp nhận"
                : ticket.status === "IN_PROGRESS"
                  ? "Đang sửa chữa"
                  : ticket.status === "RESOLVED"
                    ? "Đã hoàn thành"
                    : "Đã đóng"}
            </Badge>
          </div>
          <h3 className="font-bold text-foreground text-lg">{ticket.title}</h3>
        </div>
      }
      footer={
        <Button variant="default" onClick={onClose} className="px-5">
          Đóng
        </Button>
      }
    >
      <div className="space-y-4 text-xs text-foreground">
        <div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Mô tả sự cố
          </span>
          <p className="mt-1 bg-muted/50 p-3.5 rounded-xl border border-border text-foreground leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {ticket.evidenceImages && ticket.evidenceImages.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Ảnh hiện trường
            </span>
            <div className="mt-1.5 flex gap-2 overflow-x-auto">
              {ticket.evidenceImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Evidence"
                  className="h-28 w-40 object-cover rounded-xl border border-border shadow-xs"
                />
              ))}
            </div>
          </div>
        )}

        {/* Technician Info */}
        {ticket.assignedTechnician && (
          <div className="p-3.5 bg-secondary/10 border border-secondary/20 rounded-xl">
            <span className="text-xs font-bold text-secondary block mb-1">
              Thông tin Kỹ thuật viên
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground">
              <div>
                Tên: <strong>{ticket.assignedTechnician.name}</strong>
              </div>
              <div>
                Điện thoại: <strong>{ticket.assignedTechnician.phone}</strong>
              </div>
              <div>Thời gian nhận: {ticket.assignedTechnician.assignedAt}</div>
              <div>Dự kiến hoàn thành: {ticket.assignedTechnician.etaMinutes} phút</div>
            </div>
          </div>
        )}

        {/* Resolution Info */}
        {ticket.resolution && (
          <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl space-y-2">
            <span className="text-xs font-bold text-primary block">
              Biên bản nghiệm thu sửa chữa
            </span>
            <p className="text-xs text-foreground">{ticket.resolution.technicianNotes}</p>
            {ticket.resolution.materials.length > 0 && (
              <div className="mt-2 text-xs">
                <strong className="text-foreground block mb-1">Vật tư thay thế:</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                  {ticket.resolution.materials.map((m) => (
                    <li key={m.id}>
                      {m.name} x {m.quantity} = {(m.unitCost * m.quantity).toLocaleString("vi-VN")} đ
                    </li>
                  ))}
                </ul>
                <div className="mt-1.5 font-bold text-foreground">
                  Tổng chi phí: {ticket.resolution.totalMaterialCost.toLocaleString("vi-VN")} đ
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
