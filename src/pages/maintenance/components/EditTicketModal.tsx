import React, { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Edit2 } from "lucide-react"
import type {
  MaintenanceTicket,
  MaintenanceCategory,
  MaintenanceUrgency,
} from "@/types/maintenance"

interface EditTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  onSubmit: (updatedData: {
    title: string
    urgency: MaintenanceUrgency
    category: MaintenanceCategory
    description: string
  }) => void
}

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
}) => {
  const [title, setTitle] = useState("")
  const [urgency, setUrgency] = useState<MaintenanceUrgency>("NORMAL")
  const [category, setCategory] = useState<MaintenanceCategory>("ELECTRIC")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title)
      setUrgency(ticket.urgency)
      setCategory(ticket.category)
      setDescription(ticket.description)
    }
  }, [ticket])

  if (!ticket) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title,
      urgency,
      category,
      description,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
            <Edit2 className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground text-base">Chỉnh sửa phiếu {ticket.id}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề sự cố</label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Mức độ ưu tiên</label>
            <Select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as MaintenanceUrgency)}
            >
              <option value="NORMAL">Bình thường</option>
              <option value="EMERGENCY">Khẩn cấp</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Phân loại</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
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
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/30 shadow-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="default" className="font-bold">
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  )
}
