/**
 * Sinh tệp báo cáo thật (.xlsx / .csv) từ các dòng báo cáo đã dựng sẵn.
 *
 * - `.xlsx` là OOXML thật (zip) do `write-excel-file/node` ghi: header in đậm,
 *   nền indigo #4F46E5 chữ trắng, kẻ khung, độ rộng cột hợp lý, và ô số thật
 *   cho cột tiền/số lượng (dùng chuỗi định dạng, KHÔNG nhồi chuỗi đã format).
 * - `.csv` là UTF-8 kèm BOM để Excel đọc đúng tiếng Việt.
 *
 * Mọi hàm thuần (trừ việc gọi thư viện ghi zip) để test độc lập.
 */
import writeXlsxFile from "write-excel-file/node"

/** Nền header theo bảng màu indigo của UI. */
export const HEADER_BG = "#4F46E5"
export const HEADER_FG = "#FFFFFF"
export const BORDER_COLOR = "#CBD5E1"

export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
export const CSV_CONTENT_TYPE = "text/csv; charset=utf-8"

/** Mô tả cột của một báo cáo. `kind`: "text" | "number" | "money" | "integer" */
const RESIDENT_COLUMNS = [
  { key: "stt", header: "STT", width: 6, kind: "integer" },
  { key: "contractCode", header: "Mã hợp đồng", width: 18, kind: "text" },
  { key: "fullName", header: "Họ và tên", width: 26, kind: "text" },
  { key: "studentId", header: "MSSV", width: 14, kind: "text" },
  { key: "gender", header: "Giới tính", width: 10, kind: "text" },
  { key: "citizenId", header: "CCCD", width: 16, kind: "text" },
  { key: "dob", header: "Ngày sinh", width: 13, kind: "text" },
  { key: "hometown", header: "Quê quán", width: 28, kind: "text" },
  { key: "phone", header: "Điện thoại", width: 15, kind: "text" },
  { key: "building", header: "Tòa", width: 10, kind: "text" },
  { key: "room", header: "Phòng", width: 10, kind: "text" },
  { key: "compartment", header: "Buồng", width: 10, kind: "text" },
  { key: "bedCode", header: "Mã giường", width: 16, kind: "text" },
  { key: "startDate", header: "Từ ngày", width: 13, kind: "text" },
  { key: "endDate", header: "Đến ngày", width: 13, kind: "text" },
  { key: "parentName", header: "Người liên hệ", width: 22, kind: "text" },
  { key: "parentPhone", header: "SĐT liên hệ", width: 15, kind: "text" },
]

const DEBT_COLUMNS = [
  { key: "stt", header: "STT", width: 6, kind: "integer" },
  { key: "invoiceCode", header: "Mã hóa đơn", width: 20, kind: "text" },
  { key: "studentId", header: "MSSV", width: 14, kind: "text" },
  { key: "fullName", header: "Họ và tên", width: 26, kind: "text" },
  { key: "room", header: "Phòng", width: 10, kind: "text" },
  { key: "bedCode", header: "Mã giường", width: 16, kind: "text" },
  { key: "billingPeriod", header: "Kỳ hóa đơn", width: 16, kind: "text" },
  { key: "roomDebt", header: "Nợ tiền phòng", width: 16, kind: "money" },
  { key: "utilityDebt", header: "Nợ điện nước", width: 16, kind: "money" },
  { key: "totalDebt", header: "Tổng nợ", width: 16, kind: "money" },
  { key: "dueDate", header: "Hạn thanh toán", width: 16, kind: "text" },
  { key: "overdueDays", header: "Số ngày quá hạn", width: 16, kind: "integer" },
  { key: "status", header: "Trạng thái", width: 22, kind: "text" },
  { key: "phone", header: "Điện thoại", width: 15, kind: "text" },
]

/** Nhãn báo cáo tiếng Việt theo `kind`. */
export const REPORT_TITLES = {
  residents: "Danh sách sinh viên tạm trú",
  debts: "Báo cáo công nợ quá hạn",
}

/** Cột của một loại báo cáo; ném lỗi nếu kind lạ. */
export function columnsFor(kind) {
  if (kind === "residents") return RESIDENT_COLUMNS
  if (kind === "debts") return DEBT_COLUMNS
  throw new Error(`Loại báo cáo không hợp lệ: ${kind}`)
}

/** Chuỗi định dạng số của Excel theo loại cột. */
export function numberFormatFor(kind) {
  return kind === "money" ? "#,##0" : "#,##0"
}

/** Cột nào được ghi dưới dạng ô SỐ thật (thay vì chuỗi đã format). */
export function isNumericColumn(kind) {
  return kind === "money" || kind === "number" || kind === "integer"
}

const EMPTY_NUMERIC = "—"

/**
 * Chuẩn hoá một ô số: giá trị hữu hạn -> Number, còn lại -> null (ô trống).
 * Không bao giờ trả chuỗi đã format cho cột số.
 */
