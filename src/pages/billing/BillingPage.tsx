import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Receipt,
  Zap,
  Droplets,
  Wifi,
  Users,
  QrCode,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"

export const BillingPage: React.FC = () => {
  const { user } = useAuth()
  const [hasPaid, setHasPaid] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeSent, setDisputeSent] = useState(false)

  // Technician / Manager record meter state
  const elecOld = 12450
  const [elecNew, setElecNew] = useState(12620)
  const waterOld = 840
  const [waterNew, setWaterNew] = useState(854)
  const [recordedSuccess, setRecordedSuccess] = useState(false)

  const isTechnicianOrManager = user?.role === "technician" || user?.role === "manager" || user?.role === "admin"

  const deltaElec = Math.max(0, elecNew - elecOld)
  const deltaWater = Math.max(0, waterNew - waterOld)
  const elecCost = deltaElec * 2500
  const waterCost = deltaWater * 18000
  const internetCost = 120000
  const subtotal = elecCost + waterCost + internetCost
  const vatCost = Math.round(subtotal * 0.1)
  const totalBill = subtotal + vatCost
  const currentRoom = user?.dormitoryStatus?.room || "A205"
  // Mật độ sinh viên thực tế trong toàn bộ phòng (căn hộ A205 có 18 SV trên 24 giường)
  const ROOM_STUDENTS_MAP: Record<string, number> = {
    "A205": 18,
    "A206": 16,
    "A207": 18,
    "B102": 14,
  }
  const numStudents = ROOM_STUDENTS_MAP[currentRoom] || 18
  const perStudentUtility = Math.round(totalBill / numStudents)
  const netDue = hasPaid ? 0 : perStudentUtility

  const handleRecordMeter = (e: React.FormEvent) => {
    e.preventDefault()
    setRecordedSuccess(true)
    setTimeout(() => setRecordedSuccess(false), 4000)
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* 01. PAGE ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Điện Nước & Hóa Đơn (VietQR)
            </h1>
            <Badge variant="available">Chu kỳ T09/2026</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            onClick={() => alert("Đang xuất tệp hóa đơn điện tử e-Invoice PDF...")}
            className="text-xs h-9 gap-1.5 bg-primary text-white whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Tải Hóa Đơn (PDF)</span>
          </Button>
        </div>
      </div>

      {/* 02. TOP KPI OPERATIONS CARDS (3 METRIC TILES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161e23] border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tổng Cần Thanh Toán (T09/2026)
            </span>
            <span className={`p-1.5 rounded-lg ${hasPaid ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
              <Receipt className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-primary dark:text-[#cee6ef]">
              {hasPaid ? "₫0" : `₫${netDue.toLocaleString()}`}
            </div>
            <div className={`flex items-center gap-1.5 mt-1 text-xs font-semibold ${hasPaid ? "text-emerald-600" : "text-blue-600"}`}>
              <span className={`w-2 h-2 rounded-full ${hasPaid ? "bg-emerald-500" : "bg-blue-500"}`}></span>
              <span>{hasPaid ? "Đã tất toán toàn bộ" : "Hạn nộp trong 3 ngày (05/10)"}</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161e23] border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Đã Nộp Đầu Kỳ (Fall 2026)
            </span>
            <span className="p-1.5 rounded-lg bg-[#cee6ef] text-[#233944] dark:bg-[#233944] dark:text-[#cee6ef]">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-foreground">
              ₫4,200,000
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Đã hoàn tất tiền lưu trú Học kỳ 1 & Cọc</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161e23] border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Kỳ Chốt Số Kế Tiếp
            </span>
            <span className="p-1.5 rounded-lg bg-[#d6e5e9] text-[#101e21]">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-foreground">
              25/10/2026
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Định kỳ ngày 25 - 28 hàng tháng</span>
            </div>
          </div>
        </div>
      </div>

      {/* 03. TWO-COLUMN SPLIT (LEFT: BREAKDOWN & PHOTOS, RIGHT: VIETQR CHECKOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 7 COLS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* UTILITY DETAILS & FORMULA TABLE */}
          <div className="bg-white dark:bg-[#161e23] rounded-xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-[#eff6ff] dark:bg-[#1c262c] gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Kỳ Sử Dụng Tiện Ích Phòng A205
                </span>
                <span className="font-bold text-sm text-foreground">
                  01 Tháng 09 – 30 Tháng 09, 2026
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#161e23] shadow-2xs border border-border text-xs font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>{numStudents} Sinh Viên Phòng {currentRoom} Cùng Chia</span>
              </div>
            </div>

            {/* Utility Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#dbeafe] dark:bg-[#141c21] text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-md">Dịch Vụ</th>
                    <th className="py-2.5 px-3">Chỉ Số Cũ → Mới</th>
                    <th className="py-2.5 px-3 text-right">Tiêu Thụ</th>
                    <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                    <th className="py-2.5 px-3 text-right rounded-r-md">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-[#eff6ff] dark:hover:bg-[#1c262c] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-cyan-100 text-cyan-700">
                          <Zap className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-foreground">Điện Sinh Hoạt</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {elecOld.toLocaleString()} → {elecNew.toLocaleString()} kWh
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {deltaElec} kWh
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">₫2,500</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      ₫{elecCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#eff6ff] dark:hover:bg-[#1c262c] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-blue-100 text-blue-700">
                          <Droplets className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-foreground">Nước Sạch</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {waterOld} → {waterNew} m³
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {deltaWater} m³
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">₫18,000</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      ₫{waterCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#eff6ff] dark:hover:bg-[#1c262c] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-purple-100 text-purple-700">
                          <Wifi className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-foreground">Fiber & Vệ Sinh Chung</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">Gói KTX Cố Định</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">1 Gói</td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">₫120,000</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      ₫{internetCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="hover:bg-[#eff6ff] dark:hover:bg-[#1c262c] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-gray-100 text-gray-700">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-foreground">Thuế VAT (10%)</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">Quy chuẩn Nhà nước</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">-</td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">10%</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      ₫{vatCost.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TỔNG CHI PHÍ PHÒNG TRONG THÁNG */}
            <div className="p-4 rounded-xl bg-[#eff6ff] dark:bg-[#1c262c] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Tổng chi phí phòng {currentRoom} trong tháng này:
                </span>
                <span className="text-xl font-black font-mono text-primary dark:text-[#cee6ef]">
                  ₫{totalBill.toLocaleString()}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-muted-foreground block">
                  Mỗi sinh viên đóng ({numStudents} người):
                </span>
                <span className="text-base font-bold font-mono text-foreground">
                  ₫{perStudentUtility.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Dispute Trigger */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowDisputeModal(true)}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Khiếu nại số điện nước tháng này</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* METER PHOTOGRAPHIC PROOF GALLERY */}
          <div className="bg-white dark:bg-[#161e23] rounded-xl border border-border p-5 shadow-xs space-y-3">
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Ảnh Chụp Đối Soát Công Tơ (Photo Verification)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo 1: Electricity */}
              <div className="rounded-xl overflow-hidden border border-border bg-[#eff6ff] dark:bg-[#1c262c] shadow-xs">
                <div className="relative h-44 w-full bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
                    alt="Công tơ điện A205"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white font-mono text-[10px] font-bold">
                    ĐIỆN: #12620 kWh
                  </div>
                </div>
                <div className="p-2.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[11px]">30/09, 09:14 AM</span>
                  <span className="font-bold text-primary dark:text-[#cee6ef]">Submeter E-A205</span>
                </div>
              </div>

              {/* Photo 2: Water */}
              <div className="rounded-xl overflow-hidden border border-border bg-[#eff6ff] dark:bg-[#1c262c] shadow-xs">
                <div className="relative h-44 w-full bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"
                    alt="Đồng hồ nước A205"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white font-mono text-[10px] font-bold">
                    NƯỚC: #854 m³
                  </div>
                </div>
                <div className="p-2.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[11px]">30/09, 09:18 AM</span>
                  <span className="font-bold text-primary dark:text-[#cee6ef]">Submeter W-A205</span>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORICAL INVOICES TABLE */}
          <div className="bg-white dark:bg-[#161e23] rounded-xl border border-border p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">
                Lịch Sử Hóa Đơn Các Kỳ Trước (Học kỳ 1)
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono">Năm học 2026-2027</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 px-2">Kỳ Hóa Đơn</th>
                    <th className="py-2 px-2">Số Tiền</th>
                    <th className="py-2 px-2">Trạng Thái</th>
                    <th className="py-2 px-2 text-right">Biên Lai PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { month: "Tháng 08/2026", amount: "₫148,500", date: "03/08/2026" },
                    { month: "Tháng 07/2026", amount: "₫139,000", date: "04/07/2026" },
                    { month: "Tháng 06/2026", amount: "₫152,000", date: "02/06/2026" },
                    { month: "Tháng 05/2026", amount: "₫145,000", date: "05/05/2026" },
                  ].map((inv, idx) => (
                    <tr key={idx} className="hover:bg-[#eff6ff] dark:hover:bg-[#1c262c] transition-colors">
                      <td className="py-2.5 px-2 font-semibold text-foreground">{inv.month}</td>
                      <td className="py-2.5 px-2 font-mono text-foreground">{inv.amount}</td>
                      <td className="py-2.5 px-2">
                        <Badge variant="available" dot>
                          Đã thanh toán ({inv.date})
                        </Badge>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => alert(`Đang tải biên lai ${inv.month}...`)}
                          className="p-1 rounded text-primary hover:bg-[#eff6ff] dark:hover:bg-[#1c262c]"
                          title="Tải PDF"
                        >
                          <Download className="h-3.5 w-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 5 COLS (DYNAMIC VIETQR SETTLEMENT PANEL & TECHNICIAN TOOL) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* DYNAMIC VIETQR PAYMENT PANEL */}
          <div className="bg-white dark:bg-[#161e23] border border-border rounded-xl shadow-md p-5 sticky top-20 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <span className="p-2 rounded-lg bg-primary text-white">
                <QrCode className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-base text-foreground leading-tight">
                  Thanh Toán Nhanh VietQR 24/7
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  NAPAS Liên Ngân Hàng Không Cần Nhập Số Tài Khoản
                </span>
              </div>
            </div>

            {hasPaid ? (
              <div className="py-8 text-center space-y-3 bg-[#ECFDF5] dark:bg-[#065F46]/10 rounded-xl p-6 border border-[#A7F3D0]">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-black text-lg text-emerald-800 dark:text-emerald-300">
                  Hóa Đơn Đã Được Thanh Toán!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Giao dịch thành công qua VietQR vào lúc{" "}
                  {new Date().toLocaleTimeString("vi-VN")}. Dư nợ kỳ này là 0đ.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setHasPaid(false)}
                  className="text-xs"
                >
                  Mô phỏng chưa thanh toán
                </Button>
              </div>
            ) : (
              <>
                {/* QR Code graphic */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-border shadow-2xs">
                  <div className="relative p-2 bg-white rounded-xl shadow-xs border border-gray-100">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=2|99|09182391024|KY_TUC_XA_FPT|${netDue}|DIENNUOC_A205_${user?.studentId || "SE182049"}`}
                      alt="VietQR Bill Payment"
                      className="w-52 h-52 rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center p-1 border">
                        <span className="font-black text-[8px] text-primary">VIETQR</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-sky-300 mt-2">
                    Mở App Ngân Hàng Hoặc Ví Để Quét Mã
                  </p>
                </div>

                {/* Transfer Ledger Details */}
                <div className="bg-[#eff6ff] dark:bg-[#1c262c] p-3.5 rounded-xl text-xs space-y-2 font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-sans whitespace-nowrap">Ngân hàng:</span>
                    <span className="font-bold text-foreground truncate text-right">TPBank (Tiên Phong)</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-sans whitespace-nowrap">Số tài khoản:</span>
                    <span className="font-bold text-foreground truncate text-right">0918 239 1024</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-sans whitespace-nowrap">Chủ tài khoản:</span>
                    <span className="font-bold text-foreground truncate text-right">KTX ĐẠI HỌC FPT</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-sans whitespace-nowrap">Số tiền:</span>
                    <span className="font-black text-blue-600 text-sm whitespace-nowrap">₫{netDue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-1.5 font-sans">
                    <span className="text-muted-foreground whitespace-nowrap">Nội dung:</span>
                    <span className="font-mono font-bold text-primary dark:text-[#cee6ef] bg-white dark:bg-[#161e23] px-1.5 py-0.5 rounded border whitespace-nowrap truncate text-right">
                      DIENNUOC A205 {user?.studentId || "SE182049"}
                    </span>
                  </div>
                </div>

                {/* Payment action simulator */}
                <Button
                  onClick={() => setHasPaid(true)}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Xác Nhận Đã Chuyển Khoản Thành Công</span>
                </Button>
              </>
            )}
          </div>

          {/* TECHNICIAN / MANAGER TOOL: INPUT MONTHLY METER */}
          {isTechnicianOrManager && (
            <div className="bg-white dark:bg-[#161e23] border border-cyan-500/30 rounded-xl p-5 shadow-xs space-y-3 bg-gradient-to-br from-cyan-500/5 to-transparent">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-600">
                  <Zap className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    Dành Cho Cán Bộ / Kỹ Thuật
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Cập nhật số công tơ điện nước phòng ngày 25-28 hàng tháng
                  </p>
                </div>
              </div>

              {recordedSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Đã ghi nhận chỉ số mới và cập nhật hóa đơn chia đều tức thì!</span>
                </div>
              )}

              <form onSubmit={handleRecordMeter} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
                      Điện mới (kWh)
                    </label>
                    <input
                      type="number"
                      value={elecNew}
                      onChange={(e) => setElecNew(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-border bg-[#eff6ff] dark:bg-[#1c262c] font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
                      Nước mới (m³)
                    </label>
                    <input
                      type="number"
                      value={waterNew}
                      onChange={(e) => setWaterNew(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-border bg-[#eff6ff] dark:bg-[#1c262c] font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                {elecNew < elecOld && (
                  <div className="p-2 bg-blue-100 text-blue-700 rounded text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Lỗi: Chỉ số mới ({elecNew}) không được nhỏ hơn chỉ số cũ ({elecOld})!</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={elecNew < elecOld}
                  className="w-full bg-primary text-white text-xs font-bold h-9"
                >
                  Lưu & Phát Hành Hóa Đơn Cho Phòng
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* DISPUTE READING MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#161e23] border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Khiếu Nại Số Đo Điện Nước Phòng A205
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            {disputeSent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">Đã Gửi Y Cầu Kiểm Tra!</h4>
                <p className="text-xs text-muted-foreground">
                  Kỹ thuật viên KTX sẽ tiến hành kiểm định đối chiếu lại đồng hồ trong vòng 24 giờ.
                </p>
                <Button
                  onClick={() => {
                    setShowDisputeModal(false)
                    setDisputeSent(false)
                  }}
                  className="text-xs mt-3"
                >
                  Đóng
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setDisputeSent(true)
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">
                    Loại tiện ích cần kiểm tra lại:
                  </label>
                  <select className="w-full p-2 rounded-lg border border-border bg-[#eff6ff] dark:bg-[#1c262c]">
                    <option>Chỉ số Điện (Nghi ngờ rò rỉ hoặc ghi nhầm)</option>
                    <option>Chỉ số Nước (Nghi ngờ van nước phòng hở)</option>
                    <option>Số lượng sinh viên chia tiền (Có bạn trả phòng sớm)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">
                    Mô tả lý do khiếu nại:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Tháng này phòng em đi thực tập 2 tuần nhưng số điện lại tăng gấp đôi..."
                    className="w-full p-2.5 rounded-lg border border-border bg-[#eff6ff] dark:bg-[#1c262c] text-xs"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDisputeModal(false)}
                    className="flex-1 text-xs"
                  >
                    Hủy
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary text-white text-xs font-bold">
                    Gửi Khiếu Nại
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
