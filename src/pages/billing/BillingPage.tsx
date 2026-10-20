import React, { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Button } from "@/components/ui/button"
import {
  Receipt,
  Zap,
  Droplets,
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
  Maximize2,
  X,
  Send,
} from "lucide-react"

export const BillingPage: React.FC = () => {
  const { user } = useAuth()
  const isTechnicianOrManager =
    user?.role === "technician" || user?.role === "manager" || user?.role === "admin"

  const [hasPaid, setHasPaid] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeSent, setDisputeSent] = useState(false)
  const [previewImage, setPreviewImage] = useState<{
    url: string
    title: string
    subtext: string
  } | null>(null)

  // Manager state
  const [selectedRoom, setSelectedRoom] = useState("A205")
  const [publishedBatch, setPublishedBatch] = useState(false)
  const [remindedBatch, setRemindedBatch] = useState(false)

  // Technician / Manager record meter state
  const elecOld = 12450
  const [elecNew, setElecNew] = useState(12620)
  const waterOld = 840
  const [waterNew, setWaterNew] = useState(854)
  const [recordedSuccess, setRecordedSuccess] = useState(false)

  const deltaElec = Math.max(0, elecNew - elecOld)
  const deltaWater = Math.max(0, waterNew - waterOld)
  const elecCost = deltaElec * 2500
  const waterCost = deltaWater * 18000
  const subtotal = elecCost + waterCost
  const vatCost = Math.round(subtotal * 0.1)
  const totalBill = subtotal + vatCost

  const currentRoom = isTechnicianOrManager ? selectedRoom : (user?.dormitoryStatus?.room || "A205")
  const ROOM_STUDENTS_MAP: Record<string, number> = {
    "A205": 18,
    "A201": 18,
    "A202": 16,
    "A203": 18,
    "A204": 16,
    "A206": 16,
    "A207": 18,
  }
  const numStudents = ROOM_STUDENTS_MAP[currentRoom] || 18
  const perStudentUtility = Math.round(totalBill / numStudents)
  const netDue = hasPaid ? 0 : perStudentUtility

  const handleDownloadQr = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=2|99|09182391024|KY_TUC_XA_FPT|${netDue}|DIENNUOC_${currentRoom}_${user?.studentId || "SE182049"}`
    fetch(qrUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `VietQR_DienNuoc_${currentRoom}_${user?.studentId || "SE182049"}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      })
      .catch(() => {
        window.open(qrUrl, "_blank")
      })
  }

  const handleRecordMeter = (e: React.FormEvent) => {
    e.preventDefault()
    setRecordedSuccess(true)
    setTimeout(() => setRecordedSuccess(false), 4000)
  }

  const handlePublishBatch = () => {
    setPublishedBatch(true)
    setTimeout(() => setPublishedBatch(false), 5000)
  }

  const handleRemindBatch = () => {
    setRemindedBatch(true)
    setTimeout(() => setRemindedBatch(false), 4000)
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* 01. PAGE ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {isTechnicianOrManager
                ? "Chốt Sổ & Chia Điện Nước • Tòa A"
                : "Điện Nước & Hóa Đơn (VietQR)"}
            </h1>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Chu kỳ T09/2026
            </span>
          </div>
          
        </div>

        {!isTechnicianOrManager && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => alert("Đang xuất tệp hóa đơn điện tử e-Invoice PDF...")}
              className="text-xs h-9 gap-1.5 bg-primary text-white whitespace-nowrap shrink-0"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>Tải Hóa Đơn (PDF)</span>
            </Button>
          </div>
        )}
      </div>

      {/* 02. TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isTechnicianOrManager ? (
          <>
            {/* Manager Metric 1 */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#161e23] border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tổng Thu Điện Nước Tòa A (T09)
                </span>
                <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                  <Receipt className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono tracking-tight text-primary dark:text-[#cee6ef]">
                  ₫32,766,800
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>178 / 192 SV đã nộp (92.7%)</span>
                </div>
              </div>
            </div>

            {/* Manager Metric 2 */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#161e23] border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tiến Độ Chốt Số Công Tơ
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono tracking-tight text-foreground">
                  44 / 44 Phòng
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>100% phòng đã có ảnh đối soát</span>
                </div>
              </div>
            </div>

            {/* Manager Metric 3 */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#161e23] border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Kỳ Chốt Số Tiếp Theo
                </span>
                <span className="p-1.5 rounded-lg bg-[#d6e5e9] text-[#101e21]">
                  <Calendar className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono tracking-tight text-foreground">
                  31/10/2026
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Định kỳ chốt ngày cuối tháng (30 - 31)</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Student Metric 1 */}
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

            {/* Student Metric 2 */}
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

            {/* Student Metric 3 */}
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
                  31/10/2026
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Định kỳ chốt ngày cuối tháng (30 - 31)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 03. TWO-COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 7 COLS (BREAKDOWN & PHOTO VERIFICATION) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#161e23] rounded-xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-[#eff6ff] dark:bg-[#1c262c] gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {isTechnicianOrManager
                    ? `Kỳ Sử Dụng Tiện Ích Phòng ${currentRoom} (Tòa A)`
                    : `Kỳ Sử Dụng Tiện Ích Phòng ${currentRoom}`}
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
                        <span className="p-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
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
                        <span className="p-1 rounded bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
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
                        <span className="p-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
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

            {/* Dispute or Manager Verification Badge */}
            <div className="flex justify-between items-center pt-1">
              <div />
              {!isTechnicianOrManager && (
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Khiếu nại số điện nước tháng này</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* METER PHOTOGRAPHIC PROOF GALLERY */}
          <div className="bg-white dark:bg-[#161e23] rounded-xl border border-border p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Ảnh Chụp Đối Soát Công Tơ (Photo Verification)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {isTechnicianOrManager
                    ? `Hồ sơ ảnh công tơ phòng ${currentRoom} ngày 30/09`
                    : "Minh chứng đối soát chỉ số chốt thực tế tại tủ kỹ thuật tầng 2"}
                </p>
              </div>
              {isTechnicianOrManager && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã kiểm định</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo 1: Electricity */}
              <div className="rounded-xl overflow-hidden border border-border bg-[#eff6ff] dark:bg-[#1c262c] shadow-xs group">
                <div className="relative h-44 w-full bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
                    alt="Công tơ điện A205"
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-102"
                    onClick={() =>
                      setPreviewImage({
                        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=90",
                        title: `Ảnh Chụp Chỉ Số Công Tơ Điện Phòng ${currentRoom}`,
                        subtext: `Chỉ số chốt: ${elecNew.toLocaleString()} kWh • Thời gian chụp: 30/09, 09:14 AM • Submeter E-${currentRoom}`,
                      })
                    }
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white font-mono text-[10px] font-bold">
                    ĐIỆN: #{elecNew} kWh
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=90",
                        title: `Ảnh Chụp Chỉ Số Công Tơ Điện Phòng ${currentRoom}`,
                        subtext: `Chỉ số chốt: ${elecNew.toLocaleString()} kWh • Thời gian chụp: 30/09, 09:14 AM • Submeter E-${currentRoom}`,
                      })
                    }
                    className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 hover:bg-black/90 text-white px-2 py-1 text-[10px] font-semibold backdrop-blur-xs transition-all shadow-md"
                    title="Xem ảnh cỡ lớn rõ nét"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Xem lớn</span>
                  </button>
                </div>
                <div className="p-2.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[11px]">30/09, 09:14 AM</span>
                  <span className="font-bold text-primary dark:text-[#cee6ef]">Submeter E-{currentRoom}</span>
                </div>
              </div>

              {/* Photo 2: Water */}
              <div className="rounded-xl overflow-hidden border border-border bg-[#eff6ff] dark:bg-[#1c262c] shadow-xs group">
                <div className="relative h-44 w-full bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"
                    alt="Đồng hồ nước A205"
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-102"
                    onClick={() =>
                      setPreviewImage({
                        url: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1600&q=90",
                        title: `Ảnh Chụp Chỉ Số Đồng Hồ Nước Phòng ${currentRoom}`,
                        subtext: `Chỉ số chốt: ${waterNew} m³ • Thời gian chụp: 30/09, 09:18 AM • Submeter W-${currentRoom}`,
                      })
                    }
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white font-mono text-[10px] font-bold">
                    NƯỚC: #{waterNew} m³
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        url: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1600&q=90",
                        title: `Ảnh Chụp Chỉ Số Đồng Hồ Nước Phòng ${currentRoom}`,
                        subtext: `Chỉ số chốt: ${waterNew} m³ • Thời gian chụp: 30/09, 09:18 AM • Submeter W-${currentRoom}`,
                      })
                    }
                    className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 hover:bg-black/90 text-white px-2 py-1 text-[10px] font-semibold backdrop-blur-xs transition-all shadow-md"
                    title="Xem ảnh cỡ lớn rõ nét"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Xem lớn</span>
                  </button>
                </div>
                <div className="p-2.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[11px]">30/09, 09:18 AM</span>
                  <span className="font-bold text-primary dark:text-[#cee6ef]">Submeter W-{currentRoom}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 5 COLS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isTechnicianOrManager ? (
            /* ========================================================================= */
            /* CÁN BỘ / QUẢN LÝ / KỸ THUẬT: BẢNG ĐIỀU HÀNH CHỐT SỔ & PHÁT HÀNH HÓA ĐƠN */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* Box 1: Chọn phòng & Chốt số nhanh */}
              <div className="bg-white dark:bg-[#161e23] border border-border rounded-xl shadow-md p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-primary text-white">
                      <Zap className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-bold text-sm text-foreground leading-tight">
                        Chốt Số & Đối Soát Công Tơ
                      </h2>
                      <span className="text-[11px] text-muted-foreground">
                        Nhập số thực tế để tự động chia tiền cho phòng
                      </span>
                    </div>
                  </div>

                  {/* Room Selector */}
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="p-1.5 rounded-lg border border-border bg-[#eff6ff] dark:bg-[#1c262c] text-xs font-bold text-foreground"
                  >
                    <option value="A205">Phòng A205 (Đang chọn)</option>
                    <option value="A201">Phòng A201</option>
                    <option value="A202">Phòng A202</option>
                    <option value="A203">Phòng A203</option>
                    <option value="A204">Phòng A204</option>
                    <option value="A206">Phòng A206</option>
                    <option value="A207">Phòng A207</option>
                  </select>
                </div>

                {recordedSuccess && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Đã cập nhật chỉ số mới và tính toán lại hóa đơn cho phòng {currentRoom}!</span>
                  </div>
                )}

                <form onSubmit={handleRecordMeter} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground font-semibold block">
                        Điện Mới (kWh)
                      </label>
                      <input
                        type="number"
                        value={elecNew}
                        onChange={(e) => setElecNew(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-border bg-[#eff6ff] dark:bg-[#1c262c] font-mono text-sm font-bold text-foreground"
                      />
                      <span className="text-[10px] text-muted-foreground block">
                        Chỉ số cũ: {elecOld} ({deltaElec} kWh)
                      </span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground font-semibold block">
                        Nước Mới (m³)
                      </label>
                      <input
                        type="number"
                        value={waterNew}
                        onChange={(e) => setWaterNew(Number(e.target.value))}
                        className="w-full p-2 rounded-lg border border-border bg-[#eff6ff] dark:bg-[#1c262c] font-mono text-sm font-bold text-foreground"
                      />
                      <span className="text-[10px] text-muted-foreground block">
                        Chỉ số cũ: {waterOld} ({deltaWater} m³)
                      </span>
                    </div>
                  </div>

                  {elecNew < elecOld && (
                    <div className="p-2 bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Lỗi: Chỉ số mới ({elecNew}) không được nhỏ hơn chỉ số cũ ({elecOld})!</span>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-[#eff6ff] dark:bg-[#1c262c] border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tổng tiền phòng {currentRoom}:</span>
                    <strong className="font-mono text-primary text-sm">₫{totalBill.toLocaleString()}</strong>
                  </div>

                  <Button
                    type="submit"
                    disabled={elecNew < elecOld}
                    className="w-full bg-primary text-white text-xs font-bold h-9"
                  >
                    Lưu & Cập Nhật Số Liệu Phòng {currentRoom}
                  </Button>
                </form>
              </div>

              {/* Box 2: Tiến độ thu nợ & Hành động cán bộ */}
              <div className="bg-white dark:bg-[#161e23] border border-border rounded-xl shadow-md p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-bold text-sm text-foreground">
                    Tiến Độ Thu Phí Tòa A (T09/2026)
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    92.7% hoàn tất
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: "92.7%" }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Đã thu: 178 / 192 sinh viên</span>
                    <span className="text-rose-500 font-semibold">Còn 14 SV chưa nộp</span>
                  </div>
                </div>

                {publishedBatch && (
                  <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Đã gửi thông báo hóa đơn T09 kèm VietQR đến toàn bộ 192 sinh viên Tòa A!</span>
                  </div>
                )}

                {remindedBatch && (
                  <div className="p-3 bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Đã gửi tin nhắn nhắc nộp tiền đến 14 sinh viên chưa hoàn tất!</span>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handlePublishBatch}
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm rounded-lg"
                  >
                    <Send className="h-4 w-4" />
                    <span>Phát Hành Hóa Đơn & Mã VietQR Cho 192 SV</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleRemindBatch}
                    className="w-full h-9 border-border text-xs font-semibold flex items-center justify-center gap-2 text-foreground"
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Gửi Nhắc Nhở Đến 14 SV Chưa Nộp</span>
                  </Button>
                </div>
              </div>

              {/* Box 3: Lịch sử quyết toán các tháng trước của Tòa A */}
              <div className="bg-white dark:bg-[#161e23] rounded-xl border border-border p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-bold text-sm text-foreground">
                    Lịch Sử Doanh Thu Điện Nước Tòa A
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-mono">Năm 2026</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-2 px-2">Kỳ</th>
                        <th className="py-2 px-2">Tổng Thu</th>
                        <th className="py-2 px-2">Trạng Thái</th>
                        <th className="py-2 px-2 text-right">Bảng Kê</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { month: "Tháng 08/2026", amount: "₫52,700,000", status: "Đạt 100%" },
                        { month: "Tháng 07/2026", amount: "₫47,600,000", status: "Đạt 100%" },
                        { month: "Tháng 06/2026", amount: "₫45,300,000", status: "Đạt 100%" },
                      ].map((inv, idx) => (
                        <tr key={idx} className="hover:bg-[#eff6ff] dark:hover:bg-[#1c262c] transition-colors">
                          <td className="py-2.5 px-2 font-semibold text-foreground">{inv.month}</td>
                          <td className="py-2.5 px-2 font-mono text-foreground">{inv.amount}</td>
                          <td className="py-2.5 px-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>{inv.status}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <button
                              onClick={() => alert(`Đang tải bảng kê ${inv.month}...`)}
                              className="p-1 rounded text-primary hover:bg-[#eff6ff] dark:hover:bg-[#1c262c]"
                              title="Tải bảng kê"
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
          ) : (
            /* ========================================================================= */
            /* SINH VIÊN: THANH TOÁN NHANH VIETQR & LỊCH SỬ HÓA ĐƠN CỦA PHÒNG            */
            /* ========================================================================= */
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#161e23] border border-border rounded-xl shadow-md p-5 space-y-4">
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
                    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#161e23] rounded-xl border border-border shadow-2xs">
                      <div className="flex items-center justify-between w-full mb-2.5 px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Mã Quét VietQR
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadQr}
                          className="h-7 px-2.5 text-[11px] gap-1.5 font-bold bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white transition-all shadow-2xs"
                          title="Tải ảnh mã QR về máy để mở quét trong ứng dụng ngân hàng"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Tải ảnh QR</span>
                        </Button>
                      </div>

                      <div className="relative p-2 bg-white rounded-xl shadow-xs border border-gray-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=2|99|09182391024|KY_TUC_XA_FPT|${netDue}|DIENNUOC_${currentRoom}_${user?.studentId || "SE182049"}`}
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
                          DIENNUOC {currentRoom} {user?.studentId || "SE182049"}
                        </span>
                      </div>
                    </div>

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

              {/* Student Historical Table */}
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
                    <tbody className="divide-y border-border">
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
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>Đã thanh toán ({inv.date})</span>
                            </span>
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
          )}
        </div>
      </div>

      {/* DISPUTE READING MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#161e23] border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Khiếu Nại Số Đo Điện Nước Phòng {currentRoom}
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
                <h4 className="font-bold text-sm text-foreground">Đã Gửi Yêu Cầu Kiểm Tra!</h4>
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

      {/* LIGHTBOX MODAL: FULL RESOLUTION METER PHOTO */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-card rounded-2xl overflow-hidden border border-border shadow-2xl space-y-3">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <div>
                <h3 className="font-bold text-sm text-foreground">{previewImage.title}</h3>
                <p className="text-[11px] text-muted-foreground">{previewImage.subtext}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-black/20 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>

            <div className="p-3.5 bg-muted/30 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                Đóng ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
