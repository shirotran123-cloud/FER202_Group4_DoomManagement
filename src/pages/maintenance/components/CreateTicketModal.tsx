import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type {
  MaintenanceScope,
  MaintenanceCategory,
  MaintenanceUrgency,
} from "@/types/maintenance"

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (ticketData: {
    title: string
    scope: MaintenanceScope
    category: MaintenanceCategory
    urgency: MaintenanceUrgency
    description: string
    image?: string
  }) => void
  userLocation: {
    building: string
    room: string
    compartment: string
  }
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userLocation,
}) => {
  const [title, setTitle] = useState("")
  const [scope, setScope] = useState<MaintenanceScope>("COMPARTMENT_PRIVATE")
  const [urgency, setUrgency] = useState<MaintenanceUrgency>("NORMAL")
  const [category, setCategory] = useState<MaintenanceCategory>("ELECTRIC")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title,
      scope,
      category,
      urgency,
      description,
      image: image || undefined,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setImage("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground text-base">Tạo phiếu báo hỏng thiết bị</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            Tiêu đề sự cố <span className="text-destructive">*</span>
          </label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Vỡ vòi sen nhà tắm, Chập ổ điện đầu giường..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Phạm vi khu vực</label>
            <Select
              value={scope}
              onChange={(e) => setScope(e.target.value as MaintenanceScope)}
            >
              <option value="COMPARTMENT_PRIVATE">Buồng cá nhân (Giường riêng)</option>
              <option value="ROOM_SHARED">Khu vực phòng chung (WC, Ban công)</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Mức độ ưu tiên</label>
            <Select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as MaintenanceUrgency)}
            >
              <option value="NORMAL">Bình thường (Trong 24h)</option>
              <option value="EMERGENCY">Khẩn cấp (Cháy chập, vỡ ống nước, sự cố nghiêm trọng)</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Phân loại sự cố</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
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
              disabled
              value={`${userLocation.building} - ${userLocation.room} (${userLocation.compartment})`}
              className="bg-muted font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Mô tả chi tiết sự cố</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả cụ thể hiện trạng hư hỏng, vị trí hoặc dấu hiệu bất thường..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/30 shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Link ảnh chụp hiện trường</label>
          <Input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="default" className="font-bold">
            Gửi yêu cầu
          </Button>
        </div>
      </form>
    </Modal>
  )
}
