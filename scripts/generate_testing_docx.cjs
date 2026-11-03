const fs = require('fs');
const path = require('path');
const { createZip } = require('./zip_pack.cjs');

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const mdContent = fs.readFileSync('docs/TESTING_DOCUMENTATION.md', 'utf8');

// Parse markdown into structured blocks
const lines = mdContent.split('\n');
let bodyXml = '';

let inTable = false;
let tableRows = [];
let inCode = false;
let codeLines = [];

function flushCode() {
  if (codeLines.length === 0) return;
  const codeText = codeLines.join('\n');
  bodyXml += `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="9200" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="120" w:type="dxa"/>
        <w:bottom w:w="120" w:type="dxa"/>
        <w:left w:w="160" w:type="dxa"/>
        <w:right w:w="160" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>
    <w:tr>
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="9200" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:line="240" w:lineRule="auto" w:after="0"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>
              <w:sz w:val="20"/>
              <w:color w:val="0F172A"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(codeText)}</w:t>
          </w:r>
        </w:p>
      </w:tc>
    </w:tr>
  </w:tbl>
  <w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>`;
  codeLines = [];
}

function flushTable() {
  if (tableRows.length === 0) return;
  const numCols = Math.max(...tableRows.map(r => r.length));
  const colWidth = Math.floor(9200 / numCols);

  let tblXml = `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="9200" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
      </w:tblBorders>
      <w:tblCellMar>
        <w:top w:w="100" w:type="dxa"/>
        <w:bottom w:w="100" w:type="dxa"/>
        <w:left w:w="140" w:type="dxa"/>
        <w:right w:w="140" w:type="dxa"/>
      </w:tblCellMar>
    </w:tblPr>`;

  tableRows.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    tblXml += `<w:tr>`;
    if (isHeader) {
      tblXml += `<w:trPr><w:tblHeader/></w:trPr>`;
    }
    row.forEach(cell => {
      const fill = isHeader ? 'DBEAFE' : (rowIndex % 2 === 0 ? 'F8FAFC' : 'FFFFFF');
      tblXml += `<w:tc>
        <w:tcPr>
          <w:tcW w:w="${colWidth}" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>
        </w:tcPr>
        <w:p>
          <w:pPr>
            <w:spacing w:line="260" w:lineRule="auto" w:after="40" w:before="40"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              ${isHeader ? '<w:b/><w:color w:val="1E3A8A"/>' : '<w:color w:val="1E293B"/>'}
              <w:sz w:val="${isHeader ? '22' : '20'}"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(cell.trim())}</w:t>
          </w:r>
        </w:p>
      </w:tc>`;
    });
    tblXml += `</w:tr>`;
  });

  tblXml += `</w:tbl><w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`;
  bodyXml += tblXml;
  tableRows = [];
}

