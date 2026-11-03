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
      className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-6"
    >
      <StaggerItem>
        <Card className="h-full border-primary/20 bg-primary/5 p-3.5 sm:p-5 lg:p-6 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold tracking-wider text-primary uppercase">
            <span className="truncate">Lấp đầy KTX</span>
            <Building className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-primary">
            {stats.occupancyRate}%
          </p>
          <span className="mt-1 block text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
            {stats.occupiedBeds}/{stats.totalBeds} giường
          </span>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full border-secondary/20 bg-secondary/5 p-3.5 sm:p-5 lg:p-6 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold tracking-wider text-secondary uppercase">
            <span className="truncate">Giường sẵn sàng</span>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-secondary">
            {stats.availableBeds} chỗ
          </p>
          <span className="mt-1 block text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
            {stats.holdingBeds} giữ chỗ 15p
          </span>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full border-accent/20 bg-accent/5 p-3.5 sm:p-5 lg:p-6 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold tracking-wider text-accent uppercase">
            <span className="truncate">Lưu trú mới</span>
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-accent">
            48 hồ sơ
          </p>
          <span className="mt-1 block text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
            Kỳ Fall 2026
          </span>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full border-destructive/20 bg-destructive/5 p-3.5 sm:p-5 lg:p-6 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold tracking-wider text-destructive uppercase">
            <span className="truncate">Nợ quá hạn</span>
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-destructive" />
          </div>
          <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground">
            3 SV
          </p>
          <span className="mt-1 block text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
            ₫3,313,000 VNĐ
          </span>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  )
}
