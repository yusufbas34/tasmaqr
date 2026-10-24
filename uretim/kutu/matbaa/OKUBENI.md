# Asma kutu · matbaa dosyaları

Yazılar **eğriye çevrilmiş** (convert to outlines) PDF'ler; matbaada yazı tipi gerekmez.

- **1. sayfa:** baskı, 2 mm taşma paylı
- **2. sayfa:** bıçak / kesim çizgisi (düz = kesim, kesikli = katlama, pembe #EC008C)
- Sayfa 145 × 162 mm, kutu açılımı 137 × 154 mm, iç ölçü 56 × 78 × 8 mm, %100 ölçek
- Önerilen kâğıt: 300–350 g/m² bristol / kuşe karton, isteğe bağlı mat selefon

| Dosya | Renk |
|---|---|
| `kutu-marka-turuncu-B8501A-8mm.pdf` | Marka turuncu |
| `kutu-acik-mavi-9BC4DF-8mm.pdf` | Açık mavi |
| `kutu-pembe-F4C2C1-8mm.pdf` | Açık pembe |
| `kutu-kirmizi-C62828-8mm.pdf` | Kırmızı |
| `kutu-yesil-1F7A4A-8mm.pdf` | Yeşil |
| `kutu-pembe-E05A8A-8mm.pdf` | Pembe |
| `kutu-mor-kedi-8A6FB3-8mm.pdf` | Mor (kedi) |

Yeniden üretme: kutu sayfası Chromium'da PDF'e basılır, sonra Ghostscript ile yazılar eğriye çevrilir:
`gs -o cikti.pdf -sDEVICE=pdfwrite -dNoOutputFonts -dPDFSETTINGS=/prepress girdi.pdf`
