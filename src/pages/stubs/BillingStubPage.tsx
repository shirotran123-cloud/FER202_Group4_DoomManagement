import React from "react"
import { Link } from "react-router-dom"
import { PageHeader, EmptyState } from "@/components/ui/shared"

export const BillingStubPage: React.FC = () => {
  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        eyebrow="Thanh toán · Điện nước"
        title="Điện nước đang hoàn thiện"
        desc="Phân hệ hóa đơn điện nước Total / N đang được hoàn thiện."
      />
      <EmptyState
        title="Phân hệ điện nước đang hoàn thiện"
        desc="Xem hóa đơn điện nước hiện tại tại trang thanh toán."
        action={
          <Link
            to="/billing"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/90"
          >
            Về trang Điện nước
          </Link>
        }
      />
    </div>
  )
}
