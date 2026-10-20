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

export const MaintenanceStats: React.FC<MaintenanceStatsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-5">
      <Card className="p-4 shadow-xs">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Tổng số phiếu
        </span>
        <div className="mt-2 text-2xl font-bold text-foreground">
          {stats.total}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Tất cả các thời điểm
        </div>
      </Card>

      <Card className="border-cyan-300/80 p-4 shadow-xs">
        <span className="text-xs font-semibold tracking-wider text-cyan-700 uppercase dark:text-cyan-400">
          Chờ tiếp nhận
        </span>
        <div className="mt-2 text-2xl font-bold text-cyan-600 dark:text-cyan-400">
          {stats.pending}
        </div>
        <div className="mt-1 text-xs text-cyan-700/80 dark:text-cyan-400/80">
          Cần phân công kỹ thuật
        </div>
      </Card>

      <Card className="border-secondary/40 p-4 shadow-xs">
        <span className="text-xs font-semibold tracking-wider text-secondary uppercase">
          Đang xử lý
        </span>
        <div className="mt-2 text-2xl font-bold text-secondary">
          {stats.inProgress}
        </div>
        <div className="mt-1 text-xs text-secondary/80">Thợ đang làm việc</div>
      </Card>

      <Card className="border-primary/40 p-4 shadow-xs">
        <span className="text-xs font-semibold tracking-wider text-primary uppercase">
          Chờ nghiệm thu
        </span>
        <div className="mt-2 text-2xl font-bold text-primary">
          {stats.resolved}
        </div>
        <div className="mt-1 text-xs text-primary/80">
          Chờ sinh viên đánh giá
        </div>
      </Card>

      <Card className="col-span-2 border-destructive/40 p-4 shadow-xs lg:col-span-1">
        <span className="text-xs font-semibold tracking-wider text-destructive uppercase">
          Sự cố khẩn cấp
        </span>
        <div className="mt-2 text-2xl font-bold text-destructive">
          {stats.emergency}
        </div>
        <div className="mt-1 text-xs text-destructive/80">
          Ưu tiên xử lý ngay
        </div>
      </Card>
    </div>
  )
}
