import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { ContractRenewalModal } from "@/components/contract/ContractRenewalModal"
import { Button } from "@/components/ui/button"
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
    id: "A", label: "Buồng A", subtitle: "Window Bay · Hướng Đông",
    occupancy: "5/6", myComp: false,
    beds: [
      { g: 1, tier: "Dưới", name: "H. Long",   status: "occupied" },
      { g: 2, tier: "Trên", name: "T. Tuấn",  status: "occupied" },
      { g: 3, tier: "Dưới", name: null,        status: "available" },
      { g: 4, tier: "Trên", name: "P. Quang", status: "occupied" },
      { g: 5, tier: "Dưới", name: "Đ. Khoa",  status: "occupied" },
      { g: 6, tier: "Trên", name: "M. Đức",   status: "occupied" },
    ],
  },
  {
    id: "B", label: "Buồng B", subtitle: "Balcony Wing · Ban Công",
    occupancy: "5/6", myComp: true,
    beds: [
      { g: 1, tier: "Dưới", name: "B. Trần",  status: "occupied" },
      { g: 2, tier: "Trên", name: "L. Nam",   status: "occupied" },
      { g: 3, tier: "Dưới", name: "Vinh",     status: "mine" },
      { g: 4, tier: "Trên", name: "V. Thanh", status: "occupied" },
      { g: 5, tier: "Dưới", name: "N. Huy",   status: "occupied" },
      { g: 6, tier: "Trên", name: null,        status: "available" },
    ],
  },
  {
    id: "C", label: "Buồng C", subtitle: "Study Hub · Góc Tự Học",
    occupancy: "4/6", myComp: false,
    beds: [
      { g: 1, tier: "Dưới", name: "K. Minh",  status: "occupied" },
      { g: 2, tier: "Trên", name: null,        status: "available" },
      { g: 3, tier: "Dưới", name: "P. Linh",  status: "occupied" },
      { g: 4, tier: "Trên", name: "T. Dung",  status: "occupied" },
      { g: 5, tier: "Dưới", name: null,        status: "available" },
      { g: 6, tier: "Trên", name: "S. Sơn",   status: "occupied" },
    ],
  },
  {
    id: "D", label: "Buồng D", subtitle: "Main Hall Door · Cửa Ra Vào & WC",
    occupancy: "4/6", myComp: false,
    beds: [
      { g: 1, tier: "Dưới", name: "A. Hiến",  status: "occupied" },
      { g: 2, tier: "Trên", name: "V. Khôi",  status: "occupied" },
      { g: 3, tier: "Dưới", name: null,        status: "available" },
      { g: 4, tier: "Trên", name: null,        status: "available" },
      { g: 5, tier: "Dưới", name: "H. Phúc",  status: "occupied" },
      { g: 6, tier: "Trên", name: "Q. Thắng", status: "occupied" },
    ],
  },
]

