import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, Zap, BedDouble, Calendar, ChevronDown, Check } from "lucide-react"

interface RevenueTrendChartProps {
  monthlyRevenue?: Array<{
    month: string
    roomFee: number
    utilityFee: number
    total: number
  }>
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = () => {
  const [selectedYear, setSelectedYear] = useState<"2026" | "2025">("2026")
  const [activeView, setActiveView] = useState<"BOTH" | "UTILITY" | "ROOM">("BOTH")

  // 1. DỮ LIỆU DOANH THU TIỀN PHÒNG THEO KỲ (THEO NĂM)
  const allSemesterData = [
    // --- NĂM 2026 ---
    {
      year: "2026",
      semester: "Spring 2026",
      fullName: "Học kỳ Spring 2026 (T01 - T04/2026)",
      revenue: 720000000,
      revenueText: "720 tr",
      students6Bed: 120,
      rooms6Bed: 20,
      students4Bed: 76,
      rooms4Bed: 19,
      totalStudents: 196,
    },
    {
      year: "2026",
      semester: "Summer 2026",
      fullName: "Học kỳ Summer 2026 (T05 - T08/2026)",
      revenue: 540000000,
      revenueText: "540 tr",
      students6Bed: 90,
      rooms6Bed: 15,
      students4Bed: 58,
      rooms4Bed: 15,
      totalStudents: 148,
    },
    {
      year: "2026",
      semester: "Fall 2026",
      fullName: "Học kỳ Fall 2026 (Hiện tại)",
      revenue: 768000000,
      revenueText: "768 tr",
      students6Bed: 120,
      rooms6Bed: 20,
      students4Bed: 72,
      rooms4Bed: 18,
      totalStudents: 192,
    },
    // --- NĂM 2025 ---
    {
      year: "2025",
      semester: "Spring 2025",
      fullName: "Học kỳ Spring 2025 (T01 - T04/2025)",
      revenue: 650000000,
      revenueText: "650 tr",
      students6Bed: 114,
      rooms6Bed: 19,
      students4Bed: 71,
      rooms4Bed: 18,
      totalStudents: 185,
    },
    {
      year: "2025",
      semester: "Summer 2025",
      fullName: "Học kỳ Summer 2025 (T05 - T08/2025)",
      revenue: 490000000,
      revenueText: "490 tr",
      students6Bed: 84,
      rooms6Bed: 14,
      students4Bed: 52,
      rooms4Bed: 13,
      totalStudents: 136,
    },
    {
      year: "2025",
      semester: "Fall 2025",
      fullName: "Học kỳ Fall 2025 (T09 - T12/2025)",
      revenue: 680000000,
      revenueText: "680 tr",
      students6Bed: 114,
      rooms6Bed: 19,
      students4Bed: 76,
      rooms4Bed: 19,
      totalStudents: 190,
    },
  ]

  // 2. DỮ LIỆU ĐIỆN NƯỚC THEO THÁNG (THEO NĂM)
  const allMonthlyUtilityData = [
    // --- NĂM 2026 ---
    {
      year: "2026",
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
      year: "2026",
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
      year: "2026",
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
      year: "2026",
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
      year: "2026",
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
      year: "2026",
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
    // --- NĂM 2025 ---
    {
      year: "2025",
      month: "Tháng 05",
      fullMonth: "Tháng 05/2025",
      elecCost: 20000000,
      elecCostText: "20.0 tr",
      elecKwh: 8000,
      waterCost: 14500000,
      waterCostText: "14.5 tr",
      waterM3: 805,
      totalCost: 34500000,
    },
    {
      year: "2025",
      month: "Tháng 06",
      fullMonth: "Tháng 06/2025",
      elecCost: 23500000,
      elecCostText: "23.5 tr",
      elecKwh: 9400,
      waterCost: 16800000,
      waterCostText: "16.8 tr",
      waterM3: 933,
      totalCost: 40300000,
    },
    {
      year: "2025",
      month: "Tháng 07",
      fullMonth: "Tháng 07/2025",
      elecCost: 25000000,
      elecCostText: "25.0 tr",
      elecKwh: 10000,
      waterCost: 17500000,
      waterCostText: "17.5 tr",
      waterM3: 972,
      totalCost: 42500000,
    },
    {
      year: "2025",
      month: "Tháng 08",
      fullMonth: "Tháng 08/2025",
      elecCost: 28000000,
      elecCostText: "28.0 tr",
      elecKwh: 11200,
      waterCost: 19000000,
      waterCostText: "19.0 tr",
      waterM3: 1055,
      totalCost: 47000000,
    },
    {
      year: "2025",
      month: "Tháng 09",
      fullMonth: "Tháng 09/2025",
      elecCost: 30500000,
      elecCostText: "30.5 tr",
      elecKwh: 12200,
      waterCost: 20500000,
      waterCostText: "20.5 tr",
      waterM3: 1138,
      totalCost: 51000000,
    },
    {
      year: "2025",
      month: "Tháng 10",
      fullMonth: "Tháng 10/2025",
      elecCost: 32000000,
      elecCostText: "32.0 tr",
      elecKwh: 12800,
      waterCost: 21000000,
      waterCostText: "21.0 tr",
      waterM3: 1166,
      totalCost: 53000000,
    },
  ]

  // Lọc dữ liệu theo năm được chọn
  const semesterData = allSemesterData.filter((item) => item.year === selectedYear)
  const monthlyUtilityData = allMonthlyUtilityData.filter((item) => item.year === selectedYear)

  const maxSemesterRevenue = 850000000
  const maxUtilityVal = 40000000

  return (
    <Card className="flex flex-col justify-between space-y-5 p-6 shadow-xs lg:col-span-2">
      {/* Header, Dropdown Năm Thả Xuống & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Biểu Đồ Doanh Thu Tòa A
          </h3>

          {/* Bộ lọc theo năm dạng dropdown thả xuống từ trên xuống dưới khi rê chuột vào */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted focus:outline-none"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Năm {selectedYear}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 top-full mt-1.5 hidden w-32 rounded-xl border border-border bg-card p-1 text-xs shadow-xl backdrop-blur-md group-hover:block z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                type="button"
                onClick={() => setSelectedYear("2026")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                  selectedYear === "2026"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span>Năm 2026</span>
                {selectedYear === "2026" && <Check className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setSelectedYear("2025")}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-semibold transition-all ${
                  selectedYear === "2025"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span>Năm 2025</span>
                {selectedYear === "2025" && <Check className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
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
                <span>Doanh Thu Điện Nước Theo Tháng ({selectedYear})</span>
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

            {/* Bar Chart */}
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
                      {/* Floating Detail Tooltip on Hover - HIỂN THỊ BÊN PHẢI (hoặc bên trái đối với cột cuối) */}
                      <div
                        className={`pointer-events-none absolute z-30 hidden min-w-[220px] rounded-xl bg-slate-900/95 p-2.5 text-left text-xs text-white shadow-xl backdrop-blur-xs group-hover:block animate-in fade-in ${
                          idx >= 4 ? "right-full mr-2 top-0" : "left-full ml-2 top-0"
                        }`}
                      >
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
                        {/* Cột Điện */}
                        <div className="relative flex flex-col items-center w-1/2 h-full justify-end">
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 mb-1 leading-none select-none whitespace-nowrap">
                            {item.elecCostText}
                          </span>
                          <div
                            style={{ height: `${elecHeight}%` }}
                            className="w-full rounded-t bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer shadow-2xs"
                          />
                        </div>

                        {/* Cột Nước */}
                        <div className="relative flex flex-col items-center w-1/2 h-full justify-end">
                          <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 mb-1 leading-none select-none whitespace-nowrap">
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
                <span>Doanh Thu Tiền Phòng Theo Kỳ ({selectedYear})</span>
              </div>
              <span className="text-[11px] font-semibold text-primary">
                Đơn giá: Buồng 6 (3.2 tr/kỳ) • Buồng 4 (4.0 tr/kỳ)
              </span>
            </div>

            {/* Semester Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="grid h-36 grid-cols-3 items-end gap-3 border-b border-border/80 pb-2 sm:gap-8">
                {semesterData.map((item, idx) => {
                  const roomHeight = (item.revenue / maxSemesterRevenue) * 100

                  return (
                    <div
                      key={idx}
                      className="group relative flex h-full flex-col items-center justify-end"
                    >
                      {/* Tooltip on Hover - HIỂN THỊ BÊN PHẢI (hoặc bên trái đối với cột cuối) */}
                      <div
                        className={`pointer-events-none absolute z-30 hidden min-w-[210px] rounded-xl bg-slate-900/95 p-2.5 text-left text-xs text-white shadow-xl backdrop-blur-xs group-hover:block animate-in fade-in whitespace-nowrap ${
                          idx >= 2 ? "right-full mr-3 top-0" : "left-full ml-3 top-0"
                        }`}
                      >
                        <p className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                          {item.fullName}
                        </p>
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center justify-between gap-4 text-emerald-400 font-medium">
                            <span>Buồng 6 chỗ:</span>
                            <span className="font-mono font-bold text-white">
                              {item.students6Bed} SV ({item.rooms6Bed} phòng)
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-sky-400 font-medium">
                            <span>Buồng 4 chỗ:</span>
                            <span className="font-mono font-bold text-white">
                              {item.students4Bed} SV ({item.rooms4Bed} phòng)
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 border-t border-slate-700/80 pt-1 text-[11px] text-slate-300">
                            <span>Tổng quy mô:</span>
                            <span className="font-mono font-semibold text-white">
                              {item.totalStudents} SV ({item.rooms6Bed + item.rooms4Bed} phòng)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bar with Money Text on top */}
                      <span className="text-[11px] font-mono font-bold text-primary mb-1 select-none">
                        {item.revenueText}
                      </span>
                      <div
                        style={{ height: `${roomHeight}%` }}
                        className="w-full max-w-[64px] rounded-t-lg bg-primary hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
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
    </Card>
  )
}
