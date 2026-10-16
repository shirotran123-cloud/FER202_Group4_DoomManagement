/**
 * Xuất hóa đơn tiền phòng & điện nước (A4) cho KTX FPT.
 *
 * ĐẶC ĐIỂM CHÍNH:
 *  - Dùng font Roboto nhúng (xem `src/lib/fontEmbed.ts`) nên tiếng Việt GIỮ NGUYÊN DẤU.
 *    Không có bất kỳ lời gọi chuẩn hoá Unicode hay xoá dấu tổ hợp nào trong file này.
 *  - Số tiền lấy từ `buildMonthlyInvoice` (`src/lib/dorm-ops.ts`) — cùng công thức
 *    bậc thang 1800/2200/2600/3100 VNĐ/kWh, nước 18.000 VNĐ/m³, wifi 120.000,
 *    vệ sinh 60.000, phòng 950.000/sinh viên, VAT 8%.
 *  - Không dùng thư viện bảng ngoài (chỉ có `jspdf` trong dependencies) — bảng vẽ tay
 *    bằng `doc.text` / `doc.line` / `doc.rect`.
 *  - Nội dung VietQR dùng lại `buildVietQrContent` của `dorm-ops.ts` (file đó không
 *    import gì nên KHÔNG có phụ thuộc vòng).
 */

// Dùng named export `jsPDF` (có ở cả `jspdf.es.min.js` lẫn `jspdf.node.min.js`);
// default export không ổn định khi bundle/SSR interop.
import { jsPDF } from 'jspdf'
import {
  ELECTRICITY_TIERS,
  WATER_PRICE_PER_M3,
  buildMonthlyInvoice,
  buildVietQrContent,
} from './dorm-ops'
import type { MonthlyInvoice } from './dorm-ops'
import { PDF_FONT_FAMILY, PDF_FONT_FAMILY_MEDIUM, registerPdfFonts } from './fontEmbed'

/** Tên đơn vị in trên tiêu đề hóa đơn. */
export const INVOICE_DORM_NAME = 'KÝ TÚC XÁ FPT'
/** Tiêu đề hóa đơn. */
export const INVOICE_TITLE = 'HÓA ĐƠN TIỀN PHÒNG & ĐIỆN NƯỚC'

/** Giá trị mặc định của biểu phí (khớp `server/config.js` và `BillingPage.tsx`). */
export const DEFAULT_ROOM_FEE_PER_STUDENT = 950_000
export const DEFAULT_WIFI_FEE_TOTAL = 120_000
export const DEFAULT_CLEANING_FEE_TOTAL = 60_000
export const DEFAULT_VAT_RATE = 0.08

/** Khổ A4 dọc, đơn vị mm. */
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN_X = 15
/** Bề rộng vùng nội dung: 210 - 2 * 15 = 180mm. */
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2
/** Chừa chỗ cho footer (số trang + lời cảm ơn). */
const FOOTER_RESERVED = 22

/** Ghi chú mặc định khi `InvoicePdfInput.note` bỏ trống. */
const DEFAULT_INVOICE_NOTE =
  'Vui lòng giữ lại hóa đơn để đối chiếu. Khiếu nại chỉ số công tơ trong vòng 07 ngày kể từ ngày lập.'

export interface InvoiceStudentInfo {
  fullName: string
  mssv: string
  room: string
  bedCode: string
  phone?: string
  building?: string
}

export interface InvoiceMeterInput {
  elecOld: number
  elecNew: number
  waterOld: number
  waterNew: number
}

export interface InvoiceTariffInput {
  roomFeePerStudent: number
  wifiFeeTotal: number
  cleaningFeeTotal: number
  numStudents: number
  /** VAT, mặc định 0.08. */
  vatRate?: number
}

/**
 * Đầu vào của `generateInvoicePdf`.
 *
 * Có thể truyền sẵn `invoice` (kết quả `buildMonthlyInvoice`) để tránh tính lại;
 * nếu bỏ trống, module tự gọi `buildMonthlyInvoice` từ `meter` + `tariff`.
 */
export interface InvoicePdfInput {
  /** Mã hóa đơn, ví dụ `INV-2026-09-A205`. */
  invoiceCode: string
  /** Kỳ hóa đơn dạng `YYYY-MM` (ví dụ `2026-09`). */
  billingMonth: string
  /** Ngày lập (ISO hoặc chuỗi ngày). Mặc định hôm nay. */
  issueDate?: string
  /** Hạn thanh toán. Mặc định ngày 05 của tháng kế tiếp. */
  dueDate?: string
  student: InvoiceStudentInfo
  meter: InvoiceMeterInput
  tariff: InvoiceTariffInput
  /** Bỏ trống để tự tính bằng `buildMonthlyInvoice`. */
  invoice?: MonthlyInvoice
  /** Tiền tố nội dung chuyển khoản, mặc định `DIENNUOC`. */
  qrPurpose?: string
  /** Ghi đè nội dung VietQR; nếu bỏ trống thì gọi `buildVietQrContent`. */
  qrContent?: string
  /**
   * Số tiền ghi trên nội dung chuyển khoản.
   * Mặc định = tổng cộng (đã gồm VAT) chia đều cho số sinh viên.
   */
  payableAmount?: number
  /** Tên đơn vị, mặc định `KÝ TÚC XÁ FPT`. */
  dormName?: string
  /** Ghi chú thêm in cuối trang. */
  note?: string
}

/* ------------------------------------------------------------------ */
/* Định dạng                                                          */
/* ------------------------------------------------------------------ */

/** 1085667 → "1.085.667đ" (chuẩn vi-VN). */
export const formatVnd = (value: number): string =>
  `${Math.round(Number.isFinite(value) ? value : 0).toLocaleString('vi-VN')}đ`

const formatDate = (value?: string): string => {
  if (!value) return '...'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

/** "2026-09" → "Tháng 09/2026"; chuỗi khác giữ nguyên. */
export const formatBillingMonth = (month: string): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(month.trim())
  return match ? `Tháng ${match[2]}/${match[1]}` : month
}

const safeText = (value: unknown, fallback = '...'): string => {
  const text = typeof value === 'string' ? value.trim() : value === undefined || value === null ? '' : String(value)
  return text.length > 0 ? text : fallback
}

/* ------------------------------------------------------------------ */
/* Bảng vẽ tay                                                        */
/* ------------------------------------------------------------------ */

type Align = 'left' | 'right' | 'center'

interface TableColumn {
  label: string
  /** Bề rộng cột (mm). Tổng các cột phải bằng bề rộng vùng nội dung. */
  width: number
  align?: Align
}

interface TableOptions {
  x: number
  y: number
  columns: TableColumn[]
  rows: string[][]
  /** Chỉ số các dòng in đậm (0-based). */
  boldRows?: number[]
  /** Chỉ số các dòng sau đó kẻ đường đậm hơn (0-based), dùng cho dòng tổng. */
  strongRuleAfter?: number[]
  rowHeight?: number
  fontSize?: number
}

const ROW_HEIGHT = 7
const HEADER_ROW_HEIGHT = 7.5

/** Vẽ một bảng: header nền xám, kẻ đường mảnh giữa các dòng. Trả về y sau bảng. */
function drawTable(doc: jsPDF, options: TableOptions): number {
  const { x, columns, rows } = options
  const rowHeight = options.rowHeight ?? ROW_HEIGHT
  const fontSize = options.fontSize ?? 9.5
  const boldRows = new Set(options.boldRows ?? [])
  const strongRules = new Set(options.strongRuleAfter ?? [])
  const totalWidth = columns.reduce((sum, column) => sum + column.width, 0)
  let y = options.y

  const columnLeft = (index: number): number =>
    x + columns.slice(0, index).reduce((sum, column) => sum + column.width, 0)

  const drawCell = (text: string, index: number, baseline: number, bold: boolean): void => {
    const column = columns[index]
    const align: Align = column.align ?? 'left'
    doc.setFont(PDF_FONT_FAMILY, bold ? 'bold' : 'normal')
    if (align === 'right') {
      doc.text(text, columnLeft(index) + column.width - 2, baseline, { align: 'right' })
    } else if (align === 'center') {
      doc.text(text, columnLeft(index) + column.width / 2, baseline, { align: 'center' })
    } else {
      doc.text(text, columnLeft(index) + 2, baseline)
    }
  }

  // Header
  doc.setFillColor(241, 243, 246)
  doc.rect(x, y, totalWidth, HEADER_ROW_HEIGHT, 'F')
  doc.setFontSize(fontSize)
  columns.forEach((column, index) => {
    drawCell(column.label, index, y + HEADER_ROW_HEIGHT - 2.4, true)
  })
  y += HEADER_ROW_HEIGHT
  doc.setDrawColor(120, 126, 136)
  doc.setLineWidth(0.3)
  doc.line(x, y, x + totalWidth, y)

  // Dòng dữ liệu
  doc.setDrawColor(214, 219, 226)
  doc.setLineWidth(0.15)
  rows.forEach((row, rowIndex) => {
    const bold = boldRows.has(rowIndex)
    doc.setFontSize(fontSize)
    row.forEach((cell, index) => {
      if (index < columns.length) drawCell(cell, index, y + rowHeight - 2.2, bold)
    })
    y += rowHeight
    if (rowIndex < rows.length - 1 || strongRules.has(rowIndex)) {
      const strong = strongRules.has(rowIndex)
      doc.setDrawColor(strong ? 120 : 214, strong ? 126 : 219, strong ? 136 : 226)
      doc.setLineWidth(strong ? 0.3 : 0.15)
      doc.line(x, y, x + totalWidth, y)
    }
  })
  return y
}

/* ------------------------------------------------------------------ */
/* Biểu giá điện bậc thang để in diễn giải                            */
/* ------------------------------------------------------------------ */

interface TierLine {
  label: string
  kwh: number
  pricePerKwh: number
  amount: number
}

/** Tách kWh tiêu thụ thành từng bậc — dùng đúng `ELECTRICITY_TIERS` của dorm-ops. */
export function electricityTierLines(kwh: number): TierLine[] {
  const lines: TierLine[] = []
  let remaining = Math.max(0, Math.floor(Number.isFinite(kwh) ? kwh : 0))
  let previousCap = 0
  for (const [index, tier] of ELECTRICITY_TIERS.entries()) {
    if (remaining <= 0) break
    const usable = Math.min(remaining, tier.upToKwh - previousCap)
    if (usable > 0) {
      const upper = Number.isFinite(tier.upToKwh) ? `${tier.upToKwh}` : 'trở lên'
      const label =
        index === 0
          ? `Điện bậc ${index + 1} (0-${upper} kWh)`
          : Number.isFinite(tier.upToKwh)
            ? `Điện bậc ${index + 1} (${previousCap + 1}-${upper} kWh)`
            : `Điện bậc ${index + 1} (trên ${previousCap} kWh)`
      lines.push({ label, kwh: usable, pricePerKwh: tier.pricePerKwh, amount: usable * tier.pricePerKwh })
      remaining -= usable
    }
    previousCap = tier.upToKwh
  }
  return lines
}

/* ------------------------------------------------------------------ */
/* Dựng tài liệu                                                      */
/* ------------------------------------------------------------------ */

const defaultDueDate = (billingMonth: string): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(billingMonth.trim())
  if (!match) return new Date().toISOString()
  const year = Number(match[1])
  const month = Number(match[2])
  const due = month === 12 ? new Date(year + 1, 0, 5) : new Date(year, month, 5)
  return due.toISOString()
}

const resolveInvoice = (input: InvoicePdfInput): MonthlyInvoice =>
  input.invoice ??
  buildMonthlyInvoice({
    room: input.student.room,
    month: input.billingMonth,
    elecOld: input.meter.elecOld,
    elecNew: input.meter.elecNew,
    waterOld: input.meter.waterOld,
    waterNew: input.meter.waterNew,
    roomFeePerStudent: input.tariff.roomFeePerStudent,
    wifiFeeTotal: input.tariff.wifiFeeTotal,
    cleaningFeeTotal: input.tariff.cleaningFeeTotal,
    numStudents: input.tariff.numStudents,
  })

