/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calendar, Users, FileText, Image as ImageIcon, Printer, 
  Plus, Trash2, Upload, X, CheckCircle2, BookOpen, GraduationCap, 
  Package, Sparkles, RefreshCw, Wand2, Zap, ChevronDown, ChevronUp,
  Type, Minus, PlusCircle, Maximize2, Smile,
  Camera, Settings2, MoveVertical, Maximize,
  Download, UploadCloud, Search, BarChart3, AlertTriangle
} from 'lucide-react';

// --- DATABASE KEYS (V30 - TEMİZ BAŞLANGIÇ İÇİN GÜNCELLENDİ) ---
const DB_KEYS = {
  ACTIVITIES: 'activities_v30',
  VOLUNTEERS: 'shared_volunteers_v30', 
  TIMESLOTS: 'timeSlots_v30',
  CLASSES: 'classes_v30',
  NAMETAG_VOLUNTEERS: 'nametags_v30',
  COLLAGE_VOLUNTEERS: 'collage_v30'
};

// --- DATABASE SIMULATION ---
const db = {
  save: (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; } 
    catch (e) { return false; }
  },
  load: (key, defaultValue) => {
    try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : defaultValue; } 
    catch (e) { return defaultValue; }
  }
};

const syncVolunteers = (sourceData = null) => {
  try {
    const mainVolunteers = sourceData || db.load(DB_KEYS.VOLUNTEERS, []);
    db.save(DB_KEYS.VOLUNTEERS, mainVolunteers);
    db.save(DB_KEYS.NAMETAG_VOLUNTEERS, mainVolunteers);
    db.save(DB_KEYS.COLLAGE_VOLUNTEERS, mainVolunteers);
    return mainVolunteers;
  } catch (e) { return []; }
};

const uuid = () => Math.random().toString(36).substr(2, 9);

const IMAGES = {
  NAME_BG: "https://i.ibb.co/9Hcchfq8/ntaraf.png", 
  QUESTION_BG: "https://i.ibb.co/mVYxB8j2/Ekran-g-r-nt-s-2026-01-12-202232.png" 
};

// --- ÖZEL ARAYÜZ (MODAL) BİLEŞENLERİ ---
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isDanger = false, confirmText = "Onayla" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 transform transition-all scale-100">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {isDanger ? <AlertTriangle size={24}/> : <CheckCircle2 size={24}/>}
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
        </div>
        <p className="text-slate-600 mb-8 text-sm font-medium leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => { if(onCancel) onCancel(); }} className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">İptal</button>
          <button onClick={() => { if(onConfirm) onConfirm(); }} className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const PromptModal = ({ isOpen, title, defaultValue, onConfirm, onCancel }) => {
  const [val, setVal] = useState(defaultValue || "");
  useEffect(() => { setVal(defaultValue || ""); }, [defaultValue, isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4">{title}</h3>
        <input 
          type="text" autoFocus
          value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onConfirm(val)}
          className="w-full border-2 border-slate-200 p-3 rounded-xl mb-6 font-bold outline-none focus:border-indigo-500 text-slate-700"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">İptal</button>
          <button onClick={() => onConfirm(val)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">Kaydet</button>
        </div>
      </div>
    </div>
  );
};


// --- ORTAK BİLEŞENLER ---
const Saat = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString("tr-TR", {hour:'2-digit', minute:'2-digit', second:'2-digit'})), 1000);
    return () => clearInterval(interval);
  }, []);
  return <div className="text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner tracking-widest text-sm flex items-center gap-2">⏱ {time}</div>;
};

const NavBtn = ({active, onClick, icon, label}) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-xl font-bold flex gap-2 items-center transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-indigo-200 no-print'}`}>
     {icon} {label}
  </button>
);

