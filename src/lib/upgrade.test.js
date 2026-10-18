import {db,DB_KEYS} from './db';
import {migrateSharedLibrary,sessionKeys,loadSessionState} from './sessions';
import {mergeCatalog,resolveActivity} from './catalog';
import {parseAny,toStatePatch} from './importer';
import {rebuildDay,makeDay} from './templates';
import {applyActions,askBalkiz} from './ai';
beforeEach(()=>db.clearAll());
afterEach(()=>db.clearAll());
test('old split teams consolidate without losing assignments, skills or old backups',()=>{
 db.save('prokordi_sessions_v1',[{id:'legacy',name:'A',date:'2026-10-18'},{id:'b',name:'B',date:'2026-10-18'}]);
 db.save(DB_KEYS.ACTIVITIES,[{id:'a',name:'Origami',boxCount:2}]);db.save(DB_KEYS.VOLUNTEERS,[{id:'v',name:'Berke',capabilities:['a']}]);
 db.save('prokordi_b_activities',[{id:'a2',name:'Origami',boxCount:1}]);db.save('prokordi_b_volunteers',[{id:'v2',name:'Berke',capabilities:['a2']},{id:'w',name:'Ayşe',capabilities:['a2']}]);
 db.save('prokordi_b_classes',[{id:'c',name:'5-H',schedule:{t:{activityId:'a2',leadId:'v2',support:[{id:'w',name:'Ayşe'}],isLocked:true}}}]);
 migrateSharedLibrary();
 expect(db.load(DB_KEYS.VOLUNTEERS,[])).toHaveLength(2);
 expect(db.load('prokordi_b_classes',[])[0].schedule.t).toMatchObject({activityId:'a',leadId:'v',isLocked:true,support:[{id:'w'}]});
 expect(db.load('prokordi_before_shared_library_v8',[])[1].classes[0].schedule.t.activityId).toBe('a2');
 const before=JSON.stringify(db.load(DB_KEYS.VOLUNTEERS,[]));migrateSharedLibrary();expect(JSON.stringify(db.load(DB_KEYS.VOLUNTEERS,[]))).toBe(before);
 expect(sessionKeys('b').ACTIVITIES).toBe(DB_KEYS.ACTIVITIES);
});
test('per-school selection filters the common roster without deleting anyone',()=>{
 db.save(DB_KEYS.VOLUNTEERS,[{id:'a',name:'A'},{id:'b',name:'B'}]);db.save(sessionKeys('school').PARTICIPANTS,['b']);
 expect(loadSessionState('school').volunteers.map(v=>v.id)).toEqual(['b']);expect(db.load(DB_KEYS.VOLUNTEERS,[])).toHaveLength(2);
});
test('catalog separates workshops and presentation; all added boxes start at one with unique stable IDs',()=>{
 const catalog=mergeCatalog([]);expect(catalog.some(a=>/tanıtım/i.test(a.name))).toBe(false);
 expect(catalog.find(a=>a.name==='Pino Mino İlkokul').cat).toBe('science');expect(catalog.find(a=>a.name==='Pino Mino Atölye').cat).toBe('workshop');expect(catalog.find(a=>a.name==='Yapay Zeka Atölyesi').cat).toBe('workshop');
 expect(catalog.every(a=>a.boxCount===1)).toBe(true);expect(new Set(catalog.map(a=>a.id)).size).toBe(catalog.length);
 expect(resolveActivity(catalog,'Yapay zeka').name).toBe('Yapay Zeka Etkinliği');expect(resolveActivity(catalog,'Pinoo Minoo').name).toBe('Pino Mino İlkokul');
});
test('simple name - specialty imports match aliases without making duplicate activities',()=>{
 const activities=mergeCatalog([]);const next=toStatePatch(parseAny('Berke Şimşekler - Yapay zeka\nAyşe - Pino Mino Atölye, Origami'),{activities,volunteers:[]});
 expect(next.volunteers[0].name).toBe('Berke Şimşekler');expect(next.volunteers[0].capabilities).toEqual([resolveActivity(activities,'Yapay zeka').id]);expect(next.volunteers[1].capabilities).toHaveLength(2);expect(next.activities).toHaveLength(activities.length);
});
test('changing the day start preserves assignment IDs and prevents deleting assigned lessons',()=>{
 const previous=makeDay({lessons:3,presentationMinutes:30}),slot=previous.filter(s=>s.type==='lesson')[2],classes=[{schedule:{[slot.id]:{leadId:'a'}}}];
 const next=rebuildDay({lessons:3,presentationMinutes:30,start:'09:00'},previous,classes);expect(next[0].start).toBe('09:00');expect(next.find(s=>s.id===slot.id)).toBeDefined();expect(()=>rebuildDay({lessons:2,presentationMinutes:30},previous,classes)).toThrow(/Atama/);
});
test('AI volunteer skill aliases match the intended event, not its workshop',()=>{
 const activities=mergeCatalog([]);const result=applyActions({activities,volunteers:[],classes:[],timeSlots:[]},[{type:'add_volunteer',name:'Berke',capabilities:['Yapay zeka']}]);expect(result.state.volunteers[0].capabilities).toEqual([resolveActivity(activities,'Yapay zeka').id]);
});
test('automatic feedback uses the planner locally without an API request',async()=>{
 const response=await askBalkiz({text:'programı kontrol et',state:{activities:[],volunteers:[],classes:[],timeSlots:[]}});expect(response.model).toBe('yerel-kontrol');expect(response.actions).toEqual([]);
});
test('Balkız can enable a prepared activity and safely refuses an incomplete one',()=>{
 const state={activities:[{id:'o',name:'Origami',planningReady:false,boxCount:1,allowedGrades:[1,2,3,4]}],volunteers:[],classes:[],timeSlots:[]};
 const enabled=applyActions(state,[{type:'update_activity',name:'Origami',planningReady:true}]);expect(enabled.state.activities[0].planningReady).toBe(true);
 const invalid=applyActions({...state,activities:[{...state.activities[0],allowedGrades:[]}]},[{type:'update_activity',name:'Origami',planningReady:true}]);expect(invalid.state.activities[0].planningReady).toBe(false);expect(invalid.log[0]).toMatch(/uygun sınıf/);
});
test('AI defaults a new activity to one box and keeps workshops distinct',()=>{
 const state={activities:mergeCatalog([]),volunteers:[],classes:[],timeSlots:[]};
 const result=applyActions(state,[{type:'add_activity',name:'Renk Atölyesi',cat:'workshop'}]);expect(result.state.activities.find(a=>a.name==='Renk Atölyesi')).toMatchObject({cat:'workshop',boxCount:1,planningReady:true});
 const intro=applyActions(state,[{type:'add_activity',name:'İLKYAR Tanıtımı'}]);expect(intro.state.activities.some(a=>a.name==='İLKYAR Tanıtımı')).toBe(false);
});
test('badge margin and gap controls always paginate inside the usable A4 height',()=>{
 const {badgeLayout}=require('./printLayout');for(const padding of [6,8,12])for(const gap of [0,2,5])for(const height of [40,54,60]){const l=badgeLayout({padding,gap,height,width:90});expect(l.rows*l.height+(l.rows-1)*l.gap+l.padding*2).toBeLessThanOrEqual(296);expect(l.unfoldedWidth+l.padding*2).toBeLessThanOrEqual(210);}
});
test('a box used by another school is reserved once per classroom, not once per helper',()=>{
 const {sessionReservations}=require('./sessions'),{distribute,calculateConflicts}=require('./engine');
 const activities=[{id:'o',name:'Origami',boxCount:1,allowedGrades:[5],planningReady:true}];const slots=[{id:'t',type:'lesson',start:'08:00',end:'08:40'}];const old={activities,timeSlots:slots,volunteers:[{id:'v',name:'Ayşe'},{id:'h',name:'Deniz'}],classes:[{id:'old',name:'5-A',schedule:{t:{activityId:'o',leadId:'v',support:['h']}}}]};
 const sessions=[{id:'a',date:'2026-10-18'},{id:'b',date:'2026-10-18'}];const reservations=sessionReservations('b',sessions,()=>old);expect(reservations.filter(r=>r.resource==='box')).toHaveLength(1);
 const state={activities,timeSlots:slots,volunteers:[{id:'new',name:'Berke',capabilities:['o']}],classes:[{id:'c',name:'5-H',schedule:{}}],reservations};expect(distribute(state)[0].schedule.t).toBeUndefined();expect(calculateConflicts({...state,classes:[{id:'c',name:'5-H',schedule:{t:{activityId:'o',leadId:'new'}}}]}).some(w=>w.type==='stock')).toBe(true);
});
