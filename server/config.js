/**
 * Hằng số nghiệp vụ DMS.
 *
 * Nguồn sự thật duy nhất cho cả backend lẫn đối chiếu frontend:
 * phải khớp 1:1 với src/lib/dorm-ops.ts, src/types/*.ts.
 * Sửa ở đây thì cập nhật cả frontend để không lệch công thức.
 */

/** Biểu giá điện bậc thang (VNĐ/kWh). upToKwh = Infinity là bậc cuối. */
export const ELECTRICITY_TIERS = [
  { upToKwh: 50, pricePerKwh: 1800 },
  { upToKwh: 100, pricePerKwh: 2200 },
  { upToKwh: 200, pricePerKwh: 2600 },
  { upToKwh: Infinity, pricePerKwh: 3100 },
]

export const WATER_PRICE_PER_M3 = 18000

/** Giới nghiêm: cổng đóng 23:00, mở 05:30 (dùng mốc 5 cho logic quét). */
export const CURFEW_HOUR = 23
export const CURFEW_OPEN_HOUR = 5
/** Đơn xin về muộn phải nộp trước 21:00 cùng ngày. */
export const LATE_REQUEST_CUTOFF_HOUR = 21

/** Khách thăm chỉ ở trong ngày, rời KTX trước 21:00, không lưu trú qua đêm. */
export const VISITOR_LATEST_HOUR = 21

export const MAX_RATING = 5
export const VAT_RATE = 0.08
export const ROOM_FEE_PER_STUDENT = 950000
export const WIFI_FEE_TOTAL = 120000
export const CLEANING_FEE_TOTAL = 60000
export const DEPOSIT_AMOUNT = 1000000
/** Giữ chỗ giường 15 phút rồi tự nhả nếu chưa thanh toán. */
export const BED_HOLD_MINUTES = 15

/** Luồng trạng thái phiếu báo hỏng — khớp TICKET_FLOW trong dorm-ops. */
export const TICKET_FLOW = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
}

/** SLA xử lý theo mức độ khẩn cấp (giờ). */
export const URGENCY_SLA_HOURS = { EMERGENCY: 2, NORMAL: 24 }

/** Điểm trừ rèn luyện theo hành vi — khớp CurfewPage.tsx. */
export const INFRACTION_POINTS = {
  CURFEW_VIOLATION: 10,
  UNAUTHORIZED_COOKING: 15,
  NOISE_AFTER_HOURS: 10,
  SMOKING_VAPING: 20,
  UNAUTHORIZED_GUEST: 25,
  HIGH_POWER_APPLIANCE: 15,
  OTHER: 5,
}

export const INFRACTION_TITLES = {
  CURFEW_VIOLATION: "Vi phạm giờ giới nghiêm 23:00 không phép",
  UNAUTHORIZED_COOKING: "Nấu ăn sai quy định trong phòng",
  NOISE_AFTER_HOURS: "Gây mất trật tự, ồn ào sau 22:30",
  SMOKING_VAPING: "Hút thuốc lá / thuốc lá điện tử trong buồng phòng",
  UNAUTHORIZED_GUEST: "Đưa người lạ vào phòng qua đêm không đăng ký",
  HIGH_POWER_APPLIANCE: "Sử dụng thiết bị điện công suất lớn trái phép",
  OTHER: "Vi phạm nội quy khác",
}

/** Điểm rèn luyện: 100 gốc, trừ >20 cảnh cáo, trừ >30 đình chỉ kỳ sau. */
export const DEMERIT_INITIAL = 100
export const DEMERIT_WARNING_AT = 20
export const DEMERIT_SUSPEND_AT = 30

/** Mô hình không gian 1:4:6. */
export const ROOM_LAYOUT = {
  compartmentsPerRoom: 4,
  bedsPerCompartment: 6,
  bedsPerRoom: 24,
}

export const ROLES = ["student", "manager", "technician", "admin"]

/** Chuẩn hóa role: db seed ghi HOA, frontend dùng thường. */
export function normalizeRole(role) {
  return String(role || "").trim().toLowerCase()
}

/** Cấu hình công khai trả cho frontend qua GET /api/config. */
export function publicConfig() {
  return {
    electricityTiers: ELECTRICITY_TIERS.map((t) => ({
      upToKwh: t.upToKwh === Infinity ? null : t.upToKwh,
      pricePerKwh: t.pricePerKwh,
    })),
    waterPricePerM3: WATER_PRICE_PER_M3,
    curfewHour: CURFEW_HOUR,
    curfewOpenHour: CURFEW_OPEN_HOUR,
    lateRequestCutoffHour: LATE_REQUEST_CUTOFF_HOUR,
    visitorLatestHour: VISITOR_LATEST_HOUR,
    maxRating: MAX_RATING,
    vatRate: VAT_RATE,
    roomFeePerStudent: ROOM_FEE_PER_STUDENT,
    wifiFeeTotal: WIFI_FEE_TOTAL,
    cleaningFeeTotal: CLEANING_FEE_TOTAL,
    depositAmount: DEPOSIT_AMOUNT,
    bedHoldMinutes: BED_HOLD_MINUTES,
    urgencySlaHours: URGENCY_SLA_HOURS,
    roomLayout: ROOM_LAYOUT,
  }
}
