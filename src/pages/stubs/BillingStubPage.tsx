import React from "react"
import { Receipt, Camera, Calculator, QrCode } from "lucide-react"

export const BillingStubPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Module 4 • Quản lý điện nước và hóa đơn
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Quản Lý Chỉ Số Điện Nước Phòng & Hóa Đơn Chia Đều (Total / N)
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Thành viên phụ trách:</p>
            <p className="text-xs font-bold text-foreground">⚡ Văn Thái Trung</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-foreground">1. Nhập Số Công Tơ Kèm Ảnh</h3>
            <p className="text-muted-foreground leading-relaxed">
              Quản lý chụp ảnh đồng hồ điện nước ngày 25-28 hàng tháng, nhập kWh và m³ với cơ chế cảnh báo nếu tiêu thụ tăng đột biến 200%.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-foreground">2. Thuật Toán Chia Tiền Phòng</h3>
            <p className="text-muted-foreground leading-relaxed">
              Tự động cộng thuế VAT (Điện 8%, Nước 5%) và chia đều cho N sinh viên đang cư trú thực tế theo tỷ lệ số ngày ở (Pro-rata).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <QrCode className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-foreground">3. Thanh Toán VietQR Cá Nhân</h3>
            <p className="text-muted-foreground leading-relaxed">
              Mỗi sinh viên sở hữu mã VietQR riêng có cú pháp chuẩn `DMS [MãHĐ] [MSSV]`, tự động gạch nợ sau khi chuyển khoản.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-sm text-foreground">
          Bảng Thống Kê Giả Định Phòng A205 (Tháng 09/2026)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
            <p className="text-muted-foreground text-[11px]">Tiêu thụ điện</p>
            <p className="text-lg font-bold text-foreground">185 kWh</p>
            <p className="text-[10px] text-muted-foreground">Đơn giá: 2.500 đ + 8% VAT</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
            <p className="text-muted-foreground text-[11px]">Tiêu thụ nước</p>
            <p className="text-lg font-bold text-foreground">28 m³</p>
            <p className="text-[10px] text-muted-foreground">Đơn giá: 12.000 đ + 5% VAT</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
            <p className="text-muted-foreground text-[11px]">Số thành viên (N)</p>
            <p className="text-lg font-bold text-foreground">6 Sinh viên</p>
            <p className="text-[10px] text-muted-foreground">Buồng B & C</p>
          </div>
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-1">
            <p className="text-sky-600 dark:text-sky-400 text-[11px] font-bold">Mỗi người đóng (Total / N)</p>
            <p className="text-lg font-bold text-sky-600 dark:text-sky-400">142.500 VNĐ</p>
            <p className="text-[10px] text-muted-foreground">Chỉ tính tiền điện và nước thực tế</p>
          </div>
        </div>
      </div>
    </div>
  )
}