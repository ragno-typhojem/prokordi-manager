import { norm } from './util';
export const CATALOG = [
  {
    "name": "Göremediğimiz Canavarlar",
    "sourceUrl": "https://drive.google.com/drive/folders/1NxXps1WsbMq7f8fmyeqefGtdKdNuGdvz",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Masa Deneyleri",
    "sourceUrl": "https://drive.google.com/drive/folders/1YakH7ceKKIvps6s4YpchKA98qmen8TQO",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "VR",
    "sourceUrl": "https://drive.google.com/drive/folders/1BOL7s5fNJWyCG4r15uVxMmUe0OlggFgT",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Fizik / Fen",
    "sourceUrl": "https://drive.google.com/drive/folders/1XYMbY-J8ZdSfZ81wVdwdA8ix7Q1SOyHp",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Yapay Zeka Etkinliği",
    "sourceUrl": "https://drive.google.com/drive/folders/1Og_vLIUPh03TnBzqYVeZY2GiPO4plMWm",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Gece deneyleri",
    "sourceUrl": "https://drive.google.com/drive/folders/1cK8dJ0mNDzUogOWVIOQz5J7yy3P8gq_B",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Dış Deneyler",
    "sourceUrl": "https://drive.google.com/drive/folders/1wvUFc2YALHifi6oxHiK6g-rt0xH8aiMc",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Resim",
    "sourceUrl": "https://drive.google.com/drive/folders/1bVW6f2Rg6WfpG9HagL6gw7jqhUm7owYK",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: Resim videosu notu mevcut."
  },
  {
    "name": "Astronomi",
    "sourceUrl": "https://drive.google.com/drive/folders/1MoFNhsQwA5ePXxdmV_95YQNHXjG1o15d",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: Kılavuz yenilenecek."
  },
  {
    "name": "Matematik",
    "sourceUrl": "https://drive.google.com/drive/folders/1HxHPPxDAC3zgNRno7pMWC_QI_OaC3r26",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Kimya",
    "sourceUrl": "https://drive.google.com/drive/folders/1jS-z5hGt6V7WvloMaJLzpk2eHzvytX9D",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: Altın yağmuru deneyine alternatif aranıyor."
  },
  {
    "name": "Yaratıcı Drama",
    "sourceUrl": "https://drive.google.com/drive/folders/1d6OmZecf2Cp1zxTknX-rGIeTio0M4sJs",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Robot",
    "sourceUrl": "https://drive.google.com/drive/folders/1UU-0kE4Ce6XUzvvXc_fbytwVB8yjvLQ5",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: Kılavuz ve kutu içeriklerinin eşitlenmesi çalışılıyor; 27–28 Ekim notu mevcut."
  },
  {
    "name": "Edebiyat",
    "sourceUrl": "https://drive.google.com/drive/folders/1BdJiBXWhPbQP90TGChGzKtYUYFtvY8xC",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Pino Mino İlkokul",
    "cat": "science",
    "sourceUrl": "https://drive.google.com/file/d/1X-82TCrEikWdVxsE_0Y09f7x993SZ20r/view",
    "sourceDate": "2026-10-18",
    "catalogStatus": "Güncel Kılavuzlar klasöründe mevcut. Sınıf düzeyi, kutu ve gönüllü hazırlığı koordinatörce doğrulanmalı."
  },
  {
    "name": "Origami",
    "sourceUrl": "https://drive.google.com/file/d/1X-82TCrEikWdVxsE_0Y09f7x993SZ20r/view",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: Kılavuz yazıldı; geri bildirim bekleniyor."
  },
  {
    "name": "Tarih",
    "sourceUrl": "https://drive.google.com/file/d/1X-82TCrEikWdVxsE_0Y09f7x993SZ20r/view",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: Geliştiriliyor; karar ve kılavuz bekleniyor."
  },
  {
    "name": "Arkeoloji",
    "sourceUrl": "https://drive.google.com/file/d/1X-82TCrEikWdVxsE_0Y09f7x993SZ20r/view",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: Beklemede."
  },
  {
    "name": "Tiyatro",
    "sourceUrl": "https://drive.google.com/file/d/1X-82TCrEikWdVxsE_0Y09f7x993SZ20r/view",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: En az 2–3 oyun araştırılacak."
  },
  {
    "name": "Kâğıt Olimpiyatları Atölyesi",
    "sourceUrl": "https://drive.google.com/file/d/1X-82TCrEikWdVxsE_0Y09f7x993SZ20r/view",
    "sourceDate": "2026-10-18",
    "catalogStatus": "10.10.2026: Geliştirme çalışması ve VibraMotor notu mevcut."
  },
  {name:'Pino Mino Atölye',cat:'workshop',catalogStatus:'Koordinatör talebiyle eklenen atölye. Uygun düzeyleri seçin.'},
  {name:'Yapay Zeka Atölyesi',cat:'workshop',catalogStatus:'Koordinatör talebiyle eklenen atölye. Uygun düzeyleri seçin.'}

];

const aliases = { 'robotik':'robot', 'robotik kodlama':'robot', 'kimya deneyleri':'kimya', 'fizik deneyleri':'fizik fen', 'pino mino':'pino mino ilkokul', 'pinoo minoo':'pino mino ilkokul', 'pino mino atolyesi':'pino mino atolye', 'yapay zeka':'yapay zeka etkinligi', 'vr sanal gerceklik':'vr' };
export const matchName = name => aliases[norm(name)] || norm(name);

// Additive migration: preserve IDs, must flags, quantities, grades, volunteers and schedules.
export function mergeCatalog(existing = []) {
  const result = existing.map(a => /ilkyar tanitim/.test(norm(a.name)) ? {...a,cat:'presentation',planningReady:false,isMust:false} : {...a});
  CATALOG.forEach((item,i) => {
    const found = result.findIndex(a => matchName(a.name) === matchName(item.name));
    if (found >= 0) result[found] = {...result[found], ...Object.fromEntries(Object.entries(item).filter(([k])=>k!=='name')), ...(norm(result[found].name)==='pinoo minoo'?{name:item.name}:{}), cat:item.cat||(/atolye/.test(norm(item.name))?'workshop':'science')};
    else result.push({id:'ilkyar-v8-'+norm(item.name).replace(/ /g,'-'), ...item, cat:/atolye/.test(norm(item.name))?'workshop':'science', isMust:false, boxCount:1, allowedGrades:[], planningReady:false});
  });
  return result;
}

export const resolveActivity=(list,name)=>list.find(a=>matchName(a.name)===matchName(name));
