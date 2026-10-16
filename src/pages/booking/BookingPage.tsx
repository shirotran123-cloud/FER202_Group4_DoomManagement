import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { suggestRoomAllocation } from "@/lib/dorm-ops"
import { canBookBed } from "@/lib/role-access"
import { Building, CircleCheck, Clock, QrCode, Download, Check, Zap, Sun, Compass, BedDouble, DoorOpen, ChevronDown, Snowflake, Wifi, LayoutGrid, X } from "lucide-react"

import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
interface Bed {
  id: string
  code: string
  slot: string
  status: "available" | "occupied" | "holding" | "maintenance"
  price: number
  tier: "lower" | "upper"
  holdingTime?: string
  studentName?: string
}

interface Compartment {
  id: string
  name: string
  title: string
  zone: string
  beds: Bed[]
}

export const BookingPage: React.FC = () => {
  const { user } = useAuth()
  // Chỉ sinh viên (và admin hỗ trợ) được giữ giường + thanh toán.
  // Quản lý giám sát qua engine tự động duyệt, không giữ giường tay.
  const canBook = canBookBed(user?.role)

  // Selection states
  const [selectedBuilding, setSelectedBuilding] = useState("b1")
  const [selectedFloor, setSelectedFloor] = useState(2)
  const [selectedRoom, setSelectedRoom] = useState("A205")
  const [selectedCompartment, setSelectedCompartment] = useState("B")
  const [selectedBed, setSelectedBed] = useState<Bed>({
    id: "A205-B-G03",
    code: "A205-B-G03",
    slot: "G03",
    status: "available",
    price: 950000,
    tier: "lower",
  })

  // Timer state (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 45)
  const [isLocked, setIsLocked] = useState(true)

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "vnpay" | "student_acc">("vietqr")

  // Modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"qr" | "verifying" | "success">("qr")
  const [autoApprovalProgress, setAutoApprovalProgress] = useState(0)

  // Countdown timer effect
  useEffect(() => {
    if (!isLocked) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsLocked(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isLocked])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Compartments definition based on Stitch architectural blueprint
  const compartments: Compartment[] = [
    {
      id: "A",
      name: "Compartment A",
      title: "Window Bay",
      zone: "Đón nắng ban mai",
      beds: [
        { id: "A-G01", code: "A205-A-G01", slot: "G01", status: "occupied", price: 950000, tier: "lower" },
        { id: "A-G02", code: "A205-A-G02", slot: "G02", status: "occupied", price: 950000, tier: "upper" },
        { id: "A-G03", code: "A205-A-G03", slot: "G03", status: "available", price: 950000, tier: "lower" },
        { id: "A-G04", code: "A205-A-G04", slot: "G04", status: "occupied", price: 950000, tier: "upper" },
        { id: "A-G05", code: "A205-A-G05", slot: "G05", status: "occupied", price: 950000, tier: "lower" },
        { id: "A-G06", code: "A205-A-G06", slot: "G06", status: "available", price: 950000, tier: "upper" },
      ],
    },
    {
      id: "B",
      name: "Compartment B",
      title: "Balcony Wing",
      zone: "Hướng ban công",
      beds: [
        { id: "B-G01", code: "A205-B-G01", slot: "G01", status: "occupied", price: 950000, tier: "lower" },
        { id: "B-G02", code: "A205-B-G02", slot: "G02", status: "holding", price: 950000, tier: "upper", holdingTime: "12m" },
        { id: "B-G03", code: "A205-B-G03", slot: "G03", status: "available", price: 950000, tier: "lower" },
        { id: "B-G04", code: "A205-B-G04", slot: "G04", status: "occupied", price: 950000, tier: "upper" },
        { id: "B-G05", code: "A205-B-G05", slot: "G05", status: "occupied", price: 950000, tier: "lower" },
        { id: "B-G06", code: "A205-B-G06", slot: "G06", status: "occupied", price: 950000, tier: "upper" },
      ],
    },
    {
      id: "C",
      name: "Compartment C",
      title: "Study Hub",
      zone: "Góc bàn học",
      beds: [
        { id: "C-G01", code: "A205-C-G01", slot: "G01", status: "available", price: 950000, tier: "lower" },
        { id: "C-G02", code: "A205-C-G02", slot: "G02", status: "available", price: 950000, tier: "upper" },
        { id: "C-G03", code: "A205-C-G03", slot: "G03", status: "maintenance", price: 950000, tier: "lower" },
        { id: "C-G04", code: "A205-C-G04", slot: "G04", status: "occupied", price: 950000, tier: "upper" },
        { id: "C-G05", code: "A205-C-G05", slot: "G05", status: "occupied", price: 950000, tier: "lower" },
        { id: "C-G06", code: "A205-C-G06", slot: "G06", status: "available", price: 950000, tier: "upper" },
      ],
    },
    {
      id: "D",
      name: "Compartment D",
      title: "Main Hall Door",
      zone: "Cạnh cửa & WC",
      beds: [
        { id: "D-G01", code: "A205-D-G01", slot: "G01", status: "occupied", price: 950000, tier: "lower" },
        { id: "D-G02", code: "A205-D-G02", slot: "G02", status: "occupied", price: 950000, tier: "upper" },
        { id: "D-G03", code: "A205-D-G03", slot: "G03", status: "occupied", price: 950000, tier: "lower" },
        { id: "D-G04", code: "A205-D-G04", slot: "G04", status: "available", price: 950000, tier: "upper" },
        { id: "D-G05", code: "A205-D-G05", slot: "G05", status: "occupied", price: 950000, tier: "lower" },
        { id: "D-G06", code: "A205-D-G06", slot: "G06", status: "occupied", price: 950000, tier: "upper" },
      ],
    },
  ]

  // Handle bed selection — chặn giữ giường nếu không đủ quyền.
  const handleSelectBed = (bed: Bed, compId: string) => {
    if (!canBook || bed.status !== "available") return
    setSelectedBed(bed)
    setSelectedCompartment(compId)
    setTimeLeft(15 * 60)
    setIsLocked(true)
  }

  // Trigger checkout & simulate auto-approval
  const handleStartCheckout = () => {
    if (!canBook) return
    setShowCheckoutModal(true)
    setCheckoutStep("qr")
  }

  const handleConfirmPayment = () => {
    setCheckoutStep("verifying")
    setAutoApprovalProgress(10)
    setTimeout(() => setAutoApprovalProgress(40), 700)
    setTimeout(() => setAutoApprovalProgress(75), 1400)
    setTimeout(() => {
      setAutoApprovalProgress(100)
      setCheckoutStep("success")
    }, 2200)
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 01. STEP PROGRESS HIERARCHY BANNER */}
      <div className="dms-card w-full p-4">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
              01
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Tòa nhà
              </span>
              <span className="font-semibold text-foreground">Tòa A (Nam)</span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
              02
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Tầng lầu
              </span>
              <span className="font-semibold text-foreground">Tầng {selectedFloor}</span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
              03
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Phòng chuẩn
              </span>
              <span className="font-semibold text-foreground">Phòng {selectedRoom} · 24 giường</span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
              04
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Buồng riêng
              </span>
              <span className="font-semibold text-foreground">Buồng {selectedCompartment}</span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-muted-foreground text-white flex items-center justify-center font-bold text-[11px]">
              05
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Vị trí giường
              </span>
              <span className="font-bold text-primary dark:text-primary">{selectedBed.code}</span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max opacity-80">
            <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-[11px]">
              06
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Thanh toán
              </span>
              <span className="font-medium text-muted-foreground">VietQR Giữ chỗ 15m</span>
            </div>
          </div>
        </div>
      </div>

      {/* 02. MAIN 3-COLUMN ERGONOMIC GRID */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* COLUMN 1: BUILDING, LEVEL, ROOM LIST (3 COLS) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
          {/* Building Selector */}
          <div className="dms-card p-4 space-y-3">
            <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
              Khu Ký Túc Xá
            </label>
            <div className="relative">
              <Select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="font-semibold pr-8 appearance-none cursor-pointer"
              >
                <option value="b1">Tòa A · Khu Nam</option>
                <option value="b2">Tòa B · Khu Nữ</option>
                <option value="b3">Tòa C · Sinh viên Quốc tế</option>
              </Select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4" />
            </div>

            {/* Floor Selection */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                  Chọn Tầng
                </span>
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Thang máy khả dụng
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-1 bg-muted rounded-lg">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedFloor(lvl)}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      selectedFloor === lvl
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    T{lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rooms on Floor Manifest */}
          <div className="dms-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <span className="text-xs font-bold text-foreground">Phòng tại Tầng {selectedFloor}</span>
              <span className="text-[11px] text-muted-foreground">4 phòng tìm thấy</span>
            </div>

            {/* Room items */}
            <div
              onClick={() => setSelectedRoom("A201")}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedRoom === "A201"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                  <DoorOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Phòng A201</span>
                </div>
                <Badge variant="neutral">24/24 Đầy</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">Phòng góc · View sân vườn trung tâm</p>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div className="bg-muted-foreground h-full w-full"></div>
              </div>
            </div>

            <div
              onClick={() => setSelectedRoom("A202")}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedRoom === "A202"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                  <DoorOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Phòng A202</span>
                </div>
                <Badge variant="secondary">22/24 Đã ở</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">Giữa hành lang · Pod tự học yên tĩnh</p>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div className="bg-muted-foreground h-full w-[91%]"></div>
              </div>
            </div>

            {/* Room A205 (Active Selection) */}
            <div
              onClick={() => setSelectedRoom("A205")}
              className="p-3 rounded-lg bg-primary text-white shadow-xs space-y-2 border border-primary relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <DoorOpen className="h-4 w-4 text-white/80 shrink-0" />
                  <span>Phòng A205</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-primary">
                  6 Giường Trống
                </span>
              </div>
              <p className="text-[11px] text-white/80">3 mặt thoáng · Đón gió ban mai · Ban công riêng</p>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[75%]"></div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/90 flex items-center gap-1">
                  <Sun className="h-3 w-3 shrink-0" /> Ban công
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/90 flex items-center gap-1">
                  <Snowflake className="h-3 w-3 shrink-0" /> ĐH Inverter
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/90 flex items-center gap-1">
                  <Wifi className="h-3 w-3 shrink-0" /> Fiber 1Gbps
                </span>
              </div>
            </div>
          </div>

          {/* Living Note & Facility Snapshot */}
          <div className="dms-card p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              <Building className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-foreground whitespace-nowrap">Khu A205 · Chuẩn 2026</p>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                Tiêu âm cao cấp, rèm che kháng khuẩn từng giường, khóa số thông minh.
              </p>
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER ARCHITECTURAL 1:4:6 UNIT BLUEPRINT (6 COLS) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          <div className="dms-card p-5 space-y-4">
            {/* Header blueprint */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-foreground">
                      Bản Đồ Kiến Trúc · Phòng {selectedRoom}
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                      Mô hình 1:4:6 · 24 giường
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nhấp vào giường có màu xanh lá để khóa giữ chỗ 15 phút.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success-soft-foreground text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                <span>Thời gian thực: 6 giường trống</span>
              </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-4 py-2 px-3 rounded-lg bg-muted/70 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-success"></span>
                <span className="font-medium text-foreground">Còn chỗ · 6</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-muted"></span>
                <span className="text-muted-foreground">Đã đầy · 16</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-primary"></span>
                <span className="text-muted-foreground">Đang giữ · 1</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-danger"></span>
                <span className="text-muted-foreground">Bảo trì · 1</span>
              </div>
              <div className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                AI gợi ý: {suggestRoomAllocation({ id: user?.studentId || "QE202049", faculty: user?.major || "CNTT", nightOwl: false, quiet: true }, [{ id: "A205", facultyMix: [user?.major || "CNTT"], nightOwlFriendly: false, quietZone: true, freeBeds: 6 }, { id: "A202", facultyMix: ["KETOAN"], nightOwlFriendly: true, quietZone: false, freeBeds: 2 }], 1)[0]?.id || "A205"} hợp thói quen yên tĩnh
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="w-3 h-3 rounded-xs bg-primary ring-2 ring-primary ring-offset-1"></span>
                <span className="font-bold text-primary dark:text-primary">Đang chọn · 1</span>
              </div>
            </div>

            {/* Visual Floor Canvas Matrix */}
            <div className="p-3.5 bg-muted/70 rounded-xl border border-border relative space-y-3">
              {/* Orientation Indicators */}
              <div className="flex justify-between items-center text-muted-foreground text-[10px] font-mono tracking-wider px-1">
                <span className="flex items-center gap-1 whitespace-nowrap truncate">
                  <Sun className="h-3 w-3 text-primary shrink-0" /> Hướng Đông
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap truncate text-right">
                  <Compass className="h-3 w-3 shrink-0" /> Hướng Bắc
                </span>
              </div>

              {/* 4 Quadrants (1:4:6 Layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {compartments.map((comp) => {
                  const isSelectedComp = selectedCompartment === comp.id
                  return (
                    <div
                      key={comp.id}
                      className={`bg-card p-3 rounded-xl border transition-all ${
                        isSelectedComp
                          ? "ring-2 ring-primary border-primary shadow-sm"
                          : "border-border"
                      }`}
                    >
                      {/* Compartment Header */}
                      <div className="mb-2 pb-1.5 border-b border-border/60">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-bold text-xs text-foreground whitespace-nowrap flex items-center gap-1.5 shrink-0">
                            Buồng {comp.id}
                            {isSelectedComp && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0"></span>
                            )}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                            {comp.zone}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap block truncate mt-0.5">
                          Buồng {comp.id} · {comp.title}
                        </span>
                      </div>

                      {/* 6 Beds Grid (2 rows x 3 columns) */}
                      <div className="grid grid-cols-3 gap-2">
                        {comp.beds.map((bed) => {
                          const isCurrentPick = selectedBed.id === bed.id
                          const isAvailable = bed.status === "available"
                          const isHolding = bed.status === "holding"
                          const isMaint = bed.status === "maintenance"

                          return (
                            <div
                              key={bed.id}
                              onClick={() => handleSelectBed(bed, comp.id)}
                              className={`p-2 rounded-lg text-center flex flex-col items-center justify-center transition-all border ${
                                isCurrentPick
                                  ? "bg-primary text-white border-primary shadow-md scale-105 ring-2 ring-primary ring-offset-2 z-10 cursor-pointer"
                                  : isAvailable
                                  ? "bg-success-soft border-success/25 hover:bg-success-soft cursor-pointer text-success-soft-foreground   "
                                  : isHolding
                                  ? "bg-primary-soft border-primary/25 text-primary-soft-foreground    cursor-not-allowed"
                                  : isMaint
                                  ? "bg-danger-soft border-danger/25 text-danger-soft-foreground    cursor-not-allowed"
                                  : "bg-muted border-border text-muted-foreground cursor-not-allowed"
                              }`}
                            >
                              {isCurrentPick ? (
                                <CircleCheck className="h-4 w-4 shrink-0" />
                              ) : (
                                <BedDouble className="h-4 w-4 shrink-0" />
                              )}
                              <span className="font-mono font-bold text-[11px] leading-tight whitespace-nowrap">
                                {bed.slot}
                              </span>
                              <span className="text-[9px] mt-0.5 font-medium whitespace-nowrap">
                                {isCurrentPick
                                  ? "Đang chọn"
                                  : isAvailable
                                  ? "950k/th"
                                  : isHolding
                                  ? `${bed.holdingTime} Giữ`
                                  : isMaint
                                  ? "Bảo trì"
                                  : "Đã ở"}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Architectural CAD Notation */}
              <div className="pt-2 flex justify-between items-center text-muted-foreground text-[10px] font-mono border-t border-border">
                <span className="shrink-0 whitespace-nowrap">[CAD: 2026.10-DMS-146]</span>
                <span className="truncate ml-2 text-right">WC & BÀN HỌC BỐ TRÍ CUỐI HÀNH LANG B & D</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: DETAIL & RESERVATION HOLD DRAWER (3 COLS) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* 15-Minute Countdown Timer Card */}
          <div className="bg-primary text-white p-3.5 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider font-bold text-white/80 text-[10px] whitespace-nowrap">
                Khóa Giữ Chỗ Tạm Thời
              </span>
              <Clock className="h-3.5 w-3.5 text-white/80 animate-pulse shrink-0" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-white">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-white/80 whitespace-nowrap">Còn lại</span>
            </div>

            {/* Progress bar of timer */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 900) * 100}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-white/80 leading-normal pt-0.5">
              Khóa độc quyền cho MSSV <strong>{user?.studentId || "QE202049"}</strong>, tự giải phóng sau 15 phút.
            </p>
          </div>

          {/* Selected Bed Specifications */}
          <div className="dms-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Giường bạn đã chọn
                </span>
                <h4 className="font-bold text-sm text-foreground">{selectedBed.code}</h4>
              </div>
              <Badge variant="success" className="shrink-0 whitespace-nowrap">
                {selectedBed.tier === "lower" ? "Tầng dưới" : "Tầng trên"}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Vị trí buồng:</span>
                <span className="font-semibold text-foreground truncate text-right">
                  Buồng {selectedCompartment} · P.{selectedRoom}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Tiện ích kèm:</span>
                <span className="font-semibold text-foreground whitespace-nowrap text-right">Locker + Đèn bàn</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Quy cách đệm:</span>
                <span className="font-semibold text-foreground whitespace-nowrap text-right">1.0 × 2.0m Foam</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Thời hạn thuê:</span>
                <span className="font-semibold text-foreground whitespace-nowrap text-right">Học kỳ 1, 5 tháng</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-muted/70 p-3 rounded-xl space-y-2 text-xs border border-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Bảng kê chi phí kỳ 1
              </span>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Tiền phòng (tháng 1):</span>
                <span className="font-mono text-foreground font-semibold whitespace-nowrap">₫950,000</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Tiền cọc an ninh:</span>
                <span className="font-mono text-foreground font-semibold whitespace-nowrap">₫1,000,000</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Tạm ứng điện nước:</span>
                <span className="font-mono text-foreground font-semibold whitespace-nowrap">₫200,000</span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between gap-2 font-bold text-foreground text-xs">
                <span className="whitespace-nowrap">Tổng thanh toán:</span>
                <span className="font-mono text-primary dark:text-primary font-black text-sm whitespace-nowrap">₫2,150,000</span>
              </div>
            </div>

            {/* Payment Method Radio Options */}
            <div className="space-y-1.5 pt-0.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Phương Thức Thanh Toán
              </label>

              {/* VietQR Option */}
              <div
                onClick={() => setPaymentMethod("vietqr")}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  paymentMethod === "vietqr"
                    ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox
                    name="pm"
                    checked={paymentMethod === "vietqr"}
                    onChange={() => setPaymentMethod("vietqr")}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block text-xs whitespace-nowrap">
                      VietQR NAPAS
                    </span>
                    <span className="text-[10px] text-muted-foreground block whitespace-nowrap">
                      Xác thực tức thì
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-soft text-success-soft-foreground border border-success/25 whitespace-nowrap ml-2">
                  Tức thì
                </span>
              </div>

              {/* VNPay Option */}
              <div
                onClick={() => setPaymentMethod("vnpay")}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  paymentMethod === "vnpay"
                    ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox
                    name="pm"
                    checked={paymentMethod === "vnpay"}
                    onChange={() => setPaymentMethod("vnpay")}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block text-xs whitespace-nowrap">
                      VNPay QR
                    </span>
                    <span className="text-[10px] text-muted-foreground block whitespace-nowrap">
                      ATM &amp; Thẻ quốc tế
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md whitespace-nowrap ml-2">
                  Cổng phụ
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleStartCheckout}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs rounded-lg"
            >
              <QrCode className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Tạo VietQR & Xác Nhận Giữ Chỗ</span>
            </Button>

            <p className="text-[10px] text-muted-foreground text-center leading-normal">
              Tự động duyệt 0-chạm & cấp Hợp đồng điện tử PDF tức thì khi có báo Có.
            </p>
          </div>
        </div>
      </div>

      {/* CHECKOUT & AUTO-APPROVAL POPUP MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-muted/70 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary text-white">
                  <QrCode className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Cổng Thanh Toán VietQR và Xét Duyệt Tự Động
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Khóa giữ chỗ giường {selectedBed.code} · Hợp đồng K19
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {checkoutStep === "qr" && (
                <>
                  <div className="flex flex-col items-center justify-center p-4 bg-card rounded-xl border border-border">
                    {/* Dynamic QR Code graphic */}
                    <div className="relative p-2 bg-white rounded-xl shadow-xs border border-border">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DORM_BOOKING_${selectedBed.code}_${user?.studentId || "QE202049"}_2150000`}
                        alt="Mã thanh toán VietQR"
                        className="w-60 h-60 rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center p-1 border">
                          <span className="font-bold text-[9px] text-primary">VIETQR</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-center space-y-1">
                      <span className="text-xs font-bold text-primary dark:text-primary">
                        Quét mã bằng app ngân hàng bất kỳ
                      </span>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Số tiền: <strong>2,150,000 VNĐ</strong> • Nội dung:{" "}
                        <span className="bg-muted px-1 py-0.5 rounded text-foreground font-semibold">
                          KTX {user?.studentId || "QE202049"} {selectedBed.code}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/70 p-3.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Cơ chế tự động xét duyệt</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        Đối soát giới tính: Nam khớp Tòa A
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        Tình trạng nợ cũ: 0 VNĐ, đủ điều kiện xếp phòng
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        Trạng thái sinh viên: Đang học chính quy K19
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCheckoutModal(false)}
                      className="flex-1 text-xs"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={handleConfirmPayment}
                      className="flex-1 bg-success hover:bg-success text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <CircleCheck className="h-4 w-4" />
                      <span>Mô phỏng thanh toán thành công</span>
                    </Button>
                  </div>
                </>
              )}

              {checkoutStep === "verifying" && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">
                      Hệ thống đang xét duyệt {autoApprovalProgress}%
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Kiểm tra đối soát số dư ngân hàng, khóa giường {selectedBed.code} và khởi tạo hợp đồng điện tử...
                    </p>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="py-4 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-success-soft text-success-soft-foreground flex items-center justify-center">
                    <CircleCheck className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-foreground">
                      Đặt giường thành công và đã phê duyệt
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Mã hợp đồng: <strong className="font-mono text-primary">CTR-2026-A205-B03</strong>
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Bạn đã hoàn tất đăng ký giường <strong>{selectedBed.code}</strong>. Hợp đồng điện tử kèm biên nhận tiền cọc đã được lưu vào hồ sơ cá nhân.
                    </p>
                  </div>

                  <div className="p-3 bg-muted/70 rounded-xl text-left w-full text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sinh viên:</span>
                      <span className="font-semibold">{user?.fullName || "Nguyễn Hoàng Vinh"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phòng & Buồng:</span>
                      <span className="font-semibold">Phòng {selectedRoom} - Buồng {selectedCompartment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày bắt đầu vào ở:</span>
                      <span className="font-semibold">05/09/2026</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => alert("Hợp đồng điện tử đã được tải xuống máy!")}
                      className="flex-1 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      <span>Tải hợp đồng</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCheckoutModal(false)}
                      className="text-xs"
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
