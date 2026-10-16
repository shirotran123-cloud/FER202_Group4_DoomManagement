/**
 * Khai báo bổ sung cho gói `qrcode` (v1.5.4).
 *
 * Gói không kèm file .d.ts và dự án cũng không cài `@types/qrcode`, nên nếu không có
 * khai báo này thì TypeScript báo "Could not find a declaration file for module 'qrcode'".
 * Ở đây chỉ khai báo đúng phần API mà app dùng: `toDataURL` và `toCanvas` (dạng Promise).
 */
declare module "qrcode" {
  /** Mức sửa lỗi: L 7%, M 15%, Q 25%, H 30%. */
  export type QRCodeErrorCorrectionLevel = "low" | "medium" | "quartile" | "high" | "L" | "M" | "Q" | "H"

  export interface QRCodeOptions {
    /** Phiên bản QR (1-40). Bỏ trống để thư viện tự chọn. */
    version?: number
    errorCorrectionLevel?: QRCodeErrorCorrectionLevel
    /** Mẫu mặt nạ 0-7. Bỏ trống để thư viện tự chọn. */
    maskPattern?: number
    toSJISFunc?: (codePoint: string) => number
  }

  /** Tuỳ chọn chung của các renderer (canvas, data URL). */
  export interface QRCodeRenderersOptions extends QRCodeOptions {
    /** Số module viền trắng quanh mã. */
    margin?: number
    /** Số pixel cho mỗi module. */
    scale?: number
    /** Cạnh ảnh mong muốn, tính bằng pixel. */
    width?: number
    /** Màu hai lớp của mã, dạng mã màu CSS. */
    color?: {
      dark?: string
      light?: string
    }
  }

  export interface QRCodeToDataURLOptions extends QRCodeRenderersOptions {
    /** Kiểu ảnh xuất ra, mặc định "image/png". */
    type?: string
    rendererOpts?: {
      quality?: number
    }
  }

  /** Tạo ảnh QR và trả về data URL (mặc định PNG). */
  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>

  /** Vẽ mã QR trực tiếp lên một phần tử canvas có sẵn. */
  export function toCanvas(
    canvasElement: HTMLCanvasElement,
    text: string,
    options?: QRCodeRenderersOptions,
  ): Promise<HTMLCanvasElement>
}
