import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import {
  MOCK_OCCUPANCY_STATS,
  MOCK_MONTHLY_REVENUE,
  MOCK_BUILDING_CONSUMPTION,
  MOCK_RESIDENTS_REGISTRY,
  MOCK_OVERDUE_DEBTS,
} from "@/data/mockDashboard"
import {
  exportToExcelXml,
  exportToCsv,
  type ExportColumn,
} from "@/lib/excelExport"
import type {
  ResidentTemporaryRecord,
  OverdueDebtRecord,
} from "@/types/dashboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileSpreadsheet,
  PieChart,
  Download,
  Search,
  FileDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

// Decomposed components
import { ManagerHeaderStats } from "./components/ManagerHeaderStats"
import { OccupancyDonutChart } from "./components/OccupancyDonutChart"
import { RevenueTrendChart } from "./components/RevenueTrendChart"
import { BuildingConsumptionGrid } from "./components/BuildingConsumptionGrid"
import { ResidentRegistryTable } from "./components/ResidentRegistryTable"
import { OverdueDebtsTable } from "./components/OverdueDebtsTable"

export const ManagerDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "REPORTS">("OVERVIEW")
  const [reportSubTab, setReportSubTab] = useState<
    "TEMPORARY_RESIDENCE" | "OVERDUE_DEBTS"
  >("TEMPORARY_RESIDENCE")
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
      { header: "Số CCCD/CMND", key: "citizenId", width: 120 },
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

    showToast(
      "📊 Đã xuất file Excel: Danh_Sach_Tam_Tru_KTX_FPT.xlsx thành công!"
    )
  }

  // Export CSV alternative
  const handleExportResidenceCsv = () => {
    const columns: ExportColumn<ResidentTemporaryRecord>[] = [
      { header: "STT", key: "stt" },
      { header: "Mã Hợp Đồng", key: "contractCode" },
      { header: "Họ và Tên", key: "fullName" },
      { header: "MSSV", key: "studentId" },
      { header: "Giới Tính", key: "gender" },
      { header: "Số CCCD", key: "citizenId" },
      { header: "Quê Quán", key: "hometown" },
      { header: "Tòa", key: "building" },
      { header: "Phòng", key: "room" },
      { header: "Giường", key: "bedCode" },
      { header: "Ngày Bắt Đầu", key: "startDate" },
      { header: "Hạn Hợp Đồng", key: "endDate" },
    ]

    exportToCsv({
      filename: `Danh_Sach_Tam_Tru_${new Date().toISOString().substring(0, 10)}.csv`,
      columns,
      data: MOCK_RESIDENTS_REGISTRY,
    })

    showToast("📄 Đã tải về file CSV Danh Sách Tạm Trú (UTF-8)!")
  }

  // Export 2: Overdue Debts List
  const handleExportOverdueDebtsExcel = () => {
    const columns: ExportColumn<OverdueDebtRecord>[] = [
      { header: "STT", key: "stt", width: 50 },
      { header: "Mã Hóa Đơn", key: "invoiceCode", width: 110 },
      { header: "Mã Sinh Viên", key: "studentId", width: 90 },
      { header: "Họ và Tên", key: "fullName", width: 160 },
      { header: "Số Điện Thoại", key: "phone", width: 100 },
      { header: "Tòa Nhà", key: "building", width: 90 },
      { header: "Phòng", key: "room", width: 70 },
      { header: "Mã Giường", key: "bedCode", width: 90 },
      { header: "Kỳ Thu Phí", key: "billingPeriod", width: 100 },
      { header: "Nợ Tiền Phòng (VNĐ)", key: "roomDebt", width: 130 },
      { header: "Nợ Điện Nước (VNĐ)", key: "utilityDebt", width: 130 },
      { header: "Tổng Công Nợ (VNĐ)", key: "totalDebt", width: 140 },
      { header: "Hạn Chót Thanh Toán", key: "dueDate", width: 110 },
      { header: "Số Ngày Quá Hạn", key: "daysOverdue", width: 100 },
      { header: "Mức Độ Cảnh Báo", key: "status", width: 140 },
    ]

    exportToExcelXml({
      filename: `Danh_Sach_Cong_No_Qua_Han_KTX_${new Date().toISOString().substring(0, 10)}.xlsx`,
      sheetName: "DS Nợ Quá Hạn",
      title: "DANH SÁCH SINH VIÊN CÔNG NỢ QUÁ HẠN CHƯA THANH TOÁN TIỀN KTX",
      subtitle: `Bộ phận Tài chính KTX FPT • Kỳ Thu Tháng 09/2026 • Cập nhật lúc: ${new Date().toLocaleTimeString("vi-VN")}`,
      columns,
      data: MOCK_OVERDUE_DEBTS,
    })

    showToast(
      "📊 Đã xuất file Excel: Danh_Sach_Cong_No_Qua_Han_KTX.xlsx thành công!"
    )
  }

  // Filtered resident registry
  const filteredResidents = MOCK_RESIDENTS_REGISTRY.filter(
    (res) =>
      res.fullName.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      res.studentId.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      res.room.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      res.citizenId.includes(searchReportQuery)
  )

  // Filtered debts
  const filteredDebts = MOCK_OVERDUE_DEBTS.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.studentId.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.room.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.invoiceCode.toLowerCase().includes(searchReportQuery.toLowerCase())
  )

  const stats = MOCK_OCCUPANCY_STATS

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-2.5 rounded-xl border border-border bg-foreground px-4 py-3 text-sm font-medium text-background shadow-xl slide-in-from-bottom-5 fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Ops Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>DMS Central Operations & Executive Reports</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Bàn Làm Việc Quản Lý Ký Túc Xá (DMS Hub)
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Hệ thống giám sát chỉ số lấp đầy buồng giường, kiểm soát tiêu thụ
              điện nước và xuất báo cáo lưu trú định dạng chuẩn Excel (.xlsx).
            </p>
          </div>

          <ManagerHeaderStats stats={stats} />
        </div>
      </Card>

      {/* Main Tabs Navigation */}
      <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-border bg-muted/60 p-1 sm:flex-row">
        <Button
          variant={activeTab === "OVERVIEW" ? "default" : "ghost"}
          size="default"
          onClick={() => setActiveTab("OVERVIEW")}
          className="min-w-0 flex-1 gap-2 font-bold whitespace-normal"
        >
          <PieChart className="h-4 w-4" />
          <span className="min-w-0 text-center">
            Dashboard Trực Quan Công Suất & Năng Lượng
          </span>
        </Button>

        <Button
          variant={activeTab === "REPORTS" ? "default" : "ghost"}
          size="default"
          onClick={() => setActiveTab("REPORTS")}
          className="min-w-0 flex-1 gap-2 font-bold whitespace-normal"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="min-w-0 text-center">
            Xuất Báo Cáo Nghiệp Vụ Excel (.xlsx)
          </span>
        </Button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: VISUAL DASHBOARDS & CHARTS                         */}
      {/* ========================================================= */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Row 1: Bed Occupancy Donut Chart + Revenue Bar Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <OccupancyDonutChart stats={stats} />
            <RevenueTrendChart monthlyRevenue={MOCK_MONTHLY_REVENUE} />
          </div>

          {/* Row 2: Building Utility Consumption Alert Grid */}
          <BuildingConsumptionGrid consumptions={MOCK_BUILDING_CONSUMPTION} />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EXCEL REPORTS EXPORT & DATA PREVIEW                */}
      {/* ========================================================= */}
      {activeTab === "REPORTS" && (
        <div className="space-y-6">
          {/* Action Box to Trigger Excel Exports */}
          <Card className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                  <FileSpreadsheet className="h-4 w-4" /> Kết Xuất Dữ Liệu
                  Nghiệp Vụ Chuẩn
                </span>
                <h2 className="mt-0.5 text-xl font-bold text-foreground">
                  Xuất Báo Cáo Định Dạng Microsoft Excel (.xlsx) & CSV
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hỗ trợ đầy đủ tiếng Việt có dấu, định dạng bảng có tiêu đề cơ
                  quan, màu nhận diện FPT và số liệu tài chính
                </p>
              </div>

              {/* Big Export Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="default"
                  onClick={handleExportResidenceExcel}
                  className="gap-2 font-bold shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  <span>Xuất Excel Tạm Trú (.xlsx)</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExportResidenceCsv}
                  className="gap-1.5 font-bold"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Xuất CSV</span>
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleExportOverdueDebtsExcel}
                  className="gap-2 font-bold shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  <span>Xuất Excel Công Nợ (.xlsx)</span>
                </Button>
              </div>
            </div>

            {/* Sub-Tabs for Preview Table */}
            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex rounded-xl border border-border bg-muted/60 p-1">
                <Button
                  variant={
                    reportSubTab === "TEMPORARY_RESIDENCE" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setReportSubTab("TEMPORARY_RESIDENCE")}
                  className="text-xs font-bold"
                >
                  1. Danh Sách Tạm Trú ({MOCK_RESIDENTS_REGISTRY.length} SV)
                </Button>
                <Button
                  variant={
                    reportSubTab === "OVERDUE_DEBTS" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setReportSubTab("OVERDUE_DEBTS")}
                  className="text-xs font-bold"
                >
                  2. Danh Sách Công Nợ Quá Hạn ({MOCK_OVERDUE_DEBTS.length} SV)
                </Button>
              </div>

              {/* Search Bar for Preview */}
              <div className="relative w-full sm:w-64">
                <Input
                  icon={<Search className="h-3.5 w-3.5" />}
                  value={searchReportQuery}
                  onChange={(e) => setSearchReportQuery(e.target.value)}
                  placeholder="Tra cứu MSSV, họ tên, phòng..."
                />
              </div>
            </div>
          </Card>

          {/* TABLE 1: RESIDENCE PREVIEW */}
          {reportSubTab === "TEMPORARY_RESIDENCE" && (
            <ResidentRegistryTable
              residents={filteredResidents}
              onExportExcel={handleExportResidenceExcel}
            />
          )}

          {/* TABLE 2: OVERDUE DEBTS PREVIEW */}
          {reportSubTab === "OVERDUE_DEBTS" && (
            <OverdueDebtsTable
              debts={filteredDebts}
              onExportExcel={handleExportOverdueDebtsExcel}
            />
          )}
        </div>
      )}
    </div>
  )
}
