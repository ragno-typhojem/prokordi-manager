// src/lib/db.js — bellek önbelleği + debounce'lu localStorage.
// Her keystroke'ta JSON.stringify yok: 250 ms'lik toplu yazım.

const cache = new Map();
const timers = new Map();

export const DB_KEYS = {
  ACTIVITIES: 'activities_v30',
  VOLUNTEERS: 'shared_volunteers_v30',
  TIMESLOTS: 'timeSlots_v30',
  CLASSES: 'classes_v30',
  NAMETAG_VOLUNTEERS: 'nametags_v30',
  COLLAGE_VOLUNTEERS: 'collage_v30',
  CHAT_HISTORY: 'balkiz_chat_v2',
  DARK_MODE: 'prokdi_dark_v1',
};

const write = (key) => {
  try { localStorage.setItem(key, JSON.stringify(cache.get(key))); } catch { if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('prokordi-storage-error')); }
};

export const db = {
  load(key, fallback) {
    if (cache.has(key)) return cache.get(key);
    let v = fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) v = JSON.parse(raw);
    } catch { v = fallback; }
    cache.set(key, v ?? fallback);
    return cache.get(key);
  },

  save(key, value, delay = 250) {
    cache.set(key, value);
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => { timers.delete(key); write(key); }, delay));
    return true;
  },

  flush() {
    timers.forEach((t, k) => { clearTimeout(t); write(k); });
    timers.clear();
  },

  clearAll() {
    db.flush();
    cache.clear();
    Object.values(DB_KEYS).forEach((k) => { try { localStorage.removeItem(k); } catch {} });
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', event=>{if(event.key)cache.delete(event.key);else cache.clear();});
  window.addEventListener('beforeunload', db.flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) db.flush(); });
}
