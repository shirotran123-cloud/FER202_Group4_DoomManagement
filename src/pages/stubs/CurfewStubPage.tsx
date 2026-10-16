import React from "react"
import { Link } from "react-router-dom"
import { PageHeader, EmptyState } from "@/components/ui/shared"

export const CurfewStubPage: React.FC = () => {
  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        eyebrow="An ninh · Giới nghiêm"
        title="Giới nghiêm đang hoàn thiện"
        desc="Đơn về muộn và quét thẻ cổng 23:00 đang được hoàn thiện."
      />
      <EmptyState
        title="Phân hệ giới nghiêm đang hoàn thiện"
        desc="Nộp đơn về muộn và tra cứu cổng tại trang giới nghiêm."
        action={
          <Link
            to="/curfew"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/90"
          >
            Về trang Giới nghiêm
          </Link>
        }
      />
    </div>
  )
}
