/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, Users, FileText, Image as ImageIcon, Printer,
  Plus, Trash2, Upload, X, CheckCircle2, BookOpen, GraduationCap,
  Package, Sparkles, RefreshCw, Wand2, Zap, ChevronDown, ChevronUp,
  Type, Minus, PlusCircle, Maximize2, Smile,
  Camera, Settings2, MoveVertical, Maximize,
  Download, UploadCloud, Search, AlertTriangle,
  Send, MessageSquare, Bot, ChevronRight, LayoutDashboard, Clock,
  Moon, Sun, Trash, Database, FileSpreadsheet, Lock, Unlock, Eye, EyeOff,
  UserCheck, Layers, Star, ArrowRight
} from 'lucide-react';

// ─── DATABASE ────────────────────────────────────────────────────────────────
const DB_KEYS = {
  ACTIVITIES: 'activities_v30',
  VOLUNTEERS: 'shared_volunteers_v30',
  TIMESLOTS:  'timeSlots_v30',
  CLASSES:    'classes_v30',
  NAMETAG_VOLUNTEERS: 'nametags_v30',
  COLLAGE_VOLUNTEERS: 'collage_v30',
  CHAT_HISTORY: 'balkiz_chat_v1',
  DARK_MODE: 'prokdi_dark_v1'
};

const db = {
  save: (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { return false; } },
  load: (key, def)  => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def; } catch { return def; } },
  clearAll: () => { Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k)); }
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
  NAME_BG:     "https://i.ibb.co/9Hcchfq8/ntaraf.png",
  QUESTION_BG: "https://i.ibb.co/mVYxB8j2/Ekran-g-r-nt-s-2026-01-12-202232.png"
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const buildCSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&family=Comic+Neue:wght@400;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; }
body { font-family: 'DM Sans', sans-serif; }
.font-comic { font-family: 'Comic Neue', cursive; }
.font-mono  { font-family: 'DM Mono', monospace; }
.font-400 { font-weight: 400; }
.font-500 { font-weight: 500; }
.font-600 { font-weight: 600; }
.font-700 { font-weight: 700; }
.font-800 { font-weight: 800; }
.font-900 { font-weight: 900; }

@keyframes fadeIn    { from { opacity:0; transform:translateY(6px);  } to { opacity:1; transform:translateY(0);  } }
@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0);  } }
@keyframes slideUp   { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0);  } }
@keyframes scaleIn   { from { opacity:0; transform:scale(0.95);      } to { opacity:1; transform:scale(1);       } }
@keyframes spinSlow  { from { transform:rotate(0deg);                } to { transform:rotate(360deg);            } }
@keyframes blink     { 0%,100%{ opacity:1; } 50%{ opacity:0; } }
@keyframes shimmer   { 0%{ background-position:-200% 0; } 100%{ background-position:200% 0; } }
@keyframes notification-in { from{ opacity:0; transform:translateY(1rem) scale(.95); } to{ opacity:1; transform:translateY(0) scale(1); } }

/* ── Apple Liquid Glass Animations ── */
@keyframes liquid-blob {
  0%   { border-radius:62% 38% 46% 54%/60% 44% 56% 40%; transform:rotate(0deg)   scale(1);    }
  25%  { border-radius:38% 62% 70% 30%/44% 64% 36% 56%; transform:rotate(90deg)  scale(1.04); }
  50%  { border-radius:54% 46% 38% 62%/56% 36% 64% 44%; transform:rotate(180deg) scale(1);    }
  75%  { border-radius:46% 54% 62% 38%/36% 56% 44% 64%; transform:rotate(270deg) scale(1.04); }
  100% { border-radius:62% 38% 46% 54%/60% 44% 56% 40%; transform:rotate(360deg) scale(1);    }
}
@keyframes liquid-float {
  0%,100% { transform:translateY(0px)   scale(1);    }
  33%     { transform:translateY(-12px) scale(1.03); }
  66%     { transform:translateY(6px)   scale(0.98); }
}
@keyframes liquid-rainbow {
  0%  { background-position:0%   50%; filter:hue-rotate(0deg);   }
  50% { background-position:100% 50%; filter:hue-rotate(180deg); }
  100%{ background-position:0%   50%; filter:hue-rotate(360deg); }
}
@keyframes glass-shimmer {
  0%   { transform:translateX(-100%) skewX(-15deg); opacity:0;   }
  10%  { opacity:.6; }
  90%  { opacity:.6; }
  100% { transform:translateX(300%)  skewX(-15deg); opacity:0;   }
}
@keyframes orb-drift-1 {
  0%,100% { transform:translate(0,0)    scale(1);    }
  30%     { transform:translate(20px,-15px) scale(1.05); }
  60%     { transform:translate(-10px,10px) scale(0.95); }
}
@keyframes orb-drift-2 {
  0%,100% { transform:translate(0,0)       scale(1);    }
  40%     { transform:translate(-18px,12px) scale(1.08); }
  70%     { transform:translate(12px,-8px)  scale(0.96); }
}
@keyframes orb-drift-3 {
  0%,100% { transform:translate(0,0)    scale(1);    }
  20%     { transform:translate(10px,18px) scale(1.04); }
  55%     { transform:translate(-15px,-6px) scale(0.97); }
}
@keyframes pulse-ring {
  0%,100%{ box-shadow:0 0 0 0 rgba(99,102,241,.3); }
  50%    { box-shadow:0 0 0 10px rgba(99,102,241,0); }
}
@keyframes message-spring {
  0%   { opacity:0; transform:translateY(10px) scale(0.92); }
  60%  { transform:translateY(-3px) scale(1.02); }
  100% { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes typing-wave {
  0%,80%,100% { transform:scale(0) translateY(0); opacity:.4; }
  40%         { transform:scale(1) translateY(-6px); opacity:1; }
}
@keyframes surface-ripple {
  0%   { transform:scale(0.7); opacity:.8; }
  100% { transform:scale(2.2); opacity:0;  }
}

/* ── JARVIS Brain Animations ── */
@keyframes jarvis-ring-1 {
  from { transform: rotateX(75deg) rotateZ(0deg); }
  to   { transform: rotateX(75deg) rotateZ(360deg); }
}
@keyframes jarvis-ring-2 {
  from { transform: rotateX(75deg) rotateZ(120deg); }
  to   { transform: rotateX(75deg) rotateZ(480deg); }
}
@keyframes jarvis-ring-3 {
  from { transform: rotateX(35deg) rotateY(60deg) rotateZ(0deg); }
  to   { transform: rotateX(35deg) rotateY(60deg) rotateZ(-360deg); }
}
@keyframes jarvis-core-pulse {
  0%,100% { transform: scale(1);    opacity:.9; filter:blur(0px); }
  50%     { transform: scale(1.15); opacity:1;  filter:blur(1px); }
}
@keyframes jarvis-neuron {
  0%,100% { opacity:0.3; transform:scale(0.8); }
  50%     { opacity:1;   transform:scale(1.2); }
}
@keyframes jarvis-scan {
  0%   { transform:translateY(-100%); opacity:0;   }
  10%  { opacity:.4; }
  90%  { opacity:.4; }
  100% { transform:translateY(100%);  opacity:0;   }
}
@keyframes jarvis-data-flow {
  0%   { stroke-dashoffset:100; opacity:0;  }
  20%  { opacity:0.8; }
  80%  { opacity:0.8; }
  100% { stroke-dashoffset:0;   opacity:0;  }
}
@keyframes jarvis-glow-outer {
  0%,100% { opacity:0.4; transform:scale(1); }
  50%     { opacity:0.8; transform:scale(1.08); }
}

.jarvis-brain-container {
  position:relative; width:52px; height:52px;
  display:flex; align-items:center; justify-content:center;
  perspective: 200px;
}
.jarvis-ring {
  position:absolute; border-radius:50%;
  border:1.5px solid transparent;
  pointer-events:none;
}
.jarvis-ring-1 {
  width:48px; height:48px;
  border-top-color: rgba(99,102,241,.9);
  border-right-color: rgba(99,102,241,.3);
  border-bottom-color: rgba(99,102,241,.1);
  border-left-color: rgba(139,92,246,.5);
  animation: jarvis-ring-1 3s linear infinite;
  filter: drop-shadow(0 0 3px rgba(99,102,241,.6));
}
.jarvis-ring-2 {
  width:36px; height:36px;
  border-top-color: rgba(6,182,212,.8);
  border-right-color: rgba(6,182,212,.2);
  border-bottom-color: rgba(6,182,212,.5);
  border-left-color: transparent;
  animation: jarvis-ring-2 2.2s linear infinite reverse;
  filter: drop-shadow(0 0 3px rgba(6,182,212,.5));
}
.jarvis-ring-3 {
  width:42px; height:42px;
  border-top-color: rgba(168,85,247,.7);
  border-right-color: rgba(168,85,247,.2);
  border-bottom-color: transparent;
  border-left-color: rgba(168,85,247,.5);
  animation: jarvis-ring-3 4s linear infinite;
  filter: drop-shadow(0 0 2px rgba(168,85,247,.4));
}
.jarvis-ring-1.active { border-top-color: rgba(99,102,241,1); filter: drop-shadow(0 0 6px rgba(99,102,241,.9)); animation-duration:1.5s; }
.jarvis-ring-2.active { border-top-color: rgba(6,182,212,1);  filter: drop-shadow(0 0 5px rgba(6,182,212,.9));  animation-duration:1.1s; }
.jarvis-ring-3.active { border-top-color: rgba(168,85,247,1); filter: drop-shadow(0 0 4px rgba(168,85,247,.9)); animation-duration:2s; }

.jarvis-core {
  position:relative; z-index:5;
  width:22px; height:22px;
  border-radius:50%;
  background: radial-gradient(circle at 35% 35%, rgba(255,255,255,.95), rgba(224,231,255,.8));
  border:1px solid rgba(99,102,241,.4);
  display:flex; align-items:center; justify-content:center;
  animation: jarvis-core-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(99,102,241,.3), inset 0 1px 0 rgba(255,255,255,.9);
}
.jarvis-core.active {
  background: radial-gradient(circle at 35% 35%, rgba(255,255,255,1), rgba(199,210,254,.9));
  box-shadow: 0 0 16px rgba(99,102,241,.6), 0 0 32px rgba(99,102,241,.2), inset 0 1px 0 rgba(255,255,255,1);
  animation-duration: 0.8s;
}
.jarvis-neuron {
  position:absolute;
  width:3px; height:3px;
  border-radius:50%;
  background:rgba(99,102,241,.8);
}

/* ── Outer Glow ── */
.jarvis-glow-outer {
  position:absolute; inset:-8px;
  border-radius:50%;
  background: conic-gradient(from 0deg, rgba(99,102,241,.0), rgba(99,102,241,.3), rgba(6,182,212,.2), rgba(168,85,247,.3), rgba(99,102,241,.0));
  filter: blur(6px);
  animation: jarvis-glow-outer 2.5s ease-in-out infinite;
  pointer-events:none;
}
.jarvis-glow-outer.active {
  background: conic-gradient(from 0deg, rgba(99,102,241,.1), rgba(99,102,241,.6), rgba(6,182,212,.4), rgba(168,85,247,.6), rgba(99,102,241,.1));
  animation-duration:1.2s;
}

/* ── Glass Panel ── */
.glass-panel {
  background:${dark ? 'rgba(15,23,42,.75)' : 'rgba(255,255,255,.72)'};
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  border:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.5)'};
  box-shadow:${dark ? '0 4px 32px rgba(0,0,0,.4)' : '0 4px 32px rgba(99,102,241,.08), 0 1px 0 rgba(255,255,255,.8) inset'};
}
.glass-panel-dark {
  background:rgba(15,23,42,.65);
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  border:1px solid rgba(255,255,255,.08);
  box-shadow:0 4px 32px rgba(0,0,0,.3);
}
.liquid-shimmer { position:relative; overflow:hidden; }
.liquid-shimmer::after {
  content:'';
  position:absolute; top:0; left:0; right:0; bottom:0;
  background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.55) 50%,transparent 65%);
  animation:glass-shimmer 3.5s ease-in-out infinite;
  pointer-events:none;
}

/* ── Chat Bubbles ── */
.chat-user {
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:white;
  border-radius:18px 18px 4px 18px;
  box-shadow:0 2px 16px rgba(99,102,241,.35), inset 0 1px 0 rgba(255,255,255,.25);
}
.chat-bot {
  background:${dark ? 'rgba(30,41,59,.9)' : 'rgba(241,245,249,.9)'};
  color:${dark ? '#e2e8f0' : '#1e293b'};
  border-radius:18px 18px 18px 4px;
  border:1px solid ${dark ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.7)'};
  box-shadow:0 1px 8px rgba(0,0,0,.06);
  backdrop-filter:blur(8px);
}

.typing-cursor::after { content:''; display:inline-block; width:3px; height:14px; background:#6366f1; margin-left:2px; vertical-align:middle; animation:blink 1s step-end infinite; }

.custom-scroll::-webkit-scrollbar { width:4px; }
.custom-scroll::-webkit-scrollbar-track { background:transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background:${dark?'#334155':'#e2e8f0'}; border-radius:99px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background:${dark?'#475569':'#cbd5e1'}; }

.bg-stripes { background-image:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(${dark?'255,255,255':'0,0,0'},.025) 8px,rgba(${dark?'255,255,255':'0,0,0'},.025) 16px); }

.excel-table { border-collapse:collapse; width:100%; }
.excel-table th,
.excel-table td { border:1px solid ${dark?'#334155':'#94a3b8'}; padding:0; }
.excel-table thead th { background:${dark?'#1e293b':'#f8fafc'}; font-weight:700; font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; color:${dark?'#94a3b8':'#475569'}; }
.excel-table tbody tr:nth-child(even) td:first-child { background:${dark?'#1a2744':'#fafafa'}; }

.print-page { width:210mm; height:297mm; min-height:297mm; page-break-after:always; page-break-inside:avoid; break-after:page; break-inside:avoid; }
.print-page:last-child { page-break-after:auto; break-after:auto; }

