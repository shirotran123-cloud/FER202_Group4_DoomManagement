/**
 * Đọc kích thước ảnh JPEG/PNG mà không cần thư viện ngoài.
 *
 * Dùng để kiểm tra ảnh tải về có hợp lệ và có đúng tỉ lệ khung mà giao diện cần
 * hay không — nhất là ảnh hành lang, vì nó được cắt bằng `object-cover` ở khung
 * 380px/460px nên tỉ lệ quyết định ảnh có bị cắt mất cửa phòng hay không.
 *
 * Chạy: node scripts/image-info.mjs <file> [file...]
 */
import fs from "node:fs"
import path from "node:path"

/** Đọc kích thước từ header: JPEG (SOF marker) hoặc PNG (IHDR). */
function readSize(buf) {
  // PNG: 8 byte signature rồi tới IHDR, width/height ở offset 16 và 20.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { type: "PNG", width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }

  // JPEG: quét các marker, dừng ở marker SOF (bắt đầu khung ảnh).
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2
    while (off < buf.length - 8) {
      if (buf[off] !== 0xff) {
        off++
        continue
      }
      const marker = buf[off + 1]
      // SOF0..SOF15, bỏ SOF4/8/12 (không phải khung ảnh).
      const isSOF = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
      if (isSOF) {
        const height = buf.readUInt16BE(off + 5)
        const width = buf.readUInt16BE(off + 7)
        return { type: "JPEG", width, height }
      }
      const len = buf.readUInt16BE(off + 2)
      if (len < 2) break
      off += 2 + len
    }
    return { type: "JPEG", width: null, height: null }
  }

  return { type: "UNKNOWN", width: null, height: null }
}

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error("Thiếu đường dẫn. Ví dụ: node scripts/image-info.mjs public/assets/a.jpg")
  process.exit(2)
}

for (const rel of files) {
  const file = path.resolve(process.cwd(), rel)
  if (!fs.existsSync(file)) {
    console.log(`${rel}: KHÔNG CÓ FILE`)
    continue
  }
  const buf = fs.readFileSync(file)
  const { type, width, height } = readSize(buf)
  const ratio = width && height ? (width / height).toFixed(3) : "?"
  const sizeKb = (buf.length / 1024).toFixed(1)
  console.log(
    `${rel}\n  ${type} · ${width}x${height} · tỉ lệ ${ratio} · ${sizeKb} KB`,
  )
}
