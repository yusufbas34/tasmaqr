# Tasma QR

Köpeklerin tasmasına QR künye. Künyeyi okutan kişi köpeğin adını, sahibinin notunu ve **Sahibimi ara** butonunu görür, isterse bulunduğu yeri tek dokunuşla gönderir. Araç QR'ın köpek tasması sürümüdür; önce web sitesi hazırlandı, Android uygulaması sonra gelecek.

## Özellikler

- **Bulan kişi ekranı** (`?k=KOD`): sahibini arama, WhatsApp, SMS, yedek numara, sahibinin notu (sağlık, karakter)
- **Konum gönderme**: bulan kişi izin verirse konumu sahibinin künye sayfasına kaydedilir ve WhatsApp/SMS mesajına harita bağlantısı eklenir
- **Kayıp modu ve ödül**: kayıp modu açıkken QR'ı okutan kişi kırmızı “KAYIP” uyarısını görür
- **Web'den künye oluşturma** (`#olustur`): köpeğin adı ve telefonla anında QR künye; PIN ile düzenleme
- **Künyelerim** (`#kunyelerim`): bu cihazdaki künyeler, okutma sayısı, son konumlar, yazdırma ve PDF
- **11 tasarım, 7 ölçü**: yuvarlak Ø25–Ø40 mm, dikdörtgen 35×50–50×75 mm
- **Hazır künye talep formu** ve **basılı künye siparişi** (IBAN ile ödeme, Telegram/e-posta bildirimi)
- **Yönetim** (`?admin`): PIN kartlı künye üretme/yazdırma, talepler, siparişler, satış ayarları

## Kurulum

1. **Veritabanı**: Supabase > SQL Editor'da `supabase/kurulum.sql` dosyasını açın, en üstteki `v_sifre` satırına admin şifrenizi (en az 10 karakter) yazıp **Run**'a basın. Tablolar `tasma_` önekli olduğu için Araç QR'ın Supabase projesinde de çakışmadan çalışır. `index.html` varsayılan olarak o projeyi kullanır; ayrı proje isterseniz dosyanın başındaki `SUPABASE_URL` ve `SUPABASE_KEY` değerlerini değiştirin.
2. **Yayın**: GitHub > Settings > Pages > Branch: `main` / root. Site `https://yusufbas34.github.io/tasmaqr/` adresinde açılır (adres farklıysa `index.html` içindeki `SITE_URL`'i güncelleyin; künyelere basılan QR bu adresi açar).
3. **Yönetim**: `https://yusufbas34.github.io/tasmaqr/?admin`

## Dosyalar

- `index.html`: sitenin tamamı
- `shared/tag.js`, `shared/tag.css`: künye tasarımları ve ölçüleri (Android uygulaması da kullanacak)
- `supabase/kurulum.sql`: veritabanı (tek dosya, tekrar çalıştırmak güvenli)
