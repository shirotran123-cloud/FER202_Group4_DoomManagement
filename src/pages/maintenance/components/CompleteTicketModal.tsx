import React, { useState, useRef } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Plus, Trash2, Camera, X } from "lucide-react"
import type { MaintenanceTicket, ReplacedMaterial } from "@/types/maintenance"

interface CompleteTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  onSubmit: (data: {
    notes: string
    materials: ReplacedMaterial[]
    completionImage?: string
  }) => void
}

export const CompleteTicketModal: React.FC<CompleteTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
}) => {
  const [notes, setNotes] = useState("")
  const [completionImage, setCompletionImage] = useState("")
  const [materials, setMaterials] = useState<ReplacedMaterial[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Material draft state
  const [newMatName, setNewMatName] = useState("")
  const [newMatQty, setNewMatQty] = useState(1)
  const [newMatCost, setNewMatCost] = useState(50000)

  if (!ticket) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setCompletionImage(event.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddMaterial = () => {
    if (!newMatName.trim()) return
    const newMat: ReplacedMaterial = {
      id: "mat-" + Date.now(),
      name: newMatName,
      quantity: newMatQty,
      unitCost: newMatCost,
    }
    setMaterials([...materials, newMat])
    setNewMatName("")
    setNewMatQty(1)
  }

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim()) return

    onSubmit({
      notes,
      materials,
      completionImage: completionImage || undefined,
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-foreground">
            Báo cáo hoàn thành sửa chữa
          </span>
        </div>
      }
      description={`Nghiệm thu sự cố ${ticket.id}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-foreground">
            Ghi xử lý kỹ thuật <span className="text-destructive">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Đã thay thế linh kiện, đo nguồn điện ổn định, dọn dẹp hiện trường..."
            className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-hidden"
          />
        </div>

        {/* Material Logging */}
        <div className="rounded-xl border border-border bg-muted/40 p-3.5">
          <span className="mb-2 block text-xs font-bold text-foreground">
            Vật tư thay thế (nếu có)
          </span>
          <div className="mb-2 grid grid-cols-1 sm:grid-cols-12 gap-2">
            <Input
              type="text"
              placeholder="Tên vật tư (vd: Vòi xịt inox, Bóng đèn LED 18W)..."
              value={newMatName}
              onChange={(e) => setNewMatName(e.target.value)}
              className="sm:col-span-6"
            />
            <Input
              type="number"
              placeholder="SL"
              min={1}
              value={newMatQty}
              onChange={(e) => setNewMatQty(Number(e.target.value))}
              className="sm:col-span-2"
            />
            <Input
              type="number"
              placeholder="Đơn giá (VNĐ)"
              value={newMatCost}
              onChange={(e) => setNewMatCost(Number(e.target.value))}
              className="sm:col-span-3"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddMaterial}
              className="sm:col-span-1 shrink-0 px-2 justify-center"
              title="Thêm vật tư"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {materials.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-2 text-xs shadow-2xs"
                >
                  <span className="text-foreground font-medium">
                    {m.name} x {m.quantity} ={" "}
                    <strong className="text-primary font-mono">
                      {(m.unitCost * m.quantity).toLocaleString("vi-VN")} đ
                    </strong>{" "}
                    <span className="text-[10px] text-muted-foreground">
                      ({m.unitCost.toLocaleString("vi-VN")} đ/cái)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(m.id)}
                    className="p-1 text-destructive hover:opacity-80 cursor-pointer"
                    title="Xóa vật tư này"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="text-right text-xs font-bold text-foreground pt-1">
                Tổng chi phí vật tư:{" "}
                <span className="text-primary font-mono">
                  {materials
                    .reduce((sum, m) => sum + m.unitCost * m.quantity, 0)
                    .toLocaleString("vi-VN")}{" "}
                  đ
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Photo Upload / Camera Capture */}
        <div>
          <label className="mb-1 block text-xs font-bold text-foreground">
            Ảnh chụp sau khi hoàn thành
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {completionImage ? (
            <div className="relative rounded-xl overflow-hidden border border-border bg-card p-2">
              <div className="relative h-44 w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={completionImage}
                  alt="Ảnh sau hoàn thành"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setCompletionImage("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white transition-all cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã tải ảnh lên thành công</span>
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
                Chụp ảnh hoặc tải lên từ thiết bị
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Hỗ trợ ảnh định dạng JPG, PNG từ điện thoại hoặc máy tính
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="default" className="font-bold">
            Xác nhận hoàn thành
          </Button>
        </div>
      </form>
    </Modal>
  )
}
