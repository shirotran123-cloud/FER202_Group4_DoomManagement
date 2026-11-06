import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { ContractRenewalModal } from "@/components/contract/ContractRenewalModal"
import { StudentContractModal } from "@/components/contract/StudentContractModal"
import { Button } from "@/components/ui/button"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal"
import { RollingText } from "@/components/ui/rolling-text"
import { Link } from "react-router-dom"
import {
  DoorClosed,
  FileText,
  Receipt,
  Wrench,
  LogOut,
  Users,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  BedDouble,
  CalendarCheck2,
} from "lucide-react"

// ─── Compartment Slide Carousel ───────────────────────────────────────────────
const COMPARTMENTS = [
  {
    id: "A",
    label: "Buồng A",
    subtitle: "Window Bay · Hướng Đông",
    occupancy: "5/6",
    myComp: false,
    beds: [
      { g: 1, tier: "Dưới", name: "H. Long", status: "occupied" },
      { g: 2, tier: "Trên", name: "T. Tuấn", status: "occupied" },
      { g: 3, tier: "Dưới", name: null, status: "available" },
      { g: 4, tier: "Trên", name: "P. Quang", status: "occupied" },
      { g: 5, tier: "Dưới", name: "Đ. Khoa", status: "occupied" },
      { g: 6, tier: "Trên", name: "M. Đức", status: "occupied" },
    ],
  },
  {
    id: "B",
    label: "Buồng B",
    subtitle: "Balcony Wing · Ban Công",
    occupancy: "5/6",
    myComp: true,
    beds: [
      { g: 1, tier: "Dưới", name: "T. Tiến", status: "occupied" },
      { g: 2, tier: "Trên", name: "L. Nam", status: "occupied" },
      { g: 3, tier: "Dưới", name: "Nguyễn Hoàng Vinh", status: "mine" },
      { g: 4, tier: "Trên", name: "T. Trung", status: "occupied" },
      { g: 5, tier: "Dưới", name: "Đ. Trung", status: "occupied" },
      { g: 6, tier: "Trên", name: null, status: "available" },
    ],
  },
  {
    id: "C",
    label: "Buồng C",
    subtitle: "Study Hub · Góc Tự Học",
    occupancy: "4/6",
    myComp: false,
    beds: [
      { g: 1, tier: "Dưới", name: "K. Minh", status: "occupied" },
      { g: 2, tier: "Trên", name: null, status: "available" },
      { g: 3, tier: "Dưới", name: "P. Linh", status: "occupied" },
      { g: 4, tier: "Trên", name: "T. Dung", status: "occupied" },
      { g: 5, tier: "Dưới", name: null, status: "available" },
      { g: 6, tier: "Trên", name: "S. Sơn", status: "occupied" },
    ],
  },
  {
    id: "D",
    label: "Buồng D",
    subtitle: "Main Hall Door · Cửa Ra Vào & WC",
    occupancy: "4/6",
    myComp: false,
    beds: [
      { g: 1, tier: "Dưới", name: "A. Hiến", status: "occupied" },
      { g: 2, tier: "Trên", name: "V. Khôi", status: "occupied" },
      { g: 3, tier: "Dưới", name: null, status: "available" },
      { g: 4, tier: "Trên", name: null, status: "available" },
      { g: 5, tier: "Dưới", name: "H. Phúc", status: "occupied" },
      { g: 6, tier: "Trên", name: "Q. Thắng", status: "occupied" },
    ],
  },
]

