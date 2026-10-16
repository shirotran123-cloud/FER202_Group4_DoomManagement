/**
 * Rà soát sức khỏe frontend — chạy: npm run check:frontend
 *
 * Tập trung vào thứ tsc không kiểm tra được:
 *  - Import icon từ lucide-react nhưng tên không tồn tại trong thư viện.
 *  - Còn thư viện icon cũ (phosphor).
 *  - Còn mã MSSV cũ (QE202xxx / SE1xxxxx).
 *  - Ký tự icon dán tay (✕ ✓) thay vì icon thư viện.
 *  - Import trỏ tới file không tồn tại (alias @/...).
 *
 * Lỗi thiếu import JSX đã do `tsc --noEmit` chặn, không lặp lại ở đây.
 */
import fs from "node:fs"
import path from "node:path"
import * as lucide from "lucide-react"

const ROOT = process.cwd()
const SRC = path.join(ROOT, "src")

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }
  return out
}

const files = walk(SRC)
const problems = []

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/")
  const raw = fs.readFileSync(file, "utf8")

  /* --- Icon lucide không tồn tại --- */
  for (const m of raw.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/g)) {
    for (const spec of m[1].split(",")) {
      const clean = spec.trim().replace(/^type\s+/, "")
      if (!clean) continue
      const name = clean.split(/\s+as\s+/)[0].trim()
      if (name && !(name in lucide)) {
        problems.push(`${rel}: lucide-react không có icon "${name}"`)
      }
    }
  }

  /* --- Thư viện icon cũ --- */
  if (/@phosphor-icons/.test(raw)) problems.push(`${rel}: còn dùng @phosphor-icons`)

  /* --- MSSV cũ --- */
  for (const m of raw.matchAll(/\b(QE202\d{3}|SE1\d{5})\b/g)) {
    problems.push(`${rel}: còn MSSV cũ ${m[1]}`)
  }

  /* --- Ký tự icon dán tay --- */
  for (const ch of ["✕", "✓", "✔"]) {
    if (raw.includes(ch)) problems.push(`${rel}: dùng ký tự "${ch}" thay vì icon thư viện`)
  }

  /* --- Import alias @/ trỏ sai file --- */
  for (const m of raw.matchAll(/from\s*["']@\/([^"']+)["']/g)) {
    const spec = m[1]
    const base = path.join(SRC, spec)
    const candidates = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
    ]
    if (!candidates.some((c) => fs.existsSync(c))) {
      problems.push(`${rel}: import @/${spec} không tồn tại`)
    }
  }
}

const unique = [...new Set(problems)]

if (unique.length === 0) {
  console.log(`\n\x1b[32m✓\x1b[0m Frontend sạch: ${files.length} file, icon/import/MSSV đều hợp lệ.\n`)
  process.exit(0)
}

console.log(`\n\x1b[31m✗\x1b[0m Phát hiện ${unique.length} vấn đề:\n`)
for (const p of unique) console.log(`  - ${p}`)
console.log()
process.exit(1)
