import React, { useState } from 'react';
import { uid, addMin, toMin, canonicalSlots, validateTimeSlots } from '../lib/util';
import { makeDay } from '../lib/templates';

const types = { lesson: 'Etkinlik', break: 'Teneffüs / geçiş', lunch: 'Yemek', presentation: 'Toplu sunum' };

export default function TimeEditor({ slots, classes, onSave, onNotify }) {
  const [draft, setDraft] = useState(() => slots.map(s => ({ ...s })));
  const [start, setStart] = useState(slots.at(-1)?.end || '08:00');
  const [template, setTemplate] = useState({start:'08:00',lessons:6,duration:40,breakMinutes:10,lunchMinutes:60,lunchAfter:3});
  const [duration, setDuration] = useState(40);
  const [type, setType] = useState('lesson');
  const [errors, setErrors] = useState([]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(slots);
  const field = 'dk-input dk-border border rounded-lg px-3 py-2 text-base dk-text min-w-0';
  const button = 'dk-card dk-border border rounded-lg px-3 py-2 text-sm font-700 dk-text';
  const update = (id, key, value) => setDraft(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  const add = (minutes = duration, slotType = type) => {
    const end = addMin(start, minutes);
    if (!end || !Number.isInteger(Number(minutes)) || Number(minutes) <= 0) {
      setErrors(['Geçerli bir başlangıç ve pozitif tam dakika girin. Gece yarısını aşan satır eklenemez.']); return;
    }
    setDraft(prev => [...prev, { id: uid(), start, end, type: slotType }]);
    setStart(end); setErrors([]);
  };
  const save = () => {
    const issues = validateTimeSlots(draft);
    for (const slot of slots) {
      const next = draft.find(s => s.id === slot.id);
      if ((!next || next.type !== slot.type) && classes.some(c => c.schedule?.[slot.id])) {
        issues.push(`${slot.start}: Atama bulunan satırın türü değiştirilemez veya satır kaldırılamaz.`);
      }
    }
    setErrors(issues);
    if (issues.length) return;
    onSave(canonicalSlots(draft)); onNotify('Saatler kaydedildi. Mevcut ders atamaları korundu.');
  };
  return <section className="dk-card dk-border border rounded-2xl p-4 space-y-4">
    <div><h3 className="text-base font-700 dk-text">Zaman Çizelgesi</h3>
      <p className="text-sm dk-text-muted mt-2">Okulun saatlerini girin. 9:00 veya 09.00 yazabilirsiniz. Değişiklikler Kaydet ile programa geçer.</p></div>
    <details className="dk-card-inner p-3 rounded-xl dk-text"><summary className="cursor-pointer font-700">08.00’den esnek gün şablonu oluştur</summary>
      <p className="text-sm my-2">Yeni şablon yalnızca çizelge boşken kurulur. Mevcut atamalar korunur.</p>
      <div className="grid grid-cols-2 gap-2">{Object.entries({start:'Gün başlangıcı',lessons:'Etkinlik sayısı',duration:'Etkinlik süresi (dk)',breakMinutes:'Geçiş süresi (dk)',lunchMinutes:'Yemek süresi (dk)',lunchAfter:'Kaçıncı etkinlikten sonra yemek?'}).map(([k,l])=><label key={k} className="text-xs">{l}<input aria-label={l} type={k==='start'?'text':'number'} value={template[k]} onChange={e=>setTemplate(p=>({...p,[k]:e.target.value}))} className={`${field} block w-full mt-1`}/></label>)}</div>
      <button className={`${button} mt-3`} disabled={draft.length>0} onClick={()=>{try{const next=makeDay(template);setDraft(next);setStart(next.at(-1).end);setErrors([]);}catch(e){setErrors([e.message]);}}}>Şablonu hazırla</button>
    </details>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="text-sm dk-text">Yeni satır başlangıcı<input aria-label="Yeni satır başlangıcı" placeholder="09:00" inputMode="decimal" value={start} onChange={e=>setStart(e.target.value)} className={`${field} block w-full mt-1`}/></label>
      <label className="text-sm dk-text">Süre (dakika)<input aria-label="Süre (dakika)" type="number" min="1" max="1439" value={duration} onChange={e=>setDuration(e.target.value)} className={`${field} block w-full mt-1`}/></label>
      <label className="text-sm dk-text">Satır türü<select value={type} onChange={e=>setType(e.target.value)} className={`${field} block w-full mt-1`}>{Object.entries(types).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <button className={button} onClick={()=>add()}>Satır ekle</button>
    </div>
    <div className="flex flex-wrap gap-2">{[[40,'lesson','40 dk etkinlik'],[15,'break','15 dk geçiş'],[60,'lunch','60 dk yemek']].map(([d,t,l])=><button key={t} className={button} onClick={()=>add(d,t)}>+ {l}</button>)}</div>
    <div className="space-y-3">{draft.map((slot,i)=><div key={slot.id} className="dk-card-inner dk-border border rounded-xl p-3 space-y-2">
      <div className="flex justify-between items-center"><span className="text-sm font-700 dk-text">{i+1}. satır · {types[slot.type]}</span><button className={button} disabled={classes.some(c=>c.schedule?.[slot.id])} title="Ataması bulunan satırlar korunur" onClick={()=>setDraft(prev=>prev.filter(s=>s.id!==slot.id))}>Kaldır</button></div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs dk-text-muted">Başlangıç<input aria-label={`${i+1}. satır başlangıç`} value={slot.start} placeholder="09:00" inputMode="decimal" onChange={e=>update(slot.id,'start',e.target.value)} className={`${field} block w-full mt-1`}/></label>
        <label className="text-xs dk-text-muted">Bitiş<input aria-label={`${i+1}. satır bitiş`} value={slot.end} placeholder="09:40" inputMode="decimal" onChange={e=>update(slot.id,'end',e.target.value)} className={`${field} block w-full mt-1`}/></label>
      </div>
      <select aria-label={`${i+1}. satır türü`} value={slot.type} onChange={e=>update(slot.id,'type',e.target.value)} className={`${field} w-full`}>{Object.entries(types).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
      {toMin(slot.end)>toMin(slot.start) && toMin(slot.start)>=0 && <p className="text-xs dk-text-muted">{toMin(slot.end)-toMin(slot.start)} dakika</p>}
    </div>)}</div>
    {!draft.length && <p className="dk-text-muted text-sm">Başlangıç ve süreyi girip ilk etkinliği ekleyin.</p>}
    {!!errors.length && <div role="alert" className="text-red-700 bg-red-50 rounded-xl p-3 text-sm">{errors.map((e,i)=><p key={i}>{e}</p>)}</div>}
    <div className="flex flex-wrap gap-2 items-center"><button onClick={save} className="bg-indigo-600 text-white rounded-xl px-4 py-3 font-700">Saatleri kaydet</button>
      <button className={button} onClick={()=>{setDraft(slots.map(s=>({...s})));setErrors([]);}}>Değişiklikleri geri al</button>
      <span role="status" className="text-sm dk-text-muted">{dirty?'Kaydedilmemiş değişiklikler':'Programla aynı'}</span></div>
  </section>;
}
