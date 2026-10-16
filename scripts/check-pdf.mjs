/**
 * Xác minh hóa đơn PDF là PDF thật, có nhúng font Unicode — chạy: npm run check:pdf
 *
 * Không thể xem PDF bằng mắt trong môi trường này, nên kiểm tra ở mức byte:
 *
 *  1. Tệp bắt đầu bằng `%PDF-` (đúng định dạng PDF, không phải HTML lỗi).
 *  2. Có `/FontFile2` — nghĩa là một TTF thật đã được nhúng vào tệp.
 *  3. Có `/ToUnicode` — bảng ánh xạ glyph sang ký tự Unicode. ĐÂY LÀ ĐIỀU KIỆN
 *     để chữ tiếng Việt (ơ ư đ ỹ ỵ ỗ ậ ệ) hiện đúng thay vì ô vuông.
 *  4. Không có hàm bóc dấu `.normalize("NFD")` trong chuỗi sinh PDF — nếu còn
 *     thì dấu tiếng Việt đã bị xoá trước khi vẽ.
 *
 * Script cần backend đang chạy để lấy font qua HTTP, vì jsPDF nạp font bằng
 * `fetch` (đúng như trong trình duyệt). Chạy: npm run server.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const FONT_DIR = path.join(ROOT, "public/assets/fonts")
const FONT_URL = process.env.FONT_URL || "http://127.0.0.1:5173/assets/fonts"

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

console.log("\n=== Xác minh PDF hóa đơn (font Unicode nhúng) ===\n")

/* ---------- 1. Font tĩnh có mặt và là TTF thật ---------- */
console.log("Font nhúng (public/assets/fonts)")

const requiredFonts = [
  ["roboto-400.ttf", 100_000],
  ["roboto-500.ttf", 100_000],
  ["roboto-700.ttf", 100_000],
]

for (const [name, minSize] of requiredFonts) {
  const p = path.join(FONT_DIR, name)
  if (!fs.existsSync(p)) {
    check(`${name} tồn tại`, false, "thiếu tệp — PDF sẽ không nhúng được font Unicode")
    continue
  }
  const buf = fs.readFileSync(p)
  // TTF hợp lệ bắt đầu bằng 0x00010000 (hoặc "true"/"OTTO" cho biến thể).
  const magic = buf.readUInt32BE(0)
  const isTtf = magic === 0x00010000 || buf.subarray(0, 4).toString("latin1") === "true"
  check(`${name} là TrueType thật`, isTtf, `magic=0x${magic.toString(16)}`)
  check(`${name} đủ lớn (>= ${minSize} bytes)`, buf.length >= minSize, `${buf.length} bytes`)
}

/* ---------- 2. Không còn bóc dấu tiếng Việt ---------- */
console.log("\nKhông còn bóc dấu tiếng Việt khi sinh PDF")

/** Bỏ comment để không báo nhầm: file có thể nhắc NFD khi giải thích lỗi cũ. */
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length))
}

