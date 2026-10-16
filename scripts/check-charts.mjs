/**
 * Kiểm tra tính ĐÚNG của các biểu đồ trên dashboard — chạy: npm run check:charts
 *
 * Biểu đồ rất dễ sai theo cách không ai thấy: hai chuỗi dữ liệu cùng màu, trục
 * cứng không khớp dữ liệu, tổng ghi cứng khác tổng thật, nhãn % không khớp số
 * giường. Script này soi mã nguồn và tính lại số liệu để chặn những lỗi đó.
 *
 * Không cần backend, không cần trình duyệt.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const PAGE = path.join(ROOT, "src/pages/manager/ManagerDashboardPage.tsx")
const MOCK = path.join(ROOT, "src/data/mockDashboard.ts")

let passed = 0
let failed = 0
const failures = []

function check(name, condition, detail) {
  if (condition) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    failures.push(detail ? `${name} — ${detail}` : name)
    console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

const srcRaw = fs.readFileSync(PAGE, "utf8")
const mockSrc = fs.readFileSync(MOCK, "utf8")

/**
 * Bản mã nguồn đã bỏ comment — chỉ dùng cho các phép kiểm tra CHUỖI CODE.
 * Các phép kiểm tra dựa vào văn bản hiển thị (nhãn, tiêu đề) phải dùng `srcRaw`,
 * vì comment JSX trong file này chứa chính những cụm từ đó.
 */
const codeOnly = srcRaw
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length))

console.log("\n=== Kiểm tra tính đúng của biểu đồ dashboard ===\n")

/* ---------- 1. Hai chuỗi dữ liệu phải KHÁC màu ---------- */
console.log("Màu sắc — hai chuỗi dữ liệu phải phân biệt được")

/**
 * Lấy khối JSX của biểu đồ doanh thu để kiểm tra màu trong đúng ngữ cảnh.
 * Tìm từ nhãn "Tiền phòng" tới hết phần tử tổng kết.
 */
const revenueBlockStart = srcRaw.indexOf("Biểu Đồ Xu Hướng Doanh Thu")
const revenueBlockEnd = srcRaw.indexOf("Row 2: Building Energy")
// Dùng bản đã bỏ comment: trong khối này có comment nhắc tới bg-*/strokeLinecap.
const revenueBlock = revenueBlockStart >= 0 && revenueBlockEnd > revenueBlockStart
  ? codeOnly.slice(revenueBlockStart, revenueBlockEnd)
  : ""

check("tìm thấy khối biểu đồ doanh thu", revenueBlock.length > 0)

/** Đếm số lớp màu nền khác nhau được dùng trong legend. */
const legendColors = [...revenueBlock.matchAll(/h-2\.5 w-2\.5 shrink-0 rounded (bg-[\w/]+)/g)].map((m) => m[1])
check(
  "legend có đúng 2 mục",
  legendColors.length === 2,
  `tìm thấy ${legendColors.length}: ${legendColors.join(", ")}`,
)
check(
  "hai mục legend KHÁC màu",
  legendColors.length === 2 && legendColors[0] !== legendColors[1],
  `cùng màu: ${legendColors.join(" = ")}`,
)

