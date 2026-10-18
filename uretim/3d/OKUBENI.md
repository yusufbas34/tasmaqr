# Tasma QR · 3D baskı gövde + QR etiket

Köpek tasmasına halkayla takılan yuvarlak rozet gövdesi. Önündeki çukura QR etiket yapıştırılır, üstü epoksiyle kaplanır.

## Dosyalar

| Dosya | Açıklama |
|---|---|
| `tasmaqr-5-renk-35mm.3mf` | Ø35 gövde, 5 renk tek tablada (Bambu Studio / Orca / PrusaSlicer) |
| `tasmaqr-5-renk-30mm.3mf` | Ø30 gövde, 5 renk tek tablada |
| `govde-35mm.stl` | Ø35 × 42,6 (kulak dahil) × 4 mm, ~4,2 g PETG, etiket Ø30 |
| `govde-30mm.stl` | Ø30 × 37,6 × 4 mm, ~3,2 g PETG, etiket Ø25 |
| `tabla-5-adet-35mm.stl`, `tabla-5-adet-30mm.stl` | 5 gövde yan yana tek dosyada (renk bilgisi yok; her gövdeye dilimleyicide renk atayın ya da renk başına bir tabla basın) |
| `etiket-ornek-35mm.pdf`, `etiket-ornek-30mm.pdf` | Örnek etiket sayfası (A4, %100 ölçek) |
| `govde.py` | Gövdeyi üreten betik (ölçü değiştirmek için) |

## Renkler

| Gövde | Filament | Etiket tasarımı |
|---|---|---|
| Lacivert | PETG lacivert `#163A7A` | Klasik lacivert |
| Turuncu | PETG turuncu `#E8742A` | Turuncu pati |
| Kırmızı | PETG kırmızı `#C62828` | Kırmızı uyarı |
| Yeşil | PETG koyu yeşil `#1F7A4A` | Orman yeşili |
| Pembe | PETG pembe `#E05A8A` | Pembe kalp |

## Baskı ayarları

- Malzeme: **PETG** (dış mekân için ASA da olur). PLA kullanmayın: suda, güneşte ve sıcak arabada bozulur.
- Nozul 0,4 mm, katman 0,2 mm, **4 duvar**, **%100 doluluk** (küçük parça, dayanıklı olsun).
- Çukurlu yüz yukarı bakacak şekilde, olduğu gibi basın. Destek gerekmez.
- Ölçüler: kenar 2,2 mm, çukur derinliği 1,0 mm, halka deliği Ø4,2 mm (Ø15–20 mm split ring için).
- Bir tablaya kolayca 20–30 gövde sığar; 3MF'teki 5 gövdeyi çoğaltabilirsiniz.

## Etiket ve montaj

1. Etiket sayfasını su geçirmez beyaz vinile %100 ölçekle basın, üstüne şeffaf laminasyon yapıştırın, daireleri kesin.
   Gerçek ürün için kodlar Yönetim › Sahibimi Ara (stok) partisinden gelir. Kodları `uretim/3d/` sayfasındaki kutuya yapıştırıp etiket sayfasını oradan basın.
2. Etiketi **aynı renkteki** gövdenin çukuruna ortalayıp yapıştırın.
3. Üstüne çukuru dolduracak kadar (yaklaşık 0,8 mm) UV reçine ya da 2 bileşenli epoksi damlatın, kabarcıkları alıp kürleyin.
4. Her rozeti telefonla okutup kontrol edin. Halkayı takın, aynı kodlu PIN kartıyla birlikte poşetleyin.
