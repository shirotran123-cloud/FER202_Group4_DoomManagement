import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { AdminOverviewView } from "./AdminOverviewView"
import { StatCard, SectionCard } from "@/components/ui/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode, Receipt, Wrench, MoonStar, BedDouble, Building2, Zap, Droplets, Wifi, Snowflake, ShowerHead, WashingMachine, FileText, Users, ShieldCheck, Nfc, Phone, Siren, HeartPulse, X } from "lucide-react"

type Bed = { code: string; pos: string; name: string; mine?: boolean; empty?: boolean }

const COMPARTMENTS: { id: string; desc: string; used: string; beds: Bed[] }[] = [
  {
    id: "A",
    desc: "Hướng Ban Công",
    used: "5/6 Giường",
    beds: [
      { code: "G01", pos: "Dưới", name: "H. Long" },
      { code: "G02", pos: "Trên", name: "T. Tuấn" },
      { code: "G03", pos: "Dưới", name: "", empty: true },
      { code: "G04", pos: "Trên", name: "P. Quang" },
      { code: "G05", pos: "Dưới", name: "Đ. Khoa" },
      { code: "G06", pos: "Trên", name: "M. Đức" },
    ],
  },
  {
    id: "B",
    desc: "Buồng của bạn",
    used: "5/6 Giường",
    beds: [
      { code: "G01", pos: "Dưới", name: "B. Trần" },
      { code: "G02", pos: "Trên", name: "L. Nam" },
      { code: "G03", pos: "Dưới", name: "Vinh", mine: true },
      { code: "G04", pos: "Trên", name: "V. Thanh" },
      { code: "G05", pos: "Dưới", name: "N. Huy" },
      { code: "G06", pos: "Trên", name: "", empty: true },
    ],
  },
  {
    id: "C",
    desc: "Góc Tự Học",
    used: "4/6 Giường",
    beds: [
      { code: "G01", pos: "Dưới", name: "K. Minh" },
      { code: "G02", pos: "Trên", name: "", empty: true },
      { code: "G03", pos: "Dưới", name: "P. Linh" },
      { code: "G04", pos: "Trên", name: "T. Dung" },
      { code: "G05", pos: "Dưới", name: "", empty: true },
      { code: "G06", pos: "Trên", name: "S. Sơn" },
    ],
  },
  {
    id: "D",
    desc: "Cửa Ra Vào & WC",
    used: "4/6 Giường",
    beds: [
      { code: "G01", pos: "Dưới", name: "A. Hiền" },
      { code: "G02", pos: "Trên", name: "V. Khôi" },
      { code: "G03", pos: "Dưới", name: "", empty: true },
      { code: "G04", pos: "Trên", name: "", empty: true },
      { code: "G05", pos: "Dưới", name: "H. Phúc" },
      { code: "G06", pos: "Trên", name: "Q. Thắng" },
    ],
  },
]

function QrGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 100 100" aria-hidden="true">
      <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="5" />
      <rect fill="white" height="18" rx="2" width="18" x="10" y="10" />
      <rect fill="currentColor" height="10" width="10" x="14" y="14" />
      <rect fill="currentColor" height="28" rx="4" width="28" x="67" y="5" />
      <rect fill="white" height="18" rx="2" width="18" x="72" y="10" />
      <rect fill="currentColor" height="10" width="10" x="76" y="14" />
      <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="67" />
      <rect fill="white" height="18" rx="2" width="18" x="10" y="72" />
      <rect fill="currentColor" height="10" width="10" x="14" y="76" />
      <circle cx="48" cy="20" fill="currentColor" r="3" />
      <circle cx="48" cy="32" fill="currentColor" r="3" />
      <circle cx="56" cy="20" fill="currentColor" r="3" />
      <circle cx="42" cy="48" fill="currentColor" r="4" />
      <circle cx="58" cy="48" fill="currentColor" r="3" />
      <rect fill="currentColor" height="6" rx="2" width="12" x="44" y="64" />
      <rect fill="currentColor" height="16" rx="2" width="8" x="70" y="50" />
      <rect fill="currentColor" height="10" rx="2" width="10" x="82" y="70" />
      <rect fill="currentColor" height="6" rx="2" width="14" x="64" y="82" />
    </svg>
  )
}

