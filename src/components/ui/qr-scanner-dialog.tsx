/**
 * QrScannerDialog — hộp thoại quét mã QR bằng camera.
 *
 * Dùng ở cổng KTX: bảo vệ mở hộp thoại, đưa thẻ sinh viên vào khung ngắm, hệ
 * thống giải mã và trả payload thô ra ngoài qua `onDetected`.
 *
 * Hộp thoại tự tắt camera khi đóng hoặc unmount, và hiển thị thông báo tiếng
 * Việt rõ ràng khi trình duyệt không cho phép dùng camera.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, CameraOff, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { startQrScanner, type QrScannerHandle } from "@/lib/qr-scanner"

interface QrScannerDialogProps {
  open: boolean
  onClose: () => void
  /** Nhận nội dung thô đã giải mã. Hộp thoại tự đóng sau khi gọi. */
  onDetected: (text: string) => void
  /** Tiêu đề hộp thoại. */
  title?: string
  className?: string
}

export function QrScannerDialog({
  open,
  onClose,
  onDetected,
  title = "Quét mã QR thẻ sinh viên",
  className,
}: QrScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const scannerRef = useRef<QrScannerHandle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  // Giữ callback trong ref để không phải khởi động lại camera khi cha re-render.
  const onDetectedRef = useRef(onDetected)
  useEffect(() => {
    onDetectedRef.current = onDetected
  }, [onDetected])

  const handleClose = useCallback(() => {
    scannerRef.current?.stop()
    scannerRef.current = null
    setError(null)
    setStarting(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const video = videoRef.current
    if (!video) return

    let cancelled = false
    setError(null)
    setStarting(true)

    const scanner = startQrScanner({
      video,
      overlayCanvas: overlayRef.current,
      onResult: (result) => {
        onDetectedRef.current(result.text)
        // Một mã là đủ cho một lượt quét cổng.
        scannerRef.current?.stop()
        scannerRef.current = null
        setStarting(false)
        onClose()
      },
      onError: (message) => {
        if (!cancelled) {
          setError(message)
          setStarting(false)
        }
      },
    })
    scannerRef.current = scanner

    scanner.ready
      .then(() => {
        if (!cancelled) setStarting(false)
      })
      .catch(() => {
        if (!cancelled) setStarting(false)
      })

    return () => {
      cancelled = true
      scanner.stop()
      scannerRef.current = null
    }
  }, [open, onClose])

  // Đóng bằng phím Esc cho tiện thao tác ở quầy trực cổng.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, handleClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
    >
      <div className={cn("dms-card w-full max-w-lg overflow-hidden", className)}>
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold whitespace-nowrap">
            <Camera className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{title}</span>
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} aria-label="Đóng hộp thoại quét mã">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative aspect-square w-full bg-foreground/90">
          <video
            ref={videoRef}
            className={cn("h-full w-full object-cover", error && "invisible")}
            playsInline
            muted
          />
          <canvas
            ref={overlayRef}
            width={480}
            height={480}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {starting && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-full bg-background/90 px-4 py-2 text-xs font-bold whitespace-nowrap">
                Đang mở camera…
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <CameraOff className="h-8 w-8 text-danger-foreground" />
              <p className="text-sm font-bold text-background">{error}</p>
              <p className="text-xs text-background/80">
                Vẫn có thể nhập MSSV thủ công ở ô bên ngoài.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="truncate text-xs whitespace-nowrap text-muted-foreground">
            Đưa mã QR trên thẻ sinh viên vào giữa khung ngắm.
          </p>
          <Button variant="outline" size="sm" onClick={handleClose} className="shrink-0 whitespace-nowrap">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
