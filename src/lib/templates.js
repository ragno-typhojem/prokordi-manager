import { uid, addMin, validateTimeSlots, toMin } from './util';

export function makeDay({start='08:00',lessons=6,duration=40,breakMinutes=10,lunchMinutes=60,lunchAfter=3,presentationMinutes=0,presentationTitle='İLKYAR açılış sunumu'}={}) {
  const count=Number(lessons),d=Number(duration),b=Number(breakMinutes),l=Number(lunchMinutes),after=Number(lunchAfter),intro=Number(presentationMinutes);
  if(!Number.isInteger(count)||count<1||count>16||!Number.isInteger(d)||d<1||![b,l].every(x=>Number.isInteger(x)&&x>=0))throw new Error('1–16 etkinlik, pozitif ders süresi ve geçerli ara süreleri girin.');
  if(!Number.isInteger(intro)||intro<0||intro>180)throw new Error('Sunum süresi 0–180 dakika arasında olmalı.');
  if(!Number.isInteger(after)||after<0||after>16)throw new Error('Yemek konumunu etkinlik sayısı içinde seçin.');
  const slots=[];let cursor=start;
  const append=(minutes,type)=>{const end=addMin(cursor,minutes);if(!end)throw new Error('Şablon aynı günün saatlerini aşıyor.');slots.push({id:uid(),start:cursor,end,type});cursor=end;};
  if(intro>0){append(intro,'presentation');slots[0].title=presentationTitle;slots[0].audience='all';if(b>0)append(b,'break');}
  for(let i=1;i<=count;i++){append(d,'lesson');if(i<count){if(i===after&&l>0)append(l,'lunch');else if(b>0)append(b,'break');}}
  const errors=validateTimeSlots(slots);if(errors.length)throw new Error(errors.join(' '));return slots;
}

export function prependPresentation(slots,{minutes=30,transition=10}={}){
 if(!slots.length)throw new Error('Önce günü hazırlayın.');
 if(slots.some(s=>s.type==='presentation'))throw new Error('Bu çizelgede zaten sunum var; mevcut satırı düzenleyin.');
 if(!Number.isInteger(+minutes)||+minutes<1||!Number.isInteger(+transition)||+transition<0)throw new Error('Sunum ve geçiş sürelerini kontrol edin.');
 const sorted=[...slots].sort((a,b)=>toMin(a.start)-toMin(b.start)),first=sorted[0].start,end=addMin(first,+minutes);
 const shifted=sorted.map(s=>({...s,start:addMin(s.start,+minutes + +transition),end:addMin(s.end,+minutes + +transition)}));
 const result=[{id:uid(),start:first,end,type:'presentation',title:'İLKYAR açılış sunumu',audience:'all'},...(+transition?[{id:uid(),start:end,end:addMin(end,+transition),type:'break'}]:[]),...shifted];
 const issues=validateTimeSlots(result);if(issues.length)throw new Error(issues.join(' '));return result;
}

export function rebuildDay(options,previous=[],classes=[]){
 const next=makeDay(options),used=new Set();
 const mapped=next.map(slot=>{const old=previous.find(s=>s.type===slot.type&&!used.has(s.id));if(old){used.add(old.id);return {...slot,id:old.id,...(slot.type==='presentation'?{title:old.title||slot.title}: {})};}return slot;});
 for(const old of previous)if(!used.has(old.id)&&classes.some(c=>c.schedule?.[old.id]))throw new Error('Atama bulunan bir saat kaldırılacak. Etkinlik sayısını koruyun veya önce ilgili atamaları kaldırın.');
 return mapped;
}
