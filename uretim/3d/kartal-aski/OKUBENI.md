# Kartal askı · masaya delik açmadan

Kanatları açık, yüzü masaya dönük kartal. Taş kaidesiyle masa kelepçesinin üstüne oturur. Kuyruğu masa kenarından dışarı uzanır, ucu kalkıktır: kulaklık ve çanta askısı olarak kullanılır. Kelepçe alttan elle sıkılır, masaya hiç delik açılmaz. **Hazır donanım gerekmez**, vida da basılır; somun yoktur, diş doğrudan kelepçenin çenesindedir.

![teknik resim](kartal-aski-teknik-resim.png)

## Parçalar

| Poz | Dosya | Açıklama |
|---|---|---|
| 1 | `kartal-aski-1-kelepce-baski-yonu.stl` | Kelepçe + kuyruk askı, tek parça. Alt çenede Ø16 adım 3 iç diş (ayrı somun yok). Üstünde kartal için 2 pim (Ø6 × 5) |
| 2 | `kartal-aski-2-kartal-baski-yonu.stl` | Açık kanatlı kartal, taş kaideli. Altında 2 pim deliği (Ø6,5) |
| 3 | `kartal-aski-3-vida.stl` | Tırtıllı topuzlu sıkma vidası, Ø16 adım 3, diş boyu 48 |
| 4 | `kartal-aski-4-pabuc.stl` | Masanın altına basan pabuç Ø30 × 7 |
| | `kartal-aski-teknik-resim.pdf` | A3 teknik resim: ölçülü görünüşler, çene dişi kesiti, patlatılmış montaj, parça listesi |
| | `kartal_aski.py` | Modelleri üreten betik |
| | `teknik-resim.html` | Paftanın kaynağı (three.js + STL'ler, yerel sunucudan açılır) |

`-baski-yonu` olmayan 1 ve 2 numaralı dosyalar aynı parçaların masadaki duruşudur.

Ölçü: kanat açıklığı 127 mm, masa üstünde yükseklik 116 mm. Kuyruk masa kenarından 62 mm dışarı uzanır, ucu 31 mm yukarı kalkar.

## Montaj

1. Kartalı (2) kelepçenin (1) pimlerine oturtun, CA (japon yapıştırıcı) veya epoksi ile yapıştırın.
2. Vidayı (3) alttan çenedeki dişe çevirin. İlk takışta birkaç kez sonuna kadar ileri geri çevirin; diş yerine oturur.
3. Pabucu (4) vidanın ucuna oturtun.
4. Kelepçeyi masa kenarına geçirin, topuzu elle sıkın. Kartal masaya bakar, kuyruk dışarı uzanır.

Uygun masa kalınlığı: **15–45 mm**.

Diş uyumu modelde kontrol edildi: vida, dönerek ilerlediği her konumda çene dişine sıfır çakışmayla girer (radyal boşluk 0,5 mm).

## Maliyet (tahmini)

| Parça | Ağırlık |
|---|---|
| 1 Kelepçe + kuyruk (5 duvar, %40) | ≈ 90 g PETG |
| 2 Kartal (3 duvar, %15, destek dahil) | ≈ 38 g PETG |
| 3 Vida (%100) | ≈ 33 g PETG |
| 4 Pabuç (%100) | ≈ 5 g TPU |
| **Toplam** (+ ~10 g fire) | **≈ 175 g** |

- Filament: `toplam gram × kg fiyatı / 1000`. Örnek: PETG 700 TL/kg ise ≈ 120 TL, 900 TL/kg ise ≈ 155 TL. TPU payı ≈ 5 TL.
- Baskı süresi ≈ 10–14 saat (yazıcıya göre). ~120 W ortalama çekişle ≈ 1,5 kWh, yani birkaç TL elektrik.
- Yapıştırıcı: birkaç damla CA.
- Ağırlıklar yüzey alanı ve doluluk oranından hesaplandı. Kesin değeri dilimleyici verir; fiyatları kendi filament fiyatınla güncelle.

## Taşıma kapasitesi (hesap)

- Kuyruk kalınlığı 8,5 mm. En zayıf kesit masa kenarının hemen dışında (W ≈ 310 mm³).
- 3 kg yük kuyruğun ucuna asılırsa bu kesitte gerilme ≈ 4 MPa olur. Yan yatık basılmış PETG'de katman yönündeki dayanım ~30–45 MPa.
- Bu, statik yükte yaklaşık 7 kat güvenlik demek. Çanta kancaya bırakılırken oluşan darbe yükü kabaca 2 kat sayılırsa yine ~3 kat güvenlik kalır.
- Yük kelepçeyi masaya doğru bastırır; vida gevşek olsa bile kelepçe masadan kaymaz.
- **Bunlar hesaptır, baskı test edilmedi.** İlk baskıdan sonra yükü kademeli artırarak (0,5 → 1 → 2 → 3 kg) deneyin.
- PLA kullanmayın: sürekli yük altında zamanla sarkar (sünme).

## Baskı

- **Kelepçe (1):** `-baski-yonu` dosyasıyla, düz yan yüzü tablaya gelecek şekilde. Bu yönde katmanlar hem C gövdesini hem kuyruğu boydan boya sarar. **PETG**, 0,2 mm katman, **5 duvar, %40 doluluk**. Destek yalnızca kuyruk ucunun altına gerekir.
- **Kartal (2):** taş kaidesi tablada, dik. Kanatların altına **ağaç destek**, %15 doluluk. PETG veya PLA (yük taşımaz).
- **Vida (3):** topuz tablada, dik. %100 doluluk, 0,16–0,2 mm katman, destek yok.
- **Pabuç (4):** TPU önerilir (masayı çizmez, kaymaz).
- Çenedeki iç diş yan yatık basıldığı için yatay durur; delik tavanındaki dişler biraz sarkabilir. Vida sıkı gelirse birkaç kez ileri geri çevirerek açın. Hâlâ sıkıysa vidayı %99 ölçekle basın.
