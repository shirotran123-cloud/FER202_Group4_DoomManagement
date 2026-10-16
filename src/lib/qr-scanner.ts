/**
 * Quét mã QR bằng camera thật (getUserMedia + jsQR).
 *
 * Dùng cho cổng KTX: bảo vệ bấm "Quét mã" → mở camera → giải mã QR trên thẻ
 * sinh viên → trả payload thô cho trang gọi, trang đó đối chiếu với định dạng
 * `DMS-GATE|...` và gọi backend.
 *
 * Nguyên tắc an toàn & ổn định:
 *  - Chỉ xin `facingMode: environment` (camera sau) để quét dễ hơn trên điện thoại.
 *  - Luôn giải phóng track khi dừng/unmount, nếu không đèn camera sáng mãi.
 *  - Ưu tiên `BarcodeDetector` gốc của trình duyệt khi có (nhanh, ít tốn CPU),
 *    tự động lùi về jsQR khi không hỗ trợ.
 *  - Vòng lặp giải mã dùng requestAnimationFrame nhưng chỉ quét cách nhau
 *    SCAN_INTERVAL_MS để không đốt CPU.
 *  - Không quét khi component đã unmount (cờ `stopped`).
 */
import jsQR from "jsqr"

/** Khoảng cách tối thiểu giữa hai lần giải mã (ms). */
const SCAN_INTERVAL_MS = 180

export interface QrScanResult {
  /** Nội dung thô giải mã được. */
  text: string
  /** Nguồn giải mã: API gốc của trình duyệt hay jsQR. */
  engine: "barcode-detector" | "jsqr"
}

export interface QrScannerOptions {
  /** Phần tử <video> đã gắn vào DOM. */
  video: HTMLVideoElement
  /**
   * Gọi mỗi khi giải mã thành công. Trả `true` để dừng quét (mặc định),
   * trả `false` nếu muốn tiếp tục quét mã khác.
   */
  onResult: (result: QrScanResult) => boolean | void
  /** Gọi khi có lỗi không thể phục hồi (không có camera, bị từ chối quyền…). */
  onError?: (message: string) => void
  /** Bật/tắt việc vẽ khung ngắm lên canvas phủ (tuỳ chọn). */
  overlayCanvas?: HTMLCanvasElement | null
}

export interface QrScannerHandle {
  /** Dừng quét và tắt camera. Gọi nhiều lần cũng an toàn. */
  stop: () => void
  /** Promise hoàn tất khi camera đã sẵn sàng phát hình. */
  ready: Promise<void>
}

/** Thông báo lỗi tiếng Việt theo mã lỗi của getUserMedia. */
function cameraErrorMessage(err: unknown): string {
  const name = (err as { name?: string })?.name ?? ""
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Trình duyệt chưa được cấp quyền dùng camera. Hãy cho phép truy cập camera rồi thử lại."
    case "NotFoundError":
    case "OverconstrainedError":
      return "Không tìm thấy camera trên thiết bị này. Hãy dùng ô nhập MSSV thủ công."
    case "NotReadableError":
      return "Camera đang bị ứng dụng khác chiếm dụng. Hãy đóng ứng dụng đó rồi thử lại."
    default:
      return "Không mở được camera để quét mã QR. Hãy dùng ô nhập MSSV thủ công."
  }
}

/** Trình duyệt có hỗ trợ BarcodeDetector không. */
function hasBarcodeDetector(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window
}

/**
 * Mở camera và bắt đầu quét QR vào một thẻ <video>.
 *
 * Trả về handle để trang gọi có thể dừng. Nếu camera không mở được, `ready`
 * sẽ reject kèm thông báo tiếng Việt và `onError` cũng được gọi.
 */
