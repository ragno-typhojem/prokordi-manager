import {norm} from './util';
export const PROFESSOR={id:'ilkyar-prof-huseyin-vural',name:'Prof. Dr. Hüseyin Vural',pinned:true};
export const isProfessor=v=>/huseyin.*vural/.test(norm(v.name));
export function pinProfessor(list=[]){
 const matches=list.filter(isProfessor),best=matches.find(v=>v.photo)||matches[0]||{};
 return [{...PROFESSOR,...best,id:PROFESSOR.id,name:PROFESSOR.name,pinned:true},...list.filter(v=>!isProfessor(v)&&v.id!==PROFESSOR.id).map(v=>({...v,pinned:false}))];
}
export function badgeLayout({width=86,height=54,padding=8,gap=2}={}){
 const w=Math.min(90,Math.max(70,Number(width)||86)),h=Math.min(60,Math.max(40,Number(height)||54));
 padding=Math.min(12,Math.max(6,Number(padding)||8));gap=Math.min(5,Math.max(0,Number(gap)||0));
 const rows=Math.floor((296-2*padding+gap)/(h+gap));
 return {width:w,height:h,padding,gap,rows,unfoldedWidth:w*2};
}
export const paginate=(items,count)=>Array.from({length:Math.ceil(items.length/count)},(_,i)=>items.slice(i*count,(i+1)*count));
export function collageLayout(count){
 const cols=count<=2?2:count<=6?2:3,rows=Math.max(1,Math.ceil(count/cols));
 // Header/footer areas and all internal gaps are reserved explicitly, in millimetres.
 const innerHeight=273,header=22,footer=22,gap=4;
 return {cols,rows,header,footer,gap,cellHeight:(innerHeight-header-footer-(rows-1)*gap)/rows};
}