/* ── Dark Mode Overrides ── */
.dark-app { background:#0f172a !important; color:#e2e8f0 !important; }
.dk-bg   { background:${dark?'#1e293b':'white'} !important; }
.dk-border { border-color:${dark?'#334155':'#e2e8f0'} !important; }
.dk-text  { color:${dark?'#e2e8f0':'#1e293b'} !important; }
.dk-text-muted { color:${dark?'#64748b':'#94a3b8'} !important; }
.dk-input { background:${dark?'#0f172a':'white'} !important; border-color:${dark?'#334155':'#e2e8f0'} !important; color:${dark?'#e2e8f0':'#1e293b'} !important; }
.dk-hover:hover { background:${dark?'rgba(51,65,85,.6)':'rgba(241,245,249,.8)'} !important; }
.dk-sidebar { background:${dark?'#0f172a':'white'} !important; border-color:${dark?'#1e293b':'#e2e8f0'} !important; }
.dk-header { background:${dark?'rgba(15,23,42,.95)':'rgba(255,255,255,.9)'} !important; border-color:${dark?'#1e293b':'#e2e8f0'} !important; }
.dk-card { background:${dark?'#1e293b':'white'} !important; border-color:${dark?'#334155':'#e2e8f0'} !important; }
.dk-card-inner { background:${dark?'#0f172a':'#f8fafc'} !important; }

.animate-fadeIn       { animation:fadeIn  .25s ease both; }
.animate-slideDown    { animation:slideDown .2s ease both; }
.animate-slideUp      { animation:slideUp  .2s ease both; }
.animate-scaleIn      { animation:scaleIn  .2s ease both; }
.animate-notification { animation:notification-in .3s cubic-bezier(0.34,1.56,0.64,1) both; }
.animate-message      { animation:message-spring .4s cubic-bezier(0.34,1.3,0.64,1) both; }

/* ── Slot Cell ── */
.slot-cell-must { background:${dark?'rgba(254,205,211,.15)':'#fff0f0'}; border:1px solid ${dark?'rgba(251,113,133,.3)':'#fecdd3'}; }
.slot-cell-opt  { background:${dark?'rgba(199,210,254,.08)':'#eef2ff'}; border:1px solid ${dark?'rgba(99,102,241,.25)':'#c7d2fe'}; }
.slot-cell-empty { border:2px dashed ${dark?'#334155':'#e2e8f0'}; }
.slot-cell-noclass { background:${dark?'#1e293b':'#f8fafc'}; border:1px dashed ${dark?'#334155':'#cbd5e1'}; }

@media print {
  html,body { height:auto!important; overflow:visible!important; margin:0!important; padding:0!important; background:white!important; }
  #root > div { display:block!important; height:auto!important; overflow:visible!important; }
  .no-print   { display:none!important; }
  aside,header{ display:none!important; }
  main { height:auto!important; overflow:visible!important; display:block!important; position:static!important; padding:0!important; background:white!important; }
  #printable-section { padding:0!important; max-width:none!important; }
  * { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
  .print-page { margin:0!important; box-shadow:none!important; border:none!important; padding:5mm!important; page-break-after:always!important; break-after:page!important; page-break-inside:avoid!important; overflow:hidden!important; }
  .print-page:last-child { page-break-after:auto!important; break-after:auto!important; }
  @page { size:A4 portrait; margin:0; }
  .collage-print-strict { width:210mm!important; height:297mm!important; max-height:297mm!important; page-break-after:avoid!important; overflow:hidden!important; display:flex!important; flex-direction:column!important; box-sizing:border-box!important; }
  .excel-table th, .excel-table td { border:1px solid #000!important; }
}
`;

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isDanger = false, confirmText = "Onayla", dark }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className={`rounded-2xl shadow-2xl max-w-sm w-full p-6 border animate-scaleIn dk-card dk-border`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
            {isDanger ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
          </div>
          <h3 className="text-base font-700 dk-text">{title}</h3>
        </div>
        <p className="text-sm dk-text-muted mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-600 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">İptal</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-700 text-white transition-all active:scale-95 ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// ─── PROMPT MODAL ─────────────────────────────────────────────────────────────
const PromptModal = ({ isOpen, title, defaultValue, onConfirm, onCancel }) => {
  const [val, setVal] = useState(defaultValue || "");
  useEffect(() => { setVal(defaultValue || ""); }, [defaultValue, isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 animate-scaleIn">
        <h3 className="text-base font-700 text-slate-800 mb-4">{title}</h3>
        <input autoFocus type="text" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirm(val)}
          className="w-full border-2 border-slate-200 p-3 rounded-xl text-sm font-500 text-slate-700 outline-none focus:border-indigo-400 transition-colors mb-4"/>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-600 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">İptal</button>
          <button onClick={() => onConfirm(val)} className="px-4 py-2 rounded-xl text-sm font-700 text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">Kaydet</button>
        </div>
      </div>
    </div>
  );
};

// ─── CLOCK ────────────────────────────────────────────────────────────────────
const Saat = ({ dark }) => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("tr-TR", { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
    tick(); const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`flex items-center gap-1.5 text-xs font-mono font-500 dk-text-muted dk-card dk-border border px-3 py-2 rounded-lg`}>
      <Clock size={12} className="text-slate-400"/> {time}
    </div>
  );
};

// ─── SIDEBAR ITEM ─────────────────────────────────────────────────────────────
const SidebarItem = ({ id, icon, label, active, onClick, dark }) => (
  <button onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-600 transition-all duration-200
      ${active === id
        ? dark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-white text-indigo-700 shadow-sm'
        : dark ? 'text-slate-400 hover:text-slate-200 hover:bg-white/10' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}>
    <span className={`transition-colors ${active === id ? 'text-indigo-500' : ''}`}>{icon}</span>
    <span>{label}</span>
    {active === id && <ChevronRight size={14} className="ml-auto text-indigo-400"/>}
  </button>
);

// ─── JARVIS BRAIN COMPONENT ───────────────────────────────────────────────────
const JarvisBrain = ({ active }) => {
  const neurons = [
    { top:'20%', left:'20%', delay:'0s'   },
    { top:'20%', left:'75%', delay:'.4s'  },
    { top:'70%', left:'15%', delay:'.8s'  },
    { top:'75%', left:'70%', delay:'1.2s' },
    { top:'45%', left:'85%', delay:'.6s'  },
  ];
  return (
    <div className="jarvis-brain-container">
      {active && <div className={`jarvis-glow-outer ${active?'active':''}`}/>}
      <div className={`jarvis-ring jarvis-ring-1 ${active?'active':''}`}/>
      <div className={`jarvis-ring jarvis-ring-3 ${active?'active':''}`}/>
      <div className={`jarvis-ring jarvis-ring-2 ${active?'active':''}`}/>
      {neurons.map((n,i)=>(
        <div key={i} className="jarvis-neuron" style={{ top:n.top, left:n.left, animation:`jarvis-neuron ${1.5+i*0.3}s ${n.delay} ease-in-out infinite`, background: active ? 'rgba(99,102,241,.9)' : 'rgba(99,102,241,.5)' }}/>
      ))}
      <div className={`jarvis-core ${active?'active':''}`}>
        <Sparkles size={10} style={{ color: active ? '#4f46e5' : '#818cf8', fill: active ? '#e0e7ff' : 'none', transition:'all .3s' }}/>
      </div>
    </div>
  );
};

// ─── BALKIZ AI CHAT ───────────────────────────────────────────────────────────
function BalkizAIChat({ appState, onAction, warnings = [], dark }) {
  const INITIAL = [{ role:'assistant', content:'Merhaba! Ben B.A.L.K.I.Z. 🧠\nProgram oluşturma, güncelleme, gönüllü & etkinlik atama gibi tüm işlemler için doğal dilde yazın.\n\nÖrn: "09:00-09:40 arasında 1-A\'ya Origami ekle, Eda lider olsun" ya da "Tüm zorunlu olmayanları sil"' }];
  const [messages, setMessages] = useState(() => db.load(DB_KEYS.CHAT_HISTORY, INITIAL));
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [isOpen, setIsOpen]     = useState(true);
  const [ripple, setRipple]     = useState(false);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { db.save(DB_KEYS.CHAT_HISTORY, messages); }, [messages]);
  useEffect(() => { if(endRef.current) endRef.current.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);

  const buildSystemPrompt = () => {
    const { activities=[], volunteers=[], classes=[], timeSlots=[] } = appState || {};
    const scheduleStr = classes.map(c => {
      const slots = Object.entries(c.schedule||{}).map(([slotId, s]) => {
        const ts = timeSlots.find(t=>t.id===slotId);
        return `${ts?.start||'?'}-${ts?.end||'?'}:${s.name||'BOŞ'}(${s.lead||'-'})`;
      }).join(', ');
      return `${c.name}[${slots||'boş'}]`;
    }).join(' | ');

    return `Sen B.A.L.K.I.Z. (Bilgisayar Destekli Lojistik Koordinasyon İzleme Zekası) isimli ProkordiManager asistanısın.

MEVCUT DURUM:
Etkinlikler(${activities.length}): ${JSON.stringify(activities.map(a=>({id:a.id,name:a.name,isMust:a.isMust,boxCount:a.boxCount,grades:a.allowedGrades})))}
Gönüllüler(${volunteers.length}): ${JSON.stringify(volunteers.map(v=>({id:v.id,name:v.name,caps:v.capabilities})))}
Sınıflar(${classes.length}): ${classes.map(c=>c.name).join(', ')}
Zaman Dilimleri(${timeSlots.length}): ${timeSlots.map(t=>`${t.id}:${t.start}-${t.end}(${t.type})`).join(', ')}
Mevcut Program: ${scheduleStr}
Uyarılar: ${warnings.length} adet

KULLANABİLECEĞİN KOMUTLAR:
add_volunteer: {type:"add_volunteer",name:"Ad Soyad",capabilities:[activityId]}
remove_volunteer: {type:"remove_volunteer",id:"vol_id"}
update_volunteer_caps: {type:"update_volunteer_caps",id:"vol_id",capabilities:[actId,...]}
add_activity: {type:"add_activity",name:"...",isMust:false,boxCount:1,allowedGrades:[0,1,2,3,4,5,6,7,8]}
remove_activity: {type:"remove_activity",id:"act_id"}
update_activity: {type:"update_activity",id:"act_id",name:"...",isMust:true,boxCount:3}
add_class: {type:"add_class",name:"..."}
remove_class: {type:"remove_class",id:"cls_id"}
distribute: {type:"distribute"}
clear_schedule: {type:"clear_schedule"}
clear_non_mandatory: {type:"clear_non_mandatory"}
update_slot: {type:"update_slot",classId:"cls_id",slotId:"t1",activityId:"act_id",activityName:"...",leadId:"vol_id",leadName:"..."}
delete_slot: {type:"delete_slot",classId:"cls_id",slotId:"t1"}
assign_volunteer_activity: {type:"assign_volunteer_activity",volunteerName:"...",activityName:"..."}
add_timeslot: {type:"add_timeslot",duration:40,slotType:"lesson"}
load_template: {type:"load_template"}

ZAMAN PARSING: "09:00-09:40" → slotId için timeSlots içinde eşleşen slot bul. "İlk ders"→ilk lesson slot. "Öğleden sonra"→12:30'dan sonraki slotlar. Kesin slotId kullan.
PROGRAM GÜNCELLEME: Yeni program yazarken önce clear_schedule ile eskisini sil, sonra distribute et ya da update_slot ile tek tek ata. Eski slotları silmeyi unutma!
ÇOKLU İŞLEM: actions dizisinde birden fazla komut kullanabilirsin.

FORMAT (SADECE JSON, backtick kullanma):
{"message":"Türkçe yanıt","actions":[]}`;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setRipple(true); setTimeout(()=>setRipple(false), 600);
    const newMsgs = [...messages, { role:'user', content:text }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ max_tokens:1200, system:buildSystemPrompt(), messages:newMsgs.map(m=>({role:m.role,content:m.content})) })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data?.error||`HTTP ${res.status}`);
      const raw = data.content?.[0]?.text || '{"message":"Bir hata oluştu.","actions":[]}';
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()); }
      catch { parsed = { message: raw, actions: [] }; }
      setMessages([...newMsgs, { role:'assistant', content:parsed.message }]);
      if(parsed.actions?.length) parsed.actions.forEach(a => onAction(a));
    } catch(err) {
      setMessages([...newMsgs, { role:'assistant', content:`⚠️ ${err.message?.includes('API_KEY')?'GROQ_API_KEY yapılandırılmamış.':'Bağlantı hatası: '+err.message}` }]);
    } finally { setLoading(false); }
  };

  const statusLabel = loading
    ? <span style={{background:'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundSize:'200%',animation:'liquid-rainbow 2s linear infinite'}}>Düşünüyor…</span>
    : warnings.length > 0
      ? <span className="text-amber-500">{warnings.length} uyarı</span>
      : <span className="text-emerald-500">Hazır</span>;

  const bgClr = dark ? 'rgba(15,23,42,.85)' : 'rgba(255,255,255,.72)';
  const msgBg = dark ? 'rgba(15,23,42,.6)' : 'rgba(255,255,255,.5)';

  return (
    <div className="no-print mb-5" style={{ position:'relative' }}>
      <div aria-hidden style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:'1rem', pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-30%', left:'-10%', width:'55%', height:'180%', background:'radial-gradient(circle,rgba(99,102,241,.1) 0%,transparent 70%)', animation:'orb-drift-1 8s ease-in-out infinite', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', top:'20%', right:'-15%', width:'50%', height:'160%', background:'radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%)', animation:'orb-drift-2 10s ease-in-out infinite', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:'-20%', left:'30%', width:'40%', height:'120%', background:'radial-gradient(circle,rgba(6,182,212,.07) 0%,transparent 70%)', animation:'orb-drift-3 12s ease-in-out infinite', borderRadius:'50%' }}/>
      </div>
      <div className="glass-panel" style={{ position:'relative', zIndex:1, borderRadius:'1.25rem', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ position:'relative', overflow:'hidden', padding:'12px 18px', borderBottom:`1px solid ${dark?'rgba(255,255,255,.08)':'rgba(255,255,255,.4)'}`, background:'linear-gradient(135deg,rgba(99,102,241,.06) 0%,rgba(139,92,246,.04) 50%,rgba(6,182,212,.06) 100%)' }}>
          <div className="liquid-shimmer" style={{ position:'absolute', inset:0, pointerEvents:'none' }}/>
          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <JarvisBrain active={loading}/>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color: dark?'#e2e8f0':'#334155', letterSpacing:'-.01em' }}>B.A.L.K.I.Z.</div>
                <div style={{ fontSize:10, fontWeight:500, textTransform:'uppercase', letterSpacing:'.08em', marginTop:1 }}>{statusLabel}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {warnings.length > 0 && !isOpen && (
                <span style={{ background:'#fef3c7', color:'#b45309', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>{warnings.length}</span>
              )}
              <button onClick={()=>setMessages(INITIAL)} title="Sohbeti sıfırla"
                style={{ padding:6, borderRadius:8, border:'none', background:'transparent', color:'#94a3b8', cursor:'pointer', display:'flex' }}>
                <RefreshCw size={13}/>
              </button>
              <button onClick={()=>setIsOpen(v=>!v)}
                style={{ padding:6, borderRadius:8, border:'none', background:'transparent', color:'#94a3b8', cursor:'pointer', display:'flex' }}>
                {isOpen?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <>
            <div className="custom-scroll" style={{ height:220, overflowY:'auto', padding:'14px', background:msgBg, backdropFilter:'blur(8px)', display:'flex', flexDirection:'column', gap:9 }}>
              {messages.map((m,i)=>(
                <div key={i} style={{ display:'flex', gap:8, justifyContent:m.role==='user'?'flex-end':'flex-start', animation:'message-spring .4s cubic-bezier(0.34,1.3,.64,1) both', animationDelay:`${i*.03}s` }}>
                  {m.role==='assistant' && (
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#e0e7ff,#ddd6fe)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                      <Bot size={12} style={{ color:'#6366f1' }}/>
                    </div>
                  )}
                  <div className={m.role==='user'?'chat-user':'chat-bot'} style={{ maxWidth:'80%', padding:'9px 13px', fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap' }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display:'flex', gap:8, justifyContent:'flex-start', animation:'message-spring .3s ease both' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#e0e7ff,#ddd6fe)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Bot size={12} style={{ color:'#6366f1' }}/>
                  </div>
                  <div className="chat-bot" style={{ padding:'11px 16px', display:'flex', gap:5, alignItems:'center' }}>
                    {[0,1,2].map(i=>(
                      <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'inline-block', animation:`typing-wave 1.4s ${i*.2}s ease-in-out infinite` }}/>
                    ))}
                  </div>
                </div>
              )}
              {!loading && warnings.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:5, paddingTop:3 }}>
                  {warnings.slice(0,4).map((w,i)=>(
                    <div key={i} style={{ fontSize:11, fontWeight:500, color:'#92400e', background:'rgba(254,243,199,.8)', border:'1px solid rgba(253,230,138,.6)', borderRadius:8, padding:'5px 9px', display:'flex', alignItems:'flex-start', gap:5 }}>
                      <AlertTriangle size={11} style={{ flexShrink:0, marginTop:1 }}/> {w.msg}
                    </div>
                  ))}
                  {warnings.length>4 && <div style={{ fontSize:11, color:'#94a3b8', padding:'5px 9px' }}>+{warnings.length-4} daha…</div>}
                </div>
              )}
              <div ref={endRef}/>
            </div>
            <div style={{ borderTop:`1px solid ${dark?'rgba(255,255,255,.08)':'rgba(255,255,255,.4)'}`, padding:'9px 11px', background:dark?'rgba(15,23,42,.7)':'rgba(248,250,252,.7)', backdropFilter:'blur(8px)', display:'flex', gap:7 }}>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
                placeholder="09:00-09:40 arasında 1-A'ya Origami ekle, Eda lider olsun…"
                style={{ flex:1, fontSize:13, background:dark?'rgba(30,41,59,.8)':'rgba(255,255,255,.8)', border:`1.5px solid ${dark?'rgba(51,65,85,.8)':'rgba(226,232,240,.8)'}`, borderRadius:11, padding:'9px 14px', outline:'none', fontFamily:'inherit', color:dark?'#e2e8f0':'#334155', backdropFilter:'blur(8px)', transition:'border-color .2s' }}
                onFocus={e=>{ e.target.style.borderColor='rgba(99,102,241,.5)'; }}
                onBlur={e=>{ e.target.style.borderColor=dark?'rgba(51,65,85,.8)':'rgba(226,232,240,.8)'; }}/>
              <button onClick={send} disabled={loading||!input.trim()}
                style={{ position:'relative', overflow:'hidden', padding:'9px 13px', borderRadius:11, border:'none', cursor:loading||!input.trim()?'not-allowed':'pointer', background:loading||!input.trim()?'rgba(99,102,241,.35)':'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', boxShadow:loading||!input.trim()?'none':'0 2px 12px rgba(99,102,241,.35)' }}>
                {ripple && <span style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.3)', borderRadius:11, animation:'surface-ripple .6s ease-out both' }}/>}
                {loading ? <RefreshCw size={15} style={{ animation:'spinSlow .8s linear infinite' }}/> : <Send size={15}/>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── NAV BUTTON ───────────────────────────────────────────────────────────────
const NavBtn = ({ active, onClick, icon, label, dark }) => (
  <button onClick={onClick}
    className={`px-3 py-2 rounded-xl text-sm font-600 flex gap-2 items-center transition-all duration-200 no-print
      ${active
        ? 'bg-indigo-600 text-white shadow-sm'
        : dark ? 'bg-white/10 border border-white/20 text-slate-300 hover:border-indigo-400 hover:text-indigo-300'
               : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}>
    {icon} {label}
  </button>
);

// ─── MODULE 1: INFINITY SCHEDULER ────────────────────────────────────────────
function InfinityScheduler({ onNotify, dark }) {
  const [activeView, setActiveView] = useState('view');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const LOGIC_CONFIG = {
    primaryBlacklist:    ['kimya', 'fizik', 'robot', 'yapay zeka', 'geleceğe mektup'],
    primaryWhitelist:    ['yaratıcı drama', 'origami', 'yüz boyama', 'pino mino', 'müzik', 'resim'],
    middleSchoolPreferred: ['kimya', 'fizik', 'göremediğimiz canavarlar', 'fen', 'matematik', 'robot', 'masa deneyleri', 'vr', 'müzik', 'edebiyat']
  };

  const [activities, setActivities] = useState(() => db.load(DB_KEYS.ACTIVITIES, []));
  const [volunteers, setVolunteers] = useState(() => db.load(DB_KEYS.VOLUNTEERS, []));
  const [timeSlots,  setTimeSlots]  = useState(() => db.load(DB_KEYS.TIMESLOTS, []));
  const [classes,    setClasses]    = useState(() => db.load(DB_KEYS.CLASSES, []));

  const [warnings,       setWarnings]       = useState([]);
  const [aiState,        setAiState]        = useState('idle');
  const [hasDistributed, setHasDistributed] = useState(false);
  const [autoGenStep,    setAutoGenStep]    = useState('');
  const [editingSlot,    setEditingSlot]    = useState(null);
  const [bulkModalOpen,  setBulkModalOpen]  = useState(false);
  const [bulkText,       setBulkText]       = useState('');
  const [quickSlot,      setQuickSlot]      = useState(null); // { clsId, slotId }
  const [excelImportMode, setExcelImportMode] = useState(false);

  const dragItem    = useRef();
  const fileInputRef= useRef(null);
  const excelRef    = useRef(null);

  useEffect(() => { db.save(DB_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { db.save(DB_KEYS.VOLUNTEERS, volunteers); syncVolunteers(volunteers); }, [volunteers]);
  useEffect(() => { db.save(DB_KEYS.TIMESLOTS,  timeSlots);  }, [timeSlots]);
  useEffect(() => { db.save(DB_KEYS.CLASSES,    classes);    }, [classes]);

  const detectGrade = cls => {
    if (!cls) return 0;
    const s = cls.toString().toLowerCase();
    if (s.includes('ana') || s.includes('kreş')) return 0;
    const m = s.match(/(\d+)/);
    return m ? parseInt(m[0]) : 0;
  };
  const normalize = t => t ? t.toLocaleLowerCase('tr').trim() : '';

  // ── CONFLICT CALCULATOR ──────────────────────────────────────────────────
  const calculateConflicts = useCallback(() => {
    const warns = [];
    const lessonSlots = timeSlots.filter(t => t.type === 'lesson');
    if (classes.every(c => Object.keys(c.schedule||{}).length === 0)) return [];

    classes.forEach(cls => {
      const grade = detectGrade(cls.name);
      const actCounts = {}, volCounts = {};
      Object.entries(cls.schedule||{}).forEach(([, slot]) => {
        if (!slot || slot.activityId === 'NO_CLASS') return;
        const act = activities.find(a => a.id === slot.activityId);
        if (act) {
          if (act.allowedGrades?.length > 0 && !act.allowedGrades.includes(grade))
            warns.push({ type:'protocol', msg:`Seviye: ${cls.name} → "${act.name}" uygun değil.` });
          else {
            const n = normalize(act.name);
            if (grade > 0 && grade <= 4 && LOGIC_CONFIG.primaryBlacklist.some(b => n.includes(b)))
              warns.push({ type:'pedagoji', msg:`Pedagoji: ${cls.name} için "${slot.name}" ağır.` });
          }
        }
        if (slot.activityId) actCounts[slot.activityId] = (actCounts[slot.activityId]||0) + 1;
        if (slot.leadId && slot.leadId !== 'none') volCounts[slot.leadId] = (volCounts[slot.leadId]||0) + 1;
      });
      Object.entries(actCounts).forEach(([id, n]) => {
        if (n > 1) warns.push({ type:'duplicate_act', msg:`${cls.name} → "${activities.find(a=>a.id===id)?.name}" ${n}× tekrar!` });
      });
    });

    lessonSlots.forEach(slot => {
      const volMap = {}, actUsage = {};
      classes.forEach(cls => {
        const cell = (cls.schedule||{})[slot.id];
        if (!cell || cell.activityId === 'NO_CLASS') return;
        if (cell.leadId && cell.leadId !== 'none') {
          if (!volMap[cell.leadId]) volMap[cell.leadId] = [];
          volMap[cell.leadId].push(cls.name);
          const vol = volunteers.find(v => v.id === cell.leadId);
          if (vol && !vol.capabilities.includes(cell.activityId))
            warns.push({ type:'competency', msg:`${vol.name}, "${cell.name}" yetkinliğine sahip değil!` });
        }
        if (cell.activityId) actUsage[cell.activityId] = (actUsage[cell.activityId]||0) + 1;
      });
      Object.entries(volMap).forEach(([vId, cls]) => {
        if (cls.length > 1) warns.push({ type:'conflict', msg:`${volunteers.find(v=>v.id===vId)?.name} ${slot.start}'de ${cls.length} sınıfta!` });
      });
      Object.entries(actUsage).forEach(([aId, n]) => {
        const act = activities.find(a => a.id === aId);
        if (act && n > (act.boxCount||99)) warns.push({ type:'stock', msg:`"${act.name}" stok yetersiz! (${n} atandı, ${act.boxCount} kutu)` });
      });
    });
    return warns;
  }, [classes, activities, timeSlots, volunteers]);

  useEffect(() => { setWarnings(calculateConflicts()); }, [calculateConflicts]);

  const checkConstraints = useCallback((activity, className) => {
    if (!activity) return false;
    const grade = detectGrade(className);
    const safe = activity.allowedGrades || [];
    if (safe.length > 0) return safe.includes(grade);
    const n = normalize(activity.name);
    if (grade > 0 && grade <= 4 && LOGIC_CONFIG.primaryBlacklist.some(b => n.includes(b))) return false;
    if (grade >= 5 && (n.includes('ilkokul') || (n.includes('boyama') && !n.includes('tuval')))) return false;
    return true;
  }, []);

  // ── DISTRIBUTION ─────────────────────────────────────────────────────────
  const distributePerfectly = useCallback(() => {
    setAiState('processing');
    setHasDistributed(true);
    setTimeout(() => {
      const lessonSlots = timeSlots.filter(t => t.type === 'lesson');
      if (!lessonSlots.length || !classes.length || !activities.length) {
        setAiState('idle'); onNotify('Etkinlik, sınıf ve zaman dilimi ekleyin önce!'); return;
      }
      const runOnce = () => {
        let nc = JSON.parse(JSON.stringify(classes));
        nc.forEach(c => { Object.keys(c.schedule||{}).forEach(s => { if (!(c.schedule[s]||{}).isLocked) delete c.schedule[s]; }); });
        const volLoad = {};
        volunteers.forEach(v => { volLoad[v.id] = 0; });
        const getTotalUsage = (actId, allClasses) => { let n=0; allClasses.forEach(c=>Object.values(c.schedule||{}).forEach(s=>{if(s.activityId===actId)n++;})); return n; };
        const isInClass = (actId, cls) => Object.values(cls.schedule||{}).some(s=>s.activityId===actId);
        const findLead = (actId, slotId, clsId, allClasses) => {
          const act = activities.find(a=>a.id===actId);
          if (getTotalUsage(actId, allClasses) >= (act?.boxCount||99)) return null;
          const capable   = volunteers.filter(v=>v.capabilities.includes(actId));
          const available = capable.filter(v=>!allClasses.some(c=>c.id!==clsId&&(c.schedule||{})[slotId]?.leadId===v.id));
          if (!available.length) return null;
          available.sort((a,b)=>((volLoad[a.id]||0)-(volLoad[b.id]||0))||(a.capabilities.length-b.capabilities.length));
          return available[0];
        };
        const shuffled = [...nc].sort(()=>Math.random()-.5);
        const mustActs = activities.filter(a=>a.isMust);
        const optActs  = activities.filter(a=>!a.isMust);
        shuffled.forEach(cls => {
          const free = [...lessonSlots].filter(s=>!(cls.schedule||{})[s.id]).sort(()=>Math.random()-.5);
          mustActs.forEach(must => {
            if (!checkConstraints(must,cls.name)||isInClass(must.id,cls)) return;
            for (let i=0; i<free.length; i++) {
              const s = free[i];
              const lead = findLead(must.id, s.id, cls.id, nc);
              if (lead) { nc.find(c=>c.id===cls.id).schedule[s.id]={activityId:must.id,name:must.name,cat:must.cat,isMust:true,lead:lead.name,leadId:lead.id,support:[]}; volLoad[lead.id]=(volLoad[lead.id]||0)+1; free.splice(i,1); break; }
            }
          });
        });
        nc.forEach(cls => {
          lessonSlots.forEach(s => {
            if ((cls.schedule||{})[s.id]) return;
            const cands = optActs.filter(a=>checkConstraints(a,cls.name)&&!isInClass(a.id,cls)).sort(()=>Math.random()-.5);
            for (const act of cands) {
              const lead = findLead(act.id, s.id, cls.id, nc);
              if (lead) { cls.schedule[s.id]={activityId:act.id,name:act.name,cat:act.cat,isMust:false,lead:lead.name,leadId:lead.id,support:[]}; volLoad[lead.id]=(volLoad[lead.id]||0)+1; break; }
            }
          });
        });
        let filled=0; nc.forEach(c=>lessonSlots.forEach(s=>{if((c.schedule||{})[s.id])filled++;}));
        return { classes:nc, score:filled };
      };
      let best=null;
      for (let i=0; i<5; i++) { const r=runOnce(); if(!best||r.score>best.score)best=r; if(best.score===classes.length*lessonSlots.length)break; }
      setClasses(best.classes); setAiState('idle');
      onNotify(`B.A.L.K.I.Z. atamaları tamamladı! (${best.score} slot dolduruldu)`);
    }, 1200);
  }, [activities, volunteers, classes, timeSlots, checkConstraints]);

  // ── EXCEL EXPORT ─────────────────────────────────────────────────────────
  const exportToExcelCSV = () => {
    if (!classes.length || !timeSlots.length) { onNotify("Dışa aktarılacak program yok!"); return; }
    const sep = ';';
    let csv = '\uFEFF';
    csv += `"SAAT / SINIF"${sep}` + classes.map(c=>`"${c.name}"`).join(sep) + '\n';
    timeSlots.forEach(slot => {
      let row = `"${slot.start} - ${slot.end}"`;
      if (slot.type !== 'lesson') {
        const lbl = slot.type==='break'?'TENEFFÜS':slot.type==='lunch'?'ÖĞLE ARASI':'MOLA';
        row += sep + classes.map(()=>`"${lbl}"`).join(sep);
      } else {
        row += sep + classes.map(c => {
          const cell = (c.schedule||{})[slot.id];
          if (!cell) return '""';
          if (cell.activityId==='NO_CLASS') return '"DERS YOK"';
          return `"${cell.name} (${cell.lead})"`;
        }).join(sep);
      }
      csv += row + '\n';
    });
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`Ders_Programi_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    onNotify("Excel indirildi!");
  };

  const exportBackupJSON = () => {
    const blob = new Blob([JSON.stringify({activities,volunteers,timeSlots,classes},null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`ProkordiManager_Yedek_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    onNotify("Yedek indirildi!");
  };

  const handleImportBackup = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.classes && d.timeSlots) {
          setConfirmModal({
            isOpen:true, isDanger:true, title:'Yedeği Yükle',
            message:'Mevcut tüm veri silinip yedek yüklenecek. Emin misiniz?',
            onConfirm:() => {
              if (d.classes)    setClasses(d.classes);
              if (d.timeSlots)  setTimeSlots(d.timeSlots);
              if (d.activities) setActivities(d.activities);
              if (d.volunteers) { setVolunteers(d.volunteers); syncVolunteers(d.volunteers); }
              setHasDistributed(false); setConfirmModal({isOpen:false}); onNotify("Yedek yüklendi!");
            },
            onCancel:()=>setConfirmModal({isOpen:false})
          });
        }
      } catch { onNotify("Geçersiz dosya!"); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── EXCEL CSV IMPORT (program schedule) ─────────────────────────────────
  const handleExcelScheduleImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const text = ev.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { onNotify("Dosya boş veya hatalı!"); return; }

        // Parse header line to get class names
        const sep = lines[0].includes(';') ? ';' : ',';
        const parseCell = s => s.replace(/^"(.*)"$/, '$1').trim();
        const headers = lines[0].split(sep).map(parseCell);
        const classNames = headers.slice(1).filter(h => h && h !== '');

        // Create or match classes
        const newClasses = classNames.map(name => {
          const existing = classes.find(c => c.name === name);
          return existing || { id: uuid(), name, schedule: {} };
        });

        // Parse time slots from first column
        const newTimeSlots = [];
        const scheduleRows = [];

        lines.slice(1).forEach((line, rowIdx) => {
          const cells = line.split(sep).map(parseCell);
          const timeStr = cells[0];
          if (!timeStr) return;

          const timeMatch = timeStr.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
          if (!timeMatch) return;
          const [, start, end] = timeMatch;

          // Detect type from content
          const contents = cells.slice(1).map(c => c.toLowerCase());
          let type = 'lesson';
          if (contents.some(c => c.includes('teneffüs') || c.includes('mola') || c.includes('break'))) type = 'break';
          else if (contents.some(c => c.includes('öğle') || c.includes('yemek') || c.includes('lunch'))) type = 'lunch';

          const slotId = `imported_${rowIdx}`;
          newTimeSlots.push({ id: slotId, start, end, type });
          scheduleRows.push({ slotId, cells: cells.slice(1), type });
        });

        // Apply schedule to classes
        const updatedClasses = newClasses.map((cls, ci) => {
          const schedule = { ...(cls.schedule || {}) };
          scheduleRows.forEach(({ slotId, cells, type }) => {
            if (type !== 'lesson') return;
            const cellVal = cells[ci] || '';
            if (!cellVal || cellVal === '' || cellVal.toLowerCase().includes('teneffüs') || cellVal.toLowerCase().includes('mola') || cellVal.toLowerCase().includes('öğle')) return;
            if (cellVal.toLowerCase() === 'ders yok') {
              schedule[slotId] = { activityId:'NO_CLASS', name:'DERS YOK', cat:'none', isMust:false, lead:'-', leadId:'none', isLocked:true };
              return;
            }
            // Parse "Etkinlik Adı (Gönüllü Adı)" or just "Etkinlik Adı"
            const match = cellVal.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
            const actName  = match ? match[1].trim() : cellVal.trim();
            const leadName = match ? match[2].trim() : '';

            // Find or create activity
            let act = activities.find(a => a.name.toLowerCase() === actName.toLowerCase());
            if (!act) act = { id: uuid(), name: actName, cat: 'science', isMust: false, boxCount: 10, allowedGrades: [0,1,2,3,4,5,6,7,8] };

            // Find volunteer
            const lead = leadName ? volunteers.find(v => v.name.toLowerCase().includes(leadName.toLowerCase())) : null;

            schedule[slotId] = { activityId: act.id, name: act.name, cat: act.cat||'science', isMust: act.isMust||false, lead: lead?.name || leadName || '-', leadId: lead?.id || 'none', support: [] };
          });
          return { ...cls, schedule };
        });

        // Merge new activities if any
        const newActNames = new Set();
        updatedClasses.forEach(cls => Object.values(cls.schedule||{}).forEach(s => { if (s.name && s.name !== 'DERS YOK') newActNames.add(s.name); }));
        const mergedActivities = [...activities];
        newActNames.forEach(name => {
          if (!mergedActivities.find(a => a.name.toLowerCase() === name.toLowerCase())) {
            mergedActivities.push({ id: uuid(), name, cat:'science', isMust:false, boxCount:10, allowedGrades:[0,1,2,3,4,5,6,7,8] });
          }
        });

        setConfirmModal({
          isOpen:true, isDanger:false, title:'Excel Programı Yükle',
          message:`${newClasses.length} sınıf, ${newTimeSlots.length} zaman dilimi bulundu. Mevcut program güncellenecek.`,
          onConfirm:() => {
            setTimeSlots(newTimeSlots);
            setClasses(updatedClasses);
            setActivities(mergedActivities);
            setHasDistributed(true);
            setConfirmModal({isOpen:false});
            onNotify(`Excel programı yüklendi! (${updatedClasses.length} sınıf, ${newTimeSlots.length} slot)`);
          },
          onCancel:()=>setConfirmModal({isOpen:false}),
          confirmText:'Yükle'
        });
      } catch(err) { onNotify(`Excel okuma hatası: ${err.message}`); }
    };
    reader.readAsText(file, 'utf-8');
    if (excelRef.current) excelRef.current.value = '';
  };

  // ── DRAG & DROP ─────────────────────────────────────────────────────────
  const handleDragStart = (e, clsId, slotId, data) => { if (data && !data.isLocked) dragItem.current = {clsId,slotId,data}; };
  const handleDrop = (e, targetClsId, targetSlotId) => {
    e.preventDefault();
    const src = dragItem.current;
    if (!src || (src.clsId===targetClsId && src.slotId===targetSlotId)) return;
    if (timeSlots.find(t=>t.id===targetSlotId)?.type !== 'lesson') return;
    const copy = JSON.parse(JSON.stringify(classes));
    const sC = copy.find(c=>c.id===src.clsId);
    const tC = copy.find(c=>c.id===targetClsId);
    if (tC.schedule[targetSlotId]?.isLocked || sC.schedule[src.slotId]?.isLocked) { onNotify("Kilitli alanlar taşınamaz!"); return; }
    const sD = sC.schedule[src.slotId];
    const tD = tC.schedule[targetSlotId];
    delete sC.schedule[src.slotId];
    tC.schedule[targetSlotId] = sD;
    if (tD) sC.schedule[src.slotId] = tD;
    setClasses(copy);
  };

  const handleSlotClick = (clsId, slotId, data) => {
    if (timeSlots.find(t=>t.id===slotId)?.type !== 'lesson') return;
    setEditingSlot({ clsId, slotId, data: data ? {...data, support: data.support||[]} : {name:'',activityId:'',lead:'',leadId:'',support:[]} });
  };

  const saveSlotEdit = () => {
    if (!editingSlot) return;
    let { activityId, name:actName, leadId } = editingSlot.data;
    if (actName && !activities.find(a=>a.id===activityId) && activityId!=='delete' && activityId!=='NO_CLASS') {
      const newAct = { id:uuid(), name:actName, cat:'science', isMust:false, boxCount:20, allowedGrades:[] };
      activityId = newAct.id;
      setActivities(prev=>[...prev,newAct]);
      onNotify(`"${actName}" yeni etkinlik olarak eklendi.`);
      if (leadId && leadId !== 'none')
        setVolunteers(prev=>prev.map(v=>v.id===leadId&&!v.capabilities.includes(newAct.id)?{...v,capabilities:[...v.capabilities,newAct.id]}:v));
    }
    setClasses(prev=>prev.map(c=>{
      if (c.id!==editingSlot.clsId) return c;
      const sch = {...(c.schedule||{})};
      if (activityId==='delete') delete sch[editingSlot.slotId];
      else sch[editingSlot.slotId] = {...editingSlot.data, activityId, name:actName};
      return {...c, schedule:sch};
    }));
    setEditingSlot(null);
  };

  const markAsNoClass = () => {
    if (!editingSlot) return;
    setClasses(prev=>prev.map(c=>{
      if (c.id!==editingSlot.clsId) return c;
      return {...c, schedule:{...(c.schedule||{}),[editingSlot.slotId]:{activityId:'NO_CLASS',name:'DERS YOK',cat:'none',isMust:false,lead:'-',leadId:'none',isLocked:true}}};
    }));
    setEditingSlot(null); onNotify("Bu saat kapatıldı.");
  };
  const markAllAsNoClass = () => {
    if (!editingSlot) return;
    setClasses(prev=>prev.map(c=>({...c,schedule:{...(c.schedule||{}),[editingSlot.slotId]:{activityId:'NO_CLASS',name:'DERS YOK',cat:'none',isMust:false,lead:'-',leadId:'none',isLocked:true}}})));
    setEditingSlot(null); onNotify("Bu saat tüm sınıflara kapatıldı.");
  };

  // ── AI ACTION HANDLER ────────────────────────────────────────────────────
  const handleAIAction = useCallback((action) => {
    switch (action.type) {
      case 'add_volunteer': {
        if (!action.name) break;
        const newV = { id:uuid(), name:action.name, capabilities:action.capabilities||[] };
        setVolunteers(prev=>{ const u=[...prev,newV]; syncVolunteers(u); return u; });
        onNotify(`Gönüllü eklendi: ${action.name}`);
        break;
      }
      case 'remove_volunteer': {
        if (!action.id) break;
        setVolunteers(prev=>{ const u=prev.filter(v=>v.id!==action.id); syncVolunteers(u); return u; });
        onNotify("Gönüllü silindi.");
        break;
      }
      case 'update_volunteer_caps': {
        if (!action.id) break;
        setVolunteers(prev=>{const u=prev.map(v=>v.id===action.id?{...v,capabilities:action.capabilities||[]}:v);syncVolunteers(u);return u;});
        onNotify("Gönüllü yetkinlikleri güncellendi.");
        break;
      }
      case 'assign_volunteer_activity': {
        // Find volunteer by name, find activity by name, add capability
        const vol = volunteers.find(v=>v.name.toLowerCase().includes((action.volunteerName||'').toLowerCase()));
        const act = activities.find(a=>a.name.toLowerCase().includes((action.activityName||'').toLowerCase()));
        if (vol && act) {
          setVolunteers(prev=>{const u=prev.map(v=>v.id===vol.id&&!v.capabilities.includes(act.id)?{...v,capabilities:[...v.capabilities,act.id]}:v);syncVolunteers(u);return u;});
          onNotify(`${vol.name} → "${act.name}" atandı.`);
        } else { onNotify(`⚠️ Gönüllü veya etkinlik bulunamadı: ${action.volunteerName} / ${action.activityName}`); }
        break;
      }
      case 'add_activity': {
        if (!action.name) break;
        setActivities(prev=>[...prev,{id:uuid(),name:action.name,cat:'science',isMust:!!action.isMust,boxCount:action.boxCount||1,allowedGrades:action.allowedGrades||[0,1,2,3,4,5,6,7,8]}]);
        onNotify(`Etkinlik eklendi: ${action.name}`);
        break;
      }
      case 'remove_activity': {
        if (!action.id) break;
        setActivities(prev=>prev.filter(a=>a.id!==action.id));
        onNotify("Etkinlik silindi.");
        break;
      }
      case 'update_activity': {
        if (!action.id) break;
        setActivities(prev=>prev.map(a=>a.id===action.id?{...a,...(action.name&&{name:action.name}),...(action.isMust!==undefined&&{isMust:action.isMust}),...(action.boxCount&&{boxCount:action.boxCount})}:a));
        onNotify("Etkinlik güncellendi.");
        break;
      }
      case 'add_class': {
        if (!action.name) break;
        setClasses(prev=>[...prev,{id:uuid(),name:action.name,schedule:{}}]);
        onNotify(`Sınıf eklendi: ${action.name}`);
        break;
      }
      case 'remove_class': {
        if (!action.id) break;
        setClasses(prev=>prev.filter(c=>c.id!==action.id));
        onNotify("Sınıf silindi.");
        break;
      }
      case 'distribute':
        distributePerfectly();
        break;
      case 'clear_schedule':
        setClasses(prev=>prev.map(c=>({...c,schedule:{}})));
        setHasDistributed(false);
        onNotify("Program sıfırlandı.");
        break;
      case 'clear_non_mandatory':
        setClasses(prev=>prev.map(c=>({...c,schedule:Object.fromEntries(Object.entries(c.schedule||{}).filter(([,s])=>s.isMust||s.activityId==='NO_CLASS'))})));
        onNotify("Zorunlu olmayanlar silindi.");
        break;
      case 'update_slot': {
        // { classId, slotId, activityId, activityName, leadId, leadName }
        const targetClass = classes.find(c=>c.id===action.classId||c.name===action.className);
        if (!targetClass) { onNotify(`⚠️ Sınıf bulunamadı: ${action.classId||action.className}`); break; }
        let actId = action.activityId;
        let actName = action.activityName;
        if (!actId && actName) {
          const act = activities.find(a=>a.name.toLowerCase().includes(actName.toLowerCase()));
          if (act) actId = act.id; else { const nA={id:uuid(),name:actName,cat:'science',isMust:false,boxCount:10,allowedGrades:[0,1,2,3,4,5,6,7,8]}; setActivities(prev=>[...prev,nA]); actId=nA.id; }
        }
        let leadId = action.leadId;
        let leadName = action.leadName || '-';
        if (!leadId && action.leadName) {
          const vol = volunteers.find(v=>v.name.toLowerCase().includes(action.leadName.toLowerCase()));
          if (vol) { leadId=vol.id; leadName=vol.name; }
        }
        setClasses(prev=>prev.map(c=>{
          if (c.id!==targetClass.id) return c;
          const sch={...(c.schedule||{})};
          sch[action.slotId]={activityId:actId||'',name:actName||'',cat:'science',isMust:false,lead:leadName,leadId:leadId||'none',support:[]};
          return {...c,schedule:sch};
        }));
        onNotify(`Slot güncellendi: ${targetClass.name} → ${actName}`);
        break;
      }
      case 'delete_slot': {
        const tCls = classes.find(c=>c.id===action.classId||c.name===action.className);
        if (!tCls) break;
        setClasses(prev=>prev.map(c=>{
          if (c.id!==tCls.id) return c;
          const sch={...(c.schedule||{})}; delete sch[action.slotId]; return {...c,schedule:sch};
        }));
        onNotify("Slot silindi.");
        break;
      }
      case 'load_template':
        setTimeSlots([
          {id:'t1',start:'09:00',end:'09:40',type:'lesson'},{id:'t2',start:'09:40',end:'09:55',type:'break'},
          {id:'t3',start:'09:55',end:'10:35',type:'lesson'},{id:'t4',start:'10:35',end:'10:50',type:'break'},
          {id:'t5',start:'10:50',end:'11:30',type:'lesson'},{id:'t6',start:'11:30',end:'12:30',type:'lunch'},
          {id:'t7',start:'12:30',end:'13:10',type:'lesson'},{id:'t8',start:'13:10',end:'13:25',type:'break'},
          {id:'t9',start:'13:25',end:'14:05',type:'lesson'}
        ]);
        onNotify("Şablon yüklendi.");
        break;
      case 'add_timeslot': {
        const dur = action.duration||40; const typ = action.slotType||'lesson';
        const last = timeSlots.length>0 ? timeSlots[timeSlots.length-1].end : '09:00';
        let [h,m] = last.split(':').map(Number); m+=dur; h+=Math.floor(m/60); m=m%60;
        setTimeSlots(prev=>[...prev,{id:uuid(),start:last,end:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,type:typ}]);
        onNotify("Zaman dilimi eklendi.");
        break;
      }
      default: break;
    }
  }, [activities, volunteers, classes, timeSlots, distributePerfectly]);

  const appState = { activities, volunteers, classes, timeSlots };

  // ── OTOMATİK PROGRAM OLUŞTUR ─────────────────────────────────────────────
  const autoGenerateProgram = useCallback(() => {
    if (aiState==='processing') return;
    setAiState('processing'); setAutoGenStep('Hazırlanıyor…');
    setTimeout(() => {
      const finalClasses = classes.length > 0 ? classes
        : ['Ana Sınıfı','1-A','1-B','2-A','2-B','3-A','3-B','4-A','4-B'].map(n=>({id:uuid(),name:n,schedule:{}}));
      const defaultActs = [
        {name:'Origami',isMust:false,boxCount:10,allowedGrades:[0,1,2,3,4]},
        {name:'Yaratıcı Drama',isMust:true,boxCount:8,allowedGrades:[0,1,2,3,4,5,6,7,8]},
        {name:'Resim',isMust:false,boxCount:12,allowedGrades:[0,1,2,3,4,5,6,7,8]},
        {name:'Müzik',isMust:true,boxCount:8,allowedGrades:[0,1,2,3,4,5,6,7,8]},
        {name:'Yüz Boyama',isMust:false,boxCount:6,allowedGrades:[0,1,2,3,4]},
        {name:'Kimya Deneyleri',isMust:false,boxCount:4,allowedGrades:[4,5,6,7,8]},
        {name:'Fizik Deneyleri',isMust:false,boxCount:4,allowedGrades:[5,6,7,8]},
        {name:'Robotik',isMust:false,boxCount:3,allowedGrades:[5,6,7,8]},
        {name:'Masa Deneyleri',isMust:false,boxCount:6,allowedGrades:[4,5,6,7,8]},
        {name:'Pino Mino',isMust:false,boxCount:5,allowedGrades:[0,1,2,3,4]},
      ].map(d=>({id:uuid(),cat:'science',...d}));
      const finalActivities = activities.length>0 ? activities : defaultActs;
      const defaultSlots = [
        {id:'t1',start:'09:00',end:'09:40',type:'lesson'},{id:'t2',start:'09:40',end:'09:55',type:'break'},
        {id:'t3',start:'09:55',end:'10:35',type:'lesson'},{id:'t4',start:'10:35',end:'10:50',type:'break'},
        {id:'t5',start:'10:50',end:'11:30',type:'lesson'},{id:'t6',start:'11:30',end:'12:30',type:'lunch'},
        {id:'t7',start:'12:30',end:'13:10',type:'lesson'},{id:'t8',start:'13:10',end:'13:25',type:'break'},
        {id:'t9',start:'13:25',end:'14:05',type:'lesson'},
      ];
      const finalSlots = timeSlots.length>0 ? timeSlots : defaultSlots;

      setClasses(finalClasses); setActivities(finalActivities); setTimeSlots(finalSlots);
      setHasDistributed(true); setAutoGenStep('Dağıtılıyor…');

      setTimeout(() => {
        const lessonSlots = finalSlots.filter(t=>t.type==='lesson');
        if (!lessonSlots.length||!finalClasses.length||!finalActivities.length||!volunteers.length) {
          setAiState('idle'); setAutoGenStep('');
          onNotify(volunteers.length===0?'⚠️ Gönüllü eklenmemiş — önce Gönüllüler sekmesinden ekleyin.':'⚠️ Program oluşturulamadı.'); return;
        }
        const volLoad = {};
        volunteers.forEach(v=>{volLoad[v.id]=0;});
        const getTotalUsage=(actId,allCls)=>{let n=0;allCls.forEach(c=>Object.values(c.schedule||{}).forEach(s=>{if(s.activityId===actId)n++;}));return n;};
        const isInClass=(actId,cls)=>Object.values(cls.schedule||{}).some(s=>s.activityId===actId);
        const findLead=(actId,slotId,clsId,allCls)=>{
          const act=finalActivities.find(a=>a.id===actId);
          if(getTotalUsage(actId,allCls)>=(act?.boxCount||99))return null;
          const capable=volunteers.filter(v=>v.capabilities.includes(actId));
          const available=capable.filter(v=>!allCls.some(c=>c.id!==clsId&&(c.schedule||{})[slotId]?.leadId===v.id));
          if(!available.length)return null;
          available.sort((a,b)=>((volLoad[a.id]||0)-(volLoad[b.id]||0))||(a.capabilities.length-b.capabilities.length));
          return available[0];
        };
        const runOnce=()=>{
          const nc=JSON.parse(JSON.stringify(finalClasses));
          nc.forEach(c=>{Object.keys(c.schedule||{}).forEach(s=>{if(!(c.schedule[s]||{}).isLocked)delete c.schedule[s];});});
          const mustActs=finalActivities.filter(a=>a.isMust);
          const optActs=finalActivities.filter(a=>!a.isMust);
          const shuffled=[...nc].sort(()=>Math.random()-.5);
          shuffled.forEach(cls=>{
            const free=[...lessonSlots].filter(s=>!(cls.schedule||{})[s.id]).sort(()=>Math.random()-.5);
            mustActs.forEach(must=>{
              if(!checkConstraints(must,cls.name)||isInClass(must.id,cls))return;
              for(let i=0;i<free.length;i++){const lead=findLead(must.id,free[i].id,cls.id,nc);if(lead){nc.find(c=>c.id===cls.id).schedule[free[i].id]={activityId:must.id,name:must.name,isMust:true,lead:lead.name,leadId:lead.id,support:[]};volLoad[lead.id]=(volLoad[lead.id]||0)+1;free.splice(i,1);break;}}
            });
          });
          nc.forEach(cls=>{lessonSlots.forEach(s=>{if((cls.schedule||{})[s.id])return;const cands=optActs.filter(a=>checkConstraints(a,cls.name)&&!isInClass(a.id,cls)).sort(()=>Math.random()-.5);for(const act of cands){const lead=findLead(act.id,s.id,cls.id,nc);if(lead){cls.schedule[s.id]={activityId:act.id,name:act.name,isMust:false,lead:lead.name,leadId:lead.id,support:[]};volLoad[lead.id]=(volLoad[lead.id]||0)+1;break;}}});});
          let filled=0;nc.forEach(c=>lessonSlots.forEach(s=>{if((c.schedule||{})[s.id])filled++;}));
          return{classes:nc,score:filled};
        };
        let best=null;
        for(let i=0;i<5;i++){const r=runOnce();if(!best||r.score>best.score)best=r;if(best.score===finalClasses.length*lessonSlots.length)break;}
        setClasses(best.classes); setAiState('idle'); setAutoGenStep('');
        onNotify(`✨ Program hazır! (${best.score} slot dolduruldu)`);
      }, 200);
    }, 80);
  }, [aiState, classes, activities, timeSlots, volunteers, checkConstraints, onNotify]);

  // ── RENDER ───────────────────────────────────────────────────────────────
  const cardCls = `rounded-2xl border shadow-sm p-4 animate-fadeIn dk-card dk-border`;
  const inputCls = `border rounded-xl px-4 py-2.5 text-sm font-500 flex-1 outline-none transition-colors dk-input dk-border`;
  const btnPrim = `bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-700 hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-all active:scale-95`;

  return (
    <div className="space-y-4 relative">
      <style>{`
        .slot-quick-edit { position:relative; }
        .slot-quick-edit:hover .slot-overlay { opacity:1; }
        .slot-overlay { opacity:0; transition:opacity .15s; }
      `}</style>
      <ConfirmModal {...confirmModal} dark={dark}/>

      {/* Sub-nav */}
      <div className={`rounded-2xl border shadow-sm p-3 no-print flex flex-wrap gap-2 items-center dk-card dk-border`}>
        <NavBtn dark={dark} active={activeView==='view'}       onClick={()=>setActiveView('view')}       icon={<Calendar size={15}/>}      label="Program"/>
        <NavBtn dark={dark} active={activeView==='setup'}      onClick={()=>setActiveView('setup')}      icon={<BookOpen size={15}/>}      label="Sınıf & Zaman"/>
        <NavBtn dark={dark} active={activeView==='activities'} onClick={()=>setActiveView('activities')} icon={<Package size={15}/>}       label="Etkinlikler"/>
        <NavBtn dark={dark} active={activeView==='volunteers'} onClick={()=>setActiveView('volunteers')} icon={<GraduationCap size={15}/>}  label="Gönüllüler"/>
        <div className="flex-1"/>
        {activeView === 'view' && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportToExcelCSV} className="flex items-center gap-1.5 px-3 py-2 text-xs font-600 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
              <Download size={13}/> Excel
            </button>
            <button onClick={exportBackupJSON} className="flex items-center gap-1.5 px-3 py-2 text-xs font-600 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              <Download size={13}/> Yedek
            </button>
            <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-600 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
              <UploadCloud size={13}/> Yedek Yükle
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportBackup}/>
            </label>
            <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-600 text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer">
              <FileSpreadsheet size={13}/> Excel Program Yükle
              <input type="file" accept=".csv,.txt" className="hidden" ref={excelRef} onChange={handleExcelScheduleImport}/>
            </label>
          </div>
        )}
      </div>

      {/* ── VIEW: Program ── */}
      {activeView === 'view' && (
        <>
          {/* AI Chat */}
          <BalkizAIChat appState={appState} onAction={handleAIAction} warnings={warnings} dark={dark}/>

          {/* Action bar */}
          <div className={`no-print flex flex-wrap gap-2 items-center rounded-2xl border p-3 shadow-sm dk-card dk-border`}>
            {/* Otomatik Oluştur */}
            <button onClick={autoGenerateProgram} disabled={aiState==='processing'||!!autoGenStep}
              title="Tüm verilerle program oluştur — AI prompt gerekmez"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-700 text-white shadow-sm transition-all active:scale-95 disabled:opacity-60"
              style={{ background:autoGenStep?'linear-gradient(135deg,#f59e0b,#f97316)':'linear-gradient(135deg,#10b981,#059669)', boxShadow:autoGenStep?'0 2px 12px rgba(245,158,11,.35)':'0 2px 12px rgba(16,185,129,.35)' }}>
              {autoGenStep ? <><RefreshCw size={15} style={{animation:'spinSlow .8s linear infinite'}}/>{autoGenStep}</> : <><Zap size={15}/> Otomatik Program Oluştur</>}
            </button>

            {/* B.A.L.K.I.Z. Dağıt */}
            <button onClick={distributePerfectly} disabled={aiState==='processing'||!!autoGenStep}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-700 text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition-all active:scale-95 disabled:opacity-60">
              {aiState==='processing' ? <><RefreshCw size={15} className="animate-spin"/> İşleniyor…</> : <><Wand2 size={15}/> B.A.L.K.I.Z. Dağıtımı</>}
            </button>

            {/* Sıfırla seçenekleri */}
            <div className="flex gap-2 ml-auto">
              <button onClick={()=>setConfirmModal({isOpen:true,isDanger:true,title:'Zorunlu Olmayanları Sil',
                message:'Zorunlu (must) olmayan tüm atamalar silinecek.',
                onConfirm:()=>{setClasses(prev=>prev.map(c=>({...c,schedule:Object.fromEntries(Object.entries(c.schedule||{}).filter(([,s])=>s.isMust||s.activityId==='NO_CLASS'))}))); setConfirmModal({isOpen:false}); onNotify("Zorunlu olmayanlar silindi."); },
                onCancel:()=>setConfirmModal({isOpen:false}),confirmText:'Sil'})}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-600 text-orange-500 bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors">
                <Star size={13}/> Sadece Zorunluları Bırak
              </button>
              <button onClick={()=>setConfirmModal({isOpen:true,isDanger:true,title:'Tüm Programı Sıfırla',
                message:'Tüm sınıf programları tamamen silinecek.',
                onConfirm:()=>{setClasses(prev=>prev.map(c=>({...c,schedule:{}}))); setHasDistributed(false); setConfirmModal({isOpen:false}); onNotify("Program sıfırlandı."); },
                onCancel:()=>setConfirmModal({isOpen:false}),confirmText:'Sıfırla'})}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-600 text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
                <Trash2 size={14}/> Tüm Programı Sıfırla
              </button>
            </div>
          </div>

          {/* Schedule Table */}
          <div className={`rounded-2xl border shadow-sm overflow-x-auto print:shadow-none print:border-none print:rounded-none dk-card dk-border`}>
            {classes.length === 0 || timeSlots.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={40} className="mx-auto mb-4 text-slate-300"/>
                <p className="text-sm font-600 dk-text-muted mb-2">Program Henüz Oluşturulmadı</p>
                <p className="text-xs dk-text-muted mb-5">Sınıf & Zaman sekmesinden ayar yapın veya otomatik oluşturun.</p>
                <button onClick={autoGenerateProgram} disabled={aiState==='processing'}
                  className="mx-auto flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-700 text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95">
                  <Zap size={16}/> Otomatik Program Oluştur
                </button>
              </div>
            ) : (
              <table className="excel-table">
                <thead>
                  <tr>
                    <th className="p-3 text-center w-24" style={{ borderRight:'2px solid #475569', borderBottom:'2px solid #475569' }}>
                      <span className="text-[10px] font-700 dk-text-muted uppercase tracking-wider">Saat</span>
                    </th>
                    {classes.map(c=>(
                      <th key={c.id} className="p-2 text-center relative group" style={{ borderBottom:'2px solid #475569', minWidth:120 }}>
                        <span className="text-sm font-700 dk-text">{c.name}</span>
                        <button onClick={()=>setConfirmModal({isOpen:true,isDanger:true,title:`${c.name} Temizle`,
                          message:`${c.name} sınıfının tüm atamaları silinecek.`,
                          onConfirm:()=>{setClasses(prev=>prev.map(x=>x.id===c.id?{...x,schedule:{}}:x));setConfirmModal({isOpen:false});onNotify(`${c.name} temizlendi.`);},
                          onCancel:()=>setConfirmModal({isOpen:false})})}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-50 text-red-400 hover:text-red-600 p-1 rounded-md transition-all no-print">
                          <Trash2 size={11}/>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(slot=>(
                    <tr key={slot.id}>
                      <td className="p-2 text-center align-middle font-mono text-[11px] font-500 dk-text-muted dk-card-inner" style={{ borderRight:'2px solid #475569', minWidth:90 }}>
                        <div className="font-700">{slot.start}</div>
                        <div className="text-slate-300 text-[9px]">—</div>
                        <div>{slot.end}</div>
                        {slot.type!=='lesson' && <div className="text-[9px] font-700 text-indigo-400 mt-0.5 uppercase tracking-wider">{slot.type==='break'?'MOLA':slot.type==='lunch'?'YEMEK':'—'}</div>}
                      </td>
                      {slot.type !== 'lesson' ? (
                        <td colSpan={classes.length} className="p-3 text-center bg-stripes">
                          <span className="text-[11px] font-700 tracking-widest dk-text-muted uppercase">
                            {slot.type==='break'?'🔔 Teneffüs':slot.type==='lunch'?'🍽️ Öğle Arası':'Mola'}
                          </span>
                        </td>
                      ) : (
                        classes.map(cls=>{
                          const cell = (cls.schedule||{})[slot.id];
                          const isNoClass = cell?.activityId==='NO_CLASS';
                          return (
                            <td key={cls.id} className="p-1 align-top" style={{ height:88 }}
                              onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e,cls.id,slot.id)}>
                              {cell ? (
                                <div draggable={!isNoClass} onDragStart={e=>handleDragStart(e,cls.id,slot.id,cell)}
                                  onClick={()=>handleSlotClick(cls.id,slot.id,cell)}
                                  className={`h-full p-2 rounded-xl cursor-pointer flex flex-col justify-between transition-all hover:brightness-95 active:scale-[.98] select-none
                                    ${isNoClass?'slot-cell-noclass items-center justify-center':cell.isMust?'slot-cell-must':'slot-cell-opt'}`}>
                                  <div className={`text-[11px] font-700 leading-tight dk-text ${isNoClass?'dk-text-muted text-center text-[10px] uppercase tracking-wider':''}`}>
                                    {cell.name}
                                    {cell.isMust && !isNoClass && <span className="text-rose-500 ml-1 text-[9px]">★</span>}
                                  </div>
                                  {!isNoClass && (
                                    <div className="text-[10px] font-500 text-slate-500 truncate flex items-center gap-1 mt-1">
                                      <span className="w-3.5 h-3.5 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center text-[8px] shrink-0">👤</span>
                                      <span className="truncate">{cell.lead}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div onClick={()=>handleSlotClick(cls.id,slot.id,null)}
                                  className="h-full flex items-center justify-center slot-cell-empty cursor-pointer transition-all rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 no-print">
                                  <Plus size={18} className="text-slate-300 hover:text-indigo-400" strokeWidth={2.5}/>
                                </div>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                  {timeSlots.length===0 && (
                    <tr><td colSpan={classes.length+1} className="p-12 text-center text-sm dk-text-muted font-500">
                      Program boş. <strong>Sınıf & Zaman</strong> sekmesinden ayar yapın.
                    </td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── VIEW: Gönüllüler ── */}
      {activeView === 'volunteers' && (
        <div className={`${cardCls} p-6 animate-fadeIn`}>
          <h3 className="text-lg font-700 dk-text flex items-center gap-2 mb-5">
            <Users size={20} className="text-indigo-600"/> Gönüllü Yönetimi
            <span className="ml-1 text-sm font-500 dk-text-muted">{volunteers.length} kişi</span>
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            <input type="text" id="newVol" placeholder="Ad Soyad" onKeyDown={e=>{
              if(e.key==='Enter'&&e.target.value.trim()){const u=[...volunteers,{id:uuid(),name:e.target.value.trim(),capabilities:[]}];setVolunteers(u);syncVolunteers(u);e.target.value='';onNotify("Eklendi.");}
            }} className={inputCls}/>
            <button onClick={()=>{const el=document.getElementById('newVol');const v=el.value.trim();if(v){const u=[...volunteers,{id:uuid(),name:v,capabilities:[]}];setVolunteers(u);syncVolunteers(u);el.value='';onNotify("Eklendi.");}}} className={btnPrim}>
              <Plus size={16}/> Ekle
            </button>
            <button onClick={()=>setBulkModalOpen(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-700 hover:bg-emerald-700 flex items-center gap-2 transition-colors shadow-sm">
              <Users size={16}/> Toplu Ekle
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {volunteers.map(vol=>(
              <div key={vol.id} className="dk-card-inner border dk-border rounded-2xl p-4 flex flex-col gap-3 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <input value={vol.name} onChange={e=>{const u=volunteers.map(v=>v.id===vol.id?{...v,name:e.target.value}:v);setVolunteers(u);syncVolunteers(u);}}
                    className="font-700 text-sm dk-text bg-transparent border-b-2 border-transparent focus:border-indigo-300 outline-none flex-1 transition-colors"/>
                  <button onClick={()=>setConfirmModal({isOpen:true,isDanger:true,title:'Gönüllüyü Sil',message:`${vol.name} silinecek.`,
                    onConfirm:()=>{const u=volunteers.filter(v=>v.id!==vol.id);setVolunteers(u);syncVolunteers(u);setConfirmModal({isOpen:false});onNotify("Silindi.");},
                    onCancel:()=>setConfirmModal({isOpen:false})})} className="text-slate-300 hover:text-red-400 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
                <div className="text-[10px] font-700 dk-text-muted uppercase tracking-widest mb-1">
                  Yetkinlikler ({vol.capabilities.length}/{activities.length})
                </div>
                <div className="max-h-44 overflow-y-auto custom-scroll grid gap-1 pr-1">
                  {activities.map(act=>(
                    <label key={act.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all
                      ${vol.capabilities.includes(act.id)?'bg-indigo-50 border-indigo-200 text-indigo-700 font-600 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300':'bg-white border-slate-100 text-slate-500 hover:border-slate-200 font-400 dk-card-inner dk-border'}`}>
                      <input type="checkbox" className="hidden" checked={vol.capabilities.includes(act.id)} onChange={()=>{
                        const u=volunteers.map(v=>{if(v.id!==vol.id)return v;const caps=v.capabilities.includes(act.id)?v.capabilities.filter(i=>i!==act.id):[...v.capabilities,act.id];return{...v,capabilities:caps};});
                        setVolunteers(u);syncVolunteers(u);
                      }}/>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${vol.capabilities.includes(act.id)?'bg-indigo-600 border-indigo-600 text-white':'bg-white border-slate-300'}`}>
                        {vol.capabilities.includes(act.id)&&<CheckCircle2 size={10} strokeWidth={3}/>}
                      </div>
                      {act.name} {act.isMust && <Star size={9} className="text-rose-400 ml-auto shrink-0"/>}
                    </label>
                  ))}
                  {activities.length===0&&<span className="text-xs dk-text-muted italic">Önce etkinlik ekleyin.</span>}
                </div>
                <div className="text-[10px] dk-text-muted">
                  Atandığı dersler: <span className="font-600 text-indigo-500">{classes.reduce((sum,c)=>sum+Object.values(c.schedule||{}).filter(s=>s.leadId===vol.id).length,0)}</span>
                </div>
              </div>
            ))}
            {volunteers.length===0 && <div className="col-span-full py-12 text-center text-sm dk-text-muted border-2 border-dashed dk-border rounded-2xl">Henüz gönüllü eklenmemiş.</div>}
          </div>
        </div>
      )}

      {/* ── VIEW: Etkinlikler ── */}
      {activeView === 'activities' && (
        <div className={`${cardCls} p-6 animate-fadeIn`}>
          <h3 className="text-lg font-700 dk-text flex items-center gap-2 mb-5">
            <Package size={20} className="text-indigo-600"/> Etkinlik Kataloğu
            <span className="ml-1 text-sm font-500 dk-text-muted">{activities.length} etkinlik</span>
          </h3>
          <div className="flex flex-wrap gap-2 mb-6 dk-card-inner p-3 rounded-xl border dk-border">
            <input type="text" id="newActName" placeholder="Etkinlik adı…" className={`${inputCls} min-w-40`}/>
            <div className="flex items-center gap-2 dk-card px-3 py-2 rounded-xl border dk-border">
              <span className="text-[10px] font-700 dk-text-muted uppercase">Kutu</span>
              <input type="number" id="newActBox" defaultValue={1} min="1" max="99" className="w-10 font-700 text-sm text-indigo-600 outline-none text-center bg-transparent"/>
            </div>
            <label className="flex items-center gap-2 dk-card px-3 py-2 rounded-xl border dk-border cursor-pointer select-none">
              <input type="checkbox" id="newActMust" className="accent-indigo-600"/>
              <span className="text-xs font-700 dk-text">Zorunlu ⭐</span>
            </label>
            <button onClick={()=>{
              const n=document.getElementById('newActName'),b=document.getElementById('newActBox'),m=document.getElementById('newActMust');
              const v=n.value.trim();
              if(v){setActivities(prev=>[...prev,{id:uuid(),name:v,cat:'science',isMust:m.checked,boxCount:Number(b.value)||1,allowedGrades:[0,1,2,3,4,5,6,7,8]}]);n.value='';b.value=1;m.checked=false;onNotify("Etkinlik eklendi.");}
            }} className={btnPrim}>
              <Plus size={16}/> Ekle
            </button>
          </div>
          <div className="space-y-3">
            {activities.map(act=>(
              <div key={act.id} className="dk-card-inner border dk-border rounded-xl p-4 flex flex-col xl:flex-row gap-3 items-start xl:items-center hover:border-indigo-200 transition-colors">
                <input value={act.name} onChange={e=>setActivities(prev=>prev.map(a=>a.id===act.id?{...a,name:e.target.value}:a))}
                  className="font-700 text-sm dk-text bg-transparent border-b-2 border-transparent focus:border-indigo-300 outline-none w-full xl:w-48 transition-colors"/>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 dk-card px-3 py-1.5 rounded-lg border dk-border">
                    <span className="text-[10px] font-700 dk-text-muted">Kutu</span>
                    <input type="number" min="1" value={act.boxCount||1} onChange={e=>setActivities(prev=>prev.map(a=>a.id===act.id?{...a,boxCount:Number(e.target.value)}:a))} className="w-10 text-center text-sm font-700 text-slate-700 outline-none bg-transparent"/>
                  </div>
                  <label className="flex items-center gap-1.5 dk-card px-3 py-1.5 rounded-lg border dk-border cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={act.isMust||false} onChange={e=>setActivities(prev=>prev.map(a=>a.id===act.id?{...a,isMust:e.target.checked}:a))} className="accent-indigo-600"/>
                    <span className="text-[10px] font-700 dk-text">Zorunlu</span>
                  </label>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[0,1,2,3,4,5,6,7,8].map(g=>{
                      const sel=(act.allowedGrades||[]).includes(g);
                      return <button key={g} onClick={()=>setActivities(prev=>prev.map(a=>{if(a.id!==act.id)return a;const gr=a.allowedGrades||[];return{...a,allowedGrades:gr.includes(g)?gr.filter(x=>x!==g):[...gr,g]};}))}
                        className={`w-8 h-8 rounded-lg text-[11px] font-700 transition-all active:scale-95 ${sel?'bg-indigo-600 text-white shadow-sm':'dk-card border dk-border dk-text-muted hover:border-indigo-300'}`}>
                        {g===0?'A':g}
                      </button>;
                    })}
                  </div>
                </div>
                <button onClick={()=>setConfirmModal({isOpen:true,isDanger:true,title:'Etkinliği Sil',message:`"${act.name}" silinecek. Atandığı tüm slotlar da temizlenecek.`,
                  onConfirm:()=>{
                    setActivities(prev=>prev.filter(a=>a.id!==act.id));
                    setClasses(prev=>prev.map(c=>({...c,schedule:Object.fromEntries(Object.entries(c.schedule||{}).filter(([,s])=>s.activityId!==act.id))})));
                    setConfirmModal({isOpen:false});onNotify("Silindi.");
                  },
                  onCancel:()=>setConfirmModal({isOpen:false})})} className="ml-auto dk-text-muted hover:text-red-400 p-2 rounded-xl border dk-border hover:border-red-200 transition-colors dk-card">
                  <Trash2 size={15}/>
                </button>
              </div>
            ))}
            {activities.length===0 && <div className="py-12 text-center text-sm dk-text-muted border-2 border-dashed dk-border rounded-2xl">Etkinlik kataloğu boş.</div>}
          </div>
        </div>
      )}

      {/* ── VIEW: Setup ── */}
      {activeView === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fadeIn">
          {/* Sınıflar */}
          <div className={cardCls}>
            <h3 className="text-base font-700 dk-text flex items-center gap-2 mb-4"><BookOpen size={18} className="text-indigo-600"/> Şubeler</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Ana Sınıfı','1-A','1-B','2-A','2-B','3-A','3-B','4-A','4-B','5-A','5-B','6-A','6-B','7-A','7-B','8-A','8-B'].map(n=>{
                const sel=classes.find(c=>c.name===n);
                return <button key={n} onClick={()=>{if(sel)setClasses(prev=>prev.filter(c=>c.name!==n));else setClasses(prev=>[...prev,{id:uuid(),name:n,schedule:{}}]);}}
                  className={`px-3 py-1.5 rounded-lg text-xs font-700 border-2 transition-all active:scale-95 ${sel?'bg-indigo-600 border-indigo-600 text-white shadow-sm':'dk-card border dk-border dk-text-muted hover:border-indigo-300 hover:text-indigo-500'}`}>
                  {n}
                </button>;
              })}
            </div>
            <div className="flex gap-2 pt-4 border-t dk-border">
              <input type="text" id="newClass" placeholder="Özel sınıf (Örn: 9-C)" onKeyDown={e=>{
                if(e.key==='Enter'&&e.target.value.trim()){const v=e.target.value.trim();if(classes.find(c=>c.name===v))onNotify("Zaten var!");else{setClasses(prev=>[...prev,{id:uuid(),name:v,schedule:{}}]);e.target.value='';onNotify("Eklendi.");}}
              }} className={inputCls}/>
              <button onClick={()=>{const v=document.getElementById('newClass').value.trim();if(v&&!classes.find(c=>c.name===v)){setClasses(prev=>[...prev,{id:uuid(),name:v,schedule:{}}]);document.getElementById('newClass').value='';onNotify("Eklendi.");}}} className="bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-700 hover:bg-slate-700 transition-colors">Ekle</button>
            </div>
            {classes.length>0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {classes.map(c=>(
                  <span key={c.id} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-700">
                    {c.name}
                    <button onClick={()=>setClasses(prev=>prev.filter(x=>x.id!==c.id))} className="hover:text-red-500 transition-colors ml-1"><X size={10}/></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Zaman */}
          <div className={cardCls}>
            <h3 className="text-base font-700 dk-text flex items-center gap-2 mb-4"><Calendar size={18} className="text-indigo-600"/> Zaman Çizelgesi</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {[{l:'+30dk Ders',d:30,t:'lesson'},{l:'+40dk Ders',d:40,t:'lesson'},{l:'+60dk Ders',d:60,t:'lesson'},{l:'+15dk Mola',d:15,t:'break'},{l:'+45dk Yemek',d:45,t:'lunch'}].map(btn=>(
                <button key={btn.l} onClick={()=>{
                  const last=timeSlots.length>0?timeSlots[timeSlots.length-1].end:'09:00';
                  let [h,m]=last.split(':').map(Number);m+=btn.d;h+=Math.floor(m/60);m=m%60;
                  setTimeSlots(prev=>[...prev,{id:uuid(),start:last,end:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,type:btn.t}]);
                }} className="px-3 py-1.5 text-xs font-700 dk-card border dk-border rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors active:scale-95 dk-text">
                  {btn.l}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-4 dk-card-inner p-2 rounded-xl border dk-border">
              <input type="number" id="customMin" defaultValue={20} className="w-16 text-center text-sm font-700 dk-text dk-card border dk-border rounded-lg outline-none px-2 py-1.5"/>
              <select id="customType" className="text-sm font-500 dk-text flex-1 dk-card border dk-border rounded-lg outline-none px-2 cursor-pointer">
                <option value="lesson">📚 Ders</option><option value="break">🔔 Mola</option><option value="lunch">🍽️ Yemek</option><option value="presentation">🎤 Sunum</option>
              </select>
              <button onClick={()=>{
                const min=parseInt(document.getElementById('customMin').value)||20;
                const typ=document.getElementById('customType').value;
                const last=timeSlots.length>0?timeSlots[timeSlots.length-1].end:'09:00';
                let [h,m]=last.split(':').map(Number);m+=min;h+=Math.floor(m/60);m=m%60;
                setTimeSlots(prev=>[...prev,{id:uuid(),start:last,end:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,type:typ}]);
              }} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-700 hover:bg-indigo-700 transition-colors">Ekle</button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
              {timeSlots.map((slot,i)=>(
                <div key={slot.id} className={`flex gap-2 items-center p-2.5 rounded-xl border dk-border ${slot.type==='lesson'?'dk-card':'dk-card-inner'}`}>
                  <span className="text-[10px] font-700 dk-text-muted w-4 text-center">{i+1}</span>
                  <input type="time" value={slot.start} onChange={e=>{const n=[...timeSlots];n[i].start=e.target.value;setTimeSlots(n)}} className="font-mono text-sm font-500 dk-text bg-transparent outline-none w-20 focus:text-indigo-500"/>
                  <span className="dk-text-muted">—</span>
                  <input type="time" value={slot.end} onChange={e=>{const n=[...timeSlots];n[i].end=e.target.value;setTimeSlots(n)}} className="font-mono text-sm font-500 dk-text bg-transparent outline-none w-20 focus:text-indigo-500"/>
                  <select value={slot.type} onChange={e=>{const n=[...timeSlots];n[i].type=e.target.value;setTimeSlots(n)}} className="text-xs font-500 dk-text-muted bg-transparent outline-none flex-1 cursor-pointer">
                    <option value="lesson">📚 Ders</option><option value="break">🔔 Teneffüs</option><option value="lunch">🍽️ Yemek</option><option value="presentation">🎤 Sunum</option>
                  </select>
                  <button onClick={()=>{const n=[...timeSlots];n.splice(i,1);setTimeSlots(n)}} className="dk-text-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13}/></button>
                </div>
              ))}
              {timeSlots.length===0 && <div className="text-center text-sm dk-text-muted py-6 border-2 border-dashed dk-border rounded-xl">Henüz saat yok.</div>}
            </div>
            {timeSlots.length===0 && (
              <button onClick={()=>setConfirmModal({isOpen:true,title:'Şablon Yükle',message:'09:00–14:05 standart şablon yüklenecek.',
                onConfirm:()=>{setTimeSlots([{id:'t1',start:'09:00',end:'09:40',type:'lesson'},{id:'t2',start:'09:40',end:'09:55',type:'break'},{id:'t3',start:'09:55',end:'10:35',type:'lesson'},{id:'t4',start:'10:35',end:'10:50',type:'break'},{id:'t5',start:'10:50',end:'11:30',type:'lesson'},{id:'t6',start:'11:30',end:'12:30',type:'lunch'},{id:'t7',start:'12:30',end:'13:10',type:'lesson'},{id:'t8',start:'13:10',end:'13:25',type:'break'},{id:'t9',start:'13:25',end:'14:05',type:'lesson'}]);setConfirmModal({isOpen:false});onNotify("Şablon yüklendi.");},
                onCancel:()=>setConfirmModal({isOpen:false})})}
                className="mt-3 w-full bg-emerald-50 border-2 border-emerald-100 text-emerald-700 py-2.5 rounded-xl text-sm font-700 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                <Sparkles size={15}/> Standart Şablon Yükle (09:00–14:05)
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Slot Edit */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-scaleIn border border-slate-100 overflow-hidden dk-card dk-border">
            <div className="flex items-center justify-between p-5 border-b dk-border dk-card-inner">
              <div>
                <h3 className="text-base font-700 dk-text">Ders Ataması</h3>
                <p className="text-xs dk-text-muted mt-0.5">
                  {classes.find(c=>c.id===editingSlot.clsId)?.name} — {timeSlots.find(t=>t.id===editingSlot.slotId)?.start}–{timeSlots.find(t=>t.id===editingSlot.slotId)?.end}
                </p>
              </div>
              <button onClick={()=>setEditingSlot(null)} className="p-2 dk-text-muted hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={17}/></button>
            </div>
            <div className="p-5 overflow-y-auto custom-scroll space-y-4">
              <div>
                <label className="block text-[10px] font-700 dk-text-muted uppercase tracking-widest mb-1.5">Etkinlik</label>
                <input list="acts-list" className="w-full border border-slate-200 p-3 rounded-xl text-sm font-600 dk-text focus:border-indigo-400 outline-none transition-colors dk-input"
                  placeholder="Listeden seç veya yaz…" value={editingSlot.data.name||''} onChange={e=>{
                    const m=activities.find(a=>a.name.toLocaleLowerCase('tr')===e.target.value.toLocaleLowerCase('tr'));
                    setEditingSlot({...editingSlot,data:{...editingSlot.data,name:e.target.value,activityId:m?.id||''}});
                  }}/>
                <datalist id="acts-list">{activities.map(a=><option key={a.id} value={a.name}/>)}</datalist>
                {editingSlot.data.name&&!activities.find(a=>a.name===editingSlot.data.name)&&editingSlot.data.activityId!=='NO_CLASS' && (
                  <p className="text-xs text-indigo-600 mt-1 font-600 bg-indigo-50 px-2 py-1 rounded-lg inline-block">+ Yeni etkinlik olarak eklenecek</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-700 dk-text-muted uppercase tracking-widest mb-1.5">Gönüllü Lider</label>
                <select className="w-full border border-slate-200 p-3 rounded-xl text-sm font-600 dk-text focus:border-indigo-400 outline-none bg-white transition-colors dk-input"
                  value={editingSlot.data.leadId||''} onChange={e=>{const v=volunteers.find(x=>x.id===e.target.value);setEditingSlot({...editingSlot,data:{...editingSlot.data,leadId:v?.id||'none',lead:v?.name||'-'}});}}>
                  <option value="none">— Seçiniz —</option>
                  {volunteers.map(v=><option key={v.id} value={v.id}>{v.name}{!v.capabilities.includes(editingSlot.data.activityId)?' ⚠️':' ✓'}</option>)}
                </select>
              </div>
              <div className="dk-card-inner p-4 rounded-xl border dk-border space-y-2">
                <p className="text-[10px] font-700 dk-text-muted uppercase tracking-widest mb-2">Hızlı Kapatma</p>
                <button onClick={markAsNoClass} className="w-full py-2.5 dk-card border dk-border dk-text hover:bg-slate-100 rounded-xl text-sm font-600 flex justify-center gap-2 transition-colors"><Minus size={15}/> Sadece Bu Sınıfa Kapat</button>
                <button onClick={markAllAsNoClass} className="w-full py-2.5 dk-card border border-red-100 text-red-500 hover:bg-red-50 rounded-xl text-sm font-600 flex justify-center gap-2 transition-colors"><X size={15}/> Tüm Sınıflara Kapat</button>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t dk-border">
              {editingSlot.data.activityId && (
                <button onClick={()=>{setEditingSlot({...editingSlot,data:{activityId:'delete'}});setTimeout(saveSlotEdit,50);}}
                  className="flex-1 border-2 border-red-100 text-red-500 hover:bg-red-50 py-3 rounded-xl text-sm font-700 flex justify-center gap-2 transition-colors"><Trash2 size={16}/> Sil</button>
              )}
              <button onClick={saveSlotEdit} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-700 flex justify-center gap-2 transition-all active:scale-95 shadow-sm"><CheckCircle2 size={16}/> Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Toplu Gönüllü */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn border border-slate-100 overflow-hidden dk-card dk-border">
            <div className="flex items-center justify-between p-5 border-b dk-border dk-card-inner">
              <h3 className="text-base font-700 dk-text">Toplu Gönüllü Ekle</h3>
              <button onClick={()=>setBulkModalOpen(false)} className="p-2 dk-text-muted hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={17}/></button>
            </div>
            <div className="p-5">
              <p className="text-xs dk-text-muted font-500 mb-3">Excel'den kopyaladığınız isim listesini yapıştırın <span className="text-indigo-600 font-700">(Her satıra 1 isim)</span></p>
              <textarea className="w-full h-56 border border-slate-200 p-3 rounded-xl text-sm font-400 dk-text outline-none focus:border-indigo-400 resize-none dk-card-inner focus:bg-white transition-colors"
                placeholder={"Mustafa Berke Şimşekler\nEda Nur Keklik\nHüseyin Vural…"} value={bulkText} onChange={e=>setBulkText(e.target.value)}/>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t dk-border dk-card-inner">
              <button onClick={()=>setBulkModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-600 dk-card border dk-border dk-text hover:bg-slate-100 transition-colors">İptal</button>
              <button onClick={()=>{
                const names=bulkText.split('\n').map(n=>n.trim()).filter(n=>n.length>0);
                if(names.length>0){const newVols=names.map(n=>({id:uuid(),name:n,capabilities:[]}));const u=[...volunteers,...newVols];setVolunteers(u);syncVolunteers(u);setBulkText('');setBulkModalOpen(false);onNotify(`${names.length} gönüllü eklendi!`);}
              }} className={btnPrim}>
                <CheckCircle2 size={16}/> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── INTERACTIVE TEXT ─────────────────────────────────────────────────────────
const InteractiveText = ({ text, size, offsetY, onUpdate, className, style, placeholder, isEditable }) => {
  const [dragging, setDragging] = useState(false);
  const startPos = useRef({ x:0, y:0 });
  const startVals= useRef({ size:0, offset:0 });
  const onMouseDown = e => {
    if (e.button!==0) return; e.preventDefault();
    setDragging(true); startPos.current={x:e.clientX,y:e.clientY}; startVals.current={size,offset:offsetY||0};
  };
  useEffect(() => {
    const move = e => {
      if (!dragging) return;
      const dx=e.clientX-startPos.current.x, dy=e.clientY-startPos.current.y;
      onUpdate(Math.max(10,Math.min(200,startVals.current.size+dx/3)), startVals.current.offset+dy);
    };
    const up = () => setDragging(false);
    if (dragging) { window.addEventListener('mousemove',move); window.addEventListener('mouseup',up); }
    return () => { window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up); };
  }, [dragging, onUpdate]);
  return (
    <div className={`relative group/t cursor-move select-none ${className}`}
      style={{...style, fontSize:`${size}px`, transform:`translateY(${offsetY}px)`, touchAction:'none'}} onMouseDown={onMouseDown}>
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none ${dragging?'opacity-100':'opacity-0 group-hover/t:opacity-60'} transition-opacity`}>
        {Math.round(size)}px
      </div>
      {isEditable
        ? <input type="text" value={text} onChange={isEditable} className="bg-transparent text-center w-full outline-none" onMouseDown={e=>e.stopPropagation()}/>
        : <span>{text || placeholder}</span>}
    </div>
  );
};

// ─── INTERACTIVE PHOTO ────────────────────────────────────────────────────────
const InteractivePhoto = ({ src, scale, translateX, translateY, onUpdate, id }) => {
  const [dragging, setDragging] = useState(false);
  const startPos  = useRef({x:0,y:0});
  const startVals = useRef({x:0,y:0});
  const onMouseDown = e => {
    if (e.button!==0||!src) return; e.preventDefault(); setDragging(true);
    startPos.current={x:e.clientX,y:e.clientY}; startVals.current={x:translateX||0,y:translateY||0};
  };
  useEffect(() => {
    const move = e => { if(!dragging)return; onUpdate(id,scale||1,startVals.current.x+(e.clientX-startPos.current.x),startVals.current.y+(e.clientY-startPos.current.y)); };
    const up = () => setDragging(false);
    if (dragging) { window.addEventListener('mousemove',move); window.addEventListener('mouseup',up); }
    return () => { window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up); };
  }, [dragging, id, scale, onUpdate]);
  return (
    <div className="relative w-full h-full cursor-move overflow-hidden bg-slate-50 rounded-xl select-none touch-none group/img" onMouseDown={onMouseDown}>
      {src ? (
        <img src={src} alt="Gönüllü" className="max-w-none absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{objectFit:'contain',transform:`scale(${scale||1}) translate(${translateX||0}px,${translateY||0}px)`,transformOrigin:'center center'}}/>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1">
          <Camera size={18}/><span className="text-[7px] font-700 uppercase no-print">Tıkla Yükle</span>
        </div>
      )}
      {src && !dragging && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full shadow-sm no-print opacity-0 group-hover/img:opacity-100 transition-opacity z-20 border border-slate-100 scale-75">
          <Minus size={8} className="text-slate-400"/>
          <input type="range" min="1" max="5" step="0.05" value={scale||1}
            onChange={e=>onUpdate(id,parseFloat(e.target.value),translateX,translateY)}
            className="w-12 h-1 bg-indigo-100 rounded-lg accent-indigo-600 cursor-pointer appearance-none"
            onMouseDown={e=>e.stopPropagation()}/>
          <PlusCircle size={8} className="text-indigo-500"/>
        </div>
      )}
    </div>
  );
};

// ─── MODULE 2: İSİMLİK MATBAASI ──────────────────────────────────────────────
function NameTagApp({ onNotify, dark }) {
  const ROWS = 5;
  // cm/mm based sizing — real nametags are 85mm x 55mm (standard) or 100mm x 30mm (horizontal)
  const NAMETAG_FORMATS = [
    { id:'standard',  label:'Standart (85×55mm)',  w:85, h:55, namePx:54, surnPx:11 },
    { id:'horizontal',label:'Yatay Uzun (100×30mm)',w:100,h:30, namePx:36, surnPx:9  },
    { id:'badge',     label:'Rozet (60×90mm)',      w:60, h:90, namePx:62, surnPx:12 },
    { id:'wide',      label:'Geniş Yatay (120×40mm)',w:120,h:40,namePx:44, surnPx:10 },
  ];
  const [format, setFormat]           = useState('standard');
  const [pagePadding, setPagePadding] = useState(5);
  const [cardGap, setCardGap]         = useState(2);
  const [vertComp, setVertComp]       = useState(0);
  const [globalScale, setGlobalScale] = useState(100);
  const [cmScale, setCmScale]         = useState(100); // percentage of real-world cm
  const [volunteers, setVolunteers]   = useState(() => db.load(DB_KEYS.NAMETAG_VOLUNTEERS, []));
  const [aiState, setAiState]         = useState('idle');
  const [warnings, setWarnings]       = useState([]);
  const [confirmModal, setConfirmModal] = useState({isOpen:false});
  const [promptModal,  setPromptModal]  = useState({isOpen:false});

  const fmt = NAMETAG_FORMATS.find(f=>f.id===format) || NAMETAG_FORMATS[0];
  // Convert mm to px at 96dpi: 1mm = 3.7795px
  const MM_TO_PX = 3.7795;
  const cardW = fmt.w * MM_TO_PX * (cmScale/100);
  const cardH = fmt.h * MM_TO_PX * (cmScale/100);

  useEffect(() => { db.save(DB_KEYS.NAMETAG_VOLUNTEERS, volunteers); syncVolunteers(volunteers); }, [volunteers]);

  useEffect(() => {
    if (aiState==='processing') return;
    const issues = [];
    volunteers.forEach(v => {
      const nameLen = (v.name||'').length;
      const estPx = fmt.namePx * (cmScale/100) * (globalScale/100);
      // Estimate rendered width: ~0.6 * fontSize per char for average Latin char
      const estWidth = nameLen * estPx * 0.55;
      const availW   = cardW - 8; // padding
      if (estWidth > availW)
        issues.push({ msg: `"${v.name.split(' ')[0]}" ismi karta sığmayabilir (${Math.round(estWidth)}px > ${Math.round(availW)}px). Yazı boyutunu küçültün.` });
      if (nameLen > 28)
        issues.push({ msg: `"${v.name}" ismi çok uzun (${nameLen} karakter).` });
    });
    setWarnings(issues);
  }, [volunteers, aiState, fmt, cmScale, globalScale, cardW]);

  const handleAutoFix = () => {
    setAiState('processing');
    setTimeout(() => {
      setVolunteers(prev=>prev.map(v=>({...v, nameSize: fmt.namePx, nameY:0, surnameSize:fmt.surnPx, surnameY:5 })));
      setAiState('idle'); onNotify("İsimlikler standart formata ayarlandı!");
    }, 1000);
  };

  const formatNameDisplay = fullName => {
    const parts = fullName.trim().split(' ');
    if (parts.length===1) return { first:parts[0], last:'' };
    return { first:parts.slice(0,-1).join(' '), last:parts[parts.length-1] };
  };

  const pages = [];
  for (let i=0; i<volunteers.length; i+=ROWS) {
    const chunk = volunteers.slice(i,i+ROWS);
    pages.push({type:'names',items:chunk});
    pages.push({type:'questions',items:chunk});
  }

  return (
    <div className="space-y-5 relative">
      <ConfirmModal {...confirmModal} dark={dark}/>
      <PromptModal  {...promptModal}/>

      <div className="no-print space-y-4">
        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {warnings.map((w,i)=>(
              <div key={i} className="text-xs font-500 text-amber-700 flex items-start gap-1.5">
                <AlertTriangle size={12} className="shrink-0 mt-0.5"/> {w.msg}
              </div>
            ))}
          </div>
        )}

        {/* Format seçimi */}
        <div className="dk-card border dk-border rounded-2xl shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {NAMETAG_FORMATS.map(f=>(
            <button key={f.id} onClick={()=>setFormat(f.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${format===f.id?'border-indigo-500 bg-indigo-50 text-indigo-700':'dk-border dk-card dk-text hover:border-indigo-300'}`}>
              <div className="text-xs font-700 mb-1">{f.label}</div>
              <div className="text-[10px] dk-text-muted font-500">{f.w}mm × {f.h}mm</div>
              <div className="mt-2 border dk-border rounded" style={{width:'100%',height:Math.round(f.h/f.w*40),background:'rgba(99,102,241,.1)'}}/>
            </button>
          ))}
        </div>

        <div className="dk-card border dk-border rounded-2xl shadow-sm p-5 grid grid-cols-2 md:grid-cols-5 gap-5 items-end">
          {[
            {label:'Kenar Boşluğu (mm)', val:pagePadding, min:0,  max:30,  set:setPagePadding, color:'accent-indigo-600' },
            {label:'Dikey Sıkıştır',     val:vertComp,    min:0,  max:30,  set:setVertComp,    color:'accent-orange-500'},
            {label:'Kart Aralığı (mm)',  val:cardGap,     min:0,  max:20,  set:setCardGap,     color:'accent-teal-500'  },
            {label:'Genel Ölçek (%)',    val:globalScale, min:60, max:100, set:setGlobalScale, color:'accent-indigo-600'},
            {label:'Gerçek Boyut (%)',   val:cmScale,     min:50, max:150, set:setCmScale,     color:'accent-pink-500'  },
          ].map(c=>(
            <div key={c.label} className="flex flex-col gap-2">
              <label className="text-[10px] font-700 dk-text-muted uppercase tracking-widest">{c.label}</label>
              <div className="flex items-center gap-2">
                <input type="range" min={c.min} max={c.max} value={c.val} onChange={e=>c.set(parseInt(e.target.value))} className={`w-full h-1.5 rounded-full cursor-pointer ${c.color}`}/>
                <span className="text-xs font-700 dk-text w-8 text-right">{c.val}</span>
              </div>
            </div>
          ))}
          <button onClick={handleAutoFix} disabled={aiState==='processing'}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-700 flex gap-2 items-center justify-center shadow-sm transition-all active:scale-95 disabled:opacity-60">
            {aiState==='processing'?<><RefreshCw size={15} className="animate-spin"/>İşleniyor</>:<><Wand2 size={15}/>B.A.L.K.I.Z.</>}
          </button>
        </div>
      </div>

      <div className="block space-y-12 pb-20 print:space-y-0 print:pb-0">
        {pages.map((page,pIndex)=>(
          <div key={pIndex} className="print-page bg-white shadow-xl mx-auto overflow-hidden print:shadow-none print:m-0" style={{padding:`${pagePadding}mm`}}>
            <div className="grid grid-cols-2 w-full h-full" style={{
              transform:`scale(${globalScale/100})`, transformOrigin:'top center',
              height:`${100-vertComp}%`,
              gridTemplateRows:`repeat(${ROWS}, 1fr)`,
              gap:`${cardGap}mm`
            }}>
              {page.items.map((vol)=>{
                const {first,last}=formatNameDisplay(vol.name||'');
                const ns = vol.nameSize    || fmt.namePx;
                const ss = vol.surnameSize || fmt.surnPx;
                const ny = vol.nameY    || 0;
                const sy = vol.surnameY || 5;

                if (page.type==='names') return (
                  <div key={vol.id} className="relative overflow-hidden flex flex-col" style={{minWidth:`${cardW}px`,maxWidth:`${cardW}px`,height:`${cardH}px`}}>
                    <img src={IMAGES.NAME_BG} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false}/>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-0.5">
                      <InteractiveText text={first} size={ns*(cmScale/100)} offsetY={ny}
                        onUpdate={(s,o)=>setVolunteers(prev=>prev.map(v=>v.id===vol.id?{...v,nameSize:s/cmScale*100,nameY:o}:v))}
                        className="font-comic font-black text-white text-center drop-shadow-md w-full px-2" style={{letterSpacing:'-.01em'}}/>
                      {last && <InteractiveText text={last} size={ss*(cmScale/100)} offsetY={sy}
                        onUpdate={(s,o)=>setVolunteers(prev=>prev.map(v=>v.id===vol.id?{...v,surnameSize:s/cmScale*100,surnameY:o}:v))}
                        className="font-comic font-bold text-white/90 text-center w-full px-2"/>}
                    </div>
                    <button onClick={()=>setConfirmModal({isOpen:true,isDanger:true,title:'İsimliği Sil',message:`${vol.name} silinecek.`,
                      onConfirm:()=>{const u=volunteers.filter(v=>v.id!==vol.id);syncVolunteers(u);setVolunteers(u);setConfirmModal({isOpen:false});},
                      onCancel:()=>setConfirmModal({isOpen:false})})}
                      className="absolute top-1 right-1 no-print opacity-0 hover:opacity-100 bg-black/30 text-white p-1 rounded-full transition-opacity">
                      <Trash2 size={9}/>
                    </button>
                  </div>
                );

                return (
                  <div key={vol.id} className="relative overflow-hidden" style={{minWidth:`${cardW}px`,maxWidth:`${cardW}px`,height:`${cardH}px`}}>
                    <img src={IMAGES.QUESTION_BG} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false}/>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE 3: GÖRSEL KOLAJ ───────────────────────────────────────────────────
function CollageApp({ onNotify, dark }) {
  const [projectTitle,   setProjectTitle]   = useState("İLKYAR ŞUBAT 2026 ANTALYA PROJESİ EKİBİ");
  const [projectAddress, setProjectAddress] = useState("Adres: Çiğdem Mah. 1588.Sok. No:81 06580 Çankaya/ANKARA");
  const [volunteers,     setVolunteers]     = useState(()=>db.load(DB_KEYS.COLLAGE_VOLUNTEERS,[]));
  const [globalNameSize, setGlobalNameSize] = useState(16);
  const [pagePadding,    setPagePadding]    = useState(12);
  const [aiState,        setAiState]        = useState('idle');
  const [warnings,       setWarnings]       = useState([]);
  const [confirmModal,   setConfirmModal]   = useState({isOpen:false});

  useEffect(()=>{
    db.save(DB_KEYS.COLLAGE_VOLUNTEERS,volunteers); syncVolunteers(volunteers);
    const issues=[];
    const missing=volunteers.filter(v=>!v.photo);
    if(missing.length>0)issues.push({msg:`${missing.length} fotoğraf eksik.`});
    const hIdx=volunteers.findIndex(v=>v.name.toLowerCase().includes("vural")||v.name.toLowerCase().includes("hüseyin"));
    if(hIdx>0)issues.push({msg:'Hüseyin Hoca ilk sırada değil!'});
    setWarnings(issues);
  },[volunteers]);

  const handleAutoFix=useCallback(()=>{
    setAiState('processing');
    setTimeout(()=>{
      let sorted=[...volunteers].sort((a,b)=>a.name.localeCompare(b.name,'tr'));
      const hIdx=sorted.findIndex(v=>v.name.toLowerCase().includes("vural")||v.name.toLowerCase().includes("hüseyin"));
      if(hIdx>0){const h=sorted.splice(hIdx,1)[0];sorted.unshift(h);}
      setVolunteers(sorted); setAiState('idle'); onNotify("Sıralandı!");
    },800);
  },[volunteers,onNotify]);

  const cnt=volunteers.length;
  let cols=3;
  if(cnt<=4)cols=2;else if(cnt<=9)cols=3;else if(cnt<=16)cols=4;else cols=5;
  const rows=Math.ceil(cnt/cols);

  return (
    <div className="space-y-5 relative">
      <style>{`@media print { @page { size:A4 portrait; margin:0; } .collage-print-strict { width:210mm!important; height:297mm!important; max-height:297mm!important; overflow:hidden!important; display:flex!important; flex-direction:column!important; box-sizing:border-box!important; } }`}</style>
      <ConfirmModal {...confirmModal} dark={dark}/>
      <div className="no-print space-y-4">
        {warnings.length>0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap gap-3">
            {warnings.map((w,i)=><div key={i} className="text-xs font-500 text-amber-700 flex items-center gap-1.5"><AlertTriangle size={12}/>{w.msg}</div>)}
          </div>
        )}
        <div className="dk-card border dk-border rounded-2xl shadow-sm p-5 grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-700 dk-text-muted uppercase tracking-widest flex items-center gap-1"><Type size={10}/> İsim Boyutu</label>
            <input type="range" min="10" max="35" value={globalNameSize} onChange={e=>setGlobalNameSize(parseInt(e.target.value))} className="w-full accent-indigo-600 cursor-pointer h-1.5"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-700 dk-text-muted uppercase tracking-widest flex items-center gap-1"><Maximize2 size={10}/> Kenar Payı</label>
            <input type="range" min="0" max="30" value={pagePadding} onChange={e=>setPagePadding(parseInt(e.target.value))} className="w-full accent-pink-600 cursor-pointer h-1.5"/>
          </div>
          <button onClick={handleAutoFix} disabled={aiState==='processing'}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-700 flex gap-2 items-center justify-center shadow-sm transition-all active:scale-95 disabled:opacity-60">
            {aiState==='processing'?<><RefreshCw size={15} className="animate-spin"/>İşleniyor</>:<><Wand2 size={15}/>Alfabe + Protokol Sırala</>}
          </button>
        </div>
      </div>
      <div className="flex justify-center pb-20 print-container">
        <div className="print-page collage-print-strict bg-white shadow-2xl flex flex-col relative" style={{padding:`${pagePadding}mm`,boxSizing:'border-box'}}>
          <div className="w-full mb-3 px-4 shrink-0">
            <input value={projectTitle} onChange={e=>setProjectTitle(e.target.value)}
              className="w-full text-center bg-transparent border-none outline-none font-comic font-black text-slate-900 tracking-tight"
              style={{fontSize:cnt>12?'22px':'28px'}}/>
          </div>
          <div className="grid w-full gap-3 flex-1 min-h-0 overflow-hidden" style={{gridTemplateColumns:`repeat(${cols},1fr)`,gridTemplateRows:`repeat(${rows},1fr)`}}>
            {volunteers.map((vol,idx)=>(
              <div key={vol.id} className="relative flex flex-col items-center justify-center p-2 border border-slate-100 rounded-2xl bg-slate-50/20 group hover:border-indigo-300 transition-all overflow-hidden min-h-0">
                <div className="absolute top-1 right-1 flex flex-col gap-1 no-print opacity-0 group-hover:opacity-100 transition-all z-40">
                  <button onClick={()=>setConfirmModal({isOpen:true,isDanger:true,title:'Kolajdan Çıkar',message:`${vol.name} silinecek.`,onConfirm:()=>{const u=volunteers.filter(v=>v.id!==vol.id);syncVolunteers(u);setVolunteers(u);setConfirmModal(p=>({...p,isOpen:false}));},onCancel:()=>setConfirmModal(p=>({...p,isOpen:false}))})} className="p-1 bg-white text-red-500 rounded-full shadow-sm border border-red-50 hover:scale-110"><Trash2 size={10}/></button>
                  <button onClick={()=>{const nv=[...volunteers];const t=idx-1;if(t>=0){const tmp=nv[idx];nv[idx]=nv[t];nv[t]=tmp;setVolunteers(nv);}}} disabled={idx===0} className="p-1 bg-white text-indigo-600 rounded-full shadow-sm border border-indigo-50 hover:scale-110 disabled:opacity-30"><ChevronUp size={10}/></button>
                  <button onClick={()=>{const nv=[...volunteers];const t=idx+1;if(t<nv.length){const tmp=nv[idx];nv[idx]=nv[t];nv[t]=tmp;setVolunteers(nv);}}} disabled={idx===volunteers.length-1} className="p-1 bg-white text-indigo-600 rounded-full shadow-sm border border-indigo-50 hover:scale-110 disabled:opacity-30"><ChevronDown size={10}/></button>
                </div>
                <div className="relative w-full h-full min-h-0 mb-1 overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                  <InteractivePhoto id={vol.id} src={vol.photo} scale={vol.scale} translateX={vol.translateX} translateY={vol.translateY} onUpdate={(id,s,x,y)=>setVolunteers(prev=>prev.map(v=>v.id===id?{...v,scale:s,translateX:x,translateY:y}:v))}/>
                  {!vol.photo && <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setVolunteers(prev=>prev.map(v=>v.id===vol.id?{...v,photo:ev.target.result,scale:1,translateX:0,translateY:0}:v));r.readAsDataURL(f);}}} className="absolute inset-0 opacity-0 cursor-pointer z-30"/>}
                  {vol.photo && (
                    <label className="absolute top-1 left-1 no-print opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/90 rounded-full text-indigo-600 cursor-pointer z-40 shadow-sm">
                      <Upload size={12}/>
                      <input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setVolunteers(prev=>prev.map(v=>v.id===vol.id?{...v,photo:ev.target.result,scale:1,translateX:0,translateY:0}:v));r.readAsDataURL(f);}}}/>
                    </label>
                  )}
                </div>
                <div className="w-full px-1 text-center leading-none shrink-0">
                  <textarea value={vol.name} onChange={e=>setVolunteers(prev=>prev.map(v=>v.id===vol.id?{...v,name:e.target.value}:v))}
                    className="w-full text-center bg-transparent border-none outline-none font-comic font-bold text-slate-800 resize-none overflow-hidden p-0 m-0"
                    style={{fontSize:`${globalNameSize}px`,height:'2.5em'}} rows={2}/>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full shrink-0 flex flex-col items-center gap-1 bg-white pt-2 mt-auto">
            <div className="flex items-center gap-4 text-indigo-600 font-black tracking-[0.2em] text-[16px]">
              <span className="w-10 h-px bg-indigo-200"/>
              <Smile size={20} className="text-indigo-400"/>
              <span className="uppercase">MEKTUPLARINI BEKLİYORUZ</span>
              <span className="w-10 h-px bg-indigo-200"/>
            </div>
            <div className="w-full border-t border-slate-200 pt-1 flex justify-center">
              <input type="text" value={projectAddress} onChange={e=>setProjectAddress(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-sans text-slate-500 text-center font-500"
                style={{fontSize:cnt>12?'11px':'15px'}}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE 4: RESMİ TUTANAK ──────────────────────────────────────────────────
function DocumentCreator({ dark }) {
  const [formData, setFormData] = useState({
    no:'2026/01', date:new Date().toLocaleDateString('tr-TR'), topic:'Planlama',
    location:'Salon A', participants:'Müdür, Yürütücü', decisions:'1. Karar 1\n2. Karar 2'
  });
  const set = (k,v) => setFormData(p=>({...p,[k]:v}));
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-72 shrink-0 dk-card border dk-border rounded-2xl shadow-sm p-5 print:hidden space-y-4">
        <h3 className="text-base font-700 dk-text">Belge Bilgileri</h3>
        {[{label:'Karar No',key:'no',ph:'2026/01'},{label:'Tarih',key:'date',ph:'GG.AA.YYYY'},{label:'Konu',key:'topic',ph:'Planlama'},{label:'Yer',key:'location',ph:'Salon A'},{label:'Katılımcılar',key:'participants',ph:'İsimler…'}].map(f=>(
          <div key={f.key}>
            <label className="block text-[10px] font-700 dk-text-muted uppercase tracking-widest mb-1">{f.label}</label>
            <input className="w-full border dk-border p-2.5 rounded-xl text-sm font-500 dk-text focus:border-indigo-400 outline-none transition-colors dk-input"
              placeholder={f.ph} value={formData[f.key]} onChange={e=>set(f.key,e.target.value)}/>
          </div>
        ))}
        <div>
          <label className="block text-[10px] font-700 dk-text-muted uppercase tracking-widest mb-1">Kararlar</label>
          <textarea className="w-full border dk-border p-2.5 rounded-xl text-sm font-500 dk-text focus:border-indigo-400 outline-none h-52 resize-none transition-colors dk-input"
            placeholder="Alınan kararlar…" value={formData.decisions} onChange={e=>set('decisions',e.target.value)}/>
        </div>
      </div>
      <div className="flex-1 bg-white shadow-xl border border-slate-200 rounded-2xl p-14 print:shadow-none print:p-0 print:border-none print:rounded-none min-h-[297mm]">
        <h1 className="text-center font-black text-xl border-b-4 border-slate-900 pb-4 mb-10 uppercase tracking-widest">Toplantı Tutanağı</h1>
        <table className="w-full border-2 border-slate-900 mb-10 text-sm">
          <tbody>
            {[['Karar No',formData.no],['Tarih',formData.date],['Konu',formData.topic],['Yer',formData.location],['Katılımcılar',formData.participants]].map(([k,v])=>(
              <tr key={k}>
                <td className="border-2 border-slate-900 p-3 font-black bg-slate-100 w-1/4 whitespace-nowrap">{k}</td>
                <td className="border-2 border-slate-900 p-3 font-500">{v}</td>
              </tr>
            ))}
            <tr>
              <td className="border-2 border-slate-900 p-3 font-black bg-slate-100 align-top">Kararlar</td>
              <td className="border-2 border-slate-900 p-3 whitespace-pre-wrap h-72 align-top font-500 leading-relaxed">{formData.decisions}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-between mt-32 px-10">
          <div className="text-center font-black">Raportör<div className="mt-10 border-t-2 border-slate-900 w-36"/></div>
          <div className="text-center font-black">Onaylayan<div className="mt-10 border-t-2 border-slate-900 w-36"/></div>
        </div>
      </div>
    </div>
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function ProkordiManagerApp() {
  const [activeTab,    setActiveTab]    = useState('scheduler');
  const [notification, setNotification] = useState(null);
  const [dark,         setDark]         = useState(() => db.load(DB_KEYS.DARK_MODE, false));
  const [cacheModal,   setCacheModal]   = useState(false);

  useEffect(() => { db.save(DB_KEYS.DARK_MODE, dark); }, [dark]);

  const showNotify = msg => { setNotification(msg); setTimeout(()=>setNotification(null), 3500); };

  const clearAllCache = () => {
    db.clearAll();
    window.location.reload();
  };

  const tabMeta = {
    scheduler: { label:'Program Yöneticisi', icon:<Calendar size={18}/> },
    badges:    { label:'İsimlik Matbaası',   icon:<Users size={18}/> },
    collage:   { label:'Görsel Kolaj',       icon:<ImageIcon size={18}/> },
    minutes:   { label:'Resmi Tutanak',      icon:<FileText size={18}/> },
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'scheduler': return <InfinityScheduler onNotify={showNotify} dark={dark}/>;
      case 'badges':    return <NameTagApp onNotify={showNotify} dark={dark}/>;
      case 'collage':   return <CollageApp onNotify={showNotify} dark={dark}/>;
      case 'minutes':   return <DocumentCreator dark={dark}/>;
      default:          return <InfinityScheduler onNotify={showNotify} dark={dark}/>;
    }
  };

  const appBg   = dark ? '#0f172a' : '#f1f5f9';
  const sidebarBg = dark ? '#0f172a' : 'white';
  const headerBg  = dark ? 'rgba(15,23,42,.95)' : 'rgba(255,255,255,.9)';
  const borderClr = dark ? '#1e293b' : '#e2e8f0';
  const textPrimary = dark ? '#e2e8f0' : '#1e293b';
  const textMuted   = dark ? '#64748b' : '#94a3b8';

  return (
    <div style={{ display:'flex', height:'100vh', background:appBg, color:textPrimary, overflow:'hidden' }}>
      <style>{buildCSS(dark)}</style>

      {/* ── Cache Clear Modal ── */}
      {cacheModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn dk-card dk-border border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-500"><Database size={20}/></div>
              <h3 className="text-base font-700 dk-text">Tüm Cache'i Temizle</h3>
            </div>
            <p className="text-sm dk-text-muted mb-6 leading-relaxed">Tüm veriler (program, gönüllüler, etkinlikler, sohbet geçmişi) <strong className="text-red-500">kalıcı olarak</strong> silinecek ve uygulama sıfırlanacak.</p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setCacheModal(false)} className="px-4 py-2 rounded-xl text-sm font-600 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">İptal</button>
              <button onClick={clearAllCache} className="px-4 py-2 rounded-xl text-sm font-700 text-white bg-red-500 hover:bg-red-600 transition-all active:scale-95">Tümünü Sil ve Sıfırla</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside style={{ width:220, background:sidebarBg, borderRight:`1px solid ${borderClr}`, display:'flex', flexDirection:'column', zIndex:20 }} className="print:hidden shrink-0">
        {/* Logo */}
        <div style={{ padding:'18px 20px', borderBottom:`1px solid ${borderClr}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(99,102,241,.35)' }}>
              <LayoutDashboard size={17} className="text-white"/>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:textPrimary, letterSpacing:'-.02em', lineHeight:1.2 }}>ProKordi</div>
              <div style={{ fontSize:13, fontWeight:800, color:textPrimary, letterSpacing:'-.02em', lineHeight:1.2 }}>Manager</div>
              <div style={{ fontSize:9, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'.1em', marginTop:1 }}>B.A.L.K.I.Z. v4.0</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 12px', marginTop:8 }} className="space-y-1">
          <SidebarItem dark={dark} id="scheduler" icon={<Calendar size={16}/>}    label="Program"         active={activeTab} onClick={setActiveTab}/>
          <SidebarItem dark={dark} id="badges"    icon={<Users size={16}/>}       label="İsimlik"         active={activeTab} onClick={setActiveTab}/>
          <SidebarItem dark={dark} id="collage"   icon={<ImageIcon size={16}/>}   label="Görsel Kolaj"    active={activeTab} onClick={setActiveTab}/>
          <SidebarItem dark={dark} id="minutes"   icon={<FileText size={16}/>}    label="Resmi Tutanak"   active={activeTab} onClick={setActiveTab}/>
        </nav>

        {/* Footer tools */}
        <div style={{ padding:'12px', borderTop:`1px solid ${borderClr}` }} className="space-y-2">
          {/* Dark mode toggle */}
          <button onClick={()=>setDark(d=>!d)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12, border:'none', cursor:'pointer', background:dark?'rgba(99,102,241,.15)':'rgba(99,102,241,.06)', color:dark?'#a5b4fc':'#6366f1', transition:'all .2s' }}>
            {dark ? <Sun size={15}/> : <Moon size={15}/>}
            <span style={{ fontSize:12, fontWeight:600 }}>{dark?'Aydınlık Mod':'Karanlık Mod'}</span>
          </button>
          {/* Clear cache */}
          <button onClick={()=>setCacheModal(true)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12, border:'none', cursor:'pointer', background:'rgba(239,68,68,.06)', color:'#ef4444', transition:'all .2s' }}>
            <Trash size={15}/>
            <span style={{ fontSize:12, fontWeight:600 }}>Cache'i Temizle</span>
          </button>
          <div style={{ textAlign:'center', fontSize:9, color:textMuted, paddingTop:4 }}>
            © 2026 <a href="https://github.com/ragno-typhojem" target="_blank" rel="noopener noreferrer" style={{ color:'#6366f1', fontWeight:600 }}>Mustafa Berke Simsekler</a>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, overflow:'auto', background:appBg, position:'relative' }} className="print:bg-white print:overflow-visible">
        {/* Header */}
        <header style={{ background:headerBg, backdropFilter:'blur(12px)', borderBottom:`1px solid ${borderClr}`, height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', position:'sticky', top:0, zIndex:30, boxShadow:'0 1px 8px rgba(0,0,0,.04)' }} className="print:hidden no-print">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ padding:8, background:dark?'rgba(99,102,241,.2)':'#eef2ff', borderRadius:12, color:'#6366f1' }}>
              {tabMeta[activeTab]?.icon}
            </div>
            <h2 style={{ fontSize:15, fontWeight:700, color:textPrimary }}>{tabMeta[activeTab]?.label}</h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Saat dark={dark}/>
            <button onClick={()=>window.print()}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:12, fontSize:13, fontWeight:700, color:'white', background:'#1e293b', border:'none', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,.1)', transition:'all .2s' }}>
              <Printer size={14}/> Yazdır
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding:24, minHeight:'calc(100vh - 60px)', maxWidth:1700, margin:'0 auto' }} id="printable-section" className="print:p-0">
          {renderContent()}
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 animate-notification print:hidden z-50" style={{ background:'#0f172a', color:'white', padding:'12px 20px', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,.25)', display:'flex', alignItems:'center', gap:12, borderLeft:'4px solid #10b981' }}>
            <CheckCircle2 size={17} style={{ color:'#10b981', flexShrink:0 }}/>
            <span style={{ fontSize:13, fontWeight:600 }}>{notification}</span>
          </div>
        )}
      </main>
    </div>
  );
}