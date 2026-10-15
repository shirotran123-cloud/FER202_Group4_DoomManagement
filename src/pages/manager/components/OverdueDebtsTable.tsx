import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { DollarSign, Download } from "lucide-react"
import type { OverdueDebtRecord } from "@/types/dashboard"

interface OverdueDebtsTableProps {
  debts: OverdueDebtRecord[]
  onExportExcel: () => void
}

export const OverdueDebtsTable: React.FC<OverdueDebtsTableProps> = ({
  debts,
  onExportExcel,
}) => {
  return (
    <Card className="p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-destructive" />
          <h3 className="font-bold text-sm text-foreground">
            Xem Trước Dữ Liệu: Danh Sách Công Nợ Quá Hạn Chưa Nộp Tiền Điện Nước
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          className="gap-1 font-bold text-destructive hover:text-destructive"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Tải về file Excel</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">STT</TableHead>
            <TableHead>Mã Hóa Đơn</TableHead>
            <TableHead>MSSV</TableHead>
            <TableHead>Họ và Tên</TableHead>
            <TableHead>Phòng - Giường</TableHead>
            <TableHead>Kỳ Cước</TableHead>
            <TableHead className="text-right">Tiền Phòng Nợ</TableHead>
            <TableHead className="text-right">Điện Nước Nợ</TableHead>
            <TableHead className="text-right">Tổng Nợ</TableHead>
            <TableHead className="text-right">Trạng Thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debts.map((debt) => (
            <TableRow key={debt.invoiceCode}>
              <TableCell className="font-mono text-muted-foreground">{debt.stt}</TableCell>
              <TableCell className="font-mono text-muted-foreground">{debt.invoiceCode}</TableCell>
              <TableCell className="font-mono font-bold text-foreground">{debt.studentId}</TableCell>
              <TableCell className="font-bold text-foreground">{debt.fullName}</TableCell>
              <TableCell className="font-semibold text-primary">
                {debt.room} ({debt.bedCode})
              </TableCell>
              <TableCell className="text-muted-foreground">{debt.billingPeriod}</TableCell>
              <TableCell className="text-right font-mono">
                {debt.roomDebt.toLocaleString("vi-VN")} đ
              </TableCell>
              <TableCell className="text-right font-mono">
                {debt.utilityDebt.toLocaleString("vi-VN")} đ
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-destructive">
                {debt.totalDebt.toLocaleString("vi-VN")} đ
              </TableCell>
              <TableCell className="text-right">
                {debt.status === "CẢNH BÁO ĐÌNH CHỈ" ? (
                  <Badge variant="maintenance" className="animate-pulse">
                    {debt.status}
                  </Badge>
                ) : (
                  <Badge variant="holding">{debt.status}</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
