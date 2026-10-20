import React from "react"
import { LayoutDashboard, FileSpreadsheet, PieChart } from "lucide-react"

export const ManagerDashboardStubPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5 p-8 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-purple-600 uppercase">
                Module 7 â€¢ Tá»•ng quan quáº£n trá»‹
              </span>
              <h1 className="text-2xl font-black text-foreground">
                Tá»•ng Quan Quáº£n Trá»‹ & BÃ¡o CÃ¡o Thá»‘ng KÃª Ban Quáº£n LÃ½
              </h1>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-right">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              ThÃ nh viÃªn phá»¥ trÃ¡ch:
            </p>
            <p className="text-xs font-bold text-foreground">
              ðŸ›¡ï¸ Äinh Thanh Trung & Ban Quáº£n LÃ½
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            <PieChart className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-foreground">
              1. Dashboard CÃ´ng Suáº¥t PhÃ²ng
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Biá»ƒu Ä‘á»“ trá»±c quan tá»· lá»‡ láº¥p Ä‘áº§y giÆ°á»ng
              (Occupancy Rate), tráº¡ng thÃ¡i báº£o trÃ¬ vÃ doanh thu tiá»n
              phÃ²ng thá»i gian thá»±c.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-foreground">
              2. Xuáº¥t BÃ¡o CÃ¡o Excel (.xlsx)
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Tá»± Ä‘á»™ng káº¿t xuáº¥t danh sÃ¡ch sinh viÃªn táº¡m trÃº gá»­i
              CÃ´ng an Ä‘á»‹a phÆ°Æ¡ng vÃ danh sÃ¡ch sinh viÃªn ná»£ cÆ°á»›c
              Ä‘iá»‡n nÆ°á»›c.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
