# Google Play'e yükleme rehberi

Bu dosyada sırasıyla şunlar var: imza anahtarı, AAB derleme, Play Console adımları, test süreci,
Veri güvenliği formu cevapları ve mağaza metinleri. Görseller `android/store/` klasöründe.

## 0. Uygulamada Play için yapılanlar

- **İki sürüm derlenir.** `github` sürümü elden kurulan APK'dır; yeni sürüm olunca GitHub'dan haber verir.
  `play` sürümü (AAB) kendini güncellemez, GitHub'a hiç bağlanmaz. Güncellemeyi Play Store yapar; bu Play'in kuralıdır.
- **Hedef API 36** (Android 16), en düşük Android 10.
- **Yeni geri hareketi** (Android 13+ "predictive back") desteklenir.
- **Gizlilik politikası:** https://tasma.bulqr.com.tr/gizlilik.html
- **Veri silme:**
  - Uygulama içinde iki yol var: rozet sayfasında "Rozeti sil", Profilim sekmesinde "Tüm verilerimi sil".
  - Web'de: https://tasma.bulqr.com.tr/gizlilik.html#silme
- **İzinler:**
  - İnternet ve ağ durumu
  - Bildirim (Android 13+ bir kez sorulur): konum gönderildi / kayıp modunda rozet okutuldu / sipariş ilerledi
  - Açılışta başlama: bildirim kontrolü telefon yeniden başlayınca da sürsün diye

  Konum, kamera, rehber ve dosya izni yok. Hiçbiri Play'de ek beyan istemez.
- **Uygulama düzeni (site gibi):** üst bar (geri tuşu + sayfa adı) ve 5 alt sekme: **Ana sayfa · Rozetlerim · Rozetler · Siparişler · Profil**; Nasıl çalışır, SSS ve Hazır rozet alt sayfa.
  Profilim'de teslimat bilgileri, bildirimler, "Arkadaşına öner", gizlilik politikası ve "Tüm verilerimi sil" var.
