import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  DoorClosed,
  FileText,
  Receipt,
  Wrench,
  LogOut,
  Users,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  BedDouble,
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
          <p className="text-[11px] text-muted-foreground">Vuốt qua từng buồng để xem trạng thái giường</p>
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
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1c262c] border border-border shadow-sm flex items-center justify-center hover:bg-[#f4f4ee] dark:hover:bg-[#283740] transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-[#1c262c] border border-border shadow-sm flex items-center justify-center hover:bg-[#f4f4ee] dark:hover:bg-[#283740] transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Card */}
        <div className={`mx-8 rounded-xl border p-4 space-y-4 transition-all ${
          comp.myComp
            ? "bg-primary/5 border-primary ring-1 ring-primary"
            : "bg-[#f4f4ee] dark:bg-[#1c262c] border-border"
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
          {COMPARTMENTS.map((c, i) => (
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
                  : "bg-[#f4f4ee] dark:bg-[#1c262c] text-muted-foreground hover:text-foreground"
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
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

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

  const inventoryItems = [
    { name: "Khung giường tầng & Thang leo", status: "Tốt", checked: true, note: "Chắc chắn, không rỉ sét" },
    { name: "Đệm Foam Orthopedic 1.0m x 2.0m", status: "Tốt", checked: true, note: "Bọc ga mới nguyên vẹn" },
    { name: "Bàn học & Giá sách cá nhân", status: "Tốt", checked: true, note: "Đèn bàn LED cảm ứng hoạt động" },
    { name: "Tủ Locker cá nhân kèm khóa số", status: "Tốt", checked: true, note: "Đã reset mã PIN mặc định" },
    { name: "Thẻ từ ra vào phòng A205", status: "Đã cấp", checked: true, note: "Quẹt nhận phòng ngày 05/09" },
    { name: "Điều hòa Inverter Daikin 2HP", status: "Tốt", checked: true, note: "Remote để tại giá treo cửa" },
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-[#f4f4ee] dark:bg-[#1c262c]">
                Khu A · Tầng 2
              </span>
              <Badge variant="available" dot>
                Đang Lưu Trú (Active)
              </Badge>
              <Badge variant="secondary">Sinh viên Chính quy K19</Badge>
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

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => alert("Đang mở bản xem trước Hợp đồng điện tử e-Contract PDF...")}
            className="text-xs h-9 gap-1.5 bg-[#f4f4ee] dark:bg-[#1c262c] whitespace-nowrap shrink-0"
          >
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span>Hợp Đồng (PDF)</span>
          </Button>

          <Link to="/billing">
            <Button
              variant="outline"
              className="text-xs h-9 gap-1.5 bg-[#f4f4ee] dark:bg-[#1c262c] whitespace-nowrap shrink-0"
            >
              <Receipt className="h-4 w-4 text-primary shrink-0" />
              <span>Hóa Đơn Điện Nước</span>
            </Button>
          </Link>

          <Link to="/maintenance">
            <Button className="text-xs h-9 gap-1.5 bg-primary text-white whitespace-nowrap shrink-0">
              <Wrench className="h-4 w-4 shrink-0" />
              <span>Báo Hỏng / Sửa Chữa</span>
            </Button>
          </Link>

          <Button
            onClick={() => setShowCheckoutModal(true)}
            className="text-xs h-9 gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 whitespace-nowrap shrink-0"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Yêu Cầu Trả Phòng</span>
          </Button>
        </div>
      </div>

      {/* 02. ARCHITECTURAL BLUEPRINT — SLIDE CAROUSEL VISUALIZER */}
      <CompartmentSlide />

      {/* 03. TWO-COLUMN: ROOMMATES ROSTER & DIGITAL HANDOVER CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ROOMMATES ROSTER (7 COLS) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161e23] border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Danh Sách Bạn Cùng Buồng B (Roommates Manifest)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Thông tin liên hệ & Lịch trực nhật vệ sinh buồng cá nhân
                </p>
              </div>
            </div>
            <Badge variant="available">4 Thành Viên</Badge>
          </div>

          <div className="space-y-3">
            {roommates.map((rm, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  rm.isMe
                    ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                    : "bg-[#f4f4ee] dark:bg-[#1c262c] border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rm.avatar}
                    alt={rm.name}
                    className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">{rm.name}</span>
                      {rm.isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary text-white font-semibold">
                          Bạn
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
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

        {/* DIGITAL HANDOVER & AMENITIES CHECKLIST (5 COLS - UC-14 & UC-15) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161e23] border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckSquare className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Biên Bản Bàn Giao Thiết Bị (UC-14)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Nghiệm thu tài sản khi nhận phòng & hoàn cọc
                </p>
              </div>
            </div>
            <Badge variant="available">Đã Ký Số</Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            {inventoryItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#f4f4ee] dark:bg-[#1c262c] border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground block">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">{item.note}</span>
                  </div>
                </div>
                <Badge variant="available">{item.status}</Badge>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <Button
              onClick={() => setShowHandoverModal(true)}
              variant="outline"
              className="w-full text-xs font-semibold h-9.5 gap-2 text-slate-800 dark:text-slate-100 hover:text-primary dark:hover:text-primary bg-slate-50/50 dark:bg-slate-800/40 border-border hover:border-primary/50 transition-all shadow-xs"
            >
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap truncate">Xem biên bản nghiệm thu & ảnh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* HANDOVER DETAILS MODAL */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#161e23] border border-border w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Biên Bản Bàn Giao & Hiện Trạng Thiết Bị Số Hóa
              </h3>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Biên bản được lập tự động vào ngày <strong>05/09/2026</strong> giữa Ban Quản lý KTX và sinh viên{" "}
                <strong>{user?.fullName || "Nguyễn Hoàng Vinh"}</strong>. Mọi tài sản hỏng hóc trong thời gian lưu trú cần báo ngay qua mục Báo Hỏng.
              </p>

              <div className="p-3 bg-[#f4f4ee] dark:bg-[#1c262c] rounded-xl space-y-1 font-mono text-[11px]">
                <div>Mã biên bản: BB-2026-A205-0905</div>
                <div>Chỉ số điện ban đầu: 12,450 kWh</div>
                <div>Chỉ số nước ban đầu: 840 m³</div>
                <div>Tình trạng tiền cọc: 1,000,000 VNĐ (Đang giữ tại quỹ)</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => alert("Đã tải biên bản bàn giao PDF!")}
                  className="flex-1 bg-primary text-white text-xs font-bold"
                >
                  Tải Bản PDF Có Chữ Ký Số
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowHandoverModal(false)}
                  className="text-xs"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL (UC-15) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#161e23] border border-border w-full max-w-md rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Quy Trình Trả Phòng & Quyết Toán Hoàn Cọc (UC-15)
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
                <li>Nếu không có hư hại, <strong>100% tiền cọc (1,000,000 VNĐ)</strong> sẽ được hoàn trả tự động vào tài khoản ngân hàng của sinh viên trong 48 giờ.</li>
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
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
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
