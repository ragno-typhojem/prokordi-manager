import React,{useState} from 'react';
import {addSession,sessionKeys} from '../lib/sessions';
import {db} from '../lib/db';
export default function SessionBar({sessions,currentId,onSelect,onChange}){
 const [open,setOpen]=useState(false),[name,setName]=useState('');
 const current=sessions.find(s=>s.id===currentId)||sessions[0];
 return <section className="no-print dk-card dk-border border rounded-2xl p-3 mb-4 space-y-2">
  <div className="flex flex-wrap items-center gap-2"><label className="dk-text text-sm font-700">Ekip / oturum <select aria-label="Ekip / oturum" value={currentId} onChange={e=>onSelect(e.target.value)} className="dk-input border dk-border rounded-xl p-2 ml-2">{sessions.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label><label className="dk-text text-xs">Proje günü <input aria-label="Oturum proje günü" type="date" value={current.date} onChange={e=>onChange(sessions.map(s=>s.id===currentId?{...s,date:e.target.value}:s))} className="dk-input border dk-border rounded-xl p-2"/></label><button className="text-indigo-600 text-sm font-700 px-2 py-2" onClick={()=>setOpen(v=>!v)}>+ Yeni ekip</button></div>
  {open&&<div className="flex flex-wrap gap-2"><input aria-label="Yeni ekip adı" value={name} onChange={e=>setName(e.target.value)} placeholder="Örn. 2. okul / B ekibi" className="dk-input border dk-border rounded-xl px-3 py-2 flex-1 min-w-0"/><button className="bg-indigo-600 text-white rounded-xl px-4 py-2" onClick={()=>{if(!name.trim())return;db.flush();const entry=addSession(name,current.date);const source=db.load(sessionKeys(currentId).ACTIVITIES,[]);db.save(sessionKeys(entry.id).ACTIVITIES,source.map(a=>({...a,boxCount:0,planningReady:false})));onChange([...sessions,entry]);onSelect(entry.id);setName('');setOpen(false);}}>Oturumu oluştur</button></div>}
  <p className="text-xs dk-text-muted">Program, gönüllüler ve isimlik bu ekibe ait. Kolaj ve 5 günlük depo listesi tüm ekipler için ortak.</p>
 </section>;
}