// --- B.A.L.K.I.Z CONSOLE ---
const BalkizConsole = ({ warnings = [], aiState = 'idle', isOpen = true, onClose = () => {}, hasDistributed = false, activeAction = null }) => {
  const [displayText, setDisplayText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const debounceTimerRef = useRef(null);
  const lastMsgRef = useRef("");

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      let msg = "";
      if (aiState === 'processing') msg = "Üstünde Çalışıyorum... Lütfen bekleyin.";
      else if (activeAction) msg = "Değişiklikleri kaydediyorum, her şey yolunda.";
      else if (!hasDistributed && warnings.length === 0) msg = "Merhaba. Ben B.A.L.K.I.Z. Sana yardımcı olmak için buradayım.";
      else if (hasDistributed && warnings.length === 0) msg = "Sistem kusursuz! Tüm gönüllüler çakışmasız yerleştirildi.";
      else if (warnings.length > 0) msg = `Kontrol ettim. ${warnings.length} adet dikkat gerektiren uyarı tespit ettim.`;

      if (msg !== lastMsgRef.current) {
        lastMsgRef.current = msg;
        setTargetText(msg);
      }
    }, 600); 
  }, [warnings.length, aiState, hasDistributed, activeAction]);

  useEffect(() => { if (targetText && isOpen) { setIsAnimating(true); setDisplayText(""); } }, [targetText, isOpen]);
  useEffect(() => {
    if (!isOpen || !targetText) return;
    if (displayText.length < targetText.length) {
      const timeout = setTimeout(() => setDisplayText(targetText.slice(0, displayText.length + 1)), 25);
      return () => clearTimeout(timeout);
    } else {
      if (isAnimating && aiState !== 'processing') {
         const stopTimer = setTimeout(() => setIsAnimating(false), 2000);
         return () => clearTimeout(stopTimer);
      }
    }
  }, [displayText, targetText, isOpen, isAnimating, aiState]);

  const frameActive = aiState === 'processing' || isAnimating || activeAction;

  return (
    <div className={`console-panel w-full relative z-40 mb-6 rounded-3xl ${isOpen ? 'open' : 'closed'}`}>
       {onClose && <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full hover:bg-slate-100"><X size={18}/></button>}
       <div className="flex flex-col md:flex-row gap-6 items-start max-w-5xl mx-auto">
          <div className="shrink-0 pt-1 flex flex-col items-center">
             <div className="ai-avatar-wrapper">
                <div className={`ai-rainbow-liquid ${frameActive ? 'active' : ''}`}></div>
                <div className={`ai-core-container ${frameActive ? 'active' : 'idle'}`}><Sparkles className="text-indigo-600 fill-indigo-100" size={28}/></div>
             </div>
             <div className="mt-3 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">B.A.L.K.I.Z.</div>
          </div>
          <div className="flex-1 w-full">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                {aiState === 'processing' ? <><RefreshCw size={12} className="animate-spin text-indigo-500"/> İşleniyor</> : <><Zap size={12} className="text-amber-500"/> Sistem Raporu</>}
             </h3>
             <p className="text-slate-800 text-lg font-medium leading-relaxed typing-cursor min-h-[3rem]">{displayText}</p>
             {aiState !== 'processing' && warnings.length > 0 && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                   {warnings.map((w, i) => (
                      <div key={i} className={`p-3 rounded-xl border border-slate-100 text-xs flex items-center gap-3 bg-white shadow-sm ${w.type === 'stock' || w.type === 'protocol' ? 'border-l-4 border-l-fuchsia-500' : 'border-l-4 border-l-slate-400'}`}>
                         <span className="font-semibold text-slate-700">{w.msg}</span>
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};


// --- MODULE 1: INFINITY SCHEDULER (TAM GÜNCELLENMİŞ VERSİYON) ---
function InfinityScheduler({ onNotify }) {
  const [activeView, setActiveView] = useState('view');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

  const LOGIC_CONFIG = {
    primaryBlacklist: ['kimya', 'fizik', 'robot', 'yapay zeka','geleceğe mektup'],
    primaryWhitelist: ['yaratıcı drama', 'origami', 'yüz boyama', 'pino mino', 'müzik', 'resim'],
    middleSchoolPreferred: ['kimya', 'fizik', 'göremediğimiz canavarlar', 'fen', 'matematik', 'robot', 'masa deneyleri', 'vr', 'müzik', 'edebiyat']
  };

  const [activities, setActivities] = useState(db.load(DB_KEYS.ACTIVITIES, []));
  const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.VOLUNTEERS, []));
  const [timeSlots, setTimeSlots] = useState(db.load(DB_KEYS.TIMESLOTS, []));
  const [classes, setClasses] = useState(db.load(DB_KEYS.CLASSES, []));

  const [warnings, setWarnings] = useState([]);
  const [aiState, setAiState] = useState('idle');
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [hasDistributed, setHasDistributed] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const dragItem = useRef();
  const fileInputRef = useRef(null);

  useEffect(() => { db.save(DB_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { db.save(DB_KEYS.VOLUNTEERS, volunteers); syncVolunteers(volunteers); }, [volunteers]); 
  useEffect(() => { db.save(DB_KEYS.TIMESLOTS, timeSlots); }, [timeSlots]);
  useEffect(() => { db.save(DB_KEYS.CLASSES, classes); }, [classes]);

  const detectGrade = (className) => {
    if (!className) return 0;
    const str = className.toString().toLowerCase();
    if (str.includes('ana') || str.includes('kreş')) return 0;
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };
  const normalize = (text) => text ? text.toLocaleLowerCase('tr').trim() : '';

  // EXCEL DÜZELTİLDİ: Virgül yerine Noktalı Virgül (;) ve Çift Tırnak Kullanıldı. UTF-8 BOM eklendi.
  const exportToExcelCSV = () => {
    if(classes.length === 0 || timeSlots.length === 0) {
      onNotify("Dışa aktarılacak program bulunamadı!");
      return;
    }
    const sep = ';';
    let csvContent = '\uFEFF'; 
    csvContent += `"SAAT / SINIF"${sep}` + classes.map(c => `"${c.name}"`).join(sep) + '\n';

    timeSlots.forEach(slot => {
      let row = `"${slot.start} - ${slot.end}"`;
      if (slot.type !== 'lesson') {
         const label = slot.type === 'break' ? 'TENEFFÜS' : (slot.type === 'lunch' ? 'ÖĞLE ARASI' : 'MOLA');
         row += sep + classes.map(() => `"${label}"`).join(sep);
      } else {
         row += sep + classes.map(c => {
           const cell = c.schedule[slot.id];
           if (!cell) return '""';
           if (cell.activityId === 'NO_CLASS') return '"DERS YOK"';
           return `"${cell.name} (${cell.lead})"`;
         }).join(sep);
      }
      csvContent += row + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ders_Programi_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify("Excel başarıyla indirildi!");
  };

  const exportBackupJSON = () => {
    const backupData = { activities, volunteers, timeSlots, classes };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `KordiManager_Yedek_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify("Sistem Yedeği indirildi!");
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.classes && importedData.timeSlots) {
          setConfirmModal({
            isOpen: true, isDanger: true,
            title: 'Yedeği Yükle',
            message: 'Mevcut sistemdeki TAHMİNİ TÜM VERİ silinecek ve yedek yüklenecek. Emin misiniz?',
            onConfirm: () => {
              setClasses(importedData.classes || []);
              setTimeSlots(importedData.timeSlots || []);
              if (importedData.activities) setActivities(importedData.activities);
              if (importedData.volunteers) {
                 setVolunteers(importedData.volunteers);
                 syncVolunteers(importedData.volunteers); 
              }
              setHasDistributed(false);
              setConfirmModal({ isOpen: false });
              onNotify("Yedek başarıyla yüklendi!");
            },
            onCancel: () => setConfirmModal({ isOpen: false })
          });
        }
      } catch (err) { onNotify("Geçersiz dosya!"); }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const calculateConflicts = useCallback(() => {
    const newWarnings = [];
    const lessonSlots = timeSlots.filter(t => t.type === 'lesson');
    if (classes.every(c => Object.keys(c.schedule).length === 0)) return [];

    classes.forEach(cls => {
      const grade = detectGrade(cls.name);
      const actCounts = {}, volCounts = {};
      Object.entries(cls.schedule).forEach(([slotId, slot]) => {
        if (slot.activityId === 'NO_CLASS') return;
        const activity = activities.find(a => a.id === slot.activityId);
        if (activity) {
            if (activity.allowedGrades && activity.allowedGrades.length > 0) {
                if (!activity.allowedGrades.includes(grade)) newWarnings.push({ type: 'protocol', msg: `Seviye Hatası: ${cls.name} -> "${activity.name}" uygun değil.` });
            } else {
                const actName = normalize(activity.name);
                if (grade > 0 && grade <= 4 && LOGIC_CONFIG.primaryBlacklist.some(bad => actName.includes(bad))) newWarnings.push({ type: 'protocol', msg: `Pedagoji: ${cls.name} için "${slot.name}" ağır gelebilir.` });
            }
        }
        if (slot.activityId) actCounts[slot.activityId] = (actCounts[slot.activityId] || 0) + 1;
        if (slot.leadId && slot.leadId !== 'none') volCounts[slot.leadId] = (volCounts[slot.leadId] || 0) + 1;
      });

      Object.entries(actCounts).forEach(([id, n]) => {
        if (n > 1) newWarnings.push({ type: 'duplicate_act', msg: `${cls.name} -> "${activities.find(a=>a.id===id)?.name}" ${n} kere tekrar!` });
      });
      Object.entries(volCounts).forEach(([id, n]) => {
        const v = volunteers.find(v=>v.id===id);
        if (n > 1) newWarnings.push({ type: 'duplicate_vol', msg: `${cls.name} -> ${v?.name} bu sınıfa ${n} kere giriyor.` });
      });
      lessonSlots.forEach(slot => {
        if (!cls.schedule[slot.id]) newWarnings.push({ type: 'empty', msg: `${cls.name} sınıfının ${slot.start} saati boş!` });
      });
    });

    lessonSlots.forEach(slot => {
      const volMap = {};
      const actUsage = {};
      classes.forEach(cls => {
        const cell = cls.schedule[slot.id];
        if (cell && cell.activityId !== 'NO_CLASS') {
          if (cell.leadId && cell.leadId !== 'none') {
            if (!volMap[cell.leadId]) volMap[cell.leadId] = [];
            volMap[cell.leadId].push(cls.name);
            const vol = volunteers.find(v => v.id === cell.leadId);
            if (vol && !vol.capabilities.includes(cell.activityId)) newWarnings.push({ type: 'competency', msg: `${vol.name}, "${cell.name}" yetkinliğine sahip değil!` });
          }
          if (cell.activityId) actUsage[cell.activityId] = (actUsage[cell.activityId] || 0) + 1;
        }
      });
      Object.keys(volMap).forEach(vId => {
        if (volMap[vId].length > 1) {
           const v = volunteers.find(v=>v.id===vId);
           newWarnings.push({ type: 'conflict', msg: `${v?.name} ${slot.start} saatinde aynı anda ${volMap[vId].length} sınıfta!` });
        }
      });
      Object.keys(actUsage).forEach(aId => {
        const act = activities.find(a => a.id === aId);
        if (act && actUsage[aId] > (act.boxCount || 99)) newWarnings.push({ type: 'stock', msg: `${act.name} yetersiz! (${actUsage[aId]} atanmış)` });
      });
    });
    return newWarnings;
  }, [classes, activities, timeSlots, volunteers]);

  useEffect(() => { setWarnings(calculateConflicts()); }, [calculateConflicts]);

  const checkConstraints = useCallback((activity, className) => {
    if (!activity) return false;
    const grade = detectGrade(className);
    const safeGrades = activity.allowedGrades || [];
    if (safeGrades.length > 0) return safeGrades.includes(grade);
    const nAct = activity.name ? activity.name.toLocaleLowerCase('tr').trim() : '';
    if (grade > 0 && grade <= 4 && LOGIC_CONFIG.primaryBlacklist.some(bad => nAct.includes(bad))) return false;
    if (grade >= 5 && (nAct.includes('ilkokul') || (nAct.includes('boyama') && !nAct.includes('tuval')))) return false;
    return true;
  }, []);

  const distributePerfectly = () => {
    setAiState('processing'); setIsConsoleOpen(true); setHasDistributed(true);
    setTimeout(() => {
      let newClasses = JSON.parse(JSON.stringify(classes));
      newClasses.forEach(c => { Object.keys(c.schedule).forEach(s => { if(!c.schedule[s].isLocked) delete c.schedule[s]; }); });
      let volLoad = {}; volunteers.forEach(v => volLoad[v.id] = 0);

      const findBestLead = (actId, slotId, currentClassId, currentClasses) => {
        const act = activities.find(a => a.id === actId);
        let usage = 0; currentClasses.forEach(c => { if (c.schedule[slotId]?.activityId === actId) usage++; });
        if (usage >= (act.boxCount || 99)) return null;
        
        const capable = volunteers.filter(v => v.capabilities.includes(actId));
        const available = capable.filter(v => {
          let busy = false; currentClasses.forEach(c => { if (c.id !== currentClassId && c.schedule[slotId]?.leadId === v.id) busy = true; }); return !busy;
        });
        if (available.length === 0) return null;
        available.sort((a, b) => volLoad[a.id] - volLoad[b.id]);
        return available[0];
      };

      const lessonSlots = timeSlots.filter(t => t.type === 'lesson');
      const mustActivities = activities.filter(a => a.isMust);
      let shuffledClasses = [...newClasses].sort(() => Math.random() - 0.5);

      shuffledClasses.forEach(cls => {
        let freeSlots = [...lessonSlots].filter(s => !cls.schedule[s.id]).sort(() => Math.random() - 0.5);
        mustActivities.forEach(must => {
          if (!checkConstraints(must, cls.name)) return; 
          for (let i = 0; i < freeSlots.length; i++) {
            const slot = freeSlots[i];
            const lead = findBestLead(must.id, slot.id, cls.id, newClasses);
            if (lead) {
              newClasses.find(c => c.id === cls.id).schedule[slot.id] = { activityId: must.id, name: must.name, cat: must.cat, isMust: true, lead: lead.name, leadId: lead.id, support: [] };
              volLoad[lead.id]++; freeSlots.splice(i, 1); break;
            }
          }
        });
      });

      newClasses.forEach(cls => {
        lessonSlots.forEach(slot => {
          if (!cls.schedule[slot.id]) {
            const takenIds = Object.values(cls.schedule).map(s => s.activityId);
            let candidates = activities.filter(a => !a.isMust && !takenIds.includes(a.id) && checkConstraints(a, cls.name));
            candidates.sort(() => Math.random() - 0.5); // Simple shuffle for variety
            for (let act of candidates) {
              const lead = findBestLead(act.id, slot.id, cls.id, newClasses);
              if (lead) {
                cls.schedule[slot.id] = { activityId: act.id, name: act.name, cat: act.cat, isMust: false, lead: lead.name, leadId: lead.id, support: [] };
                volLoad[lead.id]++; break;
              }
            }
          }
        });
      });

      setClasses(newClasses); setAiState('idle'); onNotify('B.A.L.K.I.Z. atamaları tamamladı!');
    }, 1500);
  };
const addTimeSlot = (durationMins, type) => {
    let lastEnd = timeSlots.length > 0 ? timeSlots[timeSlots.length-1].end : "09:00";
    let [h, m] = lastEnd.split(':').map(Number);
    m += durationMins;
    h += Math.floor(m/60);
    m = m%60;
    setTimeSlots([...timeSlots, {id: uuid(), start: lastEnd, end: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, type }]);
  };
  const handleDragStart = (e, clsId, slotId, data) => { if (data && !data.isLocked) dragItem.current = { clsId, slotId, data }; };
  const handleDrop = (e, targetClsId, targetSlotId) => {
    e.preventDefault();
    const src = dragItem.current;
    if (!src || (src.clsId === targetClsId && src.slotId === targetSlotId)) return;
    if (timeSlots.find(t=>t.id===targetSlotId)?.type !== 'lesson') return;

    const copy = JSON.parse(JSON.stringify(classes));
    const sClass = copy.find(c => c.id === src.clsId);
    const tClass = copy.find(c => c.id === targetClsId);
    if(tClass.schedule[targetSlotId]?.isLocked || sClass.schedule[src.slotId]?.isLocked) { onNotify("Kilitli (Ders Yok) alanlar taşınamaz!"); return; }

    const sData = sClass.schedule[src.slotId];
    const tData = tClass.schedule[targetSlotId];
    delete sClass.schedule[src.slotId];
    tClass.schedule[targetSlotId] = sData;
    if (tData) sClass.schedule[src.slotId] = tData;
    setClasses(copy);
  };

  const handleSlotClick = (clsId, slotId, data) => {
    if (timeSlots.find(t=>t.id===slotId)?.type !== 'lesson') return;
    setEditingSlot({ clsId, slotId, data: data ? { ...data, support: data.support || [] } : { name: '', activityId: '', lead: '', leadId: '', support: [] } });
  };

  const saveSlotEdit = () => {
    if (!editingSlot) return;
    let { activityId, name: actName, leadId } = editingSlot.data;
    
    if (actName && !activities.find(a => a.id === activityId) && activityId !== 'delete' && activityId !== 'NO_CLASS') {
      const newAct = { id: Math.random().toString(36).substr(2, 9), name: actName, cat: 'science', isMust: false, boxCount: 20, allowedGrades: [] };
      activityId = newAct.id;
      setActivities([...activities, newAct]);
      onNotify(`"${actName}" yeni etkinlik olarak eklendi.`);
      if (leadId && leadId !== 'none') {
        setVolunteers(volunteers.map(v => v.id === leadId && !v.capabilities.includes(newAct.id) ? { ...v, capabilities: [...v.capabilities, newAct.id] } : v));
      }
    }
    
    setClasses(classes.map(c => {
      if (c.id !== editingSlot.clsId) return c;
      const newSched = { ...c.schedule };
      if (activityId === 'delete') delete newSched[editingSlot.slotId];
      else newSched[editingSlot.slotId] = { ...editingSlot.data, activityId, name: actName };
      return { ...c, schedule: newSched };
    }));
    setEditingSlot(null);
  };
  const clearClassSchedule = (clsId, clsName) => {
    setClasses(classes.map(c => c.id === clsId ? { ...c, schedule: {} } : c));
    onNotify(`${clsName} planı temizlendi.`);
  };

  const clearAllSchedules = () => {
    setClasses(classes.map(c => ({ ...c, schedule: {} })));
    onNotify("Tüm planlama sıfırlandı.");
    setHasDistributed(false);
  };

  const markAsNoClass = () => {
    if (!editingSlot) return;
    setClasses(classes.map(c => {
      if (c.id !== editingSlot.clsId) return c;
      const newSched = { ...c.schedule };
      newSched[editingSlot.slotId] = { activityId: 'NO_CLASS', name: 'DERS YOK', cat: 'none', isMust: false, lead: '-', leadId: 'none', isLocked: true };
      return { ...c, schedule: newSched };
    }));
    setEditingSlot(null);
    onNotify("Bu saat ilgili sınıf için kapatıldı.");
  };

  const markAllAsNoClass = () => {
    if (!editingSlot) return;
    setClasses(classes.map(c => {
      const newSched = { ...c.schedule };
      newSched[editingSlot.slotId] = { activityId: 'NO_CLASS', name: 'DERS YOK', cat: 'none', isMust: false, lead: '-', leadId: 'none', isLocked: true };
      return { ...c, schedule: newSched };
    }));
    setEditingSlot(null);
    onNotify("Bu saat tüm sınıflar için kapatıldı.");
  };
  return (
    <div className="space-y-6 relative">
      <ConfirmModal {...confirmModal} />

      {/* TOP NAVIGATION */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 no-print flex flex-wrap gap-3 items-center relative z-50">
        <NavBtn active={activeView==='view'} onClick={()=>setActiveView('view')} icon={<Calendar size={18}/>} label="Ders Programı" />
        <NavBtn active={activeView==='setup'} onClick={()=>setActiveView('setup')} icon={<BookOpen size={18}/>} label="Sınıf & Zaman" />
        <NavBtn active={activeView==='activities'} onClick={()=>setActiveView('activities')} icon={<Package size={18}/>} label="Etkinlikler" />
        <NavBtn active={activeView==='volunteers'} onClick={()=>setActiveView('volunteers')} icon={<GraduationCap size={18}/>} label="Gönüllüler" />
        
        <div className="flex-1"></div>
        
        {activeView === 'view' && (
          <div className="flex gap-2 pl-4 border-l border-slate-100">
             <button onClick={exportToExcelCSV} className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors" title="Excel'e İndir (CSV)">
                <Download size={16}/> Excel
             </button>
             <button onClick={exportBackupJSON} className="bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <Download size={16}/> Yedek Al
             </button>
             <label className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors">
                <UploadCloud size={16}/> Yedek Yükle
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportBackup} />
             </label>
          </div>
        )}
      </div>

      {activeView === 'view' && (
        <>
          <BalkizConsole warnings={warnings} aiState={aiState} isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} hasDistributed={hasDistributed} />
          
          <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-200 no-print">
            <button onClick={distributePerfectly} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-8 py-3 rounded-2xl font-black text-sm flex gap-2 items-center shadow-lg shadow-fuchsia-200 transform active:scale-95 transition-all">
              <Wand2 size={20} /> B.A.L.K.I.Z. Dağıtımı Başlat
            </button>
            <button onClick={() => setConfirmModal({
               isOpen: true, isDanger: true, title: 'Tüm Planı Temizle', message: 'Tüm sınıfların programı tamamen silinecek. Emin misiniz?',
               onConfirm: () => { clearAllSchedules(); setConfirmModal({ isOpen: false }); },
               onCancel: () => setConfirmModal({ isOpen: false })
            })} className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ml-auto">
              <Trash2 size={18} /> Planı Sıfırla
            </button>
          </div>

          <div className="bg-white p-8 shadow-sm rounded-3xl border border-slate-200 print:shadow-none print:p-0 print:border-none w-full max-w-[297mm] mx-auto overflow-x-auto">
            <table className="w-full border-collapse border-2 border-slate-900 text-sm bg-white">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-2 border-slate-900 p-3 w-28 font-black text-slate-800">Saat</th>
                  {classes.map(c => (
                    <th key={c.id} className="border-2 border-slate-900 p-3 font-black text-lg relative group text-slate-800">
                      {c.name}
                      <button onClick={() => setConfirmModal({
                         isOpen: true, isDanger: true, title: 'Sınıfı Temizle', message: `${c.name} sınıfının tüm dersleri silinecek.`,
                         onConfirm: () => { clearClassSchedule(c.id, c.name); setConfirmModal({ isOpen: false }); },
                         onCancel: () => setConfirmModal({ isOpen: false })
                      })} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-lg transition-all print:hidden" title="Sınıf Planını Temizle">
                        <Trash2 size={16}/>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.id} className={slot.type !== 'lesson' ? 'bg-slate-100/50' : ''}>
                    <td className="border-2 border-slate-900 p-2 font-black text-center align-middle text-slate-700">
                      {slot.start}<br/>-<br/>{slot.end}
                    </td>
                    {slot.type !== 'lesson' ? (
                      <td colSpan={classes.length} className="border-2 border-slate-900 p-4 text-center font-black tracking-[0.3em] opacity-50 text-base text-slate-700 bg-stripes">
                        {slot.type === 'break' ? '🔔 TENEFFÜS' : slot.type === 'lunch' ? '🍽️ ÖĞLE YEMEĞİ' : 'MOLA'}
                      </td>
                    ) : (
                      classes.map(cls => {
                        const cell = cls.schedule[slot.id];
                        const isNoClass = cell?.activityId === 'NO_CLASS';
                        return (
                          <td key={cls.id} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, cls.id, slot.id)} className="border-2 border-slate-900 p-1.5 h-28 align-top print:h-auto bg-white">
                            {cell ? (
                              <div draggable={!isNoClass} onDragStart={e=>handleDragStart(e, cls.id, slot.id, cell)} onClick={()=>handleSlotClick(cls.id, slot.id, cell)} className={`h-full p-2.5 rounded-xl cursor-pointer flex flex-col justify-center border-2 print:border-none transition-all hover:scale-[1.02] active:scale-95 ${isNoClass ? 'bg-slate-100 border-dashed border-slate-300 opacity-60 text-center items-center' : cell.isMust ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-indigo-50/50 border-indigo-100 shadow-sm'}`}>
                                <div className={`text-[13px] font-black leading-tight ${isNoClass ? 'text-slate-500 uppercase tracking-widest' : 'text-slate-800'}`}>
                                  {cell.name} {cell.isMust && <span className="text-rose-600 ml-1">⚠</span>}
                                </div>
                                {!isNoClass && (
                                  <div className="mt-auto text-[11px] font-bold text-slate-600 pt-2 flex items-center gap-1">
                                    <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] shadow-sm shrink-0">👤</div> 
                                    <span className="truncate">{cell.lead}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div onClick={()=>handleSlotClick(cls.id, slot.id, null)} className="h-full flex items-center justify-center text-slate-200 hover:bg-slate-50 hover:text-indigo-400 cursor-pointer print:hidden transition-all rounded-xl border-2 border-dashed border-transparent hover:border-indigo-200">
                                <Plus size={28} strokeWidth={3}/>
                              </div>
                            )}
                          </td>
                        )
                      })
                    )}
                  </tr>
                ))}
                {timeSlots.length === 0 && (
                  <tr><td colSpan={classes.length + 1} className="p-12 text-center text-slate-400 font-bold border-2 border-slate-900">Program boş. Önce Sınıf & Zaman sekmesinden ayar yapın.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- GÖNÜLLÜLER SEKME İÇERİĞİ --- */}
{/* --- GÖNÜLLÜLER SEKME İÇERİĞİ --- */}
      {activeView === 'volunteers' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-fadeIn">
            <h3 className="font-black text-2xl mb-6 text-slate-800 flex items-center gap-3"><Users className="text-indigo-600"/> Gönüllü Yönetimi</h3>
            <div className="flex flex-wrap gap-3 mb-8">
                <input 
                   type="text" id="newVol"
                   placeholder="Yeni Gönüllü Adı Soyadı yazın..." 
                   className="border-2 border-slate-200 p-3 rounded-2xl text-base flex-1 outline-none focus:border-indigo-500 font-bold bg-slate-50 focus:bg-white transition-colors" 
                   onKeyDown={e => {
                     if (e.key === 'Enter' && e.target.value.trim()) {
                        const newVol = { id: uuid(), name: e.target.value.trim(), capabilities: [] };
                        const updated = [...volunteers, newVol];
                        setVolunteers(updated); syncVolunteers(updated); e.target.value = ''; onNotify("Gönüllü eklendi.");
                     }
                   }}
                />
                <button onClick={() => {
                   const val = document.getElementById('newVol').value.trim();
                   if(val) {
                      const newVol = { id: uuid(), name: val, capabilities: [] };
                      const updated = [...volunteers, newVol];
                      setVolunteers(updated); syncVolunteers(updated); document.getElementById('newVol').value = ''; onNotify("Gönüllü eklendi.");
                   }
                }} className="bg-indigo-600 text-white px-8 rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2">
                   <Plus size={20}/> Ekle
                </button>
                <button onClick={() => setBulkModalOpen(true)} className="bg-emerald-600 text-white px-6 rounded-2xl font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2">
                   <Users size={20}/> Toplu Ekle (Excel)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {volunteers.map(vol => (
                    <div key={vol.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col h-full shadow-sm hover:border-indigo-200 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                            <input 
                               value={vol.name} 
                               onChange={(e) => { const updated = volunteers.map(v => v.id === vol.id ? {...v, name: e.target.value} : v); setVolunteers(updated); syncVolunteers(updated); }} 
                               className="font-black text-lg text-slate-800 bg-transparent border-b-2 border-transparent focus:border-indigo-300 w-full outline-none transition-colors" 
                            />
                            <button onClick={() => setConfirmModal({
                               isOpen: true, isDanger: true, title: 'Gönüllüyü Sil', message: `${vol.name} adlı gönüllü silinecek. Emin misiniz?`,
                               onConfirm: () => { const updated = volunteers.filter(v => v.id !== vol.id); setVolunteers(updated); syncVolunteers(updated); setConfirmModal({ isOpen: false }); onNotify("Silindi."); },
                               onCancel: () => setConfirmModal({ isOpen: false })
                            })} className="text-slate-400 hover:text-red-500 ml-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100 hover:border-red-200 transition-colors">
                               <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="max-h-56 overflow-y-auto grid gap-2 pr-2 custom-scrollbar border-t border-slate-200/60 pt-4">
                            {activities.map(act => (
                                <label key={act.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm cursor-pointer transition-all active:scale-[0.98] ${vol.capabilities.includes(act.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 font-medium'}`}>
                                    <input type="checkbox" checked={vol.capabilities.includes(act.id)} onChange={() => {
                                        const updated = volunteers.map(v => {
                                            if (v.id !== vol.id) return v;
                                            const caps = v.capabilities.includes(act.id) ? v.capabilities.filter(id => id !== act.id) : [...v.capabilities, act.id];
                                            return { ...v, capabilities: caps };
                                        });
                                        setVolunteers(updated); syncVolunteers(updated);
                                    }} className="hidden" />
                                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${vol.capabilities.includes(act.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 border-slate-300'}`}>
                                        {vol.capabilities.includes(act.id) && <CheckCircle2 size={14} strokeWidth={3}/>}
                                    </div>
                                    <span className="truncate">{act.name}</span>
                                </label>
                            ))}
                            {activities.length === 0 && <span className="text-xs text-slate-400 italic">Önce etkinlik ekleyin.</span>}
                        </div>
                    </div>
                ))}
                {volunteers.length === 0 && <div className="col-span-full py-12 text-center text-slate-400 font-bold text-lg border-2 border-dashed border-slate-200 rounded-3xl">Henüz gönüllü eklenmemiş.</div>}
            </div>
        </div>
      )}

      {/* --- ETKİNLİKLER SEKME İÇERİĞİ --- */}
 {/* --- ETKİNLİKLER SEKME İÇERİĞİ --- */}
      {activeView === 'activities' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-fadeIn max-w-5xl mx-auto">
            <h3 className="font-black text-2xl mb-6 text-slate-800 flex items-center gap-3"><Package className="text-indigo-600"/> Etkinlik Kataloğu</h3>
            
            {/* YENİ ETKİNLİK EKLEME ALANI (ZORUNLU, KUTU SAYISI, DEFAULT TÜM SINIFLAR) */}
            <div className="flex flex-wrap gap-3 mb-8 bg-slate-50 p-4 rounded-3xl border border-slate-200 items-center shadow-inner">
                <input 
                   type="text" id="newActName"
                   placeholder="Yeni Etkinlik Adı yazın..." 
                   className="border-2 border-slate-200 p-3 rounded-2xl text-base flex-1 min-w-[200px] outline-none focus:border-indigo-500 font-bold bg-white transition-colors" 
                />
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-slate-200 h-[52px]">
                   <label className="text-xs font-black text-slate-400 uppercase">Kutu/Stok:</label>
                   <input type="number" id="newActBox" defaultValue={1} min="1" max="99" className="w-12 font-black text-lg text-indigo-600 outline-none text-center bg-transparent" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-2xl border-2 border-slate-200 h-[52px] select-none hover:border-indigo-300 transition-colors">
                   <input type="checkbox" id="newActMust" className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                   <span className="text-sm font-black text-slate-700">Zorunlu (Must)</span>
                </label>
                <button onClick={() => {
                   const nameInput = document.getElementById('newActName');
                   const boxInput = document.getElementById('newActBox');
                   const mustInput = document.getElementById('newActMust');
                   const val = nameInput.value.trim();
                   if(val) {
                      setActivities([...activities, { 
                          id: uuid(), 
                          name: val, 
                          cat: 'science', 
                          isMust: mustInput.checked, 
                          boxCount: Number(boxInput.value) || 1, 
                          allowedGrades: [0, 1, 2, 3, 4, 5, 6, 7, 8] // Default olarak hepsi seçili!
                      }]);
                      nameInput.value = ''; boxInput.value = 1; mustInput.checked = false; 
                      onNotify("Etkinlik tüm sınıflara uygun olarak eklendi.");
                   }
                }} className="bg-indigo-600 text-white px-8 rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 h-[52px]">
                   <Plus size={20}/> Ekle
                </button>
            </div>
            
            <div className="space-y-4">
                {activities.map(act => (
                    <div key={act.id} className="bg-slate-50 border border-slate-200 p-5 rounded-3xl flex flex-col xl:flex-row gap-4 items-center justify-between shadow-sm hover:border-indigo-300 transition-colors">
                        <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4">
                            <input 
                               value={act.name} 
                               onChange={e => setActivities(activities.map(a => a.id === act.id ? {...a, name: e.target.value} : a))}
                               className="font-black text-lg bg-transparent border-b-2 border-transparent focus:border-indigo-300 w-full sm:w-1/3 outline-none transition-colors text-slate-800"
                            />
                            
                            {/* DÜZENLEME KONTROLLERİ */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                               <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                  <span className="text-[10px] font-black text-slate-400 uppercase">Kutu:</span>
                                  <input type="number" min="1" value={act.boxCount || 1} onChange={e => setActivities(activities.map(a => a.id === act.id ? {...a, boxCount: Number(e.target.value)} : a))} className="w-10 text-center font-bold text-slate-700 outline-none"/>
                               </div>
                               <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50">
                                  <input type="checkbox" checked={act.isMust || false} onChange={e => setActivities(activities.map(a => a.id === act.id ? {...a, isMust: e.target.checked} : a))} className="accent-indigo-600" />
                                  <span className="text-[10px] font-black text-slate-600 uppercase">Must</span>
                               </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap bg-white p-2 rounded-2xl border border-slate-100 shadow-inner justify-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-widest hidden lg:block">Sınıflar:</span>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(grade => {
                                const isSelected = (act.allowedGrades || []).includes(grade);
                                return (
                                    <button 
                                        key={grade} 
                                        onClick={() => {
                                           setActivities(activities.map(a => {
                                              if(a.id !== act.id) return a;
                                              const g = a.allowedGrades || [];
                                              return { ...a, allowedGrades: g.includes(grade) ? g.filter(x => x !== grade) : [...g, grade] };
                                           }));
                                        }}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-black transition-all active:scale-95 ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'}`}
                                    >
                                        {grade === 0 ? 'Ana' : grade}
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={() => setConfirmModal({
                            isOpen: true, isDanger: true, title: 'Etkinliği Sil', message: `"${act.name}" kataloktan silinecek. Emin misiniz?`,
                            onConfirm: () => { setActivities(prev => prev.filter(a => a.id !== act.id)); setConfirmModal(prev => ({...prev, isOpen: false})); onNotify("Silindi."); },
                            onCancel: () => setConfirmModal(prev => ({...prev, isOpen: false}))
                        })} className="text-slate-400 hover:text-red-500 bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:border-red-200 transition-colors shrink-0">
                            <Trash2 size={20}/>
                        </button>
                    </div>
                ))}
                {activities.length === 0 && <div className="py-12 text-center text-slate-400 font-bold text-lg border-2 border-dashed border-slate-200 rounded-3xl">Etkinlik kataloğu boş. Yukarıdan ekleyin.</div>}
            </div>
        </div>
      )}

      {/* --- SINIF & ZAMAN (SETUP) SEKME İÇERİĞİ --- */}
      {activeView === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn text-slate-800">
            {/* SINIFLAR */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-black text-2xl mb-6 flex items-center gap-3"><BookOpen className="text-indigo-600"/> Şubeler (Sınıflar)</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                    {['Ana Sınıfı', '1-A', '1-B', '2-A', '2-B', '3-A', '3-B', '4-A', '4-B', '5-A', '5-B', '6-A', '6-B', '7-A', '7-B', '8-A', '8-B'].map(clsName => {
                        const isSelected = classes.find(c => c.name === clsName);
                        return (
                            <button key={clsName} onClick={() => {
                               if(isSelected) setClasses(classes.filter(c => c.name !== clsName));
                               else setClasses([...classes, {id: uuid(), name: clsName, schedule: {}}]);
                            }} className={`px-4 py-2.5 rounded-2xl text-sm font-black border-2 transition-all active:scale-95 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}>
                                {clsName}
                            </button>
                        );
                    })}
                </div>
                <div className="flex gap-3 pt-6 border-t border-slate-100">
                    <input 
                       type="text" id="newClass"
                       placeholder="Manuel Sınıf Yaz (Örn: 9-C)" 
                       className="border-2 border-slate-200 p-3 rounded-2xl text-sm flex-1 outline-none focus:border-indigo-500 font-bold bg-slate-50 focus:bg-white" 
                       onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                             const val = e.target.value.trim();
                             if(classes.find(c => c.name === val)) onNotify("Sınıf zaten var!");
                             else { setClasses([...classes, {id: uuid(), name: val, schedule: {}}]); e.target.value=''; onNotify("Eklendi."); }
                          }
                       }} 
                    />
                    <button onClick={() => {
                       const val = document.getElementById('newClass').value.trim();
                       if(val && !classes.find(c => c.name === val)) { setClasses([...classes, {id: uuid(), name: val, schedule: {}}]); document.getElementById('newClass').value=''; onNotify("Eklendi."); }
                    }} className="bg-slate-800 text-white px-6 rounded-2xl font-black hover:bg-slate-700 shadow-lg">Ekle</button>
                </div>
            </div>

{/* ZAMAN ÇİZELGESİ */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-2xl flex items-center gap-3"><Calendar className="text-indigo-600"/> Zaman Çizelgesi</h3>
                </div>

                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 flex flex-col gap-4 mb-8 shadow-inner">
                    {/* Hızlı Butonlar */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button onClick={() => {
                            let lastEnd = timeSlots.length > 0 ? timeSlots[timeSlots.length-1].end : "09:00";
                            let [h, m] = lastEnd.split(':').map(Number); m += 30; h += Math.floor(m/60); m = m%60;
                            setTimeSlots([...timeSlots, {id: uuid(), start: lastEnd, end: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, type: 'lesson' }]);
                        }} className="bg-white border border-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 shadow-sm active:scale-95 transition-all">+30dk Ders</button>
                        
                        <button onClick={() => {
                            let lastEnd = timeSlots.length > 0 ? timeSlots[timeSlots.length-1].end : "09:00";
                            let [h, m] = lastEnd.split(':').map(Number); m += 40; h += Math.floor(m/60); m = m%60;
                            setTimeSlots([...timeSlots, {id: uuid(), start: lastEnd, end: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, type: 'lesson' }]);
                        }} className="bg-white border border-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 shadow-sm active:scale-95 transition-all">+40dk Ders</button>
                        
                        <button onClick={() => {
                            let lastEnd = timeSlots.length > 0 ? timeSlots[timeSlots.length-1].end : "09:00";
                            let [h, m] = lastEnd.split(':').map(Number); m += 60; h += Math.floor(m/60); m = m%60;
                            setTimeSlots([...timeSlots, {id: uuid(), start: lastEnd, end: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, type: 'lesson' }]);
                        }} className="bg-white border border-fuchsia-100 text-fuchsia-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-fuchsia-50 shadow-sm active:scale-95 transition-all">+60dk Etkinlik</button>
                        
                        <button onClick={() => {
                            let lastEnd = timeSlots.length > 0 ? timeSlots[timeSlots.length-1].end : "09:00";
                            let [h, m] = lastEnd.split(':').map(Number); m += 15; h += Math.floor(m/60); m = m%60;
                            setTimeSlots([...timeSlots, {id: uuid(), start: lastEnd, end: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, type: 'break' }]);
                        }} className="bg-white border border-orange-200 text-orange-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-orange-50 shadow-sm active:scale-95 transition-all">+15dk Mola</button>
                        
                        <button onClick={() => {
                            let lastEnd = timeSlots.length > 0 ? timeSlots[timeSlots.length-1].end : "09:00";
                            let [h, m] = lastEnd.split(':').map(Number); m += 45; h += Math.floor(m/60); m = m%60;
                            setTimeSlots([...timeSlots, {id: uuid(), start: lastEnd, end: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, type: 'lunch' }]);
                        }} className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 shadow-sm active:scale-95 transition-all">+45dk Yemek</button>
                    </div>
                    
                    {/* Özel Süre/Tür Ekleme */}
                    <div className="flex gap-2 items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mt-2">
                        <input type="number" id="customMin" placeholder="Dk" defaultValue={20} className="w-16 p-2 bg-slate-50 rounded-xl outline-none text-center font-black text-slate-700" />
                        <select id="customType" className="p-2 bg-slate-50 rounded-xl outline-none font-bold text-slate-600 flex-1 cursor-pointer">
                            <option value="lesson">📚 Ders/Etkinlik</option>
                            <option value="break">🔔 Mola/Teneffüs</option>
                            <option value="lunch">🍽️ Yemek Arası</option>
                            <option value="presentation">🎤 Genel Sunum</option>
                        </select>
                        <button onClick={() => {
                            const min = parseInt(document.getElementById('customMin').value) || 20;
                            const type = document.getElementById('customType').value;
                            let lastEnd = timeSlots.length > 0 ? timeSlots[timeSlots.length-1].end : "09:00";
                            let [h, m] = lastEnd.split(':').map(Number); m += min; h += Math.floor(m/60); m = m%60;
                            setTimeSlots([...timeSlots, {id: uuid(), start: lastEnd, end: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, type }]);
                        }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black hover:bg-indigo-700 active:scale-95 transition-all">Ekle</button>
                    </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-3 custom-scrollbar">
                    {timeSlots.map((slot,i)=>(
                        <div key={slot.id} className={`flex gap-3 items-center p-3 rounded-2xl border ${slot.type==='lesson' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                            <span className="text-xs font-black text-slate-400 w-5 text-center">{i+1}.</span>
                            <input type="time" value={slot.start} onChange={e=>{const n=[...timeSlots];n[i].start=e.target.value;setTimeSlots(n)}} className="border-none outline-none font-black text-base bg-transparent w-24 text-slate-700 focus:text-indigo-600"/>
                            <span className="text-slate-300 font-bold">-</span>
                            <input type="time" value={slot.end} onChange={e=>{const n=[...timeSlots];n[i].end=e.target.value;setTimeSlots(n)}} className="border-none outline-none font-black text-base bg-transparent w-24 text-slate-700 focus:text-indigo-600"/>
                            <select value={slot.type} onChange={e=>{const n=[...timeSlots];n[i].type=e.target.value;setTimeSlots(n)}} className="border-none outline-none text-sm font-bold bg-transparent flex-1 cursor-pointer text-slate-600">
                                <option value="lesson">📚 Ders/Etkinlik</option>
                                <option value="break">🔔 Teneffüs</option>
                                <option value="lunch">🍽️ Yemek Arası</option>
                                <option value="presentation">🎤 Genel Sunum</option>
                            </select>
                            <button onClick={()=>{const n=[...timeSlots];n.splice(i,1);setTimeSlots(n)}} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>
                        </div>
                    ))}
                    {timeSlots.length === 0 && <div className="text-center text-slate-400 text-sm py-8 font-medium border-2 border-dashed border-slate-200 rounded-2xl">Henüz saat eklenmedi. Üstteki butonları kullanın.</div>}
                </div>
                
                {timeSlots.length === 0 && (
                   <div className="mt-6 pt-6 border-t border-slate-100">
                      <button onClick={() => {
                         setConfirmModal({
                            isOpen: true, title: 'Otomatik Tam Gün', message: 'Mevcut liste silinip 09:00 - 14:05 arası standart şablon yüklenecek. Emin misiniz?',
                            onConfirm: () => {
                               setTimeSlots([
                                  { id: 't1', start: '09:00', end: '09:40', type: 'lesson' }, { id: 't2', start: '09:40', end: '09:55', type: 'break' },
                                  { id: 't3', start: '09:55', end: '10:35', type: 'lesson' }, { id: 't4', start: '10:35', end: '10:50', type: 'break' },
                                  { id: 't5', start: '10:50', end: '11:30', type: 'lesson' }, { id: 't6', start: '11:30', end: '12:30', type: 'lunch' },
                                  { id: 't7', start: '12:30', end: '13:10', type: 'lesson' }, { id: 't8', start: '13:10', end: '13:25', type: 'break' },
                                  { id: 't9', start: '13:25', end: '14:05', type: 'lesson' }
                               ]);
                               setConfirmModal({ isOpen: false }); onNotify("Şablon yüklendi.");
                            }, onCancel: () => setConfirmModal({ isOpen: false })
                         })
                      }} className="w-full bg-emerald-50 border-2 border-emerald-100 text-emerald-700 py-3 rounded-2xl font-black hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                         <Sparkles size={18}/> Otomatik Standart Şablon Doldur
                      </button>
                   </div>
                )}
            </div>
        </div>
      )}

      {/* DERS DÜZENLEME MODALI */}
{/* DERS DÜZENLEME MODALI (Etkinlik Listeleme Eklendi) */}
      {editingSlot && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn border border-slate-100">
            <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
              <div><h3 className="font-black text-xl text-slate-800">Ders Ataması</h3></div>
              <button onClick={() => setEditingSlot(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 bg-white shadow-sm"><X size={20}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6 bg-white">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Etkinlik Seç / Yaz</label>
                <input list="activities-list" className="w-full border-2 border-slate-200 p-4 rounded-2xl font-black text-slate-800 focus:border-indigo-500 outline-none transition-colors" placeholder="Listeden seç veya yeni yaz..." value={editingSlot.data.name || ''} onChange={e => {
                  const match = activities.find(a => a.name.toLocaleLowerCase('tr') === e.target.value.toLocaleLowerCase('tr'));
                  setEditingSlot({ ...editingSlot, data: { ...editingSlot.data, name: e.target.value, activityId: match?.id || '' } });
                }} />
                {/* ETKİNLİK LİSTESİ BURADA */}
                <datalist id="activities-list">
                    {activities.map(a => <option key={a.id} value={a.name} />)}
                </datalist>
                
                {editingSlot.data.name && !activities.find(a=>a.name===editingSlot.data.name) && editingSlot.data.activityId !== 'NO_CLASS' && <div className="text-xs text-indigo-600 mt-2 font-bold bg-indigo-50 p-2 rounded-lg inline-block">+ Yeni Etkinlik Olarak Eklenecek</div>}
              </div>
              
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Gönüllü Lider</label>
                <select className="w-full border-2 border-slate-200 p-4 rounded-2xl font-black text-slate-800 focus:border-indigo-500 outline-none bg-white transition-colors" value={editingSlot.data.leadId || ''} onChange={e => { const v = volunteers.find(x => x.id === e.target.value); setEditingSlot({ ...editingSlot, data: { ...editingSlot.data, leadId: v?.id||'none', lead: v?.name||'-' } }) }}>
                  <option value="none">Seçiniz (Boş)</option>
                  {volunteers.map(v => <option key={v.id} value={v.id}>{v.name} {!v.capabilities.includes(editingSlot.data.activityId) && '(Yetkinlik Eksik)'}</option>)}
                </select>
              </div>

              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3 mt-4 shadow-inner">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><Settings2 size={14}/> Hızlı Kapatma Araçları</h4>
                <button onClick={markAsNoClass} className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 rounded-2xl font-bold text-sm flex justify-center gap-2 transition-colors"><Minus size={16}/> Sadece Bu Sınıfa Dersi Kapat</button>
                <button onClick={markAllAsNoClass} className="w-full py-3 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-2xl font-bold text-sm flex justify-center gap-2 transition-colors"><X size={16}/> Tüm Sınıflara Bu Saati Kapat</button>
              </div>
            </div>
            
            <div className="bg-white border-t border-slate-100 p-5 flex gap-4">
              {editingSlot.data.activityId && (
                <button onClick={() => { setEditingSlot({ ...editingSlot, data: { activityId: 'delete' } }); setTimeout(saveSlotEdit, 50); }} className="flex-1 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 py-4 rounded-2xl font-black flex justify-center gap-2 transition-colors"><Trash2 size={20}/> Sil</button>
              )}
              <button onClick={saveSlotEdit} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 flex justify-center gap-2 transition-all active:scale-95"><CheckCircle2 size={20}/> Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* TOPLU GÖNÜLLÜ EKLEME MODALI */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-fadeIn border border-slate-100">
              <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
                 <h3 className="font-black text-xl text-slate-800">Toplu Gönüllü Ekle</h3>
                 <button onClick={() => setBulkModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 bg-white shadow-sm"><X size={20}/></button>
              </div>
              <div className="p-8">
                 <p className="text-sm text-slate-500 font-bold mb-4">Excel'den veya bir metin belgesinden kopyaladığınız isim listesini buraya yapıştırın. <span className="text-indigo-600">(Her satıra 1 isim gelmelidir)</span></p>
                 <textarea 
                    className="w-full h-64 border-2 border-slate-200 p-4 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-500 resize-none bg-slate-50 focus:bg-white transition-colors" 
                    placeholder="Örnek:&#10;Mustafa Berke Şimşekler&#10;Eda Nur Keklik&#10;Hüseyin Vural..." 
                    value={bulkText} onChange={(e) => setBulkText(e.target.value)}
                 ></textarea>
              </div>
              <div className="bg-slate-50 border-t border-slate-100 p-5 flex justify-end gap-3">
                 <button onClick={() => setBulkModalOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">İptal</button>
                 <button onClick={() => {
                    const names = bulkText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
                    if(names.length > 0) {
                       const newVols = names.map(name => ({ id: uuid(), name, capabilities: [] }));
                       const updated = [...volunteers, ...newVols];
                       setVolunteers(updated); syncVolunteers(updated);
                       setBulkText(''); setBulkModalOpen(false); onNotify(`${names.length} gönüllü listeye eklendi!`);
                    }
                 }} className="px-6 py-3 rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
                    <CheckCircle2 size={18}/> Listeyi Sisteme Kaydet
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}


// --- INTERAKTİF BİLEŞENLER (İSİMLİK VE KOLAJ İÇİN) ---
const InteractiveText = ({ text, size, offsetY, onUpdate, className, style, placeholder, isEditable }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startValuesRef = useRef({ size: 0, offset: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; e.preventDefault(); 
    setIsDragging(true); startPosRef.current = { x: e.clientX, y: e.clientY }; startValuesRef.current = { size: size, offset: offsetY || 0 };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      onUpdate(Math.max(10, Math.min(200, startValuesRef.current.size + (deltaX / 3))), startValuesRef.current.offset + deltaY);
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, onUpdate]);

  return (
    <div className={`relative group/text cursor-move select-none ${className}`} style={{ ...style, fontSize: `${size}px`, transform: `translateY(${offsetY}px)`, touchAction: 'none' }} onMouseDown={handleMouseDown}>
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 ${isDragging ? 'opacity-100' : 'group-hover/text:opacity-60'} transition-opacity pointer-events-none whitespace-nowrap z-50`}>
        {Math.round(size)}px {offsetY > 0 ? `(⬇ ${Math.round(offsetY)})` : offsetY < 0 ? `(⬆ ${Math.round(Math.abs(offsetY))})` : ''}
      </div>
      {isEditable ? <input type="text" value={text} onChange={isEditable} className="bg-transparent text-center w-full outline-none" onMouseDown={(e) => e.stopPropagation()} /> : <span>{text || placeholder}</span>}
      {isDragging && <div className="absolute left-1/2 -translate-x-1/2 top-full h-screen w-px border-l border-dashed border-indigo-300 opacity-50 pointer-events-none"></div>}
    </div>
  );
};

const InteractivePhoto = ({ src, scale, translateX, translateY, onUpdate, id }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startValuesRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0 || !src) return; e.preventDefault(); setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY }; startValuesRef.current = { x: translateX || 0, y: translateY || 0 };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startPosRef.current.x; const deltaY = e.clientY - startPosRef.current.y;
      onUpdate(id, scale || 1, startValuesRef.current.x + deltaX, startValuesRef.current.y + deltaY);
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, id, scale, onUpdate]);

  return (
    <div className="relative w-full h-full cursor-move overflow-hidden bg-slate-50 rounded-xl border border-slate-200/60 select-none touch-none group/img" onMouseDown={handleMouseDown}>
      {src ? ( <img src={src} alt="Gönüllü" className="max-w-none absolute inset-0 w-full h-full pointer-events-none select-none" style={{ objectFit: 'contain', transform: `scale(${scale || 1}) translate(${(translateX || 0)}px, ${(translateY || 0)}px)`, transformOrigin: 'center center' }} /> ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1"><Camera size={18} /><span className="text-[7px] font-bold uppercase no-print">Tıkla Yükle</span></div>
      )}
      {src && !isDragging && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm no-print opacity-0 group-hover/img:opacity-100 transition-opacity z-20 border border-slate-100 scale-75">
            <Minus size={8} className="text-slate-400"/><input type="range" min="1" max="5" step="0.05" value={scale || 1} onChange={(e) => onUpdate(id, parseFloat(e.target.value), translateX, translateY)} className="w-12 h-1 bg-indigo-100 rounded-lg accent-indigo-600 cursor-pointer appearance-none" onMouseDown={(e) => e.stopPropagation()} /><PlusCircle size={8} className="text-indigo-500"/>
        </div>
      )}
    </div>
  );
};


// --- MODÜL 2: İSİMLİK MATBAASI ---
function NameTagApp({ onNotify }) {
  const ROWS_PER_PAGE = 5;
  const [pagePadding, setPagePadding] = useState(5); 
  const [cardGap] = useState(2);
  const [verticalCompression, setVerticalCompression] = useState(0); 
  const [globalScale, setGlobalScale] = useState(100); 
  const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.NAMETAG_VOLUNTEERS, []));
  const [aiState, setAiState] = useState('idle');
  const [activeAction, setActiveAction] = useState(null);
  const [warnings, setWarnings] = useState([]);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [promptModal, setPromptModal] = useState({ isOpen: false });

  useEffect(() => { db.save(DB_KEYS.NAMETAG_VOLUNTEERS, volunteers); syncVolunteers(volunteers); }, [volunteers]);

  useEffect(() => {
    if (aiState === 'processing') return;
    const analyze = () => {
        const issues = [];
        volunteers.forEach(v => {
            if (v.name.length > 22) issues.push({ id: v.id, type: 'danger', msg: `"${v.name}" ismi bir hayli uzun, kartın sınırlarını zorluyor.` });
            const nameTotalPush = Math.abs(v.nameY || 0) + ((v.nameSize || 60) * 0.7);
            const surnameTotalPush = Math.abs(v.surnameY || 0) + ((v.surnameSize || 12) * 0.7);
            if (nameTotalPush > 90 || surnameTotalPush > 90) issues.push({ id: v.id, type: 'critical', msg: `Hoppala! ${v.name.split(' ')[0]} ismi şu an kağıttan dışarı fırlamış durumda.` });
        });
        setWarnings(issues);
    };
    analyze();
  }, [volunteers, aiState]);

  const handleAutoFix = () => {
    setAiState('processing');
    setTimeout(() => {
      setVolunteers(volunteers.map(vol => ({ ...vol, nameSize: 60, nameY: 0, surnameSize: 12, surnameY: 5 })));
      setAiState('idle'); setActiveAction(null); onNotify("İsimlikler düzenlendi!");
    }, 1000);
  };

  const removeVolunteer = (id) => {
    const updated = volunteers.filter(v => v.id !== id);
    syncVolunteers(updated); setVolunteers(updated); onNotify("Silindi.");
  };

  const handleInteractiveUpdate = useCallback((id, type, newSize, newOffset) => {
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, [type === 'name' ? 'nameSize' : 'surnameSize']: newSize, [type === 'name' ? 'nameY' : 'surnameY']: newOffset } : v));
      setActiveAction({ type: 'move', val: newOffset }); const timer = setTimeout(() => setActiveAction(null), 100); return () => clearTimeout(timer);
  }, []);

  const formatNameDisplay = (fullName) => {
      const parts = fullName.trim().split(' ');
      if (parts.length === 1) return { first: parts[0], last: '' };
      return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
  };

  const pages = [];
  for (let i = 0; i < volunteers.length; i += 5) {
    const chunk = volunteers.slice(i, i + 5);
    pages.push({ type: 'names', items: chunk });
    pages.push({ type: 'questions', items: chunk });
  }

  return (
    <div className="space-y-6 relative">
      <ConfirmModal {...confirmModal} />
      <PromptModal {...promptModal} />

      <div className="no-print">
         <BalkizConsole aiState={aiState} activeAction={activeAction} warnings={warnings} />
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter"><Settings2 size={12}/> Kenar Boşluğu</div>
               <input type="range" min="0" max="30" value={pagePadding} onChange={(e) => setPagePadding(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-indigo-600" />
            </div>
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter"><MoveVertical size={12}/> Dikdörtgenleştir</div>
               <input type="range" min="0" max="30" value={verticalCompression} onChange={(e) => setVerticalCompression(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-orange-500" />
            </div>
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter"><Plus size={12}/> Kart Boşluğu (Gap)</div>
               <input type="range" min="0" max="20" value={cardGap} onChange={(e) => setCardGap(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-teal-500" />
            </div>
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter"><Maximize size={12}/> Genel Ölçek</div>
               <input type="range" min="70" max="100" value={globalScale} onChange={(e) => setGlobalScale(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-indigo-600" />
            </div>
            <div className="flex items-end">
              <button onClick={handleAutoFix} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 text-white px-4 py-3 rounded-xl font-bold flex gap-2 items-center justify-center shadow-lg transition-all active:scale-95 text-sm">
                <Wand2 size={16}/> B.A.L.K.I.Z. Düzenlesin
              </button>
            </div>
         </div>
      </div>

      <div className="block space-y-12 pb-20 print:space-y-0 print:pb-0">
        {pages.map((page, pIndex) => (
          <div key={pIndex} className="print-page bg-white shadow-2xl mx-auto overflow-hidden print:shadow-none print:m-0" style={{ padding: `${pagePadding}mm`, marginBottom: pIndex < pages.length - 1 ? '3rem' : '0' }}>
            <div className="grid grid-cols-2 content-start w-full h-full bg-white" style={{ transform: `scale(${globalScale / 100})`, transformOrigin: 'top center', height: `${100 - verticalCompression}%`, gridTemplateRows: `repeat(${ROWS_PER_PAGE}, 1fr)`, gap: `${cardGap}mm` }}>
              {page.items.map((vol) => {
                const nameData = formatNameDisplay(vol.name);
                return (
                  <React.Fragment key={vol.id}>
                    {/* SOL & SAĞ KART */}
                    {[1, 2].map(side => (
                      <div key={side} className="relative group w-full h-full overflow-visible border border-dashed border-slate-100 hover:border-indigo-400 transition-all bg-white print:border-none">
                        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden"><img src={page.type === 'names' ? IMAGES.NAME_BG : IMAGES.QUESTION_BG} className="w-full h-full object-fill" alt="bg" /></div>
                        {side === 1 && (
                          <div className="absolute top-2 right-2 z-50 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setConfirmModal({
                               isOpen: true, isDanger: true, title: 'İsimliği Sil', message: `${vol.name} isimliği silinecek. Emin misiniz?`,
                               onConfirm: () => { removeVolunteer(vol.id); setConfirmModal({isOpen: false}); },
                               onCancel: () => setConfirmModal({isOpen: false})
                            })} className="p-1.5 bg-white text-red-500 rounded-full shadow-sm border border-red-50 hover:scale-110"><Trash2 size={12}/></button>
                          </div>
                        )}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
                          {page.type === 'names' ? (
                            <div className="relative text-center w-full">
                              <div className="flex flex-col items-center justify-center leading-none">
                                <InteractiveText text={nameData.first} size={vol.nameSize || 60} offsetY={vol.nameY || 0} onUpdate={(s, o) => handleInteractiveUpdate(vol.id, 'name', s, o)} className="font-comic font-bold text-slate-800 whitespace-nowrap drop-shadow-sm" />
                                <InteractiveText text={nameData.last} size={vol.surnameSize || 12} offsetY={vol.surnameY || 0} onUpdate={(s, o) => handleInteractiveUpdate(vol.id, 'surname', s, o)} className="font-comic font-black text-slate-900 uppercase whitespace-nowrap mt-1 drop-shadow-sm" />
                              </div>
                              {side === 1 && (
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                  <button onClick={() => setPromptModal({
                                     isOpen: true, title: 'İsmi Düzenle', defaultValue: vol.name,
                                     onConfirm: (val) => { setVolunteers(volunteers.map(v => v.id === vol.id ? {...v, name: val} : v)); setPromptModal({isOpen: false}); },
                                     onCancel: () => setPromptModal({isOpen: false})
                                  })} className="bg-indigo-50 text-indigo-600 p-2 rounded-xl font-bold shadow-sm">✐</button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <textarea value={vol.question || ''} onChange={(e) => setVolunteers(volunteers.map(v => v.id === vol.id ? {...v, question: e.target.value} : v))} className="w-[85%] h-[60%] bg-transparent outline-none text-center font-comic resize-none flex items-center justify-center pt-8 text-slate-700 print:resize-none" style={{ fontSize: `${(vol.nameSize || 60) * 0.4}px` }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
        {pages.length === 0 && <div className="text-center py-20 font-bold text-slate-400">Yazdırılacak isimlik bulunamadı. Lütfen "Etkinlik & Gönüllü" sekmesinden gönüllü ekleyin.</div>}
      </div>
    </div>
  );
}

// --- MODÜL 3: PROJE KOLAJ ---
function CollageApp({ onNotify }) {
  const [projectTitle, setProjectTitle] = useState("İLKYAR ŞUBAT 2026 ANTALYA PROJESİ EKİBİ");
  const [projectAddress, setProjectAddress] = useState("Adres: Çiğdem Mah. 1588.Sok. No:81 06580 Çankaya/ANKARA");
  const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.COLLAGE_VOLUNTEERS, []));
  const [globalNameSize, setGlobalNameSize] = useState(16);
  const [pagePadding, setPagePadding] = useState(12);
  const [aiState, setAiState] = useState('idle');
  const [activeAction, setActiveAction] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  useEffect(() => {
    db.save(DB_KEYS.COLLAGE_VOLUNTEERS, volunteers); syncVolunteers(volunteers);
    const issues = [];
    const missingPhotos = volunteers.filter(v => !v.photo);
    if(missingPhotos.length > 0) issues.push({ type: 'stock', msg: `${missingPhotos.length} fotoğraf henüz yüklenmemiş.` });
    
    const hocaIndex = volunteers.findIndex(v => v.name.toLowerCase().includes("vural") || v.name.toLowerCase().includes("hüseyin"));
    if (hocaIndex !== -1 && hocaIndex !== 0) {
        issues.push({ type: 'protocol', msg: 'Hüseyin Hoca listede var ama İLK SIRADA değil! Lütfen B.A.L.K.I.Z sıralaması ile başa alın.' });
    }
    setWarnings(issues);
  }, [volunteers]);

  const handleAutoFix = useCallback(() => {
    setAiState('processing');
    setTimeout(() => {
      let sorted = [...volunteers].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      const hIndex = sorted.findIndex(v => v.name.toLowerCase().includes("vural") || v.name.toLowerCase().includes("hüseyin"));
      if(hIndex !== -1) {
          const hoca = sorted.splice(hIndex, 1)[0]; 
          sorted.unshift(hoca);
      }
      setVolunteers(sorted);
      setAiState('idle'); onNotify("Alfabetik dizildi ve Protokol Kuralları uygulandı!");
    }, 1000);
  }, [volunteers, onNotify]);

  const removeVolunteer = (id) => {
    const updated = volunteers.filter(v => v.id !== id);
    syncVolunteers(updated); setVolunteers(updated); onNotify("Silindi.");
  };

  const moveVolunteer = (index, direction) => {
    const newVols = [...volunteers]; const target = index + direction;
    if (target >= 0 && target < newVols.length) {
      const temp = newVols[index]; newVols[index] = newVols[target]; newVols[target] = temp;
      setVolunteers(newVols);
    }
  };

  const count = volunteers.length;
  let cols = 3; if (count <= 4) cols = 2; else if (count <= 9) cols = 3; else if (count <= 16) cols = 4; else cols = 5;
  const rows = Math.ceil(count / cols);

  return (
    <div className="space-y-6 relative">
      <style>{`
         @media print {
            @page {
               size: A4 portrait;
               margin: 0; /* Tarayıcının varsayılan marginlerini ezer */
            }
            .collage-print-strict {
               width: 210mm !important;
               height: 297mm !important;
               max-height: 297mm !important;
               min-height: 297mm !important;
               page-break-after: avoid !important;
               page-break-before: avoid !important;
               page-break-inside: avoid !important;
               overflow: hidden !important;
               display: flex !important;
               flex-direction: column !important;
               box-sizing: border-box !important;
            }
         }
      `}</style>
      
      <ConfirmModal {...confirmModal} />
      <div className="no-print">
         <BalkizConsole aiState={aiState} activeAction={activeAction} warnings={warnings} />
         <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end">
            <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Type size={10}/> İsim Boyutu</label>
                <input type="range" min="10" max="35" value={globalNameSize} onChange={(e) => setGlobalNameSize(parseInt(e.target.value))} className="w-full accent-indigo-600 cursor-pointer"/>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Maximize2 size={10}/> Kenar Payı</label>
                <input type="range" min="0" max="30" value={pagePadding} onChange={(e) => setPagePadding(parseInt(e.target.value))} className="w-full accent-pink-600 cursor-pointer"/>
            </div>
            <div>
              <button onClick={handleAutoFix} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 text-white px-6 py-3 rounded-xl font-bold flex gap-2 items-center justify-center shadow-lg active:scale-95 transition-all">
                <Wand2 size={18}/> Akıllı Sırala (Alfabe + Protokol)
              </button>
            </div>
         </div>
      </div>

      <div className="flex justify-center pb-20 print-container">
          <div className="print-page collage-print-strict bg-white shadow-2xl flex flex-col relative" style={{ padding: `${pagePadding}mm`, boxSizing: 'border-box' }}>
             
             {/* BAŞLIK */}
             <div className="w-full mb-3 px-4 shrink-0">
                <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="w-full text-center bg-transparent border-none outline-none font-comic font-black text-slate-900 tracking-tight" style={{ fontSize: volunteers.length > 12 ? '22px' : '28px' }} />
             </div>
             
             {/* IZGARA (FOTOĞRAFLAR) - flex-1 ve min-h-0 ile taşma engellendi */}
             <div className="grid w-full gap-3 flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
                {volunteers.map((vol, index) => (
                   <div key={vol.id} className="relative flex flex-col items-center justify-center p-2 border border-slate-100 rounded-2xl bg-slate-50/20 group hover:border-indigo-400 transition-all overflow-hidden min-h-0">
                      <div className="absolute top-1 right-1 flex flex-col gap-1 no-print opacity-0 group-hover:opacity-100 transition-all z-40">
                        <button onClick={() => setConfirmModal({
                           isOpen: true, isDanger: true, title: 'Kolajdan Çıkar', message: `${vol.name} kolajdan çıkarılacak. Emin misiniz?`,
                           onConfirm: () => { removeVolunteer(vol.id); setConfirmModal(prev => ({...prev, isOpen: false})); }, onCancel: () => setConfirmModal(prev => ({...prev, isOpen: false}))
                        })} className="p-1 bg-white text-red-500 rounded-full shadow-sm border border-red-50 hover:scale-110"><Trash2 size={10}/></button>
                        <button onClick={() => moveVolunteer(index, -1)} disabled={index === 0} className="p-1 bg-white text-indigo-600 rounded-full shadow-sm border border-indigo-50 hover:scale-110 disabled:opacity-30"><ChevronUp size={10}/></button>
                        <button onClick={() => moveVolunteer(index, 1)} disabled={index === volunteers.length - 1} className="p-1 bg-white text-indigo-600 rounded-full shadow-sm border border-indigo-50 hover:scale-110 disabled:opacity-30"><ChevronDown size={10}/></button>
                      </div>

                      <div className="relative w-full h-full min-h-0 mb-1 overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                          <InteractivePhoto id={vol.id} src={vol.photo} scale={vol.scale} translateX={vol.translateX} translateY={vol.translateY} onUpdate={(id,s,x,y) => setVolunteers(prev => prev.map(v => v.id === id ? { ...v, scale:s, translateX:x, translateY:y } : v))} />
                          {!vol.photo && <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if(file){ const reader = new FileReader(); reader.onload = (ev) => setVolunteers(prev => prev.map(v => v.id === vol.id ? { ...v, photo: ev.target.result, scale: 1, translateX: 0, translateY: 0 } : v)); reader.readAsDataURL(file); } }} className="absolute inset-0 opacity-0 cursor-pointer z-30" />}
                          {vol.photo && (
                              <label className="absolute top-1 left-1 no-print opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/90 rounded-full text-indigo-600 cursor-pointer z-40 shadow-sm border border-slate-100">
                                  <Upload size={12}/>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if(file){ const reader = new FileReader(); reader.onload = (ev) => setVolunteers(prev => prev.map(v => v.id === vol.id ? { ...v, photo: ev.target.result, scale: 1, translateX: 0, translateY: 0 } : v)); reader.readAsDataURL(file); } }} />
                              </label>
                          )}
                      </div>

                      <div className="w-full px-1 text-center leading-[1] shrink-0">
                          <textarea value={vol.name} onChange={(e) => setVolunteers(volunteers.map(v => v.id === vol.id ? {...v, name: e.target.value} : v))} className="w-full text-center bg-transparent border-none outline-none font-comic font-bold text-slate-800 tracking-tight resize-none overflow-hidden m-0 p-0" style={{ fontSize: `${globalNameSize}px`, height: '2.5em' }} rows={2} />
                      </div>
                   </div>
                ))}
             </div>

             {/* ADRES VE FOOTER - mt-auto ile sayfanın en altına itilir, absolute kullanılmaz */}
             <div className="w-full shrink-0 flex flex-col items-center gap-1 bg-white pt-2 mt-auto">
                <div className="flex items-center gap-4 text-indigo-600 font-black tracking-[0.25em] text-[18px] group/msg">
                    <span className="w-12 h-[2px] bg-indigo-100 group-hover/msg:w-20 transition-all duration-700"></span>
                    <Smile size={24} className="text-indigo-400 animate-bounce" />
                    <span className="uppercase drop-shadow-sm">MEKTUPLARINI BEKLİYORUZ</span>
                    <span className="w-12 h-[2px] bg-indigo-100 group-hover/msg:w-20 transition-all duration-700"></span>
                </div>
                <div className="w-full border-t border-slate-200 pt-1 pb-0 flex justify-center">
                    <input type="text" value={projectAddress} onChange={(e) => setProjectAddress(e.target.value)} className="w-full bg-transparent border-none outline-none font-sans text-slate-600 text-center font-bold" style={{ fontSize: volunteers.length > 12 ? '11px' : '15px' }} />
                </div>
             </div>

          </div>
      </div>
    </div>
  );
}

// --- MODÜL 4: RESMİ BELGE / TUTANAK ---
function DocumentCreator() {
  const [formData, setFormData] = useState({ no: '2026/01', date: '', topic: 'Planlama', location: 'Salon A', participants: 'Müdür, Yürütücü', decisions: '1. Karar 1\n2. Karar 2' });
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm print:hidden text-sm space-y-4">
        <h3 className="font-black text-xl mb-4 text-slate-800">Belge Bilgileri</h3>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Karar No</label>
          <input className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-slate-700 focus:border-indigo-500 outline-none" placeholder="No" value={formData.no} onChange={e=>setFormData({...formData, no:e.target.value})} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Kararlar</label>
          <textarea className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold text-slate-700 focus:border-indigo-500 outline-none h-60 resize-none" placeholder="Alınan kararları yazın..." value={formData.decisions} onChange={e=>setFormData({...formData, decisions:e.target.value})} />
        </div>
      </div>
      <div className="flex-1 bg-white shadow-2xl p-16 print:shadow-none print:p-0 min-h-[297mm]">
        <h1 className="text-center font-black text-2xl border-b-4 border-slate-900 pb-4 mb-12 uppercase tracking-widest">Toplantı Tutanağı</h1>
        <table className="w-full border-2 border-slate-900 mb-12 text-base">
          <tbody>
            <tr><td className="border-2 border-slate-900 p-4 font-black bg-slate-100 w-1/4">Karar No</td><td className="border-2 border-slate-900 p-4 font-medium">{formData.no}</td></tr>
            <tr><td className="border-2 border-slate-900 p-4 font-black bg-slate-100 align-top">Kararlar</td><td className="border-2 border-slate-900 p-4 whitespace-pre-wrap h-80 align-top font-medium leading-relaxed">{formData.decisions}</td></tr>
          </tbody>
        </table>
        <div className="flex justify-between mt-40 px-16">
          <div className="text-center font-black text-lg">Raportör<div className="mt-12 border-t-2 border-slate-900 w-40"></div></div>
          <div className="text-center font-black text-lg">Onaylayan<div className="mt-12 border-t-2 border-slate-900 w-40"></div></div>
        </div>
      </div>
    </div>
  );
}

// --- ANA UYGULAMA BİLEŞENİ ---
export default function ProManagerApp() {
  const [activeTab, setActiveTab] = useState('scheduler');
  const [notification, setNotification] = useState(null);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePrint = () => {
    if (window.innerWidth < 1024) showNotify("Önizleme modundasınız. Tam sayfa açarak yazdırınız.");
    window.print();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'scheduler': return <InfinityScheduler onNotify={showNotify} />;
      case 'badges': return <NameTagApp onNotify={showNotify} />;
      case 'minutes': return <DocumentCreator />;
      case 'collage': return <CollageApp onNotify={showNotify} />;
      default: return <InfinityScheduler onNotify={showNotify} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700;800&display=swap');
        .font-comic { font-family: 'Comic Sans MS', 'Comic Sans', 'Comic Neue', cursive; }
        @keyframes liquid-blob-morph { 0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } }
        @keyframes rainbow-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes breathe-idle { 0%, 100% { transform: scale(1); border-color: rgba(203, 213, 225, 0.5); } 50% { transform: scale(1.05); border-color: rgba(203, 213, 225, 1); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .bg-stripes { background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px); }
        .ai-avatar-wrapper { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
        .ai-rainbow-liquid { position: absolute; inset: -5px; background: linear-gradient(135deg, #ff0080, #7928ca, #4f46e5, #0ea5e9, #ff0080); background-size: 300% 300%; opacity: 0; transition: all 0.5s ease; z-index: 0; filter: blur(8px); }
        .ai-rainbow-liquid.active { opacity: 0.8; animation: liquid-blob-morph 4s ease-in-out infinite, rainbow-flow 3s linear infinite; }
        .ai-core-container { position: relative; width: 60px; height: 60px; background: white; border-radius: 50%; z-index: 10; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 2px solid #e2e8f0; transition: all 0.3s ease; }
        .ai-core-container.active { border-color: transparent; background: rgba(255, 255, 255, 0.9); }
        .ai-core-container.idle { animation: breathe-idle 4s ease-in-out infinite; }
        .print-page { width: 210mm; height: 297mm; min-height: 297mm; page-break-after: always; page-break-inside: avoid; break-after: page; break-inside: avoid; }
        .print-page:last-child { page-break-after: auto; break-after: auto; }
        @media print { .print-page { margin: 0 !important; box-shadow: none !important; border: none !important; } }
        .console-panel { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; background: #ffffff; border-bottom: 1px solid #e2e8f0; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); }
        .console-panel.closed { max-height: 0; padding: 0; border: none; }
        .console-panel.open { max-height: 500px; padding: 1.5rem; }
        .typing-cursor::after { content: ''; display: inline-block; width: 4px; height: 16px; background: #7928ca; margin-left: 3px; vertical-align: sub; animation: blink 1s step-end infinite; }
        @media print {
          html, body { height: auto !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
          .flex.h-screen { display: block !important; height: auto !important; overflow: visible !important; }
          main { height: auto !important; overflow: visible !important; display: block !important; position: static !important; padding: 0 !important; margin: 0 !important; }
          aside, header, .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-page { width: 210mm !important; height: 297mm !important; min-height: 297mm !important; max-height: 297mm !important; margin: 0 !important; padding: 5mm !important; page-break-after: always !important; page-break-inside: avoid !important; break-after: page !important; break-inside: avoid !important; overflow: hidden !important; display: block !important; position: relative !important; background: white !important; }
          .print-page:last-child { page-break-after: auto !important; break-after: auto !important; }
        }
      `}</style>

      <aside className="w-72 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl z-20 print:hidden shrink-0">
        <div className="p-8 border-b border-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg"><img src="/kordim.png" alt="ProKordiManager" className="w-9 h-9 object-contain" /></div>
            <div>
               <h1 className="text-xl font-black text-white tracking-wide">KordiManager</h1>
               <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-0.5">B.A.L.K.I.Z. V3.0</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarItem id="scheduler" icon={<Calendar size={22}/>} label="Planlayıcı" active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="badges" icon={<Users size={22}/>} label="İsimlik Matbaası" active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="collage" icon={<ImageIcon size={22}/>} label="Görsel Kolaj" active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="minutes" icon={<FileText size={22}/>} label="Resmi Tutanak" active={activeTab} onClick={setActiveTab} />
        </nav>
        <div className="p-6 border-t border-slate-800/50 text-xs text-slate-500 text-center font-medium">
          &copy; 2026 © <a href="https://github.com/ragno-typhojem" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">Mustafa Berke Simsekler</a>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#f8fafc] relative print:bg-white print:p-0 print:overflow-visible">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-10 sticky top-0 z-30 print:hidden shadow-sm">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            {activeTab === 'scheduler' && <><div className="p-2 bg-indigo-100 rounded-lg"><Calendar className="text-indigo-600" size={20}/></div> Akıllı Planlayıcı</>}
            {activeTab === 'badges' && <><div className="p-2 bg-indigo-100 rounded-lg"><Users className="text-indigo-600" size={20}/></div> İsimlik Matbaası</>}
            {activeTab === 'minutes' && <><div className="p-2 bg-indigo-100 rounded-lg"><FileText className="text-indigo-600" size={20}/></div> Belge Yöneticisi</>}
            {activeTab === 'collage' && <><div className="p-2 bg-indigo-100 rounded-lg"><ImageIcon className="text-indigo-600" size={20}/></div> Kolaj Düzenleyici</>}
          </h2>
          <div className="flex items-center gap-6">
             <Saat />
             <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg active:scale-95">
               <Printer size={16} /> <span>Yazdır</span>
             </button>
          </div>
        </header>
        <div className="p-10 print:p-0 min-h-[calc(100vh-5rem)] text-slate-800 max-w-[1600px] mx-auto" id="printable-section">
          {renderContent()}
        </div>
        {notification && (
          <div className="fixed bottom-10 right-10 bg-slate-800 text-white px-8 py-5 rounded-2xl shadow-2xl animate-fadeIn print:hidden z-50 flex items-center gap-4 border-l-8 border-green-500">
            <CheckCircle2 className="text-green-400" size={24}/> <span className="font-bold text-lg">{notification}</span>
          </div>
        )}
      </main>
    </div>
  );
}

const SidebarItem = ({ id, icon, label, active, onClick }) => (
  <button onClick={() => onClick(id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${active === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 translate-x-1' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </button>
);