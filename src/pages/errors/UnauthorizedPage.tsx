import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { ShieldAlert, RefreshCw, Home } from "lucide-react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

interface LocationState {
  attemptedPath?: string
}

export const UnauthorizedPage: React.FC = () => {
  const { user, switchRole } = useAuth()
  const location = useLocation()
  const locationState = location.state as LocationState | null
  const attemptedPath = locationState?.attemptedPath || "trang yêu cầu"

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
      <ScrollReveal direction="up" distance={24} className="max-w-md w-full">
        <div className="rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-lg space-y-6 ui-card-interactive">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">
              Lỗi 403 • Không đủ thẩm quyền
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Từ Chối Truy Cập
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Tài khoản hiện tại của bạn đang có vai trò{" "}
              <strong className="text-foreground">{user?.roleTitle || "Chưa xác thực"}</strong>, không có quyền truy cập vào đường dẫn{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono text-xs">{attemptedPath}</code>.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-5 text-xs space-y-3 text-left">
            <p className="font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span>Chuyển đổi vai trò để kiểm thử phân quyền:</span>
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => switchRole("manager")}
                className="rounded-xl border border-border bg-card p-3 text-center text-xs font-semibold text-foreground hover:bg-muted ui-card-interactive cursor-pointer"
              >
                🏢 Đổi sang Quản lý
              </button>
              <button
                onClick={() => switchRole("technician")}
                className="rounded-xl border border-border bg-card p-3 text-center text-xs font-semibold text-foreground hover:bg-muted ui-card-interactive cursor-pointer"
              >
                🛡️ Đổi sang An ninh/KT
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-primary/95 ui-btn-interactive"
            >
              <Home className="h-4 w-4" />
              <span>Quay Lại Trang Chủ</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
