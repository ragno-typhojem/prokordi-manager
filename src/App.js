import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calendar, Users, FileText, Image as ImageIcon, Printer, 
  Plus, Trash2, Settings, Upload, GripVertical, X, 
  CheckCircle2, AlertTriangle, BookOpen, GraduationCap, 
  AlertOctagon, UserCheck, ShieldCheck, Award, AlertCircle, 
  Copy, Repeat, Search, Package, BarChart3, Sparkles, BrainCircuit,
  RefreshCw, Wand2, XCircle, Zap, ChevronDown, ChevronUp, Mic, Play,
  LayoutDashboard, Coffee, Utensils, Projector, Sun, Loader2,
  Type, MousePointer2, Minus, PlusCircle, Maximize2, Smile,
  ArrowUpCircle, ArrowDownCircle, Camera, Settings2, MoveVertical,
  Maximize, MessageCircle, RotateCcw, Database
} from 'lucide-react';
// --- VERİTABANI ANAHTARLARI ---
const DB_KEYS = {
  ACTIVITIES: 'activities_v15',
  VOLUNTEERS: 'shared_volunteers_v1',
  TIMESLOTS: 'timeSlots_v25',
  CLASSES: 'classes_v13',
  NAMETAG_VOLUNTEERS: 'nameTagVolunteers',
  COLLAGE_VOLUNTEERS: 'collageVolunteers'
};

// --- VERİTABANI SİMÜLASYONU ---
const db = {
  save: (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; } 
    catch (e) { console.error(e); return false; }
  },
  load: (key, defaultValue) => {
    try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : defaultValue; } 
    catch (e) { return defaultValue; }
  }
};
// --- VERİ SENKRONİZASYON FONKSİYONU ---
const syncVolunteers = () => {
  try {
    // Ana gönüllü listesini al
    const mainVolunteers = db.load(DB_KEYS.VOLUNTEERS, []);
    
    // İsimlik modülü verileri
    const nameTagVolunteers = db.load(DB_KEYS.NAMETAG_VOLUNTEERS, []);
    
    // Kolaj modülü verileri
    const collageVolunteers = db.load(DB_KEYS.COLLAGE_VOLUNTEERS, []);
    
    // Tüm gönüllüleri birleştir
    const allVolunteerIds = new Set([
      ...mainVolunteers.map(v => v.id),
      ...nameTagVolunteers.map(v => v.id),
      ...collageVolunteers.map(v => v.id)
    ]);
    
    // Birleştirilmiş gönüllü listesi
    const mergedVolunteers = [];
    
    allVolunteerIds.forEach(id => {
      // Her kaynaktan gönüllüyü bul
      const mainVol = mainVolunteers.find(v => v.id === id);
      const nameTagVol = nameTagVolunteers.find(v => v.id === id);
      const collageVol = collageVolunteers.find(v => v.id === id);
      
      // Birleştirilmiş gönüllü
      const mergedVol = {
        id,
        name: (mainVol || nameTagVol || collageVol)?.name || "Gönüllü",
        capabilities: mainVol?.capabilities || [],
        nameSize: nameTagVol?.nameSize || 60,
        nameY: nameTagVol?.nameY || 0,
        surnameSize: nameTagVol?.surnameSize || 12,
        surnameY: nameTagVol?.surnameY || 0,
        question: nameTagVol?.question || "",
        photo: collageVol?.photo || null,
        scale: collageVol?.scale || 1,
        translateX: collageVol?.translateX || 0,
        translateY: collageVol?.translateY || 0
      };
      
      mergedVolunteers.push(mergedVol);
    });
    
    // Tüm kaynaklara kaydet
    db.save(DB_KEYS.VOLUNTEERS, mergedVolunteers);
    db.save(DB_KEYS.NAMETAG_VOLUNTEERS, mergedVolunteers);
    db.save(DB_KEYS.COLLAGE_VOLUNTEERS, mergedVolunteers);
    
    return mergedVolunteers;
  } catch (e) {
    console.error("Veri senkronizasyon hatası:", e);
    return [];
  }
};

const uuid = () => Math.random().toString(36).substr(2, 9);

// --- MOCK VERİLER ---
const MOCK_VOLUNTEERS_GENERAL = [
  "Prof. Dr. Hüseyin Vural", "Ahmet Yılmaz", "Ayşe Demir", "Mehmet Öz", 
  "Fatma Kara", "Can Yıldız", "Zeynep Su", "Burak Çelik", "Elif Nur",
  "Cem Dere", "Seda Taş", "Oğuz Han", "Merve Gül", "Deniz Ak"
];

// --- GÖRSELLER --- 
const IMAGES = {
  NAME_BG: "https://i.ibb.co/9Hcchfq8/ntaraf.png", 
  QUESTION_BG: "https://i.ibb.co/mVYxB8j2/Ekran-g-r-nt-s-2026-01-12-202232.png" 
};

