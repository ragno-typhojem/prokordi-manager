# ProKordi Manager v5

Gönüllü etkinlik programı yöneticisi — otomatik veya manuel program kurma, isimlik matbaası, görsel kolaj ve resmi tutanak modülleri.

## v5'te ne değişti

| Alan | Eski | Yeni |
|---|---|---|
| **Model** | tek `llama-3.3-70b-versatile` (emekli oldu → uygulama çöküyordu) | 4'lü otomatik zincir (`gpt-oss-120b` → `kimi-k2` → `llama-4-maverick` → `8b-instant`), zorunlu JSON modu |
| **Emir anlama** | düz prompt, AI'dan ID isteniyordu | AI sadece **isim** yazar, id çözümlemesi uygulamada; bulanık eşleşme ("eda" → "Eda Nur Keklik"), 20 aksiyon tipi, tek mesajda çoklu emir |
| **İçe aktarma** | yalnızca CSV program tablosu | `.xlsx` / `.csv` / `.tsv` / sürükle-bırak / **doğrudan yapıştırma**; tür otomatik algılanır (program / gönüllü / etkinlik / sınıf / isim) |
| **Performans** | her render'da tam tarama + her keystroke'ta `localStorage` yazımı | `Map`/`Set` indeksli tek geçiş, `useMemo`, 250 ms debounce'lu kayıt |
| **Doğruluk** | kutu limiti dağıtımda gün geneli, uyarıda saat bazı sayılıyordu (tutarsız) | her ikisi de **saat bazında** — aynı kutu farklı saatte tekrar kullanılabilir |
| **Bundle** | — | Excel okuyucu 900 KB'lık SheetJS yerine 3 KB'lık kendi okuyucumuz, ayrıca **lazy-load** |

## Mimari

```
api/chat.js          Vercel serverless — Groq, model zinciri + JSON modu
src/lib/util.js      Türkçe normalize, bulanık eşleşme, slot çözümleme
src/lib/db.js        debounce'lu localStorage + bellek önbelleği
src/lib/engine.js    çakışma tespiti + dağıtım (indeksli, O(n) yakın)
src/lib/importer.js  Excel / CSV / yapıştırma → state yaması
src/lib/xlsx.js      minimal .xlsx okuyucu (fflate, dinamik import)
src/lib/ai.js        durum sıkıştırma, sistem promptu, aksiyon reducer'ı
src/App.js           arayüz
```

`lib/` içindeki her şey saf fonksiyon: `applyActions(state, actions)` girdi state'ini
değiştirmez, yeni state + insan-okunur log döndürür. Testler bunu doğrular.

## Kurulum

```bash
npm install
npm start          # http://localhost:3000
npm test           # 25 birim testi
npm run build
```

## Vercel

1. Repo'yu Vercel'e bağlayın (Framework: **Create React App**).
2. **Settings → Environment Variables** → `GROQ_API_KEY` ekleyin ([console.groq.com](https://console.groq.com/keys)).
3. Deploy. `api/chat.js` otomatik olarak serverless fonksiyon olur.

Anahtar yoksa uygulama çalışır; yalnızca sohbet kutusu uyarı verir.

## Sohbet kutusu ne anlar

```
3. ders 4-A'ya Kimya koy, Mehmet anlatsın
Ayşe'yi ekle, origami ve drama yapabilir
1-A ile 2-B'nin ilk derslerini değiştir
boş kalan yerleri doldur
zorunlular kalsın, gerisini sil
Origami'nin kutu sayısını 5 yap ve zorunlu işaretle
```

Excel'den kopyaladığınız tabloyu doğrudan sohbet kutusuna yapıştırabilirsiniz —
AI'ya gitmeden anında içe aktarılır.

---
© 2026 [Mustafa Berke Şimşekler](https://github.com/ragno-typhojem) — MIT
