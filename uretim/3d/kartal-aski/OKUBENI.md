# Kartal askı · masaya delik açmadan

Kanatları açık, yüzü masaya dönük kartal. Taş kaidesiyle masa kelepçesinin üstüne oturur. Kuyruğu masa kenarından dışarı uzanır, ucu kalkıktır: kulaklık ve çanta askısı olarak kullanılır. Kelepçe alttan elle sıkılır, masaya hiç delik açılmaz. **Hazır donanım gerekmez**, vida ve somun da basılır.

![teknik resim](kartal-aski-teknik-resim.png)

## Parçalar

| Poz | Dosya | Açıklama |
|---|---|---|
| 1 | `kartal-aski-1-kelepce-baski-yonu.stl` | Kelepçe + kuyruk askı, tek parça. Üstünde kartal için 2 pim (Ø6 × 5) |
| 2 | `kartal-aski-2-kartal-baski-yonu.stl` | Açık kanatlı kartal, taş kaideli. Altında 2 pim deliği (Ø6,5) |
| 3 | `kartal-aski-3-somun.stl` | Altıgen somun, AA 26 × 10, iç diş Ø16 adım 3 |
| 4 | `kartal-aski-4-vida.stl` | Tırtıllı topuzlu sıkma vidası, Ø16 adım 3, diş boyu 48 |
| 5 | `kartal-aski-5-pabuc.stl` | Masanın altına basan pabuç Ø30 × 7 |
| | `kartal-aski-teknik-resim.pdf` | A3 teknik resim: ölçülü görünüşler, patlatılmış montaj, parça listesi |
| | `kartal_aski.py` | Modelleri üreten betik |
| | `teknik-resim.html` | Paftanın kaynağı (three.js + STL'ler, yerel sunucudan açılır) |

`-baski-yonu` olmayan 1 ve 2 numaralı dosyalar aynı parçaların masadaki duruşudur.

Ölçü: kanat açıklığı 127 mm, masa üstünde yükseklik 116 mm. Kuyruk masa kenarından 62 mm dışarı uzanır, ucu 31 mm yukarı kalkar.

## Montaj

1. Kartalı (2) kelepçenin (1) pimlerine oturtun, CA (japon yapıştırıcı) veya epoksi ile yapıştırın.
2. Somunu (3) alt çenedeki altıgen yuvaya bastırın.
3. Vidayı (4) alttan çeneye geçirip somuna çevirin.
4. Pabucu (5) vidanın ucuna oturtun.
5. Kelepçeyi masa kenarına geçirin, topuzu elle sıkın. Kartal masaya bakar, kuyruk dışarı uzanır.

Uygun masa kalınlığı: **15–45 mm**.

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
- **Vida (4)** topuz tablada, **somun (3)** düz basılır. İkisi de %100 doluluk, 0,16–0,2 mm katman, destek yok.
- **Pabuç (5):** TPU önerilir (masayı çizmez, kaymaz).
- Diş boşluğu 0,45 mm (radyal). Vida sıkı gelirse somunu %101 ölçekle basın.
