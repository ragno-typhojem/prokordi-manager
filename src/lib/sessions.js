import {db,DB_KEYS} from './db';
import {uid,norm,toMin} from './util';
const SESSION_KEY='prokordi_sessions_v1';
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export const loadSessions=()=>db.load(SESSION_KEY,[{id:'legacy',name:'Ana ekip',date:today()}]);
export const saveSessions=list=>db.save(SESSION_KEY,list,0);
export function sessionKeys(id='legacy'){
 const scoped=key=>id==='legacy'?DB_KEYS[key]:`prokordi_${id}_${key.toLowerCase()}`;
 return {...DB_KEYS,...Object.fromEntries(['ACTIVITIES','VOLUNTEERS','TIMESLOTS','CLASSES','NAMETAG_VOLUNTEERS','CHAT_HISTORY'].map(k=>[k,scoped(k)]))};
}
export const loadSessionState=id=>{const k=sessionKeys(id);return {activities:db.load(k.ACTIVITIES,[]),volunteers:db.load(k.VOLUNTEERS,[]),timeSlots:db.load(k.TIMESLOTS,[]),classes:db.load(k.CLASSES,[])};};
export function addSession(name,date){
 const entry={id:uid(),name:String(name).trim()||'Yeni ekip',date:date||today()};saveSessions([...loadSessions(),entry]);return entry;
}
export function syncSessionRoster(id,source){
 const keys=sessionKeys(id),old=db.load(keys.NAMETAG_VOLUNTEERS,[]),previous=db.load(keys.VOLUNTEERS,[]);
 source=source.map(v=>({...v,capabilities:Array.isArray(v.capabilities)?v.capabilities:(previous.find(p=>p.id===v.id)?.capabilities||[])}));
 db.save(keys.VOLUNTEERS,source);
 db.save(keys.NAMETAG_VOLUNTEERS,source.map(v=>({...old.find(p=>p.id===v.id),...v})));
 const global=db.load(DB_KEYS.COLLAGE_VOLUNTEERS,[]);
 const result=global.map(v=>({...v}));
 for(const person of source){const index=result.findIndex(v=>v.id===person.id||norm(v.name)===norm(person.name));if(index>=0)result[index]={...result[index],name:person.name,sourceSession:id};else result.push({id:person.id,name:person.name,sourceSession:id});}
 db.save(DB_KEYS.COLLAGE_VOLUNTEERS,result);return source;
}
const ids=cell=>[cell?.leadId,...(cell?.support||[]).map(v=>typeof v==='string'?v:v.id)].filter(Boolean);
const assignments=s=>s.timeSlots.filter(t=>t.type==='lesson'||t.type==='presentation').flatMap(t=>t.type==='presentation'?s.volunteers.map(v=>({name:v.name,start:t.start,end:t.end})):s.classes.flatMap(c=>{const cell=c.schedule?.[t.id];return ids(cell).map(vid=>({name:s.volunteers.find(v=>v.id===vid)?.name,start:t.start,end:t.end})).filter(x=>x.name);}));
export function sessionReservations(id,sessions=loadSessions(),getState=loadSessionState){
 const own=sessions.find(s=>s.id===id);if(!own)return [];
 return sessions.filter(s=>s.id!==id&&s.date===own.date).flatMap(session=>assignments(getState(session.id)).map(a=>({...a,sessionName:session.name})));
}
export function crossSessionConflicts(id,state,sessions=loadSessions(),getState=loadSessionState){
 const own=sessions.find(s=>s.id===id),out=[];if(!own)return out;
 for(const a of assignments(state))for(const b of sessionReservations(id,sessions,getState))if(norm(a.name)===norm(b.name)&&toMin(a.start)<toMin(b.end)&&toMin(b.start)<toMin(a.end))out.push(`${a.name}: ${own.name} (${a.start}–${a.end}) ile ${b.sessionName} (${b.start}–${b.end}) aynı gün çakışıyor.`);
 return [...new Set(out)];
}
