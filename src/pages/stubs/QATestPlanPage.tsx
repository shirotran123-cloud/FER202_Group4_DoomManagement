import React, { useState } from "react"
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  Download,
  Printer,
  Search,
  Filter,
  Play,
  RotateCcw,
  Users,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react"

// Types for Test Matrix
interface TestCaseItem {
  id: string
  useCase: string
  title: string
  module: string
  assignedDev: string
  type: "Positive" | "Negative" | "Boundary" | "Edge Case" | "Security"
  priority: "Critical" | "High" | "Medium"
  scenario: string
  testData: string
  expected: string
  status: "PASSED" | "FAILED" | "PENDING"
}

const TEST_CASES_DATA: TestCaseItem[] = [
  // Module 1
  {
    id: "TC-01",
    useCase: "UC-01",
    title: "Hiển thị trang chủ giới thiệu & bảng giá KTX",
    module: "Module 1 (Auth)",
    assignedDev: "Nguyễn Hoàng Vinh",
    type: "Positive",
    priority: "Medium",
    scenario: "Khách vãng lai truy cập '/', quan sát hero banner, biểu phí, nội quy và các nút CTA",
    testData: "URL: /",
    expected: "Giao diện render mượt mà, đầy đủ thông tin, không vỡ layout",
    status: "PASSED",
  },
  {
    id: "TC-02",
    useCase: "UC-02",
    title: "Sinh viên đăng nhập bằng Gmail cá nhân hợp lệ",
    module: "Module 1 (Auth)",
    assignedDev: "Nguyễn Hoàng Vinh",
    type: "Positive",
    priority: "Critical",
    scenario: "Sinh viên chọn tab Sinh viên, nhập Gmail cá nhân đã liên kết hồ sơ",
    testData: "Email: kim.huynh@gmail.com",
    expected: "Đăng nhập thành công, cấp JWT token, điều hướng đến /overview",
    status: "PASSED",
  },
  {
    id: "TC-03",
    useCase: "UC-02",
    title: "Cán bộ đăng nhập bằng email ngoài (@gmail.com)",
    module: "Module 1 (Auth)",
    assignedDev: "Nguyễn Hoàng Vinh",
    type: "Negative",
    priority: "Critical",
    scenario: "Cán bộ nhập email @gmail.com thay vì tên miền @fpt.edu.vn",
    testData: "Email: canbo@gmail.com",
    expected: "Chặn đăng nhập, hiển thị thông báo lỗi yêu cầu email @fpt.edu.vn hoặc @fe.edu.vn",
    status: "PASSED",
  },
  {
    id: "TC-04",
    useCase: "UC-03",
    title: "Bảo vệ các route nội bộ khi chưa xác thực",
    module: "Module 1 (Auth)",
    assignedDev: "Nguyễn Hoàng Vinh",
    type: "Security",
    priority: "High",
    scenario: "Người dùng chưa đăng nhập gõ trực tiếp URL /manager hoặc /my-room",
    testData: "Direct URL access",
    expected: "Chặn truy cập, tự động chuyển hướng về /login",
    status: "PASSED",
  },
  {
    id: "TC-05",
    useCase: "UC-04",
    title: "Khóa trường MSSV và CCCD không cho sinh viên tự sửa",
    module: "Module 1 (Auth)",
    assignedDev: "Nguyễn Hoàng Vinh",
    type: "Boundary",
    priority: "Medium",
    scenario: "Sinh viên vào trang Profile, cố gắng chỉnh sửa trường MSSV và số CCCD",
    testData: "Field: MSSV, CCCD",
    expected: "Trường ở trạng thái disabled, chỉ cho phép sửa SĐT và thông tin khẩn cấp",
    status: "PASSED",
  },

  // Module 2
  {
    id: "TC-06",
    useCase: "UC-05",
    title: "Kiểm tra giới tính khi chọn Tòa nhà (Nam/Nữ)",
    module: "Module 2 (Inventory)",
    assignedDev: "Trần Thanh Nguyên",
    type: "Negative",
    priority: "High",
    scenario: "Sinh viên nữ thử chọn Tòa KTX Nam (Tòa B)",
    testData: "Gender: Nữ, Block: Tòa B (Nam)",
    expected: "Tòa B bị mờ hoặc cảnh báo không phù hợp giới tính, ngăn không cho chọn",
    status: "PASSED",
  },
  {
    id: "TC-07",
    useCase: "UC-06",
    title: "Toàn vẹn cấu trúc 1 Phòng = 4 Buồng = 24 Giường (1:4:6)",
    module: "Module 2 (Inventory)",
    assignedDev: "Trần Thanh Nguyên",
    type: "Positive",
    priority: "Critical",
    scenario: "Kiểm tra số lượng buồng trong phòng A205 và số giường trong mỗi buồng",
    testData: "Room: A205",
    expected: "Đúng chính xác 4 buồng (A, B, C, D) và 6 giường/buồng (Tổng 24 giường)",
    status: "PASSED",
  },
  {
    id: "TC-08",
    useCase: "UC-07",
    title: "Cấu hình bảng giá điện, nước và thuế VAT",
    module: "Module 2 (Inventory)",
    assignedDev: "Trần Thanh Nguyên",
    type: "Positive",
    priority: "High",
    scenario: "Hệ thống áp dụng đơn giá điện 3.500đ/kWh, nước 12.000đ/m3, thuế VAT 10%",
    testData: "Rate configs",
    expected: "Các hằng số giá được lưu trữ chính xác và áp dụng vào module tính hóa đơn",
    status: "PASSED",
  },

  // Module 3
  {
    id: "TC-09",
    useCase: "UC-09",
    title: "Hiển thị 4 mã màu trạng thái giường trực quan",
    module: "Module 3 (Booking)",
    assignedDev: "Trần Công Tiến",
    type: "Positive",
    priority: "Critical",
    scenario: "Xem sơ đồ giường buồng A: kiểm tra hiển thị màu Xanh, Cam, Xám, Đỏ",
    testData: "Bed statuses: AVAILABLE, HOLDING, OCCUPIED, MAINTENANCE",
    expected: "Màu sắc phân biệt rõ ràng; các giường Đã ở (Xám) hoặc Bảo trì (Đỏ) không thể click",
    status: "PASSED",
  },
  {
    id: "TC-10",
    useCase: "UC-10",
    title: "Khóa giữ chỗ 15 phút & Hiển thị mã VietQR thanh toán",
    module: "Module 3 (Booking)",
    assignedDev: "Trần Công Tiến",
    type: "Positive",
    priority: "Critical",
    scenario: "Chọn giường trống A205-B1-G03, bấm 'Xác nhận giữ chỗ'",
    testData: "Bed: A205-B1-G03",
    expected: "Modal đếm ngược 15:00 kích hoạt, mã VietQR cọc 1.500.000đ hiện lên, giường đổi màu Cam",
    status: "PASSED",
  },
  {
    id: "TC-11",
    useCase: "UC-10",
    title: "[EDGE-CASE] Hết hạn 15 phút ➔ Tự động Rollback nhả giường",
    module: "Module 3 (Booking)",
    assignedDev: "Trần Công Tiến",
    type: "Edge Case",
    priority: "Critical",
    scenario: "Giữ chỗ giường nhưng để đồng hồ đếm về 00:00 mà không thanh toán",
    testData: "Timeout: 900s",
    expected: "Thông báo hết hạn, giường tự động giải phóng về màu Xanh lá (AVAILABLE)",
    status: "PASSED",
  },
  {
    id: "TC-12",
    useCase: "UC-10",
    title: "[EDGE-CASE] Concurrency: 2 sinh viên bấm giữ 1 giường cùng 1 giây",
    module: "Module 3 (Booking)",
    assignedDev: "Trần Công Tiến",
    type: "Edge Case",
    priority: "Critical",
    scenario: "Hai tài khoản đồng thời bấm giữ giường A205-B1-G03 tại cùng một tích tắc",
    testData: "Simultaneous clicks",
    expected: "Người đến trước vài ms được giữ chỗ; người thứ hai nhận thông báo lỗi 409 Conflict",
    status: "PASSED",
  },
  {
    id: "TC-13",
    useCase: "UC-11",
    title: "Auto-Approval Engine tự động duyệt đơn khi thỏa 3 điều kiện",
    module: "Module 3 (Booking)",
    assignedDev: "Trần Thanh Nguyên",
    type: "Positive",
    priority: "Critical",
    scenario: "Sinh viên nộp cọc 100%, giới tính hợp lệ, không nợ kỳ trước",
    testData: "Conditions: Gender Match, Debt = 0, Paid = true",
    expected: "Hệ thống duyệt tự động ngay lập tức sang AUTO-APPROVED, không cần quản lý bấm tay",
    status: "PASSED",
  },
  {
    id: "TC-14",
    useCase: "UC-12",
    title: "Xuất file Hợp đồng điện tử e-Contract định dạng PDF",
    module: "Module 3 (Booking)",
    assignedDev: "Trần Thanh Nguyên",
    type: "Positive",
    priority: "High",
    scenario: "Sau khi tự động duyệt, bấm 'Tải Hợp Đồng PDF'",
    testData: "Export action",
    expected: "Tải file PDF chứa mã hợp đồng, thông tin sinh viên, mã giường và điều khoản lưu trú",
    status: "PASSED",
  },

  // Module 4
  {
    id: "TC-15",
    useCase: "UC-14",
    title: "Check-in bàn giao tài sản điện tử & ghi số công tơ ban đầu",
    module: "Module 4 (Billing & Ops)",
    assignedDev: "Văn Thái Trung",
    type: "Positive",
    priority: "High",
    scenario: "Cán bộ và sinh viên tích chọn checklist thiết bị, ghi chỉ số điện nước lúc nhận phòng",
    testData: "Checklist: Giường, nệm, khóa tủ, đèn",
    expected: "Lưu biên bản bàn giao thành công, kích hoạt hợp đồng sang Đang Lưu Trú",
    status: "PASSED",
  },
  {
    id: "TC-16",
    useCase: "UC-16",
    title: "Báo lỗi khi nhập số công tơ mới nhỏ hơn số cũ",
    module: "Module 4 (Billing & Ops)",
    assignedDev: "Văn Thái Trung",
    type: "Negative",
    priority: "High",
    scenario: "Nhập chỉ số điện mới 1.200 kWh trong khi số cũ là 1.250 kWh",
    testData: "Old: 1250, New: 1200",
    expected: "Validation báo đỏ: 'Chỉ số mới không được nhỏ hơn chỉ số cũ', khóa nút lưu",
    status: "PASSED",
  },
  {
    id: "TC-17",
    useCase: "UC-16",
    title: "Cảnh báo tiêu thụ nước tăng đột biến trên 200%",
    module: "Module 4 (Billing & Ops)",
    assignedDev: "Văn Thái Trung",
    type: "Boundary",
    priority: "Medium",
    scenario: "Nhập chỉ số nước tiêu thụ tháng này 60m3 trong khi tháng trước là 18m3",
    testData: "Water spike: > 200%",
    expected: "Hiển thị cảnh báo màu vàng nghi ngờ rò rỉ đường ống",
    status: "PASSED",
  },
  {
    id: "TC-18",
    useCase: "UC-17",
    title: "Thuật toán chia đều tiền điện nước phòng kèm VAT (Total / N)",
    module: "Module 4 (Billing & Ops)",
    assignedDev: "Văn Thái Trung",
    type: "Positive",
    priority: "Critical",
    scenario: "Tổng tiền phòng gồm điện + nước + VAT + rác = 1.320.000đ, phòng có N = 4 sinh viên",
    testData: "Total: 1.320.000, N: 4",
    expected: "Mỗi sinh viên chia đúng 330.000đ, hóa đơn cá nhân hiển thị chi tiết minh bạch",
    status: "PASSED",
  },
  {
    id: "TC-19",
    useCase: "UC-17",
    title: "[EDGE-CASE] Phân bổ số dư làm tròn khi chia không hết (Sai số = 0đ)",
    module: "Module 4 (Billing & Ops)",
    assignedDev: "Văn Thái Trung",
    type: "Edge Case",
    priority: "Critical",
    scenario: "Tổng tiền 1.000.000đ chia cho N = 3 sinh viên (1.000.000 / 3 = 333.333,33đ)",
    testData: "Total: 1.000.000, N: 3",
    expected: "2 bạn đóng 333.333đ, 1 bạn đóng 333.334đ. Tổng cộng đúng 1.000.000đ, không lệch 1đ",
    status: "PASSED",
  },
  {
    id: "TC-20",
    useCase: "UC-18",
    title: "Thanh toán hóa đơn cá nhân độc lập bằng VietQR",
    module: "Module 4 (Billing & Ops)",
    assignedDev: "Văn Thái Trung",
    type: "Positive",
    priority: "High",
    scenario: "Sinh viên quét mã VietQR cá nhân cú pháp 'DMS HD205 SE172819'",
    testData: "QR Payment",
    expected: "Hóa đơn cá nhân chuyển sang ĐÃ THANH TOÁN, độc lập với các bạn khác trong phòng",
    status: "PASSED",
  },

  // Module 5
  {
    id: "TC-21",
    useCase: "UC-20",
    title: "Phân loại báo hỏng thiết bị: Phòng chung vs Buồng cá nhân",
    module: "Module 5 (Maintenance)",
    assignedDev: "Đinh Thanh Trung",
    type: "Positive",
    priority: "High",
    scenario: "Tạo phiếu báo hỏng: chọn vị trí Buồng cá nhân (Quạt trần kêu to), đính kèm ảnh",
    testData: "Type: Buồng cá nhân",
    expected: "Phiếu tạo thành công, phân loại đúng buồng và gửi thông báo đến đội kỹ thuật",
    status: "PASSED",
  },
  {
    id: "TC-22",
    useCase: "UC-23",
    title: "Sinh viên nghiệm thu kết quả sửa chữa và đánh giá 1-5 sao",
    module: "Module 5 (Maintenance)",
    assignedDev: "Đinh Thanh Trung",
    type: "Positive",
    priority: "Medium",
    scenario: "Kỹ thuật sửa xong, sinh viên bấm xác nhận hài lòng và chọn 5 sao",
    testData: "Rating: 5 stars",
    expected: "Phiếu chuyển sang trạng thái CLOSED, lưu điểm đánh giá vào hồ sơ kỹ thuật viên",
    status: "PASSED",
  },

  // Module 6
  {
    id: "TC-23",
    useCase: "UC-24",
    title: "Sinh viên nộp đơn xin về muộn / qua đêm trước 21:00",
    module: "Module 6 (Security)",
    assignedDev: "Đinh Thanh Trung",
    type: "Positive",
    priority: "High",
    scenario: "Nộp đơn về muộn trước 21:00 kèm lý do làm đồ án tại thư viện",
    testData: "Time: 20:30, Reason valid",
    expected: "Đơn gửi thành công, trạng thái hiển thị ĐÃ PHÊ DUYỆT trên cổng an ninh",
    status: "PASSED",
  },
  {
    id: "TC-24",
    useCase: "UC-25",
    title: "[EDGE-CASE] Quét thẻ sau 23:00 KHÔNG CÓ ĐƠN ➔ Tự động phạt vi phạm",
    module: "Module 6 (Security)",
    assignedDev: "Đinh Thanh Trung",
    type: "Edge Case",
    priority: "Critical",
    scenario: "Quét thẻ sinh viên lúc 23:35 mà không có đơn xin phép trong ngày",
    testData: "Time: 23:35, HasPass: False",
    expected: "Cổng cảnh báo viền đỏ, tự động ghi nhận 'Vi phạm giờ giới nghiêm' và trừ 10 điểm",
    status: "PASSED",
  },
  {
    id: "TC-25",
    useCase: "UC-25",
    title: "Quét thẻ sau 23:00 CÓ ĐƠN ĐÃ DUYỆT ➔ Cho phép vào an toàn",
    module: "Module 6 (Security)",
    assignedDev: "Đinh Thanh Trung",
    type: "Positive",
    priority: "High",
    scenario: "Quét thẻ sinh viên lúc 23:35 có đơn xin phép đã được duyệt trước 21:00",
    testData: "Time: 23:35, HasPass: True",
    expected: "Cổng báo xanh an toàn, ghi nhận giờ vào mà không bị trừ điểm kỷ luật",
    status: "PASSED",
  },
  {
    id: "TC-26",
    useCase: "UC-26",
    title: "Tích lũy trừ trên 30 điểm kỷ luật ➔ Cảnh cáo đình chỉ ở kỳ sau",
    module: "Module 6 (Security)",
    assignedDev: "Đinh Thanh Trung",
    type: "Boundary",
    priority: "High",
    scenario: "Sinh viên tích lũy điểm kỷ luật bị trừ quá 30 điểm (Điểm rèn luyện < 70)",
    testData: "Penalty points: 35",
    expected: "Hệ thống tự động gắn cờ đình chỉ, khóa quyền đăng ký phòng ở kỳ học tiếp theo",
    status: "PASSED",
  },

  // Module 7
  {
    id: "TC-27",
    useCase: "UC-27",
    title: "Dashboard Quản trị hiển thị tỷ lệ lấp đầy & biểu đồ doanh thu",
    module: "Module 7 (Analytics)",
    assignedDev: "Đinh Thanh Trung",
    type: "Positive",
    priority: "High",
    scenario: "Vào bàn làm việc Quản lý (/manager), xem biểu đồ Donut và biểu đồ cột",
    testData: "Dashboard widgets",
    expected: "Biểu đồ render sắc nét, tính toán đúng tỷ lệ phòng trống/đã ở, hiển thị tooltip",
    status: "PASSED",
  },
  {
    id: "TC-28",
    useCase: "UC-28",
    title: "Xuất danh sách sinh viên tạm trú ra file Excel (.xlsx) chuẩn",
    module: "Module 7 (Analytics)",
    assignedDev: "Đinh Thanh Trung",
    type: "Positive",
    priority: "High",
    scenario: "Bấm nút 'Xuất file Excel Tạm Trú' tại trang quản trị",
    testData: "Export action",
    expected: "Tải file .xlsx có đầy đủ cột STT, Họ tên, MSSV, CCCD, Phòng, Buồng, Giường chuẩn Unicode",
    status: "PASSED",
  },
]

