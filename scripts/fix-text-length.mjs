/**
 * Rút ngắn các chuỗi tĩnh quá dài — chạy một lần: node scripts/fix-text-length.mjs
 *
 * Mục đích: đưa mọi nhãn/chú thích tĩnh về dưới ngưỡng một dòng, để không bị
 * cắt bằng dấu ba chấm. Danh sách thay thế được ghi tường minh bên dưới (không
 * đoán mò) nên chạy lại nhiều lần vẫn an toàn: nếu chuỗi cũ không còn, script
 * báo bỏ qua thay vì sửa bừa.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()

/** [đường dẫn tương đối, chuỗi gốc, chuỗi thay thế] */
const REPLACEMENTS = [
  [
    "src/pages/billing/BillingPage.tsx",
    "Chụp rõ mặt số công tơ. OCR gợi ý số đọc, kỹ thuật viên xác nhận lại.",
    "Chụp rõ mặt số công tơ để OCR gợi ý số đọc.",
  ],
  [
    "src/pages/booking/BookingPage.tsx",
    "Tiêu âm cao cấp, rèm che kháng khuẩn từng giường, khóa số thông minh.",
    "Tiêu âm cao cấp, rèm kháng khuẩn từng giường, khóa số.",
  ],
  [
    "src/pages/curfew/CurfewPage.tsx",
    "ngày vắng mặt. Nộp sau 21:00 hệ thống sẽ gắn cờ nộp muộn và có thể bị từ chối.",
    "ngày vắng mặt. Nộp sau 21:00 sẽ bị gắn cờ nộp muộn.",
  ],
  [
    "src/pages/maintenance/MaintenancePage.tsx",
    "Mô tả cụ thể hiện trạng hư hỏng, vị trí hoặc dấu hiệu bất thường...",
    "Mô tả hiện trạng hư hỏng, vị trí hoặc dấu hiệu bất thường...",
  ],
  [
    "src/pages/maintenance/MaintenancePage.tsx",
    "JPG/PNG/WebP, mỗi ảnh ≤ 5MB, tối đa 5 ảnh. Ảnh được lưu kèm phiếu.",
    "JPG/PNG/WebP, mỗi ảnh ≤ 5MB, tối đa 5 ảnh, lưu kèm phiếu.",
  ],
  [
    "src/pages/maintenance/MaintenancePage.tsx",
    "Chụp rõ hạng mục đã sửa. JPG/PNG/WebP, mỗi ảnh ≤ 5MB, tối đa 5 ảnh.",
    "Chụp rõ hạng mục đã sửa. Tối đa 5 ảnh JPG/PNG/WebP ≤ 5MB.",
  ],
  [
    "src/pages/stubs/CurfewStubPage.tsx",
    "Phân hệ đơn về muộn và quét thẻ cổng 23:00 đang được hoàn thiện.",
    "Đơn về muộn và quét thẻ cổng 23:00 đang được hoàn thiện.",
  ],
  [
    "src/pages/stubs/MaintenanceStubPage.tsx",
    "Phân hệ phiếu báo hỏng và điều phối kỹ thuật đang được hoàn thiện.",
    "Phiếu báo hỏng và điều phối kỹ thuật đang được hoàn thiện.",
  ],
  [
    "src/pages/stubs/ManagerDashboardStubPage.tsx",
    "Phân hệ dashboard công suất phòng và báo cáo đang được hoàn thiện.",
    "Dashboard công suất phòng và báo cáo đang được hoàn thiện.",
  ],
  [
    "src/pages/stubs/BillingStubPage.tsx",
    "Phân hệ hóa đơn điện nước và đối soát công tơ đang được hoàn thiện.",
    "Hóa đơn điện nước và đối soát công tơ đang được hoàn thiện.",
  ],
  [
    "src/pages/stubs/BookingStubPage.tsx",
    "Phân hệ đăng ký giường và hợp đồng lưu trú đang được hoàn thiện.",
    "Đăng ký giường và hợp đồng lưu trú đang được hoàn thiện.",
  ],
]

let changed = 0
let skipped = 0

for (const [rel, from, to] of REPLACEMENTS) {
  const file = path.join(ROOT, rel)
  if (!fs.existsSync(file)) {
    console.log(`bỏ qua (không có file): ${rel}`)
    skipped++
    continue
  }
  const src = fs.readFileSync(file, "utf8")
  if (!src.includes(from)) {
    console.log(`bỏ qua (đã đổi hoặc không khớp): ${rel}`)
    skipped++
    continue
  }
  fs.writeFileSync(file, src.replace(from, to))
  console.log(`đã rút ngắn: ${rel} (${from.length} → ${to.length} ký tự)`)
  changed++
}

console.log(`\n${changed} tệp đã sửa, ${skipped} bỏ qua.`)
