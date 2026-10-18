import { norm, detectGrade, validateTimeSlots, toMin } from './util';

export const allowed = (act, grade) => !!act && act.planningReady !== false &&
  (act.planningReady===true ? !!act.allowedGrades?.length&&act.allowedGrades.includes(grade) : (!act.allowedGrades?.length || act.allowedGrades.includes(grade)));
const reserved=(vol,slot,reservations=[])=>reservations.some(r=>norm(r.name)===norm(vol.name)&&toMin(r.start)<toMin(slot.end)&&toMin(slot.start)<toMin(r.end));
export const score = (act) => act.isMust ? 1000 : 50;
const people = cell => [...new Set([cell?.leadId, ...(cell?.support || []).map(v=>typeof v==='string'?v:v.id)].filter(id=>id && id!=='none'))];
const overlaps=(a,b)=>toMin(a.start)<toMin(b.end)&&toMin(b.start)<toMin(a.end);
const reservedBoxes=(act,slot,reservations=[])=>reservations.filter(r=>r.resource==='box'&&(r.activityId===act.id||norm(r.activityName)===norm(act.name))&&overlaps(r,slot)).length;
const capacity = act => Number.isFinite(Number(act.boxCount)) ? Math.max(0,Number(act.boxCount)) : 0;

export function workload({ volunteers=[], classes=[], timeSlots=[] }) {
  return volunteers.map(v=>{
    let lead=0, support=0, minutes=0; const acts=new Set();
    for(const slot of timeSlots.filter(s=>s.type==='lesson')) for(const c of classes){
      const cell=c.schedule?.[slot.id];
      if(!cell || !people(cell).includes(v.id) || cell.activityId==='NO_CLASS') continue;
      if(cell.leadId===v.id) lead++; else support++;
      minutes+=Math.max(0,toMin(slot.end)-toMin(slot.start)); acts.add(cell.activityId);
    }
    return {...v,lead,support,total:lead+support,minutes,variety:acts.size};
  });
}