/**
 * Dựng tài liệu hóa đơn (chưa lưu). Ném `PdfFontError` nếu không nạp được font —
 * khi đó KHÔNG có PDF nào được tạo, tránh xuất nhầm bản mất dấu tiếng Việt.
 */
export async function buildInvoicePdfDoc(input: InvoicePdfInput): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  // Bắt buộc: font Unicode. Ném PdfFontError (tiếng Việt) nếu thiếu — xem fontEmbed.ts.
  // Không có nhánh dự phòng helvetica: thà không xuất PDF còn hơn xuất bản mất dấu.
  await registerPdfFonts(doc)

  const invoice = resolveInvoice(input)
  const numStudents = Math.max(1, Math.floor(input.tariff.numStudents || 1))
  const vatRate = input.tariff.vatRate ?? DEFAULT_VAT_RATE

  const subtotal = invoice.grandTotal
  const vatAmount = Math.round(subtotal * vatRate)
  const grandTotal = subtotal + vatAmount
  const payableAmount = input.payableAmount ?? Math.round(grandTotal / numStudents)
  const qrContent =
    input.qrContent ?? buildVietQrContent(input.student.room, input.student.mssv, payableAmount, input.qrPurpose ?? 'DIENNUOC')

  const dormName = input.dormName ?? INVOICE_DORM_NAME
  const issueDate = input.issueDate ?? new Date().toISOString()
  const dueDate = input.dueDate ?? defaultDueDate(input.billingMonth)

  doc.setProperties({
    title: `${INVOICE_TITLE} - ${input.invoiceCode}`,
    subject: `Hóa đơn kỳ ${formatBillingMonth(input.billingMonth)} - Phòng ${input.student.room}`,
    author: dormName,
    creator: 'DMS - Dormitory Management System',
  })

  const rightEdge = MARGIN_X + CONTENT_WIDTH
  let y = 18

  /* ------------------------------ HEADER ------------------------------ */
  doc.setFont(PDF_FONT_FAMILY_MEDIUM, 'normal')
  doc.setFontSize(11)
  doc.setTextColor(90, 96, 106)
  doc.text(dormName, MARGIN_X, y)

  doc.setFontSize(9)
  doc.text('Ban quản lý Ký túc xá · Khu Công nghệ cao Hòa Lạc, Hà Nội', MARGIN_X, y + 5)

  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 34, 40)
  doc.text('MST: 0101248141', rightEdge, y, { align: 'right' })
  doc.setFont(PDF_FONT_FAMILY, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(90, 96, 106)
  doc.text('Hotline: 1900 6868', rightEdge, y + 5, { align: 'right' })
  y += 12

  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.setFontSize(17)
  doc.setTextColor(17, 24, 39)
  doc.text(INVOICE_TITLE, PAGE_WIDTH / 2, y, { align: 'center' })
  y += 6
  doc.setFont(PDF_FONT_FAMILY, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90, 96, 106)
  doc.text(`Kỳ: ${formatBillingMonth(input.billingMonth)}`, PAGE_WIDTH / 2, y, { align: 'center' })
  y += 7

  doc.setDrawColor(30, 64, 175)
  doc.setLineWidth(0.6)
  doc.line(MARGIN_X, y, rightEdge, y)
  y += 7

  /* --------------------------- MÃ & NGÀY ----------------------------- */
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(9.5)
  const metaLeft = [
    ['Số hóa đơn:', safeText(input.invoiceCode)],
    ['Ngày lập:', formatDate(issueDate)],
  ]
  const metaRight = [
    ['Mã sinh viên:', safeText(input.student.mssv)],
    ['Hạn thanh toán:', formatDate(dueDate)],
  ]
  metaLeft.forEach(([label, value], index) => {
    doc.setFont(PDF_FONT_FAMILY, 'normal')
    doc.text(label, MARGIN_X, y + index * 5.5)
    doc.setFont(PDF_FONT_FAMILY, 'bold')
    doc.text(value, MARGIN_X + 26, y + index * 5.5)
  })
  metaRight.forEach(([label, value], index) => {
    doc.setFont(PDF_FONT_FAMILY, 'normal')
    doc.text(label, MARGIN_X + 100, y + index * 5.5)
    doc.setFont(PDF_FONT_FAMILY, 'bold')
    doc.text(value, MARGIN_X + 128, y + index * 5.5)
  })
  y += 14

  /* --------------------------- KHỐI SINH VIÊN ------------------------- */
  const studentRows: Array<[string, string]> = [
    ['Họ và tên', safeText(input.student.fullName)],
    ['MSSV', safeText(input.student.mssv)],
    ['Phòng', safeText(input.student.room)],
    ['Mã giường', safeText(input.student.bedCode)],
    ['Số điện thoại', safeText(input.student.phone, 'Chưa cập nhật')],
  ]
  if (input.student.building) studentRows.splice(3, 0, ['Tòa nhà', input.student.building])

  const studentBoxHeight = 11 + Math.ceil(studentRows.length / 2) * 6
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(214, 219, 226)
  doc.setLineWidth(0.2)
  doc.rect(MARGIN_X, y, CONTENT_WIDTH, studentBoxHeight, 'FD')

  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(30, 64, 175)
  doc.text('THÔNG TIN SINH VIÊN', MARGIN_X + 3, y + 6)
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(9.5)

  const studentColumnWidth = CONTENT_WIDTH / 2
  studentRows.forEach(([label, value], index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const cellX = MARGIN_X + 3 + column * studentColumnWidth
    const baseline = y + 12 + row * 6
    doc.setFont(PDF_FONT_FAMILY, 'normal')
    doc.setTextColor(90, 96, 106)
    doc.text(`${label}:`, cellX, baseline)
    doc.setFont(PDF_FONT_FAMILY, 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text(value, cellX + 26, baseline, { maxWidth: studentColumnWidth - 30 })
  })
  y += studentBoxHeight + 8

  /* ------------------------- BẢNG CHỈ SỐ CÔNG TƠ ---------------------- */
  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(30, 64, 175)
  doc.text('CHỈ SỐ CÔNG TƠ', MARGIN_X, y)
  doc.setTextColor(17, 24, 39)
  y += 3

  const meterTableEnd = drawTable(doc, {
    x: MARGIN_X,
    y,
    columns: [
      { label: 'Loại', width: 50 },
      { label: 'Chỉ số cũ', width: 43, align: 'right' },
      { label: 'Chỉ số mới', width: 43, align: 'right' },
      { label: 'Tiêu thụ', width: 44, align: 'right' },
    ],
    rows: [
      [
        'Điện (kWh)',
        input.meter.elecOld.toLocaleString('vi-VN'),
        input.meter.elecNew.toLocaleString('vi-VN'),
        `${invoice.deltaElec.toLocaleString('vi-VN')} kWh`,
      ],
      [
        'Nước (m³)',
        input.meter.waterOld.toLocaleString('vi-VN'),
        input.meter.waterNew.toLocaleString('vi-VN'),
        `${invoice.deltaWater.toLocaleString('vi-VN')} m³`,
      ],
    ],
  })
  y = meterTableEnd + 9

  /* --------------------------- BẢNG TIỀN ----------------------------- */
  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(30, 64, 175)
  doc.text('CHI TIẾT CHI PHÍ', MARGIN_X, y)
  doc.setTextColor(17, 24, 39)
  y += 3

  const moneyRows: string[][] = []
  const boldRows: number[] = []
  const strongRules: number[] = []

  for (const line of electricityTierLines(invoice.deltaElec)) {
    moneyRows.push([
      line.label,
      `${line.pricePerKwh.toLocaleString('vi-VN')}đ/kWh`,
      `${line.kwh.toLocaleString('vi-VN')}`,
      formatVnd(line.amount),
    ])
  }
  if (invoice.deltaElec <= 0) {
    moneyRows.push(['Điện tiêu thụ', '—', '0', formatVnd(0)])
  }

  moneyRows.push([
    'Nước sinh hoạt',
    `${WATER_PRICE_PER_M3.toLocaleString('vi-VN')}đ/m³`,
    `${invoice.deltaWater.toLocaleString('vi-VN')}`,
    formatVnd(invoice.waterCost),
  ])

  const sharedFees = invoice.sharedFees
  const wifiFee = Math.max(0, input.tariff.wifiFeeTotal)
  const cleaningFee = Math.max(0, input.tariff.cleaningFeeTotal)
  moneyRows.push(['Phí wifi (phòng)', 'Khoán tháng', '1', formatVnd(wifiFee)])
  moneyRows.push(['Phí vệ sinh (phòng)', 'Khoán tháng', '1', formatVnd(cleaningFee)])
  if (sharedFees !== wifiFee + cleaningFee) {
    moneyRows.push(['Phí chung khác', '—', '1', formatVnd(sharedFees - wifiFee - cleaningFee)])
  }

  moneyRows.push([
    'Tiền phòng',
    `${input.tariff.roomFeePerStudent.toLocaleString('vi-VN')}đ/sinh viên`,
    `${numStudents.toLocaleString('vi-VN')}`,
    formatVnd(invoice.roomTotal),
  ])
  strongRules.push(moneyRows.length - 1)

  const subtotalRow = moneyRows.length
  moneyRows.push(['Tạm tính (trước VAT)', '', '', formatVnd(subtotal)])
  boldRows.push(subtotalRow)

  const vatRow = moneyRows.length
  moneyRows.push(['VAT', `${(vatRate * 100).toLocaleString('vi-VN')}%`, '', formatVnd(vatAmount)])
  boldRows.push(vatRow)

  const totalRow = moneyRows.length
  moneyRows.push(['TỔNG CỘNG', '', '', formatVnd(grandTotal)])
  boldRows.push(totalRow)
  strongRules.push(totalRow)

  const perStudentRow = moneyRows.length
  moneyRows.push([
    `Mỗi sinh viên đóng (chia đều ${numStudents} người)`,
    '',
    '',
    formatVnd(payableAmount),
  ])
  boldRows.push(perStudentRow)

  y = drawTable(doc, {
    x: MARGIN_X,
    y,
    columns: [
      { label: 'Khoản mục', width: 84 },
      { label: 'Đơn giá', width: 40, align: 'right' },
      { label: 'SL', width: 16, align: 'right' },
      { label: 'Thành tiền', width: 40, align: 'right' },
    ],
    rows: moneyRows,
    boldRows,
    strongRuleAfter: strongRules,
  })
  y += 9

  /* --------------------------- THANH TOÁN ---------------------------- */
  const qrBoxHeight = 34
  doc.setFillColor(239, 246, 255)
  doc.setDrawColor(30, 64, 175)
  doc.setLineWidth(0.3)
  doc.rect(MARGIN_X, y, CONTENT_WIDTH, qrBoxHeight, 'FD')

  doc.setFont(PDF_FONT_FAMILY, 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(30, 64, 175)
  doc.text('THANH TOÁN QUA VIETQR', MARGIN_X + 3, y + 6.5)

  doc.setFontSize(9.5)
  doc.setTextColor(17, 24, 39)
  const paymentLines: Array<[string, string]> = [
    ['Số tiền chuyển khoản:', formatVnd(payableAmount)],
    ['Nội dung chuyển khoản:', qrContent],
    ['Hạn thanh toán:', formatDate(dueDate)],
  ]
  paymentLines.forEach(([label, value], index) => {
    const baseline = y + 13 + index * 5.5
    doc.setFont(PDF_FONT_FAMILY, 'normal')
    doc.setTextColor(90, 96, 106)
    doc.text(label, MARGIN_X + 3, baseline)
    doc.setFont(PDF_FONT_FAMILY, 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text(value, MARGIN_X + 48, baseline)
  })

  doc.setFont(PDF_FONT_FAMILY, 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(90, 96, 106)
  doc.text(
    'Mã QR VietQR đang hiển thị trên màn hình Điện nước & Hóa đơn. Quét mã đúng số tiền và nội dung trên.',
    MARGIN_X + 3,
    y + qrBoxHeight - 3,
    { maxWidth: CONTENT_WIDTH - 6 },
  )
  y += qrBoxHeight + 8

  /* ----------------------------- GHI CHÚ ----------------------------- */
  doc.setFont(PDF_FONT_FAMILY, 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(90, 96, 106)
  doc.text('Ghi chú:', MARGIN_X, y)
  // Cắt bớt ghi chú để KHÔNG bao giờ tràn xuống vùng footer (footer bắt đầu ở
  // PAGE_HEIGHT - FOOTER_RESERVED). Tối đa 2 dòng, phần dư thay bằng "…".
  const noteWidth = CONTENT_WIDTH - 14
  const maxNoteLines = 2
  const noteLines = (doc.splitTextToSize(input.note || DEFAULT_INVOICE_NOTE, noteWidth) as string[]).slice(0, maxNoteLines)
  if (noteLines.length === maxNoteLines) {
    const last = noteLines[maxNoteLines - 1]
    noteLines[maxNoteLines - 1] = last.length > 24 ? `${last.slice(0, last.length - 24).trimEnd()}…` : last
  }
  doc.text(noteLines, MARGIN_X + 14, y)
  y += 4 + noteLines.length * 4.5

  /* ----------------------------- CHỮ KÝ ------------------------------ */
  const overflow = y + 26 > PAGE_HEIGHT - FOOTER_RESERVED
  if (!overflow) {
    doc.setFont(PDF_FONT_FAMILY, 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(17, 24, 39)
    doc.text('Người lập hóa đơn', MARGIN_X + 30, y, { align: 'center' })
    doc.text('Sinh viên', rightEdge - 30, y, { align: 'center' })
    doc.setFont(PDF_FONT_FAMILY, 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(90, 96, 106)
    doc.text('(Ký, ghi rõ họ tên)', MARGIN_X + 30, y + 5, { align: 'center' })
    doc.text('(Ký, ghi rõ họ tên)', rightEdge - 30, y + 5, { align: 'center' })
  }

  /* ------------------------------ FOOTER ----------------------------- */
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    const footerY = PAGE_HEIGHT - 12
    doc.setDrawColor(214, 219, 226)
    doc.setLineWidth(0.2)
    doc.line(MARGIN_X, footerY - 5, rightEdge, footerY - 5)
    doc.setFont(PDF_FONT_FAMILY, 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(90, 96, 106)
    doc.text(
      `Cảm ơn ${safeText(input.student.fullName, 'sinh viên')} đã sử dụng dịch vụ của ${dormName}.`,
      MARGIN_X,
      footerY,
    )
    doc.text(`Trang ${page}/${pageCount}`, rightEdge, footerY, { align: 'right' })
  }

  return doc
}

/**
 * Tạo PDF hóa đơn và tải xuống.
 * Tên file: `HoaDon_<mã hóa đơn>_<phòng>_<kỳ>.pdf`.
 */
export async function generateInvoicePdf(input: InvoicePdfInput): Promise<void> {
  const doc = await buildInvoicePdfDoc(input)
  doc.save(invoicePdfFileName(input))
}

/** Tên file gợi ý cho hóa đơn. */
export function invoicePdfFileName(input: InvoicePdfInput): string {
  const clean = (value: string): string => value.replace(/[^0-9A-Za-z._-]+/g, '_')
  return `HoaDon_${clean(safeText(input.invoiceCode, 'INV'))}_${clean(safeText(input.student.room, 'PHONG'))}_${clean(input.billingMonth)}.pdf`
}

/** Biến thể trả `Blob` — tiện upload/`URL.createObjectURL` hoặc preview trong iframe. */
export async function generateInvoicePdfBlob(input: InvoicePdfInput): Promise<Blob> {
  const doc = await buildInvoicePdfDoc(input)
  return doc.output('blob')
}

/** Biến thể trả data URL — tiện nhúng vào `<iframe src=...>` hoặc mở tab mới. */
export async function generateInvoicePdfDataUrl(input: InvoicePdfInput): Promise<string> {
  const doc = await buildInvoicePdfDoc(input)
  return doc.output('datauristring', { filename: invoicePdfFileName(input) })
}
