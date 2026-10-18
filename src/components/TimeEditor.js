import React, { useState } from 'react';
import { uid, addMin, toMin, canonicalSlots, validateTimeSlots } from '../lib/util';
import { rebuildDay, prependPresentation } from '../lib/templates';

const types = { lesson: 'Etkinlik', break: 'Teneffüs / geçiş', lunch: 'Yemek', presentation: 'Toplu sunum' };

export default function TimeEditor({ slots, classes, onSave, onNotify }) {
  const [draft, setDraft] = useState(() => slots.map(s => ({ ...s })));
  const [start, setStart] = useState(slots.at(-1)?.end || '08:00');
  const [template, setTemplate] = useState(()=>{const lesson=slots.find(s=>s.type==='lesson'),gap=slots.find(s=>s.type==='break'),lunch=slots.find(s=>s.type==='lunch'),intro=slots.find(s=>s.type==='presentation');const minutes=s=>s?toMin(s.end)-toMin(s.start):0;return {start:slots[0]?.start||'08:00',lessons:slots.filter(s=>s.type==='lesson').length||6,duration:minutes(lesson)||40,breakMinutes:slots.length?minutes(gap):10,lunchMinutes:slots.length?minutes(lunch):60,lunchAfter:lunch?slots.slice(0,slots.indexOf(lunch)).filter(s=>s.type==='lesson').length:3,presentationMinutes:slots.length?minutes(intro):30};});
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
    <details open className="dk-card-inner p-3 rounded-xl dk-text"><summary className="cursor-pointer font-700">Günü tek adımda oluştur</summary>
      <p className="text-sm my-2">Başlangıcı ve süreleri seçin; tüm saatler birlikte hesaplanır. Mevcut etkinlik atamaları korunur. Sunum istemiyorsanız 0 yazın.</p>
      <div className="grid grid-cols-2 gap-2">{Object.entries({start:'Gün başlangıcı',presentationMinutes:'Başlangıç sunumu (dk; yoksa 0)',lessons:'Etkinlik sayısı',duration:'Etkinlik süresi (dk)',breakMinutes:'Geçiş süresi (dk)',lunchMinutes:'Yemek süresi (dk)',lunchAfter:'Kaçıncı etkinlikten sonra yemek?'}).map(([k,l])=><label key={k} className="text-xs">{l}<input aria-label={l} type={k==='start'?'text':'number'} value={template[k]} onChange={e=>setTemplate(p=>({...p,[k]:e.target.value}))} className={`${field} block w-full mt-1`}/></label>)}</div>
      <button className="bg-indigo-600 text-white rounded-xl px-4 py-3 font-700 mt-3" onClick={()=>{try{const next=rebuildDay(template,slots,classes);setDraft(next);setStart(next.at(-1).end);setErrors([]);onSave(canonicalSlots(next));onNotify('Gün oluşturuldu ve saatler kaydedildi. Mevcut atamalar korundu.');}catch(e){setErrors([e.message]);}}}>Günü oluştur ve kaydet</button>
    </details>
    {draft.length>0&&!draft.some(s=>s.type==='presentation')&&<button className={button} onClick={()=>{try{const next=prependPresentation(draft);setDraft(next);setErrors([]);}catch(e){setErrors([e.message]);}}}>Başa 30 dk sunum ekle · saatleri 40 dk kaydır</button>}
    <details className="dk-text"><summary className="font-700 cursor-pointer">Tek tek saat düzenle / satır ekle</summary>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
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
      {slot.type==='presentation'&&<label className="text-xs dk-text">Sunum başlığı<input aria-label="Sunum başlığı" value={slot.title||'İLKYAR açılış sunumu'} onChange={e=>update(slot.id,'title',e.target.value)} className={`${field} block w-full mt-1`}/></label>}
      <select aria-label={`${i+1}. satır türü`} value={slot.type} onChange={e=>update(slot.id,'type',e.target.value)} className={`${field} w-full`}>{Object.entries(types).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
      {toMin(slot.end)>toMin(slot.start) && toMin(slot.start)>=0 && <p className="text-xs dk-text-muted">{toMin(slot.end)-toMin(slot.start)} dakika</p>}
    </div>)}</div>
    </details>
    {!draft.length && <p className="dk-text-muted text-sm">Başlangıç ve süreyi girip ilk etkinliği ekleyin.</p>}
    {!!errors.length && <div role="alert" className="text-red-700 bg-red-50 rounded-xl p-3 text-sm">{errors.map((e,i)=><p key={i}>{e}</p>)}</div>}
    <div className="flex flex-wrap gap-2 items-center"><button onClick={save} className="bg-indigo-600 text-white rounded-xl px-4 py-3 font-700">Saatleri kaydet</button>
      <button className={button} onClick={()=>{setDraft(slots.map(s=>({...s})));setErrors([]);}}>Değişiklikleri geri al</button>
      <span role="status" className="text-sm dk-text-muted">{dirty?'Kaydedilmemiş değişiklikler':'Programla aynı'}</span></div>
  </section>;
}
