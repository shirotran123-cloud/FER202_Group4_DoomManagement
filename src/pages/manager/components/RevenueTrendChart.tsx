import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, Zap, BedDouble } from "lucide-react"

interface RevenueTrendChartProps {
  monthlyRevenue?: Array<{
    month: string
    roomFee: number
    utilityFee: number
    total: number
  }>
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = () => {
  const [activeView, setActiveView] = useState<"BOTH" | "UTILITY" | "ROOM">("BOTH")

  // 1. DOANH THU TIỀN PHÒNG THEO KỲ (4 tháng / kỳ)
  const semesterData = [
    {
      semester: "Fall 2025",
      fullName: "Học kỳ Fall 2025 (T09 - T12/2025)",
      revenue: 680000000,
      revenueText: "680 tr",
      students: 190,
      rooms: 42,
    },
    {
      semester: "Spring 2026",
      fullName: "Học kỳ Spring 2026 (T01 - T04/2026)",
      revenue: 720000000,
      revenueText: "720 tr",
      students: 196,
      rooms: 44,
    },
    {
      semester: "Summer 2026",
      fullName: "Học kỳ Summer 2026 (T05 - T08/2026)",
      revenue: 540000000,
      revenueText: "540 tr",
      students: 148,
      rooms: 36,
    },
    {
      semester: "Fall 2026",
      fullName: "Học kỳ Fall 2026 (Hiện tại)",
      revenue: 768000000,
      revenueText: "768 tr",
      students: 192,
      rooms: 44,
    },
  ]

  // 2. DOANH THU & TIÊU THỤ ĐIỆN NƯỚC THEO THÁNG (CỘT ĐÔI)
  const monthlyUtilityData = [
    {
      month: "Tháng 05",
      fullMonth: "Tháng 05/2026",
      elecCost: 22500000,
      elecCostText: "22.5 tr",
      elecKwh: 9000,
      waterCost: 16200000,
      waterCostText: "16.2 tr",
      waterM3: 900,
      totalCost: 38700000,
    },
    {
      month: "Tháng 06",
      fullMonth: "Tháng 06/2026",
      elecCost: 26800000,
      elecCostText: "26.8 tr",
      elecKwh: 10720,
      waterCost: 18500000,
      waterCostText: "18.5 tr",
      waterM3: 1028,
      totalCost: 45300000,
    },
    {
      month: "Tháng 07",
      fullMonth: "Tháng 07/2026",
      elecCost: 28200000,
      elecCostText: "28.2 tr",
      elecKwh: 11280,
      waterCost: 19400000,
      waterCostText: "19.4 tr",
      waterM3: 1078,
      totalCost: 47600000,
    },
    {
      month: "Tháng 08",
      fullMonth: "Tháng 08/2026",
      elecCost: 31500000,
      elecCostText: "31.5 tr",
      elecKwh: 12600,
      waterCost: 21200000,
      waterCostText: "21.2 tr",
      waterM3: 1178,
      totalCost: 52700000,
    },
    {
      month: "Tháng 09",
      fullMonth: "Tháng 09/2026",
      elecCost: 34200000,
      elecCostText: "34.2 tr",
      elecKwh: 13680,
      waterCost: 22800000,
      waterCostText: "22.8 tr",
      waterM3: 1267,
      totalCost: 57000000,
    },
    {
      month: "Tháng 10",
      fullMonth: "Tháng 10/2026",
      elecCost: 36000000,
      elecCostText: "36.0 tr",
      elecKwh: 14400,
      waterCost: 23500000,
      waterCostText: "23.5 tr",
      waterM3: 1306,
      totalCost: 59500000,
    },
  ]

  const maxSemesterRevenue = 850000000
  const maxUtilityVal = 40000000

  return (
    <Card className="flex flex-col justify-between space-y-5 p-6 shadow-xs lg:col-span-2">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Biểu Đồ Doanh Thu Tòa A
          </h3>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveView("BOTH")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activeView === "BOTH"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveView("UTILITY")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activeView === "UTILITY"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Điện nước theo tháng
          </button>
          <button
            type="button"
            onClick={() => setActiveView("ROOM")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activeView === "ROOM"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tiền phòng theo kỳ
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* BIỂU ĐỒ: DOANH THU ĐIỆN & NƯỚC THEO THÁNG                                 */}
        {/* ========================================================================= */}
        {(activeView === "BOTH" || activeView === "UTILITY") && (
          <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Doanh Thu Điện Nước Theo Tháng</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="h-2.5 w-2.5 rounded bg-amber-500" /> Điện
                </span>
                <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                  <span className="h-2.5 w-2.5 rounded bg-sky-500" /> Nước
                </span>
              </div>
            </div>

            {/* Double Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="grid h-44 grid-cols-6 items-end gap-2 border-b border-border/80 pb-2 sm:gap-4">
                {monthlyUtilityData.map((item, idx) => {
                  const elecHeight = (item.elecCost / maxUtilityVal) * 100
                  const waterHeight = (item.waterCost / maxUtilityVal) * 100

                  return (
                    <div
                      key={idx}
                      className="group relative flex h-full flex-col items-center justify-end"
                    >
                      {/* Floating Detail Tooltip on Hover */}
                      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 z-30 hidden min-w-[230px] rounded-xl bg-slate-900/95 p-2.5 text-left text-xs text-white shadow-xl backdrop-blur-xs group-hover:block animate-in fade-in">
                        <p className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                          {item.fullMonth}
                        </p>
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center justify-between gap-3 text-amber-400 font-medium whitespace-nowrap">
                            <span className="whitespace-nowrap">⚡ Điện ({item.elecKwh.toLocaleString()} kWh):</span>
                            <span className="font-mono font-semibold whitespace-nowrap">₫{item.elecCost.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-sky-400 font-medium whitespace-nowrap">
                            <span className="whitespace-nowrap">💧 Nước ({item.waterM3.toLocaleString()} m³):</span>
                            <span className="font-mono font-semibold whitespace-nowrap">₫{item.waterCost.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 border-t border-slate-700/80 pt-1 font-bold text-white whitespace-nowrap">
                            <span>Tổng thu:</span>
                            <span className="font-mono text-emerald-400 whitespace-nowrap">₫{item.totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Grouped Double Bars Container */}
                      <div className="flex items-end justify-center gap-1 w-full max-w-[46px] h-full">
                        {/* Cột trái: Điện */}
                        <div className="relative flex flex-col items-center w-1/2 h-full justify-end">
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 mb-1 leading-none select-none">
                            {item.elecCostText}
                          </span>
                          <div
                            style={{ height: `${elecHeight}%` }}
                            className="w-full rounded-t bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer shadow-2xs"
                          />
                        </div>

                        {/* Cột phải: Nước */}
                        <div className="relative flex flex-col items-center w-1/2 h-full justify-end">
                          <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 mb-1 leading-none select-none">
                            {item.waterCostText}
                          </span>
                          <div
                            style={{ height: `${waterHeight}%` }}
                            className="w-full rounded-t bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* X-Axis Month Label */}
                      <span className="mt-2 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                        {item.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BIỂU ĐỒ: DOANH THU TIỀN PHÒNG THEO KỲ                                     */}
        {/* ========================================================================= */}
        {(activeView === "BOTH" || activeView === "ROOM") && (
          <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <BedDouble className="h-4 w-4 text-primary" />
                <span>Doanh Thu Tiền Phòng Theo Kỳ</span>
              </div>
              <span className="text-[11px] font-semibold text-primary">
                Đơn giá: Buồng 6 (3.2 tr/kỳ) • Buồng 4 (4.0 tr/kỳ)
              </span>
            </div>

            {/* Semester Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="grid h-36 grid-cols-4 items-end gap-3 border-b border-border/80 pb-2 sm:gap-6">
                {semesterData.map((item, idx) => {
                  const roomHeight = (item.revenue / maxSemesterRevenue) * 100

                  return (
                    <div
                      key={idx}
                      className="group relative flex h-full flex-col items-center justify-end"
                    >
                      {/* Tooltip on Hover */}
                      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 z-30 hidden min-w-[200px] rounded-xl bg-slate-900/95 p-2.5 text-left text-xs text-white shadow-xl backdrop-blur-xs group-hover:block animate-in fade-in whitespace-nowrap">
                        <p className="font-bold border-b border-slate-700 pb-0.5 text-slate-200">
                          {item.fullName}
                        </p>
                        <p className="text-emerald-400 font-bold mt-1 font-mono">
                          Tổng thu: ₫{item.revenue.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-300">
                          Quy mô: {item.students} sinh viên • {item.rooms} phòng
                        </p>
                      </div>

                      {/* Bar with Money Text on top */}
                      <span className="text-[11px] font-mono font-bold text-primary mb-1 select-none">
                        {item.revenueText}
                      </span>
                      <div
                        style={{ height: `${roomHeight}%` }}
                        className="w-full max-w-[56px] rounded-t-lg bg-primary hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                      />

                      {/* X-Axis Semester Label */}
                      <span className="mt-2 text-[11px] font-semibold text-muted-foreground text-center">
                        {item.semester}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-border pt-3 text-xs gap-2">
        <span className="text-muted-foreground">
          Doanh thu tiền phòng Kỳ Fall 2026: <strong className="text-foreground">₫768,000,000</strong> (192 SV)
        </span>
        <span className="font-mono font-bold text-foreground">
          Điện nước bình quân T09: ₫57,000,000 / tháng
        </span>
      </div>
    </Card>
  )
}
