// src/lib/engine.js — çakışma tespiti + dağıtım.
// Tüm aramalar Map/Set indeksli: 2000+ hücrede bile tek geçiş.

import { norm, detectGrade } from './util';

const PRIMARY_BLACKLIST = ['kimya', 'fizik', 'robot', 'yapay zeka', 'gelecege mektup'];
const PRIMARY_WHITELIST = ['yaratici drama', 'origami', 'yuz boyama', 'pino mino', 'muzik', 'resim'];
const MIDDLE_PREF = ['kimya', 'fizik', 'goremedigimiz canavarlar', 'fen', 'matematik', 'robot', 'masa deneyleri', 'vr', 'muzik', 'edebiyat'];

/** Etkinlik bu seviyeye uygun mu? allowedGrades varsa o belirler, yoksa pedagojik kural. */
export const allowed = (act, grade) => {
  if (!act) return false;
  const g = act.allowedGrades;
  if (Array.isArray(g) && g.length) return g.includes(grade);
  const n = norm(act.name);
  if (grade > 0 && grade <= 4 && PRIMARY_BLACKLIST.some((k) => n.includes(k))) return false;
  if (grade >= 5 && n.includes('ilkokul')) return false;
  return true;
};

/** Uygunluk skoru — yüksek olan önce denenir. */
export const score = (act, grade) => {
  const n = norm(act.name);
  let s = 50;
  if (act.isMust) s += 1000;
  if (grade <= 4) {
    if (PRIMARY_WHITELIST.some((k) => n.includes(k))) s += 40;
    if (/bilim|deney/.test(n)) s -= 10;
  } else if (MIDDLE_PREF.some((k) => n.includes(k))) {
    s += 30;
    if (/oyun|drama/.test(n)) s -= 10;
  }
  return s;
};

const key = (a, b) => `${a}|${b}`;

/**
 * Tüm çakışmaları tek geçişte hesaplar.
 * @returns {{type,msg,classId,slotId}[]}
 */
export function calculateConflicts({ activities = [], volunteers = [], timeSlots = [], classes = [] }) {
  const out = [];
  if (!classes.length || !timeSlots.length) return out;
  if (classes.every((c) => !Object.keys(c.schedule || {}).length)) return out;

  const A = new Map(activities.map((a) => [a.id, a]));
  const V = new Map(volunteers.map((v) => [v.id, v]));
  const lessons = timeSlots.filter((s) => s.type === 'lesson');

  const volAt = new Map();   // slot|vol -> sınıf adı
  const stockAt = new Map(); // slot|act -> adet

  for (const c of classes) {
    const grade = detectGrade(c.name);
    const seenAct = new Set();
    const sch = c.schedule || {};

    for (const slot of lessons) {
      const cell = sch[slot.id];
      if (!cell || !cell.activityId) continue;
      if (cell.activityId === 'NO_CLASS') continue;

      const act = A.get(cell.activityId);
      if (act) {
        if (!allowed(act, grade))
          out.push({ type: 'protocol', classId: c.id, slotId: slot.id, msg: `Seviye: ${c.name} → "${act.name}" uygun değil.` });
        if (seenAct.has(act.id))
          out.push({ type: 'duplicate_act', classId: c.id, slotId: slot.id, msg: `${c.name} → "${act.name}" tekrar ediyor.` });
        seenAct.add(act.id);

        const sk = key(slot.id, act.id);
        const used = (stockAt.get(sk) || 0) + 1;
        stockAt.set(sk, used);
        if (act.boxCount && used > act.boxCount)
          out.push({ type: 'stock', classId: c.id, slotId: slot.id, msg: `"${act.name}" ${slot.start}: kutu yetersiz (${used}/${act.boxCount}).` });
      }

      const vol = cell.leadId && cell.leadId !== 'none' ? V.get(cell.leadId) : null;
      if (!vol) continue;
      if (act && !(vol.capabilities || []).includes(act.id))
        out.push({ type: 'competency', classId: c.id, slotId: slot.id, msg: `${vol.name}, "${act.name}" yetkinliğine sahip değil.` });

      const vk = key(slot.id, vol.id);
      if (volAt.has(vk))
        out.push({ type: 'conflict', classId: c.id, slotId: slot.id, msg: `${vol.name} ${slot.start}'de hem ${volAt.get(vk)} hem ${c.name} sınıfında!` });
      else volAt.set(vk, c.name);
    }
  }
  return out;
}

