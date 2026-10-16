/**
 * Sinh mã QR ngay trên trình duyệt bằng gói `qrcode` (không gọi dịch vụ ảnh bên ngoài).
 *
 * Vì sao cần module này:
 *  - Trước đây UI nhúng ảnh từ `https://api.qrserver.com/v1/create-qr-code/...`, tức là
 *    mọi nội dung QR (MSSV, số tiền, nội dung chuyển khoản) đều bị gửi ra Internet và
 *    ảnh không hiện được khi mất mạng. Sinh tại chỗ giữ dữ liệu trong máy sinh viên và
 *    luôn hoạt động offline.
 *  - Các modal (VietQR, QR qua cổng, QR đặt giường) mở/đóng liên tục nên kết quả được
 *    ghi nhớ trong một cache nhỏ, tránh vẽ lại cùng một mã nhiều lần.
 *
 * Quy ước chung của dự án: hàm ở tầng `lib` ném `Error` với thông điệp tiếng Việt để UI
 * hiển thị thẳng; riêng hook `useQrDataUrl` không bao giờ ném ra ngoài mà trả lỗi qua
 * trường `error` để component không bị vỡ khi render.
 */
import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

/** Cạnh mặc định của ảnh QR (px). Dùng chung cho mọi nơi hiển thị QR trong app. */
export const QR_DEFAULT_SIZE = 200

/** Thông điệp khi chưa có nội dung để sinh mã — UI hiện thẳng cho người dùng. */
export const QR_EMPTY_MESSAGE = "Chưa có nội dung để tạo mã QR"

/** Số mã QR tối đa được ghi nhớ; vượt ngưỡng thì xoá mã cũ nhất (cache không phình vô hạn). */
export const QR_CACHE_LIMIT = 50

/** Màu mã QR đồng bộ với hệ màu của app (xám đậm trên nền trắng, đủ tương phản để quét). */
const QR_DARK = "#111827"
const QR_LIGHT = "#FFFFFF"

/** Tuỳ chọn render dùng chung cho cả ảnh data URL và canvas. */
const renderOptions = (size: number) => ({
  width: size,
  margin: 0,
  errorCorrectionLevel: "M" as const,
  color: { dark: QR_DARK, light: QR_LIGHT },
})

/**
 * Cache trong bộ nhớ, khoá theo `payload|size`.
 * Map giữ thứ tự chèn nên phần tử đầu tiên luôn là phần tử cũ nhất → đó là phần tử bị đẩy ra.
 */
const qrCache = new Map<string, string>()

function cacheKey(payload: string, size: number): string {
  return `${payload}|${size}`
}

/** Đọc cache; chạm vào một khoá thì đưa khoá đó lên cuối (LRU). */
function readCache(key: string): string | null {
  const hit = qrCache.get(key)
  if (hit === undefined) return null
  qrCache.delete(key)
  qrCache.set(key, hit)
  return hit
}

/** Ghi cache và cắt bớt nếu vượt giới hạn. */
function writeCache(key: string, value: string): void {
  qrCache.delete(key)
  qrCache.set(key, value)
  while (qrCache.size > QR_CACHE_LIMIT) {
    const oldest = qrCache.keys().next()
    if (oldest.done) break
    qrCache.delete(oldest.value)
  }
}

/** Chuẩn hoá kích thước: số nguyên dương, tối thiểu 32px để mã còn quét được. */
function normalizeSize(size?: number): number {
  if (!Number.isFinite(size)) return QR_DEFAULT_SIZE
  const px = Math.floor(size as number)
  if (px < 32) return 32
  if (px > 2048) return 2048
  return px
}

/** Nội dung rỗng/ khoảng trắng thì không có gì để mã hoá. */
function isBlank(payload: string | null | undefined): boolean {
  return !payload || payload.trim().length === 0
}

