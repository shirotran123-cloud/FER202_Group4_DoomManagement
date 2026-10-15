import React from "react"
import { Link } from "react-router-dom"
import { PageHeader, EmptyState } from "@/components/ui/shared"

export const ManagerDashboardStubPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <PageHeader
        eyebrow="Quản trị · Tổng quan"
        title="Tổng quan quản lý đang hoàn thiện"
        desc="Phân hệ dashboard công suất phòng và báo cáo đang được hoàn thiện."
      />
      <EmptyState
        title="Phân hệ quản lý đang hoàn thiện"
        desc="Xem số liệu vận hành tại trang quản lý chính thức."
        action={
          <Link
            to="/manager"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/90"
          >
            Về trang Quản lý
          </Link>
        }
      />
    </div>
  )
}
