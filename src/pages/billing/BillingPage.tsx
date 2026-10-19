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
  Printer,
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

  const isTechnicianOrManager =
    user?.role === "technician" ||
    user?.role === "manager" ||
    user?.role === "admin"

  const deltaElec = Math.max(0, elecNew - elecOld)
  const deltaWater = Math.max(0, waterNew - waterOld)
  const elecCost = deltaElec * 2500
  const waterCost = deltaWater * 18000
  const internetCost = 120000
  const subtotal = elecCost + waterCost + internetCost
  const vatCost = Math.round(subtotal * 0.1)
  const totalBill = subtotal + vatCost
  const numStudents = 6
  const perStudentUtility = Math.round(totalBill / numStudents)
  const baseAmenity = 273883
  const netDue = hasPaid ? 0 : perStudentUtility + baseAmenity

  const handleRecordMeter = (e: React.FormEvent) => {
    e.preventDefault()
    setRecordedSuccess(true)
    setTimeout(() => setRecordedSuccess(false), 4000)
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
      {/* 01. PAGE ACTION HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Điện Nước & Hóa Đơn Chia Đều (VietQR)
            </h1>
            <Badge variant="available">Chu kỳ T09/2026</Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Module 4 · Thuật toán chia đều phòng (Total ÷ N) & Đối soát ảnh công
            tơ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-9 shrink-0 gap-1.5 bg-white text-xs whitespace-nowrap dark:bg-[#161e23]"
          >
            <Printer className="h-4 w-4 shrink-0" />
            <span>In Bảng Kê</span>
          </Button>
          <Button
            onClick={() =>
              alert("Đang xuất tệp hóa đơn điện tử e-Invoice PDF...")
            }
            className="h-9 shrink-0 gap-1.5 bg-primary text-xs whitespace-nowrap text-white"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Tải Hóa Đơn (PDF)</span>
          </Button>
        </div>
      </div>

      {/* 02. TOP KPI OPERATIONS CARDS (4 METRIC TILES) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-white p-4 shadow-xs dark:bg-[#161e23]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Tổng Cần Thanh Toán
            </span>
            <span
              className={`rounded-lg p-1.5 ${hasPaid ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
            >
              <Receipt className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black tracking-tight text-primary dark:text-[#cee6ef]">
              {hasPaid ? "₫0" : `₫${netDue.toLocaleString()}`}
            </div>
            <div
              className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${hasPaid ? "text-emerald-600" : "text-red-600"}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${hasPaid ? "bg-emerald-500" : "bg-red-500"}`}
              ></span>
              <span>
                {hasPaid
                  ? "Đã tất toán toàn bộ"
                  : "Hạn nộp trong 3 ngày (05/10)"}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-white p-4 shadow-xs dark:bg-[#161e23]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Đã Nộp Trong Năm (2026-2027)
            </span>
            <span className="rounded-lg bg-[#cee6ef] p-1.5 text-[#233944] dark:bg-[#233944] dark:text-[#cee6ef]">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black tracking-tight text-foreground">
              ₫3,780,000
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>9/9 kỳ hóa đơn hợp lệ</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-white p-4 shadow-xs dark:bg-[#161e23]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Kiểm Định Công Tơ
            </span>
            <span className="rounded-lg bg-[#f4f4ee] p-1.5 text-primary dark:bg-[#1c262c]">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-foreground">
              Đã Nghiệm Thu & Khóa Số
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>KT: Trần Văn Bình · 30/09</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-white p-4 shadow-xs dark:bg-[#161e23]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Kỳ Chốt Số Kế Tiếp
            </span>
            <span className="rounded-lg bg-[#d6e5e9] p-1.5 text-[#101e21]">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="font-mono text-2xl font-black tracking-tight text-foreground">
              25/10/2026
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Định kỳ ngày 25 - 28 hàng tháng</span>
            </div>
          </div>
        </div>
      </div>

      {/* 03. TWO-COLUMN SPLIT (LEFT: BREAKDOWN & PHOTOS, RIGHT: VIETQR CHECKOUT) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: 7 COLS */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* UTILITY DETAILS & FORMULA TABLE */}
          <div className="space-y-4 rounded-xl border border-border bg-white p-5 shadow-xs dark:bg-[#161e23]">
            <div className="flex flex-col justify-between gap-3 rounded-lg bg-[#f4f4ee] p-3.5 sm:flex-row sm:items-center dark:bg-[#1c262c]">
              <div>
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Kỳ Sử Dụng Tiện Ích Phòng A205
                </span>
                <span className="text-sm font-bold text-foreground">
                  01 Tháng 09 – 30 Tháng 09, 2026
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-foreground shadow-2xs dark:bg-[#161e23]">
                <Users className="h-4 w-4 text-primary" />
                <span>6 Sinh Viên Cùng Chia Điện Nước</span>
              </div>
            </div>

            {/* Utility Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#efeee8] text-[10px] font-bold tracking-wider text-muted-foreground uppercase dark:bg-[#141c21]">
                    <th className="rounded-l-md px-3 py-2.5">Dịch Vụ</th>
                    <th className="px-3 py-2.5">Chỉ Số Cũ → Mới</th>
                    <th className="px-3 py-2.5 text-right">Tiêu Thụ</th>
                    <th className="px-3 py-2.5 text-right">Đơn Giá</th>
                    <th className="rounded-r-md px-3 py-2.5 text-right">
                      Thành Tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="transition-colors hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-amber-100 p-1 text-amber-700">
                          <Zap className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-foreground">
                          Điện Sinh Hoạt
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">
                      {elecOld.toLocaleString()} → {elecNew.toLocaleString()}{" "}
                      kWh
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      {deltaElec} kWh
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                      ₫2,500
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      ₫{elecCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="transition-colors hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-100 p-1 text-blue-700">
                          <Droplets className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-foreground">
                          Nước Sạch
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">
                      {waterOld} → {waterNew} m³
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      {deltaWater} m³
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                      ₫18,000
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      ₫{waterCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="transition-colors hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-purple-100 p-1 text-purple-700">
                          <Wifi className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-foreground">
                          Fiber & Vệ Sinh Chung
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      Gói KTX Cố Định
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      1 Gói
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                      ₫120,000
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      ₫{internetCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="transition-colors hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-gray-100 p-1 text-gray-700">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-bold text-foreground">
                          Thuế VAT (10%)
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      Quy chuẩn Nhà nước
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      -
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                      10%
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                      ₫{vatCost.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FORMULA HIGHLIGHT BOX (Module 4 Signature) */}
            <div className="space-y-2 rounded-xl border border-border bg-[#f4f4ee] p-4 dark:bg-[#1c262c]">
              <div className="flex items-center justify-between text-sm font-bold text-foreground">
                <span>Tổng chi phí cả phòng A205:</span>
                <span className="font-mono text-base text-primary dark:text-[#cee6ef]">
                  ₫{totalBill.toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col justify-between gap-2 rounded-lg border border-border bg-white p-2.5 text-xs md:flex-row md:items-center dark:bg-[#161e23]">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-bold text-foreground">Thuật toán:</span>
                  <span>
                    ₫{totalBill.toLocaleString()} ÷ 6 SV ={" "}
                    <strong className="text-primary dark:text-[#cee6ef]">
                      ₫{perStudentUtility.toLocaleString()}
                    </strong>{" "}
                    tiền điện nước/người
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-primary dark:text-[#cee6ef]">
                  <span>+ Tiền phòng: ₫{baseAmenity.toLocaleString()}</span>
                  <span>= ₫{netDue.toLocaleString()} Net</span>
                </div>
              </div>
            </div>

            {/* Dispute Trigger */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowDisputeModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>Khiếu nại số điện nước tháng này</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* METER PHOTOGRAPHIC PROOF GALLERY */}
          <div className="space-y-3 rounded-xl border border-border bg-white p-5 shadow-xs dark:bg-[#161e23]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Ảnh Chụp Đối Soát Công Tơ (Photo Verification)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Hình ảnh đồng hồ phòng A205 được chụp trực tiếp khi chốt chỉ
                  số
                </p>
              </div>
              <Badge variant="secondary">2 Ảnh Xác Thực</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Photo 1: Electricity */}
              <div className="overflow-hidden rounded-xl border border-border bg-[#f4f4ee] shadow-xs dark:bg-[#1c262c]">
                <div className="relative h-44 w-full bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
                    alt="Công tơ điện A205"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                    ĐIỆN: #12620 kWh
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 text-xs text-muted-foreground">
                  <span className="font-mono text-[11px]">30/09, 09:14 AM</span>
                  <span className="font-bold text-primary dark:text-[#cee6ef]">
                    Submeter E-A205
                  </span>
                </div>
              </div>

              {/* Photo 2: Water */}
              <div className="overflow-hidden rounded-xl border border-border bg-[#f4f4ee] shadow-xs dark:bg-[#1c262c]">
                <div className="relative h-44 w-full bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"
                    alt="Đồng hồ nước A205"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                    NƯỚC: #854 m³
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 text-xs text-muted-foreground">
                  <span className="font-mono text-[11px]">30/09, 09:18 AM</span>
                  <span className="font-bold text-primary dark:text-[#cee6ef]">
                    Submeter W-A205
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORICAL INVOICES TABLE */}
          <div className="space-y-3 rounded-xl border border-border bg-white p-5 shadow-xs dark:bg-[#161e23]">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">
                Lịch Sử Hóa Đơn Các Kỳ Trước (Học kỳ 1)
              </h3>
              <span className="font-mono text-[11px] text-muted-foreground">
                Năm học 2026-2027
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    <th className="px-2 py-2">Kỳ Hóa Đơn</th>
                    <th className="px-2 py-2">Số Tiền</th>
                    <th className="px-2 py-2">Trạng Thái</th>
                    <th className="px-2 py-2 text-right">Biên Lai PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      month: "Tháng 08/2026",
                      amount: "₫410,500",
                      date: "03/08/2026",
                    },
                    {
                      month: "Tháng 07/2026",
                      amount: "₫395,000",
                      date: "04/07/2026",
                    },
                    {
                      month: "Tháng 06/2026",
                      amount: "₫435,000",
                      date: "02/06/2026",
                    },
                    {
                      month: "Tháng 05/2026",
                      amount: "₫412,000",
                      date: "05/05/2026",
                    },
                  ].map((inv, idx) => (
                    <tr
                      key={idx}
                      className="transition-colors hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]"
                    >
                      <td className="px-2 py-2.5 font-semibold text-foreground">
                        {inv.month}
                      </td>
                      <td className="px-2 py-2.5 font-mono text-foreground">
                        {inv.amount}
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge variant="available" dot>
                          Đã thanh toán ({inv.date})
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <button
                          onClick={() =>
                            alert(`Đang tải biên lai ${inv.month}...`)
                          }
                          className="rounded p-1 text-primary hover:bg-[#f4f4ee] dark:hover:bg-[#1c262c]"
                          title="Tải PDF"
                        >
                          <Download className="inline h-3.5 w-3.5" />
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
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* DYNAMIC VIETQR PAYMENT PANEL */}
          <div className="sticky top-20 space-y-4 rounded-xl border border-border bg-white p-5 shadow-md dark:bg-[#161e23]">
            <div className="flex items-center gap-2.5 border-b border-border pb-2">
              <span className="rounded-lg bg-primary p-2 text-white">
                <QrCode className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base leading-tight font-bold text-foreground">
                  Thanh Toán Nhanh VietQR 24/7
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  NAPAS Liên Ngân Hàng Không Cần Nhập Số Tài Khoản
                </span>
              </div>
            </div>

            {hasPaid ? (
              <div className="space-y-3 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-6 py-8 text-center dark:bg-[#065F46]/10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
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
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-4 shadow-2xs">
                  <div className="relative rounded-xl border border-gray-100 bg-white p-2 shadow-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=2|99|09182391024|KY_TUC_XA_FPT|${netDue}|DIENNUOC_A205_${user?.studentId || "SE182049"}`}
                      alt="VietQR Bill Payment"
                      className="h-52 w-52 rounded-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-white p-1 shadow-md">
                        <span className="text-[8px] font-black text-primary">
                          VIETQR
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs font-bold text-slate-900 dark:text-sky-300">
                    Mở App Ngân Hàng Hoặc Ví Để Quét Mã
                  </p>
                </div>

                {/* Transfer Ledger Details */}
                <div className="space-y-2 rounded-xl bg-[#f4f4ee] p-3.5 font-mono text-xs dark:bg-[#1c262c]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans whitespace-nowrap text-muted-foreground">
                      Ngân hàng:
                    </span>
                    <span className="truncate text-right font-bold text-foreground">
                      TPBank (Tiên Phong)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans whitespace-nowrap text-muted-foreground">
                      Số tài khoản:
                    </span>
                    <span className="truncate text-right font-bold text-foreground">
                      0918 239 1024
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans whitespace-nowrap text-muted-foreground">
                      Chủ tài khoản:
                    </span>
                    <span className="truncate text-right font-bold text-foreground">
                      KTX ĐẠI HỌC FPT
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans whitespace-nowrap text-muted-foreground">
                      Số tiền:
                    </span>
                    <span className="text-sm font-black whitespace-nowrap text-red-600">
                      ₫{netDue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-1.5 font-sans">
                    <span className="whitespace-nowrap text-muted-foreground">
                      Nội dung:
                    </span>
                    <span className="truncate rounded border bg-white px-1.5 py-0.5 text-right font-mono font-bold whitespace-nowrap text-primary dark:bg-[#161e23] dark:text-[#cee6ef]">
                      DIENNUOC A205 {user?.studentId || "SE182049"}
                    </span>
                  </div>
                </div>

                {/* Payment action simulator */}
                <Button
                  onClick={() => setHasPaid(true)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Xác Nhận Đã Chuyển Khoản Thành Công</span>
                </Button>
              </>
            )}
          </div>

          {/* TECHNICIAN / MANAGER TOOL: INPUT MONTHLY METER */}
          {isTechnicianOrManager && (
            <div className="space-y-3 rounded-xl border border-amber-500/30 bg-white bg-gradient-to-br from-amber-500/5 to-transparent p-5 shadow-xs dark:bg-[#161e23]">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 p-1 text-amber-600">
                  <Zap className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                    Dành Cho Cán Bộ / Kỹ Thuật
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Cập nhật số công tơ điện nước phòng ngày 25-28 hàng tháng
                  </p>
                </div>
              </div>

              {recordedSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-100 p-3 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Đã ghi nhận chỉ số mới và cập nhật hóa đơn chia đều tức thì!
                  </span>
                </div>
              )}

              <form onSubmit={handleRecordMeter} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-muted-foreground">
                      Điện mới (kWh)
                    </label>
                    <input
                      type="number"
                      value={elecNew}
                      onChange={(e) => setElecNew(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-[#f4f4ee] p-2 font-mono text-xs font-bold dark:bg-[#1c262c]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-muted-foreground">
                      Nước mới (m³)
                    </label>
                    <input
                      type="number"
                      value={waterNew}
                      onChange={(e) => setWaterNew(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-[#f4f4ee] p-2 font-mono text-xs font-bold dark:bg-[#1c262c]"
                    />
                  </div>
                </div>

                {elecNew < elecOld && (
                  <div className="flex items-center gap-1.5 rounded bg-red-100 p-2 text-[11px] text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Lỗi: Chỉ số mới ({elecNew}) không được nhỏ hơn chỉ số cũ (
                      {elecOld})!
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={elecNew < elecOld}
                  className="h-9 w-full bg-primary text-xs font-bold text-white"
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
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs fade-in">
          <div className="w-full max-w-md space-y-4 overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-xl dark:bg-[#161e23]">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                Khiếu Nại Số Đo Điện Nước Phòng A205
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {disputeSent ? (
              <div className="space-y-2 py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <h4 className="text-sm font-bold text-foreground">
                  Đã Gửi Y Cầu Kiểm Tra!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Kỹ thuật viên KTX sẽ tiến hành kiểm định đối chiếu lại đồng hồ
                  trong vòng 24 giờ.
                </p>
                <Button
                  onClick={() => {
                    setShowDisputeModal(false)
                    setDisputeSent(false)
                  }}
                  className="mt-3 text-xs"
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
                  <label className="mb-1 block text-[11px] font-bold text-foreground">
                    Loại tiện ích cần kiểm tra lại:
                  </label>
                  <select className="w-full rounded-lg border border-border bg-[#f4f4ee] p-2 dark:bg-[#1c262c]">
                    <option>Chỉ số Điện (Nghi ngờ rò rỉ hoặc ghi nhầm)</option>
                    <option>Chỉ số Nước (Nghi ngờ van nước phòng hở)</option>
                    <option>
                      Số lượng sinh viên chia tiền (Có bạn trả phòng sớm)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-foreground">
                    Mô tả lý do khiếu nại:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Tháng này phòng em đi thực tập 2 tuần nhưng số điện lại tăng gấp đôi..."
                    className="w-full rounded-lg border border-border bg-[#f4f4ee] p-2.5 text-xs dark:bg-[#1c262c]"
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
                  <Button
                    type="submit"
                    className="flex-1 bg-primary text-xs font-bold text-white"
                  >
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
