import React from "react"
import { CheckSquare } from "lucide-react"

export const QATestPlanPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Quality Assurance • Deliverables Tuần 1 - 5
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Ma Trận Kiểm Thử 28 Use Cases & Kịch Bản Demo Bảo Vệ Đồ Án
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Thành viên phụ trách:</p>
            <p className="text-xs font-bold text-foreground">🧪 Huỳnh Gia Kim (QA Lead)</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground">Case 1: Concurrency Race Condition</h3>
            <p className="text-muted-foreground leading-relaxed">
              Hai sinh viên cùng chọn 1 giường trong 1 tích tắc ➔ Hệ thống khóa đúng 1 người, hiển thị thông báo giường đang giữ cho người còn lại.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground">Case 2: 15-Minute Timeout Rollback</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sau 15:00 không quét mã QR thanh toán ➔ Giường tự động giải phóng về trạng thái xanh lá (AVAILABLE).
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground">Case 3: Pro-Rata Utility Split</h3>
            <p className="text-muted-foreground leading-relaxed">
              Tổng tiền chia cho các cá nhân trong phòng khớp 100% với hóa đơn phòng (lệch tối đa 1 VNĐ làm tròn).
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 space-y-2">
            <h3 className="font-bold text-red-600">Case 4: Curfew Violation 23:00 (UC-25, 26)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Quét thẻ sinh viên sau 23:00 không có đơn xin phép ➔ Tự động gắn cờ vi phạm màu đỏ, trừ 10 điểm rèn luyện và lập biên bản.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-2">
            <h3 className="font-bold text-amber-600">Case 5: Maintenance 2h & 1-5 Star (UC-20 - 23)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Phiếu báo hỏng khẩn cấp có đồng hồ ETA 2h, kỹ thuật viên cập nhật linh kiện thay thế, sinh viên nghiệm thu đánh giá 1-5 sao đóng phiếu.
            </p>
          </div>
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 space-y-2">
            <h3 className="font-bold text-purple-600">Case 6: Excel .xlsx Export & Donut (UC-27, 28)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Xuất file Excel danh sách tạm trú công an & công nợ quá hạn có định dạng bảng chuẩn, biểu đồ tỷ lệ lấp đầy trực quan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}