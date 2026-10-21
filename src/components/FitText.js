import React,{useRef,useLayoutEffect,useState} from 'react';
export default function FitText({text,max=32,min=8,className='',onIssue}){
 const ref=useRef(null),[size,setSize]=useState(max);
 useLayoutEffect(()=>{
  const el=ref.current;if(!el)return;let dead=false;
  const fit=()=>{if(dead)return;let lo=min,hi=max;el.style.fontSize=lo+'px';
   if(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1){onIssue?.(text);setSize(min);return;}
   for(let i=0;i<9;i++){const mid=(lo+hi)/2;el.style.fontSize=mid+'px';if(el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1)lo=mid;else hi=mid;}
   el.style.fontSize=lo+'px';setSize(lo);
  };
  fit();const observer=new ResizeObserver(fit);observer.observe(el);document.fonts?.ready.then(fit);document.fonts?.addEventListener('loadingdone',fit);window.addEventListener('beforeprint',fit);
  return()=>{dead=true;observer.disconnect();document.fonts?.removeEventListener('loadingdone',fit);window.removeEventListener('beforeprint',fit);};
 },[text,max,min,onIssue]);
 return <div ref={ref} data-fit-text className={className} style={{width:'100%',height:'100%',fontSize:size,lineHeight:1.13,fontWeight:750,whiteSpace:'normal',overflowWrap:'anywhere',overflow:'hidden',textAlign:'center'}}>{text}</div>;
}
