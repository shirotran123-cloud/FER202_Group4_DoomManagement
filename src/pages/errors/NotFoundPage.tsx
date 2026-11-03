import React from "react"
import { Link } from "react-router-dom"
import { Compass, Home } from "lucide-react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
      <ScrollReveal direction="up" distance={24} className="max-w-md w-full">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg space-y-6 ui-card-interactive">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 shadow-sm">
            <Compass className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-sky-400">
              Lỗi 404 • Không tìm thấy trang
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Trang Không Tồn Tại
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển trong hệ thống quản lý Ký túc xá.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-primary/95 ui-btn-interactive"
          >
            <Home className="h-4 w-4" />
            <span>Về Trang Chủ</span>
          </Link>
        </div>
      </ScrollReveal>
    </div>
  )
}
