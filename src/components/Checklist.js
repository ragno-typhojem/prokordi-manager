import React, {useState,useEffect} from 'react';
import {db} from '../lib/db';
import {uid} from '../lib/util';

const defaults=[
  ['Etkinlik kutuları','Kutuların içerikleri ve kodları kontrol edildi'],['Etkinlik kutuları','Origami ve resim kâğıtları'],['Etkinlik kutuları','Robot pilleri ve yedekleri'],['Etkinlik kutuları','Koridor ve dış deney malzemeleri'],
  ['Ses ve görüntü','Ses sistemi, hoparlör ve mikrofon'],['Ses ve görüntü','Şarj adaptörleri ve uzatma kabloları'],['Ses ve görüntü','Projektörler ve güç kabloları'],['Ses ve görüntü','HDMI / VGA / ses bağlantıları'],['Ses ve görüntü','Bilgisayar / tablet ve şarj cihazları'],
  ['Belgeler','Güncel program ve görev dağılımı çıktısı'],['Belgeler','Okul bilgileri, ekip listesi ve hareket planı'],['Belgeler','İsimlikler ve boş yedekler'],['Belgeler','Malzeme teslim belgeleri'],['Son kontrol','Fotoğraf makinesi ve dolu piller'],['Son kontrol','Koordinatör kutusu: makas, bant, kalem, ip'],['Son kontrol','Kullanılan sınıflar ve salonlar son kez kontrol edildi']
].map(([group,name],i)=>({id:'packing-'+i,group,name,count:'',owner:'',note:'',checked:false}));

export default function Checklist(){
  const [items,setItems]=useState(()=>db.load('prokordi_checklist_v1',defaults));
  const [title,setTitle]=useState(()=>db.load('prokordi_checklist_title','İLKYAR · Unutulmaması Gerekenler'));
  const [name,setName]=useState('');
  useEffect(()=>{db.save('prokordi_checklist_v1',items);},[items]);
  useEffect(()=>{db.save('prokordi_checklist_title',title);},[title]);
  const change=(id,k,v)=>setItems(prev=>prev.map(x=>x.id===id?{...x,[k]:v}:x));
  return <div className="space-y-4">
    <style>{`@media print{@page{size:A4 landscape;margin:10mm}.packing-table{width:100%;table-layout:fixed;font-size:9pt;color:black}.packing-table tr{break-inside:avoid}.packing-table input{border:0!important;color:black!important;background:white!important}.packing-table th:first-child{width:6%}.packing-table th:nth-child(2){width:14%}.packing-table th:nth-child(3){width:36%}.packing-table th:nth-child(4){width:6%}.packing-table th:nth-child(5){width:16%}.packing-table th:nth-child(6){width:22%}.packing-table th,.packing-table td{border:1px solid #777;padding:4px}.packing-table input[type=checkbox]{appearance:none;width:14px;height:14px;border:1px solid black!important;vertical-align:middle}.packing-table input:checked:after{content:'✓';position:relative;top:-4px}}
    .packing-table{border-collapse:collapse;width:100%}.packing-table th,.packing-table td{text-align:left;padding:10px;border-bottom:1px solid #cbd5e1}
    `}</style>
    <div className="no-print dk-card dk-border border rounded-2xl p-4 space-y-3"><h3 className="dk-text font-700">Yükleme ve dönüş kontrolü</h3><p className="dk-text-muted text-sm">Kutuları ve cihazları sayın, sorumlu kişiyi yazın ve kontrol edilenleri işaretleyin. Liste yatay A4 çıkar. Tikler bu tarayıcıda saklanır.</p><div className="flex flex-wrap gap-2"><input aria-label="Yeni kontrol maddesi" value={name} onChange={e=>setName(e.target.value)} placeholder="Listeye yeni malzeme ekle" className="dk-input dk-border border p-3 rounded-xl flex-1 min-w-0"/><button onClick={()=>{if(name.trim()){setItems(p=>[...p,{id:uid(),name:name.trim(),group:'Ek malzeme',count:'',owner:'',note:'',checked:false}]);setName('');}}} className="bg-indigo-600 text-white p-3 rounded-xl">Madde ekle</button><button onClick={()=>window.print()} className="dk-text dk-border border p-3 rounded-xl">Yatay A4 yazdır</button></div><p className="text-sm dk-text">{items.filter(x=>x.checked).length}/{items.length} kontrol tamamlandı.</p></div>
    <input aria-label="Kontrol listesi başlığı" value={title} onChange={e=>setTitle(e.target.value)} className="text-xl font-700 dk-text bg-transparent w-full"/>
    <div className="overflow-x-auto print:overflow-visible"><table className="packing-table dk-text"><thead><tr>{['Kontrol','Grup','Malzeme / işlem','Adet','Sorumlu','Not'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{items.map(item=><tr key={item.id}><td><input type="checkbox" aria-label={item.name+' kontrol edildi'} checked={item.checked} onChange={e=>change(item.id,'checked',e.target.checked)}/></td>{['group','name','count','owner','note'].map(k=><td key={k}><span className="print-only" style={{overflowWrap:'anywhere'}}>{item[k]}</span><input aria-label={`${item.name} ${k}`} value={item[k]} onChange={e=>change(item.id,k,e.target.value)} style={{width:k==='count'?'45px':k==='name'?'240px':k==='group'?'120px':'140px'}} className="screen-only bg-transparent dk-text border-b dk-border p-1"/></td>)}</tr>)}</tbody></table></div>
  </div>;
}
