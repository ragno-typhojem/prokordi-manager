// src/lib/ai.js — B.A.L.K.I.Z. çekirdeği.
// Model konuşur, uygulama uygular: AI sadece isim yazar, id çözümlemesini burası yapar.

import { uid, norm, find, findSlot, addMin, detectGrade, cloneClasses } from './util';
import { distribute } from './engine';
import { parseAny, toStatePatch } from './importer';

// ── durumu sıkıştır (token tasarrufu: ~%80 daha az) ─────────────────────────
export const compactState = ({ activities = [], volunteers = [], timeSlots = [], classes = [] }, warnings = []) => {
  const A = new Map(activities.map((a) => [a.id, a.name]));
  const lessons = timeSlots.filter((s) => s.type === 'lesson');
  return {
    etkinlikler: activities.map((a) =>
      `${a.name}${a.isMust ? '*' : ''} kutu:${a.boxCount ?? '-'} sinif:${(a.allowedGrades || []).join('') || 'hepsi'}`),
    gonulluler: volunteers.map((v) =>
      `${v.name} → ${(v.capabilities || []).map((id) => A.get(id)).filter(Boolean).join(', ') || 'yetkinlik yok'}`),
    dersler: lessons.map((s, i) => `${i + 1}. ${s.start}-${s.end}`),
    siniflar: classes.map((c) => {
      const dolu = lessons.map((s, i) => {
        const cell = c.schedule?.[s.id];
        if (!cell) return null;
        if (cell.activityId === 'NO_CLASS') return `${i + 1}:DERS YOK`;
        return `${i + 1}:${cell.name}${cell.lead && cell.lead !== '-' ? `(${cell.lead})` : ''}`;
      }).filter(Boolean);
      return `${c.name} [${dolu.join(' | ') || 'boş'}]`;
    }),
    uyarilar: warnings.slice(0, 12).map((w) => w.msg || w.message || String(w)),
  };
};

export const SYSTEM = `Sen B.A.L.K.I.Z.'sın: Türkçe konuşan, gönüllü etkinlik programı yöneten bir ajansın.
SADECE geçerli JSON döndür: {"message": string, "actions": Action[]}. Başka hiçbir şey yazma.

KURALLAR
- Kullanıcı ne isterse aksiyona çevir. Belirsizse en makul yorumu yap ve message'da ne yaptığını söyle.
- Sadece soru soruyorsa actions boş olsun, message'da cevap ver.
- İSİMLERİ YAZ, ID YAZMA. Yaklaşık yazsan da sistem eşleştirir ("eda" → "Eda Nur Keklik").
- Slot için ders sırası (1,2,3) veya saat ("09:00") kullan.
- Birden fazla iş varsa hepsini actions dizisine sırayla koy.
- Toplu işlerde tek tek yazmak yerine uygun toplu aksiyonu kullan (distribute, clear_schedule…).

ACTION TÜRLERİ
{"type":"add_volunteer","name":"Ad Soyad","capabilities":["etkinlik adı",...]}
{"type":"remove_volunteer","name":""}
{"type":"set_capabilities","volunteer":"","capabilities":[""],"mode":"set|add|remove"}
{"type":"add_activity","name":"","isMust":false,"boxCount":10,"grades":[1,2]}
{"type":"update_activity","name":"","newName":"","isMust":true,"boxCount":5,"grades":[]}
{"type":"remove_activity","name":""}
{"type":"add_class","name":"5-A"}
{"type":"remove_class","name":""}
{"type":"add_timeslot","start":"09:00","duration":40,"slotType":"lesson|break|lunch"}
{"type":"clear_timeslots"}
{"type":"load_template"}
{"type":"set_slot","class":"1-A","slot":3,"activity":"Origami","volunteer":"Eda","lock":false}
{"type":"clear_slot","class":"","slot":1}
{"type":"swap","classA":"","slotA":1,"classB":"","slotB":2}
{"type":"no_class","class":"","slot":1}
{"type":"no_class_all","slot":1}
{"type":"distribute","onlyEmpty":false}
{"type":"clear_schedule","keepMust":false}
{"type":"bulk_import","text":"<yapıştırılan liste veya tablo>"}

ÖRNEKLER
"Ayşe'yi ekle, origami ve drama yapabilir" → add_volunteer
"3. ders 4-A'ya kimya koy, Mehmet anlatsın" → set_slot
"herkesi dağıt" / "programı doldur" → distribute
"boş kalan yerleri doldur" → distribute onlyEmpty:true
"1-A ile 2-B'nin ilk derslerini değiştir" → swap
"zorunlular kalsın gerisini sil" → clear_schedule keepMust:true`;