export function calculateConflicts(state) {
  const {activities=[],volunteers=[],timeSlots=[],classes=[]}=state;
  const out=validateTimeSlots(timeSlots).map(msg=>({type:'time',msg}));
  const names=new Set();for(const v of volunteers){const key=norm(v.name);if(!key||names.has(key))out.push({type:'duplicate_person',msg:`${v.name||'İsimsiz kayıt'}: gönüllü adını benzersiz ve tam yazın; aynı kişi iki kez kaydedilmiş olabilir.`});names.add(key);}
  const A=new Map(activities.map(a=>[a.id,a])), V=new Map(volunteers.map(v=>[v.id,v]));
  const lessons=timeSlots.filter(s=>s.type==='lesson').sort((a,b)=>toMin(a.start)-toMin(b.start));
  for(const c of classes){
    for(const [sid,cell] of Object.entries(c.schedule||{})){const slot=timeSlots.find(s=>s.id===sid);if(!slot)out.push({type:'orphan',classId:c.id,msg:`${c.name}: saat çizelgesinde olmayan eski bir atama var; düzenlemeden önce kontrol edin.`});else if(slot.type!=='lesson'&&cell?.activityId&&cell.activityId!=='NO_CLASS')out.push({type:'nonlesson_assignment',classId:c.id,slotId:sid,msg:`${c.name} ${slot.start}: sunum veya araya etkinlik atanmış.`});}
    const seen=new Set();
    for(const slot of lessons){
      const cell=c.schedule?.[slot.id]; const at={classId:c.id,slotId:slot.id};
      if(!cell?.activityId){out.push({...at,type:'empty',msg:`${c.name} ${slot.start}: etkinlik boş. Uygun etkinlik, yetkin gönüllü ve kutu sayısını kontrol edin.`});continue;}
      if(cell.activityId==='NO_CLASS')continue;
      const act=A.get(cell.activityId);
      if(!act)out.push({...at,type:'missing_activity',msg:`${c.name} ${slot.start}: etkinlik havuzda bulunamadı.`});
      else {
        if(!allowed(act,detectGrade(c.name)))out.push({...at,type:'protocol',msg:`${c.name} ${slot.start}: ${act.name} düzeyi veya hazırlığı uygun değil.`});
        if(seen.has(act.id))out.push({...at,type:'duplicate_act',msg:`${c.name}: ${act.name} tekrar ediyor; çeşitlilik için yeni yetkinlik veya etkinlik ekleyin.`});
        seen.add(act.id);
      }
      if(!V.has(cell.leadId))out.push({...at,type:'missing_lead',msg:`${c.name} ${slot.start}: sorumlu gönüllü eksik.`});
      for(const id of people(cell)){
        const v=V.get(id);
        if(!v)out.push({...at,type:'missing_volunteer',msg:`${c.name} ${slot.start}: kayıtlı olmayan yardımcı gönüllü.`});
        else if(act && !(v.capabilities||[]).includes(act.id))out.push({...at,type:'competency',msg:`${v.name}: ${act.name} yetkinliği doğrulanmamış (${slot.start}).`});
      }
    }
    for(const act of activities.filter(a=>a.isMust && allowed(a,detectGrade(c.name)) && lessons.some(slot=>c.schedule?.[slot.id]?.activityId!=='NO_CLASS'))){
      if(!seen.has(act.id))out.push({type:'must',classId:c.id,msg:`${c.name}: koordinatörün zorunlu işaretlediği ${act.name} henüz planlanmadı.`});
    }
  }
  for(const slot of lessons){
    const busy=new Map(), stock=new Map();
    for(const c of classes){
      const cell=c.schedule?.[slot.id]; if(!cell || cell.activityId==='NO_CLASS')continue;
      for(const id of people(cell)){
        const identity=norm(V.get(id)?.name)||id;
        if(busy.has(identity))out.push({type:'conflict',classId:c.id,slotId:slot.id,msg:`${V.get(id)?.name||id} ${slot.start}: ${busy.get(identity)} ve ${c.name} sınıflarında çakışıyor.`});
        busy.set(identity,c.name);
      }
      const n=(stock.get(cell.activityId)||0)+1;stock.set(cell.activityId,n);
      const a=A.get(cell.activityId);
      if(a && n+reservedBoxes(a,slot,state.reservations)>capacity(a))out.push({type:'stock',classId:c.id,slotId:slot.id,msg:`${a.name} ${slot.start}: ${n} sınıf ve diğer okullarda ${reservedBoxes(a,slot,state.reservations)} kullanım için ${capacity(a)} kutu var.`});
    }
    for(const v of volunteers) if(!busy.has(norm(v.name)||v.id))out.push({type:'idle_slot',slotId:slot.id,msg:`${v.name} ${slot.start}: görev yok; yetkinliği uygun bir gruba yardımcı atanabilir.`});
  }
  const load=workload(state), max=Math.max(0,...load.map(v=>v.total)),min=Math.min(max,...load.map(v=>v.total));
  const leaderMax=Math.max(0,...load.map(v=>v.lead)),leaderMin=Math.min(leaderMax,...load.map(v=>v.lead));
  if(leaderMax-leaderMin>1)out.push({type:'lead_balance',msg:`Sorumlu görevleri ${leaderMin}–${leaderMax} arasında; yardımcı atamaları bu farkı kapatmaz.`});
  if(max-min>1)out.push({type:'balance',msg:`Gönüllü görevleri ${min}–${max} arasında. Yetkinlikler, kutular veya kilitli atamalar eşit dağılımı sınırlıyor.`});
  return out;
}

