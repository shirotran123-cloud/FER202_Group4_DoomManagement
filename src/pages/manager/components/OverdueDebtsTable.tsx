import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import type { OverdueDebtRecord } from "@/types/dashboard"

interface OverdueDebtsTableProps {
  debts: OverdueDebtRecord[]
}

export const OverdueDebtsTable: React.FC<OverdueDebtsTableProps> = ({
  debts,
}) => {
  if (debts.length === 0) {
    return (
      <div className="flex h-36 flex-col items-center justify-center text-center text-muted-foreground text-xs">
        <p>Không có công nợ quá hạn nào trong học kỳ được chọn.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur-xs shadow-xs">
        <TableRow>
          <TableHead className="w-12">STT</TableHead>
          <TableHead>Học Kỳ</TableHead>
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
        {debts.map((debt, index) => (
          <TableRow key={debt.invoiceCode}>
            <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
            <TableCell className="font-semibold text-xs text-primary whitespace-nowrap">
              {debt.semester || "Fall 2026"}
            </TableCell>
            <TableCell className="font-mono text-muted-foreground">{debt.invoiceCode}</TableCell>
            <TableCell className="font-mono font-bold text-foreground">{debt.studentId}</TableCell>
            <TableCell className="font-bold text-foreground whitespace-nowrap">{debt.fullName}</TableCell>
            <TableCell className="font-semibold text-primary whitespace-nowrap">
              {debt.room} ({debt.bedCode})
            </TableCell>
            <TableCell className="text-muted-foreground whitespace-nowrap">{debt.billingPeriod}</TableCell>
            <TableCell className="text-right font-mono whitespace-nowrap">
              {debt.roomDebt.toLocaleString("vi-VN")} đ
            </TableCell>
            <TableCell className="text-right font-mono whitespace-nowrap">
              {debt.utilityDebt.toLocaleString("vi-VN")} đ
            </TableCell>
            <TableCell className="text-right font-mono font-bold text-destructive whitespace-nowrap">
              {debt.totalDebt.toLocaleString("vi-VN")} đ
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
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
  )
}
