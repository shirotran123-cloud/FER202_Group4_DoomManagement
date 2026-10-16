/**
 * Store JSON đơn giản, an toàn và không phụ thuộc thư viện ngoài.
 *
 * - Nạp db.json vào bộ nhớ một lần, đọc đồng bộ (dữ liệu demo nhỏ).
 * - Ghi atomically: ghi file tạm rồi rename để không hỏng db.json giữa chừng.
 * - Gộp nhiều thay đổi trong 120ms thành một lần ghi (debounce) để giảm I/O.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DB_PATH = path.join(__dirname, "..", "db.json")

/** Collection bắt buộc phải tồn tại, kể cả khi db.json cũ thiếu. */
const DEFAULT_COLLECTIONS = {
  users: [],
  buildings: [],
  floors: [],
  rooms: [],
  compartments: [],
  beds: [],
  configs: [],
  bookings: [],
  bedHolds: [],
  contracts: [],
  roomSwitchRequests: [],
  utilityRecords: [],
  invoices: [],
  payments: [],
  tickets: [],
  visitors: [],
  notices: [],
  marketplace: [],
  lostFound: [],
  curfewRequests: [],
  gateLogs: [],
  disciplineRecords: [],
  demeritSummaries: [],
  notifications: [],
}

let state = null
let writeTimer = null

function ensureShape(data) {
  const out = { ...DEFAULT_COLLECTIONS, ...(data || {}) }
  for (const key of Object.keys(DEFAULT_COLLECTIONS)) {
    if (!Array.isArray(out[key])) out[key] = []
  }
  return out
}

/** Nạp db.json (tạo file rỗng nếu chưa có). */
export function load() {
  if (state) return state
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8")
    state = ensureShape(JSON.parse(raw))
  } catch {
    state = ensureShape({})
  }
  return state
}

/** Nạp lại từ đĩa, bỏ cache trong bộ nhớ (dùng cho test/CLI). */
export function reload() {
  state = null
  return load()
}

export function snapshot() {
  return load()
}

/** Ghi ngay lập tức, không debounce. */
export function saveNow() {
  if (writeTimer) {
    clearTimeout(writeTimer)
    writeTimer = null
  }
  const dir = path.dirname(DB_PATH)
  const tmp = path.join(dir, `.db.${process.pid}.${Date.now()}.tmp`)
  fs.writeFileSync(tmp, JSON.stringify(load(), null, 2))
  fs.renameSync(tmp, DB_PATH)
}

/** Ghi trì hoãn; gọi sau mỗi thao tác thay đổi. */
export function save() {
  if (writeTimer) return
  writeTimer = setTimeout(() => {
    writeTimer = null
    try {
      saveNow()
    } catch (err) {
      console.error("[db] ghi db.json thất bại:", err.message)
    }
  }, 120)
}

/* ---------- Truy vấn ---------- */

export function all(collection) {
  const data = load()
  if (!Array.isArray(data[collection])) data[collection] = []
  return data[collection]
}

export function find(collection, predicate) {
  return all(collection).find(predicate) || null
}

export function findMany(collection, predicate) {
  return all(collection).filter(predicate)
}

export function findById(collection, id) {
  return find(collection, (row) => row.id === id)
}

export function insert(collection, row) {
  all(collection).push(row)
  save()
  return row
}

/** Cập nhật theo id; trả bản ghi mới hoặc null nếu không thấy. */
export function updateById(collection, id, patch) {
  const rows = all(collection)
  const idx = rows.findIndex((r) => r.id === id)
  if (idx === -1) return null
  const next = typeof patch === "function" ? patch(rows[idx]) : { ...rows[idx], ...patch }
  rows[idx] = next
  save()
  return next
}

/** Ghi đè toàn bộ collection (dùng khi thay danh sách đã lọc). */
export function replaceAll(collection, rows) {
  const data = load()
  data[collection] = rows
  save()
  return rows
}

export function removeById(collection, id) {
  const rows = all(collection)
  const idx = rows.findIndex((r) => r.id === id)
  if (idx === -1) return false
  rows.splice(idx, 1)
  save()
  return true
}

/** Sinh id dạng TIỀN-TỐ-<6 số cuối thời gian>, đảm bảo không trùng trong collection. */
export function nextId(collection, prefix) {
  const rows = all(collection)
  let id = `${prefix}-${Date.now().toString().slice(-6)}`
  let guard = 0
  while (rows.some((r) => r.id === id) && guard < 1000) {
    id = `${prefix}-${Date.now().toString().slice(-6)}${guard++}`
  }
  return id
}