export function planSummary(state) {
  const slots=state.timeSlots.filter(s=>s.type==='lesson').sort((a,b)=>toMin(a.start)-toMin(b.start));
  let open=0,filled=0;
  for(const c of state.classes)for(const s of slots){const cell=c.schedule?.[s.id];if(cell?.activityId==='NO_CLASS')continue;open++;if(cell?.activityId && state.volunteers.some(v=>v.id===cell.leadId))filled++;}
  const w=calculateConflicts(state), loads=workload(state);
  const issues=w.filter(x=>!['idle_slot','balance','lead_balance','duplicate_act'].includes(x.type));
  return `${filled}/${open} sınıf-saati sorumlu gönüllüyle dolu. ${issues.length} eksik/çakışma, ${w.filter(x=>x.type==='duplicate_act').length} etkinlik tekrarı. Görevsiz gönüllü: ${loads.filter(v=>!v.total).map(v=>v.name).join(', ')||'yok'}.`;
}

// Bounded search per time slot; multiple whole-day attempts optimize coverage first,
// then coordinator must selections, diversity, and volunteer lead workload.
export function distribute(state,opts={}) {
  const {activities=[],volunteers=[],timeSlots=[],classes=[]}=state;
  if(validateTimeSlots(timeSlots).length||new Set(volunteers.map(v=>norm(v.name))).size!==volunteers.length||volunteers.some(v=>!norm(v.name))) return classes;
  const lessons=timeSlots.filter(s=>s.type==='lesson').sort((a,b)=>toMin(a.start)-toMin(b.start));
  if(!lessons.length||!classes.length||!activities.length||!volunteers.length)return classes;
  const reservations=opts.reservations||state.reservations||[];
  let winner=null,bestQuality=-Infinity;
  const passes=Math.min(16,Math.max(1,opts.passes||10));
  for(let pass=0;pass<passes;pass++){
    const result=classes.map(c=>({...c,schedule:Object.fromEntries(Object.entries(c.schedule||{}).filter(([sid,v])=>v&&(v.isLocked||v.activityId==='NO_CLASS'||!lessons.some(s=>s.id===sid)||(opts.onlyEmpty&&v.activityId))))}));
    const counts=new Map(volunteers.map(v=>[v.id,0])), used=new Map(result.map(c=>[c.id,new Set()])), actLoad=new Map();
    // Reserve all fixed assignments, including future slots and helpers.
    for(const c of result)for(const [sid,cell] of Object.entries(c.schedule)){
      if(!lessons.some(s=>s.id===sid)||cell.activityId==='NO_CLASS')continue;
      used.get(c.id).add(cell.activityId);
      for(const id of people(cell))if(cell.leadId===id)counts.set(id,(counts.get(id)||0)+1);
    }
    for(const slot of lessons){
      const busy=new Set(), stock=new Map();
      for(const c of result){const cell=c.schedule[slot.id];if(!cell||cell.activityId==='NO_CLASS')continue;people(cell).forEach(v=>busy.add(v));stock.set(cell.activityId,(stock.get(cell.activityId)||0)+1);}
      if(opts.onlyEmpty)for(const c of result){
        const cell=c.schedule[slot.id],act=activities.find(a=>a.id===cell?.activityId);
        if(!cell||cell.isLocked||!act||!allowed(act,detectGrade(c.name))||volunteers.some(v=>v.id===cell.leadId))continue;
        const lead=volunteers.filter(v=>!busy.has(v.id)&&!reserved(v,slot,reservations)&&(v.capabilities||[]).includes(act.id)).sort((a,b)=>(counts.get(a.id)||0)-(counts.get(b.id)||0))[0];
        if(lead){c.schedule[slot.id]={...cell,leadId:lead.id,lead:lead.name};busy.add(lead.id);counts.set(lead.id,(counts.get(lead.id)||0)+1);}
      }
      const pending=result.filter(c=>!c.schedule[slot.id]);
      const candidates=c=>{
        const pairs=[];
        for(const a of activities){
          if(!allowed(a,detectGrade(c.name))||(stock.get(a.id)||0)+reservedBoxes(a,slot,reservations)>=capacity(a))continue;
          for(const v of volunteers){
            if(busy.has(v.id)||reserved(v,slot,reservations)||!(v.capabilities||[]).includes(a.id))continue;
            const repeated=used.get(c.id).has(a.id);
            if(opts.allowRepeats===false&&repeated)continue;
            pairs.push({a,v,cost:(counts.get(v.id)||0)*15+(repeated?250:0)+(actLoad.get(a.id)||0)*4-(a.isMust&&!repeated?400:0),tie:(activities.indexOf(a)+volunteers.indexOf(v)+pass)%Math.max(1,activities.length)});
          }
        }
        return pairs.sort((a,b)=>a.cost-b.cost||a.tie-b.tie);
      };
      pending.sort((a,b)=>candidates(a).length-candidates(b).length||((result.indexOf(a)+pass)%result.length)-((result.indexOf(b)+pass)%result.length));
      let best=[],bestCount=-1,bestCost=Infinity,nodes=0;
      const visit=(i,placed,cost)=>{
        if(placed.length>bestCount){best=placed.slice();bestCount=placed.length;bestCost=Infinity;}
        if(++nodes>2500)return;
        if(placed.length+pending.length-i<bestCount)return;
        if(i===pending.length){const fixed=result.map(c=>c.schedule[slot.id]).filter(Boolean);const supported=volunteers.filter(v=>busy.has(v.id)||placed.some(p=>(v.capabilities||[]).includes(p.a.id))||fixed.some(cell=>(v.capabilities||[]).includes(cell.activityId))).length;cost+=(volunteers.length-supported)*2000;if(placed.length>bestCount||(placed.length===bestCount&&cost<bestCost)){best=placed.slice();bestCount=placed.length;bestCost=cost;}return;}
        const c=pending[i];
        for(const pair of candidates(c)){
          busy.add(pair.v.id);stock.set(pair.a.id,(stock.get(pair.a.id)||0)+1);
          visit(i+1,[...placed,{c,...pair}],cost+pair.cost);
          busy.delete(pair.v.id);stock.set(pair.a.id,stock.get(pair.a.id)-1);
          if(nodes>2500)break;
        }
        visit(i+1,placed,cost);
      };
      visit(0,[],0);
      for(const {c,a,v} of best){c.schedule[slot.id]={activityId:a.id,name:a.name,cat:a.cat||'science',isMust:!!a.isMust,lead:v.name,leadId:v.id,support:[]};counts.set(v.id,(counts.get(v.id)||0)+1);used.get(c.id).add(a.id);actLoad.set(a.id,(actLoad.get(a.id)||0)+1);}
    }
    // Give idle qualified volunteers a helper role; never invent a capability.
    for(const slot of lessons){
      const busy=new Set(result.flatMap(c=>people(c.schedule[slot.id])));
      for(const v of volunteers.filter(v=>!busy.has(v.id)&&!reserved(v,slot,reservations))){
        const target=result.filter(c=>{const cell=c.schedule[slot.id];return cell&&!cell.isLocked&&!(opts.onlyEmpty&&classes.find(old=>old.id===c.id)?.schedule?.[slot.id])&&cell.activityId!=='NO_CLASS'&&(v.capabilities||[]).includes(cell.activityId);}).sort((a,b)=>(a.schedule[slot.id].support?.length||0)-(b.schedule[slot.id].support?.length||0))[0];
        if(target){const cell=target.schedule[slot.id];target.schedule[slot.id]={...cell,support:[...(cell.support||[]),v.id]};busy.add(v.id);}
      }
    }
    const next={...state,classes:result}; const warnings=calculateConflicts(next), loads=workload(next);
    const filled=result.reduce((n,c)=>n+lessons.filter(s=>c.schedule[s.id]?.activityId).length,0);
    const q=filled*100000-warnings.filter(w=>w.type==='must').length*10000-warnings.filter(w=>w.type==='duplicate_act').length*1000-warnings.filter(w=>w.type==='idle_slot').length*3000-loads.reduce((n,v)=>n+v.lead*v.lead,0)*20+loads.reduce((n,v)=>n+v.variety,0);
    if(q>bestQuality){winner=result;bestQuality=q;}
  }
  return winner||classes;
}
