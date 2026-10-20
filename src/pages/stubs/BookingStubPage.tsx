import React from "react"
import { BedDouble } from "lucide-react"

export const BookingStubPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-card to-sky-500/5 p-8 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
              <BedDouble className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-sky-600 uppercase">
                Module 2 & 3 • Đặt phòng và chọn giường
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Bản Đồ Chọn Giường Trực Quan 1:4:6 & Khóa 15 Phút
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              Thành viên phụ trách:
            </p>
            <p className="text-xs font-bold text-foreground">
              🎨 Trần Công Tiến & 💾 Trần Thanh Nguyên
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold text-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>1. Mô hình 1 Phòng = 4 Buồng = 24 Giường</span>
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Hiển thị phân tầng trực quan theo Tòa ➔ Tầng ➔ Phòng ➔ Buồng (A,
              B, C, D) ➔ Giường (G01 - G06).
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold text-foreground">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span>
              <span>2. Khóa giữ chỗ 15 Phút</span>
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Đồng hồ đếm ngược 900 giây, hiển thị mã VietQR động để thanh toán
              tiền cọc 1.000.000 VNĐ.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-bold text-foreground">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span>3. Auto-Approval Engine</span>
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Tự động xét duyệt 0-chạm đối soát giới tính, hợp đồng và xuất
              e-Contract PDF tức thì.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-foreground">
            Bản mô phỏng Phòng A205 (Tòa A - Tầng 2 - 24 Giường)
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-md bg-emerald-500"></span>{" "}
              Trống (Available)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-md bg-sky-500"></span>{" "}
              Đang giữ (Holding 15m)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-md bg-slate-400"></span>{" "}
              Đã ở (Occupied)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            "Buồng A (6 Giường)",
            "Buồng B (6 Giường)",
            "Buồng C (6 Giường)",
            "Buồng D (6 Giường)",
          ].map((compartment, ci) => (
            <div
              key={ci}
              className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4"
            >
              <p className="border-b border-border pb-2 text-center text-xs font-bold text-foreground">
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
                      className={`cursor-pointer rounded-xl p-2.5 text-center font-mono text-xs font-bold transition-transform hover:scale-105 ${
                        isMine
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : isHolding
                            ? "border border-sky-500/40 bg-sky-500/20 text-sky-600"
                            : isOccupied
                              ? "bg-muted text-muted-foreground"
                              : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-600"
                      }`}
                    >
                      <p className="text-[10px]">G0{bedNum}</p>
                      <p className="font-sans text-[9px] font-normal">
                        {isMine
                          ? "Của bạn"
                          : isHolding
                            ? "15:00"
                            : isOccupied
                              ? "Đã ở"
                              : "Trống"}
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
