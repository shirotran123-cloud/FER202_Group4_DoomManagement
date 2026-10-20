import React from "react"
import { BedDouble } from "lucide-react"

export const BookingStubPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-card to-sky-500/5 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
              <BedDouble className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Module 2 & 3 • Đặt phòng và chọn giường
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Bản Đồ Chọn Giường Trực Quan & Khóa 15 Phút
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Thành viên phụ trách:</p>
            <p className="text-xs font-bold text-foreground">🎨 Trần Công Tiến & 💾 Trần Thanh Nguyên</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>1. Cấu trúc 1 Phòng = 4 Buồng = 24 Giường</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Hiển thị phân tầng trực quan theo Tòa ➔ Tầng ➔ Phòng ➔ Buồng (A, B, C, D) ➔ Giường (G01 - G06).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span>
              <span>2. Khóa giữ chỗ 15 Phút</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Đồng hồ đếm ngược 900 giây, hiển thị mã VietQR động để thanh toán tiền ở học kỳ.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span>3. Auto-Approval Engine</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Tự động xét duyệt 0-chạm đối soát giới tính, hợp đồng và xuất e-Contract PDF tức thì.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-bold text-sm text-foreground">
            Bản mô phỏng Phòng A205 (Tòa A - Tầng 2 - 24 Giường)
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-emerald-500 inline-block"></span> Trống (Available)</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-sky-500 inline-block"></span> Đang giữ (Holding 15m)</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-slate-400 inline-block"></span> Đã ở (Occupied)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Buồng A (6 Giường)", "Buồng B (6 Giường)", "Buồng C (6 Giường)", "Buồng D (6 Giường)"].map((compartment, ci) => (
            <div key={ci} className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
              <p className="font-bold text-xs text-foreground text-center border-b border-border pb-2">
                {compartment}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, 6].map((bedNum) => {
                  const isMine = ci === 1 && bedNum === 3
                  const isOccupied = (ci + bedNum) % 3 === 0
                  const isHolding = ci === 0 && bedNum === 2

                  return (
                    <div
                      key={bedNum}
                      className={`p-2.5 rounded-xl text-center text-xs font-mono font-bold transition-transform hover:scale-105 cursor-pointer ${
                        isMine
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : isHolding
                          ? "bg-sky-500/20 text-sky-600 border border-sky-500/40"
                          : isOccupied
                          ? "bg-muted text-muted-foreground"
                          : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                      }`}
                    >
                      <p className="text-[10px]">G0{bedNum}</p>
                      <p className="text-[9px] font-normal font-sans">
                        {isMine ? "Của bạn" : isHolding ? "15:00" : isOccupied ? "Đã ở" : "Trống"}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}