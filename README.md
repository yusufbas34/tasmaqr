# Tasma QR

Köpeklerin tasmasına künye gibi takılan QR rozet. Rozeti okutan kişi köpeğin adını, sahibinin notunu ve **Sahibimi ara** butonunu görür, isterse bulunduğu yeri tek dokunuşla gönderir. Araç QR'ın köpek tasması sürümüdür; önce web sitesi hazırlandı, Android uygulaması sonra gelecek.

## Özellikler

- **İlk giriş tanıtımı**: reels gibi yukarı kaydırılan 5 tam ekran slayt (ana sayfadaki “30 saniyede tanıyın” ile tekrar izlenir)
- **Bulan kişi ekranı** (`?k=KOD`): sahibini arama, WhatsApp, SMS, yedek numara, sahibinin notu (sağlık, karakter)
- **Konum gönderme**: bulan kişi izin verirse konumu sahibinin rozet sayfasına kaydedilir ve WhatsApp/SMS mesajına harita bağlantısı eklenir
- **Kayıp modu ve ödül**: kayıp modu açıkken QR'ı okutan kişi kırmızı “KAYIP” uyarısını görür
- **Web'den rozet oluşturma** (`#olustur`): köpeğin adı ve telefonla anında QR rozet; PIN ile düzenleme
- **Rozetlerim** (`#kunyelerim`): bu cihazdaki rozetler, okutma sayısı, son konumlar, yazdırma ve PDF
- **11 tasarım, 7 ölçü**: yuvarlak Ø25–Ø40 mm, dikdörtgen 35×50–50×75 mm
- **Silme**: sahibi PIN ile rozeti siler (okutmalar ve konumlar da silinir; yönetimden basılan rozet boşa çıkar ve PIN kartıyla yeniden bağlanabilir). Yönetimde kullanılmamış rozetler silinebilir
- **Hazır rozet talep formu** ve **basılı rozet siparişi** (IBAN ile ödeme, Telegram/e-posta bildirimi)
- **Yönetim** (`?admin`): PIN kartlı rozet üretme/yazdırma, talepler, siparişler, satış ayarları

## Kurulum

1. **Veritabanı**: Supabase > SQL Editor'da `supabase/kurulum.sql` dosyasını açın, en üstteki `v_sifre` satırına admin şifrenizi (en az 10 karakter) yazıp **Run**'a basın. Güncelleme geldiğinde dosyayı yeniden çalıştırmanız yeterli (veriler korunur, şifre satırını `BURAYA-SIFRE` bırakırsanız şifre değişmez). Supabase projesi `index.html`'in başındaki `SUPABASE_URL` ve `SUPABASE_KEY` ile seçilir.
2. **Yayın**: GitHub > Settings > Pages > Branch: `main` / root. Site `https://yusufbas34.github.io/tasmaqr/` adresinde açılır (adres farklıysa `index.html` içindeki `SITE_URL`'i güncelleyin; rozetlere basılan QR bu adresi açar).
3. **Yönetim**: `https://yusufbas34.github.io/tasmaqr/?admin`

## Dosyalar

- `index.html`: sitenin tamamı
- `shared/intro.js`: tasmaya asılı rozet görseli ve ilk giriş tanıtımı
- `shared/tag.js`, `shared/tag.css`: rozet tasarımları ve ölçüleri (Android uygulaması da kullanacak)
- `supabase/kurulum.sql`: veritabanı (tek dosya, tekrar çalıştırmak güvenli)
