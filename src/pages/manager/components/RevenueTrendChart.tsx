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

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  monthlyRevenue,
}) => {
  return (
    <Card className="flex flex-col justify-between space-y-4 p-6 shadow-xs lg:col-span-2">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Biểu Đồ Xu Hướng Doanh Thu 6 Tháng Gần Nhất
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Phân tách: Doanh thu tiền phòng & Hóa đơn điện nước dịch vụ
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <span className="h-2.5 w-2.5 rounded bg-primary" /> Tiền phòng
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-secondary">
            <span className="h-2.5 w-2.5 rounded bg-secondary" /> Điện nước/DV
          </span>
        </div>
      </div>

      {/* Interactive Bar Chart Visualization */}
      <div className="py-2">
        <div className="grid h-48 grid-cols-6 items-end gap-3 border-b border-border/80 pb-2 sm:gap-6">
          {monthlyRevenue.map((item, idx) => {
            const maxVal = 350000000 // 350M max scale
            const roomHeightPercent = (item.roomFee / maxVal) * 100
            const utilHeightPercent = (item.utilityFee / maxVal) * 100

            return (
              <div
                key={idx}
                className="group relative flex h-full flex-col items-center justify-end"
              >
                {/* Hover Tooltip */}
                <div
                  className={`pointer-events-none absolute z-10 -translate-y-28 rounded-lg bg-foreground p-1.5 font-mono text-[10px] whitespace-nowrap text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100 ${
                    idx === monthlyRevenue.length - 1 ? "right-0" : ""
                  }`}
                >
                  {item.month}: {(item.total / 1000000).toFixed(1)} tr VNĐ
                </div>

                {/* Stacked Bars */}
                <div className="flex h-full w-full max-w-[42px] flex-col items-center justify-end gap-1">
                  {/* Utility bar */}
                  <div
                    style={{ height: `${utilHeightPercent}%` }}
                    className="w-full cursor-pointer rounded-t-md bg-secondary/80 transition-all hover:brightness-110"
                    title={`Điện nước: ${(item.utilityFee / 1000000).toFixed(1)} tr`}
                  />
                  {/* Room fee bar */}
                  <div
                    style={{ height: `${roomHeightPercent}%` }}
                    className="w-full cursor-pointer rounded-b-md bg-primary transition-all hover:brightness-110"
                    title={`Tiền phòng: ${(item.roomFee / 1000000).toFixed(1)} tr`}
                  />
                </div>

                {/* X-Axis Label */}
                <span className="mt-2 text-[11px] font-semibold text-muted-foreground">
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="text-muted-foreground">Trung bình 6 tháng:</span>
        <span className="font-mono font-bold text-foreground">
          310,000,000 VNĐ / Tháng
        </span>
      </div>
    </Card>
  )
}
