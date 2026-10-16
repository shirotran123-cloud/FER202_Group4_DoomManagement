// TEMP byte-level verification of the real PDF module chain.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { inflateSync } from 'node:zlib'
import type jsPDF from 'jspdf'
import { buildInvoicePdfDoc } from '@/lib/invoicePdf'
import { generateContractPDF } from '@/lib/pdfGenerator'
import { buildHandoverPdfDoc } from './handover.generated.ts'

// fontEmbed.ts loads the TTF over `fetch('/assets/fonts/...')` (a browser URL).
// Serve those paths from disk so the REAL registerPdfFonts path runs unchanged.
const realFetch = globalThis.fetch
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (url.startsWith('/assets/fonts/')) {
    const bytes = readFileSync(join(process.cwd(), 'public', url))
    return new Response(new Uint8Array(bytes), { status: 200 })
  }
  return realFetch(input as RequestInfo, init)
}) as typeof fetch

const pdfBytes = async (doc: jsPDF): Promise<Uint8Array> =>
  new Uint8Array(doc.output('arraybuffer') as ArrayBuffer)

export interface PdfProbe {
  label: string
  byteLength: number
  header: string
  fontFile2Count: number
  toUnicodeCount: number
  identityHCount: number
  /** Number of `/Type /Page` objects — proves deletePage(1) removed the invoice page. */
  pageObjectCount: number
  /** Vietnamese codepoints mapped by every `/ToUnicode` CMap in the file. */
  vietnameseCodepointsMapped: string[]
  /** Non-ASCII chars printed by the document but MISSING from every ToUnicode CMap. */
  unmappedRequiredChars: string[]
}

const VIETNAMESE_PROBES: Array<[string, string]> = [
  ['ế', '1EBF'],
  ['ệ', '1EC7'],
  ['đ', '0111'],
  ['ơ', '01A1'],
  ['ư', '01B0'],
  ['ỹ', '1EF9'],
  ['ạ', '1EA1'],
  ['Ở', '1EDE'],
]

/**
 * Extract the `/ToUnicode` CMap bodies. jsPDF emits these uncompressed here, but
 * inflate any FlateDecode streams too so the probe survives a compressed build.
 */
function cmapBodies(bytes: Uint8Array): string {
  const raw = Buffer.from(bytes).toString('latin1')
  const parts: string[] = []
  const collect = (text: string): void => {
    const re = /begincmap([\s\S]*?)endcmap/g
    let match: RegExpExecArray | null
    while ((match = re.exec(text)) !== null) parts.push(match[0])
  }
  collect(raw)
  const streamRe = /stream\r?\n/g
  let match: RegExpExecArray | null
  while ((match = streamRe.exec(raw)) !== null) {
    const start = match.index + match[0].length
    const end = raw.indexOf('endstream', start)
    if (end < 0) continue
    try {
      collect(inflateSync(Buffer.from(raw.slice(start, end), 'latin1')).toString('latin1'))
    } catch {
      // Not a Flate stream (e.g. the raw TTF FontFile2) — skip.
    }
  }
  return parts.join('\n')
}

/** Every UTF-16BE codepoint a `/ToUnicode` CMap maps a glyph onto. */
function mappedCodepoints(cmaps: string): Set<string> {
  const mapped = new Set<string>()
  for (const entry of cmaps.matchAll(/<([0-9A-Fa-f]{4,8})>\s*<([0-9A-Fa-f]{4,8})>/g)) {
    const dest = entry[2].toUpperCase()
    for (let i = 0; i + 4 <= dest.length; i += 4) mapped.add(dest.slice(i, i + 4))
  }
  return mapped
}
export const HANDOVER_TEXT = [
  'KÝ TÚC XÁ FPT',
  'Ban quản lý Ký túc xá · Khu Công nghệ cao Hòa Lạc, Hà Nội',
  'BIÊN BẢN BÀN GIAO TÀI SẢN PHÒNG Ở',
  'Nguyễn Hoàng Vinh',
  'Tòa A (Nam)',
  'Buồng B1',
  'Tiền cọc giữ quỹ',
  'CHỈ SỐ CÔNG TƠ BÀN GIAO',
  'Điện tiêu thụ',
  'Nước sinh hoạt',
  'Đồng hồ tại buồng',
  'DANH MỤC TÀI SẢN ĐÃ BÀN GIAO',
  'Khung giường tầng & Thang leo',
  'Chắc chắn, không rỉ sét',
  'Đệm Foam Orthopedic 1.0m x 2.0m',
  'Bọc ga mới nguyên vẹn',
  'Tủ Locker cá nhân kèm khóa số',
  'Đã reset mã PIN mặc định',
  'Thẻ từ ra vào phòng A205',
  'Điều hòa Inverter Daikin 2HP',
  'Sinh viên đã nhận đủ tài sản đúng hiện trạng trên. Hư hỏng phát sinh trong thời gian lưu trú phải báo ngay qua mục Báo Hỏng / Sửa Chữa để được xử lý trước khi trả phòng.',
  'Đại diện Ban quản lý',
  'Sinh viên nhận phòng',
  '(Ký số)',
  'Biên bản bàn giao',
  'Trang 1/1',
].join('\n')

