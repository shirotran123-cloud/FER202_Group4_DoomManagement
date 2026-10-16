/**
 * Nhúng font TrueType Unicode (Roboto) vào jsPDF để PDF hiển thị đúng tiếng Việt.
 *
 * VÌ SAO CẦN:
 * 13 font chuẩn của PDF (helvetica/times/courier) chỉ có bảng mã WinAnsi → không có
 * glyph cho "ơ ư đ ỹ ỵ ỗ ậ ệ ₫". Trước đây `src/lib/pdfGenerator.ts` phải bóc dấu
 * bằng `.normalize('NFD')` nên "Nguyễn Hoàng Vinh" bị hạ thành "Nguyen Hoang Vinh".
 *
 * CÁCH LÀM:
 * Nạp file TTF thật trong `public/assets/fonts/` (Vite phục vụ `public/` tại gốc web,
 * xem `vite.config.ts` — không override `publicDir`/`base`), chuyển sang base64, nạp
 * vào virtual file system của jsPDF rồi `addFont` với encoding mặc định `Identity-H`
 * (TrueType + ToUnicode CMap). Nhờ vậy chuỗi tiếng Việt được giữ nguyên 100% dấu.
 *
 * FALLBACK (quan trọng — không bao giờ tạo PDF chữ vỡ):
 *  - `registerPdfFonts` NÉM `PdfFontError` (message tiếng Việt) nếu thiếu font.
 *  - `tryRegisterPdfFonts` trả `false` để caller chủ động dừng / báo lỗi UI.
 *  - Không có nhánh nào âm thầm quay về helvetica: chữ không dấu là lỗi nghiệp vụ,
 *    không phải phương án dự phòng.
 */

import type jsPDF from 'jspdf'

/** Họ font dùng cho nội dung thường và tiêu đề (đăng ký style `normal` + `bold`). */
export const PDF_FONT_FAMILY = 'Roboto'
/** Họ font weight 500, dùng cho tiêu đề mục nhỏ. Style `normal`. */
export const PDF_FONT_FAMILY_MEDIUM = 'Roboto-Medium'

/** Thư mục font mặc định — khớp `public/assets/fonts/` khi `base` của Vite là `/`. */
export const DEFAULT_FONT_BASE_URL = '/assets/fonts'

interface FontAsset {
  /** Tên file trong `public/assets/fonts/`. */
  file: string
  /** Khoá trong VFS của jsPDF; cũng là `postScriptName` truyền cho `addFont`. */
  vfsName: string
  family: string
  style: 'normal' | 'bold'
}

const FONT_ASSETS: readonly FontAsset[] = [
  { file: 'roboto-400.ttf', vfsName: 'roboto-400.ttf', family: PDF_FONT_FAMILY, style: 'normal' },
  { file: 'roboto-500.ttf', vfsName: 'roboto-500.ttf', family: PDF_FONT_FAMILY_MEDIUM, style: 'normal' },
  { file: 'roboto-700.ttf', vfsName: 'roboto-700.ttf', family: PDF_FONT_FAMILY, style: 'bold' },
]

export interface RegisterPdfFontsOptions {
  /** Ghi đè thư mục font, ví dụ khi deploy dưới sub-path. Mặc định `/assets/fonts`. */
  baseUrl?: string
}

/** Lỗi nạp font — message tiếng Việt để hiển thị thẳng cho người dùng. */
export class PdfFontError extends Error {
  /** Danh sách file không nạp được. */
  readonly fontFiles: string[]

  constructor(message: string, fontFiles: string[] = []) {
    super(message)
    this.name = 'PdfFontError'
    this.fontFiles = fontFiles
  }
}

/**
 * Cache base64 theo URL, ở phạm vi module.
 * Mỗi file ~168KB; không cache thì mỗi lần xuất PDF lại tải lại 3 file (~500KB).
 */
const base64Cache = new Map<string, string>()
/** Gộp các lời gọi song song cho cùng một URL thành một request. */
const inflightCache = new Map<string, Promise<string>>()

/** Xoá cache — dùng cho test hoặc khi đổi `baseUrl`. */
export function clearPdfFontCache(): void {
  base64Cache.clear()
  inflightCache.clear()
}

