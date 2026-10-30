import React, { useState, useEffect } from "react"
import {
  Database,
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  UploadCloud,
  Copy,
  Check,
  Building2,
  Users,
  DoorClosed,
  BedDouble,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react"
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseConfig,
  testSupabaseConnection,
} from "@/lib/supabase"
import {
  fetchBuildings,
  fetchRooms,
  fetchCompartments,
  fetchBeds,
  fetchStudents,
  fetchContracts,
  seedSampleDataToSupabase,
} from "@/services/supabaseService"
import type {
  DbBuilding,
  DbRoom,
  DbCompartment,
  DbBed,
  DbStudent,
  DbContract,
  ConnectionTestResult,
  SupabaseConfig,
} from "@/types/supabase"

export const SupabaseManagerPage: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"config" | "rooms" | "students" | "contracts">("rooms")

  // Supabase Config State
  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig())
  const [inputUrl, setInputUrl] = useState(config.url)
  const [inputKey, setInputKey] = useState(config.anonKey)
  const [configMessage, setConfigMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null)

  // Testing connection state
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)

  // Seeding state
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedProgress, setSeedProgress] = useState<{ message: string; percent: number } | null>(null)
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null)

  // Data Explorer states
  const [loadingData, setLoadingData] = useState(false)
  const [buildings, setBuildings] = useState<DbBuilding[]>([])
  const [rooms, setRooms] = useState<DbRoom[]>([])
  const [students, setStudents] = useState<DbStudent[]>([])
  const [contracts, setContracts] = useState<DbContract[]>([])
  const [isLiveConnected, setIsLiveConnected] = useState(false)

  // Filter states
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all")
  const [selectedFloor, setSelectedFloor] = useState<string>("all")
  const [studentSearch, setStudentSearch] = useState("")
  const [studentBuildingFilter, setStudentBuildingFilter] = useState("all")
  const [studentGenderFilter, setStudentGenderFilter] = useState("all")

  // Expanded room for compartment/bed details
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>("r_a205")
  const [roomCompartments, setRoomCompartments] = useState<DbCompartment[]>([])
  const [compartmentBeds, setCompartmentBeds] = useState<Record<string, DbBed[]>>({})

  // SQL Copy state
  const [sqlCopied, setSqlCopied] = useState(false)

  // Load data initially
  const loadAllData = async () => {
    setLoadingData(true)
    try {
      const [bRes, rRes, sRes, cRes] = await Promise.all([
        fetchBuildings(),
        fetchRooms(),
        fetchStudents(),
        fetchContracts(),
      ])

      setBuildings(bRes.data)
      setRooms(rRes.data)
      setStudents(sRes.data)
      setContracts(cRes.data)
      setIsLiveConnected(bRes.isLive || rRes.isLive || sRes.isLive)

      // Preload compartments and beds for A205
      const compRes = await fetchCompartments("r_a205")
      setRoomCompartments(compRes.data)

      const bedsMap: Record<string, DbBed[]> = {}
      for (const comp of compRes.data) {
        const bedRes = await fetchBeds(comp.id)
        bedsMap[comp.id] = bedRes.data
      }
      setCompartmentBeds(bedsMap)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadAllData()
    // Auto-test if configured
    if (config.isConfigured) {
      handleTestConnection()
    }
  }, [])

  // Save config handler
  const handleSaveConfig = () => {
    const res = saveSupabaseConfig(inputUrl, inputKey)
    if (res.success) {
      const newConfig = getSupabaseConfig()
      setConfig(newConfig)
      setConfigMessage({ text: res.message, type: "success" })
      handleTestConnection()
      loadAllData()
    } else {
      setConfigMessage({ text: res.message, type: "error" })
    }
  }

  // Reset config handler
  const handleResetConfig = () => {
    resetSupabaseConfig()
    const newConfig = getSupabaseConfig()
    setConfig(newConfig)
    setInputUrl(newConfig.url)
    setInputKey(newConfig.anonKey)
    setTestResult(null)
    setConfigMessage({ text: "Đã khôi phục cấu hình mặc định.", type: "info" })
    loadAllData()
  }

  // Test connection handler
  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const res = await testSupabaseConnection()
      setTestResult(res)
      if (res.success && res.tables && res.tables.rooms > 0) {
        setIsLiveConnected(true)
      }
    } finally {
      setIsTesting(false)
    }
  }

  // Seed sample data handler
  const handleSeedData = async () => {
    setIsSeeding(true)
    setSeedResult(null)
    setSeedProgress({ message: "Bắt đầu khởi tạo dữ liệu...", percent: 5 })

    try {
      const res = await seedSampleDataToSupabase((msg, pct) => {
        setSeedProgress({ message: msg, percent: pct })
      })
      setSeedResult(res)
      if (res.success) {
        await loadAllData()
        await handleTestConnection()
      }
    } finally {
      setIsSeeding(false)
    }
  }

  // Expand room details
  const toggleRoomExpand = async (roomId: string) => {
    if (expandedRoomId === roomId) {
      setExpandedRoomId(null)
      return
    }
    setExpandedRoomId(roomId)
    const compRes = await fetchCompartments(roomId)
    setRoomCompartments(compRes.data)

    const bedsMap: Record<string, DbBed[]> = {}
    for (const comp of compRes.data) {
      const bedRes = await fetchBeds(comp.id)
      bedsMap[comp.id] = bedRes.data
    }
    setCompartmentBeds(bedsMap)
  }

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    if (selectedBuildingId !== "all" && room.building_id !== selectedBuildingId) return false
    if (selectedFloor !== "all" && room.floor !== Number(selectedFloor)) return false
    return true
  })

  // Filtered students
  const filteredStudents = students.filter((student) => {
    if (studentBuildingFilter !== "all" && !student.building.toLowerCase().includes(studentBuildingFilter.toLowerCase())) {
      return false
    }
    if (studentGenderFilter !== "all" && student.gender !== studentGenderFilter) {
      return false
    }
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase()
      const match =
        student.full_name.toLowerCase().includes(q) ||
        student.student_id.toLowerCase().includes(q) ||
        student.room.toLowerCase().includes(q) ||
        student.hometown.toLowerCase().includes(q) ||
        student.major.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  // Copy SQL script
  const handleCopySql = () => {
    const sqlText = `-- File: supabase_schema_and_seed.sql (Đã có sẵn tại thư mục gốc của dự án)
-- Bạn có thể mở trực tiếp file 'supabase_schema_and_seed.sql' và dán vào Supabase SQL Editor.`
    navigator.clipboard.writeText(sqlText)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 2000)
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Quản Lý CSDL Supabase
                </h1>
                {isLiveConnected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Supabase Cloud
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Dữ liệu mẫu cục bộ
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Kết nối Cơ sở Dữ liệu Cloud, quản lý dữ liệu phòng ở trong tòa, sinh viên KTX và cấu trúc buồng giường
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadAllData}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`} />
              Làm mới dữ liệu
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
            >
              <Server className="h-3.5 w-3.5" />
              Cấu hình kết nối
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
            <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground">Tòa KTX</div>
              <div className="text-base font-bold text-foreground">{buildings.length} Tòa (A, B, C, D)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
            <DoorClosed className="h-5 w-5 text-indigo-500 shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground">Phòng ở trong tòa</div>
              <div className="text-base font-bold text-foreground">{rooms.length} Phòng tiêu chuẩn</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
            <BedDouble className="h-5 w-5 text-purple-500 shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground">Cấu trúc buồng - giường</div>
              <div className="text-base font-bold text-foreground">24 Giường / Phòng</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
            <Users className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground">Sinh viên nội trú</div>
              <div className="text-base font-bold text-foreground">{students.length} Sinh viên mẫu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("rooms")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "rooms"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DoorClosed className="h-4 w-4" />
          Phòng ở trong tòa ({rooms.length})
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "students"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Sinh viên KTX ({students.length})
        </button>

        <button
          onClick={() => setActiveTab("contracts")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "contracts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Hợp đồng lưu trú ({contracts.length})
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "config"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Server className="h-4 w-4" />
          Cấu hình Supabase & Đồng bộ
        </button>
      </div>

      {/* TAB 1: PHÒNG Ở TRONG TÒA (ROOMS EXPLORER) */}
      {activeTab === "rooms" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Bộ lọc:
              </div>

              {/* Building filter */}
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Tất cả các tòa (Tòa A, B, C, D)</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.gender_type === "MALE" ? "Nam" : "Nữ"})
                  </option>
                ))}
              </select>

              {/* Floor filter */}
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Tất cả các tầng (Tầng 1 - 5)</option>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
                <option value="3">Tầng 3</option>
                <option value="4">Tầng 4</option>
                <option value="5">Tầng 5</option>
              </select>
            </div>

            <div className="text-xs text-muted-foreground">
              Hiển thị <strong className="text-foreground">{filteredRooms.length}</strong> / {rooms.length} phòng
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => {
              const isExpanded = expandedRoomId === room.id
              const occupied = room.occupied_count ?? 20
              const available = room.available_count ?? (room.max_capacity - occupied)
              const percent = Math.round((occupied / room.max_capacity) * 100)

              return (
                <div
                  key={room.id}
                  className={`flex flex-col rounded-xl border bg-card transition-all shadow-xs ${
                    isExpanded ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground">Phòng {room.room_number}</span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {room.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {room.building_name || (room.building_id === "b1" ? "Tòa A (Nam)" : room.building_id === "b2" ? "Tòa B (Nam)" : room.building_id === "b3" ? "Tòa C (Nữ)" : "Tòa D (Nữ)")} · Tầng {room.floor}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Giá thuê</div>
                        <div className="text-sm font-bold text-primary">
                          {room.price_per_month.toLocaleString("vi-VN")} đ
                          <span className="text-[10px] font-normal text-muted-foreground">/tháng</span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity Progress */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Lấp đầy ({percent}%)</span>
                        <span className="font-semibold text-foreground">
                          {occupied} / {room.max_capacity} giường
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Còn {available} giường trống</span>
                        <span>4 Buồng (A, B, C, D)</span>
                      </div>
                    </div>
                  </div>

                  {/* Expand button to view Buồng & Giường */}
                  <div className="mt-auto border-t border-border px-5 py-2.5 bg-muted/20">
                    <button
                      onClick={() => toggleRoomExpand(room.id)}
                      className="flex w-full items-center justify-between text-xs font-semibold text-primary hover:underline"
                    >
                      <span>{isExpanded ? "Ẩn sơ đồ buồng giường" : "Xem chi tiết 4 Buồng & 24 Giường"}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Compartments & Beds View */}
                  {isExpanded && (
                    <div className="border-t border-border bg-background/50 p-4 space-y-4">
                      <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Cấu trúc buồng & vị trí giường ({room.room_number}):</span>
                        <span className="text-[10px] text-muted-foreground">Mỗi buồng 6 giường (3 tầng dưới, 3 tầng trên)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {roomCompartments.map((comp) => {
                          const beds = compartmentBeds[comp.id] || []

                          return (
                            <div key={comp.id} className="rounded-lg border border-border bg-card p-3 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-border/60 pb-1.5 mb-2">
                                <span className="font-bold text-xs text-foreground">
                                  Buồng {comp.code} · {comp.title}
                                </span>
                                <span className="text-[10px] text-muted-foreground">{comp.zone_description}</span>
                              </div>

                              <div className="grid grid-cols-3 gap-1.5">
                                {beds.length > 0 ? (
                                  beds.map((bed) => {
                                    const isOcc = bed.status === "occupied"
                                    const isAvail = bed.status === "available"
                                    const isHold = bed.status === "holding"

                                    return (
                                      <div
                                        key={bed.id}
                                        title={`${bed.bed_code} (${bed.tier === "lower" ? "Tầng dưới" : "Tầng trên"}) - ${bed.student_name || bed.status}`}
                                        className={`rounded-md border p-1 text-center text-[10px] transition-colors ${
                                          isOcc
                                            ? "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            : isAvail
                                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                                            : isHold
                                            ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                            : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                                        }`}
                                      >
                                        <div className="font-bold">{bed.slot}</div>
                                        <div className="text-[9px] opacity-75 truncate">
                                          {bed.student_name ? bed.student_name.split(" ").slice(-1)[0] : bed.status}
                                        </div>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <div className="col-span-3 text-center py-2 text-[10px] text-muted-foreground italic">
                                    6 giường (G01 - G06)
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SINH VIÊN KÝ TÚC XÁ (STUDENTS EXPLORER) */}
      {activeTab === "students" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo MSSV, Họ tên, Quê quán, Phòng..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={studentBuildingFilter}
                onChange={(e) => setStudentBuildingFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-hidden"
              >
                <option value="all">Tất cả các tòa</option>
                <option value="Tòa A">Tòa A (Khu Nam)</option>
                <option value="Tòa B">Tòa B (Khu Nam)</option>
                <option value="Tòa C">Tòa C (Khu Nữ)</option>
                <option value="Tòa D">Tòa D (Khu Nữ)</option>
              </select>

              <select
                value={studentGenderFilter}
                onChange={(e) => setStudentGenderFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-hidden"
              >
                <option value="all">Tất cả giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>

              <span className="text-xs text-muted-foreground">
                Tìm thấy <strong className="text-foreground">{filteredStudents.length}</strong> sinh viên
              </span>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">MSSV</th>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">Chỗ ở (Tòa / Phòng / Giường)</th>
                    <th className="px-4 py-3">Ngành học & Khóa</th>
                    <th className="px-4 py-3">Quê quán</th>
                    <th className="px-4 py-3">Phụ huynh & SĐT</th>
                    <th className="px-4 py-3 text-right">Công nợ</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st) => (
                      <tr key={st.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3.5 font-bold text-primary font-mono whitespace-nowrap">
                          {st.student_id}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-foreground">{st.full_name}</div>
                          <div className="text-[11px] text-muted-foreground">{st.email}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-foreground">
                            {st.building} · <span className="text-primary font-bold">{st.room}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Mã giường: <span className="font-mono font-medium">{st.bed_code}</span> ({st.compartment})
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-foreground">{st.major}</div>
                          <div className="text-[11px] text-muted-foreground">{st.cohort}</div>
                        </td>
                        <td className="px-4 py-3.5 text-foreground whitespace-nowrap">{st.hometown}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-foreground">{st.parent_name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{st.parent_phone}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {st.debt_amount > 0 ? (
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              {st.debt_amount.toLocaleString("vi-VN")} đ
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">0 đ (Đã đóng đủ)</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {st.status === "active" ? "Đang lưu trú" : st.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        Không tìm thấy sinh viên nào khớp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HỢP ĐỒNG LƯU TRÚ (CONTRACTS) */}
      {activeTab === "contracts" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Danh Sách Hợp Đồng Lưu Trú Sinh Viên</h3>
                <p className="text-xs text-muted-foreground">
                  Hợp đồng xác lập quyền lưu trú gắn trực tiếp với mã giường cá nhân và phòng theo từng học kỳ
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {contracts.length} Hợp đồng
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Mã Hợp đồng</th>
                    <th className="px-4 py-3">Sinh viên</th>
                    <th className="px-4 py-3">Mã giường / Phòng</th>
                    <th className="px-4 py-3">Học kỳ áp dụng</th>
                    <th className="px-4 py-3">Thời hạn hợp đồng</th>
                    <th className="px-4 py-3 text-right">Tiền đặt cọc</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contracts.map((ctr) => (
                    <tr key={ctr.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3.5 font-bold text-primary font-mono whitespace-nowrap">
                        {ctr.contract_code}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">{ctr.student_name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">MSSV: {ctr.student_id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{ctr.building} · Phòng {ctr.room}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">Giường: {ctr.bed_code}</div>
                      </td>
                      <td className="px-4 py-3.5 text-foreground font-medium">{ctr.semester}</td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {ctr.start_date} $\rightarrow$ {ctr.end_date}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-foreground whitespace-nowrap">
                        {ctr.deposit_amount.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {ctr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CẤU HÌNH KẾT NỐI & ĐỒNG BỘ (CONFIG & SEEDING) */}
      {activeTab === "config" && (
        <div className="space-y-6">
          {/* Connection Settings Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-bold text-base text-foreground">Thông Số Kết Nối Supabase Cloud</h3>
                  <p className="text-xs text-muted-foreground">
                    Cấu hình endpoint URL và Anon Public Key để ứng dụng giao tiếp trực tiếp với Supabase
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Nguồn hiện tại: <span className="font-mono font-bold text-foreground">{config.source}</span>
              </div>
            </div>

            {configMessage && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs flex items-center gap-2 ${
                  configMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                    : configMessage.type === "error"
                    ? "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
                    : "bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                }`}
              >
                {configMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span>{configMessage.text}</span>
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Lấy từ Supabase Dashboard $\rightarrow$ Project Settings $\rightarrow$ Configuration $\rightarrow$ API
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Khóa công khai anon/public dùng an toàn ở trình duyệt Client-side
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleSaveConfig}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
                >
                  <Check className="h-3.5 w-3.5" />
                  Lưu & Áp Dụng Kết Nối
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? "animate-spin" : ""}`} />
                  Kiểm tra kết nối (Ping Test)
                </button>

                <button
                  onClick={handleResetConfig}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Khôi phục mặc định
                </button>
              </div>
            </div>

            {/* Test Connection Results Box */}
            {testResult && (
              <div
                className={`mt-6 rounded-xl border p-4 ${
                  testResult.success
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                    : "border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        {testResult.success ? "Kết Nối Supabase Thành Công" : "Kết Nối Thất Bại"}
                      </span>
                      {testResult.latencyMs && (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Độ trễ: {testResult.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{testResult.message}</p>

                    {testResult.tables && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-border/50 text-center">
                        <div className="rounded-lg bg-background p-2 border border-border/50">
                          <div className="text-[10px] text-muted-foreground">buildings</div>
                          <div className="text-sm font-bold text-foreground">{testResult.tables.buildings}</div>
                        </div>
                        <div className="rounded-lg bg-background p-2 border border-border/50">
                          <div className="text-[10px] text-muted-foreground">rooms</div>
                          <div className="text-sm font-bold text-foreground">{testResult.tables.rooms}</div>
                        </div>
                        <div className="rounded-lg bg-background p-2 border border-border/50">
                          <div className="text-[10px] text-muted-foreground">compartments</div>
                          <div className="text-sm font-bold text-foreground">{testResult.tables.compartments}</div>
                        </div>
                        <div className="rounded-lg bg-background p-2 border border-border/50">
                          <div className="text-[10px] text-muted-foreground">beds</div>
                          <div className="text-sm font-bold text-foreground">{testResult.tables.beds}</div>
                        </div>
                        <div className="rounded-lg bg-background p-2 border border-border/50">
                          <div className="text-[10px] text-muted-foreground">students</div>
                          <div className="text-sm font-bold text-foreground">{testResult.tables.students}</div>
                        </div>
                        <div className="rounded-lg bg-background p-2 border border-border/50">
                          <div className="text-[10px] text-muted-foreground">contracts</div>
                          <div className="text-sm font-bold text-foreground">{testResult.tables.contracts}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Database Seeding & SQL Script Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
              <div>
                <h3 className="font-bold text-base text-foreground">Khởi Tạo & Đồng Bộ Dữ Liệu Mẫu (Seed Data)</h3>
                <p className="text-xs text-muted-foreground">
                  Đẩy toàn bộ 4 Tòa nhà, 30 Phòng ở, 120 Buồng, 480 Giường và 14+ Sinh viên mẫu lên CSDL Supabase
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  {sqlCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {sqlCopied ? "Đã sao chép!" : "Sao chép file SQL"}
                </button>

                <button
                  onClick={handleSeedData}
                  disabled={isSeeding || !config.isConfigured}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <UploadCloud className={`h-4 w-4 ${isSeeding ? "animate-bounce" : ""}`} />
                  {isSeeding ? "Đang đồng bộ..." : "Đồng bộ mẫu lên Supabase"}
                </button>
              </div>
            </div>

            {/* Seed Progress Bar */}
            {isSeeding && seedProgress && (
              <div className="mt-5 space-y-2 rounded-xl border border-border bg-background/50 p-4">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{seedProgress.message}</span>
                  <span className="font-bold text-emerald-600">{seedProgress.percent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${seedProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Seed Result */}
            {seedResult && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs flex items-center gap-2 ${
                  seedResult.success
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {seedResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span>{seedResult.message}</span>
              </div>
            )}

            <div className="mt-5 rounded-xl border border-border/80 bg-muted/20 p-4 text-xs space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-primary" />
                File SQL Khởi tạo: <span className="font-mono text-primary">supabase_schema_and_seed.sql</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Nếu bạn muốn khởi tạo bảng trực tiếp trên giao diện Supabase Dashboard, hãy mở file{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                  supabase_schema_and_seed.sql
                </code>{" "}
                được tạo trong dự án và paste vào mục <strong>SQL Editor</strong> của Supabase, sau đó nhấn <strong>Run</strong>. Mã SQL đã cấu hình sẵn toàn bộ khóa ngoại (Foreign Keys), phân quyền RLS an toàn và dữ liệu mẫu đầy đủ.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupabaseManagerPage
