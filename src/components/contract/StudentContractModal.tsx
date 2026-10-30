import React from "react"
import { createPortal } from "react-dom"
import {
  FileText,
  X,
  Download,
  CheckCircle2,
  Building2,
  ShieldCheck,
  UserCheck,
  Check,
} from "lucide-react"
import type { UserProfile } from "@/types/auth"
import { generateStudentRentalContractPDF } from "@/lib/pdfGenerator"

interface StudentContractModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile
}

export const StudentContractModal: React.FC<StudentContractModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) return null

  const studentName = user.fullName || "Trần Thanh Nguyên"
  const studentId = user.studentId || "SE185240"
  const room = user.dormitoryStatus?.room || "A205"
  const building = user.dormitoryStatus?.building || "Tòa A (Khu Nam)"
  const bedCode = user.dormitoryStatus?.bedCode || "A205-B-G03"
  const compartment = user.dormitoryStatus?.compartment || "Buồng B (Balcony Wing)"
  const contractCode = `CTR-2026-${studentId}`

  const handleDownloadPdf = () => {
    generateStudentRentalContractPDF({
      contractCode,
      studentName,
      studentId,
      citizenId: user.citizenId || "079204001235",
      dob: user.dob || "2004-05-15",
      hometown: user.hometown || "TP. Hồ Chí Minh",
      phone: user.phone || "0912 345 678",
      email: user.email || `${studentId.toLowerCase()}@fpt.edu.vn`,
      major: user.major || "Kỹ thuật phần mềm (Software Engineering)",
      building,
      room,
      compartment,
      bedCode,
      semester: "Học kỳ 1 Năm học 2026–2027 (Fall 2026)",
      startDate: user.dormitoryStatus?.contractStart || "01/09/2026",
      endDate: user.dormitoryStatus?.contractEnd || "15/01/2027",
      depositAmount: 1000000,
      rentFeePerMonth: 950000,
      totalRentFee: 3800000,
      parentName: user.emergencyContact?.parentName || "Nguyễn Văn Hùng",
      parentPhone: user.emergencyContact?.phone || "0903 123 456",
    })
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative my-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[calc(100vh-3rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Hợp Đồng Lưu Trú Ký Túc Xá Điện Tử
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  ĐANG HIỆU LỰC
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mã số: <span className="font-mono font-bold text-primary">{contractCode}</span> • Học kỳ Fall 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Highlight Room Info Card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/15 pb-2">
            <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{building} • Phòng {room}</span>
            </span>
            <span className="font-mono font-bold text-xs text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
              Giường: {bedCode}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground block">Khu vực buồng:</span>
              <span className="font-semibold text-foreground">{compartment}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Thời hạn hợp đồng:</span>
              <span className="font-semibold text-foreground">01/09/2026 – 15/01/2027</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Tình trạng tài chính:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Đã nộp 100% tiền phòng & cọc</span>
            </div>
          </div>
        </div>

        {/* Contract Parties & Terms */}
        <div className="space-y-3 text-xs">
          {/* Bên A & Bên B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1.5 text-xs text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>BÊN CHO THUÊ (BÊN A)</span>
              </div>
              <div className="font-semibold text-foreground">Ban Quản lý KTX Đại học FPT</div>
              <div className="text-[11px] text-muted-foreground">Đại diện: Ông Vũ Thành Nam (Trưởng BQL)</div>
              <div className="text-[11px] text-muted-foreground">Địa chỉ: KĐT FPT City, Q. Ngũ Hành Sơn, Đà Nẵng</div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1.5 text-xs text-primary">
                <UserCheck className="h-3.5 w-3.5" />
                <span>BÊN THUÊ (BÊN B - SINH VIÊN)</span>
              </div>
              <div className="font-semibold text-foreground">{studentName} (MSSV: {studentId})</div>
              <div className="text-[11px] text-muted-foreground">Số CCCD: {user.citizenId || "079204001235"}</div>
              <div className="text-[11px] text-muted-foreground">Quê quán: {user.hometown || "TP. Hồ Chí Minh"}</div>
            </div>
          </div>

          {/* Điều khoản quan trọng */}
          <div className="rounded-xl border border-border bg-background p-4 space-y-2">
            <div className="font-bold text-foreground text-xs">Nội dung thỏa thuận chính:</div>
            <ul className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Điều 1 (Chỗ ở):</strong> Bên A bố trí cho Bên B một vị trí giường ngủ cá nhân kèm bàn học và tủ có khóa tại phòng {room}, {compartment}.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Điều 2 (Tài chính):</strong> Phí lưu trú 950.000 đ/tháng (3.800.000 đ/kỳ) và 1.000.000 đ tiền cọc thiết bị đã hoàn tất. Tiền điện nước phòng chia đều theo số người thực tế.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Điều 3 (Nội quy):</strong> Tuân thủ giờ giới nghiêm 23:00, không đun nấu trong phòng ngủ, giữ gìn vệ sinh chung và chấp hành nội quy KTX Đại học FPT.
                </span>
              </li>
            </ul>
          </div>

          {/* Dấu xác nhận điện tử */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-300/40 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                ✓
              </span>
              <div>
                <div className="font-bold text-foreground text-xs">Hợp đồng điện tử đã xác thực</div>
                <div className="text-[10px] text-muted-foreground">Ký số điện tử bởi Sinh viên & Ban Quản lý KTX FPT</div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {user.dormitoryStatus?.contractStart || "01/09/2026"}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            Đóng
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Tải Tệp Hợp Đồng (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}

export default StudentContractModal