// --- ANA UYGULAMA ---
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
      case 'minutes': return <DocumentCreator onNotify={showNotify} />;
      case 'collage': return <CollageApp onNotify={showNotify} />;
      default: return <InfinityScheduler onNotify={showNotify} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700;800&display=swap');
        .font-comic { font-family: 'Comic Sans MS', 'Comic Sans', 'Comic Neue', cursive; }
        
        @media print {
          body * { visibility: hidden; }
          #printable-section, #printable-section * { visibility: visible; }
          #printable-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; color: black; }
          ::-webkit-scrollbar { display: none; }
          .no-print { display: none !important; }
        }

        /* --- LIQUID ANIMATIONS --- */
        @keyframes liquid-blob-morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        @keyframes rainbow-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes breathe-idle {
          0%, 100% { transform: scale(1); border-color: rgba(203, 213, 225, 0.5); }
          50% { transform: scale(1.05); border-color: rgba(203, 213, 225, 1); }
        }
        
        /* --- BALKIZ ANIMATIONS --- */
        @keyframes liquidMorph {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          33% { border-radius: 60% 40% 30% 70% / 50% 60% 30% 50%; }
          66% { border-radius: 50% 50% 40% 60% / 40% 40% 60% 60%; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ai-avatar-wrapper {
          position: relative; width: 80px; height: 80px;
          display: flex; align-items: center; justify-center;
        }
        .ai-rainbow-liquid {
          position: absolute; inset: -5px;
          background: linear-gradient(135deg, #ff0080, #7928ca, #4f46e5, #0ea5e9, #ff0080);
          background-size: 300% 300%; opacity: 0; transition: all 0.5s ease;
          z-index: 0; filter: blur(8px);
        }
        .ai-rainbow-liquid.active {
          opacity: 0.8;
          animation: liquid-blob-morph 4s ease-in-out infinite, rainbow-flow 3s linear infinite;
        }
        .ai-core-container {
          position: relative; width: 60px; height: 60px; background: white;
          border-radius: 50%; z-index: 10; display: flex; align-items: center;
          justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 2px solid #e2e8f0; transition: all 0.3s ease;
        }
        .ai-core-container.active {
          border-color: transparent; background: rgba(255, 255, 255, 0.9); animation: none;
        }
        .ai-core-container.idle { animation: breathe-idle 4s ease-in-out infinite; }

        .console-panel {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;
          background: #ffffff; border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
        }
        .console-panel.closed { max-height: 0; padding: 0; border: none; }
        .console-panel.open { max-height: 500px; padding: 1.5rem; }

        .typing-cursor::after {
            content: ''; display: inline-block; width: 4px; height: 16px;
            background: #7928ca; margin-left: 3px; vertical-align: sub;
            animation: blink 1s step-end infinite;
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        
        /* --- A4 PAGE STYLES --- */
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { width: 100%; display: block; }
          .a4-page {
             box-shadow: none !important;
             margin: 0 !important;
             width: 210mm !important;
             height: 297mm !important;
             max-height: 297mm !important;
             overflow: hidden !important;
             display: flex !important;
             flex-direction: column !important;
             page-break-after: always;
          }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col shadow-xl z-20 print:hidden shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
             <LayoutDashboard size={24} />
             <h1 className="text-xl font-bold text-white tracking-wide">ProManager+</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase pl-8">v26.2 Premium</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem id="scheduler" icon={<Calendar size={20}/>} label="Akıllı Program" active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="badges" icon={<Users size={20}/>} label="İsimlik Basımı" active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="minutes" icon={<FileText size={20}/>} label="Tutanak & Belge" active={activeTab} onClick={setActiveTab} />
          <SidebarItem id="collage" icon={<ImageIcon size={20}/>} label="Fotoğraf Kolajı" active={activeTab} onClick={setActiveTab} />
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-600 text-center">
            &copy; 2026 İlkyar Vakfı
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 overflow-auto bg-[#f8fafc] relative print:bg-white print:p-0 print:overflow-visible">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-30 print:hidden shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {activeTab === 'scheduler' && <><Calendar className="text-indigo-600" size={20}/> Akıllı Ders & Gönüllü Planlayıcı</>}
            {activeTab === 'badges' && <><Users className="text-indigo-600" size={20}/> İsimlik Matbaası</>}
            {activeTab === 'minutes' && <><FileText className="text-indigo-600" size={20}/> Resmi Belge Yöneticisi</>}
            {activeTab === 'collage' && <><ImageIcon className="text-indigo-600" size={20}/> Görsel Kolaj Düzenleyici</>}
          </h2>
          <button onClick={handlePrint} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm">
            <Printer size={16} /> <span>Yazdır</span>
          </button>
        </header>

        <div className="p-8 print:p-0 min-h-[calc(100vh-4rem)] text-slate-800 max-w-7xl mx-auto" id="printable-section">
          {renderContent()}
        </div>

        {notification && (
          <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce print:hidden z-50 flex items-center gap-3 border-l-4 border-green-500">
            <CheckCircle2 className="text-green-400"/> {notification}
          </div>
        )}
      </main>
    </div>
  );
}

const SidebarItem = ({ id, icon, label, active, onClick }) => (
  <button onClick={() => onClick(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${active === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </button>
);

// --- B.A.L.K.I.Z. CONSOLE (ORTAK BİLEŞEN) ---
const BalkizRainbowConsole = ({ warnings = [], 
  aiState = 'idle', 
  isOpen = true, 
  onClose = () => {}, 
  hasDistributed = false, 
  activeAction = null, 
  volunteers = [] }) => {
  const [displayText, setDisplayText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false); 
  const [isThinking, setIsThinking] = useState(false);
  
  useEffect(() => {
    let msg = "";
    if (aiState === 'processing') {
      msg = "Sistem taranıyor... Veriler analiz ediliyor... Optimizasyon başlıyor...";
    } else if (isThinking) {
      msg = "Yapılan değişiklikleri inceliyorum, hemen bir rapor sunacağım...";
    } else if (activeAction) {
      msg = "Hizalama ve düzenleme işlemlerinizi takip ediyorum, oldukça estetik ilerliyor.";
    } else if (!hasDistributed && aiState === 'idle') {
      const h = new Date().getHours();
      msg = `${h < 12 ? 'Günaydın' : 'Merhaba'}. Ben B.A.L.K.I.Z. Sistemi organize etmeye hazırım.`;
    } else if (hasDistributed && warnings.length === 0) {
      msg = "Harika! Sistem kusursuz görünüyor. Tüm öğeler çakışmasız yerleştirildi.";
    } else if (hasDistributed && warnings.length > 0) {
       msg = `Analiz tamamlandı. ${warnings.length} adet dikkat gerektiren durum var.`;
    } else if (!hasDistributed && warnings.length > 0) {
       msg = "Manuel değişiklikler tespit ettim. Bazı uyarılarım var.";
    }
    setTargetText(msg);
  }, [warnings, aiState, isOpen, hasDistributed, isThinking, activeAction]);

  useEffect(() => {
    if (targetText && isOpen) { setIsAnimating(true); setDisplayText(""); }
  }, [targetText, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (displayText.length < targetText.length) {
      const timeout = setTimeout(() => setDisplayText(targetText.slice(0, displayText.length + 1)), 30);
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
    <div className={`console-panel w-full relative z-40 mb-6 rounded-b-2xl ${isOpen ? 'open' : 'closed'}`}>
       {onClose && <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full hover:bg-slate-100"><X size={18}/></button>}
       <div className="flex flex-col md:flex-row gap-6 items-start max-w-4xl mx-auto">
          <div className="shrink-0 pt-1 flex flex-col items-center">
             <div className="ai-avatar-wrapper">
                <div className={`ai-rainbow-liquid ${frameActive ? 'active' : ''}`}></div>
                <div className={`ai-core-container ${frameActive ? 'active' : 'idle'}`}>
                    <Sparkles className="text-indigo-600 fill-indigo-100" size={28}/>
                </div>
             </div>
             <div className="mt-3 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">B.A.L.K.I.Z.</div>
          </div>
          <div className="flex-1 w-full">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                {aiState === 'processing' ? <><RefreshCw size={12} className="animate-spin text-indigo-500"/> İşleniyor</> : <><Zap size={12} className="text-amber-500"/> Rapor</>}
             </h3>
             <p className="text-slate-700 text-lg font-medium leading-relaxed typing-cursor min-h-[3rem]">{displayText}</p>
             {aiState !== 'processing' && warnings.length > 0 && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                   {warnings.map((w, i) => (
                      <div key={i} className={`p-3 rounded-lg border text-xs flex items-center gap-3 bg-white shadow-sm ${w.type === 'stock' || w.type === 'protocol' ? 'border-l-4 border-l-fuchsia-500' : 'border-l-4 border-l-slate-400'}`}>
                         <span className="font-semibold text-slate-600">{w.msg}</span>
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- MODÜL 1: INFINITY SCHEDULER ---
function InfinityScheduler({ onNotify }) {
  const [activeView, setActiveView] = useState('view'); 

  // --- DATA ---
  const [activities, setActivities] = useState(db.load('activities_v15', [
    { id: 'a1', name: 'Volkan Deneyi', cat: 'science', isMust: true, boxCount: 20 },
    { id: 'a2', name: 'Sıvı Azot', cat: 'science', isMust: true, boxCount: 2 },
    { id: 'a3', name: 'Ebru Sanatı', cat: 'art', isMust: false, boxCount: 4 },
    { id: 'a4', name: 'Robotik', cat: 'tech', isMust: false, boxCount: 5 },
  ]));

 const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.VOLUNTEERS, [
    { id: 'v1', name: 'Ahmet Y.', capabilities: ['a1', 'a2', 'a4'] },
    { id: 'v2', name: 'Ayşe K.', capabilities: ['a3'] },
    { id: 'v3', name: 'Mehmet T.', capabilities: ['a1', 'a3', 'a4'] },
    { id: 'v4', name: 'Zeynep B.', capabilities: [] },
  ]));
  const [timeSlots, setTimeSlots] = useState(db.load('timeSlots_v25', [
    { id: 't1', start: '09:00', end: '09:40', type: 'lesson' },
    { id: 't2', start: '09:40', end: '10:00', type: 'break' },
    { id: 't3', start: '10:00', end: '10:40', type: 'lesson' },
    { id: 't4', start: '10:40', end: '11:00', type: 'break' },
    { id: 't5', start: '11:00', end: '11:40', type: 'presentation' }, 
    { id: 't6', start: '11:40', end: '13:00', type: 'lunch' }, 
    { id: 't7', start: '13:00', end: '13:40', type: 'lesson' },
  ]));

  const [classes, setClasses] = useState(db.load('classes_v13', [
    { id: 'c1', name: '5-A', schedule: {} },
    { id: 'c2', name: '5-B', schedule: {} },
  ]));

  const [warnings, setWarnings] = useState([]);
  const [aiState, setAiState] = useState('idle'); 
  const [isConsoleOpen, setIsConsoleOpen] = useState(true); 
  const [hasDistributed, setHasDistributed] = useState(false); 
  const [editingSlot, setEditingSlot] = useState(null);
  const dragItem = useRef();

  useEffect(() => { db.save(DB_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { 
    db.save(DB_KEYS.VOLUNTEERS, volunteers); 
    syncVolunteers(); // Gönüllü verisi değiştiğinde senkronizasyon yap
  }, [volunteers]);
  useEffect(() => { db.save(DB_KEYS.TIMESLOTS, timeSlots); }, [timeSlots]);
  useEffect(() => { db.save(DB_KEYS.CLASSES, classes); }, [classes]);
  useEffect(() => { 
    const warns = calculateConflicts(); 
    setWarnings(warns);
  }, [classes, activities, timeSlots, volunteers]);

  const getVolunteerCounts = () => {
      const counts = {};
      volunteers.forEach(v => counts[v.id] = 0);
      classes.forEach(c => {
          Object.values(c.schedule).forEach(s => {
              if(s.leadId) counts[s.leadId] = (counts[s.leadId] || 0) + 1;
          });
      });
      return counts;
  };

  const calculateConflicts = () => {
    const newWarnings = [];
    const mustActivities = activities.filter(a => a.isMust);
    const lessonSlots = timeSlots.filter(t => t.type === 'lesson');
    
    if(classes.every(c => Object.keys(c.schedule).length === 0)) return [];

    classes.forEach(cls => {
      const activityCounts = {};
      const volunteerCounts = {};

      Object.values(cls.schedule).forEach(slotData => {
         if(slotData.activityId) activityCounts[slotData.activityId] = (activityCounts[slotData.activityId] || 0) + 1;
         if(slotData.leadId) volunteerCounts[slotData.leadId] = (volunteerCounts[slotData.leadId] || 0) + 1;
      });

      Object.entries(activityCounts).forEach(([actId, count]) => {
          if(count > 1) {
              const actName = activities.find(a => a.id === actId)?.name || 'Etkinlik';
              newWarnings.push({ type: 'duplicate_act', msg: `${cls.name}: "${actName}" ${count} kere tekrar ediyor!` });
          }
      });

      Object.entries(volunteerCounts).forEach(([volId, count]) => {
          if(count > 1) {
              const volName = volunteers.find(v => v.id === volId)?.name || 'Gönüllü';
              newWarnings.push({ type: 'duplicate_vol', msg: `${cls.name}: ${volName} sınıfa ${count} kez giriyor.` });
          }
      });

      mustActivities.forEach(must => {
        if(!activityCounts[must.id]) newWarnings.push({ type: 'missing', msg: `${cls.name}: "${must.name}" (Must) eksik.` });
      });

      lessonSlots.forEach(slot => {
          if(!cls.schedule[slot.id]) newWarnings.push({ type: 'empty', msg: `${cls.name} sınıfı ${slot.start} saatinde boş!` });
      });
    });

    lessonSlots.forEach(slot => {
        let volMap = {}; 
        let activityUsageInSlot = {};

        classes.forEach(cls => {
            const cell = cls.schedule[slot.id];
            if(cell) {
                if(cell.leadId) {
                    if(!volMap[cell.leadId]) volMap[cell.leadId] = [];
                    volMap[cell.leadId].push(cls.name);
                    const volunteer = volunteers.find(v => v.id === cell.leadId);
                    if(volunteer && !volunteer.capabilities.includes(cell.activityId)) {
                        newWarnings.push({ type: 'competency', msg: `${volunteer.name}, "${cell.name}" etkinliğini bilmiyor!` });
                    }
                }
                if(cell.activityId) {
                    activityUsageInSlot[cell.activityId] = (activityUsageInSlot[cell.activityId] || 0) + 1;
                }
            }
        });

        Object.keys(volMap).forEach(volId => {
            if(volMap[volId].length > 1) {
                const vName = volunteers.find(v=>v.id===volId)?.name || 'Gönüllü';
                newWarnings.push({ type: 'conflict', msg: `${vName}, ${slot.start} saatinde çakışıyor: ${volMap[volId].join(' & ')}` });
            }
        });

        Object.keys(activityUsageInSlot).forEach(actId => {
            const act = activities.find(a => a.id === actId);
            if(act && activityUsageInSlot[actId] > (act.boxCount || 99)) {
                newWarnings.push({ 
                    type: 'stock', 
                    msg: `${act.name} stoğu yetersiz! (${activityUsageInSlot[actId]} sınıf > ${act.boxCount} kutu)` 
                });
            }
        });
    });
    return newWarnings;
  };

  const distributePerfectly = () => {
    setAiState('processing');
    setIsConsoleOpen(true); 
    setHasDistributed(true); 
    
    setTimeout(() => {
        let newClasses = JSON.parse(JSON.stringify(classes));
        newClasses.forEach(c => c.schedule = {});
        let volLoad = {}; 
        volunteers.forEach(v => volLoad[v.id] = 0);

        const checkStockAvailability = (actId, slotId, currentClasses) => {
            const act = activities.find(a => a.id === actId);
            const limit = act.boxCount || 99;
            let usage = 0;
            currentClasses.forEach(c => {
                if(c.schedule[slotId] && c.schedule[slotId].activityId === actId) usage++;
            });
            return usage < limit;
        };

        const findAvailableLead = (actId, slotId, currentClassId, currentClasses) => {
            if(!checkStockAvailability(actId, slotId, currentClasses)) return null;
            const capable = volunteers.filter(v => v.capabilities.includes(actId));
            const available = capable.filter(v => {
                let busy = false;
                currentClasses.forEach(c => {
                    if(c.id === currentClassId) return;
                    if(c.schedule[slotId] && c.schedule[slotId].leadId === v.id) busy = true;
                });
                return !busy;
            });
            if(available.length === 0) return null;
            available.sort((a,b) => volLoad[a.id] - volLoad[b.id]);
            return available[0];
        };

        const lessonSlots = timeSlots.filter(t => t.type === 'lesson');
        const mustActivities = activities.filter(a => a.isMust);
        let shuffledClasses = [...newClasses].sort(() => Math.random() - 0.5);

        shuffledClasses.forEach(cls => {
            let freeSlots = [...lessonSlots].sort(() => Math.random() - 0.5);
            mustActivities.forEach(must => {
                for (let i = 0; i < freeSlots.length; i++) {
                    const slot = freeSlots[i];
                    const lead = findAvailableLead(must.id, slot.id, cls.id, newClasses);
                    if (lead) {
                        newClasses.find(c => c.id === cls.id).schedule[slot.id] = {
                            activityId: must.id, name: must.name, cat: must.cat, isMust: true,
                            lead: lead.name, leadId: lead.id, support: []
                        };
                        volLoad[lead.id]++;
                        freeSlots.splice(i, 1);
                        break;
                    }
                }
            });
        });

        newClasses.forEach(cls => {
            lessonSlots.forEach(slot => {
                if(!cls.schedule[slot.id]) {
                    const existingActivityIds = Object.values(cls.schedule).map(s => s.activityId);
                    const validOptionalActs = activities
                        .filter(a => !a.isMust && !existingActivityIds.includes(a.id))
                        .sort(() => Math.random() - 0.5);

                    for(let act of validOptionalActs) {
                        const lead = findAvailableLead(act.id, slot.id, cls.id, newClasses);
                        if(lead) {
                            cls.schedule[slot.id] = {
                                activityId: act.id, name: act.name, cat: act.cat, isMust: false,
                                lead: lead.name, leadId: lead.id, support: []
                            };
                            volLoad[lead.id]++;
                            break;
                        }
                    }
                }
            });
        });

        setClasses(newClasses);
        setAiState('idle'); 
        onNotify('B.A.L.K.I.Z. Dağıtımı Tamamladı!');
    }, 1500); 
  };

  const handleDragStart = (e, clsId, slotId, data) => { if(!data) return; dragItem.current = { clsId, slotId, data }; };
  const handleDrop = (e, targetClsId, targetSlotId) => {
    e.preventDefault();
    const source = dragItem.current;
    if(!source || (source.clsId === targetClsId && source.slotId === targetSlotId)) return;
    const targetSlotType = timeSlots.find(t=>t.id===targetSlotId)?.type;
    if(targetSlotType !== 'lesson') return;

    const newClasses = JSON.parse(JSON.stringify(classes));
    const srcClass = newClasses.find(c => c.id === source.clsId);
    const tgtClass = newClasses.find(c => c.id === targetClsId);
    const srcData = srcClass.schedule[source.slotId];
    const tgtData = tgtClass.schedule[targetSlotId];
    delete srcClass.schedule[source.slotId];
    tgtClass.schedule[targetSlotId] = srcData; 
    if(tgtData) srcClass.schedule[source.slotId] = tgtData; 
    setClasses(newClasses);
  };

  const handleSlotClick = (clsId, slotId, data) => {
    const slotType = timeSlots.find(t=>t.id===slotId)?.type;
    if(slotType !== 'lesson') return;
    setEditingSlot({ 
        clsId, 
        slotId, 
        data: data ? { ...data, support: data.support || [] } : { name: '', activityId: '', lead: '', leadId: '', support: [] } 
    });
  };

  const saveSlotEdit = () => {
    if (!editingSlot) return;

    let finalActivityId = editingSlot.data.activityId;
    let finalActivityName = editingSlot.data.name;

    const existingAct = activities.find(a => a.id === finalActivityId);
    if (!existingAct && finalActivityName) {
        const newAct = { id: uuid(), name: finalActivityName, cat: 'science', isMust: false, boxCount: 20 };
        finalActivityId = newAct.id;
        const updatedActivities = [...activities, newAct];
        setActivities(updatedActivities);
        db.save('activities_v15', updatedActivities);
        onNotify(`"${newAct.name}" havuza eklendi!`);
        
        if(editingSlot.data.leadId) {
            const updatedVolunteers = volunteers.map(v => {
                if(v.id === editingSlot.data.leadId && !v.capabilities.includes(newAct.id)) {
                    return { ...v, capabilities: [...v.capabilities, newAct.id] };
                }
                return v;
            });
       const setVolunteers = (newVolunteers) => {
        updateVolunteers(newVolunteers);
  };
        }
    }

    const updatedClasses = classes.map(c => {
        if (c.id === editingSlot.clsId) {
            const newSchedule = { ...c.schedule };
            if(editingSlot.data.activityId === 'delete') delete newSchedule[editingSlot.slotId];
            else {
                newSchedule[editingSlot.slotId] = {
                    ...editingSlot.data,
                    activityId: finalActivityId,
                    name: finalActivityName
                };
            }
            return { ...c, schedule: newSchedule };
        }
        return c;
    });
    setClasses(updatedClasses);
    setEditingSlot(null);
  };

  const isExpert = (volId, actId) => { const v = volunteers.find(vol => vol.id === volId); return v && v.capabilities.includes(actId); };
  const volunteerCounts = getVolunteerCounts();
  const sortedVolunteers = [...volunteers].sort((a,b) => volunteerCounts[a.id] - volunteerCounts[b.id]);

  return (
    <div className="space-y-6 relative">
      {/* HEADER CONTROLS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print flex flex-wrap gap-2 items-center relative z-50">
        <NavBtn active={activeView==='view'} onClick={()=>setActiveView('view')} icon={<Calendar size={18}/>} label="Program" />
        <NavBtn active={activeView==='setup'} onClick={()=>setActiveView('setup')} icon={<BookOpen size={18}/>} label="Katalog & Zaman" />
        <NavBtn active={activeView==='volunteers'} onClick={()=>setActiveView('volunteers')} icon={<GraduationCap size={18}/>} label="Gönüllü & Yetenek" />
        <div className="flex-1"></div>
        {activeView === 'view' && (
          <>
            <button onClick={() => setIsConsoleOpen(!isConsoleOpen)} className={`mr-2 px-3 py-2 rounded-lg font-bold border transition-colors ${isConsoleOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}>
                {isConsoleOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            </button>
            <button onClick={distributePerfectly} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-2 rounded-lg font-bold flex gap-2 items-center shadow-lg shadow-fuchsia-200 transform active:scale-95 transition-all">
                <Wand2 size={18}/> B.A.L.K.I.Z. Dağıtsın
            </button>
          </>
        )}
      </div>

      {/* LIQUID INTELLIGENCE CONSOLE */}
      <BalkizRainbowConsole 
        warnings={warnings} 
        aiState={aiState} 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)}
        hasDistributed={hasDistributed}
      />

      {activeView === 'view' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print overflow-x-auto relative z-10 mt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2 tracking-wide"><BarChart3 size={14}/> Gönüllü Yük Dengesi</h4>
            <div className="flex gap-3">
                {sortedVolunteers.map(vol => {
                    const count = volunteerCounts[vol.id];
                    let bgClass = "bg-white border-slate-200 text-slate-600";
                    let countClass = "bg-slate-100 text-slate-600";
                    
                    if(count > 0 && count <= 3) {
                       bgClass = "bg-emerald-50 border-emerald-200 text-emerald-700";
                       countClass = "bg-emerald-100 text-emerald-800";
                    } else if(count > 3) {
                       bgClass = "bg-orange-50 border-orange-200 text-orange-700";
                       countClass = "bg-orange-100 text-orange-800";
                    }

                    return (
                        <div key={vol.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${bgClass}`}>
                            <span className="truncate max-w-[100px]">{vol.name}</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold ${countClass}`}>{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {activeView === 'volunteers' && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800"><Award size={24} className="text-amber-500"/> Gönüllü Yetenek Kartları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {volunteers.map(vol => (
                    <div key={vol.id} className="border border-slate-200 rounded-xl p-5 bg-white relative group shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 mr-2"><input value={vol.name} onChange={e=>setVolunteers(volunteers.map(v=>v.id===vol.id?{...v, name:e.target.value}:v))} className="w-full bg-transparent font-bold text-lg border-b border-dashed border-slate-300 focus:outline-none focus:border-indigo-500 text-slate-800"/></div>
                            <button onClick={()=>setVolunteers(volunteers.filter(v=>v.id!==vol.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                            {activities.map(act => (
                                <label key={act.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs border transition-colors ${vol.capabilities.includes(act.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                    <input type="checkbox" checked={vol.capabilities.includes(act.id)} onChange={e => {
                                            let caps = [...vol.capabilities];
                                            if(e.target.checked) caps.push(act.id); else caps = caps.filter(c => c !== act.id);
                                            setVolunteers(volunteers.map(v=>v.id===vol.id?{...v, capabilities:caps}:v));
                                    }} className="accent-indigo-600 w-3.5 h-3.5" />
                                    {act.name}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button onClick={()=>setVolunteers([...volunteers, {id:uuid(), name:'Yeni Gönüllü', capabilities:[]}])} className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all h-[300px]"><Plus size={48} className="mb-2"/><span className="font-bold">Gönüllü Ekle</span></button>
            </div>
         </div>
      )}

      {activeView === 'setup' && <SetupModule activities={activities} setActivities={setActivities} timeSlots={timeSlots} setTimeSlots={setTimeSlots} classes={classes} setClasses={setClasses} />}

      {activeView === 'view' && (
        <div className="bg-white p-8 shadow-sm rounded-xl border border-slate-200 print:shadow-none print:p-0 w-full max-w-[297mm] mx-auto landscape-print mt-4">
           <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
             <h1 className="text-2xl font-black uppercase text-slate-900 tracking-[0.2em]">Etkinlik Programı</h1>
           </div>
           <table className="w-full border-collapse border border-slate-900 text-sm table-fixed">
             <thead>
               <tr className="bg-slate-50 print:bg-slate-100">
                 <th className="border border-slate-900 p-3 w-24 bg-slate-100 text-slate-900 font-bold">Saat</th>
                 {classes.map(c => <th key={c.id} className="border border-slate-900 p-3 text-lg font-bold w-40 text-slate-900">{c.name}</th>)}
               </tr>
             </thead>
             <tbody>
               {timeSlots.map(slot => {
                 if (slot.type !== 'lesson') {
                     let rowLabel = 'ARA';
                     let rowClass = 'bg-slate-50';
                     let icon = null;
                     
                     if (slot.type === 'break') { rowLabel = 'TENEFFÜS'; rowClass = 'bg-slate-100 text-slate-400'; icon = <Coffee size={16}/>; }
                     else if (slot.type === 'lunch') { rowLabel = 'ÖĞLE ARASI'; rowClass = 'bg-orange-50 text-orange-600'; icon = <Utensils size={16}/>; }
                     else if (slot.type === 'presentation') { rowLabel = 'SUNUM / SEMİNER'; rowClass = 'bg-indigo-50 text-indigo-600'; icon = <Projector size={16}/>; }
                     else if (slot.type === 'outdoor') { rowLabel = 'DIŞ ETKİNLİK'; rowClass = 'bg-emerald-50 text-emerald-600'; icon = <Sun size={16}/>; }

                     return (
                        <tr key={slot.id} className={rowClass}>
                           <td className="border border-slate-900 p-2 font-bold text-center align-middle text-slate-900">
                             <div className="text-base">{slot.start} - {slot.end}</div>
                           </td>
                           <td colSpan={classes.length} className="border border-slate-900 p-2 text-center align-middle">
                              <div className="flex items-center justify-center gap-2 font-black tracking-widest text-sm opacity-80">
                                 {icon} {rowLabel}
                              </div>
                           </td>
                        </tr>
                     );
                 }
                 return (
                 <tr key={slot.id}>
                   <td className="border border-slate-900 p-2 font-bold text-center align-middle text-slate-900">
                     <div className="text-base">{slot.start} - {slot.end}</div>
                   </td>
                   {classes.map(cls => {
                     const cell = cls.schedule[slot.id];
                     const competent = cell && cell.leadId ? isExpert(cell.leadId, cell.activityId) : true;
                     return (
                       <td key={cls.id} onDragOver={(e)=>e.preventDefault()} onDrop={(e) => handleDrop(e, cls.id, slot.id)} className="border border-slate-900 p-1 text-center h-32 relative align-top transition-colors hover:bg-slate-50 text-slate-900">
                         {cell ? (
                           <div draggable onDragStart={(e) => handleDragStart(e, cls.id, slot.id, cell)} onClick={() => handleSlotClick(cls.id, slot.id, cell)} className="h-full flex flex-col cursor-grab active:cursor-grabbing group relative p-1.5 rounded hover:bg-white hover:shadow-lg hover:z-10 transition-all border border-transparent hover:border-slate-200">
                             <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border mb-1 flex items-center justify-between shadow-sm ${cell.isMust ? 'bg-red-50 border-red-200 text-red-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                               <span className="truncate">{cell.name}</span>
                               {cell.isMust && <span className="text-[8px] bg-red-500 text-white px-1 rounded ml-1">Z</span>}
                             </div>
                             <div className="text-left px-1 mt-auto space-y-1.5">
                                <div className="text-[11px] leading-tight flex items-center gap-1">
                                   <span className="font-bold text-slate-500">Lider:</span> <span className="truncate font-semibold text-slate-800">{cell.lead}</span>
                                   {!competent && <AlertCircle size={14} className="text-orange-500" title="Uzman Değil"/>}
                                </div>
                                {cell.support && cell.support.length > 0 && <div className="text-[10px] leading-tight text-slate-400 truncate"><span className="font-bold text-slate-500">Yrd:</span> {cell.support.join(', ')}</div>}
                             </div>
                           </div>
                         ) : <div className="h-full w-full flex flex-col items-center justify-center text-slate-200 hover:text-indigo-400 cursor-pointer transition-colors" onClick={()=>handleSlotClick(cls.id, slot.id, null)}><Plus size={28}/></div>}
                       </td>
                     );
                   })}
                 </tr>
               )})}
             </tbody>
           </table>
        </div>
      )}

      {/* --- MODAL (GELİŞMİŞ EKLEME) --- */}
      {editingSlot && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 print:hidden backdrop-blur-sm">
           <div className="bg-white p-6 rounded-xl shadow-2xl w-96 border-t-4 border-indigo-600 animate-fadeIn text-slate-800">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg text-slate-800">{editingSlot.data.activityId ? 'Dersi Düzenle' : 'Ders Ekle'}</h3>
                 <button onClick={()=>setEditingSlot(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>
              <div className="mb-4 relative">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Etkinlik</label>
                 <div className="relative">
                     <Search size={16} className="absolute left-3 top-3 text-slate-400"/>
                     <input 
                        className="w-full border border-slate-200 p-2 pl-9 rounded bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        placeholder="Etkinlik ara veya yaz..."
                        value={editingSlot.data.name || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            const match = activities.find(a => a.name.toLowerCase() === val.toLowerCase());
                            if(match) {
                                setEditingSlot({...editingSlot, data: { ...editingSlot.data, activityId: match.id, name: match.name, cat: match.cat, isMust: match.isMust }});
                            } else {
                                setEditingSlot({...editingSlot, data: { ...editingSlot.data, activityId: '', name: val }});
                            }
                        }}
                     />
                 </div>
                 {editingSlot.data.name && !activities.find(a => a.name === editingSlot.data.name) && (
                     <div className="mt-1 text-xs text-indigo-600 font-bold flex items-center gap-1">
                        <Plus size={12}/> "{editingSlot.data.name}" havuza eklenecek.
                     </div>
                 )}
                 <div className="mt-2 max-h-32 overflow-y-auto border border-slate-200 rounded bg-white">
                     {activities.filter(a => a.name.toLowerCase().includes((editingSlot.data.name || '').toLowerCase())).map(a => (
                         <div 
                           key={a.id} 
                           className="p-2 hover:bg-slate-100 cursor-pointer text-sm border-b border-slate-100 last:border-0"
                           onClick={() => setEditingSlot({...editingSlot, data: { ...editingSlot.data, activityId: a.id, name: a.name, cat: a.cat, isMust: a.isMust }})}
                         >
                            {a.name} {a.isMust && <span className="text-[10px] text-red-500 font-bold">(Z)</span>}
                         </div>
                     ))}
                 </div>
              </div>
              <div className="mb-4">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Lider Gönüllü</label>
                 <select className="w-full border border-slate-200 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" value={editingSlot.data.leadId || ''} onChange={e => {
                        const v = volunteers.find(vol=>vol.id === e.target.value);
                        setEditingSlot({...editingSlot, data:{...editingSlot.data, lead:v?.name, leadId:v?.id}});
                    }}>
                    <option value="">Seçiniz...</option>
                    {editingSlot.data.activityId ? (
                        <>
                        <optgroup label="Uzman Gönüllüler">
                            {volunteers.filter(v => v.capabilities.includes(editingSlot.data.activityId)).map(v => {
                                let isBusy = false;
                                classes.forEach(c => { if(c.id === editingSlot.clsId) return; if(c.schedule[editingSlot.slotId] && c.schedule[editingSlot.slotId].leadId === v.id) isBusy = true; });
                                return <option key={v.id} value={v.id} disabled={isBusy} className={isBusy ? 'text-red-400' : 'text-teal-600 font-bold'}>{v.name} {isBusy ? '(DOLU)' : ''}</option>
                            })}
                        </optgroup>
                        <optgroup label="Diğerleri (Uyarı Verir)">
                            {volunteers.filter(v => !v.capabilities.includes(editingSlot.data.activityId)).map(v => {
                                let isBusy = false;
                                classes.forEach(c => { if(c.id === editingSlot.clsId) return; if(c.schedule[editingSlot.slotId] && c.schedule[editingSlot.slotId].leadId === v.id) isBusy = true; });
                                return <option key={v.id} value={v.id} disabled={isBusy} className={isBusy ? 'text-red-400' : 'text-orange-500'}>{v.name} {isBusy ? '(DOLU)' : ''}</option>
                            })}
                        </optgroup>
                        </>
                    ) : (
                        volunteers.map(v => {
                             let isBusy = false;
                             classes.forEach(c => { if(c.id === editingSlot.clsId) return; if(c.schedule[editingSlot.slotId] && c.schedule[editingSlot.slotId].leadId === v.id) isBusy = true; });
                             return <option key={v.id} value={v.id} disabled={isBusy} className={isBusy ? 'text-red-400' : ''}>{v.name} {isBusy ? '(DOLU)' : ''}</option>
                        })
                    )}
                 </select>
              </div>
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Yardımcılar</label>
                <input 
                    className="w-full border border-slate-200 p-2 rounded bg-slate-50 text-slate-800" 
                    value={Array.isArray(editingSlot.data.support) ? editingSlot.data.support.join(', ') : (editingSlot.data.support || '')} 
                    onChange={e=>setEditingSlot({...editingSlot, data:{...editingSlot.data, support:e.target.value.split(',')}})} 
                    placeholder="Ali, Veli..."
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                  {editingSlot.data.activityId && (<button onClick={()=>setEditingSlot({...editingSlot, data: { activityId: 'delete' }})} className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg font-bold flex-1 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"><Trash2 size={18}/> Sil</button>)}
                  <button onClick={saveSlotEdit} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex-[2] hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">{editingSlot.data.activityId ? 'Güncelle' : 'Kaydet & Ekle'}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

const NavBtn = ({active, onClick, icon, label}) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-lg font-bold flex gap-2 items-center transition-colors ${active ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 no-print'}`}>
     {icon} {label}
  </button>
);

const SetupModule = ({ activities, setActivities, timeSlots, setTimeSlots, classes, setClasses }) => {
    const [newClassName, setNewClassName] = useState('');

    const handleAddClass = () => {
        if(!newClassName.trim()) return;
        setClasses([...classes, {id: uuid(), name: newClassName, schedule: {}}]);
        setNewClassName('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn text-slate-800">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                  <h3 className="font-bold text-lg mb-4 text-slate-800">Etkinlik Kataloğu ve Stoklar</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {activities.map(act => (
                          <div key={act.id} className={`flex items-center justify-between p-3 rounded-lg border ${act.isMust ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex-1">
                                  <input className="font-bold bg-transparent border-none w-full mb-1 text-slate-800" value={act.name} onChange={e=>setActivities(activities.map(a=>a.id===act.id?{...a, name:e.target.value}:a))}/>
                                  <div className="flex gap-2 text-xs mt-1 items-center flex-wrap">
                                      <select value={act.cat} onChange={e=>setActivities(activities.map(a=>a.id===act.id?{...a, cat:e.target.value}:a))} className="bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-600"><option value="science">Bilim</option><option value="art">Sanat</option><option value="tech">Teknoloji</option></select>
                                      <button onClick={()=>setActivities(activities.map(a=>a.id===act.id?{...a, isMust:!act.isMust}:a))} className={`px-2 py-0.5 rounded-full flex items-center gap-1 border ${act.isMust ? 'bg-red-600 text-white border-red-600' : 'bg-slate-200 border-slate-300 text-slate-500'}`}>{act.isMust ? 'ZORUNLU' : 'Opsiyonel'}</button>
                                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                                          <Package size={12} className="text-slate-400"/>
                                          <input 
                                              type="number" 
                                              min="1"
                                              className="w-10 text-center outline-none bg-transparent font-bold text-slate-600"
                                              value={act.boxCount || ''}
                                              placeholder="Stok"
                                              onChange={e=>setActivities(activities.map(a=>a.id===act.id?{...a, boxCount:parseInt(e.target.value)||1}:a))}
                                          />
                                      </div>
                                  </div>
                              </div>
                              <button onClick={()=>setActivities(activities.filter(a=>a.id!==act.id))} className="text-slate-400 hover:text-red-500 ml-2"><Trash2 size={18}/></button>
                          </div>
                      ))}
                      <button onClick={()=>setActivities([...activities, {id:uuid(), name:'Yeni', cat:'science', isMust:false, boxCount:20}])} className="w-full bg-slate-50 py-2 rounded font-bold text-slate-500 border border-dashed border-slate-300 hover:bg-slate-100 hover:text-indigo-600">+ Ekle</button>
                  </div>
              </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                    <h3 className="font-bold text-lg mb-4">Şubeler</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {classes.map(c=>(<div key={c.id} className="bg-slate-100 px-3 py-2 rounded flex gap-2 font-bold border border-slate-200 text-slate-700">{c.name} <button onClick={()=>setClasses(classes.filter(x=>x.id!==c.id))} className="text-red-400 hover:text-red-600">x</button></div>))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            className="border border-slate-200 bg-slate-50 p-2 rounded text-sm flex-1 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800" 
                            placeholder="Yeni Sınıf Adı (Örn: 5-C)" 
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                        />
                        <button onClick={handleAddClass} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-indigo-700">Ekle</button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                    <h3 className="font-bold text-lg mb-4">Zamanlar</h3>
                    {timeSlots.map((slot,i)=>(
                        <div key={slot.id} className="flex gap-2 items-center text-sm mb-2">
                            <input type="time" value={slot.start} onChange={e=>{const n=[...timeSlots];n[i].start=e.target.value;setTimeSlots(n)}} className="border border-slate-200 bg-slate-50 p-1 rounded text-slate-800"/>-
                            <input type="time" value={slot.end} onChange={e=>{const n=[...timeSlots];n[i].end=e.target.value;setTimeSlots(n)}} className="border border-slate-200 bg-slate-50 p-1 rounded text-slate-800"/>
                            <select value={slot.type} onChange={e=>{const n=[...timeSlots];n[i].type=e.target.value;setTimeSlots(n)}} className="border p-1 rounded text-slate-800">
                                <option value="lesson">Ders</option>
                                <option value="break">Teneffüs</option>
                                <option value="lunch">Öğle Arası</option>
                                <option value="presentation">Sunum</option>
                                <option value="outdoor">Dış Etkinlik</option>
                            </select>
                            <button onClick={()=>{const n=[...timeSlots];n.splice(i,1);setTimeSlots(n)}} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                        </div>
                    ))}
                    <button onClick={()=>setTimeSlots([...timeSlots, {id:uuid(), start:'12:00', end:'12:40', type:'lesson'}])} className="text-indigo-600 text-xs font-bold hover:text-indigo-800">+ Ekle</button>
                </div>
            </div>
        </div>
    );
};

// --- İNTERAKTİF METİN BİLEŞENİ (İSİMLİK MODÜLÜ İÇİN) ---
const InteractiveText = ({ 
  text, 
  size, 
  offsetY, 
  onUpdate, 
  className, 
  style, 
  placeholder,
  isEditable 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startValuesRef = useRef({ size: 0, offset: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault(); 
    
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startValuesRef.current = { size: size, offset: offsetY || 0 };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      const newSize = Math.max(10, Math.min(200, startValuesRef.current.size + (deltaX / 3)));
      const newOffset = startValuesRef.current.offset + deltaY;

      onUpdate(newSize, newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onUpdate]);

  return (
    <div 
      className={`relative group/text cursor-move select-none ${className}`}
      style={{ 
        ...style,
        fontSize: `${size}px`, 
        transform: `translateY(${offsetY}px)`,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 ${isDragging ? 'opacity-100' : 'group-hover/text:opacity-60'} transition-opacity pointer-events-none whitespace-nowrap z-50`}>
        {Math.round(size)}px {offsetY > 0 ? `(⬇ ${Math.round(offsetY)})` : offsetY < 0 ? `(⬆ ${Math.round(Math.abs(offsetY))})` : ''}
      </div>
      
      {isEditable ? (
         <input 
            type="text" 
            value={text} 
            onChange={isEditable} 
            className="bg-transparent text-center w-full outline-none"
            onMouseDown={(e) => e.stopPropagation()} 
         /> 
      ) : (
         <span>{text || placeholder}</span>
      )}
      
      {isDragging && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full h-screen w-px border-l border-dashed border-indigo-300 opacity-50 pointer-events-none"></div>
      )}
    </div>
  );
};

// --- İNTERAKTİF FOTOĞRAF BİLEŞENİ (KOLAJ MODÜLÜ İÇİN) ---
const InteractivePhoto = ({ src, scale, translateX, translateY, onUpdate, id }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startValuesRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0 || !src) return;
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startValuesRef.current = { x: translateX || 0, y: translateY || 0 };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      onUpdate(id, scale || 1, startValuesRef.current.x + deltaX, startValuesRef.current.y + deltaY);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, id, scale, onUpdate]);

  return (
    <div 
      className="relative w-full h-full cursor-move overflow-hidden bg-slate-50 rounded-xl border border-slate-200/60 select-none touch-none group/img"
      onMouseDown={handleMouseDown}
    >
      {src ? (
        <img 
          src={src} 
          alt="Gönüllü" 
          className="max-w-none absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ 
            objectFit: 'contain',
            transform: `scale(${scale || 1}) translate(${(translateX || 0)}px, ${(translateY || 0)}px)`,
            transformOrigin: 'center center'
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-1">
            <Camera size={18} />
            <span className="text-[7px] font-bold uppercase no-print">Tıkla Yükle</span>
        </div>
      )}
      
      {src && !isDragging && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm no-print opacity-0 group-hover/img:opacity-100 transition-opacity z-20 border border-slate-100 scale-75">
            <Minus size={8} className="text-slate-400"/>
            <input 
                type="range" min="1" max="5" step="0.05" 
                value={scale || 1} 
                onChange={(e) => onUpdate(id, parseFloat(e.target.value), translateX, translateY)}
                className="w-12 h-1 bg-indigo-100 rounded-lg accent-indigo-600 cursor-pointer appearance-none"
                onMouseDown={(e) => e.stopPropagation()}
            />
            <PlusCircle size={8} className="text-indigo-500"/>
        </div>
      )}
    </div>
  );
};

// --- MODÜL 2: İSİMLİK UYGULAMASI ---
function NameTagApp({ onNotify }) {
  const ROWS_PER_PAGE = 5;
  const [globalNameSize, setGlobalNameSize] = useState(60);
  const [globalSurnameSize, setGlobalSurnameSize] = useState(12);
  
  const [pagePadding, setPagePadding] = useState(5); 
  const [cardGap, setCardGap] = useState(2);
  const [verticalCompression, setVerticalCompression] = useState(0); 
  const [globalScale, setGlobalScale] = useState(100); 
  
  const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.NAMETAG_VOLUNTEERS, [
    { id: 1, name: "Örnek İsim", nameSize: 60, nameY: 0, surnameSize: 12, surnameY: 0, question: "" },
    { id: 2, name: "Diğer İsim", nameSize: 60, nameY: 0, surnameSize: 12, surnameY: 0, question: "" },
    { id: 3, name: "Yeni Gönüllü", nameSize: 60, nameY: 0, surnameSize: 12, surnameY: 0, question: "" },
  ]));
  
  const [showVolunteersList, setShowVolunteersList] = useState(false);
  const [aiState, setAiState] = useState('idle');
  const [activeAction, setActiveAction] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    db.save(DB_KEYS.NAMETAG_VOLUNTEERS, volunteers);
    // Gönüllü verisi değiştiğinde senkronizasyon yap
    syncVolunteers();
  }, [volunteers]);

  // Detaylı Analiz Motoru
  useEffect(() => {
    if (aiState === 'processing') return;
    
    const analyze = () => {
        const issues = [];
        volunteers.forEach(v => {
            // İsim Uzunluğu
            if (v.name.length > 22) {
              issues.push({ id: v.id, type: 'danger', msg: `"${v.name}" ismi bir hayli uzun, kartın sınırlarını zorluyor.` });
            }
            
            // Taşma Tahmini (Size + Offset Kontrolü)
            const nameTotalPush = Math.abs(v.nameY) + (v.nameSize * 0.7);
            const surnameTotalPush = Math.abs(v.surnameY) + (v.surnameSize * 0.7);
            
            if (nameTotalPush > 90 || surnameTotalPush > 90) {
              issues.push({ id: v.id, type: 'critical', msg: `Hoppala! ${v.name.split(' ')[0]} ismi şu an kağıttan dışarı fırlamış durumda.` });
            }

            // Aşırı Büyük/Küçük
            if (v.nameSize > 115) issues.push({ id: v.id, type: 'warning', msg: `${v.name} için seçtiğin yazı boyutu çok devasa, dengeli durmuyor.` });
            if (v.nameSize < 18) issues.push({ id: v.id, type: 'warning', msg: `${v.name} ismini okumak için mercek lazım, çok ufak kalmış.` });
            
            // Dikey Konum Çakışması
            if (Math.abs(v.nameY - v.surnameY) < 15 && v.nameY !== 0) {
              issues.push({ id: v.id, type: 'danger', msg: `${v.name} ismiyle soyismini neredeyse birbirinin içine sokmuşsun.` });
            }
        });
        setWarnings(issues);
    };

    analyze();
  }, [volunteers, aiState]);

  const handleAutoFix = (forceMock = false) => {
    setAiState('processing');
    setTimeout(() => {
      const isDefaultList = volunteers.length <= 3 && volunteers[0]?.name === "Örnek İsim";
      const isEmpty = volunteers.length === 0;
      
      let sourceData = [];

      if (forceMock || isDefaultList || isEmpty) {
          sourceData = MOCK_VOLUNTEERS_GENERAL.map((name, i) => ({
             id: Date.now() + i,
             name: name,
             nameSize: 60, 
             nameY: 0,
             surnameSize: 12,
             surnameY: 0,
             question: ""
          }));
      } else {
          sourceData = [...volunteers];
      }

      const formattedData = sourceData.map(v => ({
          ...v,
          name: v.name.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          nameSize: 60,
          surnameSize: 12,
          nameY: 0,
          surnameY: 0
      }));

      setVolunteers(formattedData);
      setAiState('idle');
      setActiveAction(null);
      onNotify("İsimlikler düzenlendi!");
    }, 1000);
  };

  const addVolunteer = (name = "Yeni Gönüllü") => {
    const newVol = { id: Date.now(), name, nameSize: 60, nameY: 0, surnameSize: 12, surnameY: 0, question: "" };
    setVolunteers([...volunteers, newVol]);
    setShowVolunteersList(false);
  };

  const removeVolunteer = (id) => {
    setVolunteers(volunteers.filter(v => v.id !== id));
  };

  const updateVolunteer = (id, field, value) => {
    setVolunteers(volunteers.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleInteractiveUpdate = useCallback((id, type, newSize, newOffset) => {
      setVolunteers(prev => prev.map(v => {
          if (v.id === id) {
              const sizeField = type === 'name' ? 'nameSize' : 'surnameSize';
              const offsetField = type === 'name' ? 'nameY' : 'surnameY';
              return { ...v, [sizeField]: newSize, [offsetField]: newOffset };
          }
          return v;
      }));
      
      // Balkız'ı tetikle
      setActiveAction({ type: 'move', val: newOffset });
      const timer = setTimeout(() => setActiveAction(null), 100);
      return () => clearTimeout(timer);
  }, []);

  const formatNameDisplay = (fullName) => {
      const parts = fullName.trim().split(' ');
      if (parts.length === 1) return { first: parts[0], last: '' };
      const last = parts.pop();
      const first = parts.join(' ');
      return { first, last };
  };

  const getPages = () => {
      const pages = [];
      for (let i = 0; i < volunteers.length; i += ROWS_PER_PAGE) {
          const chunk = volunteers.slice(i, i + ROWS_PER_PAGE);
          pages.push({ type: 'names', items: chunk, pageIndex: pages.length });
          pages.push({ type: 'questions', items: chunk, pageIndex: pages.length + 1 });
      }
      return pages;
  };

  return (
    <div className="space-y-6">
      {/* --- BALKIZ & CONTROLS --- */}
      <div className="no-print">
         <BalkizRainbowConsole 
            aiState={aiState}
            activeAction={activeAction}
            warnings={warnings}
            onAutoFix={() => handleAutoFix(false)}
         />
         
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-tighter"><Settings2 size={12}/> Kenar Boşluğu</div>
               <input type="range" min="0" max="30" value={pagePadding} onChange={(e) => setPagePadding(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-indigo-600"/>
            </div>

            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-tighter"><MoveVertical size={12}/> Dikdörtgenleştir</div>
               <input type="range" min="0" max="30" value={verticalCompression} onChange={(e) => setVerticalCompression(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-orange-500"/>
            </div>

            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-tighter"><Maximize size={12}/> Genel Ölçek</div>
               <input type="range" min="70" max="100" value={globalScale} onChange={(e) => setGlobalScale(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer accent-indigo-600"/>
            </div>

            <div className="relative flex items-end">
                <button onClick={() => setShowVolunteersList(!showVolunteersList)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-bold transition-all border border-slate-200">
                  <Users size={16}/> Gönüllü Havuzu
                </button>
                {showVolunteersList && (
                  <div className="absolute top-full right-0 mt-3 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 h-72 overflow-y-auto animate-in fade-in zoom-in-95">
                    <button onClick={() => { handleAutoFix(true); setShowVolunteersList(false); }} className="w-full text-left px-3 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs mb-2 flex items-center gap-2"><Database size={14}/> Havuzun Tamamını Al</button>
                    <button onClick={() => addVolunteer("Yeni Gönüllü")} className="w-full text-left px-3 py-3 hover:bg-green-50 text-green-700 font-bold rounded-xl text-xs mb-2 border-b border-slate-50">+ Boş Kart Ekle</button>
                    {MOCK_VOLUNTEERS_GENERAL.map((v, i) => (
                      <button key={i} onClick={() => addVolunteer(v)} className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 rounded-lg text-xs block transition-colors">{v}</button>
                    ))}
                  </div>
                )}
             </div>
         </div>
      </div>

      {/* --- PAGE RENDERER --- */}
      <div className="flex flex-col items-center gap-12 pb-20 print-container">
        {getPages().map((page, pIndex) => (
          <div key={pIndex} className="relative">
             <div className="a4-page bg-white shadow-2xl mx-auto overflow-hidden" style={{ width: '210mm', height: '297mm', padding: `${pagePadding}mm` }}>
                <div 
                  className="grid grid-cols-2 content-start w-full h-full bg-white"
                  style={{
                      transform: `scale(${globalScale / 100})`,
                      transformOrigin: 'top center',
                      height: `${100 - verticalCompression}%`,
                      gridTemplateRows: `repeat(${ROWS_PER_PAGE}, 1fr)`,
                      gap: `${cardGap}mm`
                  }}
                >
                    {page.items.map((vol) => {
                       const activeNameSize = vol.nameSize || 60;
                       const activeSurnameSize = vol.surnameSize || 12;
                       const activeNameY = vol.nameY || 0;
                       const activeSurnameY = vol.surnameY || 0;
                       const nameData = formatNameDisplay(vol.name);
                       
                       return (
                         <React.Fragment key={vol.id}>
                            {[0, 1].map((colIndex) => (
                               <div key={`${vol.id}-${colIndex}`} className="relative group w-full h-full overflow-visible border border-dashed border-slate-100 hover:border-indigo-400 transition-all bg-white">
                                  <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                                     <img src={page.type === 'names' ? IMAGES.NAME_BG : IMAGES.QUESTION_BG} className="w-full h-full object-fill" alt="bg" />
                                  </div>

                                  <div className="absolute top-2 right-2 z-50 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => removeVolunteer(vol.id)} className="bg-white/90 p-2 rounded-lg text-slate-400 hover:text-red-500 shadow-sm" title="Kişiyi Sil"><Trash2 size={14}/></button>
                                  </div>

                                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
                                     {page.type === 'names' ? (
                                        <div className="relative text-center w-full">
                                            <div className="flex flex-col items-center justify-center leading-none">
                                                <InteractiveText 
                                                    text={nameData.first} size={activeNameSize} offsetY={activeNameY}
                                                    onUpdate={(s, o) => handleInteractiveUpdate(vol.id, 'name', s, o)}
                                                    className="font-comic font-bold text-slate-800 whitespace-nowrap drop-shadow-sm"
                                                />
                                                <InteractiveText 
                                                    text={nameData.last} size={activeSurnameSize} offsetY={activeSurnameY}
                                                    onUpdate={(s, o) => handleInteractiveUpdate(vol.id, 'surname', s, o)}
                                                    className="font-comic font-black text-slate-900 uppercase whitespace-nowrap mt-1 drop-shadow-sm"
                                                />
                                            </div>
                                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                                <button onClick={() => { const n = prompt("Düzenle:", vol.name); if(n) updateVolunteer(vol.id, 'name', n); }} className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg text-xs font-bold shadow-sm">✐</button>
                                            </div>
                                        </div>
                                     ) : (
                                        <textarea 
                                            value={vol.question} onChange={(e) => updateVolunteer(vol.id, 'question', e.target.value)}
                                            className="w-[85%] h-[60%] bg-transparent outline-none text-center font-comic resize-none flex items-center justify-center pt-8 text-slate-700"
                                            style={{ fontSize: `${(activeNameSize) * 0.4}px` }}
                                        />
                                     )}
                                  </div>
                               </div>
                            ))}
                         </React.Fragment>
                       );
                    })}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MODÜL 3: KOLAJ UYGULAMASI ---
function CollageApp({ onNotify }) {
  const [projectTitle, setProjectTitle] = useState("GAZİ ÜNİVERSİTESİ PROJE KOLAJI");
  const [projectAddress, setProjectAddress] = useState("Adres: Gazi Üniversitesi Teknoloji Fakültesi, Ankara");
  
  const [volunteers, setVolunteers] = useState(db.load(DB_KEYS.COLLAGE_VOLUNTEERS, []));
  
  const [globalNameSize, setGlobalNameSize] = useState(16);
  const [pagePadding, setPagePadding] = useState(12);
  const [aiState, setAiState] = useState('idle');
  const [activeAction, setActiveAction] = useState(null);
  const [showPool, setShowPool] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    db.save(DB_KEYS.COLLAGE_VOLUNTEERS, volunteers);
    // Gönüllü verisi değiştiğinde senkronizasyon yap
    syncVolunteers();
    
    // Analiz
    const issues = [];
    const missingPhotos = volunteers.filter(v => !v.photo);
    if (missingPhotos.length > 0) issues.push({ type: 'stock', msg: `${missingPhotos.length} fotoğraf henüz yüklenmemiş.` });
    
    // Protokol Kontrolü: Hüseyin Vural başta mı?
    const huseyinIndex = volunteers.findIndex(v => v.name.toLowerCase().includes("vural"));
    if (huseyinIndex !== 0 && volunteers.length > 0) {
        issues.push({ type: 'protocol', msg: "Hüseyin Hoca en başta mı? Kontrol edebilirsin" });
    }
    
    setWarnings(issues);
  }, [volunteers]);

  const handleAutoFix = useCallback((forceFull = false) => {
    setAiState('processing');
    setTimeout(() => {
        let baseList = (forceFull || volunteers.length === 0) ? MOCK_VOLUNTEERS_GENERAL.map((name, i) => ({
            id: Date.now() + i,
            name: name,
            photo: null,
            scale: 1,
            translateX: 0,
            translateY: 0
        })) : [...volunteers];

        const sorted = baseList.sort((a, b) => {
            const isAVural = a.name.toLowerCase().includes("vural");
            const isBVural = b.name.toLowerCase().includes("vural");
            if (isAVural) return -1;
            if (isBVural) return 1;
            return a.name.localeCompare(b.name, 'tr');
        });

        setVolunteers(sorted);
        setAiState('idle');
        onNotify("Kolaj düzenlendi!");
    }, 1000);
  }, [volunteers, onNotify]);

  useEffect(() => {
    if (volunteers.length === 0) handleAutoFix(true);
  }, []);

  const handlePhotoUpdate = (id, scale, translateX, translateY) => {
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, scale, translateX, translateY } : v));
    setActiveAction(true);
    const timer = setTimeout(() => setActiveAction(null), 2000);
    return () => clearTimeout(timer);
  };

  const moveVolunteer = (index, direction) => {
    const newVolunteers = [...volunteers];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newVolunteers.length) {
      const temp = newVolunteers[index];
      newVolunteers[index] = newVolunteers[targetIndex];
      newVolunteers[targetIndex] = temp;
      setVolunteers(newVolunteers);
      setActiveAction(true);
      const timer = setTimeout(() => setActiveAction(null), 1000);
      return () => clearTimeout(timer);
    }
  };

  const updatePhotoSrc = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, photo: e.target.result, scale: 1, translateX: 0, translateY: 0 } : v));
      };
      reader.readAsDataURL(file);
    }
  };

  const count = volunteers.length;
  let cols = 3;
  if (count <= 4) cols = 2;
  else if (count <= 9) cols = 3;
  else if (count <= 16) cols = 4;
  else cols = 5;
  const rows = Math.ceil(count / cols);

  return (
    <div className="space-y-6">
      {/* --- BALKIZ & KONTROLLER --- */}
      <div className="no-print">
         <BalkizRainbowConsole 
            aiState={aiState} 
            activeAction={activeAction} 
            warnings={warnings}
            onAutoFix={() => handleAutoFix(false)}
         />

         <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end">
            <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Type size={10}/> İsim Boyutu</label>
                <input type="range" min="10" max="35" value={globalNameSize} onChange={(e) => setGlobalNameSize(parseInt(e.target.value))} className="w-full accent-indigo-600 cursor-pointer"/>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Maximize2 size={10}/> Kenar Payı</label>
                <input type="range" min="0" max="30" value={pagePadding} onChange={(e) => setPagePadding(parseInt(e.target.value))} className="w-full accent-pink-600 cursor-pointer"/>
            </div>
            <div className="relative">
                <button onClick={() => setShowPool(!showPool)} className="w-full bg-slate-50 border border-slate-200 py-3 rounded-2xl font-black text-[10px] hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors uppercase tracking-tight text-slate-500">
                  <Users size={14}/> Gönüllü Yönetimi
                </button>
                {showPool && (
                  <div className="absolute bottom-full right-0 mb-3 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 h-80 overflow-y-auto animate-in fade-in zoom-in-95">
                    <button onClick={() => { handleAutoFix(true); setShowPool(false); }} className="w-full text-left px-3 py-3 bg-indigo-600 text-white font-black rounded-xl text-[10px] mb-2 flex items-center gap-2 shadow-lg shadow-indigo-100 uppercase tracking-tighter"><Database size={12}/> Tüm Listeyi Çek</button>
                    {MOCK_VOLUNTEERS_GENERAL.map((name, i) => (
                      <button key={i} onClick={() => { setVolunteers([...volunteers, {id: Date.now(), name, photo:null, scale:1, translateX:0, translateY:0}]); setShowPool(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] block transition-colors border-b border-slate-50">{name}</button>
                    ))}
                  </div>
                )}
            </div>
         </div>
      </div>

      {/* --- TEK A4 SAYFASI --- */}
      <div className="flex justify-center pb-20 print-container">
          <div 
            className="a4-page bg-white shadow-2xl overflow-hidden flex flex-col" 
            style={{ 
                width: '210mm', 
                height: '297mm', 
                padding: `${pagePadding}mm`
            }}
          >
             {/* ÜST BAŞLIK */}
             <div className="w-full mb-3 px-4 shrink-0">
                <input 
                    value={projectTitle} 
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full text-center bg-transparent border-none outline-none font-comic font-black text-slate-900 tracking-tight"
                    style={{ fontSize: volunteers.length > 12 ? '22px' : '28px' }}
                />
             </div>
             
             {/* IZGARA ALANI */}
             <div 
                className="grid w-full gap-3 flex-1 min-h-0"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                }}
             >
                {volunteers.map((vol, index) => (
                   <div key={vol.id} className="relative flex flex-col items-center justify-center p-2 border border-slate-100 rounded-2xl bg-slate-50/20 group hover:border-indigo-400 transition-all overflow-hidden">
                      {/* Araçlar (No-Print) */}
                      <div className="absolute top-1 right-1 flex flex-col gap-1 no-print opacity-0 group-hover:opacity-100 transition-all z-40">
                        <button onClick={() => setVolunteers(volunteers.filter(v => v.id !== vol.id))} className="p-1 bg-white text-red-500 rounded-full shadow-sm border border-red-50 hover:scale-110">
                           <Trash2 size={10}/>
                        </button>
                        <button onClick={() => moveVolunteer(index, -1)} disabled={index === 0} className="p-1 bg-white text-indigo-600 rounded-full shadow-sm border border-indigo-50 hover:scale-110 disabled:opacity-30">
                           <ChevronUp size={10}/>
                        </button>
                        <button onClick={() => moveVolunteer(index, 1)} disabled={index === volunteers.length - 1} className="p-1 bg-white text-indigo-600 rounded-full shadow-sm border border-indigo-50 hover:scale-110 disabled:opacity-30">
                           <ChevronDown size={10}/>
                        </button>
                      </div>

                      <div className="relative w-full aspect-square mb-2 shrink-0 overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm">
                          <InteractivePhoto 
                              id={vol.id} src={vol.photo} scale={vol.scale}
                              translateX={vol.translateX} translateY={vol.translateY}
                              onUpdate={handlePhotoUpdate}
                          />
                          {!vol.photo && (
                              <input 
                                  type="file" accept="image/*" 
                                  onChange={(e) => updatePhotoSrc(vol.id, e)}
                                  className="absolute inset-0 opacity-0 cursor-pointer z-30"
                              />
                          )}
                          {vol.photo && (
                              <label className="absolute top-1 left-1 no-print opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/90 rounded-full text-indigo-600 cursor-pointer z-40 shadow-sm border border-slate-100">
                                  <Upload size={12}/>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => updatePhotoSrc(vol.id, e)} />
                              </label>
                          )}
                      </div>

                      <div className="w-full px-1 text-center leading-[1.1] h-fit shrink-0">
                          <textarea 
                              value={vol.name} 
                              onChange={(e) => setVolunteers(volunteers.map(v => v.id === vol.id ? {...v, name: e.target.value} : v))}
                              className="w-full text-center bg-transparent border-none outline-none font-comic font-bold text-slate-800 tracking-tight resize-none overflow-hidden"
                              style={{ 
                                fontSize: `${globalNameSize}px`,
                                height: '2.5em',
                              }}
                              rows={2}
                          />
                      </div>
                   </div>
                ))}
             </div>

             {/* ALT MESAJ VE ADRES ALANI */}
             <div className="w-full mt-auto pt-4 px-4 shrink-0 flex flex-col items-center gap-3">
                <div className="flex items-center gap-4 text-indigo-600 font-black tracking-[0.25em] text-[18px] group/msg">
                    <span className="w-12 h-[2px] bg-indigo-100 group-hover/msg:w-20 transition-all duration-700"></span>
                    <Smile size={28} className="text-indigo-400 animate-bounce" />
                    <span className="uppercase drop-shadow-sm">MEKTUPLARINI BEKLİYORUZ</span>
                    <span className="w-12 h-[2px] bg-indigo-100 group-hover/msg:w-20 transition-all duration-700"></span>
                </div>

                <div className="w-full border-t border-slate-100 pt-2 pb-2">
                    <textarea 
                        value={projectAddress} 
                        onChange={(e) => setProjectAddress(e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-sans text-slate-400 text-center font-bold resize-none leading-tight overflow-hidden"
                        style={{ fontSize: volunteers.length > 12 ? '10px' : '11px' }}
                        rows={1}
                    />
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}

// --- MODÜL 4: BELGE OLUŞTURUCU ---
function DocumentCreator({ onNotify }) {
  const [formData, setFormData] = useState({ no: '2026/01', date: '', topic: 'Planlama', location: 'Salon A', participants: 'Müdür, Yürütücü', decisions: '1. Karar 1\n2. Karar 2' });
  
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl border print:hidden text-sm space-y-3">
        <h3 className="font-bold mb-2">Belge Bilgileri</h3>
        <input className="w-full border p-2" placeholder="No" value={formData.no} onChange={e=>setFormData({...formData, no:e.target.value})}/>
        <textarea className="w-full border p-2 h-40" placeholder="Kaba Notlar (AI düzeltecek...)" value={formData.decisions} onChange={e=>setFormData({...formData, decisions:e.target.value})}/>
      </div>
      <div className="flex-1 bg-white shadow-xl p-12 print:shadow-none print:p-0 min-h-[297mm]">
        <h1 className="text-center font-bold text-xl border-b-2 border-black pb-4 mb-8">TOPLANTI TUTANAĞI</h1>
        <table className="w-full border border-black mb-8 text-sm">
          <tbody>
            <tr>
              <td className="border p-2 font-bold bg-slate-100">Karar No</td>
              <td className="border p-2">{formData.no}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold bg-slate-100">Kararlar</td>
              <td className="border p-2 whitespace-pre-wrap h-64 align-top">{formData.decisions}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-between mt-32 px-12">
          <div className="text-center font-bold">Raportör<div className="mt-8 border-t border-black w-32"></div></div>
          <div className="text-center font-bold">Onaylayan<div className="mt-8 border-t border-black w-32"></div></div>
        </div>
      </div>
    </div>
  );
}
