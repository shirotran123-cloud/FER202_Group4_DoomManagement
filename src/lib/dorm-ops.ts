export interface ElectricityTier {
  upToKwh: number
  pricePerKwh: number
}

export const ELECTRICITY_TIERS: ElectricityTier[] = [
  { upToKwh: 50, pricePerKwh: 1800 },
  { upToKwh: 100, pricePerKwh: 2200 },
  { upToKwh: 200, pricePerKwh: 2600 },
  { upToKwh: Number.POSITIVE_INFINITY, pricePerKwh: 3100 },
]

export const WATER_PRICE_PER_M3 = 18000
export const CURFEW_HOUR = 23
export const MAX_RATING = 5

export function calculateTieredElectricity(kwh: number): number {
  if (!Number.isFinite(kwh) || kwh <= 0) return 0
  let remaining = Math.floor(kwh)
  let total = 0
  let prevCap = 0
  for (const tier of ELECTRICITY_TIERS) {
    const cap = tier.upToKwh
    const usable = Math.min(remaining, cap - prevCap)
    if (usable > 0) {
      total += usable * tier.pricePerKwh
      remaining -= usable
    }
    prevCap = cap
    if (remaining <= 0) break
  }
  return total
}

export function splitEvenly(total: number, numPeople: number): number {
  if (!Number.isFinite(total) || total < 0) return 0
  if (!Number.isFinite(numPeople) || numPeople <= 0) return 0
  return Math.round(total / Math.floor(numPeople))
}

export interface MonthlyReadingInput {
  room: string
  month: string
  elecOld: number
  elecNew: number
  waterOld: number
  waterNew: number
  roomFeePerStudent: number
  wifiFeeTotal: number
  cleaningFeeTotal: number
  numStudents: number
}

export interface MonthlyInvoice {
  room: string
  month: string
  deltaElec: number
  deltaWater: number
  elecCost: number
  waterCost: number
  sharedFees: number
  roomTotal: number
  grandTotal: number
  perStudentUtility: number
  perStudentTotal: number
}

export function buildMonthlyInvoice(input: MonthlyReadingInput): MonthlyInvoice {
  const deltaElec = Math.max(0, Math.floor(input.elecNew - input.elecOld))
  const deltaWater = Math.max(0, Math.floor(input.waterNew - input.waterOld))
  const elecCost = calculateTieredElectricity(deltaElec)
  const waterCost = deltaWater * WATER_PRICE_PER_M3
  const sharedFees = Math.max(0, input.wifiFeeTotal) + Math.max(0, input.cleaningFeeTotal)
  const roomTotal = Math.max(0, input.roomFeePerStudent) * Math.max(1, Math.floor(input.numStudents))
  const grandTotal = elecCost + waterCost + sharedFees + roomTotal
  const utilityTotal = elecCost + waterCost + sharedFees
  const perStudentUtility = splitEvenly(utilityTotal, input.numStudents)
  const perStudentTotal = perStudentUtility + Math.max(0, input.roomFeePerStudent)
  return {
    room: input.room,
    month: input.month,
    deltaElec,
    deltaWater,
    elecCost,
    waterCost,
    sharedFees,
    roomTotal,
    grandTotal,
    perStudentUtility,
    perStudentTotal,
  }
}

export type TicketStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "CANCELLED"

const TICKET_FLOW: Record<TicketStatus, TicketStatus[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
}

export function canTransitionTicket(from: TicketStatus, to: TicketStatus): boolean {
  return TICKET_FLOW[from]?.includes(to) ?? false
}

export function transitionTicketStatus(from: TicketStatus, to: TicketStatus): TicketStatus {
  if (!canTransitionTicket(from, to)) {
    throw new Error(`Illegal ticket transition ${from} -> ${to}`)
  }
  return to
}

export function validateRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= MAX_RATING
}

export interface DamageItem {
  name: string
  cost: number
}

export interface CheckoutSettlement {
  deposit: number
  damageTotal: number
  unpaidBills: number
  deduction: number
  refund: number
}

export function computeCheckoutSettlement(deposit: number, damages: DamageItem[], unpaidBills: number): CheckoutSettlement {
  const safeDeposit = Math.max(0, Math.floor(deposit))
  const damageTotal = damages.reduce((sum, d) => sum + Math.max(0, Math.floor(d.cost)), 0)
  const bills = Math.max(0, Math.floor(unpaidBills))
  const deduction = Math.min(safeDeposit, damageTotal + bills)
  return { deposit: safeDeposit, damageTotal, unpaidBills: bills, deduction, refund: safeDeposit - deduction }
}

