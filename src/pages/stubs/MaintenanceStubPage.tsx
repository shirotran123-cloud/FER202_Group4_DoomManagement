import React from "react"
import { Link } from "react-router-dom"
import { PageHeader, EmptyState } from "@/components/ui/shared"

export const MaintenanceStubPage: React.FC = () => {
  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        eyebrow="Kỹ thuật · Bảo trì"
        title="Bảo trì đang hoàn thiện"
        desc="Phiếu báo hỏng và điều phối kỹ thuật đang được hoàn thiện."
      />
      <EmptyState
        title="Phân hệ bảo trì đang hoàn thiện"
        desc="Tạo phiếu báo hỏng tại trang bảo trì chính thức."
        action={
          <Link
            to="/maintenance"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/90"
          >
            Về trang Bảo trì
          </Link>
        }
      />
    </div>
  )
}
