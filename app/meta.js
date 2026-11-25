/* Snapidian: find when a screenshot was taken, from the image's own metadata (EXIF / XMP) or the file date. */
(function (g) {
  const ascii = (u8, start, len) => { let s = ''; for (let i = 0; i < len && start + i < u8.length; i++) s += String.fromCharCode(u8[start + i]); return s; };

  // "2026:11:25 18:07:55" (EXIF, local time) -> timestamp
  function exifDate(s) {
    const m = /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec((s || '').trim());
    if (!m) return null;
    const t = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime();
    return Number.isFinite(t) && +m[1] > 1990 ? t : null;
  }

  // XMP dates are ISO 8601, with or without a time zone
  function isoDate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?/.exec((s || '').trim());
    if (!m) return null;
    if (m[7]) { const t = Date.parse(s.trim()); return Number.isFinite(t) ? t : null; }
    return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)).getTime();
  }

  // Parse a TIFF/EXIF block; prefer DateTimeOriginal (0x9003), then DateTimeDigitized (0x9004), then DateTime (0x0132).
  function fromTiff(u8, base) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const le = ascii(u8, base, 2) === 'II';
    if (!le && ascii(u8, base, 2) !== 'MM') return null;
    const u16 = o => dv.getUint16(base + o, le), u32 = o => dv.getUint32(base + o, le);
    const found = {};
    const readIfd = (off, depth) => {
      if (depth > 2 || off <= 0 || base + off + 2 > u8.length) return;
      const n = u16(off);
      for (let i = 0; i < n; i++) {
        const e = off + 2 + i * 12;
        if (base + e + 12 > u8.length) return;
        const tag = u16(e), type = u16(e + 2), count = u32(e + 4);
        if (tag === 0x8769) readIfd(u32(e + 8), depth + 1); // Exif sub-IFD
        else if (type === 2 && (tag === 0x9003 || tag === 0x9004 || tag === 0x0132)) {
          const valOff = count > 4 ? u32(e + 8) : e + 8;
          found[tag] = ascii(u8, base + valOff, count - 1);
        }
      }
    };
    try { readIfd(u32(4), 0); } catch (e) { return null; }
    return exifDate(found[0x9003]) || exifDate(found[0x9004]) || exifDate(found[0x0132]);
  }

  function fromXmp(text) {
    const m = /(?:exif:DateTimeOriginal|photoshop:DateCreated|xmp:CreateDate)\s*(?:=\s*"|>)\s*([0-9T:.\-+Z]+)/.exec(text);
    return m ? isoDate(m[1]) : null;
  }

  function fromJpeg(u8) {
    let p = 2;
    while (p + 4 < u8.length && u8[p] === 0xFF) {
      const marker = u8[p + 1], len = (u8[p + 2] << 8) | u8[p + 3];
      if (marker === 0xE1) {
        if (ascii(u8, p + 4, 6) === 'Exif\0\0') { const t = fromTiff(u8, p + 10); if (t) return t; }
        else { const t = fromXmp(new TextDecoder().decode(u8.subarray(p + 4, p + 2 + len))); if (t) return t; }
      }
      if (marker === 0xDA) break; // image data starts; no more metadata
      p += 2 + len;
    }
    return null;
  }

  function fromPng(u8) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let p = 8;
    while (p + 8 <= u8.length) {
      const len = dv.getUint32(p), type = ascii(u8, p + 4, 4), data = p + 8;
      if (type === 'eXIf') { const t = fromTiff(u8, data); if (t) return t; }
      if (type === 'iTXt' || type === 'tEXt' || type === 'zTXt') {
        const text = new TextDecoder().decode(u8.subarray(data, data + len));
        const t = fromXmp(text) || (text.startsWith('Creation Time\0') ? (exifDate(text.slice(14)) || isoDate(text.slice(14)) || Date.parse(text.slice(14)) || null) : null);
        if (t) return t;
      }
      if (type === 'IDAT' || type === 'IEND') break;
      p = data + len + 4;
    }
    return null;
  }

  function fromWebp(u8) {
    let p = 12;
    while (p + 8 <= u8.length) {
      const type = ascii(u8, p, 4), len = u8[p + 4] | (u8[p + 5] << 8) | (u8[p + 6] << 16) | (u8[p + 7] << 24);
      if (type === 'EXIF') { const off = ascii(u8, p + 8, 6) === 'Exif\0\0' ? p + 14 : p + 8; const t = fromTiff(u8, off); if (t) return t; }
      if (type === 'XMP ') { const t = fromXmp(new TextDecoder().decode(u8.subarray(p + 8, p + 8 + len))); if (t) return t; }
      p += 8 + len + (len & 1);
    }
    return null;
  }

  /**
   * When was this screenshot taken? Returns { at, source } with source 'metadata' or 'file',
   * or null when unknown. Only the first 512 KB is read; metadata sits at the start of the file.
   */
  async function takenAt(blob) {
    try {
      const u8 = new Uint8Array(await blob.slice(0, 512 * 1024).arrayBuffer());
      let t = null;
      if (u8[0] === 0xFF && u8[1] === 0xD8) t = fromJpeg(u8);
      else if (u8[0] === 0x89 && ascii(u8, 1, 3) === 'PNG') t = fromPng(u8);
      else if (ascii(u8, 0, 4) === 'RIFF' && ascii(u8, 8, 4) === 'WEBP') t = fromWebp(u8);
      if (t && t <= Date.now() + 86400000) return { at: t, source: 'metadata' };
    } catch (e) { /* unreadable metadata: fall through */ }
    // A pasted or freshly captured image gets "now" as its file date, which says nothing about when it was taken.
    const lm = blob.lastModified;
    if (lm && lm < Date.now() - 60000) return { at: lm, source: 'file' };
    return null;
  }

  g.SnapMeta = { takenAt, _fromJpeg: fromJpeg, _fromPng: fromPng };
})(typeof self !== 'undefined' ? self : window);
