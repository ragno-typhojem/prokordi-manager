// App.js
/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Users, FileText, Image as ImageIcon, Printer, Plus, Trash2, Upload, X, CheckCircle2, BookOpen, GraduationCap, Package, Sparkles, RefreshCw, Wand2, Zap, ChevronDown, ChevronUp, Type, Minus, PlusCircle, Maximize2, Smile, Camera, Settings2, MoveVertical, Maximize, Download, UploadCloud, Search, AlertTriangle, Send, MessageSquare, Bot, ChevronRight, LayoutDashboard, Clock, Moon, Sun, Trash, Filter
} from 'lucide-react';

// ─── DATABASE ────────────────────────────────────────────────────────────────
const DB_KEYS = {
  ACTIVITIES: 'activities_v40',
  VOLUNTEERS: 'shared_volunteers_v40',
  TIMESLOTS: 'timeSlots_v40',
  CLASSES: 'classes_v40',
  NAMETAG_VOLUNTEERS: 'nametags_v40',
  COLLAGE_VOLUNTEERS: 'collage_v40',
  CHAT_HISTORY: 'balkiz_chat_v2',
  DARK_MODE: 'dark_mode_v1'
};

const db = {
  save: (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; } },
  load: (key, def) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def; } catch { return def; } },
  clear: () => { Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k)); }
};

const syncVolunteers = (src = null) => {
  try {
    const v = src || db.load(DB_KEYS.VOLUNTEERS, []);
    db.save(DB_KEYS.VOLUNTEERS, v);
    db.save(DB_KEYS.NAMETAG_VOLUNTEERS, v);
    db.save(DB_KEYS.COLLAGE_VOLUNTEERS, v);
    return v;
  } catch { return []; }
};

const uuid = () => Math.random().toString(36).substr(2, 9);

const IMAGES = {
  NAME_BG: "https://i.ibb.co/9Hcchfq8/ntaraf.png",
  QUESTION_BG: "https://i.ibb.co/mVYxB8j2/Ekran-g-r-nt-s-2026-01-12-202232.png"
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&family=Comic+Neue:wght@400;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }
body { font-family: 'DM Sans', sans-serif; transition: background-color 0.3s, color 0.3s; }

