// src/lib/importer.js — Excel / CSV / TSV / serbest yapıştırma → tek giriş noktası.
// Kullanıcı ne yapıştırırsa yapıştırsın türü kendi anlar: program, gönüllü, etkinlik, sınıf, isim.

import { uid, norm, addMin, validateTimeSlots } from './util';
import {resolveActivity} from './catalog';

const TIME = /(\d{1,2})[:.](\d{2})/;
const TIME_RANGE = /(\d{1,2})[:.](\d{2})\s*(?:[-–—]|\s)\s*(\d{1,2})[:.](\d{2})/;

/** Dosya (xlsx / csv / txt) → satır dizisi. xlsx okuyucusu yalnızca gerekince indirilir. */
export async function readFile(file) {
  const buf = await file.arrayBuffer();
  if (/\.(xlsx|xlsm)$/i.test(file.name)) {
    const { readXlsx } = await import('./xlsx');
    return readXlsx(buf);
  }
  if (/\.xls$/i.test(file.name))
    throw new Error('Eski .xls desteklenmiyor — Excel\'de "Farklı Kaydet → .xlsx" yapın.');
  let text = new TextDecoder('utf-8').decode(buf);
  if (text.includes('�')) text = new TextDecoder('windows-1254').decode(buf); // Türkçe CSV
  return splitText(text);
}

/** Serbest metni satır/sütun matrisine çevirir; ayırıcıyı kendi bulur. */
export function splitText(text) {
  const raw=String(text).replace(/^\uFEFF/,'');
  const first=raw.split(/\r?\n/).find(l=>l.trim())||'';
  const counts=['\t',';',',','|'].map(d=>({d,n:first.split(d).length})).sort((a,b)=>b.n-a.n);
  const delimiter=counts[0].n>1?counts[0].d:null;
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<raw.length;i++){
    const ch=raw[i];
    if(ch==='"'){if(quoted&&raw[i+1]==='"'){cell+='"';i++;}else if(quoted||!cell.trim()){quoted=!quoted;}else cell+=ch;}
    else if(ch===delimiter&&!quoted){row.push(cell.trim());cell='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&raw[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell='';}
    else cell+=ch;
  }
  if(quoted)throw new Error('CSV içinde kapanmamış tırnak var. Dosyayı kontrol edin.');
  row.push(cell.trim());if(row.some(Boolean))rows.push(row);return rows;
}

/** İçeriğe bakarak türü tahmin eder. */
export function detectKind(rows) {
  if (!rows.length) return 'names';
  const head = (rows[0] || []).map(norm).join(' ');
  const body = rows.slice(1);

  // ilk sütunu saat olan satırlar çoğunluktaysa → program tablosu
  const timeRows = body.filter((r) => TIME.test(String(r[0] || ''))).length;
  if (timeRows >= 1 && (/saat|time/.test(head) || timeRows >= body.length * 0.4)) return 'schedule';

  if (/gonullu|isim|ad soyad|katilimci/.test(head) && /etkinlik|yetenek|yetkinlik|yapabil/.test(head)) return 'volunteers';
  if (/etkinlik|aktivite|atolye/.test(head) && /(kutu|stok|zorunlu|must|sinif|seviye)/.test(head)) return 'activities';
  if (/sinif|sube/.test(head) && rows.every((r) => r.filter(Boolean).length <= 2)) return 'classes';

  const single = rows.every((r) => r.filter(Boolean).length === 1);
  if (single) return /^(ana ?sinifi|\d+\s*[-/]?\s*[a-z])$/.test(norm(rows[0][0])) ? 'classes' : 'names';
  return 'volunteers';
}

export function parseAny(input) {
  const rows = (Array.isArray(input) ? input : splitText(String(input))).map(row=>{const parts=String(row[0]||'').split(/\s+[-–—]\s+/);return parts.length>1?[parts.shift(),parts.join(', '),...row.slice(1)]:row;});
  return { kind: detectKind(rows), rows };
}

const splitList = (s) =>
  String(s).split(/[,;/|\n]+/).map((x) => x.trim()).filter(Boolean);

