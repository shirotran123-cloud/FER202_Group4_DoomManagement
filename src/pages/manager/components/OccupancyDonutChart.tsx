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
  const radius = 95
  const strokeWidth = 26
  const circumference = 2 * Math.PI * radius // ~596.9026

  const total = stats.totalBeds || 1

  const items = [
    {
      id: "occupied",
      label: "Đang ở",
      count: stats.occupiedBeds,
      color: "#679436",
    },
    {
      id: "available",
      label: "Còn trống",
      count: stats.availableBeds,
      color: "#427aa1",
    },
    {
      id: "holding",
      label: "Giữ chỗ 15p",
      count: stats.holdingBeds,
      color: "#0891b2",
    },
    {
      id: "maintenance",
      label: "Bảo trì",
      count: stats.maintenanceBeds,
      color: "#4f46e5",
    },
  ]

  let accumulated = 0
  const calculatedSegments = items.map((item) => {
    const rawStroke = (item.count / total) * circumference
    const stroke = rawStroke
    const offset = accumulated
    accumulated += rawStroke
    const percent = Math.round((item.count / total) * 1000) / 10

    return {
      ...item,
      stroke,
      offset,
      percent,
    }
  })

  return (
    <Card className="flex flex-col justify-between space-y-4 p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <PieChart className="h-4 w-4 text-primary" />
          Cơ Cấu Trạng Thái Giường
        </h3>
        <span className="text-xs font-semibold text-muted-foreground">
          Tổng: <strong className="text-foreground font-mono">{stats.totalBeds}</strong> giường
        </span>
      </div>

      {/* SVG Donut phóng to, cân đối và lấp đầy khung hình */}
      <div className="relative flex items-center justify-center py-4 my-auto">
        <svg
          viewBox="0 0 250 250"
          className="h-56 w-56 sm:h-64 sm:w-64 -rotate-90 transform"
        >
          {/* Background Track */}
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/15"
          />

          {/* Donut Segments liền mạch */}
          {calculatedSegments.map(
            (seg) =>
              seg.count > 0 && (
                <circle
                  key={seg.id}
                  cx="125"
                  cy="125"
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={`${seg.stroke} ${circumference}`}
                  strokeDashoffset={-seg.offset}
                  strokeLinecap="butt"
                  className="transition-all duration-300"
                />
              )
          )}
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {stats.occupancyRate}%
          </span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
            Lấp đầy
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
        {calculatedSegments.map((seg) => (
          <div
            key={seg.id}
            className="flex items-center justify-between gap-1.5 rounded-lg bg-muted/40 px-2.5 py-1.5"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate text-muted-foreground font-medium">
                {seg.label}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 font-mono">
              <strong className="text-foreground">{seg.count}</strong>
              <span className="text-[10px] text-muted-foreground">({seg.percent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