for (const rel of ["src/lib/invoicePdf.ts", "src/lib/fontEmbed.ts"]) {
  const p = path.join(ROOT, rel)
  if (!fs.existsSync(p)) {
    check(`${rel} tồn tại`, false)
    continue
  }
  const code = stripComments(fs.readFileSync(p, "utf8"))
  check(`${rel} không gọi .normalize("NFD") trong code`, !/normalize\(\s*["']NFD["']/.test(code))
}

/* ---------- 3. Đường dẫn font khớp nơi phục vụ ---------- */
console.log("\nĐường dẫn font khớp cấu hình Vite")

const fontEmbedPath = path.join(ROOT, "src/lib/fontEmbed.ts")
if (fs.existsSync(fontEmbedPath)) {
  const src = fs.readFileSync(fontEmbedPath, "utf8")
  // Vite phục vụ thư mục `public/` tại gốc web, nên URL phải là /assets/fonts.
  const m = src.match(/DEFAULT_FONT_BASE_URL\s*=\s*["']([^"']+)["']/)
  check("DEFAULT_FONT_BASE_URL trỏ vào /assets/fonts", Boolean(m && m[1] === "/assets/fonts"), m ? m[1] : "không đọc được")
  check("có gọi doc.addFileToVFS (nhúng font vào PDF)", /addFileToVFS/.test(src))
  check("có gọi doc.addFont (đăng ký font)", /\.addFont\(/.test(src))
} else {
  check("src/lib/fontEmbed.ts tồn tại", false, "thiếu module nhúng font")
}

/* ---------- 4. Sinh thử một PDF thật rồi soi byte ---------- */
console.log("\nSinh thử PDF và kiểm tra byte")

/** Tìm chuỗi ASCII trong buffer nhị phân. */
function containsAscii(buf, needle) {
  return buf.includes(Buffer.from(needle, "latin1"))
}

async function buildPdf() {
  /**
   * `fontEmbed.ts` gọi `fetch("/assets/fonts/...")` — đúng trong trình duyệt
   * (Vite phục vụ `public/` tại gốc web). Khi chạy ở Node, chặn `fetch` và trả
   * thẳng nội dung file trong `public/` để không phụ thuộc dev server.
   */
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url
    if (url.startsWith("/assets/fonts/")) {
      const file = path.join(ROOT, "public", url.replace(/^\//, ""))
      if (!fs.existsSync(file)) {
        return new Response("not found", { status: 404 })
      }
      const buf = fs.readFileSync(file)
      // Trả ArrayBuffer đúng như Response thật để `response.arrayBuffer()` chạy.
      return new Response(buf, {
        status: 200,
        headers: { "Content-Type": "font/ttf", "Content-Length": String(buf.length) },
      })
    }
    return originalFetch(input, init)
  }
  try {
    const { buildInvoicePdfDoc } = await importTsModule("src/lib/invoicePdf.ts")
    const doc = await buildInvoicePdfDoc({
      invoiceCode: "INV-2026-09-A205",
      billingMonth: "2026-09",
      dueDate: "2026-10-05",
      student: {
        fullName: "Nguyễn Hoàng Vinh",
        mssv: "QE200001",
        room: "A205",
        bedCode: "A205-B1-G03",
        phone: "0912 345 678",
        building: "Tòa A",
      },
      meter: { elecOld: 12450, elecNew: 12620, waterOld: 840, waterNew: 854 },
      tariff: { roomFeePerStudent: 950000, wifiFeeTotal: 120000, cleaningFeeTotal: 60000, numStudents: 6 },
    })
    return Buffer.from(doc.output("arraybuffer"))
  } finally {
    globalThis.fetch = originalFetch
  }
}

/**
 * Biên dịch và nạp module TS của `src/` bằng chính Vite (đã có trong dự án),
 * nên không cần cài thêm esbuild hay công cụ build nào khác.
 */
async function importTsModule(relPath) {
  const { createServer } = await import("vite")
  const server = await createServer({
    root: ROOT,
    logLevel: "silent",
    server: { middlewareMode: true },
    appType: "custom",
  })
  try {
    return await server.ssrLoadModule(`/${relPath}`)
  } finally {
    await server.close()
  }
}

try {
  const pdf = await buildPdf()
  check("tệp sinh ra bắt đầu bằng %PDF-", pdf.subarray(0, 5).toString("latin1") === "%PDF-", pdf.subarray(0, 8).toString("latin1"))
  check("tệp có kích thước hợp lý (> 50KB, do font nhúng)", pdf.length > 50_000, `${pdf.length} bytes`)
  check("có /FontFile2 (TTF đã nhúng thật)", containsAscii(pdf, "/FontFile2"))
  check(
    "có /ToUnicode (bảng ánh xạ Unicode cho tiếng Việt)",
    containsAscii(pdf, "/ToUnicode"),
    "thiếu bảng này thì chữ có dấu sẽ hiện sai",
  )
  check("có /Type /Font", containsAscii(pdf, "/Type /Font") || containsAscii(pdf, "/Type/Font"))
  // Chữ tiếng Việt đi qua bảng mã Unicode nên không xuất hiện dạng ASCII thô;
  // thay vào đó khẳng định KHÔNG có dấu hiệu bị bóc dấu ở tầng nội dung.
  check(
    "không có chuỗi đã bị bóc dấu 'Nguyen Hoang Vinh'",
    !containsAscii(pdf, "Nguyen Hoang Vinh"),
    "nếu thấy nghĩa là dấu tiếng Việt đã bị xoá trước khi vẽ",
  )
} catch (err) {
  check("sinh được PDF để kiểm tra", false, err.message)
  console.log(
    "\n\x1b[33mLưu ý\x1b[0m: bước này cần dev server đang chạy để phục vụ font (/assets/fonts).\n" +
      "Chạy: npm run dev -- --port 5173",
  )
}

console.log(`\n=== ${passed} pass, ${failed} fail ===`)
if (failed > 0) {
  console.log("\nLỗi PDF/font:")
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
