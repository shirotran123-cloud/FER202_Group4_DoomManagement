import React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import type { ResidentTemporaryRecord } from "@/types/dashboard"

interface ResidentRegistryTableProps {
  residents: ResidentTemporaryRecord[]
}

export const ResidentRegistryTable: React.FC<ResidentRegistryTableProps> = ({
  residents,
}) => {
  if (residents.length === 0) {
    return (
      <div className="flex h-36 flex-col items-center justify-center text-center text-muted-foreground text-xs">
        <p>Không tìm thấy sinh viên nào phù hợp với bộ lọc hiện tại.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur-xs shadow-xs">
        <TableRow>
          <TableHead className="w-12">STT</TableHead>
          <TableHead>Học Kỳ</TableHead>
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
        {residents.map((res, index) => (
          <TableRow key={res.contractCode}>
            <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
            <TableCell className="font-semibold text-xs text-primary whitespace-nowrap">
              {res.semester || "Fall 2026"}
            </TableCell>
            <TableCell className="font-mono text-muted-foreground">{res.contractCode}</TableCell>
            <TableCell className="font-bold text-foreground whitespace-nowrap">{res.fullName}</TableCell>
            <TableCell className="font-mono font-bold text-foreground">{res.studentId}</TableCell>
            <TableCell>{res.gender}</TableCell>
            <TableCell className="font-mono">{res.citizenId}</TableCell>
            <TableCell>{res.hometown}</TableCell>
            <TableCell className="font-semibold text-primary whitespace-nowrap">
              {res.room} • {res.bedCode}
            </TableCell>
            <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
              {res.startDate} ➔ {res.endDate}
            </TableCell>
            <TableCell className="text-right text-[11px] whitespace-nowrap">
              <span className="font-semibold text-foreground">{res.parentName}</span>
              <span className="block text-muted-foreground font-mono">{res.parentPhone}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
