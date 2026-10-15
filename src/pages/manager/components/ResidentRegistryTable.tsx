import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Users, Download } from "lucide-react"
import type { ResidentTemporaryRecord } from "@/types/dashboard"

interface ResidentRegistryTableProps {
  residents: ResidentTemporaryRecord[]
  onExportExcel: () => void
}

export const ResidentRegistryTable: React.FC<ResidentRegistryTableProps> = ({
  residents,
  onExportExcel,
}) => {
  return (
    <Card className="p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">
            Xem Trước Dữ Liệu: Danh Sách Sinh Viên Nội Trú Khai Báo Tạm Trú
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          className="gap-1 font-bold text-primary hover:text-primary"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Tải về file Excel</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">STT</TableHead>
            <TableHead>Hợp Đồng</TableHead>
            <TableHead>Họ và Tên</TableHead>
            <TableHead>MSSV</TableHead>
            <TableHead>Giới Tính</TableHead>
            <TableHead>CCCD</TableHead>
            <TableHead>Quê Quán</TableHead>
            <TableHead>Phòng - Giường</TableHead>
            <TableHead>Thời Hạn</TableHead>
            <TableHead className="text-right">Phụ Huynh</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.map((res) => (
            <TableRow key={res.contractCode}>
              <TableCell className="font-mono text-muted-foreground">{res.stt}</TableCell>
              <TableCell className="font-mono text-muted-foreground">{res.contractCode}</TableCell>
              <TableCell className="font-bold text-foreground">{res.fullName}</TableCell>
              <TableCell className="font-mono font-bold text-foreground">{res.studentId}</TableCell>
              <TableCell>{res.gender}</TableCell>
              <TableCell className="font-mono">{res.citizenId}</TableCell>
              <TableCell>{res.hometown}</TableCell>
              <TableCell className="font-semibold text-primary">
                {res.room} • {res.bedCode}
              </TableCell>
              <TableCell className="text-[11px] text-muted-foreground">
                {res.startDate} ➔ {res.endDate}
              </TableCell>
              <TableCell className="text-right text-[11px]">
                <span className="font-semibold text-foreground">{res.parentName}</span>
                <span className="block text-muted-foreground font-mono">{res.parentPhone}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
