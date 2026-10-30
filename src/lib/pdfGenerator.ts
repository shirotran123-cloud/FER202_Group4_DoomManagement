import jsPDF from "jspdf"

export interface ContractData {
  contractId: string
  studentName: string
  mssv: string
  bedCode: string
  createdAt: string
}

export interface StudentInvoiceData {
  invoiceCode?: string
  period: string // "Tháng 09/2026"
  dateRange?: string // "01/09/2026 – 30/09/2026"
  issueDate?: string // "30/09/2026"
  dueDate?: string // "05/10/2026"
  studentName: string
  studentId: string // "SE182049"
  citizenId?: string
  phone?: string
  email?: string
  building: string
  room: string
  bedCode: string
  numStudentsInRoom: number

  // Electricity
  elecOld: number
  elecNew: number
  deltaElec: number
  elecRate: number
  elecCost: number

  // Water
  waterOld: number
  waterNew: number
  deltaWater: number
  waterRate: number
  waterCost: number

  // Totals
  subtotal: number
  vatCost: number
  totalRoomBill: number
  perStudentAmount: number
  hasPaid: boolean
}

export interface PaymentReceiptData {
  receiptCode?: string
  month: string
  amount: string
  date: string
  studentName: string
  studentId: string
  room: string
  bedCode: string
  building: string
}

export interface BuildingUtilityReportData {
  month: string
  building: string
  rooms: Array<{
    room: string
    elec: number
    water: number
    hasPhotos: boolean
    status: string
  }>
  managerName?: string
}

export interface StudentContractData {
  contractCode?: string
  studentName: string
  studentId: string
  citizenId?: string
  dob?: string
  hometown?: string
  phone?: string
  email?: string
  major?: string
  building: string
  room: string
  compartment: string
  bedCode: string
  semester: string
  startDate: string
  endDate: string
  depositAmount: number
  rentFeePerMonth: number
  totalRentFee: number
  parentName?: string
  parentPhone?: string
}

/**
 * Converts a Vietnamese currency number to Vietnamese words
 */
export function numberToVietnameseWords(n: number): string {
  if (!n || n <= 0) return "Không đồng"

  const defaultUnits = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ"]
  const numbers = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]

  function readGroup(group: string): string {
    const [h, t, u] = group.split("").map(Number)
    let res = ""

    // Hundred
    res += `${numbers[h]} trăm `

    // Ten
    if (t === 0 && u === 0) return res.trim()
    if (t === 0) res += `lẻ `
    else if (t === 1) res += `mười `
    else res += `${numbers[t]} mươi `

    // Unit
    if (t > 1 && u === 1) res += `mốt`
    else if (t > 0 && u === 5) res += `lăm`
    else if (u > 0) res += `${numbers[u]}`

    return res.trim()
  }

  const str = Math.floor(n).toString()
  const groups: string[] = []
  for (let i = str.length; i > 0; i -= 3) {
    groups.unshift(str.substring(Math.max(0, i - 3), i).padStart(3, "0"))
  }

  let result = ""
  for (let i = 0; i < groups.length; i++) {
    const groupNum = parseInt(groups[i], 10)
    if (groupNum === 0) continue

    const groupText = readGroup(groups[i])
    const unitText = defaultUnits[groups.length - 1 - i]
    result += `${groupText} ${unitText} `
  }

  result = result.trim()
  if (!result) return "Không đồng"

  // Capitalize first letter and add "đồng"
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng"
}

/**
 * Original contract PDF generator
 */
export const generateContractPDF = (data: ContractData) => {
  const doc = new jsPDF()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("DORMITORY RENTAL CONTRACT", 105, 20, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)

  doc.text(`Contract ID: ${data.contractId}`, 20, 40)
  doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 20, 50)

  doc.text("Between:", 20, 70)
  doc.setFont("helvetica", "bold")
  doc.text("FPT University Dormitory Management", 20, 80)

  doc.setFont("helvetica", "normal")
  doc.text("And Student:", 20, 100)
  doc.text(`Full Name: ${data.studentName}`, 20, 110)
  doc.text(`Student ID (MSSV): ${data.mssv}`, 20, 120)

  doc.text("Agrees to rent the following bed:", 20, 140)
  doc.setFont("helvetica", "bold")
  doc.text(`Bed Code: ${data.bedCode}`, 20, 150)

  doc.setFont("helvetica", "normal")
  doc.text("By signing this contract, the student agrees to the dormitory's rules", 20, 170)
  doc.text("and regulations. Accommodation fee for the term has been paid in full.", 20, 180)

  doc.text("Management Signature", 40, 220)
  doc.text("Student Signature", 140, 220)

  doc.save(`Contract_${data.mssv}_${data.bedCode}.pdf`)
}

/**
 * Generates and downloads the exact Student Utility e-Invoice PDF currently displayed on screen.
 * Uses high-resolution Canvas rendering to guarantee 100% accurate Vietnamese diacritics and styling.
 */
