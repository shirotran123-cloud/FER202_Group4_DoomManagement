import React, { useState, useRef } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Plus, Camera, X, CheckCircle2 } from "lucide-react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImage(event.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

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
              <option value="NORMAL">Tiêu chuẩn (Trong 24h)</option>
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

        {/* Upload / Capture Evidence Photo */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            Ảnh minh chứng hiện trường sự cố
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {image ? (
            <div className="relative rounded-xl overflow-hidden border border-border bg-card p-2">
              <div className="relative h-44 w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={image}
                  alt="Ảnh minh chứng sự cố"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã tải ảnh sự cố thành công</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Chụp / Chọn ảnh khác</span>
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-card hover:bg-muted/30 group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Camera className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-foreground">
                Chụp ảnh sự cố hoặc tải lên từ thiết bị
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Chụp trực tiếp từ điện thoại hoặc tải file ảnh JPG, PNG để kỹ thuật viên nắm rõ tình trạng
              </p>
            </div>
          )}
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
