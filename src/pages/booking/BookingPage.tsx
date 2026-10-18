import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError, dormApi } from "@/lib/api"
import { canBookBed } from "@/lib/role-access"
import { QrCodeImage } from "@/components/ui/qr-code"
import { LoadingSkeleton } from "@/components/ui/shared"
import { generateContractPDF } from "@/lib/pdfGenerator"
import { CircleCheck, CircleAlert, Clock, QrCode, Download, Check, Zap, BedDouble, DoorOpen, ChevronDown, LayoutGrid, X } from "lucide-react"

import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

/** Dữ liệu hợp đồng sinh ra ở bước xác nhận giữ chỗ (xem khối "success"). */
const BOOKING_CONTRACT_ID = "CTR-2026-A205-B03"
const BOOKING_START_DATE = "2026-09-05"
const BOOKING_END_DATE = "2027-01-15"
/** Tiền cọc giữ chỗ (khớp số tiền VietQR 2.150.000 VNĐ của modal thanh toán). */
const BOOKING_DEPOSIT = 2150000
/** Các khoản cấu thành tổng tiền giữ chỗ, hiển thị trong bảng kê chi phí. */
const SECURITY_DEPOSIT = 1_000_000
const UTILITY_ADVANCE = 200_000
/** Giá phòng niêm yết, dùng cho bảng kê trước khi người dùng chọn giường. */
const DEFAULT_ROOM_FEE = 950_000

/** Định dạng tiền Việt Nam: 950000 → "₫950,000". */
const formatVnd = (amount: number): string => `₫${amount.toLocaleString("en-US")}`

/* ==================================================================
   Dữ liệu giường THẬT — nguồn duy nhất là `GET /api/dorm/inventory`.

   Trước đây trang này vẽ một mảng 24 giường viết cứng của phòng A205 rồi đổi
   mã giường theo phòng đang chọn. Cách đó khiến mọi phòng trông giống hệt
   nhau và trạng thái giường là do người viết code bịa ra. Nay toàn bộ sơ đồ
   được dựng từ cây kiểm kê thật của backend, nên mỗi phòng có đúng số giường
   trống / đã ở / đang giữ / bảo trì của chính nó.
   ================================================================== */

type BedStatus = "available" | "occupied" | "holding" | "maintenance"

interface Bed {
  id: string
  code: string
  slot: string
  status: BedStatus
  price: number
  tier: "lower" | "upper"
}

interface Compartment {
  id: string
  name: string
  title: string
  zone: string
  beds: Bed[]
}

/*
  Hình dạng thật của `GET /api/dorm/inventory` (đã đối chiếu với backend đang chạy):

    Building  { id, name, genderType, totalFloors, floors: Floor[] }
    Floor     { id, buildingId, level, rooms: Room[] }
    Room      { id, floorId, name, status, compartments: Compartment[] }
    Compartment { id, roomId, name, roomName, beds: Bed[] }
    Bed       { id, compartmentId, roomName, compartmentName, name, fullCode,
                status, studentId, tier, price }

  `dormApi.inventory()` khai báo `unknown[]` nên phần bóc tách bên dưới kiểm tra
  kiểu ở từng cấp thay vì tin tưởng hình dạng này.
*/

/** Buồng đã chuẩn hoá về chữ cái đơn mà giao diện đang dùng (A/B/C/D). */
interface RoomLayout {
  roomName: string
  compartments: Compartment[]
}

/** Trạng thái của một lượt gọi `/dorm/inventory`. */
type InventoryState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string }

/** Trạng thái giường backend (CHỮ HOA) → trạng thái trang này đang dùng. */
const BED_STATUS_MAP: Record<string, BedStatus> = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  HOLDING: "holding",
  MAINTENANCE: "maintenance",
}

const mapBedStatus = (status: string): BedStatus => BED_STATUS_MAP[status] ?? "maintenance"

/** Buồng "A1" → "A"; nhãn giao diện vẫn là "Buồng A/B/C/D" như trước. */
const compartmentLetter = (compartmentName: string): string =>
  (compartmentName.trim().charAt(0) || "?").toUpperCase()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const readString = (source: Record<string, unknown>, key: string, fallback = ""): string => {
  const value = source[key]
  return typeof value === "string" ? value : fallback
}

