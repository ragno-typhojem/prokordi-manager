import React,{useState,useEffect,useRef} from 'react';
import {db} from '../lib/db';
import {uid,norm} from '../lib/util';
import {sessionKeys,syncSessionRoster} from '../lib/sessions';
import {badgeLayout,paginate} from '../lib/printLayout';
import FitText from './FitText';
import LayoutFeedback from './LayoutFeedback';
export default function NameBadges({sessionId,onNotify}){
 const keys=sessionKeys(sessionId),layoutRef=useRef(null);
 const [people,setPeople]=useState(()=>db.load(keys.NAMETAG_VOLUNTEERS,db.load(keys.VOLUNTEERS,[])));
 const [layout,setLayout]=useState(()=>db.load('prokordi_fold_badge_v1',{width:86,height:54}));
 const [draft,setDraft]=useState(()=>people.map(v=>v.name).join('\n'));
 const [revision,setRevision]=useState(0);
 const dims=badgeLayout(layout),pages=paginate(people,dims.rows);
 useEffect(()=>{db.save(keys.NAMETAG_VOLUNTEERS,people);syncSessionRoster(sessionId,people);},[people,sessionId,keys.NAMETAG_VOLUNTEERS]);
 useEffect(()=>{db.save('prokordi_fold_badge_v1',layout);},[layout]);
 const applyNames=()=>{const seen=new Set();const names=draft.split(/\r?\n/).map(s=>s.trim()).filter(s=>{if(!s||seen.has(norm(s)))return false;seen.add(norm(s));return true;});const used=new Set();setPeople(names.map((name,i)=>{const exact=people.find(v=>norm(v.name)===norm(name)&&!used.has(v.id));const old=exact||people[i];let id=old?.id||uid();if(used.has(id))id=uid();used.add(id);return {...old,id,name};}));onNotify('İsim listesi güncellendi. Her isim yan yana iki kez basılacak.');};
 return <div className="space-y-4">
  <style>{`@media print{@page{size:A4 portrait;margin:0}.fold-page{width:210mm!important;height:297mm!important;min-height:297mm!important;padding:8mm!important;box-sizing:border-box!important;margin:0!important;break-after:page!important}.fold-page:last-child{break-after:auto!important}.fold-row{break-inside:avoid!important}.fold-pages{overflow:visible!important}} .badge-face{position:relative;flex:none;box-sizing:border-box;overflow:hidden;border:0.2mm solid #b8c0cc;background:white;color:#142039}.badge-face img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}.badge-face .name-zone{position:absolute;left:4mm;right:4mm;top:13mm;bottom:10mm;display:flex;align-items:center;justify-content:center}.badge-face .name-zone>div{display:flex;align-items:center;justify-content:center}`}</style>
  <section className="no-print dk-card border dk-border p-5 rounded-2xl space-y-3">
   <h3 className="font-700 dk-text text-lg">Katlanabilir yatay isimlik</h3><p className="text-sm dk-text">Tek yüz {dims.width} × {dims.height} mm; açık çift {dims.unfoldedWidth} × {dims.height} mm. Aynı isim yan yana iki kez. Kes, orta çizgiden katla ve kartlığa yerleştir.</p>
   <p className="text-sm dk-text-muted">90 × 60 mm kart yuvası için biraz küçük 86 × 54 mm önerilir. Yazdırırken A4 ve %100 / gerçek boyut seçin.</p>
   <textarea aria-label="İsimlik isimleri" value={draft} onChange={e=>setDraft(e.target.value)} className="dk-input dk-border border rounded-xl p-3 w-full h-32" placeholder="Her satıra bir gönüllü adı"/>
   <div className="flex gap-2 flex-wrap"><button onClick={applyNames} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">İsimleri uygula</button><button onClick={()=>window.print()} className="dk-text border dk-border px-4 py-2 rounded-xl">A4 yazdır</button><span className="text-sm dk-text self-center">{people.length} isim · {pages.length} sayfa</span></div>
   <details><summary className="dk-text cursor-pointer text-sm">Kart ölçüsünü ayarla</summary><div className="flex gap-3 mt-3">{[['width','Kart genişliği (mm)',70,90],['height','Kart yüksekliği (mm)',40,60]].map(([k,l,min,max])=><label key={k} className="dk-text text-sm">{l}<input aria-label={l} type="number" min={min} max={max} value={layout[k]} onChange={e=>setLayout(p=>({...p,[k]:e.target.value}))} className="dk-input border dk-border rounded-lg p-2 block w-28"/></label>)}</div></details>
  </section>
  <LayoutFeedback targetRef={layoutRef} onFix={()=>{setLayout({width:86,height:54});setRevision(v=>v+1);onNotify('Kart ölçüsü 86 × 54 mm oldu. Yazılar güvenli alana yeniden sığdırıldı.');}}/>
  <div ref={layoutRef} className="fold-pages overflow-x-auto space-y-6">{pages.map((items,index)=><section key={index} className="print-page fold-page bg-white mx-auto shadow-lg" style={{padding:'8mm',boxSizing:'border-box'}}>
    <div style={{display:'flex',flexDirection:'column',gap:'2mm',alignItems:'center'}}>{items.map(v=><div className="fold-row" key={v.id} style={{display:'flex',width:dims.unfoldedWidth+'mm',height:dims.height+'mm'}}>{[0,1].map(side=><div data-fit-card data-badge-name={v.name} key={side} className="badge-face" style={{width:dims.width+'mm',height:dims.height+'mm',borderLeft:side?'0.2mm dashed #64748b':undefined}}><img src="/nametags/front.png" alt=""/><div className="name-zone"><FitText key={revision} text={v.name} max={36} min={9}/></div></div>)}</div>)}</div>
  </section>)}</div>
 </div>;
}