.dark { background: #0f172a; color: #e2e8f0; }
.dark .bg-white { background: #1e293b !important; }
.dark .text-slate-800 { color: #e2e8f0 !important; }
.dark .text-slate-600 { color: #cbd5e1 !important; }
.dark .text-slate-400 { color: #94a3b8 !important; }
.dark .border-slate-200 { border-color: #334155 !important; }
.dark .bg-slate-50 { background: #1e293b !important; }
.dark .bg-slate-100 { background: #334155 !important; }

/* ── Animations ── */
@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
@keyframes spinSlow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes blink { 0%,100%{ opacity:1; } 50%{ opacity:0; } }

/* ── JARVIS Brain Animation ── */
@keyframes orbit-1 { 
  0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
}
@keyframes orbit-2 { 
  0% { transform: rotate(120deg) translateX(20px) rotate(-120deg); }
  100% { transform: rotate(480deg) translateX(20px) rotate(-480deg); }
}
@keyframes orbit-3 { 
  0% { transform: rotate(240deg) translateX(20px) rotate(-240deg); }
  100% { transform: rotate(600deg) translateX(20px) rotate(-600deg); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.4); }
  50% { box-shadow: 0 0 40px rgba(139,92,246,0.8); }
}
@keyframes particle-float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
  50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
}

.jarvis-brain {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jarvis-core {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  z-index: 3;
  animation: pulse-glow 2s ease-in-out infinite;
}

.jarvis-ring {
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  opacity: 0.7;
}

.jarvis-ring-1 {
  width: 30px;
  height: 30px;
  border-color: #6366f1 transparent #6366f1 transparent;
  animation: orbit-1 3s linear infinite;
}

.jarvis-ring-2 {
  width: 38px;
  height: 38px;
  border-color: #8b5cf6 transparent #8b5cf6 transparent;
  animation: orbit-2 4s linear infinite;
}

.jarvis-ring-3 {
  width: 46px;
  height: 46px;
  border-color: #06b6d4 transparent #06b6d4 transparent;
  animation: orbit-3 5s linear infinite;
}

.jarvis-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #a855f7;
  border-radius: 50%;
  animation: particle-float 2s ease-in-out infinite;
}

.jarvis-particle:nth-child(1) { top: 5px; left: 15px; animation-delay: 0s; }
.jarvis-particle:nth-child(2) { top: 15px; right: 8px; animation-delay: 0.3s; }
.jarvis-particle:nth-child(3) { bottom: 10px; left: 10px; animation-delay: 0.6s; }
.jarvis-particle:nth-child(4) { bottom: 5px; right: 15px; animation-delay: 0.9s; }

/* ── Glass Panel ── */
.glass-panel {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow: 0 4px 32px rgba(99,102,241,0.08);
}

.dark .glass-panel {
  background: rgba(30,41,59,0.7);
  border-color: rgba(255,255,255,0.08);
}

/* ── Scrollbar ── */
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
.dark .custom-scroll::-webkit-scrollbar-thumb { background: #475569; }

/* ── Print ── */
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
  .dark { background: white !important; color: black !important; }
}
`;

// ─── MODAL: Confirm ───────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isDanger = false, confirmText = "Onayla" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
            {isDanger ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
          </div>
          <h3 className="text-base font-700 text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-600 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">İptal</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-700 text-white transition-all active:scale-95 ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// ─── CLOCK ────────────────────────────────────────────────────────────────────
const Saat = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono font-500 text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
      <Clock size={12} className="text-slate-400"/>
      {time}
    </div>
  );
};

// ─── B.A.L.K.I.Z. AI CHAT — JARVIS Edition ───────────────────────────────────
function BalkizAIChat({ appState, onAction, warnings = [] }) {
  const INITIAL = [{ role: 'assistant', content: '👋 **ProKordiManager B.A.L.K.I.Z. v4.0**\n\nDoğal dilde komut verin:\n• "5 gönüllü ekle"\n• "10:00-11:30 arası Kimya ekle"\n• "Ahmet\'e Fizik yetkinliği ver"\n• "Zorunlu olmayanları sil"' }];
  
  const [messages, setMessages] = useState(() => db.load(DB_KEYS.CHAT_HISTORY, INITIAL));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const endRef = useRef(null);

  useEffect(() => { db.save(DB_KEYS.CHAT_HISTORY, messages); }, [messages]);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const buildSystemPrompt = () => {
    const { activities = [], volunteers = [], classes = [], timeSlots = [] } = appState || {};
    return `Sen B.A.L.K.I.Z. (Bilgisayar Destekli Lojistik Koordinasyon İzleme Zekası) — ProKordiManager asistanısın.

MEVCUT DURUM:
Etkinlikler: ${JSON.stringify(activities.map(a => ({ id: a.id, name: a.name, isMust: a.isMust })))}
Gönüllüler: ${JSON.stringify(volunteers.map(v => ({ id: v.id, name: v.name })))}
Sınıflar: ${classes.map(c => c.name).join(', ')}
Zaman: ${timeSlots.map(t => `${t.start}-${t.end}`).join(', ')}

ÖNEMLİ KURALLAR:
1. Program güncellemesi isterse → ÖNCE clear_schedule çalıştır, SONRA yeni atamaları yap
2. Saat aralığı verilirse (örn: "10:00-11:30") → o aralıktaki TÜM slotları bul ve ata
3. Gönüllüye etkinlik atarken → önce capability ekle, sonra ata
4. SADECE JSON döndür, markdown kullanma

KOMUTLAR:
- add_volunteer: { type:"add_volunteer", name:"..." }
- add_activity: { type:"add_activity", name:"...", isMust:false }
- clear_schedule: { type:"clear_schedule" } // Tüm programı sil
- clear_optional: { type:"clear_optional" } // Zorunlu olmayanları sil
- assign_slot: { type:"assign_slot", classId:"...", slotId:"...", activityId:"...", volunteerId:"..." }
- add_capability: { type:"add_capability", volunteerId:"...", activityId:"..." }

FORMAT:
{"message":"Kullanıcıya mesaj","actions":[...]}`;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 1500,
          system: buildSystemPrompt(),
          messages: newMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      const raw = data.content?.[0]?.text || '{"message":"Hata oluştu.","actions":[]}';
      let parsed;
      try {
        parsed = JSON.parse(raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
      } catch {
        parsed = { message: raw, actions: [] };
      }

      setMessages([...newMsgs, { role: 'assistant', content: parsed.message }]);
      if (parsed.actions?.length) parsed.actions.forEach(a => onAction(a));
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: `⚠️ ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-print mb-6 glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="jarvis-brain">
            {loading && (
              <>
                <div className="jarvis-particle"/>
                <div className="jarvis-particle"/>
                <div className="jarvis-particle"/>
                <div className="jarvis-particle"/>
              </>
            )}
            <div className="jarvis-ring jarvis-ring-1"/>
            <div className="jarvis-ring jarvis-ring-2"/>
            <div className="jarvis-ring jarvis-ring-3"/>
            <div className="jarvis-core"/>
          </div>
          <div>
            <div className="text-sm font-700 text-slate-800">B.A.L.K.I.Z.</div>
            <div className="text-[10px] font-500 text-slate-400 uppercase tracking-widest">
              {loading ? 'Düşünüyor...' : warnings.length > 0 ? `${warnings.length} uyarı` : 'Hazır'}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMessages(INITIAL)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <RefreshCw size={14} className="text-slate-400"/>
          </button>
          <button onClick={() => setIsOpen(v => !v)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            {isOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          {/* Messages */}
          <div className="h-56 overflow-y-auto custom-scroll p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
                    <Bot size={12} className="text-white"/>
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white' 
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Bot size={12} className="text-white"/>
                </div>
                <div className="bg-slate-100 px-4 py-3 rounded-2xl flex gap-1.5">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Komut yazın... (Örn: 10:00-11:30 arası Kimya ekle)"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-700 text-sm hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw size={16} className="animate-spin"/> : <Send size={16}/>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MODULE 1: SIMPLIFIED SCHEDULER ──────────────────────────────────────────
function SimplifiedScheduler({ onNotify, darkMode }) {
  const [activities, setActivities] = useState(() => db.load(DB_KEYS.ACTIVITIES, []));
  const [volunteers, setVolunteers] = useState(() => db.load(DB_KEYS.VOLUNTEERS, []));
  const [timeSlots, setTimeSlots] = useState(() => db.load(DB_KEYS.TIMESLOTS, []));
  const [classes, setClasses] = useState(() => db.load(DB_KEYS.CLASSES, []));
  const [warnings, setWarnings] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => { db.save(DB_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { db.save(DB_KEYS.VOLUNTEERS, volunteers); syncVolunteers(volunteers); }, [volunteers]);
  useEffect(() => { db.save(DB_KEYS.TIMESLOTS, timeSlots); }, [timeSlots]);
  useEffect(() => { db.save(DB_KEYS.CLASSES, classes); }, [classes]);

  const handleAIAction = useCallback((action) => {
    switch (action.type) {
      case 'add_volunteer':
        if (!action.name) break;
        setVolunteers(prev => [...prev, { id: uuid(), name: action.name, capabilities: [] }]);
        onNotify(`Gönüllü eklendi: ${action.name}`);
        break;
      
      case 'add_activity':
        if (!action.name) break;
        setActivities(prev => [...prev, { 
          id: uuid(), 
          name: action.name, 
          isMust: !!action.isMust, 
          boxCount: action.boxCount || 1,
          allowedGrades: [0,1,2,3,4,5,6,7,8]
        }]);
        onNotify(`Etkinlik eklendi: ${action.name}`);
        break;

      case 'clear_schedule':
        setClasses(prev => prev.map(c => ({ ...c, schedule: {} })));
        onNotify("Tüm program silindi.");
        break;

      case 'clear_optional':
        setClasses(prev => prev.map(c => ({
          ...c,
          schedule: Object.fromEntries(
            Object.entries(c.schedule).filter(([, slot]) => slot.isMust)
          )
        })));
        onNotify("Zorunlu olmayanlar silindi.");
        break;

      case 'assign_slot':
        const { classId, slotId, activityId, volunteerId } = action;
        const act = activities.find(a => a.id === activityId);
        const vol = volunteers.find(v => v.id === volunteerId);
        if (!act || !vol) break;
        
        setClasses(prev => prev.map(c => {
          if (c.id !== classId) return c;
          return {
            ...c,
            schedule: {
              ...c.schedule,
              [slotId]: {
                activityId: act.id,
                name: act.name,
                isMust: act.isMust,
                lead: vol.name,
                leadId: vol.id
              }
            }
          };
        }));
        onNotify(`${act.name} atandı.`);
        break;

      case 'add_capability':
        setVolunteers(prev => prev.map(v => {
          if (v.id !== action.volunteerId) return v;
          if (v.capabilities.includes(action.activityId)) return v;
          return { ...v, capabilities: [...v.capabilities, action.activityId] };
        }));
        break;

      default:
        break;
    }
  }, [activities, volunteers, classes, onNotify]);

  const handleSlotClick = (clsId, slotId) => {
    const slot = timeSlots.find(t => t.id === slotId);
    if (slot?.type !== 'lesson') return;
    setSelectedSlot({ clsId, slotId });
  };

  const assignToSlot = (actId, volId) => {
    if (!selectedSlot) return;
    const act = activities.find(a => a.id === actId);
    const vol = volunteers.find(v => v.id === volId);
    if (!act || !vol) return;

    setClasses(prev => prev.map(c => {
      if (c.id !== selectedSlot.clsId) return c;
      return {
        ...c,
        schedule: {
          ...c.schedule,
          [selectedSlot.slotId]: {
            activityId: act.id,
            name: act.name,
            isMust: act.isMust,
            lead: vol.name,
            leadId: vol.id
          }
        }
      };
    }));
    setSelectedSlot(null);
    onNotify(`${act.name} atandı.`);
  };

  const clearSlot = () => {
    if (!selectedSlot) return;
    setClasses(prev => prev.map(c => {
      if (c.id !== selectedSlot.clsId) return c;
      const sch = { ...c.schedule };
      delete sch[selectedSlot.slotId];
      return { ...c, schedule: sch };
    }));
    setSelectedSlot(null);
    onNotify("Slot temizlendi.");
  };

  const appState = { activities, volunteers, classes, timeSlots };

  return (
    <div className="space-y-5">
      <ConfirmModal {...confirmModal}/>
      
      {/* AI Chat */}
      <BalkizAIChat appState={appState} onAction={handleAIAction} warnings={warnings}/>

      {/* Quick Actions */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap gap-3">
        <button
          onClick={() => setConfirmModal({
            isOpen: true,
            isDanger: true,
            title: 'Tüm Programı Sil',
            message: 'Tüm sınıfların programı silinecek.',
            onConfirm: () => {
              setClasses(prev => prev.map(c => ({ ...c, schedule: {} })));
              setConfirmModal({ isOpen: false });
              onNotify("Program silindi.");
            },
            onCancel: () => setConfirmModal({ isOpen: false })
          })}
          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-600 text-sm hover:bg-red-100 transition-colors flex items-center gap-2">
            <Trash size={16}/>
            Tüm Programı Sil
          </button>

          <button
            onClick={() => setConfirmModal({
              isOpen: true,
              isDanger: true,
              title: 'Zorunlu Olmayanları Sil',
              message: 'Zorunlu olmayan tüm etkinlikler silinecek.',
              onConfirm: () => {
                setClasses(prev => prev.map(c => ({
                  ...c,
                  schedule: Object.fromEntries(
                    Object.entries(c.schedule).filter(([, slot]) => slot.isMust)
                  )
                })));
                setConfirmModal({ isOpen: false });
                onNotify("Zorunlu olmayanlar silindi.");
              },
              onCancel: () => setConfirmModal({ isOpen: false })
            })}
            className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 font-600 text-sm hover:bg-orange-100 transition-colors flex items-center gap-2">
            <Filter size={16}/>
            Zorunlu Olmayanları Sil
          </button>

          <button
            onClick={() => setConfirmModal({
              isOpen: true,
              isDanger: true,
              title: 'Cache Temizle',
              message: 'Tüm veriler silinecek ve uygulama sıfırlanacak.',
              confirmText: 'Temizle',
              onConfirm: () => {
                db.clear();
                window.location.reload();
              },
              onCancel: () => setConfirmModal({ isOpen: false })
            })}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-600 text-sm hover:bg-slate-200 transition-colors flex items-center gap-2">
            <RefreshCw size={16}/>
            Cache Temizle
          </button>

          <button
            onClick={() => {
              const json = JSON.stringify({ activities, volunteers, classes, timeSlots }, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `prokordi_backup_${Date.now()}.json`;
              a.click();
              onNotify("Yedek indirildi.");
            }}
            className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-600 text-sm hover:bg-indigo-100 transition-colors flex items-center gap-2">
            <Download size={16}/>
            Yedek Al
          </button>

          <label className="px-4 py-2 rounded-xl bg-green-50 text-green-600 font-600 text-sm hover:bg-green-100 transition-colors flex items-center gap-2 cursor-pointer">
            <UploadCloud size={16}/>
            Yedek Yükle
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const data = JSON.parse(ev.target.result);
                    if (data.activities) setActivities(data.activities);
                    if (data.volunteers) setVolunteers(data.volunteers);
                    if (data.classes) setClasses(data.classes);
                    if (data.timeSlots) setTimeSlots(data.timeSlots);
                    onNotify("Yedek yüklendi.");
                  } catch {
                    onNotify("Geçersiz dosya.");
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>

        {/* Main Layout: Program + Side Panels */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel: Activities */}
          <div className="col-span-2 glass-panel rounded-2xl p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scroll">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-700 text-slate-800">Etkinlikler</h3>
              <button
                onClick={() => {
                  const name = prompt("Etkinlik adı:");
                  if (!name) return;
                  setActivities(prev => [...prev, {
                    id: uuid(),
                    name,
                    isMust: false,
                    boxCount: 1,
                    allowedGrades: [0,1,2,3,4,5,6,7,8]
                  }]);
                  onNotify(`${name} eklendi.`);
                }}
                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                <Plus size={14}/>
              </button>
            </div>
            {activities.map(act => (
              <div
                key={act.id}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  act.isMust
                    ? 'bg-red-50 border-red-200 hover:border-red-400'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
                }`}>
                <div className="text-xs font-700 text-slate-800 mb-1">{act.name}</div>
                <div className="text-[10px] text-slate-400">
                  {act.isMust ? 'Zorunlu' : 'Opsiyonel'}
                </div>
              </div>
            ))}
          </div>

          {/* Center: Program Grid */}
          <div className="col-span-8 glass-panel rounded-2xl p-4 overflow-x-auto custom-scroll">
            <h3 className="text-sm font-700 text-slate-800 mb-4">Program Tablosu</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 p-2 text-xs font-700 text-slate-600">Saat</th>
                  {classes.map(cls => (
                    <th key={cls.id} className="border border-slate-200 bg-slate-50 p-2 text-xs font-700 text-slate-600">
                      {cls.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.id}>
                    <td className="border border-slate-200 bg-slate-50 p-2 text-xs font-600 text-slate-600 whitespace-nowrap">
                      {slot.start}-{slot.end}
                    </td>
                    {classes.map(cls => {
                      const assigned = cls.schedule?.[slot.id];
                      const isSelected = selectedSlot?.clsId === cls.id && selectedSlot?.slotId === slot.id;
                      return (
                        <td
                          key={cls.id}
                          onClick={() => handleSlotClick(cls.id, slot.id)}
                          className={`border border-slate-200 p-2 text-xs cursor-pointer transition-all ${
                            slot.type === 'break'
                              ? 'bg-slate-100 text-slate-400'
                              : isSelected
                              ? 'bg-indigo-100 border-indigo-400'
                              : assigned
                              ? assigned.isMust
                                ? 'bg-red-50 hover:bg-red-100'
                                : 'bg-green-50 hover:bg-green-100'
                              : 'bg-white hover:bg-slate-50'
                          }`}>
                          {slot.type === 'break' ? (
                            <span className="text-[10px] italic">Teneffüs</span>
                          ) : assigned ? (
                            <div>
                              <div className="font-700 text-slate-800">{assigned.name}</div>
                              <div className="text-[10px] text-slate-400">{assigned.lead}</div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300">Boş</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Panel: Volunteers */}
          <div className="col-span-2 glass-panel rounded-2xl p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scroll">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-700 text-slate-800">Gönüllüler</h3>
              <button
                onClick={() => {
                  const name = prompt("Gönüllü adı:");
                  if (!name) return;
                  setVolunteers(prev => [...prev, { id: uuid(), name, capabilities: [] }]);
                  onNotify(`${name} eklendi.`);
                }}
                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                <Plus size={14}/>
              </button>
            </div>
            {volunteers.map(vol => (
              <div
                key={vol.id}
                className="p-3 rounded-xl bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 cursor-pointer transition-all">
                <div className="text-xs font-700 text-slate-800 mb-1">{vol.name}</div>
                <div className="text-[10px] text-slate-400">
                  {vol.capabilities.length} yetkinlik
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Assignment Modal */}
        {selectedSlot && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="glass-panel rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-700 text-slate-800">Slot Ata</h3>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={16}/>
                </button>
              </div>

              <div className="space-y-4">
                {/* Activity Selection */}
                <div>
                  <label className="text-xs font-600 text-slate-600 mb-2 block">Etkinlik Seç</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scroll">
                    {activities.map(act => (
                      <button
                        key={act.id}
                        onClick={() => {
                          const vol = volunteers[0];
                          if (vol) assignToSlot(act.id, vol.id);
                        }}
                        className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-400 transition-all">
                        <div className="text-xs font-700 text-slate-800">{act.name}</div>
                        <div className="text-[10px] text-slate-400">{act.isMust ? 'Zorunlu' : 'Opsiyonel'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volunteer Selection */}
                <div>
                  <label className="text-xs font-600 text-slate-600 mb-2 block">Gönüllü Seç</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scroll">
                    {volunteers.map(vol => (
                      <div
                        key={vol.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-xs font-700 text-slate-800">{vol.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={clearSlot}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-600 text-sm hover:bg-red-100 transition-colors">
                    Temizle
                  </button>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-600 text-sm hover:bg-slate-200 transition-colors">
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}

// ─── MODULE 2: NAMETAG GENERATOR ─────────────────────────────────────────────
function NametagGenerator({ onNotify }) {
  const [volunteers, setVolunteers] = useState(() => db.load(DB_KEYS.NAMETAG_VOLUNTEERS, []));
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(7);
  const [fontSize, setFontSize] = useState(24);

  useEffect(() => {
    const v = db.load(DB_KEYS.VOLUNTEERS, []);
    setVolunteers(v);
  }, []);

  const print = () => {
    window.print();
    onNotify("İsimlikler yazdırılıyor...");
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="no-print glass-panel rounded-2xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-600 text-slate-600 mb-2 block">Genişlik (cm)</label>
          <input
            type="number"
            value={width}
            onChange={e => setWidth(+e.target.value)}
            className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="text-xs font-600 text-slate-600 mb-2 block">Yükseklik (cm)</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(+e.target.value)}
            className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="text-xs font-600 text-slate-600 mb-2 block">Font Boyutu</label>
          <input
            type="number"
            value={fontSize}
            onChange={e => setFontSize(+e.target.value)}
            className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"
          />
        </div>
        <button
          onClick={print}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-700 text-sm hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Printer size={16}/>
          Yazdır
        </button>
      </div>

      {/* Preview */}
      <div className="grid grid-cols-3 gap-4">
        {volunteers.map(vol => (
          <div
            key={vol.id}
            style={{
              width: `${width}cm`,
              height: `${height}cm`,
              backgroundImage: `url(${IMAGES.NAME_BG})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="relative flex items-center justify-center border-2 border-slate-200 rounded-xl overflow-hidden">
            <div
              style={{ fontSize: `${fontSize}px` }}
              className="font-800 text-slate-800 text-center px-4">
              {vol.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE 3: COLLAGE GENERATOR ─────────────────────────────────────────────
function CollageGenerator({ onNotify }) {
  const [volunteers, setVolunteers] = useState(() => db.load(DB_KEYS.COLLAGE_VOLUNTEERS, []));

  useEffect(() => {
    const v = db.load(DB_KEYS.VOLUNTEERS, []);
    setVolunteers(v);
  }, []);

  const print = () => {
    window.print();
    onNotify("Kolaj yazdırılıyor...");
  };

  return (
    <div className="space-y-5">
      <div className="no-print glass-panel rounded-2xl p-4 flex justify-end">
        <button
          onClick={print}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-700 text-sm hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Printer size={16}/>
          Yazdır
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {volunteers.map(vol => (
          <div
            key={vol.id}
            style={{
              backgroundImage: `url(${IMAGES.QUESTION_BG})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="aspect-square relative flex items-center justify-center border-2 border-slate-200 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
            <div className="relative z-10 text-white font-800 text-xl text-center px-4">
              {vol.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [activeModule, setActiveModule] = useState('scheduler');
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(() => db.load(DB_KEYS.DARK_MODE, false));

  useEffect(() => {
    db.save(DB_KEYS.DARK_MODE, darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const modules = [
    { id: 'scheduler', name: 'Program', icon: LayoutDashboard },
    { id: 'nametag', name: 'İsimlik', icon: Type },
    { id: 'collage', name: 'Kolaj', icon: ImageIcon }
  ];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className={`min-h-screen p-6 transition-colors ${darkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50'}`}>
        {/* Header */}
        <div className="max-w-[1600px] mx-auto mb-6">
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <GraduationCap size={24} className="text-white"/>
              </div>
              <div>
                <h1 className="text-xl font-800 text-slate-800">ProKordiManager</h1>
                <p className="text-xs text-slate-400">v4.0 — JARVIS Edition</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Saat/>
              <button
                onClick={() => setDarkMode(v => !v)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                {darkMode ? <Sun size={18} className="text-amber-500"/> : <Moon size={18} className="text-indigo-600"/>}
              </button>
            </div>
          </div>
        </div>

        {/* Module Tabs */}
        <div className="max-w-[1600px] mx-auto mb-6">
          <div className="glass-panel rounded-2xl p-2 flex gap-2">
            {modules.map(mod => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={`flex-1 px-4 py-3 rounded-xl font-700 text-sm transition-all flex items-center justify-center gap-2 ${
                    activeModule === mod.id
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                  <Icon size={18}/>
                  {mod.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1600px] mx-auto">
          {activeModule === 'scheduler' && <SimplifiedScheduler onNotify={notify} darkMode={darkMode}/>}
          {activeModule === 'nametag' && <NametagGenerator onNotify={notify}/>}
          {activeModule === 'collage' && <CollageGenerator onNotify={notify}/>}
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 glass-panel rounded-xl px-4 py-3 shadow-2xl animate-slideDown z-[10000] flex items-center gap-3">
            <CheckCircle2 size={18} className="text-green-500"/>
            <span className="text-sm font-600 text-slate-800">{notification}</span>
          </div>
        )}
      </div>
    </>
  );
}