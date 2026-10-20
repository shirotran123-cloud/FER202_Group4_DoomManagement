import React, { useState } from "react"
import {
  CalendarCheck2,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import type { UserProfile } from "@/types/auth"

interface ContractRenewalModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile
  onRenewed?: () => void
}

export const ContractRenewalModal: React.FC<ContractRenewalModalProps> = ({
  isOpen,
  onClose,
  user,
  onRenewed,
}) => {
  const [optionType, setOptionType] = useState<"keep" | "private_4" | "standard_6">("keep")
  const [note, setNote] = useState("")
  const [agreed, setAgreed] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return localStorage.getItem("dms_renewal_status") === "submitted"
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      alert("Vui lòng đồng ý với cam kết quy chế ký túc xá để tiếp tục.")
      return
    }
    localStorage.setItem("dms_renewal_status", "submitted")
    setIsSubmitted(true)
    if (onRenewed) onRenewed()
  }

  const handleCancelRenewal = () => {
    if (confirm("Bạn có chắc chắn muốn hủy đơn gia hạn hợp đồng kỳ Spring 2027 này không?")) {
      localStorage.removeItem("dms_renewal_status")
      setIsSubmitted(false)
      if (onRenewed) onRenewed()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Đơn Gia Hạn Hợp Đồng KTX
              </h3>
              <p className="text-xs text-muted-foreground">
                Học kỳ Spring 2027 (15/01/2027 – 15/05/2027)
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

        {isSubmitted ? (
          /* Màn hình đã nộp đơn thành công */
          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-foreground">
                Đã Nộp Đơn Gia Hạn Thành Công!
              </h4>
              <p className="text-xs text-muted-foreground">
                Mã hồ sơ: <span className="font-mono font-bold text-foreground">EXT-2027-049</span> • Học kỳ Spring 2027
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sinh viên nộp đơn:</span>
                <span className="font-semibold text-foreground">{user.fullName} ({user.studentId || "SE182049"})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vị trí giường đăng ký:</span>
                <span className="font-mono font-bold text-sky-600">A205-B-G03 (Buồng B)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hạn hợp đồng mới:</span>
                <span className="font-semibold text-foreground">15/01/2027 – 15/05/2027</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái xét duyệt:</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Ưu tiên duyệt tự động (Điểm 100/100)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              * Ban Quản Lý KTX Tòa A sẽ xuất hợp đồng điện tử mới và gửi thông báo chốt danh sách buồng trước ngày <strong>05/01/2027</strong>.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCancelRenewal}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Hủy nộp đơn
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        ) : (
          /* Form điền gia hạn */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Bed Info */}
            <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Vị trí hiện tại:</span>
                <span className="font-bold text-foreground">Phòng A205 • Buồng B</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mã giường (SSOT):</span>
                <span className="font-mono font-bold text-sky-600">A205-B-G03</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Hạn hợp đồng hiện tại:</span>
                <span className="font-semibold text-foreground">15/01/2027</span>
              </div>
            </div>

            {/* Fast-track eligibility check */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Công nợ</p>
                  <p className="text-xs font-bold text-emerald-600">0 VNĐ (Đủ ĐK)</p>
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Ý thức nội quy</p>
                  <p className="text-xs font-bold text-emerald-600">Tốt (Đủ ĐK)</p>
                </div>
              </div>
            </div>

            {/* Room Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                Nguyện vọng bố trí buồng kỳ Spring 2027:
              </label>

              <div className="space-y-2">
                {/* Option 1: Keep current bed */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                    optionType === "keep"
                      ? "border-sky-500 bg-sky-500/5 shadow-xs"
                      : "border-border bg-card hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="renewal_opt"
                    checked={optionType === "keep"}
                    onChange={() => setOptionType("keep")}
                    className="mt-1"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        Giữ nguyên giường A205-B-G03
                      </span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        Ưu tiên duyệt nhanh
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Buồng tiêu chuẩn (6 giường / buồng) • 800.000đ/tháng (3.200.000đ/kỳ 4 tháng)
                    </p>
                  </div>
                </label>

                {/* Option 2: Switch to Private 4 beds */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                    optionType === "private_4"
                      ? "border-sky-500 bg-sky-500/5 shadow-xs"
                      : "border-border bg-card hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="renewal_opt"
                    checked={optionType === "private_4"}
                    onChange={() => setOptionType("private_4")}
                    className="mt-1"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        Chuyển sang Buồng riêng tư (4 giường)
                      </span>
                      <span className="font-bold text-sky-600 text-[11px]">
                        1.000.000đ/tháng
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Không gian rộng rãi, yên tĩnh hơn • 4.000.000đ/kỳ 4 tháng
                    </p>
                  </div>
                </label>

                {/* Option 3: Switch to another Standard 6 beds */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                    optionType === "standard_6"
                      ? "border-sky-500 bg-sky-500/5 shadow-xs"
                      : "border-border bg-card hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="renewal_opt"
                    checked={optionType === "standard_6"}
                    onChange={() => setOptionType("standard_6")}
                    className="mt-1"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        Đổi sang Buồng tiêu chuẩn khác (6 giường)
                      </span>
                      <span className="font-bold text-muted-foreground text-[11px]">
                        800.000đ/tháng
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Đăng ký đổi vị trí giường/tầng khác • 3.200.000đ/kỳ 4 tháng
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Note */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Ghi chú nguyện vọng bổ sung (tùy chọn):
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Mong muốn xếp cùng buồng với bạn SV... hoặc ghi chú về sức khỏe."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Policy Agreement */}
            <label className="flex cursor-pointer items-start gap-2 pt-1 text-[11px] text-muted-foreground">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-border"
              />
              <span>
                Tôi cam kết hoàn thành phí lưu trú kỳ Spring 2027 khi có thông báo và tiếp tục thực hiện nghiêm túc nội quy KTX.
              </span>
            </label>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition-colors"
              >
                <CalendarCheck2 className="h-4 w-4" />
                <span>Nộp Đơn Gia Hạn Hợp Đồng</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