export type RoomSwitchStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "COMPLETED"

export interface RoomSwitchRequest {
  id: string
  studentId: string
  fromRoom: string
  toRoom: string
  reason: string
  status: RoomSwitchStatus
  createdAt: string
}

export function createRoomSwitchRequest(studentId: string, fromRoom: string, toRoom: string, reason: string): RoomSwitchRequest {
  if (!studentId.trim() || !fromRoom.trim() || !toRoom.trim()) throw new Error("Missing room switch fields")
  if (fromRoom.trim() === toRoom.trim()) throw new Error("fromRoom and toRoom must differ")
  return {
    id: `RSW-${Date.now().toString().slice(-6)}`,
    studentId: studentId.trim(),
    fromRoom: fromRoom.trim(),
    toRoom: toRoom.trim(),
    reason: reason.trim() || "Sinh vien yeu cau doi phong",
    status: "SUBMITTED",
    createdAt: new Date().toISOString(),
  }
}

export function reviewRoomSwitchRequest(req: RoomSwitchRequest, approve: boolean): RoomSwitchRequest {
  if (req.status !== "SUBMITTED") throw new Error("Only SUBMITTED requests can be reviewed")
  return { ...req, status: approve ? "APPROVED" : "REJECTED" }
}

export type GateScanStatus = "ON_TIME" | "APPROVED_LATE" | "UNAUTHORIZED_LATE"

export function evaluateGateScan(scanHour: number, hasApprovedRequest: boolean): GateScanStatus {
  const late = scanHour >= CURFEW_HOUR || scanHour < 5
  if (!late) return "ON_TIME"
  return hasApprovedRequest ? "APPROVED_LATE" : "UNAUTHORIZED_LATE"
}

export function buildGateQrPayload(studentId: string, issuedAt: string): string {
  return `DMS-GATE|${studentId.trim().toUpperCase()}|${issuedAt}`
}

export function parseGateQrPayload(payload: string): { studentId: string; issuedAt: string } | null {
  const parts = payload.split("|")
  if (parts.length !== 3 || parts[0] !== "DMS-GATE") return null
  if (!parts[1] || !parts[2]) return null
  return { studentId: parts[1], issuedAt: parts[2] }
}

export interface GateLogInput {
  studentId: string
  scanHour: number
}

export function findOverdueAbsentees(logs: GateLogInput[], expectedStudentIds: string[], nowHour: number): string[] {
  if (nowHour < CURFEW_HOUR) return []
  const seen = new Set(logs.map((l) => l.studentId.toUpperCase()))
  return expectedStudentIds.filter((id) => !seen.has(id.toUpperCase()))
}

export type VisitorStatus = "PRE_REGISTERED" | "CHECKED_IN" | "CHECKED_OUT" | "OVERSTAY"

/** Khách thăm chỉ được ở trong ngày, rời KTX trước 21:00, không lưu trú qua đêm. */
export const VISITOR_LATEST_HOUR = 21

export interface VisitorRecord {
  id: string
  studentId: string
  fullName: string
  citizenId: string
  visitDate: string
  expectedMinutes: number
  status: VisitorStatus
  checkInAt: string | null
  checkOutAt: string | null
}

export function registerVisitor(studentId: string, fullName: string, citizenId: string, visitDate: string): VisitorRecord {
  if (!fullName.trim()) throw new Error("Vui lòng nhập họ tên khách")
  if (!/^\d{12}$/.test(citizenId.replace(/\s/g, ""))) throw new Error("Số CCCD phải gồm đúng 12 chữ số")
  return {
    id: `VST-${Date.now().toString().slice(-6)}`,
    studentId,
    fullName: fullName.trim(),
    citizenId: citizenId.replace(/\s/g, ""),
    visitDate,
    expectedMinutes: 0,
    status: "PRE_REGISTERED",
    checkInAt: null,
    checkOutAt: null,
  }
}

export function checkInVisitor(v: VisitorRecord, at: string): VisitorRecord {
  if (v.status !== "PRE_REGISTERED") throw new Error("Chỉ check-in được khách đã đăng ký trước")
  return { ...v, status: "CHECKED_IN", checkInAt: at }
}

export function checkOutVisitor(v: VisitorRecord, at: string): VisitorRecord {
  if (v.status !== "CHECKED_IN" && v.status !== "OVERSTAY") throw new Error("Visitor is not checked in")
  return { ...v, status: "CHECKED_OUT", checkOutAt: at }
}