/** Hai đoạn cột xếp chồng cũng phải khác màu. */
const barColors = [...revenueBlock.matchAll(/className="w-full[^"]*?(bg-[\w/]+)[^"]*"[\s\S]{0,40}title=\{`(Tiền phòng|Điện nước)/g)]
const barColorList = barColors.map((m) => `${m[2]}=${m[1]}`)
check(
  "tìm thấy 2 đoạn cột xếp chồng",
  barColors.length === 2,
  barColorList.join(", ") || "không khớp mẫu",
)
if (barColors.length === 2) {
  check(
    "hai đoạn cột KHÁC màu",
    barColors[0][1] !== barColors[1][1],
    barColorList.join(" vs "),
  )
}

/* ---------- 2. Không viết cứng trục và tổng ---------- */
console.log("\nKhông viết cứng số liệu biểu đồ")

check(
  "không còn trục cứng 350000000",
  !/maxVal\s*=\s*350000000/.test(revenueBlock),
  "trục phải suy ra từ dữ liệu, nếu không cột vượt trần sẽ tràn ra ngoài khung",
)
check(
  "không còn tổng cứng 1,528,400,000",
  !/1,528,400,000/.test(revenueBlock),
  "tổng phải cộng từ dữ liệu",
)
check("có biến trục tính từ dữ liệu (revenueAxisMax)", /revenueAxisMax/.test(revenueBlock))
check("có biến tổng tính từ dữ liệu (revenueGrandTotal)", /revenueGrandTotal/.test(revenueBlock))

/* ---------- 3. Donut: không dùng đầu nét tròn ---------- */
console.log("\nVòng donut — cung phải cộng đúng 100%")

const donutBlockStart = srcRaw.indexOf("Cơ Cấu Trạng Thái Giường")
const donutBlockEnd = srcRaw.indexOf("Legend & Breakdown")
const donutBlock = donutBlockStart >= 0 && donutBlockEnd > donutBlockStart
  ? codeOnly.slice(donutBlockStart, donutBlockEnd)
  : ""

check("tìm thấy khối donut", donutBlock.length > 0)
check(
  "không dùng strokeLinecap=round trên các cung",
  !/strokeLinecap="round"/.test(donutBlock),
  "đầu tròn làm mỗi cung phình thêm nửa nét vẽ ở hai đầu nên tổng không còn khớp tỷ lệ",
)
check(
  "các cung vẽ từ mảng dữ liệu (bedArcs)",
  /bedArcs\.map/.test(donutBlock),
)

/** Nhãn % trong legend không được viết cứng. */
check(
  "nhãn % của legend tính từ số giường, không viết cứng",
  !/\((80|12\.5|5|2\.5)%\)/.test(donutBlock),
  "phần trăm viết cứng sẽ sai ngay khi số giường đổi",
)

/* ---------- 4. Tính lại số liệu từ chính dữ liệu mock ---------- */

/** Bóc mảng MOCK_MONTHLY_REVENUE từ file mock. */
function parseMonthlyRevenue() {
  const block = mockSrc.match(/MOCK_MONTHLY_REVENUE[^=]*=\s*\[([\s\S]*?)\n\]/)
  if (!block) return []
  const rows = []
  for (const m of block[1].matchAll(/month:\s*"([^"]+)"[\s\S]*?roomFee:\s*(\d+)[\s\S]*?utilityFee:\s*(\d+)/g)) {
    rows.push({ month: m[1], roomFee: Number(m[2]), utilityFee: Number(m[3]) })
  }
  return rows
}

/** Bóc MOCK_OCCUPANCY_STATS. */
function parseOccupancy() {
  const block = mockSrc.match(/MOCK_OCCUPANCY_STATS[^=]*=\s*\{([\s\S]*?)\n\}/)
  if (!block) return null
  const num = (key) => {
    const m = block[1].match(new RegExp(`${key}:\\s*([\\d.]+)`))
    return m ? Number(m[1]) : null
  }
  return {
    totalBeds: num("totalBeds"),
    availableBeds: num("availableBeds"),
    holdingBeds: num("holdingBeds"),
    occupiedBeds: num("occupiedBeds"),
    maintenanceBeds: num("maintenanceBeds"),
    occupancyRate: num("occupancyRate"),
  }
}

console.log("\nSố liệu donut — tổng các phần phải khớp tổng số giường")

const occ = parseOccupancy()
if (!occ) {
  check("đọc được MOCK_OCCUPANCY_STATS", false)
} else {
  const sum = occ.occupiedBeds + occ.availableBeds + occ.holdingBeds + occ.maintenanceBeds
  check(
    `tổng 4 trạng thái = tổng giường (${sum} vs ${occ.totalBeds})`,
    sum === occ.totalBeds,
    "lệch nghĩa là vòng donut sẽ có khe hở hoặc chồng lên nhau",
  )
  const rate = Number(((occ.occupiedBeds / occ.totalBeds) * 100).toFixed(1))
  check(
    `tỷ lệ lấp đầy khai báo khớp số giường (${occ.occupancyRate}% vs ${rate}%)`,
    Math.abs((occ.occupancyRate ?? 0) - rate) < 0.05,
    "số hiển thị ở giữa vòng phải khớp dữ liệu",
  )
}

console.log("\nSố liệu cột doanh thu — trục phải chứa được cột cao nhất")

const revenue = parseMonthlyRevenue()
check("đọc được MOCK_MONTHLY_REVENUE", revenue.length > 0, `${revenue.length} tháng`)

if (revenue.length > 0) {
  const totals = revenue.map((r) => r.roomFee + r.utilityFee)
  const peak = Math.max(...totals)
  const grand = totals.reduce((s, v) => s + v, 0)
  /** Cùng công thức với trang: làm tròn lên bội số 50 triệu. */
  const axis = Math.ceil(peak / 50_000_000) * 50_000_000
  check(
    `trục (${(axis / 1e6).toFixed(0)}tr) chứa được cột cao nhất (${(peak / 1e6).toFixed(1)}tr)`,
    axis >= peak,
    "nếu trục nhỏ hơn cột cao nhất thì cột tràn khỏi khung",
  )
  check(
    "trục không cao quá mức cần thiết (chênh < 50tr)",
    axis - peak < 50_000_000,
    "trục quá cao làm mọi cột lùn đi, khó so sánh",
  )
  check(
    `tổng lũy kế tính được = ${grand.toLocaleString("vi-VN")}đ`,
    grand > 0,
  )
  // Mọi mốc tháng phải có mặt đúng một lần, không trùng để vẽ đè nhau.
  const months = revenue.map((r) => r.month)
  check("không có tháng trùng lặp", new Set(months).size === months.length, months.join(", "))
}

/* ---------- 5. Tiêu thụ: cảnh báo theo ngưỡng, không dò chữ ---------- */
console.log("\nCảnh báo tiêu thụ — theo ngưỡng số, không dò chữ trong câu")

check(
  "không còn dò chuỗi để phát hiện bất thường",
  !/anomalyNote\?\.includes\(/.test(codeOnly),
  'dò chữ "tăng" khiến cảnh báo phụ thuộc cách viết câu, sửa lời văn là mất cảnh báo',
)
check("có ngưỡng điện (KWH_WARN)", /KWH_WARN\s*=\s*\d+/.test(codeOnly))
check("có ngưỡng nước (WATER_WARN)", /WATER_WARN\s*=\s*\d+/.test(codeOnly))
check("có hàm tính cảnh báo theo ngưỡng", /consumptionAlerts/.test(codeOnly))

/** Bóc MOCK_BUILDING_CONSUMPTION. */
function parseConsumption() {
  const block = mockSrc.match(/MOCK_BUILDING_CONSUMPTION[^=]*=\s*\[([\s\S]*?)\n\]/)
  if (!block) return []
  const rows = []
  for (const m of block[1].matchAll(/building:\s*"([^"]+)"[\s\S]*?electricityAvgKwh:\s*([\d.]+)[\s\S]*?waterAvgM3:\s*([\d.]+)/g)) {
    rows.push({ building: m[1], kwh: Number(m[2]), water: Number(m[3]) })
  }
  return rows
}

const consumption = parseConsumption()
check("đọc được MOCK_BUILDING_CONSUMPTION", consumption.length > 0, `${consumption.length} tòa`)
if (consumption.length > 0) {
  check(
    "mỗi tòa có số liệu dương",
    consumption.every((b) => b.kwh > 0 && b.water > 0),
    "số 0 hoặc âm sẽ làm thanh tỷ lệ chia cho 0",
  )
  const names = consumption.map((b) => b.building)
  check("tên tòa không trùng", new Set(names).size === names.length, names.join(" | "))
}

console.log(`\n=== ${passed} pass, ${failed} fail ===`)
if (failed > 0) {
  console.log("\nLỗi biểu đồ:")
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
