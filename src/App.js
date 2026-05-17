/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Users, FileText, Image as ImageIcon, Printer, Plus, Trash2, Upload, X, CheckCircle2, BookOpen, GraduationCap, Package, Sparkles, RefreshCw, Wand2, Zap, ChevronDown, ChevronUp, Type, Minus, PlusCircle, Maximize2, Smile, Camera, Settings2, MoveVertical, Maximize, Download, UploadCloud, Search, AlertTriangle, Send, MessageSquare, Bot, ChevronRight, LayoutDashboard, Clock, Filter
} from 'lucide-react';

// ─── DATABASE ────────────────────────────────────────────────────────────────
const DB_KEYS = {
  ACTIVITIES: 'activities_v30',
  VOLUNTEERS: 'shared_volunteers_v30',
  TIMESLOTS: 'timeSlots_v30',
  CLASSES: 'classes_v30',
  NAMETAG_VOLUNTEERS: 'nametags_v30',
  COLLAGE_VOLUNTEERS: 'collage_v30',
  CHAT_HISTORY: 'balkiz_chat_v1'
};

const db = {
  save: (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; } },
  load: (key, def) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def; } catch { return def; } }
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
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; }
body { font-family: 'DM Sans', sans-serif; }
.font-comic { font-family: 'Comic Neue', cursive; }
.font-mono { font-family: 'DM Mono', monospace; }

.font-400 { font-weight: 400; }
.font-500 { font-weight: 500; }
.font-600 { font-weight: 600; }
.font-700 { font-weight: 700; }
.font-800 { font-weight: 800; }
.font-900 { font-weight: 900; }

@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
@keyframes spinSlow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes blink { 0%,100%{ opacity:1; } 50%{ opacity:0; } }

/* ── JARVIS 3D Brain Animation ── */
@keyframes brain-ring-1 {
  0% { transform: rotateX(60deg) rotateZ(0deg); }
  100% { transform: rotateX(60deg) rotateZ(360deg); }
}
@keyframes brain-ring-2 {
  0% { transform: rotateX(-60deg) rotateZ(0deg); }
  100% { transform: rotateX(-60deg) rotateZ(360deg); }
}
@keyframes brain-ring-3 {
  0% { transform: rotateY(60deg) rotateZ(0deg); }
  100% { transform: rotateY(60deg) rotateZ(360deg); }
}
@keyframes brain-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes brain-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.4), 0 0 40px rgba(139,92,246,0.2), inset 0 0 20px rgba(99,102,241,0.1); }
  50% { box-shadow: 0 0 30px rgba(99,102,241,0.6), 0 0 60px rgba(139,92,246,0.4), inset 0 0 30px rgba(99,102,241,0.2); }
}
@keyframes particle-float {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
  50% { transform: translateY(-8px) scale(1.2); opacity: 1; }
}

@keyframes liquid-blob { 0% { border-radius:62% 38% 46% 54%/60% 44% 56% 40%; transform:rotate(0deg) scale(1); } 25% { border-radius:38% 62% 70% 30%/44% 64% 36% 56%; transform:rotate(90deg) scale(1.04); } 50% { border-radius:54% 46% 38% 62%/56% 36% 64% 44%; transform:rotate(180deg) scale(1); } 75% { border-radius:46% 54% 62% 38%/36% 56% 44% 64%; transform:rotate(270deg) scale(1.04); } 100% { border-radius:62% 38% 46% 54%/60% 44% 56% 40%; transform:rotate(360deg) scale(1); } }
@keyframes liquid-float { 0%,100% { transform:translateY(0px) scale(1); } 33% { transform:translateY(-12px) scale(1.03); } 66% { transform:translateY(6px) scale(0.98); } }
@keyframes glass-shimmer { 0% { transform:translateX(-100%) skewX(-15deg); opacity:0; } 10% { opacity:.6; } 90% { opacity:.6; } 100% { transform:translateX(300%) skewX(-15deg); opacity:0; } }
@keyframes message-spring { 0% { opacity:0; transform:translateY(10px) scale(0.92); } 60% { transform:translateY(-3px) scale(1.02); } 100% { opacity:1; transform:translateY(0) scale(1); } }
@keyframes typing-wave { 0%,80%,100% { transform:scale(0) translateY(0); opacity:.4; } 40% { transform:scale(1) translateY(-6px); opacity:1; } }
@keyframes pulse-ring { 0%,100%{ box-shadow:0 0 0 0 rgba(99,102,241,.3); } 50% { box-shadow:0 0 0 10px rgba(99,102,241,0); } }

.animate-fadeIn { animation:fadeIn .25s ease both; }
.animate-slideDown { animation:slideDown .2s ease both; }
.animate-slideUp { animation:slideUp .2s ease both; }
.animate-scaleIn { animation:scaleIn .2s ease both; }
.animate-message { animation:message-spring .4s cubic-bezier(0.34,1.3,0.64,1) both; }

/* ── JARVIS AI Avatar ── */
.jarvis-brain {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.jarvis-core {
  position: absolute;
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #6366f1, #8b5cf6);
  border-radius: 50%;
  z-index: 10;
  animation: brain-pulse 2s ease-in-out infinite;
}

.jarvis-core.active {
  animation: brain-pulse 1s ease-in-out infinite, brain-glow 2s ease-in-out infinite;
}

.jarvis-ring {
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  opacity: 0.6;
}

.jarvis-ring-1 {
  width: 40px;
  height: 40px;
  border-color: rgba(99,102,241,0.8);
  animation: brain-ring-1 4s linear infinite;
}

.jarvis-ring-2 {
  width: 32px;
  height: 32px;
  border-color: rgba(139,92,246,0.7);
  animation: brain-ring-2 3s linear infinite;
}

.jarvis-ring-3 {
  width: 24px;
  height: 24px;
  border-color: rgba(6,182,212,0.6);
  animation: brain-ring-3 3.5s linear infinite;
}

.jarvis-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #6366f1;
  border-radius: 50%;
  animation: particle-float 2s ease-in-out infinite;
}

