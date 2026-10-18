# ProKordi Manager 6

İLKYAR etkinlik programı, gönüllü dağılımı, isimlik, kolaj ve yükleme kontrol listesi.

## Kullanım

1. **Etkinlikler:** Drive kaynak bağlantıları ve hazırlık notları görünür. Yeni kayıtların kutu sayılarını ve uygun sınıf düzeylerini girip hazır olduğunu işaretleyin. Zorunlu seçimini yalnızca koordinatör yapar. Eski kullanıcı seçimleri korunur.
2. **Gönüllüler:** İsim ve gerçek yetkinlikleri girin veya Excel/CSV/yapıştırma ile aktarın. Bir etkinlik atanması kişiye otomatik yetkinlik kazandırmaz.
3. **Sınıf & Zaman:** 1–8 sınıflarda A–H hızlı seçimleri; 5-H, 9-C, 12-F gibi serbest sınıf adları. Yeni anaokulu kategorisi yok; eski kayıtlar silinmez. 08.00 veya başka başlangıç, etkinlik sayısı, süre, geçiş ve yemek arası ayarlanabilir. Saatler taslakta düzenlenir ve doğrulandıktan sonra kaydedilir. Atamalı satır kimlikleri korunur.
4. **Program:** Dağıtım önce doluluğu, sonra koordinatörün zorunlu seçimlerini, çeşitliliği ve görev dengesini değerlendirir. Kutu, düzey, yetkinlik ve kişi çakışmalarını denetler. Uygun boş gönüllüler yardımcı olarak atanır. Her kişinin sorumluluk/yardımcı sayısı, dakika ve çeşitliliği raporlanır. Kaynaklar yetmiyorsa boşluk veya tekrar açıkça bildirilir; kusursuz eşitlik garantisi verilmez.
5. **İçe aktarma:** XLSX, CSV, TSV ve metin; ayırıcılar ve tırnaklı alanlar desteklenir. Önizlemeden sonra uygulanır. Aynı sınıf/saat hücresi güncellenirken eşleşmeyen sınıflar/saatler korunur. Son program değişikliği geri alınabilir. JSON yedeği program, isimlik, kolaj ve kontrol listesini içerir.
6. **Balkız:** “Programı doldur”, “Boş kalan yerleri doldur”, “Programı kontrol et” ve “Programı dengele” temel işleri yerelde çalıştırır. Serbest istekler `/api/chat` üzerinden Groq kullanır. Yanıtın uygulanabilir biçimi doğrulanır, gerçek işlem kaydı ve hesaplanan geri bildirim gösterilir. İstek sürerken program değişirse eski yanıt değişiklikleri ezmez. Ağ veya model hatasında program korunur.
7. **İsimlik:** Gerçek mm ölçülerine göre A4 sayfalama. Varsayılan sıra her grup için isimler → arka yüzler → aynı isimler. Tekrar ve arka yüz sütun aynalaması isteğe bağlıdır. İsimleri, kart boyutunu, aralıkları ve yazı konumlarını düzenleyebilirsiniz. Görseller uygulamayla birlikte yerel sunulur.
8. **Kolaj:** A4 dikey, sayfa başına en fazla 20 kişi, eşit hücreler. Başlık/adres, isimler, sıralama, fotoğraf ölçeği/konumu ve kenar payları düzenlenebilir. Büyük ekip yeni sayfalara ayrılır. Fotoğraf yükleme 12 MB ile sınırlı ve tarayıcıda küçültülür.
9. **Sayfa kontrolü:** İsimlik ve kolajda Balkız görünen metinlerin gerçek taşmalarını ve yüklenmeyen görselleri bildirir. Tek tuşla yazı boyutu düzeltilebilir; son düzenleme yine kullanıcıdadır.
10. **Kontrol Listesi:** Tutanak bölümü yerine etkinlik kutuları, ses/görüntü, belgeler ve son kontrol maddeleri bulunur. Tik, adet, sorumlu ve not düzenlenebilir; özel maddeler eklenebilir. Yatay A4 çıktısı alınır.

## Drive kaynakları (salt okunur inceleme, 18 Ekim 2026)

- [Güncel Kılavuzlar](https://drive.google.com/drive/folders/1MRYaFiQ06PFLR8RGC9vknxNJpwSbUYvj)
- [10.10.2026 Etkinlik Geliştirme Notları](https://drive.google.com/file/d/1X-82TCrEikWdVxsE_0Y09f7x993SZ20r/view)
- [Koordinatör Kılavuzu](https://docs.google.com/document/d/1KxPbOq6TdqLI4Ck9H3X1qf2ARf-cdxl-/edit)

Katalog bir tarihli kaynak özetidir; Drive ile otomatik senkronizasyon yoktur. Kılavuzun klasörde bulunması etkinliğin hazırlık onayı anlamına gelmez. Tarih/arkeoloji/tiyatro/origami gibi geliştirme notları ayrı görünür. Etkinlik 101 ekip içi hazırlık toplantısı olduğundan okul etkinliği diye eklenmedi. Drive üzerinde hiçbir dosya oluşturulmadı, değiştirilmedi veya silinmedi.

## Saklama ve doğrulama

Veriler bu tarayıcının localStorage alanındadır; hesaplar veya cihazlar arası sunucu senkronizasyonu yoktur. Depolama hatası görünür uyarı üretir. Fotoğraflar yalnızca kolaj verisinde saklanır; isimlik ölçüleri ve kolaj ayarları sekme değişimlerinde korunur. Düzenli JSON yedeği indirin.

```sh
npm ci
npm test -- --watchAll=false --runInBand
npm run build
npm start
```

Vercel projesinde serbest dil yanıtları için sunucu tarafında `GROQ_API_KEY` gerekir; anahtar istemciye gömülmez. Fiziksel çift taraflı baskı hizalaması yazıcıya bağlıdır; önce bir grup üzerinde deneme baskısı alın.
