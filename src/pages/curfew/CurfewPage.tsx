import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import type { GateAccessLog } from "@/types/curfew"
import { INITIAL_GATE_LOGS } from "@/data/mockCurfew"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal"
import {
  ShieldCheck,
  Scan,
  CheckCircle2,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Search,
  LogIn,
  LogOut,
  ArrowRight,
} from "lucide-react"

const STORAGE_KEY_GATE_LOGS = "dms_gate_logs_v1"

// Mock student database for fast barcode/MSSV scan
const KNOWN_STUDENTS: Record<
  string,
  { name: string; room: string; phone: string; avatar: string }
> = {
  SE182049: {
    name: "Nguyễn Hoàng Vinh",
    room: "A205",
    phone: "0912 345 678",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  SE182050: {
    name: "Trần Thanh Nguyên",
    room: "A205",
    phone: "0905 111 222",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  SE182053: {
    name: "Lê Minh Tuấn",
    room: "A204",
    phone: "0988 333 444",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  SE182054: {
    name: "Phạm Quốc Bảo",
    room: "A203",
    phone: "0977 555 666",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
  },
  SE182055: {
    name: "Vũ Đức Trọng",
    room: "A202",
    phone: "0918 888 999",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
  },
  SE182056: {
    name: "Hoàng Minh Đức",
    room: "A201",
    phone: "0934 112 233",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
}

export const CurfewPage: React.FC = () => {
  const { user } = useAuth()

  // 1. Gate Access Logs State
  const [gateLogs, setGateLogs] = useState<GateAccessLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GATE_LOGS)
      return saved ? JSON.parse(saved) : INITIAL_GATE_LOGS
    } catch {
      return INITIAL_GATE_LOGS
    }
  })

  // Synchronize state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GATE_LOGS, JSON.stringify(gateLogs))
  }, [gateLogs])

  // Gate Scanner state
  const [scanInput, setScanInput] = useState("")
  const [scanDirection, setScanDirection] = useState<"ENTRY" | "EXIT">("ENTRY")
  const [lastScannedResult, setLastScannedResult] = useState<{
    studentId: string
    studentName: string
    room: string
    direction: "ENTRY" | "EXIT"
    time: string
    avatar?: string
  } | null>(null)

  // Filter logs state
  const [directionFilter, setDirectionFilter] = useState<
    "ALL" | "ENTRY" | "EXIT"
  >("ALL")
  const [searchLogQuery, setSearchLogQuery] = useState("")

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Scan Gate
  const handleScanGate = (e?: React.FormEvent, customMssv?: string) => {
    if (e) e.preventDefault()
    const targetMssv = (customMssv || scanInput).trim().toUpperCase()
    if (!targetMssv) return

    const studentInfo = KNOWN_STUDENTS[targetMssv] || {
      name: `Sinh Viên (${targetMssv})`,
      room: "A205",
      phone: "0912 000 111",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    }

    const now = new Date()
    const timeFormatted = now.toLocaleTimeString("vi-VN")

    const newLog: GateAccessLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      studentId: targetMssv,
      studentName: studentInfo.name,
      room: studentInfo.room,
      timestamp: now.toISOString(),
      scanTimeFormatted: timeFormatted,
      direction: scanDirection,
      status: "VALID",
      curfewStatus: "VALID",
      guardNotes:
        scanDirection === "ENTRY"
          ? "Quẹt thẻ cổng thành công. Cho vào an toàn."
          : "Quẹt thẻ cổng thành công. Cho ra an toàn.",
      guardName: user?.fullName || "Vũ Thành Nam",
    }

    setGateLogs((prev) => [newLog, ...prev])
    setLastScannedResult({
      studentId: targetMssv,
      studentName: studentInfo.name,
      room: studentInfo.room,
      direction: scanDirection,
      time: timeFormatted,
      avatar: studentInfo.avatar,
    })
    setScanInput("")
    showToast(
      `Đã quẹt thẻ thành công: ${studentInfo.name} (${scanDirection === "ENTRY" ? "Vào cổng" : "Ra cổng"})`
    )
  }

  // Filter logs list
  const filteredLogs = gateLogs.filter((log) => {
    if (directionFilter === "ENTRY" && log.direction === "EXIT") return false
    if (directionFilter === "EXIT" && log.direction === "ENTRY") return false
    if (!searchLogQuery.trim()) return true
    const q = searchLogQuery.toLowerCase()
    return (
      log.studentName.toLowerCase().includes(q) ||
      log.studentId.toLowerCase().includes(q) ||
      log.room.toLowerCase().includes(q) ||
      (log.guardNotes && log.guardNotes.toLowerCase().includes(q))
    )
  })

  // Export CSV
  const handleExportCsv = () => {
    const headers =
      "ThoiGian,MSSV,HoTen,Phong,HanhDong,TrangThai,GhiChu,BaoVeCaTruc\n"
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.scanTimeFormatted}","${l.studentId}","${l.studentName}","${l.room}","${
            l.direction === "EXIT" ? "Ra cổng" : "Vào cổng"
          }","Hợp lệ","${l.guardNotes || "Quẹt thẻ thành công"}","${l.guardName}"`
      )
      .join("\n")
    const blob = new Blob(["\uFEFF" + headers + rows], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Nhat_Ky_Quet_The_Cong_Toa_A_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex animate-in items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground shadow-xl fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <ScrollReveal>
        <div className="ui-card-interactive rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10 text-secondary shadow-xs">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Giám Sát Ra Vào Cổng KTX
                </h1>
                <p className="text-sm font-normal text-muted-foreground sm:text-base">
                  Hệ thống quẹt thẻ kiểm soát an ninh ra vào cổng Tòa A thời
                  gian thực
                </p>
              </div>
            </div>

            <button
              onClick={handleExportCsv}
              className="ui-btn-interactive flex cursor-pointer items-center gap-2 self-start rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-2xs hover:bg-secondary hover:text-secondary-foreground sm:self-auto sm:text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Xuất Nhật Ký (CSV)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* 3 Metric Cards (Staggered 100ms) */}
      <StaggerContainer
        staggerDelay={0.1}
        className="grid grid-cols-1 gap-6 sm:grid-cols-3"
      >
        <StaggerItem>
          <div className="ui-card-interactive flex h-full items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Tổng Lượt Quẹt Hôm Nay
              </span>
              <div className="mt-2 font-mono text-2xl font-extrabold text-foreground sm:text-3xl">
                248 lượt
              </div>
              <span className="mt-1 block text-xs font-semibold text-primary">
                100% thẻ hợp lệ
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Scan className="h-6 w-6" />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="ui-card-interactive flex h-full items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Đang Ở Trong Tòa A
              </span>
              <div className="mt-2 font-mono text-2xl font-extrabold text-foreground sm:text-3xl">
                186 sinh viên
              </div>
              <span className="mt-1 block text-xs text-muted-foreground">
                Quy mô Tòa A: 192 sinh viên
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <LogIn className="h-6 w-6" />
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="ui-card-interactive flex h-full items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Đang Ra Ngoài Cổng
              </span>
              <div className="mt-2 font-mono text-2xl font-extrabold text-foreground sm:text-3xl">
                6 sinh viên
              </div>
              <span className="mt-1 block text-xs text-muted-foreground">
                Check-out tạm thời ra ngoài
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <LogOut className="h-6 w-6" />
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Console Box: Scan Bar & Live Verification */}
      <ScrollReveal>
        <div className="ui-card-interactive space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
                <ShieldCheck className="h-4 w-4" /> Bàn Trực Cổng An Ninh • Quẹt
                Thẻ Sinh Viên
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Tra Cứu Mã Thẻ & Mở Cổng Ra Vào Tự Động
              </h2>
            </div>

            {/* Direction toggle */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/70 p-1.5">
              <button
                type="button"
                onClick={() => setScanDirection("ENTRY")}
                className={`ui-btn-interactive flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold ${
                  scanDirection === "ENTRY"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span>Vào Cổng (Check-in)</span>
              </button>
              <button
                type="button"
                onClick={() => setScanDirection("EXIT")}
                className={`ui-btn-interactive flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold ${
                  scanDirection === "EXIT"
                    ? "bg-secondary text-secondary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Ra Cổng (Check-out)</span>
              </button>
            </div>
          </div>

          {/* Scan Bar Input */}
          <form onSubmit={handleScanGate} className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Scan className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="NHẬP MSSV HOẶC QUÉT MÃ BARCODE THẺ SINH VIÊN (VD: SE182049)..."
                  className="w-full rounded-2xl border border-border bg-background py-3.5 pr-4 pl-12 font-mono text-xs font-bold text-foreground shadow-xs placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none sm:text-sm"
                />
              </div>
              <button
                type="submit"
                className="ui-btn-interactive flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-[#235330] sm:text-sm"
              >
                <Scan className="h-4 w-4" />
                <span>Quẹt Thẻ Cổng (Scan)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Click Hints */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-xs font-semibold text-muted-foreground">
                Gợi ý quẹt nhanh:
              </span>
              {["SE182049", "SE182050", "SE182053", "SE182054"].map((mssv) => (
                <button
                  key={mssv}
                  type="button"
                  onClick={() => handleScanGate(undefined, mssv)}
                  className="ui-btn-interactive cursor-pointer rounded-xl border border-border bg-muted/60 px-3 py-1.5 font-mono text-xs font-bold text-foreground hover:bg-secondary hover:text-secondary-foreground"
                >
                  <span>
                    {mssv} ({KNOWN_STUDENTS[mssv]?.name.split(" ").slice(-1)[0]})
                  </span>
                </button>
              ))}
            </div>
          </form>

          {/* Real-time Verification Result Card */}
          {lastScannedResult && (
            <div className="flex animate-in flex-col justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 fade-in slide-in-from-top-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <img
                  src={
                    lastScannedResult.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                  }
                  alt={lastScannedResult.studentName}
                  className="h-12 w-12 rounded-xl border border-primary/30 object-cover shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {lastScannedResult.studentName}
                    </h3>
                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
                      {lastScannedResult.studentId}
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      Phòng {lastScannedResult.room}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>
                      Thẻ sinh viên hợp lệ • Cổng xoay an ninh đã mở lúc{" "}
                      <strong>{lastScannedResult.time}</strong>
                    </span>
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-xs font-bold sm:self-auto ${
                  lastScannedResult.direction === "ENTRY"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {lastScannedResult.direction === "ENTRY" ? (
                  <>
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>Đã Vào Cổng KTX</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    <span>Đã Ra Ngoài Cổng</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Lịch Sử Quẹt Thẻ Cổng Thời Gian Thực (Recent Gate Logs) */}
      <ScrollReveal>
        <div className="ui-card-interactive space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                Lịch Sử Quẹt Thẻ Cổng Thời Gian Thực (Recent Gate Logs)
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {filteredLogs.length} lượt ghi nhận
              </span>
            </div>

            {/* Direction filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchLogQuery}
                  onChange={(e) => setSearchLogQuery(e.target.value)}
                  placeholder="Tìm theo tên, MSSV..."
                  className="w-44 rounded-xl border border-border bg-background py-2 pr-4 pl-9 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none sm:w-52"
                />
              </div>

              <div className="flex gap-1.5 rounded-xl border border-border bg-muted/60 p-1.5">
                <button
                  type="button"
                  onClick={() => setDirectionFilter("ALL")}
                  className={`ui-btn-interactive cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold ${
                    directionFilter === "ALL"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Tất cả</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirectionFilter("ENTRY")}
                  className={`ui-btn-interactive cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold ${
                    directionFilter === "ENTRY"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Vào cổng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirectionFilter("EXIT")}
                  className={`ui-btn-interactive cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold ${
                    directionFilter === "EXIT"
                      ? "bg-secondary text-secondary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Ra cổng</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-bold tracking-wider text-foreground uppercase">
                  <th className="px-4 py-4">Thời Gian</th>
                  <th className="px-4 py-4">MSSV</th>
                  <th className="px-4 py-4">Họ Và Tên</th>
                  <th className="px-4 py-4">Phòng</th>
                  <th className="px-4 py-4">Hành Động</th>
                  <th className="px-4 py-4">Ghi Chú An Ninh</th>
                  <th className="px-4 py-4 text-right">Bảo Vệ Ca Trực</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => {
                  const isExit = log.direction === "EXIT"
                  return (
                    <tr
                      key={log.id}
                      className="transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-muted/40"
                    >
                      <td className="px-4 py-4 font-mono font-medium whitespace-nowrap text-foreground">
                        {log.scanTimeFormatted}
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-foreground">
                        {log.studentId}
                      </td>
                      <td className="px-4 py-4 font-semibold text-foreground">
                        {log.studentName}
                      </td>
                      <td className="px-4 py-4 font-mono text-muted-foreground">
                        {log.room}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                            isExit
                              ? "border border-secondary/20 bg-secondary/10 text-secondary"
                              : "border border-primary/20 bg-primary/10 text-primary"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isExit ? "bg-secondary" : "bg-primary"
                            }`}
                          />
                          <span>{isExit ? "Ra cổng" : "Vào cổng"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {log.guardNotes ||
                          (isExit
                            ? "Quẹt thẻ ra ngoài cổng an toàn."
                            : "Quẹt thẻ qua cổng an toàn.")}
                      </td>
                      <td className="px-4 py-4 text-right font-medium whitespace-nowrap text-foreground">
                        {log.guardName || "Vũ Thành Nam"}
                      </td>
                    </tr>
                  )
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Không tìm thấy lượt quẹt thẻ nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