function processInlineFormatting(text) {
  const runs = [];
  const parts = text.split(/(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('`') && part.endsWith('`')) {
      runs.push({ text: part.slice(1, -1), isCode: true });
    } else if (part.startsWith('***') && part.endsWith('***')) {
      runs.push({ text: part.slice(3, -3), isBold: true, isItalic: true });
    } else if (part.startsWith('**') && part.endsWith('**')) {
      runs.push({ text: part.slice(2, -2), isBold: true });
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push({ text: part.slice(1, -1), isItalic: true });
    } else {
      runs.push({ text: part });
    }
  }

  return runs.map(r => {
    let rPr = '<w:rPr>';
    if (r.isBold) rPr += '<w:b/>';
    if (r.isItalic) rPr += '<w:i/>';
    if (r.isCode) {
      rPr += '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/><w:color w:val="0F766E"/><w:sz w:val="22"/>';
    } else {
      rPr += '<w:sz w:val="26"/>';
    }
    rPr += '</w:rPr>';
    return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(r.text)}</w:t></w:r>`;
  }).join('');
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.startsWith('```')) {
    if (inCode) {
      inCode = false;
      flushCode();
    } else {
      inCode = true;
    }
    continue;
  }

  if (inCode) {
    codeLines.push(line);
    continue;
  }

  if (line.trim().startsWith('|')) {
    const cells = line.split('|').slice(1, -1);
    if (cells.length > 0 && !cells[0].includes('---')) {
      tableRows.push(cells.map(c => c.trim()));
    }
    inTable = true;
    continue;
  } else if (inTable) {
    inTable = false;
    flushTable();
  }

  const trimmed = line.trim();
  if (!trimmed) continue;

  if (trimmed.startsWith('# ')) {
    const title = trimmed.replace(/^#\s+/, '');
    bodyXml += `<w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:spacing w:before="360" w:after="160"/>
      </w:pPr>
      ${processInlineFormatting(title)}
    </w:p>`;
  } else if (trimmed.startsWith('## ')) {
    const title = trimmed.replace(/^##\s+/, '');
    bodyXml += `<w:p>
      <w:pPr>
        <w:pStyle w:val="Heading2"/>
        <w:spacing w:before="280" w:after="120"/>
      </w:pPr>
      ${processInlineFormatting(title)}
    </w:p>`;
  } else if (trimmed.startsWith('### ')) {
    const title = trimmed.replace(/^###\s+/, '');
    bodyXml += `<w:p>
      <w:pPr>
        <w:pStyle w:val="Heading3"/>
        <w:spacing w:before="200" w:after="80"/>
      </w:pPr>
      ${processInlineFormatting(title)}
    </w:p>`;
  } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    const bulletText = trimmed.replace(/^[-*]\s+/, '');
    bodyXml += `<w:p>
      <w:pPr>
        <w:ind w:left="400" w:hanging="240"/>
        <w:spacing w:line="360" w:lineRule="auto" w:after="60"/>
      </w:pPr>
      <w:r><w:t xml:space="preserve">•  </w:t></w:r>
      ${processInlineFormatting(bulletText)}
    </w:p>`;
  } else if (trimmed.startsWith('> ')) {
    const quoteText = trimmed.replace(/^>\s+/, '');
    bodyXml += `<w:p>
      <w:pPr>
        <w:ind w:left="300" w:right="300"/>
        <w:pBdr>
          <w:left w:val="single" w:sz="18" w:space="12" w:color="3B82F6"/>
        </w:pBdr>
        <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
        <w:spacing w:line="320" w:lineRule="auto" w:before="60" w:after="60"/>
      </w:pPr>
      ${processInlineFormatting(quoteText)}
    </w:p>`;
  } else if (trimmed === '---') {
    bodyXml += `<w:p>
      <w:pPr>
        <w:pBdr>
          <w:bottom w:val="single" w:sz="6" w:space="1" w:color="E2E8F0"/>
        </w:pBdr>
        <w:spacing w:before="120" w:after="120"/>
      </w:pPr>
    </w:p>`;
  } else {
    bodyXml += `<w:p>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto" w:after="120"/>
      </w:pPr>
      ${processInlineFormatting(trimmed)}
    </w:p>`;
  }
}

if (inTable) flushTable();
if (inCode) flushCode();

const finalDocumentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyXml}
  </w:body>
</w:document>`;

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`;

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`;

const settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
</w:settings>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="26"/>
        <w:lang w:val="vi-VN"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:color w:val="1E3A8A"/>
      <w:sz w:val="36"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:color w:val="1E40AF"/>
      <w:sz w:val="30"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:b/>
      <w:color w:val="0F766E"/>
      <w:sz w:val="26"/>
    </w:rPr>
  </w:style>
</w:styles>`;

const zipFiles = [
  { name: '[Content_Types].xml', data: Buffer.from(contentTypesXml, 'utf8') },
  { name: '_rels/.rels', data: Buffer.from(relsXml, 'utf8') },
  { name: 'word/_rels/document.xml.rels', data: Buffer.from(docRelsXml, 'utf8') },
  { name: 'word/settings.xml', data: Buffer.from(settingsXml, 'utf8') },
  { name: 'word/styles.xml', data: Buffer.from(stylesXml, 'utf8') },
  { name: 'word/document.xml', data: Buffer.from(finalDocumentXml, 'utf8') }
];

const finalDocx = path.resolve('Testing_Documentation_FER202_Group4_Domanage.docx');
if (fs.existsSync(finalDocx)) fs.unlinkSync(finalDocx);

createZip(zipFiles, finalDocx);
console.log('Successfully generated Testing_Documentation_FER202_Group4_Domanage.docx via pure Node.js createZip! Size:', fs.statSync(finalDocx).size);
