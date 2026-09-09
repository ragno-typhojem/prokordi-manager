// src/lib/xlsx.js — minimal .xlsx okuyucu (~4 KB, fflate ile unzip).
// Not: SheetJS 900 KB'lık bundle getiriyordu; burada sadece ihtiyacımız olan
// "ilk sayfayı satır dizisine çevir" işi var. Dinamik import ile ayrı chunk'ta yüklenir.

import { unzipSync, strFromU8 } from 'fflate';

const decodeXML = (s) =>
  s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
   .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
   .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
   .replace(/&amp;/g, '&');

/** Bir <si> ya da <is> düğümündeki tüm <t> içeriklerini birleştirir */
const textOf = (xml) => {
  let out = '';
  const re = /<t[^>]*>([\s\S]*?)<\/t>/g;
  let m;
  while ((m = re.exec(xml))) out += m[1];
  return decodeXML(out);
};

/** "BC12" -> 54 (0 tabanlı sütun indeksi) */
const colIndex = (ref) => {
  let n = 0;
  for (let i = 0; i < ref.length; i++) {
    const c = ref.charCodeAt(i);
    if (c < 65 || c > 90) break;
    n = n * 26 + (c - 64);
  }
  return n - 1;
};

/** Excel seri numarasını saate çevirir (0.375 -> "09:00") */
const serialToTime = (n) => {
  const frac = n % 1;
  const total = Math.round(frac * 1440);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

/**
 * @param {ArrayBuffer} buf
 * @returns {string[][]} satır x sütun (boş hücreler '' olarak korunur)
 */
export function readXlsx(buf) {
  const files = unzipSync(new Uint8Array(buf));
  const pick = (re) => Object.keys(files).find((k) => re.test(k));

  const ssPath = pick(/sharedStrings\.xml$/i);
  const shared = [];
  if (ssPath) {
    const xml = strFromU8(files[ssPath]);
    const re = /<si>([\s\S]*?)<\/si>/g;
    let m;
    while ((m = re.exec(xml))) shared.push(textOf(m[1]));
  }

  // workbook.xml.rels üzerinden ilk sayfa; bulunamazsa sheet1.xml
  const sheetPath =
    Object.keys(files).filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(k))
      .sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]))[0];
  if (!sheetPath) throw new Error('Çalışma sayfası bulunamadı');

  const sheet = strFromU8(files[sheetPath]);
  const rows = [];
  const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
  const cellRe = /<c([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let r;
  while ((r = rowRe.exec(sheet))) {
    const cells = [];
    let c;
    cellRe.lastIndex = 0;
    while ((c = cellRe.exec(r[1]))) {
      const attrs = c[1] || '';
      const body = c[2] || '';
      const ref = (attrs.match(/r="([A-Z]+)\d+"/) || [])[1];
      const type = (attrs.match(/t="([^"]+)"/) || [])[1];
      let val = '';
      if (type === 's') {
        const i = +(body.match(/<v>(\d+)<\/v>/) || [])[1];
        val = shared[i] ?? '';
      } else if (type === 'inlineStr') {
        val = textOf(body);
      } else if (type === 'str' || type === 'e') {
        val = textOf(body) || decodeXML((body.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || '');
      } else {
        const raw = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        if (raw != null) {
          const num = Number(raw);
          // 0 < x < 1 -> Excel saat biçimi olma ihtimali yüksek
          val = Number.isFinite(num) && num > 0 && num < 1 ? serialToTime(num) : String(raw);
        }
      }
      const idx = ref ? colIndex(ref) : cells.length;
      while (cells.length < idx) cells.push('');
      cells[idx] = String(val).trim();
    }
    rows.push(cells);
  }
  // tamamen boş satırları at
  return rows.filter((row) => row.some((c) => c !== ''));
}