const joinUrl = (baseUrl: string, file: string): string =>
  `${baseUrl.replace(/\/+$/, '')}/${file}`

/** ArrayBuffer → base64, chia khối để không vỡ stack với file ~168KB. */
const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  const parts: string[] = []
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    parts.push(String.fromCharCode(...bytes.subarray(offset, offset + chunkSize)))
  }
  return btoa(parts.join(''))
}

/** Tải 1 TTF và trả base64; có cache + gộp request trùng. */
async function loadFontBase64(url: string): Promise<string> {
  const cached = base64Cache.get(url)
  if (cached !== undefined) return cached
  const pending = inflightCache.get(url)
  if (pending) return pending

  const task = (async (): Promise<string> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new PdfFontError(
        `Không tải được font "${url}" (HTTP ${response.status}). Kiểm tra public/assets/fonts/.`,
        [url],
      )
    }
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength === 0) {
      throw new PdfFontError(`File font "${url}" rỗng.`, [url])
    }
    const base64 = toBase64(buffer)
    base64Cache.set(url, base64)
    return base64
  })()

  inflightCache.set(url, task)
  try {
    return await task
  } catch (error) {
    inflightCache.delete(url)
    if (error instanceof PdfFontError) throw error
    throw new PdfFontError(
      `Lỗi khi tải font "${url}": ${error instanceof Error ? error.message : String(error)}`,
      [url],
    )
  } finally {
    inflightCache.delete(url)
  }
}

/**
 * Nạp 3 file Roboto (có cache) rồi đăng ký vào `doc`.
 *
 * @throws {PdfFontError} khi thiếu/máy chủ lỗi file TTF — caller phải dừng lại,
 * KHÔNG được vẽ bằng helvetica vì sẽ mất dấu tiếng Việt.
 */
export async function registerPdfFonts(doc: jsPDF, options: RegisterPdfFontsOptions = {}): Promise<void> {
  const baseUrl = options.baseUrl ?? DEFAULT_FONT_BASE_URL
  const failed: string[] = []

  const loaded = await Promise.all(
    FONT_ASSETS.map(async (asset) => {
      const url = joinUrl(baseUrl, asset.file)
      try {
        return { asset, base64: await loadFontBase64(url) }
      } catch {
        failed.push(asset.file)
        return null
      }
    }),
  )

  if (failed.length > 0) {
    throw new PdfFontError(
      `Không nạp được font Unicode cho PDF: ${failed.join(', ')}. ` +
        'Kiểm tra public/assets/fonts/ rồi thử lại — PDF không thể hiển thị đúng tiếng Việt nếu thiếu font.',
      failed,
    )
  }

  for (const item of loaded) {
    if (!item) continue
    const { asset, base64 } = item
    // addFileToVFS + addFont: postScriptName PHẢI trùng tên file trong VFS, vì jsPDF
    // đọc lại font qua `existsFileInVFS(font.postScriptName)`.
    doc.addFileToVFS(asset.vfsName, base64)
    // Không truyền fontWeight/encoding → jsPDF dùng mặc định "Identity-H" (chuẩn cho TTF Unicode).
    doc.addFont(asset.vfsName, asset.family, asset.style)
  }
}

/**
 * Bản không ném lỗi: trả `false` nếu không nạp được font (đã log lỗi ra console).
 * Caller PHẢI xử lý `false` bằng cách dừng xuất file / báo UI, không vẽ tiếp.
 */
export async function tryRegisterPdfFonts(
  doc: jsPDF,
  options: RegisterPdfFontsOptions = {},
): Promise<boolean> {
  try {
    await registerPdfFonts(doc, options)
    return true
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    return false
  }
}

/** Kiểm tra `doc` đã có font Unicode chưa (dùng để chặn vẽ chữ mất dấu). */
export function hasPdfFonts(doc: jsPDF): boolean {
  const list = doc.getFontList()
  return Boolean(list[PDF_FONT_FAMILY]?.includes('normal') && list[PDF_FONT_FAMILY]?.includes('bold'))
}
