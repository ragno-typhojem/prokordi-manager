// src/lib/importer.js — Excel / CSV / TSV / serbest yapıştırma → tek giriş noktası.
// Kullanıcı ne yapıştırırsa yapıştırsın türü kendi anlar: program, gönüllü, etkinlik, sınıf, isim.

import { uid, norm, find, addMin } from './util';

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
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  // en tutarlı ayırıcıyı seç: satırların çoğunda aynı sayıda alan üretmeli
  const cand = ['\t', ';', ',', '|'].map((d) => {
    const counts = lines.slice(0, 20).map((l) => l.split(d).length);
    const mode = counts.sort((a, b) => a - b)[Math.floor(counts.length / 2)];
    return { d, mode, ok: mode > 1 && counts.filter((c) => c === mode).length / counts.length > 0.6 };
  }).filter((x) => x.ok).sort((a, b) => b.mode - a.mode)[0];

  const unq = (s) => s.replace(/^\s*"(.*)"\s*$/s, '$1').replace(/""/g, '"').trim();
  return lines.map((l) => (cand ? l.split(cand.d).map(unq) : [unq(l)]));
}

/** İçeriğe bakarak türü tahmin eder. */
export function detectKind(rows) {
  if (!rows.length) return 'names';
  const head = (rows[0] || []).map(norm).join(' ');
  const body = rows.slice(1);

  // ilk sütunu saat olan satırlar çoğunluktaysa → program tablosu
  const timeRows = body.filter((r) => TIME.test(String(r[0] || ''))).length;
  if (timeRows >= 2 && timeRows >= body.length * 0.4) return 'schedule';

  if (/gonullu|isim|ad soyad|katilimci/.test(head) && /etkinlik|yetenek|yetkinlik|yapabil/.test(head)) return 'volunteers';
  if (/etkinlik|aktivite|atolye/.test(head) && /(kutu|stok|zorunlu|must|sinif|seviye)/.test(head)) return 'activities';
  if (/sinif|sube/.test(head) && rows.every((r) => r.filter(Boolean).length <= 2)) return 'classes';

  const single = rows.every((r) => r.filter(Boolean).length === 1);
  if (single) return /^(ana ?sinifi|\d+\s*[-/]?\s*[a-z])$/.test(norm(rows[0][0])) ? 'classes' : 'names';
  return 'volunteers';
}

export function parseAny(input) {
  const rows = Array.isArray(input) ? input : splitText(String(input));
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
  const A = [...(state.activities || [])];
  const V = [...(state.volunteers || [])];

  const getAct = (name) => {
    const n = String(name || '').trim();
    if (!n) return null;
    let a = find(A, n);
    if (!a) { a = { id: uid(), name: n, cat: 'science', isMust: false, boxCount: 10, allowedGrades: [] }; A.push(a); }
    return a;
  };
  const getVol = (name) => {
    const n = String(name || '').trim();
    if (!n) return null;
    let v = find(V, n);
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
      if (iG >= 0 && r[iG]) a.allowedGrades = (String(r[iG]).match(/\d/g) || []).map(Number);
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
    return ex ? { ...ex, schedule: {} } : { id: uid(), name: n, schedule: {} };
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
    const type = /ogle|yemek|lunch/.test(joined) ? 'lunch'
      : /teneffus|mola|ara$|break/.test(joined) ? 'break'
      : cells.every((c) => !String(c).trim()) ? 'break' : 'lesson';
    const slot = { id: uid(), start, end: end || start, type };
    timeSlots.push(slot);
    bodyRows.push({ slot, cells });
  });

  // bitişi olmayan slotlara bir sonrakinin başlangıcını ver
  timeSlots.forEach((s, i) => {
    if (s.end === s.start) s.end = timeSlots[i + 1]?.start || addMin(s.start, 40);
  });

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
      if (vol && !vol.capabilities.includes(act.id)) vol.capabilities = [...vol.capabilities, act.id];
      classes[i].schedule[slot.id] = {
        activityId: act.id, name: act.name, cat: act.cat || 'science', isMust: !!act.isMust,
        lead: vol?.name || '-', leadId: vol?.id || 'none', support: [],
      };
    });
  });

  return {
    classes, timeSlots, activities: A, volunteers: V,
    _kind: 'program',
    _summary: `${classes.length} sınıf, ${timeSlots.length} saat, ${A.length} etkinlik`,
  };
}