export function numericCell(value) {
  if (value === "" || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Chuỗi hiển thị cho cột chữ; `—` khi rỗng để bảng không bị trống. */
export function textCell(value) {
  if (value === null || value === undefined) return ""
  return String(value)
}

/** Giá trị thô của một cột trên một dòng, theo kiểu cột. */
export function cellValue(row, column) {
  const raw = row?.[column.key]
  return isNumericColumn(column.kind) ? numericCell(raw) : textCell(raw)
}

/** Tên tệp đề xuất cho một báo cáo. */
export function reportFilename(kind, format, now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-")
  const ext = format === "csv" ? "csv" : "xlsx"
  return `bao-cao-${kind}-${stamp}.${ext}`
}

/* ---------- Dựng bảng dữ liệu Excel ---------- */

const HEADER_STYLE = {
  fontWeight: "bold",
  textColor: HEADER_FG,
  backgroundColor: HEADER_BG,
  alignVertical: "center",
  wrap: true,
  borderStyle: "thin",
  borderColor: BORDER_COLOR,
}

const BODY_STYLE = {
  borderStyle: "thin",
  borderColor: BORDER_COLOR,
  alignVertical: "center",
}

/**
 * Dựng mảng dòng của sheet: dòng 1 là header in đậm nền indigo, các dòng sau
 * là dữ liệu với ô số thật (type Number + format) cho cột tiền/số lượng.
 *
 * @param {object[]} rows Dòng báo cáo (shape y như endpoint JSON).
 * @param {object[]} columns Mô tả cột.
 * @returns {Array<Array<object>>} SheetData của write-excel-file.
 */
export function buildSheetData(rows, columns) {
  const header = columns.map((c) => ({
    value: c.header,
    type: String,
    ...HEADER_STYLE,
  }))

  const body = rows.map((row) =>
    columns.map((c) => {
      const value = cellValue(row, c)
      if (value === null) {
        return { value: EMPTY_NUMERIC, type: String, align: "right", ...BODY_STYLE }
      }
      if (isNumericColumn(c.kind)) {
        return {
          value,
          type: Number,
          format: numberFormatFor(c.kind),
          align: "right",
          ...BODY_STYLE,
        }
      }
      return { value, type: String, ...BODY_STYLE }
    }),
  )

  return [header, ...body]
}

/** Cấu hình độ rộng cột cho sheet. */
export function sheetColumns(columns) {
  return columns.map((c) => ({ width: c.width }))
}

/* ---------- Ghi tệp ---------- */

/**
 * Sinh tệp `.xlsx` thật (OOXML/zip).
 * @param {object[]} rows Dòng báo cáo.
 * @param {string} kind `residents` | `debts`.
 * @param {Date} [now] Mốc thời gian dùng cho tên tệp.
 * @returns {Promise<{ filename: string, contentType: string, buffer: Buffer }>}
 */
export async function buildXlsxArtifact(rows, kind, now = new Date()) {
  const columns = columnsFor(kind)
  const buffer = await writeXlsxFile(buildSheetData(rows, columns), {
    sheet: REPORT_TITLES[kind] || kind,
    columns: sheetColumns(columns),
    stickyRowsCount: 1,
  }).toBuffer()
  return {
    filename: reportFilename(kind, "xlsx", now),
    contentType: XLSX_CONTENT_TYPE,
    buffer,
  }
}

/** Bọc một ô CSV: luôn trích dẫn, nhân đôi dấu ngoặc kép. */
function csvField(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

/**
 * Sinh nội dung CSV (chưa kèm BOM) từ cùng cột/dòng với bản .xlsx.
 * Cột số xuất dạng số trần để Excel hiểu là số; ô rỗng thành chuỗi rỗng.
 */
export function buildCsv(rows, columns) {
  const header = columns.map((c) => csvField(c.header)).join(",")
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const value = cellValue(row, c)
        return value === null ? "" : csvField(value)
      })
      .join(","),
  )
  return [header, ...body].join("\r\n")
}

/**
 * Sinh tệp `.csv` UTF-8 kèm BOM (Excel đọc đúng tiếng Việt).
 * @returns {{ filename: string, contentType: string, buffer: Buffer }}
 */
export function buildCsvArtifact(rows, kind, now = new Date()) {
  const csv = buildCsv(rows, columnsFor(kind))
  return {
    filename: reportFilename(kind, "csv", now),
    contentType: CSV_CONTENT_TYPE,
    buffer: Buffer.concat([Buffer.from("\uFEFF", "utf8"), Buffer.from(csv, "utf8")]),
  }
}

/**
 * Chọn định dạng và sinh artifact tương ứng.
 * @param {object[]} rows Dòng báo cáo.
 * @param {"residents"|"debts"} kind Loại báo cáo.
 * @param {"xlsx"|"csv"} format Định dạng tệp.
 * @param {Date} [now] Mốc thời gian.
 */
export async function buildReportArtifact(rows, kind, format = "xlsx", now = new Date()) {
  if (format === "csv") return buildCsvArtifact(rows, kind, now)
  return buildXlsxArtifact(rows, kind, now)
}
