import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { AdminOverviewView } from "./AdminOverviewView"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal"
import { RollingText } from "@animate-ui/react/primitives/texts/rolling"
import { SlidingNumberPrice } from "@/components/ui/sliding-number-price"
import {
  Building2,
  Receipt,
  BedDouble,
  Wifi,
  Wrench,
  ArrowRight,
  Bell,
  Zap,
} from "lucide-react"
import {
  getUserNotifications,
  subscribeNotifications,
  type SystemNotification,
} from "@/services/notificationService"

export const StudentOverviewPage: React.FC = () => {
  const { user } = useAuth()

  // Real-time notifications for student
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    getUserNotifications("student", user?.dormitoryStatus?.room)
  )

  useEffect(() => {
    const unsub = subscribeNotifications((list) => {
      setNotifications(
        list.filter((n) => {
          if (n.targetRole && n.targetRole !== "all" && n.targetRole !== "student") {
            return false
          }
          return true
        })
      )
    })
    return () => unsub()
  }, [user?.dormitoryStatus?.room])

  const reminderNotif = notifications.find(
    (n) => n.type === "PAYMENT_REMINDER" && !n.isRead
  )
  const invoiceNotif = notifications.find(
    (n) => n.type === "INVOICE_PUBLISHED" && !n.isRead
  )

  // Nếu là Quản trị viên (Admin) hoặc Quản lý (Manager), hiển thị trang Overview Quản trị
  if (user?.role === "admin" || user?.role === "manager") {
    return <AdminOverviewView />
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-16">
      {/* Hero Welcome Banner (8pt Grid: p-4 sm:p-6 sm:p-8) */}
      <ScrollReveal>
        <div className="ui-card-interactive relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 sm:p-8 shadow-xs">
          <div className="pointer-events-none absolute -top-16 -right-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute right-40 -bottom-20 h-60 w-60 rounded-full bg-secondary/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-4 sm:gap-6 lg:flex-row lg:items-center">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="inline-block rounded-lg bg-secondary/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wider text-secondary uppercase">
                Cổng Thông Tin Cư Dân Nội Trú
              </span>
              <h1 className="flex items-center gap-2 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                <RollingText text={`Chào buổi sáng, ${user?.fullName || "Nguyễn Hoàng Vinh"}`} />{" "}
                <span className="inline-block animate-bounce text-xl sm:text-2xl">👋</span>
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed font-normal text-muted-foreground">
                Ký túc xá FPT University · Học kỳ Fall 2026 · Tòa A (High-Rise Hall)
              </p>
            </div>

            <div className="flex shrink-0 w-full sm:w-auto items-center self-start lg:self-center">
              <Button
                variant="default"
                size="default"
                asChild
                className="w-full sm:w-auto justify-center gap-2 font-bold shadow-xs h-10 sm:h-11 text-xs sm:text-sm"
              >
                <Link to="/maintenance">
                  <Wrench className="h-4 w-4" />
                  <span>Báo Hỏng Thiết Bị</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Real-time Notification Banner from Ban Quản Lý (Invoice / Reminder) */}
      {reminderNotif && (
        <ScrollReveal delay={0.05}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/50 bg-rose-500/15 p-4 text-rose-950 dark:text-rose-100 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <p className="text-sm font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                  <Bell className="h-4 w-4" />
                  <span>{reminderNotif.title}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {reminderNotif.content}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              asChild
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shrink-0 h-9 px-4 shadow-xs"
            >
              <Link to="/billing">
                <Receipt className="h-4 w-4" />
                <span>Thanh Toán VietQR Ngay</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      )}

      {!reminderNotif && invoiceNotif && (
        <ScrollReveal delay={0.05}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-sky-500/50 bg-sky-500/15 p-4 text-sky-950 dark:text-sky-100 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-sky-500 animate-ping shrink-0" />
              <div>
                <p className="text-sm font-bold flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
                  <Zap className="h-4 w-4" />
                  <span>{invoiceNotif.title}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {invoiceNotif.content}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              asChild
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shrink-0 h-9 px-4 shadow-xs"
            >
              <Link to="/billing">
                <Receipt className="h-4 w-4" />
                <span>Xem Hóa Đơn & Thanh Toán</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      )}

      {/* Top KPI 3-Card Staggered Grid (100ms delay between cards, 8pt gap-6 = 24px) */}
      <StaggerContainer
        staggerDelay={0.1}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {/* Card 1: Current Room */}
        <StaggerItem>
          <Card className="flex h-full flex-col justify-between">
            <CardHeader className="p-6 pb-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Phòng Hiện Tại
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary/20 bg-secondary/10 text-secondary">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">
                {user?.dormitoryStatus?.building || "Tòa A"} · Tầng 2 · {user?.dormitoryStatus?.room || "A205"}
              </CardTitle>
              <p className="mt-1 text-sm font-normal text-muted-foreground">
                {user?.dormitoryStatus?.compartment || "Buồng B"} · Giường {user?.dormitoryStatus?.bedCode?.split("-").pop() || "G03"} ({user?.dormitoryStatus?.bedCode?.endsWith("G02") || user?.dormitoryStatus?.bedCode?.endsWith("G04") || user?.dormitoryStatus?.bedCode?.endsWith("G06") ? "tầng trên" : "tầng dưới"})
              </p>
            </CardHeader>

            <CardContent className="p-6 pt-2">
              <div className="mt-4 space-y-2 rounded-xl border border-border bg-muted/60 p-4">
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="font-normal whitespace-nowrap text-muted-foreground">
                    Hợp đồng:
                  </span>
                  <span className="truncate text-right font-bold text-primary">
                    Hiệu lực (Kỳ 1)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="font-normal whitespace-nowrap text-muted-foreground">
                    Mật độ phòng:
                  </span>
                  <span className="font-bold whitespace-nowrap text-foreground">
                    18 / 24 Giường
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Card 2: Monthly Ledger */}
        <StaggerItem>
          <Card className="flex h-full flex-col justify-between">
            <CardHeader className="p-6 pb-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Công Nợ Tháng 09
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <Receipt className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  <SlidingNumberPrice number={48706} />
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  VND
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-destructive sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span>Hạn nộp: Còn 3 ngày (05/10)</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-2">
              <Button
                variant="default"
                size="default"
                asChild
                className="mt-4 w-full gap-2"
              >
                <Link to="/billing">
                  <Receipt className="h-4 w-4" />
                  <span>Thanh Toán VietQR</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Card 3: Support & Maintenance */}
        <StaggerItem>
          <Card className="flex h-full flex-col justify-between">
            <CardHeader className="p-6 pb-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Bảo Trì & Dịch Vụ Buồng
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold">
                Hỗ Trợ Kỹ Thuật Buồng
              </CardTitle>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-primary sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>Trang thiết bị điện nước hoạt động bình thường</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-2">
              <Button
                variant="outline"
                size="default"
                asChild
                className="mt-4 w-full gap-2"
              >
                <Link to="/maintenance">
                  <Wrench className="h-4 w-4" />
                  <span>Gửi Báo Hỏng Thiết Bị</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Desktop 2-Column Layout (8pt Grid: gap-8 = 32px) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN (8 cols) */}
        <div className="space-y-8 lg:col-span-8">
          <ScrollReveal>
            <Card className="p-6 sm:p-8">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    <RollingText text="Sơ Đồ Phân Bổ Giường Phòng A205" />
                  </h2>
                  <p className="mt-1 text-sm font-normal text-muted-foreground">
                    Trạng thái lưu trú thực tế 4 buồng A, B, C, D
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/60 px-4 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-primary" />
                    <span className="font-bold text-foreground">Giường bạn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-secondary/40" />
                    <span className="font-medium text-muted-foreground">Đã ở</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-accent bg-accent/20" />
                    <span className="font-bold text-foreground">Trống</span>
                  </div>
                </div>
              </div>

              {/* 4-Compartment Blueprint Matrix (Staggered 100ms) */}
              <StaggerContainer
                staggerDelay={0.1}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
              >
                {/* Compartment A */}
                <StaggerItem>
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-sm font-bold whitespace-nowrap text-foreground">
                          Buồng A
                        </span>
                        <span className="truncate text-xs whitespace-nowrap text-muted-foreground">
                          Hướng Ban Công
                        </span>
                      </div>
                      <span className="shrink-0 rounded-lg bg-card px-2.5 py-1 text-xs font-bold whitespace-nowrap text-foreground">
                        5/6 Giường
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G01 · Dưới</span>
                        <span className="truncate text-xs text-muted-foreground">
                          H. Long
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G02 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          T. Tuấn
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-primary/40 bg-primary/10 p-2 text-foreground shadow-2xs">
                        <span className="text-xs font-bold">G03 · Dưới</span>
                        <BedDouble className="mx-auto h-4 w-4 text-primary" />
                        <span className="text-[10px] font-extrabold text-primary">
                          TRỐNG
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G04 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          P. Quang
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G05 · Dưới</span>
                        <span className="truncate text-xs text-muted-foreground">
                          Đ. Khoa
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G06 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          M. Đức
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Compartment B (User's Compartment) */}
                <StaggerItem>
                  <div className="relative space-y-4 overflow-hidden rounded-2xl border-2 border-primary/60 bg-card p-4 shadow-xs">
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-sm font-bold whitespace-nowrap text-foreground">
                          Buồng B
                        </span>
                        <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-primary-foreground">
                          BUỒNG CỦA BẠN
                        </span>
                      </div>
                      <span className="shrink-0 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold whitespace-nowrap text-foreground">
                        5/6 Giường
                      </span>
                    </div>
                    <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-muted/50 p-2">
                        <span className="font-bold text-foreground">G01 · Dưới</span>
                        <span className="truncate text-xs text-muted-foreground">
                          B. Trần
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-muted/50 p-2">
                        <span className="font-bold text-foreground">G02 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          L. Nam
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      {/* Assigned Bed for User */}
                      <div className="flex h-16 flex-col justify-between rounded-xl bg-primary p-2 text-primary-foreground shadow-md ring-2 ring-primary/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">G03</span>
                          <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-extrabold text-primary">
                            BẠN
                          </span>
                        </div>
                        <span
                          className="truncate text-xs font-bold"
                          title={user?.fullName || "Nguyễn Hoàng Vinh"}
                        >
                          {user?.fullName || "Nguyễn Hoàng Vinh"}
                        </span>
                        <span className="text-[10px] font-medium text-primary-foreground/90">
                          Tầng dưới
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-muted/50 p-2">
                        <span className="font-bold text-foreground">G04 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          V. Thanh
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-muted/50 p-2">
                        <span className="font-bold text-foreground">G05 · Dưới</span>
                        <span className="truncate text-xs text-muted-foreground">
                          N. Huy
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-primary/40 bg-primary/10 p-2 text-foreground shadow-2xs">
                        <span className="text-xs font-bold">G06 · Trên</span>
                        <BedDouble className="mx-auto h-4 w-4 text-primary" />
                        <span className="text-[10px] font-extrabold text-primary">
                          TRỐNG
                        </span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Compartment C */}
                <StaggerItem>
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-sm font-bold whitespace-nowrap text-foreground">
                          Buồng C
                        </span>
                        <span className="truncate text-xs whitespace-nowrap text-muted-foreground">
                          Góc Tự Học
                        </span>
                      </div>
                      <span className="shrink-0 rounded-lg bg-card px-2.5 py-1 text-xs font-bold whitespace-nowrap text-foreground">
                        4/6 Giường
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G01 · Dưới</span>
                        <span className="truncate text-xs text-muted-foreground">
                          K. Minh
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-primary/40 bg-primary/10 p-2 text-foreground shadow-2xs">
                        <span className="text-xs font-bold">G02 · Trên</span>
                        <BedDouble className="mx-auto h-4 w-4 text-primary" />
                        <span className="text-[10px] font-extrabold text-primary">
                          TRỐNG
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G03 · Dưới</span>
                        <span className="truncate text-xs text-muted-foreground">
                          P. Linh
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G04 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          T. Dung
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-primary/40 bg-primary/10 p-2 text-foreground shadow-2xs">
                        <span className="text-xs font-bold">G05 · Dưới</span>
                        <BedDouble className="mx-auto h-4 w-4 text-primary" />
                        <span className="text-[10px] font-extrabold text-primary">
                          TRỐNG
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G06 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          S. Sơn
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Compartment D */}
                <StaggerItem>
                  <div className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-sm font-bold whitespace-nowrap text-foreground">
                          Buồng D
                        </span>
                        <span className="truncate text-xs whitespace-nowrap text-muted-foreground">
                          Cửa Ra Vào & WC
                        </span>
                      </div>
                      <span className="shrink-0 rounded-lg bg-card px-2.5 py-1 text-xs font-bold whitespace-nowrap text-foreground">
                        4/6 Giường
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G01 · Dưới</span>
                        <span className="truncate text-xs text-muted-foreground">
                          A. Hiền
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G02 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          V. Khôi
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-primary/40 bg-primary/10 p-2 text-foreground shadow-2xs">
                        <span className="text-xs font-bold">G03 · Dưới</span>
                        <BedDouble className="mx-auto h-4 w-4 text-primary" />
                        <span className="text-[10px] font-extrabold text-primary">
                          TRỐNG
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-primary/40 bg-primary/10 p-2 text-foreground shadow-2xs">
                        <span className="text-xs font-bold">G04 · Trên</span>
                        <BedDouble className="mx-auto h-4 w-4 text-primary" />
                        <span className="text-[10px] font-extrabold text-primary">
                          TRỐNG
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G05 · Dưới</span>
                        <span className="truncate text-xs text-muted-foreground">
                          H. Phúc
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                      <div className="flex h-16 flex-col justify-between rounded-xl border border-border bg-card p-2">
                        <span className="font-bold text-foreground">G06 · Trên</span>
                        <span className="truncate text-xs text-muted-foreground">
                          Q. Thắng
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Đã ở
                        </span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>

              {/* Room Facilities Specs Footer */}
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-muted/50 p-4">
                <Wifi className="h-6 w-6 text-secondary" />
                <div>
                  <div className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Hall Wi-Fi
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    KTX-A205-5G
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>

        {/* RIGHT COLUMN (4 cols) */}
        <div className="space-y-8 lg:col-span-4">
          <ScrollReveal delay={0.1}>
            <Card className="space-y-4 border border-border p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-base font-bold text-foreground">
                  Ban Quản Lý Tòa A
                </h3>
                <span className="rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary">
                  Tòa A
                </span>
              </div>

              {/* Warden Profile */}
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                    LQ
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-foreground">
                      Thầy Lê Quang
                    </div>
                    <div className="text-xs font-normal text-muted-foreground">
                      Trưởng BQL Ký túc xá Tòa A
                    </div>
                  </div>
                </div>
                <a
                  href="tel:0912345678"
                  className="font-mono text-xs font-bold whitespace-nowrap text-primary hover:underline sm:text-sm"
                >
                  0912 345 678
                </a>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
