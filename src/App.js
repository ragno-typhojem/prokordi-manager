/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

// ─── ÇEKİRDEK ────────────────────────────────────────────────────────────────
import { db, DB_KEYS } from './lib/db';
import { uid as uuid, norm, validateTimeSlots, canonicalSlots } from './lib/util';
import TimeEditor from './components/TimeEditor';
import Checklist from './components/Checklist';
import NameBadges from './components/NameBadges';
import TeamCollage from './components/TeamCollage';
import Welcome from './components/Welcome';
import SessionBar from './components/SessionBar';
import ClassPicker from './components/ClassPicker';
import ActivityManager from './components/ActivityManager';
import VolunteerEntry from './components/VolunteerEntry';
import {sessionKeys,loadSessions,saveSessions,syncSessionRoster,crossSessionConflicts,sessionReservations,migrateSharedLibrary} from './lib/sessions';
import { calculateConflicts, distribute, workload, planSummary } from './lib/engine';
import { askBalkiz, applyActions } from './lib/ai';
import { readFile, parseAny, toStatePatch } from './lib/importer';

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const buildCSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&family=Comic+Neue:wght@400;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Geist', sans-serif; }
button,input,select,textarea{font:inherit} button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #a5b4fc;outline-offset:2px}
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
.dk-text-muted { color:${dark?'#94a3b8':'#64748b'} !important; }
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
  .app-sidebar,main>header{ display:none!important; }
  main { height:auto!important; overflow:visible!important; display:block!important; position:static!important; padding:0!important; background:white!important; }
  #printable-section { padding:0!important; max-width:none!important; }
  * { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
  .print-page { margin:0!important; box-shadow:none!important; border:none!important;  page-break-after:always!important; break-after:page!important; page-break-inside:avoid!important; overflow:hidden!important; }
  .print-page:last-child { page-break-after:auto!important; break-after:auto!important; }
  @page { size:A4 portrait; margin:0; }
  .collage-print-strict { width:210mm!important; height:297mm!important; max-height:297mm!important; page-break-after:avoid!important; overflow:hidden!important; display:flex!important; flex-direction:column!important; box-sizing:border-box!important; }
  .program-table-wrap{overflow:visible!important;width:100%!important}.excel-table{table-layout:fixed!important;width:100%!important;min-width:0!important;font-size:8pt!important}.excel-table th,.excel-table td{white-space:normal!important;overflow-wrap:anywhere!important;padding:2mm!important;border:1px solid #000!important;min-width:0!important}.excel-table tr{break-inside:avoid}.excel-table thead{display:table-header-group}.excel-table th:first-child,.excel-table td:first-child{width:20mm!important;position:static!important}
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
      <div className="rounded-2xl shadow-2xl max-w-sm w-full p-6 border animate-scaleIn dk-card dk-border">
        <h3 className="text-base font-700 dk-text mb-4">{title}</h3>
        <input autoFocus type="text" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirm(val)}
          className="w-full border-2 p-3 rounded-xl text-sm font-500 outline-none focus:border-indigo-400 transition-colors mb-4 dk-input dk-border"/>
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
const CHIPS = [
  'Programı doldur',
  'Boş kalan yerleri doldur',
  'Programı kontrol et',
  'Standart saat şablonunu yükle',
];

function BalkizAIChat({ appState, onApply, onImport, warnings = [], dark, sessionId }) {
  const DB_KEYS=sessionKeys(sessionId);
  const INITIAL = [{ role:'assistant', content:'Merhaba! Ben B.A.L.K.I.Z. 🧠\nNe istediğinizi normal Türkçe yazın — gerisini ben hallederim.\n\n• "3. ders 4-A\'ya Kimya koy, Mehmet anlatsın"\n• "Ayşe\'yi ekle, origami ve drama yapabilir"\n• "boş kalan yerleri doldur"\n\nExcel/CSV dosyasını buraya sürükleyin ya da tabloyu doğrudan yapıştırın — türünü kendim anlarım.' }];
  const [messages, setMessages] = useState(() => db.load(DB_KEYS.CHAT_HISTORY, INITIAL));
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [isOpen, setIsOpen]     = useState(false);
  const [dropping, setDropping] = useState(false);
  const endRef   = useRef(null);
  const abortRef = useRef(null);
  const latestState=useRef(appState); latestState.current=appState;

  useEffect(() => { db.save(DB_KEYS.CHAT_HISTORY, messages.slice(-40)); }, [messages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth', block:'nearest' }); }, [messages, loading]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const push = (m) => setMessages(c => [...c, m]);

  const send = useCallback(async (raw) => {
    const text = String(raw ?? input).trim();
    if (!text || loading) return;
    setInput('');
    const history = messages;
    push({ role:'user', content:text });
    setLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const { message, actions } = await askBalkiz({
        text, history, state: appState, warnings, signal: abortRef.current.signal,
      });
      if(actions.length && latestState.current!==appState)throw new Error('İstek sürerken program değişti. Son düzenlemeleri korudum; isteğini yeniden gönderebilirsin.');
      let log = []; let finalState=appState;
      if (actions.length) {
        const r = applyActions(appState, actions);
        log = r.log; finalState=r.state;
        onApply(r.state);
      }
      push({ role:'assistant', content: actions.length ? 'Uygulama sonucu:\n'+(log.length?log.join('\n'):'Uygulanabilir değişiklik bulunamadı; program korundu.')+'\n'+planSummary(finalState) : message });
    } catch (err) {
      if (err.name === 'AbortError') return;
      const keyErr = /API_KEY|401|tanımlı değil/i.test(err.message || '');
      push({ role:'assistant', content: keyErr ? '⚠️ GROQ_API_KEY yapılandırılmamış veya geçersiz.' : `⚠️ ${err.message}` });
    } finally { setLoading(false); }
  }, [input, loading, messages, appState, warnings, onApply]);

  // Excel'den kopyala-yapıştır: 3+ satır ya da sekmeli içerik → AI'ya gitmeden içe aktar
  const onPaste = (e) => {
    const t = e.clipboardData?.getData('text') || '';
    const lines = t.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length >= 3 || (lines.length >= 2 && t.includes('\t'))) {
      e.preventDefault();
      onImport(t).then(sum => push({ role:'assistant', content:`⇩ Yapıştırılan veri içe aktarıldı — ${sum}` }))
                 .catch(err => push({ role:'assistant', content:`⚠️ İçe aktarılamadı: ${err.message}` }));
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDropping(false);
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    onImport(f).then(sum => push({ role:'assistant', content:`⇩ ${f.name} içe aktarıldı — ${sum}` }))
               .catch(err => push({ role:'assistant', content:`⚠️ ${f.name}: ${err.message}` }));
  };

  const statusLabel = loading
    ? <span style={{background:'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundSize:'200%',animation:'liquid-rainbow 2s linear infinite'}}>Düşünüyor…</span>
    : warnings.length > 0
      ? <span className="text-amber-500">{warnings.length} uyarı</span>
      : <span className="text-emerald-500">Hazır</span>;

  const msgBg = dark ? 'rgba(15,23,42,.6)' : 'rgba(255,255,255,.5)';

  return (
    <div className="no-print mb-5" style={{ position:'relative' }}
      onDragOver={e=>{e.preventDefault();setDropping(true);}}
      onDragLeave={()=>setDropping(false)} onDrop={onDrop}>
      <div aria-hidden style={{ position:'absolute', inset:0, overflow:'hidden', borderRadius:'1rem', pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-30%', left:'-10%', width:'55%', height:'180%', background:'radial-gradient(circle,rgba(99,102,241,.1) 0%,transparent 70%)', animation:'orb-drift-1 8s ease-in-out infinite', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', top:'20%', right:'-15%', width:'50%', height:'160%', background:'radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%)', animation:'orb-drift-2 10s ease-in-out infinite', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:'-20%', left:'30%', width:'40%', height:'120%', background:'radial-gradient(circle,rgba(6,182,212,.07) 0%,transparent 70%)', animation:'orb-drift-3 12s ease-in-out infinite', borderRadius:'50%' }}/>
      </div>

      <div className="glass-panel" style={{ position:'relative', zIndex:1, borderRadius:'1.25rem', overflow:'hidden', outline: dropping ? '2px dashed #6366f1' : 'none', outlineOffset:-4 }}>
        {/* Header */}
        <div style={{ position:'relative', overflow:'hidden', padding:'12px 18px', borderBottom:`1px solid ${dark?'rgba(255,255,255,.08)':'rgba(255,255,255,.4)'}`, background:'linear-gradient(135deg,rgba(99,102,241,.06) 0%,rgba(139,92,246,.04) 50%,rgba(6,182,212,.06) 100%)' }}>
          <div className="liquid-shimmer" style={{ position:'absolute', inset:0, pointerEvents:'none' }}/>
          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <button type="button" onClick={()=>setIsOpen(v=>!v)} aria-expanded={isOpen} style={{ display:'flex', alignItems:'center', gap:12,background:'transparent',border:'none',cursor:'pointer',textAlign:'left' }}>
              <JarvisBrain active={loading}/>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color: dark?'#e2e8f0':'#334155', letterSpacing:'-.01em' }}>B.A.L.K.I.Z.</div>
                <div style={{ fontSize:10, fontWeight:500, textTransform:'uppercase', letterSpacing:'.08em', marginTop:1 }}>{statusLabel}</div>
              </div>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {warnings.length > 0 && !isOpen && (
                <span style={{ background:'#fef3c7', color:'#b45309', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>{warnings.length}</span>
              )}
              <button onClick={()=>setMessages(INITIAL)} title="Sohbeti sıfırla"
                style={{ padding:6, borderRadius:8, border:'none', background:'transparent', color:'#94a3b8', cursor:'pointer', display:'flex' }}>
                <RefreshCw size={13}/>
              </button>
              <button onClick={()=>setIsOpen(v=>!v)} title={isOpen?'Küçült':'Aç'}
                style={{ padding:6, borderRadius:8, border:'none', background:'transparent', color:'#94a3b8', cursor:'pointer', display:'flex' }}>
                <span style={{fontSize:12,fontWeight:700,marginRight:5}}>{isOpen?'Kapat':'Balkız’a sor'}</span>{isOpen?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <>
            <div className="custom-scroll" style={{ height:240, overflowY:'auto', padding:'14px', background:msgBg, backdropFilter:'blur(8px)', display:'flex', flexDirection:'column', gap:9 }}>
              {messages.map((m,i)=>(
                <div key={i} style={{ display:'flex', gap:8, justifyContent:m.role==='user'?'flex-end':'flex-start' }} className="animate-message">
                  {m.role==='assistant' && (
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#e0e7ff,#ddd6fe)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                      <Bot size={12} style={{ color:'#6366f1' }}/>
                    </div>
                  )}
                  <div className={m.role==='user'?'chat-user':'chat-bot'} style={{ maxWidth:'82%', padding:'9px 13px', fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap' }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display:'flex', gap:8, justifyContent:'flex-start' }} className="animate-message">
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
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:5, paddingTop:3 }}>
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

            {/* Hızlı komutlar */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', padding:'8px 11px 0', background:dark?'rgba(15,23,42,.7)':'rgba(248,250,252,.7)' }}>
              {CHIPS.map(c=>(
                <button key={c} onClick={()=>send(c)} disabled={loading}
                  style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:99, cursor:loading?'not-allowed':'pointer',
                    border:`1px solid ${dark?'rgba(99,102,241,.35)':'rgba(99,102,241,.25)'}`,
                    background:dark?'rgba(99,102,241,.12)':'rgba(99,102,241,.07)', color:dark?'#a5b4fc':'#4f46e5', opacity:loading?.5:1 }}>
                  {c}
                </button>
              ))}
            </div>

            <div style={{ borderTop:`1px solid ${dark?'rgba(255,255,255,.08)':'rgba(255,255,255,.4)'}`, padding:'9px 11px', background:dark?'rgba(15,23,42,.7)':'rgba(248,250,252,.7)', backdropFilter:'blur(8px)', display:'flex', gap:7, marginTop:8 }}>
              <label title="Excel / CSV yükle"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'9px 11px', borderRadius:11, cursor:'pointer', color:'#6366f1',
                  background:dark?'rgba(99,102,241,.15)':'rgba(99,102,241,.08)', border:`1.5px solid ${dark?'rgba(99,102,241,.3)':'rgba(99,102,241,.2)'}` }}>
                <FileSpreadsheet size={15}/>
                <input type="file" accept=".xlsx,.xlsm,.csv,.txt,.tsv" style={{ display:'none' }} onChange={e=>{
                  const f=e.target.files?.[0]; e.target.value='';
                  if(f) onImport(f).then(s=>push({role:'assistant',content:`⇩ ${f.name} içe aktarıldı — ${s}`}))
                                   .catch(err=>push({role:'assistant',content:`⚠️ ${f.name}: ${err.message}`}));
                }}/>
              </label>
              <input value={input} onChange={e=>setInput(e.target.value)} onPaste={onPaste}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send(); } }}
                placeholder="Ne yapmamı istersiniz? — ya da Excel tablosunu yapıştırın"
                style={{ flex:1, fontSize:13, background:dark?'rgba(30,41,59,.8)':'rgba(255,255,255,.8)', border:`1.5px solid ${dark?'rgba(51,65,85,.8)':'rgba(226,232,240,.8)'}`, borderRadius:11, padding:'9px 14px', outline:'none', fontFamily:'inherit', color:dark?'#e2e8f0':'#334155', backdropFilter:'blur(8px)', transition:'border-color .2s' }}
                onFocus={e=>{ e.target.style.borderColor='rgba(99,102,241,.5)'; }}
                onBlur={e=>{ e.target.style.borderColor=dark?'rgba(51,65,85,.8)':'rgba(226,232,240,.8)'; }}/>
              <button onClick={()=>loading?abortRef.current?.abort():send()} disabled={!loading&&!input.trim()}
                title={loading?'Durdur':'Gönder'}
                style={{ position:'relative', overflow:'hidden', padding:'9px 13px', borderRadius:11, border:'none', cursor:(!loading&&!input.trim())?'not-allowed':'pointer', background:(!loading&&!input.trim())?'rgba(99,102,241,.35)':'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s', boxShadow:(!loading&&!input.trim())?'none':'0 2px 12px rgba(99,102,241,.35)' }}>
                {loading ? <X size={15}/> : <Send size={15}/>}
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
function InfinityScheduler({ onNotify, dark, sessionId, sessions, dataVersion }) {
  const DB_KEYS=useMemo(()=>sessionKeys(sessionId),[sessionId]);
  const syncVolunteers=useCallback(src=>syncSessionRoster(sessionId,src),[sessionId]);
  const [activeView, setActiveView] = useState('view');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const [activities, setActivities] = useState(() => db.load(DB_KEYS.ACTIVITIES, []));
  const [volunteers, setVolunteers] = useState(() => db.load(DB_KEYS.VOLUNTEERS, []));
  const [timeSlots,  setTimeSlots]  = useState(() => db.load(DB_KEYS.TIMESLOTS, []));
  const [classes,    setClasses]    = useState(() => db.load(DB_KEYS.CLASSES, []));

  const [aiState,        setAiState]        = useState('idle');
  const [hasDistributed, setHasDistributed] = useState(false);
  const [autoGenStep,    setAutoGenStep]    = useState('');
  const [editingSlot,    setEditingSlot]    = useState(null);
  const [bulkModalOpen,  setBulkModalOpen]  = useState(false);
  const [participants,setParticipants]=useState(()=>db.load(DB_KEYS.PARTICIPANTS,null));
  const programVolunteers=volunteers.filter(v=>!participants||participants.includes(v.id));
  useEffect(()=>{db.save(DB_KEYS.PARTICIPANTS,participants);},[participants]);
  const [bulkText,       setBulkText]       = useState('');
  const [importPreview,setImportPreview] = useState(null);
  const [undoState,setUndoState] = useState(null);
  const [quickSlot,      setQuickSlot]      = useState(null); // { clsId, slotId }

  const dragItem    = useRef();
  const fileInputRef= useRef(null);

  useEffect(() => { db.save(DB_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { db.save(DB_KEYS.VOLUNTEERS, volunteers); syncVolunteers(volunteers); }, [volunteers]);
  useEffect(() => { db.save(DB_KEYS.TIMESLOTS,  timeSlots);  }, [timeSlots]);
  useEffect(() => { db.save(DB_KEYS.CLASSES,    classes);    }, [classes]);

  useEffect(()=>{const refresh=e=>{const setters={[DB_KEYS.ACTIVITIES]:[setActivities,[]],[DB_KEYS.VOLUNTEERS]:[setVolunteers,[]],[DB_KEYS.TIMESLOTS]:[setTimeSlots,[]],[DB_KEYS.CLASSES]:[setClasses,[]],[DB_KEYS.PARTICIPANTS]:[setParticipants,null]};const entry=setters[e.key];if(entry)entry[0](db.load(e.key,entry[1]));};window.addEventListener('storage',refresh);return()=>window.removeEventListener('storage',refresh);},[DB_KEYS]);

  // ── ÇAKIŞMALAR (useMemo: her render'da değil, yalnızca veri değişince) ────
  const warnings = useMemo(
    () => calculateConflicts({ activities, volunteers:programVolunteers, timeSlots, classes,reservations:sessionReservations(sessionId,sessions) }),
    [activities, volunteers, timeSlots, classes,participants,sessionId,sessions,dataVersion]
  );

  const appState = useMemo(
    () => ({ activities, volunteers:programVolunteers, timeSlots, classes,reservations:sessionReservations(sessionId,sessions) }),
    [activities, volunteers, timeSlots, classes,participants,sessionId,sessions,dataVersion]
  );

  const latestPlan=useRef(appState);latestPlan.current=appState;
  useEffect(()=>()=>{latestPlan.current=null;},[]);
  const otherTeamWarnings=useMemo(()=>crossSessionConflicts(sessionId,appState,sessions),[sessionId,appState,sessions,dataVersion]);

  /** AI / içe aktarım sonucunu tek noktadan uygular. */
  const applyState = useCallback((next) => {
    if (next.timeSlots) { const errors = validateTimeSlots(next.timeSlots); if(errors.length) throw new Error(errors.join(' ')); next = {...next, timeSlots:canonicalSlots(next.timeSlots)}; }
    setUndoState({activities,volunteers,timeSlots,classes});
    db.save('prokordi_before_change',{activities,volunteers,timeSlots,classes},0);
    if(next.extras){const ex=next.extras;for(const [key,value] of [[DB_KEYS.NAMETAG_VOLUNTEERS,ex.nametags],[DB_KEYS.COLLAGE_VOLUNTEERS,ex.collage],['prokordi_packing_5days_v2',ex.checklist],['prokordi_fold_badge_v1',ex.nameLayout],['prokordi_collage_title_v2',ex.collageTitle],['prokordi_collage_address_v2',ex.collageAddress]])if(value)db.save(key,value);}
    if (next.activities) setActivities(next.activities);
    if (next.volunteers) { const incoming=new Set(next.volunteers.map(v=>v.id));const keep=participants?volunteers.filter(v=>!participants.includes(v.id)&&!incoming.has(v.id)):[];const combined=[...keep,...next.volunteers];setVolunteers(combined);syncVolunteers(combined);if(participants)setParticipants(prev=>[...new Set([...prev.filter(id=>combined.some(v=>v.id===id)),...next.volunteers.filter(v=>!volunteers.some(old=>old.id===v.id)).map(v=>v.id)])]); }
    if (next.timeSlots)  setTimeSlots(next.timeSlots);
    if (next.classes)    { setClasses(next.classes); setHasDistributed(true); }
  }, [activities,volunteers,timeSlots,classes,participants]);

  /** Dosya (xlsx/csv/txt) ya da yapıştırılan metin — türünü importer kendi bulur. */
  const handleImport = useCallback(async (input) => {
    const rows = typeof input === 'string' ? input : await readFile(input);
    const patch = toStatePatch(parseAny(rows), { activities, volunteers, timeSlots, classes });
    if(patch.timeSlots){const errors=validateTimeSlots(patch.timeSlots);if(errors.length)throw new Error(errors.join(' '));}
    setImportPreview(patch);
    return `${patch._kind}: ${patch._summary}. Önizleme hazır; İçe aktar düğmesiyle uygulayın.`;
  }, [activities, volunteers, timeSlots, classes, applyState, onNotify]);

  // ── DAĞITIM ──────────────────────────────────────────────────────────────
  const distributePerfectly = useCallback((onlyEmpty = false) => {
    const errors = validateTimeSlots(timeSlots); if(errors.length){onNotify(errors.join(' '));return;}
    const lessonSlots = timeSlots.filter(t => t.type === 'lesson');
    if (!lessonSlots.length || !classes.length || !activities.length) {
      setActiveView('setup');onNotify('Sınıfları tıklayarak seçin ve günü oluşturup kaydedin.'); return;
    }
    if (!programVolunteers.length) { setActiveView('volunteers');onNotify('Bu okulda görevli gönüllü seçin veya yeni gönüllü ekleyin.'); return; }
    if(!activities.some(a=>a.cat!=='presentation'&&a.planningReady!==false&&a.boxCount>0&&classes.some(c=>!a.allowedGrades?.length||a.allowedGrades.includes(Number(c.name.match(/\d+/)?.[0]))))){setActiveView('activities');onNotify('Uygun düzeyleri seçip en az bir etkinliği programa dahil edin.');return;}
    setAiState('processing');
    // ağır işi bir sonraki frame'e bırak ki buton anında tepki versin
    requestAnimationFrame(() => {
      if(latestPlan.current!==appState){setAiState('idle');onNotify('Program veya başka bir ekip değişti; son düzenlemeleri korudum. Dağıtımı yeniden başlatın.');return;}
      const next = distribute({ activities, volunteers:programVolunteers, timeSlots, classes }, { onlyEmpty: !!onlyEmpty,reservations:sessionReservations(sessionId,sessions) });
      const filled = next.reduce((n, c) => n + lessonSlots.filter(sl => c.schedule[sl.id]).length, 0);
      setUndoState({activities,volunteers,timeSlots,classes}); setClasses(next); setHasDistributed(true); setAiState('idle');
      onNotify(planSummary({...appState,classes:next}));
    });
  }, [activities, volunteers, timeSlots, classes, participants,onNotify,sessionId,sessions]);

  // ── EXCEL EXPORT ─────────────────────────────────────────────────────────
  const exportToExcelCSV = () => {
    if (!classes.length || !timeSlots.length) { onNotify("Dışa aktarılacak program yok!"); return; }
    const sep = ';';
    const quote=value=>'\"'+String(value??'').replace(/\"/g,'\"\"')+'\"';
    let csv = '\uFEFF';
    csv += `"SAAT / SINIF"${sep}` + classes.map(c=>quote(c.name)).join(sep) + '\n';
    timeSlots.forEach(slot => {
      let row = `"${slot.start} - ${slot.end}"`;
      if (slot.type !== 'lesson') {
        const lbl = slot.type==='break'?'TENEFFÜS':slot.type==='lunch'?'ÖĞLE ARASI':`TOPLU SUNUM: ${slot.title||'Açılış sunumu'}`;
        row += sep + classes.map(()=>quote(lbl)).join(sep);
      } else {
        row += sep + classes.map(c => {
          const cell = (c.schedule||{})[slot.id];
          if (!cell) return '""';
          if (cell.activityId==='NO_CLASS') return '"DERS YOK"';
          return quote(`${cell.name} (${cell.lead})`);
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
    const blob = new Blob([JSON.stringify({activities,volunteers,timeSlots,classes,extras:{nametags:db.load(DB_KEYS.NAMETAG_VOLUNTEERS,[]),collage:db.load(DB_KEYS.COLLAGE_VOLUNTEERS,[]),checklist:db.load('prokordi_packing_5days_v2',[]),nameLayout:db.load('prokordi_fold_badge_v1',{}),collageTitle:db.load('prokordi_collage_title_v2','İLKYAR PROJESİ EKİBİ'),collageAddress:db.load('prokordi_collage_address_v2','')}},null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`ProkordiManager_Yedek_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    onNotify("Yedek indirildi!");
  };

  const handleImportBackup = async e => {
    const file=e.target.files?.[0];if(!file)return;
    try{
      const d=JSON.parse(await file.text());
      if(!Array.isArray(d.classes)||!Array.isArray(d.timeSlots)||!Array.isArray(d.activities)||!Array.isArray(d.volunteers))throw new Error('Geçerli program yedeği seçin.');
      const issues=validateTimeSlots(d.timeSlots);if(issues.length)throw new Error(issues.join(' '));
      if(!d.classes.every(c=>c.id&&c.name&&c.schedule&&typeof c.schedule==='object'))throw new Error('Yedekteki sınıf yapısı geçersiz.');
      if(!d.volunteers.every(v=>v&&typeof v.id==='string'&&typeof v.name==='string'&&Array.isArray(v.capabilities)))throw new Error('Gönüllü kayıtları ve yetkinlik listeleri geçersiz.');
      if(!d.activities.every(a=>a&&typeof a.id==='string'&&typeof a.name==='string'&&(!a.allowedGrades||Array.isArray(a.allowedGrades))))throw new Error('Etkinlik kayıtları geçersiz.');
      if(d.extras)for(const key of ['nametags','collage','checklist'])if(d.extras[key]&&!Array.isArray(d.extras[key]))throw new Error('Yedekteki ek liste yapısı geçersiz.');
      setImportPreview({...d,_kind:'JSON yedek',_summary:`${d.classes.length} sınıf, ${d.timeSlots.length} saat. Yedek uygulanacak; önceki program geri alınabilir.`});
    }catch(err){onNotify(err.message);}finally{e.target.value='';}
  };

  const handleDragStart=(event,clsId,slotId,cell)=>{if(cell.isLocked||cell.activityId==='NO_CLASS'){event.preventDefault();return;}dragItem.current={clsId,slotId};};
  const handleDrop = (e, targetClsId, targetSlotId) => {
    e.preventDefault();
    const src = dragItem.current;
    if (!src || (src.clsId===targetClsId && src.slotId===targetSlotId)) return;
    if (timeSlots.find(t=>t.id===targetSlotId)?.type !== 'lesson') return;
    const copy = JSON.parse(JSON.stringify(classes));
    const sC = copy.find(c=>c.id===src.clsId);
    const tC = copy.find(c=>c.id===targetClsId);
    if(!sC||!tC||!sC.schedule[src.slotId])return;
    setUndoState({activities,volunteers,timeSlots,classes});
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
    setUndoState({activities,volunteers,timeSlots,classes});
    let { activityId, name:actName, leadId } = editingSlot.data;
    if (actName && !activities.find(a=>a.id===activityId) && activityId!=='delete' && activityId!=='NO_CLASS') {
      const newAct = { id:uuid(), name:actName, cat:'science', isMust:false, boxCount:1, allowedGrades:[],planningReady:false };
      activityId = newAct.id;
      setActivities(prev=>[...prev,newAct]);
      onNotify(`"${actName}" yeni etkinlik olarak eklendi.`);

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

  // ── OTOMATİK PROGRAM OLUŞTUR ─────────────────────────────────────────────
  // Eksik ne varsa makul varsayılanı koyar, sonra tek geçişte dağıtır.
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

      {importPreview && <div className="fixed inset-0 z-[9999] bg-black/50 p-4 flex items-center justify-center"><div className="dk-card dk-border border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto"><h3 className="font-700 text-lg dk-text">İçe aktarma önizlemesi</h3><p className="text-sm dk-text my-3">{importPreview._kind}: {importPreview._summary}</p><p className="text-sm dk-text-muted mb-3">Program tablosu aynı sınıf ve saatteki hücreyi günceller. Diğer kayıtlar korunur. Uygulamadan önce mevcut durum yerel yedeğe alınır.</p><pre className="dk-card-inner dk-text p-3 rounded-xl overflow-auto text-xs max-h-64">{JSON.stringify({saatler:importPreview.timeSlots?.map(s=>`${s.start}–${s.end}`),siniflar:importPreview.classes?.map(c=>c.name),gonulluler:importPreview.volunteers?.map(v=>v.name),etkinlikler:importPreview.activities?.map(a=>a.name)},null,2)}</pre><div className="flex gap-3 mt-4"><button className="bg-indigo-600 text-white rounded-xl p-3" onClick={()=>{applyState(importPreview);setImportPreview(null);onNotify('İçe aktarıldı. Son değişikliği geri alabilirsiniz.');}}>İçe aktar</button><button className="dk-text" onClick={()=>setImportPreview(null)}>Vazgeç</button></div></div></div>}
      {/* Sub-nav */}
      <div className={`rounded-2xl border shadow-sm p-3 no-print flex flex-wrap gap-2 items-center dk-card dk-border`}>
        {[['volunteers','1 · Gönüllüler',Users],['activities','2 · Etkinlikler',Package],['setup','3 · Sınıf ve saat',BookOpen],['view','4 · Program',Calendar]].map(([id,label,Icon])=><NavBtn key={id} dark={dark} active={activeView===id} onClick={()=>setActiveView(id)} icon={<Icon size={15}/>} label={label}/>)}
        <button className="text-sm text-indigo-600 font-700 p-2" onClick={()=>{setBulkModalOpen(true);}}>Liste / tablo yapıştır</button>
        <div className="flex-1"/>
        {undoState && <button className="text-sm font-700 text-indigo-600 p-2" onClick={()=>{const restore=undoState;setActivities(restore.activities);setVolunteers(restore.volunteers);setTimeSlots(restore.timeSlots);setClasses(restore.classes);setUndoState(null);onNotify('Son değişiklik geri alındı.');}}>Son değişikliği geri al</button>}
        {activeView === 'view' && (
          <details className="dk-text text-sm"><summary className="cursor-pointer p-2">Dosya işlemleri</summary><div className="flex gap-2 flex-wrap py-2">
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
            <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-600 text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer"
              title="Excel/CSV: program tablosu, gönüllü listesi, etkinlik kataloğu ya da sınıf listesi — türü otomatik anlaşılır">
              <FileSpreadsheet size={13}/> Excel / CSV İçe Aktar
              <input type="file" accept=".xlsx,.xlsm,.csv,.txt,.tsv" className="hidden"
                onChange={e=>{ const f=e.target.files?.[0]; e.target.value=''; if(f) handleImport(f).catch(err=>onNotify(`⚠️ ${err.message}`)); }}/>
            </label>
          </div></details>
        )}
      </div>

      {activeView!=='view'&&<div className="no-print flex flex-wrap justify-between items-center gap-3 rounded-xl dk-card dk-border border p-3"><p className="dk-text-muted text-sm">{programVolunteers.length} görevli · {classes.length} sınıf · {timeSlots.filter(t=>t.type==='lesson').length} etkinlik saati</p><button className="text-indigo-600 font-700 text-sm p-2" onClick={()=>setActiveView(activeView==='volunteers'?'activities':activeView==='activities'?'setup':'view')}>Sonraki: {activeView==='volunteers'?'Etkinlikleri seç':activeView==='activities'?'Sınıf ve saatleri seç':'Programı oluştur'} →</button></div>}
      {/* ── VIEW: Program ── */}
      {activeView === 'view' && (
        <>

          {otherTeamWarnings.length>0&&<div role="alert" className="no-print bg-amber-50 text-amber-900 rounded-xl p-4 my-3 text-sm"><strong>Ekipler arası çakışma</strong>{otherTeamWarnings.map(w=><p key={w}>{w}</p>)}</div>}
          {/* AI Chat */}
          <BalkizAIChat sessionId={sessionId} appState={appState} onApply={applyState} onImport={handleImport} warnings={warnings} dark={dark}/>

          <section className="dk-card dk-border border rounded-2xl p-4 my-4 no-print"><h3 className="font-700 dk-text">Program geri bildirimi</h3><p className="text-sm dk-text my-2">{planSummary(appState)}</p><div className="flex flex-wrap gap-2">{workload(appState).map(v=><span key={v.id} className="dk-card-inner dk-text text-xs p-2 rounded-lg">{v.name}: {v.lead} sorumlu · {v.support} yardımcı · {v.minutes} dk · {v.variety} farklı etkinlik</span>)}</div><details className="mt-3 text-sm dk-text"><summary className="cursor-pointer">Tüm uyarılar ({warnings.length})</summary><div className="max-h-64 overflow-auto space-y-2 mt-2">{warnings.map((w,i)=><p key={i}>{w.msg}</p>)}</div></details></section>
          {/* Action bar */}
          <div className={`no-print flex flex-wrap gap-2 items-center rounded-2xl border p-3 shadow-sm dk-card dk-border`}>
            {/* B.A.L.K.I.Z. Dağıt */}
            <button onClick={()=>distributePerfectly(false)} disabled={aiState==='processing'||!!autoGenStep}
              title="Kilitli hücreler dışında her şeyi yeniden dağıtır"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-700 text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm transition-all active:scale-95 disabled:opacity-60">
              {aiState==='processing' ? <><RefreshCw size={15} className="animate-spin"/> İşleniyor…</> : <><Wand2 size={15}/> Programı dağıt / dengele</>}
            </button>

            {/* Sadece boşları doldur — mevcut atamalara dokunmaz */}
            <button onClick={()=>distributePerfectly(true)} disabled={aiState==='processing'||!!autoGenStep}
              title="Mevcut atamalara dokunmadan yalnızca boş hücreleri doldurur"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-700 text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-60">
              <PlusCircle size={15}/> Boşları Doldur
            </button>


          </div>

          {/* Schedule Table */}
          <h2 className="print-only" style={{fontSize:18,fontWeight:800,marginBottom:12}}>{sessions.find(s=>s.id===sessionId)?.name}</h2>
          <div className={`program-table-wrap rounded-2xl border shadow-sm overflow-x-auto print:shadow-none print:border-none print:rounded-none dk-card dk-border`}>
            {classes.length === 0 || timeSlots.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={40} className="mx-auto mb-4 text-slate-300"/>
                <p className="text-sm font-600 dk-text-muted mb-2">Program Henüz Oluşturulmadı</p>
                <p className="text-xs dk-text-muted mb-5">Önce sınıfları, başlangıç sunumunu ve günün saatlerini seçin.</p>
                <button onClick={()=>setActiveView('setup')} disabled={aiState==='processing'}
                  className="mx-auto flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-700 text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95">
                  <Zap size={16}/> Sınıfları ve günü hazırla
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
                        {slot.type!=='lesson' && <div className="text-[9px] font-700 text-indigo-400 mt-0.5 uppercase tracking-wider">{slot.type==='break'?'MOLA':slot.type==='lunch'?'YEMEK':'SUNUM'}</div>}
                      </td>
                      {slot.type !== 'lesson' ? (
                        <td colSpan={classes.length} className="p-3 text-center bg-stripes">
                          <span className="text-[11px] font-700 tracking-widest dk-text-muted uppercase">
                            {slot.type==='break'?'🔔 Teneffüs':slot.type==='lunch'?'🍽️ Öğle Arası':(slot.title||'🎤 Açılış sunumu · Tüm ekip ve sınıflar')}
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
                                      <span className="truncate">{cell.lead}{cell.support?.length ? ' + '+cell.support.length+' yardımcı' : ''}</span>
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
          <VolunteerEntry activities={activities} volunteers={volunteers} onSave={next=>{setVolunteers(next);syncVolunteers(next);if(participants)setParticipants(p=>[...new Set([...p,...next.filter(v=>!volunteers.some(old=>old.id===v.id)).map(v=>v.id)])]);onNotify('Ortak gönüllü listesi güncellendi.');}}/>
          <p className="dk-text-muted text-sm mb-4">Gönüllü listesi ortaktır. Bölündüğünüz günlerde bu okulda görevli kişileri işaretleyin.</p><div className="flex gap-3 mb-4 text-sm text-indigo-600"><button onClick={()=>setParticipants(null)}>Herkes bu okulda</button><button onClick={()=>setParticipants([])}>Seçimi temizle</button><span>{programVolunteers.length} görevli / {volunteers.length} gönüllü</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {volunteers.map(vol=>(
              <div key={vol.id} className="dk-card-inner border dk-border rounded-2xl p-4 flex flex-col gap-3 hover:border-indigo-300 transition-colors">
                <label className="text-sm dk-text flex gap-2"><input type="checkbox" checked={!participants||participants.includes(vol.id)} onChange={e=>setParticipants(prev=>{const ids=prev||volunteers.map(v=>v.id);return e.target.checked?[...new Set([...ids,vol.id])]:ids.filter(id=>id!==vol.id);})}/>Bu okulda görevli</label>
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
                  {activities.filter(a=>a.cat!=='presentation').map(act=>(
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

      {activeView==='activities'&&<ActivityManager activities={activities} onChange={setActivities} onNotify={onNotify} onRemove={act=>setConfirmModal({isOpen:true,isDanger:true,title:'Etkinliği kaldır',message:`${act.name} ve bu programdaki atamaları kaldırılacak. Diğer okul programlarındaki eski atamalar ayrıca kontrol edilmelidir.`,onConfirm:()=>{setUndoState({activities,volunteers,timeSlots,classes});setActivities(prev=>prev.filter(a=>a.id!==act.id));setClasses(prev=>prev.map(c=>({...c,schedule:Object.fromEntries(Object.entries(c.schedule||{}).filter(([,cell])=>cell.activityId!==act.id))})));setConfirmModal({isOpen:false});},onCancel:()=>setConfirmModal({isOpen:false})})}/>}

      {/* ── VIEW: Setup ── */}
      {activeView === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fadeIn">
          {/* Sınıflar */}
          <div className={cardCls}>
            <h3 className="text-base font-700 dk-text flex items-center gap-2 mb-4"><BookOpen size={18} className="text-indigo-600"/> Şubeler</h3>
            <ClassPicker classes={classes} onAdd={names=>{const clean=names.map(n=>n.trim().toLocaleUpperCase('tr')).filter(Boolean);setUndoState({activities,volunteers,timeSlots,classes});setClasses(prev=>[...prev,...[...new Set(clean)].filter(n=>!prev.some(c=>norm(c.name)===norm(n))).map(name=>({id:uuid(),name,schedule:{}}))]);}}/>
            {classes.length>0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {classes.map(c=>(
                  <span key={c.id} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-700">
                    {c.name}
                    <button aria-label={`${c.name} sınıfını kaldır`} onClick={()=>setConfirmModal({isOpen:true,isDanger:true,title:'Sınıfı kaldır',message:`${c.name} ve atamaları bu programdan kaldırılacak. Son değişikliği geri alabilirsiniz.`,onConfirm:()=>{setUndoState({activities,volunteers,timeSlots,classes});setClasses(prev=>prev.filter(x=>x.id!==c.id));setConfirmModal({isOpen:false});},onCancel:()=>setConfirmModal({isOpen:false})})} className="hover:text-red-500 transition-colors ml-1"><X size={10}/></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <TimeEditor key={JSON.stringify(timeSlots)} slots={timeSlots} classes={classes}
            onSave={next=>applyState({timeSlots:next})} onNotify={onNotify}/>

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
                <datalist id="acts-list">{activities.filter(a=>a.cat!=='presentation').map(a=><option key={a.id} value={a.name}/>)}</datalist>
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
              <div><p className="text-sm font-700 dk-text mb-2">Yardımcı gönüllüler</p><div className="flex flex-wrap gap-2">{volunteers.filter(v=>v.id!==editingSlot.data.leadId).map(v=><label key={v.id} className="text-xs dk-text flex gap-1 items-center"><input type="checkbox" checked={(editingSlot.data.support||[]).includes(v.id)} onChange={e=>setEditingSlot(p=>({...p,data:{...p.data,support:e.target.checked?[...(p.data.support||[]),v.id]:(p.data.support||[]).filter(id=>id!==v.id)}}))}/>{v.name}</label>)}</div></div>
              <div className="dk-card-inner p-4 rounded-xl border dk-border space-y-2">
                <p className="text-[10px] font-700 dk-text-muted uppercase tracking-widest mb-2">Hızlı Kapatma</p>
                <button onClick={markAsNoClass} className="w-full py-2.5 dk-card border dk-border dk-text hover:bg-slate-100 rounded-xl text-sm font-600 flex justify-center gap-2 transition-colors"><Minus size={15}/> Sadece Bu Sınıfa Kapat</button>
                <button onClick={markAllAsNoClass} className="w-full py-2.5 dk-card border border-red-100 text-red-500 hover:bg-red-50 rounded-xl text-sm font-600 flex justify-center gap-2 transition-colors"><X size={15}/> Tüm Sınıflara Kapat</button>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t dk-border">
              {editingSlot.data.activityId && (
                <button onClick={()=>{setUndoState({activities,volunteers,timeSlots,classes});setClasses(prev=>prev.map(c=>c.id!==editingSlot.clsId?c:{...c,schedule:Object.fromEntries(Object.entries(c.schedule||{}).filter(([id])=>id!==editingSlot.slotId))}));setEditingSlot(null);onNotify('Atama kaldırıldı.');}}
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
              <h3 className="text-base font-700 dk-text">Liste veya Program Yapıştır</h3>
              <button onClick={()=>setBulkModalOpen(false)} className="p-2 dk-text-muted hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X size={17}/></button>
            </div>
            <div className="p-5">
              <p className="text-xs dk-text-muted font-500 mb-3">
                Excel'den kopyaladığınız listeyi yapıştırın. <span className="text-indigo-600 font-700">Sınıf, gönüllü, etkinlik veya program tablosu.</span>{' '}
                Önce tür ve içerik önizlemesi gösterilir.
              </p>
              <textarea className="w-full h-56 border border-slate-200 p-3 rounded-xl text-sm font-400 dk-text outline-none focus:border-indigo-400 resize-none dk-card-inner focus:bg-white transition-colors font-mono"
                placeholder={"Mustafa Berke Şimşekler\tOrigami, Robotik\nEda Nur Keklik\tYaratıcı Drama\nHüseyin Vural"}
                value={bulkText} onChange={e=>setBulkText(e.target.value)}/>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t dk-border dk-card-inner">
              <button onClick={()=>setBulkModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-600 dk-card border dk-border dk-text hover:bg-slate-100 transition-colors">İptal</button>
              <button onClick={()=>{
                if(!bulkText.trim()) return;
                handleImport(bulkText).then(()=>{ setBulkText(''); setBulkModalOpen(false); })
                                      .catch(err=>onNotify(`⚠️ ${err.message}`));
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

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function ProkordiManagerApp() {
  const [activeTab,    setActiveTab]    = useState('home');
  const [dataVersion,setDataVersion]=useState(0);
  const [sessions,setSessions]=useState(()=>{migrateSharedLibrary();return loadSessions();});
  const [sessionId,setSessionId]=useState(()=>db.load('prokordi_active_session_v1','legacy'));
  const changeSessions=useCallback(list=>{saveSessions(list);setSessions(list);},[]);
  const selectSession=id=>{db.flush();db.save('prokordi_active_session_v1',id,0);setSessionId(id);};
  const [notification, setNotification] = useState(null);
  const [dark,         setDark]         = useState(() => db.load(DB_KEYS.DARK_MODE, false));
  const [cacheModal,   setCacheModal]   = useState(false);

  useEffect(() => { db.save(DB_KEYS.DARK_MODE, dark); }, [dark]);
  useEffect(()=>{saveSessions(sessions);},[sessions]);

  useEffect(()=>{const warn=()=>setNotification('Tarayıcı depolama alanı dolu. Değişiklikler henüz kalıcı kaydedilemedi; yedek indirin ve fotoğrafları küçültün.');window.addEventListener('prokordi-storage-error',warn);return()=>window.removeEventListener('prokordi-storage-error',warn);},[]);
  useEffect(()=>{const refresh=e=>{if(e.key==='prokordi_sessions_v1')setSessions(loadSessions());setDataVersion(v=>v+1);};window.addEventListener('storage',refresh);return()=>window.removeEventListener('storage',refresh);},[]);
  const showNotify = msg => { setNotification(msg); setTimeout(()=>setNotification(null), 3500); };

  const clearAllCache = () => {
    db.clearAll();
    window.location.reload();
  };

  const tabMeta = {
    scheduler: { label:'Program Yöneticisi', icon:<Calendar size={18}/> },
    badges:    { label:'İsimlik Matbaası',   icon:<Users size={18}/> },
    collage:   { label:'Görsel Kolaj',       icon:<ImageIcon size={18}/> },
    minutes:   { label:'Tikçi Listesi',      icon:<FileText size={18}/> },
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'scheduler': return <InfinityScheduler key={sessionId} sessionId={sessionId} sessions={sessions} dataVersion={dataVersion} onNotify={showNotify} dark={dark}/>;
      case 'badges':    return <NameBadges sessionId="legacy" onNotify={showNotify}/>;
      case 'collage':   return <TeamCollage onNotify={showNotify}/>;
      case 'minutes':   return <Checklist/>;
      default:          return <InfinityScheduler key={sessionId} sessionId={sessionId} sessions={sessions} dataVersion={dataVersion} onNotify={showNotify} dark={dark}/>;
    }
  };

  const appBg   = dark ? '#0f172a' : '#f1f5f9';
  const sidebarBg = dark ? '#0f172a' : 'white';
  const headerBg  = dark ? 'rgba(15,23,42,.95)' : 'rgba(255,255,255,.9)';
  const borderClr = dark ? '#1e293b' : '#e2e8f0';
  const textPrimary = dark ? '#e2e8f0' : '#1e293b';
  const textMuted   = dark ? '#64748b' : '#94a3b8';

  const resetDialog = cacheModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="reset-title" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn dk-card dk-border border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-500"><Database size={20}/></div>
              <h3 id="reset-title" className="text-base font-700 dk-text">Tamamen sıfırla</h3>
            </div>
            <p className="text-sm dk-text-muted mb-6 leading-relaxed">Bu tarayıcıdaki tüm ekipler, programlar, gönüllüler, etkinlikler, isimlikler, kolaj fotoğrafları, depo listesi, sohbetler ve ayarlar <strong className="text-red-500">kalıcı olarak</strong> silinecek. Geri alınamaz. Drive ve GitHub dosyalarına dokunulmaz.</p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setCacheModal(false)} className="px-4 py-2 rounded-xl text-sm font-600 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">İptal</button>
              <button onClick={clearAllCache} className="px-4 py-2 rounded-xl text-sm font-700 text-white bg-red-500 hover:bg-red-600 transition-all active:scale-95">Tümünü Sil ve Sıfırla</button>
            </div>
          </div>
        </div>
      );

  if(activeTab==='home')return <><style>{buildCSS(false)}</style>{resetDialog}<Welcome onOpen={setActiveTab}><button onClick={()=>setCacheModal(true)} style={{float:'right',color:'#b91c1c',fontSize:12,padding:8}}>Tamamen sıfırla</button><SessionBar sessions={sessions} currentId={sessionId} onSelect={selectSession} onChange={changeSessions}/></Welcome></>;

  return (
    <div className="app-shell" style={{ display:'flex', height:'100vh', background:appBg, color:textPrimary, overflow:'hidden' }}>
      <style>{buildCSS(dark)}{`
        .print-only {display:none}
        @media(max-width:700px){.app-shell{flex-direction:column!important}.app-sidebar{width:100%!important;flex-direction:row!important;align-items:center;overflow:auto;max-height:86px}.app-sidebar>div{display:none}.app-sidebar nav{display:flex;gap:4px;padding:6px!important;margin:0!important}.app-sidebar nav button{white-space:nowrap;width:auto!important;padding:10px!important}main header{padding:0 12px!important}#printable-section{padding:12px!important}.print-page{margin-left:0!important}}
        @media print{html,body,#root,.app-shell,main,#printable-section{height:auto!important;min-height:0!important;overflow:visible!important;background:white!important;padding:0!important;margin:0!important;max-width:none!important;display:block!important}.app-sidebar{display:none!important}.print-document{margin:0!important;padding:0!important;display:block!important;transform:none!important}.print-document>div{margin:0!important}.screen-only{display:none!important}.print-only{display:block!important}.print-page{break-after:page;page-break-after:always}.print-page:last-child{break-after:auto;page-break-after:auto}[class*=space-y-] > *{margin-top:0!important;margin-bottom:0!important}.animate-fadeIn,.animate-scaleIn,.animate-slideUp{animation:none!important;transform:none!important}.collage-print-strict{break-after:page!important}.collage-print-strict:last-child{break-after:auto!important}}
      `}</style>

      {resetDialog}
      {/* ── Sidebar ── */}
      <aside className="app-sidebar print:hidden shrink-0" style={{ width:220, background:sidebarBg, borderRight:`1px solid ${borderClr}`, display:'flex', flexDirection:'column', zIndex:20 }} >
        {/* Logo */}
        <div style={{ padding:'18px 20px', borderBottom:`1px solid ${borderClr}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(99,102,241,.35)' }}>
              <LayoutDashboard size={17} className="text-white"/>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:textPrimary, letterSpacing:'-.02em', lineHeight:1.2 }}>ProKordi</div>
              <div style={{ fontSize:13, fontWeight:800, color:textPrimary, letterSpacing:'-.02em', lineHeight:1.2 }}>Manager</div>
              <div style={{ fontSize:9, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'.1em', marginTop:1 }}>B.A.L.K.I.Z. v8.0</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 12px', marginTop:8 }} className="space-y-1">
          <SidebarItem dark={dark} id="home" icon={<Sparkles size={16}/>} label="Başlangıç" active={activeTab} onClick={setActiveTab}/>
          <SidebarItem dark={dark} id="scheduler" icon={<Calendar size={16}/>}    label="Program"         active={activeTab} onClick={setActiveTab}/>
          <SidebarItem dark={dark} id="badges"    icon={<Users size={16}/>}       label="İsimlik"         active={activeTab} onClick={setActiveTab}/>
          <SidebarItem dark={dark} id="collage"   icon={<ImageIcon size={16}/>}   label="Görsel Kolaj"    active={activeTab} onClick={setActiveTab}/>
          <SidebarItem dark={dark} id="minutes"   icon={<FileText size={16}/>}    label="Tikçi Listesi"   active={activeTab} onClick={setActiveTab}/>
        </nav>

        {/* Footer tools */}
        <div style={{ padding:'12px', borderTop:`1px solid ${borderClr}` }} className="space-y-2">
          {/* Dark mode toggle */}
          <button onClick={()=>setDark(d=>!d)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12, border:'none', cursor:'pointer', background:dark?'rgba(99,102,241,.15)':'rgba(99,102,241,.06)', color:dark?'#a5b4fc':'#6366f1', transition:'all .2s' }}>
            {dark ? <Sun size={15}/> : <Moon size={15}/>}
            <span style={{ fontSize:12, fontWeight:600 }}>{dark?'Aydınlık Mod':'Karanlık Mod'}</span>
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
            <button onClick={()=>setCacheModal(true)} aria-label="Tamamen sıfırla" title="Tamamen sıfırla" style={{padding:8,borderRadius:10,color:'#b91c1c',background:'#fef2f2',border:'none',cursor:'pointer'}}><Trash size={17}/></button>
            <Saat dark={dark}/>
            <button onClick={()=>window.print()}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:12, fontSize:13, fontWeight:700, color:'white', background:'#1e293b', border:'none', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,.1)', transition:'all .2s' }}>
              <Printer size={14}/> Yazdır
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding:24, minHeight:'calc(100vh - 60px)', maxWidth:1700, margin:'0 auto' }} id="printable-section" className="print:p-0">
          {(activeTab==='scheduler')&&<SessionBar sessions={sessions} currentId={sessionId} onSelect={selectSession} onChange={changeSessions}/>}
          {renderContent()}
        </div>

        {/* Notification */}
        {notification && (
          <div className="no-print fixed bottom-6 right-6 animate-notification print:hidden z-50" style={{ background:'#0f172a', color:'white', padding:'12px 20px', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,.25)', display:'flex', alignItems:'center', gap:12, borderLeft:'4px solid #10b981' }}>
            <CheckCircle2 size={17} style={{ color:'#10b981', flexShrink:0 }}/>
            <span style={{ fontSize:13, fontWeight:600 }}>{notification}</span>
          </div>
        )}
      </main>
    </div>
  );
}