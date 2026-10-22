import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { FileCheck2, CheckSquare, Square } from "lucide-react"
import type { MaintenanceTicket } from "@/types/maintenance"

interface ReviewTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  onSubmit: (data: { stars: number; comment: string }) => void
}

const CHECKLIST = [
  "Thiết bị đã được sửa chữa hoàn toàn, không còn hư hỏng",
  "Khu vực sửa chữa đã được vệ sinh sạch sẽ",
  "Không có thiệt hại tài sản phát sinh thêm",
  "Kỹ thuật viên đã bàn giao và ký biên bản",
]

export const ReviewTicketModal: React.FC<ReviewTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [comment, setComment] = useState("")

  if (!ticket) return null

  const allChecked = CHECKLIST.every((_, i) => checkedItems[i])

  const toggleItem = (idx: number) =>
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ stars: 5, comment: comment || "Nghiệm thu đạt yêu cầu." })
    setCheckedItems({})
    setComment("")
    onClose()
  }

  const handleReject = () => {
    onSubmit({ stars: 2, comment: comment || "Nghiệm thu không đạt, yêu cầu sửa lại." })
    setCheckedItems({})
    setComment("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex flex-col items-center text-center w-full">
          <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-2">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <span className="font-bold text-foreground text-base">Nghiệm Thu Kết Quả Sửa Chữa</span>
        </div>
      }
      description={
        <span className="text-center block">
          Kiểm tra thực tế và xác nhận hoàn thành phiếu <strong>{ticket.id}</strong>
        </span>
      }
    >
      <form onSubmit={handleAccept} className="space-y-4">
        {/* Thông tin phiếu */}
        <div className="bg-muted/40 rounded-xl p-3 text-xs space-y-1 border border-border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sự cố:</span>
            <span className="font-semibold text-foreground">{ticket.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vị trí:</span>
            <span className="font-semibold text-foreground">
              {ticket.building} – {ticket.room}
            </span>
          </div>
          {ticket.assignedTechnician && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kỹ thuật viên:</span>
              <span className="font-semibold text-foreground">
                {ticket.assignedTechnician.name}
              </span>
            </div>
          )}
        </div>

        {/* Checklist nghiệm thu */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-foreground">Danh mục kiểm tra nghiệm thu:</p>
          {CHECKLIST.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleItem(idx)}
              className="w-full flex items-start gap-2.5 text-left p-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors text-xs"
            >
              {checkedItems[idx] ? (
                <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span
                className={
                  checkedItems[idx] ? "text-foreground font-medium" : "text-muted-foreground"
                }
              >
                {item}
              </span>
            </button>
          ))}
        </div>

        {/* Ghi chú */}
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Ghi chú của Ban Quản lý
          </label>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ghi chú thêm về kết quả nghiệm thu (không bắt buộc)..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/30 shadow-xs"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReject}
            className="text-destructive hover:bg-destructive/10 font-semibold"
          >
            Chưa đạt – Yêu cầu sửa lại
          </Button>
          <Button
            type="submit"
            disabled={!allChecked}
            className="font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
          >
            <FileCheck2 className="h-4 w-4" />
            Xác nhận Hoàn thành
          </Button>
        </div>
        {!allChecked && (
          <p className="text-[11px] text-muted-foreground text-right -mt-2">
            Tích đủ {CHECKLIST.length} mục kiểm tra để xác nhận
          </p>
        )}
      </form>
    </Modal>
  )
}
