import React from "react"
import { Card } from "@/components/ui/card"
import { StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal"
import { Building, DollarSign, CheckCircle2, Users } from "lucide-react"

interface ManagerHeaderStatsProps {
  stats: {
    totalBeds: number
    occupiedBeds: number
    availableBeds: number
    holdingBeds: number
    maintenanceBeds: number
    occupancyRate: number
  }
}

export const ManagerHeaderStats: React.FC<ManagerHeaderStatsProps> = ({
  stats,
}) => {
  return (
    <StaggerContainer
      staggerDelay={0.1}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
    >
      <StaggerItem>
        <Card className="h-full border-primary/20 bg-primary/5 p-6 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-primary uppercase">
            <span>Tỷ lệ lấp đầy KTX</span>
            <Building className="h-5 w-5" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
            {stats.occupancyRate}%
          </p>
          <span className="mt-1 block text-xs font-medium text-muted-foreground">
            {stats.occupiedBeds} / {stats.totalBeds} giường
          </span>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full border-secondary/20 bg-secondary/5 p-6 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-secondary uppercase">
            <span>Giường sẵn sàng</span>
            <Users className="h-5 w-5" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-secondary sm:text-3xl">
            {stats.availableBeds} chỗ
          </p>
          <span className="mt-1 block text-xs font-medium text-muted-foreground">
            {stats.holdingBeds} đang giữ chỗ 15p
          </span>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full border-accent/20 bg-accent/5 p-6 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-accent uppercase">
            <span>Hồ sơ lưu trú mới</span>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-accent sm:text-3xl">
            48 hồ sơ
          </p>
          <span className="mt-1 block text-xs font-medium text-muted-foreground">
            Kỳ Fall 2026 hoàn tất
          </span>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full border-destructive/20 bg-destructive/5 p-6 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-destructive uppercase">
            <span>Công nợ quá hạn</span>
            <DollarSign className="h-5 w-5 text-destructive" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
            3 sinh viên
          </p>
          <span className="mt-1 block text-xs font-medium text-muted-foreground">
            Tổng 3,313,000 VNĐ
          </span>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}