export function detectVisitorOverstay(v: VisitorRecord, currentHour: number): VisitorRecord {
  if (v.status !== "CHECKED_IN") return v
  if (currentHour >= VISITOR_LATEST_HOUR) return { ...v, status: "OVERSTAY" }
  return v
}

export function buildVietQrContent(room: string, studentId: string, amount: number, purpose: string): string {
  const cleanRoom = room.replace(/\s+/g, "").toUpperCase()
  const cleanId = studentId.replace(/\s+/g, "").toUpperCase()
  const cleanPurpose = purpose.replace(/\s+/g, "_").toUpperCase().slice(0, 20)
  return `${cleanPurpose}_${cleanRoom}_${cleanId}_${Math.max(0, Math.floor(amount))}`
}

export interface ReconcileInput {
  expectedAmount: number
  expectedContent: string
  actualAmount: number
  actualContent: string
}

export function reconcilePayment(input: ReconcileInput): { matched: boolean; reason: string } {
  const norm = (s: string) => s.replace(/\s+/g, "").toUpperCase()
  if (Math.floor(input.actualAmount) !== Math.floor(input.expectedAmount)) {
    return { matched: false, reason: "AMOUNT_MISMATCH" }
  }
  if (norm(input.actualContent) !== norm(input.expectedContent)) {
    return { matched: false, reason: "CONTENT_MISMATCH" }
  }
  return { matched: true, reason: "MATCHED" }
}

export interface DepositTx {
  id: string
  studentId: string
  kind: "HOLD" | "DEDUCT" | "REFUND"
  amount: number
  note: string
}

export function applyDepositTransaction(balance: number, tx: DepositTx): number {
  const amount = Math.max(0, Math.floor(tx.amount))
  if (tx.kind === "HOLD" || tx.kind === "REFUND") return balance + amount
  return Math.max(0, balance - amount)
}

export interface DormNotice {
  id: string
  title: string
  body: string
  audience: "ALL" | "BUILDING" | "ROOM"
  startsAt: string
  endsAt: string
}

export function createNotice(title: string, body: string, audience: DormNotice["audience"], startsAt: string, endsAt: string): DormNotice {
  if (!title.trim() || !body.trim()) throw new Error("Notice needs title and body")
  if (Date.parse(endsAt) < Date.parse(startsAt)) throw new Error("endsAt must be after startsAt")
  return { id: `NTC-${Date.now().toString().slice(-6)}`, title: title.trim(), body: body.trim(), audience, startsAt, endsAt }
}

export function filterActiveNotices(notices: DormNotice[], nowIso: string): DormNotice[] {
  const now = Date.parse(nowIso)
  return notices.filter((n) => Date.parse(n.startsAt) <= now && now <= Date.parse(n.endsAt))
}

export interface MarketplaceListing {
  id: string
  sellerId: string
  title: string
  price: number
  category: string
  photoIds: string[]
  status: "ACTIVE" | "SOLD" | "REMOVED"
}

export function createMarketplaceListing(sellerId: string, title: string, price: number, category: string, photoIds: string[]): MarketplaceListing {
  if (!sellerId.trim()) throw new Error("Thiếu thông tin người bán")
  if (title.trim().length < 4) throw new Error("Tiêu đề phải có ít nhất 4 ký tự")
  if (!Number.isFinite(price) || price < 0) throw new Error("Giá tiền không hợp lệ")
  return {
    id: `MKT-${Date.now().toString().slice(-6)}`,
    sellerId,
    title: title.trim(),
    price: Math.floor(price),
    category: category.trim() || "DO_CU",
    photoIds: photoIds.slice(0, 5),
    status: "ACTIVE",
  }
}

export interface LostFoundPost {
  id: string
  reporterId: string
  kind: "LOST" | "FOUND"
  item: string
  location: string
  photoIds: string[]
  status: "OPEN" | "CLAIMED" | "CLOSED"
}

export function createLostFoundPost(reporterId: string, kind: "LOST" | "FOUND", item: string, location: string, photoIds: string[]): LostFoundPost {
  if (!reporterId.trim()) throw new Error("Thiếu thông tin người đăng")
  if (item.trim().length < 3) throw new Error("Mô tả món đồ phải có ít nhất 3 ký tự")
  return {
    id: `LAF-${Date.now().toString().slice(-6)}`,
    reporterId,
    kind,
    item: item.trim(),
    location: location.trim() || "KTX",
    photoIds: photoIds.slice(0, 5),
    status: "OPEN",
  }
}

