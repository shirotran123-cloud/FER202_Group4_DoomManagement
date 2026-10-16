import React from "react"
import { Link } from "react-router-dom"
import { Compass, House } from "lucide-react"

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-lg space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary-soft-foreground">
          <Compass className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-soft-foreground">
            Lỗi 404 • Không tìm thấy trang
          </span>
          <h1 className="text-2xl font-black text-foreground">Trang Không Tồn Tại</h1>
          <p className="prose text-xs text-muted-foreground leading-relaxed">
            Đường dẫn bạn yêu cầu không tồn tại hoặc đã được thay đổi trong hệ thống Ký túc xá.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary"
        >
          <House className="h-4 w-4" />
          <span>Về Trang chủ</span>
        </Link>
      </div>
    </div>
  )
}