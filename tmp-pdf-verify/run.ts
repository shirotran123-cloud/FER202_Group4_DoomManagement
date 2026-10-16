// TEMP byte-level verification runner.
//
// jsPDF resolves its downloader ONCE at module load: `var saveAs = globalObject.saveAs || ...`.
// jsPDF also attaches API methods per-instance, so patching `save` is unreliable.
// We therefore install `globalThis.saveAs` BEFORE jspdf is first imported (hence the
// dynamic import below) and capture the real Blob that `doc.save()` hands over.
import type { PdfProbe } from './entry.ts'

interface Captured {
  name: string
  bytes: Uint8Array
}

const captured: Captured[] = []

globalThis.saveAs = (blob: Blob, name?: string) => {
  console.log('[saveAs] called with', name, blob && blob.size)
  void (async () => {
    captured.push({ name: String(name ?? ''), bytes: new Uint8Array(await blob.arrayBuffer()) })
  })()
}

const { runAll } = await import('./entry.ts')
const rows: PdfProbe[] = await runAll()
// `saveAs` is fire-and-forget inside jsPDF's save(); let those microtasks settle.
await new Promise((resolve) => setTimeout(resolve, 200))

const report = (label: string, row: Omit<PdfProbe, 'label'>) => {
  console.log('='.repeat(76))
  console.log('PDF         :', label)
  console.log('bytes       :', row.byteLength)
  console.log('header      :', JSON.stringify(row.header), row.header.startsWith('%PDF-') ? 'OK' : 'FAIL')
  console.log('/FontFile2  :', row.fontFile2Count, '(embedded TrueType font program)')
  console.log('/ToUnicode  :', row.toUnicodeCount, '(CMap making text extractable)')
  console.log('/Identity-H :', row.identityHCount)
  console.log('/Type /Page :', row.pageObjectCount, '(page objects in the document)')
  console.log('VI diacritics mapped in ToUnicode:', row.vietnameseCodepointsMapped.join(', ') || 'NONE')
  console.log(
    'required non-ASCII chars UNMAPPED:',
    row.unmappedRequiredChars.length === 0 ? 'NONE (all mapped)' : row.unmappedRequiredChars.join(', '),
  )
}

for (const { label, ...rest } of rows) report(label, rest)

// ---- Round-trip proof: run a real PDF reader's text-extraction algorithm ----
const { extractText } = await import('./extract.ts')
const { probe: probeAgain } = await import('./entry.ts')

const { buildInvoicePdfDoc: buildDoc } = await import('@/lib/invoicePdf')
const roundTripDoc = await buildDoc({
  invoiceCode: 'INV-2026-09-A205',
  billingMonth: '2026-09',
  student: {
    fullName: 'Nguyễn Hoàng Vinh',
    mssv: 'QE200001',
    room: 'A205',
    bedCode: 'A205-B1-G03',
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
const roundTrip = extractText(new Uint8Array(roundTripDoc.output('arraybuffer') as ArrayBuffer))
console.log('='.repeat(76))
console.log('ROUND-TRIP TEXT EXTRACTION (invoice PDF, via embedded /ToUnicode CMaps)')
console.log('fonts decoded  :', roundTrip.fontsUsed.join(', '))
console.log('unmapped glyphs:', roundTrip.unmappedGlyphStrings)
console.log('extracted text :')
console.log(roundTrip.text)
void probeAgain

// generateContractPDF owns its own download, so its bytes are only observable as
// the file jsPDF wrote. That on-disk artifact IS the delivered document — probe it.
const { readdirSync, readFileSync, rmSync } = await import('node:fs')
const { probe } = await import('./entry.ts')
const contractFiles = readdirSync('.').filter((f) => f.startsWith('HopDong_') && f.endsWith('.pdf'))
for (const file of contractFiles) {
  report(`contract (generateContractPDF wrote ${file})`, probe(file, new Uint8Array(readFileSync(file))))
  rmSync(file)
}
console.log('='.repeat(76))
console.log('contract files probed from disk:', contractFiles.join(', ') || 'NONE')
