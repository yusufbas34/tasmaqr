# Tasma QR Android uygulaması

Uygulama, sitenin kendisini (depo kökündeki `index.html`, `gizlilik.html` ve `shared/`) telefonda gösterir.
`index.html`, Android'in `AndroidBridge` nesnesini görünce **uygulama moduna** geçer:

- Açılış sayfası Rozetlerim olur (rozet yoksa karşılama ekranı); ilk açılışta tanıtım gösterilir.
- Yazdırma Android yazdırma ekranına, PDF İndirilenler/TasmaQR klasörüne kaydedilip paylaşma ekranına gider.
- Bilgileri düzenleme uygulama içinde açılır (`#duzenle/KOD`).
- Arka planda (`Notifier.java`, yaklaşık 15 dakikada bir) bildirim gösterir:
  - bulan kişi konum gönderince
  - kayıp modundaki rozet okutulunca
  - sipariş ilerleyince
  - yalnızca APK sürümünde, yeni sürüm çıkınca

Web ve uygulama böylece hep aynı koddan çalışır; siteye yapılan her düzeltme bir sonraki derlemede uygulamaya da girer.

## APK'yı indirme

`main` dalına her gönderimde GitHub Actions APK'yı derler ve şu sabit bağlantıya koyar:

https://github.com/yusufbas34/tasmaqr/releases/download/apk-son/tasma-qr.apk

Telefonda bağlantıyı açıp dosyayı indirin ve açın. İlk kurulumda Android "bilinmeyen kaynaklardan
yüklemeye izin ver" diye sorar. Yeni sürümler eskisinin üstüne kurulur, kayıtlı rozetler silinmez.

## Google Play

Adım adım anlatım (anahtar, AAB, Play Console, 12 kişi / 14 gün testi, Veri güvenliği cevapları, mağaza metinleri):
[GOOGLE_PLAY.md](GOOGLE_PLAY.md). Mağaza görselleri `store/` klasöründe.

## Kendiniz derlemek isterseniz

Android Studio ile `android` klasörünü açın ya da komut satırında:

```
cd android
./gradlew assembleGithubRelease
```

APK: `android/app/build/outputs/apk/github/release/app-github-release.apk`

İki sürüm vardır: `github` (elden kurulan APK, yeni sürümü kendisi haber verir) ve `play`
(Google Play'e yüklenen AAB, kendini güncellemez).

## Yapı

- `app/build.gradle`: `syncWebAssets` görevi siteyi derlemede `build/webassets` klasörüne kopyalar; uygulamanın içine bu girer.
- `MainActivity.java`: arayüzü gösterir; yazdırma, PDF kaydetme/paylaşma, bildirim izni.
- `Notifier.java`: arka plan bildirimleri. Supabase adresi ve anahtarı burada da yazılı (`index.html` ile aynı olmalı).
- `../shared/vendor`, `../shared/fonts`: çevrimdışı da çalışmak için gömülü kütüphaneler ve fontlar
  (lisanslar `vendor/LICENSES.txt` ve `fonts/OFL.txt`).

## İmza anahtarı hakkında

`app/tasmaqr-sideload.keystore` APK'yı elden dağıtmak (indirme bağlantısı) için konmuş, şifresi
`app/build.gradle` içinde açık duran bir anahtardır. Her sürüm aynı anahtarla imzalandığı için
güncellemeler eskisinin üstüne kurulur.

Google Play sürümü bu anahtarı kullanmaz; gizli yükleme anahtarı GitHub Secrets'tan gelir (GOOGLE_PLAY.md).
