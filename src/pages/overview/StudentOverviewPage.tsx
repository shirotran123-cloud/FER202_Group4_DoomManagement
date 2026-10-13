import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { AdminOverviewView } from "./AdminOverviewView"

export const StudentOverviewPage: React.FC = () => {
  const { user } = useAuth()

  // Nếu là Quản trị viên (Admin) hoặc Quản lý (Manager), hiển thị trang Overview Quản trị:
  // Không có thông tin phòng riêng hay nộp đơn cho bản thân, mà xem danh sách sinh viên và các yêu cầu/đơn từ
  if (user?.role === "admin" || user?.role === "manager") {
    return <AdminOverviewView />
  }
  const [qrCountdown, setQrCountdown] = useState(15)
  const [showGateQrModal, setShowGateQrModal] = useState(false)

  // QR countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown((prev) => (prev <= 1 ? 15 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#f4f4ee] border border-[#efeee8] p-6 sm:p-8 shadow-xs">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#cee6ef]/40 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-[#3a505b]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-sm">verified</span>
                Verified Resident
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">meeting_room</span>
                Room A205 · Compartment B · Bed G03
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono border border-slate-200">
                RFID: 8492-AX-01
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1b1c19] tracking-tight flex items-center gap-2">
                Chào buổi sáng, {user?.fullName || "Nguyễn Hoàng Vinh"}{" "}
                <span className="inline-block animate-bounce text-2xl">👋</span>
              </h1>
              <p className="text-sm text-[#42474b] mt-1">
                Ký túc xá FPT University · Học kỳ Fall 2026 · Tòa A (High-Rise Hall)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
            <button
              onClick={() => setShowGateQrModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#efeee8] text-[#1b1c19] text-xs font-semibold flex items-center gap-2 shadow-xs border border-[#efeee8] transition-all"
            >
              <span className="material-symbols-outlined text-base">qr_code_2</span>
              <span>Mã Cửa Ra Vào</span>
            </button>

            <Link
              to="/billing"
              className="px-5 py-2.5 rounded-xl bg-[#233944] hover:bg-[#3a505b] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>VietQR Quickpay</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Current Room */}
        <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-[#efeee8] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-wider text-[#73787b] font-bold">
                Phòng Hiện Tại
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <span className="material-symbols-outlined text-base">domain</span>
              </div>
            </div>
            <div className="text-lg font-bold text-[#1b1c19]">Tòa A · Tầng 2 · A205</div>
            <div className="text-xs text-[#42474b] mt-1">Buồng B · Giường tầng dưới G03</div>
          </div>

          <div className="mt-5 pt-3 space-y-2 bg-[#f4f4ee]/70 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[#42474b] whitespace-nowrap">Hợp đồng:</span>
              <span className="font-semibold text-emerald-600 truncate text-right">Hiệu lực (Kỳ 1)</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[#42474b] whitespace-nowrap">Mật độ phòng:</span>
              <span className="font-bold text-[#233944] whitespace-nowrap">18 / 24 Giường</span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Ledger */}
        <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-[#efeee8] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-wider text-[#73787b] font-bold">
                Công Nợ Tháng 09
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
                <span className="material-symbols-outlined text-base">receipt_long</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-[#1b1c19] tracking-tight">₫420,000</div>
              <span className="text-xs text-[#73787b] font-semibold">VND</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-xs mt-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
              Hạn nộp: Còn 3 ngày (05/10)
            </div>
          </div>

          <div className="mt-5">
            <Link
              to="/billing"
              className="w-full py-2.5 px-4 rounded-lg bg-[#233944] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#3a505b] transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-base">payments</span>
              <span>Thanh Toán VietQR</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Maintenance */}
        <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-[#efeee8] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-wider text-[#73787b] font-bold">
                Bảo Trì Kỹ Thuật
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#e9e8e3] flex items-center justify-center text-[#42474b]">
                <span className="material-symbols-outlined text-base">build</span>
              </div>
            </div>
            <div className="text-lg font-bold text-[#1b1c19]">2 Yêu Cầu Đang Xử Lý</div>
            <div className="text-xs text-[#ba1a1a] font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">warning</span>
              1 Khẩn: Ổ cắm buồng B-G03
            </div>
          </div>

          <div className="mt-5 bg-[#f4f4ee]/70 rounded-lg p-3">
            <div className="text-[10px] uppercase text-[#73787b] tracking-wider font-bold">Trạng thái</div>
            <div className="text-xs font-semibold text-[#1b1c19] mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4c6269]"></span>
              Kỹ thuật viên: Nguyễn Văn An
            </div>
            <div className="text-[11px] text-[#73787b] mt-0.5">Lịch hẹn: Hôm nay 14:30</div>
          </div>
        </div>

        {/* Card 4: Night Curfew Policy */}
        <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-[#efeee8] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-wider text-[#73787b] font-bold">
                Giờ Giới Nghiêm
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#cee6ef]/50 flex items-center justify-center text-[#4c6269]">
                <span className="material-symbols-outlined text-base">lock_clock</span>
              </div>
            </div>
            <div className="text-lg font-bold text-[#1b1c19]">23:00 Khóa Cổng Trục Xoay</div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs mt-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Đã điểm danh / Trong phòng
            </div>
          </div>

          <div className="mt-5">
            <Link
              to="/curfew"
              className="w-full py-2.5 px-4 rounded-lg bg-[#f4f4ee] hover:bg-[#e9e8e3] text-[#1b1c19] text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#efeee8]"
            >
              <span className="material-symbols-outlined text-base">more_time</span>
              <span>Nộp Đơn Về Muộn</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Desktop 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Current Room Occupancy Blueprint Card */}
          <div className="rounded-xl bg-white p-6 sm:p-7 shadow-xs border border-[#efeee8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#1b1c19]">
                    Sơ Đồ Phân Bổ Giường Phòng A205
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#efeee8] text-[#1b1c19] text-[11px] font-semibold">
                    Chuẩn Mô Hình 24B
                  </span>
                </div>
                <p className="text-xs text-[#73787b] mt-1">
                  4 Buồng riêng (A, B, C, D) · 6 Giường/buồng · 18 Đã ở, 6 Giường trống
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 bg-[#f4f4ee] px-3 py-1.5 rounded-lg text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#233944]" />
                  <span className="font-semibold text-[#1b1c19]">Giường bạn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#e3e3dd]" />
                  <span className="text-[#42474b]">Đã ở</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#cee6ef] border border-[#b3cad3]" />
                  <span className="text-emerald-700 font-semibold">Trống</span>
                </div>
              </div>
            </div>

            {/* 4-Compartment Blueprint Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Compartment A */}
              <div className="p-4 rounded-xl bg-[#f4f4ee]/70 border border-[#efeee8] space-y-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-[#1b1c19] whitespace-nowrap shrink-0">Buồng A</span>
                    <span className="text-[11px] text-[#73787b] whitespace-nowrap truncate">Hướng Ban Công</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#e9e8e3] text-[#1b1c19] font-semibold whitespace-nowrap shrink-0">
                    5/6 Giường
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G01 · Dưới</span>
                    <span className="text-[11px] text-[#42474b] truncate">H. Long</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G02 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">T. Tuấn</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 flex flex-col justify-between h-16 border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-[11px]">G03 · Dưới</span>
                    <span className="material-symbols-outlined text-sm mx-auto">bed</span>
                    <span className="text-[9px] font-bold text-emerald-700">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G04 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">P. Quang</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G05 · Dưới</span>
                    <span className="text-[11px] text-[#42474b] truncate">Đ. Khoa</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G06 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">M. Đức</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                </div>
              </div>

              {/* Compartment B (User's Compartment) */}
              <div className="p-4 rounded-xl bg-[#f4f4ee] border-2 border-[#233944]/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between gap-1.5 relative z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-[#1b1c19] whitespace-nowrap shrink-0">Buồng B</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#233944] text-white font-bold whitespace-nowrap shrink-0">
                      BUỒNG CỦA BẠN
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#e9e8e3] text-[#1b1c19] font-semibold whitespace-nowrap shrink-0">
                    5/6 Giường
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs relative z-10">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G01 · Dưới</span>
                    <span className="text-[11px] text-[#42474b] truncate">B. Trần</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G02 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">L. Nam</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  {/* Assigned Bed for User */}
                  <div className="p-2 rounded-lg bg-[#233944] text-white flex flex-col justify-between h-16 shadow-md ring-2 ring-[#3a505b]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">G03</span>
                      <span className="px-1 py-0.2 rounded bg-[#cee6ef] text-[#233944] text-[8px] font-extrabold">
                        BẠN
                      </span>
                    </div>
                    <span className="font-bold text-[10px] truncate text-[#cee6ef]">
                      {user?.fullName?.split(" ").slice(-1)[0] || "Vinh"}
                    </span>
                    <span className="text-[9px] text-[#bac9cd]">Tầng dưới</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G04 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">V. Thanh</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G05 · Dưới</span>
                    <span className="text-[11px] text-[#42474b] truncate">N. Huy</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 flex flex-col justify-between h-16 border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-[11px]">G06 · Trên</span>
                    <span className="material-symbols-outlined text-sm mx-auto">bed</span>
                    <span className="text-[9px] font-bold text-emerald-700">TRỐNG</span>
                  </div>
                </div>
              </div>

              {/* Compartment C */}
              <div className="p-4 rounded-xl bg-[#f4f4ee]/70 border border-[#efeee8] space-y-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-[#1b1c19] whitespace-nowrap shrink-0">Buồng C</span>
                    <span className="text-[11px] text-[#73787b] whitespace-nowrap truncate">Góc Tự Học</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#e9e8e3] text-[#1b1c19] font-semibold whitespace-nowrap shrink-0">
                    4/6 Giường
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G01 · Dưới</span>
                    <span className="text-[11px] text-[#42474b] truncate">K. Minh</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 flex flex-col justify-between h-16 border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-[11px]">G02 · Trên</span>
                    <span className="material-symbols-outlined text-sm mx-auto">bed</span>
                    <span className="text-[9px] font-bold text-emerald-700">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G03 · Dưới</span>
                    <span className="text-[11px] text-[#42474b] truncate">P. Linh</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G04 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">T. Dung</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 flex flex-col justify-between h-16 border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-[11px]">G05 · Dưới</span>
                    <span className="material-symbols-outlined text-sm mx-auto">bed</span>
                    <span className="text-[9px] font-bold text-emerald-700">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G06 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">S. Sơn</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                </div>
              </div>

              {/* Compartment D */}
              <div className="p-4 rounded-xl bg-[#f4f4ee]/70 border border-[#efeee8] space-y-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-[#1b1c19] whitespace-nowrap shrink-0">Buồng D</span>
                    <span className="text-[11px] text-[#73787b] whitespace-nowrap truncate">Cửa Ra Vào & WC</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#e9e8e3] text-[#1b1c19] font-semibold whitespace-nowrap shrink-0">
                    4/6 Giường
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G01 · Dưới</span>
                    <span className="text-[11px] text-[#42474b] truncate">A. Hiền</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G02 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">V. Khôi</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 flex flex-col justify-between h-16 border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-[11px]">G03 · Dưới</span>
                    <span className="material-symbols-outlined text-sm mx-auto">bed</span>
                    <span className="text-[9px] font-bold text-emerald-700">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 flex flex-col justify-between h-16 border border-emerald-200 shadow-2xs">
                    <span className="font-bold text-[11px]">G04 · Trên</span>
                    <span className="material-symbols-outlined text-sm mx-auto">bed</span>
                    <span className="text-[9px] font-bold text-emerald-700">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G05 · Dưới</span>
                    <span className="text-[11px] text-[#42474b] truncate">H. Phúc</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex flex-col justify-between h-16">
                    <span className="font-bold text-[#1b1c19]">G06 · Trên</span>
                    <span className="text-[11px] text-[#42474b] truncate">Q. Thắng</span>
                    <span className="text-[9px] text-[#73787b]">Đã ở</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Facilities Specs Footer */}
            <div className="mt-6 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#f4f4ee]/60 rounded-xl p-4 border border-[#efeee8]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#73787b]">wifi</span>
                <div>
                  <div className="text-[10px] text-[#73787b] uppercase font-bold">Hall Wi-Fi</div>
                  <div className="text-xs font-bold text-[#1b1c19]">KTX-A205-5G</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#73787b]">ac_unit</span>
                <div>
                  <div className="text-[10px] text-[#73787b] uppercase font-bold">Điều Hòa</div>
                  <div className="text-xs font-bold text-[#1b1c19]">Daikin Inverter 2HP</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#73787b]">shower</span>
                <div>
                  <div className="text-[10px] text-[#73787b] uppercase font-bold">Phòng Tắm</div>
                  <div className="text-xs font-bold text-[#1b1c19]">2 Nhà Tắm Khép Kín</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#73787b]">local_laundry_service</span>
                <div>
                  <div className="text-[10px] text-[#73787b] uppercase font-bold">Khu Giặt Ủi</div>
                  <div className="text-xs font-bold text-[#1b1c19]">Sảnh 2F Phía Đông</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Operations Bar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1b1c19]">Thao Tác Nhanh (Quick Actions)</h2>
              <span className="text-xs text-[#73787b]">Dịch vụ sinh viên thường dùng</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Link
                to="/maintenance"
                className="p-4 rounded-xl bg-white hover:bg-[#f4f4ee] transition-all border border-[#efeee8] shadow-xs group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#f4f4ee] flex items-center justify-center text-[#233944] group-hover:bg-[#233944] group-hover:text-white transition-colors mb-3">
                  <span className="material-symbols-outlined text-xl">build</span>
                </div>
                <div className="text-xs font-bold text-[#1b1c19]">Báo Hỏng Thiết Bị</div>
                <div className="text-[11px] text-[#73787b] mt-1">Báo sửa điện, điều hòa, nước</div>
              </Link>

              <Link
                to="/curfew"
                className="p-4 rounded-xl bg-white hover:bg-[#f4f4ee] transition-all border border-[#efeee8] shadow-xs group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#f4f4ee] flex items-center justify-center text-[#233944] group-hover:bg-[#233944] group-hover:text-white transition-colors mb-3">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                </div>
                <div className="text-xs font-bold text-[#1b1c19]">Xin Giấy Về Muộn</div>
                <div className="text-[11px] text-[#73787b] mt-1">Nộp đơn ra vào sau 23:00</div>
              </Link>

              <Link
                to="/my-room"
                className="p-4 rounded-xl bg-white hover:bg-[#f4f4ee] transition-all border border-[#efeee8] shadow-xs group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#f4f4ee] flex items-center justify-center text-[#233944] group-hover:bg-[#233944] group-hover:text-white transition-colors mb-3">
                  <span className="material-symbols-outlined text-xl">assignment</span>
                </div>
                <div className="text-xs font-bold text-[#1b1c19]">Biên Bản Bàn Giao</div>
                <div className="text-[11px] text-[#73787b] mt-1">Kiểm tra tài sản và hoàn cọc</div>
              </Link>

              <Link
                to="/my-room"
                className="p-4 rounded-xl bg-white hover:bg-[#f4f4ee] transition-all border border-[#efeee8] shadow-xs group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#f4f4ee] flex items-center justify-center text-[#233944] group-hover:bg-[#233944] group-hover:text-white transition-colors mb-3">
                  <span className="material-symbols-outlined text-xl">group</span>
                </div>
                <div className="text-xs font-bold text-[#1b1c19]">Danh Bạ Cùng Buồng</div>
                <div className="text-[11px] text-[#73787b] mt-1">Liên hệ 5 bạn cùng buồng B</div>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          {/* Digital Key & Turnstile Gate QR Widget */}
          <div className="rounded-xl bg-[#233944] text-[#cee6ef] p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-[#3a505b]/40 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#cee6ef]">nfc</span>
                  <span className="text-[11px] uppercase tracking-wider text-[#bac9cd] font-bold">
                    Cổng Kiểm Soát Tòa A
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#cee6ef]/20 text-[#cee6ef] font-bold">
                  Dynamic NFC
                </span>
              </div>

              <div className="bg-white rounded-xl p-5 text-[#1b1c19] flex flex-col items-center shadow-xs">
                {/* Simulated QR Code */}
                <div className="w-44 h-44 bg-[#f4f4ee] rounded-lg p-3 flex flex-col items-center justify-center relative border border-[#efeee8]">
                  <svg className="w-full h-full text-[#233944]" fill="none" viewBox="0 0 100 100">
                    <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="5"></rect>
                    <rect fill="white" height="18" rx="2" width="18" x="10" y="10"></rect>
                    <rect fill="currentColor" height="10" width="10" x="14" y="14"></rect>
                    <rect fill="currentColor" height="28" rx="4" width="28" x="67" y="5"></rect>
                    <rect fill="white" height="18" rx="2" width="18" x="72" y="10"></rect>
                    <rect fill="currentColor" height="10" width="10" x="76" y="14"></rect>
                    <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="67"></rect>
                    <rect fill="white" height="18" rx="2" width="18" x="10" y="72"></rect>
                    <rect fill="currentColor" height="10" width="10" x="14" y="76"></rect>
                    <circle cx="48" cy="20" fill="currentColor" r="3"></circle>
                    <circle cx="48" cy="32" fill="currentColor" r="3"></circle>
                    <circle cx="56" cy="20" fill="currentColor" r="3"></circle>
                    <circle cx="42" cy="48" fill="currentColor" r="4"></circle>
                    <circle cx="58" cy="48" fill="currentColor" r="3"></circle>
                    <rect fill="currentColor" height="6" rx="2" width="12" x="44" y="64"></rect>
                    <rect fill="currentColor" height="16" rx="2" width="8" x="70" y="50"></rect>
                    <rect fill="currentColor" height="10" rx="2" width="10" x="82" y="70"></rect>
                    <rect fill="currentColor" height="6" rx="2" width="14" x="64" y="82"></rect>
                  </svg>
                  {/* Scanning bar */}
                  <div className="absolute inset-x-3 top-3 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                </div>

                <div className="mt-4 text-center">
                  <div className="text-xs font-bold text-[#1b1c19]">
                    {user?.fullName || "Nguyễn Hoàng Vinh"}
                  </div>
                  <div className="font-mono text-[10px] text-[#73787b] tracking-wider mt-0.5">
                    TOKEN: #GATE-8492-2026A
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Tự làm mới sau <span className="font-bold">{qrCountdown}s</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 text-[#bac9cd] text-xs px-1">
                <span className="truncate">Chạm NFC hoặc quét mã QR</span>
                <span className="font-semibold text-white shrink-0 whitespace-nowrap">&lt; 5cm</span>
              </div>
            </div>
          </div>

          {/* Monthly Utility Snapshot Card */}
          <div className="rounded-xl bg-white p-6 shadow-xs border border-[#efeee8]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1b1c19]">Điện Nước Tháng 09</h3>
                <span className="text-[11px] text-[#73787b]">T09/2026</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                Auto-Split Matrix
              </span>
            </div>

            <div className="space-y-4">
              {/* Electricity */}
              <div className="p-3.5 rounded-xl bg-[#f4f4ee]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#233944] text-base">
                      electric_meter
                    </span>
                    <span className="text-xs font-bold text-[#1b1c19]">Công Tơ Điện</span>
                  </div>
                  <span className="text-xs font-semibold text-[#1b1c19]">170 kWh</span>
                </div>
                <div className="w-full bg-[#e3e3dd] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#233944] h-full rounded-full" style={{ width: "68%" }} />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#73787b]">
                  <span>Chỉ số: 12,450 → 12,620</span>
                  <span className="font-semibold text-[#1b1c19]">₫425,000 tổng</span>
                </div>
              </div>

              {/* Water */}
              <div className="p-3.5 rounded-xl bg-[#f4f4ee]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#4c6269] text-base">
                      water_drop
                    </span>
                    <span className="text-xs font-bold text-[#1b1c19]">Đồng Hồ Nước</span>
                  </div>
                  <span className="text-xs font-semibold text-[#1b1c19]">14 m³</span>
                </div>
                <div className="w-full bg-[#e3e3dd] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#4c6269] h-full rounded-full" style={{ width: "52%" }} />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#73787b]">
                  <span>Chỉ số: 840 → 854</span>
                  <span className="font-semibold text-[#1b1c19]">₫252,000 tổng</span>
                </div>
              </div>

              {/* Per-Resident Split Apportionment */}
              <div className="p-3.5 rounded-xl bg-[#e9e8e3]/60 space-y-2 border border-[#efeee8]">
                <div className="text-[10px] uppercase tracking-wider text-[#73787b] font-bold">
                  Chia đều cho phòng (6 sinh viên)
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#42474b]">Phần điện nước tiêu thụ:</span>
                  <span className="font-semibold text-[#1b1c19]">₫112,833</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#42474b]">Wi-Fi & phí vệ sinh:</span>
                  <span className="font-semibold text-[#1b1c19]">₫20,000</span>
                </div>
                <div className="pt-2 border-t border-[#c2c7cb]/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1b1c19]">Tiền thực đóng:</span>
                  <span className="text-base font-bold text-[#233944]">₫420,000 VND</span>
                </div>
              </div>

              <Link
                to="/billing"
                className="w-full py-2.5 rounded-lg bg-[#f4f4ee] hover:bg-[#e9e8e3] text-[#1b1c19] text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#efeee8]"
              >
                <span className="material-symbols-outlined text-base">pie_chart</span>
                <span>Xem Chi Tiết Hóa Đơn & VietQR</span>
              </Link>
            </div>
          </div>

          {/* Dormitory Warden & Emergency Support */}
          <div className="rounded-xl bg-white p-6 shadow-xs border border-[#efeee8] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1b1c19]">Ban Quản Lý & Cấp Cứu</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#efeee8] text-[#1b1c19]">
                Tòa A
              </span>
            </div>

            {/* Warden Profile */}
            <div className="p-3.5 rounded-xl bg-[#f4f4ee] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#233944] text-white flex items-center justify-center text-xs font-bold shrink-0">
                LQ
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#1b1c19] truncate">Thầy Lê Quang</div>
                <div className="text-[10px] text-[#73787b]">Trưởng BQL Ký túc xá Tòa A</div>
                <div className="font-mono text-xs text-[#233944] font-semibold mt-0.5">
                  0912 345 678
                </div>
              </div>
              <a
                href="tel:0912345678"
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#233944] hover:text-white text-[#1b1c19] flex items-center justify-center transition-colors border border-[#efeee8]"
              >
                <span className="material-symbols-outlined text-base">call</span>
              </a>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f4f4ee]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#233944]">
                    shield_person
                  </span>
                  <span>Phòng An Ninh Cổng Trực</span>
                </div>
                <span className="font-mono font-bold text-[#233944] bg-white px-2 py-0.5 rounded border border-[#efeee8]">
                  Ext #201
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f4f4ee]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#ba1a1a]">
                    medical_services
                  </span>
                  <span>Phòng Y Tế Sơ Cứu 24/7</span>
                </div>
                <span className="font-mono font-bold text-[#ba1a1a] bg-white px-2 py-0.5 rounded border border-[#efeee8]">
                  Ext #115
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFC Gate Key QR Modal */}
      {showGateQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#efeee8] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#233944]">qr_code_2</span>
                <span className="text-sm font-bold text-[#1b1c19]">Mã Thẻ Cửa Ra Vào Tòa A</span>
              </div>
              <button
                onClick={() => setShowGateQrModal(false)}
                className="text-[#73787b] hover:text-[#1b1c19]"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f4f4ee] p-4 rounded-xl flex flex-col items-center justify-center">
              <div className="w-48 h-48 bg-white p-3 rounded-lg shadow-xs flex items-center justify-center">
                <svg className="w-full h-full text-[#233944]" fill="none" viewBox="0 0 100 100">
                  <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="5"></rect>
                  <rect fill="white" height="18" rx="2" width="18" x="10" y="10"></rect>
                  <rect fill="currentColor" height="10" width="10" x="14" y="14"></rect>
                  <rect fill="currentColor" height="28" rx="4" width="28" x="67" y="5"></rect>
                  <rect fill="white" height="18" rx="2" width="18" x="72" y="10"></rect>
                  <rect fill="currentColor" height="10" width="10" x="76" y="14"></rect>
                  <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="67"></rect>
                  <rect fill="white" height="18" rx="2" width="18" x="10" y="72"></rect>
                  <rect fill="currentColor" height="10" width="10" x="14" y="76"></rect>
                  <circle cx="48" cy="20" fill="currentColor" r="3"></circle>
                  <circle cx="48" cy="32" fill="currentColor" r="3"></circle>
                  <circle cx="56" cy="20" fill="currentColor" r="3"></circle>
                  <circle cx="42" cy="48" fill="currentColor" r="4"></circle>
                  <circle cx="58" cy="48" fill="currentColor" r="3"></circle>
                  <rect fill="currentColor" height="6" rx="2" width="12" x="44" y="64"></rect>
                  <rect fill="currentColor" height="16" rx="2" width="8" x="70" y="50"></rect>
                  <rect fill="currentColor" height="10" rx="2" width="10" x="82" y="70"></rect>
                  <rect fill="currentColor" height="6" rx="2" width="14" x="64" y="82"></rect>
                </svg>
              </div>

              <div className="mt-3 text-center">
                <span className="text-xs font-bold text-[#1b1c19]">
                  {user?.fullName || "Nguyễn Hoàng Vinh"} · Phòng A205
                </span>
                <p className="text-[11px] text-[#73787b] mt-0.5">
                  Đưa lại gần đầu đọc quang học tại cổng an ninh
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGateQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#233944] text-white text-xs font-bold hover:bg-[#3a505b] transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
