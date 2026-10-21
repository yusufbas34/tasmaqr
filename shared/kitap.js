// Tasma QR kullanım kitapçığı: rozeti alan kişiye tanıtım ve kullanım kılavuzu, 4 sayfa.
// Sayfalar A6 (105×148 mm) ölçüsünde çizilir, baskıda A7'ye (74×105 mm) küçültülür: bir A4'ten 4 kitapçık.
// Baskı: A4 yatay, arkalı önlü (kısa kenardan çevir). Ön yüzde 4 kez 4 | 1, arka yüzde 4 kez 2 | 3.
// A4 işaretlerden 4 parçaya kesilir, her parça ortadan katlanınca sayfalar 1-2-3-4 sırasıyla okunur.
// Kapak, veteriner ve pet shop tezgâhında görünen yüzdür.
// opt: {site, phone, instagram, email, batch}. batch: stok partisi için kod/PIN alanları boş yer tutucu olarak çizilir
// (PDF'te her kitapçığın kodu ve PIN'i bu alanların üstüne yazılır; [data-fill] öğeleri).
// "@tasmaqr", "tasmaqr" ya da "https://www.instagram.com/tasmaqr/" → "tasmaqr"
const igHandle = v => String(v || "").trim().replace(/^@/, "").replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "");
const KIT_IG = "https://www.instagram.com/tasmaqr", KIT_PLAY = "https://play.google.com/store/apps/details?id=io.github.yusufbas34.tasmaqr";
function kitPages(opt) {
  const site = opt.site, logo = `<img src="${opt.root || ""}shared/logo.svg" alt="">`;  // root: sayfa alt klasördeyse (ör. "../../")
  const brand = `<div class="brandline">${logo}Tasma QR</div>`;
  const rows = [opt.phone && `📞 <b>${esc(opt.phone)}</b>`, igHandle(opt.instagram) && `📷 <b>@${esc(igHandle(opt.instagram))}</b>`,
    opt.email && `✉️ ${esc(opt.email)}`].filter(Boolean);
  const contact = rows.length ? rows.map(r => `<span>${r}</span>`).join("") : `<span>Sorularınız için uygulamadaki iletişim bilgilerinden bize ulaşın.</span>`;
  const badge = (design, name, size = "y40") => badgeAt("ÖRNEK", design, size, {link: site, name});
  return [
    // 1 · kapak: tezgâhta / rafta dikkat çeken yüz
    `<div class="kp hero"><div class="pad">
      <div class="brandline">${logo}Tasma QR</div>
      <div class="kicker">Kedi · Köpek · Tüm dostlar</div>
      <h1 class="big">Kaybolursa<br><span>sizi arasın.</span></h1>
      <p class="sub">Tasmaya takılan akıllı QR rozet. Bulan kişi okutur, sizi <b>tek dokunuşla arar</b>, yerini gönderir.</p>
    </div>
    <div class="glow"></div>
    <div class="collarbox">${collarHtml(badge("klasik", "DOSTUM"), "#1d2330")}</div>
    <div class="burst"><span>Uygulama<br>gerekmez</span></div>
    <div class="tryit">${qrSvg(KIT_IG)}<div><b>Okut, Instagram'da takip et!</b>
      <span>✓ Numaranız rozette yazmaz &nbsp;✓ Konum gönderme &nbsp;✓ Kayıp modu</span><small>@tasmaqr · İçinde: kurulum ve kullanım kılavuzu</small></div></div></div>`,

    // 2 · kurulum
    `<div class="kp"><div class="pad">
      <div class="tagline">İlk iş</div>
      <h2 class="h-sec">3 adımda kurulum</h2>
      <ol class="ksteps">
        <li><div><b>QR'ı okutun</b><span>Telefon kameranızı rozetteki QR'a tutun, açılan bağlantıya dokunun. Uygulama indirmeniz gerekmez.</span></div></li>
        <li><div><b>PIN'i girin, bilgilerinizi yazın</b><span>Önce <b>${opt.batch ? "3. sayfada yazan" : "PIN kartındaki"} 6 haneli PIN'i</b> girin. Ardından evcil hayvanınızın adını ve size ulaşılacak numarayı yazıp kaydedin; isterseniz not ve yedek numara ekleyin.</span></div></li>
        <li><div><b>Tasmaya takın</b><span>Halkayı rozetin kulağındaki delikten ve tasmanın D halkasından geçirin. Hazır!</span></div></li>
      </ol>
      <div class="tip"><b>Deneyin:</b> Kurulumdan sonra rozeti bir kez okutun; bulan kişinin göreceği ekranı siz de görün.</div>
      <div class="tip"><b>Kediler için:</b> güvenlik kilitli (çekince açılan) kedi tasması kullanın.</div>
      <div class="knote"><b>${opt.batch ? "Bu kitapçığı saklayın." : "PIN kartını saklayın."}</b> PIN, bilgileri değiştirmek ve kayıp modunu açmak için gerekir; tasmada bırakmayın.</div>
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
        <p>Rozeti okutun, <b>Bilgileri düzenleyin</b>'e dokunun, PIN'inizle kaydedin. Rozet aynı kalır.</p></div>
    </div>
    <div class="mine-box"><h3>Bilgilerim</h3>
      <div class="fill"><div>Hayvanımın adı</div><div>Kayıtlı telefon</div>
        <div class="v">Rozet kodu<b data-fill="code"></b></div><div class="v">PIN<b data-fill="pin"></b></div></div></div>
    <div class="pno">3</div></div>`,

    // 4 · arka kapak: not alanı, bakım, iletişim
    `<div class="kp cover"><div class="pad">
      ${brand}${opt.batch ? `<span class="code4">Rozet kodu <b data-fill="code4"></b></span>` : ""}
      <div class="blk" style="margin-top:5mm"><h3>🧼 Bakım ve güvenlik</h3><ul>
        <li>Suya dayanıklıdır; arada ılık su ve yumuşak bezle silin.</li>
        <li>Halkayı ara sıra kontrol edin, gevşerse sıkıştırın.</li>
        <li>Numaranız rozette yazmaz; yalnızca okutan kişi arama ekranında görür.</li>
        <li>Mikroçipin yerine geçmez; ek bir önlemdir.</li></ul></div>
      <div class="blk"><h3>📱 Uygulama</h3>
        <p>Android uygulamasında rozetlerinizi, okutmaları ve gelen konumları görür; konum gelince bildirim alırsınız.</p></div>
      <div class="qrrow">${qrSvg(KIT_PLAY)}<div><b>Uygulamayı indirin</b><span>Okutun, Google Play'den kurun; rozetlerinizi yönetin, konum gelince haber alın.</span></div></div>
    </div>
    <div class="contact"><div>${contact}</div><div style="text-align:right"><b>Tasma QR</b><span class="micro">Evcil hayvanınız için akıllı künye</span></div></div></div>`,
  ];
}

