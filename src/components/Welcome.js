import React,{useState} from 'react';
import {Calendar,Users,Image,Package,Sparkles,ArrowRight} from 'lucide-react';
const lines=['Ben Balkız. Kutular otobüste, program bende; gönüllüler de hazırsa başlayalım.','Merhaba kordi! Bugün karmaşayı azaltıp merakı çoğaltıyoruz.','Ben Balkız. Aynı gönüllüyü iki sınıfa ışınlayamıyorum ama çakışmayı yakalıyorum.'];
export default function Welcome({onOpen,children}){
 const [line]=useState(()=>lines[Math.floor(Math.random()*lines.length)]);
 return <main style={{minHeight:'100dvh',background:'#f4f6fb',color:'#15223b',padding:'clamp(20px,5vw,72px)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:'100%',maxWidth:1000}}>
  <div style={{fontSize:14,fontWeight:800,letterSpacing:2,color:'#4f46e5',display:'flex',gap:8,alignItems:'center'}}><Sparkles size={20}/> B.A.L.K.I.Z.</div><h1 style={{fontSize:'clamp(30px,5vw,56px)',fontWeight:800,lineHeight:1.1,margin:'22px 0 16px',letterSpacing:-1.5}}>Hoş geldin, kordi.</h1><p style={{fontSize:'clamp(17px,2vw,22px)',lineHeight:1.5,maxWidth:740,marginBottom:28}}>{line}</p>
  {children}<h2 style={{fontSize:17,fontWeight:700,margin:'28px 0 14px'}}>Neyi hazırlıyoruz?</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14}}>{[
   ['scheduler',Calendar,'Program','Sunum, etkinlikler ve dengeli ekip dağılımı.'],['badges',Users,'İsimlik','Yan yana çift isim; kes, katla, kartlığa koy.'],['collage',Image,'Ekip kolajı','Hüseyin Hoca başta, eşit alanlarda tüm ekip.'],['minutes',Package,'Tikçi Listesi','Depoda mı, indi mi, bindi mi? Gün sayısı sana bağlı.']
  ].map(([id,Icon,title,text])=><button key={id} onClick={()=>onOpen(id)} style={{textAlign:'left',background:'white',border:'1px solid #e0e6f0',borderRadius:20,padding:24,boxShadow:'0 3px 12px #16234206',cursor:'pointer',color:'#15223b'}}><Icon size={25} color="#4f46e5"/><h3 style={{fontSize:20,fontWeight:750,margin:'18px 0 8px'}}>{title}</h3><p style={{fontSize:14,lineHeight:1.5,color:'#526078',minHeight:44}}>{text}</p><ArrowRight size={18} style={{marginTop:14}}/></button>)}</div>
  <p style={{fontSize:12,color:'#66758e',marginTop:24}}>Hazır karşılama; bekleme yok. Önceki kayıtların saklı, her şeye buradan geri dönebilirsin.</p>
 </div></main>;
}
