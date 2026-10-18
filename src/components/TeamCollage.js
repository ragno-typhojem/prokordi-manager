import React,{useState,useEffect,useRef} from 'react';
import {db,DB_KEYS} from '../lib/db';
import {pinProfessor,paginate} from '../lib/printLayout';
import {uid} from '../lib/util';
import {readPhoto} from '../lib/photos';
import FitText from './FitText';
import LayoutFeedback from './LayoutFeedback';
export default function TeamCollage({onNotify}){
 const root=useRef(null),drag=useRef(null);
 const [people,setPeople]=useState(()=>pinProfessor(db.load(DB_KEYS.COLLAGE_VOLUNTEERS,[])));
 const [title,setTitle]=useState(()=>db.load('prokordi_collage_title_v2',db.load('prokordi_collage_layout_v1',{}).title||'İLKYAR PROJESİ EKİBİ'));
 const [address,setAddress]=useState(()=>db.load('prokordi_collage_address_v2',db.load('prokordi_collage_layout_v1',{}).address||'Çiğdem Mah. 1588. Sok. No:81 · 06580 Çankaya / Ankara'));
 const [settings,setSettings]=useState(()=>({nameSize:22,columns:3,padding:10,...db.load('prokordi_collage_settings_v8',{})}));
 useEffect(()=>{db.save('prokordi_collage_settings_v8',settings);},[settings]);
 const [selected,setSelected]=useState('ilkyar-prof-huseyin-vural');
 const [name,setName]=useState('');const [revision,setRevision]=useState(0);const [undo,setUndo]=useState(null);
 const person=people.find(v=>v.id===selected)||people[0],pages=paginate(people,settings.columns===2?8:12);
 useEffect(()=>{db.save(DB_KEYS.COLLAGE_VOLUNTEERS,people);},[people]);
 useEffect(()=>{db.save('prokordi_collage_title_v2',title);},[title]);
 useEffect(()=>{db.save('prokordi_collage_address_v2',address);},[address]);
 const update=(id,patch)=>setPeople(prev=>pinProfessor(prev.map(v=>v.id===id?{...v,...patch}:v)));
 const photo=async file=>{try{const data=await readPhoto(file);update(person.id,{photo:data,scale:1,photoX:0,photoY:0});}catch(e){onNotify(e.message);}};
 return <div className="space-y-4 print-document">
  <style>{`@media print{@page{size:A4 portrait;margin:0}.team-collage-page{width:210mm!important;height:296mm!important;min-height:296mm!important;max-height:296mm!important;box-sizing:border-box!important;margin:0!important;break-after:page!important}.team-collage-page:last-child{break-after:auto!important}.team-collage-pages{overflow:visible!important;display:block!important}.team-collage-page{display:grid!important;break-inside:avoid!important}.collage-cell{break-inside:avoid!important}}.collage-cell{box-sizing:border-box;overflow:hidden;display:grid;grid-template-rows:minmax(0,1fr) 13mm;gap:1mm;padding:2mm;border:0.2mm solid #d8e0eb;border-radius:3mm;background:white;color:#18243b}.portrait-frame{position:relative;overflow:hidden;min-height:0;background:#eef2f7;touch-action:none}.portrait-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}.collage-cell:focus{outline:2px solid #4f46e5}`}</style>
  <section className="control-section ui-controls no-print dk-card dk-border border rounded-2xl p-5 space-y-3"><h3 className="text-lg font-700 dk-text">Ekip kolajı</h3><p className="text-sm dk-text">Hüseyin Hoca ilk sırada sabit. Her sayfada eşit büyüklükte alanlar; A4 dikey. Bir kişiye tıklayarak adını ve fotoğrafını düzenleyin.</p>
   <span className="ui-section-label">1 · Sayfayı düzenle</span><label className="text-sm dk-text block">Proje başlığı<input aria-label="Kolaj başlığı" value={title} onChange={e=>setTitle(e.target.value)} className="dk-input dk-border border rounded-xl p-3 w-full mt-1"/></label>
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 dk-text text-sm"><label>İsim boyutu · {settings.nameSize} px<input aria-label="Kolaj isim boyutu" type="range" min="12" max="36" value={settings.nameSize} onChange={e=>setSettings(p=>({...p,nameSize:+e.target.value}))} className="block w-full mt-2"/></label><label>Sayfa düzeni<select aria-label="Kolaj sütun sayısı" value={settings.columns} onChange={e=>setSettings(p=>({...p,columns:+e.target.value}))} className="dk-input border dk-border rounded-lg p-2 block w-full"><option value={3}>3 sütun · 12 kişi</option><option value={2}>2 sütun · 8 kişi</option></select></label><label>Kenar payı · {settings.padding} mm<input aria-label="Kolaj kenar payı" type="range" min="8" max="16" value={settings.padding} onChange={e=>setSettings(p=>({...p,padding:+e.target.value}))} className="block w-full mt-2"/></label></div>
   <details open className="text-sm dk-text"><summary className="cursor-pointer">Alt bilgiyi düzenle</summary><input aria-label="Kolaj alt bilgi adresi" value={address} onChange={e=>setAddress(e.target.value)} className="dk-input border dk-border rounded-lg p-2 w-full mt-2"/></details>
   <div className="flex flex-wrap gap-2"><input aria-label="Kolaja yeni kişi" value={name} onChange={e=>setName(e.target.value)} placeholder="Yeni gönüllünün adı" className="dk-input border dk-border rounded-xl px-3 py-2 flex-1 min-w-0"/><button onClick={()=>{if(name.trim()){const p={id:uid(),name:name.trim()};setPeople(prev=>pinProfessor([...prev,p]));setSelected(p.id);setName('');}}} className="bg-indigo-600 text-white rounded-xl px-4 py-2">Kişi ekle</button><button onClick={()=>window.print()} className="dk-text border dk-border rounded-xl px-4 py-2">A4 yazdır</button></div>
   <span className="ui-section-label">2 · Kişi ve fotoğraf</span><div className="control-group dk-card-inner rounded-xl p-3 space-y-2"><p className="dk-text font-700 text-sm">Seçili: {person.name}</p><input aria-label="Seçili kişinin adı" value={person.name} disabled={person.pinned} onChange={e=>update(person.id,{name:e.target.value})} className="dk-input border dk-border rounded-lg p-2 w-full"/>
    <div className="flex flex-wrap gap-3 items-center dk-text text-sm"><label className="border dk-border rounded-lg px-3 py-2 cursor-pointer">Fotoğraf seç<input aria-label="Kolaj fotoğrafı" type="file" accept="image/*" className="hidden" onChange={e=>{if(e.target.files[0])photo(e.target.files[0]);e.target.value='';}}/></label>
     <label>Seçili isim boyutu<input aria-label="Seçili kolaj ismi boyutu" type="range" min="12" max="36" value={person.collageFontSize||settings.nameSize} onChange={e=>update(person.id,{collageFontSize:+e.target.value})}/></label>
     <label>Yakınlık<input aria-label="Fotoğraf yakınlığı" type="range" min="1" max="3" step="0.05" value={person.scale||1} onChange={e=>update(person.id,{scale:+e.target.value})}/></label>
     <button onClick={()=>update(person.id,{scale:1,photoX:0,photoY:0})} className="underline">Fotoğrafı ortala</button>
     {!person.pinned&&<><button className="underline" disabled={people.findIndex(v=>v.id===person.id)<=1} onClick={()=>setPeople(prev=>{const next=[...prev],i=next.findIndex(v=>v.id===person.id);if(i>1)[next[i-1],next[i]]=[next[i],next[i-1]];return pinProfessor(next);})}>Bir sıra öne</button><button className="underline" disabled={people.at(-1)?.id===person.id} onClick={()=>setPeople(prev=>{const next=[...prev],i=next.findIndex(v=>v.id===person.id);if(i>0&&i<next.length-1)[next[i+1],next[i]]=[next[i],next[i+1]];return pinProfessor(next);})}>Bir sıra arkaya</button></>}
     {!person.pinned&&<button onClick={()=>{db.save('prokordi_collage_before_remove',people);setUndo(people);setPeople(prev=>pinProfessor(prev.filter(v=>v.id!==person.id)));setSelected('ilkyar-prof-huseyin-vural');}} className="text-red-600">Kolajdan çıkar</button>}
    </div>
   </div>{undo&&<button className="text-indigo-600 text-sm underline" onClick={()=>{setPeople(pinProfessor(undo));setUndo(null);}}>Kolajdan çıkarmayı geri al</button>}<p className="text-sm dk-text-muted">{people.length} kişi · {pages.length} sayfa · {people.filter(v=>!v.photo).length} eksik fotoğraf. Düzenleme paneli çıktıya girmez.</p>
  </section>
  <LayoutFeedback targetRef={root} onFix={()=>{setRevision(v=>v+1);onNotify('Başlık ve isimler ayrılmış alanlarına yeniden sığdırıldı.');}}/>
  <div className="preview-heading no-print"><span>3 · Baskı önizlemesi · kişiye tıklayarak seç</span><span>A4 dikey · {pages.length} sayfa</span></div>
  <div ref={root} className="team-collage-pages overflow-x-auto space-y-6">{pages.map((items,index)=><section className="print-page team-collage-page bg-white shadow-lg mx-auto" key={index} style={{width:'210mm',height:'296mm',minHeight:'296mm',padding:settings.padding+'mm',boxSizing:'border-box',display:'grid',gridTemplateRows:'22mm minmax(0,1fr) 22mm',gap:'2mm',overflow:'hidden'}}>
   <div style={{height:'22mm',paddingBottom:'4mm',boxSizing:'border-box',color:'#18243b'}}><FitText text={title} max={29} min={10}/></div>
   <div className="collage-grid" style={{display:'grid',gridTemplateColumns:`repeat(${settings.columns},minmax(0,1fr))`,gridTemplateRows:'repeat(4,minmax(0,1fr))',gap:'3mm',minHeight:0}}>{items.map(v=><div data-fit-card data-person-id={v.id} key={v.id} tabIndex={0} role="button" aria-label={`Düzenle: ${v.name}`} onClick={()=>setSelected(v.id)} onKeyDown={e=>{if(e.key==='Enter')setSelected(v.id);}} className="collage-cell">
    <div className="portrait-frame" onPointerDown={e=>{if(!v.photo)return;e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();drag.current={id:v.id,x:e.clientX,y:e.clientY,width:r.width,height:r.height,px:v.photoX||0,py:v.photoY||0};}} onPointerMove={e=>{const d=drag.current;if(d?.id!==v.id)return;update(v.id,{photoX:Math.max(-40,Math.min(40,d.px+(e.clientX-d.x)/d.width*100)),photoY:Math.max(-40,Math.min(40,d.py+(e.clientY-d.y)/d.height*100))});}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
     {v.photo?<img src={v.photo} alt={v.name} style={{transform:`scale(${Math.min(3,Math.max(1,v.scale||1))}) translate(${v.photoX||0}%,${v.photoY||0}%)`}}/>:<span style={{display:'flex',height:'100%',alignItems:'center',justifyContent:'center',fontSize:12,color:'#64748b'}}>Fotoğraf ekle</span>}
    </div><FitText key={revision} text={v.name} max={v.collageFontSize||settings.nameSize} min={8}/>
   </div>)}</div>
   <footer style={{height:'22mm',paddingTop:'5mm',boxSizing:'border-box',textAlign:'center',color:'#243249',fontSize:'10pt',lineHeight:1.4}}><strong>MEKTUPLARINI BEKLİYORUZ</strong><div style={{height:'7mm'}}><FitText text={address} max={11} min={7}/></div><p style={{fontSize:'7pt',color:'#64748b'}}>{index+1} / {pages.length}</p></footer>
  </section>)}</div>
 </div>;
}
