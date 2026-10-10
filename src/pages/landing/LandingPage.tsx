 import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import {
  Building2,
  BedDouble,
  ShieldCheck,
  Zap,
  Receipt,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Flame,
  Wifi,
  Coffee,
  PhoneCall,
  MapPin,
} from "lucide-react"

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth()

  const highlights = [
    {
      icon: BedDouble,
      title: "MÃ´ hÃ¬nh Buá»“ng riÃªng 1:4:6",
      desc: "Cáº¥u trÃºc tiÃªu chuáº©n: 1 PhÃ²ng = 4 Buá»“ng riÃªng biá»‡t (A, B, C, D) = 24 GiÆ°á»ng. Má»—i sinh viÃªn sá»Ÿ há»¯u rÃ¨m che riÃªng tÆ°, á»• Ä‘iá»‡n, Ä‘Ã¨n há»c vÃ  tá»§ locker mÃ£ sá»‘.",
      tag: "Signature Topology",
    },
    {
      icon: Zap,
      title: "Auto-Approval 0-Cháº¡m",
      desc: "Engine tá»± Ä‘á»™ng Ä‘á»‘i soÃ¡t giá»›i tÃ­nh, thÃ´ng tin tuyá»ƒn sinh, tÃ¬nh tráº¡ng cÃ´ng ná»£ vÃ  thanh toÃ¡n cá»c trong 3 giÃ¢y. Cáº¥p ngay e-Contract PDF há»£p lá»‡.",
      tag: "Zero-Touch",
    },
    {
      icon: Clock,
      title: "KhÃ³a giá»¯ chá»— 15 PhÃºt",
      desc: "CÆ¡ cháº¿ khÃ³a concurrency lock thá»i gian thá»±c vá»›i Ä‘á»“ng há»“ Ä‘áº¿m ngÆ°á»£c 900s. TrÃ¡nh trÃ¹ng láº·p giÆ°á»ng khi hÃ ng trÄƒm tÃ¢n sinh viÃªn cÃ¹ng chá»n.",
      tag: "Realtime Lock",
    },
    {
      icon: Receipt,
      title: "Minh báº¡ch Äiá»‡n NÆ°á»›c (Total / N)",
      desc: "Chá»¥p áº£nh cÃ´ng tÆ¡ Ä‘iá»‡n nÆ°á»›c phÃ²ng ngÃ y 25-28 hÃ ng thÃ¡ng. Tá»± Ä‘á»™ng tÃ­nh thuáº¿ VAT vÃ  chia Ä‘á»u chÃ­nh xÃ¡c cho N sinh viÃªn Ä‘ang á»Ÿ kÃ¨m mÃ£ VietQR.",
      tag: "Pro-Rata Split",
    },
    {
      icon: ShieldCheck,
      title: "An ninh 24/7 & Giá»›i nghiÃªm 23:00",
      desc: "Cá»•ng kiá»ƒm soÃ¡t quÃ©t tháº» thÃ´ng minh. ÄÆ¡n xin vá» muá»™n ngoÃ i giá» ná»™p online trÆ°á»›c 21:00. Quáº£n lÃ½ Ä‘iá»ƒm rÃ¨n luyá»‡n KTX minh báº¡ch.",
      tag: "Smart Gate",
    },
    {
      icon: FileCheck,
      title: "BiÃªn báº£n BÃ n giao Sá»‘ hÃ³a",
      desc: "Checklist Ä‘iá»‡n tá»­ khi Check-in vÃ  Check-out vá»›i áº£nh hiá»‡n tráº¡ng thiáº¿t bá»‹, tá»± Ä‘á»™ng quyáº¿t toÃ¡n vÃ  hoÃ n cá»c khÃ´ng thá»§ tá»¥c rÆ°á»m rÃ .",
      tag: "Digital Handover",
    },
  ]

  const feeTable = [
    { item: "Tiá»n thuÃª giÆ°á»ng buá»“ng riÃªng", price: "900.000 VNÄ", unit: "thÃ¡ng / sinh viÃªn", note: "Thu theo ká»³ 4 thÃ¡ng (3.600.000 VNÄ)" },
    { item: "Tiá»n kÃ½ quá»¹ Ä‘áº·t cá»c tÃ i sáº£n", price: "1.000.000 VNÄ", unit: "láº§n Ä‘áº§u / hoÃ n láº¡i khi tráº£ phÃ²ng", note: "Quyáº¿t toÃ¡n sau khi trá»« hÆ° háº¡i náº¿u cÃ³" },
    { item: "ÄÆ¡n giÃ¡ Ä‘iá»‡n phÃ²ng", price: "2.500 VNÄ", unit: "kWh (chÆ°a VAT 8%)", note: "TÃ­nh theo chá»‰ sá»‘ cÃ´ng tÆ¡ phÃ²ng thá»±c táº¿" },
    { item: "ÄÆ¡n giÃ¡ nÆ°á»›c sinh hoáº¡t", price: "12.000 VNÄ", unit: "mÂ³ (chÆ°a VAT 5%)", note: "Chia Ä‘á»u cho sá»‘ thÃ nh viÃªn trong phÃ²ng" },
    { item: "PhÃ­ dá»‹ch vá»¥ & vá»‡ sinh hÃ nh lang", price: "30.000 VNÄ", unit: "thÃ¡ng / sinh viÃªn", note: "Bao gá»“m thu gom rÃ¡c, vá»‡ sinh khu chung" },
    { item: "Internet Wi-Fi tá»‘c Ä‘á»™ cao", price: "Miá»…n phÃ­", unit: "phá»§ sÃ³ng toÃ n tÃ²a nhÃ ", note: "TÃ­ch há»£p tÃ i khoáº£n sinh viÃªn FPT" },
  ]

  const rules = [
    {
      title: "1. Khung giá» Giá»›i nghiÃªm 23:00",
      content: "Cá»•ng kÃ½ tÃºc xÃ¡ Ä‘Ã³ng lÃºc 23:00 vÃ  má»Ÿ lÃºc 05:30 sÃ¡ng hÃ´m sau. Sinh viÃªn vá» muá»™n do lá»‹ch há»c/cÃ´ng viá»‡c cáº§n ná»™p Ä‘Æ¡n trá»±c tuyáº¿n trÃªn há»‡ thá»‘ng trÆ°á»›c 21:00.",
    },
    {
      title: "2. An toÃ n PhÃ²ng chÃ¡y & Thiáº¿t bá»‹ Ä‘iá»‡n",
      content: "NghiÃªm cáº¥m náº¥u Äƒn báº±ng báº¿p gas, báº¿p tá»«, ná»“i chiÃªn trong phÃ²ng ngá»§. Chá»‰ sá»­ dá»¥ng khu vá»±c báº¿p chung táº¡i Táº§ng 1. Tuyá»‡t Ä‘á»‘i khÃ´ng tá»± Ã½ cÃ¢u mÃ³c dÃ¢y Ä‘iá»‡n.",
    },
    {
      title: "3. Quáº£n lÃ½ Äiá»ƒm rÃ¨n luyá»‡n KTX (100 Äiá»ƒm)",
      content: "Má»—i sinh viÃªn báº¯t Ä‘áº§u vá»›i 100 Ä‘iá»ƒm. Vi pháº¡m giá» giá»›i nghiÃªm trá»« 5 Ä‘iá»ƒm/láº§n; gÃ¢y máº¥t tráº­t tá»± sau 23:00 trá»« 10 Ä‘iá»ƒm. Bá»‹ trá»« quÃ¡ 30 Ä‘iá»ƒm sáº½ Ä‘Ã¬nh chá»‰ lÆ°u trÃº ká»³ tiáº¿p theo.",
    },
    {
      title: "4. Quyá»n riÃªng tÆ° & Báº£o vá»‡ Buá»“ng cÃ¡ nhÃ¢n",
      content: "KhÃ´ng dáº«n ngÆ°á»i láº¡ hoáº·c ngÆ°á»i khÃ¡c giá»›i vÃ o buá»“ng ngá»§. Giá»¯ gÃ¬n chÃ¬a khÃ³a/tháº» tá»« cÃ¡ nhÃ¢n, khÃ³a tá»§ báº£o máº­t khi rá»i khá»i phÃ²ng.",
    },
  ]

  return (
    <div className="space-y-16 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-orange-500/5 p-8 sm:p-12 lg:p-16 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>FPT University Dormitory Management System â€¢ Ká»³ Fall 2026</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15]">
            KhÃ´ng Gian Sá»‘ng Chuáº©n Má»±c,{" "}
            <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Tráº£i Nghiá»‡m Äáº¡i Há»c Trá»n Váº¹n
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Há»‡ thá»‘ng Ä‘áº·t giÆ°á»ng vÃ  quáº£n lÃ½ KÃ½ tÃºc xÃ¡ trá»±c tuyáº¿n thÃ´ng minh. Tráº£i nghiá»‡m mÃ´ hÃ¬nh buá»“ng riÃªng <strong>1:4:6</strong> tiá»‡n nghi, cÆ¡ cháº¿ giá»¯ chá»— 15 phÃºt khÃ´ng xung Ä‘á»™t, vÃ  hÃ³a Ä‘Æ¡n Ä‘iá»‡n nÆ°á»›c minh báº¡ch chia theo thá»i gian thá»±c.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition-all hover:bg-orange-700 hover:shadow-orange-600/40"
            >
              <BedDouble className="h-4 w-4" />
              <span>Xem Báº£n Äá»“ & Äáº·t GiÆ°á»ng (UC-09)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
              >
                <span>ÄÄƒng Nháº­p Google SSO (UC-02)</span>
              </Link>
            ) : (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
              >
                <span>Há»“ SÆ¡ Cá»§a Báº¡n (UC-04)</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/60">
            <div>
              <p className="text-2xl font-black text-foreground">500+</p>
              <p className="text-xs text-muted-foreground">GiÆ°á»ng tiÃªu chuáº©n hiá»‡n Ä‘áº¡i</p>
            </div>
            <div>
              <p className="text-2xl font-black text-orange-600">15 PhÃºt</p>
              <p className="text-xs text-muted-foreground">KhÃ³a giá»¯ chá»— thanh toÃ¡n</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">100%</p>
              <p className="text-xs text-muted-foreground">Tá»± Ä‘á»™ng xÃ©t duyá»‡t 0-cháº¡m</p>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">24/7</p>
              <p className="text-xs text-muted-foreground">An ninh báº£o vá»‡ & Ká»¹ thuáº­t</p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      </section>

      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Ná»n táº£ng cÃ´ng nghá»‡
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            TÃ­nh NÄƒng Ná»•i Báº­t Chuáº©n IEEE 830
          </h2>
          <p className="text-sm text-muted-foreground">
            ÄÆ°á»£c phÃ¡t triá»ƒn Ä‘á»“ng bá»™ bÃ¡m sÃ¡t 28 Use Cases Ä‘áº·c táº£ trong tÃ i liá»‡u SRS KÃ½ tÃºc xÃ¡ FPT.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((h, i) => {
            const Icon = h.icon
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-orange-500/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                    {h.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{h.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Chi phÃ­ cÃ´ng khai
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Biá»ƒu PhÃ­ LÆ°u TrÃº & Dá»‹ch Vá»¥
            </h2>
            <p className="text-sm text-muted-foreground">
              Ãp dá»¥ng thá»‘ng nháº¥t cho TÃ²a nhÃ  A (Nam) vÃ  TÃ²a nhÃ  B (Ná»¯) nÄƒm há»c 2026-2027.
            </p>
          </div>
          <Link
            to="/billing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            <span>Tra cá»©u chi tiáº¿t hÃ³a Ä‘Æ¡n máº«u (Module 4)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border font-bold">
              <tr>
                <th className="px-5 py-3.5">Háº¡ng má»¥c dá»‹ch vá»¥</th>
                <th className="px-5 py-3.5">ÄÆ¡n giÃ¡ quy Ä‘á»‹nh</th>
                <th className="px-5 py-3.5">ÄÆ¡n vá»‹ tÃ­nh</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Ghi chÃº & ChÃ­nh sÃ¡ch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {feeTable.map((f, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{f.item}</span>
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                    {f.price}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{f.unit}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground hidden md:table-cell">
                    {f.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Ná»™i quy báº¯t buá»™c
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Quy Äá»‹nh Chung & Ká»· Luáº­t LÆ°u TrÃº
          </h2>
          <p className="text-sm text-muted-foreground">
            Sinh viÃªn cam káº¿t thá»±c hiá»‡n nghiÃªm tÃºc khi kÃ½ há»£p Ä‘á»“ng lÆ°u trÃº Ä‘iá»‡n tá»­.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-600" />
                <span>{r.title}</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-muted/20 p-8 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
            Tiá»‡n Ãch & KhÃ´ng Gian Chung Hiá»‡n Äáº¡i
          </h2>
          <p className="text-xs text-muted-foreground">
            MÃ´i trÆ°á»ng sinh hoáº¡t an toÃ n, tiá»‡n nghi giÃºp sinh viÃªn táº­p trung tá»‘i Ä‘a cho viá»‡c há»c.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <Wifi className="h-6 w-6 text-orange-600 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Wi-Fi 6 BÄƒng ThÃ´ng Rá»™ng</h4>
            <p className="text-[11px] text-muted-foreground">Phá»§ sÃ³ng toÃ n bá»™ phÃ²ng ngá»§ & sáº£nh</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <Coffee className="h-6 w-6 text-orange-600 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">PhÃ²ng Tá»± Há»c 24/7</h4>
            <p className="text-[11px] text-muted-foreground">MÃ¡y láº¡nh, bÃ n há»c nhÃ³m yÃªn tÄ©nh</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <Flame className="h-6 w-6 text-orange-600 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Báº¿p Ä‚n Chung Táº§ng 1</h4>
            <p className="text-[11px] text-muted-foreground">Khu vá»±c náº¥u nÆ°á»›ng an toÃ n PCCC</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <ShieldCheck className="h-6 w-6 text-orange-600 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Báº£o Vá»‡ & Camera AI 24/7</h4>
            <p className="text-[11px] text-muted-foreground">Kiá»ƒm soÃ¡t ra vÃ o thÃ´ng minh</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border pt-8 text-xs text-muted-foreground space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-orange-600" />
            <span className="font-bold text-foreground">Ban Quáº£n LÃ½ KÃ½ TÃºc XÃ¡ â€¢ Äáº¡i Há»c FPT</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <PhoneCall className="h-3.5 w-3.5 text-primary" />
              <span>Hotline: 0236 730 0999</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Khu ÄÃ´ thá»‹ FPT City, ÄÃ  Náºµng</span>
            </span>
          </div>
        </div>
        <div className="text-center text-[11px]">
          Â© 2026 FER202_Group4 â€¢ Äá»“ Ã¡n mÃ´n há»c FER202 Front-End Web Development with React.
        </div>
      </footer>
    </div>
  )
}