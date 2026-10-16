/**
 * Rà soát chuỗi tĩnh quá dài — chạy: npm run check:text-length
 *
 * Luật sản phẩm: không dòng chữ nào được xuống hàng. CSS toàn cục đã ép điều đó
 * (nowrap + ellipsis), nhưng nếu một chuỗi TĨNH quá dài thì nó sẽ bị cắt bằng
 * dấu ba chấm và trông như lỗi. Script này tìm những chuỗi như vậy để rút ngắn.
 *
 * Chỉ xét chuỗi tĩnh (hard-code, không nội suy `{...}`) nằm trong:
 *  - text node JSX:            >Chữ ở đây<
 *  - thuộc tính hiển thị:      desc="...", title="...", placeholder="...", label="..."
 *
 * Bỏ qua: file có `prose` (văn xuôi nhiều dòng hợp lệ), textarea, và các thuộc
 * tính không hiển thị trực tiếp (aria-label được phép dài vì trình đọc màn hình
 * đọc nó, không vẽ ra màn hình).
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SRC = path.join(ROOT, "src")
/** Ngưỡng ký tự: dưới mức này một dòng vẫn thoải mái trong hầu hết cột. */
const MAX_LENGTH = Number(process.env.MAX_TEXT_LENGTH ?? 62)

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }
  return out
}

const ATTRIBUTES = ["desc", "title", "placeholder", "label", "hint", "note", "caption", "subtitle"]

const findings = []

for (const file of walk(SRC)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/")
  const src = fs.readFileSync(file, "utf8")
  const lines = src.split("\n")

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    // Comment không phải chữ hiển thị.
    if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) return
    // Dòng mang `prose` là văn xuôi nhiều dòng hợp lệ.
    if (/\bprose\b/.test(line)) return

    // Text node JSX: nằm giữa > và <.
    for (const m of line.matchAll(/>([^<>{}]{20,})</g)) {
      const text = m[1].trim()
      if (text.length > MAX_LENGTH && /[a-zA-Zà-ỹÀ-Ỹ]/.test(text)) {
        findings.push({ rel, line: idx + 1, length: text.length, text, kind: "text node" })
      }
    }

    // Thuộc tính hiển thị.
    for (const attr of ATTRIBUTES) {
      const re = new RegExp(`${attr}="([^"]{20,})"`, "g")
      for (const m of line.matchAll(re)) {
        const text = m[1]
        if (text.length > MAX_LENGTH && /[a-zA-Zà-ỹÀ-Ỹ]/.test(text) && !text.includes("{")) {
          findings.push({ rel, line: idx + 1, length: text.length, text, kind: `${attr}=""` })
        }
      }
    }
  })
}

console.log(`\n=== Rà soát chuỗi tĩnh dài (ngưỡng ${MAX_LENGTH} ký tự) ===\n`)

if (findings.length === 0) {
  console.log(`\x1b[32m✓\x1b[0m Không có chuỗi tĩnh nào vượt ${MAX_LENGTH} ký tự ngoài vùng prose.\n`)
  process.exit(0)
}

console.log(`\x1b[31m✗\x1b[0m ${findings.length} chuỗi cần rút ngắn:\n`)
for (const f of findings) {
  console.log(`  ${f.rel}:${f.line} [${f.length}] (${f.kind})`)
  console.log(`      ${f.text.slice(0, 140)}`)
}
console.log()
process.exit(1)
