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
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal"
import {
  FileSpreadsheet,
  PieChart,
  Download,
  Search,
  CheckCircle2,
  Filter,
  Users,
  DollarSign,
  ArrowRight,
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
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed right-6 bottom-6 z-50 flex animate-in items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-xl slide-in-from-bottom-5 fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header (8pt Grid: p-8 = 32px) */}
      <ScrollReveal>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <span className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-xs font-bold tracking-wider text-secondary uppercase">
                Trung Tâm Điều Hành Quản Lý
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Bàn Làm Việc Quản Lý Ký Túc Xá
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed font-normal text-muted-foreground sm:text-base">
                Hệ thống giám sát chỉ số lấp đầy buồng giường, kiểm soát tiêu thụ
                điện nước và xuất báo cáo nghiệp vụ.
              </p>
            </div>

            <ManagerHeaderStats stats={stats} />
          </div>
        </Card>
      </ScrollReveal>

      {/* Main Tabs Navigation (8pt Grid: p-2 = 8px, gap-2 = 8px) */}
      <ScrollReveal delay={0.05}>
        <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-border bg-muted/70 p-2 sm:flex-row">
          <Button
            variant={activeTab === "OVERVIEW" ? "secondary" : "ghost"}
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
            variant={activeTab === "REPORTS" ? "secondary" : "ghost"}
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
      </ScrollReveal>

      {/* ========================================================= */}
      {/* TAB 1: VISUAL DASHBOARDS & CHARTS (Staggered 100ms)       */}
      {/* ========================================================= */}
      {activeTab === "OVERVIEW" && (
        <StaggerContainer
          staggerDelay={0.1}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <StaggerItem className="lg:col-span-1">
            <OccupancyDonutChart stats={stats} />
          </StaggerItem>
          <StaggerItem className="lg:col-span-2">
            <RevenueTrendChart monthlyRevenue={MOCK_MONTHLY_REVENUE} />
          </StaggerItem>
        </StaggerContainer>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EXCEL REPORTS EXPORT & DATA TABLE                  */}
      {/* ========================================================= */}
      {activeTab === "REPORTS" && (
        <ScrollReveal>
          <Card className="space-y-6 p-6 sm:p-8 shadow-xs">
            {/* Header Toolbar: Tabs, Bộ lọc theo kỳ, Tra cứu, Nút xuất Excel/CSV */}
            <div className="flex flex-col gap-4 border-b border-border pb-6 xl:flex-row xl:items-center xl:justify-between">
              {/* Sub-Tabs: Tạm trú vs Công nợ & Bộ lọc theo kỳ */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-2 rounded-xl border border-border bg-muted/60 p-1.5 text-xs">
                  <Button
                    variant={
                      reportSubTab === "TEMPORARY_RESIDENCE"
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    onClick={() => setReportSubTab("TEMPORARY_RESIDENCE")}
                    className="gap-2 text-xs font-bold"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>1. Danh Sách Tạm Trú ({filteredResidents.length})</span>
                  </Button>
                  <Button
                    variant={
                      reportSubTab === "OVERDUE_DEBTS" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setReportSubTab("OVERDUE_DEBTS")}
                    className="gap-2 text-xs font-bold"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>
                      2. Danh Sách Công Nợ Quá Hạn ({filteredDebts.length})
                    </span>
                  </Button>
                </div>

                {/* Bộ lọc theo kỳ */}
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs shadow-2xs">
                  <Filter className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-semibold text-muted-foreground">
                    Học kỳ:
                  </span>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="cursor-pointer bg-transparent text-xs font-bold text-foreground focus:outline-none"
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
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <Input
                    icon={<Search className="h-4 w-4" />}
                    value={searchReportQuery}
                    onChange={(e) => setSearchReportQuery(e.target.value)}
                    placeholder="Tra cứu MSSV, họ tên, phòng..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="default"
                    onClick={
                      reportSubTab === "TEMPORARY_RESIDENCE"
                        ? handleExportResidenceExcel
                        : handleExportOverdueDebtsExcel
                    }
                    className="gap-2 text-xs font-bold shadow-xs"
                  >
                    <Download className="h-4 w-4" />
                    <span>Xuất Excel (.xlsx)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Table Container với Chế Độ Cuộn Dọc */}
            <div className="relative max-h-[480px] overflow-x-auto overflow-y-auto rounded-2xl border border-border">
              {reportSubTab === "TEMPORARY_RESIDENCE" ? (
                <ResidentRegistryTable residents={filteredResidents} />
              ) : (
                <OverdueDebtsTable debts={filteredDebts} />
              )}
            </div>

            {/* Footer thông tin và chế độ cuộn */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted-foreground sm:text-sm">
              <span>
                Hiển thị{" "}
                <strong className="text-foreground">
                  {reportSubTab === "TEMPORARY_RESIDENCE"
                    ? filteredResidents.length
                    : filteredDebts.length}
                </strong>{" "}
                sinh viên phù hợp
              </span>
              <span className="text-xs italic text-muted-foreground">
                * Bảng có chế độ cuộn dọc để duyệt danh sách mà không chiếm diện
                tích trang
              </span>
            </div>
          </Card>
        </ScrollReveal>
      )}
    </div>
  )
}
