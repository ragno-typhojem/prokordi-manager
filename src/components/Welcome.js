import React, {useState, useEffect} from 'react';
import {Calendar, Users, Image, Package, Sparkles, ArrowRight, RefreshCw} from 'lucide-react';
import {db} from '../lib/db';
import {WELCOME_LINES, nextWelcome} from '../lib/welcome';

const KEY = 'prokordi_welcome_rotation_v1';
const cards = [
 ['scheduler', Calendar, 'Program', 'Sunum, etkinlikler ve dengeli ekip dağılımı.'],
 ['badges', Users, 'İsimlik', 'Yan yana çift isim; kes, katla, kartlığa koy.'],
 ['collage', Image, 'Ekip kolajı', 'Hüseyin Hoca başta, eşit alanlarda tüm ekip.'],
 ['minutes', Package, 'Tikçi Listesi', 'Depoda mı, indi mi, bindi mi? Gün sayısı sana bağlı.'],
];

export default function Welcome({onOpen, children}) {
 const [greeting, setGreeting] = useState(() => nextWelcome(db.load(KEY, {})));
 useEffect(() => {db.save(KEY, greeting, 0);}, [greeting]);
 return <main style={{minHeight:'100dvh', background:'#f4f6fb', color:'#15223b', padding:'clamp(20px,5vw,72px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
  <style>{`.welcome-card{transition:transform .18s,box-shadow .18s,border-color .18s}.welcome-card:hover{transform:translateY(-3px);box-shadow:0 9px 24px #16234212!important;border-color:#b9b5f8!important}.welcome-card:focus-visible{outline:3px solid #a5b4fc;outline-offset:4px}@media(prefers-reduced-motion:reduce){.welcome-card{transition:none}.welcome-card:hover{transform:none}}`}</style>
  <div style={{width:'100%', maxWidth:1000}}>
   <div style={{fontSize:14, fontWeight:800, letterSpacing:2, color:'#4f46e5', display:'flex', gap:8, alignItems:'center'}}><Sparkles size={20}/> B.A.L.K.I.Z.</div>
   <h1 style={{fontSize:'clamp(30px,5vw,56px)', fontWeight:800, lineHeight:1.1, margin:'22px 0 16px', letterSpacing:-1.5}}>Hoş geldin, kordi.</h1>
   <p aria-live="polite" style={{fontSize:'clamp(17px,2vw,22px)', lineHeight:1.5, maxWidth:740, marginBottom:8}}>{WELCOME_LINES[greeting.index]}</p>
   <button onClick={() => setGreeting(previous => nextWelcome(previous))} style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#6256a8', padding:'6px 0', marginBottom:24}}><RefreshCw size={13}/> Balkız bir şey daha söylesin</button>
   {children}
   <h2 style={{fontSize:17, fontWeight:700, margin:'28px 0 14px'}}>Neyi hazırlıyoruz?</h2>
   <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:14}}>
    {cards.map(([id, Icon, title, description]) => <button key={id} className="welcome-card" onClick={() => onOpen(id)} style={{textAlign:'left', background:'white', border:'1px solid #e0e6f0', borderRadius:20, padding:24, boxShadow:'0 3px 12px #16234206', cursor:'pointer', color:'#15223b'}}>
     <Icon size={25} color="#4f46e5"/><h3 style={{fontSize:20, fontWeight:750, margin:'18px 0 8px'}}>{title}</h3>
     <p style={{fontSize:14, lineHeight:1.5, color:'#526078', minHeight:44}}>{description}</p><ArrowRight size={18} style={{marginTop:14}}/>
    </button>)}
   </div>
   <p style={{fontSize:12, color:'#66758e', marginTop:24}}>Kayıtların bu tarayıcıda saklanır. Bölümler arasında geçiş yapabilir, buradan devam edebilirsin.</p>
  </div>
 </main>;
}