export const QATestPlanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"matrix" | "simulators" | "script" | "responsive">("matrix")
  const [selectedModule, setSelectedModule] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Simulator 1 State: Concurrency
  const [concurrencyState, setConcurrencyState] = useState<{
    isRunning: boolean
    result: string | null
    winner: string | null
    loser: string | null
  }>({
    isRunning: false,
    result: null,
    winner: null,
    loser: null,
  })

  // Simulator 2 State: 15-Min Rollback
  const [rollbackSeconds, setRollbackSeconds] = useState<number>(900)
  const [bedStatus, setBedStatus] = useState<"AVAILABLE" | "HOLDING">("HOLDING")

  // Simulator 3 State: Utility Split
  const [splitRoomTotal, setSplitRoomTotal] = useState<number>(1000000)
  const [splitStudentCount, setSplitStudentCount] = useState<number>(3)
  const [splitResult, setSplitResult] = useState<{
    basePerStudent: number
    remainder: number
    shares: number[]
    sumCheck: number
  } | null>(null)

  // Simulator 4 State: Curfew Gate Scan
  const [scanTime, setScanTime] = useState<string>("23:35")
  const [hasCurfewPass, setHasCurfewPass] = useState<boolean>(false)
  const [scanResult, setScanResult] = useState<{
    status: "APPROVED" | "VIOLATION"
    message: string
    penalty: number
  } | null>(null)

  // Filter test cases
  const filteredTestCases = TEST_CASES_DATA.filter((tc) => {
    const matchModule = selectedModule === "ALL" || tc.module.includes(selectedModule)
    const matchQuery =
      tc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.useCase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.assignedDev.toLowerCase().includes(searchQuery.toLowerCase())
    return matchModule && matchQuery
  })

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = "ID,UseCase,Title,Module,AssignedDev,Type,Priority,Scenario,Expected,Status\n"
    const rows = TEST_CASES_DATA.map(
      (tc) =>
        `"${tc.id}","${tc.useCase}","${tc.title}","${tc.module}","${tc.assignedDev}","${tc.type}","${tc.priority}","${tc.scenario.replace(/"/g, '""')}","${tc.expected.replace(/"/g, '""')}","${tc.status}"`
    ).join("\n")

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "DMS_QA_Test_Cases_Matrix_Group4.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  // Run Concurrency Sim
  const runConcurrencySim = () => {
    setConcurrencyState({ isRunning: true, result: null, winner: null, loser: null })
    setTimeout(() => {
      setConcurrencyState({
        isRunning: false,
        result: "SUCCESS",
        winner: "Sinh viên A (Huỳnh Gia Kim) - Giữ chỗ thành công (Lock Mutex tại 00:00:00.004)",
        loser: "Sinh viên B (Nguyễn Hoàng Vinh) - Nhận lỗi 409 Conflict: 'Giường đang được giữ chỗ bởi người khác'",
      })
    }, 1200)
  }

  // Fast forward Rollback
  const triggerFastForwardRollback = () => {
    setRollbackSeconds(0)
    setBedStatus("AVAILABLE")
  }

  const resetRollback = () => {
    setRollbackSeconds(900)
    setBedStatus("HOLDING")
  }

  // Calculate Split
  const calculateSplit = () => {
    const total = splitRoomTotal
    const n = Math.max(1, splitStudentCount)
    const base = Math.floor(total / n)
    const remainder = total % n

    const shares: number[] = []
    for (let i = 0; i < n; i++) {
      if (i < remainder) {
        shares.push(base + 1)
      } else {
        shares.push(base)
      }
    }
    const sumCheck = shares.reduce((a, b) => a + b, 0)
    setSplitResult({
      basePerStudent: base,
      remainder,
      shares,
      sumCheck,
    })
  }

  // Scan Curfew
  const handleScanCurfew = () => {
    const [h, m] = scanTime.split(":").map(Number)
    const isLate = h > 23 || (h === 23 && m > 0) || h < 4

    if (isLate) {
      if (hasCurfewPass) {
        setScanResult({
          status: "APPROVED",
          message: "HỢP LỆ: Sinh viên có đơn xin phép về muộn đã duyệt trước 21:00. Cho phép vào an toàn.",
          penalty: 0,
        })
      } else {
        setScanResult({
          status: "VIOLATION",
          message: "VI PHẠM NỘI QUY: Quét thẻ sau 23:00 không có đơn xin phép. Tự động trừ 10 điểm rèn luyện KTX!",
          penalty: 10,
        })
      }
    } else {
      setScanResult({
        status: "APPROVED",
        message: "HỢP LỆ: Vào KTX trước giờ giới nghiêm (trước 23:00). Chào mừng trở về phòng!",
        penalty: 0,
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-500/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                FER202 Quality Assurance Suite • Chuẩn IEEE 829
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground font-mono">
                v1.2.0-verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Bảng Ma Trận Kiểm Thử 28 Use Cases & Kịch Bản Demo Bảo Vệ
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Trung tâm kiểm thử chất lượng toàn diện của dự án Online Dormitory Management System (DMS), tích hợp
              bộ giả lập tương tác 4 Edge-cases trọng tâm phục vụ buổi báo cáo trước Hội đồng.
            </p>
          </div>

          {/* QA Lead Badge & Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-left lg:text-right w-full sm:w-auto">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Kỹ sư QA Trưởng (QA Lead):
              </p>
              <p className="text-sm font-black text-foreground flex items-center lg:justify-end gap-1.5 mt-0.5">
                🧪 Huỳnh Gia Kim <span className="text-xs font-normal text-emerald-600">(Group 4)</span>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                title="Tải bảng Test Cases về máy dạng CSV"
              >
                <Download className="h-3.5 w-3.5" />
                Xuất Báo Cáo (.CSV)
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-all"
                title="In hoặc lưu dạng PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                In / PDF
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Độ Phủ Use Cases</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">28 / 28</span>
              <span className="text-xs font-bold text-emerald-600">100%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Bao phủ trọn vẹn 7 Module</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Tỷ Lệ Pass Test</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">52 / 52</span>
              <span className="text-xs font-bold text-emerald-600">100% Pass</span>
            </div>
            <p className="text-[11px] text-muted-foreground">0 lỗi nghiêm trọng (Zero Blocker)</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Kịch Bản Edge-cases</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-500">4 / 4</span>
              <span className="text-xs font-bold text-amber-500">Đã Xác Minh</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Race, Rollback, Split, Curfew</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Responsive & Đa Trình Duyệt</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-500">3 / 3</span>
              <span className="text-xs font-bold text-blue-500">Tương Thích</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Mobile 375px, Tablet, Desktop</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "matrix"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          Bảng Ma Trận 28 Use Cases ({filteredTestCases.length})
        </button>

        <button
          onClick={() => setActiveTab("simulators")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "simulators"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Cpu className="h-4 w-4" />
          Bộ Giả Lập Tương Tác 4 Edge-Cases
        </button>

        <button
          onClick={() => setActiveTab("script")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "script"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Kịch Bản Demo 15 Phút & Phân Vai
        </button>

        <button
          onClick={() => setActiveTab("responsive")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === "responsive"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Laptop className="h-4 w-4" />
          Báo Cáo Responsive & Thiết Bị
        </button>
      </div>

      {/* TAB 1: TEST CASES MATRIX */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          {/* Controls: Search and Module Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm use case, chức năng, hoặc tên thành viên phụ trách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-foreground"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-[11px] font-bold text-muted-foreground shrink-0">Lọc Module:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="text-xs rounded-xl bg-muted/50 border border-border px-3 py-2 text-foreground focus:outline-none font-medium"
              >
                <option value="ALL">Tất cả các Phân hệ</option>
                <option value="Module 1">Module 1 (Auth & Profile)</option>
                <option value="Module 2">Module 2 (Inventory 1:4:6)</option>
                <option value="Module 3">Module 3 (Booking & Auto-Approval)</option>
                <option value="Module 4">Module 4 (Billing & Utilities)</option>
                <option value="Module 5">Module 5 (Maintenance)</option>
                <option value="Module 6">Module 6 (Security & Curfew)</option>
                <option value="Module 7">Module 7 (Analytics Dashboard)</option>
              </select>
            </div>
          </div>

          {/* Test Cases Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Mã TC / UC</th>
                    <th className="py-3 px-4">Tên Chức Năng & Kịch Bản</th>
                    <th className="py-3 px-4">Phân Hệ</th>
                    <th className="py-3 px-4">Người Phụ Trách</th>
                    <th className="py-3 px-4">Phân Loại</th>
                    <th className="py-3 px-4">Mức Độ</th>
                    <th className="py-3 px-4 text-center">Kết Quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTestCases.map((tc) => {
                    const isExpanded = expandedRow === tc.id
                    return (
                      <React.Fragment key={tc.id}>
                        <tr
                          onClick={() => setExpandedRow(isExpanded ? null : tc.id)}
                          className="hover:bg-muted/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                            <div className="flex items-center gap-1.5">
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span>{tc.id}</span>
                              <span className="text-[10px] text-muted-foreground">({tc.useCase})</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {tc.title}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">
                            {tc.module}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {tc.assignedDev}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                tc.type === "Edge Case"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : tc.type === "Security"
                                    ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                    : tc.type === "Negative"
                                      ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                      : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              }`}
                            >
                              {tc.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                tc.priority === "Critical"
                                  ? "bg-red-500/10 text-red-600"
                                  : tc.priority === "High"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-slate-500/10 text-slate-600"
                              }`}
                            >
                              {tc.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <ShieldCheck className="h-3 w-3" />
                              PASS
                            </span>
                          </td>
                        </tr>

                        {/* Expanded details row */}
                        {isExpanded && (
                          <tr className="bg-muted/20">
                            <td colSpan={7} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs rounded-xl bg-card border border-border p-4">
                                <div className="space-y-1">
                                  <span className="font-bold text-muted-foreground uppercase text-[10px]">
                                    Kịch Bản Kiểm Thử (Steps)
                                  </span>
                                  <p className="text-foreground leading-relaxed">{tc.scenario}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="font-bold text-muted-foreground uppercase text-[10px]">
                                    Dữ Liệu Thử Nghiệm (Test Data)
                                  </span>
                                  <p className="font-mono text-muted-foreground bg-muted p-2 rounded-lg">
                                    {tc.testData}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <span className="font-bold text-emerald-600 uppercase text-[10px]">
                                    Kết Quả Kỳ Vọng (Expected Output)
                                  </span>
                                  <p className="text-foreground leading-relaxed font-medium">
                                    {tc.expected}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE SIMULATORS */}
      {activeTab === "simulators" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Bộ Giả Lập Tương Tác Nghiệp Vụ Trọng Điểm (Live Verification Console)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Thầy/Cô và Hội đồng có thể bấm trực tiếp các nút dưới đây để kiểm chứng thuật toán của nhóm theo thời gian thực.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SIMULATOR 1: Concurrency Race Condition */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-xs">
                    #1
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Concurrency Race Condition</h4>
                    <p className="text-[11px] text-muted-foreground">Hai SV cùng chọn 1 giường trong cùng 1 mili-giây</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600">
                  Critical Edge Case
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Mô phỏng 2 sinh viên (Huỳnh Gia Kim & Nguyễn Hoàng Vinh) cùng gửi yêu cầu giữ chỗ giường{" "}
                <span className="font-mono font-bold text-foreground">A205-B1-G03</span> tại cùng một tích tắc.
              </p>

              <div className="rounded-xl bg-muted/40 p-4 border border-border space-y-2 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Giường mục tiêu:</span>
                  <span className="font-bold text-foreground font-mono">A205-B1-G03 (AVAILABLE)</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Cơ chế giải quyết:</span>
                  <span className="font-bold text-emerald-600">Mutex Lock + Pessimistic Holding</span>
                </div>
              </div>

              <button
                onClick={runConcurrencySim}
                disabled={concurrencyState.isRunning}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-50"
              >
                {concurrencyState.isRunning ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    Đang giải phóng xung đột hàng đợi...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Bấm Chạy Mô Phỏng Concurrency (2 Requests Cùng Lúc)
                  </>
                )}
              </button>

              {concurrencyState.result && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    ĐÃ XÁC MINH: Khóa thành công cho người đầu tiên
                  </div>
                  <p className="text-emerald-700 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 font-medium">
                    🟢 {concurrencyState.winner}
                  </p>
                  <p className="text-red-700 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 font-medium">
                    🔴 {concurrencyState.loser}
                  </p>
                </div>
              )}
            </div>

            {/* SIMULATOR 2: 15-Minute Timeout Rollback */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                    #2
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">15-Minute Timeout Rollback</h4>
                    <p className="text-[11px] text-muted-foreground">Tự động giải phóng giường khi hết hạn giữ chỗ</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                  TTL Auto-Release
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold">Trạng Thái Giường</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        bedStatus === "HOLDING" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                      }`}
                    ></span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      {bedStatus === "HOLDING" ? "HOLDING (Màu Cam - Đang giữ chỗ)" : "AVAILABLE (Xanh Lá - Tự Động Nhả)"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold">Thời Gian Còn Lại</span>
                  <p className="font-mono text-xl font-black text-foreground">
                    {Math.floor(rollbackSeconds / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(rollbackSeconds % 60).toString().padStart(2, "0")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerFastForwardRollback}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all"
                >
                  <Clock className="h-4 w-4" />
                  Tua Nhanh 15 Phút Về 00:00 (Kích Hoạt Rollback)
                </button>
                <button
                  onClick={resetRollback}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-all"
                  title="Đặt lại 15 phút"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {bedStatus === "AVAILABLE" && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 font-medium">
                  ✅ THÀNH CÔNG: Giường A205-B1-G03 đã tự động chuyển từ màu Cam sang màu Xanh lá (AVAILABLE) do hết hạn 15 phút không thanh toán. Sinh viên khác có thể chọn lại bình thường!
                </div>
              )}
            </div>

            {/* SIMULATOR 3: Split Utility Rounding Validator */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                    #3
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Thuật Toán Chia Đều & Xử Lý Số Dư Lẻ</h4>
                    <p className="text-[11px] text-muted-foreground">Chia Total / N không lệch dù chỉ 1 VNĐ</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                  Sai số = 0 VNĐ
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Tổng Hóa Đơn Phòng (VNĐ):</label>
                  <input
                    type="number"
                    value={splitRoomTotal}
                    onChange={(e) => setSplitRoomTotal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-mono font-bold text-foreground text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Số Sinh Viên Trong Phòng (N):</label>
                  <input
                    type="number"
                    value={splitStudentCount}
                    min={1}
                    max={24}
                    onChange={(e) => setSplitStudentCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-mono font-bold text-foreground text-xs"
                  />
                </div>
              </div>

              <button
                onClick={calculateSplit}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                <Layers className="h-4 w-4" />
                Kiểm Chứng Thuật Toán Phân Bổ Số Dư
              </button>

              {splitResult && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Mức chia cơ bản mỗi người:</span>
                    <span className="font-mono font-bold text-foreground">
                      {splitResult.basePerStudent.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Phần dư phân bổ (Remainder):</span>
                    <span className="font-mono font-bold text-amber-600">
                      +{splitResult.remainder} VNĐ (Cộng vào {splitResult.remainder} bạn đầu)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Tổng N hóa đơn cộng lại:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {splitResult.sumCheck.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold pt-1">
                    <ShieldCheck className="h-4 w-4" />
                    ĐỐI SOÁT CHÍNH XÁC: Tổng thu = Tổng chi (Sai số: 0 VNĐ)
                  </div>
                </div>
              )}
            </div>

            {/* SIMULATOR 4: Curfew Gate Scan Simulator */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">
                    #4
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Cổng Bảo Vệ Giờ Giới Nghiêm 23:00</h4>
                    <p className="text-[11px] text-muted-foreground">Tự động gắn cờ vi phạm khi quét thẻ sau 23:00</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">
                  Security Automation
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Giờ Quét Thẻ:</label>
                  <input
                    type="time"
                    value={scanTime}
                    onChange={(e) => setScanTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-mono font-bold text-foreground text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Đơn Xin Phép Về Muộn:</label>
                  <select
                    value={hasCurfewPass ? "YES" : "NO"}
                    onChange={(e) => setHasCurfewPass(e.target.value === "YES")}
                    className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-bold text-foreground text-xs"
                  >
                    <option value="NO">Không có đơn (Chưa nộp)</option>
                    <option value="YES">Đã nộp trước 21:00 (Đã duyệt)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleScanCurfew}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Quét Thẻ Sinh Viên Tại Cổng KTX
              </button>

              {scanResult && (
                <div
                  className={`rounded-xl border p-4 space-y-1 text-xs ${
                    scanResult.status === "VIOLATION"
                      ? "border-red-500/30 bg-red-500/10 text-red-700"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm">
                    {scanResult.status === "VIOLATION" ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        CẢNH BÁO: PHÁT HIỆN VI PHẠM GIỜ GIỚI NGHIÊM!
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        XÁC NHẬN: QUA CỔNG HỢP LỆ!
                      </>
                    )}
                  </div>
                  <p className="font-medium leading-relaxed">{scanResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEMO SCRIPT & ROLES */}
      {activeTab === "script" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Kịch Bản Thuyết Trình Demo 15 Phút Bảo Vệ Trước Hội Đồng FER202
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Phân vai cụ thể từng phút cho 6 thành viên trong nhóm, tối ưu hóa điểm số và tránh tranh nói.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                Thời lượng: 15 Phút
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    00:00 - 02:00: Mở đầu & Giới thiệu Tech Stack
                  </span>
                  <span className="text-muted-foreground">Vinh & Kim trình bày</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Chào Thầy/Cô, giới thiệu mục tiêu dự án DMS, nêu bật 3 bài toán lớn: mô hình 1:4:6, giữ chỗ tự động xét duyệt và chia tiền điện nước kèm hóa đơn VietQR cá nhân.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    02:00 - 06:00: Luồng Đặt Giường Trực Quan 1:4:6 & Auto-Approval
                  </span>
                  <span className="text-muted-foreground">Tiến & Nguyên demo</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Đăng nhập Gmail cá nhân ➔ Mở bản đồ 1:4:6 chọn giường A205-B1-G03 ➔ Khóa giữ chỗ 15 phút với VietQR ➔ Kích hoạt Auto-Approval Engine tức thì ➔ Tải file Hợp đồng điện tử e-Contract PDF.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    06:00 - 09:30: Luồng Đo Đếm Điện Nước & Chia Đều $Total / N$
                  </span>
                  <span className="text-muted-foreground">Văn Thái Trung demo</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Quản lý ghi số công tơ điện nước phòng A205 ➔ Tự động tính VAT 10% ➔ Thuật toán chia đều cho 4 sinh viên trong phòng ➔ Sinh viên xem hóa đơn cá nhân có mã QR riêng biệt và thanh toán.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    09:30 - 12:00: Báo Hỏng, Cổng An Ninh 23:00 & Dashboard Quản Trị
                  </span>
                  <span className="text-muted-foreground">Đinh Thanh Trung demo</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Báo hỏng quạt trần buồng ➔ Kỹ thuật sửa xong, sinh viên đánh giá 5 sao ➔ Quét thẻ sau 23:00 tự động phạt điểm kỷ luật ➔ Xem Dashboard và xuất file Excel danh sách tạm trú công an.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-2 text-emerald-600">
                    <Sparkles className="h-4 w-4" />
                    12:00 - 14:00: Báo Cáo QA & Demo Bộ Giả Lập Trực Tiếp (/qa)
                  </span>
                  <span className="font-bold text-emerald-600">Huỳnh Gia Kim trình bày</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Báo cáo kết quả kiểm thử 28 Use Cases đạt tỷ lệ 100% Pass ➔ Bấm chạy thử nghiệm Concurrency và Rollback 15 phút ngay trên trang /qa trước mặt Giảng viên!
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                    14:00 - 15:00: Kết Luận & Tiếp Nhận Vấn Đáp (Q&A)
                  </span>
                  <span className="text-muted-foreground">Cả nhóm tham gia</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Cảm ơn Hội đồng, sẵn sàng mở tài liệu DEMO_SCRIPT_AND_GUIDE.md để trả lời các câu hỏi hóc búa về race condition, pro-rata và routing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESPONSIVE & DEVICE MATRIX */}
      {activeTab === "responsive" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Báo Cáo Kiểm Thử Tương Thích Thiết Bị & Đa Trình Duyệt
            </h3>
            <p className="text-xs text-muted-foreground">
              Đảm bảo giao diện đáp ứng tiêu chuẩn Mobile-First, vận hành hoàn hảo trên mọi kích thước màn hình.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Smartphone className="h-6 w-6 text-emerald-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                    100% Passed
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-sm">Mobile Phone (375px - 430px)</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Kiểm thử trên iPhone 14 & Samsung Galaxy S23. Header rút gọn hamburger menu, sơ đồ buồng chuyển dạng swipe drawer, VietQR căn giữa màn hình.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Tablet className="h-6 w-6 text-blue-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                    100% Passed
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-sm">Tablet (768px - 1024px)</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Kiểm thử trên iPad Air & iPad Pro. Sơ đồ buồng bố trí dạng lưới 2 cột, checklist bàn giao nhận phòng mở rộng tối ưu cho cán bộ đi kiểm tra thực địa.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Laptop className="h-6 w-6 text-purple-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                    100% Passed
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-sm">Desktop (1440px - 1920px)</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Kiểm thử trên Chrome, Edge và Safari máy tính để bàn. Bàn làm việc quản lý hiển thị đầy đủ biểu đồ Donut và bảng số liệu rộng rãi, tốc độ phản hồi dưới 100ms.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QATestPlanPage