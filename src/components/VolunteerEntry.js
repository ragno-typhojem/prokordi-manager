import React,{useState} from 'react';
import {uid,norm} from '../lib/util';
import {resolveActivity} from '../lib/catalog';
export function parseVolunteerLines(text,activities,existing){
 const volunteers=existing.map(v=>({...v,capabilities:[...(v.capabilities||[])]})),issues=[];
 for(const line of text.split(/\r?\n/).filter(x=>x.trim())){
  const parts=line.split(/\s+[-–—]\s+|\t/),name=parts.shift().trim();if(!name)continue;
  let person=volunteers.find(v=>norm(v.name)===norm(name));if(!person){person={id:uid(),name,capabilities:[]};volunteers.push(person);}
  for(const skill of parts.join(',').split(/[,;|]+/).map(x=>x.trim()).filter(Boolean)){const a=resolveActivity(activities,skill);if(a&&a.cat!=='presentation')person.capabilities=[...new Set([...person.capabilities,a.id])];else issues.push(`${name}: “${skill}” eşleşmedi; listeden seçin.`);}
 }
 return {volunteers,issues};
}
export default function VolunteerEntry({activities,volunteers,onSave}){
 const [text,setText]=useState(''),[issues,setIssues]=useState([]),[status,setStatus]=useState('');
 const submit=()=>{if(!text.trim())return;const result=parseVolunteerLines(text,activities,volunteers);const added=result.volunteers.length-volunteers.length;onSave(result.volunteers);setIssues(result.issues);setStatus(`${added} yeni gönüllü eklendi. Mevcut kişiler yeniden oluşturulmadan yetkinlikleri güncellendi.`);if(!result.issues.length)setText('');};
 return <section className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-5 space-y-3"><h4 className="font-700 text-indigo-950 text-base">Gönüllü ekle · ad ve yapabildiği etkinlik</h4><p className="text-sm text-indigo-900">Her satıra bir kişi. Örnek: <strong>Berke Şimşekler - Yapay zeka</strong>. Birden fazla yetkinliği virgülle ayırabilirsiniz.</p><textarea aria-label="Gönüllüler ve yetkinlikleri" placeholder={'Berke Şimşekler - Yapay zeka\nEda Nur Keklik - Origami, Pino Mino İlkokul'} value={text} onChange={e=>{setText(e.target.value);setStatus('');}} onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();submit();}}} className="w-full rounded-xl border border-indigo-200 p-3 text-slate-900 bg-white h-28"/><button disabled={!text.trim()} onClick={submit} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-700 disabled:opacity-50">+ Gönüllüleri ekle</button><p className="text-xs text-indigo-900">Hızlı ekle: ⌘ Enter / Ctrl Enter. Eşleşmeyen yetkinlik varsa metnin burada kalır; düzeltip tekrar ekleyebilirsin.</p>{status&&<p role="status" className="text-sm text-indigo-900">{status}</p>}{issues.length>0&&<div role="alert" className="text-sm text-amber-900">{issues.map(x=><p key={x}>{x}</p>)}</div>}</section>;
}
