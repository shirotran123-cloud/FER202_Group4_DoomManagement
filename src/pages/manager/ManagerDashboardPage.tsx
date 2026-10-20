import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import {
  MOCK_OCCUPANCY_STATS,
  MOCK_MONTHLY_REVENUE,
  MOCK_RESIDENTS_REGISTRY,
  MOCK_OVERDUE_DEBTS,
} from "@/data/mockDashboard"
import {
  exportToExcelXml,
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
  CheckCircle2,
  Filter,
  Users,
  DollarSign,
} from "lucide-react"

// Decomposed components
import { ManagerHeaderStats } from "./components/ManagerHeaderStats"
import { OccupancyDonutChart } from "./components/OccupancyDonutChart"
import { RevenueTrendChart } from "./components/RevenueTrendChart"
import { ResidentRegistryTable } from "./components/ResidentRegistryTable"
import { OverdueDebtsTable } from "./components/OverdueDebtsTable"

export const ManagerDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "REPORTS">("OVERVIEW")
  const [reportSubTab, setReportSubTab] = useState<
    "TEMPORARY_RESIDENCE" | "OVERDUE_DEBTS"
  >("TEMPORARY_RESIDENCE")
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL")
  const [searchReportQuery, setSearchReportQuery] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4500)
  }

  // Filtered resident registry theo tìm kiếm và học kỳ
  const filteredResidents = MOCK_RESIDENTS_REGISTRY.filter((res) => {
    const matchQuery =
      res.fullName.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      res.studentId.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      res.room.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      res.citizenId.includes(searchReportQuery)

    const matchSemester =
      selectedSemester === "ALL" || res.semester === selectedSemester

    return matchQuery && matchSemester
  })

  // Filtered debts theo tìm kiếm và học kỳ
  const filteredDebts = MOCK_OVERDUE_DEBTS.filter((d) => {
    const matchQuery =
      d.fullName.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.studentId.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.room.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
      d.invoiceCode.toLowerCase().includes(searchReportQuery.toLowerCase())

    const matchSemester =
      selectedSemester === "ALL" || d.semester === selectedSemester

    return matchQuery && matchSemester
  })

  // Export 1: Resident Temporary Residence for Local Police (Excel XML)
  const handleExportResidenceExcel = () => {
    const columns: ExportColumn<ResidentTemporaryRecord>[] = [
      { header: "STT", key: "stt", width: 50 },
      { header: "Học Kỳ", key: "semester", width: 90 },
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
      subtitle: `Trường Đại học FPT • Ban Quản lý KTX • Cán bộ: ${user?.fullName || "Vũ Thành Nam"} • Học kỳ: ${selectedSemester === "ALL" ? "Tất cả" : selectedSemester}`,
      columns,
      data: filteredResidents,
    })

    showToast("📊 Đã xuất file Excel Tạm Trú thành công!")
  }

  // Export 2: CSV
  

  // Export 3: Overdue Debts (Excel XML)
  const handleExportOverdueDebtsExcel = () => {
    const columns: ExportColumn<OverdueDebtRecord>[] = [
      { header: "STT", key: "stt", width: 50 },
      { header: "Học Kỳ", key: "semester", width: 90 },
      { header: "Mã Hóa Đơn", key: "invoiceCode", width: 120 },
      { header: "Mã Sinh Viên", key: "studentId", width: 100 },
      { header: "Họ và Tên", key: "fullName", width: 160 },
      { header: "Phòng", key: "room", width: 70 },
      { header: "Mã Giường", key: "bedCode", width: 90 },
      { header: "Kỳ Thu Phí", key: "billingPeriod", width: 100 },
      { header: "Nợ Tiền Phòng (VNĐ)", key: "roomDebt", width: 130 },
      { header: "Nợ Điện Nước (VNĐ)", key: "utilityDebt", width: 130 },
      { header: "Tổng Công Nợ (VNĐ)", key: "totalDebt", width: 140 },
      { header: "Hạn Chót Thanh Toán", key: "dueDate", width: 110 },
      { header: "Số Ngày Quá Hạn", key: "overdueDays", width: 100 },
      { header: "Mức Độ Cảnh Báo", key: "status", width: 140 },
    ]

    exportToExcelXml({
      filename: `Danh_Sach_Cong_No_Qua_Han_KTX_${new Date().toISOString().substring(0, 10)}.xlsx`,
      sheetName: "DS Nợ Quá Hạn",
      title: "DANH SÁCH SINH VIÊN CÔNG NỢ QUÁ HẠN CHƯA THANH TOÁN TIỀN KTX",
      subtitle: `Bộ phận Tài chính KTX FPT • Học kỳ: ${selectedSemester === "ALL" ? "Tất cả" : selectedSemester} • Cập nhật lúc: ${new Date().toLocaleTimeString("vi-VN")}`,
      columns,
      data: filteredDebts,
    })

    showToast("📊 Đã xuất file Excel Công Nợ Quá Hạn thành công!")
  }

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

      {/* Hero Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Bàn Làm Việc Quản Lý Ký Túc Xá
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Hệ thống giám sát chỉ số lấp đầy buồng giường, kiểm soát tiêu thụ
              điện nước.
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
            Báo Cáo Nghiệp Vụ & Dữ Liệu Tạm Trú / Công Nợ (.xlsx)
          </span>
        </Button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: VISUAL DASHBOARDS & CHARTS                         */}
      {/* ========================================================= */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <OccupancyDonutChart stats={stats} />
            <RevenueTrendChart monthlyRevenue={MOCK_MONTHLY_REVENUE} />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EXCEL REPORTS EXPORT & DATA TABLE (TÍCH HỢP 1 BẢNG)*/}
      {/* ========================================================= */}
      {activeTab === "REPORTS" && (
        <Card className="space-y-4 p-5 sm:p-6 shadow-xs">
          {/* Header Toolbar: Tabs, Bộ lọc theo kỳ, Tra cứu, Nút xuất Excel/CSV */}
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between border-b border-border pb-4">
            {/* Sub-Tabs: Tạm trú vs Công nợ & Bộ lọc theo kỳ */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex rounded-xl border border-border bg-muted/60 p-1 text-xs">
                <Button
                  variant={
                    reportSubTab === "TEMPORARY_RESIDENCE" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setReportSubTab("TEMPORARY_RESIDENCE")}
                  className="text-xs font-bold gap-1.5"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>1. Danh Sách Tạm Trú ({filteredResidents.length})</span>
                </Button>
                <Button
                  variant={
                    reportSubTab === "OVERDUE_DEBTS" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setReportSubTab("OVERDUE_DEBTS")}
                  className="text-xs font-bold gap-1.5"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>2. Danh Sách Công Nợ Quá Hạn ({filteredDebts.length})</span>
                </Button>
              </div>

              {/* Bộ lọc theo kỳ */}
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs shadow-2xs">
                <Filter className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground font-semibold">Học kỳ:</span>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">Tất cả học kỳ</option>
                  <option value="Fall 2026">Học kỳ Fall 2026</option>
                  <option value="Summer 2026">Học kỳ Summer 2026</option>
                  <option value="Spring 2026">Học kỳ Spring 2026</option>
                  <option value="Fall 2025">Học kỳ Fall 2025</option>
                </select>
              </div>
            </div>

            {/* Tra cứu & Nút xuất file Excel/CSV */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Input
                  icon={<Search className="h-3.5 w-3.5" />}
                  value={searchReportQuery}
                  onChange={(e) => setSearchReportQuery(e.target.value)}
                  placeholder="Tra cứu MSSV, họ tên, phòng..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={
                    reportSubTab === "TEMPORARY_RESIDENCE"
                      ? handleExportResidenceExcel
                      : handleExportOverdueDebtsExcel
                  }
                  className="gap-1.5 font-bold shadow-xs text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Xuất Excel (.xlsx)</span>
                </Button>

                
              </div>
            </div>
          </div>

          {/* Table Container với Chế Độ Cuộn Dọc */}
          <div className="relative overflow-x-auto overflow-y-auto max-h-[460px] rounded-xl border border-border">
            {reportSubTab === "TEMPORARY_RESIDENCE" ? (
              <ResidentRegistryTable residents={filteredResidents} />
            ) : (
              <OverdueDebtsTable debts={filteredDebts} />
            )}
          </div>

          {/* Footer thông tin và chế độ cuộn */}
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 gap-2">
            <span>
              Hiển thị{" "}
              <strong className="text-foreground">
                {reportSubTab === "TEMPORARY_RESIDENCE"
                  ? filteredResidents.length
                  : filteredDebts.length}
              </strong>{" "}
              sinh viên phù hợp
            </span>
            <span className="text-[11px] text-muted-foreground/80 italic">
              * Bảng có chế độ cuộn dọc để duyệt danh sách mà không chiếm diện tích trang
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
