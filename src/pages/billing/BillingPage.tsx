import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buildMonthlyInvoice, buildVietQrContent, reconcilePayment } from "@/lib/dorm-ops"
import { ImageUpload } from "@/components/ui/image-upload"
import type { PhotoRecord } from "@/lib/photo-upload"
import { Receipt, Zap, Users, QrCode, Download, Printer, Calendar, CircleCheck, TriangleAlert, Clock, ExternalLink, ShieldCheck, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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

  // Tiered invoice (dorm-ops): dien bac thang + nuoc + wifi + ve sinh, chia deu dau nguoi
  const invoice = buildMonthlyInvoice({
    room: "A205",
    month: "2026-09",
    elecOld,
    elecNew,
    waterOld,
    waterNew,
    roomFeePerStudent: 950000,
    wifiFeeTotal: 120000,
    cleaningFeeTotal: 60000,
    numStudents: 6,
  })
  const deltaElec = invoice.deltaElec
  const deltaWater = invoice.deltaWater
  const elecCost = invoice.elecCost
  const waterCost = invoice.waterCost
  const internetCost = 120000
  const vatCost = 0
  const totalBill = elecCost + waterCost + invoice.sharedFees
  const perStudentUtility = invoice.perStudentUtility
  const baseAmenity = 950000
  const netDue = hasPaid ? 0 : invoice.perStudentTotal
  const [meterPhotos, setMeterPhotos] = useState<PhotoRecord[]>(() => {
    try {
      const raw = localStorage.getItem("dms_meter_photos_A205")
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [ocrHint, setOcrHint] = useState<string | null>(null)
  const vietqrContent = buildVietQrContent("A205", user?.studentId || "QE202049", netDue, "DIENNUOC")
  const [reconcileMsg, setReconcileMsg] = useState<string | null>(null)
  const confirmPaidWithReconcile = () => {
    const r = reconcilePayment({ expectedAmount: netDue, expectedContent: vietqrContent, actualAmount: netDue, actualContent: vietqrContent })
    setReconcileMsg(r.matched ? `Đối soát khớp: ${r.reason} · ${vietqrContent}` : `Lệch: ${r.reason}`)
    if (r.matched) setHasPaid(true)
  }

  const handleRecordMeter = (e: React.FormEvent) => {
    e.preventDefault()
    setRecordedSuccess(true)
    try {
      const raw = localStorage.getItem("dms_notifications_v1")
      const list = raw ? JSON.parse(raw) : []
      const arr = Array.isArray(list) ? list : []
      arr.unshift({
        id: `BILL-${invoice.room}-${invoice.month}`,
        title: `Hóa đơn tháng mới phòng ${invoice.room} đã phát hành`,
        body: `Kỳ ${invoice.month}: điện ${invoice.deltaElec} kWh, nước ${invoice.deltaWater} m³. Mỗi sinh viên đóng ₫${invoice.perStudentTotal.toLocaleString()}. Thanh toán VietQR trước ngày 05.`,
        at: new Date().toISOString(),
        read: false,
      })
      localStorage.setItem("dms_notifications_v1", JSON.stringify(arr))
    } catch {
      // ignore storage quota
    }
    setTimeout(() => setRecordedSuccess(false), 4000)
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 01. PAGE ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Điện nước & Hóa đơn VietQR
            </h1>
            <Badge variant="success">Chu kỳ T09/2026</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chia đều theo đầu người · Đối soát ảnh công tơ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="text-xs h-9 gap-1.5 bg-card whitespace-nowrap shrink-0"
          >
            <Printer className="h-4 w-4 shrink-0" />
            <span>In Bảng Kê</span>
          </Button>
          <Button
            onClick={() => alert("Đang xuất tệp hóa đơn điện tử e-Invoice PDF...")}
            className="text-xs h-9 gap-1.5 bg-primary hover:bg-primary/90 text-white whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Tải Hóa Đơn (PDF)</span>
          </Button>
        </div>
      </div>

      {/* 02. TOP KPI OPERATIONS CARDS (4 METRIC TILES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tổng Cần Thanh Toán
            </span>
            <span className={`p-1.5 rounded-lg ${hasPaid ? "bg-success-soft text-success-soft-foreground" : "bg-danger-soft text-danger-soft-foreground"}`}>
              <Receipt className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-primary dark:text-primary">
              {hasPaid ? "₫0" : `₫${netDue.toLocaleString()}`}
            </div>
            <div className={`flex items-center gap-1.5 mt-1 text-xs font-semibold ${hasPaid ? "text-success-soft-foreground" : "text-danger-soft-foreground"}`}>
              <span className={`w-2 h-2 rounded-full ${hasPaid ? "bg-success" : "bg-danger"}`}></span>
              <span>{hasPaid ? "Đã tất toán toàn bộ" : "Hạn nộp 05/10 · còn 3 ngày"}</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Đã Nộp Trong Năm (2026-2027)
            </span>
            <span className="p-1.5 rounded-lg bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary">
              <CircleCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-foreground">
              ₫3,780,000
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span>9/9 kỳ hóa đơn hợp lệ</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Kiểm Định Công Tơ
            </span>
            <span className="p-1.5 rounded-lg bg-muted/70 text-primary">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-foreground">
              Đã Nghiệm Thu & Khóa Số
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <span>KT: Trần Văn Bình · 30/09</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Kỳ Chốt Số Kế Tiếp
            </span>
            <span className="p-1.5 rounded-lg bg-primary-soft text-primary-soft-foreground">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: 7 COLS */}
        <div className="lg:col-span-7 flex h-full flex-col gap-6">
          {/* UTILITY DETAILS & FORMULA TABLE */}
          <div className="overflow-hidden bg-card rounded-xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-muted/70 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Kỳ Sử Dụng Tiện Ích Phòng A205
                </span>
                <span className="font-bold text-sm text-foreground">
                  01 Tháng 09 – 30 Tháng 09, 2026
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card shadow-2xs border border-border text-xs font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>6 Sinh Viên Cùng Chia Điện Nước</span>
              </div>
            </div>

            {/* Utility Breakdown Table */}
            <div className="bleed-x-5 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-muted text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                    <th className="whitespace-nowrap px-1.5 py-2.5 align-middle">Dịch Vụ</th>
                    <th className="whitespace-nowrap px-1.5 py-2.5 align-middle">Chỉ Số</th>
                    <th className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right">Tiêu Thụ</th>
                    <th className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right">Đơn Giá</th>
                    <th className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/70 transition-colors">
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Điện Sinh Hoạt</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle font-mono text-muted-foreground">
                      {elecOld.toLocaleString()} → {elecNew.toLocaleString()} kWh
                    </td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono font-bold text-foreground">
                      {deltaElec} kWh
                    </td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono text-muted-foreground">₫2,500</td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono font-bold text-foreground">
                      ₫{elecCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/70 transition-colors">
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Nước Sạch</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle font-mono text-muted-foreground">
                      {waterOld} → {waterNew} m³
                    </td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono font-bold text-foreground">
                      {deltaWater} m³
                    </td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono text-muted-foreground">₫18,000</td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono font-bold text-foreground">
                      ₫{waterCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/70 transition-colors">
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Fiber & Vệ Sinh</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-muted-foreground">Gói KTX Cố Định</td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono font-bold text-foreground">1 Gói</td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono text-muted-foreground">₫120,000</td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono font-bold text-foreground">
                      ₫{internetCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/70 transition-colors">
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Thuế VAT (10%)</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-muted-foreground">Theo quy định</td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono font-bold text-foreground">-</td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono text-muted-foreground">10%</td>
                    <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right font-mono font-bold text-foreground">
                      ₫{vatCost.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Khung công thức tính tiền */}
            <div className="p-4 rounded-xl bg-muted/70 border border-border space-y-2">
              <div className="flex items-center justify-between font-bold text-sm text-foreground">
                <span>Tổng chi phí cả phòng A205:</span>
                <span className="font-mono text-base text-primary dark:text-primary">
                  ₫{totalBill.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-bold text-foreground">Thuật toán:</span>
                  <span>
                    ₫{totalBill.toLocaleString()} ÷ 6 SV ={" "}
                    <strong className="text-primary dark:text-primary">
                      ₫{perStudentUtility.toLocaleString()}
                    </strong>{" "}
                    tiền điện nước/người
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-primary dark:text-primary">
                  <span>+ Tiền phòng: ₫{baseAmenity.toLocaleString()}</span>
                  <span>= ₫{netDue.toLocaleString()} Net</span>
                </div>
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
          <div className="bg-card rounded-xl border border-border p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Ảnh Đối Soát Công Tơ
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Hình ảnh đồng hồ phòng A205 được chụp trực tiếp khi chốt chỉ số
                </p>
              </div>
              <Badge variant="secondary">2 Ảnh Xác Thực</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo 1: Electricity */}
              <div className="rounded-xl overflow-hidden border border-border bg-muted/70 shadow-xs">
                <div className="relative h-56 w-full bg-foreground">
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
                  <span className="font-bold text-primary dark:text-primary">Submeter E-A205</span>
                </div>
              </div>

              {/* Photo 2: Water */}
              <div className="rounded-xl overflow-hidden border border-border bg-muted/70 shadow-xs">
                <div className="relative h-56 w-full bg-foreground">
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
                  <span className="font-bold text-primary dark:text-primary">Submeter W-A205</span>
                </div>
              </div>
            </div>
          </div>

          {/* HISTORICAL INVOICES TABLE */}
          <div className="overflow-hidden bg-card rounded-xl border border-border p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">
                Lịch Sử Hóa Đơn Học Kỳ 1
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono">Năm học 2026-2027</span>
            </div>

            <div className="bleed-x-5 overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
                    <th className="whitespace-nowrap px-2 py-2.5 align-middle">Kỳ Hóa Đơn</th>
                    <th className="whitespace-nowrap px-2 py-2.5 align-middle">Số Tiền</th>
                    <th className="whitespace-nowrap px-2 py-2.5 align-middle">Trạng Thái</th>
                    <th className="whitespace-nowrap px-2 py-2.5 align-middle text-right">Biên Lai PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { month: "Tháng 08/2026", amount: "₫410,500", date: "03/08/2026" },
                    { month: "Tháng 07/2026", amount: "₫395,000", date: "04/07/2026" },
                    { month: "Tháng 06/2026", amount: "₫435,000", date: "02/06/2026" },
                    { month: "Tháng 05/2026", amount: "₫412,000", date: "05/05/2026" },
                  ].map((inv, idx) => (
                    <tr key={idx} className="hover:bg-muted/70 transition-colors">
                      <td className="whitespace-nowrap px-1.5 py-2.5 align-middle font-semibold text-foreground">{inv.month}</td>
                      <td className="whitespace-nowrap px-1.5 py-2.5 align-middle font-mono text-foreground">{inv.amount}</td>
                      <td className="whitespace-nowrap px-1.5 py-2.5 align-middle">
                        <Badge variant="success" dot>
                          Đã thanh toán · {inv.date}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-1.5 py-2.5 align-middle text-right">
                        <button
                          onClick={() => alert(`Đang tải biên lai ${inv.month}...`)}
                          className="p-1 rounded text-primary hover:bg-muted/70"
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
        <div className="lg:col-span-5 flex h-full flex-col gap-6">
          {/* DYNAMIC VIETQR PAYMENT PANEL */}
          <div className="bg-card border border-border rounded-xl shadow-md p-5 sticky top-20 space-y-4">
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
              <div className="py-8 text-center space-y-3 bg-success-soft rounded-xl p-6 border border-success/20">
                <div className="w-14 h-14 mx-auto rounded-full bg-success text-white flex items-center justify-center">
                  <CircleCheck className="h-8 w-8" />
                </div>
                <h3 className="font-black text-lg text-success-soft-foreground">
                  Hóa Đơn Đã Được Thanh Toán!
                </h3>
                <p className="text-xs text-success-soft-foreground">
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
                  <div className="relative p-2 bg-white rounded-xl shadow-xs border border-border">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=2|99|09182391024|KY_TUC_XA_FPT|${netDue}|DIENNUOC_A205_${user?.studentId || "QE202049"}`}
                      alt="VietQR Bill Payment"
                      className="w-60 h-60 rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center p-1 border">
                        <span className="font-black text-[8px] text-primary">VIETQR</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-foreground mt-2">
                    Mở App Ngân Hàng Hoặc Ví Để Quét Mã
                  </p>
                </div>

                {/* Transfer Ledger Details */}
                <div className="bg-muted/70 p-3.5 rounded-xl text-xs space-y-2 font-mono">
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
                    <span className="font-black text-danger-soft-foreground text-sm whitespace-nowrap">₫{netDue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-1.5 font-sans">
                    <span className="text-muted-foreground whitespace-nowrap">Nội dung:</span>
                    <span className="font-mono font-bold text-primary dark:text-primary bg-card px-1.5 py-0.5 rounded border whitespace-nowrap truncate text-right">
                      {vietqrContent}
                    </span>
                  </div>
                </div>

                {/* Payment action simulator */}
                {reconcileMsg && <p className="text-[11px] font-semibold text-success-soft-foreground">{reconcileMsg}</p>}
                <Button
                  onClick={confirmPaidWithReconcile}
                  className="w-full h-11 bg-success hover:bg-success text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm rounded-lg"
                >
                  <CircleCheck className="h-4 w-4" />
                  <span>Xác Nhận Đã Chuyển Khoản Thành Công</span>
                </Button>
              </>
            )}
          </div>

          {/* Công cụ nhập chỉ số cho cán bộ / kỹ thuật */}
          {isTechnicianOrManager && (
            <div className="bg-card border border-primary/25 rounded-xl p-5 shadow-xs space-y-3 bg-gradient-to-br from-primary to-transparent">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-primary/20 text-primary-soft-foreground">
                  <Zap className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    Dành cho cán bộ / kỹ thuật
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Cập nhật số công tơ điện nước phòng ngày 25-28 hàng tháng
                  </p>
                </div>
              </div>

              {recordedSuccess && (
                <div className="p-3 bg-success-soft text-success-soft-foreground rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 text-success-soft-foreground shrink-0" />
                  <span>Đã ghi nhận chỉ số mới và cập nhật hóa đơn chia đều tức thì!</span>
                </div>
              )}

              <form onSubmit={handleRecordMeter} className="space-y-3 text-xs">
                <ImageUpload
                  storageKey="dms_meter_photos_A205"
                  label="Ảnh chụp đồng hồ"
                  hint="Chụp rõ mặt số công tơ điện/nước. AI/OCR stub sẽ gợi ý số đọc, kỹ thuật viên xác nhận lại."
                  value={meterPhotos}
                  onChange={(next) => {
                    setMeterPhotos(next)
                    try {
                      localStorage.setItem("dms_meter_photos_A205", JSON.stringify(next))
                    } catch {
                      // ignore quota
                    }
                    if (next.length > 0) {
                      setOcrHint("OCR stub: ảnh rõ, gợi ý đọc tiếp chỉ số mới và đối chiếu với kỳ trước trước khi lưu.")
                    }
                  }}
                />
                {ocrHint && (
                  <p className="rounded-lg bg-primary-soft p-2 text-[11px] text-primary-soft-foreground">{ocrHint}</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
                      Điện mới (kWh)
                    </label>
                    <Input
                      type="number"
                      value={elecNew}
                      onChange={(e) => setElecNew(Number(e.target.value))}
                      className="font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
                      Nước mới (m³)
                    </label>
                    <Input
                      type="number"
                      value={waterNew}
                      onChange={(e) => setWaterNew(Number(e.target.value))}
                      className="font-mono font-bold"
                    />
                  </div>
                </div>

                {elecNew < elecOld && (
                  <div className="p-2 bg-danger-soft text-danger-soft-foreground rounded text-[11px] flex items-center gap-1.5">
                    <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                    <span>Lỗi: Chỉ số mới ({elecNew}) không được nhỏ hơn chỉ số cũ ({elecOld})!</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={elecNew < elecOld}
                  className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold h-9"
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
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Khiếu Nại Số Đo Điện Nước Phòng A205
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {disputeSent ? (
              <div className="py-6 text-center space-y-2">
                <CircleCheck className="h-10 w-10 text-success mx-auto" />
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
                  <Select >
                    <option>Chỉ số Điện (Nghi ngờ rò rỉ hoặc ghi nhầm)</option>
                    <option>Chỉ số Nước (Nghi ngờ van nước phòng hở)</option>
                    <option>Số lượng sinh viên chia tiền (Có bạn trả phòng sớm)</option>
                  </Select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">
                    Mô tả lý do khiếu nại:
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Mô tả chênh lệch chỉ số và thời gian vắng mặt nếu có…"
                    
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
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs font-bold">
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
