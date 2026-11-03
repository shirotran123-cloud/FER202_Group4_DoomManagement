import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { MOCK_RESIDENTS_REGISTRY } from "@/data/mockDashboard"
import type { ResidentTemporaryRecord } from "@/types/dashboard"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal"
import {
  Users,
  Search,
  Building2,
  Filter,
  Bed,
  Sparkles,
  Server,
  Globe,
  Database,
  Cpu,
  RefreshCw,
  HardDriveDownload,
  CheckCircle2,
  Clock,
  KeyRound,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react"

// Data full 4 Tòa Ký Túc Xá trường Đại học FPT (Tòa A & B: Nam, Tòa C & D: Nữ)
interface RoomTypeBreakdown {
  type: "Buồng 4 giường" | "Buồng 6 giường"
  roomCount: number
  totalBeds: number
  occupiedBeds: number
  emptyBeds: number
  occupancyRate: number
}

interface BuildingStaff {
  role: string
  name: string
  phone: string
}

interface CampusBuildingData {
  id: string
  code: string
  name: string
  type: string
  genderZone: "Nam" | "Nữ"
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  emptyBeds: number
  occupancyRate: number
  managerName: string
  managerPhone: string
  technicianName: string
  technicianPhone: string
  powerStatus: "NORMAL" | "WARNING"
  waterStatus: "NORMAL" | "WARNING"
  roomBreakdown: {
    room4: RoomTypeBreakdown
    room6: RoomTypeBreakdown
  }
  managementTeam: BuildingStaff[]
  technicalTeam: BuildingStaff[]
}

const CAMPUS_BUILDINGS: CampusBuildingData[] = [
  {
    id: "BUILDING_A",
    code: "Tòa A",
    name: "Tòa A (Ký túc xá Nam)",
    type: "Nam sinh viên",
    genderZone: "Nam",
    totalRooms: 44,
    totalBeds: 192,
    occupiedBeds: 154,
    emptyBeds: 38,
    occupancyRate: 80.2,
    managerName: "Vũ Thành Nam",
    managerPhone: "0988 765 432",
    technicianName: "Đỗ Mạnh Hùng",
    technicianPhone: "0977 112 233",
    powerStatus: "NORMAL",
    waterStatus: "NORMAL",
    roomBreakdown: {
      room4: {
        type: "Buồng 4 giường",
        roomCount: 36,
        totalBeds: 144,
        occupiedBeds: 116,
        emptyBeds: 28,
        occupancyRate: 80.6,
      },
      room6: {
        type: "Buồng 6 giường",
        roomCount: 8,
        totalBeds: 48,
        occupiedBeds: 38,
        emptyBeds: 10,
        occupancyRate: 79.2,
      },
    },
    managementTeam: [
      { role: "Trưởng Ban Quản Lý", name: "Vũ Thành Nam", phone: "0988 765 432" },
      { role: "Phó Ban Quản Lý", name: "Lê Hoàng Long", phone: "0912 345 678" },
      { role: "Cán bộ QL Tầng 1-3", name: "Nguyễn Văn Hưng", phone: "0934 567 890" },
      { role: "Cán bộ QL Tầng 4-5", name: "Trần Minh Quang", phone: "0945 678 901" },
    ],
    technicalTeam: [
      { role: "Trưởng Kỹ Thuật Viên", name: "Đỗ Mạnh Hùng", phone: "0977 112 233" },
      { role: "KTV Phụ trách Điện nước", name: "Phạm Tuấn Anh", phone: "0966 223 344" },
      { role: "KTV Phụ trách Điện lạnh", name: "Bùi Quốc Việt", phone: "0955 334 455" },
      { role: "KTV Thiết bị buồng", name: "Hoàng Văn Bình", phone: "0988 445 566" },
    ],
  },
  {
    id: "BUILDING_B",
    code: "Tòa B",
    name: "Tòa B (Ký túc xá Nam)",
    type: "Nam sinh viên",
    genderZone: "Nam",
    totalRooms: 44,
    totalBeds: 192,
    occupiedBeds: 176,
    emptyBeds: 16,
    occupancyRate: 91.7,
    managerName: "Trần Văn Bảo",
    managerPhone: "0914 223 344",
    technicianName: "Lê Văn Phước",
    technicianPhone: "0905 667 889",
    powerStatus: "NORMAL",
    waterStatus: "NORMAL",
    roomBreakdown: {
      room4: {
        type: "Buồng 4 giường",
        roomCount: 36,
        totalBeds: 144,
        occupiedBeds: 132,
        emptyBeds: 12,
        occupancyRate: 91.7,
      },
      room6: {
        type: "Buồng 6 giường",
        roomCount: 8,
        totalBeds: 48,
        occupiedBeds: 44,
        emptyBeds: 4,
        occupancyRate: 91.7,
      },
    },
    managementTeam: [
      { role: "Trưởng Ban Quản Lý", name: "Trần Văn Bảo", phone: "0914 223 344" },
      { role: "Phó Ban Quản Lý", name: "Nguyễn Hữu Đạt", phone: "0923 456 789" },
      { role: "Cán bộ QL Tầng 1-3", name: "Võ Văn An", phone: "0933 678 912" },
      { role: "Cán bộ QL Tầng 4-5", name: "Đặng Tiến Dũng", phone: "0944 890 123" },
    ],
    technicalTeam: [
      { role: "Trưởng Kỹ Thuật Viên", name: "Lê Văn Phước", phone: "0905 667 889" },
      { role: "KTV Phụ trách Điện nước", name: "Mai Văn Hải", phone: "0911 334 556" },
      { role: "KTV Phụ trách Điện lạnh", name: "Trương Quốc Huy", phone: "0922 445 667" },
      { role: "KTV Thiết bị buồng", name: "Đoàn Hữu Phước", phone: "0933 556 778" },
    ],
  },
  {
    id: "BUILDING_C",
    code: "Tòa C",
    name: "Tòa C (Ký túc xá Nữ)",
    type: "Nữ sinh viên",
    genderZone: "Nữ",
    totalRooms: 44,
    totalBeds: 192,
    occupiedBeds: 144,
    emptyBeds: 48,
    occupancyRate: 75.0,
    managerName: "Hoàng Minh Trí",
    managerPhone: "0935 445 566",
    technicianName: "Nguyễn Bá Đạt",
    technicianPhone: "0983 112 244",
    powerStatus: "NORMAL",
    waterStatus: "NORMAL",
    roomBreakdown: {
      room4: {
        type: "Buồng 4 giường",
        roomCount: 36,
        totalBeds: 144,
        occupiedBeds: 108,
        emptyBeds: 36,
        occupancyRate: 75.0,
      },
      room6: {
        type: "Buồng 6 giường",
        roomCount: 8,
        totalBeds: 48,
        occupiedBeds: 36,
        emptyBeds: 12,
        occupancyRate: 75.0,
      },
    },
    managementTeam: [
      { role: "Trưởng Ban Quản Lý", name: "Hoàng Minh Trí", phone: "0935 445 566" },
      { role: "Phó Ban Quản Lý", name: "Nguyễn Thị Mai Loan", phone: "0978 123 456" },
      { role: "Cán bộ QL Tầng 1-3", name: "Phạm Thị Hương", phone: "0989 234 567" },
      { role: "Cán bộ QL Tầng 4-5", name: "Lê Thị Tuyết Mai", phone: "0990 345 678" },
    ],
    technicalTeam: [
      { role: "Trưởng Kỹ Thuật Viên", name: "Nguyễn Bá Đạt", phone: "0983 112 244" },
      { role: "KTV Phụ trách Điện nước", name: "Trần Đình Khang", phone: "0944 556 677" },
      { role: "KTV Phụ trách Điện lạnh", name: "Lương Văn Tín", phone: "0955 667 788" },
      { role: "KTV Thiết bị buồng", name: "Phan Văn Hậu", phone: "0966 778 899" },
    ],
  },
  {
    id: "BUILDING_D",
    code: "Tòa D",
    name: "Tòa D (Ký túc xá Nữ)",
    type: "Nữ sinh viên",
    genderZone: "Nữ",
    totalRooms: 44,
    totalBeds: 192,
    occupiedBeds: 168,
    emptyBeds: 24,
    occupancyRate: 87.5,
    managerName: "Phạm Ngọc Toàn",
    managerPhone: "0979 889 900",
    technicianName: "Võ Quốc Cường",
    technicianPhone: "0918 334 455",
    powerStatus: "NORMAL",
    waterStatus: "NORMAL",
    roomBreakdown: {
      room4: {
        type: "Buồng 4 giường",
        roomCount: 36,
        totalBeds: 144,
        occupiedBeds: 126,
        emptyBeds: 18,
        occupancyRate: 87.5,
      },
      room6: {
        type: "Buồng 6 giường",
        roomCount: 8,
        totalBeds: 48,
        occupiedBeds: 42,
        emptyBeds: 6,
        occupancyRate: 87.5,
      },
    },
    managementTeam: [
      { role: "Trưởng Ban Quản Lý", name: "Phạm Ngọc Toàn", phone: "0979 889 900" },
      { role: "Phó Ban Quản Lý", name: "Vũ Thị Ngọc Ánh", phone: "0902 345 678" },
      { role: "Cán bộ QL Tầng 1-3", name: "Nguyễn Thị Thúy Hằng", phone: "0913 456 789" },
      { role: "Cán bộ QL Tầng 4-5", name: "Đỗ Thị Minh Châu", phone: "0924 567 890" },
    ],
    technicalTeam: [
      { role: "Trưởng Kỹ Thuật Viên", name: "Võ Quốc Cường", phone: "0918 334 455" },
      { role: "KTV Phụ trách Điện nước", name: "Đinh Văn Hùng", phone: "0977 889 900" },
      { role: "KTV Phụ trách Điện lạnh", name: "Nguyễn Tấn Sang", phone: "0988 990 011" },
      { role: "KTV Thiết bị buồng", name: "Hà Văn Thịnh", phone: "0999 001 122" },
    ],
  },
]

export const AdminOverviewView: React.FC = () => {
  const { user: _user } = useAuth()

  // Active view tab
  const [activeTab, setActiveTab] = useState<"BUILDINGS" | "STUDENTS" | "SYSTEM">("BUILDINGS")

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Student list search & filter
  const [studentSearch, setStudentSearch] = useState("")
  const [buildingFilter, setBuildingFilter] = useState("ALL")
  const [selectedStudent, setSelectedStudent] = useState<ResidentTemporaryRecord | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuildingData | null>(null)

  // Filtered Students
  const filteredStudents = MOCK_RESIDENTS_REGISTRY.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.room.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.phone.includes(studentSearch)
    const matchesBuilding =
      buildingFilter === "ALL" || s.building.includes(buildingFilter)
    return matchesSearch && matchesBuilding
  })

  // System stats summary
  const totalCampusRooms = CAMPUS_BUILDINGS.reduce((sum, b) => sum + b.totalRooms, 0)
  const totalCampusBeds = CAMPUS_BUILDINGS.reduce((sum, b) => sum + b.totalBeds, 0)
  const totalOccupiedBeds = CAMPUS_BUILDINGS.reduce((sum, b) => sum + b.occupiedBeds, 0)
  const totalEmptyBeds = CAMPUS_BUILDINGS.reduce((sum, b) => sum + b.emptyBeds, 0)
  const avgOccupancyRate = Number(
    ((totalOccupiedBeds / totalCampusBeds) * 100).toFixed(1)
  )

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex animate-in items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground shadow-xl fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Welcome & Header Banner (30% Secondary Brand Deep Navy #1e3a5f with WCAG AAA White Text) */}
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-6 text-secondary-foreground shadow-md sm:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute right-40 -bottom-20 h-60 w-60 rounded-full bg-primary/20 blur-2xl" />

          <div className="relative z-10 space-y-2">
            <span className="inline-block rounded-lg bg-white/15 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
              Hệ Thống Quản Trị KTX Toàn Trường
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Tổng Quan Điều Hành Quản Trị Ký Túc Xá 👋
            </h1>
          </div>
        </div>
      </ScrollReveal>

      {/* KPI 4-Card Staggered Grid (100ms delay, 8pt gap-6 = 24px) */}
      <StaggerContainer
        staggerDelay={0.1}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* Card 1: Full Campus Dorms */}
        <StaggerItem>
          <div className="ui-card-interactive flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Quy Mô KTX Toàn Trường
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-foreground sm:text-3xl">
                4 Tòa Nhà{" "}
                <span className="font-mono text-sm font-medium text-muted-foreground">
                  ({totalCampusRooms} phòng)
                </span>
              </div>
              <div className="mt-2 text-xs font-normal text-muted-foreground sm:text-sm">
                {totalOccupiedBeds} / {totalCampusBeds} Giường • Lấp đầy{" "}
                {avgOccupancyRate}%
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs sm:text-sm">
              <span className="text-muted-foreground">Chỗ trống toàn trường:</span>
              <span className="font-mono font-bold text-primary">
                {totalEmptyBeds} Giường
              </span>
            </div>
          </div>
        </StaggerItem>

        {/* Card 2: Web Application & Server Infrastructure */}
        <StaggerItem>
          <div className="ui-card-interactive flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Hạ Tầng Web & Dịch Vụ
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-2xl font-extrabold text-primary sm:text-3xl">
                <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                <span>100% Online</span>
              </div>
              <div className="mt-2 text-xs font-normal text-muted-foreground sm:text-sm">
                Cụm Web DMS & CSDL hoạt động ổn định
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs sm:text-sm">
              <span className="text-muted-foreground">API FAP Đào tạo:</span>
              <span className="flex items-center gap-1.5 font-bold text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Đã đồng bộ</span>
              </span>
            </div>
          </div>
        </StaggerItem>

        {/* Card 3: User Accounts & Roles */}
        <StaggerItem>
          <div className="ui-card-interactive flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Tài Khoản & Phân Quyền Web
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="font-mono text-2xl font-extrabold text-foreground sm:text-3xl">
                662{" "}
                <span className="font-sans text-sm font-medium text-muted-foreground">
                  người dùng
                </span>
              </div>
              <div className="mt-2 text-xs font-normal text-muted-foreground sm:text-sm">
                642 Sinh viên • 12 BQL • 8 Kỹ thuật viên
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs sm:text-sm">
              <span className="text-muted-foreground">Học kỳ hệ thống:</span>
              <span className="font-mono font-bold text-foreground">
                Fall 2026
              </span>
            </div>
          </div>
        </StaggerItem>

        {/* Card 4: 4 Buildings Infrastructure & Operation */}
        <StaggerItem>
          <div className="ui-card-interactive flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Vận Hành Cơ Sở Vật Chất
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="font-mono text-2xl font-extrabold text-foreground sm:text-3xl">
                4 / 4 Tòa Nhà
              </div>
              <div className="mt-2 text-xs font-normal text-muted-foreground sm:text-sm">
                Hệ thống điện nước 176 phòng đạt chuẩn
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs sm:text-sm">
              <span className="text-muted-foreground">Tòa A, B, C, D:</span>
              <span className="flex items-center gap-1.5 font-bold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Vận hành ổn định</span>
              </span>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Switcher: 3 Tabs (Quản trị 4 Tòa, Cư dân toàn trường, Cấu hình web hệ thống) */}
      <ScrollReveal>
        <div className="no-scrollbar -mx-0.5 flex max-w-2xl gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 sm:gap-2 sm:p-2">
          <button
            onClick={() => setActiveTab("BUILDINGS")}
            className={`ui-btn-interactive flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold sm:px-4 sm:py-2.5 ${
              activeTab === "BUILDINGS"
                ? "bg-secondary font-extrabold text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">4 Tòa KTX</span>
              <span className="hidden sm:inline">Quản Trị 4 Tòa KTX ({CAMPUS_BUILDINGS.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("STUDENTS")}
            className={`ui-btn-interactive flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold sm:px-4 sm:py-2.5 ${
              activeTab === "STUDENTS"
                ? "bg-secondary font-extrabold text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Cư dân ({MOCK_RESIDENTS_REGISTRY.length})</span>
              <span className="hidden sm:inline">Cư Dân Toàn Trường ({MOCK_RESIDENTS_REGISTRY.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("SYSTEM")}
            className={`ui-btn-interactive flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold sm:px-4 sm:py-2.5 ${
              activeTab === "SYSTEM"
                ? "bg-secondary font-extrabold text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Hạ tầng Web</span>
              <span className="hidden sm:inline">Quản Trị Web & Hạ Tầng</span>
            </span>
          </button>
        </div>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* SECTION 1: QUẢN LÝ FULL 4 TÒA KÝ TÚC XÁ TOÀN TRƯỜNG        */}
      {/* ========================================================= */}
      {activeTab === "BUILDINGS" && (
        <StaggerContainer
          staggerDelay={0.1}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {CAMPUS_BUILDINGS.map((b) => (
            <StaggerItem key={b.id}>
              <div className="ui-card-interactive h-full space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg border border-secondary/20 bg-secondary/10 px-3 py-1 font-mono text-xs font-extrabold text-secondary">
                        {b.code}
                      </span>
                      <h3 className="text-lg font-bold text-foreground sm:text-xl">
                        {b.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs font-normal text-muted-foreground sm:text-sm">
                      {b.type}
                    </p>
                  </div>
                </div>

                {/* Occupancy Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-muted-foreground">
                      Tỷ lệ lấp đầy phòng ở
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {b.occupiedBeds} / {b.totalBeds} giường ({b.occupancyRate}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                      style={{ width: `${b.occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Quy mô:{" "}
                      <strong className="text-foreground">
                        {b.totalRooms} Phòng
                      </strong>
                    </span>
                    <span className="font-bold text-primary">
                      Trống {b.emptyBeds} chỗ
                    </span>
                  </div>
                </div>

                {/* Personnel */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/50 p-4 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Trưởng Ban Quản Lý:
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {b.managerName}
                    </p>
                    <span className="block font-mono text-xs text-muted-foreground">
                      {b.managerPhone}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Trưởng Kỹ Thuật Viên:
                    </span>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {b.technicianName}
                    </p>
                    <span className="block font-mono text-xs text-muted-foreground">
                      {b.technicianPhone}
                    </span>
                  </div>
                </div>

                {/* Action button with 2px arrow micro-interaction */}
                <button
                  type="button"
                  onClick={() => setSelectedBuilding(b)}
                  className="ui-btn-interactive flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-secondary hover:text-secondary-foreground sm:text-sm"
                >
                  <span>Xem chi tiết cấu hình {b.code}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: DANH SÁCH CƯ DÂN & SINH VIÊN TOÀN TRƯỜNG        */}
      {/* ========================================================= */}
      {activeTab === "STUDENTS" && (
        <ScrollReveal className="space-y-6">
          {/* Controls: Search and Filter */}
          <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo MSSV, Họ tên, Phòng hoặc Số điện thoại..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-hidden sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">
                Lọc theo Tòa:
              </span>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="cursor-pointer rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground"
              >
                <option value="ALL">Toàn bộ 4 Tòa (Tất cả)</option>
                <option value="Tòa A">Tòa A (Ký túc xá Nam)</option>
                <option value="Tòa B">Tòa B (Ký túc xá Nam)</option>
                <option value="Tòa C">Tòa C (Ký túc xá Nữ)</option>
                <option value="Tòa D">Tòa D (Ký túc xá Nữ)</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-border bg-muted/60 text-xs font-bold tracking-wider text-foreground uppercase">
                  <tr>
                    <th className="px-4 py-4">MSSV</th>
                    <th className="px-4 py-4">Họ và Tên</th>
                    <th className="px-4 py-4">Tòa Nhà</th>
                    <th className="px-4 py-4">Phòng & Giường</th>
                    <th className="px-4 py-4">Số Điện Thoại</th>
                    <th className="px-4 py-4">Quê Quán</th>
                    <th className="px-4 py-4">Hạn Hợp Đồng</th>
                    <th className="px-4 py-4 text-center">Rèn Luyện</th>
                    <th className="px-4 py-4 text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((st) => (
                    <tr
                      key={st.studentId}
                      className="cursor-pointer transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted/40"
                      onClick={() => setSelectedStudent(st)}
                    >
                      <td className="px-4 py-4 font-mono font-bold text-foreground">
                        {st.studentId}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-foreground">
                          {st.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {st.gender === "Nam" ? "Nam" : "Nữ"} • CCCD:{" "}
                          {st.citizenId}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-foreground">
                        {st.building}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-foreground">
                          <Bed className="h-3.5 w-3.5 text-primary" />
                          {st.room} • {st.bedCode}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">
                          {st.phone}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          PH: {st.parentPhone}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {st.hometown}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                        {st.endDate}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                          100/100 đ
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStudent(st)
                          }}
                          className="ui-btn-interactive cursor-pointer rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary hover:text-secondary-foreground"
                        >
                          <span>Hồ sơ</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Không tìm thấy sinh viên nào khớp với điều kiện tìm kiếm.
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: QUẢN TRỊ WEB, HẠ TẦNG & PHÂN QUYỀN HỆ THỐNG     */}
      {/* ========================================================= */}
      {activeTab === "SYSTEM" && (
        <div className="space-y-8">
          {/* Services Matrix (Staggered 100ms) */}
          <StaggerContainer
            staggerDelay={0.1}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            <StaggerItem>
              <div className="ui-card-interactive h-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Máy Chủ Web & API
                  </span>
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  Cloud Node Cluster
                </div>
                <p className="text-sm leading-relaxed font-normal text-muted-foreground">
                  Frontend Vite SPA + Backend API vận hành với độ trễ phản hồi
                  trung bình 12ms.
                </p>
                <div className="flex items-center justify-between border-t border-border pt-4 text-xs sm:text-sm">
                  <span className="text-muted-foreground">
                    Thời gian hoạt động:
                  </span>
                  <span className="font-mono font-bold text-primary">
                    99.98% Uptime
                  </span>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="ui-card-interactive h-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Cơ Sở Dữ Liệu DMS
                  </span>
                  <Database className="h-5 w-5 text-accent" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  PostgreSQL Cư Dân
                </div>
                <p className="text-sm leading-relaxed font-normal text-muted-foreground">
                  Lưu trữ hồ sơ cư dân, hợp đồng và hóa đơn điện nước 4 tòa nhà
                  toàn trường.
                </p>
                <div className="flex items-center justify-between border-t border-border pt-4 text-xs sm:text-sm">
                  <span className="text-muted-foreground">
                    Dung lượng sử dụng:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    2.4 GB / 50 GB
                  </span>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="ui-card-interactive h-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Tích Hợp Dữ Liệu FAP
                  </span>
                  <Cpu className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  API Cổng Thông Tin Đào Tạo
                </div>
                <p className="text-sm leading-relaxed font-normal text-muted-foreground">
                  Tự động đồng bộ thông tin sinh viên, trạng thái học vụ và khóa
                  học từ hệ thống đào tạo FAP.
                </p>
                <div className="flex items-center justify-between border-t border-border pt-4 text-xs sm:text-sm">
                  <span className="text-muted-foreground">
                    Trạng thái kết nối:
                  </span>
                  <span className="font-mono font-bold text-primary">
                    Đồng bộ tự động
                  </span>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Phân quyền người dùng trong hệ thống */}
          <ScrollReveal>
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground sm:text-xl">
                    Ma Trận Phân Quyền Vai Trò Người Dùng (Role-Based Access
                    Control)
                  </h3>
                  <p className="mt-1 text-sm font-normal text-muted-foreground">
                    Quản trị viên hệ thống quản lý danh mục quyền hạn theo từng
                    nhóm tài khoản
                  </p>
                </div>
                <span className="rounded-xl bg-secondary/10 px-3 py-1.5 font-mono text-xs font-bold text-secondary">
                  DMS Security v2.4
                </span>
              </div>

              <StaggerContainer
                staggerDelay={0.1}
                className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4"
              >
                <StaggerItem>
                  <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-primary/30 bg-primary/5 p-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      <KeyRound className="h-4 w-4" />
                      <span>Quản Trị Viên (Admin)</span>
                    </div>
                    <p className="text-xs leading-relaxed font-normal text-muted-foreground sm:text-sm">
                      Toàn quyền quản trị web, giám sát hạ tầng máy chủ, quản lý
                      full các tòa KTX, phân quyền tài khoản toàn trường.
                    </p>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Building2 className="h-4 w-4 text-secondary" />
                      <span>Ban Quản Lý Tòa (Manager)</span>
                    </div>
                    <p className="text-xs leading-relaxed font-normal text-muted-foreground sm:text-sm">
                      Quản lý danh sách cư dân, xếp buồng phòng, phát hành hóa
                      đơn và duyệt đơn từ của tòa nhà được phân công.
                    </p>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Activity className="h-4 w-4 text-accent" />
                      <span>Kỹ Thuật Viên (Technician)</span>
                    </div>
                    <p className="text-xs leading-relaxed font-normal text-muted-foreground sm:text-sm">
                      Tiếp nhận nhiệm vụ sửa chữa thiết bị buồng phòng, ghi chỉ
                      số điện nước, lập biên bản nghiệm thu kỹ thuật.
                    </p>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="ui-card-interactive h-full space-y-2 rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Sinh Viên Lưu Trú (Student)</span>
                    </div>
                    <p className="text-xs leading-relaxed font-normal text-muted-foreground sm:text-sm">
                      Tra cứu thông tin phòng, gửi yêu cầu báo hỏng cơ sở vật
                      chất, thanh toán tiền điện nước hàng tháng.
                    </p>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </ScrollReveal>

          {/* Nhật ký hệ thống & Thao tác quản trị web */}
          <ScrollReveal>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* System Audit Logs */}
              <div className="ui-card-interactive space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      Nhật Ký Hệ Thống Gần Đây (System Audit Logs)
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Kỳ Fall 2026
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      time: "15:30:12",
                      action:
                        "Đồng bộ tự động danh sách 642 sinh viên nội trú từ hệ thống đào tạo FAP",
                      type: "SYNC",
                      status: "Thành công",
                    },
                    {
                      time: "14:15:00",
                      action:
                        "Cập nhật phân quyền nhân sự kỹ thuật viên phụ trách cơ điện Tòa A",
                      type: "AUTH",
                      status: "Thành công",
                    },
                    {
                      time: "11:00:25",
                      action:
                        "Kiểm tra định kỳ và đối soát chỉ số điện nước 4 tòa A, B, C, D",
                      type: "AUDIT",
                      status: "Trực tuyến",
                    },
                    {
                      time: "03:00:00",
                      action:
                        "Sao lưu CSDL hệ thống tự động hoàn tất (backup_dms_20261020.sql - 2.4 GB)",
                      type: "BACKUP",
                      status: "Đã lưu trữ",
                    },
                  ].map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs text-muted-foreground">
                          {log.time}
                        </span>
                        <span className="font-semibold text-foreground">
                          {log.action}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick System Tools */}
              <div className="ui-card-interactive space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                  <Layers className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    Công Cụ Quản Trị Web
                  </h3>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        "Đã kích hoạt sao lưu toàn bộ CSDL DMS thành công!"
                      )
                    }
                    className="ui-btn-interactive flex w-full cursor-pointer items-center justify-between rounded-xl border border-border p-4 text-xs font-bold text-foreground hover:bg-muted sm:text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <HardDriveDownload className="h-4 w-4 text-primary" />
                      <span>Sao Lưu CSDL Ngay</span>
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      SQL Dump
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        "Đã đồng bộ lại toàn bộ dữ liệu sinh viên từ FAP!"
                      )
                    }
                    className="ui-btn-interactive flex w-full cursor-pointer items-center justify-between rounded-xl border border-border p-4 text-xs font-bold text-foreground hover:bg-muted sm:text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-accent" />
                      <span>Đồng Bộ Lại API FAP</span>
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      REST API
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      showToast("Đã làm mới bộ nhớ đệm Cache toàn hệ thống!")
                    }
                    className="ui-btn-interactive flex w-full cursor-pointer items-center justify-between rounded-xl border border-border p-4 text-xs font-bold text-foreground hover:bg-muted sm:text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-secondary" />
                      <span>Làm Mới Cache Hệ Thống</span>
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      Redis Cache
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      )}

      {/* MODAL: Xem Chi Tiết Cấu Hình Tòa KTX */}
      {selectedBuilding && (
        <div
          onClick={() => setSelectedBuilding(null)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl animate-in space-y-6 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl fade-in zoom-in-95 sm:p-8"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      Cấu Hình & Vận Hành {selectedBuilding.name}
                    </h3>
                    <span className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {selectedBuilding.genderZone === "Nam"
                        ? "Khu Nam"
                        : "Khu Nữ"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedBuilding.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBuilding(null)}
                className="cursor-pointer rounded-xl p-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Đóng ✕
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Tổng quan quy mô tòa */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/40 p-4 sm:grid-cols-4">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Quy mô phòng ở:
                  </span>
                  <strong className="font-mono text-sm text-foreground">
                    {selectedBuilding.totalRooms} Phòng
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Công suất giường:
                  </span>
                  <strong className="font-mono text-sm text-foreground">
                    {selectedBuilding.totalBeds} Giường
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Sinh viên đang ở:
                  </span>
                  <strong className="font-mono text-sm text-primary">
                    {selectedBuilding.occupiedBeds} Sinh viên
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Tỷ lệ lấp đầy:
                  </span>
                  <strong className="font-mono text-sm text-primary">
                    {selectedBuilding.occupancyRate}%
                  </strong>
                </div>
              </div>

              {/* Chi tiết Buồng 4 và Buồng 6 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase">
                    <Layers className="h-4 w-4 text-primary" />
                    Chi Tiết Cơ Cấu Buồng 4 & Buồng 6 ({selectedBuilding.code})
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Tổng cộng: {selectedBuilding.totalRooms} buồng phòng
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Card Buồng 4 */}
                  <div className="space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-secondary" />
                        <strong className="text-xs font-bold text-foreground">
                          Buồng 4 Giường (Riêng Tư)
                        </strong>
                      </div>
                      <span className="rounded-md bg-secondary/10 px-2 py-0.5 font-mono text-xs font-bold text-secondary">
                        {selectedBuilding.roomBreakdown.room4.roomCount} buồng (
                        {selectedBuilding.roomBreakdown.room4.totalBeds} giường)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Đã lấp đầy:</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedBuilding.roomBreakdown.room4.occupiedBeds} /{" "}
                          {selectedBuilding.roomBreakdown.room4.totalBeds} giường (
                          {selectedBuilding.roomBreakdown.room4.occupancyRate}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-secondary transition-all"
                          style={{
                            width: `${selectedBuilding.roomBreakdown.room4.occupancyRate}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-muted-foreground">
                          Chỗ còn trống:
                        </span>
                        <strong className="font-mono font-bold text-primary">
                          {selectedBuilding.roomBreakdown.room4.emptyBeds} chỗ
                          trống
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Buồng 6 */}
                  <div className="space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-primary" />
                        <strong className="text-xs font-bold text-foreground">
                          Buồng 6 Giường (Tiêu Chuẩn)
                        </strong>
                      </div>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                        {selectedBuilding.roomBreakdown.room6.roomCount} buồng (
                        {selectedBuilding.roomBreakdown.room6.totalBeds} giường)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Đã lấp đầy:</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedBuilding.roomBreakdown.room6.occupiedBeds} /{" "}
                          {selectedBuilding.roomBreakdown.room6.totalBeds} giường (
                          {selectedBuilding.roomBreakdown.room6.occupancyRate}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${selectedBuilding.roomBreakdown.room6.occupancyRate}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-muted-foreground">
                          Chỗ còn trống:
                        </span>
                        <strong className="font-mono font-bold text-primary">
                          {selectedBuilding.roomBreakdown.room6.emptyBeds} chỗ
                          trống
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách thành viên Ban Quản Lý & Đội Kỹ Thuật */}
              <div className="space-y-4 pt-2">
                {/* 1. Ban Quản Lý */}
                <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase">
                      <Users className="h-4 w-4 text-secondary" />
                      Ban Quản Lý {selectedBuilding.code} (
                      {selectedBuilding.managementTeam.length} Cán Bộ)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Phụ trách hành chính & quản lý cư dân
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                    {selectedBuilding.managementTeam.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-xs"
                      >
                        <div>
                          <span className="block text-[10px] font-bold text-secondary">
                            {member.role}
                          </span>
                          <strong className="text-foreground">
                            {member.name}
                          </strong>
                        </div>
                        <span className="rounded border border-border bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {member.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Đội Ngũ Kỹ Thuật Viên */}
                <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase">
                      <Cpu className="h-4 w-4 text-accent" />
                      Đội Ngũ Kỹ Thuật Viên {selectedBuilding.code} (
                      {selectedBuilding.technicalTeam.length} Kỹ Thuật Viên)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Phụ trách điện nước, lạnh & thiết bị
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                    {selectedBuilding.technicalTeam.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-xs"
                      >
                        <div>
                          <span className="block text-[10px] font-bold text-accent">
                            {member.role}
                          </span>
                          <strong className="text-foreground">
                            {member.name}
                          </strong>
                        </div>
                        <span className="rounded border border-border bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {member.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tình trạng vận hành cơ sở vật chất */}
              <div className="space-y-1 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-foreground">
                <span className="flex items-center gap-2 text-xs font-bold text-primary">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Tình trạng cơ sở vật chất & hạ tầng:
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Hệ thống điện nước, trang thiết bị buồng 4 và buồng 6 của{" "}
                  {selectedBuilding.name} đang vận hành ổn định, sẵn sàng phục
                  vụ sinh viên lưu trú.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBuilding(null)}
              className="ui-btn-interactive w-full cursor-pointer rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-xs hover:bg-[#235330]"
            >
              <span>Xác Nhận & Đóng</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Xem Hồ Sơ Chi Tiết Sinh Viên */}
      {selectedStudent && (
        <div
          onClick={() => setSelectedStudent(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg animate-in space-y-6 rounded-2xl border border-border bg-card p-6 shadow-2xl fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Hồ Sơ Cư Dân: {selectedStudent.fullName}
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    MSSV: {selectedStudent.studentId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="cursor-pointer text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/40 p-4">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Tòa nhà:
                  </span>
                  <strong className="text-foreground">
                    {selectedStudent.building}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Phòng & Buồng:
                  </span>
                  <strong className="text-foreground">
                    {selectedStudent.room} ({selectedStudent.compartment})
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Mã giường:
                  </span>
                  <strong className="font-mono text-primary">
                    {selectedStudent.bedCode}
                  </strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Học kỳ lưu trú:
                  </span>
                  <strong className="font-mono text-foreground">
                    {selectedStudent.semester}
                  </strong>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Số CCCD / Định danh:
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedStudent.citizenId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Số điện thoại cá nhân:
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {selectedStudent.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quê quán:</span>
                  <span className="font-medium text-foreground">
                    {selectedStudent.hometown}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Người liên hệ (Phụ huynh):
                  </span>
                  <span className="font-medium text-foreground">
                    {selectedStudent.parentName} ({selectedStudent.parentPhone})
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="ui-btn-interactive w-full cursor-pointer rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground"
            >
              <span>Đóng Hồ Sơ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
