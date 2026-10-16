/**
 * Đối chiếu ma trận quyền frontend ↔ backend — chạy: npm run check:parity
 *
 * Nguồn sự thật: src/lib/role-access.ts (frontend ẩn/hiện UI).
 * Đích kiểm tra: server/domain/rbac.js (backend chặn thật).
 *
 * Hai bên phải nhất quán: nếu UI cho bấm mà API chặn 403 thì sinh viên gặp
 * ngõ cụt; nếu UI ẩn mà API lại cho qua thì lộ lỗ hổng phân quyền.
 *
 * Script đọc trực tiếp hai file để so, không cần backend chạy.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const FE_FILE = path.join(ROOT, "src/lib/role-access.ts")
const BE_FILE = path.join(ROOT, "server/domain/rbac.js")

const feSrc = fs.readFileSync(FE_FILE, "utf8")
const beSrc = fs.readFileSync(BE_FILE, "utf8")

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

/* ---------- Bóc dữ liệu từ frontend ---------- */

/** Đọc ROUTE_ROLES: map route -> danh sách role được vào trang. */
function parseRouteRoles() {
  const block = feSrc.match(/ROUTE_ROLES[^=]*=\s*\{([\s\S]*?)\n\}/)
  if (!block) return null
  const out = {}
  const re = /["']?([\w-]+)["']?\s*:\s*\[([^\]]*)\]/g
  let m
  while ((m = re.exec(block[1])) !== null) {
    const route = m[1]
    const roles = [...m[2].matchAll(/["'](\w+)["']/g)].map((x) => x[1])
    if (roles.length) out[route] = roles
  }
  return out
}

/** Đọc các hàm quyền dạng một dòng: canX = role === "a" || role === "b". */
function parseHelperAllowed(fnName) {
  const fn = feSrc.match(new RegExp(`export const ${fnName}[^=]*=\\s*\\(([^)]*)\\)[^=]*=>([\\s\\S]*?)\\n\\n`))
  if (!fn) return null
  const body = fn[2]
  const roles = [...body.matchAll(/role\s*===\s*["'](\w+)["']/g)].map((m) => m[1])
  return [...new Set(roles)]
}

/* ---------- Bóc dữ liệu từ backend ---------- */

/** Đọc PERMISSIONS: action -> danh sách role. */
function parsePermissions() {
  const block = beSrc.match(/PERMISSIONS\s*=\s*\{([\s\S]*?)\n\}/)
  if (!block) return null
  const out = {}
  const re = /["']([\w:.-]+)["']\s*:\s*\[([^\]]*)\]/g
  let m
  while ((m = re.exec(block[1])) !== null) {
    const action = m[1]
    const roles = [...m[2].matchAll(/["'](\w+)["']/g)].map((x) => x[1])
    out[action] = roles
  }
  return out
}

console.log("\n=== Đối chiếu quyền frontend ↔ backend ===\n")

/* ---------- 1. Cả hai file đọc được ---------- */
const feRoutes = parseRouteRoles()
const bePerms = parsePermissions()
check("đọc được ROUTE_ROLES frontend", Boolean(feRoutes && Object.keys(feRoutes).length))
check("đọc được PERMISSIONS backend", Boolean(bePerms && Object.keys(bePerms).length))

/* ---------- 2. Mọi route frontend đều có quyền backend tương ứng ---------- */
console.log("\nMỗi trang frontend phải có quyền backend chặn tương ứng")
/**
 * Một trang có thể được bảo vệ bằng quyền ":self" (chỉ dữ liệu của mình) hoặc
 * ":all" (toàn bộ). Ví dụ BillingPage: sinh viên dùng invoice:read:self còn
 * quản lý dùng invoice:read:all. Vai trò vào được trang nếu có BẤT KỲ quyền nào
 * trong danh sách ứng viên.
 */
const ROUTE_TO_PERMISSIONS = {
  overview: ["ticket:read"],
  "my-room": ["contract:read:self", "contract:read:all"],
  booking: ["bed:hold"],
  billing: ["invoice:read:self", "invoice:read:all", "meter:read"],
  maintenance: ["ticket:read"],
  curfew: ["discipline:read:self", "discipline:read:all", "gate:scan"],
  manager: ["dashboard:read"],
  visitor: ["visitor:read:self", "visitor:read:all", "visitor:gate"],
  notices: ["notice:read"],
  marketplace: ["marketplace:read", "marketplace:moderate"],
  profile: ["profile:read:self"],
}

for (const [route, roles] of Object.entries(feRoutes || {})) {
  const candidateActions = ROUTE_TO_PERMISSIONS[route]
  if (!candidateActions) {
    check(`route ${route} có ánh xạ quyền`, false, "chưa khai báo trong ROUTE_TO_PERMISSIONS")
    continue
  }
  const known = candidateActions.filter((a) => bePerms?.[a])
  if (known.length === 0) {
    check(`route ${route} -> quyền backend tồn tại`, false, candidateActions.join(" | "))
    continue
  }
  // Vai trò vào được trang nếu có ít nhất một quyền ứng viên ở backend.
  const missing = roles.filter((r) => !known.some((a) => bePerms[a].includes(r)))
  check(
    `route ${route} (${roles.join(",")}) khớp quyền ${known.join("|")}`,
    missing.length === 0,
    missing.length ? `backend thiếu: ${missing.join(",")}` : "",
  )
}

/* ---------- 3. Hàm quyền frontend khớp action backend ---------- */
console.log("\nHàm quyền frontend khớp action backend")
const HELPER_MAP = [
  ["canBookBed", "bed:hold"],
  ["canRecordMeter", "invoice:issue"],
  ["canScanGate", "gate:scan"],
  ["canApproveCurfew", "curfew:approve"],
  ["canPostCommunity", "visitor:create"],
]

for (const [helper, action] of HELPER_MAP) {
  const feRoles = parseHelperAllowed(helper)
  const beRoles = bePerms?.[action] || []
  if (!feRoles) {
    // canPostCommunity dùng trong nhiều chỗ; nếu không parse được thì bỏ qua có báo.
    check(`đọc được ${helper}`, false)
    continue
  }
  const feSorted = [...feRoles].sort().join(",")
  const beSorted = [...beRoles].sort().join(",")
  // canPostCommunity frontend áp cho cả visitor lẫn marketplace nên chỉ cần
  // backend có ít nhất các vai trò frontend cho phép.
  const missing = feRoles.filter((r) => !beRoles.includes(r))
  check(
    `${helper} -> ${action} khớp`,
    missing.length === 0,
    missing.length ? `frontend cho ${missing.join(",")} nhưng backend chặn` : `fe=[${feSorted}] be=[${beSorted}]`,
  )
}

/* ---------- 4. Quy tắc then chốt: kỹ thuật không chạm tiền ---------- */
console.log("\nQuy tắc bất biến về phân quyền")
const moneyActions = [
  "invoice:issue",
  "invoice:reconcile",
  "meter:read",
  "meter:write",
  "invoice:read:all",
  "report:export",
  "system:configure",
]
for (const action of moneyActions) {
  const roles = bePerms?.[action] || []
  check(`kỹ thuật không có quyền ${action}`, !roles.includes("technician"))
}
for (const action of ["invoice:issue", "meter:write", "invoice:reconcile", "report:export", "system:configure"]) {
  const roles = bePerms?.[action] || []
  check(`sinh viên không có quyền ${action}`, !roles.includes("student"))
}

/* ---------- 5. Quy tắc then chốt: chỉ quản lý/admin duyệt ---------- */
const approvalActions = ["curfew:approve", "booking:approve", "booking:reject", "discipline:write", "roomswitch:review"]
for (const action of approvalActions) {
  const roles = bePerms?.[action] || []
  const onlyBoss = roles.length > 0 && roles.every((r) => r === "manager" || r === "admin")
  check(`${action} chỉ quản lý/admin`, onlyBoss, `thực tế: ${roles.join(",") || "không ai"}`)
}

/* ---------- 6. Quy tắc then chốt: bảo vệ quét cổng nhưng không duyệt ---------- */
const gateRoles = bePerms?.["gate:scan"] || []
check("bảo vệ quét cổng được", gateRoles.includes("technician"))
check("sinh viên không quét cổng", !gateRoles.includes("student"))

/* ---------- 7. Chỉ sinh viên dùng khách thăm & chợ ---------- */
const visitorCreate = bePerms?.["visitor:create"] || []
const marketCreate = bePerms?.["marketplace:create"] || []
check("chỉ sinh viên/admin đăng ký khách", visitorCreate.every((r) => r === "student" || r === "admin"))
check("kỹ thuật không đăng ký khách", !visitorCreate.includes("technician"))
check("quản lý không đăng ký khách", !visitorCreate.includes("manager"))
check("chỉ sinh viên/admin đăng chợ", marketCreate.every((r) => r === "student" || r === "admin"))
check("kỹ thuật không vào chợ tạo bài", !marketCreate.includes("technician"))

/* ---------- 8. Bảng quyền không có vai trò lạ ---------- */
const validRoles = new Set(["student", "manager", "technician", "admin"])
let strayRole = null
for (const [action, roles] of Object.entries(bePerms || {})) {
  for (const r of roles) {
    if (!validRoles.has(r)) {
      strayRole = `${action}: ${r}`
      break
    }
  }
  if (strayRole) break
}
check("không có vai trò lạ trong bảng quyền", !strayRole, strayRole || "")

console.log(`\n=== ${passed} pass, ${failed} fail ===`)
if (failed > 0) {
  console.log("\nLệch phân quyền:")
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
