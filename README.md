# Tasma QR

Köpeklerin tasmasına künye gibi takılan QR rozet. Rozeti okutan kişi köpeğin adını, sahibinin notunu ve **Sahibimi ara** butonunu görür, isterse bulunduğu yeri tek dokunuşla gönderir. Araç QR'ın köpek tasması sürümüdür. Web sitesi ve Android uygulaması aynı koddan çalışır.

## Özellikler

- **Sayfalar**: sitede üst menü (Ana sayfa · Nasıl çalışır · Rozetler · Hazır rozet · SSS · Rozetlerim) ve alt bölüm; uygulamada üst bar ve alt sekmeler (Rozetlerim · Siparişlerim · Profilim)
- **Tasarım kilidi**: tasarım rozet oluşturulurken seçilir, ücretsiz baskıda değiştirilemez; yeni tasarım rozet siparişinde seçilir ve ödeme onaylanınca rozete işlenir
- **İlk giriş tanıtımı**: reels gibi yukarı kaydırılan 5 tam ekran slayt (ana sayfadaki “30 saniyede tanıyın” ile tekrar izlenir)
- **Bulan kişi ekranı** (`?k=KOD`): sahibini arama, WhatsApp, SMS, yedek numara, sahibinin notu (sağlık, karakter)
- **Konum gönderme**: bulan kişi izin verirse konumu sahibinin rozet sayfasına kaydedilir ve WhatsApp/SMS mesajına harita bağlantısı eklenir
- **Kayıp modu ve ödül**: kayıp modu açıkken QR'ı okutan kişi kırmızı “KAYIP” uyarısını görür
- **Web'den rozet oluşturma** (`#olustur`): köpeğin adı ve telefonla anında QR rozet; PIN ile düzenleme
- **Rozetlerim** (`#kunyelerim`): bu cihazdaki rozetler, okutma sayısı, son konumlar, yazdırma ve PDF
- **11 tasarım, 7 ölçü**: yuvarlak Ø25–Ø40 mm, dikdörtgen 35×50–50×75 mm
- **Silme**: sahibi PIN ile rozeti siler (okutmalar ve konumlar da silinir; yönetimden basılan rozet boşa çıkar ve PIN kartıyla yeniden bağlanabilir). Yönetimde kullanılmamış rozetler silinebilir
- **Tasmaya takılan fiziksel rozet**: kulaklı (halka delikli) yuvarlak rozet, iki tip: renkli epoksi (UV baskı + epoksi kubbe) ve metal (paslanmaz çelik, lazer kazıma); Ø25/30/35 mm. Tipe göre fiyat yönetimden ayarlanır
- **Üretim dosyası**: sipariş başına gerçek mm ölçülü SVG (kırmızı = kesim, metalde siyah = kazıma) ve epoksi için PDF; baskıcıya hazır e-posta metni
- **Hazır rozet talep formu** (rozet tipi, tasarım, ölçü) ve **rozet siparişi** (IBAN ile ödeme, Telegram/e-posta bildirimi)
- **Yönetim** (`?admin`): PIN kartlı rozet üretme/yazdırma, **fabrika paketi** (listedeki rozetler için QR listesi CSV + metal/epoksi SVG, tek ZIP; PIN içermez), talepler, siparişler, satış ayarları
- **Sahibimi Ara (stok)** sekmesi: köpek adı basılmayan “OKUT • SAHİBİMİ ARA” rozeti için toplu parti (adet, tip, ölçü, tasarım, üst yazı). Parti başına fabrika paketi (QR listesi CSV + SVG + üretim notu, PIN yok), A4 rozet baskı PDF'i, 85×55 mm PIN kartları PDF'i (A4'e 10) ve yalnızca sizde kalacak PIN listesi CSV

## Android uygulaması

`android/` klasöründe. Uygulama siteyi uygulama modunda gösterir; yazdırma ve PDF Android'e devredilir, arka planda
"konum geldi / kayıp modunda rozet okutuldu / sipariş ilerledi" bildirimleri gösterilir.
`main`'e her gönderimde GitHub Actions APK derler: https://github.com/yusufbas34/tasmaqr/releases/download/apk-son/tasma-qr.apk
Google Play için: [android/GOOGLE_PLAY.md](android/GOOGLE_PLAY.md). Ayrıntılar: [android/README.md](android/README.md).

## Kurulum

1. **Veritabanı**: Supabase > SQL Editor'da `supabase/kurulum.sql` dosyasını açın, en üstteki `v_sifre` satırına admin şifrenizi (en az 10 karakter) yazıp **Run**'a basın. Güncelleme geldiğinde dosyayı yeniden çalıştırmanız yeterli (veriler korunur, şifre satırını `BURAYA-SIFRE` bırakırsanız şifre değişmez). Supabase projesi `index.html`'in başındaki `SUPABASE_URL` ve `SUPABASE_KEY` ile seçilir.
2. **Yayın**: GitHub > Settings > Pages > Branch: `main` / root. Site `https://yusufbas34.github.io/tasmaqr/` adresinde açılır (adres farklıysa `index.html` içindeki `SITE_URL`'i güncelleyin; rozetlere basılan QR bu adresi açar).
3. **Yönetim**: `https://yusufbas34.github.io/tasmaqr/?admin`

## Dosyalar

- `index.html`: sitenin tamamı
- `shared/intro.js`: tasmaya asılı rozet görseli ve ilk giriş tanıtımı
- `shared/tag.js`, `shared/tag.css`: rozet tasarımları ve ölçüleri (Android uygulaması da kullanacak)
- `supabase/kurulum.sql`: veritabanı (tek dosya, tekrar çalıştırmak güvenli)
- `gizlilik.html`: gizlilik politikası (Google Play için)
- `shared/vendor`, `shared/fonts`: gömülü kütüphaneler ve fontlar (CDN'e bağımlı değil)
- `android/`: Android uygulaması, `.github/workflows/android.yml`: APK / AAB derlemesi
- `uretim/3d/`: 3D baskı rozet gövdesi (STL, 5 renk 3MF, `govde.py`) ve QR etiket sayfası (kodları yapıştırıp A4 basılır)
- `pazarlama/`: 90 günlük büyüme planı ve takip listesi, Instagram görsel kiti (`kit.html` → `node pazarlama/uret.js`)