export type RoomMapStatus = "available" | "full" | "maintenance"

export function getRoomStatusColor(status: RoomMapStatus): { bg: string; label: string } {
  switch (status) {
    case "available":
      return { bg: "#16a34a", label: "Con cho" }
    case "full":
      return { bg: "#dc2626", label: "Da day" }
    case "maintenance":
      return { bg: "#d97706", label: "Bao tri" }
  }
}

export interface FloorRoom {
  id: string
  capacity: number
  occupied: number
  underMaintenance: boolean
}

export function resolveFloorRoomStatus(room: FloorRoom): RoomMapStatus {
  if (room.underMaintenance) return "maintenance"
  if (room.occupied >= room.capacity) return "full"
  return "available"
}

export function buildFloorGrid(rooms: FloorRoom[]): Record<string, RoomMapStatus> {
  const grid: Record<string, RoomMapStatus> = {}
  for (const room of rooms) grid[room.id] = resolveFloorRoomStatus(room)
  return grid
}

export function answerDormQuestion(query: string): string {
  const q = query.toLowerCase()
  if (/(cháy|chap|chập|khét|lửa|emergency|khẩn cấp|cứu|1900)/.test(q)) {
    return "Khan cap: ngat aptomat, goi bao ve 1900 6868, tao ticket muc Khan cap 2h kem anh chup hien truong."
  }
  if (/(tiền|tien|thanh toán|vietqr|hóa đơn|hoa don|đóng tiền|dong tien|cọc|coc|thanh toan)/.test(q)) {
    return "Hoa don gom tien phong + dien bac thang + nuoc + wifi + ve sinh, chia deu theo dau nguoi. Quet VietQR dung so tien va noi dung DIENNUOC_[phong]_[MSSV]."
  }
  if (/(giới nghiêm|gioi nghiem|23|về muộn|ve muon|qua cổng|quet qr|qr qua)/.test(q)) {
    return "Gioi nghiem 23:00. Nop don ve muon truoc 21:00, quet QR khi qua cong. Qua 23:00 khong don se tru diem ren luyen."
  }
  if (/(sửa|chữa|bao hong|ticket|hỏng|quạt|quat|điều hòa|bóng đèn|vòi sen|bồn cầu)/.test(q)) {
    return "Bao hong: mo Maintenance, chon phong/vi tri, upload anh su co, mo ta chi tiet, chon muc do. Khan cap xu ly 2h, thuong 24h."
  }
  if (/(phòng|phong|giường|giuong|đổi phòng|doi phong|trả phòng|tra phong|nội quy|tam tru)/.test(q)) {
    return "Noi quy: khong nau an, khong khach qua dem chua dang ky, giu trat tu sau 22:30. Doi phong: submit yeu cau, BQL duyet, cap nhat so do. Tra phong: kiem ke, tru hu hong, hoan coc."
  }
  return "DomaAI: hoi ve gioi nghiem 23:00, bao hong kem anh, hoa don VietQR, doi/tra phong hoac lien he bao ve 1900 6868."
}

export interface AllocationStudent {
  id: string
  faculty: string
  nightOwl: boolean
  quiet: boolean
}

export interface AllocationRoom {
  id: string
  facultyMix: string[]
  nightOwlFriendly: boolean
  quietZone: boolean
  freeBeds: number
}

export function scoreAllocation(student: AllocationStudent, room: AllocationRoom): number {
  if (room.freeBeds <= 0) return -1
  let score = 10 + Math.min(room.freeBeds, 6)
  if (room.facultyMix.includes(student.faculty)) score += 20
  if (student.nightOwl && room.nightOwlFriendly) score += 15
  if (!student.nightOwl && !room.nightOwlFriendly) score += 8
  if (student.quiet && room.quietZone) score += 15
  if (!student.quiet && !room.quietZone) score += 5
  return score
}

export function suggestRoomAllocation(student: AllocationStudent, rooms: AllocationRoom[], topN: number): AllocationRoom[] {
  return rooms
    .map((room) => ({ room, score: scoreAllocation(student, room) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, topN))
    .map((x) => x.room)
}

export function moderateText(text: string): { ok: boolean; reason: string } {
  const banned = ["spam", "lừa đảo", "hack", "xxx"]
  const lower = text.toLowerCase()
  for (const word of banned) {
    if (lower.includes(word)) return { ok: false, reason: `BANNED_WORD:${word}` }
  }
  if (text.length > 2000) return { ok: false, reason: "TOO_LONG" }
  return { ok: true, reason: "OK" }
}
