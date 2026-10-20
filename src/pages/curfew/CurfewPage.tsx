import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import type { GateAccessLog } from "@/types/curfew"
import { INITIAL_GATE_LOGS } from "@/data/mockCurfew"
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
  const [directionFilter, setDirectionFilter] = useState<"ALL" | "ENTRY" | "EXIT">("ALL")
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
    const headers = "ThoiGian,MSSV,HoTen,Phong,HanhDong,TrangThai,GhiChu,BaoVeCaTruc\n"
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
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex animate-in items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl fade-in slide-in-from-top-4">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-blue-500/5 to-card p-6 shadow-xs sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-xs dark:text-blue-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground sm:text-2xl">
                Giám Sát Ra Vào Cổng KTX
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hệ thống quẹt thẻ kiểm soát an ninh ra vào cổng Tòa A thời gian thực
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs hover:bg-muted self-start sm:self-auto transition-colors"
          >
            <Download className="h-4 w-4 text-primary" />
            <span>Xuất Nhật Ký (CSV)</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tổng Lượt Quẹt Hôm Nay
            </span>
            <div className="text-2xl font-black text-foreground mt-1 font-mono">
              248 lượt
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              100% thẻ hợp lệ
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Scan className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Đang Ở Trong Tòa A
            </span>
            <div className="text-2xl font-black text-foreground mt-1 font-mono">
              186 sinh viên
            </div>
            <span className="text-xs text-muted-foreground">
              Quy mô Tòa A: 192 sinh viên
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <LogIn className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Đang Ra Ngoài Cổng
            </span>
            <div className="text-2xl font-black text-foreground mt-1 font-mono">
              6 sinh viên
            </div>
            <span className="text-xs text-muted-foreground">
              Check-out tạm thời ra ngoài
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
            <LogOut className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Console Box: Scan Bar & Live Verification */}
      <div className="space-y-6 rounded-3xl border border-blue-500/30 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-primary uppercase">
              <ShieldCheck className="h-3.5 w-3.5" /> Bàn Trực Cổng An Ninh • Quẹt Thẻ Sinh Viên
            </span>
            <h2 className="text-lg font-black text-foreground">
              Tra Cứu Mã Thẻ & Mở Cổng Ra Vào Tự Động
            </h2>
          </div>

          {/* Direction toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/70 border border-border">
            <button
              type="button"
              onClick={() => setScanDirection("ENTRY")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scanDirection === "ENTRY"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownLeft className="h-3.5 w-3.5" />
              <span>Vào Cổng (Check-in)</span>
            </button>
            <button
              type="button"
              onClick={() => setScanDirection("EXIT")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scanDirection === "EXIT"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Ra Cổng (Check-out)</span>
            </button>
          </div>
        </div>

        {/* Scan Bar Input (Image 3) */}
        <form onSubmit={handleScanGate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Scan className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="NHẬP MSSV HOẶC QUÉT MÃ BARCODE THẺ SINH VIÊN (VD: SE182049)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-background text-xs sm:text-sm font-mono font-bold text-foreground placeholder:font-sans placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-sm transition-all shrink-0"
            >
              <Scan className="h-4 w-4" />
              <span>Quẹt Thẻ Cổng (Scan)</span>
            </button>
          </div>

          {/* Quick Click Hints */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold">Gợi ý quẹt nhanh:</span>
            {["SE182049", "SE182050", "SE182053", "SE182054"].map((mssv) => (
              <button
                key={mssv}
                type="button"
                onClick={() => handleScanGate(undefined, mssv)}
                className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-mono font-bold text-foreground hover:bg-muted/80 border border-border transition-colors"
              >
                {mssv} ({KNOWN_STUDENTS[mssv]?.name.split(" ").slice(-1)[0]})
              </button>
            ))}
          </div>
        </form>

        {/* Real-time Verification Result Card */}
        {lastScannedResult && (
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3.5">
              <img
                src={
                  lastScannedResult.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                }
                alt={lastScannedResult.studentName}
                className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">
                    {lastScannedResult.studentName}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-foreground">
                    {lastScannedResult.studentId}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                    Phòng {lastScannedResult.room}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Thẻ sinh viên hợp lệ • Cổng xoay an ninh đã mở lúc{" "}
                    <strong>{lastScannedResult.time}</strong>
                  </span>
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto ${
                lastScannedResult.direction === "ENTRY"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
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

      {/* Lịch Sử Quẹt Thẻ Cổng Thời Gian Thực (Recent Gate Logs - Image 2) */}
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Lịch Sử Quẹt Thẻ Cổng Thời Gian Thực (Recent Gate Logs)
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {filteredLogs.length} lượt ghi nhận
            </span>
          </div>

          {/* Direction filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchLogQuery}
                onChange={(e) => setSearchLogQuery(e.target.value)}
                placeholder="Tìm theo tên, MSSV..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48"
              />
            </div>

            <div className="flex gap-1 rounded-xl bg-muted/60 p-1 border border-border">
              <button
                type="button"
                onClick={() => setDirectionFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  directionFilter === "ALL"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setDirectionFilter("ENTRY")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  directionFilter === "ENTRY"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vào cổng
              </button>
              <button
                type="button"
                onClick={() => setDirectionFilter("EXIT")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  directionFilter === "EXIT"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ra cổng
              </button>
            </div>
          </div>
        </div>

        {/* Table matching Image 2 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30">
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-3">MSSV</th>
                <th className="py-3 px-3">Họ Và Tên</th>
                <th className="py-3 px-3">Phòng</th>
                <th className="py-3 px-3">Hành Động</th>
                <th className="py-3 px-3">Ghi Chú An Ninh</th>
                <th className="py-3 px-3 text-right">Bảo Vệ Ca Trực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => {
                const isExit = log.direction === "EXIT"
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="py-3.5 px-3 font-mono font-medium text-foreground whitespace-nowrap">
                      {log.scanTimeFormatted}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-foreground">
                      {log.studentId}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-foreground">
                      {log.studentName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-muted-foreground">
                      {log.room}
                    </td>
                    {/* Action badge: Replaces the old "Vi phạm (-10đ)" / "Có đơn duyệt" / "Đúng giờ" */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isExit
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isExit ? "bg-blue-500" : "bg-emerald-500"
                          }`}
                        />
                        <span>{isExit ? "Ra cổng" : "Vào cổng"}</span>
                      </span>
                    </td>
                    {/* Security notes: Replaces "Về sau 23:00 lập biên bản kỷ luật" */}
                    <td className="py-3.5 px-3 text-muted-foreground">
                      {log.guardNotes ||
                        (isExit
                          ? "Quẹt thẻ ra ngoài cổng an toàn."
                          : "Quẹt thẻ qua cổng an toàn.")}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-foreground whitespace-nowrap">
                      {log.guardName || "Vũ Thành Nam"}
                    </td>
                  </tr>
                )
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Không tìm thấy lượt quẹt thẻ nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
