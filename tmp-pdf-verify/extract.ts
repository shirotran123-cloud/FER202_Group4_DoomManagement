// TEMP: genuine PDF text extraction — the same algorithm a PDF reader uses.
// Parse the page content stream, resolve each `/Fn` to its font object, then decode
// every `<hex> Tj` glyph-ID string through that font's `/ToUnicode` CMap.
import { inflateSync } from 'node:zlib'

export interface ExtractResult {
  /** Text recovered from the content stream via the embedded ToUnicode CMaps. */
  text: string
  /** Distinct fonts with a ToUnicode CMap used while decoding. */
  fontsUsed: string[]
  /** Hex glyph strings that had no CMap entry (would extract as garbage). */
  unmappedGlyphStrings: number
}

const objectBody = (raw: string, objNum: number): string => {
  const start = raw.indexOf(`\n${objNum} 0 obj`)
  if (start < 0) return ''
  const end = raw.indexOf('\nendobj', start)
  return raw.slice(start, end < 0 ? raw.length : end)
}

const streamOf = (body: string): string => {
  const marker = /\nstream\r?\n/.exec(body)
  if (!marker) return ''
  const start = marker.index + marker[0].length
  const end = body.indexOf('\nendstream', start)
  const chunk = Buffer.from(body.slice(start, end < 0 ? body.length : end), 'latin1')
  try {
    return inflateSync(chunk).toString('latin1')
  } catch {
    return chunk.toString('latin1')
  }
}

/** Parse a ToUnicode CMap into glyph-ID → UTF-16 string. */
function parseCMap(cmap: string): Map<number, string> {
  const map = new Map<number, string>()
  const decodeHex = (hex: string): string => {
    let out = ''
    for (let i = 0; i + 4 <= hex.length; i += 4) {
      out += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16))
    }
    return out
  }
  for (const block of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const pair of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      map.set(parseInt(pair[1], 16), decodeHex(pair[2]))
    }
  }
  for (const block of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const triple of block[1].matchAll(
      /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g,
    )) {
      const lo = parseInt(triple[1], 16)
      const hi = parseInt(triple[2], 16)
      const base = parseInt(triple[3], 16)
      for (let code = lo; code <= hi; code += 1) {
        map.set(code, String.fromCharCode(base + (code - lo)))
      }
    }
  }
  return map
}

export function extractText(bytes: Uint8Array): ExtractResult {
  const raw = Buffer.from(bytes).toString('latin1')

  // Resource dict: /F16 28 0 R …
  const resourceDict = /\n2 0 obj[\s\S]*?\/Font\s*<<([\s\S]*?)>>/.exec(raw)
  const fontObjects = new Map<string, number>()
  if (resourceDict) {
    for (const entry of resourceDict[1].matchAll(/\/(F\d+)\s+(\d+)\s+0\s+R/g)) {
      fontObjects.set(entry[1], Number(entry[2]))
    }
  }

  const cmaps = new Map<string, Map<number, string>>()
  for (const [name, objNum] of fontObjects) {
    const fontBody = objectBody(raw, objNum)
    const toUnicode = /\/ToUnicode\s+(\d+)\s+0\s+R/.exec(fontBody)
    if (!toUnicode) continue
    const cmapBody = objectBody(raw, Number(toUnicode[1]))
    cmaps.set(name, parseCMap(streamOf(cmapBody) || cmapBody))
  }

  const contentsRef = /\/Contents\s+(\d+)\s+0\s+R/.exec(raw)
  const contentStream = contentsRef ? streamOf(objectBody(raw, Number(contentsRef[1]))) : ''

  let currentFont = ''
  let unmapped = 0
  const pieces: string[] = []
  const fontsUsed = new Set<string>()

  const tokenRe = /\/(F\d+)\s+[\d.]+\s+Tf|<([0-9A-Fa-f]+)>\s*Tj|(T\*)|(ET)/g
  let token: RegExpExecArray | null
  while ((token = tokenRe.exec(contentStream)) !== null) {
    if (token[1]) {
      currentFont = token[1]
      continue
    }
    if (token[2]) {
      const map = cmaps.get(currentFont)
      if (!map) {
        unmapped += 1
        continue
      }
      fontsUsed.add(currentFont)
      let line = ''
      const hex = token[2]
      for (let i = 0; i + 4 <= hex.length; i += 4) {
        const glyph = parseInt(hex.slice(i, i + 4), 16)
        const decoded = map.get(glyph)
        if (decoded === undefined) unmapped += 1
        else line += decoded
      }
      pieces.push(line)
      continue
    }
    if (token[3] || token[4]) pieces.push('\n')
  }

  return { text: pieces.join(''), fontsUsed: [...fontsUsed], unmappedGlyphStrings: unmapped }
}
