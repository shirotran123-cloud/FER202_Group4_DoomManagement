import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { UserCheck } from "lucide-react"
import type { MaintenanceTicket } from "@/types/maintenance"

interface AssignTechnicianModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  onSubmit: (assignData: {
    techName: string
    techPhone: string
    etaMinutes: number
  }) => void
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
}) => {
  const [techName, setTechName] = useState(" Đỗ Mạnh Hùng")
  const [techPhone, setTechPhone] = useState("0977 112 233")
  const [etaMinutes, setEtaMinutes] = useState(30)

  if (!ticket) return null

  const handleTechChange = (name: string) => {
    setTechName(name)
    if (name === " Đỗ Mạnh Hùng") setTechPhone("0977 112 233")
    if (name === " Lê Quốc Tuấn") setTechPhone("0918 889 900")
    if (name === " Vũ Trọng Nghĩa") setTechPhone("0934 567 890")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      techName,
      techPhone,
      etaMinutes,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCheck className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-foreground">
            Phân công Kỹ thuật viên
          </span>
        </div>
      }
      description={`Gán thợ sửa chữa cho phiếu ${ticket.id}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="mb-1 block text-xs font-bold text-foreground">
            Kỹ thuật viên phụ trách
          </label>
          <Select
            value={techName}
            onChange={(e) => handleTechChange(e.target.value)}
          >
            <option value=" Đỗ Mạnh Hùng">
              {" "}
              Đỗ Mạnh Hùng (Trưởng ban Điện lạnh)
            </option>
            <option value=" Lê Quốc Tuấn">
              Lê Quốc Tuấn (Kỹ thuật Điện dân dụng)
            </option>
            <option value=" Vũ Trọng Nghĩa">
              Vũ Trọng Nghĩa (Thợ nước & Vệ sinh)
            </option>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-foreground">
            Số điện thoại liên hệ
          </label>
          <Input
            type="text"
            value={techPhone}
            onChange={(e) => setTechPhone(e.target.value)}
            className="font-mono"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-foreground">
            Thời gian dự kiến có mặt (phút)
          </label>
          <Input
            type="number"
            min={15}
            max={240}
            value={etaMinutes}
            onChange={(e) => setEtaMinutes(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="default" className="font-bold">
            Xác nhận phân công
          </Button>
        </div>
      </form>
    </Modal>
  )
}
