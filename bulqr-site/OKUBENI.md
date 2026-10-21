# Bul QR ortak giriş sayfası (bulqr.com.tr)

Bu klasör, Tasma QR ve Araç QR'ı tanıtan ana sayfadır. Tasma QR reposundan ayrı, **kendi reposunda** yayınlanır.
GitHub'da her repo tek bir alan adı alabilir: bu klasör `bulqr.com.tr`, tasmaqr reposu `tasma.bulqr.com.tr`, aracqr reposu `arac.bulqr.com.tr`.

## Yayınlama

1. GitHub'da yeni bir **public** repo açın, örneğin `bulqr`.
2. Bu klasörün **içindekileri** (klasörün kendisini değil) reponun köküne yükleyin: `index.html`, `404.html`, `CNAME`, `.nojekyll`, `logo.svg`, `tasma.svg`, `arac.svg`, `fonts.css`, `fonts/`.
3. Repo › Settings › Pages › Branch: `main` / root › Save.
4. Custom domain alanında `bulqr.com.tr` görünür (CNAME dosyasından). Doğrulanınca **Enforce HTTPS**'i işaretleyin.

## DNS (Cloudflare, hepsi bulut gri / DNS only)

| Tür | Ad | Değer | Ne için |
|---|---|---|---|
| A | `@` | `185.199.108.153` / `.109.153` / `.110.153` / `.111.153` | bulqr.com.tr (bu sayfa) |
| CNAME | `www` | `yusufbas34.github.io` | www.bulqr.com.tr → bulqr.com.tr |
| CNAME | `tasma` | `yusufbas34.github.io` | Tasma QR |
| CNAME | `arac` | `yusufbas34.github.io` | Araç QR |

## Notlar

- `bulqr.com.tr/?k=KOD` ya da `?admin` ile gelen biri otomatik olarak Tasma QR'a yönlendirilir.
- Araç QR bağlantıları şimdilik `yusufbas34.github.io/aracqr/` adresini açar. aracqr reposuna `arac.bulqr.com.tr` alan adı verilince GitHub bu adresi kendiliğinden yeni adrese yönlendirir; isterseniz bağlantıları sonra `https://arac.bulqr.com.tr/` yapabilirsiniz.
- Yazı tipleri Barlow ve Barlow Condensed (SIL OFL 1.1, `fonts/OFL.txt`).
