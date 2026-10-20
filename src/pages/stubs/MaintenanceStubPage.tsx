 import React from "react"
import { Wrench, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

export const MaintenanceStubPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-card to-cyan-500/5 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                Module 5 â€¢ Há»‡ thá»‘ng báº£o trÃ¬
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Há»‡ Thá»‘ng BÃ¡o Há»ng Thiáº¿t Bá»‹ & Äiá»u Phá»‘i Ká»¹ Thuáº­t
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">ThÃ nh viÃªn phá»¥ trÃ¡ch:</p>
            <p className="text-xs font-bold text-foreground">ðŸ›¡ï¸ Äinh Thanh Trung</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <AlertTriangle className="h-5 w-5 text-cyan-600" />
            <h3 className="font-bold text-foreground">1. Táº¡o Phiáº¿u BÃ¡o Há»ng</h3>
            <p className="text-muted-foreground leading-relaxed">
              PhÃ¢n Ä‘á»‹nh rÃµ sá»± cá»‘ phÃ²ng chung (Ä‘iá»u hÃ²a, cá»­a chÃ­nh) hay buá»“ng cÃ¡ nhÃ¢n (Ä‘Ã¨n há»c, á»• cáº¯m), táº£i áº£nh minh chá»©ng.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-foreground">2. Äiá»u Phá»‘i Ká»¹ Thuáº­t</h3>
            <p className="text-muted-foreground leading-relaxed">
              CÃ¡n bá»™ ká»¹ thuáº­t tiáº¿p nháº­n nhanh chóng, cáº­p nháº­t tráº¡ng thÃ¡i sá»­a chá»¯a vÃ  chá»¥p áº£nh nghiá»‡m thu hoÃ n táº¥t.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-foreground">3. ÄÃ¡nh GiÃ¡ HÃ i LÃ²ng 1-5 Sao</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sinh viÃªn xÃ¡c nháº­n kháº¯c phá»¥c thÃ nh cÃ´ng vÃ  Ä‘Ã¡nh giÃ¡ cháº¥t lÆ°á»£ng phá»¥c vá»¥ cá»§a nhÃ¢n viÃªn ká»¹ thuáº­t.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}