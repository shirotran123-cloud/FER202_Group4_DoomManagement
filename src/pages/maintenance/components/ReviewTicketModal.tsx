import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import type { MaintenanceTicket } from "@/types/maintenance"

interface ReviewTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: MaintenanceTicket | null
  onSubmit: (data: { stars: number; comment: string }) => void
}

export const ReviewTicketModal: React.FC<ReviewTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
}) => {
  const [ratingStars, setRatingStars] = useState(5)
  const [ratingComment, setRatingComment] = useState("")

  if (!ticket) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      stars: ratingStars,
      comment: ratingComment,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex flex-col items-center text-center w-full">
          <div className="h-12 w-12 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mb-2">
            <Star className="h-6 w-6 fill-current" />
          </div>
          <span className="font-bold text-foreground text-base">Đánh giá chất lượng sửa chữa</span>
        </div>
      }
      description={
        <span className="text-center block">
          Ý kiến của bạn về phiếu {ticket.id} giúp cải thiện dịch vụ quản lý KTX tốt hơn.
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatingStars(star)}
              className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
            >
              <Star
                className={`h-7 w-7 ${
                  star <= ratingStars
                    ? "text-amber-400 fill-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>

        <div>
          <textarea
            rows={3}
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="Chia sẻ nhận xét về thời gian, thái độ của kỹ thuật viên..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/30 shadow-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Bỏ qua
          </Button>
          <Button type="submit" variant="default" className="font-bold">
            Gửi đánh giá
          </Button>
        </div>
      </form>
    </Modal>
  )
}