export function generateStudentInvoicePDF(data: StudentInvoiceData) {
  // A4 dimensions at 150 DPI: 1240 x 1754 px
  const width = 1240
  const height = 1754

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Fill White Background
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, width, height)

  // Outer border
  ctx.strokeStyle = "#E2E8F0"
  ctx.lineWidth = 2
  ctx.strokeRect(30, 30, width - 60, height - 60)

  // Top Accent Gradient Bar
  const grad = ctx.createLinearGradient(30, 30, width - 30, 30)
  grad.addColorStop(0, "#EA580C") // FPT Orange
  grad.addColorStop(0.5, "#2563EB") // Blue
  grad.addColorStop(1, "#059669") // Emerald
  ctx.fillStyle = grad
  ctx.fillRect(30, 30, width - 60, 8)

  // Header Left: FPT University Branding
  ctx.fillStyle = "#EA580C"
  ctx.font = "bold 26px Arial, sans-serif"
  ctx.fillText("TRƯỜNG ĐẠI HỌC FPT", 60, 80)

  ctx.fillStyle = "#1E3A8A"
  ctx.font = "bold 16px Arial, sans-serif"
  ctx.fillText("BAN QUẢN LÝ KÝ TÚC XÁ (DOMANAGE DMS)", 60, 108)

  ctx.fillStyle = "#64748B"
  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillText("Khu Đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng", 60, 132)
  ctx.fillText("Hotline KTX: (0236) 730 0999 • Email: ktx@fpt.edu.vn", 60, 154)

  // Header Right: Invoice Details Box
  const invBoxX = 820
  const invBoxY = 55
  const invBoxW = 360
  const invBoxH = 110

  ctx.fillStyle = "#F8FAFC"
  ctx.fillRect(invBoxX, invBoxY, invBoxW, invBoxH)
  ctx.strokeStyle = "#CBD5E1"
  ctx.lineWidth = 1
  ctx.strokeRect(invBoxX, invBoxY, invBoxW, invBoxH)

  const code = data.invoiceCode || `INV-2026-09-${data.room}-${data.studentId}`
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText("HÓA ĐƠN TIỀN ĐIỆN NƯỚC", invBoxX + 16, invBoxY + 28)

  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`Mã hóa đơn: `, invBoxX + 16, invBoxY + 52)
  ctx.fillStyle = "#2563EB"
  ctx.font = "bold 12px 'Courier New', monospace"
  ctx.fillText(code, invBoxX + 95, invBoxY + 52)

  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`Kỳ hóa đơn: ${data.period}`, invBoxX + 16, invBoxY + 74)
  ctx.fillText(`Ngày phát hành: ${data.issueDate || "30/09/2026"}`, invBoxX + 16, invBoxY + 96)

  // Divider
  ctx.strokeStyle = "#E2E8F0"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(60, 185)
  ctx.lineTo(width - 60, 185)
  ctx.stroke()

  // Big Document Title
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 26px Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("GIẤY BÁO TIỀN ĐIỆN NƯỚC & DỊCH VỤ SINH VIÊN", width / 2, 230)

  ctx.fillStyle = "#64748B"
  ctx.font = "normal 14px Arial, sans-serif"
  ctx.fillText(
    `Chu kỳ sử dụng: ${data.dateRange || "01/09/2026 – 30/09/2026"} • Hạn thanh toán: ${data.dueDate || "05/10/2026"}`,
    width / 2,
    258
  )

  // Status Badge
  const statusW = 280
  const statusH = 34
  const statusX = (width - statusW) / 2
  const statusY = 278

  if (data.hasPaid) {
    ctx.fillStyle = "#DCFCE7"
    ctx.fillRect(statusX, statusY, statusW, statusH)
    ctx.strokeStyle = "#22C55E"
    ctx.strokeRect(statusX, statusY, statusW, statusH)
    ctx.fillStyle = "#15803D"
    ctx.font = "bold 13px Arial, sans-serif"
    ctx.fillText("✓ ĐÃ THANH TOÁN TOÀN BỘ (PAID)", width / 2, statusY + 22)
  } else {
    ctx.fillStyle = "#EFF6FF"
    ctx.fillRect(statusX, statusY, statusW, statusH)
    ctx.strokeStyle = "#3B82F6"
    ctx.strokeRect(statusX, statusY, statusW, statusH)
    ctx.fillStyle = "#1D4ED8"
    ctx.font = "bold 13px Arial, sans-serif"
    ctx.fillText("CHỜ THANH TOÁN (HẠN NỘP: 05/10/2026)", width / 2, statusY + 22)
  }

  ctx.textAlign = "left"

  // 2 Info Columns (Student Info + Dorm Info)
  const infoY = 340
  const colW = (width - 150) / 2

  // Col 1: Student Details
  ctx.fillStyle = "#F8FAFC"
  ctx.fillRect(60, infoY, colW, 140)
  ctx.strokeStyle = "#E2E8F0"
  ctx.strokeRect(60, infoY, colW, 140)

  ctx.fillStyle = "#1E3A8A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("THÔNG TIN SINH VIÊN", 80, infoY + 26)

  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`Họ và tên: `, 80, infoY + 54)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText(data.studentName, 170, infoY + 54)

  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`Mã số SV (MSSV): `, 80, infoY + 80)
  ctx.fillStyle = "#2563EB"
  ctx.font = "bold 13px 'Courier New', monospace"
  ctx.fillText(data.studentId, 205, infoY + 80)

  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`CCCD: ${data.citizenId || "079204018293"}`, 80, infoY + 106)
  ctx.fillText(`Email: ${data.email || `${data.studentId.toLowerCase()}@fpt.edu.vn`}`, 80, infoY + 128)

  // Col 2: Dorm Info
  const col2X = 60 + colW + 30
  ctx.fillStyle = "#F8FAFC"
  ctx.fillRect(col2X, infoY, colW, 140)
  ctx.strokeStyle = "#E2E8F0"
  ctx.strokeRect(col2X, infoY, colW, 140)

  ctx.fillStyle = "#1E3A8A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("ĐỊA ĐIỂM LƯU TRÚ KÝ TÚC XÁ", col2X + 20, infoY + 26)

  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`Tòa nhà: `, col2X + 20, infoY + 54)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText(data.building, col2X + 90, infoY + 54)

  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`Phòng ở: `, col2X + 20, infoY + 80)
  ctx.fillStyle = "#EA580C"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText(`Phòng ${data.room}`, col2X + 90, infoY + 80)

  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`Mã giường cá nhân: `, col2X + 20, infoY + 106)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px 'Courier New', monospace"
  ctx.fillText(data.bedCode, col2X + 160, infoY + 106)

  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`Số SV cùng chia phòng: ${data.numStudentsInRoom} sinh viên`, col2X + 20, infoY + 128)

  // Section Header: Table Breakdown
  const tableY = 515
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 15px Arial, sans-serif"
  ctx.fillText("BẢNG KÊ CHỈ SỐ CÔNG TƠ & TỔNG CHI PHÍ PHÒNG", 60, tableY)

  // Table Drawing
  const tHeaderY = tableY + 15
  const tH = 38
  const tW = width - 120

  // Header row
  ctx.fillStyle = "#1E293B"
  ctx.fillRect(60, tHeaderY, tW, tH)

  ctx.fillStyle = "#FFFFFF"
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("DỊCH VỤ", 80, tHeaderY + 24)
  ctx.fillText("CHỈ SỐ CŨ → MỚI", 330, tHeaderY + 24)
  ctx.fillText("TIÊU THỤ", 570, tHeaderY + 24)
  ctx.fillText("ĐƠN GIÁ", 760, tHeaderY + 24)
  ctx.textAlign = "right"
  ctx.fillText("THÀNH TIỀN (VNĐ)", 60 + tW - 20, tHeaderY + 24)
  ctx.textAlign = "left"

  // Row 1: Electricity
  let rowY = tHeaderY + tH
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(60, rowY, tW, 44)
  ctx.strokeStyle = "#E2E8F0"
  ctx.strokeRect(60, rowY, tW, 44)

  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("Điện Sinh Hoạt", 80, rowY + 28)
  ctx.font = "normal 12px 'Courier New', monospace"
  ctx.fillStyle = "#475569"
  ctx.fillText(`${data.elecOld.toLocaleString("vi-VN")} → ${data.elecNew.toLocaleString("vi-VN")} kWh`, 330, rowY + 28)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText(`${data.deltaElec.toLocaleString("vi-VN")} kWh`, 570, rowY + 28)
  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`${data.elecRate.toLocaleString("vi-VN")} đ/kWh`, 760, rowY + 28)
  ctx.textAlign = "right"
  ctx.font = "bold 13px 'Courier New', monospace"
  ctx.fillStyle = "#0F172A"
  ctx.fillText(`${data.elecCost.toLocaleString("vi-VN")} đ`, 60 + tW - 20, rowY + 28)
  ctx.textAlign = "left"

  // Row 2: Water
  rowY += 44
  ctx.fillStyle = "#F8FAFC"
  ctx.fillRect(60, rowY, tW, 44)
  ctx.strokeStyle = "#E2E8F0"
  ctx.strokeRect(60, rowY, tW, 44)

  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("Nước Sạch Sinh Hoạt", 80, rowY + 28)
  ctx.font = "normal 12px 'Courier New', monospace"
  ctx.fillStyle = "#475569"
  ctx.fillText(`${data.waterOld} → ${data.waterNew} m³`, 330, rowY + 28)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText(`${data.deltaWater} m³`, 570, rowY + 28)
  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`${data.waterRate.toLocaleString("vi-VN")} đ/m³`, 760, rowY + 28)
  ctx.textAlign = "right"
  ctx.font = "bold 13px 'Courier New', monospace"
  ctx.fillStyle = "#0F172A"
  ctx.fillText(`${data.waterCost.toLocaleString("vi-VN")} đ`, 60 + tW - 20, rowY + 28)
  ctx.textAlign = "left"

  // Row 3: VAT
  rowY += 44
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(60, rowY, tW, 44)
  ctx.strokeStyle = "#E2E8F0"
  ctx.strokeRect(60, rowY, tW, 44)

  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("Thuế Giá Trị Gia Tăng (VAT)", 80, rowY + 28)
  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillStyle = "#64748B"
  ctx.fillText("Quy chuẩn thuế hiện hành", 330, rowY + 28)
  ctx.fillText("-", 570, rowY + 28)
  ctx.fillText("10%", 760, rowY + 28)
  ctx.textAlign = "right"
  ctx.font = "bold 13px 'Courier New', monospace"
  ctx.fillStyle = "#0F172A"
  ctx.fillText(`${data.vatCost.toLocaleString("vi-VN")} đ`, 60 + tW - 20, rowY + 28)
  ctx.textAlign = "left"

  // Row 4: Total Room Bill
  rowY += 44
  ctx.fillStyle = "#F1F5F9"
  ctx.fillRect(60, rowY, tW, 48)
  ctx.strokeStyle = "#CBD5E1"
  ctx.strokeRect(60, rowY, tW, 48)

  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText(`Tổng chi phí toàn phòng (${data.room}):`, 80, rowY + 30)

  ctx.textAlign = "right"
  ctx.fillStyle = "#2563EB"
  ctx.font = "bold 18px 'Courier New', monospace"
  ctx.fillText(`₫${data.totalRoomBill.toLocaleString("vi-VN")}`, 60 + tW - 20, rowY + 31)
  ctx.textAlign = "left"

  // Allocation Banner (Highlighted Student Amount)
  const allocY = rowY + 70
  const allocH = 110

  ctx.fillStyle = "#EFF6FF"
  ctx.fillRect(60, allocY, tW, allocH)
  ctx.strokeStyle = "#93C5FD"
  ctx.lineWidth = 1.5
  ctx.strokeRect(60, allocY, tW, allocH)

  ctx.fillStyle = "#1E40AF"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText(
    `CƠ CHẾ PHÂN BỔ: Chia đều cho ${data.numStudentsInRoom} sinh viên đang lưu trú thực tế tại phòng ${data.room}`,
    85,
    allocY + 32
  )

  ctx.fillStyle = "#475569"
  ctx.font = "normal 13px Arial, sans-serif"
  ctx.fillText("SỐ TIỀN SINH VIÊN CẦN THANH TOÁN (NET DUE):", 85, allocY + 68)

  ctx.fillStyle = "#EA580C"
  ctx.font = "bold 26px 'Courier New', monospace"
  ctx.fillText(`₫${data.perStudentAmount.toLocaleString("vi-VN")}`, 465, allocY + 70)

  const words = numberToVietnameseWords(data.perStudentAmount)
  ctx.fillStyle = "#64748B"
  ctx.font = "italic 13px Arial, sans-serif"
  ctx.fillText(`(Bằng chữ: ${words})`, 85, allocY + 98)

  // Payment Instructions Box
  const payY = allocY + allocH + 25
  const payH = 145

  ctx.fillStyle = "#F8FAFC"
  ctx.fillRect(60, payY, tW, payH)
  ctx.strokeStyle = "#E2E8F0"
  ctx.strokeRect(60, payY, tW, payH)

  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("THÔNG TIN CHUYỂN KHOẢN THANH TOÁN VIETQR 24/7", 85, payY + 28)

  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText("• Ngân hàng thụ hưởng: ", 85, payY + 54)
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("TPBank (Ngân hàng TMCP Tiên Phong)", 230, payY + 54)

  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillText("• Số tài khoản: ", 85, payY + 78)
  ctx.font = "bold 13px 'Courier New', monospace"
  ctx.fillStyle = "#2563EB"
  ctx.fillText("0918 2391 024", 230, payY + 78)

  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText("• Tên chủ tài khoản: ", 85, payY + 102)
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("KY TUC XA FPT - TRUONG DAI HOC FPT", 230, payY + 102)

  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillText("• Nội dung chuyển khoản: ", 85, payY + 126)
  ctx.font = "bold 13px 'Courier New', monospace"
  ctx.fillStyle = "#EA580C"
  ctx.fillText(`DIENNUOC_${data.room}_${data.studentId}`, 230, payY + 126)

  // QR Mini box on right
  const qrX = 60 + tW - 135
  const qrY = payY + 12
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(qrX, qrY, 120, 120)
  ctx.strokeStyle = "#CBD5E1"
  ctx.strokeRect(qrX, qrY, 120, 120)

  // Simulated QR graphic
  ctx.fillStyle = "#0F172A"
  ctx.fillRect(qrX + 15, qrY + 15, 25, 25)
  ctx.fillRect(qrX + 80, qrY + 15, 25, 25)
  ctx.fillRect(qrX + 15, qrY + 80, 25, 25)
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(qrX + 20, qrY + 20, 15, 15)
  ctx.fillRect(qrX + 85, qrY + 20, 15, 15)
  ctx.fillRect(qrX + 20, qrY + 85, 15, 15)
  ctx.fillStyle = "#0F172A"
  ctx.fillRect(qrX + 24, qrY + 24, 7, 7)
  ctx.fillRect(qrX + 89, qrY + 24, 7, 7)
  ctx.fillRect(qrX + 24, qrY + 89, 7, 7)
  ctx.font = "bold 9px Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("VietQR 24/7", qrX + 60, qrY + 114)
  ctx.textAlign = "left"

  // Signatures Section
  const sigY = payY + payH + 45
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.textAlign = "center"

  ctx.fillText("NGƯỜI LẬP BIỂU", 220, sigY)
  ctx.font = "italic 11px Arial, sans-serif"
  ctx.fillStyle = "#64748B"
  ctx.fillText("(Ký, ghi rõ họ tên)", 220, sigY + 18)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("Đỗ Mạnh Hùng", 220, sigY + 85)
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText("Kỹ thuật viên Tòa A", 220, sigY + 102)

  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("TRƯỞNG BAN QUẢN LÝ KTX", width - 220, sigY)
  ctx.font = "italic 11px Arial, sans-serif"
  ctx.fillStyle = "#64748B"
  ctx.fillText("(Ký, đóng dấu)", width - 220, sigY + 18)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("Vũ Thành Nam", width - 220, sigY + 85)
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText("Trưởng ban KTX FPT", width - 220, sigY + 102)

  // Circular Stamp Graphic
  const stampX = width - 220
  const stampY = sigY + 55
  ctx.beginPath()
  ctx.arc(stampX, stampY, 44, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(220, 38, 38, 0.7)"
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(stampX, stampY, 36, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(220, 38, 38, 0.4)"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = "rgba(220, 38, 38, 0.85)"
  ctx.font = "bold 9px Arial, sans-serif"
  ctx.fillText("ĐẠI HỌC FPT", stampX, stampY - 14)
  ctx.fillText("BAN QUẢN LÝ KTX", stampX, stampY)
  ctx.fillText("★ ĐÃ KIỂM ĐỊNH ★", stampX, stampY + 14)

  // Footer
  ctx.textAlign = "center"
  ctx.fillStyle = "#94A3B8"
  ctx.font = "normal 10px Arial, sans-serif"
  ctx.fillText(
    "Hóa đơn điện tử e-Invoice trích xuất từ Hệ thống Quản lý Ký túc xá FPT University (DOMANAGE DMS).",
    width / 2,
    height - 52
  )
  ctx.fillText(
    "Mọi thắc mắc hoặc yêu cầu kiểm tra lại chỉ số vui lòng nộp đơn khiếu nại trên hệ thống trong vòng 48h.",
    width / 2,
    height - 38
  )

  // Convert Canvas to PDF
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF("p", "mm", "a4")
  pdf.addImage(imgData, "PNG", 0, 0, 210, 297)

  const filename = `Hoa_Don_Dien_Nuoc_${data.room}_${data.studentId}_T09_2026.pdf`
  pdf.save(filename)
}

/**
 * Generates and downloads payment receipt for past months from the student billing history table.
 */
export function generatePaymentReceiptPDF(data: PaymentReceiptData) {
  const width = 1240
  const height = 1754

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, width, height)

  // Outer border
  ctx.strokeStyle = "#CBD5E1"
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, width - 80, height - 80)

  // Header Bar
  ctx.fillStyle = "#059669"
  ctx.fillRect(40, 40, width - 80, 10)

  // Brand
  ctx.fillStyle = "#EA580C"
  ctx.font = "bold 26px Arial, sans-serif"
  ctx.fillText("TRƯỜNG ĐẠI HỌC FPT", 70, 95)

  ctx.fillStyle = "#1E3A8A"
  ctx.font = "bold 16px Arial, sans-serif"
  ctx.fillText("BAN QUẢN LÝ KÝ TÚC XÁ - PHÒNG TÀI CHÍNH KẾ TOÁN", 70, 122)

  // Title
  ctx.textAlign = "center"
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 28px Arial, sans-serif"
  ctx.fillText("BIÊN LAI ĐIỆN TỬ THU TIỀN ĐIỆN NƯỚC", width / 2, 220)

  ctx.fillStyle = "#059669"
  ctx.font = "bold 16px Arial, sans-serif"
  ctx.fillText(`KỲ HÓA ĐƠN: ${data.month.toUpperCase()}`, width / 2, 255)

  // Success Badge
  ctx.fillStyle = "#DCFCE7"
  ctx.fillRect((width - 320) / 2, 280, 320, 36)
  ctx.strokeStyle = "#16A34A"
  ctx.strokeRect((width - 320) / 2, 280, 320, 36)
  ctx.fillStyle = "#15803D"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText(`✓ ĐÃ XÁC NHẬN THANH TOÁN (${data.date})`, width / 2, 303)

  ctx.textAlign = "left"

  // Details Table
  const tableY = 360
  const tW = width - 160
  const tX = 80

  const items = [
    ["Mã biên lai:", data.receiptCode || `REC-${data.room}-${data.studentId}-${Date.now().toString().slice(-6)}`],
    ["Họ và tên sinh viên:", data.studentName],
    ["Mã số sinh viên (MSSV):", data.studentId],
    ["Tòa nhà & Phòng ở:", `${data.building} • Phòng ${data.room}`],
    ["Vị trí giường cá nhân:", data.bedCode],
    ["Khoản thanh toán:", `Tiền điện nước sinh hoạt ${data.month}`],
    ["Phương thức thanh toán:", "Chuyển khoản trực tuyến qua VietQR 24/7 (TPBank)"],
    ["Thời gian giao dịch thành công:", `${data.date} 14:32:18`],
    ["Số tiền đã thanh toán:", data.amount],
  ]

  items.forEach(([label, value], i) => {
    const rowY = tableY + i * 48
    ctx.fillStyle = i % 2 === 0 ? "#F8FAFC" : "#FFFFFF"
    ctx.fillRect(tX, rowY, tW, 48)
    ctx.strokeStyle = "#E2E8F0"
    ctx.strokeRect(tX, rowY, tW, 48)

    ctx.fillStyle = "#475569"
    ctx.font = "normal 14px Arial, sans-serif"
    ctx.fillText(label, tX + 24, rowY + 30)

    const isAmount = label.includes("Số tiền")
    ctx.fillStyle = isAmount ? "#15803D" : "#0F172A"
    ctx.font = isAmount ? "bold 18px 'Courier New', monospace" : "bold 14px Arial, sans-serif"
    ctx.fillText(value, tX + 380, rowY + 30)
  })

  // Signatures
  const sigY = tableY + items.length * 48 + 70
  ctx.textAlign = "center"
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText("NGƯỜI NỘP TIỀN", 250, sigY)
  ctx.font = "italic 12px Arial, sans-serif"
  ctx.fillStyle = "#64748B"
  ctx.fillText("(Sinh viên đã ký số)", 250, sigY + 20)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText(data.studentName, 250, sigY + 90)

  ctx.fillText("THỦ QUỸ / BAN QUẢN LÝ KTX", width - 250, sigY)
  ctx.font = "italic 12px Arial, sans-serif"
  ctx.fillStyle = "#64748B"
  ctx.fillText("(Đã đối soát hạch toán)", width - 250, sigY + 20)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText("Vũ Thành Nam", width - 250, sigY + 90)

  // Circular Stamp
  const stampX = width - 250
  const stampY = sigY + 55
  ctx.beginPath()
  ctx.arc(stampX, stampY, 44, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(22, 163, 74, 0.7)"
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.fillStyle = "rgba(22, 163, 74, 0.85)"
  ctx.font = "bold 9px Arial, sans-serif"
  ctx.fillText("ĐẠI HỌC FPT", stampX, stampY - 14)
  ctx.fillText("KTX ĐÃ THU TIỀN", stampX, stampY)
  ctx.fillText("★ ĐỐI SOÁT HỢP LỆ ★", stampX, stampY + 14)

  // Footer
  ctx.fillStyle = "#94A3B8"
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillText(
    "Biên lai điện tử hợp lệ theo quy chế thu phí Ký túc xá FPT University. Có giá trị chứng từ tài chính.",
    width / 2,
    height - 50
  )

  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF("p", "mm", "a4")
  pdf.addImage(imgData, "PNG", 0, 0, 210, 297)

  const filename = `Bien_Lai_Dien_Nuoc_${data.month.replace("/", "_")}_${data.studentId}.pdf`
  pdf.save(filename)
}

