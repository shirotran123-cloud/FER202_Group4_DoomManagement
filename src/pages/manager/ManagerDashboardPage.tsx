import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import {
  MOCK_OCCUPANCY_STATS,
  MOCK_MONTHLY_REVENUE,
  MOCK_BUILDING_CONSUMPTION,
  MOCK_RESIDENTS_REGISTRY,
  MOCK_OVERDUE_DEBTS,
} from "@/data/mockDashboard"
import { exportToExcelXml, exportToCsv, type ExportColumn } from "@/lib/excelExport"
import type { ResidentTemporaryRecord, OverdueDebtRecord } from "@/types/dashboard"
import { LayoutDashboard, FileSpreadsheet, ChartPie, TrendingUp, Download, Search, Building, DollarSign, Zap, Droplets, TriangleAlert, Users, Sparkles, FileDown } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export const ManagerDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "REPORTS">("OVERVIEW")
  const [reportSubTab, setReportSubTab] = useState<"TEMPORARY_RESIDENCE" | "OVERDUE_DEBTS">(
    "TEMPORARY_RESIDENCE"
  )
  const [searchReportQuery, setSearchReportQuery] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4500)
  }

  // Export 1: Resident Temporary Residence for Local Police (Excel XML)
  const handleExportResidenceExcel = () => {
    const columns: ExportColumn<ResidentTemporaryRecord>[] = [
      { header: "STT", key: "stt", width: 50 },
      { header: "Mã Hợp Đồng", key: "contractCode", width: 110 },
      { header: "Họ và Tên Sinh Viên", key: "fullName", width: 160 },
      { header: "MSSV", key: "studentId", width: 90 },
      { header: "Giới Tính", key: "gender", width: 70 },
      { header: "Số CCCD", key: "citizenId", width: 120 },
      { header: "Ngày Sinh", key: "dob", width: 90 },
      { header: "Quê Quán", key: "hometown", width: 120 },
      { header: "Số Điện Thoại", key: "phone", width: 100 },
      { header: "Tòa Nhà", key: "building", width: 110 },
      { header: "Phòng", key: "room", width: 70 },
      { header: "Mã Giường", key: "bedCode", width: 110 },
      { header: "Ngày Bắt Đầu Ở", key: "startDate", width: 100 },
      { header: "Hạn Hợp Đồng", key: "endDate", width: 100 },
      { header: "Họ Tên Phụ Huynh", key: "parentName", width: 150 },
      { header: "SĐT Phụ Huynh", key: "parentPhone", width: 110 },
    ]

    exportToExcelXml({
      filename: `Danh_Sach_Tam_Tru_KTX_FPT_${new Date().toISOString().substring(0, 10)}.xlsx`,
      sheetName: "DS Sinh Viên Tạm Trú",
      title: "DANH SÁCH SINH VIÊN LƯU TRÚ KÝ TÚC XÁ - KHAI BÁO TẠM TRÚ CÔNG AN",
      subtitle: `Trường Đại học FPT • Ban Quản lý KTX • Cán bộ phụ trách: ${user?.fullName || "Thầy Vũ Thành Nam"} • Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
      columns,
      data: MOCK_RESIDENTS_REGISTRY,
    })

    showToast("Đã xuất file Excel Danh_Sach_Tam_Tru_KTX_FPT.xlsx thành công!")
  }

  // Export CSV alternative
  const handleExportResidenceCsv = () => {
    const columns: ExportColumn<ResidentTemporaryRecord>[] = [
      { header: "STT", key: "stt" },
      { header: "Mã Hợp Đồng", key: "contractCode" },
      { header: "Họ và Tên", key: "fullName" },
      { header: "MSSV", key: "studentId" },
      { header: "Giới Tính", key: "gender" },
      { header: "CCCD", key: "citizenId" },
      { header: "Ngày Sinh", key: "dob" },
      { header: "Quê Quán", key: "hometown" },
      { header: "SĐT", key: "phone" },
      { header: "Tòa", key: "building" },
      { header: "Phòng", key: "room" },
      { header: "Mã Giường", key: "bedCode" },
      { header: "Bắt Đầu", key: "startDate" },
      { header: "Kết Thúc", key: "endDate" },
    ]

    exportToCsv({
      filename: `Danh_Sach_Tam_Tru_${new Date().toISOString().substring(0, 10)}.csv`,
      columns,
      data: MOCK_RESIDENTS_REGISTRY,
    })

    showToast("📄 Đã xuất file CSV (UTF-8 BOM) Danh Sách Tạm Trú thành công!")
  }

  // Export 2: Overdue Debt & Utility Registry
  const handleExportOverdueDebtsExcel = () => {
    const columns: ExportColumn<OverdueDebtRecord>[] = [
      { header: "STT", key: "stt", width: 50 },
      { header: "Mã Hóa Đơn", key: "invoiceCode", width: 130 },
      { header: "MSSV", key: "studentId", width: 90 },
      { header: "Họ và Tên", key: "fullName", width: 160 },
      { header: "Phòng Ở", key: "room", width: 70 },
      { header: "Mã Giường", key: "bedCode", width: 110 },
      { header: "Kỳ Tính Cước", key: "billingPeriod", width: 140 },
      {
        header: "Tiền phòng nợ VNĐ",
        key: "roomDebt",
        formatter: (v) => Number(v).toLocaleString("vi-VN"),
        width: 130,
      },
      {
        header: "Tiền điện nước nợ VNĐ",
        key: "utilityDebt",
        formatter: (v) => Number(v).toLocaleString("vi-VN"),
        width: 140,
      },
      {
        header: "Tổng nợ VNĐ",
        key: "totalDebt",
        formatter: (v) => Number(v).toLocaleString("vi-VN"),
        width: 130,
      },
      { header: "Hạn Thanh Toán", key: "dueDate", width: 100 },
      { header: "Số Ngày Quá Hạn", key: "overdueDays", width: 100 },
      { header: "Trạng Thái Cảnh Báo", key: "status", width: 140 },
      { header: "SĐT Liên Hệ", key: "phone", width: 110 },
    ]

    exportToExcelXml({
      filename: `Danh_Sach_Cong_No_Qua_Han_${new Date().toISOString().substring(0, 10)}.xlsx`,
      sheetName: "Công Nợ Quá Hạn",
      title: "BÁO CÁO CÔNG NỢ QUÁ HẠN TIỀN PHÒNG & ĐIỆN NƯỚC KÝ TÚC XÁ",
      subtitle: `Ban Quản lý KTX FPT • Người lập: ${user?.fullName || "Thầy Vũ Thành Nam"} • Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
      columns,
      data: MOCK_OVERDUE_DEBTS,
    })

    showToast("Đã xuất file Excel Danh_Sach_Cong_No_Qua_Han.xlsx thành công!")
  }

  // Filtered resident list for preview table
  const filteredResidents = MOCK_RESIDENTS_REGISTRY.filter(
    (r) =>
      r.fullName.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      r.room.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      r.bedCode.toLowerCase().includes(searchReportQuery.toLowerCase())
  )

  // Filtered overdue list for preview table
  const filteredDebts = MOCK_OVERDUE_DEBTS.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.studentId.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.room.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.invoiceCode.toLowerCase().includes(searchReportQuery.toLowerCase())
  )

  // Interactive Bed Occupancy Donut calculations
  const stats = MOCK_OCCUPANCY_STATS
  const total = stats.totalBeds // 240
  const radius = 65
  const circumference = 2 * Math.PI * radius // ~408.4

  const occupiedStroke = (stats.occupiedBeds / total) * circumference
  const availableStroke = (stats.availableBeds / total) * circumference
  const holdingStroke = (stats.holdingBeds / total) * circumference
  const maintenanceStroke = (stats.maintenanceBeds / total) * circumference

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-foreground text-background px-4 py-3 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 text-success shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="dms-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground border border-border shadow-xs">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-0.5 text-[11px] font-bold text-foreground">
                <span>Vận hành</span>
                <span>•</span>
                <span>Tổng quan · Báo cáo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                Tổng quan quản trị KTX
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Công suất phòng · Doanh thu · Xuất báo cáo Excel
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/90 px-4 py-2.5 text-right shadow-xs shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Ban quản lý:
            </p>
            <p className="text-xs font-bold text-foreground flex items-center justify-end gap-1 mt-0.5">
              <span>Đinh Thanh Trung & Ban Quản Lý</span>
            </p>
            {user && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Đang xem: <strong>{user.fullName}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-xs">
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
              <span>Tỷ lệ lấp đầy giường</span>
              <ChartPie className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground mt-1">
              {stats.occupancyRate}%
            </p>
            <span className="text-[10px] text-muted-foreground">
              {stats.occupiedBeds}/{stats.totalBeds} giường đang ở
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
              <span>Doanh thu tháng 10</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground mt-1">318.5 tr</p>
            <span className="text-[10px] text-muted-foreground">
              +2.1% so với tháng trước
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
              <span>Sự cố đang xử lý</span>
              <Zap className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground mt-1">2 phiếu</p>
            <span className="text-[10px] text-muted-foreground">
              1 ca khẩn cấp &lt;2h
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
              <span>Công nợ quá hạn</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground mt-1">3 sinh viên</p>
            <span className="text-[10px] text-muted-foreground">
              Tổng 3,313,000 VNĐ
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex rounded-2xl bg-muted/60 p-1 border border-border">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === "OVERVIEW"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ChartPie className="h-3.5 w-3.5 text-primary" />
          <span>Tổng quan công suất & năng lượng</span>
        </button>

        <button
          onClick={() => setActiveTab("REPORTS")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === "REPORTS"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-success" />
          <span>Xuất báo cáo Excel</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BIỂU ĐỒ TRỰC QUAN */}
      {/* ========================================================= */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Row 1: Bed Occupancy Donut Chart + Revenue Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Donut Chart: Bed Occupancy State */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ChartPie className="h-4 w-4 text-primary-soft-foreground" />
                  Cơ Cấu Trạng Thái Giường (Tòa A)
                </h3>
                <span className="text-xs font-mono font-bold text-muted-foreground">240 Giường</span>
              </div>

              {/* Interactive SVG Donut */}
              <div className="relative flex items-center justify-center py-2">
                <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
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
                  {/* Occupied: 80% (Gray/Blue) */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="var(--muted-foreground)"
                    strokeWidth="20"
                    fill="transparent"
                    strokeDasharray={`${occupiedStroke} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* Available: 12.5% (Green) */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="var(--success)"
                    strokeWidth="20"
                    fill="transparent"
                    strokeDasharray={`${availableStroke} ${circumference}`}
                    strokeDashoffset={-occupiedStroke}
                    strokeLinecap="round"
                  />
                  {/* Holding: 5% (Orange) */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="var(--primary)"
                    strokeWidth="20"
                    fill="transparent"
                    strokeDasharray={`${holdingStroke} ${circumference}`}
                    strokeDashoffset={-(occupiedStroke + availableStroke)}
                    strokeLinecap="round"
                  />
                  {/* Maintenance: 2.5% (Red) */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="var(--danger)"
                    strokeWidth="20"
                    fill="transparent"
                    strokeDasharray={`${maintenanceStroke} ${circumference}`}
                    strokeDashoffset={-(occupiedStroke + availableStroke + holdingStroke)}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-foreground">{stats.occupancyRate}%</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Lấp đầy
                  </span>
                </div>
              </div>

              {/* Legend & Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Đang ở (80%):</span>
                  <strong className="text-foreground ml-auto">{stats.occupiedBeds}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-success shrink-0" />
                  <span className="text-muted-foreground">Còn trống (12.5%):</span>
                  <strong className="text-foreground ml-auto">{stats.availableBeds}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-primary shrink-0" />
                  <span className="text-muted-foreground">Giữ chỗ 15p (5%):</span>
                  <strong className="text-foreground ml-auto">{stats.holdingBeds}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-danger shrink-0" />
                  <span className="text-muted-foreground">Bảo trì (2.5%):</span>
                  <strong className="text-foreground ml-auto">{stats.maintenanceBeds}</strong>
                </div>
              </div>
            </div>

            {/* Revenue Trend SVG Bar Chart */}
            <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-soft-foreground" />
                    Biểu Đồ Xu Hướng Doanh Thu 6 Tháng Gần Nhất
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Phân tách: Doanh thu tiền phòng & Hóa đơn điện nước dịch vụ
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-primary-soft-foreground font-semibold">
                    <span className="h-2.5 w-2.5 rounded bg-primary" /> Tiền phòng
                  </span>
                  <span className="flex items-center gap-1.5 text-primary-soft-foreground font-semibold">
                    <span className="h-2.5 w-2.5 rounded bg-primary" /> Điện nước/DV
                  </span>
                </div>
              </div>

              {/* Interactive Bar Chart Visualization */}
              <div className="py-2">
                <div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-48 border-b border-border/80 pb-2">
                  {MOCK_MONTHLY_REVENUE.map((item, idx) => {
                    const maxVal = 350000000 // 350M max scale
                    const roomHeightPercent = (item.roomFee / maxVal) * 100
                    const utilHeightPercent = (item.utilityFee / maxVal) * 100

                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] p-1.5 rounded-lg font-mono absolute -translate-y-28 shadow-lg pointer-events-none z-10 whitespace-nowrap">
                          {item.month}: {(item.total / 1000000).toFixed(1)} tr VNĐ
                        </div>

                        {/* Stacked Bars */}
                        <div className="w-full max-w-[36px] flex flex-col items-center justify-end h-full">
                          {/* Utility Fee (Orange) */}
                          <div
                            style={{ height: `${utilHeightPercent}%` }}
                            className="w-full bg-primary hover:bg-primary rounded-t-md transition-all"
                          />
                          {/* Room Fee (Blue) */}
                          <div
                            style={{ height: `${roomHeightPercent}%` }}
                            className="w-full bg-primary hover:bg-primary/90 transition-all"
                          />
                        </div>

                        {/* X-axis Label */}
                        <span className="mt-2 text-[10px] text-muted-foreground font-semibold">
                          {item.month.replace("Tháng ", "T")}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Total Summary */}
              <div className="flex items-center justify-between text-xs bg-muted/30 p-3 rounded-2xl border border-border">
                <span className="text-muted-foreground">Tổng thu lũy kế 6 tháng:</span>
                <span className="font-bold text-foreground font-mono text-sm">
                  1,528,400,000 VNĐ
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Building Energy & Water Consumption Comparison */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Đối Chiếu Mức Tiêu Thụ Điện & Nước Trung Bình Giữa Các Tòa Nhà
                </h3>
                <p className="text-xs text-muted-foreground">
                  Phát hiện bất thường rò rỉ nước hoặc quá tải điện năng theo phòng (kWh/phòng & m³/phòng)
                </p>
              </div>
              <span className="text-xs font-bold text-success-soft-foreground bg-success/10 px-3 py-1 rounded-full">
                Kỳ đối soát: Tháng 10/2026
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_BUILDING_CONSUMPTION.map((item, idx) => {
                const isAnomaly = item.anomalyNote?.includes("tăng")

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isAnomaly
                        ? "border-primary/25 bg-primary/5 shadow-xs"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-primary" />
                        {item.building}
                      </h4>
                      {isAnomaly && (
                        <span className="text-[10px] font-bold text-primary-soft-foreground bg-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TriangleAlert className="h-3 w-3" /> Cảnh báo
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      {/* Electricity */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Zap className="h-3.5 w-3.5 text-primary" /> Điện TB
                        </span>
                        <p className="text-lg font-black text-foreground font-mono">
                          {item.electricityAvgKwh}{" "}
                          <span className="text-[10px] font-normal text-muted-foreground">kWh/phòng</span>
                        </p>
                      </div>

                      {/* Water */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1">
                        <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Droplets className="h-3.5 w-3.5 text-primary" /> Nước TB
                        </span>
                        <p className="text-lg font-black text-foreground font-mono">
                          {item.waterAvgM3}{" "}
                          <span className="text-[10px] font-normal text-muted-foreground">m³/phòng</span>
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed italic">
                      "{item.anomalyNote}"
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: XUẤT BÁO CÁO EXCEL */}
      {/* ========================================================= */}
      {activeTab === "REPORTS" && (
        <div className="space-y-6">
          {/* Action Box to Trigger Excel Exports */}
          <div className="rounded-3xl border border-success/25 bg-gradient-to-br from-card to-success p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-success-soft-foreground flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4" /> Kết Xuất Dữ Liệu Nghiệp Vụ Chuẩn
                </span>
                <h2 className="text-xl font-black text-foreground mt-0.5">
                  Xuất Báo Cáo Định Dạng Microsoft Excel (.xlsx) & CSV
                </h2>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ đầy đủ tiếng Việt có dấu, định dạng bảng có tiêu đề cơ quan, màu nhận diện FPT và số liệu tài chính
                </p>
              </div>

              {/* Big Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="success" className="hover:bg-success flex" onClick={handleExportResidenceExcel}>
                  <Download className="h-4 w-4" />
                  <span>Xuất Excel Tạm Trú (.xlsx)</span>
                </Button>

                <button
                  onClick={handleExportResidenceCsv}
                  className="rounded-2xl border border-success/25 bg-success/10 hover:bg-success/20 text-success-soft-foreground px-3.5 py-2.5 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Xuất CSV (UTF-8)</span>
                </button>

                <Button variant="destructive" className="hover:bg-danger flex" onClick={handleExportOverdueDebtsExcel}>
                  <Download className="h-4 w-4" />
                  <span>Xuất Excel Công Nợ (.xlsx)</span>
                </Button>
              </div>
            </div>

            {/* Sub-Tabs for Preview Table */}
            <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex rounded-xl bg-muted/60 p-1 border border-border">
                <button
                  onClick={() => setReportSubTab("TEMPORARY_RESIDENCE")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    reportSubTab === "TEMPORARY_RESIDENCE"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  1. Danh Sách Tạm Trú ({MOCK_RESIDENTS_REGISTRY.length} SV)
                </button>
                <button
                  onClick={() => setReportSubTab("OVERDUE_DEBTS")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    reportSubTab === "OVERDUE_DEBTS"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  2. Danh Sách Công Nợ Quá Hạn ({MOCK_OVERDUE_DEBTS.length} SV)
                </button>
              </div>

              {/* Search Bar for Preview */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchReportQuery}
                  onChange={(e) => setSearchReportQuery(e.target.value)}
                  placeholder="Tra cứu MSSV, họ tên, phòng..."
                  className="pl-9 pr-3 focus:ring-success/30"
                />
              </div>
            </div>
          </div>

          {/* TABLE 1: RESIDENCE PREVIEW */}
          {reportSubTab === "TEMPORARY_RESIDENCE" && (
            <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-success-soft-foreground" />
                  <h3 className="font-bold text-sm text-foreground">
                    Xem Trước Dữ Liệu: Danh Sách Sinh Viên Nội Trú Khai Báo Tạm Trú
                  </h3>
                </div>
                <button
                  onClick={handleExportResidenceExcel}
                  className="text-xs text-success-soft-foreground hover:text-success-soft-foreground font-bold flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Tải về file Excel
                </button>
              </div>

              <div className="bleed-x-6 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                    <tr>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">STT</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Hợp Đồng</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Họ và Tên</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">MSSV</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Giới Tính</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">CCCD</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Quê Quán</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Phòng - Giường</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Thời Hạn</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle text-right">Phụ Huynh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredResidents.map((res) => (
                      <tr key={res.contractCode} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono text-muted-foreground">{res.stt}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono text-muted-foreground">{res.contractCode}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-bold text-foreground">{res.fullName}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono font-bold text-foreground">{res.studentId}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle">{res.gender}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono">{res.citizenId}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle">{res.hometown}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-semibold text-primary">
                          {res.room} • {res.bedCode}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-[11px] text-muted-foreground">
                          {res.startDate} ➔ {res.endDate}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-right text-[11px]">
                          <span className="font-semibold text-foreground">{res.parentName}</span>
                          <span className="block text-muted-foreground font-mono">{res.parentPhone}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABLE 2: OVERDUE DEBTS PREVIEW */}
          {reportSubTab === "OVERDUE_DEBTS" && (
            <div className="overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-danger-soft-foreground" />
                  <h3 className="font-bold text-sm text-foreground">
                    Xem Trước Dữ Liệu: Danh Sách Công Nợ Quá Hạn Chưa Nộp Tiền Điện Nước
                  </h3>
                </div>
                <button
                  onClick={handleExportOverdueDebtsExcel}
                  className="text-xs text-danger-soft-foreground hover:text-danger-soft-foreground font-bold flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Tải về file Excel
                </button>
              </div>

              <div className="bleed-x-6 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                    <tr>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">STT</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Mã Hóa Đơn</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">MSSV</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Họ và Tên</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Phòng - Giường</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle">Kỳ Cước</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle text-right">Tiền Phòng Nợ</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle text-right">Điện Nước Nợ</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle text-right">Tổng Nợ</th>
                      <th className="whitespace-nowrap px-3 py-2.5 align-middle text-right">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDebts.map((debt) => (
                      <tr key={debt.invoiceCode} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono text-muted-foreground">{debt.stt}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono text-muted-foreground">{debt.invoiceCode}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-mono font-bold text-foreground">{debt.studentId}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-bold text-foreground">{debt.fullName}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle font-semibold text-primary">
                          {debt.room} ({debt.bedCode})
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-muted-foreground">{debt.billingPeriod}</td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-right font-mono">
                          {debt.roomDebt.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-right font-mono">
                          {debt.utilityDebt.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-right font-mono font-bold text-danger-soft-foreground">
                          {debt.totalDebt.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 align-middle text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              debt.status === "CẢNH BÁO ĐÌNH CHỈ"
                                ? "bg-danger text-white animate-pulse"
                                : "bg-primary/10 text-primary-soft-foreground  border border-primary/25"
                            }`}
                          >
                            {debt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