const CompartmentSlide: React.FC = () => {
  const [current, setCurrent] = useState(1) // default: Buồng B (index 1)

  const comp = COMPARTMENTS[current]
  const prev = () => setCurrent((c) => (c - 1 + COMPARTMENTS.length) % COMPARTMENTS.length)
  const next = () => setCurrent((c) => (c + 1) % COMPARTMENTS.length)

  return (
    <div className="bg-white dark:bg-[#161e23] border border-border rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
        <div>
          <h2 className="font-bold text-sm text-foreground">Sơ Đồ Phân Bổ Giường Phòng A205</h2>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>
            <strong className="text-primary dark:text-[#cee6ef]">Giường bạn</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600"></span>
            <span>Đã ở</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
            <span>Trống</span>
          </span>
        </div>
      </div>

      {/* Slide body */}
      <div className="relative px-5 py-5">
        {/* Nav buttons */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1c262c] border border-border shadow-sm flex items-center justify-center hover:bg-[#eff6ff] dark:hover:bg-[#283740] transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1c262c] border border-border shadow-sm flex items-center justify-center hover:bg-[#eff6ff] dark:hover:bg-[#283740] transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Card */}
        <div className={`mx-8 rounded-xl border p-4 space-y-4 transition-all ${
          comp.myComp
            ? "bg-primary/5 border-primary ring-1 ring-primary"
            : "bg-[#eff6ff] dark:bg-[#1c262c] border-border"
        }`}>
          {/* Compartment header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-foreground">{comp.label}</span>
                {comp.myComp && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">BUỒNG CỦA BẠN</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{comp.subtitle}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-foreground">{comp.occupancy} Giường</span>
            </div>
          </div>

          {/* Beds grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {comp.beds.map((bed) => {
              const isMine = bed.status === "mine"
              const isAvail = bed.status === "available"
              return (
                <div
                  key={bed.g}
                  className={`rounded-xl p-3 text-center border transition-all ${
                    isMine
                      ? "bg-primary text-white border-primary shadow-md"
                      : isAvail
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                      : "bg-white dark:bg-[#161e23] border-border"
                  }`}
                >
                  <div className={`text-[10px] font-bold mb-1.5 ${
                    isMine ? "text-white/80" : "text-muted-foreground"
                  }`}>
                    G0{bed.g} · {bed.tier}
                  </div>
                  {isAvail ? (
                    <>
                      <BedDouble className="h-5 w-5 mx-auto text-emerald-500 mb-0.5" />
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">TRỐNG</div>
                    </>
                  ) : (
                    <>
                      <div className={`text-xs font-bold truncate ${
                        isMine ? "text-white" : "text-foreground"
                      }`}>
                        {bed.name}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${
                        isMine ? "text-white/70" : "text-muted-foreground"
                      }`}>
                        {isMine ? "Tầng dưới" : "Đã ở"}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {COMPARTMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all rounded-full ${
                i === current
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>

        {/* Compartment label row */}
        <div className="flex justify-center gap-1.5 mt-3">
          {COMPARTMENTS.map((c, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                i === current
                  ? "bg-primary text-white"
                  : "bg-[#eff6ff] dark:bg-[#1c262c] text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.id}
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

  const roommates = [
    {
      name: "Nguyễn Hoàng Vinh (Bạn)",
      mssv: user?.studentId || "SE182049",
      bed: "B-G03 (Tầng dưới)",
      major: "Kỹ thuật phần mềm",
      phone: "0912 345 678",
      dutyDay: "Thứ Hai & Thứ Năm",
      isMe: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Trần Công Tiến",
      mssv: "SE183012",
      bed: "B-G01 (Tầng dưới)",
      major: "Thiết kế Đồ họa",
      phone: "0934 112 233",
      dutyDay: "Thứ Ba & Thứ Sáu",
      isMe: false,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Văn Thái Trung",
      mssv: "SE181954",
      bed: "B-G04 (Tầng trên)",
      major: "Khoa học Máy tính",
      phone: "0977 445 566",
      dutyDay: "Thứ Tư & Thứ Bảy",
      isMe: false,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Đinh Thanh Trung",
      mssv: "SE182881",
      bed: "B-G05 (Tầng dưới)",
      major: "An toàn thông tin",
      phone: "0988 990 011",
      dutyDay: "Chủ Nhật (Tổng vệ sinh)",
      isMe: false,
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    },
  ]

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-12">
      {/* 01. TOP UNIT SUMMARY & OPERATIONAL ACTION BAR */}
      <div className="bg-white dark:bg-[#161e23] border border-border rounded-xl p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
            <DoorClosed className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-primary dark:text-[#cee6ef] tracking-tight">
                Phòng A205
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-[#eff6ff] dark:bg-[#1c262c]">
                Khu A · Tầng 2
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-foreground">Buồng B (Balcony Wing)</span>
              <span>•</span>
              <span className="font-semibold text-primary dark:text-[#cee6ef]">Giường G03 (Tầng dưới)</span>
              <span>•</span>
              <span>Học kỳ 1 Năm học 2026–2027 (Hết hạn: 15/01/2027)</span>
            </p>
          </div>
        </div>

        {/* Quick Action Dropdown Menu */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
            className="text-xs h-9 gap-2 font-semibold bg-[#eff6ff] dark:bg-[#1c262c] text-primary dark:text-[#cee6ef] border-border hover:bg-primary/10 transition-colors"
          >
            <span>Thao tác & Tiện ích phòng</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
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
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-white p-1.5 shadow-xl dark:bg-[#1c262c]">
                <button
                  onClick={() => {
                    setShowActionsDropdown(false)
                    alert("Đang mở bản xem trước Hợp đồng điện tử e-Contract PDF...")
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-[#283740]"
                >
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span>Hợp Đồng (PDF)</span>
                </button>

                <button
                  onClick={() => {
                    setShowActionsDropdown(false)
                    setShowRenewModal(true)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-[#283740]"
                >
                  <CalendarCheck2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Gia Hạn Hợp Đồng</span>
                </button>

                <Link
                  to="/billing"
                  onClick={() => setShowActionsDropdown(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-[#283740]"
                >
                  <Receipt className="h-4 w-4 text-primary shrink-0" />
                  <span>Hóa Đơn Điện Nước</span>
                </Link>

                <Link
                  to="/maintenance"
                  onClick={() => setShowActionsDropdown(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-[#283740]"
                >
                  <Wrench className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Báo Hỏng / Sửa Chữa</span>
                </Link>

                <div className="my-1 border-t border-border" />

                <button
                  onClick={() => {
                    setShowActionsDropdown(false)
                    setShowCheckoutModal(true)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Yêu Cầu Trả Phòng</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 02. ARCHITECTURAL BLUEPRINT — SLIDE CAROUSEL VISUALIZER */}
      <CompartmentSlide />

      {/* 03. ROOMMATES ROSTER */}
      <div className="bg-white dark:bg-[#161e23] border border-border rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-foreground">
                Danh Sách Bạn Cùng Buồng B
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">4 Thành Viên</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roommates.map((rm, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${
                rm.isMe
                  ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-xs"
                  : "bg-[#eff6ff] dark:bg-[#1c262c] border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={rm.avatar}
                  alt={rm.name}
                  className="w-11 h-11 rounded-full object-cover border border-border shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{rm.name}</span>
                    {rm.isMe && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-white font-semibold">
                        Bạn
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    MSSV: <strong className="font-mono">{rm.mssv}</strong> • Giường:{" "}
                    <strong className="text-primary dark:text-[#cee6ef]">{rm.bed}</strong>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{rm.major}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-border text-xs shrink-0">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                  Trực nhật: {rm.dutyDay}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground mt-1 whitespace-nowrap">
                  {rm.phone}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#161e23] border border-border w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Quy Trình Trả Phòng & Bàn Giao Thiết Bị
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Khi sinh viên gửi yêu cầu trả phòng:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                <li>Cán bộ KTX sẽ kiểm tra hiện trạng thiết bị và chỉ số công tơ cuối cùng.</li>
                <li>Ký túc xá không thu tiền đặt cọc. Thủ tục trả phòng hoàn tất ngay sau khi bạn bàn giao chìa khóa và buồng phòng nguyên trạng cho BQL KTX.</li>
              </ul>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    alert("Yêu cầu trả phòng đã được gửi tới Ban Quản lý KTX!")
                    setShowCheckoutModal(false)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Gửi Yêu Cầu Trả Phòng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
