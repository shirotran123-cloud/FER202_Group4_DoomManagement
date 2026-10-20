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
  const strokeWidth = 20
  const circumference = 2 * Math.PI * radius // ~408.407

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
      </div>

      {/* SVG Donut liền mạch, không cắt hở, viền phẳng chuẩn */}
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
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/15"
          />

          {/* Donut Segments liền mạch, không hở gap */}
          {calculatedSegments.map(
            (seg) =>
              seg.count > 0 && (
                <circle
                  key={seg.id}
                  cx="90"
                  cy="90"
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
        {calculatedSegments.map((seg) => (
          <div key={seg.id} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-muted-foreground">
              {seg.label} ({seg.percent}%):
            </span>
            <strong className="ml-auto text-foreground">{seg.count}</strong>
          </div>
        ))}
      </div>
    </Card>
  )
}
