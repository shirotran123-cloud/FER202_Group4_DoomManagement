/**
 * Rà soát lỗi "xuống hàng" trên toàn bộ giao diện — chạy: npm run check:nowrap
 *
 * Quy tắc sản phẩm: mọi dòng chữ trong web phải nằm gọn trên MỘT dòng. Chữ dài
 * thì cắt bằng dấu ba chấm, tuyệt đối không được ngắt xuống dòng thứ hai.
 *
 * Vì ràng buộc này được ép ở tầng CSS toàn cục (`src/index.css`) chứ không rải
 * `whitespace-nowrap` khắp nơi, script này kiểm tra đúng những thứ dễ phá vỡ nó:
 *
 *  1. `src/index.css` còn giữ luật nowrap + ellipsis, và luật đó đi kèm
 *     `overflow: hidden` + `text-overflow: ellipsis` (nowrap mà thiếu ellipsis
 *     còn tệ hơn: chữ tràn đè lên cột bên cạnh).
 *  2. Có lớp `.prose` để văn xuôi hợp lệ được miễn trừ, và có `@media print`
 *     để bản in không bị cắt cụt mất số liệu.
 *  3. Trong `src/`, không còn class nào chủ động cho phép nhiều dòng
 *     (`line-clamp-2` trở lên, `whitespace-normal` tuỳ tiện) ở chỗ không có
 *     `prose`.
 *  4. `<textarea>` và `<select>` vẫn được phép nhiều dòng.
 *
 * Không cần backend. Chạy độc lập.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SRC = path.join(ROOT, "src")
const CSS_FILE = path.join(SRC, "index.css")

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

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }
  return out
}

/**
 * Bỏ comment để không báo nhầm: nhiều file có nhắc `api.qrserver.com` trong
 * ghi chú giải thích "trước đây gọi dịch vụ ngoài", đó không phải code thật.
 */
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length))
}

/** Bỏ chuỗi để không bắt nhầm thông điệp hiển thị có chứa từ khoá. */
function stripStrings(code) {
  return code.replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, (m) => m.replace(/[^\n]/g, " "))
}

console.log("\n=== Rà soát quy tắc một dòng ===\n")

const css = fs.readFileSync(CSS_FILE, "utf8")

/* ---------- 1. Luật CSS toàn cục ---------- */
console.log("Luật CSS toàn cục (src/index.css)")

check("có luật `white-space: nowrap`", /white-space:\s*nowrap/.test(css))
check(
  "nowrap đi kèm `overflow: hidden`",
  /overflow:\s*hidden/.test(css),
  "thiếu overflow:hidden thì chữ dài sẽ tràn đè cột bên cạnh thay vì hiện dấu ba chấm",
)
check(
  "nowrap đi kèm `text-overflow: ellipsis`",
  /text-overflow:\s*ellipsis/.test(css),
  "thiếu ellipsis thì không thấy dấu ba chấm",
)

/** Các nhóm phần tử bắt buộc phải nằm trong luật nowrap. */
const REQUIRED_SELECTORS = [
  ["h1", /\bh1\b/],
  ["h2", /\bh2\b/],
  ["h3", /\bh3\b/],
  ["p", /\bp,|\bp\b/],
  ["td", /\btd\b/],
  ["th", /\bth\b/],
  ["label", /\blabel\b/],
  ["button", /\bbutton\b/],
  ["li", /\bli\b/],
  ["a", /\ba,|\ba\b/],
  ["span", /\bspan\b/],
]
for (const [name, re] of REQUIRED_SELECTORS) {
  check(`luật phủ <${name}>`, re.test(css), `không thấy ${name} trong luật nowrap`)
}