/**
 * Generates and downloads Building utility breakdown report for Managers.
 */
export function generateBuildingUtilityReportPDF(data: BuildingUtilityReportData) {
  const width = 1240
  const height = 1754

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, width, height)

  // Header Bar
  ctx.fillStyle = "#1E3A8A"
  ctx.fillRect(30, 30, width - 60, 8)

  ctx.fillStyle = "#EA580C"
  ctx.font = "bold 24px Arial, sans-serif"
  ctx.fillText("TRƯỜNG ĐẠI HỌC FPT - BAN QUẢN LÝ KÝ TÚC XÁ", 60, 75)

  ctx.textAlign = "center"
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 24px Arial, sans-serif"
  ctx.fillText(`BẢNG KÊ CHỐT SỐ ĐIỆN NƯỚC • ${data.building.toUpperCase()}`, width / 2, 130)

  ctx.fillStyle = "#64748B"
  ctx.font = "normal 14px Arial, sans-serif"
  ctx.fillText(`Kỳ báo cáo: ${data.month} • Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, width / 2, 158)

  ctx.textAlign = "left"

  // Table
  const startY = 195
  const tW = width - 120
  ctx.fillStyle = "#1E293B"
  ctx.fillRect(60, startY, tW, 36)

  ctx.fillStyle = "#FFFFFF"
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("STT", 80, startY + 23)
  ctx.fillText("PHÒNG", 140, startY + 23)
  ctx.fillText("CHỈ SỐ ĐIỆN (kWh)", 280, startY + 23)
  ctx.fillText("CHỈ SỐ NƯỚC (m³)", 480, startY + 23)
  ctx.fillText("ẢNH CÔNG TƠ", 680, startY + 23)
  ctx.fillText("TRẠNG THÁI", 880, startY + 23)

  data.rooms.forEach((r, idx) => {
    const rowY = startY + 36 + idx * 40
    ctx.fillStyle = idx % 2 === 0 ? "#F8FAFC" : "#FFFFFF"
    ctx.fillRect(60, rowY, tW, 40)
    ctx.strokeStyle = "#E2E8F0"
    ctx.strokeRect(60, rowY, tW, 40)

    ctx.fillStyle = "#64748B"
    ctx.font = "normal 12px Arial, sans-serif"
    ctx.fillText((idx + 1).toString(), 85, rowY + 25)

    ctx.fillStyle = "#0F172A"
    ctx.font = "bold 13px Arial, sans-serif"
    ctx.fillText(r.room, 140, rowY + 25)

    ctx.font = "bold 13px 'Courier New', monospace"
    ctx.fillText(r.elec.toLocaleString("vi-VN"), 280, rowY + 25)
    ctx.fillText(r.water.toLocaleString("vi-VN"), 480, rowY + 25)

    ctx.font = "normal 12px Arial, sans-serif"
    ctx.fillStyle = r.hasPhotos ? "#059669" : "#D97706"
    ctx.fillText(r.hasPhotos ? "Đã đối soát" : "Chưa có ảnh", 680, rowY + 25)

    ctx.fillStyle = "#2563EB"
    ctx.fillText(r.status, 880, rowY + 25)
  })

  // Convert to PDF
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF("p", "mm", "a4")
  pdf.addImage(imgData, "PNG", 0, 0, 210, 297)

  pdf.save(`Bang_Ke_Dien_Nuoc_${data.building.replace(/\s+/g, "_")}_${data.month.replace("/", "_")}.pdf`)
}

/**
 * Generates and downloads the Official Student Dormitory Rental Contract (E-Contract) PDF in Vietnamese.
 */
export function generateStudentRentalContractPDF(data: StudentContractData) {
  const width = 1240
  const height = 1754

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, width, height)

  // Outer border
  ctx.strokeStyle = "#CBD5E1"
  ctx.lineWidth = 1.5
  ctx.strokeRect(45, 45, width - 90, height - 90)

  // Top National Header
  ctx.textAlign = "center"
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", width / 2, 80)
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("Độc lập – Tự do – Hạnh phúc", width / 2, 102)

  ctx.beginPath()
  ctx.moveTo(width / 2 - 100, 114)
  ctx.lineTo(width / 2 + 100, 114)
  ctx.strokeStyle = "#0F172A"
  ctx.lineWidth = 1
  ctx.stroke()

  // School Header
  ctx.textAlign = "left"
  ctx.fillStyle = "#EA580C"
  ctx.font = "bold 15px Arial, sans-serif"
  ctx.fillText("TRƯỜNG ĐẠI HỌC FPT", 70, 80)
  ctx.fillStyle = "#1E3A8A"
  ctx.font = "bold 11px Arial, sans-serif"
  ctx.fillText("BAN QUẢN LÝ KÝ TÚC XÁ", 70, 100)

  // Contract Code Box Right
  const cCode = data.contractCode || `CTR-2026-${data.studentId}`
  ctx.textAlign = "right"
  ctx.fillStyle = "#64748B"
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillText(`Số HĐ: ${cCode}`, width - 70, 80)
  ctx.fillText(`Ngày ký: ${data.startDate}`, width - 70, 100)
  ctx.textAlign = "left"

  // Title
  ctx.textAlign = "center"
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 22px Arial, sans-serif"
  ctx.fillText("HỢP ĐỒNG THUÊ CHỖ Ở NỘI TRÚ KÝ TÚC XÁ", width / 2, 160)
  ctx.fillStyle = "#2563EB"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText(`(Áp dụng: ${data.semester})`, width / 2, 184)
  ctx.textAlign = "left"

  let curY = 220

  // Preamble
  ctx.fillStyle = "#334155"
  ctx.font = "italic 11px Arial, sans-serif"
  ctx.fillText(
    "- Căn cứ Quy chế Quản lý Sinh viên Nội trú Ký túc xá Trường Đại học FPT;",
    70,
    curY
  )
  curY += 20
  ctx.fillText(
    "- Căn cứ Đơn đề nghị đăng ký lưu trú và sự thống nhất của hai bên;",
    70,
    curY
  )
  curY += 28

  // BÊN A
  ctx.fillStyle = "#1E293B"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("BÊN CHO THUÊ (BÊN A): BAN QUẢN LÝ KÝ TÚC XÁ TRƯỜNG ĐẠI HỌC FPT", 70, curY)
  curY += 22
  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText("• Đại diện: Ông Vũ Thành Nam", 85, curY)
  ctx.fillText("• Chức vụ: Trưởng Ban Quản lý KTX", 450, curY)
  curY += 20
  ctx.fillText("• Địa chỉ: Khu Đô thị FPT City, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP. Đà Nẵng", 85, curY)
  curY += 20
  ctx.fillText("• Hotline: (0236) 730 0999 • Email: ktx@fpt.edu.vn", 85, curY)
  curY += 28

  // BÊN B
  ctx.fillStyle = "#1E293B"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("BÊN THUÊ (BÊN B - SINH VIÊN):", 70, curY)
  curY += 22
  ctx.font = "normal 12px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText(`• Họ và tên: ${data.studentName}`, 85, curY)
  ctx.fillText(`• Mã số sinh viên (MSSV): ${data.studentId}`, 450, curY)
  ctx.fillText(`• Số CCCD: ${data.citizenId || "079204001235"}`, 780, curY)
  curY += 20
  ctx.fillText(`• Quê quán: ${data.hometown || "Việt Nam"}`, 85, curY)
  ctx.fillText(`• Ngành học: ${data.major || "Kỹ thuật phần mềm"}`, 450, curY)
  ctx.fillText(`• Điện thoại: ${data.phone || "0912 345 678"}`, 780, curY)
  curY += 20
  ctx.fillText(`• Phụ huynh/Người bảo hộ: ${data.parentName || "Nguyễn Văn Hùng"} (${data.parentPhone || "0903 123 456"})`, 85, curY)
  curY += 32

  // ĐIỀU 1
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("ĐIỀU 1: VỊ TRÍ CHỖ Ở VÀ TRANG THIẾT BỊ BÀN GIAO", 70, curY)
  curY += 18
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText(
    `1.1. Bên A đồng ý bố trí cho Bên B một chỗ nằm nội trú cá nhân tại:`,
    85,
    curY
  )
  curY += 18
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillStyle = "#2563EB"
  ctx.fillText(
    `Tòa nhà: ${data.building} • Phòng: ${data.room} • ${data.compartment} • Mã giường: ${data.bedCode}`,
    100,
    curY
  )
  curY += 18
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText(
    "1.2. Trang thiết bị cá nhân kèm theo gồm: Giường đơn tiêu chuẩn, nệm, bàn học liền kệ sách, tủ sắt cá nhân có khóa.",
    85,
    curY
  )
  curY += 18
  ctx.fillText(
    "1.3. Thiết bị dùng chung trong phòng: Hệ thống điều hòa nhiệt độ Inverter, quạt trần, bình nước nóng, wifi 24/7.",
    85,
    curY
  )
  curY += 28

  // ĐIỀU 2
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("ĐIỀU 2: THỜI HẠN THUÊ VÀ NGHĨA VỤ TÀI CHÍNH", 70, curY)
  curY += 18
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText(
    `2.1. Thời hạn hợp đồng: Từ ngày ${data.startDate} đến hết ngày ${data.endDate} (${data.semester}).`,
    85,
    curY
  )
  curY += 18
  ctx.fillText(
    `2.2. Đơn giá phòng ở: ${(data.rentFeePerMonth || 950000).toLocaleString("vi-VN")} đ/tháng. Tổng phí học kỳ: ${(data.totalRentFee || 3800000).toLocaleString("vi-VN")} đ.`,
    85,
    curY
  )
  curY += 18
  ctx.fillText(
    `2.3. Tiền đặt cọc bảo đảm tài sản: ${(data.depositAmount || 1000000).toLocaleString("vi-VN")} đ (Hoàn trả khi thanh lý hợp đồng).`,
    85,
    curY
  )
  curY += 18
  ctx.fillText(
    "2.4. Tiền điện, nước sinh hoạt: Đo theo công tơ tổng của phòng và chia đều cho toàn bộ sinh viên đang ở thực tế hàng tháng.",
    85,
    curY
  )
  curY += 28

  // ĐIỀU 3
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("ĐIỀU 3: NỘI QUY KÝ TÚC XÁ VÀ NGHĨA VỤ CỦA SINH VIÊN", 70, curY)
  curY += 18
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText(
    "3.1. Tuân thủ nghiêm ngặt giờ giới nghiêm 23:00 hàng ngày. Mọi trường hợp về muộn phải xin phép online qua hệ thống.",
    85,
    curY
  )
  curY += 18
  ctx.fillText(
    "3.2. Không đun nấu trong phòng ngủ; không tàng trữ chất cấm, vũ khí, vật liệu dễ cháy nổ; không dẫn người lạ vào buồng ở.",
    85,
    curY
  )
  curY += 18
  ctx.fillText(
    "3.3. Giữ gìn vệ sinh chung, tắt điện nước khi rời phòng, tham gia tổng vệ sinh phòng ở định kỳ theo phân công.",
    85,
    curY
  )
  curY += 28

  // ĐIỀU 4
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 12px Arial, sans-serif"
  ctx.fillText("ĐIỀU 4: ĐIỀU KHOẢN THI HÀNH VÀ HIỆU LỰC", 70, curY)
  curY += 18
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#334155"
  ctx.fillText(
    "4.1. Hợp đồng điện tử có giá trị pháp lý đầy đủ và được lưu trữ trên Cơ sở dữ liệu Hệ thống DMS.",
    85,
    curY
  )
  curY += 18
  ctx.fillText(
    "4.2. Hai bên cam kết thực hiện đúng các điều khoản nêu trên. Hợp đồng có hiệu lực kể từ ngày ký.",
    85,
    curY
  )

  // Signatures
  const sigY = curY + 60
  ctx.textAlign = "center"
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"

  ctx.fillText("ĐẠI DIỆN BÊN B (SINH VIÊN)", 260, sigY)
  ctx.font = "italic 11px Arial, sans-serif"
  ctx.fillStyle = "#64748B"
  ctx.fillText("(Ký số xác nhận điện tử)", 260, sigY + 18)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText(data.studentName, 260, sigY + 95)
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText(`MSSV: ${data.studentId}`, 260, sigY + 115)

  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 13px Arial, sans-serif"
  ctx.fillText("ĐẠI DIỆN BÊN A (TRƯỞNG BAN QL KTX)", width - 260, sigY)
  ctx.font = "italic 11px Arial, sans-serif"
  ctx.fillStyle = "#64748B"
  ctx.fillText("(Ký tên & đóng dấu)", width - 260, sigY + 18)
  ctx.fillStyle = "#0F172A"
  ctx.font = "bold 14px Arial, sans-serif"
  ctx.fillText("Vũ Thành Nam", width - 260, sigY + 95)
  ctx.font = "normal 11px Arial, sans-serif"
  ctx.fillStyle = "#475569"
  ctx.fillText("Trưởng ban KTX FPT University", width - 260, sigY + 115)

  // Circular Stamp Graphic
  const stampX = width - 260
  const stampY = sigY + 65
  ctx.beginPath()
  ctx.arc(stampX, stampY, 48, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(220, 38, 38, 0.75)"
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(stampX, stampY, 40, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(220, 38, 38, 0.45)"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = "rgba(220, 38, 38, 0.9)"
  ctx.font = "bold 10px Arial, sans-serif"
  ctx.fillText("TRƯỜNG ĐẠI HỌC FPT", stampX, stampY - 16)
  ctx.fillText("BAN QUẢN LÝ KÝ TÚC XÁ", stampX, stampY)
  ctx.fillText("★ ĐÃ PHÊ DUYỆT ★", stampX, stampY + 16)

  // Footer
  ctx.textAlign = "center"
  ctx.fillStyle = "#94A3B8"
  ctx.font = "normal 10px Arial, sans-serif"
  ctx.fillText(
    "Hợp đồng điện tử được lưu trữ an toàn trên Hệ thống Quản lý Ký túc xá FPT University (DOMANAGE DMS).",
    width / 2,
    height - 45
  )

  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF("p", "mm", "a4")
  pdf.addImage(imgData, "PNG", 0, 0, 210, 297)

  const filename = `Hop_Dong_Luu_Tru_KTX_${data.room}_${data.studentId}.pdf`
  pdf.save(filename)
}

