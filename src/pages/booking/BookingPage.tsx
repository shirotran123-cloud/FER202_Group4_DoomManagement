import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Button } from "@/components/ui/button"
import { useBooking } from "@/contexts/BookingContext"
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal"
import { CheckCircle2, QrCode, Download, Check, Zap, ChevronDown, DoorClosed, BedDouble, ArrowRight } from "lucide-react"

interface Bed {
  id: string
  code: string
  slot: string
  status: "available" | "occupied" | "holding" | "maintenance"
  price: number
  tier: "lower" | "upper"
  holdingTime?: string
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
  const { setBooking } = useBooking()

  // Selection states
  const [selectedBuilding, setSelectedBuilding] = useState("b1")
  const [selectedFloor, setSelectedFloor] = useState(2)
  const [selectedRoom, setSelectedRoom] = useState("A205")
  const [selectedCompartment, setSelectedCompartment] = useState("B")
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)

  // Active step: which step is currently highlighted (others dim)
  // -1 means all steps done (payment confirmed)
  const [activeStep, setActiveStep] = useState<number>(1)

  // Whether a step has been "completed" (user clicked Next)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([2, 3, 4]))

  // Timer (15min)
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 45)
  const [isLocked, setIsLocked] = useState(true)

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "vnpay">("vietqr")
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"qr" | "verifying" | "success">("qr")
  const [autoApprovalProgress, setAutoApprovalProgress] = useState(0)

  useEffect(() => {
    if (!isLocked) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isLocked])

  useEffect(() => {
    if (isLocked && timeLeft === 0) {
      setIsLocked(false)
    }
  }, [isLocked, timeLeft])

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

  const compartments: Compartment[] = [
    {
      id: "A", name: "Compartment A", title: "Window Bay", zone: "Đón nắng ban mai",
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
      id: "B", name: "Compartment B", title: "Balcony Wing", zone: "Hướng ban công",
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
      id: "C", name: "Compartment C", title: "Study Hub", zone: "Góc bàn học",
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
      id: "D", name: "Compartment D", title: "Main Hall Door", zone: "Cạnh cửa & WC",
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

  const roomOptions = [
    { id: "A201", label: "Phòng A201", desc: "Phòng góc · View sân vườn trung tâm", available: 0, badge: "Đầy" },
    { id: "A202", label: "Phòng A202", desc: "Giữa hành lang · Pod tự học yên tĩnh", available: 2, badge: "2 Trống" },
    { id: "A205", label: "Phòng A205", desc: "3 mặt thoáng · Đón gió ban mai · Ban công riêng", available: 6, badge: "6 Trống" },
    { id: "A208", label: "Phòng A208", desc: "Cuối hành lang · Gần thang máy", available: 4, badge: "4 Trống" },
  ]

  const buildingLabel =
    selectedBuilding === "b1"
      ? "Tòa A · Khu Nam"
      : selectedBuilding === "b2"
      ? "Tòa B · Khu Nam"
      : selectedBuilding === "b3"
      ? "Tòa C · Khu Nữ"
      : "Tòa D · Khu Nữ"

  const handleSelectBed = (bed: Bed, compId: string) => {
    if (bed.status !== "available") return
    setSelectedBed(bed)
    setSelectedCompartment(compId)
    setTimeLeft(15 * 60)
    setIsLocked(true)
  }

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
    setActiveStep(step + 1)
  }

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
      // Sync to BookingContext
      const comp = compartments.find((c) => c.id === selectedCompartment)
      setBooking({
        building: selectedBuilding,
        buildingLabel,
        floor: selectedFloor,
        room: selectedRoom,
        compartment: selectedCompartment,
        compartmentTitle: comp?.title || "Balcony Wing",
        bedCode: selectedBed?.code || "",
        bedSlot: selectedBed?.slot || "",
        bedTier: selectedBed?.tier || "lower",
        isConfirmed: true,
      })
      setActiveStep(-1)
      setCompletedSteps(new Set([1, 2, 3, 4, 5]))
    }, 2200)
  }

  // Step header component with 8pt grid padding and organic curve transition
  const StepHeader = ({
    step, title, summary, isActive, isDone,
  }: { step: number; title: string; summary: string; isActive: boolean; isDone: boolean }) => (
    <button
      onClick={() => setActiveStep(step)}
      className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors duration-250 ease-out cursor-pointer ${
        isActive ? "bg-white dark:bg-[#161e23]" : "hover:bg-slate-50 dark:hover:bg-[#1c2830]"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-all duration-250 ${
          isDone
            ? "bg-emerald-600 text-white shadow-xs"
            : isActive
            ? "bg-primary text-white shadow-md ring-4 ring-primary/20"
            : "bg-slate-100 dark:bg-[#1c262c] text-muted-foreground"
        }`}>
          {isDone ? <Check className="h-4 w-4" /> : step}
        </span>
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Bước {step}</p>
          <p className={`font-bold text-sm sm:text-base ${isActive ? "text-foreground font-black" : "text-muted-foreground"}`}>{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isActive ? "bg-primary/10 text-primary dark:text-[#cee6ef]" : "text-muted-foreground"}`}>
          {summary}
        </span>
        <ChevronDown className={`text-muted-foreground h-4 w-4 transition-transform duration-250 ${isActive ? "rotate-180" : ""}`} />
      </div>
    </button>
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16">
      {/* PAGE HEADER */}
      <ScrollReveal direction="up" distance={16}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
            <BedDouble className="h-3.5 w-3.5" />
            <span>Quy trình Đặt phòng Ký túc xá FPT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Đặt Phòng Trực Tuyến &amp; Giữ Chỗ Thông Minh
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Lựa chọn tòa nhà, tầng, phòng, buồng riêng và vị trí giường tầng. Xét duyệt hồ sơ tự động qua VietQR 24/7.
          </p>
        </div>
      </ScrollReveal>

      {/* BREADCRUMB PROGRESS BANNER */}
      <ScrollReveal direction="up" delay={0.05} distance={16}>
        <div className="w-full bg-white dark:bg-[#161e23] border border-border rounded-2xl px-6 py-4 shadow-xs">
          <div className="flex items-center gap-3 overflow-x-auto text-xs">
            {[
              { n: 1, label: "Tòa nhà", value: buildingLabel.split(" · ")[0] },
              { n: 2, label: "Tầng", value: `Tầng ${selectedFloor}` },
              { n: 3, label: "Phòng", value: selectedRoom ? `Phòng ${selectedRoom}` : "—" },
              { n: 4, label: "Buồng", value: selectedCompartment ? `Buồng ${selectedCompartment}` : "—" },
              { n: 5, label: "Giường", value: selectedBed?.code || "—" },
            ].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <button
                  onClick={() => setActiveStep(s.n)}
                  className={`flex items-center gap-2.5 min-w-max transition-opacity duration-200 cursor-pointer ${activeStep === s.n ? "opacity-100 font-bold" : "opacity-60 hover:opacity-90"}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 transition-transform ${
                    completedSteps.has(s.n) && activeStep !== s.n
                      ? "bg-emerald-600 text-white"
                      : activeStep === s.n
                      ? "bg-primary text-white scale-110 shadow-xs"
                      : "bg-slate-100 dark:bg-[#1c262c] text-muted-foreground"
                  }`}>
                    {completedSteps.has(s.n) && activeStep !== s.n ? <Check className="h-3 w-3" /> : `0${s.n}`}
                  </span>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground leading-none">{s.label}</span>
                    <span className={`font-semibold text-xs leading-tight ${activeStep === s.n ? "text-primary dark:text-[#cee6ef]" : "text-foreground"}`}>{s.value}</span>
                  </div>
                </button>
                {i < arr.length - 1 && <span className="text-muted-foreground/30 font-mono shrink-0 text-base">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* STEP 1 — TÒA NHÀ */}
      <ScrollReveal direction="up" delay={0.1} distance={20}>
        <div className={`w-full bg-white dark:bg-[#161e23] border border-border rounded-2xl shadow-xs overflow-hidden transition-all duration-250 ${activeStep !== 1 && !completedSteps.has(1) ? "opacity-40" : activeStep !== 1 ? "opacity-60 hover:opacity-85" : "shadow-md"}`}>
          <StepHeader step={1} title="Chọn Tòa Nhà" summary={buildingLabel} isActive={activeStep === 1} isDone={completedSteps.has(1) && activeStep !== 1} />
          {activeStep === 1 && (
            <div className="p-6 border-t border-border space-y-6">
              <p className="text-xs text-muted-foreground">Chọn khu ký túc xá phù hợp với giới tính và nhu cầu sinh hoạt của bạn:</p>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4" staggerChildren={0.08}>
                {[
                  { id: "b1", icon: "🏢", label: "Tòa A · Khu Nam", desc: "Standard Tech · 5 tầng · 120 phòng" },
                  { id: "b2", icon: "🏛️", label: "Tòa B · Khu Nam", desc: "Quiet Quad · Phòng yên tĩnh" },
                  { id: "b3", icon: "🌐", label: "Tòa C · Sinh viên QT", desc: "International · 3 tầng" },
                ].map((b) => (
                  <StaggerItem key={b.id}>
                    <button
                      onClick={() => setSelectedBuilding(b.id)}
                      className={`w-full p-6 rounded-2xl border text-left transition-all duration-250 cursor-pointer ui-card-interactive ${
                        selectedBuilding === b.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                          : "border-border hover:bg-slate-50 dark:hover:bg-[#1c262c]"
                      }`}
                    >
                      <div className="text-3xl mb-3">{b.icon}</div>
                      <p className="font-bold text-sm text-foreground">{b.label}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">{b.desc}</p>
                    </button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <Button
                onClick={() => completeStep(1)}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 ui-btn-interactive shadow-sm"
              >
                <span>Tiếp theo: Chọn Tầng</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* STEP 2 — TẦNG */}
      <ScrollReveal direction="up" delay={0.15} distance={20}>
        <div className={`w-full bg-white dark:bg-[#161e23] border border-border rounded-2xl shadow-xs overflow-hidden transition-all duration-250 ${activeStep !== 2 && !completedSteps.has(2) ? "opacity-40" : activeStep !== 2 ? "opacity-60 hover:opacity-85" : "shadow-md"}`}>
          <StepHeader step={2} title="Chọn Tầng" summary={`Tầng ${selectedFloor}`} isActive={activeStep === 2} isDone={completedSteps.has(2) && activeStep !== 2} />
          {activeStep === 2 && (
            <div className="p-6 border-t border-border space-y-6">
              <p className="text-xs text-muted-foreground">Tầng càng cao càng thoáng mát, hệ thống thang máy tốc độ cao khả dụng tất cả các tầng.</p>
              <StaggerContainer className="grid grid-cols-5 gap-3" staggerChildren={0.06}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <StaggerItem key={lvl}>
                    <button
                      onClick={() => setSelectedFloor(lvl)}
                      className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-250 cursor-pointer ui-card-interactive ${
                        selectedFloor === lvl
                          ? "bg-primary text-white shadow-md ring-2 ring-primary/30"
                          : "bg-slate-50 dark:bg-[#1c262c] text-muted-foreground hover:text-foreground hover:bg-slate-100"
                      }`}
                    >
                      T{lvl}
                    </button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <div className="p-4 bg-slate-50 dark:bg-[#1c262c] rounded-xl text-xs text-muted-foreground border border-border/60">
                <span className="font-semibold text-foreground">Đặc điểm Tầng {selectedFloor}:</span>{" "}
                {selectedFloor === 1 ? "Gần cổng ra vào và sảnh trung tâm, thuận tiện đi lại nhanh chóng." :
                 selectedFloor === 2 ? "Tầng phổ biến nhất, có ban công hướng thoáng, rất gần thang máy." :
                 selectedFloor === 3 ? "Thoáng mát, ít tiếng ồn từ sảnh chính, phù hợp sinh hoạt ổn định." :
                 selectedFloor === 4 ? "Tầm nhìn đẹp, yên tĩnh tối đa, lý tưởng để học bài và nghỉ ngơi." :
                 "Tầng cao nhất, thoáng gió nhất, rất ít người qua lại sảnh."}
              </div>
              <Button
                onClick={() => completeStep(2)}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 ui-btn-interactive shadow-sm"
              >
                <span>Tiếp theo: Chọn Phòng</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* STEP 3 — PHÒNG */}
      <ScrollReveal direction="up" delay={0.2} distance={20}>
        <div className={`w-full bg-white dark:bg-[#161e23] border border-border rounded-2xl shadow-xs overflow-hidden transition-all duration-250 ${activeStep !== 3 && !completedSteps.has(3) ? "opacity-40" : activeStep !== 3 ? "opacity-60 hover:opacity-85" : "shadow-md"}`}>
          <StepHeader step={3} title="Chọn Phòng" summary={selectedRoom ? `Phòng ${selectedRoom}` : "Chưa chọn"} isActive={activeStep === 3} isDone={completedSteps.has(3) && activeStep !== 3} />
          {activeStep === 3 && (
            <div className="p-6 border-t border-border space-y-4">
              <p className="text-xs text-muted-foreground">Phòng có sẵn tại Tầng {selectedFloor} — {roomOptions.length} phòng đang vận hành:</p>
              <StaggerContainer className="space-y-3" staggerChildren={0.06}>
                {roomOptions.map((room) => (
                  <StaggerItem key={room.id}>
                    <button
                      onClick={() => room.available > 0 && setSelectedRoom(room.id)}
                      disabled={room.available === 0}
                      className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-250 ui-card-interactive cursor-pointer ${
                        selectedRoom === room.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                          : room.available === 0
                          ? "border-border opacity-40 cursor-not-allowed"
                          : "border-border hover:bg-slate-50 dark:hover:bg-[#1c262c]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <DoorClosed className={`h-6 w-6 shrink-0 ${selectedRoom === room.id ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-bold text-sm text-foreground">{room.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{room.desc}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap ${
                        room.available === 0
                          ? "bg-slate-100 text-slate-500 dark:bg-slate-800"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      }`}>{room.badge}</span>
                    </button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <Button
                onClick={() => completeStep(3)}
                disabled={!selectedRoom}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 ui-btn-interactive shadow-sm disabled:opacity-40"
              >
                <span>Tiếp theo: Chọn Buồng</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* STEP 4 — BUỒNG */}
      <ScrollReveal direction="up" delay={0.25} distance={20}>
        <div className={`w-full bg-white dark:bg-[#161e23] border border-border rounded-2xl shadow-xs overflow-hidden transition-all duration-250 ${activeStep !== 4 && !completedSteps.has(4) ? "opacity-40" : activeStep !== 4 ? "opacity-60 hover:opacity-85" : "shadow-md"}`}>
          <StepHeader step={4} title="Chọn Buồng Riêng" summary={selectedCompartment ? `Buồng ${selectedCompartment}` : "Chưa chọn"} isActive={activeStep === 4} isDone={completedSteps.has(4) && activeStep !== 4} />
          {activeStep === 4 && (
            <div className="p-6 border-t border-border space-y-6">
              <p className="text-xs text-muted-foreground">Mỗi phòng tiêu chuẩn gồm 4 buồng riêng độc lập (A, B, C, D), mỗi buồng trang bị 6 giường tầng:</p>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerChildren={0.08}>
                {compartments.map((comp) => {
                  const avail = comp.beds.filter((b) => b.status === "available").length
                  return (
                    <StaggerItem key={comp.id}>
                      <button
                        onClick={() => avail > 0 && setSelectedCompartment(comp.id)}
                        disabled={avail === 0}
                        className={`w-full p-5 rounded-2xl border text-left transition-all duration-250 ui-card-interactive cursor-pointer ${
                          selectedCompartment === comp.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                            : avail === 0
                            ? "border-border opacity-40 cursor-not-allowed"
                            : "border-border hover:bg-slate-50 dark:hover:bg-[#1c262c]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-black text-lg text-foreground">Buồng {comp.id}</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            avail > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                          }`}>{avail > 0 ? `${avail} trống` : "Đầy"}</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground">{comp.title}</p>
                        <p className="text-[11px] text-muted-foreground">{comp.zone}</p>
                        <div className="flex gap-1.5 mt-3">
                          {comp.beds.map((b) => (
                            <span key={b.id} className={`flex-1 h-2 rounded-sm ${
                              b.status === "available" ? "bg-emerald-500" :
                              b.status === "holding" ? "bg-amber-400" :
                              b.status === "maintenance" ? "bg-blue-400" :
                              "bg-slate-300 dark:bg-slate-700"
                            }`} />
                          ))}
                        </div>
                      </button>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>
              <Button
                onClick={() => completeStep(4)}
                disabled={!selectedCompartment}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 ui-btn-interactive shadow-sm disabled:opacity-40"
              >
                <span>Tiếp theo: Chọn Giường &amp; Thanh Toán</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* STEP 5 — GIƯỜNG + THANH TOÁN */}
      <ScrollReveal direction="up" delay={0.3} distance={20}>
        <div className={`w-full bg-white dark:bg-[#161e23] border border-border rounded-2xl shadow-xs overflow-hidden transition-all duration-250 ${activeStep !== 5 && !completedSteps.has(5) ? "opacity-40" : activeStep !== 5 ? "opacity-60 hover:opacity-85" : "shadow-md"}`}>
          <StepHeader step={5} title="Chọn Vị Trí Giường &amp; Thanh Toán" summary={selectedBed?.code || "Chưa chọn"} isActive={activeStep === 5} isDone={completedSteps.has(5) && activeStep !== 5} />
          {activeStep === 5 && (
            <div className="p-6 border-t border-border space-y-6">
              {/* Bed grid */}
              {compartments.filter((c) => c.id === selectedCompartment).map((comp) => (
                <div key={comp.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">Buồng {comp.id} · {comp.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Nhấp vào ô màu xanh lá để chọn giường trống của bạn:</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" />Còn trống</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />Đã có người</span>
                    </div>
                  </div>

                  <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" staggerChildren={0.05}>
                    {comp.beds.map((bed) => {
                      const isPick = selectedBed?.id === bed.id
                      const isAvail = bed.status === "available"
                      const isHold = bed.status === "holding"
                      const isMaint = bed.status === "maintenance"
                      return (
                        <StaggerItem key={bed.id}>
                          <button
                            onClick={() => handleSelectBed(bed, comp.id)}
                            disabled={!isAvail}
                            className={`w-full p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all duration-250 ui-card-interactive cursor-pointer ${
                              isPick
                                ? "bg-primary text-white border-primary shadow-lg ring-4 ring-primary/20 scale-102"
                                : isAvail
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100"
                                : isHold
                                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 cursor-not-allowed opacity-60"
                                : isMaint
                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 cursor-not-allowed opacity-60"
                                : "bg-slate-50 dark:bg-[#1c262c] border-border cursor-not-allowed opacity-50"
                            }`}
                          >
                            {isPick ? (
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            ) : (
                              <BedDouble className={`h-5 w-5 ${isAvail ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} />
                            )}
                            <span className={`font-mono font-bold text-sm ${isPick ? "text-white" : "text-foreground"}`}>{bed.slot}</span>
                            <span className={`text-[11px] ${isPick ? "text-white/80" : "text-muted-foreground"}`}>
                              {bed.tier === "lower" ? "Tầng dưới" : "Tầng trên"}
                            </span>
                            <span className={`text-[11px] font-semibold ${
                              isPick ? "text-white font-bold" :
                              isAvail ? "text-emerald-700 dark:text-emerald-400" :
                              isHold ? "text-amber-600" :
                              isMaint ? "text-blue-600" : "text-muted-foreground"
                            }`}>
                              {isPick ? "Đang chọn" : isAvail ? "950k/th" : isHold ? `${bed.holdingTime} Giữ` : isMaint ? "Bảo trì" : "Đã ở"}
                            </span>
                          </button>
                        </StaggerItem>
                      )
                    })}
                  </StaggerContainer>
                </div>
              ))}

              {/* Payment block */}
              {selectedBed && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border">
                  {/* Left: Summary */}
                  <div className="space-y-4">
                    {/* Timer */}
                    {isLocked && (
                      <div className="bg-primary text-white p-5 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                        <div>
                          <p className="text-[11px] uppercase font-bold text-white/70 tracking-wider">Khóa giữ chỗ tạm thời</p>
                          <p className="font-black text-3xl font-mono mt-1">{formatTime(timeLeft)}</p>
                        </div>
                        <div className="text-right text-xs text-white/80">
                          <p>MSSV: <strong>{user?.studentId || "SE182049"}</strong></p>
                          <p className="text-white/60 mt-0.5">Thời gian thanh toán còn lại</p>
                        </div>
                      </div>
                    )}

                    {/* Bảng kê chi phí */}
                    <div className="bg-slate-50 dark:bg-[#1c262c] rounded-2xl p-5 space-y-3 border border-border text-xs sm:text-sm">
                      <div className="flex justify-between font-bold text-foreground border-b border-border pb-3">
                        <span>Giường đã chọn:</span>
                        <span className="text-primary dark:text-[#cee6ef] font-mono font-black">{selectedBed.code}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-xs"><span>Tiền phòng tháng 1:</span><span className="font-mono font-semibold text-foreground">₫950,000</span></div>
                      <div className="flex justify-between text-muted-foreground text-xs"><span>Tiền đặt cọc:</span><span className="font-mono font-semibold text-emerald-600">₫0 (Miễn cọc)</span></div>
                      <div className="flex justify-between text-muted-foreground text-xs"><span>Tạm ứng điện nước:</span><span className="font-mono font-semibold text-foreground">₫200,000</span></div>
                      <div className="flex justify-between font-black text-base pt-3 border-t border-border">
                        <span>Tổng thanh toán:</span>
                        <span className="text-primary dark:text-sky-400 font-mono">₫2,150,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment method + CTA */}
                  <div className="space-y-4">
                    <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Phương Thức Thanh Toán Tự Động</p>
                    {[
                      { id: "vietqr" as const, label: "VietQR NAPAS 24/7", sub: "Tự động xét duyệt 0-chạm tức thì", badge: "Khuyên dùng", color: "emerald" },
                      { id: "vnpay" as const, label: "VNPay QR / Thẻ ATM", sub: "Cổng ATM nội địa & Thẻ quốc tế", badge: "Cổng phụ", color: "slate" },
                    ].map((pm) => (
                      <div
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer text-sm transition-all duration-200 ui-card-interactive ${
                          paymentMethod === pm.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                            : "border-border hover:bg-slate-50 dark:hover:bg-[#1c262c]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input type="radio" name="pm" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="accent-primary h-4 w-4 shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">{pm.label}</p>
                            <p className="text-xs text-muted-foreground">{pm.sub}</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${pm.id === "vietqr" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>{pm.badge}</span>
                      </div>
                    ))}

                    <Button
                      onClick={handleStartCheckout}
                      className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold text-sm flex items-center justify-center gap-2 rounded-xl shadow-sm ui-btn-interactive mt-2"
                    >
                      <QrCode className="h-5 w-5 shrink-0" />
                      <span>Tạo VietQR &amp; Xác Nhận Giữ Chỗ</span>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Tự động duyệt hồ sơ 0-chạm &amp; cấp Hợp đồng điện tử PDF tức thì.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161e23] border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-50 dark:bg-[#1c262c] border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-primary text-white"><QrCode className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground">Cổng Thanh Toán VietQR &amp; Xét Duyệt Tự Động</h3>
                  <p className="text-xs text-muted-foreground">Khóa giữ chỗ giường {selectedBed?.code}</p>
                </div>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md text-xl leading-none cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {checkoutStep === "qr" && (
                <>
                  <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-border gap-3 text-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DORM_BOOKING_${selectedBed?.code}_${user?.studentId || "SE182049"}_2150000`}
                      alt="VietQR" className="w-48 h-48 rounded-xl shadow-sm"
                    />
                    <p className="text-xs font-bold text-primary">Quét mã bằng app ngân hàng bất kỳ (NAPAS 24/7)</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Số tiền: <strong>2,150,000 VNĐ</strong> · Nội dung: <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-foreground">KTX {user?.studentId || "SE182049"} {selectedBed?.code}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#1c262c] p-5 rounded-2xl space-y-2.5 text-xs border border-border/60">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Zap className="h-4 w-4 text-sky-500" />
                      <span>Cơ chế Tự Động Xét Duyệt 0-Chạm</span>
                    </div>
                    {["Đối soát giới tính: Nam khớp Tòa A/B • Nữ khớp Tòa C/D", "Tình trạng nợ cũ: 0 VNĐ (Đủ điều kiện)", "Trạng thái sinh viên: Đang học chính quy K19"].map((t) => (
                      <div key={t} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCheckoutModal(false)} className="flex-1 text-sm h-11 rounded-xl">Hủy bỏ</Button>
                    <Button onClick={handleConfirmPayment} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-11 rounded-xl flex items-center justify-center gap-2 ui-btn-interactive">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Mô Phỏng Thanh Toán</span>
                    </Button>
                  </div>
                </>
              )}

              {checkoutStep === "verifying" && (
                <div className="py-12 flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="text-center space-y-1.5">
                    <h4 className="font-bold text-base text-foreground">Auto-Approval Engine đang xử lý... ({autoApprovalProgress}%)</h4>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">Kiểm tra đối soát số dư, khóa vĩnh viễn giường {selectedBed?.code} và khởi tạo Hợp đồng điện tử...</p>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#1c262c] rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${autoApprovalProgress}%` }} />
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="py-6 flex flex-col items-center gap-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-foreground">Đặt Giường Thành Công!</h4>
                    <p className="text-xs text-muted-foreground mt-1.5">Mã hợp đồng: <strong className="font-mono text-primary font-bold">CTR-2026-{selectedBed?.code?.replace(/-/g, "")}</strong></p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-sm">Trang <strong>Phòng Của Tôi</strong> đã được cập nhật với thông tin giường bạn vừa đặt.</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <Button onClick={() => alert("Hợp đồng điện tử PDF đã được tải xuống!")} className="flex-1 bg-primary hover:bg-primary/95 text-white text-sm font-bold h-11 rounded-xl flex items-center justify-center gap-2 ui-btn-interactive">
                      <Download className="h-4 w-4" />Tải Hợp Đồng PDF
                    </Button>
                    <Button variant="outline" onClick={() => setShowCheckoutModal(false)} className="text-sm h-11 rounded-xl">Đóng</Button>
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
