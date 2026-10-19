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
      className="max-h-[calc(100dvh-128px)] translate-y-8"
      title={
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs font-bold text-muted-foreground">
              {ticket.id}
            </span>
            <Badge variant="outline" className="font-semibold">
              {ticket.status}
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-foreground">{ticket.title}</h3>
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
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Mô tả sự cố
          </span>
          <p className="mt-1 rounded-xl border border-border bg-muted/50 p-3.5 leading-relaxed text-foreground">
            {ticket.description}
          </p>
        </div>

        {ticket.evidenceImages && ticket.evidenceImages.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Ảnh hiện trường
            </span>
            <div className="mt-1.5 flex gap-2 overflow-x-auto">
              {ticket.evidenceImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Evidence"
                  className="h-28 w-40 rounded-xl border border-border object-cover shadow-xs"
                />
              ))}
            </div>
          </div>
        )}

        {/* Technician Info */}
        {ticket.assignedTechnician && (
          <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-3.5">
            <span className="mb-1 block text-xs font-bold text-secondary">
              Thông tin Kỹ thuật viên
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs text-foreground sm:grid-cols-2">
              <div>
                Tên: <strong>{ticket.assignedTechnician.name}</strong>
              </div>
              <div>
                Điện thoại: <strong>{ticket.assignedTechnician.phone}</strong>
              </div>
              <div>Thời gian nhận: {ticket.assignedTechnician.assignedAt}</div>
              <div>
                Dự kiến hoàn thành: {ticket.assignedTechnician.etaMinutes} phút
              </div>
            </div>
          </div>
        )}

        {/* Resolution Info */}
        {ticket.resolution && (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/10 p-3.5">
            <span className="block text-xs font-bold text-primary">
              Biên bản nghiệm thu sửa chữa
            </span>
            <p className="text-xs text-foreground">
              {ticket.resolution.technicianNotes}
            </p>
            {ticket.resolution.materials.length > 0 && (
              <div className="mt-2 text-xs">
                <strong className="mb-1 block text-foreground">
                  Vật tư thay thế:
                </strong>
                <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                  {ticket.resolution.materials.map((m) => (
                    <li key={m.id}>
                      {m.name} x {m.quantity} ={" "}
                      {m.unitCost.toLocaleString("vi-VN")} đ (
                      {m.paidBy === "DORMITORY"
                        ? "KTX chi trả"
                        : "Sinh viên chi trả"}
                      )
                    </li>
                  ))}
                </ul>
                <div className="mt-1.5 font-bold text-foreground">
                  Tổng chi phí:{" "}
                  {ticket.resolution.totalMaterialCost.toLocaleString("vi-VN")}{" "}
                  đ
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
