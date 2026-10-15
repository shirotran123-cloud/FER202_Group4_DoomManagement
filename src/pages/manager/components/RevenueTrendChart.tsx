import React from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface RevenueTrendChartProps {
  monthlyRevenue: Array<{
    month: string
    roomFee: number
    utilityFee: number
    total: number
  }>
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ monthlyRevenue }) => {
  return (
    <Card className="lg:col-span-2 p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Biểu Đồ Xu Hướng Doanh Thu 6 Tháng Gần Nhất
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Phân tách: Doanh thu tiền phòng & Hóa đơn điện nước dịch vụ
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-primary font-semibold">
            <span className="h-2.5 w-2.5 rounded bg-primary" /> Tiền phòng
          </span>
          <span className="flex items-center gap-1.5 text-secondary font-semibold">
            <span className="h-2.5 w-2.5 rounded bg-secondary" /> Điện nước/DV
          </span>
        </div>
      </div>

      {/* Interactive Bar Chart Visualization */}
      <div className="py-2">
        <div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-48 border-b border-border/80 pb-2">
          {monthlyRevenue.map((item, idx) => {
            const maxVal = 350000000 // 350M max scale
            const roomHeightPercent = (item.roomFee / maxVal) * 100
            const utilHeightPercent = (item.utilityFee / maxVal) * 100

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                {/* Hover Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] p-1.5 rounded-lg font-mono absolute -translate-y-28 shadow-lg pointer-events-none z-10 whitespace-nowrap">
                  {item.month}: {(item.total / 1000000).toFixed(1)} tr VNĐ
                </div>

                {/* Stacked Bars */}
                <div className="w-full max-w-[42px] flex flex-col gap-1 items-center justify-end h-full">
                  {/* Utility bar */}
                  <div
                    style={{ height: `${utilHeightPercent}%` }}
                    className="w-full bg-secondary/80 rounded-t-md hover:brightness-110 transition-all cursor-pointer"
                    title={`Điện nước: ${(item.utilityFee / 1000000).toFixed(1)} tr`}
                  />
                  {/* Room fee bar */}
                  <div
                    style={{ height: `${roomHeightPercent}%` }}
                    className="w-full bg-primary rounded-b-md hover:brightness-110 transition-all cursor-pointer"
                    title={`Tiền phòng: ${(item.roomFee / 1000000).toFixed(1)} tr`}
                  />
                </div>

                {/* X-Axis Label */}
                <span className="text-[11px] font-semibold text-muted-foreground mt-2">
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-xs border-t border-border pt-3">
        <span className="text-muted-foreground">Trung bình 6 tháng:</span>
        <span className="font-bold text-foreground font-mono">~310,000,000 VNĐ / Tháng</span>
      </div>
    </Card>
  )
}
