import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { AdminOverviewView } from "./AdminOverviewView"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Building2,
  Receipt,
  BedDouble,
  Wifi,
  Wrench,
} from "lucide-react"

export const StudentOverviewPage: React.FC = () => {
  const { user } = useAuth()

  // Nếu là Quản trị viên (Admin) hoặc Quản lý (Manager), hiển thị trang Overview Quản trị
  if (user?.role === "admin" || user?.role === "manager") {
    return <AdminOverviewView />
  }

  

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-xs">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                Chào buổi sáng, {user?.fullName || "Nguyễn Hoàng Vinh"}{" "}
                <span className="inline-block animate-bounce text-2xl">👋</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ký túc xá FPT University · Học kỳ Fall 2026 · Tòa A (High-Rise Hall)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="gap-2 font-semibold shadow-xs"
            >
              <Link to="/maintenance">
                <Wrench className="h-4 w-4 text-primary" />
                <span>Báo Hỏng Thiết Bị</span>
              </Link>
            </Button>


          </div>
        </div>
      </div>

      {/* Top KPI 4-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Current Room */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                Phòng Hiện Tại
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-lg font-bold">Tòa A · Tầng 2 · A205</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Buồng B · Giường tầng dưới G03</p>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <div className="mt-4 pt-3 space-y-2 bg-muted/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground whitespace-nowrap">Hợp đồng:</span>
                <span className="font-semibold text-primary truncate text-right">Hiệu lực (Kỳ 1)</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground whitespace-nowrap">Mật độ phòng:</span>
                <span className="font-bold text-foreground whitespace-nowrap">18 / 24 Giường</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Monthly Ledger */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                Công Nợ Tháng 09
              </span>
              <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center text-destructive">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-foreground tracking-tight">₫48,706</div>
              <span className="text-xs text-muted-foreground font-semibold">VND</span>
            </div>
            <div className="flex items-center gap-1.5 text-destructive text-xs mt-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
              <span>Hạn nộp: Còn 3 ngày (05/10)</span>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <Button variant="secondary" size="default" asChild className="w-full mt-4 gap-2">
              <Link to="/billing">
                <Receipt className="h-4 w-4" />
                <span>Thanh Toán VietQR</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Support & Maintenance */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                Bảo Trì & Dịch Vụ Buồng
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Wrench className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-lg font-bold">Hỗ Trợ Kỹ Thuật Buồng</CardTitle>
            <div className="flex items-center gap-1.5 text-primary text-xs mt-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>Trang thiết bị điện nước hoạt động bình thường</span>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <Button variant="outline" size="default" asChild className="w-full mt-4 gap-2">
              <Link to="/maintenance">
                <Wrench className="h-4 w-4" />
                <span>Gửi Báo Hỏng Thiết Bị</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Desktop 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Current Room Occupancy Blueprint Card */}
          <Card className="p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Sơ Đồ Phân Bổ Giường Phòng A205
                </h2>

              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 bg-muted/60 px-3 py-1.5 rounded-lg text-xs border border-border">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-primary" />
                  <span className="font-semibold text-foreground">Giường bạn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-muted-foreground/30" />
                  <span className="text-muted-foreground">Đã ở</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-accent/40 border border-accent" />
                  <span className="text-foreground font-semibold">Trống</span>
                </div>
              </div>
            </div>

            {/* 4-Compartment Blueprint Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Compartment A */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-foreground whitespace-nowrap shrink-0">Buồng A</span>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap truncate">Hướng Ban Công</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-foreground font-semibold whitespace-nowrap shrink-0">
                    5/6 Giường
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G01 · Dưới</span>
                    <span className="text-[11px] text-muted-foreground truncate">H. Long</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G02 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">T. Tuấn</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/15 text-foreground flex flex-col justify-between h-16 border border-accent/40 shadow-2xs">
                    <span className="font-bold text-[11px]">G03 · Dưới</span>
                    <BedDouble className="h-4 w-4 mx-auto text-primary" />
                    <span className="text-[9px] font-bold text-primary">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G04 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">P. Quang</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G05 · Dưới</span>
                    <span className="text-[11px] text-muted-foreground truncate">Đ. Khoa</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G06 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">M. Đức</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                </div>
              </div>

              {/* Compartment B (User's Compartment) */}
              <div className="p-4 rounded-xl bg-card border-2 border-primary/50 space-y-3 relative overflow-hidden shadow-xs">
                <div className="flex items-center justify-between gap-1.5 relative z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-foreground whitespace-nowrap shrink-0">Buồng B</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold whitespace-nowrap shrink-0">
                      BUỒNG CỦA BẠN
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-foreground font-semibold whitespace-nowrap shrink-0">
                    5/6 Giường
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs relative z-10">
                  <div className="p-2 rounded-lg bg-muted/40 border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G01 · Dưới</span>
                    <span className="text-[11px] text-muted-foreground truncate">B. Trần</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G02 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">L. Nam</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  {/* Assigned Bed for User */}
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground flex flex-col justify-between h-16 shadow-md ring-2 ring-primary/40">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">G03</span>
                      <span className="px-1 py-0.2 rounded bg-accent text-accent-foreground text-[8px] font-extrabold">
                        BẠN
                      </span>
                    </div>
                    <span className="font-bold text-[10px] truncate">
                      {user?.fullName?.split(" ").slice(-1)[0] || "Vinh"}
                    </span>
                    <span className="text-[9px] text-primary-foreground/80">Tầng dưới</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G04 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">V. Thanh</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G05 · Dưới</span>
                    <span className="text-[11px] text-muted-foreground truncate">N. Huy</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/15 text-foreground flex flex-col justify-between h-16 border border-accent/40 shadow-2xs">
                    <span className="font-bold text-[11px]">G06 · Trên</span>
                    <BedDouble className="h-4 w-4 mx-auto text-primary" />
                    <span className="text-[9px] font-bold text-primary">TRỐNG</span>
                  </div>
                </div>
              </div>

              {/* Compartment C */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-foreground whitespace-nowrap shrink-0">Buồng C</span>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap truncate">Góc Tự Học</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-foreground font-semibold whitespace-nowrap shrink-0">
                    4/6 Giường
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G01 · Dưới</span>
                    <span className="text-[11px] text-muted-foreground truncate">K. Minh</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/15 text-foreground flex flex-col justify-between h-16 border border-accent/40 shadow-2xs">
                    <span className="font-bold text-[11px]">G02 · Trên</span>
                    <BedDouble className="h-4 w-4 mx-auto text-primary" />
                    <span className="text-[9px] font-bold text-primary">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G03 · Dưới</span>
                    <span className="text-[11px] text-muted-foreground truncate">P. Linh</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G04 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">T. Dung</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/15 text-foreground flex flex-col justify-between h-16 border border-accent/40 shadow-2xs">
                    <span className="font-bold text-[11px]">G05 · Dưới</span>
                    <BedDouble className="h-4 w-4 mx-auto text-primary" />
                    <span className="text-[9px] font-bold text-primary">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G06 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">S. Sơn</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                </div>
              </div>

              {/* Compartment D */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-foreground whitespace-nowrap shrink-0">Buồng D</span>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap truncate">Cửa Ra Vào & WC</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-foreground font-semibold whitespace-nowrap shrink-0">
                    4/6 Giường
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G01 · Dưới</span>
                    <span className="text-[11px] text-muted-foreground truncate">A. Hiền</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G02 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">V. Khôi</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/15 text-foreground flex flex-col justify-between h-16 border border-accent/40 shadow-2xs">
                    <span className="font-bold text-[11px]">G03 · Dưới</span>
                    <BedDouble className="h-4 w-4 mx-auto text-primary" />
                    <span className="text-[9px] font-bold text-primary">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/15 text-foreground flex flex-col justify-between h-16 border border-accent/40 shadow-2xs">
                    <span className="font-bold text-[11px]">G04 · Trên</span>
                    <BedDouble className="h-4 w-4 mx-auto text-primary" />
                    <span className="text-[9px] font-bold text-primary">TRỐNG</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G05 · Dưới</span>
                    <span className="text-[11px] text-muted-foreground truncate">H. Phúc</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border flex flex-col justify-between h-16">
                    <span className="font-bold text-foreground">G06 · Trên</span>
                    <span className="text-[11px] text-muted-foreground truncate">Q. Thắng</span>
                    <span className="text-[9px] text-muted-foreground/70">Đã ở</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Facilities Specs Footer */}
            <div className="mt-6 flex items-center gap-3 bg-muted/40 rounded-xl p-3.5 border border-border">
              <Wifi className="h-5 w-5 text-secondary" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Hall Wi-Fi</div>
                <div className="text-xs font-bold text-foreground">KTX-A205-5G</div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          {/* Ban Quản Lý KTX Tòa A (Chỉ hiển thị Thầy Lê Quang, xóa 2 hàng an ninh và cấp cứu theo yêu cầu) */}
          <Card className="p-5 shadow-xs border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Ban Quản Lý Tòa A</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                Tòa A
              </span>
            </div>

            {/* Warden Profile */}
            <div className="p-3.5 rounded-xl bg-muted/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  LQ
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">Thầy Lê Quang</div>
                  <div className="text-[11px] text-muted-foreground">Trưởng BQL Ký túc xá Tòa A</div>
                </div>
              </div>
              <a
                href="tel:0912345678"
                className="font-mono text-xs text-primary font-bold hover:underline whitespace-nowrap"
              >
                0912 345 678
              </a>
            </div>
          </Card>
        </div>
      </div>

      
    </div>
  )
}