// A4 baskı düzeni: [ön yüz, arka yüz]; her yüzde 2×2 açılım, açılım = iki A7 sayfa
const KIT_FACES = [[3, 0], [1, 2]];
const kitSheets = pages => KIT_FACES.map(([l, r]) => {
  const spread = `<div class="spread"><div class="pg">${pages[l]}</div><div class="pg">${pages[r]}</div></div>`;
  return `<div class="kit-sheet">${spread.repeat(4)}<i class="cut h"></i><i class="cut v"></i>${[74.25, 222.75].map(x => `<i class="foldm" style="left:${x}mm"></i>`).join("")}</div>`;
});

// ---------------------------------------------------------------- kartvizit (85×55 mm)
// opt: {site, name, title, phone, email, instagram}. Ön: marka ve rozet; arka: kişi, iletişim ve siteyi açan QR.
function cardFaces(opt) {
  const ig = igHandle(opt.instagram);
  const lines = [opt.phone && `<span><i>📞</i>${esc(opt.phone)}</span>`, opt.email && `<span><i>✉️</i>${esc(opt.email)}</span>`,
    ig && `<span><i>📷</i>@${esc(ig)}</span>`, `<span><i>🌐</i>yusufbas34.github.io/tasmaqr</span>`].filter(Boolean).join("");
  const front = `<div class="bc bc-front">
      <div class="bc-brand"><img src="${opt.root || ""}shared/logo.svg" alt="">Tasma QR</div>
      <h2>Kaybolursa,<br><em>sizi arasın.</em></h2>
      <p>Kedi, köpek ve tüm dostlar için<br>tasmaya takılan QR künye</p>
      <div class="bc-badge">${badgeAt("ÖRNEK", "klasik", "y30", {link: opt.site, name: "DOSTUM"})}</div>
    </div>`;
  const back = `<div class="bc bc-back">
      <div class="bc-who">${opt.name ? `<b>${esc(opt.name)}</b>` : `<b>Tasma QR</b>`}<small>${esc(opt.title || "Evcil hayvan QR künye")}</small></div>
      <div class="bc-lines">${lines}</div>
      <div class="bc-qr">${qrSvg(opt.site)}<span>Okut, ücretsiz dene</span></div>
      <div class="bc-bar"></div>
    </div>`;
  return {front, back};
}

