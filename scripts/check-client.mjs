/**
 * Đối chiếu API client frontend ↔ route backend — chạy: npm run check:client
 *
 * Đọc mọi lời gọi `request("...")` trong src/lib/api.ts rồi xác nhận từng đường
 * dẫn tồn tại trong server/routes hoặc server/index.js. Bắt lỗi gõ sai endpoint
 * trước khi UI gọi và nhận 404.
 *
 * Không cần backend chạy.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const CLIENT = path.join(ROOT, "src/lib/api.ts")
const ROUTES_DIR = path.join(ROOT, "server/routes")
const INDEX = path.join(ROOT, "server/index.js")

const clientSrc = fs.readFileSync(CLIENT, "utf8")

/** Gom toàn bộ định nghĩa route backend thành danh sách method + path. */
function collectBackendRoutes() {
  const routes = []
  const indexSrc = fs.readFileSync(INDEX, "utf8")

  /**
   * Bảng mount: tên biến import (authRoutes) -> tiền tố (/api/auth).
   * index.js khai báo `import authRoutes from "./routes/auth.js"` và
   * `app.use("/api/auth", authRoutes)`.
   */
  const mountByVar = new Map()
  for (const m of indexSrc.matchAll(/import\s+(\w+)\s+from\s+["']\.\/routes\/([\w-]+)\.js["']/g)) {
    mountByVar.set(m[1], m[2])
  }
  const prefixByModule = new Map()
  for (const m of indexSrc.matchAll(/app\.use\(\s*["'](\/api\/[\w-]+)["']\s*,\s*(\w+)\s*\)/g)) {
    const prefix = m[1]
    const varName = m[2]
    const moduleName = mountByVar.get(varName)
    if (moduleName) prefixByModule.set(moduleName, prefix)
  }

  const files = [
    ...fs.readdirSync(ROUTES_DIR).map((f) => ({ file: path.join(ROUTES_DIR, f), module: path.basename(f, ".js") })),
    { file: INDEX, module: null },
  ]

  for (const { file, module } of files) {
    const src = fs.readFileSync(file, "utf8")
    const isIndex = module === null
    const prefix = isIndex ? "" : (prefixByModule.get(module) ?? `/api/${module}`)

    const re = /(?:router|app)\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g
    let m
    while ((m = re.exec(src)) !== null) {
      const method = m[1].toUpperCase()
      const routePath = m[2]
      if (isIndex) {
        if (!routePath.startsWith("/api")) continue
        routes.push({ method, path: routePath })
      } else {
        routes.push({ method, path: `${prefix}${routePath === "/" ? "" : routePath}` })
      }
    }
  }
  return routes
}

/** Tiền tố mà client dùng làm gốc; đọc từ `const BASE = ... ?? "/api"`. */
const BASE_PREFIX = (() => {
  const m = clientSrc.match(/const\s+BASE\s*=[^\n]*?["'](\/[\w-]*)["']/)
  return m ? m[1] : "/api"
})()

/** Bóc mọi lời gọi request("...", { method }) trong api.ts. */
function collectClientCalls() {
  const calls = []
  /**
   * Danh sách tham số cho phép lồng một cấp ngoặc (toQuery({...}), Record<...>).
   * Nhờ vậy không quét lấn sang lời gọi request() kế tiếp và lấy nhầm method.
   */
  const ARGS = String.raw`\(((?:[^()]|\([^()]*\))*)\)`
  const re = new RegExp(String.raw`request(?:<[^(]*?>)?` + ARGS, "g")
  let m
  while ((m = re.exec(clientSrc)) !== null) {
    const args = m[1]
    const pathMatch = args.match(/^\s*(`[^`]*`|["'][^"']*["'])/)
    if (!pathMatch) continue
    const rawPath = pathMatch[1]
    const methodMatch = args.match(/method:\s*["'](\w+)["']/)
    const method = methodMatch ? methodMatch[1].toUpperCase() : "GET"

    // Bỏ `${toQuery(...)}` (query string) và quy tham số động về :id
    let cleanPath = rawPath.slice(1, -1)
    cleanPath = cleanPath.replace(/\$\{toQuery\([^)]*\)\}/g, "")
    cleanPath = cleanPath.replace(/\$\{[^}]+\}/g, ":id")
    if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`

    // Client gọi tương đối với BASE ("/api"), backend khai báo đầy đủ "/api/..."
    const withBase = cleanPath.startsWith(BASE_PREFIX)
      ? cleanPath
      : `${BASE_PREFIX}${cleanPath === "/" ? "" : cleanPath}`
    calls.push({ method, path: withBase, raw: rawPath })
  }
  return calls
}

/** So khớp đường dẫn client với route backend (tham số động khớp mọi giá trị). */
function matches(clientPath, backendPath) {
  const normalize = (p) => p.replace(/\/+$/, "") || "/"
  const a = normalize(clientPath).split("/").filter(Boolean)
  const b = normalize(backendPath).split("/").filter(Boolean)
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    const seg = b[i]
    if (seg.startsWith(":")) continue // tham số động
    if (a[i] !== seg) return false
  }
  return true
}

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

console.log("\n=== Đối chiếu API client ↔ route backend ===\n")

const backendRoutes = collectBackendRoutes()
const clientCalls = collectClientCalls()

check("đọc được route backend", backendRoutes.length > 0, `${backendRoutes.length} route`)
check("đọc được lời gọi client", clientCalls.length > 0, `${clientCalls.length} lời gọi`)

console.log(`\nKiểm tra ${clientCalls.length} endpoint client dùng (${backendRoutes.length} route backend)\n`)

for (const call of clientCalls) {
  // Khớp cả method lẫn đường dẫn
  const hit = backendRoutes.find(
    (r) => r.method === call.method && matches(call.path, r.path),
  )
  check(
    `${call.method} ${call.path}`,
    Boolean(hit),
    hit ? "" : "backend không có route tương ứng",
  )
}

/* --- Không còn endpoint client nào dùng http ngoài (trừ QR image) --- */
console.log("\nVệ sinh client")
const externalCalls = [...clientSrc.matchAll(/fetch\(\s*["'`](https?:\/\/[^"'`]+)/g)].map((m) => m[1])
check("api.ts chỉ gọi backend nội bộ", externalCalls.length === 0, externalCalls.join(", "))

const hasTimeout = /AbortController|TIMEOUT_MS/.test(clientSrc)
check("client có timeout chống treo UI", hasTimeout)

const hasRoleHeader = /X-Demo-Role/.test(clientSrc)
check("client gửi header vai trò", hasRoleHeader)

const hasErrorClass = /class ApiError/.test(clientSrc)
check("client có lớp lỗi riêng để UI bắt", hasErrorClass)

console.log(`\n=== ${passed} pass, ${failed} fail ===`)
if (failed > 0) {
  console.log("\nLệch client/backend:")
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