/** Distinct non-ASCII codepoints in a sample of the text the PDF prints. */
export const requiredCodepoints = (): Array<[string, string]> => {
  const seen = new Map<string, string>()
  for (const char of HANDOVER_TEXT) {
    const code = char.codePointAt(0)
    if (code === undefined || code < 0x80) continue
    seen.set(char, code.toString(16).toUpperCase().padStart(4, '0'))
  }
  return [...seen.entries()]
}

export function probe(label: string, bytes: Uint8Array): PdfProbe {
  const text = Buffer.from(bytes).toString('latin1')
  const count = (needle: string): number => text.split(needle).length - 1
  const mapped: string[] = []
  const mappedSet = mappedCodepoints(cmapBodies(bytes))
  for (const [char, hex] of VIETNAMESE_PROBES) {
    if (mappedSet.has(hex)) mapped.push(`${char}/U+${hex}`)
  }
  const required = requiredCodepoints()
  const unmapped = required
    .filter(([, hex]) => !mappedSet.has(hex))
    .map(([char, hex]) => `${char}/U+${hex}`)

  return {
    label,
    byteLength: bytes.byteLength,
    header: Buffer.from(bytes.subarray(0, 8)).toString('latin1'),
    fontFile2Count: count('/FontFile2'),
    toUnicodeCount: count('/ToUnicode'),
    identityHCount: count('/Identity-H'),
    pageObjectCount: count('/Type /Page\n') + count('/Type /Page '),
    vietnameseCodepointsMapped: mapped,
    unmappedRequiredChars: unmapped,
  }
}

export async function runAll(): Promise<PdfProbe[]> {
  // 1. Invoice path (also the document source the handover builder reuses).
  const invoiceDoc = await buildInvoicePdfDoc({
    invoiceCode: 'INV-2026-09-A205',
    billingMonth: '2026-09',
    issueDate: '2026-09-05',
    student: {
      fullName: 'Nguyễn Hoàng Vinh',
      mssv: 'QE200001',
      room: 'A205',
      bedCode: 'A205-B1-G03',
      phone: '0912 345 678',
      building: 'Tòa A (Nam)',
    },
    meter: { elecOld: 12450, elecNew: 12580, waterOld: 840, waterNew: 852 },
    tariff: {
      roomFeePerStudent: 950000,
      wifiFeeTotal: 120000,
      cleaningFeeTotal: 60000,
      numStudents: 4,
    },
  })

  // 2. Handover path — the SHIPPED buildHandoverPdfDoc extracted from MyRoomPage.tsx.
  const handoverDoc = await buildHandoverPdfDoc({
    recordCode: 'BB-2026-A205-0905',
    date: '2026-09-05',
    studentName: 'Nguyễn Hoàng Vinh',
    mssv: 'QE200001',
    building: 'Tòa A (Nam)',
    room: 'A205',
    compartment: 'Buồng B1',
    bedCode: 'A205-B1-G03',
    elecOld: 12450,
    waterOld: 840,
    deposit: 1000000,
    assets: [
      { name: 'Khung giường tầng & Thang leo', status: 'Tốt', note: 'Chắc chắn, không rỉ sét' },
      { name: 'Điều hòa Inverter Daikin 2HP', status: 'Tốt', note: 'Remote để tại giá treo cửa' },
    ],
  })

  // 3. Contract path — generateContractPDF calls doc.save(), which hands the real
  // Blob to `globalThis.saveAs`; run.ts captures that (see its header comment).
  let contractError: string | null = null
  try {
    await generateContractPDF({
      contractId: 'CTR-2026-A205-B03',
      studentName: 'Nguyễn Hoàng Vinh',
      mssv: 'QE200001',
      bedCode: 'A205-B-G03',
      building: 'Tòa A (Nam)',
      room: 'A205 - Buồng B',
      citizenId: '079204018293',
      phone: '0912 345 678',
      roomFee: 950000,
      deposit: 2150000,
      startDate: '2026-09-05',
      endDate: '2027-01-15',
      createdAt: '2026-09-05',
    })
  } catch (error) {
    contractError = error instanceof Error ? error.message : String(error)
  }

  const results = [probe('invoice (buildInvoicePdfDoc)', await pdfBytes(invoiceDoc))]
  results.push(probe('handover (buildHandoverPdfDoc from MyRoomPage.tsx)', await pdfBytes(handoverDoc)))
  if (contractError) console.log('[contract] FAILED:', contractError)
  return results
}