/**
 * Programı doldurur. Kilitli hücrelere ve (onlyEmpty ile) mevcut atamalara dokunmaz.
 * Kısıtlar: yetkinlik, seviye, aynı saatte tek sınıf, sınıf içi tekrar yok, slot başına kutu limiti.
 */
export function distribute({ activities = [], volunteers = [], timeSlots = [], classes = [] }, opts = {}) {
  const { passes = 6, onlyEmpty = false } = opts;
  const lessons = timeSlots.filter((s) => s.type === 'lesson');
  if (!lessons.length || !classes.length || !activities.length) return classes;

  // etkinlik -> o etkinliği yapabilen gönüllüler
  const byAct = new Map(
    activities.map((a) => [a.id, volunteers.filter((v) => (v.capabilities || []).includes(a.id))])
  );
  const gradeOf = new Map(classes.map((c) => [c.id, detectGrade(c.name)]));
  // sınıf başına aday etkinlikler, skora göre sıralı (bir kez hesaplanır)
  const candsOf = new Map(
    classes.map((c) => {
      const g = gradeOf.get(c.id);
      return [c.id, activities.filter((a) => allowed(a, g)).sort((x, y) => score(y, g) - score(x, g))];
    })
  );

  const runOnce = (seed) => {
    const result = classes.map((c) => {
      const keep = {};
      for (const [sid, cell] of Object.entries(c.schedule || {})) {
        if (!cell) continue;
        if (cell.isLocked || cell.activityId === 'NO_CLASS' || (onlyEmpty && cell.activityId)) keep[sid] = cell;
      }
      return { ...c, schedule: keep };
    });

    const busy = new Set();   // slot|vol
    const stock = new Map();  // slot|act
    const load = new Map();   // vol -> ders sayısı
    const used = new Map(result.map((c) => [c.id, new Set()])); // sınıf -> etkinlik id'leri

    for (const c of result) {
      for (const [sid, cell] of Object.entries(c.schedule)) {
        if (!cell.activityId || cell.activityId === 'NO_CLASS') continue;
        used.get(c.id).add(cell.activityId);
        stock.set(key(sid, cell.activityId), (stock.get(key(sid, cell.activityId)) || 0) + 1);
        if (cell.leadId && cell.leadId !== 'none') {
          busy.add(key(sid, cell.leadId));
          load.set(cell.leadId, (load.get(cell.leadId) || 0) + 1);
        }
      }
    }

    const tryPlace = (c, slot, act) => {
      if (used.get(c.id).has(act.id)) return false;
      const sk = key(slot.id, act.id);
      if (act.boxCount && (stock.get(sk) || 0) >= act.boxCount) return false;
      const pool = byAct.get(act.id) || [];
      let lead = null, best = Infinity;
      for (const v of pool) {
        if (busy.has(key(slot.id, v.id))) continue;
        const l = load.get(v.id) || 0;
        if (l < best) { best = l; lead = v; }
      }
      if (!lead) return false;
      c.schedule[slot.id] = {
        activityId: act.id, name: act.name, cat: act.cat || 'science',
        isMust: !!act.isMust, lead: lead.name, leadId: lead.id, support: [],
      };
      used.get(c.id).add(act.id);
      stock.set(sk, (stock.get(sk) || 0) + 1);
      busy.add(key(slot.id, lead.id));
      load.set(lead.id, best + 1);
      return true;
    };

    // deterministik ama tur başına kayan sıra — rastgele shuffle'dan daha stabil ve hızlı
    const order = result.map((_, i) => (i + seed) % result.length);
    let filled = 0;
    for (const oi of order) {
      const c = result[oi];
      const cands = candsOf.get(c.id);
      for (const slot of lessons) {
        if (c.schedule[slot.id]) { filled++; continue; }
        for (let i = 0; i < cands.length; i++) {
          const act = cands[(i + seed) % cands.length];
          if (tryPlace(c, slot, act)) { filled++; break; }
        }
      }
    }
    return { classes: result, filled };
  };

  const target = classes.length * lessons.length;
  let best = null;
  for (let p = 0; p < passes; p++) {
    const r = runOnce(p);
    if (!best || r.filled > best.filled) best = r;
    if (best.filled >= target) break;
  }
  return best.classes;
}