.glass-panel {
  background:rgba(255,255,255,.72);
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  border:1px solid rgba(255,255,255,.5);
  box-shadow:0 4px 32px rgba(99,102,241,.08), 0 1px 0 rgba(255,255,255,.8) inset;
}

.liquid-shimmer { position:relative; overflow:hidden; }
.liquid-shimmer::after { content:''; position:absolute; top:0; left:0; right:0; bottom:0; background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%); animation:glass-shimmer 3.5s ease-in-out infinite; pointer-events:none; }

.chat-user { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; border-radius:18px 18px 4px 18px; box-shadow:0 2px 16px rgba(99,102,241,.35), inset 0 1px 0 rgba(255,255,255,.25); }
.chat-bot { background:rgba(241,245,249,.9); color:#1e293b; border-radius:18px 18px 18px 4px; border:1px solid rgba(255,255,255,.7); box-shadow:0 1px 8px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.9); backdrop-filter:blur(8px); }

.custom-scroll::-webkit-scrollbar { width:4px; }
.custom-scroll::-webkit-scrollbar-track { background:transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background:#cbd5e1; }

.bg-stripes { background-image:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,0,0,.025) 8px,rgba(0,0,0,.025) 16px); }

.excel-table { border-collapse:collapse; width:100%; }
.excel-table th, .excel-table td { border:1px solid #94a3b8; padding:0; }
.excel-table thead th { background:#f8fafc; font-weight:700; font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; color:#475569; }
.excel-table tbody tr:nth-child(even) td:first-child { background:#fafafa; }

/* ── Horizontal Name Tag (105mm × 74mm) ── */
.nametag-horizontal {
  width: 105mm;
  height: 74mm;
  page-break-inside: avoid;
  break-inside: avoid;
}

.print-page { width:210mm; height:297mm; min-height:297mm; page-break-after:always; page-break-inside:avoid; break-after:page; break-inside:avoid; }
.print-page:last-child { page-break-after:auto; break-after:auto; }

@media print {
  html,body { height:auto!important; overflow:visible!important; margin:0!important; padding:0!important; background:white!important; }
  #root > div { display:block!important; height:auto!important; overflow:visible!important; }
  .no-print { display:none!important; }
  aside,header{ display:none!important; }
  main { height:auto!important; overflow:visible!important; display:block!important; position:static!important; padding:0!important; background:white!important; }
  #printable-section { padding:0!important; max-width:none!important; }
  * { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
  .print-page { margin:0!important; box-shadow:none!important; border:none!important; padding:5mm!important; page-break-after:always!important; break-after:page!important; page-break-inside:avoid!important; overflow:hidden!important; }
  .print-page:last-child { page-break-after:auto!important; break-after:auto!important; }
  @page { size:A4 portrait; margin:0; }
  .excel-table th, .excel-table td { border:1px solid #000!important; }
  .nametag-horizontal { page-break-inside: avoid!important; }
}
`;

// ─── MODAL: Confirm ───────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isDanger = false, confirmText = "Onayla" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 animate-scaleIn">
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

// ─── MODAL: Prompt ────────────────────────────────────────────────────────────
const PromptModal = ({ isOpen, title, defaultValue, onConfirm, onCancel }) => {
  const [val, setVal] = useState(defaultValue || "");
  useEffect(() => { setVal(defaultValue || ""); }, [defaultValue, isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 animate-scaleIn">
        <h3 className="text-base font-700 text-slate-800 mb-4">{title}</h3>
        <input autoFocus type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && onConfirm(val)} className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-500 text-slate-700 outline-none focus:border-indigo-400 transition-colors mb-4" />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-600 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">İptal</button>
          <button onClick={() => onConfirm(val)} className="px-4 py-2 rounded-xl text-sm font-700 text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">Kaydet</button>
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

// ─── SIDEBAR ITEM ─────────────────────────────────────────────────────────────
const SidebarItem = ({ id, icon, label, active, onClick }) => (
  <button onClick={() => onClick(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-600 transition-all duration-200 ${active === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}>
    <span className={`transition-colors ${active === id ? 'text-indigo-600' : ''}`}>{icon}</span>
    <span>{label}</span>
    {active === id && <ChevronRight size={14} className="ml-auto text-indigo-400"/>}
  </button>
);

// ─── B.A.L.K.I.Z. AI CHAT — JARVIS Edition ───────────────────────────────────
function BalkizAIChat({ appState, onAction, warnings = [] }) {
  const INITIAL = [{ role: 'assistant', content: 'Merhaba! Ben B.A.L.K.I.Z. 👋\n\nProgram oluşturma, gönüllü & etkinlik ekleme, dağıtım başlatma, Excel import gibi işlemler için bana doğal dilde yazabilirsiniz.\n\nÖrn: "5 tane gönüllü ekle", "09:00-10:00 arası Kimya yap", "Ahmet\'i 2. saatte Fizik\'e ata"' }];
  
  const [messages, setMessages] = useState(() => db.load(DB_KEYS.CHAT_HISTORY, INITIAL));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const endRef = useRef(null);

  useEffect(() => { db.save(DB_KEYS.CHAT_HISTORY, messages); }, [messages]);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const buildSystemPrompt = () => {
    const { activities = [], volunteers = [], classes = [], timeSlots = [] } = appState || {};
    return `Sen B.A.L.K.I.Z. (Bilgisayar Destekli Lojistik Koordinasyon İzleme Zekası) isimli okul etkinlik planlama asistanısın.

MEVCUT DURUM:
Etkinlikler (${activities.length}): ${JSON.stringify(activities.map(a => ({ id: a.id, name: a.name, isMust: a.isMust })))}
Gönüllüler (${volunteers.length}): ${JSON.stringify(volunteers.map(v => ({ id: v.id, name: v.name })))}
Sınıflar (${classes.length}): ${classes.map(c => c.name).join(', ')}
Zaman Dilimleri (${timeSlots.length}): ${timeSlots.map(t => `${t.start}-${t.end}(${t.type})`).join(', ')}

ÇALIŞTIRABİLECEĞİN KOMUTLAR:
- add_volunteer: { type:"add_volunteer", name:"Ad Soyad" }
- remove_volunteer: { type:"remove_volunteer", id:"vol_id" }
- add_activity: { type:"add_activity", name:"...", isMust:false, boxCount:1 }
- update_activity: { type:"update_activity", id:"act_id", isMust:true }
- add_class: { type:"add_class", name:"..." }
- distribute: { type:"distribute" }
- clear_schedule: { type:"clear_schedule", mode:"all|optional|empty" }
- add_timeslot: { type:"add_timeslot", duration:40, slotType:"lesson" }
- assign_volunteer_to_slot: { type:"assign_volunteer_to_slot", className:"1-A", slotIndex:0, volunteerId:"vol_id", activityId:"act_id" }
- update_schedule: { type:"update_schedule", className:"1-A", slotIndex:2, activityId:"act_id" }
- replace_activity: { type:"replace_activity", oldActivityId:"act_id", newActivityId:"act_id2" }

ÖNEMLİ KURALLAR:
1. Program oluşturma/güncelleme isteğinde ÖNCE { type:"clear_schedule", mode:"all" } gönder
2. Saat aralıklarını parse et: "09:00-10:00" → slotIndex bularak işle
3. Gönüllü atama isteklerinde className, slotIndex, volunteerId, activityId kullan
4. SADECE JSON döndür, markdown backtick KULLANMA
5. Birden fazla işlem yapabilirsin (actions dizisinde)

FORMAT:
{"message":"Kullanıcıya gösterilecek metin","actions":[]}`;
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

      const raw = data.content?.[0]?.text || '{"message":"Bir hata oluştu.","actions":[]}';
      let parsed;
      try {
        parsed = JSON.parse(raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim());
      } catch {
        parsed = { message: raw, actions: [] };
      }

      setMessages([...newMsgs, { role: 'assistant', content: parsed.message }]);
      if (parsed.actions?.length) parsed.actions.forEach(a => onAction(a));
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: `⚠️ ${err.message?.includes('API_KEY') ? 'API anahtarı yapılandırılmamış.' : 'Bağlantı hatası: ' + err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = loading ? 
    <span style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Düşünüyor…</span> : 
    warnings.length > 0 ? <span className="text-amber-500">{warnings.length} uyarı</span> : 
    <span className="text-emerald-500">Hazır</span>;

  return (
    <div className="no-print mb-6 relative">
      <div className="glass-panel" style={{ borderRadius:'20px', padding:'20px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* JARVIS 3D Brain Avatar */}
            <div className={`jarvis-brain ${loading ? 'active' : ''}`}>
              <div className="jarvis-core"></div>
              <div className="jarvis-ring jarvis-ring-1"></div>
              <div className="jarvis-ring jarvis-ring-2"></div>
              <div className="jarvis-ring jarvis-ring-3"></div>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="jarvis-particle"
                  style={{
                    left: `${50 + 18 * Math.cos((i * Math.PI * 2) / 6)}%`,
                    top: `${50 + 18 * Math.sin((i * Math.PI * 2) / 6)}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
            <div>
              <h3 className="text-lg font-800 text-slate-800 flex items-center gap-2">
                B.A.L.K.I.Z. AI
                <span className="text-xs font-600 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">JARVIS</span>
              </h3>
              <p className="text-xs font-500 text-slate-500">{statusLabel}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          </button>
        </div>

        {isOpen && (
          <>
            {/* Messages */}
            <div className="bg-slate-50/50 rounded-xl p-4 mb-4 h-80 overflow-y-auto custom-scroll space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                  <div className={`max-w-[80%] px-4 py-2.5 text-sm font-500 leading-relaxed ${m.role === 'user' ? 'chat-user' : 'chat-bot'}`}>
                    {m.content.split('\n').map((line, j) => (
                      <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-message">
                  <div className="chat-bot px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-indigo-400 rounded-full"
                          style={{ animation: `typing-wave 1.4s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Mesajınızı yazın... (örn: '5 gönüllü ekle', 'Ahmet'i 2. saatte Fizik'e ata')"
                disabled={loading}
                className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-500 text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 transition-colors disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-700 text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={16}/>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: '📋 Program Oluştur', text: '1-A, 1-B, 1-C için 6 saatlik program oluştur' },
                { label: '👥 5 Gönüllü Ekle', text: '5 tane gönüllü ekle' },
                { label: '🎯 Dağıtım Başlat', text: 'Dağıtımı başlat' },
                { label: '🗑️ Programı Sil', text: 'Tüm programı sil' }
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q.text)}
                  className="text-xs font-600 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activities, setActivities] = useState(() => db.load(DB_KEYS.ACTIVITIES, []));
  const [volunteers, setVolunteers] = useState(() => syncVolunteers());
  const [timeSlots, setTimeSlots] = useState(() => db.load(DB_KEYS.TIMESLOTS, []));
  const [classes, setClasses] = useState(() => db.load(DB_KEYS.CLASSES, []));
  const [warnings, setWarnings] = useState([]);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', defaultValue: '', onConfirm: null });

  useEffect(() => { db.save(DB_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { syncVolunteers(volunteers); }, [volunteers]);
  useEffect(() => { db.save(DB_KEYS.TIMESLOTS, timeSlots); }, [timeSlots]);
  useEffect(() => { db.save(DB_KEYS.CLASSES, classes); }, [classes]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // ─── AI ACTION HANDLER ──────────────────────────────────────────────────────
  const handleAIAction = (action) => {
    try {
      switch (action.type) {
        case 'add_volunteer':
          setVolunteers(prev => [...prev, { id: uuid(), name: action.name || 'Yeni Gönüllü' }]);
          break;

        case 'remove_volunteer':
          setVolunteers(prev => prev.filter(v => v.id !== action.id));
          break;

        case 'add_activity':
          setActivities(prev => [...prev, {
            id: uuid(),
            name: action.name || 'Yeni Etkinlik',
            isMust: action.isMust || false,
            boxCount: action.boxCount || 1
          }]);
          break;

        case 'update_activity':
          setActivities(prev => prev.map(a => a.id === action.id ? { ...a, ...action } : a));
          break;

        case 'add_class':
          setClasses(prev => [...prev, { id: uuid(), name: action.name || 'Yeni Sınıf', schedule: [] }]);
          break;

        case 'distribute':
          distributeActivities();
          break;

        case 'clear_schedule':
          clearSchedule(action.mode || 'all');
          break;

        case 'add_timeslot':
          addTimeSlot(action.duration || 40, action.slotType || 'lesson');
          break;

        case 'assign_volunteer_to_slot':
          assignVolunteerToSlot(action.className, action.slotIndex, action.volunteerId, action.activityId);
          break;

        case 'update_schedule':
          updateScheduleSlot(action.className, action.slotIndex, action.activityId);
          break;

        case 'replace_activity':
          replaceActivity(action.oldActivityId, action.newActivityId);
          break;

        default:
          console.warn('Unknown action:', action);
      }
    } catch (err) {
      console.error('AI Action Error:', err);
    }
  };

  // ─── SCHEDULE OPERATIONS ────────────────────────────────────────────────────
  const clearSchedule = (mode = 'all') => {
    setClasses(prev => prev.map(cls => {
      let newSchedule = [...cls.schedule];
      if (mode === 'all') {
        newSchedule = [];
      } else if (mode === 'optional') {
        newSchedule = newSchedule.filter(slot => {
          const act = activities.find(a => a.id === slot.activityId);
          return act?.isMust;
        });
      } else if (mode === 'empty') {
        newSchedule = newSchedule.filter(slot => slot.activityId);
      }
      return { ...cls, schedule: newSchedule };
    }));
  };

  const assignVolunteerToSlot = (className, slotIndex, volunteerId, activityId) => {
    setClasses(prev => prev.map(cls => {
      if (cls.name === className) {
        const newSchedule = [...cls.schedule];
        if (!newSchedule[slotIndex]) {
          newSchedule[slotIndex] = { activityId: null, volunteerId: null };
        }
        newSchedule[slotIndex] = { activityId, volunteerId };
        return { ...cls, schedule: newSchedule };
      }
      return cls;
    }));
  };

  const updateScheduleSlot = (className, slotIndex, activityId) => {
    setClasses(prev => prev.map(cls => {
      if (cls.name === className) {
        const newSchedule = [...cls.schedule];
        if (!newSchedule[slotIndex]) {
          newSchedule[slotIndex] = { activityId: null, volunteerId: null };
        }
        newSchedule[slotIndex].activityId = activityId;
        return { ...cls, schedule: newSchedule };
      }
      return cls;
    }));
  };

  const replaceActivity = (oldActivityId, newActivityId) => {
    setClasses(prev => prev.map(cls => ({
      ...cls,
      schedule: cls.schedule.map(slot =>
        slot.activityId === oldActivityId ? { ...slot, activityId: newActivityId } : slot
      )
    })));
  };

  const addTimeSlot = (duration = 40, slotType = 'lesson') => {
    const lastSlot = timeSlots[timeSlots.length - 1];
    let startTime = '09:00';
    if (lastSlot) {
      const [h, m] = lastSlot.end.split(':').map(Number);
      const totalMinutes = h * 60 + m;
      const newH = Math.floor(totalMinutes / 60);
      const newM = totalMinutes % 60;
      startTime = `$${String(newH).padStart(2, '0')}:$${String(newM).padStart(2, '0')}`;
    }
    const [sh, sm] = startTime.split(':').map(Number);
    const endMinutes = sh * 60 + sm + duration;
    const endTime = `$${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:$${String(endMinutes % 60).padStart(2, '0')}`;
    setTimeSlots(prev => [...prev, { start: startTime, end: endTime, type: slotType }]);
  };

  const distributeActivities = () => {
    const newClasses = classes.map(cls => {
      const schedule = timeSlots.map(() => ({ activityId: null, volunteerId: null }));
      const mustActivities = activities.filter(a => a.isMust);
      const optionalActivities = activities.filter(a => !a.isMust);
      
      mustActivities.forEach((act, i) => {
        if (i < schedule.length) {
          schedule[i].activityId = act.id;
          if (volunteers.length > 0) {
            schedule[i].volunteerId = volunteers[i % volunteers.length].id;
          }
        }
      });

      for (let i = mustActivities.length; i < schedule.length; i++) {
        if (optionalActivities.length > 0) {
          schedule[i].activityId = optionalActivities[i % optionalActivities.length].id;
          if (volunteers.length > 0) {
            schedule[i].volunteerId = volunteers[i % volunteers.length].id;
          }
        }
      }

      return { ...cls, schedule };
    });
    setClasses(newClasses);
  };

  // ─── EXCEL IMPORT ───────────────────────────────────────────────────────────
  const handleExcelImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());

        const classNameIdx = headers.findIndex(h => h.includes('sınıf') || h.includes('class'));
        const activityIdx = headers.findIndex(h => h.includes('etkinlik') || h.includes('activity'));
        const volunteerIdx = headers.findIndex(h => h.includes('gönüllü') || h.includes('volunteer'));

        if (classNameIdx === -1 || activityIdx === -1) {
          alert('Excel formatı hatalı. "Sınıf" ve "Etkinlik" sütunları gerekli.');
          return;
        }

        const importedClasses = {};
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,;\t]/).map(c => c.trim());
          const className = cols[classNameIdx];
          const activityName = cols[activityIdx];
          const volunteerName = volunteerIdx !== -1 ? cols[volunteerIdx] : null;

          if (!className || !activityName) continue;

          if (!importedClasses[className]) {
            importedClasses[className] = [];
          }

          let activity = activities.find(a => a.name.toLowerCase() === activityName.toLowerCase());
          if (!activity) {
            activity = { id: uuid(), name: activityName, isMust: false, boxCount: 1 };
            setActivities(prev => [...prev, activity]);
          }

          let volunteer = null;
          if (volunteerName) {
            volunteer = volunteers.find(v => v.name.toLowerCase() === volunteerName.toLowerCase());
            if (!volunteer) {
              volunteer = { id: uuid(), name: volunteerName };
              setVolunteers(prev => [...prev, volunteer]);
            }
          }

          importedClasses[className].push({
            activityId: activity.id,
            volunteerId: volunteer?.id || null
          });
        }

        setClasses(prev => {
          const updated = [...prev];
          Object.keys(importedClasses).forEach(className => {
            let cls = updated.find(c => c.name === className);
            if (!cls) {
              cls = { id: uuid(), name: className, schedule: [] };
              updated.push(cls);
            }
            cls.schedule = importedClasses[className];
          });
          return updated;
        });

        alert('Excel başarıyla içe aktarıldı!');
      } catch (err) {
        alert('Excel okuma hatası: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ─── RENDER TABS ────────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab activities={activities} volunteers={volunteers} classes={classes} timeSlots={timeSlots} />;
      case 'activities':
        return <ActivitiesTab activities={activities} setActivities={setActivities} setConfirmModal={setConfirmModal} setPromptModal={setPromptModal} />;
      case 'volunteers':
        return <VolunteersTab volunteers={volunteers} setVolunteers={setVolunteers} setConfirmModal={setConfirmModal} setPromptModal={setPromptModal} />;
      case 'schedule':
        return <ScheduleTab classes={classes} setClasses={setClasses} activities={activities} volunteers={volunteers} timeSlots={timeSlots} setTimeSlots={setTimeSlots} setConfirmModal={setConfirmModal} distributeActivities={distributeActivities} clearSchedule={clearSchedule} />;
      case 'nametags':
        return <NametagsTab volunteers={volunteers} />;
      case 'collage':
        return <CollageTab volunteers={volunteers} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <aside className="no-print w-64 bg-white/60 backdrop-blur-xl border-r border-white/50 p-4 flex flex-col gap-2">
        <div className="mb-6 px-2">
          <h1 className="text-2xl font-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">B.A.L.K.I.Z.</h1>
          <p className="text-xs font-600 text-slate-500 mt-1">Etkinlik Planlama Sistemi</p>
        </div>
        <SidebarItem id="dashboard" icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab} onClick={setActiveTab} />
        <SidebarItem id="activities" icon={<Package size={18}/>} label="Etkinlikler" active={activeTab} onClick={setActiveTab} />
        <SidebarItem id="volunteers" icon={<Users size={18}/>} label="Gönüllüler" active={activeTab} onClick={setActiveTab} />
        <SidebarItem id="schedule" icon={<Calendar size={18}/>} label="Program" active={activeTab} onClick={setActiveTab} />
        <SidebarItem id="nametags" icon={<FileText size={18}/>} label="İsimlikler" active={activeTab} onClick={setActiveTab} />
        <SidebarItem id="collage" icon={<ImageIcon size={18}/>} label="Kolaj" active={activeTab} onClick={setActiveTab} />
        <div className="mt-auto pt-4 border-t border-slate-200">
          <Saat />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto custom-scroll">
        <BalkizAIChat
          appState={{ activities, volunteers, classes, timeSlots }}
          onAction={handleAIAction}
          warnings={warnings}
        />

        {/* Excel Import */}
        <div className="no-print mb-6">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-700 text-sm cursor-pointer hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md">
            <UploadCloud size={16}/>
            Excel'den Program Yükle
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleExcelImport} className="hidden" />
          </label>
          <p className="text-xs text-slate-500 mt-2">CSV formatı: Sınıf, Etkinlik, Gönüllü (opsiyonel)</p>
        </div>

        {renderContent()}
      </main>

      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
      <PromptModal {...promptModal} onCancel={() => setPromptModal({ ...promptModal, isOpen: false })} />
    </div>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab({ activities, volunteers, classes, timeSlots }) {
  const stats = [
    { label: 'Etkinlikler', value: activities.length, icon: <Package size={20}/>, color: 'from-blue-500 to-cyan-500' },
    { label: 'Gönüllüler', value: volunteers.length, icon: <Users size={20}/>, color: 'from-purple-500 to-pink-500' },
    { label: 'Sınıflar', value: classes.length, icon: <GraduationCap size={20}/>, color: 'from-emerald-500 to-teal-500' },
    { label: 'Zaman Dilimleri', value: timeSlots.length, icon: <Clock size={20}/>, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-900 text-slate-800 mb-1">{stat.value}</p>
            <p className="text-sm font-600 text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-800 text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-600"/>
          Hızlı Başlangıç
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Etkinlik Ekle', desc: 'Yeni etkinlik oluştur', icon: <Plus size={16}/> },
            { label: 'Gönüllü Ekle', desc: 'Yeni gönüllü kaydet', icon: <Users size={16}/> },
            { label: 'Program Oluştur', desc: 'Otomatik dağıtım yap', icon: <Calendar size={16}/> },
            { label: 'İsimlik Yazdır', desc: 'Toplu isimlik oluştur', icon: <Printer size={16}/> }
          ].map((item, i) => (
            <button key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-700 text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ACTIVITIES TAB ───────────────────────────────────────────────────────────
function ActivitiesTab({ activities, setActivities, setConfirmModal, setPromptModal }) {
  const add = () => {
    setPromptModal({
      isOpen: true,
      title: 'Yeni Etkinlik',
      defaultValue: '',
      onConfirm: (name) => {
        if (name.trim()) {
          setActivities(prev => [...prev, { id: uuid(), name: name.trim(), isMust: false, boxCount: 1 }]);
        }
        setPromptModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const remove = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Etkinliği Sil',
      message: 'Bu etkinlik silinecek. Emin misiniz?',
      isDanger: true,
      onConfirm: () => {
        setActivities(prev => prev.filter(a => a.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const toggleMust = (id) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, isMust: !a.isMust } : a));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-900 text-slate-800">Etkinlikler</h2>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-700 text-sm hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
          <Plus size={16}/> Yeni Etkinlik
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((act, i) => (
          <div key={act.id} className="glass-panel rounded-xl p-4 animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-700 text-slate-800 mb-1">{act.name}</h3>
                <p className="text-xs text-slate-500">Kutu: {act.boxCount}</p>
              </div>
              <button onClick={() => remove(act.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                <Trash2 size={14}/>
              </button>
            </div>
            <button
              onClick={() => toggleMust(act.id)}
              className={`w-full px-3 py-2 rounded-lg text-xs font-700 transition-all ${act.isMust ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {act.isMust ? '✓ Zorunlu' : 'Opsiyonel'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOLUNTEERS TAB ───────────────────────────────────────────────────────────
function VolunteersTab({ volunteers, setVolunteers, setConfirmModal, setPromptModal }) {
  const add = () => {
    setPromptModal({
      isOpen: true,
      title: 'Yeni Gönüllü',
      defaultValue: '',
      onConfirm: (name) => {
        if (name.trim()) {
          setVolunteers(prev => [...prev, { id: uuid(), name: name.trim() }]);
        }
        setPromptModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const remove = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Gönüllüyü Sil',
      message: 'Bu gönüllü silinecek. Emin misiniz?',
      isDanger: true,
      onConfirm: () => {
        setVolunteers(prev => prev.filter(v => v.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-900 text-slate-800">Gönüllüler</h2>
        <button onClick={add} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-700 text-sm hover:bg-purple-700 transition-all shadow-sm hover:shadow-md">
            <Plus size={16}/>
            Yeni Gönüllü
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {volunteers.map((vol, i) => (
            <div key={vol.id} className="glass-panel rounded-xl p-4 flex items-center justify-between animate-fadeIn" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-800 text-sm">
                  {vol.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-600 text-slate-800">{vol.name}</p>
              </div>
              <button onClick={() => remove(vol.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                <Trash2 size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
}

// ─── SCHEDULE TAB ─────────────────────────────────────────────────────────────
function ScheduleTab({ classes, setClasses, activities, volunteers, timeSlots, setTimeSlots, setConfirmModal, distributeActivities, clearSchedule }) {
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [newSlotDuration, setNewSlotDuration] = useState(40);
  const [newSlotType, setNewSlotType] = useState('lesson');

  const addClass = () => {
    const name = prompt('Sınıf adı:');
    if (name?.trim()) {
      setClasses(prev => [...prev, { id: uuid(), name: name.trim(), schedule: [] }]);
    }
  };

  const removeClass = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Sınıfı Sil',
      message: 'Bu sınıf ve programı silinecek. Emin misiniz?',
      isDanger: true,
      onConfirm: () => {
        setClasses(prev => prev.filter(c => c.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const addTimeSlot = () => {
    const lastSlot = timeSlots[timeSlots.length - 1];
    let startTime = '09:00';
    
    if (lastSlot) {
      const [h, m] = lastSlot.end.split(':').map(Number);
      const totalMinutes = h * 60 + m;
      const newH = Math.floor(totalMinutes / 60);
      const newM = totalMinutes % 60;
      startTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    }

    const [sh, sm] = startTime.split(':').map(Number);
    const endMinutes = sh * 60 + sm + newSlotDuration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    setTimeSlots(prev => [...prev, { start: startTime, end: endTime, type: newSlotType }]);
    setShowTimeSlotModal(false);
  };

  const removeTimeSlot = (index) => {
    setConfirmModal({
      isOpen: true,
      title: 'Zaman Dilimini Sil',
      message: 'Bu zaman dilimi silinecek. Emin misiniz?',
      isDanger: true,
      onConfirm: () => {
        setTimeSlots(prev => prev.filter((_, i) => i !== index));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const updateSlot = (classId, slotIndex, field, value) => {
    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        const newSchedule = [...cls.schedule];
        if (!newSchedule[slotIndex]) {
          newSchedule[slotIndex] = { activityId: null, volunteerId: null };
        }
        newSchedule[slotIndex][field] = value;
        return { ...cls, schedule: newSchedule };
      }
      return cls;
    }));
  };

  const handleClearSchedule = (mode) => {
    const messages = {
      all: 'Tüm program silinecek. Emin misiniz?',
      optional: 'Zorunlu olmayan etkinlikler silinecek. Emin misiniz?',
      empty: 'Boş slotlar temizlenecek. Emin misiniz?'
    };

    setConfirmModal({
      isOpen: true,
      title: 'Programı Temizle',
      message: messages[mode],
      isDanger: true,
      onConfirm: () => {
        clearSchedule(mode);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-900 text-slate-800 flex-1">Program</h2>
        <button onClick={addClass} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-700 text-sm hover:bg-indigo-700 transition-all shadow-sm">
          <Plus size={16}/> Sınıf Ekle
        </button>
        <button onClick={() => setShowTimeSlotModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-700 text-sm hover:bg-emerald-700 transition-all shadow-sm">
          <Clock size={16}/> Zaman Dilimi Ekle
        </button>
        <button onClick={distributeActivities} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-700 text-sm hover:bg-purple-700 transition-all shadow-sm">
          <Zap size={16}/> Dağıtımı Başlat
        </button>
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-700 text-sm hover:bg-red-600 transition-all shadow-sm">
            <Trash2 size={16}/> Temizle
          </button>
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <button onClick={() => handleClearSchedule('all')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-sm font-600 transition-colors">
              Tüm Programı Sil
            </button>
            <button onClick={() => handleClearSchedule('optional')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-orange-600 text-sm font-600 transition-colors">
              Zorunlu Olmayanları Sil
            </button>
            <button onClick={() => handleClearSchedule('empty')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 text-sm font-600 transition-colors">
              Boş Slotları Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="glass-panel rounded-xl p-4">
        <h3 className="text-sm font-800 text-slate-800 mb-3 flex items-center gap-2">
          <Clock size={16} className="text-indigo-600"/>
          Zaman Dilimleri ({timeSlots.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((slot, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-600 text-slate-700">
              <span>{slot.start} - {slot.end}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-700 ${slot.type === 'break' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {slot.type === 'break' ? 'Teneffüs' : 'Ders'}
              </span>
              <button onClick={() => removeTimeSlot(i)} className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors">
                <X size={12}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-4">
        {classes.map(cls => (
          <div key={cls.id} className="glass-panel rounded-xl p-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-800 text-slate-800">{cls.name}</h3>
              <button onClick={() => removeClass(cls.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                <Trash2 size={16}/>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="excel-table w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-center w-24">Saat</th>
                    {timeSlots.map((slot, i) => (
                      <th key={i} className="p-2 text-center min-w-[140px]">
                        {slot.start}<br/>{slot.end}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 text-center font-700 bg-slate-50">Etkinlik</td>
                    {timeSlots.map((_, slotIndex) => {
                      const slot = cls.schedule[slotIndex] || { activityId: null, volunteerId: null };
                      return (
                        <td key={slotIndex} className="p-1">
                          <select
                            value={slot.activityId || ''}
                            onChange={e => updateSlot(cls.id, slotIndex, 'activityId', e.target.value || null)}
                            className="w-full p-2 border border-slate-300 rounded text-xs font-500 outline-none focus:border-indigo-400 bg-white"
                          >
                            <option value="">Seçiniz</option>
                            {activities.map(act => (
                              <option key={act.id} value={act.id}>
                                {act.name} {act.isMust ? '⭐' : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-2 text-center font-700 bg-slate-50">Gönüllü</td>
                    {timeSlots.map((_, slotIndex) => {
                      const slot = cls.schedule[slotIndex] || { activityId: null, volunteerId: null };
                      return (
                        <td key={slotIndex} className="p-1">
                          <select
                            value={slot.volunteerId || ''}
                            onChange={e => updateSlot(cls.id, slotIndex, 'volunteerId', e.target.value || null)}
                            className="w-full p-2 border border-slate-300 rounded text-xs font-500 outline-none focus:border-purple-400 bg-white"
                          >
                            <option value="">Seçiniz</option>
                            {volunteers.map(vol => (
                              <option key={vol.id} value={vol.id}>{vol.name}</option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-scaleIn">
            <h3 className="text-lg font-800 text-slate-800 mb-4">Yeni Zaman Dilimi</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-600 text-slate-700 mb-2">Süre (dakika)</label>
                <input
                  type="number"
                  value={newSlotDuration}
                  onChange={e => setNewSlotDuration(Number(e.target.value))}
                  className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-500 outline-none focus:border-indigo-400"
                  min="5"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-600 text-slate-700 mb-2">Tür</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewSlotType('lesson')}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-700 transition-all ${newSlotType === 'lesson' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Ders
                  </button>
                  <button
                    onClick={() => setNewSlotType('break')}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-700 transition-all ${newSlotType === 'break' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Teneffüs
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTimeSlotModal(false)} className="px-4 py-2 rounded-xl text-sm font-600 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                İptal
              </button>
              <button onClick={addTimeSlot} className="px-4 py-2 rounded-xl text-sm font-700 text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAMETAGS TAB (Horizontal 105mm × 74mm) ───────────────────────────────────
function NametagsTab({ volunteers }) {
  const [selectedVols, setSelectedVols] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const toggleVolunteer = (id) => {
    setSelectedVols(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedVols(volunteers.map(v => v.id));
  };

  const deselectAll = () => {
    setSelectedVols([]);
  };

  const printNametags = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 300);
  };

  const selected = volunteers.filter(v => selectedVols.includes(v.id));

  // 10 cards per page (2 columns × 5 rows)
  const pages = [];
  for (let i = 0; i < selected.length; i += 10) {
    pages.push(selected.slice(i, i + 10));
  }

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-900 text-slate-800">İsimlikler (Yatay Format)</h2>
            <div className="flex gap-2">
              <button onClick={selectAll} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-700 hover:bg-indigo-200 transition-colors">
                Tümünü Seç
              </button>
              <button onClick={deselectAll} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-700 hover:bg-slate-200 transition-colors">
                Temizle
              </button>
              <button onClick={printNametags} disabled={selectedVols.length === 0} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-700 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <Printer size={16}/> Yazdır ({selectedVols.length})
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <p className="text-sm font-600 text-slate-600 mb-2">📐 Standart Yatay İsimlik: 105mm × 74mm</p>
            <p className="text-xs text-slate-500">Sayfa başına 10 kart (2 sütun × 5 satır) • A4 kağıda uyumlu</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {volunteers.map(vol => (
              <button
                key={vol.id}
                onClick={() => toggleVolunteer(vol.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${selectedVols.includes(vol.id) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedVols.includes(vol.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {selectedVols.includes(vol.id) && <CheckCircle2 size={14} className="text-white"/>}
                  </div>
                  <span className="text-sm font-600 text-slate-800">{vol.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div id="printable-section">
          {pages.map((pageVols, pageIndex) => (
            <div key={pageIndex} className="print-page">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5mm', width: '100%' }}>
                {pageVols.map(vol => (
                  <div key={vol.id} className="nametag-horizontal" style={{ backgroundImage: `url(${IMAGES.NAME_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <p style={{ fontSize: '24pt', fontWeight: 900, color: '#1e293b', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.1)', fontFamily: 'DM Sans, sans-serif' }}>
                      {vol.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="no-print fixed bottom-6 right-6 z-50">
            <button onClick={() => setShowPreview(false)} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-700 shadow-2xl hover:bg-slate-900 transition-all">
              Geri Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COLLAGE TAB ──────────────────────────────────────────────────────────────
function CollageTab({ volunteers }) {
  const [selectedVols, setSelectedVols] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [layout, setLayout] = useState('4x4');

  const toggleVolunteer = (id) => {
    setSelectedVols(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedVols(volunteers.map(v => v.id));
  };

  const deselectAll = () => {
    setSelectedVols([]);
  };

  const printCollage = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 300);
  };

  const selected = volunteers.filter(v => selectedVols.includes(v.id));
  const cols = layout === '3x3' ? 3 : layout === '4x4' ? 4 : 5;

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-900 text-slate-800">Kolaj</h2>
            <div className="flex gap-2">
              <select value={layout} onChange={e => setLayout(e.target.value)} className="px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-600 outline-none focus:border-indigo-400">
                <option value="3x3">3×3</option>
                <option value="4x4">4×4</option>
                <option value="5x5">5×5</option>
              </select>
              <button onClick={selectAll} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-700 hover:bg-indigo-200 transition-colors">
                Tümünü Seç
              </button>
              <button onClick={deselectAll} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-700 hover:bg-slate-200 transition-colors">
                Temizle
              </button>
              <button onClick={printCollage} disabled={selectedVols.length === 0} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-700 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <Printer size={16}/> Yazdır ({selectedVols.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {volunteers.map(vol => (
              <button
                key={vol.id}
                onClick={() => toggleVolunteer(vol.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${selectedVols.includes(vol.id) ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedVols.includes(vol.id) ? 'bg-purple-600 border-purple-600' : 'border-slate-300'}`}>
                    {selectedVols.includes(vol.id) && <CheckCircle2 size={14} className="text-white"/>}
                  </div>
                  <span className="text-sm font-600 text-slate-800">{vol.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div id="printable-section">
          <div className="print-page">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '2mm', width: '100%', height: '100%' }}>
              {selected.map(vol => (
                <div key={vol.id} style={{ backgroundImage: `url(${IMAGES.QUESTION_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '8px', position: 'relative', aspectRatio: '1/1' }}>
                  <p style={{ fontSize: '14pt', fontWeight: 800, color: 'white', textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontFamily: 'DM Sans, sans-serif', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '6px' }}>
                    {vol.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="no-print fixed bottom-6 right-6 z-50">
            <button onClick={() => setShowPreview(false)} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-700 shadow-2xl hover:bg-slate-900 transition-all">
              Geri Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}