export function startQrScanner(options: QrScannerOptions): QrScannerHandle {
  const { video, onResult, onError, overlayCanvas } = options

  let stopped = false
  let rafId = 0
  let lastScanAt = 0
  let stream: MediaStream | null = null
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d", { willReadFrequently: true })

  const stopCamera = () => {
    if (stream) {
      for (const track of stream.getTracks()) track.stop()
      stream = null
    }
    if (video.srcObject) video.srcObject = null
  }

  const stop = () => {
    if (stopped) return
    stopped = true
    if (rafId) cancelAnimationFrame(rafId)
    stopCamera()
  }

  /** Vẽ khung ngắm đơn giản để người dùng biết đưa mã vào giữa. */
  const drawOverlay = () => {
    if (!overlayCanvas) return
    const c = overlayCanvas.getContext("2d")
    if (!c) return
    const w = overlayCanvas.width
    const h = overlayCanvas.height
    c.clearRect(0, 0, w, h)
    const size = Math.min(w, h) * 0.62
    const x = (w - size) / 2
    const y = (h - size) / 2
    c.strokeStyle = "#4f46e5"
    c.lineWidth = 3
    c.strokeRect(x, y, size, size)
  }

  /** Bắt đầu vòng lặp giải mã bằng API gốc của trình duyệt. */
  const runBarcodeDetectorLoop = (detector: { detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> }) => {
    const tick = async () => {
      if (stopped) return
      const now = performance.now()
      if (now - lastScanAt >= SCAN_INTERVAL_MS && video.readyState >= 2) {
        lastScanAt = now
        try {
          const codes = await detector.detect(video)
          const text = codes.find((c) => c.rawValue)?.rawValue
          if (text) {
            const keepGoing = onResult({ text, engine: "barcode-detector" }) === false
            if (!keepGoing) {
              stop()
              return
            }
          }
        } catch {
          // Lỗi từng khung hình (video chưa sẵn sàng) không đáng dừng cả phiên.
        }
      }
      if (!stopped) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  /** Vòng lặp giải mã bằng jsQR trên canvas. */
  const runJsQrLoop = () => {
    if (!ctx) {
      onError?.("Trình duyệt không hỗ trợ đọc điểm ảnh để quét mã QR.")
      stop()
      return
    }
    const tick = () => {
      if (stopped) return
      const now = performance.now()
      if (now - lastScanAt >= SCAN_INTERVAL_MS && video.readyState >= 2 && video.videoWidth > 0) {
        lastScanAt = now
        const w = video.videoWidth
        const h = video.videoHeight
        // Thu nhỏ khung hình để giải mã nhanh hơn; QR vẫn đủ độ phân giải.
        const maxSide = 640
        const scale = Math.min(1, maxSide / Math.max(w, h))
        canvas.width = Math.round(w * scale)
        canvas.height = Math.round(h * scale)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        try {
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const found = jsQR(image.data, image.width, image.height, { inversionAttempts: "attemptBoth" })
          if (found?.data) {
            const keepGoing = onResult({ text: found.data, engine: "jsqr" }) === false
            if (!keepGoing) {
              stop()
              return
            }
          }
        } catch {
          // Bỏ qua khung hình lỗi, thử lại ở khung sau.
        }
      }
      if (!stopped) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  const ready = (async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = "Trình duyệt không hỗ trợ camera. Hãy dùng ô nhập MSSV thủ công."
      onError?.(msg)
      throw new Error(msg)
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
    } catch (err) {
      const msg = cameraErrorMessage(err)
      onError?.(msg)
      throw new Error(msg)
    }
    if (stopped) {
      // Bị dừng trong lúc chờ cấp quyền — tắt ngay để không bật đèn camera.
      stopCamera()
      return
    }
    video.srcObject = stream
    video.setAttribute("playsinline", "true")
    video.muted = true
    try {
      await video.play()
    } catch {
      // Một số trình duyệt báo lỗi play() dù vẫn phát; bỏ qua.
    }
    drawOverlay()

    if (hasBarcodeDetector()) {
      type DetectorCtor = new (opts: { formats: string[] }) => {
        detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>
      }
      const Ctor = (window as unknown as { BarcodeDetector: DetectorCtor }).BarcodeDetector
      try {
        const detector = new Ctor({ formats: ["qr_code"] })
        runBarcodeDetectorLoop(detector)
        return
      } catch {
        // Trình duyệt có API nhưng không hỗ trợ qr_code -> lùi về jsQR.
      }
    }
    runJsQrLoop()
  })()

  // Nuốt rejection để không tạo unhandled rejection khi trang không await.
  ready.catch(() => undefined)

  return { stop, ready }
}
