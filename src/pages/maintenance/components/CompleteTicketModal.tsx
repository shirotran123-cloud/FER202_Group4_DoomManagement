import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { CheckCircle2, Plus, Trash2 } from "lucide-react"
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

  // Material draft state
  const [newMatName, setNewMatName] = useState("")
  const [newMatQty, setNewMatQty] = useState(1)
  const [newMatCost, setNewMatCost] = useState(50000)
  const [newMatPayer, setNewMatPayer] = useState<"DORMITORY" | "STUDENT">(
    "DORMITORY"
  )

  if (!ticket) return null

  const handleAddMaterial = () => {
    if (!newMatName.trim()) return
    const newMat: ReplacedMaterial = {
      id: "mat-" + Date.now(),
      name: newMatName,
      quantity: newMatQty,
      unitCost: newMatCost,
      paidBy: newMatPayer,
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
            placeholder="Đã thay thế linh kiện, đo nguồn điện ổn định..."
            className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-hidden"
          />
        </div>

        {/* Material Logging */}
        <div className="rounded-xl border border-border bg-muted/40 p-3.5">
          <span className="mb-2 block text-xs font-bold text-foreground">
            Vật tư thay thế (nếu có)
          </span>
          <div className="mb-2 grid grid-cols-3 gap-2">
            <Input
              type="text"
              placeholder="Tên vật tư..."
              value={newMatName}
              onChange={(e) => setNewMatName(e.target.value)}
              className="col-span-2"
            />
            <Input
              type="number"
              placeholder="SL"
              min={1}
              value={newMatQty}
              onChange={(e) => setNewMatQty(Number(e.target.value))}
            />
          </div>
          <div className="mb-2 flex gap-2">
            <Input
              type="number"
              placeholder="Đơn giá (VNĐ)"
              value={newMatCost}
              onChange={(e) => setNewMatCost(Number(e.target.value))}
              className="flex-1"
            />
            <Select
              value={newMatPayer}
              onChange={(e) => setNewMatPayer(e.target.value as any)}
              className="w-36"
            >
              <option value="DORMITORY">KTX chi trả</option>
              <option value="STUDENT">SV bồi thường</option>
            </Select>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddMaterial}
              className="shrink-0 gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm
            </Button>
          </div>

          {materials.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-2 text-xs shadow-2xs"
                >
                  <span className="text-foreground">
                    {m.name} x {m.quantity} (
                    {m.unitCost.toLocaleString("vi-VN")} đ) -{" "}
                    <span className="text-[10px] text-muted-foreground">
                      {m.paidBy === "DORMITORY" ? "KTX" : "Sinh viên"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(m.id)}
                    className="p-1 text-destructive hover:opacity-80"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-foreground">
            Ảnh sau khi hoàn thành
          </label>
          <Input
            type="url"
            value={completionImage}
            onChange={(e) => setCompletionImage(e.target.value)}
            placeholder="https://..."
          />
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
