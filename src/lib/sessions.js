import {mergeCatalog,matchName} from './catalog';
import {db,DB_KEYS} from './db';
import {uid,norm,toMin} from './util';
const SESSION_KEY='prokordi_sessions_v1';
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export const loadSessions=()=>db.load(SESSION_KEY,[{id:'legacy',name:'Ana program',date:today()}]);
export const saveSessions=list=>db.save(SESSION_KEY,list,0);
export function sessionKeys(id='legacy'){
 const scoped=key=>id==='legacy'?DB_KEYS[key]:`prokordi_${id}_${key.toLowerCase()}`;
 return {...DB_KEYS,PARTICIPANTS:`prokordi_${id}_participants`,...Object.fromEntries(['TIMESLOTS','CLASSES','CHAT_HISTORY'].map(k=>[k,scoped(k)]))};
}
export const loadSessionState=id=>{const k=sessionKeys(id);const members=db.load(k.PARTICIPANTS,null);return {activities:db.load(k.ACTIVITIES,[]),volunteers:db.load(k.VOLUNTEERS,[]).filter(v=>!members||members.includes(v.id)),timeSlots:db.load(k.TIMESLOTS,[]),classes:db.load(k.CLASSES,[])};};
export function addSession(name,date){
 const entry={id:uid(),name:String(name).trim()||'Yeni program',date:date||today()};saveSessions([...loadSessions(),entry]);return entry;
}
export function syncSessionRoster(id,source){
 const keys=sessionKeys(id),old=db.load(keys.NAMETAG_VOLUNTEERS,[]),previous=db.load(keys.VOLUNTEERS,[]);
 source=source.map(v=>({...v,capabilities:Array.isArray(v.capabilities)?v.capabilities:(previous.find(p=>p.id===v.id)?.capabilities||[])}));
 db.save(keys.VOLUNTEERS,source);
 db.save(keys.NAMETAG_VOLUNTEERS,source.map(v=>({...old.find(p=>p.id===v.id),...v})));
 const global=db.load(DB_KEYS.COLLAGE_VOLUNTEERS,[]);
 const result=global.map(v=>({...v}));
 for(const person of source){const index=result.findIndex(v=>v.id===person.id||norm(v.name)===norm(person.name));if(index>=0)result[index]={...result[index],name:person.name};else result.push({id:person.id,name:person.name});}
 db.save(DB_KEYS.COLLAGE_VOLUNTEERS,result);return source;
}
const ids=cell=>[cell?.leadId,...(cell?.support||[]).map(v=>typeof v==='string'?v:v.id)].filter(Boolean);
const assignments=s=>s.timeSlots.filter(t=>t.type==='lesson'||t.type==='presentation').flatMap(t=>t.type==='presentation'?s.volunteers.map(v=>({name:v.name,start:t.start,end:t.end})):s.classes.flatMap(c=>{const cell=c.schedule?.[t.id];if(!cell||cell.activityId==='NO_CLASS')return [];const box={resource:'box',activityId:cell.activityId,activityName:s.activities.find(a=>a.id===cell.activityId)?.name||cell.name,start:t.start,end:t.end};return [...ids(cell).map(vid=>({name:s.volunteers.find(v=>v.id===vid)?.name,start:t.start,end:t.end})).filter(x=>x.name),box];}));
export function sessionReservations(id,sessions=loadSessions(),getState=loadSessionState){
 const own=sessions.find(s=>s.id===id);if(!own)return [];
 return sessions.filter(s=>s.id!==id&&s.date===own.date).flatMap(session=>assignments(getState(session.id)).map(a=>({...a,sessionName:session.name})));
}
export function crossSessionConflicts(id,state,sessions=loadSessions(),getState=loadSessionState){
 const own=sessions.find(s=>s.id===id),out=[];if(!own)return out;
 for(const a of assignments(state))for(const b of sessionReservations(id,sessions,getState))if(a.name&&b.name&&norm(a.name)===norm(b.name)&&toMin(a.start)<toMin(b.end)&&toMin(b.start)<toMin(a.end))out.push(`${a.name}: ${own.name} (${a.start}–${a.end}) ile ${b.sessionName} (${b.start}–${b.end}) aynı gün çakışıyor.`);
 return [...new Set(out)];
}

// Preserve a complete snapshot before consolidating the former team libraries.
export function migrateSharedLibrary(){
 if(db.load('prokordi_shared_library_v8',false))return;
 const sessions=loadSessions(),allActivities=[],allVolunteers=[],snapshots=[];
 for(const entry of sessions){
  const oldKey=key=>entry.id==='legacy'?DB_KEYS[key]:`prokordi_${entry.id}_${key.toLowerCase()}`;
  const activities=db.load(oldKey('ACTIVITIES'),[]),volunteers=db.load(oldKey('VOLUNTEERS'),[]),badges=db.load(oldKey('NAMETAG_VOLUNTEERS'),[]),classes=db.load(oldKey('CLASSES'),[]);
  snapshots.push({entry,activities,volunteers,badges,classes});
  const am=new Map(),vm=new Map();
  for(const a of activities){let target=allActivities.find(x=>matchName(x.name)===matchName(a.name));if(!target){target={...a,id:allActivities.some(x=>x.id===a.id)?uid():a.id};allActivities.push(target);}else{target.boxCount=Math.max(Number(target.boxCount)||0,Number(a.boxCount)||0);target.allowedGrades=[...new Set([...(target.allowedGrades||[]),...(a.allowedGrades||[])])];target.isMust=!!(target.isMust||a.isMust);}am.set(a.id,target.id);}
  for(const v of [...volunteers,...badges]){let target=allVolunteers.find(x=>norm(x.name)===norm(v.name));const capabilities=(v.capabilities||[]).map(id=>am.get(id)||id);if(!target){target={...v,id:allVolunteers.some(x=>x.id===v.id)?uid():v.id,capabilities};allVolunteers.push(target);}else{for(const [key,value] of Object.entries(v))if(target[key]==null)target[key]=value;target.capabilities=[...new Set([...target.capabilities,...capabilities])];}vm.set(v.id,target.id);}
  const mapped=classes.map(c=>({...c,schedule:Object.fromEntries(Object.entries(c.schedule||{}).map(([sid,cell])=>[sid,{...cell,activityId:am.get(cell.activityId)||cell.activityId,leadId:vm.get(cell.leadId)||cell.leadId,support:(cell.support||[]).map(v=>typeof v==='string'?(vm.get(v)||v):{...v,id:vm.get(v.id)||v.id})}]))}));
  db.save(oldKey('CLASSES'),mapped,0);
  // An old split team's membership remains part of its program, not a separate roster.
  if(volunteers.length)db.save(sessionKeys(entry.id).PARTICIPANTS,[...new Set(volunteers.map(v=>vm.get(v.id)||v.id))],0);
 }
 db.save('prokordi_before_shared_library_v8',snapshots,0);
 const library=mergeCatalog(allActivities).map(a=>({...a,boxCount:a.cat==='presentation'?a.boxCount:Math.max(1,Number(a.boxCount)||1)}));
 db.save(DB_KEYS.ACTIVITIES,library,0);db.save(DB_KEYS.VOLUNTEERS,allVolunteers,0);db.save(DB_KEYS.NAMETAG_VOLUNTEERS,allVolunteers,0);
 syncSessionRoster('legacy',allVolunteers);
 db.save('prokordi_shared_library_v8',true,0);db.flush();
}
