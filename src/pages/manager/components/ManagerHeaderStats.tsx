import React from "react"
import { Card } from "@/components/ui/card"
import { Building, DollarSign, Zap, Users } from "lucide-react"

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

export const ManagerHeaderStats: React.FC<ManagerHeaderStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <Card className="border-primary/20 bg-primary/5 p-4 shadow-xs">
        <div className="flex items-center justify-between text-primary text-[11px] font-medium">
          <span>Tỷ lệ lấp đầy KTX</span>
          <Building className="h-4 w-4" />
        </div>
        <p className="text-2xl font-black text-primary mt-1">{stats.occupancyRate}%</p>
        <span className="text-[10px] text-muted-foreground">
          {stats.occupiedBeds} / {stats.totalBeds} giường
        </span>
      </Card>

      <Card className="border-secondary/20 bg-secondary/5 p-4 shadow-xs">
        <div className="flex items-center justify-between text-secondary text-[11px] font-medium">
          <span>Giường sẵn sàng</span>
          <Users className="h-4 w-4" />
        </div>
        <p className="text-2xl font-black text-secondary mt-1">{stats.availableBeds} chỗ</p>
        <span className="text-[10px] text-muted-foreground">
          {stats.holdingBeds} đang giữ chỗ 15p
        </span>
      </Card>

      <Card className="border-cyan-500/20 bg-cyan-500/5 p-4 shadow-xs">
        <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 text-[11px] font-medium">
          <span>Sự cố đang xử lý</span>
          <Zap className="h-4 w-4" />
        </div>
        <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">2 phiếu</p>
        <span className="text-[10px] text-cyan-600/80 dark:text-cyan-400/80">
          1 ca khẩn cấp
        </span>
      </Card>

      <Card className="border-accent/30 bg-accent/10 p-4 shadow-xs">
        <div className="flex items-center justify-between text-foreground text-[11px] font-medium">
          <span>Công nợ quá hạn</span>
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl font-black text-foreground mt-1">3 sinh viên</p>
        <span className="text-[10px] text-muted-foreground">
          Tổng 3,313,000 VNĐ
        </span>
      </Card>
    </div>
  )
}
