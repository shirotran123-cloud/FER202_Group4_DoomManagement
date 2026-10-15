import { Card } from "@/components/ui/card"

interface MaintenanceStatsProps {
  stats: {
    total: number
    pending: number
    inProgress: number
    resolved: number
    closed: number
    emergency: number
  }
}

export const MaintenanceStats: React.FC<MaintenanceStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      <Card className="p-4 shadow-xs">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Tổng số phiếu
        </span>
        <div className="mt-2 text-2xl font-bold text-foreground">{stats.total}</div>
        <div className="mt-1 text-xs text-muted-foreground">Tất cả các thời điểm</div>
      </Card>

      <Card className="p-4 border-amber-300/80 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs">
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
          Chờ tiếp nhận
        </span>
        <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
        <div className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">Cần phân công kỹ thuật</div>
      </Card>

      <Card className="p-4 border-secondary/40 bg-secondary/10 shadow-xs">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
          Đang xử lý
        </span>
        <div className="mt-2 text-2xl font-bold text-secondary">{stats.inProgress}</div>
        <div className="mt-1 text-xs text-secondary/80">Thợ đang làm việc</div>
      </Card>

      <Card className="p-4 border-primary/40 bg-primary/10 shadow-xs">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Chờ nghiệm thu
        </span>
        <div className="mt-2 text-2xl font-bold text-primary">{stats.resolved}</div>
        <div className="mt-1 text-xs text-primary/80">Chờ sinh viên đánh giá</div>
      </Card>

      <Card className="p-4 border-destructive/40 bg-destructive/10 shadow-xs col-span-2 lg:col-span-1">
        <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
          Sự cố khẩn cấp
        </span>
        <div className="mt-2 text-2xl font-bold text-destructive">{stats.emergency}</div>
        <div className="mt-1 text-xs text-destructive/80">Cam kết có mặt 2h</div>
      </Card>
    </div>
  )
}
