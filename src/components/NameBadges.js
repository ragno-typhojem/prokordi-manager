import React,{useState,useEffect,useRef} from 'react';
import {db} from '../lib/db';
import {uid,norm} from '../lib/util';
import {sessionKeys,syncSessionRoster} from '../lib/sessions';
import {badgeLayout,paginate} from '../lib/printLayout';
import FitText from './FitText';
import LayoutFeedback from './LayoutFeedback';
export default function NameBadges({sessionId='legacy',onNotify}){
 const keys=sessionKeys(sessionId),layoutRef=useRef(null);
 const [people,setPeople]=useState(()=>db.load(keys.NAMETAG_VOLUNTEERS,db.load(keys.VOLUNTEERS,[])));
 const [layout,setLayout]=useState(()=>({width:86,height:54,fontSize:38,padding:8,gap:2,mode:'paired',...db.load('prokordi_fold_badge_v1',{})}));
 const [draft,setDraft]=useState(()=>people.map(v=>v.name).join('\n'));
 const [selected,setSelected]=useState(people[0]?.id||'');
 const [revision,setRevision]=useState(0);
 const dims=badgeLayout(layout),chunks=paginate(people,dims.rows),pages=chunks.flatMap((items,chunk)=>layout.mode==='names'?[{items,type:'names',chunk}]:[{items,type:'names',chunk},{items,type:'back',chunk}]);
 // Keep names inside the blank part of the supplied 1920 × 1080 artwork,
 // accounting for object-fit:contain at every supported card size.
 const artworkScale=Math.min(dims.width/1920,dims.height/1080);
 const artworkWidth=1920*artworkScale,artworkHeight=1080*artworkScale;
 const nameZone={left:((dims.width-artworkWidth)/2+artworkWidth*.14)+'mm',right:((dims.width-artworkWidth)/2+artworkWidth*.14)+'mm',top:((dims.height-artworkHeight)/2+artworkHeight*.24)+'mm',bottom:((dims.height-artworkHeight)/2+artworkHeight*.23)+'mm'};
 const person=people.find(v=>v.id===selected)||people[0];
 useEffect(()=>{db.save(keys.NAMETAG_VOLUNTEERS,people);syncSessionRoster(sessionId,people);},[people,sessionId,keys.NAMETAG_VOLUNTEERS]);
 useEffect(()=>{db.save('prokordi_fold_badge_v1',layout);},[layout]);
 const applyNames=()=>{const seen=new Set();const names=draft.split(/\r?\n/).map(s=>s.trim()).filter(s=>{if(!s||seen.has(norm(s)))return false;seen.add(norm(s));return true;});setPeople(names.map(name=>({...people.find(v=>norm(v.name)===norm(name)),id:people.find(v=>norm(v.name)===norm(name))?.id||uid(),name})));onNotify('Ortak isim listesi güncellendi. Her isim yan yana iki kez basılacak.');};
 return <div className="space-y-4 print-document">
  <style>{`@media print{@page{size:A4 portrait;margin:0}.fold-page{width:210mm!important;height:296mm!important;min-height:296mm!important;max-height:296mm!important;padding:var(--badge-padding,8mm)!important;box-sizing:border-box!important;margin:0!important;break-inside:avoid!important;break-after:page!important}.fold-page:last-child{break-after:auto!important}.fold-row{break-inside:avoid!important}.fold-pages{overflow:visible!important;display:block!important}} .badge-face{position:relative;flex:none;box-sizing:border-box;overflow:hidden;border:0.2mm solid #b8c0cc;background:white;color:#142039}.badge-face img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.badge-face .name-zone{position:absolute;left:4mm;right:4mm;top:13mm;bottom:10mm;display:flex;align-items:center;justify-content:center}.badge-face .name-zone>div{display:flex;align-items:center;justify-content:center}`}</style>
  <section className="control-section ui-controls no-print dk-card border dk-border p-5 rounded-2xl space-y-3">
   <h3 className="font-700 dk-text text-lg">İsimlik matbaası</h3><p className="text-sm dk-text">Tek yüz {dims.width} × {dims.height} mm. Aynı isim yan yana iki kez; katlandığında kartlığa sığar. İsim sayfasının ardından aynı konumlarda ara tasarım sayfası gelir.</p>
   <span className="ui-section-label">1 · İsim listesini düzenle</span><textarea aria-label="İsimlik isimleri" value={draft} onChange={e=>setDraft(e.target.value)} className="dk-input dk-border border rounded-xl p-3 w-full h-28" placeholder="Her satıra bir gönüllü adı"/>
   <div className="flex gap-2 flex-wrap"><button onClick={applyNames} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">İsimleri uygula</button><button onClick={()=>window.print()} className="dk-text border dk-border px-4 py-2 rounded-xl">A4 yazdır</button><span className="text-sm dk-text self-center">{people.length} isim · {pages.length} sayfa</span></div>
   <span className="ui-section-label">2 · Boyut ve sayfa düzeni</span><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 dk-card-inner p-4 rounded-xl"><label className="dk-text text-sm">Tüm isimlerin boyutu · {layout.fontSize} px<input aria-label="Tüm isimlerin boyutu" type="range" min="16" max="72" value={layout.fontSize} onChange={e=>setLayout(p=>({...p,fontSize:+e.target.value}))} className="w-full block mt-2"/></label><label className="dk-text text-sm">Sayfa sırası<select aria-label="İsimlik sayfa sırası" value={layout.mode} onChange={e=>setLayout(p=>({...p,mode:e.target.value}))} className="dk-input border dk-border rounded-lg p-2 block w-full"><option value="paired">İsim / ara tasarım / sonraki isimler</option><option value="names">Sadece isim sayfaları</option></select></label>
    {person&&<><label className="dk-text text-sm">Tek ismi düzenle<select aria-label="Düzenlenecek isimlik" value={person.id} onChange={e=>setSelected(e.target.value)} className="dk-input border dk-border rounded-lg p-2 block w-full">{people.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label><label className="dk-text text-sm">Seçili ismin boyutu · {person.badgeFontSize||layout.fontSize} px<input aria-label="Seçili ismin boyutu" type="range" min="16" max="72" value={person.badgeFontSize||layout.fontSize} onChange={e=>setPeople(prev=>prev.map(v=>v.id===person.id?{...v,badgeFontSize:+e.target.value}:v))} className="w-full block mt-2"/></label></>}
   </div><p className="text-xs dk-text-muted">Uzun isimler seçtiğiniz üst boyutu aşmadan otomatik küçülür. A4 · %100 gerçek boyut · kenar boşluğu yok. Ara sayfa da isim sayfasıyla aynı kesim ölçülerindedir.</p>
   <details open><summary className="dk-text cursor-pointer text-sm">Kart ölçüsünü ayarla</summary><div className="flex flex-wrap gap-3 mt-3">{[['width','Kart genişliği (mm)',70,90],['height','Kart yüksekliği (mm)',40,60],['padding','Sayfa kenar payı (mm)',6,12],['gap','Kart aralığı (mm)',0,5]].map(([k,l,min,max])=><label key={k} className="dk-text text-sm">{l}<input aria-label={l} type="number" min={min} max={max} value={layout[k]} onChange={e=>setLayout(p=>({...p,[k]:e.target.value}))} className="dk-input border dk-border rounded-lg p-2 block w-28"/></label>)}</div></details>
  </section>
  <LayoutFeedback targetRef={layoutRef} onFix={()=>{setLayout(p=>({...p,width:86,height:54}));setRevision(v=>v+1);onNotify('Kart ölçüsü ve yazılar güvenli A4 alanına sığdırıldı.');}}/>
  <div className="preview-heading no-print"><span>3 · Baskı önizlemesi</span><span>A4 dikey · {pages.length} sayfa</span></div>
  <div ref={layoutRef} className="fold-pages overflow-x-auto space-y-6">{pages.map(({items,type,chunk},index)=><section data-page-type={type} data-chunk={chunk} key={index} className="print-page fold-page bg-white mx-auto shadow-lg" style={{'--badge-padding':dims.padding+'mm',padding:dims.padding+'mm',boxSizing:'border-box',height:'296mm',minHeight:'296mm'}}>
    <div style={{display:'flex',flexDirection:'column',gap:dims.gap+'mm',alignItems:'center'}}>{items.map(v=><div className="fold-row" key={v.id} style={{display:'flex',width:dims.unfoldedWidth+'mm',height:dims.height+'mm'}}>{[0,1].map(side=><div data-fit-card data-badge-name={type==='names'?v.name:undefined} key={side} className="badge-face" style={{width:dims.width+'mm',height:dims.height+'mm',borderLeft:side?'0.2mm dashed #64748b':undefined}}><img src={type==='names'?'/nametags/front.png?v=20261021':'/nametags/back.png'} alt=""/>{type==='names'&&<div className="name-zone" style={nameZone}><FitText key={revision} text={v.name} max={v.badgeFontSize||layout.fontSize} min={9}/></div>}</div>)}</div>)}</div>
  </section>)}</div>
 </div>;
}
