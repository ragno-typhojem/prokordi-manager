/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calendar, Trash2, Plus, X, CheckCircle2, BookOpen, GraduationCap, 
  Download, UploadCloud, Wand2, Minus, Settings2, Users, Package, Sparkles
} from 'lucide-react';

export default function Scheduler({ db, DB_KEYS, syncVolunteers, BalkizConsole, NavBtn, onNotify }) {
  const [activeView, setActiveView] = useState('view');

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
  const dragItem = useRef();
  const fileInputRef = useRef(null);

  useEffect(() => { db.save(DB_KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { 
    db.save(DB_KEYS.VOLUNTEERS, volunteers); 
    syncVolunteers(volunteers);
  }, [volunteers, syncVolunteers, db, DB_KEYS]); 
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

  const exportToExcelCSV = () => {
    if(classes.length === 0 || timeSlots.length === 0) {
      onNotify("Dışa aktarılacak program bulunamadı!");
      return;
    }
    let csvContent = '\uFEFF'; 
    csvContent += 'SAAT / SINIF,' + classes.map(c => c.name).join(',') + '\n';

    timeSlots.forEach(slot => {
      let row = `${slot.start} - ${slot.end}`;
      if (slot.type !== 'lesson') {
         const label = slot.type === 'break' ? 'TENEFFÜS' : (slot.type === 'lunch' ? 'ÖĞLE ARASI' : 'MOLA');
         row += ',' + classes.map(() => label).join(',');
      } else {
         row += ',' + classes.map(c => {
           const cell = c.schedule[slot.id];
           if (!cell) return 'BOŞ';
           if (cell.activityId === 'NO_CLASS') return 'DERS YOK';
           return `"${cell.name} (${cell.lead})"`;
         }).join(',');
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
    onNotify("Excel (CSV) dosyası indirildi!");
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
    onNotify("Sistem Yedeği (JSON) indirildi!");
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.classes && importedData.timeSlots) {
          if (window.confirm("Dikkat! Mevcut sistemdeki tüm planlama silinecek ve dosyadaki yedek yüklenecek. Onaylıyor musunuz?")) {
            setClasses(importedData.classes || []);
            setTimeSlots(importedData.timeSlots || []);
            if (importedData.activities) setActivities(importedData.activities);
            if (importedData.volunteers) {
               setVolunteers(importedData.volunteers);
               syncVolunteers(importedData.volunteers); 
            }
            setHasDistributed(false);
            onNotify("Yedek başarıyla yüklendi!");
          }
        } else {
          onNotify("Geçersiz yedek dosyası (Format uyuşmazlığı)!");
        }
      } catch (err) {
        onNotify("Dosya okunurken bir hata oluştu!");
        console.error(err);
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const markAsNoClass = () => {
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
    setClasses(classes.map(c => {
      const newSched = { ...c.schedule };
      newSched[editingSlot.slotId] = { activityId: 'NO_CLASS', name: 'DERS YOK', cat: 'none', isMust: false, lead: '-', leadId: 'none', isLocked: true };
      return { ...c, schedule: newSched };
    }));
    setEditingSlot(null);
    onNotify("Bu saat tüm sınıflar için kapatıldı.");
  };

  const clearClassSchedule = (clsId, clsName) => {
    if(window.confirm(`${clsName} sınıfının tüm planlamasını silmek istediğinize emin misiniz?`)) {
      setClasses(classes.map(c => c.id === clsId ? { ...c, schedule: {} } : c));
      onNotify(`${clsName} planı temizlendi.`);
    }
  };

  const clearAllSchedules = () => {
    if(window.confirm("TÜM SINIFLARIN planlamasını tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
      setClasses(classes.map(c => ({ ...c, schedule: {} })));
      onNotify("Tüm planlama sıfırlandı.");
      setHasDistributed(false);
    }
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
                if (!activity.allowedGrades.includes(grade)) {
                    newWarnings.push({ type: 'protocol', msg: `Seviye Hatası: ${cls.name} sınıfına "${activity.name}" uygun değil.` });
                }
            } else {
                const actName = normalize(activity.name);
                if (grade > 0 && grade <= 4 && LOGIC_CONFIG.primaryBlacklist.some(bad => actName.includes(bad))) {
                     newWarnings.push({ type: 'protocol', msg: `Pedagoji: ${cls.name} için "${slot.name}" ağır gelebilir.` });
                }
            }
        }
        
        if (slot.activityId) actCounts[slot.activityId] = (actCounts[slot.activityId] || 0) + 1;
        if (slot.leadId && slot.leadId !== 'none') volCounts[slot.leadId] = (volCounts[slot.leadId] || 0) + 1;
      });

      Object.entries(actCounts).forEach(([id, n]) => {
        if (n > 1) newWarnings.push({ type: 'duplicate_act', msg: `${cls.name}: "${activities.find(a=>a.id===id)?.name}" ${n} kere tekrar!` });
      });
      Object.entries(volCounts).forEach(([id, n]) => {
        const v = volunteers.find(v=>v.id===id);
        if (n > 1) newWarnings.push({ type: 'duplicate_vol', msg: `${cls.name}: ${v?.name} bu sınıfa ${n} kere giriyor.` });
      });

      lessonSlots.forEach(slot => {
        if (!cls.schedule[slot.id]) newWarnings.push({ type: 'empty', msg: `${cls.name} ${slot.start} boş!` });
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
            if (vol && !vol.capabilities.includes(cell.activityId)) {
              newWarnings.push({ type: 'competency', msg: `${vol.name}, "${cell.name}" yetkinliğine sahip değil!` });
            }
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
        if (act && actUsage[aId] > (act.boxCount || 99)) {
           newWarnings.push({ type: 'stock', msg: `${act.name} stoku yetersiz! (${actUsage[aId]} adet atanmış)` });
        }
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

  const getSuitabilityScore = (activityName, className) => {
    const grade = detectGrade(className);
    const nAct = normalize(activityName);
    let score = 50; 
    if (grade <= 4) {
      if (LOGIC_CONFIG.primaryWhitelist.some(good => nAct.includes(good))) score += 40;
      if (nAct.includes('bilim') || nAct.includes('deney')) score -= 10;
    }
    if (grade >= 5) {
      if (LOGIC_CONFIG.middleSchoolPreferred.some(good => nAct.includes(good))) score += 30;
      if (nAct.includes('oyun') || nAct.includes('drama')) score -= 10;
    }
    score += Math.floor(Math.random() * 20) - 10;
    return score;
  };

  const distributePerfectly = () => {
    setAiState('processing');
    setIsConsoleOpen(true);
    setHasDistributed(true);

    setTimeout(() => {
      let newClasses = JSON.parse(JSON.stringify(classes));
      newClasses.forEach(c => {
        Object.keys(c.schedule).forEach(slotId => {
           if(!c.schedule[slotId].isLocked) delete c.schedule[slotId];
        });
      });
      
      let volLoad = {};
      volunteers.forEach(v => volLoad[v.id] = 0);

      const isStockAvailable = (actId, slotId, currentClasses) => {
        const act = activities.find(a => a.id === actId);
        let usage = 0;
        currentClasses.forEach(c => { if (c.schedule[slotId]?.activityId === actId) usage++; });
        return usage < (act.boxCount || 99);
      };

      const findBestLead = (actId, slotId, currentClassId, currentClasses) => {
        if (!isStockAvailable(actId, slotId, currentClasses)) return null;
        const capable = volunteers.filter(v => v.capabilities.includes(actId));
        const available = capable.filter(v => {
          let busy = false;
          currentClasses.forEach(c => {
            if (c.id !== currentClassId && c.schedule[slotId]?.leadId === v.id) busy = true;
          });
          return !busy;
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
              volLoad[lead.id]++;
              freeSlots.splice(i, 1);
              break;
            }
          }
        });
      });

      newClasses.forEach(cls => {
        lessonSlots.forEach(slot => {
          if (!cls.schedule[slot.id]) {
            const takenIds = Object.values(cls.schedule).map(s => s.activityId);
            let candidates = activities.filter(a => !a.isMust && !takenIds.includes(a.id)).filter(a => checkConstraints(a, cls.name));
            candidates.sort((a, b) => getSuitabilityScore(b.name, cls.name) - getSuitabilityScore(a.name, cls.name));
            for (let act of candidates) {
              const lead = findBestLead(act.id, slot.id, cls.id, newClasses);
              if (lead) {
                cls.schedule[slot.id] = { activityId: act.id, name: act.name, cat: act.cat, isMust: false, lead: lead.name, leadId: lead.id, support: [] };
                volLoad[lead.id]++;
                break;
              }
            }
          }
        });
      });

      setClasses(newClasses);
      setAiState('idle');
      onNotify('B.A.L.K.I.Z. atamaları tamamladı!');
    }, 1500);
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
    
    if(tClass.schedule[targetSlotId]?.isLocked || sClass.schedule[src.slotId]?.isLocked) {
        onNotify("Kilitli (Ders Yok) alanlar taşınamaz!");
        return;
    }

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
      onNotify(`"${actName}" eklendi.`);
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

  return (
    <div className="space-y-6 relative">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print flex flex-wrap gap-2 items-center relative z-50">
        <NavBtn active={activeView==='view'} onClick={()=>setActiveView('view')} icon={<Calendar size={18}/>} label="Program" />
        <NavBtn active={activeView==='setup'} onClick={()=>setActiveView('setup')} icon={<BookOpen size={18}/>} label="Kurulum & Zaman" />
        <NavBtn active={activeView==='volunteers'} onClick={()=>setActiveView('volunteers')} icon={<GraduationCap size={18}/>} label="Gönüllü & Yetenek" />
        
        <div className="flex-1"></div>
        
        {activeView === 'view' && (
          <div className="flex gap-2 border-l pl-4 border-slate-200">
             <button onClick={exportToExcelCSV} className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors" title="Excel'de açmak için CSV olarak indir">
                <Download size={14}/> Excel (CSV)
             </button>
             <button onClick={exportBackupJSON} className="bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors" title="Sistemi tam yedekle">
                <Download size={14}/> Yedek Al
             </button>
             <label className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors" title="Alınan yedeği geri yükle">
                <UploadCloud size={14}/> Yedek Yükle
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportBackup} />
             </label>
          </div>
        )}
      </div>

      {activeView === 'view' && (
        <>
          <BalkizConsole warnings={warnings} aiState={aiState} isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} hasDistributed={hasDistributed} />
          
          <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
            <button onClick={distributePerfectly} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-2.5 rounded-xl font-bold flex gap-2 items-center shadow-lg transform active:scale-95 transition-all">
              <Wand2 size={18} /> B.A.L.K.I.Z. Dağıtsın
            </button>
            <button onClick={clearAllSchedules} className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ml-auto">
              <Trash2 size={18} /> Tüm Planı Temizle
            </button>
          </div>

          <div className="bg-white p-8 shadow-sm rounded-xl border border-slate-200 print:shadow-none print:p-4 print:rounded-none w-full max-w-[297mm] mx-auto overflow-x-auto">
            <table className="w-full border-collapse border-2 border-slate-900 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-2 border-slate-900 p-3 w-24 font-black">Saat</th>
                  {classes.map(c => (
                    <th key={c.id} className="border-2 border-slate-900 p-3 font-bold text-lg relative group">
                      {c.name}
                      <button onClick={() => clearClassSchedule(c.id, c.name)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-lg transition-all print:hidden" title="Sınıf Planını Temizle">
                        <Trash2 size={16}/>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.id} className={slot.type !== 'lesson' ? 'bg-slate-50' : ''}>
                    <td className="border-2 border-slate-900 p-2 font-bold text-center align-middle">
                      {slot.start}<br/>-<br/>{slot.end}
                    </td>
                    {slot.type !== 'lesson' ? (
                      <td colSpan={classes.length} className="border-2 border-slate-900 p-3 text-center font-black tracking-widest opacity-60 text-base">
                        {slot.type === 'break' ? '🔔 TENEFFÜS' : slot.type === 'lunch' ? '🍽️ ÖĞLE ARASI' : 'DİĞER'}
                      </td>
                    ) : (
                      classes.map(cls => {
                        const cell = cls.schedule[slot.id];
                        const isNoClass = cell?.activityId === 'NO_CLASS';
                        return (
                          <td key={cls.id} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, cls.id, slot.id)} className="border-2 border-slate-900 p-1.5 h-24 align-top print:h-auto">
                            {cell ? (
                              <div draggable={!isNoClass} onDragStart={e=>handleDragStart(e, cls.id, slot.id, cell)} onClick={()=>handleSlotClick(cls.id, slot.id, cell)} className={`h-full p-2 rounded cursor-pointer flex flex-col justify-center border-2 print:border-none ${isNoClass ? 'bg-slate-200 border-dashed border-slate-400 opacity-70 text-center items-center' : cell.isMust ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                                <div className={`text-xs font-bold ${isNoClass ? 'text-slate-500 uppercase tracking-widest' : ''}`}>
                                  {cell.name} {cell.isMust && <span className="text-red-600">⚠</span>}
                                </div>
                                {!isNoClass && (
                                  <div className="mt-auto text-[11px] font-semibold text-slate-700 pt-1">
                                    👤 {cell.lead}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div onClick={()=>handleSlotClick(cls.id, slot.id, null)} className="h-full flex items-center justify-center text-slate-200 hover:bg-slate-50 hover:text-indigo-400 cursor-pointer print:hidden transition-colors rounded border-2 border-transparent hover:border-indigo-200">
                                <Plus size={24}/>
                              </div>
                            )}
                          </td>
                        )
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeView === 'volunteers' && (
        <VolunteerManager 
           volunteers={volunteers} setVolunteers={setVolunteers} 
           activities={activities} syncVolunteers={syncVolunteers} onNotify={onNotify} 
        />
      )}

      {activeView === 'setup' && (
        <SetupModule 
           activities={activities} setActivities={setActivities} 
           timeSlots={timeSlots} setTimeSlots={setTimeSlots} 
           classes={classes} setClasses={setClasses} onNotify={onNotify} 
        />
      )}

      {editingSlot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
              <div><h3 className="font-black text-lg">Ders Yönetimi</h3></div>
              <button onClick={() => setEditingSlot(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Etkinlik Seç / Yaz</label>
                <input className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold focus:border-indigo-500 outline-none" placeholder="Ara veya yeni yaz..." value={editingSlot.data.name || ''} onChange={e => {
                  const match = activities.find(a => a.name.toLocaleLowerCase('tr') === e.target.value.toLocaleLowerCase('tr'));
                  setEditingSlot({ ...editingSlot, data: { ...editingSlot.data, name: e.target.value, activityId: match?.id || '' } });
                }} />
                {editingSlot.data.name && !activities.find(a=>a.name===editingSlot.data.name) && editingSlot.data.activityId !== 'NO_CLASS' && <div className="text-xs text-indigo-600 mt-1 font-bold">+ Yeni Olarak Eklenecek</div>}
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Gönüllü Lider</label>
                <select className="w-full border-2 border-slate-200 p-3 rounded-xl font-bold focus:border-indigo-500 outline-none bg-white" value={editingSlot.data.leadId || ''} onChange={e => { const v = volunteers.find(x => x.id === e.target.value); setEditingSlot({ ...editingSlot, data: { ...editingSlot.data, leadId: v?.id||'none', lead: v?.name||'-' } }) }}>
                  <option value="none">Seçiniz (Boş)</option>
                  {volunteers.map(v => <option key={v.id} value={v.id}>{v.name} {!v.capabilities.includes(editingSlot.data.activityId) && '(Yetkinlik Eksik)'}</option>)}
                </select>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mt-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Settings2 size={14}/> Hızlı Planlama Araçları</h4>
                <button onClick={markAsNoClass} className="w-full py-2.5 bg-white border-2 border-slate-300 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm flex justify-center gap-2"><Minus size={16}/> Sadece Bu Sınıfa Dersi Kapat</button>
                <button onClick={markAllAsNoClass} className="w-full py-2.5 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm flex justify-center gap-2"><X size={16}/> Tüm Sınıflara Bu Saati Kapat</button>
              </div>
            </div>
            
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex gap-3">
              {editingSlot.data.activityId && (
                <button onClick={() => { setEditingSlot({ ...editingSlot, data: { activityId: 'delete' } }); setTimeout(saveSlotEdit, 50); }} className="flex-1 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 py-3 rounded-xl font-bold flex justify-center gap-2"><Trash2 size={18}/> Temizle</button>
              )}
              <button onClick={saveSlotEdit} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex justify-center gap-2"><CheckCircle2 size={18}/> Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- EKSİK OLAN GÖNÜLLÜ YÖNETİMİ ---
function VolunteerManager({ volunteers, setVolunteers, activities, syncVolunteers, onNotify }) {
    const [newVolName, setNewVolName] = useState('');

    const addVolunteer = () => {
        if (!newVolName.trim()) return;
        const newVol = { id: Math.random().toString(36).substr(2, 9), name: newVolName, capabilities: [] };
        const updated = [...volunteers, newVol];
        setVolunteers(updated);
        syncVolunteers(updated);
        setNewVolName('');
        onNotify("Gönüllü eklendi.");
    };

    const toggleCapability = (volId, actId) => {
        const updated = volunteers.map(v => {
            if (v.id !== volId) return v;
            const caps = v.capabilities.includes(actId) ? v.capabilities.filter(id => id !== actId) : [...v.capabilities, actId];
            return { ...v, capabilities: caps };
        });
        setVolunteers(updated);
        syncVolunteers(updated);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow border border-slate-200 animate-fadeIn">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={20}/> Gönüllü Yönetimi</h3>
            <div className="flex gap-2 mb-6">
                <input value={newVolName} onChange={e => setNewVolName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addVolunteer()} placeholder="Yeni Gönüllü Adı Soyadı" className="border-2 border-slate-200 p-2 rounded-xl text-sm flex-1 outline-none focus:border-indigo-500 font-bold" />
                <button onClick={addVolunteer} className="bg-indigo-600 text-white px-5 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"><Plus size={18}/> Ekle</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {volunteers.map(vol => (
                    <div key={vol.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-3">
                            <input value={vol.name} onChange={(e) => { const updated = volunteers.map(v => v.id === vol.id ? {...v, name: e.target.value} : v); setVolunteers(updated); syncVolunteers(updated); }} className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 w-full focus:outline-none" />
                            <button onClick={() => { const updated = volunteers.filter(v => v.id !== vol.id); setVolunteers(updated); syncVolunteers(updated); onNotify("Gönüllü silindi"); }} className="text-slate-400 hover:text-red-500 ml-2"><Trash2 size={18} /></button>
                        </div>
                        <div className="max-h-40 overflow-y-auto grid gap-2 custom-scrollbar">
                            {activities.map(act => (
                                <label key={act.id} className={`flex items-center gap-2 px-3 py-2 rounded border text-xs cursor-pointer transition-all ${vol.capabilities.includes(act.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                    <input type="checkbox" checked={vol.capabilities.includes(act.id)} onChange={() => toggleCapability(vol.id, act.id)} className="hidden" />
                                    {vol.capabilities.includes(act.id) && <CheckCircle2 size={14} className="text-indigo-600"/>}
                                    {act.name}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- EKSİK OLAN ETKİNLİK KATALOĞU ---
function ActivityCatalog({ activities, setActivities, onNotify }) {
    const [newActName, setNewActName] = useState('');

    const addActivity = () => {
        if (!newActName.trim()) return;
        setActivities([...activities, { id: Math.random().toString(36).substr(2, 9), name: newActName, cat: 'science', isMust: false, boxCount: 1, allowedGrades: [] }]);
        setNewActName('');
        onNotify("Etkinlik eklendi.");
    };

    const toggleGrade = (actId, grade) => {
        setActivities(activities.map(a => {
            if (a.id !== actId) return a;
            const grades = a.allowedGrades || [];
            const newGrades = grades.includes(grade) ? grades.filter(g => g !== grade) : [...grades, grade];
            return { ...a, allowedGrades: newGrades };
        }));
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow border border-slate-200 flex flex-col max-h-[700px]">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Package size={20}/> Etkinlik Kataloğu</h3>
            <div className="flex gap-2 mb-4">
                <input value={newActName} onChange={e => setNewActName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addActivity()} placeholder="Yeni Etkinlik" className="border-2 border-slate-200 p-2 rounded-xl text-sm flex-1 outline-none focus:border-indigo-500 font-bold bg-slate-50" />
                <button onClick={addActivity} className="bg-slate-800 text-white px-4 rounded-xl font-bold hover:bg-slate-700 flex items-center"><Plus size={18}/></button>
            </div>
            <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {activities.map(act => (
                    <div key={act.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-2 relative group">
                        <div className="flex justify-between items-center">
                            <input value={act.name} onChange={e => setActivities(activities.map(a => a.id === act.id ? {...a, name: e.target.value} : a))} className="font-bold text-sm bg-transparent border-b border-dashed border-slate-300 focus:outline-none flex-1 mr-4" />
                            <button onClick={() => setActivities(activities.filter(a => a.id !== act.id))} className="text-slate-300 hover:text-red-500 bg-white p-1 rounded shadow-sm border border-slate-100"><Trash2 size={14}/></button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase mr-1">Sınıflar:</span>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(grade => {
                                const isSelected = (act.allowedGrades || []).includes(grade);
                                return (
                                    <button key={grade} onClick={() => toggleGrade(act.id, grade)} className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 opacity-60 hover:opacity-100'}`}>
                                        {grade === 0 ? 'A' : grade}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- KURULUM MODÜLÜ ---
const SetupModule = ({ activities, setActivities, timeSlots, setTimeSlots, classes, setClasses, onNotify }) => {
    const [newClassName, setNewClassName] = useState('');

    const toggleClass = (className) => {
        const existingClass = classes.find(c => c.name === className);
        if (existingClass) {
            setClasses(classes.filter(c => c.id !== existingClass.id));
            onNotify(`${className} çıkarıldı.`);
        } else {
            setClasses([...classes, {id: Math.random().toString(36).substr(2, 9), name: className, schedule: {}}]);
            onNotify(`${className} eklendi.`);
        }
    };

    const handleManualAddClass = () => {
        const cName = newClassName.trim();
        if(!cName) return;
        if(classes.find(c => c.name === cName)) { onNotify("Bu sınıf zaten var."); return; }
        setClasses([...classes, {id: Math.random().toString(36).substr(2, 9), name: cName, schedule: {}}]);
        setNewClassName('');
        onNotify(`${cName} eklendi.`);
    };

    const addQuickTimeSlot = (minutes, type, label) => {
        let lastEnd = "09:00";
        if (timeSlots.length > 0) lastEnd = timeSlots[timeSlots.length - 1].end;
        
        let [h, m] = lastEnd.split(':').map(Number);
        m += minutes; h += Math.floor(m / 60); m = m % 60;
        const newEnd = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        
        setTimeSlots([...timeSlots, {id: Math.random().toString(36).substr(2, 9), start: lastEnd, end: newEnd, type: type }]);
        onNotify(`${label} eklendi.`);
    };

    const generateStandardSchedule = () => {
        if(window.confirm("Mevcut zaman çizelgesi silinecek ve standart 09:00 tam gün şablonu yüklenecek. Onaylıyor musunuz?")) {
            const standardSlots = [
                { id: 't1', start: '09:00', end: '09:40', type: 'lesson' }, { id: 't2', start: '09:40', end: '09:55', type: 'break' },
                { id: 't3', start: '09:55', end: '10:35', type: 'lesson' }, { id: 't4', start: '10:35', end: '10:50', type: 'break' },
                { id: 't5', start: '10:50', end: '11:30', type: 'lesson' }, { id: 't6', start: '11:30', end: '12:30', type: 'lunch' },
                { id: 't7', start: '12:30', end: '13:10', type: 'lesson' }, { id: 't8', start: '13:10', end: '13:25', type: 'break' },
                { id: 't9', start: '13:25', end: '14:05', type: 'lesson' }
            ];
            setTimeSlots(standardSlots);
            onNotify("Standart şablon oluşturuldu!");
        }
    };

    const classOptions = ['Ana Sınıfı', '1-A', '1-B', '2-A', '2-B', '3-A', '3-B', '4-A', '4-B', '5-A', '5-B', '6-A', '6-B', '7-A', '7-B', '8-A', '8-B'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn text-slate-800">
            <ActivityCatalog activities={activities} setActivities={setActivities} onNotify={onNotify} />
            
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                    <h3 className="font-bold text-lg mb-4">Sınıflar (Şubeler)</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-6">
                        {classOptions.map(clsName => {
                            const isSelected = classes.find(c => c.name === clsName);
                            return (
                                <button key={clsName} onClick={() => toggleClass(clsName)} className={`py-2 rounded-lg text-sm font-bold border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-500'}`}>
                                    {clsName}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <input className="border-2 border-slate-200 p-2 rounded-xl text-sm flex-1 outline-none focus:border-indigo-500 font-bold bg-slate-50 focus:bg-white" placeholder="Manuel Sınıf Yaz (Örn: 9-C)" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleManualAddClass()} />
                        <button onClick={handleManualAddClass} className="bg-slate-800 text-white px-5 rounded-xl font-bold hover:bg-slate-700">Ekle</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Zaman Çizelgesi</h3>
                        <button onClick={generateStandardSchedule} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200 shadow-sm flex items-center gap-1"><Sparkles size={14}/> Otomatik Tam Gün (09:00)</button>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-wrap gap-2 mb-4 justify-center">
                        <button onClick={()=>addQuickTimeSlot(40, 'lesson', 'Ders')} className="bg-white border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 shadow-sm flex-1">+40dk Ders</button>
                        <button onClick={()=>addQuickTimeSlot(15, 'break', 'Teneffüs')} className="bg-white border border-orange-200 text-orange-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-orange-50 shadow-sm flex-1">+15dk Teneffüs</button>
                        <button onClick={()=>addQuickTimeSlot(60, 'lunch', 'Öğle Arası')} className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 shadow-sm flex-1">+60dk Yemek</button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {timeSlots.map((slot,i)=>(
                            <div key={slot.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-xs font-black text-slate-400 w-4">{i+1}.</span>
                                <input type="time" value={slot.start} onChange={e=>{const n=[...timeSlots];n[i].start=e.target.value;setTimeSlots(n)}} className="border-none outline-none font-bold text-sm bg-transparent w-20"/>
                                <span className="text-slate-300">-</span>
                                <input type="time" value={slot.end} onChange={e=>{const n=[...timeSlots];n[i].end=e.target.value;setTimeSlots(n)}} className="border-none outline-none font-bold text-sm bg-transparent w-20"/>
                                <select value={slot.type} onChange={e=>{const n=[...timeSlots];n[i].type=e.target.value;setTimeSlots(n)}} className="border-none outline-none text-sm font-bold bg-transparent flex-1 cursor-pointer">
                                    <option value="lesson">📚 Ders</option>
                                    <option value="break">🔔 Teneffüs</option>
                                    <option value="lunch">🍽️ Öğle Arası</option>
                                </select>
                                <button onClick={()=>{const n=[...timeSlots];n.splice(i,1);setTimeSlots(n)}} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};