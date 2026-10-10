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
                Quality Assurance â€¢ Deliverables Tuáº§n 1 - 5
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Ma Tráº­n Kiá»ƒm Thá»­ 28 Use Cases & Ká»‹ch Báº£n Demo Báº£o Vá»‡ Äá»“ Ãn
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">ThÃ nh viÃªn phá»¥ trÃ¡ch:</p>
            <p className="text-xs font-bold text-foreground">ðŸ§ª Huá»³nh Gia Kim (QA Lead)</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground">Case 1: Concurrency Race Condition</h3>
            <p className="text-muted-foreground leading-relaxed">
              Hai sinh viÃªn cÃ¹ng chá»n 1 giÆ°á»ng trong 1 tÃ­ch táº¯c âž” Há»‡ thá»‘ng khÃ³a Ä‘Ãºng 1 ngÆ°á»i, hiá»ƒn thá»‹ thÃ´ng bÃ¡o giÆ°á»ng Ä‘ang giá»¯ cho ngÆ°á»i cÃ²n láº¡i.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground">Case 2: 15-Minute Timeout Rollback</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sau 15:00 khÃ´ng quÃ©t mÃ£ QR thanh toÃ¡n âž” GiÆ°á»ng tá»± Ä‘á»™ng giáº£i phÃ³ng vá» tráº¡ng thÃ¡i xanh lÃ¡ (AVAILABLE).
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-bold text-foreground">Case 3: Pro-Rata Utility Split</h3>
            <p className="text-muted-foreground leading-relaxed">
              Tá»•ng tiá»n chia cho cÃ¡c cÃ¡ nhÃ¢n trong phÃ²ng khá»›p 100% vá»›i hÃ³a Ä‘Æ¡n phÃ²ng (lá»‡ch tá»‘i Ä‘a 1 VNÄ lÃ m trÃ²n).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}