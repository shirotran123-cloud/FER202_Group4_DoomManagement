/**
 * Tiện ích xuất dữ liệu ra bảng tính Microsoft Excel (.xlsx thật) và CSV (UTF-8 BOM).
 *
 * Vì sao module này được viết lại:
 *  - Trước đây `exportToExcelXml` chỉ ghép chuỗi SpreadsheetML 2003 (XML của Office 2003),
 *    đặt MIME `application/vnd.ms-excel` rồi đặt tên file `.xlsx`. File đó KHÔNG phải OOXML:
 *    thiếu chữ ký ZIP `PK\x03\x04`, thiếu `[Content_Types].xml`, thiếu `xl/workbook.xml`,
 *    nên Excel luôn cảnh báo "định dạng tệp không khớp phần mở rộng" và có thể từ chối mở.
 *  - Nay module dùng `write-excel-file/browser` (đóng gói sẵn thư viện nén `fflate`) để tạo
 *    gói OOXML (.xlsx) thật: một file ZIP chứa `[Content_Types].xml`, `xl/workbook.xml`,
 *    `xl/worksheets/sheet1.xml`, `xl/styles.xml`... Nhờ vậy Excel mở file trực tiếp,
 *    KHÔNG còn hộp thoại cảnh báo sai định dạng, và mọi định dạng (màu, viền, số) đều hợp lệ.
 *
 * Ghi chú tương thích ngược:
 *  - `exportToExcelXml` được giữ nguyên TÊN để các call site cũ không phải sửa import,
 *    nhưng đã trở thành `async` và thực chất gọi `exportToExcel`.
 *    Đây chỉ là tên lịch sử — hãy dùng `exportToExcel` cho code mới.
 */

import writeExcelFile from "write-excel-file/browser"
import type { Cell, CellObject, SheetData } from "write-excel-file/browser"

/* ============================================================
 * Kiểu dữ liệu công khai
 * ============================================================ */

export interface ExportColumn<T> {
  header: string
  key: keyof T | string
  formatter?: (value: unknown, item: T) => string | number
  width?: number
  /**
   * Mã định dạng số của Excel (ví dụ `#,##0`, `#,##0" đ"`, `0.00%`).
   *
   * Khi trường này được đặt VÀ giá trị (sau `formatter`) là một số, ô sẽ được ghi
   * dưới dạng ô SỐ thật (`type: Number`) kèm `format`. Nhờ đó Excel vẫn cộng/trừ/sắp xếp
   * được, trong khi người dùng vẫn thấy "1.085.667 đ" nhờ định dạng hiển thị.
   *
   * Đây là cách thay thế cho việc dùng `formatter` trả về chuỗi `"1.085.667đ"` —
   * cách cũ biến ô thành TEXT và làm hỏng mọi phép tính trong Excel.
   */
  numberFormat?: string
  /** Căn lề. Mặc định: ô số căn phải, ô chữ căn trái. */
  align?: "left" | "center" | "right"
}

export interface ExcelExportOptions<T> {
  filename: string
  sheetName: string
  title: string
  subtitle?: string
  columns: ExportColumn<T>[]
  data: T[]
}

/* ============================================================
 * Hằng số trình bày (bám theo bảng màu cũ của ứng dụng)
 * ============================================================ */

const TITLE_COLOR = "#4F46E5" // indigo-600 — màu nhận diện của app
const SUBTITLE_COLOR = "#4B5563"
const HEADER_FILL = "#4F46E5"
const HEADER_TEXT = "#FFFFFF"
const CELL_BORDER = "#E5E7EB"
const ZEBRA_FILL = "#F9FAFB"
const TITLE_HEIGHT = 30
const HEADER_HEIGHT = 26
const DATA_HEIGHT = 22
/** Bề rộng cột cũ tính bằng pixel; quy đổi thô ~7px cho 1 ký tự Excel. */
const PX_PER_CHAR = 7
const DEFAULT_COL_WIDTH_PX = 120
const MIN_COL_WIDTH_CHARS = 6
const MAX_COL_WIDTH_CHARS = 60

/* ============================================================
 * Trợ giúp nội bộ
 * ============================================================ */

/** Quy đổi bề rộng pixel cũ sang bề rộng ký tự của Excel (có kẹp biên). */
function toColumnWidth(px?: number): number {
  const width = Math.round((px ?? DEFAULT_COL_WIDTH_PX) / PX_PER_CHAR)
  return Math.min(MAX_COL_WIDTH_CHARS, Math.max(MIN_COL_WIDTH_CHARS, width))
}

/** Excel giới hạn tên sheet 31 ký tự và cấm các ký tự `[]:*?/\`. */
function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[[\]:*?/\\]/g, " ").trim() || "Sheet1"
  return cleaned.slice(0, 31)
}

function ensureXlsxExtension(filename: string): string {
  return /\.xlsx$/i.test(filename) ? filename : `${filename}.xlsx`
}

/** Dòng tiêu đề (và phụ đề) hợp nhất qua toàn bộ số cột. */
function buildSpanRow(columns: ExportColumn<unknown>[], style: CellObject, value: string): Cell[] {
  const row: Cell[] = new Array(columns.length).fill(null)
  row[0] = { ...style, value, columnSpan: columns.length }
  return row
}