/**
 * Sinh ảnh QR dạng data URL (PNG) từ nội dung và kích thước cho trước.
 *
 * Kết quả được cache theo `payload|size` nên các modal mở lại không phải vẽ lại.
 *
 * @param payload Nội dung mã hoá (ví dụ `DMS-GATE|QE200001|2026-01-01`).
 * @param size    Cạnh ảnh mong muốn, tính bằng px (mặc định {@link QR_DEFAULT_SIZE}).
 * @throws Error với thông điệp tiếng Việt khi nội dung trống.
 */
export async function generateQrDataUrl(payload: string, size?: number): Promise<string> {
  if (isBlank(payload)) throw new Error(QR_EMPTY_MESSAGE)
  const text = payload.trim()
  const px = normalizeSize(size)
  const key = cacheKey(text, px)

  const cached = readCache(key)
  if (cached) return cached

  const dataUrl = await QRCode.toDataURL(text, renderOptions(px))
  writeCache(key, dataUrl)
  return dataUrl
}

/**
 * Vẽ mã QR trực tiếp lên một phần tử `<canvas>` có sẵn.
 * Dùng cho màn hình cần canvas thay vì thẻ `<img>` (ví dụ xử lý ảnh trước khi tải về).
 *
 * @throws Error với thông điệp tiếng Việt khi canvas không hợp lệ hoặc nội dung trống.
 */
export async function drawQrToCanvas(canvas: HTMLCanvasElement, payload: string, size?: number): Promise<void> {
  if (!canvas || typeof canvas.getContext !== "function") {
    throw new Error("Không tìm thấy vùng canvas để vẽ mã QR")
  }
  if (isBlank(payload)) throw new Error(QR_EMPTY_MESSAGE)
  await QRCode.toCanvas(canvas, payload.trim(), renderOptions(normalizeSize(size)))
}

/** Bộ giá trị hook trả về, tách riêng để component khai báo kiểu khi cần. */
export interface UseQrDataUrlResult {
  dataUrl: string | null
  loading: boolean
  error: string | null
}

/**
 * Hook sinh QR an toàn cho React.
 *
 * An toàn ở đây nghĩa là:
 *  - Đổi `payload`/`size` hoặc unmount sẽ huỷ kết quả đang chờ → không set state sau khi unmount.
 *  - Kết quả của lần render cũ không bao giờ ghi đè kết quả mới (mỗi lần chạy có số thứ tự riêng).
 *  - Mọi lỗi (nội dung trống, lỗi thư viện) chỉ nằm trong `error`, không ném ra ngoài render.
 */
export function useQrDataUrl(payload: string | null | undefined, size?: number): UseQrDataUrlResult {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Số thứ tự của lần yêu cầu mới nhất; kết quả về muộn hơn số hiện tại thì bị bỏ.
  const requestIdRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    // Chỉ lần chạy mới nhất được phép ghi state.
    const isStale = () => cancelled || requestId !== requestIdRef.current

    // Chuẩn hoá ngay tại đây để TypeScript biết chắc `text` là string ở các bước sau.
    const text = typeof payload === "string" ? payload.trim() : ""

    if (text.length === 0) {
      setDataUrl(null)
      setLoading(false)
      setError(QR_EMPTY_MESSAGE)
      return () => {
        cancelled = true
      }
    }

    const px = normalizeSize(size)
    const key = cacheKey(text, px)
    const cached = readCache(key)
    if (cached) {
      // Có sẵn trong cache: hiện ngay, không nhấp nháy trạng thái tải.
      setDataUrl(cached)
      setLoading(false)
      setError(null)
      return () => {
        cancelled = true
      }
    }

    setLoading(true)
    setError(null)

    generateQrDataUrl(text, px)
      .then((url) => {
        if (isStale()) return
        setDataUrl(url)
        setLoading(false)
        setError(null)
      })
      .catch((err: unknown) => {
        if (isStale()) return
        setDataUrl(null)
        setLoading(false)
        setError(err instanceof Error ? err.message : "Không tạo được mã QR, vui lòng thử lại")
      })

    return () => {
      cancelled = true
    }
  }, [payload, size])

  return { dataUrl, loading, error }
}
