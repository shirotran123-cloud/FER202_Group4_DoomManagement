import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { MOCK_RESIDENTS_REGISTRY } from "@/data/mockDashboard"
import type { ResidentTemporaryRecord } from "@/types/dashboard"
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
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex animate-in items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Welcome & Header Banner: Chỉ để tiêu đề duy nhất theo yêu cầu người dùng */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#233944] via-[#2c4755] to-[#1c2e37] p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#cee6ef]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-40 -bottom-20 h-60 w-60 rounded-full bg-sky-500/10 blur-2xl" />

        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
            Tổng Quan Điều Hành Quản Trị Ký Túc Xá 👋
          </h1>
        </div>
      </div>

      {/* KPI 4-Card Grid: Quản Lý Web & Full Các Tòa Ký Túc Toàn Trường */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {/* Card 1: Full Campus Dorms */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Quy Mô KTX Toàn Trường
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              4 Tòa Nhà{" "}
              <span className="text-sm font-normal text-muted-foreground font-mono">
                ({totalCampusRooms} phòng)
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {totalOccupiedBeds} / {totalCampusBeds} Giường • Lấp đầy {avgOccupancyRate}%
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
            <span className="text-muted-foreground">Chỗ trống toàn trường:</span>
            <span className="font-bold text-emerald-600 font-mono">
              {totalEmptyBeds} Giường
            </span>
          </div>
        </div>

        {/* Card 2: Web Application & Server Infrastructure */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Hạ Tầng Web & Dịch Vụ
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                <Globe className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Online</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Cụm Web DMS & CSDL hoạt động ổn định
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
            <span className="text-muted-foreground">API FAP Đào tạo:</span>
            <span className="font-bold text-primary flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Đã đồng bộ</span>
            </span>
          </div>
        </div>

        {/* Card 3: User Accounts & Roles */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Tài Khoản & Phân Quyền Web
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              662{" "}
              <span className="text-sm font-normal text-muted-foreground font-sans">
                người dùng
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              642 Sinh viên • 12 BQL • 8 Kỹ thuật viên
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
            <span className="text-muted-foreground">Học kỳ hệ thống:</span>
            <span className="font-bold text-foreground font-mono">
              Fall 2026
            </span>
          </div>
        </div>

        {/* Card 4: 4 Buildings Infrastructure & Operation */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Vận Hành Cơ Sở Vật Chất
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground font-mono">
              4 / 4 Tòa Nhà
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Hệ thống điện nước 176 phòng đạt chuẩn
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3 text-xs">
            <span className="text-muted-foreground">Tòa A, B, C, D:</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Vận hành ổn định</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Switcher: 3 Tabs (Quản trị 4 Tòa, Cư dân toàn trường, Cấu hình web hệ thống) */}
      <div className="flex max-w-xl rounded-2xl border border-border bg-muted/70 p-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab("BUILDINGS")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "BUILDINGS"
              ? "bg-card font-extrabold text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4 text-blue-600" />
          <span>Quản Trị 4 Tòa KTX ({CAMPUS_BUILDINGS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("STUDENTS")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "STUDENTS"
              ? "bg-card font-extrabold text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4 text-indigo-600" />
          <span>Cư Dân Toàn Trường ({MOCK_RESIDENTS_REGISTRY.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SYSTEM")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "SYSTEM"
              ? "bg-card font-extrabold text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="h-4 w-4 text-cyan-600" />
          <span>Quản Trị Web & Hạ Tầng</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: QUẢN LÝ FULL 4 TÒA KÝ TÚC XÁ TOÀN TRƯỜNG        */}
      {/* ========================================================= */}
      {activeTab === "BUILDINGS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CAMPUS_BUILDINGS.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {b.code}
                      </span>
                      <h3 className="font-bold text-base text-foreground">{b.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.type}</p>
                  </div>

                  
                </div>

                {/* Occupancy Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Tỷ lệ lấp đầy phòng ở</span>
                    <span className="font-bold text-foreground font-mono">
                      {b.occupiedBeds} / {b.totalBeds} giường ({b.occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${b.occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Quy mô: <strong>{b.totalRooms} Phòng</strong></span>
                    <span className="text-emerald-600 font-semibold">Trống {b.emptyBeds} chỗ</span>
                  </div>
                </div>

                {/* Personnel */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-muted/40 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                      Trưởng Ban Quản Lý:
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">{b.managerName}</p>
                    <span className="font-mono text-[11px] text-muted-foreground block">{b.managerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                      Trưởng Kỹ Thuật Viên:
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">{b.technicianName}</p>
                    <span className="font-mono text-[11px] text-muted-foreground block">{b.technicianPhone}</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => setSelectedBuilding(b)}
                  className="w-full py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer text-center"
                >
                  Xem chi tiết cấu hình {b.code}
                </button>
              </div>
            ))}
          </div>

          
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: DANH SÁCH CƯ DÂN & SINH VIÊN TOÀN TRƯỜNG        */}
      {/* ========================================================= */}
      {activeTab === "STUDENTS" && (
        <div className="space-y-4">
          {/* Controls: Search and Filter */}
          <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo MSSV, Họ tên, Phòng hoặc Số điện thoại..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2 pr-4 pl-10 text-xs focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Lọc theo Tòa:</span>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold cursor-pointer"
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
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/60 text-[11px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">MSSV</th>
                    <th className="px-4 py-3">Họ và Tên</th>
                    <th className="px-4 py-3">Tòa Nhà</th>
                    <th className="px-4 py-3">Phòng & Giường</th>
                    <th className="px-4 py-3">Số Điện Thoại</th>
                    <th className="px-4 py-3">Quê Quán</th>
                    <th className="px-4 py-3">Hạn Hợp Đồng</th>
                    <th className="px-4 py-3 text-center">Rèn Luyện</th>
                    <th className="px-4 py-3 text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((st) => (
                    <tr
                      key={st.studentId}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() => setSelectedStudent(st)}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                        {st.studentId}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-foreground">{st.fullName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {st.gender === "Nam" ? "Nam" : "Nữ"} • CCCD: {st.citizenId}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {st.building}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-bold text-foreground">
                          <Bed className="h-3 w-3 text-primary" />
                          {st.room} • {st.bedCode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{st.phone}</div>
                        <div className="text-[10px] text-muted-foreground">
                          PH: {st.parentPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{st.hometown}</td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">
                        {st.endDate}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          100/100 đ
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStudent(st)
                          }}
                          className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted cursor-pointer"
                        >
                          Hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Không tìm thấy sinh viên nào khớp với điều kiện tìm kiếm.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: QUẢN TRỊ WEB, HẠ TẦNG & PHÂN QUYỀN HỆ THỐNG     */}
      {/* ========================================================= */}
      {activeTab === "SYSTEM" && (
        <div className="space-y-6">
          {/* Services Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Máy Chủ Web & API
                </span>
                <Server className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">Cloud Node Cluster</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Frontend Vite SPA + Backend API vận hành với độ trễ phản hồi trung bình 12ms.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Thời gian hoạt động:</span>
                <span className="font-bold text-emerald-600 font-mono">99.98% Uptime</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Cơ Sở Dữ Liệu DMS
                </span>
                <Database className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="text-xl font-bold text-foreground">PostgreSQL Cư Dân</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lưu trữ hồ sơ cư dân, hợp đồng và hóa đơn điện nước 4 tòa nhà toàn trường.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Dung lượng sử dụng:</span>
                <span className="font-bold text-foreground font-mono">2.4 GB / 50 GB</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Tích Hợp Dữ Liệu FAP
                </span>
                <Cpu className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-foreground">API Cổng Thông Tin Đào Tạo</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tự động đồng bộ thông tin sinh viên, trạng thái học vụ và khóa học từ hệ thống đào tạo FAP.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Trạng thái kết nối:</span>
                <span className="font-bold text-emerald-600 font-mono">Đồng bộ tự động</span>
              </div>
            </div>
          </div>

          {/* Phân quyền người dùng trong hệ thống */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Ma Trận Phân Quyền Vai Trò Người Dùng (Role-Based Access Control)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quản trị viên hệ thống quản lý danh mục quyền hạn theo từng nhóm tài khoản
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                DMS Security v2.4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Quản Trị Viên (Admin)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Toàn quyền quản trị web, giám sát hạ tầng máy chủ, quản lý full các tòa KTX, phân quyền tài khoản toàn trường.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Ban Quản Lý Tòa (Manager)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Quản lý danh sách cư dân, xếp buồng phòng, phát hành hóa đơn và duyệt đơn từ của tòa nhà được phân công.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                  <Activity className="h-3.5 w-3.5 text-amber-600" />
                  <span>Kỹ Thuật Viên (Technician)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tiếp nhận nhiệm vụ sửa chữa thiết bị buồng phòng, ghi chỉ số điện nước, lập biên bản nghiệm thu kỹ thuật.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Sinh Viên Lưu Trú (Student)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Tra cứu thông tin phòng, gửi yêu cầu báo hỏng cơ sở vật chất, thanh toán tiền điện nước hàng tháng.
                </p>
              </div>
            </div>
          </div>

          {/* Nhật ký hệ thống & Thao tác quản trị web */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Audit Logs */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">
                    Nhật Ký Hệ Thống Gần Đây (System Audit Logs)
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">Kỳ Fall 2026</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    time: "15:30:12",
                    action: "Đồng bộ tự động danh sách 642 sinh viên nội trú từ hệ thống đào tạo FAP",
                    type: "SYNC",
                    status: "Thành công",
                  },
                  {
                    time: "14:15:00",
                    action: "Cập nhật phân quyền nhân sự kỹ thuật viên phụ trách cơ điện Tòa A",
                    type: "AUTH",
                    status: "Thành công",
                  },
                  {
                    time: "11:00:25",
                    action: "Kiểm tra định kỳ và đối soát chỉ số điện nước 4 tòa A, B, C, D",
                    type: "AUDIT",
                    status: "Trực tuyến",
                  },
                  {
                    time: "03:00:00",
                    action: "Sao lưu CSDL hệ thống tự động hoàn tất (backup_dms_20261020.sql - 2.4 GB)",
                    type: "BACKUP",
                    status: "Đã lưu trữ",
                  },
                ].map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs border border-border/70"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-muted-foreground text-[11px]">{log.time}</span>
                      <span className="font-semibold text-foreground">{log.action}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-mono shrink-0">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick System Tools */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Layers className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Công Cụ Quản Trị Web</h3>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => showToast("Đã kích hoạt sao lưu toàn bộ CSDL DMS thành công!")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HardDriveDownload className="h-4 w-4 text-primary" />
                    <span>Sao Lưu CSDL Ngay</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">SQL Dump</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast("Đã đồng bộ lại toàn bộ dữ liệu sinh viên từ FAP!")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-cyan-600" />
                    <span>Đồng Bộ Lại API FAP</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">REST API</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast("Đã làm mới bộ nhớ đệm Cache toàn hệ thống!")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-emerald-600" />
                    <span>Làm Mới Cache Hệ Thống</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Redis Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Xem Chi Tiết Cấu Hình Tòa KTX */}
      {selectedBuilding && (
        <div
          onClick={() => setSelectedBuilding(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">
                      Cấu Hình & Vận Hành {selectedBuilding.name}
                    </h3>
                    <span className="font-bold text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {selectedBuilding.genderZone === "Nam" ? "Khu Nam" : "Khu Nữ"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedBuilding.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBuilding(null)}
                className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer rounded-lg p-1.5 hover:bg-muted"
              >
                Đóng ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Tổng quan quy mô tòa */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-muted/40 border border-border/60">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">Quy mô phòng ở:</span>
                  <strong className="text-foreground text-sm font-mono">{selectedBuilding.totalRooms} Phòng</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">Công suất giường:</span>
                  <strong className="text-foreground text-sm font-mono">{selectedBuilding.totalBeds} Giường</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">Sinh viên đang ở:</span>
                  <strong className="text-primary text-sm font-mono">{selectedBuilding.occupiedBeds} Sinh viên</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">Tỷ lệ lấp đầy:</span>
                  <strong className="text-emerald-600 text-sm font-mono">{selectedBuilding.occupancyRate}%</strong>
                </div>
              </div>

              {/* Chi tiết Buồng 4 và Buồng 6 */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />
                    Chi Tiết Cơ Cấu Buồng 4 & Buồng 6 ({selectedBuilding.code})
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Tổng cộng: {selectedBuilding.totalRooms} buồng phòng
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card Buồng 4 */}
                  <div className="rounded-xl border border-border bg-background p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-sky-600" />
                        <strong className="text-foreground text-xs font-bold">Buồng 4 Giường (Riêng Tư)</strong>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-sky-600 bg-sky-500/10 px-2 py-0.5 rounded-md">
                        {selectedBuilding.roomBreakdown.room4.roomCount} buồng ({selectedBuilding.roomBreakdown.room4.totalBeds} giường)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Đã lấp đầy:</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedBuilding.roomBreakdown.room4.occupiedBeds} / {selectedBuilding.roomBreakdown.room4.totalBeds} giường ({selectedBuilding.roomBreakdown.room4.occupancyRate}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full transition-all"
                          style={{ width: `${selectedBuilding.roomBreakdown.room4.occupancyRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        <span className="text-muted-foreground">Chỗ còn trống:</span>
                        <strong className="font-mono text-emerald-600 font-bold">
                          {selectedBuilding.roomBreakdown.room4.emptyBeds} chỗ trống
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Buồng 6 */}
                  <div className="rounded-xl border border-border bg-background p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4 text-emerald-600" />
                        <strong className="text-foreground text-xs font-bold">Buồng 6 Giường (Tiêu Chuẩn)</strong>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {selectedBuilding.roomBreakdown.room6.roomCount} buồng ({selectedBuilding.roomBreakdown.room6.totalBeds} giường)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Đã lấp đầy:</span>
                        <span className="font-mono font-bold text-foreground">
                          {selectedBuilding.roomBreakdown.room6.occupiedBeds} / {selectedBuilding.roomBreakdown.room6.totalBeds} giường ({selectedBuilding.roomBreakdown.room6.occupancyRate}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${selectedBuilding.roomBreakdown.room6.occupancyRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        <span className="text-muted-foreground">Chỗ còn trống:</span>
                        <strong className="font-mono text-emerald-600 font-bold">
                          {selectedBuilding.roomBreakdown.room6.emptyBeds} chỗ trống
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách thành viên Ban Quản Lý & Đội Kỹ Thuật */}
              <div className="space-y-3 pt-1">
                {/* 1. Ban Quản Lý */}
                <div className="rounded-xl border border-border p-3.5 space-y-2 bg-card">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      Ban Quản Lý {selectedBuilding.code} ({selectedBuilding.managementTeam.length} Cán Bộ)
                    </span>
                    <span className="text-[10px] text-muted-foreground">Phụ trách hành chính & quản lý cư dân</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedBuilding.managementTeam.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs border border-border/40"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">
                            {member.role}
                          </span>
                          <strong className="text-foreground">{member.name}</strong>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border/50">
                          {member.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Đội Ngũ Kỹ Thuật Viên */}
                <div className="rounded-xl border border-border p-3.5 space-y-2 bg-card">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-cyan-600" />
                      Đội Ngũ Kỹ Thuật Viên {selectedBuilding.code} ({selectedBuilding.technicalTeam.length} Kỹ Thuật Viên)
                    </span>
                    <span className="text-[10px] text-muted-foreground">Phụ trách điện nước, lạnh & thiết bị</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedBuilding.technicalTeam.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs border border-border/40"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 block">
                            {member.role}
                          </span>
                          <strong className="text-foreground">{member.name}</strong>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border/50">
                          {member.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tình trạng vận hành cơ sở vật chất */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Tình trạng cơ sở vật chất & hạ tầng:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Hệ thống điện nước, trang thiết bị buồng 4 và buồng 6 của {selectedBuilding.name} đang vận hành ổn định, sẵn sàng phục vụ sinh viên lưu trú.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBuilding(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer hover:bg-primary/90 transition-all shadow-xs"
            >
              Xác Nhận & Đóng
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Xem Hồ Sơ Chi Tiết Sinh Viên */}
      {selectedStudent && (
        <div
          onClick={() => setSelectedStudent(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold text-base text-foreground">
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
                className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Tòa nhà:</span>
                  <strong className="text-foreground">{selectedStudent.building}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Phòng & Buồng:</span>
                  <strong className="text-foreground">{selectedStudent.room} ({selectedStudent.compartment})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Mã giường:</span>
                  <strong className="text-primary font-mono">{selectedStudent.bedCode}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Học kỳ lưu trú:</span>
                  <strong className="text-foreground font-mono">{selectedStudent.semester}</strong>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số CCCD / Định danh:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedStudent.citizenId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số điện thoại cá nhân:</span>
                  <span className="font-mono font-bold text-primary">{selectedStudent.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quê quán:</span>
                  <span className="text-foreground font-medium">{selectedStudent.hometown}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Người liên hệ (Phụ huynh):</span>
                  <span className="text-foreground font-medium">{selectedStudent.parentName} ({selectedStudent.parentPhone})</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer"
            >
              Đóng Hồ Sơ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
