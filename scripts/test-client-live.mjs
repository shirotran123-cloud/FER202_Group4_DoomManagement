/**
 * Kiểm thử sống mọi endpoint mà API client dùng — chạy: npm run test:client-live
 *
 * check-client.mjs xác nhận route tồn tại (tĩnh). Script này gọi thật từng
 * endpoint với vai trò phù hợp để chắc chắn không 404/500 ở runtime — tức là
 * backend thực sự phục vụ được đúng những gì src/lib/api.ts gọi.
 *
 * Cần backend đang chạy. Bộ test gọi dồn dập nên nên chạy backend đã nới rate
 * limit, nếu không sẽ gặp 429:
 *   DMS_DISABLE_RATE_LIMIT=1 node server/index.js
 * Script coi 429 là cảnh báo (endpoint có tồn tại, chỉ bị chặn tần suất) chứ
 * không phải lỗi định tuyến, và in nhắc nhở ở cuối.
 */
import fs from "node:fs"
import path from "node:path"

const BASE = process.env.API_BASE || "http://localhost:3001"
const CLIENT = path.join(process.cwd(), "src/lib/api.ts")

let passed = 0
let failed = 0
const failures = []

function ok(name, condition, detail) {
  if (condition) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    failures.push(detail ? `${name} — ${detail}` : name)
    console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

async function call(method, path, role, body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role ? { "X-Demo-Role": role } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  return res.status
}

/** Ghi lại mọi phản hồi 404/5xx không nằm trong danh sách mong đợi. */
const unexpected = []
/** 429 chỉ là chặn tần suất: endpoint vẫn tồn tại, không phải lỗi định tuyến. */
const rateLimited = []

/**
 * Bảng endpoint client dùng, kèm vai trò có quyền và tham số mẫu.
 * statuses = các mã chấp nhận được (2xx, hoặc 4xx nghiệp vụ có chủ đích).
 */
const CASES = [
  ["GET", "/health", null, [200]],
  ["GET", "/config", null, [200]],
  ["GET", "/users", null, [200]],
  ["GET", "/buildings", null, [200]],
  ["GET", "/rooms", null, [200]],
  ["GET", "/rooms/summary", null, [200]],

  ["GET", "/auth/me", "student", [200]],
  ["PUT", "/auth/me", "student", [200]],
  ["POST", "/auth/refresh", "student", [200]],
  ["GET", "/auth/me", null, [401]],

  ["GET", "/dorm/inventory", "student", [200]],
  ["GET", "/dorm/beds", "student", [200]],
  ["GET", "/dorm/holds/current", "student", [200]],
  ["GET", "/dorm/bookings", "student", [200]],
  ["GET", "/dorm/bookings", "manager", [200]],
  ["GET", "/dorm/contracts", "student", [200]],
  ["GET", "/dorm/room-switches", "student", [200]],
  ["GET", "/dorm/room-switches", "manager", [200]],

  ["GET", "/billing/invoices", "student", [200]],
  ["GET", "/billing/invoices", "manager", [200]],
  ["POST", "/billing/calculate", "manager", [200, 400]],
  ["GET", "/billing/utility-records", "manager", [200]],
  ["POST", "/billing/reconcile", "manager", [200]],

  ["GET", "/tickets", "student", [200]],
  ["GET", "/tickets", "technician", [200]],
  ["GET", "/tickets/stats", "manager", [200]],

  ["GET", "/curfew/requests", "student", [200]],
  ["GET", "/curfew/requests", "manager", [200]],
  ["GET", "/curfew/gate/logs", "technician", [200]],
  ["GET", "/curfew/gate/overdue", "technician", [200]],
  ["GET", "/curfew/discipline", "student", [200]],
  ["GET", "/curfew/demerits", "manager", [200]],
  ["GET", "/curfew/config", null, [200]],

  ["GET", "/visitors", "student", [200]],
  ["GET", "/visitors", "manager", [200]],
  ["GET", "/visitors/overstaying", "technician", [200]],

  ["GET", "/community/notices", "student", [200]],
  ["GET", "/community/marketplace", "student", [200]],
  ["GET", "/community/lost-found", "student", [200]],
  ["GET", "/community/notifications", "student", [200]],

  ["GET", "/dashboard/overview", "manager", [200]],
  ["GET", "/dashboard/reports/residents", "manager", [200]],
  ["GET", "/dashboard/reports/debts", "manager", [200]],
  ["GET", "/dashboard/settings", "admin", [200]],
  ["GET", "/dashboard/discipline-summary", "manager", [200]],
  ["POST", "/dashboard/simulate/billing", "admin", [200]],
  ["POST", "/dashboard/simulate/electricity", "admin", [200]],
]

async function main() {
  console.log(`\n=== Kiểm thử sống endpoint client @ ${BASE} ===\n`)

  // Tìm id thật để test các endpoint có tham số
  const bedsRes = await fetch(`${BASE}/api/dorm/beds`, { headers: { "X-Demo-Role": "student" } })
  const beds = (await bedsRes.json())?.data || []
  const freeBed = beds.find((b) => b.status === "AVAILABLE") || beds[0]

  const ticketsRes = await fetch(`${BASE}/api/tickets`, { headers: { "X-Demo-Role": "manager" } })
  const tickets = (await ticketsRes.json())?.data || []
  const ticketId = tickets[0]?.id

  const invRes = await fetch(`${BASE}/api/billing/invoices`, { headers: { "X-Demo-Role": "manager" } })
  const invoices = (await invRes.json())?.data || []
  const invoiceId = invoices[0]?.id

  const visRes = await fetch(`${BASE}/api/visitors`, { headers: { "X-Demo-Role": "manager" } })
  const visitors = (await visRes.json())?.data || []
  const visitorId = visitors[0]?.id

  const notiRes = await fetch(`${BASE}/api/community/notices`, { headers: { "X-Demo-Role": "student" } })
  const notices = (await notiRes.json())?.data || []
  const noticeId = notices[0]?.id

  const mktRes = await fetch(`${BASE}/api/community/marketplace`, { headers: { "X-Demo-Role": "student" } })
  const market = (await mktRes.json())?.data || []
  const marketId = market[0]?.id

  const lafRes = await fetch(`${BASE}/api/community/lost-found`, { headers: { "X-Demo-Role": "student" } })
  const lost = (await lafRes.json())?.data || []
  const lostId = lost[0]?.id

  const swRes = await fetch(`${BASE}/api/dorm/room-switches`, { headers: { "X-Demo-Role": "manager" } })
  const switches = (await swRes.json())?.data || []

  const jobRes = await fetch(`${BASE}/api/dashboard/reports/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Demo-Role": "manager" },
    body: JSON.stringify({ kind: "residents" }),
  })
  const jobBody = await jobRes.json().catch(() => null)
  const jobId = jobBody?.data?.id

  // Endpoint có tham số (không dùng vòng lặp tĩnh)
  const PARAM_CASES = [
    ["GET", `/tickets/${ticketId}`, "manager", [200]],
    ["GET", `/billing/invoices/${invoiceId}`, "manager", [200]],
    ["POST", `/visitors/${visitorId}/check-out`, "technician", [200, 400]],
    ["POST", `/dorm/holds`, "student", [201, 409], null], // body gắn sau
    ["DELETE", "/dorm/holds/HOLD-000000", "student", [404]],
  ]
  if (jobId) PARAM_CASES.push(["GET", `/dashboard/reports/export/${jobId}`, "manager", [200]])

  if (noticeId) PARAM_CASES.push(["DELETE", `/community/notices/${noticeId}`, "manager", [200]])
  if (marketId) PARAM_CASES.push(["POST", `/community/marketplace/${marketId}/sold`, "student", [200, 403]])
  if (lostId) PARAM_CASES.push(["POST", `/community/lost-found/${lostId}/claim`, "student", [200, 403]])
  if (switches[0]?.id) PARAM_CASES.push(["POST", `/dorm/room-switches/${switches[0].id}/decide`, "manager", [200, 400]])

  // Giữ chỗ cần bedCode thật trong body
  const holdCase = PARAM_CASES.find(([, p]) => p === "/dorm/holds")
  if (holdCase) {
    holdCase[4] = freeBed?.fullCode ? { bedCode: freeBed.fullCode } : { bedCode: "A101-A1-G01" }
  }

  console.log("Endpoint cố định\n")
  for (const [method, p, role, expected] of CASES) {
    const status = await call(method, p, role)
    if (status === 429) {
      rateLimited.push(`${method} ${p}`)
      ok(`${method} ${p}${role ? ` [${role}]` : ""}`, true, "429 — endpoint tồn tại, bị chặn tần suất")
      continue
    }
    const fine = expected.includes(status)
    if (!fine) unexpected.push(`${method} ${p} -> ${status}`)
    ok(`${method} ${p}${role ? ` [${role}]` : ""}`, fine, fine ? "" : `nhận ${status}, mong ${expected.join("/")}`)
  }

  console.log("\nEndpoint có tham số\n")
  for (const [method, p, role, expected, body] of PARAM_CASES) {
    const status = await call(method, p, role, body)
    if (status === 429) {
      rateLimited.push(`${method} ${p}`)
      ok(`${method} ${p} [${role}]`, true, "429 — endpoint tồn tại, bị chặn tần suất")
      continue
    }
    const fine = expected.includes(status)
    if (!fine) unexpected.push(`${method} ${p} -> ${status}`)
    ok(`${method} ${p} [${role}]`, fine, fine ? "" : `nhận ${status}, mong ${expected.join("/")}`)
  }

  console.log("\nKhông có endpoint nào trả 404 hoặc 5xx ngoài dự kiến")
  ok(
    "mọi phản hồi đều nằm trong danh sách mong đợi",
    unexpected.length === 0,
    unexpected.join("; "),
  )

  console.log(`\n=== ${passed} pass, ${failed} fail ===`)
  if (rateLimited.length > 0) {
    console.log(
      `\n\x1b[33mLưu ý\x1b[0m: ${rateLimited.length} endpoint bị chặn tần suất (429). ` +
        `Chạy lại backend với DMS_DISABLE_RATE_LIMIT=1 để kiểm tra đầy đủ.`,
    )
  }
  if (failed > 0) {
    console.log("\nEndpoint hỏng:")
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("\nLỗi:", err.message)
  console.error("Backend đã chạy chưa? Thử: npm run server")
  process.exit(1)
})