const isHeaderRow = (r) => /^(isim|ad|ad soyad|gonullu|etkinlik|aktivite|sinif|saat|sube)$/.test(norm(r[0] || ''));

/**
 * Satırları mevcut state'e göre yamaya dönüştürür.
 * Var olan kayıtlarla isimden eşleşir, yoksa yenisini üretir — hiçbir şeyi kör kör silmez.
 * @returns {{activities?,volunteers?,timeSlots?,classes?,_kind:string,_summary:string}}
 */
export function toStatePatch({ kind, rows }, state) {
  const A = (state.activities || []).map(a=>({...a,allowedGrades:[...(a.allowedGrades||[])]}));
  const V = (state.volunteers || []).map(v=>({...v,capabilities:[...(v.capabilities||[])]}));

  const getAct = (name) => {
    const n = String(name || '').trim();
    if (!n) return null;
    let a = resolveActivity(A,n);
    if (!a) { a = { id: uid(), name: n, cat: 'science', isMust: false, boxCount: 1, allowedGrades: [], planningReady:false }; A.push(a); }
    return a;
  };
  const getVol = (name) => {
    const n = String(name || '').trim();
    if (!n) return null;
    let v = V.find(v=>norm(v.name)===norm(n));
    if (!v) { v = { id: uid(), name: n, capabilities: [] }; V.push(v); }
    return v;
  };

  // ── gönüllü / isim listesi ────────────────────────────────────────────────
  if (kind === 'names' || kind === 'volunteers') {
    let added = 0;
    rows.forEach((r) => {
      if (!r[0] || isHeaderRow(r)) return;
      const before = V.length;
      const v = getVol(r[0]);
      if (!v) return;
      if (V.length > before) added++;
      const caps = r.slice(1).flatMap(splitList).map(getAct).filter(Boolean).map((a) => a.id);
      if (caps.length) v.capabilities = [...new Set([...(v.capabilities || []), ...caps])];
    });
    return { volunteers: V, activities: A, _kind: 'gönüllü', _summary: `${added} yeni gönüllü, ${V.length} toplam` };
  }

  // ── etkinlik kataloğu ────────────────────────────────────────────────────
  if (kind === 'activities') {
    const h = (rows[0] || []).map(norm);
    const col = (re) => h.findIndex((x) => re.test(x));
    const iN = Math.max(0, col(/etkinlik|aktivite|^ad$|isim/));
    const iM = col(/zorunlu|must/), iB = col(/kutu|stok|adet/), iG = col(/sinif|seviye|grade/);
    let added = 0;
    rows.slice(1).forEach((r) => {
      if (!r[iN]) return;
      const before = A.length;
      const a = getAct(r[iN]);
      if (!a) return;
      if (A.length > before) added++;
      if (iM >= 0 && r[iM]) a.isMust = /evet|var|x|✓|1|true|zorunlu/i.test(r[iM]);
      if (iB >= 0 && r[iB]) a.boxCount = Number(String(r[iB]).match(/\d+/)?.[0]) || a.boxCount;
      if (iG >= 0 && r[iG]) a.allowedGrades = (String(r[iG]).match(/\d+/g) || []).map(Number).filter(g=>g>=1&&g<=12);
    });
    return { activities: A, _kind: 'etkinlik', _summary: `${added} yeni etkinlik, ${A.length} toplam` };
  }

  // ── sınıf listesi ────────────────────────────────────────────────────────
  if (kind === 'classes') {
    const classes = [...(state.classes || [])];
    let added = 0;
    rows.forEach((r) => {
      const n = String(r[0] || '').trim();
      if (!n || isHeaderRow(r)) return;
      if (!classes.some((c) => norm(c.name) === norm(n))) { classes.push({ id: uid(), name: n, schedule: {} }); added++; }
    });
    return { classes, _kind: 'sınıf', _summary: `${added} yeni sınıf` };
  }

  // ── tam program tablosu (satır = saat, sütun = sınıf) ────────────────────
  const header = (rows[0] || []).slice(1).map((x) => String(x).trim());
  const lastCol = header.reduce((m, v, i) => (v ? i : m), -1);
  const names = header.slice(0, lastCol + 1);

  const classes = names.map((n) => {
    const ex = (state.classes || []).find((c) => norm(c.name) === norm(n));
    return ex ? { ...ex, schedule: {...ex.schedule} } : { id: uid(), name: n, schedule: {} };
  });

  const timeSlots = [];
  const bodyRows = [];
  rows.slice(1).forEach((r) => {
    const m = String(r[0] || '').match(TIME_RANGE) || String(r[0] || '').match(TIME);
    if (!m) return;
    const start = `${m[1].padStart(2, '0')}:${m[2]}`;
    const end = m[3] ? `${m[3].padStart(2, '0')}:${m[4]}` : null;
    const cells = r.slice(1, names.length + 1);
    const joined = norm(cells.join(' '));
    const type = /^(?:ilkyar )?acilis sunumu$|^sunum$|^toplu sunum|^ilkyar tanitimi$/.test(norm(cells.find(x=>String(x).trim())||'')) ? 'presentation' : /ogle|yemek|lunch/.test(joined) ? 'lunch'
      : /teneffus|mola|ara$|break/.test(joined) ? 'break'
      : 'lesson';
    const old=(state.timeSlots||[]).find(s=>s.start===start && (!end || s.end===end));
    if(old&&type!=='lesson'&&(state.classes||[]).some(c=>c.schedule?.[old.id]?.activityId&&c.schedule[old.id].activityId!=='NO_CLASS'))throw new Error(`${start}: Atama bulunan saat sunum veya araya çevrilemez. Sınıf & Zaman bölümünden başa sunum ekleyin; atamalar ileri kaydırılarak korunur.`);
    const slot = { id: old?.id || uid(), start, end: end || start, type, ...(type==='presentation'?{title:cells.find(x=>String(x).trim()),audience:'all'}:{}) };
    timeSlots.push(slot);
    bodyRows.push({ slot, cells });
  });

  // bitişi olmayan slotlara bir sonrakinin başlangıcını ver
  timeSlots.forEach((s, i) => {
    if (s.end === s.start) s.end = timeSlots[i + 1]?.start || addMin(s.start, 40);
  });

  const issues=validateTimeSlots(timeSlots);if(issues.length)throw new Error(issues.join(' '));
  bodyRows.forEach(({ slot, cells }) => {
    if (slot.type !== 'lesson') return;
    cells.forEach((cell, i) => {
      const t = String(cell || '').trim();
      if (!t || !classes[i]) return;
      if (/ders ?yok|bos|kapali|yok/.test(norm(t))) {
        classes[i].schedule[slot.id] = { activityId: 'NO_CLASS', name: 'DERS YOK', cat: 'none', isMust: false, lead: '-', leadId: 'none', isLocked: true };
        return;
      }
      // "Origami (Eda)" | "Origami - Eda" | "Origami / Eda" | "Origami"
      const mm = t.match(/^(.*?)\s*(?:\(([^)]+)\)|[-–—/:]\s*(.+))\s*$/);
      const act = getAct(mm ? mm[1] : t);
      const volName = mm ? (mm[2] || mm[3]) : '';
      const vol = volName ? getVol(volName) : null;
      if (!act) return;

      classes[i].schedule[slot.id] = {
        activityId: act.id, name: act.name, cat: act.cat || 'science', isMust: !!act.isMust,
        lead: vol?.name || '-', leadId: vol?.id || 'none', support: [],
      };
    });
  });

  return {
    classes:[...classes,...(state.classes||[]).filter(c=>!classes.some(x=>x.id===c.id))], timeSlots:[...timeSlots,...(state.timeSlots||[]).filter(s=>!timeSlots.some(x=>x.id===s.id))], activities: A, volunteers: V,
    _kind: 'program',
    _summary: `${classes.length} sınıf, ${timeSlots.length} saat, ${A.length} etkinlik`,
  };
}