const readNumber = (source: Record<string, unknown>, key: string, fallback = 0): number => {
  const value = source[key]
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

/**
 * Mô tả 4 buồng theo đúng vị trí kiến trúc của mô hình 1:4:6.
 *
 * Giống nhau ở MỌI phòng vì đây là vị trí cố định của buồng, không phải dữ liệu
 * riêng của từng phòng — nói về phòng nào cũng đúng nên không gây hiểu nhầm.
 */
const COMPARTMENT_TITLES: Record<string, string> = {
  A: "Khu cửa sổ",
  B: "Khu ban công",
  C: "Khu bàn học",
  D: "Khu cửa ra vào",
}

const COMPARTMENT_ZONES: Record<string, string> = {
  A: "Cạnh cửa sổ",
  B: "Cạnh ban công",
  C: "Cạnh bàn học",
  D: "Cạnh cửa & WC",
}

/** Kết quả bóc cây kiểm kê: sơ đồ từng phòng + tên tòa thật. */
interface InventoryIndex {
  /** Khoá là mã phòng viết hoa (`A205`) → sơ đồ buồng/giường thật của phòng đó. */
  rooms: Map<string, RoomLayout>
  /** Tên tòa theo id (`b1`/`b2`) đọc từ backend, dùng cho bước 01 của thanh tiến trình. */
  buildingNames: Record<string, string>
  /** Số tầng thật của từng tòa, đọc từ cây kiểm kê. */
  buildingFloors: Record<string, number>
}

/**
 * Bóc phản hồi `/dorm/inventory` thành sơ đồ giường của từng phòng.
 *
 * Backend trả `{ success, data: Building[] }` nhưng `dormApi.inventory()` khai báo
 * `unknown[]`, nên ở đây kiểm tra từng cấp trước khi đọc — một phòng thiếu dữ liệu
 * sẽ bị bỏ qua chứ không làm vỡ cả trang.
 */
const buildInventoryIndex = (payload: unknown): InventoryIndex => {
  const rooms = new Map<string, RoomLayout>()
  const buildingNames: Record<string, string> = {}
  const buildingFloors: Record<string, number> = {}
  if (!Array.isArray(payload)) return { rooms, buildingNames, buildingFloors }

  const buildings = payload.filter(isRecord)

  for (const building of buildings) {
    const buildingId = readString(building, "id")
    const floors = Array.isArray(building.floors) ? building.floors : []
    if (buildingId) {
      buildingNames[buildingId] = readString(building, "name")
      // Số tầng đọc từ chính cây kiểm kê, không viết cứng "5 tầng".
      buildingFloors[buildingId] = floors.length
    }

    for (const floor of floors.filter(isRecord)) {
      const rooms_ = Array.isArray(floor.rooms) ? floor.rooms : []
      for (const room of rooms_.filter(isRecord)) {
        const roomName = readString(room, "name")
        if (!roomName) continue

        const rawCompartments = Array.isArray(room.compartments) ? room.compartments : []
        const compartments: Compartment[] = rawCompartments.filter(isRecord).map((compartment) => {
          const compartmentName = readString(compartment, "name")
          const id = compartmentLetter(compartmentName)
          const rawBeds = Array.isArray(compartment.beds) ? compartment.beds : []

          const beds: Bed[] = rawBeds.filter(isRecord).map((bed, bedIndex) => {
            const slot = readString(bed, "name", `G${String(bedIndex + 1).padStart(2, "0")}`)
            const code = readString(bed, "fullCode", `${roomName}-${compartmentName}-${slot}`)
            return {
              // `code` (mã giường thật) là khoá nhận diện: hợp đồng và nội dung QR
              // đều in mã này, nên nó phải duy nhất và đúng.
              id: code,
              code,
              slot,
              status: mapBedStatus(readString(bed, "status")),
              price: readNumber(bed, "price"),
              tier: readString(bed, "tier") === "upper" ? "upper" : "lower",
              ...(readString(bed, "status") === "HOLDING" ? { holdingTime: "15p" } : {}),
            }
          })

          return {
            id,
            name: compartmentName,
            title: COMPARTMENT_TITLES[id] ?? "Khu vực trong phòng",
            zone: COMPARTMENT_ZONES[id] ?? "Trong phòng",
            beds,
          }
        })

        rooms.set(roomName.toUpperCase(), {
          // Phòng chỉ có 3 buồng trong dữ liệu vẫn hiện đúng 3 buồng thật, không thêm buồng rỗng.
          roomName,
          compartments,
        })
      }
    }
  }

  return { rooms, buildingNames, buildingFloors }
}

const countBeds = (compartments: Compartment[]): number =>
  compartments.reduce((sum, compartment) => sum + compartment.beds.length, 0)

/** Số giường còn trống của một sơ đồ phòng. */
const countAvailable = (compartments: Compartment[]): number =>
  compartments.reduce(
    (sum, compartment) => sum + compartment.beds.filter((bed) => bed.status === "available").length,
    0,
  )

/** Lựa chọn mặc định trước khi có dữ liệu thật; không có mã giường nào được bịa. */
const EMPTY_SELECTED_BED: Bed = {
  id: "",
  code: "",
  slot: "",
  status: "available",
  price: 0,
  tier: "lower",
}

export const BookingPage: React.FC = () => {
  const { user } = useAuth()
  // Chỉ sinh viên (và admin hỗ trợ) được giữ giường + thanh toán.
  // Quản lý giám sát qua engine tự động duyệt, không giữ giường tay.
  const canBook = canBookBed(user?.role)

  // Selection states
  const [selectedBuilding, setSelectedBuilding] = useState("b1")
  const [selectedFloor, setSelectedFloor] = useState(2)
  /** Phòng mở đầu khi vào trang; đổi tầng/tòa sẽ tự chuyển sang phòng hợp lệ. */
  const [selectedRoom, setSelectedRoom] = useState("A205")
  const [selectedCompartment, setSelectedCompartment] = useState("B")
  /** Chưa chọn giường nào: mã giường chỉ có được sau khi đọc dữ liệu thật. */
  const [selectedBed, setSelectedBed] = useState<Bed>(EMPTY_SELECTED_BED)

  // Timer state (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 45)
  const [isLocked, setIsLocked] = useState(true)

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "vnpay" | "student_acc">("vietqr")

  // Modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"qr" | "verifying" | "success">("qr")
  const [autoApprovalProgress, setAutoApprovalProgress] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastTone, setToastTone] = useState<"success" | "error">("success")
  const [isGeneratingContract, setIsGeneratingContract] = useState(false)

  const showToast = (message: string, tone: "success" | "error" = "success") => {
    setToastMessage(message)
    setToastTone(tone)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Countdown timer effect
  useEffect(() => {
    if (!isLocked) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsLocked(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isLocked])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  /* ------------------------------------------------------------------
     KIỂM KÊ GIƯỜNG THẬT TỪ BACKEND.

     Một lần gọi `GET /api/dorm/inventory` khi vào trang, dựng chỉ mục
     `mã phòng -> buồng/giường` để mọi phòng hiện đúng sơ đồ và đúng trạng thái
     của nó. Không có dữ liệu mẫu dự phòng: khi máy chủ lỗi thì giao diện nói rõ
     lỗi và cho bấm "Thử lại", chứ không âm thầm vẽ lại số liệu cũ.
     ------------------------------------------------------------------ */
  const [inventory, setInventory] = useState<InventoryIndex>(() => buildInventoryIndex(null))
  const [inventoryState, setInventoryState] = useState<InventoryState>({ status: "loading" })
  /**
   * Số thứ tự lượt tải. Bấm "Thử lại" tăng lên 1 và đặt lại trạng thái "đang tải"
   * ngay trong sự kiện bấm (không đặt trong effect) để effect chỉ còn việc gọi API.
   */
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    dormApi
      .inventory()
      .then((payload) => {
        if (cancelled) return
        setInventory(buildInventoryIndex(payload))
        setInventoryState({ status: "ready" })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Không rõ nguyên nhân."
        setInventory(buildInventoryIndex(null))
        setInventoryState({ status: "error", message })
      })

    return () => {
      cancelled = true
    }
  }, [loadAttempt])

  const isLoadingInventory = inventoryState.status === "loading"
  const inventoryError = inventoryState.status === "error" ? inventoryState.message : null

  const handleRetryInventory = () => {
    setInventoryState({ status: "loading" })
    setLoadAttempt((attempt) => attempt + 1)
  }

  /* ------------------------------------------------------------------
     Danh sách phòng của tầng đang chọn.

     Mã phòng suy ra từ mô hình thật: mỗi tầng 6 phòng, mã =
     <chữ tòa><tầng>0<số phòng> (tầng 2 tòa A -> A201..A206). Số giường trống
     đọc từ cây kiểm kê thật; phòng không có trong dữ liệu trả `null` để giao
     diện nói thẳng là chưa có số, thay vì bịa ra một con số trông như thật.
     ------------------------------------------------------------------ */
  const buildingLetter = selectedBuilding === "b2" ? "B" : "A"
  const buildingName = inventory.buildingNames[selectedBuilding] || `Tòa ${buildingLetter}`
  /** Số tầng thật của tòa đang chọn; chưa tải xong thì mặc định 5 như cấu hình tòa. */
  const floorLevels = Array.from(
    { length: inventory.buildingFloors[selectedBuilding] || 5 },
    (_, index) => index + 1,
  )
  const ROOMS_PER_FLOOR = 6

  /**
   * Số giường còn trống của một phòng, hoặc `null` nếu phòng chưa có trong dữ liệu.
   */
  const availableBedsOf = (roomCode: string): number | null => {
    const layout = inventory.rooms.get(roomCode.toUpperCase())
    if (!layout) return null
    return countAvailable(layout.compartments)
  }

  const roomsOnFloor = Array.from({ length: ROOMS_PER_FLOOR }, (_, i) => {
    const code = `${buildingLetter}${selectedFloor}0${i + 1}`
    const layout = inventory.rooms.get(code.toUpperCase()) ?? null
    const free = availableBedsOf(code)
    const total = layout ? countBeds(layout.compartments) : 0
    return {
      code,
      free,
      total,
      /** Tỷ lệ đã dùng, chỉ tính khi biết số giường thật. */
      usedRatio: free === null || total === 0 ? null : (total - free) / total,
    }
  })

  /**
   * Giữ lựa chọn luôn hợp lệ mà không cần đồng bộ bằng effect: phòng/tòa đổi thì
   * handler đặt thẳng phòng đầu tiên của tầng mới, còn dữ liệu thật về muộn thì
   * `activeRoom` dưới đây tự rơi về phòng đầu tiên nếu phòng đang chọn không có.
   */
  const firstRoomOf = (letter: string, floor: number) => `${letter}${floor}01`

  const isSelectedRoomOnFloor = roomsOnFloor.some((r) => r.code === selectedRoom)

  const handleSelectRoom = (roomCode: string) => {
    setSelectedRoom(roomCode)
    setSelectedBed(EMPTY_SELECTED_BED)
  }

  const handleSelectFloor = (level: number) => {
    setSelectedFloor(level)
    setSelectedRoom(firstRoomOf(buildingLetter, level))
    setSelectedCompartment("A")
    setSelectedBed(EMPTY_SELECTED_BED)
  }

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuilding(buildingId)
    setSelectedRoom(firstRoomOf(buildingId === "b2" ? "B" : "A", selectedFloor))
    setSelectedCompartment("A")
    setSelectedBed(EMPTY_SELECTED_BED)
  }

  /* ------------------------------------------------------------------
     Lựa chọn đã chốt cho lượt render này.

     Suy ra trực tiếp từ state + dữ liệu thật (không `setState` trong effect) nên
     giao diện không bao giờ hiển thị một phòng/giường không tồn tại.
     ------------------------------------------------------------------ */
  const activeRoom = isSelectedRoomOnFloor ? selectedRoom : roomsOnFloor[0].code
  const activeRoomLayout = inventory.rooms.get(activeRoom.toUpperCase()) ?? null
  /**
   * Sơ đồ đang vẽ: chỉ lấy từ dữ liệu thật. Chưa tải xong, tải lỗi, hoặc phòng
   * không có giường thì mảng rỗng — giao diện đã có nhánh riêng cho từng trường
   * hợp đó, nên không bao giờ cần một ô giường giả để lấp chỗ trống.
   */
  const activeRoomCompartments: Compartment[] = activeRoomLayout?.compartments ?? []
  const activeBed: Bed =
    selectedBed.id && activeRoomCompartments.some((c) => c.beds.some((b) => b.id === selectedBed.id))
      ? selectedBed
      : EMPTY_SELECTED_BED

  // Handle bed selection — chặn giữ giường nếu không đủ quyền.
  /**
   * Chọn giường và GIỮ CHỖ THẬT trên máy chủ (`POST /api/dorm/holds`).
   *
   * Trước đây hàm này chỉ đổi state cục bộ: bấm chọn giường thì giao diện đếm
   * ngược 15 phút nhưng máy chủ không biết gì, nên giường vẫn hiện "còn trống"
   * cho người khác và hết hạn không có gì được nhả. Nay giường chuyển sang
   * HOLDING thật, và bấm giường khác thì lượt giữ chỗ cũ được nhả trước.
   */
  const [holdingBedCode, setHoldingBedCode] = useState<string | null>(null)
  const [isHolding, setIsHolding] = useState(false)

  const handleSelectBed = async (bed: Bed, compId: string) => {
    if (!canBook || bed.status !== "available" || !bed.code) return
    if (isHolding) return

    setIsHolding(true)
    try {
      const hold = await dormApi.holdBed(bed.code)
      setSelectedBed(bed)
      setSelectedCompartment(compId)
      setHoldingBedCode(bed.code)
      setTimeLeft(Math.max(0, hold.secondsLeft ?? 15 * 60))
      setIsLocked(true)
      // Tải lại kiểm kê để trạng thái HOLDING hiện đúng trên sơ đồ.
      setLoadAttempt((n) => n + 1)
    } catch (error) {
      showToast(
        error instanceof ApiError
          ? error.message
          : "Không giữ được giường này. Vui lòng chọn giường khác.",
        "error",
      )
      // Tải lại để thấy trạng thái thật (có thể người khác vừa giữ mất).
      setLoadAttempt((n) => n + 1)
    } finally {
      setIsHolding(false)
    }
  }

  /** Nhả lượt giữ chỗ đang có (khi đổi giường hoặc rời trang). */
  const releaseCurrentHold = async () => {
    if (!holdingBedCode) return
    try {
      // Tìm id lượt giữ chỗ hiện tại của chính sinh viên này.
      const current = await dormApi.currentHold()
      if (current?.id) await dormApi.releaseHold(current.id)
    } catch {
      // Không nhả được thì lượt giữ chỗ sẽ tự hết hạn sau 15 phút.
    } finally {
      setHoldingBedCode(null)
    }
  }

  /**
   * Rời trang khi còn giữ chỗ thì nhả ra, để giường không bị khoá 15 phút một
   * cách vô ích. Chỉ chạy lúc unmount nên dùng ref để tránh phụ thuộc state.
   */
  const holdingRef = useRef<string | null>(null)
  useEffect(() => {
    holdingRef.current = holdingBedCode
  }, [holdingBedCode])

  useEffect(() => {
    return () => {
      if (!holdingRef.current) return
      // Gọi thẳng API, không dùng state sau khi component đã unmount.
      dormApi
        .currentHold()
        .then((current) => (current?.id ? dormApi.releaseHold(current.id) : null))
        .catch(() => undefined)
    }
  }, [])

  /** Đếm giường theo trạng thái của phòng đang chọn, dùng cho bảng chú thích. */
  const bedCounts = activeRoomCompartments
    .flatMap((c) => c.beds)
    .reduce(
      (acc, b) => {
        acc[b.status] += 1
        return acc
      },
      { available: 0, occupied: 0, holding: 0, maintenance: 0 } as Record<Bed["status"], number>,
    )

  /** Phòng đang chọn có giường thật trong dữ liệu hay không. */
  const hasRealBeds = activeRoomCompartments.some((c) => c.beds.some((b) => b.code !== ""))

  /** Tiền phòng của giường đang chọn, lấy từ giá thật trong cây kiểm kê. */
  const roomFee = activeBed.price > 0 ? activeBed.price : DEFAULT_ROOM_FEE
  const payableTotal = roomFee + SECURITY_DEPOSIT + UTILITY_ADVANCE

  // Trigger checkout & simulate auto-approval
  const handleStartCheckout = () => {
    if (!canBook) return
    setShowCheckoutModal(true)
    setCheckoutStep("qr")
  }

  /**
   * Thanh toán giữ chỗ THẬT: tạo đơn -> xác nhận cọc.
   *
   * Việc DUYỆT không nằm ở đây: `POST /bookings/:id/approve` chỉ dành cho quản
   * lý/admin (`booking:approve`). Sinh viên gọi sẽ nhận 403, nên sau khi thanh
   * toán xong giao diện báo "đã thanh toán, chờ Ban Quản lý duyệt" — đúng trạng
   * thái PAID mà máy chủ ghi nhận.
   *
   * Trước đây khối này chỉ chạy ba `setTimeout` rồi hiện "thành công", nhưng
   * máy chủ không nhận được gì: không có đơn, không có thanh toán.
   */
  const [isPaying, setIsPaying] = useState(false)
  const [paidBookingId, setPaidBookingId] = useState<string | null>(null)

  const handleConfirmPayment = async () => {
    if (!canBook || isPaying) return
    if (!selectedBed.code) {
      showToast("Vui lòng chọn một giường còn trống trước khi thanh toán.", "error")
      return
    }

    setIsPaying(true)
    setCheckoutStep("verifying")
    setAutoApprovalProgress(15)

    try {
      // 1. Tạo đơn giữ giường (trạng thái PENDING).
      const booking = (await dormApi.createBooking(selectedBed.code, paymentMethod)) as {
        id: string
      }
      setAutoApprovalProgress(50)

      // 2. Xác nhận đã thanh toán cọc -> máy chủ chuyển đơn sang PAID.
      await dormApi.payBooking(booking.id)
      setAutoApprovalProgress(100)

      setPaidBookingId(booking.id)
      setCheckoutStep("success")
      // Giường đang HOLDING, tải lại để sơ đồ phản ánh đúng.
      setLoadAttempt((n) => n + 1)
      setHoldingBedCode(null)
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Không hoàn tất được đặt giường. Vui lòng thử lại."
      showToast(message, "error")
      setCheckoutStep("qr")
      setAutoApprovalProgress(0)
      setLoadAttempt((n) => n + 1)
    } finally {
      setIsPaying(false)
    }
  }

  /** Tải hợp đồng điện tử thật cho giường vừa giữ chỗ (font Unicode nhúng). */
  const handleDownloadContract = async () => {
    if (isGeneratingContract) return
    setIsGeneratingContract(true)
    try {
      await generateContractPDF({
        // Chưa duyệt thì hợp đồng ghi theo mã đơn đã thanh toán; duyệt xong
        // Ban Quản lý cấp mã hợp đồng riêng (xem cột Mã Hợp Đồng trong hồ sơ).
        contractId: paidBookingId ? `HĐ-${paidBookingId}` : BOOKING_CONTRACT_ID,
        studentName: user?.fullName ?? "Nguyễn Hoàng Vinh",
        mssv: user?.studentId ?? "QE200001",
        bedCode: activeBed.code,
        building: buildingName,
        room: `${activeRoom} - Buồng ${selectedCompartment}`,
        citizenId: user?.citizenId,
        phone: user?.phone,
        roomFee,
        deposit: BOOKING_DEPOSIT,
        startDate: BOOKING_START_DATE,
        endDate: BOOKING_END_DATE,
        createdAt: new Date().toISOString(),
      })
      showToast("Đã tải hợp đồng điện tử PDF cho giường " + activeBed.code + ".")
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không tạo được hợp đồng điện tử.", "error")
    } finally {
      setIsGeneratingContract(false)
    }
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-[60] flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold text-white shadow-xl ${
            toastTone === "error" ? "border-danger/25 bg-danger" : "border-success/25 bg-success"
          }`}
        >
          {toastTone === "error" ? (
            <CircleAlert className="h-4 w-4 shrink-0" />
          ) : (
            <CircleCheck className="h-4 w-4 shrink-0" />
          )}
          <span className="one-line">{toastMessage}</span>
        </div>
      )}

      {/* 01. STEP PROGRESS HIERARCHY BANNER */}
      <div className="dms-card w-full p-4">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
              01
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Tòa nhà
              </span>
              <span className="font-semibold text-foreground">{buildingName}</span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
              02
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Tầng lầu
              </span>
              <span className="font-semibold text-foreground">Tầng {selectedFloor}</span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
              03
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Phòng chuẩn
              </span>
              <span className="font-semibold text-foreground">
                {hasRealBeds
                  ? `Phòng ${activeRoom} · ${countBeds(activeRoomCompartments)} giường`
                  : `Phòng ${activeRoom}`}
              </span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]">
              04
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Buồng riêng
              </span>
              <span className="font-semibold text-foreground">Buồng {selectedCompartment}</span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max">
            <span className="w-6 h-6 rounded-full bg-muted-foreground text-white flex items-center justify-center font-bold text-[11px]">
              05
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Vị trí giường
              </span>
              <span className="font-bold text-primary dark:text-primary">
                {activeBed.code || "Chưa chọn giường"}
              </span>
            </div>
          </div>

          <span className="text-muted-foreground/40 font-mono">→</span>

          <div className="flex items-center gap-2.5 min-w-max opacity-80">
            <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold text-[11px]">
              06
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Thanh toán
              </span>
              <span className="font-medium text-muted-foreground">VietQR Giữ chỗ 15m</span>
            </div>
          </div>
        </div>
      </div>

      {/* 02. MAIN 3-COLUMN ERGONOMIC GRID */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* COLUMN 1: BUILDING, LEVEL, ROOM LIST (3 COLS) */}
        {/* gap-4 khớp hai cột còn lại: trước đây cột này dùng gap-5 nên khoảng
            cách giữa các thẻ trong ba cột không đều nhau. */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Building Selector */}
          <div className="dms-card p-4 space-y-3">
            <label className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
              Khu Ký Túc Xá
            </label>
            <div className="relative">
              <Select
                value={selectedBuilding}
                onChange={(e) => handleSelectBuilding(e.target.value)}
                className="font-semibold pr-8 appearance-none cursor-pointer"
              >
                <option value="b1">Tòa A · Khu Nam</option>
                <option value="b2">Tòa B · Khu Nữ</option>
              </Select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4" />
            </div>

            {/* Floor Selection */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">
                  Chọn Tầng
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-1 bg-muted rounded-lg">
                {floorLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleSelectFloor(lvl)}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      selectedFloor === lvl
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    T{lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rooms on Floor Manifest — danh sách suy ra từ tầng + tòa đang chọn */}
          <div className="dms-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <span className="text-xs font-bold text-foreground">Phòng tại Tầng {selectedFloor}</span>
              <span className="text-[11px] text-muted-foreground">{roomsOnFloor.length} phòng tìm thấy</span>
            </div>

            {roomsOnFloor.map((room) => {
              const isActive = activeRoom === room.code
              const hasData = room.free !== null
              return (
                <div
                  key={room.code}
                  onClick={() => handleSelectRoom(room.code)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-xs border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className={`flex min-w-0 items-center gap-1.5 font-bold text-xs ${isActive ? "" : "text-foreground"}`}>
                      <DoorOpen className={`h-4 w-4 shrink-0 ${isActive ? "text-white/80" : "text-muted-foreground"}`} />
                      <span className="truncate">Phòng {room.code}</span>
                    </div>
                    {/*
                      Số giường đọc thẳng từ cây kiểm kê thật. Chỉ khi lượt tải
                      thất bại mới không có số để nói — lúc đó ghi rõ là chưa tải
                      được, chứ không bịa ra một con số trông như thật.
                    */}
                    {hasData ? (
                      isActive ? (
                        <span className="shrink-0 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {room.free} Giường Trống
                        </span>
                      ) : (
                        <Badge variant={room.free === 0 ? "neutral" : "secondary"}>
                          {room.total - (room.free ?? 0)}/{room.total} Đã ở
                        </Badge>
                      )
                    ) : (
                      <span
                        className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isActive ? "bg-black/20 text-white/90" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isLoadingInventory ? "Đang tải số giường" : "Chưa tải được số giường"}
                      </span>
                    )}
                  </div>

                  {/* Thanh tỷ lệ đã dùng, cùng nguồn số với nhãn phía trên. */}
                  <div className={`h-1.5 w-full overflow-hidden rounded-full ${isActive ? "bg-white/20" : "bg-muted"}`}>
                    {room.usedRatio !== null && (
                      <div
                        className={isActive ? "h-full bg-white" : "h-full bg-muted-foreground"}
                        style={{ width: `${room.usedRatio * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* COLUMN 2: CENTER ARCHITECTURAL 1:4:6 UNIT BLUEPRINT (6 COLS) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          {/* p-4 khớp với hai cột bên cạnh: trước đây cột giữa dùng p-5 nên lề
              trong của ba cột lệch nhau, nhìn như bị so le. */}
          <div className="dms-card p-4 space-y-4">
            {/* Header blueprint */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-foreground">
                      Bản Đồ Kiến Trúc · Phòng {activeRoom}
                    </h2>
                    {hasRealBeds && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                        {activeRoomCompartments.length} buồng · {countBeds(activeRoomCompartments)} giường
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {hasRealBeds && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success-soft-foreground text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  <span>Thời gian thực: {bedCounts.available} giường trống</span>
                </div>
              )}
            </div>

            {/*
              Status Legend — số đếm suy ra từ chính dữ liệu giường đang vẽ.
              Chỉ hiện khi đã có giường thật: lúc đang tải hoặc tải lỗi thì mọi ô
              đều là "chưa rõ", hiện "Bảo trì · 24" sẽ là một con số bịa.
            */}
            {hasRealBeds && (
              <div className="flex flex-wrap items-center gap-4 py-2 px-3 rounded-lg bg-muted/70 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-success"></span>
                  <span className="font-medium text-foreground">Còn chỗ · {bedCounts.available}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-muted"></span>
                  <span className="text-muted-foreground">Đã ở · {bedCounts.occupied}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-primary"></span>
                  <span className="text-muted-foreground">Đang giữ · {bedCounts.holding}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-danger"></span>
                  <span className="text-muted-foreground">Bảo trì · {bedCounts.maintenance}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="w-3 h-3 rounded-xs bg-primary ring-2 ring-primary ring-offset-1"></span>
                  <span className="font-bold text-primary dark:text-primary">Đang chọn · {activeBed.code ? 1 : 0}</span>
                </div>
              </div>
            )}

            {/* Visual Floor Canvas Matrix */}
            <div className="p-3.5 bg-muted/70 rounded-xl border border-border relative space-y-3">
              {isLoadingInventory ? (
                /* Đang tải kiểm kê: khung xương, tuyệt đối không vẽ lưới 0 giường. */
                <LoadingSkeleton rows={4} />
              ) : inventoryError ? (
                /* Tải lỗi: nói rõ thông điệp tiếng Việt của backend và cho thử lại. */
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                  <div className="flex items-center gap-2 text-danger">
                    <CircleAlert className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-bold">Không tải được dữ liệu giường</span>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-md">{inventoryError}</p>
                  <Button
                    variant="outline"
                    onClick={handleRetryInventory}
                    className="text-xs font-bold"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : !hasRealBeds ? (
                /* Phòng này không có giường nào trong dữ liệu máy chủ. */
                <div className="py-8 text-center">
                  <p className="text-sm font-bold text-foreground">
                    Phòng {activeRoom} chưa có giường trong dữ liệu máy chủ
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chọn phòng khác để xem sơ đồ giường.
                  </p>
                </div>
              ) : (
                <>
                  {/* 4 Quadrants (1:4:6 Layout) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {activeRoomCompartments.map((comp) => {
                      const isSelectedComp = selectedCompartment === comp.id
                      return (
                        <div
                          key={comp.id}
                          className={`bg-card p-3 rounded-xl border transition-all ${
                            isSelectedComp
                              ? "ring-2 ring-primary border-primary shadow-sm"
                              : "border-border"
                          }`}
                        >
                          {/* Compartment Header */}
                          <div className="mb-2 pb-1.5 border-b border-border/60">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-bold text-xs text-foreground whitespace-nowrap flex items-center gap-1.5 shrink-0">
                                Buồng {comp.id}
                                {isSelectedComp && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0"></span>
                                )}
                              </span>
                              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                                {comp.zone}
                              </span>
                            </div>
                          </div>

                          {/* Bed cells */}
                          <div className="grid grid-cols-3 gap-2">
                            {comp.beds.map((bed) => {
                              const isCurrentPick = activeBed.id === bed.id
                              const isAvailable = bed.status === "available"
                              const isHolding = bed.status === "holding"
                              const isMaint = bed.status === "maintenance"

                              return (
                                <div
                                  key={bed.id}
                                  onClick={() => handleSelectBed(bed, comp.id)}
                                  className={`p-2 rounded-lg text-center flex flex-col items-center justify-center transition-all border ${
                                    isCurrentPick
                                      ? "bg-primary text-white border-primary shadow-md scale-105 ring-2 ring-primary ring-offset-2 z-10 cursor-pointer"
                                      : isAvailable
                                      ? "bg-success-soft border-success/25 hover:bg-success-soft cursor-pointer text-success-soft-foreground   "
                                      : isHolding
                                      ? "bg-primary-soft border-primary/25 text-primary-soft-foreground    cursor-not-allowed"
                                      : isMaint
                                      ? "bg-danger-soft border-danger/25 text-danger-soft-foreground    cursor-not-allowed"
                                      : "bg-muted border-border text-muted-foreground cursor-not-allowed"
                                  }`}
                                >
                                  {isCurrentPick ? (
                                    <CircleCheck className="h-4 w-4 shrink-0" />
                                  ) : (
                                    <BedDouble className="h-4 w-4 shrink-0" />
                                  )}
                                  <span className="font-mono font-bold text-[11px] leading-tight whitespace-nowrap">
                                    {bed.slot}
                                  </span>
                                  <span className="text-[9px] mt-0.5 font-medium whitespace-nowrap">
                                    {isCurrentPick
                                      ? "Đang chọn"
                                      : isAvailable
                                      ? `${Math.round(bed.price / 1000)}k/th`
                                      : isHolding
                                      ? "Đang giữ"
                                      : isMaint
                                      ? "Bảo trì"
                                      : "Đã ở"}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: DETAIL & RESERVATION HOLD DRAWER (3 COLS) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* 15-Minute Countdown Timer Card */}
          <div className="bg-primary text-white p-3.5 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider font-bold text-white/80 text-[10px] whitespace-nowrap">
                Khóa Giữ Chỗ Tạm Thời
              </span>
              <Clock className="h-3.5 w-3.5 text-white/80 animate-pulse shrink-0" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-white">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-white/80 whitespace-nowrap">Còn lại</span>
            </div>

            {/* Progress bar of timer */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 900) * 100}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-white/80 leading-normal pt-0.5">
              Khóa độc quyền cho MSSV <strong>{user?.studentId || "QE200001"}</strong>, tự giải phóng sau 15 phút.
            </p>
          </div>

          {/* Selected Bed Specifications */}
          <div className="dms-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Giường bạn đã chọn
                </span>
                <h4 className="font-bold text-sm text-foreground truncate">
                  {activeBed.code || "Chưa chọn giường"}
                </h4>
              </div>
              <Badge variant="success" className="shrink-0 whitespace-nowrap">
                {activeBed.tier === "lower" ? "Tầng dưới" : "Tầng trên"}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Vị trí buồng:</span>
                <span className="font-semibold text-foreground truncate text-right">
                  Buồng {selectedCompartment} · P.{activeRoom}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Tiện ích kèm:</span>
                <span className="font-semibold text-foreground whitespace-nowrap text-right">Locker + Đèn bàn</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Quy cách đệm:</span>
                <span className="font-semibold text-foreground whitespace-nowrap text-right">1.0 × 2.0m Foam</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Thời hạn thuê:</span>
                <span className="font-semibold text-foreground whitespace-nowrap text-right">Học kỳ 1, 5 tháng</span>
              </div>
            </div>

            {/* Financial Breakdown — tiền phòng lấy đúng giá giường thật từ máy chủ. */}
            <div className="bg-muted/70 p-3 rounded-xl space-y-2 text-xs border border-border">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Bảng kê chi phí kỳ 1
              </span>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Tiền phòng (tháng 1):</span>
                <span className="font-mono text-foreground font-semibold whitespace-nowrap">
                  {formatVnd(roomFee)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Tiền cọc an ninh:</span>
                <span className="font-mono text-foreground font-semibold whitespace-nowrap">
                  {formatVnd(SECURITY_DEPOSIT)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Tạm ứng điện nước:</span>
                <span className="font-mono text-foreground font-semibold whitespace-nowrap">
                  {formatVnd(UTILITY_ADVANCE)}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between gap-2 font-bold text-foreground text-xs">
                <span className="whitespace-nowrap">Tổng thanh toán:</span>
                <span className="font-mono text-primary dark:text-primary font-black text-sm whitespace-nowrap">
                  {formatVnd(payableTotal)}
                </span>
              </div>
            </div>

            {/* Payment Method Radio Options */}
            <div className="space-y-1.5 pt-0.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Phương Thức Thanh Toán
              </label>

              {/* VietQR Option */}
              <div
                onClick={() => setPaymentMethod("vietqr")}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  paymentMethod === "vietqr"
                    ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox
                    name="pm"
                    checked={paymentMethod === "vietqr"}
                    onChange={() => setPaymentMethod("vietqr")}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block text-xs whitespace-nowrap">
                      VietQR NAPAS
                    </span>
                    <span className="text-[10px] text-muted-foreground block whitespace-nowrap">
                      Xác thực tức thì
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-soft text-success-soft-foreground border border-success/25 whitespace-nowrap ml-2">
                  Tức thì
                </span>
              </div>

              {/* VNPay Option */}
              <div
                onClick={() => setPaymentMethod("vnpay")}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                  paymentMethod === "vnpay"
                    ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox
                    name="pm"
                    checked={paymentMethod === "vnpay"}
                    onChange={() => setPaymentMethod("vnpay")}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block text-xs whitespace-nowrap">
                      VNPay QR
                    </span>
                    <span className="text-[10px] text-muted-foreground block whitespace-nowrap">
                      ATM &amp; Thẻ quốc tế
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md whitespace-nowrap ml-2">
                  Cổng phụ
                </span>
              </div>
            </div>

            {/* CTA Button — chỉ mở được khi đã có giường thật đang chọn. */}
            <Button
              onClick={handleStartCheckout}
              disabled={!canBook || !activeBed.code || isHolding}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs rounded-lg"
            >
              <QrCode className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">
                {isHolding ? "Đang giữ chỗ…" : "Tạo VietQR & Xác Nhận Giữ Chỗ"}
              </span>
            </Button>

            {/* Nhả giữ chỗ — chỉ hiện khi thật sự đang giữ một giường trên máy chủ. */}
            {holdingBedCode && (
              <Button
                variant="outline"
                onClick={() => void releaseCurrentHold()}
                className="w-full h-9 text-xs font-bold"
              >
                <X className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">Huỷ giữ chỗ {holdingBedCode}</span>
              </Button>
            )}

            <p className="text-[10px] text-muted-foreground text-center leading-normal">
              Tự động duyệt 0-chạm & cấp Hợp đồng điện tử PDF tức thì khi có báo Có.
            </p>
          </div>
        </div>
      </div>

      {/* CHECKOUT & AUTO-APPROVAL POPUP MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-muted/70 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary text-white">
                  <QrCode className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Cổng Thanh Toán VietQR và Xét Duyệt Tự Động
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Khóa giữ chỗ giường {activeBed.code || "—"} · Hợp đồng K19
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {checkoutStep === "qr" && (
                <>
                  <div className="flex flex-col items-center justify-center p-4 bg-card rounded-xl border border-border">
                    {/* Dynamic QR Code graphic — sinh tại chỗ, không gọi dịch vụ ảnh ngoài */}
                    <div className="relative p-2 bg-white rounded-xl shadow-xs border border-border">
                      <QrCodeImage
                        value={`DORM_BOOKING_${activeBed.code}_${user?.studentId || "QE200001"}_${payableTotal}`}
                        size={240}
                        alt={`Mã thanh toán giữ giường ${activeBed.code}`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center p-1 border">
                          <span className="font-bold text-[9px] text-primary">VIETQR</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-center space-y-1">
                      <span className="text-xs font-bold whitespace-nowrap text-primary dark:text-primary">
                        Quét mã bằng app ngân hàng bất kỳ
                      </span>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Số tiền: <strong>{formatVnd(payableTotal)}</strong> • Nội dung:{" "}
                        <span className="bg-muted px-1 py-0.5 rounded text-foreground font-semibold">
                          KTX {user?.studentId || "QE200001"} {activeBed.code}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/70 p-3.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Cơ chế tự động xét duyệt</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        Đối soát giới tính: Nam khớp Tòa A
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        Tình trạng nợ cũ: 0 VNĐ, đủ điều kiện xếp phòng
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        Trạng thái sinh viên: Đang học chính quy K19
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCheckoutModal(false)}
                      className="flex-1 text-xs"
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      onClick={() => void handleConfirmPayment()}
                      disabled={isPaying}
                      className="flex-1 bg-success hover:bg-success text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <CircleCheck className="h-4 w-4" />
                      <span>{isPaying ? "Đang xử lý…" : "Xác nhận đã chuyển khoản"}</span>
                    </Button>
                  </div>
                </>
              )}

              {checkoutStep === "verifying" && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">
                      Hệ thống đang xét duyệt {autoApprovalProgress}%
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Kiểm tra đối soát số dư ngân hàng, khóa giường {activeBed.code} và khởi tạo hợp đồng điện tử...
                    </p>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="py-4 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-success-soft text-success-soft-foreground flex items-center justify-center">
                    <CircleCheck className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-foreground">
                      Đã thanh toán cọc · chờ Ban Quản lý duyệt
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Mã đơn: <strong className="font-mono text-primary">{paidBookingId ?? "Đang cập nhật"}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Bạn đã giữ giường <strong>{activeBed.code}</strong> và thanh toán tiền cọc. Ban Quản lý
                      KTX sẽ duyệt tự động nếu hồ sơ đủ điều kiện, sau đó hợp đồng điện tử được cấp.
                    </p>
                  </div>

                  <div className="p-3 bg-muted/70 rounded-xl text-left w-full text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sinh viên:</span>
                      <span className="font-semibold">{user?.fullName || "Nguyễn Hoàng Vinh"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phòng & Buồng:</span>
                      <span className="font-semibold">Phòng {activeRoom} - Buồng {selectedCompartment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày bắt đầu vào ở:</span>
                      <span className="font-semibold">05/09/2026</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={handleDownloadContract}
                      disabled={isGeneratingContract}
                      className="flex-1 min-w-0 bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                      <span className="one-line">
                        {isGeneratingContract ? "Đang tạo PDF..." : "Tải hợp đồng"}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCheckoutModal(false)}
                      className="text-xs shrink-0"
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
