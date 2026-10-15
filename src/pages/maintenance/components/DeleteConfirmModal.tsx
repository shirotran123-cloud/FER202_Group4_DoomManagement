import React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  ticketId: string | null
  onClose: () => void
  onConfirm: (id: string) => void
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  ticketId,
  onClose,
  onConfirm,
}) => {
  if (!ticketId) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      title={
        <div className="flex flex-col items-center text-center w-full">
          <div className="h-12 w-12 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mb-2">
            <Trash2 className="h-6 w-6" />
          </div>
          <span className="font-bold text-foreground text-base">Xác nhận xóa phiếu yêu cầu</span>
        </div>
      }
      description={
        <span className="text-center block">
          Bạn có chắc chắn muốn xóa vĩnh viễn phiếu <strong>{ticketId}</strong> không? Hành động này không thể hoàn tác.
        </span>
      }
      footer={
        <div className="flex items-center justify-center gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(ticketId)
              onClose()
            }}
          >
            Xóa phiếu
          </Button>
        </div>
      }
    >
      <div />
    </Modal>
  )
}