- **Arkadaşına öner** Play sürümünde Play Store bağlantısını paylaşır (GitHub APK bağlantısı Play sürümünde hiç görünmez).
- **Ödeme:** Rozet fiziksel bir ürün olduğu için havale/EFT ile satılabilir; Play Faturalandırma zorunlu değildir
  (Play'in ödeme politikası yalnızca dijital ürün ve abonelikler için geçerlidir).
- **Tasarım kilidi:** Rozetin tasarımı oluştururken seçilir, ücretsiz baskıda değiştirilemez; yeni tasarım siparişte seçilir
  ve ödeme onaylanınca rozete işlenir.

## Kısa yol (Araç QR'ı yüklediyseniz)

1. **Anahtar:** Araç QR için oluşturduğunuz `anahtar.txt` ve şifreyle, Tasma QR deposuna aynı 4 gizli değeri ekleyin (2. bölüm; `PLAY_KEY_ALIAS` = `aracqr`). Aynı yükleme anahtarını iki uygulamada kullanmak serbesttir; Play her uygulamayı kendi uygulama imzalama anahtarıyla imzalar.
2. **Paket:** GitHub › tasmaqr › Actions › **Android** › Run workflow. Bitince imzalı paket şuradan iner:
   https://github.com/yusufbas34/tasmaqr/releases/download/play-son/tasma-qr-play.aab
3. **Play Console:** Uygulama oluştur › formlar (4. ve 6. bölüm) › Mağaza girişi (7. bölüm) › Test › Kapalı test › Yeni sürüm › AAB'yi yükle.
4. **Testçiler:** Kapalı test › Testçiler'e Araç QR'daki grubu (`ara-qr-test@googlegroups.com`) ekleyin, testçilere
   https://tasma.bulqr.com.tr/test.html sayfasını gönderin (8. bölümdeki WhatsApp mesajı).
5. **14 gün sonra:** Üretim erişimi başvurusu (8. bölümdeki cevap taslakları).

## 1. Yükleme anahtarı oluşturun (bir kez, kendi bilgisayarınızda)

Java yüklü bir bilgisayarda (Android Studio ile gelir):

```
keytool -genkeypair -v -keystore tasmaqr-play.jks -alias tasmaqr -keyalg RSA -keysize 4096 -validity 10000
```

Bir şifre sorar; ad-soyad vb. soruları doldurun. Çıkan `tasmaqr-play.jks` dosyasını ve şifreyi
**kaybetmeyin ve kimseyle paylaşmayın**. Depoya (GitHub'a) KOYMAYIN. Bir yere yedekleyin.

Play App Signing kullanıldığı için bu dosya yalnızca "yükleme anahtarı"dır. Kaybederseniz Play Console'dan
sıfırlatabilirsiniz, uygulama kaybolmaz.

Dosyayı metne çevirin:

- Mac / Linux: `base64 -i tasmaqr-play.jks | tr -d '\n' > anahtar.txt`
- Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("tasmaqr-play.jks")) > anahtar.txt`

Araç QR için oluşturduğunuz anahtarı da kullanabilirsiniz (kısa yol); ayrı anahtar biraz daha güvenlidir ama zorunlu değildir.

## 2. Anahtarı GitHub'a gizli olarak ekleyin

GitHub › tasmaqr deposu › Settings › Secrets and variables › Actions › **New repository secret**.
Dört tane ekleyin:

| Ad | Değer |
|---|---|
| `PLAY_KEYSTORE_BASE64` | `anahtar.txt` dosyasının tamamı |
| `PLAY_KEYSTORE_PASSWORD` | keytool'da verdiğiniz şifre |
| `PLAY_KEY_ALIAS` | `tasmaqr` (Araç QR anahtarını kullanıyorsanız `aracqr`) |
| `PLAY_KEY_PASSWORD` | aynı şifre (keytool ayrı sormadıysa) |

Sonra `anahtar.txt` dosyasını silin.

## 3. AAB dosyasını alın

Anahtar GitHub'a eklendikten sonra her derlemede imzalı paket şu sabit bağlantıya konur (telefondan da indirilir):
https://github.com/yusufbas34/tasmaqr/releases/download/play-son/tasma-qr-play.aab

GitHub › Actions › **Android** › Run workflow ile çalıştırın (ya da main'e bir gönderim yapın).
Bitince çalışmanın sayfasının altında, Artifacts bölümünde **tasma-qr-play-aab** belirir. İndirin; içinden
`tasma-qr-play.aab` çıkar. Play Console'a bu dosya yüklenir. Anahtar eklenmemişse dosyanın adı `tasma-qr-play-imzasiz.aab` olur;
Play bunu kabul etmez, önce imzalayın (8. bölümün sonu).

Sürüm numarası her derlemede otomatik artar, bu yüzden her güncellemede yeni AAB'yi yüklemeniz yeterli.

## 4. Play Console adımları

1. https://play.google.com/console adresinden giriş yapın. Araç QR için açtığınız geliştirici hesabı yeterli; yeniden ödeme yok.
2. **Uygulama oluştur:**
   - Ad: Tasma QR
   - Dil: Türkçe
   - Uygulama, Ücretsiz
3. **Uygulama içeriği** bölümündeki formlar (cevaplar aşağıda, 6. bölümde):
   - Gizlilik politikası: `https://tasma.bulqr.com.tr/gizlilik.html`
   - Uygulama erişimi: "Tüm işlevler özel erişim olmadan kullanılabilir"
   - Reklamlar: Hayır
   - İçerik derecelendirmesi anketi: Kategori "Yardımcı program / üretkenlik". Şiddet, cinsellik, kumar vb. sorulara hep Hayır. Kullanıcılar birbiriyle iletişim kurabilir mi sorusuna: Hayır (rozeti okutan, telefonun kendi arama/SMS/WhatsApp uygulamasıyla arar; uygulamada sohbet yok).
   - Hedef kitle: 18 yaş ve üzeri (evcil hayvan sahipleri)
   - Haber uygulaması: Hayır
   - Veri güvenliği: 6. bölüm
   - Devlet uygulaması: Hayır
   - Finansal özellikler: Yok
   - Sağlık: Yok
4. **Mağaza girişi:** metinler 7. bölümde, görseller `android/store/` klasöründe.
5. **Test › Kapalı test:**
   - Kanal oluşturun ve testçileri ekleyin (5. bölüm).
   - AAB'yi yükleyin. Sürüm notunu yazıp yayınlayın.
6. Şartlar dolunca **Üretim** için erişim başvurusu yapın ve yayınlayın.

> **Önemli: telefonunuzdaki APK.**
> Play sürümü farklı bir anahtarla imzalıdır. GitHub APK'sı kurulu bir telefona Play'den kurmak için önce APK'yı kaldırmak gerekir.
> Kaldırınca telefondaki rozet listesi ve PIN'ler silinir; rozetler çalışmaya devam eder.
> Kaldırmadan önce her rozetin kodunu ve PIN'ini not edin; Play sürümünde Rozetlerim › "Elimdeki rozeti ekle" ile geri eklersiniz.

## 5. Test: 12 kişi, 14 gün

Google, **2023'ten sonra açılan kişisel hesaplarda** her yeni uygulama için üretime çıkmadan önce şunu şart koşar:

- **Kapalı testte en az 12 kişi**
- **14 gün boyunca kesintisiz** uygulamaya katılmış olmalı

Araç QR'ın testi bu uygulamaya sayılmaz; aynı testçi grubunu yeniden kullanabilirsiniz.

Pratik yol:

1. Araç QR için açtığınız Google Grubunu (`ara-qr-test`) kullanın; aynı kişiler iki uygulamayı da test eder. 15-20 kişi olsun; düşen olursa sayı 12'nin altına inmesin. Kedi/köpek sahibi arkadaşlar en iyi testçidir.
2. Kapalı test kanalında "Testçiler" sekmesine bu grubu yazın.
3. Console'un verdiği **katılım bağlantısını** (opt-in link) WhatsApp'tan paylaşın. Her kişi şunları yapar:
   - Bağlantıyı Android telefonunda, gruba eklenen Gmail hesabıyla açar ve "Test kullanıcısı ol"a basar.
   - Aynı sayfadaki Play Store bağlantısından uygulamayı kurar.
   - 14 gün boyunca **kaldırmaz**, ara sıra açar.
4. Testçilerden 14 gün içinde şunları denemelerini isteyin; bunlar sizin de test listenizdir:
   - İlk açılış tanıtımı, rozet oluşturma, tasarım ve ölçü seçme
   - Yazdırma ya da PDF paylaşma
   - Başka bir telefonla rozeti okutup "Sahibimi ara"nın çalışması
   - Okutan telefondan "Konumumu gönder": sahibine **bildirim geliyor mu** (15-30 dakika sürebilir), rozet sayfasında konum görünüyor mu
   - Kayıp modunu açıp okutunca kırmızı uyarı ve bildirim
   - Bilgileri düzenleme (not, yedek numara, ödül)
   - Sipariş verme: Telegram/e-postaya düşüyor mu, durum değişince bildirim geliyor mu
   - Rozet silme ve Tüm verilerimi sil
5. Bu sürede en az bir güncelleme yayınlamanız iyi olur. Google "aktif geliştirme" görmek ister; gelen geri bildirimlere göre küçük bir düzeltme yeterli.
6. 14 gün dolunca Console › Panel'de "Üretim erişimi başvurusu" açılır. Sorulara açık cevap verin:
   - Testi nasıl yaptınız: kedi ve köpek sahibi arkadaş grubu, WhatsApp
   - Ne geri bildirim aldınız
   - Ne değiştirdiniz

   Onay genelde birkaç gün sürer.

Kendi testiniz için: kapalı test yerine **Dahili test** kanalına da yükleyebilirsiniz. 100 kişiye kadar, inceleme
beklemeden dakikalar içinde kurulur, ama 14 gün şartına sayılmaz.

## 6. Veri güvenliği formu cevapları

Gizlilik politikasıyla birebir aynı olmalı. Biri değişirse diğerini de güncelleyin.

- Uygulama kullanıcı verisi topluyor ya da paylaşıyor mu: **Evet**
- Veriler aktarım sırasında şifreleniyor mu: **Evet** (HTTPS)
- Kullanıcılar verilerinin silinmesini isteyebilir mi: **Evet**
  - Silme bağlantısı: `https://tasma.bulqr.com.tr/gizlilik.html#silme`
  - Uygulama içinde silme de var.
- Hesap oluşturma: **Yok**. Hesap olmadığı için "hesap silme bağlantısı" zorunlu değildir, yine de silme sayfası var.

Toplanan veri türleri:

| Tür | Toplanıyor | Paylaşılıyor* | İsteğe bağlı mı | Amaç |
|---|---|---|---|---|
| Kişisel bilgi › Ad | Evet (yedek kişinin adı; siparişte ad soyad) | Hayır | İsteğe bağlı | Uygulama işlevi |
| Kişisel bilgi › E-posta | Evet (siparişte ve isteğe bağlı kurtarma e-postası) | Hayır | İsteğe bağlı | Uygulama işlevi, hesap yönetimi, iletişim |
| Kişisel bilgi › Telefon numarası | Evet | Hayır | Zorunlu (uygulamanın amacı) | Uygulama işlevi |
| Kişisel bilgi › Adres | Evet (yalnızca siparişte) | Hayır | İsteğe bağlı | Uygulama işlevi (kargo) |
| Uygulama etkinliği › Diğer kullanıcı tarafından oluşturulan içerik (hayvanın adı, bulan kişiye not, ödül notu) | Evet | Hayır | İsteğe bağlı | Uygulama işlevi |
| Uygulama etkinliği › Diğer işlemler (okutma zamanı) | Evet | Hayır | Zorunlu | Uygulama işlevi (okutma sayacı) |
| Cihaz veya diğer kimlikler | Evet (uygulamanın ürettiği rastgele kimlik) | Hayır | Zorunlu | Dolandırıcılığı önleme, güvenlik |

\* Play'in tanımında hizmet sağlayıcıya (Supabase, Telegram, e-posta servisi, üretim ve kargo firması) sizin adınıza
veri vermek "paylaşma" sayılmaz. Bu yüzden "Paylaşılıyor" sütunu Hayır.

**Konum hakkında:** Uygulama konum izni istemez ve telefonunuzun konumunu hiçbir zaman göndermez. Konumu, hayvanı
bulan kişi *web sayfasında* kendi isteğiyle gönderir; uygulama yalnızca sahibine bunu gösterir. Bu yüzden formda
**Konum: toplanmıyor** cevabı doğrudur. İnceleme ekibi sorarsa bu açıklamayı yazın. İsterseniz temkinli olmak için
"Konum › Kesin konum: toplanıyor, isteğe bağlı, uygulama işlevi" olarak da beyan edebilirsiniz; ikisi de kural dışı değildir.

Kişiler, fotoğraf, finans, sağlık, mesaj, dosya, takvim, web geçmişi, reklam kimliği ve çökme kaydı: **toplanmıyor**.

## 7. Mağaza metinleri

**Uygulama adı** (en fazla 30): `Tasma QR: Evcil Hayvan Künyesi`

**Kısa açıklama** (en fazla 80): `Kedi, köpek ve tüm dostlara QR künye: bulan kişi sizi tek dokunuşla arasın.`

**Tam açıklama:**

```
Kediniz, köpeğiniz ya da başka bir dostunuz bir anda gözden kaybolursa onu bulan kişi size nasıl ulaşacak? Tasma QR ile evcil hayvanınızın tasmasına künye gibi takılan bir QR rozet olur. Bulan kişi rozeti telefon kamerasıyla okutur; evcil hayvanınızın adını ve notunuzu görür, sizi tek dokunuşla arar ya da WhatsApp'tan yazar. Uygulama indirmesine gerek yoktur.

★ Konumunu gönderir, size bildirim gelir
Bulan kişi "Konumumu gönder"e basınca bulunduğu yer harita bağlantısıyla size iletilir. Uygulama size hemen bildirim gösterir; son konumları rozet sayfanızda görürsünüz.

★ Kayıp modu ve ödül
Evcil hayvanınız kaybolunca tek dokunuşla kayıp modunu açın. Rozeti okutan herkes kırmızı "KAYIP!" uyarısını ve ödül notunuzu görür; rozet her okutulduğunda size haber veririz.

★ Numaranız rozette yazmaz
Yoldan geçen herkes numaranızı göremez. Numaranız güvenli sunucuda durur; PIN'inizle istediğiniz an değiştirirsiniz, rozeti yeniden yaptırmanız gerekmez.

★ Sağlık ve karakter notu
"Kalp ilacı kullanıyor", "çekingendir, yavaş yaklaşın" gibi bilgileri ve yedek bir numarayı bulan kişi görür.

★ Tasarımını seç, rozetin kapına gelsin
12 tasarım, Ø25'ten Ø35 mm'ye ölçüler. Ücretsiz oluşturup evde yazdırın ya da renkli epoksi veya paslanmaz çelik lazer rozetinizi sipariş edin; halkasıyla gelir, tasmanın D halkasına takarsınız.

Hesap açmanız gerekmez. Reklam yok. Verilerinizi istediğiniz an uygulamadan silebilirsiniz.

Instagram: @tasmaqr

Not: Tasma QR mikroçipin yerine geçmez; evcil hayvanınızı bulan kişinin size dakikalar içinde ulaşabilmesi için ek bir önlemdir.
```

**Kategori:** Evcil hayvanlar için uygun bir kategori yok; **Yaşam Tarzı (Lifestyle)** önerilir.
**Etiketler:** evcil hayvan, köpek, kedi, kayıp, QR kod
**İletişim e-postası:** Play bu adresi mağazada herkese gösterir; gizlilik sayfası silme talepleri için bu adresi gösteriyor.
**Web sitesi:** `https://tasma.bulqr.com.tr/`
**Instagram:** `https://www.instagram.com/tasmaqr` (tam açıklamanın sonuna “Instagram: @tasmaqr” satırı eklendi)

**İlk sürüm notu:** `İlk sürüm: QR rozet oluşturma, kayıp modu, konum bildirimi, renkli epoksi ve metal rozet siparişi.`

**Görseller** (`android/store/`):

- `icon-512.png`: uygulama simgesi
- `feature-1024x500.png`: öne çıkan görsel
- `screen-*.png`: telefon ekran görüntüleri, 1080×1920 (8 adet; Play en az 2, en fazla 8 ister)

## 8. Hazır metinler (kopyala-yapıştır)

### Testçi sayfası
https://tasma.bulqr.com.tr/test.html: gruba katılma, test bağlantısı, Play'den indirme ve denenecekler.
Grup bağlantısı (`ara-qr-test`) ve Play katılım bağlantısı (`play.google.com/apps/testing/io.github.yusufbas34.tasmaqr`) sayfada hazır.
Katılım bağlantısı, kapalı test sürümü yayınlanınca çalışmaya başlar. Play Console farklı bir bağlantı gösterirse bana gönderin, sayfaya yazayım.

### WhatsApp davet mesajı

```
Selam! 🐾 Araç QR'dan sonra evcil hayvanlar için de bir uygulama yaptım: Tasma QR. Hayvanın tasmasına QR rozet takılıyor; evcil hayvan kaybolursa bulan kişi rozeti okutup sahibini tek dokunuşla arıyor, istersen konumunu da gönderiyor.

Bunun da Google Play'e çıkması için 14 gün test eden 12 kişi lazım. Araç QR testine katıldıysan grup aynı, sadece test bağlantısına dokunup kurman yeterli:
👉 https://tasma.bulqr.com.tr/test.html

Hayvanın olmasa da olur. Çok teşekkürler! 🙏
```

### Güncelleme sürüm notu (yeni düzen)

- **Türkçe:** `Artık kedi, köpek ve tüm evcil hayvanlar için. Yeni Kedi yüzü tasarımı; Rozetlerim, Siparişlerim ve Profilim sekmeleri.`
- **English:** `Now for cats, dogs and all pets. New Cat face design; My tags, My orders and Profile tabs.`

Ekran görüntüleri yeni düzene göre yenilendi (`android/store/screen-5`, `screen-6`, `screen-7`). Mağaza girişinde bu üçünü yenileriyle değiştirin.

### Sürüm notu (kapalı test ve ilk yayın)

- **Türkçe:** `İlk sürüm: QR rozet oluşturma, kayıp modu, konum ve okutma bildirimi, 12 tasarım, epoksi ve metal rozet siparişi.`
- **English:** `First release: create QR pet tags, lost mode, location and scan notifications, 12 designs, epoxy and metal tag orders.`

### Üretim erişimi başvurusu (14 gün sonra) cevap taslakları
Play Console sorularına kendi deneyiminizle tamamlayın; testte gerçekten olanları yazın.

1. **Testçileri nasıl buldunuz?** `Aile, arkadaşlar ve çevremdeki evcil hayvan sahipleri; WhatsApp üzerinden Google Grubu ile davet ettim.`
2. **Testçi bulmak ne kadar kolaydı?** `Kolaydı; evcil hayvan sahipleri kaybolma korkusunu yakından biliyor ve uygulamayı denemek istedi.`
3. **Testçiler uygulamayı nasıl kullandı?** `Rozet oluşturdular, başka telefonla okutup aramayı ve WhatsApp'ı, konum göndermeyi, kayıp modunu, bildirimleri, bilgi düzenlemeyi, PDF paylaşmayı ve rozet silmeyi test ettiler.`
4. **Hangi geri bildirimleri aldınız, nasıl topladınız?** `WhatsApp üzerinden topladım. (Buraya gerçek örnekler.)`
5. **Geri bildirime göre ne değiştirdiniz?** `(Buraya yapılan düzeltmeler; test sırasında yayınlanan güncellemeleri yazın.)`
6. **Uygulama kime yönelik, ne değer sağlıyor?** `Türkiye'deki evcil hayvan sahipleri. Kedi ya da köpek kaybolduğunda onu bulan kişinin, sahibinin numarası künyede yazmadan, sahibine dakikalar içinde ulaşmasını ve konum göndermesini sağlar.`
7. **İlk yıl beklenen indirme:** `1.000 – 10.000`
8. **Yayına hazır olduğuna nasıl karar verdiniz?** `14 günlük testte çökme ya da kritik hata kalmadı, testçilerin bildirdiği sorunlar düzeltildi.`

Çökme olup olmadığını Play Console › **Android vitals** bölümünden kontrol edin.

### İmzasız AAB'yi imzalama (GitHub'a anahtar eklemediyseniz)
GitHub Actions anahtar yoksa `tasma-qr-play-imzasiz.aab` üretir. Java yüklü bir bilgisayarda:

```
jarsigner -keystore tasmaqr-play.jks -sigalg SHA256withRSA -digestalg SHA-256 -signedjar tasma-qr-play.aab tasma-qr-play-imzasiz.aab tasmaqr
```

(Araç QR anahtarıyla: `-keystore aracqr-play.jks` ve sondaki ad `aracqr`.)
Kolay yol: 2. bölümdeki 4 gizli değeri GitHub'a bir kez ekleyin; sonra her derleme imzalı `tasma-qr-play.aab` verir.