export const StudentOverviewPage: React.FC = () => {
  const { user } = useAuth()
  const [qrCountdown, setQrCountdown] = useState(15)
  const [showGateQrModal, setShowGateQrModal] = useState(false)
  const displayName = user?.fullName || "Nguyễn Hoàng Vinh"
  const shortName = user?.fullName?.split(" ").slice(-1)[0] || "Vinh"

  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown((prev) => (prev <= 1 ? 15 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (user?.role === "admin" || user?.role === "manager") {
    return <AdminOverviewView />
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary p-6 text-primary-foreground shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="border-white/20 bg-white/15 text-white">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Resident
              </Badge>
              <Badge variant="secondary" className="border-white/20 bg-white/15 text-white">
                <Building2 className="h-3.5 w-3.5" /> Room A205 · Compartment B · Bed G03
              </Badge>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white/90">
                RFID: 8492-AX-01
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Chào buổi sáng, {displayName}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                Ký túc xá FPT University · Học kỳ Fall 2026 · Tòa A (High-Rise Hall)
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3 self-start lg:self-center">
            <Button variant="outline" onClick={() => setShowGateQrModal(true)} className="bg-white text-foreground hover:bg-muted">
              <QrCode /> Mã Cửa Ra Vào
            </Button>
            <Button asChild className="bg-primary text-white hover:bg-primary">
              <Link to="/billing">
                <Zap /> VietQR Quickpay
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <div className="flex flex-col gap-3">
          <StatCard label="Phòng hiện tại" value="A205" hint="Tầng 2 · Buồng B · Giường dưới G03 · 18/24 giường" tone="info" icon={<BedDouble className="h-5 w-5" />} />
          <div className="dms-card flex items-center justify-between p-3 text-xs">
            <span className="text-muted-foreground">Hợp đồng:</span>
            <span className="font-semibold text-success-soft-foreground">Hiệu lực (Kỳ 1)</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <StatCard label="Công nợ tháng 09" value="₫420,000" hint="Hạn nộp: còn 3 ngày (05/10)" tone="bad" icon={<Receipt className="h-5 w-5" />} />
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link to="/billing">
              <Receipt /> Thanh toán VietQR
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <StatCard label="Bảo trì kỹ thuật" value="2 đang xử lý" hint="1 khẩn: ổ cắm buồng B-G03 · NV Nguyễn Văn An" tone="warn" icon={<Wrench className="h-5 w-5" />} />
          <div className="dms-card p-3 text-xs">
            <p className="font-semibold">Lịch hẹn: hôm nay 14:30</p>
            <Link to="/maintenance" className="mt-1 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              <Wrench className="h-3.5 w-3.5" /> Theo dõi tiến độ
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <StatCard label="Giờ giới nghiêm" value="23:00" hint="Khóa cổng · Đã điểm danh / Trong phòng" tone="neutral" icon={<MoonStar className="h-5 w-5" />} />
          <Button asChild variant="outline">
            <Link to="/curfew">
              <MoonStar /> Nộp đơn về muộn
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            title="Sơ đồ phân bổ giường phòng A205"
            desc="4 buồng riêng (A, B, C, D) · 6 giường/buồng · 18 đã ở, 6 trống"
            actions={<Badge variant="secondary">Chuẩn 24B</Badge>}
          >
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-muted/70 px-3 py-1.5 text-xs">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="h-3 w-3 rounded bg-primary" /> Giường bạn
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-3 w-3 rounded bg-muted-foreground/30" /> Đã ở
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-success-soft-foreground">
                <span className="h-3 w-3 rounded border border-success/25 bg-success-soft" /> Trống
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {COMPARTMENTS.map((c) => (
                <div
                  key={c.id}
                  className={
                    c.id === "B"
                      ? "space-y-3 rounded-xl border-2 border-primary/40 bg-muted/70 p-4"
                      : "space-y-3 rounded-xl border border-border bg-muted/40 p-4"
                  }
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 whitespace-nowrap text-xs font-bold">Buồng {c.id}</span>
                      {c.id === "B" ? (
                        <Badge className="bg-primary text-white">Buồng của bạn</Badge>
                      ) : (
                        <span className="truncate whitespace-nowrap text-[11px] text-muted-foreground">{c.desc}</span>
                      )}
                    </div>
                    <span className="shrink-0 whitespace-nowrap rounded bg-muted px-2 py-0.5 text-[11px] font-semibold">
                      {c.used}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {c.beds.map((b) => (
                      <div
                        key={b.code}
                        className={
                          b.mine
                            ? "flex h-16 flex-col justify-between rounded-lg bg-primary p-2 text-white shadow-md"
                            : b.empty
                              ? "flex h-16 flex-col justify-between rounded-lg border border-success/25 bg-success-soft p-2 text-success-soft-foreground"
                              : "flex h-16 flex-col justify-between rounded-lg border border-border bg-card p-2"
                        }
                      >
                        {b.mine ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold">{b.code}</span>
                              <span className="rounded bg-primary px-1 text-[8px] font-extrabold text-white">BẠN</span>
                            </div>
                            <span className="truncate text-[10px] font-bold">{shortName}</span>
                            <span className="text-[9px] text-white/80">Tầng dưới</span>
                          </>
                        ) : b.empty ? (
                          <>
                            <span className="text-[11px] font-bold">{b.code} · {b.pos}</span>
                            <BedDouble className="mx-auto h-4 w-4" />
                            <span className="text-[9px] font-bold text-success-soft-foreground">TRỐNG</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold">{b.code} · {b.pos}</span>
                            <span className="truncate text-[11px] text-muted-foreground">{b.name}</span>
                            <span className="text-[9px] text-muted-foreground">Đã ở</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-4">
              {[
                { icon: <Wifi className="h-4 w-4" />, k: "Hall Wi-Fi", v: "KTX-A205-5G" },
                { icon: <Snowflake className="h-4 w-4" />, k: "Điều hòa", v: "Daikin Inverter 2HP" },
                { icon: <ShowerHead className="h-4 w-4" />, k: "Phòng tắm", v: "2 nhà tắm khép kín" },
                { icon: <WashingMachine className="h-4 w-4" />, k: "Khu giặt ủi", v: "Sảnh 2F phía Đông" },
              ].map((f) => (
                <div key={f.k} className="flex items-center gap-3">
                  <span className="text-muted-foreground">{f.icon}</span>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">{f.k}</div>
                    <div className="text-xs font-bold">{f.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Thao tác nhanh" desc="Dịch vụ sinh viên thường dùng">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { to: "/maintenance", icon: <Wrench className="h-5 w-5" />, t: "Báo hỏng thiết bị", d: "Báo sửa điện, điều hòa, nước" },
                { to: "/curfew", icon: <MoonStar className="h-5 w-5" />, t: "Xin giấy về muộn", d: "Nộp đơn ra vào sau 23:00" },
                { to: "/my-room", icon: <FileText className="h-5 w-5" />, t: "Biên bản bàn giao", d: "Kiểm tra tài sản và hoàn cọc" },
                { to: "/my-room", icon: <Users className="h-5 w-5" />, t: "Danh bạ cùng buồng", d: "Liên hệ 5 bạn cùng buồng B" },
              ].map((a) => (
                <Link key={a.t} to={a.to} className="dms-card group p-4 transition-all hover:bg-muted/60">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    {a.icon}
                  </div>
                  <div className="text-xs font-bold">{a.t}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{a.d}</div>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right */}
        <div className="space-y-6 lg:col-span-4">
          <div className="dms-card relative overflow-hidden bg-gradient-to-b from-primary to-primary p-6 text-primary-foreground">
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Nfc className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">Cổng kiểm soát tòa A</span>
                </div>
                <Badge className="bg-white/15 text-white">Dynamic NFC</Badge>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-white p-5 text-foreground">
                <div className="relative flex h-44 w-44 flex-col items-center justify-center rounded-lg border border-border bg-muted/50 p-3">
                  <QrGlyph className="h-full w-full text-primary" />
                  <div className="absolute inset-x-3 top-3 h-0.5 animate-pulse bg-success" />
                </div>
                <div className="mt-4 text-center">
                  <div className="text-xs font-bold">{displayName}</div>
                  <div className="mt-0.5 font-mono text-[10px] tracking-wider text-muted-foreground">TOKEN: #GATE-8492-2026A</div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-success-soft-foreground">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-success" />
                    Tự làm mới sau <span className="font-bold">{qrCountdown}s</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 px-1 text-xs text-white/70">
                <span className="truncate">Chạm NFC hoặc quét mã QR</span>
                <span className="shrink-0 whitespace-nowrap font-semibold text-white">&lt; 5cm</span>
              </div>
            </div>
          </div>

          <SectionCard
            title="Điện nước tháng 09"
            desc="T09/2026 · Auto-Split Matrix"
            actions={<Badge variant="secondary">Auto-Split</Badge>}
          >
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/70 p-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold">Công tơ điện</span>
                  </div>
                  <span className="text-xs font-semibold">170 kWh</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: "68%" }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Chỉ số: 12,450 → 12,620</span>
                  <span className="font-semibold text-foreground">₫425,000 tổng</span>
                </div>
              </div>
              <div className="rounded-xl bg-muted/70 p-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold">Đồng hồ nước</span>
                  </div>
                  <span className="text-xs font-semibold">14 m³</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: "52%" }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Chỉ số: 840 → 854</span>
                  <span className="font-semibold text-foreground">₫252,000 tổng</span>
                </div>
              </div>
              <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chia đều cho phòng (6 sinh viên)</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Phần điện nước tiêu thụ:</span>
                  <span className="font-semibold">₫112,833</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Wi-Fi & phí vệ sinh:</span>
                  <span className="font-semibold">₫20,000</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-xs font-bold">Tiền thực đóng:</span>
                  <span className="text-base font-extrabold text-primary">₫420,000 VND</span>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to="/billing">
                  <Receipt /> Xem chi tiết hóa đơn & VietQR
                </Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Ban quản lý & cấp cứu" desc="Tòa A" actions={<Badge variant="secondary">Tòa A</Badge>}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-muted/70 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">LQ</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold">Thầy Lê Quang</div>
                  <div className="text-[10px] text-muted-foreground">Trưởng BQL Ký túc xá Tòa A</div>
                  <div className="mt-0.5 font-mono text-xs font-semibold text-primary">0912 345 678</div>
                </div>
                <a href="tel:0912345678" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-primary hover:text-white" aria-label="Gọi BQL">
                  <Phone className="h-4 w-4" />
                </a>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-muted/70 p-2.5">
                  <div className="flex items-center gap-2">
                    <Siren className="h-4 w-4 text-primary" />
                    <span>Phòng an ninh cổng trực</span>
                  </div>
                  <span className="rounded border border-border bg-card px-2 py-0.5 font-mono font-bold">Ext #201</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/70 p-2.5">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-danger-soft-foreground" />
                    <span>Phòng y tế sơ cứu 24/7</span>
                  </div>
                  <span className="rounded border border-border bg-card px-2 py-0.5 font-mono font-bold text-danger-soft-foreground">Ext #115</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* QR modal */}
      {showGateQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="dms-card w-full max-w-sm space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">Mã thẻ cửa ra vào Tòa A</span>
              </div>
              <button onClick={() => setShowGateQrModal(false)} className="text-muted-foreground hover:text-foreground" aria-label="Đóng">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-muted/70 p-4">
              <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-white p-3 shadow-xs">
                <QrGlyph className="h-full w-full text-primary" />
              </div>
              <div className="mt-3 text-center">
                <span className="text-xs font-bold">{displayName} · Phòng A205</span>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Đưa lại gần đầu đọc quang học tại cổng an ninh</p>
              </div>
            </div>
            <Button onClick={() => setShowGateQrModal(false)} className="w-full bg-primary text-white hover:bg-primary/90">
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
