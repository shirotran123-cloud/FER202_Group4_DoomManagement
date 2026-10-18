import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { ApiError, dashboardApi } from "@/lib/api"
import {
  MOCK_OCCUPANCY_STATS,
  MOCK_MONTHLY_REVENUE,
  MOCK_BUILDING_CONSUMPTION,
  MOCK_RESIDENTS_REGISTRY,
  MOCK_OVERDUE_DEBTS,
} from "@/data/mockDashboard"
import { exportToExcel, exportToCsv, type ExportColumn } from "@/lib/excelExport"
import { INITIAL_MAINTENANCE_TICKETS } from "@/data/mockMaintenance"
import type { ResidentTemporaryRecord, OverdueDebtRecord } from "@/types/dashboard"
import { LayoutDashboard, FileSpreadsheet, ChartPie, TrendingUp, Download, Search, Building, DollarSign, Zap, Droplets, TriangleAlert, Users, Sparkles, FileDown } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ExpandableText } from "@/components/ui/expandable-text"
export const ManagerDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "REPORTS">("OVERVIEW")
  const [reportSubTab, setReportSubTab] = useState<"TEMPORARY_RESIDENCE" | "OVERDUE_DEBTS">(
    "TEMPORARY_RESIDENCE"
  )
  const [searchReportQuery, setSearchReportQuery] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  /**
   * Khoá nút đang xuất để tránh người dùng bấm liên tục sinh ra nhiều file trùng nhau.
   */
  const [exportingKind, setExportingKind] = useState<
    "RESIDENTS_XLSX" | "RESIDENTS_CSV" | "DEBTS_XLSX" | null
  >(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4500)
  }

  /**
   * Lấy dữ liệu báo cáo THẬT từ backend (`/api/dashboard/reports/*`).
   *
   * DỰ PHÒNG: nếu backend tắt/lỗi, hàm trả về dữ liệu mẫu (`MOCK_*`) để bản demo
   * vẫn xuất được file, đồng thời hiện toast nói rõ đang dùng dữ liệu mẫu — tuyệt đối
   * không im lặng giả vờ là dữ liệu thật.
   */
  const loadReportRows = async <T,>(
    fetcher: () => Promise<T[]>,
    fallback: T[],
    label: string,
  ): Promise<{ rows: T[]; usedFallback: boolean }> => {
    try {
      const rows = await fetcher()
      return { rows: Array.isArray(rows) ? rows : [], usedFallback: false }
    } catch (error) {
      const detail = error instanceof ApiError ? error.message : "Lỗi không xác định"
      showToast(`⚠️ Không lấy được ${label} từ máy chủ (${detail}). Đang dùng dữ liệu mẫu.`)
      return { rows: fallback, usedFallback: true }
    }
  }

  // Export 1: Resident Temporary Residence for Local Police — .xlsx THẬT từ backend
  const handleExportResidenceExcel = async () => {
    const columns: ExportColumn<ResidentTemporaryRecord>[] = [
      { header: "STT", key: "stt", width: 50, align: "center" },
      { header: "Mã Hợp Đồng", key: "contractCode", width: 110 },
      { header: "Họ và Tên Sinh Viên", key: "fullName", width: 160 },
      { header: "MSSV", key: "studentId", width: 90, align: "center" },
      { header: "Giới Tính", key: "gender", width: 70, align: "center" },
      { header: "Số CCCD", key: "citizenId", width: 120, align: "center" },
      { header: "Ngày Sinh", key: "dob", width: 90, align: "center" },
      { header: "Quê Quán", key: "hometown", width: 120 },
      { header: "Số Điện Thoại", key: "phone", width: 100, align: "center" },
      { header: "Tòa Nhà", key: "building", width: 110 },
      { header: "Phòng", key: "room", width: 70, align: "center" },
      { header: "Mã Giường", key: "bedCode", width: 110, align: "center" },
      { header: "Ngày Bắt Đầu Ở", key: "startDate", width: 100, align: "center" },
      { header: "Hạn Hợp Đồng", key: "endDate", width: 100, align: "center" },
      { header: "Họ Tên Phụ Huynh", key: "parentName", width: 150 },
      { header: "SĐT Phụ Huynh", key: "parentPhone", width: 110, align: "center" },
    ]

    const filename = `Danh_Sach_Tam_Tru_KTX_FPT_${new Date().toISOString().substring(0, 10)}.xlsx`
    setExportingKind("RESIDENTS_XLSX")
    try {
      const { rows, usedFallback } = await loadReportRows<ResidentTemporaryRecord>(
        () => dashboardApi.residents() as Promise<ResidentTemporaryRecord[]>,
        MOCK_RESIDENTS_REGISTRY,
        "danh sách tạm trú",
      )

      if (rows.length === 0) {
        showToast("⚠️ Không có dữ liệu tạm trú để xuất file.")
        return
      }

      await exportToExcel({
        filename,
        sheetName: "DS Sinh Viên Tạm Trú",
        title: "DANH SÁCH SINH VIÊN LƯU TRÚ KÝ TÚC XÁ - KHAI BÁO TẠM TRÚ CÔNG AN",
        subtitle: `Trường Đại học FPT • Ban Quản lý KTX • Cán bộ phụ trách: ${user?.fullName || "Thầy Vũ Thành Nam"} • Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
        columns,
        data: rows,
      })

      showToast(
        usedFallback
          ? `⚠️ Đã xuất ${filename} từ DỮ LIỆU MẪU (backend không phản hồi).`
          : `✅ Đã xuất file Excel thật ${filename} (${rows.length} sinh viên).`,
      )
    } catch (error) {
      const detail = error instanceof ApiError ? error.message : (error as Error).message
      showToast(`❌ Xuất file Excel tạm trú thất bại: ${detail}`)
    } finally {
      setExportingKind(null)
    }
  }

  // Export CSV alternative — cùng nguồn dữ liệu backend
  const handleExportResidenceCsv = async () => {
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

    const filename = `Danh_Sach_Tam_Tru_${new Date().toISOString().substring(0, 10)}.csv`
    setExportingKind("RESIDENTS_CSV")
    try {
      const { rows, usedFallback } = await loadReportRows<ResidentTemporaryRecord>(
        () => dashboardApi.residents() as Promise<ResidentTemporaryRecord[]>,
        MOCK_RESIDENTS_REGISTRY,
        "danh sách tạm trú",
      )

      if (rows.length === 0) {
        showToast("⚠️ Không có dữ liệu tạm trú để xuất file CSV.")
        return
      }

      exportToCsv({ filename, columns, data: rows })

      showToast(
        usedFallback
          ? `⚠️ Đã xuất ${filename} từ DỮ LIỆU MẪU (backend không phản hồi).`
          : `📄 Đã xuất file CSV (UTF-8 BOM) ${filename} thành công!`,
      )
    } catch (error) {
      const detail = error instanceof ApiError ? error.message : (error as Error).message
      showToast(`❌ Xuất file CSV thất bại: ${detail}`)
    } finally {
      setExportingKind(null)
    }
  }

  // Export 2: Overdue Debt & Utility Registry — .xlsx THẬT, tiền là ô SỐ có định dạng
  const handleExportOverdueDebtsExcel = async () => {
    /**
     * Tiền nợ dùng `numberFormat` thay vì `formatter` trả chuỗi "1.085.667":
     * giá trị ghi vào ô vẫn là number nên Excel cộng/sắp xếp được, chỉ hiển thị theo định dạng.
     */
    const vnd = '#,##0" đ"'
    const columns: ExportColumn<OverdueDebtRecord>[] = [
      { header: "STT", key: "stt", width: 50, align: "center" },
      { header: "Mã Hóa Đơn", key: "invoiceCode", width: 130 },
      { header: "MSSV", key: "studentId", width: 90, align: "center" },
      { header: "Họ và Tên", key: "fullName", width: 160 },
      { header: "Phòng Ở", key: "room", width: 70, align: "center" },
      { header: "Mã Giường", key: "bedCode", width: 110, align: "center" },
      { header: "Kỳ Tính Cước", key: "billingPeriod", width: 140, align: "center" },
      {
        header: "Tiền phòng nợ VNĐ",
        key: "roomDebt",
        formatter: (v) => Number(v),
        numberFormat: vnd,
        width: 130,
      },
      {
        header: "Tiền điện nước nợ VNĐ",
        key: "utilityDebt",
        formatter: (v) => Number(v),
        numberFormat: vnd,
        width: 140,
      },
      {
        header: "Tổng nợ VNĐ",
        key: "totalDebt",
        formatter: (v) => Number(v),
        numberFormat: vnd,
        width: 130,
      },
      { header: "Hạn Thanh Toán", key: "dueDate", width: 100, align: "center" },
      { header: "Số Ngày Quá Hạn", key: "overdueDays", width: 100, align: "center" },
      { header: "Trạng Thái Cảnh Báo", key: "status", width: 140, align: "center" },
      { header: "SĐT Liên Hệ", key: "phone", width: 110, align: "center" },
    ]

    const filename = `Danh_Sach_Cong_No_Qua_Han_${new Date().toISOString().substring(0, 10)}.xlsx`
    setExportingKind("DEBTS_XLSX")
    try {
      const { rows, usedFallback } = await loadReportRows<OverdueDebtRecord>(
        () => dashboardApi.debts() as Promise<OverdueDebtRecord[]>,
        MOCK_OVERDUE_DEBTS,
        "danh sách công nợ",
      )

      if (rows.length === 0) {
        showToast("⚠️ Không có dữ liệu công nợ quá hạn để xuất file.")
        return
      }

      await exportToExcel({
        filename,
        sheetName: "Công Nợ Quá Hạn",
        title: "BÁO CÁO CÔNG NỢ QUÁ HẠN TIỀN PHÒNG & ĐIỆN NƯỚC KÝ TÚC XÁ",
        subtitle: `Ban Quản lý KTX FPT • Người lập: ${user?.fullName || "Thầy Vũ Thành Nam"} • Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`,
        columns,
        data: rows,
      })

      showToast(
        usedFallback
          ? `⚠️ Đã xuất ${filename} từ DỮ LIỆU MẪU (backend không phản hồi).`
          : `✅ Đã xuất file Excel thật ${filename} (${rows.length} hóa đơn).`,
      )
    } catch (error) {
      const detail = error instanceof ApiError ? error.message : (error as Error).message
      showToast(`❌ Xuất file Excel công nợ thất bại: ${detail}`)
    } finally {
      setExportingKind(null)
    }
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

  /* ------------------------------------------------------------------
     Dữ liệu biểu đồ.

     Trước đây các con số của biểu đồ được viết cứng rời rạc (trục 350 triệu,
     tổng lũy kế 1.528,4 triệu) nên chúng KHÔNG khớp với dữ liệu thực sự vẽ
     ra, và không ai phát hiện khi dữ liệu đổi. Dưới đây mọi thứ được suy ra
     từ chính mảng dữ liệu: sửa dữ liệu thì biểu đồ tự đúng theo.
     ------------------------------------------------------------------ */
  const stats = MOCK_OCCUPANCY_STATS
  const total = stats.totalBeds
  const radius = 65
  const circumference = 2 * Math.PI * radius

  /** Tỷ lệ từng trạng thái giường (%, làm tròn 1 chữ số). */
  const bedShare = (count: number) => (total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0)
  const strokeOf = (count: number) => (total > 0 ? (count / total) * circumference : 0)

  /**
   * Bốn cung của vòng donut, vẽ nối tiếp nhau.
   * `offset` = tổng độ dài các cung đứng trước, lấy dấu âm để cung hiện tại
   * bắt đầu đúng chỗ cung trước kết thúc.
   */
  let runningStroke = 0
  const bedArcs = [
    { key: "occupied", label: "Đang ở", count: stats.occupiedBeds, color: "var(--muted-foreground)" },
    { key: "available", label: "Còn trống", count: stats.availableBeds, color: "var(--success)" },
    { key: "holding", label: "Giữ chỗ 15p", count: stats.holdingBeds, color: "var(--primary)" },
    { key: "maintenance", label: "Bảo trì", count: stats.maintenanceBeds, color: "var(--danger)" },
  ].map((segment) => {
    const dash = strokeOf(segment.count)
    const arc = { ...segment, dash, offset: -runningStroke, share: bedShare(segment.count) }
    runningStroke += dash
    return arc
  })

  /* ---------- Biểu đồ cột doanh thu ---------- */

  const revenueData = MOCK_MONTHLY_REVENUE
  const revenueTotals = revenueData.map((m) => m.roomFee + m.utilityFee)
  const revenuePeak = Math.max(1, ...revenueTotals)
  /** Trục tung làm tròn lên bội số 50 triệu để nhãn trục là số đẹp, và không bao giờ cắt cột. */
  const revenueAxisMax = Math.ceil(revenuePeak / 50_000_000) * 50_000_000
  const revenueGrandTotal = revenueTotals.reduce((sum, v) => sum + v, 0)
  /** Đổi giá trị (VNĐ) sang % chiều cao cột theo trục đã chọn. */
  const revenuePct = (value: number) => (value / revenueAxisMax) * 100
  /** Vạch chia ngang của trục tung, từ 100% xuống 0%. */
  const revenueTicks = [1, 0.75, 0.5, 0.25, 0]

  /* ---------- Đối chiếu tiêu thụ giữa các tòa ---------- */

  const consumptionData = MOCK_BUILDING_CONSUMPTION
  const maxKwh = Math.max(1, ...consumptionData.map((b) => b.electricityAvgKwh))
  const maxWater = Math.max(1, ...consumptionData.map((b) => b.waterAvgM3))
  /**
   * Ngưỡng cảnh báo, thay cho việc dò chữ "tăng" trong câu mô tả.
   * Dò chuỗi khiến cảnh báo phụ thuộc vào cách viết câu: chỉ cần sửa lại lời
   * văn là mất cảnh báo dù số liệu không đổi. So với ngưỡng thì ổn định và
   * giải thích được vì sao bị gắn cờ.
   */
  const KWH_WARN = 330
  const WATER_WARN = 20
  const consumptionAlerts = (b: (typeof consumptionData)[number]): string[] => {
    const alerts: string[] = []
    if (b.electricityAvgKwh >= KWH_WARN) alerts.push(`Điện từ ${KWH_WARN} kWh/phòng`)
    if (b.waterAvgM3 >= WATER_WARN) alerts.push(`Nước từ ${WATER_WARN} m³/phòng`)
    return alerts
  }

  /* ---------- Chỉ số KPI ở đầu trang ---------- */

  /** Tháng gần nhất và tháng liền trước, dùng cho thẻ "Doanh thu tháng". */
  const latestMonth = revenueData[revenueData.length - 1]
  const previousMonth = revenueData[revenueData.length - 2]
  const latestTotal = latestMonth ? latestMonth.roomFee + latestMonth.utilityFee : 0
  const previousTotal = previousMonth ? previousMonth.roomFee + previousMonth.utilityFee : 0
  /** Tăng trưởng tháng này so với tháng trước (%), null nếu chưa đủ dữ liệu. */
  const revenueGrowth =
    previousTotal > 0 ? Number((((latestTotal - previousTotal) / previousTotal) * 100).toFixed(1)) : null
  /** Số sinh viên đang có công nợ quá hạn (khớp bảng công nợ bên dưới). */
  const debtStudentCount = new Set(MOCK_OVERDUE_DEBTS.map((d) => d.studentId)).size
  /** Tổng công nợ quá hạn. */
  const totalDebt = MOCK_OVERDUE_DEBTS.reduce((sum, d) => sum + d.totalDebt, 0)
  /**
   * Số phiếu sự cố CHƯA xong. Đây là con số vận hành thật, lấy từ danh sách
   * phiếu đang hiển thị ở phân hệ Sửa chữa — trước đây thẻ này ghi cứng "2 phiếu"
   * kèm "1 ca khẩn cấp <2h" nên sai ngay khi có phiếu mới.
   */
  const openTicketCount = INITIAL_MAINTENANCE_TICKETS.filter(
    (t) => t.status === "PENDING" || t.status === "IN_PROGRESS",
  ).length

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
            <p className="text-2xl font-black text-foreground mt-1">
              {(latestTotal / 1_000_000).toFixed(1)} tr
            </p>
            <span className="text-[10px] text-muted-foreground">
              {revenueGrowth === null
                ? "Chưa đủ dữ liệu so sánh"
                : `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% so với tháng trước`}
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
              <span>Sự cố đang xử lý</span>
              <Zap className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground mt-1">{openTicketCount} phiếu</p>
            <span className="text-[10px] text-muted-foreground">
              Cần theo dõi &amp; xử lý
            </span>          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
              <span>Công nợ quá hạn</span>
              <DollarSign className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black text-foreground mt-1">{debtStudentCount} sinh viên</p>
            <span className="text-[10px] text-muted-foreground">
              Tổng {totalDebt.toLocaleString("vi-VN")} VNĐ
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
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <h3 className="font-bold text-sm text-foreground flex min-w-0 items-center gap-2 whitespace-nowrap">
                  <ChartPie className="h-4 w-4 shrink-0 text-primary-soft-foreground" />
                  <span className="truncate">Cơ Cấu Trạng Thái Giường (Tòa A)</span>
                </h3>
                <span className="shrink-0 text-xs font-mono font-bold whitespace-nowrap text-muted-foreground">240 Giường</span>
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
                  {/*
                    Bốn cung trạng thái giường.
                    KHÔNG dùng `strokeLinecap="round"`: đầu tròn làm mỗi cung phình
                    ra thêm nửa bề rộng nét vẽ ở cả hai đầu, nên các cung chồng lên
                    nhau và tổng hiển thị không còn khớp tỷ lệ thật. Nét bằng
                    (`butt`, mặc định) mới cộng đúng 100%.
                  */}
                  {bedArcs.map((arc) => (
                    <circle
                      key={arc.key}
                      cx="90"
                      cy="90"
                      r={radius}
                      stroke={arc.color}
                      strokeWidth="20"
                      fill="transparent"
                      strokeDasharray={`${arc.dash} ${circumference}`}
                      strokeDashoffset={arc.offset}
                    />
                  ))}
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-foreground">{stats.occupancyRate}%</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Lấp đầy
                  </span>
                </div>
              </div>

              {/* Legend & Breakdown — tỷ lệ % tính từ chính số giường, không viết cứng */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                {bedArcs.map((arc) => (
                  <div key={arc.key} className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 shrink-0 rounded-md" style={{ backgroundColor: arc.color }} />
                    <span className="truncate text-muted-foreground">
                      {arc.label} ({arc.share}%):
                    </span>
                    <strong className="ml-auto shrink-0 font-mono text-foreground">{arc.count}</strong>
                  </div>
                ))}
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
                    Doanh thu tiền phòng & hóa đơn điện nước dịch vụ
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                {/* Hai chuỗi dữ liệu PHẢI khác màu, nếu không thì không đọc được biểu đồ.
                    Dùng đúng hệ 3 màu của app: indigo = tiền phòng, emerald = điện nước/dịch vụ. */}
                <span className="flex items-center gap-1.5 whitespace-nowrap font-semibold text-foreground">
                  <span className="h-2.5 w-2.5 shrink-0 rounded bg-primary" /> Tiền phòng
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap font-semibold text-foreground">
                  <span className="h-2.5 w-2.5 shrink-0 rounded bg-success" /> Điện nước/DV
                </span>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization */}
            <div className="flex gap-2 py-2">
              {/* Trục tung: nhãn sinh từ trục đã tính, không viết cứng */}
              <div className="flex h-48 shrink-0 flex-col justify-between pb-0 text-right text-[9px] font-semibold text-muted-foreground">
                {revenueTicks.map((t) => (
                  <span key={t} className="font-mono leading-none">
                    {Math.round((revenueAxisMax * t) / 1_000_000)}tr
                  </span>
                ))}
              </div>

              <div className="min-w-0 flex-1">
                {/*
                  Vùng vẽ cột: `h-48` là đúng 100% chiều cao trục, không chứa nhãn
                  tháng (nhãn nằm ở hàng riêng bên dưới) nên chiều cao cột khớp
                  tuyệt đối với nhãn trục bên trái.
                */}
                <div className="relative h-48 border-b border-border/80">
                  {/* Vạch chia ngang ứng với từng nhãn trục */}
                  {revenueTicks.slice(0, -1).map((t) => (
                    <div
                      key={t}
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/60"
                      style={{ bottom: `${t * 100}%` }}
                    />
                  ))}

                  <div className="grid h-full grid-cols-6 items-end gap-3 sm:gap-6">
                    {revenueData.map((item, idx) => (
                      <div key={item.month} className="group relative flex h-full flex-col items-center justify-end">
                        {/*
                          Tooltip: cha phải `relative` thì tooltip mới neo theo đúng cột.
                          Trước đây cha không có `relative` nên tooltip định vị theo cả
                          trang và bay ra ngoài thẻ.
                        */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground p-1.5 font-mono text-[10px] text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          {item.month}: {(revenueTotals[idx] / 1_000_000).toFixed(1)} tr VNĐ
                        </div>

                        {/* Stacked Bars — hai đoạn khác màu: tiền phòng (indigo) ở dưới, điện nước (emerald) ở trên */}
                        <div className="flex h-full w-full max-w-[36px] flex-col items-center justify-end">
                          <div
                            style={{ height: `${revenuePct(item.utilityFee)}%` }}
                            className="w-full rounded-t-md bg-success transition-all group-hover:brightness-95"
                            title={`Điện nước/DV ${item.month}: ${item.utilityFee.toLocaleString("vi-VN")}đ`}
                          />
                          <div
                            style={{ height: `${revenuePct(item.roomFee)}%` }}
                            className="w-full bg-primary transition-all group-hover:brightness-95"
                            title={`Tiền phòng ${item.month}: ${item.roomFee.toLocaleString("vi-VN")}đ`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nhãn trục hoành, căn đúng 6 cột như vùng vẽ */}
                <div className="mt-2 grid grid-cols-6 gap-3 sm:gap-6">
                  {revenueData.map((item) => (
                    <span key={item.month} className="whitespace-nowrap text-center text-[10px] font-semibold text-muted-foreground">
                      {item.month.replace("Tháng ", "T")}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Total Summary — cộng từ dữ liệu, không viết cứng */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-3 text-xs">
              <span className="truncate text-muted-foreground">Tổng thu lũy kế {revenueData.length} tháng:</span>
              <span className="shrink-0 whitespace-nowrap font-mono text-sm font-bold text-foreground">
                {revenueGrandTotal.toLocaleString("vi-VN")} VNĐ
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
              {consumptionData.map((item) => {
                const alerts = consumptionAlerts(item)
                const isAnomaly = alerts.length > 0

                return (
                  <div
                    key={item.building}
                    className={`p-5 rounded-2xl border transition-all ${
                      isAnomaly
                        ? "border-danger/30 bg-danger/5 shadow-xs"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-foreground">
                        <Building className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">{item.building}</span>
                      </h4>
                      {isAnomaly && (
                        <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-bold text-danger-soft-foreground">
                          <TriangleAlert className="h-3 w-3" /> Cảnh báo
                        </span>
                      )}
                    </div>

                    {/*
                      Điện và nước là hai đại lượng KHÁC ĐƠN VỊ (kWh vs m³) nên không
                      thể so sánh trực tiếp với nhau. Mỗi chỉ số có thanh riêng, chuẩn
                      hoá theo tòa cao nhất của chính nó — nhờ vậy nhìn ra ngay tòa nào
                      đang cao hơn mặt bằng chung.
                    */}
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                            <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate">Điện TB</span>
                          </span>
                          <span className="shrink-0 whitespace-nowrap font-mono text-sm font-black text-foreground">
                            {item.electricityAvgKwh}
                            <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">kWh/phòng</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${item.electricityAvgKwh >= KWH_WARN ? "bg-danger" : "bg-primary"}`}
                            style={{ width: `${(item.electricityAvgKwh / maxKwh) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                            <Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate">Nước TB</span>
                          </span>
                          <span className="shrink-0 whitespace-nowrap font-mono text-sm font-black text-foreground">
                            {item.waterAvgM3}
                            <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">m³/phòng</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${item.waterAvgM3 >= WATER_WARN ? "bg-danger" : "bg-primary"}`}
                            style={{ width: `${(item.waterAvgM3 / maxWater) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {isAnomaly ? (
                      <p className="mt-3 text-[11px] font-semibold text-danger-soft-foreground">
                        Vượt ngưỡng: {alerts.join(" · ")}
                      </p>
                    ) : (
                      <p className="mt-3 text-[11px] font-semibold text-success-soft-foreground">
                        Trong ngưỡng an toàn
                      </p>
                    )}
                    <ExpandableText className="mt-1" textClassName="text-[11px] text-muted-foreground">
                      {item.anomalyNote ?? ""}
                    </ExpandableText>
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
                <Button
                  variant="success"
                  className="hover:bg-success flex"
                  onClick={handleExportResidenceExcel}
                  disabled={exportingKind !== null}
                >
                  <Download className="h-4 w-4" />
                  <span>{exportingKind === "RESIDENTS_XLSX" ? "Đang xuất..." : "Xuất Excel Tạm Trú (.xlsx)"}</span>
                </Button>

                <button
                  onClick={handleExportResidenceCsv}
                  disabled={exportingKind !== null}
                  className="rounded-2xl border border-success/25 bg-success/10 hover:bg-success/20 text-success-soft-foreground px-3.5 py-2.5 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="h-4 w-4" />
                  <span>{exportingKind === "RESIDENTS_CSV" ? "Đang xuất..." : "Xuất CSV (UTF-8)"}</span>
                </button>

                <Button
                  variant="destructive"
                  className="hover:bg-danger flex"
                  onClick={handleExportOverdueDebtsExcel}
                  disabled={exportingKind !== null}
                >
                  <Download className="h-4 w-4" />
                  <span>{exportingKind === "DEBTS_XLSX" ? "Đang xuất..." : "Xuất Excel Công Nợ (.xlsx)"}</span>
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
                  disabled={exportingKind !== null}
                  className="text-xs text-success-soft-foreground hover:text-success-soft-foreground font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={exportingKind !== null}
                  className="text-xs text-danger-soft-foreground hover:text-danger-soft-foreground font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
