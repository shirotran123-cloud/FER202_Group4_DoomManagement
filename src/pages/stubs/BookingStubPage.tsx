import React from "react"
import { Link } from "react-router-dom"
import { PageHeader, EmptyState } from "@/components/ui/shared"

export const BookingStubPage: React.FC = () => {
  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        eyebrow="Đặt phòng · Giữ chỗ"
        title="Đặt phòng đang hoàn thiện"
        desc="Phân hệ bản đồ chọn giường 1:4:6 đang được hoàn thiện."
      />
      <EmptyState
        title="Phân hệ đặt phòng đang hoàn thiện"
        desc="Chọn giường trực quan tại trang đặt phòng chính thức."
        action={
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/90"
          >
            Về trang Đặt phòng
          </Link>
        }
      />
    </div>
  )
}