// ── güvenli JSON çıkarma ────────────────────────────────────────────────────
export const extractJSON = (txt) => {
  if (!txt) return null;
  try { return JSON.parse(txt); } catch {}
  const s = String(txt).replace(/```(?:json)?/gi, '');
  const i = s.indexOf('{'), j = s.lastIndexOf('}');
  if (i < 0 || j <= i) return null;
  try { return JSON.parse(s.slice(i, j + 1)); } catch { return null; }
};

// ── API çağrısı ─────────────────────────────────────────────────────────────
export async function askBalkiz({ text, history = [], state, warnings = [], signal }) {
  const messages = [
    ...history.slice(-8).map((h) => ({ role: h.role, content: String(h.content).slice(0, 1500) })),
    { role: 'user', content: `DURUM:\n${JSON.stringify(compactState(state, warnings))}\n\nİSTEK: ${text}` },
  ];

  const r = await fetch('/api/chat', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: SYSTEM, messages, json: true, max_tokens: 2000 }),
  });

  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { throw new Error('Sunucudan geçersiz yanıt (zaman aşımı olabilir).'); }
  if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);

  const content = data.content ?? '';
  const parsed = extractJSON(content) || { message: content, actions: [] };
  return {
    message: parsed.message || 'Tamam.',
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    model: data.model,
  };
}

// ── reducer: aksiyonları uygula (saf fonksiyon) ─────────────────────────────
const cell = (act, vol, lock) => ({
  activityId: act.id, name: act.name, cat: act.cat || 'science', isMust: !!act.isMust,
  lead: vol?.name || '-', leadId: vol?.id || 'none', support: [], ...(lock != null && { isLocked: !!lock }),
});

const NO_CLASS = { activityId: 'NO_CLASS', name: 'DERS YOK', cat: 'none', isMust: false, lead: '-', leadId: 'none', isLocked: true };

const TEMPLATE = () => [
  ['09:00', 40, 'lesson'], ['09:40', 15, 'break'], ['09:55', 40, 'lesson'], ['10:35', 15, 'break'],
  ['10:50', 40, 'lesson'], ['11:30', 60, 'lunch'], ['12:30', 40, 'lesson'], ['13:10', 15, 'break'],
  ['13:25', 40, 'lesson'],
].map(([start, d, type]) => ({ id: uid(), start, end: addMin(start, d), type }));

export function applyActions(state, actions) {
  let s = {
    activities: [...state.activities],
    volunteers: [...state.volunteers],
    timeSlots: [...state.timeSlots],
    classes: cloneClasses(state.classes),
  };
  const log = [];

  const getAct = (name, create = true) => {
    let a = find(s.activities, name);
    if (!a && create && name) {
      a = { id: uid(), name: String(name).trim(), cat: 'science', isMust: false, boxCount: 10, allowedGrades: [] };
      s.activities = [...s.activities, a];
      log.push(`+ etkinlik ${a.name}`);
    }
    return a;
  };
  const setCell = (clsQ, slotQ, value) => {
    const c = find(s.classes, clsQ);
    const sl = findSlot(s.timeSlots, slotQ);
    if (!c || !sl) { log.push(`? bulunamadı: ${clsQ} / ${slotQ}`); return null; }
    if (value === null) delete c.schedule[sl.id];
    else c.schedule[sl.id] = value;
    return { c, sl };
  };

  for (const a of actions || []) {
    try {
      switch (a.type) {
        case 'add_volunteer': {
          if (!a.name) break;
          if (find(s.volunteers, a.name)) { log.push(`= ${a.name} zaten var`); break; }
          const caps = new Set();
          for (const n of a.capabilities || []) { const act = getAct(n); if (act) caps.add(act.id); }
          s.volunteers = [...s.volunteers, { id: uid(), name: String(a.name).trim(), capabilities: [...caps] }];
          log.push(`+ gönüllü ${a.name}`);
          break;
        }
        case 'remove_volunteer': {
          const v = find(s.volunteers, a.name || a.volunteer);
          if (!v) { log.push(`? gönüllü yok: ${a.name}`); break; }
          s.volunteers = s.volunteers.filter((x) => x !== v);
          s.classes.forEach((c) => Object.entries(c.schedule).forEach(([k, cl]) => {
            if (cl?.leadId === v.id) c.schedule[k] = { ...cl, lead: '-', leadId: 'none' };
          }));
          log.push(`− gönüllü ${v.name}`);
          break;
        }
        case 'set_capabilities': {
          const v = find(s.volunteers, a.volunteer || a.name);
          if (!v) { log.push(`? gönüllü yok: ${a.volunteer}`); break; }
          const ids = (a.capabilities || []).map((n) => getAct(n)?.id).filter(Boolean);
          const cur = new Set(v.capabilities || []);
          if (a.mode === 'add') ids.forEach((i) => cur.add(i));
          else if (a.mode === 'remove') ids.forEach((i) => cur.delete(i));
          else { cur.clear(); ids.forEach((i) => cur.add(i)); }
          s.volunteers = s.volunteers.map((x) => (x === v ? { ...x, capabilities: [...cur] } : x));
          log.push(`~ yetkinlik ${v.name} (${cur.size})`);
          break;
        }
        case 'add_activity': {
          if (!a.name) break;
          if (find(s.activities, a.name)) { log.push(`= ${a.name} zaten var`); break; }
          s.activities = [...s.activities, {
            id: uid(), name: String(a.name).trim(), cat: a.cat || 'science',
            isMust: !!a.isMust, boxCount: a.boxCount ?? 10,
            allowedGrades: a.grades || a.allowedGrades || [],
          }];
          log.push(`+ etkinlik ${a.name}`);
          break;
        }
        case 'update_activity': {
          const act = find(s.activities, a.name);
          if (!act) { log.push(`? etkinlik yok: ${a.name}`); break; }
          const patch = {
            ...(a.newName && { name: a.newName }),
            ...(a.isMust != null && { isMust: !!a.isMust }),
            ...(a.boxCount != null && { boxCount: Number(a.boxCount) }),
            ...((a.grades || a.allowedGrades) && { allowedGrades: a.grades || a.allowedGrades }),
          };
          s.activities = s.activities.map((x) => (x === act ? { ...x, ...patch } : x));
          if (patch.name || patch.isMust != null)
            s.classes.forEach((c) => Object.entries(c.schedule).forEach(([k, cl]) => {
              if (cl?.activityId === act.id) c.schedule[k] = { ...cl, name: patch.name || cl.name, isMust: patch.isMust ?? cl.isMust };
            }));
          log.push(`~ etkinlik ${act.name}`);
          break;
        }
        case 'remove_activity': {
          const act = find(s.activities, a.name);
          if (!act) { log.push(`? etkinlik yok: ${a.name}`); break; }
          s.activities = s.activities.filter((x) => x !== act);
          s.volunteers = s.volunteers.map((v) => ({ ...v, capabilities: (v.capabilities || []).filter((i) => i !== act.id) }));
          s.classes.forEach((c) => Object.entries(c.schedule).forEach(([k, cl]) => { if (cl?.activityId === act.id) delete c.schedule[k]; }));
          log.push(`− etkinlik ${act.name}`);
          break;
        }
        case 'add_class': {
          if (!a.name || find(s.classes, a.name)) break;
          s.classes = [...s.classes, { id: uid(), name: String(a.name).trim(), schedule: {} }];
          log.push(`+ sınıf ${a.name}`);
          break;
        }
        case 'remove_class': {
          const c = find(s.classes, a.name);
          if (!c) break;
          s.classes = s.classes.filter((x) => x !== c);
          log.push(`− sınıf ${c.name}`);
          break;
        }
        case 'add_timeslot': {
          const last = s.timeSlots[s.timeSlots.length - 1];
          const start = a.start || last?.end || '09:00';
          const type = a.slotType || a.type || 'lesson';
          const dur = a.duration || (type === 'lunch' ? 60 : type === 'break' ? 15 : 40);
          s.timeSlots = [...s.timeSlots, { id: uid(), start, end: addMin(start, dur), type }];
          log.push(`+ saat ${start}`);
          break;
        }
        case 'clear_timeslots':
          s.timeSlots = [];
          s.classes = s.classes.map((c) => ({ ...c, schedule: {} }));
          log.push('× saatler temizlendi');
          break;
        case 'load_template':
          s.timeSlots = TEMPLATE();
          log.push('✓ standart şablon');
          break;
        case 'set_slot':
        case 'update_slot': {
          const act = getAct(a.activity || a.activityName || a.name);
          if (!act) { log.push('? etkinlik belirtilmedi'); break; }
          const vol = (a.volunteer || a.leadName || a.lead) ? find(s.volunteers, a.volunteer || a.leadName || a.lead) : null;
          const r = setCell(a.class || a.className || a.classId, a.slot ?? a.slotId, cell(act, vol, a.lock));
          if (r) {
            if (vol && !(vol.capabilities || []).includes(act.id))
              s.volunteers = s.volunteers.map((x) => (x === vol ? { ...x, capabilities: [...(x.capabilities || []), act.id] } : x));
            log.push(`~ ${r.c.name} ${r.sl.start} → ${act.name}${vol ? ` (${vol.name})` : ''}`);
          }
          break;
        }
        case 'clear_slot':
        case 'delete_slot': {
          const r = setCell(a.class || a.className || a.classId, a.slot ?? a.slotId, null);
          if (r) log.push(`− ${r.c.name} ${r.sl.start}`);
          break;
        }
        case 'no_class': {
          const r = setCell(a.class || a.className, a.slot ?? a.slotId, { ...NO_CLASS });
          if (r) log.push(`× ${r.c.name} ${r.sl.start} ders yok`);
          break;
        }
        case 'no_class_all': {
          const sl = findSlot(s.timeSlots, a.slot ?? a.slotId);
          if (!sl) break;
          s.classes.forEach((c) => { c.schedule[sl.id] = { ...NO_CLASS }; });
          log.push(`× ${sl.start} tüm sınıflara kapatıldı`);
          break;
        }
        case 'swap': {
          const A1 = find(s.classes, a.classA), B1 = find(s.classes, a.classB || a.classA);
          const sa = findSlot(s.timeSlots, a.slotA), sb = findSlot(s.timeSlots, a.slotB ?? a.slotA);
          if (!A1 || !B1 || !sa || !sb) { log.push('? takas hedefi bulunamadı'); break; }
          const x = A1.schedule[sa.id], y = B1.schedule[sb.id];
          if (y) A1.schedule[sa.id] = y; else delete A1.schedule[sa.id];
          if (x) B1.schedule[sb.id] = x; else delete B1.schedule[sb.id];
          log.push(`⇄ ${A1.name} ${sa.start} ↔ ${B1.name} ${sb.start}`);
          break;
        }
        case 'distribute':
          s.classes = distribute(s, { onlyEmpty: !!a.onlyEmpty });
          log.push('✓ dağıtım tamamlandı');
          break;
        case 'clear_schedule':
          s.classes = s.classes.map((c) => ({
            ...c,
            schedule: Object.fromEntries(Object.entries(c.schedule).filter(([, v]) =>
              v?.isLocked || (a.keepMust && v?.isMust))),
          }));
          log.push(a.keepMust ? '× zorunlular hariç silindi' : '× program temizlendi');
          break;
        case 'clear_non_mandatory':
          s.classes = s.classes.map((c) => ({
            ...c,
            schedule: Object.fromEntries(Object.entries(c.schedule).filter(([, v]) => v?.isMust || v?.isLocked)),
          }));
          log.push('× zorunlu olmayanlar silindi');
          break;
        case 'bulk_import': {
          const p = toStatePatch(parseAny(a.text || ''), s);
          s = { ...s, ...p };
          log.push(`⇩ içe aktarım (${p._kind}: ${p._summary})`);
          break;
        }
        default:
          log.push(`? bilinmeyen aksiyon: ${a.type}`);
      }
    } catch (e) {
      log.push(`! ${a.type}: ${e.message}`);
    }
  }
  return { state: s, log };
}

export { norm, detectGrade };
