import React from "react"
import { Card } from "@/components/ui/card"
import { Building, Zap, Droplets, AlertTriangle } from "lucide-react"
import type { BuildingConsumption } from "@/types/dashboard"

interface BuildingConsumptionGridProps {
  consumptions: BuildingConsumption[]
}

export const BuildingConsumptionGrid: React.FC<BuildingConsumptionGridProps> = ({
  consumptions,
}) => {
  return (
    <Card className="p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Giám Sát Điện Nước & Cảnh Báo Bất Thường Theo Tòa
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Phát hiện rò rỉ nước ngầm hoặc đột biến điện năng tiêu thụ tháng 09/2026
          </p>
        </div>
        <span className="text-xs bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold px-2.5 py-1 rounded-full border border-cyan-500/20 self-start sm:self-auto flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-cyan-500" />
          1 Cảnh Báo Tiêu Thụ Đột Biến
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {consumptions.map((item, idx) => {
          const isAnomaly = item.electricityAvgKwh > 330
          return (
            <div
              key={idx}
              className={`rounded-2xl p-4 border transition-all ${
                isAnomaly
                  ? "bg-cyan-500/5 border-cyan-500/40 shadow-xs"
                  : "bg-muted/30 border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-foreground">{item.building}</span>
                {isAnomaly ? (
                  <span className="text-[10px] bg-cyan-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Cảnh Báo
                  </span>
                ) : (
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                    Ổn Định
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-secondary" /> Điện trung bình:
                  </span>
                  <strong className="font-mono text-foreground">
                    {item.electricityAvgKwh} kWh/phòng
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-primary" /> Nước trung bình:
                  </span>
                  <strong className="font-mono text-foreground">
                    {item.waterAvgM3} m³/phòng
                  </strong>
                </div>
              </div>

              {item.anomalyNote && (
                <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed italic border-t border-border/50 pt-2">
                  "{item.anomalyNote}"
                </p>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
