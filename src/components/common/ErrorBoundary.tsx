import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[DMS ErrorBoundary caught an unhandled error]:", error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f7fb] dark:bg-[#0b1520] text-slate-900 dark:text-slate-100 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                <span>Hệ Thống Quản Lý KTX FPT University</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Đã xảy ra sự cố hiển thị giao diện
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ứng dụng vừa ghi nhận một lỗi hiển thị đột xuất. Dữ liệu tài khoản và phiên làm việc của bạn vẫn được lưu trữ an toàn.
              </p>
            </div>

            {/* Error Message Details (if available) */}
            {this.state.error && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 text-left text-xs font-mono text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto">
                <p className="font-bold text-rose-600 dark:text-rose-400 mb-1">
                  Chi tiết lỗi:
                </p>
                <p className="break-all">{this.state.error.message || String(this.state.error)}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 text-xs sm:text-sm transition-all shadow-md hover:scale-[1.01]"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Tải lại trang</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-3 px-4 text-xs sm:text-sm transition-all shadow-xs"
              >
                <Home className="h-4 w-4" />
                <span>Về Trang Chủ</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
