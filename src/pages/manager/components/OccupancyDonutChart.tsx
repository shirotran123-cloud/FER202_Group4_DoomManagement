import React from "react"
import { Card } from "@/components/ui/card"
import { PieChart } from "lucide-react"

interface OccupancyDonutChartProps {
  stats: {
    totalBeds: number
    occupiedBeds: number
    availableBeds: number
    holdingBeds: number
    maintenanceBeds: number
    occupancyRate: number
  }
}

export const OccupancyDonutChart: React.FC<OccupancyDonutChartProps> = ({
  stats,
}) => {
  const radius = 65
  const circumference = 2 * Math.PI * radius // ~408.4

  const occupiedStroke = (stats.occupiedBeds / stats.totalBeds) * circumference
  const availableStroke =
    (stats.availableBeds / stats.totalBeds) * circumference
  const holdingStroke = (stats.holdingBeds / stats.totalBeds) * circumference
  const maintenanceStroke =
    (stats.maintenanceBeds / stats.totalBeds) * circumference

  return (
    <Card className="flex flex-col justify-between space-y-4 p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <PieChart className="h-4 w-4 text-primary" />
          Cơ Cấu Trạng Thái Giường (Tòa A)
        </h3>
        <span className="font-mono text-xs font-bold text-muted-foreground">
          {stats.totalBeds} Giường
        </span>
      </div>

      {/* Interactive SVG Donut */}
      <div className="relative flex items-center justify-center py-2">
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="-rotate-90 transform"
        >
          {/* Background Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="currentColor"
            strokeWidth="20"
            fill="transparent"
            className="text-muted/40"
          />
          {/* Occupied: 80% (Secondary/Steel Blue) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#427aa1"
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={`${occupiedStroke} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* Available: 12.5% (Primary Green) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#679436"
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={`${availableStroke} ${circumference}`}
            strokeDashoffset={-occupiedStroke}
            strokeLinecap="round"
          />
          {/* Holding: 5% (Cyan) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#0891b2"
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={`${holdingStroke} ${circumference}`}
            strokeDashoffset={-(occupiedStroke + availableStroke)}
            strokeLinecap="round"
          />
          {/* Maintenance: 2.5% (Indigo) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#4f46e5"
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={`${maintenanceStroke} ${circumference}`}
            strokeDashoffset={
              -(occupiedStroke + availableStroke + holdingStroke)
            }
            strokeLinecap="round"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-foreground">
            {stats.occupancyRate}%
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Lấp đầy
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-md bg-[#427aa1]" />
          <span className="text-muted-foreground">Đang ở (80%):</span>
          <strong className="ml-auto text-foreground">
            {stats.occupiedBeds}
          </strong>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-md bg-[#679436]" />
          <span className="text-muted-foreground">Còn trống (12.5%):</span>
          <strong className="ml-auto text-foreground">
            {stats.availableBeds}
          </strong>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-md bg-[#0891b2]" />
          <span className="text-muted-foreground">Giữ chỗ 15p (5%):</span>
          <strong className="ml-auto text-foreground">
            {stats.holdingBeds}
          </strong>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-md bg-[#4f46e5]" />
          <span className="text-muted-foreground">Bảo trì (2.5%):</span>
          <strong className="ml-auto text-foreground">
            {stats.maintenanceBeds}
          </strong>
        </div>
      </div>
    </Card>
  )
}
