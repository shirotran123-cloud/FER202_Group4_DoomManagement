/**
 * Rà soát mức độ còn phụ thuộc dữ liệu mẫu — chạy: npm run check:mock
 *
 * Mục tiêu của dự án là giao diện đọc dữ liệu THẬT từ backend. Script này đo
 * xem còn bao nhiêu chỗ vẫn dùng `src/data/mock*.ts`, để biết còn phải làm gì
 * thay vì đoán.
 *
 * Cách đọc kết quả:
 *  - `ĐÃ NỐI API`  : file vừa import mock vừa gọi `@/lib/api` -> còn dư mock dự phòng
 *  - `CHỈ MOCK`     : file chỉ dùng mock, chưa hề gọi backend
 *  - `KHÔNG DÙNG`   : file mock không ai import
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SRC = path.join(ROOT, "src")
const DATA = path.join(SRC, "data")

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }
  return out
}

const files = walk(SRC)
/** mockFile -> [{ file, names }] */
const usage = new Map()
/** file -> có gọi API không */
const usesApi = new Map()

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/")
  const src = fs.readFileSync(file, "utf8")
  usesApi.set(rel, /from\s+["']@\/lib\/api["']/.test(src))

  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']@\/data\/([\w-]+)["']/g)) {
    const names = m[1]
      .split(",")
      .map((s) => s.trim().replace(/^type\s+/, ""))
      .filter(Boolean)
    const mockFile = `${m[2]}.ts`
    if (!usage.has(mockFile)) usage.set(mockFile, [])
    usage.get(mockFile).push({ file: rel, names })
  }
}

const mockFiles = fs.readdirSync(DATA).filter((f) => f.endsWith(".ts"))

let onlyMock = 0
let withApi = 0
let unused = 0

console.log("\n=== Mức độ còn dùng dữ liệu mẫu ===\n")

for (const mockFile of mockFiles.sort()) {
  const users = usage.get(mockFile) ?? []
  const allFiles = files.map((f) => path.relative(ROOT, f).replace(/\\/g, "/"))
  // File mock có thể bị import từ ngoài src/data (chính nó không tính).
  const selfRel = `src/data/${mockFile}`
  const realUsers = users.filter((u) => u.file !== selfRel)

  console.log(`\x1b[1m${selfRel}\x1b[0m`)
  if (realUsers.length === 0) {
    unused++
    console.log("  → KHÔNG DÙNG (không file nào import)\n")
    continue
  }
  for (const u of realUsers.sort((a, b) => a.file.localeCompare(b.file))) {
    const hasApi = usesApi.get(u.file) === true
    const tag = hasApi ? "\x1b[33mĐÃ NỐI API\x1b[0m" : "\x1b[31mCHỈ MOCK\x1b[0m"
    if (hasApi) withApi++
    else onlyMock++
    console.log(`  ${tag}  ${u.file}`)
    console.log(`              dùng: ${u.names.join(", ")}`)
  }
  console.log()
  void allFiles
}

console.log(`\nTổng: ${mockFiles.length} file mock | ${withApi} chỗ đã nối API | ${onlyMock} chỗ CHỈ dùng mock | ${unused} file không dùng\n`)

// Không đánh fail: đây là script ĐO, không phải script chặn. Muốn chặn thì đổi
// biến môi trường MOCK_STRICT=1.
if (process.env.MOCK_STRICT === "1" && (onlyMock > 0 || unused > 0)) {
  console.log("MOCK_STRICT=1: vẫn còn phụ thuộc dữ liệu mẫu.\n")
  process.exit(1)
}