/** Tạo một ô dữ liệu: số giữ nguyên kiểu Number, chữ là String. */
function buildDataCell<T>(column: ExportColumn<T>, item: T, index: number): Cell {
  const raw = (item as Record<string, unknown>)[column.key as string]
  const produced = column.formatter ? column.formatter(raw, item) : raw
  const isNumeric = typeof produced === "number" && Number.isFinite(produced)

  const base: CellObject = {
    align: column.align ?? (isNumeric ? "right" : "left"),
    alignVertical: "center",
    height: DATA_HEIGHT,
    borderColor: CELL_BORDER,
    borderStyle: "thin",
    ...(index % 2 === 1 ? { backgroundColor: ZEBRA_FILL } : {}),
  }

  if (isNumeric) {
    // Ô SỐ thật + mã định dạng hiển thị => Excel tính toán được, không phải text.
    return {
      ...base,
      value: produced as number,
      type: Number,
      ...(column.numberFormat ? { format: column.numberFormat } : {}),
    }
  }

  return {
    ...base,
    type: String,
    value: produced === null || produced === undefined ? "" : String(produced),
  }
}

/** Dựng sheetData theo đúng bố cục cũ: tiêu đề → phụ đề → dòng trống → header → dữ liệu. */
export function buildSheetData<T>(options: ExcelExportOptions<T>): SheetData {
  const { title, subtitle, columns, data } = options
  const rows: SheetData = []

  // 1. Tiêu đề hợp nhất.
  rows.push(
    buildSpanRow(
      columns as unknown as ExportColumn<unknown>[],
      {
        height: TITLE_HEIGHT,
        fontSize: 16,
        fontWeight: "bold",
        textColor: TITLE_COLOR,
        align: "center",
        alignVertical: "center",
      },
      title,
    ),
  )

  // 2. Phụ đề hợp nhất (tuỳ chọn).
  if (subtitle) {
    rows.push(
      buildSpanRow(
        columns as unknown as ExportColumn<unknown>[],
        {
          height: 20,
          fontSize: 11,
          fontStyle: "italic",
          textColor: SUBTITLE_COLOR,
          align: "center",
          alignVertical: "center",
        },
        subtitle,
      ),
    )
  }

  // 3. Dòng trống phân cách.
  rows.push(new Array(columns.length).fill(null))

  // 4. Dòng tiêu đề cột: nền indigo, chữ trắng đậm, có viền.
  rows.push(
    columns.map<Cell>((column) => ({
      value: column.header,
      type: String,
      height: HEADER_HEIGHT,
      fontWeight: "bold",
      textColor: HEADER_TEXT,
      backgroundColor: HEADER_FILL,
      align: "center",
      alignVertical: "center",
      wrap: true,
      borderColor: CELL_BORDER,
      borderStyle: "thin",
    })),
  )

  // 5. Các dòng dữ liệu.
  data.forEach((item, index) => {
    rows.push(columns.map((column) => buildDataCell(column, item, index)))
  })

  return rows
}

/** Tải Blob xuống trình duyệt và thu hồi object URL (tránh rò rỉ bộ nhớ). */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    // Trì hoãn thu hồi để Firefox kịp đọc xong blob.
    setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }
}

/* ============================================================
 * API công khai
 * ============================================================ */

/**
 * Tạo Blob .xlsx THẬT (OOXML/ZIP) trong bộ nhớ, KHÔNG kích hoạt tải xuống.
 *
 * Tách riêng khỏi `exportToExcel` để có thể kiểm thử định dạng file
 * (chữ ký ZIP `PK\x03\x04`, các entry `[Content_Types].xml`, `xl/workbook.xml`)
 * mà không cần tới DOM.
 */
export async function buildExcelBlob<T>(options: ExcelExportOptions<T>): Promise<Blob> {
  const { sheetName, columns } = options
  const sheetData = buildSheetData(options)

  // `toBlob()` của write-excel-file sinh gói ZIP (OOXML) thật trong bộ nhớ.
  return writeExcelFile(
    sheetData,
    {
      sheet: sanitizeSheetName(sheetName),
      columns: columns.map((column) => ({ width: toColumnWidth(column.width) })),
    },
    { fontFamily: "Calibri", fontSize: 11 },
  ).toBlob()
}

/**
 * Xuất dữ liệu ra file .xlsx THẬT (OOXML/ZIP) rồi tự động tải xuống.
 *
 * @returns Promise hoàn tất khi file đã được tạo và kích hoạt tải;
 *          ném lỗi nếu quá trình tạo file thất bại.
 */
export async function exportToExcel<T>(options: ExcelExportOptions<T>): Promise<void> {
  const blob = await buildExcelBlob(options)
  triggerDownload(blob, ensureXlsxExtension(options.filename))
}

/**
 * @deprecated Tên lịch sử: trước đây hàm này xuất SpreadsheetML 2003 (XML giả .xlsx).
 * Nay nó xuất .xlsx OOXML thật. Hãy dùng `exportToExcel` cho code mới.
 * Vẫn `async` nên call site phải `await`.
 */
export async function exportToExcelXml<T>(options: ExcelExportOptions<T>): Promise<void> {
  return exportToExcel(options)
}

/**
 * Xuất CSV kèm BOM UTF-8 để Excel đọc đúng tiếng Việt có dấu.
 * Giữ nguyên hành vi cũ (escape dấu nháy kép, phân tách CRLF).
 */
export function exportToCsv<T>(options: {
  filename: string
  columns: ExportColumn<T>[]
  data: T[]
}): void {
  const { filename, columns, data } = options

  const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",")

  const rows = data.map((item) =>
    columns
      .map((col) => {
        let val = (item as Record<string, unknown>)[col.key as string]
        if (col.formatter) {
          val = col.formatter(val, item)
        }
        if (val === null || val === undefined) val = ""
        const strVal = String(val).replace(/"/g, '""')
        return `"${strVal}"`
      })
      .join(","),
  )

  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`)
}