// ---------------------------------------------------------------- stok partisi kitapçıkları (yönetim ve uretim/3d ortak)
// rows: [{code, pin}]. Ortak sayfalar bir kez görüntülenir, her kitapçığa kendi kodu ve PIN'i vektör yazıyla basılır.
// A4 yatay, 4 kitapçık: ön yüzde (4 | 1), arka yüzde (2 | 3); arka yüz kısa kenardan çevrildiği için sütunlar yer değiştirir.
// window.html2canvas ve window.jspdf yüklenmiş olmalı. progress(metin) isteğe bağlı.
async function kitGuidesPdf(rows, opt, progress = () => {}) {
  const pages = kitPages({...opt, batch: true}), toast = progress;
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;left:-40000px;top:0";
  box.innerHTML = pages.join("");
  document.body.append(box);
  try {
    await Promise.all([...box.querySelectorAll("img")].map(i => i.decode().catch(() => {})));
    await document.fonts?.ready;
    const kps = [...box.querySelectorAll(".kp")], K = 105 / kps[0].getBoundingClientRect().width;  // px → mm (A6)
    const spot = (kp, key) => { const r = kp.getBoundingClientRect(), e = kp.querySelector(`[data-fill="${key}"]`).getBoundingClientRect();
      return {x: (e.left - r.left) * K, y: (e.top - r.top + e.height / 2) * K}; };
    const at = {code: spot(kps[2], "code"), pin: spot(kps[2], "pin"), code4: spot(kps[3], "code4")};
    const imgs = [];
    for (let i = 0; i < 4; i++) {
      toast(`Kitapçık sayfaları hazırlanıyor… ${i + 1}/4`, 120000);
      imgs.push((await html2canvas(kps[i], {scale: 4, backgroundColor: "#ffffff", logging: false})).toDataURL("image/jpeg", .92));
    }
    const pdf = new window.jspdf.jsPDF({unit: "mm", format: "a4", orientation: "landscape"});
    const W = 74.25, H = 105, S = W / 105;  // A6 → A7
    const marks = () => {
      pdf.setDrawColor(102).setLineWidth(.25).setLineDashPattern([], 0);
      [[0, 105, 4, 105], [293, 105, 297, 105], [148.5, 0, 148.5, 4], [148.5, 206, 148.5, 210]].forEach(a => pdf.line(...a));
      pdf.setDrawColor(150).setLineDashPattern([1, 1], 0);
      [74.25, 222.75].forEach(x => { pdf.line(x, 0, x, 3); pdf.line(x, 207, x, 210); });
    };
    const write = (text, x, y, size, space = 0) => {
      pdf.setFont("helvetica", "bold").setFontSize(size).setTextColor(29, 35, 48);
      pdf.text(String(text), x, y, {baseline: "middle", charSpace: space});
    };
    for (let s0 = 0; s0 < rows.length; s0 += 4) {
      const group = rows.slice(s0, s0 + 4);
      toast(`Kitapçıklar yerleştiriliyor… ${Math.min(s0 + 4, rows.length)}/${rows.length}`, 120000);
      if (s0) pdf.addPage("a4", "landscape");
      group.forEach((r, i) => {  // ön yüz: arka kapak | ön kapak
        const x = (i % 2) * 148.5, y = Math.floor(i / 2) * H;
        pdf.addImage(imgs[3], "JPEG", x, y, W, H, "kit-p4", "FAST");
        pdf.addImage(imgs[0], "JPEG", x + W, y, W, H, "kit-p1", "FAST");
        write(r.code, x + at.code4.x * S, y + at.code4.y * S, 7, .3);
      });
      marks();
      pdf.addPage("a4", "landscape");
      group.forEach((r, i) => {  // arka yüz: aynı kitapçık, sütunu ayna (kısa kenardan çevirme)
        const x = (1 - i % 2) * 148.5, y = Math.floor(i / 2) * H;
        pdf.addImage(imgs[1], "JPEG", x, y, W, H, "kit-p2", "FAST");
        pdf.addImage(imgs[2], "JPEG", x + W, y, W, H, "kit-p3", "FAST");
        write(r.code, x + W + at.code.x * S, y + at.code.y * S, 10, .4);
        write(r.pin, x + W + at.pin.x * S, y + at.pin.y * S, 11, 1);
      });
      marks();
    }
    return pdf;
  } finally { box.remove(); }
}