check("có lớp miễn trừ `.prose`", /\.prose/.test(css), "văn xuôi hợp lệ (marketing, luật, chat) sẽ bị cắt cụt")
check("có `.prose-pre` giữ xuống dòng chủ đích", /\.prose-pre/.test(css))
check("@media print mở lại nowrap để không mất số liệu khi in", /@media\s+print/.test(css))
check(
  "<textarea> được phép nhiều dòng",
  /textarea[\s\S]{0,200}white-space:\s*normal/.test(css),
  "textarea bị nowrap sẽ không gõ được nhiều dòng",
)
check(
  "<select> được phép nhiều dòng",
  /select[\s\S]{0,200}white-space:\s*normal/.test(css),
)

/* ---------- 2. Không còn chỗ nào chủ động cho nhiều dòng ---------- */
console.log("\nKhông còn class cho phép nhiều dòng ngoài vùng prose")

const files = walk(SRC)
const clampViolations = []
const normalViolations = []

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/")
  const text = fs.readFileSync(file, "utf8")

  // line-clamp-2 trở lên => nhiều dòng thật sự (line-clamp-1 vẫn là 1 dòng).
  for (const m of text.matchAll(/line-clamp-([2-9]|\d\d+)/g)) {
    const line = text.slice(0, m.index).split("\n").length
    clampViolations.push(`${rel}:${line} -> ${m[0]}`)
  }

  // whitespace-normal chỉ hợp lệ khi đi cùng prose.
  for (const m of text.matchAll(/whitespace-normal/g)) {
    const line = text.slice(0, m.index).split("\n").length
    const lineStart = text.lastIndexOf("\n", m.index) + 1
    const lineEnd = text.indexOf("\n", m.index)
    const context = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)
    if (!/prose/.test(context)) {
      normalViolations.push(`${rel}:${line}`)
    }
  }
}

check(
  "không còn `line-clamp-2` trở lên (cho phép 2 dòng)",
  clampViolations.length === 0,
  clampViolations.join("; "),
)
check(
  "`whitespace-normal` chỉ xuất hiện trong vùng `.prose`",
  normalViolations.length === 0,
  normalViolations.join("; "),
)

/* ---------- 3. Không còn ảnh QR từ dịch vụ ngoài ---------- */
console.log("\nKhông còn phụ thuộc dịch vụ ảnh QR bên ngoài")

const externalQr = []
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/")
  const code = stripComments(fs.readFileSync(file, "utf8"))
  if (/api\.qrserver\.com|chart\.googleapis\.com\/chart/.test(code)) {
    externalQr.push(rel)
  }
}
check(
  "mọi mã QR được sinh tại chỗ",
  externalQr.length === 0,
  `còn gọi dịch vụ ngoài: ${externalQr.join(", ")}`,
)

/* ---------- 4. Không còn alert() giả cho tải tệp ---------- */
console.log("\nKhông còn nút tải tệp giả bằng alert()")

const fakeDownloads = []
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/")
  const code = stripComments(fs.readFileSync(file, "utf8"))
  for (const m of code.matchAll(/alert\([^)]*\b(PDF|Excel|\.xlsx|\.pdf)\b/gi)) {
    const line = code.slice(0, m.index).split("\n").length
    fakeDownloads.push(`${rel}:${line}`)
  }
}
check(
  "không còn alert() báo tải tệp",
  fakeDownloads.length === 0,
  fakeDownloads.join("; "),
)

/* ---------- 5. Không còn chuỗi QR / MSSV hardcode cũ ---------- */
console.log("\nKhông còn dữ liệu QR hardcode")

const hardcodedQr = []
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/")
  const text = fs.readFileSync(file, "utf8")
  if (/GATE-A205-|GATE-8492-2026A/.test(text)) hardcodedQr.push(rel)
}
check(
  "QR cổng sinh từ buildGateQrPayload, không hardcode",
  hardcodedQr.length === 0,
  hardcodedQr.join(", "),
)

console.log(`\n=== ${passed} pass, ${failed} fail ===`)
if (failed > 0) {
  console.log("\nVi phạm quy tắc một dòng:")
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
