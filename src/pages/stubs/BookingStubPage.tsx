 import React from "react"
import { BedDouble } from "lucide-react"

export const BookingStubPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-card to-orange-500/5 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
              <BedDouble className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Module 2 & 3 â€¢ Use Case UC-05 - UC-13
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Báº£n Äá»“ Chá»n GiÆ°á»ng Trá»±c Quan 1:4:6 & KhÃ³a 15 PhÃºt
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">ThÃ nh viÃªn phá»¥ trÃ¡ch:</p>
            <p className="text-xs font-bold text-foreground">ðŸŽ¨ Tráº§n CÃ´ng Tiáº¿n & ðŸ’¾ Tráº§n Thanh NguyÃªn</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>1. MÃ´ hÃ¬nh 1 PhÃ²ng = 4 Buá»“ng = 24 GiÆ°á»ng</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Hiá»ƒn thá»‹ phÃ¢n táº§ng trá»±c quan theo TÃ²a âž” Táº§ng âž” PhÃ²ng âž” Buá»“ng (A, B, C, D) âž” GiÆ°á»ng (G01 - G06).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              <span>2. KhÃ³a giá»¯ chá»— 15 PhÃºt (UC-10)</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Äá»“ng há»“ Ä‘áº¿m ngÆ°á»£c 900 giÃ¢y, hiá»ƒn thá»‹ mÃ£ VietQR Ä‘á»™ng Ä‘á»ƒ thanh toÃ¡n tiá»n cá»c 1.000.000 VNÄ.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span>3. Auto-Approval Engine (UC-11)</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Tá»± Ä‘á»™ng xÃ©t duyá»‡t 0-cháº¡m Ä‘á»‘i soÃ¡t giá»›i tÃ­nh, há»£p Ä‘á»“ng vÃ  xuáº¥t e-Contract PDF tá»©c thÃ¬.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-bold text-sm text-foreground">
            Báº£n mÃ´ phá»ng PhÃ²ng A205 (TÃ²a A - Táº§ng 2 - 24 GiÆ°á»ng)
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-emerald-500 inline-block"></span> Trá»‘ng (Available)</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-orange-500 inline-block"></span> Äang giá»¯ (Holding 15m)</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-md bg-slate-400 inline-block"></span> ÄÃ£ á»Ÿ (Occupied)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Buá»“ng A (6 GiÆ°á»ng)", "Buá»“ng B (6 GiÆ°á»ng)", "Buá»“ng C (6 GiÆ°á»ng)", "Buá»“ng D (6 GiÆ°á»ng)"].map((compartment, ci) => (
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
                          ? "bg-orange-500/20 text-orange-600 border border-orange-500/40"
                          : isOccupied
                          ? "bg-muted text-muted-foreground"
                          : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                      }`}
                    >
                      <p className="text-[10px]">G0{bedNum}</p>
                      <p className="text-[9px] font-normal font-sans">
                        {isMine ? "Cá»§a báº¡n" : isHolding ? "15:00" : isOccupied ? "ÄÃ£ á»Ÿ" : "Trá»‘ng"}
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