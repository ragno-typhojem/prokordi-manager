import { uid, addMin, validateTimeSlots } from './util';

export function makeDay({start='08:00',lessons=6,duration=40,breakMinutes=10,lunchMinutes=60,lunchAfter=3}={}) {
  const count=Number(lessons),d=Number(duration),b=Number(breakMinutes),l=Number(lunchMinutes),after=Number(lunchAfter);
  if(!Number.isInteger(count)||count<1||count>16||!Number.isInteger(d)||d<1||![b,l].every(x=>Number.isInteger(x)&&x>=0))throw new Error('1–16 etkinlik, pozitif ders süresi ve geçerli ara süreleri girin.');
  const slots=[];let cursor=start;
  const append=(minutes,type)=>{const end=addMin(cursor,minutes);if(!end)throw new Error('Şablon aynı günün saatlerini aşıyor.');slots.push({id:uid(),start:cursor,end,type});cursor=end;};
  for(let i=1;i<=count;i++){append(d,'lesson');if(i<count){if(i===after&&l>0)append(l,'lunch');else if(b>0)append(b,'break');}}
  const errors=validateTimeSlots(slots);if(errors.length)throw new Error(errors.join(' '));return slots;
}
