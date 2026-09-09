// src/lib/util.js — ortak yardımcılar (Türkçe normalize, bulanık eşleşme, slot çözümleme)

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Türkçe'ye duyarlı normalize: "Şükrü Öz" -> "sukru oz" */
export const norm = (s) =>
  String(s ?? '')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** bigram benzerliği (0..1) — yazım hatalarına toleranslı */
export const sim = (a, b) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.88;
  const grams = (s) => {
    const g = new Set();
    for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2));
    return g;
  };
  const A = grams(a), B = grams(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  A.forEach((x) => B.has(x) && hit++);
  return (2 * hit) / (A.size + B.size);
};

/**
 * Listede id ile ya da isimle (bulanık) arar.
 * "eda" -> "Eda Nur Keklik" gibi kısmi isimleri de yakalar.
 */
export const find = (list, q, key = 'name') => {
  if (q == null || q === '') return null;
  if (Array.isArray(q)) q = q[0];
  const byId = list.find((x) => x.id === q);
  if (byId) return byId;
  const nq = norm(q);
  if (!nq) return null;
  let best = null, score = 0.5;
  for (const x of list) {
    const nx = norm(x[key]);
    let s = sim(nx, nq);
    // ilk ad eşleşmesi bonusu: "eda" -> "eda nur keklik"
    const parts = nx.split(' ');
    if (parts.some((p) => p === nq)) s = Math.max(s, 0.95);
    if (s > score) { score = s; best = x; }
  }
  return best;
};

export const findAll = (list, names, key = 'name') =>
  (Array.isArray(names) ? names : [names])
    .map((n) => find(list, n, key))
    .filter(Boolean);

const HHMM = /^(\d{1,2})[:.](\d{2})$/;

export const addMin = (t, d) => {
  const m = HHMM.exec(String(t || '09:00'));
  const base = m ? +m[1] * 60 + +m[2] : 540;
  const x = Math.max(0, base + (Number(d) || 0));
  return `${String(Math.floor(x / 60) % 24).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
};

export const toMin = (t) => {
  const m = HHMM.exec(String(t || ''));
  return m ? +m[1] * 60 + +m[2] : -1;
};

/**
 * Slot çözümleme — AI ya da kullanıcı ne yazarsa yazsın:
 *  3 | "3" | "3. ders"  -> 3. DERS slotu
 *  "09:00" | "9:00" | "09:00-09:40" -> saate göre
 *  "ilk ders" / "son ders" / "öğleden sonra"
 *  slot.id -> doğrudan
 */
export const findSlot = (slots, q) => {
  if (q == null || q === '') return null;
  const lessons = slots.filter((s) => s.type === 'lesson');
  if (typeof q === 'number') return lessons[q - 1] || slots[q - 1] || null;

  const raw = String(q).trim();
  const byId = slots.find((s) => s.id === raw);
  if (byId) return byId;

  const n = norm(raw);
  if (/^(ilk|birinci)/.test(n)) return lessons[0] || null;
  if (/^(son|sonuncu)/.test(n)) return lessons[lessons.length - 1] || null;

  // "3" veya "3. ders" / "3.ders" / "ders 3"
  const ord = n.match(/^(\d{1,2})\s*\.?\s*(ders|saat)?$/) || n.match(/^(?:ders|saat)\s*(\d{1,2})$/);
  if (ord) return lessons[+ord[1] - 1] || null;

  // saat aralığı ya da tek saat
  const times = raw.match(/\d{1,2}[:.]\d{2}/g);
  if (times?.length) {
    const target = toMin(times[0].replace('.', ':'));
    let best = null, diff = 31;
    for (const s of slots) {
      const d = Math.abs(toMin(s.start) - target);
      if (d < diff) { diff = d; best = s; }
    }
    return best;
  }
  return null;
};

export const detectGrade = (name) => {
  const n = norm(name);
  if (/ana|kres|okul oncesi/.test(n)) return 0;
  const m = n.match(/\d+/);
  return m ? +m[0] : 0;
};

/** Aynı referansı korumaya çalışan sığ klon — büyük state'lerde JSON.parse/stringify'dan çok hızlı */
export const cloneClasses = (classes) =>
  classes.map((c) => ({ ...c, schedule: { ...(c.schedule || {}) } }));
