import React,{useEffect,useState} from 'react';

export default function LayoutFeedback({targetRef,onFix}){
 const [issues,setIssues]=useState([]);
 useEffect(()=>{
   const root=targetRef.current;if(!root)return;
   let frame;
   const inspect=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
     const found=[];
     root.querySelectorAll('[data-fit-text]').forEach(el=>{
       const box=el.closest('[data-fit-card]'),r=el.getBoundingClientRect(),b=box?.getBoundingClientRect();
       if(!r.width||!r.height)return;
       if(el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2||(b&&(r.left<b.left-2||r.right>b.right+2||r.top<b.top-2||r.bottom>b.bottom+2)))found.push((el.value||el.textContent||'Yazı').trim().slice(0,70));
     });
     root.querySelectorAll('img').forEach(img=>{if(img.complete&&!img.naturalWidth)found.push('Bir görsel yüklenemedi.');});
     setIssues([...new Set(found)]);
   });};
   const observer=new MutationObserver(inspect);observer.observe(root,{subtree:true,childList:true,attributes:true,characterData:true});
   const resize=new ResizeObserver(inspect);resize.observe(root);
   root.addEventListener('input',inspect,true);root.addEventListener('load',inspect,true);root.addEventListener('error',inspect,true);
   document.fonts?.ready.then(inspect);inspect();
   return()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();root.removeEventListener('input',inspect,true);root.removeEventListener('load',inspect,true);root.removeEventListener('error',inspect,true);};
 },[targetRef]);
 return <div className="no-print dk-card dk-border border rounded-xl p-4 space-y-2"><h3 className="font-700 dk-text">Balkız · Sayfa kontrolü</h3><p role="status" className="text-sm dk-text">{issues.length?`${issues.length} taşma / görsel sorunu bulundu.`:'Görünen yazılarda taşma tespit edilmedi.'}</p>{issues.map((text,i)=><p key={i} className="text-sm text-amber-700">{text}</p>)}<button className="bg-indigo-600 text-white p-2 rounded-lg text-sm font-700" onClick={onFix}>Balkız ile yazıları sığdır</button><p className="text-xs dk-text-muted">Önizlemedeki ölçüler kontrol edilir. Son düzeni baskı önizlemesinde de görebilirsiniz.</p></div>;
}
