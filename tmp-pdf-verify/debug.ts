import { inflateSync } from 'node:zlib'
import { runAll, probe } from './entry.ts'

// Dump the raw CMap region so the probe regex can be written against reality.
const { buildInvoicePdfDoc } = await import('@/lib/invoicePdf')
const doc = await buildInvoicePdfDoc({
  invoiceCode: 'INV-2026-09-A205',
  billingMonth: '2026-09',
  student: { fullName: 'Nguyễn Hoàng Vinh', mssv: 'QE200001', room: 'A205', bedCode: 'A205-B1-G03' },
  meter: { elecOld: 12450, elecNew: 12580, waterOld: 840, waterNew: 852 },
  tariff: { roomFeePerStudent: 950000, wifiFeeTotal: 120000, cleaningFeeTotal: 60000, numStudents: 4 },
})
const bytes = new Uint8Array(doc.output('arraybuffer') as ArrayBuffer)
const raw = Buffer.from(bytes).toString('latin1')
const idx = raw.indexOf('/ToUnicode')
console.log('raw /ToUnicode first index:', idx)
console.log('RAW region around CMap:')
console.log(JSON.stringify(raw.slice(idx - 60, idx + 700)))

// Count Flate streams and how many inflate successfully.
const re = /stream\r?\n/g
let m
let ok = 0
let fail = 0
const inflatedParts: string[] = []
while ((m = re.exec(raw)) !== null) {
  const start = m.index + m[0].length
  const end = raw.indexOf('endstream', start)
  if (end < 0) continue
  const chunk = Buffer.from(raw.slice(start, end), 'latin1')
  try {
    inflatedParts.push(inflateSync(chunk).toString('latin1'))
    ok += 1
  } catch {
    fail += 1
  }
}
console.log('flate streams ok/fail:', ok, fail)
const inflated = inflatedParts.join('\n')
console.log('inflated length:', inflated.length)
const f16 = raw.indexOf('/F16 ')
console.log('F16 dict at', f16, JSON.stringify(raw.slice(f16 - 120, f16 + 160)))
const f17 = raw.lastIndexOf('/F17 ')
console.log('F17 dict at', f17, JSON.stringify(raw.slice(f17 - 120, f17 + 160)))
const fontDict = raw.lastIndexOf('/Font')
console.log('last /Font:', JSON.stringify(raw.slice(fontDict - 400, fontDict + 400)))
