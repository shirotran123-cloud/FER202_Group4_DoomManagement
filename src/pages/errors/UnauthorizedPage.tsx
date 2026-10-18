import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"
import { ShieldAlert, RefreshCw, Home } from "lucide-react"

interface LocationState {
  attemptedPath?: string
}

export const UnauthorizedPage: React.FC = () => {
  const { user, switchRole } = useAuth()
  const location = useLocation()
  const locationState = location.state as LocationState | null
  const attemptedPath = locationState?.attemptedPath || "trang yêu cầu"

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full rounded-3xl border border-blue-500/20 bg-card p-8 text-center shadow-lg space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Lỗi 403 • Không đủ thẩm quyền
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            Từ Chối Quyền Truy Cập
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tài khoản hiện tại của bạn đang có vai trò{" "}
            <strong className="text-foreground">{user?.roleTitle || "Chưa xác thực"}</strong>, không có quyền truy cập vào đường dẫn{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono">{attemptedPath}</code>.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-xs space-y-2 text-left">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span>Thử chuyển vai trò để kiểm thử phân quyền:</span>
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => switchRole("manager")}
              className="rounded-lg border border-border bg-card p-2 text-center text-[11px] font-semibold text-foreground hover:bg-muted"
            >
              🏢 Đổi sang Quản lý
            </button>
            <button
              onClick={() => switchRole("technician")}
              className="rounded-lg border border-border bg-card p-2 text-center text-[11px] font-semibold text-foreground hover:bg-muted"
            >
              🛡️ Đổi sang An ninh/KT
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700"
          >
            <Home className="h-4 w-4" />
            <span>Quay lại Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
