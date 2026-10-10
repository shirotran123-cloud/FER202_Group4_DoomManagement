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
                Module 4 â€¢ Use Case UC-14 - UC-19
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Quáº£n LÃ½ Chá»‰ Sá»‘ Äiá»‡n NÆ°á»›c PhÃ²ng & HÃ³a ÄÆ¡n Chia Äá»u (Total / N)
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">ThÃ nh viÃªn phá»¥ trÃ¡ch:</p>
            <p className="text-xs font-bold text-foreground">âš¡ VÄƒn ThÃ¡i Trung</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-foreground">1. Nháº­p Sá»‘ CÃ´ng TÆ¡ KÃ¨m áº¢nh (UC-16)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Quáº£n lÃ½ chá»¥p áº£nh Ä‘á»“ng há»“ Ä‘iá»‡n nÆ°á»›c ngÃ y 25-28 hÃ ng thÃ¡ng, nháº­p kWh vÃ  mÂ³ vá»›i cÆ¡ cháº¿ cáº£nh bÃ¡o náº¿u tiÃªu thá»¥ tÄƒng Ä‘á»™t biáº¿n 200%.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-foreground">2. Thuáº­t ToÃ¡n Chia Tiá»n PhÃ²ng (UC-17)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Tá»± Ä‘á»™ng cá»™ng thuáº¿ VAT (Äiá»‡n 8%, NÆ°á»›c 5%) vÃ  chia Ä‘á»u cho N sinh viÃªn Ä‘ang cÆ° trÃº thá»±c táº¿ theo tá»· lá»‡ sá»‘ ngÃ y á»Ÿ (Pro-rata).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <QrCode className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-foreground">3. Thanh ToÃ¡n VietQR CÃ¡ NhÃ¢n (UC-18)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Má»—i sinh viÃªn sá»Ÿ há»¯u mÃ£ VietQR riÃªng cÃ³ cÃº phÃ¡p chuáº©n `DMS [MÃ£HÄ] [MSSV]`, tá»± Ä‘á»™ng gáº¡ch ná»£ sau khi chuyá»ƒn khoáº£n.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-sm text-foreground">
          Báº£ng Thá»‘ng KÃª Giáº£ Äá»‹nh PhÃ²ng A205 (ThÃ¡ng 09/2026)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
            <p className="text-muted-foreground text-[11px]">TiÃªu thá»¥ Ä‘iá»‡n</p>
            <p className="text-lg font-bold text-foreground">185 kWh</p>
            <p className="text-[10px] text-muted-foreground">ÄÆ¡n giÃ¡: 2.500 Ä‘ + 8% VAT</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
            <p className="text-muted-foreground text-[11px]">TiÃªu thá»¥ nÆ°á»›c</p>
            <p className="text-lg font-bold text-foreground">28 mÂ³</p>
            <p className="text-[10px] text-muted-foreground">ÄÆ¡n giÃ¡: 12.000 Ä‘ + 5% VAT</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
            <p className="text-muted-foreground text-[11px]">Sá»‘ thÃ nh viÃªn (N)</p>
            <p className="text-lg font-bold text-foreground">6 Sinh viÃªn</p>
            <p className="text-[10px] text-muted-foreground">Buá»“ng B1 & B2</p>
          </div>
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-1">
            <p className="text-orange-600 dark:text-orange-400 text-[11px] font-bold">Má»—i ngÆ°á»i Ä‘Ã³ng (Total / N)</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">142.500 VNÄ</p>
            <p className="text-[10px] text-muted-foreground">Bao gá»“m 30k phÃ­ vá»‡ sinh</p>
          </div>
        </div>
      </div>
    </div>
  )
}