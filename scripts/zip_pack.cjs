const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createZip(files, outPath) {
  // files: array of { name: 'word/document.xml', data: Buffer }
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  files.forEach(file => {
    const fn = file.name.replace(/\\/g, '/');
    const fnBuf = Buffer.from(fn, 'utf8');
    const compressed = zlib.deflateRawSync(file.data);
    const crc = crc32(file.data);

    // Local file header (30 bytes + fnBuf.length)
    const localHeader = Buffer.alloc(30 + fnBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed (2.0)
    localHeader.writeUInt16LE(0, 6);          // flags
    localHeader.writeUInt16LE(8, 8);          // compression (deflate = 8)
    localHeader.writeUInt16LE(0, 10);         // time
    localHeader.writeUInt16LE(0, 12);         // date
    localHeader.writeUInt32LE(crc, 14);       // crc32
    localHeader.writeUInt32LE(compressed.length, 18); // compSize
    localHeader.writeUInt32LE(file.data.length, 22);  // uncompSize
    localHeader.writeUInt16LE(fnBuf.length, 26);      // fnLen
    localHeader.writeUInt16LE(0, 28);                 // extraLen
    fnBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, compressed);

    // Central directory header (46 bytes + fnBuf.length)
    const centralHeader = Buffer.alloc(46 + fnBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4);         // version made by
    centralHeader.writeUInt16LE(20, 6);         // version needed
    centralHeader.writeUInt16LE(0, 8);          // flags
    centralHeader.writeUInt16LE(8, 10);         // compression
    centralHeader.writeUInt16LE(0, 12);         // time
    centralHeader.writeUInt16LE(0, 14);         // date
    centralHeader.writeUInt32LE(crc, 16);       // crc32
    centralHeader.writeUInt32LE(compressed.length, 20); // compSize
    centralHeader.writeUInt32LE(file.data.length, 24);  // uncompSize
    centralHeader.writeUInt16LE(fnBuf.length, 28);      // fnLen
    centralHeader.writeUInt16LE(0, 30);                 // extraLen
    centralHeader.writeUInt16LE(0, 32);                 // commentLen
    centralHeader.writeUInt16LE(0, 34);                 // diskStart
    centralHeader.writeUInt16LE(0, 36);                 // internalAttr
    centralHeader.writeUInt32LE(0, 38);                 // externalAttr
    centralHeader.writeUInt32LE(offset, 42);            // localHeader offset
    fnBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);

    offset += localHeader.length + compressed.length;
  });

  const centralDirStart = offset;
  const centralDirBuf = Buffer.concat(centralHeaders);
  const centralDirSize = centralDirBuf.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4);          // disk number
  eocd.writeUInt16LE(0, 6);          // start disk
  eocd.writeUInt16LE(files.length, 8); // total entries on this disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDirSize, 12); // size of central dir
  eocd.writeUInt32LE(centralDirStart, 16); // offset of central dir
  eocd.writeUInt16LE(0, 20); // comment length

  const fullZip = Buffer.concat([...localHeaders, centralDirBuf, eocd]);
  fs.writeFileSync(outPath, fullZip);
}

module.exports = { createZip };

