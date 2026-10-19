// Tasma QR kullanım kitapçığı: rozeti alan kişiye tanıtım ve kullanım kılavuzu. 4 sayfa A6 (105×148 mm).
// Baskı: A4 dikey, çift taraflı (uzun kenardan çevir). Her yüzde aynı açılımdan 2 tane (üst/alt); ön yüz 4 | 1, arka yüz 2 | 3.
// Kâğıt ortadan yatay kesilir, her yarı ortadan katlanınca sayfalar 1-2-3-4 sırasıyla okunur: bir A4'ten 2 kitapçık.
// opt: {site, phone, instagram, email}
function kitPages(opt) {
  const site = opt.site, logo = `<img src="shared/logo.svg" alt="">`;
  const brand = `<div class="brandline">${logo}Tasma QR</div>`;
  const rows = [opt.phone && `📞 <b>${esc(opt.phone)}</b>`, opt.instagram && `📷 <b>@${esc(opt.instagram.replace(/^@/, ""))}</b>`,
    opt.email && `✉️ ${esc(opt.email)}`].filter(Boolean);
  const contact = rows.length ? rows.map(r => `<span>${r}</span>`).join("") : `<span>Sorularınız için uygulamadaki iletişim bilgilerinden bize ulaşın.</span>`;
  const badge = (design, name, size = "y40") => badgeAt("ÖRNEK", design, size, {link: site, name});
  return [
    // 1 · kapak
    `<div class="kp cover"><div class="pad">
      ${brand}
      <div class="tagline" style="margin-top:6mm">Kullanım kılavuzu</div>
      <h1 class="title">Rozetiniz<br><em>hazır!</em></h1>
      <p class="lead">Kaybolursa onu bulan kişi bu rozeti telefonuyla okutur; sizi tek dokunuşla arar, yerini gönderir. Kurulum bir dakika sürer.</p>
    </div>
    <div class="collarbox">${collarHtml(badge("turuncu", "DOSTUM"), "#163a7a")}</div>
    <div class="band">Uygulama gerekmez · Numaranız rozette yazmaz</div></div>`,

    // 2 · kurulum
    `<div class="kp"><div class="pad">
      <div class="tagline">İlk iş</div>
      <h2 class="h-sec">3 adımda kurulum</h2>
      <ol class="ksteps">
        <li><div><b>QR'ı okutun</b><span>Telefon kameranızı rozetteki QR'a tutun, açılan bağlantıya dokunun. Uygulama indirmeniz gerekmez.</span></div></li>
        <li><div><b>PIN'i girin, bilgilerinizi yazın</b><span>Önce <b>PIN kartındaki 6 haneli PIN'i</b> girin. Ardından evcil hayvanınızın adını ve size ulaşılacak numarayı yazıp kaydedin; isterseniz not ve yedek numara ekleyin.</span></div></li>
        <li><div><b>Tasmaya takın</b><span>Halkayı rozetin kulağındaki delikten ve tasmanın D halkasından geçirin. Hazır!</span></div></li>
      </ol>
      <div class="tip"><b>Deneyin:</b> Kurulumdan sonra rozeti bir kez okutun; bulan kişinin göreceği ekranı siz de görün.</div>
      <div class="tip"><b>Kediler için:</b> güvenlik kilitli (çekince açılan) kedi tasması kullanın.</div>
      <div class="knote"><b>PIN kartını saklayın.</b> Bilgileri değiştirmek ve kayıp modunu açmak için gerekir; tasmada bırakmayın.</div>
    </div><div class="pno">2</div></div>`,

    // 3 · kaybolursa ve güncelleme
    `<div class="kp"><div class="pad">
      <div class="klost"><h3>🚨 Kaybolursa</h3><ol>
        <li>Rozeti okutun (ya da uygulamada rozetinizi açın).</li>
        <li><b>Bilgileri düzenle</b>'ye dokunun, PIN'inizi girin.</li>
        <li><b>Kayıp modu</b>nu açın; isterseniz ödül notu yazın.</li></ol></div>
      <div class="blk"><h3>👀 Bulan kişi ne görür?</h3><ul>
        <li><b>Adını ve notunuzu</b> (sağlık, karakter…)</li><li><b>Sahibimi ara</b>, WhatsApp ve SMS butonları</li>
        <li><b>Konumumu gönder</b>: bulunduğu yer haritayla size gelir</li><li>Kayıp modu açıksa kırmızı <b>KAYIP</b> uyarısı</li></ul></div>
      <div class="blk"><h3>✏️ Bilgileri güncelleyin</h3>
        <p>Numaranız değişti mi, not eklemek mi istiyorsunuz? Rozeti okutun, sayfanın altındaki <b>Bilgileri düzenleyin</b>'e dokunun ve PIN'inizle kaydedin. Rozet aynı kalır, yeniden yaptırmanız gerekmez.</p></div>
      <div class="blk" style="margin-bottom:0"><h3>📱 Uygulama</h3>
        <p>Android uygulamasında rozetlerinizi, okutmaları ve gelen konumları görür; konum gelince bildirim alırsınız.</p></div>
    </div><div class="pno">3</div></div>`,

    // 4 · arka kapak: not alanı, bakım, iletişim
    `<div class="kp cover"><div class="pad">
      ${brand}
      <h3 style="font-size:4.6mm;margin-top:4mm">Bilgilerim</h3>
      <div class="fill"><div>Hayvanımın adı</div><div>Kayıtlı telefon</div><div>Rozet kodu</div><div>PIN</div></div>
      <div class="blk"><h3>🧼 Bakım ve güvenlik</h3><ul>
        <li>Suya dayanıklıdır; arada ılık su ve yumuşak bezle silin.</li>
        <li>Halkayı ara sıra kontrol edin, gevşerse sıkıştırın.</li>
        <li>Numaranız rozette yazmaz; yalnızca okutan kişi arama ekranında görür.</li>
        <li>Mikroçipin yerine geçmez; ek bir önlemdir.</li></ul></div>
      <div class="qrrow">${qrSvg(site)}<div><b>Uygulamayı indirin</b><span>Okutun; rozetlerinizi yönetin, konum gelince haber alın.</span></div></div>
    </div>
    <div class="contact"><div>${contact}</div><div style="text-align:right"><b>Tasma QR</b><span class="micro">Evcil hayvanınız için akıllı künye</span></div></div></div>`,
  ];
}

// A4 baskı düzeni: ön yüz ve arka yüz; her yüzde aynı açılımdan 2 kitapçık (üst ve alt yarı)
const kitSheets = pages => [[3, 0], [1, 2]].map(([l, r]) => {
  const spread = `<div class="spread">${pages[l]}${pages[r]}</div>`;
  return `<div class="kit-sheet">${spread}${spread}</div>`;
});
