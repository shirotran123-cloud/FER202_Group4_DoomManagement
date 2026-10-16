/**
 * Engine tính phí — bản sao chính xác của src/lib/dorm-ops.ts.
 *
 * Quy tắc nghiệp vụ (SRS FR-4.3):
 *  - Điện tính bậc thang theo ELECTRICITY_TIERS.
 *  - Nước theo đồng giá.
 *  - Wifi + vệ sinh là phí chung của phòng.
 *  - Tiền phòng tính theo đầu người rồi nhân số sinh viên thực ở.
 *  - Điện + nước + phí chung chia đều cho N sinh viên (Total / N).
 *
 * Mọi hàm thuần (pure) để test độc lập và đối chiếu trực tiếp với frontend.
 */
import {
  ELECTRICITY_TIERS,
  WATER_PRICE_PER_M3,
  VAT_RATE,
  ROOM_FEE_PER_STUDENT,
  WIFI_FEE_TOTAL,
  CLEANING_FEE_TOTAL,
} from "../config.js"

/** Tính tiền điện theo bậc thang. Trả 0 nếu kWh <= 0. */
export function calculateTieredElectricity(kwh) {
  if (!Number.isFinite(kwh) || kwh <= 0) return 0
  let remaining = Math.floor(kwh)
  let total = 0
  let prevCap = 0
  for (const tier of ELECTRICITY_TIERS) {
    const usable = Math.min(remaining, tier.upToKwh - prevCap)
    if (usable > 0) {
      total += usable * tier.pricePerKwh
      remaining -= usable
    }
    prevCap = tier.upToKwh
    if (remaining <= 0) break
  }
  return total
}

/** Chia đều, làm tròn tới đồng. Khớp splitEvenly frontend. */
export function splitEvenly(total, numPeople) {
  if (!Number.isFinite(total) || total < 0) return 0
  if (!Number.isFinite(numPeople) || numPeople <= 0) return 0
  return Math.round(total / Math.floor(numPeople))
}

/**
 * Dựng hóa đơn tháng cho một phòng.
 * Đầu vào khớp MonthlyReadingInput của frontend:
 * { room, month, elecOld, elecNew, waterOld, waterNew,
 *   roomFeePerStudent, wifiFeeTotal, cleaningFeeTotal, numStudents }
 */
export function buildMonthlyInvoice(input) {
  const numStudents = Math.max(1, Math.floor(input.numStudents || 1))
  const deltaElec = Math.max(0, Math.floor((input.elecNew ?? 0) - (input.elecOld ?? 0)))
  const deltaWater = Math.max(0, Math.floor((input.waterNew ?? 0) - (input.waterOld ?? 0)))
  const elecCost = calculateTieredElectricity(deltaElec)
  const waterCost = deltaWater * WATER_PRICE_PER_M3
  const sharedFees =
    Math.max(0, input.wifiFeeTotal ?? WIFI_FEE_TOTAL) +
    Math.max(0, input.cleaningFeeTotal ?? CLEANING_FEE_TOTAL)
  const roomFeePerStudent = Math.max(0, input.roomFeePerStudent ?? ROOM_FEE_PER_STUDENT)
  const roomTotal = roomFeePerStudent * numStudents
  const utilityTotal = elecCost + waterCost + sharedFees
  const perStudentUtility = splitEvenly(utilityTotal, numStudents)
  const perStudentTotal = perStudentUtility + roomFeePerStudent
  return {
    room: input.room,
    month: input.month,
    deltaElec,
    deltaWater,
    elecCost,
    waterCost,
    sharedFees,
    roomTotal,
    grandTotal: utilityTotal + roomTotal,
    perStudentUtility,
    perStudentTotal,
    numStudents,
    vatRate: VAT_RATE,
  }
}

/**
 * Chia tiền theo tỷ lệ ngày ở (pro-rata) khi sinh viên vào/ra giữa tháng.
 * daysStayed tính trên tổng số ngày tháng đó; tổng tỷ lệ phải bằng 1.
 */
export function proRataShares(perStudentTotal, stays, daysInMonth) {
  if (!stays?.length || !daysInMonth) return []
  const totalDays = stays.reduce((sum, s) => sum + Math.max(0, s.daysStayed), 0)
  if (totalDays === 0) return []
  const rows = stays.map((s) => ({
    studentId: s.studentId,
    daysStayed: Math.max(0, s.daysStayed),
    amount: Math.round((perStudentTotal * s.daysStayed) / daysInMonth),
  }))
  // Bù sai số làm tròn vào người ở nhiều ngày nhất để tổng khớp tuyệt đối.
  const target = perStudentTotal * stays.length
  const diff = target - rows.reduce((sum, r) => sum + r.amount, 0)
  if (diff !== 0) {
    let pivot = 0
    for (let i = 1; i < rows.length; i++) if (rows[i].daysStayed > rows[pivot].daysStayed) pivot = i
    rows[pivot].amount += diff
  }
  return rows
}

/** Quyết toán trả phòng: cọc - (hư hỏng + nợ chưa đóng). Khớp frontend. */
export function computeCheckoutSettlement(deposit, damages = [], unpaidBills = 0) {
  const safeDeposit = Math.max(0, Math.floor(deposit))
  const damageTotal = damages.reduce((sum, d) => sum + Math.max(0, Math.floor(d.cost || 0)), 0)
  const bills = Math.max(0, Math.floor(unpaidBills))
  const deduction = Math.min(safeDeposit, damageTotal + bills)
  return {
    deposit: safeDeposit,
    damageTotal,
    unpaidBills: bills,
    deduction,
    refund: safeDeposit - deduction,
  }
}

/** Xác thực số công tơ: chỉ số mới không được nhỏ hơn cũ. */
export function validateMeterReading({ elecOld, elecNew, waterOld, waterNew }) {
  const errors = []
  if (elecNew < elecOld) {
    errors.push(`Chỉ số điện mới (${elecNew}) không được nhỏ hơn chỉ số cũ (${elecOld})`)
  }
  if (waterNew < waterOld) {
    errors.push(`Chỉ số nước mới (${waterNew}) không được nhỏ hơn chỉ số cũ (${waterOld})`)
  }
  return { ok: errors.length === 0, errors }
}

/**
 * Cảnh báo rò rỉ khi tiêu thụ vượt 200% tháng trước (SRS FR-4.2).
 * Trả về danh sách cảnh báo, rỗng nghĩa là bình thường.
 */
export function detectConsumptionAnomaly({ deltaElec, deltaWater, prevDeltaElec, prevDeltaWater }) {
  const warnings = []
  if (prevDeltaElec > 0 && deltaElec > prevDeltaElec * 2) {
    warnings.push(
      `Điện tăng ${Math.round((deltaElec / prevDeltaElec) * 100)}% so với tháng trước, nghi ngờ chập điện`,
    )
  }
  if (prevDeltaWater > 0 && deltaWater > prevDeltaWater * 2) {
    warnings.push(
      `Nước tăng ${Math.round((deltaWater / prevDeltaWater) * 100)}% so với tháng trước, nghi ngờ rò rỉ`,
    )
  }
  return warnings
}
