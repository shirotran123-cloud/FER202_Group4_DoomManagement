import { cn } from "cn"
import { QR_DEFAULT_SIZE, useQrDataUrl } from "@/lib/qr"

/**
 * Ảnh mã QR dùng chung cho toàn app (VietQR thanh toán, QR qua cổng, QR giữ giường).
 *
 * Mã được sinh ngay trên trình duyệt qua `useQrDataUrl` — không gọi dịch vụ ảnh bên ngoài —
 * nên dữ liệu (MSSV, số tiền, nội dung chuyển khoản) không rời khỏi máy người dùng.
 *
 * Khung chờ và khung báo lỗi luôn đúng `size` x `size` để bố cục không nhảy khi ảnh về.
 */
export interface QrCodeProps {
  /** Nội dung mã hoá. Rỗng thì component hiện thông báo lỗi tiếng Việt thay vì ảnh. */
  value: string
  /** Cạnh ảnh, tính bằng px. Mặc định 200. */
  size?: number
  /** Mô tả ảnh cho trình đọc màn hình; bỏ trống thì tự sinh từ `value`. */
  alt?: string
  /** Class Tailwind thêm cho khối bao ngoài. */
  className?: string
  /** Dòng chú thích dưới mã (ví dụ "Đưa mã này cho bảo vệ"). */
  caption?: string
}

export function QrCode({ value, size = QR_DEFAULT_SIZE, alt, className, caption }: QrCodeProps) {
  const { dataUrl, loading, error } = useQrDataUrl(value, size)
  const box = { width: size, height: size }
  const label = alt ?? `Mã QR: ${value}`

  return (
    <div className={cn("inline-flex w-fit shrink-0 flex-col items-center gap-2", className)}>
      {dataUrl ? (
        <img
          src={dataUrl}
          width={size}
          height={size}
          alt={label}
          className="block rounded-lg border border-border bg-white"
          style={box}
        />
      ) : error ? (
        <div
          role="img"
          aria-label={error}
          style={box}
          className="flex items-center justify-center overflow-hidden rounded-lg border border-border bg-muted p-2 text-center text-[11px] font-semibold text-danger"
        >
          <span className="truncate">{error}</span>
        </div>
      ) : (
        // Khung chờ giữ đúng kích thước để modal không bị giật khi ảnh hiện ra.
        <div
          aria-hidden={loading}
          aria-busy="true"
          style={box}
          className="animate-pulse rounded-lg border border-border bg-muted"
        />
      )}
      {caption && <span className="max-w-full truncate text-xs whitespace-nowrap text-muted-foreground">{caption}</span>}
    </div>
  )
}

/**
 * Bí danh của {@link QrCode} cho các màn hình đang gọi theo tên `QrCodeImage`.
 * Cùng một component, chỉ khác tên gọi — giữ để không phải sửa các trang đã dùng tên cũ.
 */
export const QrCodeImage = QrCode
