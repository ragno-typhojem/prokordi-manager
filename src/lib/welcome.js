export const WELCOME_LINES = [
 'Ben Balkız. Kutular otobüste, program bende; gönüllüler de hazırsa başlayalım.',
 'Merhaba kordi! Bugün karmaşayı azaltıp merakı çoğaltıyoruz.',
 'Ben Balkız. Aynı gönüllüyü iki sınıfa ışınlayamıyorum ama çakışmayı yakalıyorum.',
 'Hoş geldin! Önce bir nefes, sonra bir program. İkisini aynı anda yapmak serbest.',
 'Kordi geldiğine göre işler ciddileşti. Ben yine de biraz neşeli kalacağım.',
 'Bugünün hedefi: bol merak, az karmaşa, otobüste unutulmayan kutular.',
 'Çayını aldıysan başlayalım. Almadıysan da programı hazırlarken demlenir.',
 'Bir okul, bir sürü meraklı çocuk ve çok güzel bir ekip. Gerisini birlikte toparlarız.',
 'İsimlikler hazır, gönüllüler hevesli… Hazır olmayanları da birlikte hazırlarız.',
 'Kutuların indiğine tik atmayı unutma. Ben burada beklerim, kutu beklemez.',
 'Planı değiştirmek serbest. Aynı kişiyi aynı saatte iki sınıfa koymak biraz zor.',
 'Küçük bir düzenleme, kocaman bir rahatlık. Bugün hangisinden başlayalım?',
 'Ben Balkız. Programda boşluk bulurum, otobüste boş koltuk bulmayı garanti edemem.',
 'Kordi modu açıldı. Panik modunu açmamıza gerek yok.',
 'Bugün de bilim, oyun ve “bir daha yapabilir miyiz?” soruları için buradayız.',
 'Güzel bir günün sırrı bazen sadece doğru etiketlenmiş bir HDMI kablosudur.',
 'Merak kutuya sığmaz ama etkinlik malzemeleri sığsa iyi olur.',
 'Hazırsan başlayalım. Her şeyi tek seferde bitirmek zorunda değilsin.',
 'İki okula mı bölünüyoruz? Programlar ayrı, ekip ruhu ortak.',
 'Hüseyin Hoca kolajda yerini aldı. Sıra ekibin geri kalanında.',
 'İsimleri büyütebiliriz. Yapılacakları gözümüzde büyütmesek daha iyi.',
 'Bir kutu, bir gönüllü, bir sınıf… Doğru saatte buluşunca güzel şeyler oluyor.',
 'Yeni bir program mı, son bir rötuş mu? İkisine de yerimiz var.',
 'Bugünün en güzel çıktısı çocukların gülümsemesi. A4 olanları da ben toparlarım.',
 'Kordi, okulun adını koy; saatleri ve şubeleri birlikte düzene sokalım.',
 'Her şey hazır gibi görünüyorsa ses sisteminin kablosuna da bir bakalım.',
 'Burası küçük düzenlemelerin büyük telaşları önlediği yer.',
 'Gönüllüyü “ad - etkinlik” diye yazman yeter. Gerisini listede birlikte kontrol ederiz.',
 'Ben Balkız. Biraz plan, biraz mizah, bolca merakla çalışıyorum.',
 'Programdan kolaja, isimlikten Tikçi Listesi’ne… Bugün direksiyonda sen varsın.',
 'Bir etkinlik biter, merak devam eder. Önce o ilk saati güzelce yerleştirelim.',
 'Kordi masasının görünmez yardımcısı görev başında. Kalemini aramıyorum, söz.',
];

// A shuffled bag uses every greeting before recycling it and avoids boundary repeats.
export function nextWelcome(previous = {}, random = Math.random) {
 let remaining = Array.isArray(previous.remaining)
  ? [...new Set(previous.remaining.filter(i => Number.isInteger(i) && i >= 0 && i < WELCOME_LINES.length))]
  : [];
 if (!remaining.length) {
  remaining = WELCOME_LINES.map((_, i) => i);
  for (let i = remaining.length - 1; i > 0; i--) {
   const j = Math.floor(random() * (i + 1));
   [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  if (remaining[0] === previous.index) [remaining[0], remaining[1]] = [remaining[1], remaining[0]];
 }
 const index = remaining.shift();
 return { index, remaining };
}
