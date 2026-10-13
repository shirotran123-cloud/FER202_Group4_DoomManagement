import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building,
  CheckCircle2,
  Clock,
  QrCode,
  Download,
  Check,
  Zap,
  Sun,
  Compass,
} from "lucide-react"

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
      zone: "Đón nắng ban mai & Giếng trời",
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
      zone: "Hướng ban công thoáng mát",
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
      zone: "Gần góc bàn học tự học",
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
      zone: "Thuận tiện lối ra vào & WC",
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

  // Handle bed selection
  const handleSelectBed = (bed: Bed, compId: string) => {
    if (bed.status !== "available") return
    setSelectedBed(bed)
    setSelectedCompartment(compId)
    setTimeLeft(15 * 60)
    setIsLocked(true)
  }

  // Trigger checkout & simulate auto-approval
  const handleStartCheckout = () => {
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
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* 01. STEP PROGRESS HIERARCHY BANNER */}
      <div className="w-full bg-white dark:bg-[#161e23] border border-border rounded-xl p-4 shadow-xs">
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
              <span className="font-semibold text-foreground">Phòng {selectedRoom} (24 Giường)</span>
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
            <span className="w-6 h-6 rounded-full bg-[#4C6269] text-white flex items-center justify-center font-bold text-[11px]">
              05
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#4C6269] block">
                Vị trí giường
              </span>
              <span className="font-bold text-primary dark:text-[#cee6f4]">{selectedBed.code}</span>
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
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: BUILDING, LEVEL, ROOM LIST (3 COLS) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
          {/* Building Selector */}
          <div className="bg-white dark:bg-[#161e23] border border-border p-4 rounded-xl shadow-xs space-y-3">
            <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
              Khu Ký Túc Xá (Complex)
            </label>
            <div className="relative">
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full bg-[#f4f4ee] dark:bg-[#1c262c] text-foreground text-xs font-semibold py-2.5 px-3 pr-8 rounded-lg border border-border appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="b1">Tòa A · Khu Nam (Standard Tech)</option>
                <option value="b2">Tòa B · Khu Nữ (Quiet Quad)</option>
                <option value="b3">Tòa C · Sinh viên Quốc tế</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-base">
                expand_more
              </span>
            </div>

            {/* Floor Selection */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                  Chọn Tầng
                </span>
                <span className="text-[11px] text-[#4C6269] dark:text-[#b3cad3] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Thang máy khả dụng
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-1 bg-[#f4f4ee] dark:bg-[#1c262c] rounded-lg">
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
          <div className="bg-white dark:bg-[#161e23] border border-border p-4 rounded-xl shadow-xs space-y-3">
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
                  : "border-border hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                  <span className="material-symbols-outlined text-sm text-muted-foreground">meeting_room</span>
                  <span>Phòng A201</span>
                </div>
                <Badge variant="occupied">24/24 Đầy</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">Phòng góc · View sân vườn trung tâm</p>
              <div className="w-full bg-[#e3e3dd] dark:bg-[#283740] h-1.5 rounded-full overflow-hidden">
                <div className="bg-muted-foreground h-full w-full"></div>
              </div>
            </div>

            <div
              onClick={() => setSelectedRoom("A202")}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedRoom === "A202"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                  <span className="material-symbols-outlined text-sm text-muted-foreground">meeting_room</span>
                  <span>Phòng A202</span>
                </div>
                <Badge variant="secondary">22/24 Đã ở</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">Giữa hành lang · Pod tự học yên tĩnh</p>
              <div className="w-full bg-[#e3e3dd] dark:bg-[#283740] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#4C6269] h-full w-[91%]"></div>
              </div>
            </div>

            {/* Room A205 (Active Selection) */}
            <div
              onClick={() => setSelectedRoom("A205")}
              className="p-3 rounded-lg bg-primary text-white shadow-xs space-y-2 border border-primary relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className="material-symbols-outlined text-sm text-[#cee6ef]">meeting_room</span>
                  <span>Phòng A205</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#cee6ef] text-[#233944]">
                  6 Giường Trống
                </span>
              </div>
              <p className="text-[11px] text-white/80">3 mặt thoáng · Đón gió ban mai · Ban công riêng</p>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#cee6ef] h-full w-[75%]"></div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/90 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">balcony</span> Ban công
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/90 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">ac_unit</span> ĐH Inverter
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/90 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">wifi</span> Fiber 1Gbps
                </span>
              </div>
            </div>
          </div>

          {/* Living Note & Facility Snapshot */}
          <div className="bg-white dark:bg-[#161e23] border border-border p-3.5 rounded-xl shadow-xs flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              <Building className="h-7 w-7" />
            </div>
            <div>
              <p className="font-bold text-xs text-foreground">Khu A205 Chuẩn Mới 2026</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Vách tiêu âm cao cấp, rèm che kháng khuẩn từng giường, cổng khóa số thông minh.
              </p>
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER ARCHITECTURAL 1:4:6 UNIT BLUEPRINT (6 COLS) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#161e23] border border-border rounded-xl shadow-xs p-5 space-y-4">
            {/* Header blueprint */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#cee6ef] text-[#233944] dark:bg-[#233944] dark:text-[#cee6ef]">
                  <span className="material-symbols-outlined text-lg">view_in_ar_new</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-foreground">
                      Bản Đồ Kiến Trúc · Phòng {selectedRoom}
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f4f4ee] dark:bg-[#1c262c] text-muted-foreground font-semibold">
                      Mô hình 1:4:6 (24 Giường)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nhấp vào giường có màu xanh lá để khóa giữ chỗ 15 phút.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Thời gian thực: 6 giường trống</span>
              </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-4 py-2 px-3 rounded-lg bg-[#f4f4ee] dark:bg-[#1c262c] text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#10b981]"></span>
                <span className="font-medium text-foreground">Trống (6)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#94a3b8]"></span>
                <span className="text-muted-foreground">Đã ở (16)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#f59e0b]"></span>
                <span className="text-muted-foreground">Đang giữ (1)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#ef4444]"></span>
                <span className="text-muted-foreground">Bảo trì (1)</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="w-3 h-3 rounded-xs bg-primary ring-2 ring-primary ring-offset-1"></span>
                <span className="font-bold text-primary dark:text-[#cee6f4]">Đang chọn (1)</span>
              </div>
            </div>

            {/* Visual Floor Canvas Matrix */}
            <div className="p-4 bg-[#f4f4ee] dark:bg-[#141c21] rounded-xl border border-border relative space-y-4">
              {/* Orientation Indicators */}
              <div className="flex justify-between items-center text-muted-foreground text-[10px] font-mono tracking-wider px-1">
                <span className="flex items-center gap-1">
                  <Sun className="h-3 w-3 text-amber-500" /> HƯỚNG ĐÔNG (BAN CÔNG HỨNG SÁNG)
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="h-3 w-3" /> HƯỚNG BẮC (KHUÔN VIÊN TRƯỜNG)
                </span>
              </div>

              {/* 4 Quadrants (1:4:6 Layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {compartments.map((comp) => {
                  const isSelectedComp = selectedCompartment === comp.id
                  return (
                    <div
                      key={comp.id}
                      className={`bg-white dark:bg-[#161e23] p-3.5 rounded-xl border transition-all ${
                        isSelectedComp
                          ? "ring-2 ring-primary border-primary shadow-sm"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-border/60">
                        <div>
                          <span className="font-bold text-xs text-foreground flex items-center gap-1">
                            {comp.name}
                            {isSelectedComp && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{comp.title}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#4C6269] dark:text-[#b3cad3] bg-[#cee6ef]/40 dark:bg-[#233944] px-1.5 py-0.5 rounded">
                          {comp.zone}
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
                              className={`p-2 rounded-lg text-center flex flex-col items-center justify-center transition-all ${
                                isCurrentPick
                                  ? "bg-primary text-white shadow-md scale-105 ring-2 ring-primary ring-offset-2 z-10 cursor-pointer"
                                  : isAvailable
                                  ? "bg-[#ECFDF5] dark:bg-[#065F46]/20 border border-[#A7F3D0] hover:bg-[#d1fae5] cursor-pointer text-[#065F46] dark:text-[#6ee7b7]"
                                  : isHolding
                                  ? "bg-[#FFFBEB] dark:bg-[#78350f]/20 border border-[#FDE68A] text-[#92400E] dark:text-[#fcd34d] cursor-not-allowed"
                                  : isMaint
                                  ? "bg-[#FEF2F2] dark:bg-[#7f1d1d]/20 border border-[#FECACA] text-[#991B1B] dark:text-[#fca5a5] cursor-not-allowed"
                                  : "bg-[#F1F5F9] dark:bg-[#1e293b] text-muted-foreground opacity-75 cursor-not-allowed"
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">
                                {isCurrentPick ? "check_circle" : "single_bed"}
                              </span>
                              <span className="font-mono font-bold text-[11px] leading-tight">
                                {bed.slot}
                              </span>
                              <span className="text-[9px] mt-0.5 font-medium">
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
              <div className="pt-2 flex justify-between items-center text-slate-500 dark:text-slate-400 text-[10px] font-mono border-t border-border">
                <span>[CAD-REV: 2026.10-DMS-146]</span>
                <span>KHU VỆ SINH & KHÔNG GIAN BÀN HỌC BỐ TRÍ CUỐI HÀNH LANG BUỒNG B & D</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: DETAIL & RESERVATION HOLD DRAWER (3 COLS) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* 15-Minute Countdown Timer Card */}
          <div className="bg-primary text-white p-4 rounded-xl shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider font-bold text-[#cee6ef] text-[10px]">
                Khóa Giữ Chỗ Tạm Thời
              </span>
              <Clock className="h-4 w-4 text-[#cee6ef] animate-pulse" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-[#cee6ef]">Còn lại</span>
            </div>

            {/* Progress bar of timer */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#cee6ef] h-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 900) * 100}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-white/80 leading-relaxed pt-1">
              Giường đang được khóa độc quyền cho MSSV <strong>{user?.studentId || "SE182049"}</strong>. Hệ thống sẽ tự động giải phóng giường sau khi hết thời gian.
            </p>
          </div>

          {/* Selected Bed Specifications */}
          <div className="bg-white dark:bg-[#161e23] border border-border p-4 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Giường bạn đã chọn
                </span>
                <h4 className="font-bold text-sm text-foreground">{selectedBed.code}</h4>
              </div>
              <Badge variant="available">
                {selectedBed.tier === "lower" ? "Tầng dưới (Lower)" : "Tầng trên (Upper)"}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Vị trí buồng:</span>
                <span className="font-semibold text-foreground">
                  Buồng {selectedCompartment} · Phòng {selectedRoom}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tiện ích kèm theo:</span>
                <span className="font-semibold text-foreground">Tủ locker số + Đèn bàn</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Quy cách đệm:</span>
                <span className="font-semibold text-foreground">1.0m × 2.0m Orthopedic</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Thời hạn thuê:</span>
                <span className="font-semibold text-foreground">Học kỳ 1 (5 Tháng)</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-[#f4f4ee] dark:bg-[#1c262c] p-3.5 rounded-xl space-y-2 text-xs border border-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300 block">
                Bảng Kê Chi Phí Kỳ 1
              </span>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Tiền phòng tháng đầu:</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">₫950,000</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Tiền cọc an ninh (Hoàn lại 100%):</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">₫1,000,000</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Quỹ tạm ứng điện nước:</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">₫200,000</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between font-bold text-slate-900 dark:text-sky-300 text-sm">
                <span>Tổng nộp hôm nay:</span>
                <span className="font-mono text-primary dark:text-sky-400 font-black">₫2,150,000</span>
              </div>
            </div>

            {/* Payment Method Radio Options */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300 block">
                Phương Thức Thanh Toán
              </label>

              {/* VietQR Option */}
              <div
                onClick={() => setPaymentMethod("vietqr")}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                  paymentMethod === "vietqr"
                    ? "border-sky-500 bg-sky-500/10 shadow-xs ring-1 ring-sky-500/30 dark:border-sky-400 dark:bg-sky-950/40 dark:ring-sky-400/40"
                    : "border-border hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "vietqr"}
                    onChange={() => setPaymentMethod("vietqr")}
                    className="accent-sky-500 h-4 w-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">
                      VietQR NAPAS 24/7 (Động)
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Tự động quét mã QR nhận diện tức thì
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20">
                  Tức thì
                </span>
              </div>

              {/* VNPay Option */}
              <div
                onClick={() => setPaymentMethod("vnpay")}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                  paymentMethod === "vnpay"
                    ? "border-sky-500 bg-sky-500/10 shadow-xs ring-1 ring-sky-500/30 dark:border-sky-400 dark:bg-sky-950/40 dark:ring-sky-400/40"
                    : "border-border hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "vnpay"}
                    onChange={() => setPaymentMethod("vnpay")}
                    className="accent-sky-500 h-4 w-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">
                      VNPay QR / Thẻ nội địa
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Cổng thanh toán thẻ ATM / Thẻ quốc tế
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  Cổng phụ
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleStartCheckout}
              className="w-full h-11 bg-primary hover:bg-[#3a505b] dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm rounded-lg"
            >
              <QrCode className="h-4 w-4" />
              <span>Tạo VietQR & Xác Nhận Giữ Chỗ</span>
            </Button>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight">
              Hệ thống tự động duyệt 0-chạm và cấp Hợp đồng điện tử PDF có mã xác thực tức thì sau khi ngân hàng báo Có.
            </p>
          </div>
        </div>
      </div>

      {/* CHECKOUT & AUTO-APPROVAL POPUP MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161e23] border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#f4f4ee] dark:bg-[#1c262c] border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary text-white">
                  <QrCode className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Cổng Thanh Toán VietQR & Xét Duyệt Tự Động
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
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {checkoutStep === "qr" && (
                <>
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-border">
                    {/* Dynamic QR Code graphic */}
                    <div className="relative p-2 bg-white rounded-xl shadow-xs border border-gray-100">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DORM_BOOKING_${selectedBed.code}_${user?.studentId || "SE182049"}_2150000`}
                        alt="VietQR Payment Code"
                        className="w-48 h-48 rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center p-1 border">
                          <span className="font-bold text-[9px] text-primary">VIETQR</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-center space-y-1">
                      <span className="text-xs font-bold text-primary dark:text-[#cee6ef]">
                        Quét mã bằng app ngân hàng bất kỳ (NAPAS 24/7)
                      </span>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Số tiền: <strong>2,150,000 VNĐ</strong> • Nội dung:{" "}
                        <span className="bg-[#f4f4ee] px-1 py-0.5 rounded text-foreground font-semibold">
                          KTX {user?.studentId || "SE182049"} {selectedBed.code}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#f4f4ee] dark:bg-[#1c262c] p-3.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>Cơ chế Tự Động Xét Duyệt 0-Chạm (Auto-Approval)</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        Đối soát giới tính: Nam khớp Tòa A
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        Tình trạng nợ cũ: 0 VNĐ (Đủ điều kiện xếp phòng)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
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
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Mô Phỏng Thanh Toán Thành Công</span>
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
                      Auto-Approval Engine Đang Xử Lý... ({autoApprovalProgress}%)
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Kiểm tra đối soát số dư ngân hàng, khóa vĩnh viễn giường {selectedBed.code} và khởi tạo Hợp đồng điện tử e-Contract PDF...
                    </p>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="py-4 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-foreground">
                      Đặt Giường Thành Công & Đã Phê Duyệt!
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Mã hợp đồng: <strong className="font-mono text-primary">CTR-2026-A205-B03</strong>
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Bạn đã hoàn tất đăng ký giường <strong>{selectedBed.code}</strong>. Hợp đồng điện tử kèm biên nhận tiền cọc đã được lưu vào hồ sơ cá nhân.
                    </p>
                  </div>

                  <div className="p-3 bg-[#f4f4ee] dark:bg-[#1c262c] rounded-xl text-left w-full text-xs space-y-1">
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
                      onClick={() => alert("Hợp đồng điện tử PDF đã được tải xuống máy!")}
                      className="flex-1 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      <span>Tải Hợp Đồng PDF</span>
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