const CompartmentSlide: React.FC = () => {
  const { user } = useAuth()

  const userRoom = user?.dormitoryStatus?.room || "A205"
  const userBedCode = user?.dormitoryStatus?.bedCode || "A205-B-G03"
  const userComp = user?.dormitoryStatus?.compartment || "Buồng B (Balcony Wing)"
  const userCompId = userComp.includes("C")
    ? "C"
    : userComp.includes("A")
      ? "A"
      : userComp.includes("D")
        ? "D"
        : "B"

  const userSlotMatch = userBedCode.match(/G0?(\d)/i)
  const userSlot = userSlotMatch ? parseInt(userSlotMatch[1], 10) : 3

  const defaultCompIndex = Math.max(
    0,
    COMPARTMENTS.findIndex((c) => c.id === userCompId)
  )
  const [current, setCurrent] = useState(defaultCompIndex >= 0 ? defaultCompIndex : 1)

  const rawComp = COMPARTMENTS[current]
  const isMyComp = rawComp.id === userCompId

  // Dynamically update bed status and display name to match logged in student
  const dynamicBeds = rawComp.beds.map((bed) => {
    const isThisMine = isMyComp && bed.g === userSlot
    return {
      ...bed,
      status: isThisMine
        ? ("mine" as const)
        : bed.status === "mine"
          ? ("occupied" as const)
          : bed.status,
      name: isThisMine ? (user?.fullName || "Nguyễn Hoàng Vinh") : bed.name,
    }
  })

  const comp = {
    ...rawComp,
    myComp: isMyComp,
    beds: dynamicBeds,
  }

  const prev = () =>
    setCurrent((c) => (c - 1 + COMPARTMENTS.length) % COMPARTMENTS.length)
  const next = () => setCurrent((c) => (c + 1) % COMPARTMENTS.length)

  return (
    <div className="ui-card-interactive overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
        <div>
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
            <RollingText text={`Sơ Đồ Phân Bổ Giường Phòng ${userRoom}`} />
          </h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-primary" />
            <strong className="text-primary">Giường bạn</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-secondary/40" />
            <span className="text-muted-foreground">Đã ở</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded border border-accent bg-accent/20" />
            <span className="font-semibold text-foreground">Trống</span>
          </span>
        </div>
      </div>

      {/* Slide body */}
      <div className="relative p-3 sm:p-6">
        {/* Nav buttons */}
        <button
          onClick={prev}
          className="ui-btn-interactive absolute top-1/2 left-1 sm:left-2 z-10 flex h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={next}
          className="ui-btn-interactive absolute top-1/2 right-1 sm:right-2 z-10 flex h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Card */}
        <div
          className={`mx-0 sm:mx-8 space-y-3 sm:space-y-4 rounded-xl sm:rounded-2xl border p-3 sm:p-6 transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            comp.myComp
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border bg-muted/40"
          }`}
        >
          {/* Compartment header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-foreground sm:text-base lg:text-lg">
                  {comp.label}
                </span>
                {comp.myComp && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-primary-foreground">
                    BUỒNG CỦA BẠN
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground">
                {comp.subtitle}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-foreground sm:text-sm">
                {comp.occupancy} Giường
              </span>
            </div>
          </div>

          {/* Beds grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {comp.beds.map((bed) => {
              const isMine = bed.status === "mine"
              const isAvail = bed.status === "available"
              return (
                <div
                  key={bed.g}
                  className={`rounded-xl sm:rounded-2xl border p-2 sm:p-4 text-center transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isMine
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : isAvail
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border bg-card"
                  }`}
                >
                  <div
                    className={`mb-1 sm:mb-2 text-[10px] sm:text-xs font-bold ${
                      isMine
                        ? "text-primary-foreground/90"
                        : "text-muted-foreground"
                    }`}
                  >
                    G0{bed.g} · {bed.tier}
                  </div>
                  {isAvail ? (
                    <>
                      <BedDouble className="mx-auto mb-1 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <div className="text-[9px] sm:text-[10px] font-extrabold text-primary">
                        TRỐNG
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`truncate text-[11px] sm:text-xs font-bold sm:text-sm ${
                          isMine ? "text-primary-foreground font-black" : "text-foreground"
                        }`}
                        title={bed.name || ""}
                      >
                        {bed.name}
                      </div>
                      <div
                        className={`mt-0.5 text-[9px] sm:text-[10px] font-medium ${
                          isMine
                            ? "text-primary-foreground/90 font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isMine ? "Giường bạn · " + (bed.tier === "Dưới" ? "Tầng dưới" : "Tầng trên") : "Đã ở"}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {COMPARTMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                i === current
                  ? "h-2 w-6 bg-primary"
                  : "h-2 w-2 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>

        {/* Compartment label row */}
        <div className="mt-4 flex justify-center gap-2">
          {COMPARTMENTS.map((c, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`ui-btn-interactive cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold ${
                i === current
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{c.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export const MyRoomPage: React.FC = () => {
  const { user } = useAuth()
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)

  const userRoom = user?.dormitoryStatus?.room || "A205"
  const userBedCode = user?.dormitoryStatus?.bedCode || "A205-B-G03"
  const userComp = user?.dormitoryStatus?.compartment || "Buồng B (Balcony Wing)"
  const userCompId = userComp.includes("C")
    ? "C"
    : userComp.includes("A")
      ? "A"
      : userComp.includes("D")
        ? "D"
        : "B"

  const userSlotMatch = userBedCode.match(/G0?(\d)/i)
  const userSlot = userSlotMatch ? parseInt(userSlotMatch[1], 10) : 3
  const isUpper = userSlot % 2 === 0
  const userSlotLabel = `G0${userSlot}`

  const roommates = [
    {
      name: `${user?.fullName || "Nguyễn Hoàng Vinh"} (Bạn)`,
      mssv: user?.studentId || "SE182049",
      bed: `${userCompId}-${userSlotLabel} (${isUpper ? "Tầng trên" : "Tầng dưới"})`,
      major: user?.major || "Kỹ thuật phần mềm",
      phone: user?.phone || "0912 345 678",
      dutyDay: "Thứ Hai & Thứ Năm",
      isMe: true,
      avatar:
        user?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Trần Công Tiến",
      mssv: "SE183012",
      bed: "B-G01 (Tầng dưới)",
      major: "Thiết kế Đồ họa",
      phone: "0934 112 233",
      dutyDay: "Thứ Ba & Thứ Sáu",
      isMe: false,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Văn Thái Trung",
      mssv: "SE181954",
      bed: "B-G04 (Tầng trên)",
      major: "Khoa học Máy tính",
      phone: "0977 445 566",
      dutyDay: "Thứ Tư & Thứ Bảy",
      isMe: false,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Đinh Thanh Trung",
      mssv: "SE182881",
      bed: "B-G05 (Tầng dưới)",
      major: "An toàn thông tin",
      phone: "0988 990 011",
      dutyDay: "Chủ Nhật (Tổng vệ sinh)",
      isMe: false,
      avatar:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    },
  ]

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 sm:space-y-6 lg:space-y-8 pb-16">
      {/* 01. TOP UNIT SUMMARY & OPERATIONAL ACTION BAR */}
      <ScrollReveal className={showActionsDropdown ? "relative z-50" : "relative z-20"}>
        <div
          className={`ui-card-interactive relative flex flex-col justify-between gap-4 sm:gap-6 rounded-2xl border border-border bg-card p-4 sm:p-6 sm:p-8 shadow-xs xl:flex-row xl:items-center ${
            showActionsDropdown ? "z-50" : "z-20"
          }`}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-secondary text-secondary-foreground shadow-xs">
              <DoorClosed className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="space-y-1 sm:space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                  <RollingText text={`Phòng ${userRoom}`} />
                </h1>
                <span className="rounded-lg bg-secondary/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wider text-secondary uppercase">
                  {user?.dormitoryStatus?.building || "Khu A · Tầng 2"}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                <span className="font-bold text-foreground">
                  {userComp}
                </span>
                <span>•</span>
                <span className="font-bold text-primary">
                  Giường {userSlotLabel} ({isUpper ? "Tầng trên" : "Tầng dưới"})
                </span>
                <span>•</span>
                <span>Học kỳ Fall 2026 (Hết hạn: 15/01/2027)</span>
              </p>
            </div>
          </div>

          {/* Quick Action Dropdown Menu */}
          <div className="relative z-30 w-full xl:w-auto">
            <Button
              variant="secondary"
              onClick={() => setShowActionsDropdown(!showActionsDropdown)}
              className="gap-2 font-bold w-full xl:w-auto justify-center text-xs sm:text-sm h-10 sm:h-11"
            >
              <span>Thao tác & Tiện ích phòng</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  showActionsDropdown ? "rotate-180" : ""
                }`}
              />
            </Button>

            {showActionsDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowActionsDropdown(false)}
                />
                <div className="absolute right-0 left-0 sm:left-auto sm:right-0 z-50 mt-2 w-full sm:w-60 rounded-2xl border border-border bg-card p-2 shadow-2xl">
                  <button
                    onClick={() => {
                      setShowActionsDropdown(false)
                      setShowContractModal(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-foreground transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <span>Hợp Đồng (PDF)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowActionsDropdown(false)
                      setShowRenewModal(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-foreground transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted"
                  >
                    <CalendarCheck2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>Gia Hạn Hợp Đồng</span>
                  </button>

                  <Link
                    to="/billing"
                    onClick={() => setShowActionsDropdown(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-foreground transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted"
                  >
                    <Receipt className="h-4 w-4 shrink-0 text-secondary" />
                    <span>Hóa Đơn Điện Nước</span>
                  </Link>

                  <Link
                    to="/maintenance"
                    onClick={() => setShowActionsDropdown(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-foreground transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted"
                  >
                    <Wrench className="h-4 w-4 shrink-0 text-primary" />
                    <span>Báo Hỏng / Sửa Chữa</span>
                  </Link>

                  <div className="my-2 border-t border-border" />

                  <button
                    onClick={() => {
                      setShowActionsDropdown(false)
                      setShowCheckoutModal(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-destructive transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Yêu Cầu Trả Phòng</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* 02. ARCHITECTURAL BLUEPRINT — SLIDE CAROUSEL VISUALIZER */}
      <ScrollReveal delay={0.05} className="relative z-0">
        <CompartmentSlide />
      </ScrollReveal>

      {/* 03. ROOMMATES ROSTER */}
      <ScrollReveal className="relative z-0">
        <div className="ui-card-interactive space-y-4 sm:space-y-6 rounded-2xl border border-border bg-card p-4 sm:p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3 sm:pb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="rounded-xl bg-secondary/10 p-2 sm:p-2.5 text-secondary">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground sm:text-xl">
                  Danh Sách Bạn Cùng Buồng B
                </h3>
              </div>
            </div>
            <span className="text-xs font-bold text-muted-foreground sm:text-sm">
              4 Thành Viên
            </span>
          </div>

          <StaggerContainer
            staggerDelay={0.1}
            className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2"
          >
            {roommates.map((rm, idx) => (
              <StaggerItem key={idx}>
                <div
                  className={`ui-card-interactive flex h-full flex-col justify-between gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border p-3.5 sm:p-6 sm:flex-row sm:items-center ${
                    rm.isMe
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={rm.avatar}
                      alt={rm.name}
                      className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {rm.name}
                        </span>
                        {rm.isMe && (
                          <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            Bạn
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        MSSV: <strong className="font-mono">{rm.mssv}</strong> •
                        Giường:{" "}
                        <strong className="text-primary">{rm.bed}</strong>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {rm.major}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start justify-between border-t border-border pt-3 text-xs sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                    <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold whitespace-nowrap text-primary">
                      Trực nhật: {rm.dutyDay}
                    </span>
                    <span className="mt-1.5 font-mono text-xs whitespace-nowrap text-muted-foreground">
                      {rm.phone}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </ScrollReveal>

      {/* VIEW CONTRACT MODAL */}
      {user && (
        <StudentContractModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          user={user}
        />
      )}

      {/* CONTRACT RENEWAL MODAL */}
      {user && (
        <ContractRenewalModal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          user={user}
        />
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs fade-in">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">
                Quy Trình Trả Phòng & Bàn Giao Thiết Bị
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <p className="leading-relaxed text-muted-foreground">
                Khi sinh viên gửi yêu cầu trả phòng:
              </p>
              <ul className="list-disc space-y-2 pl-4 text-xs text-muted-foreground">
                <li>
                  Cán bộ KTX sẽ kiểm tra hiện trạng thiết bị và chỉ số công tơ
                  cuối cùng.
                </li>
                <li>
                  Ký túc xá không thu tiền đặt cọc. Thủ tục trả phòng hoàn tất
                  ngay sau khi bạn bàn giao chìa khóa và buồng phòng nguyên
                  trạng cho BQL KTX.
                </li>
              </ul>

              <div className="flex gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 text-xs"
                >
                  <span>Hủy</span>
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    alert("Yêu cầu trả phòng đã được gửi tới Ban Quản lý KTX!")
                    setShowCheckoutModal(false)
                  }}
                  className="flex-1 text-xs font-bold"
                >
                  <span>Gửi Yêu Cầu Trả Phòng</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
