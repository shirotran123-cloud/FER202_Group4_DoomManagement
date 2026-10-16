/**
 * Xuất PDF hợp đồng thuê chỗ ở KTX.
 *
 * ĐÃ SỬA: trước đây file này bóc dấu tiếng Việt bằng cách chuẩn hoá NFD rồi xoá
 * khối dấu tổ hợp (U+0300–U+036F) vì font `helvetica` của jsPDF không có glyph
 * Unicode → "Nguyễn Hoàng Vinh" thành "Nguyen Hoang Vinh".
 * Nay dùng font Roboto nhúng qua `registerPdfFonts` (xem `src/lib/fontEmbed.ts`),
 * encoding Identity-H + ToUnicode CMap nên chuỗi giữ nguyên dấu 100%.
 * Không còn bất kỳ lời gọi chuẩn hoá/xoá dấu nào trong file này.
 *
 * LƯU Ý API: `generateContractPDF` nay là `async` (phải `await fetch` file font).
 * Nếu font không nạp được, hàm ném `PdfFontError` và KHÔNG tạo file — không có
 * nhánh nào âm thầm quay lại chữ không dấu.
 */

import { jsPDF } from 'jspdf'
import { PDF_FONT_FAMILY, registerPdfFonts } from './fontEmbed'

export interface ContractData {
  contractId: string
  studentName: string
  mssv: string
  bedCode: string
  createdAt: string
  roomFee?: number
  deposit?: number
  startDate?: string
  endDate?: string
  building?: string
  room?: string
  citizenId?: string
  phone?: string
}

/** Ngày dạng vi-VN, giữ nguyên dấu trong chuỗi người dùng nhập. */
const fmtDate = (v?: string): string => {
  if (!v) return '...'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('vi-VN')
}

/** Tiền dạng vi-VN, giữ nguyên dấu (đơn vị VNĐ). */
const fmtMoney = (v?: number): string =>
  typeof v === 'number' && Number.isFinite(v) ? `${v.toLocaleString('vi-VN')} VNĐ` : '...'

/** Tên file an toàn: chỉ bỏ ký tự cấm của Windows, KHÔNG bỏ dấu tiếng Việt. */
const safeFilePart = (v: string): string => v.replace(/[\\/:*?"<>|]+/g, '_')

/**
 * Tạo PDF hợp đồng và tải xuống.
 * @throws {import('./fontEmbed').PdfFontError} khi không nạp được font Unicode.
 */
export const generateContractPDF = async (data: ContractData): Promise<void> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  await registerPdfFonts(doc)

  let y = 20

  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.setFontSize(13)
  doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 105, y, { align: 'center' })
  y += 7
  doc.setFontSize(11)
  doc.text('Độc lập - Tự do - Hạnh phúc', 105, y, { align: 'center' })
  y += 10
  doc.setFontSize(16)
  doc.text('HỢP ĐỒNG THUÊ CHỖ Ở KÝ TÚC XÁ', 105, y, { align: 'center' })
  y += 7
  doc.setFontSize(11)
  doc.setFont(PDF_FONT_FAMILY, 'normal')
  doc.text(`Số hợp đồng: ${data.contractId}`, 105, y, { align: 'center' })
  y += 6
  doc.text(`Ngày tạo: ${fmtDate(data.createdAt)}`, 105, y, { align: 'center' })
  y += 10

  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.text('BÊN A: BAN QUẢN LÝ KTX FPT', 20, y)
  y += 7
  doc.setFont(PDF_FONT_FAMILY, 'normal')
  for (const line of [
    'Đơn vị: Ban quản lý Ký túc xá FPT',
    'Địa chỉ: Khu Giáo dục và Đào tạo, KCNC Hòa Lạc, Hà Nội',
    'Đại diện: Trưởng Ban quản lý KTX',
  ]) {
    doc.text(line, 20, y)
    y += 6
  }
  y += 4

  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.text('BÊN B: SINH VIÊN THUÊ CHỖ Ở', 20, y)
  y += 7
  doc.setFont(PDF_FONT_FAMILY, 'normal')
  for (const line of [
    `Họ và tên: ${data.studentName}`,
    `MSSV: ${data.mssv}`,
    `CCCD: ${data.citizenId ?? '...'}`,
    `SĐT: ${data.phone ?? '...'}`,
  ]) {
    doc.text(line, 20, y)
    y += 6
  }
  y += 4

  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.text('ĐIỀU KHOẢN HỢP ĐỒNG', 20, y)
  y += 7
  doc.setFont(PDF_FONT_FAMILY, 'normal')
  const terms = [
    `1. Mã giường: ${data.bedCode} - Phòng: ${data.room ?? '...'} - Tòa: ${data.building ?? '...'}.`,
    `2. Thời hạn thuê: từ ${fmtDate(data.startDate)} đến ${fmtDate(data.endDate)}.`,
    `3. Giá thuê: ${fmtMoney(data.roomFee)}/tháng. Tiền cọc: ${fmtMoney(data.deposit)}.`,
    '4. Nội quy tóm tắt: giữ vệ sinh chung, không tự ý đổi giường/phòng,',
    '   bảo quản tài sản KTX, không dẫn người lạ qua đêm khi chưa đăng ký.',
    '5. Giờ giới nghiêm: 23:00. Ra/vào sau giờ trên phải tuân thủ quy định trực đêm.',
    '6. Bên B cam kết đóng phí đúng hạn và chịu trách nhiệm bồi thường nếu làm hư hỏng cơ sở vật chất.',
  ]
  for (const line of terms) {
    doc.text(line, 20, y)
    y += 6
  }
  y += 6

  doc.text('Đại diện Bên A', 40, y, { align: 'center' })
  doc.text('Bên B (Sinh viên)', 150, y, { align: 'center' })
  y += 6
  doc.text('(Ký, ghi rõ họ tên)', 40, y, { align: 'center' })
  doc.text('(Ký, ghi rõ họ tên)', 150, y, { align: 'center' })

  doc.save(`HopDong_${safeFilePart(data.mssv)}_${safeFilePart(data.bedCode)}.pdf`)
}
