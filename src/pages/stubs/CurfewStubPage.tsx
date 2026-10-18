 import React from "react"
import { ClockAlert, ShieldCheck, FileText, AlertCircle } from "lucide-react"

export const CurfewStubPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <ClockAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Module 6 • Giới nghiêm và an ninh
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Quản Lý Giờ Giới Nghiêm 23:00 & Kỷ Luật Lưu Trú
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Thành viên phụ trách:</p>
            <p className="text-xs font-bold text-foreground">🛡️ Đinh Thanh Trung</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <FileText className="h-5 w-5 text-sky-600" />
            <h3 className="font-bold text-foreground">1. Đơn Vắng Mặt / Về Muộn</h3>
            <p className="text-muted-foreground leading-relaxed">
              Nộp trực tuyến trước 21:00 hàng ngày với lý do học tập, làm thêm, hoặc về quê cuối tuần.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <ShieldCheck className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-foreground">2. Cổng Quét Thẻ Bảo Vệ</h3>
            <p className="text-muted-foreground leading-relaxed">
              Tra cứu nhanh MSSV qua mã vạch; tự động gắn cờ vi phạm nếu quét sau 23:00 mà không có đơn duyệt.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-foreground">3. Trừ Điểm Rèn Luyện</h3>
            <p className="text-muted-foreground leading-relaxed">
              Mỗi sinh viên có 100 điểm ban đầu. Tự động cảnh báo khi bị trừ trên 20 điểm và đình chỉ khi quá 30 điểm.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}