// Tasma QR tanıtımı: tasmaya asılı rozet görseli ve ilk girişte reels gibi dikey kaydırılan tam ekran slaytlar.
// Gerekenler: shared/tag.js (tagHtml, icon, esc). Kullanım: showIntro({onCreate, onDone})

// Tasma ve D halkasına asılı, sallanan rozet. badge: rozetin HTML'i (tagAt ile)
function collarHtml(badge, color = "#b8501a") {
  const curve = dy => `M14 ${22 + dy}Q150 ${112 + dy} 286 ${22 + dy}`;
  return `<div class="collar">
    <svg class="strap" viewBox="0 0 300 120" aria-hidden="true">
      <path d="${curve(0)}" stroke="#0003" stroke-width="30" fill="none" stroke-linecap="round" transform="translate(0 4)"/>
      <path d="${curve(0)}" stroke="${color}" stroke-width="28" fill="none" stroke-linecap="round"/>
      <path d="${curve(-9)}" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-dasharray="5 5" fill="none"/>
      <path d="${curve(9)}" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-dasharray="5 5" fill="none"/>
      <g transform="translate(60 44) rotate(28)"><rect x="-13" y="-19" width="26" height="38" rx="5" fill="none" stroke="#d7dbe2" stroke-width="5"/>
        <path d="M0-17v34" stroke="#d7dbe2" stroke-width="4"/></g>
      <path d="M138 70a12 15 0 0 0 24 0" fill="none" stroke="#d7dbe2" stroke-width="5" stroke-linecap="round"/>
      <circle cx="150" cy="94" r="8" fill="none" stroke="#c4c9d2" stroke-width="3.5"/>
    </svg>
    <div class="hang">${badge}</div>
  </div>`;
}

// Küçük QR deseni (dekoratif): (x, y) sol üst, s kenar
function miniQr(x, y, s, fg = "#111418", bg = "#fff") {
  const c = s / 7, f = (fx, fy) => `<rect x="${x + fx * c}" y="${y + fy * c}" width="${c * 3}" height="${c * 3}" fill="${fg}"/>
    <rect x="${x + (fx + .7) * c}" y="${y + (fy + .7) * c}" width="${c * 1.6}" height="${c * 1.6}" fill="${bg}"/>
    <rect x="${x + (fx + 1.1) * c}" y="${y + (fy + 1.1) * c}" width="${c * .8}" height="${c * .8}" fill="${fg}"/>`;
  const dots = [[4, 0], [5, 1], [4, 2], [6, 4], [4, 4], [5, 5], [3, 5], [4, 6], [6, 6], [3, 3]]
    .map(([dx, dy]) => `<rect x="${x + dx * c}" y="${y + dy * c}" width="${c}" height="${c}" fill="${fg}"/>`).join("");
  return `<rect x="${x - c * .5}" y="${y - c * .5}" width="${s + c}" height="${s + c}" rx="${c * .6}" fill="${bg}"/>${f(0, 0)}${f(4, 0)}${f(0, 4)}${dots}`;
}

// Dekoratif yuvarlak rozet: merkez (cx, cy), yarıçap r
const miniBadge = (cx, cy, r, ring = "#e8742a") => `<circle cx="${cx}" cy="${cy - r - 5}" r="5" fill="none" stroke="#c4c9d2" stroke-width="2.5"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${ring}"/><circle cx="${cx}" cy="${cy}" r="${r * .72}" fill="#fff"/>${miniQr(cx - r * .42, cy - r * .42, r * .84)}`;

const phoneIcon = `<path d="M6.62,10.79c1.44,2.83 3.76,5.14 6.59,6.59l2.2,-2.2c0.27,-0.27 0.67,-0.36 1.02,-0.24 1.12,0.37 2.33,0.57 3.57,0.57 0.55,0 1,0.45 1,1V20c0,0.55 -0.45,1 -1,1 -9.39,0 -17,-7.61 -17,-17 0,-0.55 0.45,-1 1,-1h3.5c0.55,0 1,0.45 1,1 0,1.25 0.2,2.45 0.57,3.57 0.11,0.35 0.03,0.74 -0.25,1.02l-2.2,2.2z" fill="#fff"/>`;
const pin = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0c-9-12-14-19-14-26a14 14 0 0 1 28 0c0 7-5 14-14 26z" fill="#e4002b"/><circle cy="-26" r="5.5" fill="#fff"/></g>`;

const INTRO_SLIDES = [
  {
    bg: "linear-gradient(160deg,#7a3412,#1f0f08)",
    title: "Köpeğiniz bir anda gözden kaybolursa?",
    text: "Açık kalan bir kapı, bir havai fişek sesi… En dikkatli sahiplerin bile başına gelir. Onu bulan kişi size nasıl ulaşacak?",
    art: () => `<svg viewBox="0 0 360 300" class="intro-art" role="img" aria-label="Parkta koşarak uzaklaşan bir köpek ve onu arayan sahibi">
      <rect width="360" height="300" rx="22" fill="#cfe9ff"/>
      <circle cx="292" cy="58" r="26" fill="#ffd400" opacity=".85"/>
      <path d="M0 196q90-30 180 0t180 0v104H0z" fill="#7cc36a"/><path d="M0 232q90-24 180 0t180 0v68H0z" fill="#5aa84c"/>
      <g fill="#3f8f3a"><circle cx="48" cy="150" r="30"/><circle cx="80" cy="134" r="26"/></g><rect x="60" y="160" width="10" height="40" fill="#7a4a24"/>
      <path d="M40 262q130-34 300-8" stroke="#e9d8b8" stroke-width="16" fill="none" stroke-linecap="round"/>
      <g class="intro-run">${icon("dog", "", `x="200" y="196" width="70" height="60"`)}
        <path d="M196 238h-18M200 250h-26M198 226h-14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
      <g transform="translate(70 178)"><circle cy="-34" r="11" fill="#2a1a10"/><rect x="-10" y="-22" width="20" height="40" rx="9" fill="#163a7a"/>
        <path d="M-6 18l-4 22M6 18l4 22" stroke="#163a7a" stroke-width="7" stroke-linecap="round"/><path d="M10-14l18-12" stroke="#163a7a" stroke-width="6" stroke-linecap="round"/></g>
      <g class="intro-pop"><path d="M96 74h104a14 14 0 0 1 14 14v28a14 14 0 0 1-14 14H128l-22 16 6-16h-16a14 14 0 0 1-14-14V88a14 14 0 0 1 14-14z" fill="#fff"/>
        <text x="148" y="108" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="700" font-size="20" fill="#111418">Zeytin?!</text></g>
      <g class="intro-blink" font-family="Barlow,sans-serif" font-weight="700" fill="#e4002b"><text x="282" y="180" font-size="34">?</text><text x="312" y="160" font-size="24">?</text></g>
    </svg>`,
  },
  {
    bg: "linear-gradient(160deg,#163a7a,#0a1838)",
    title: "Tasmasına QR rozetini takın",
    text: "Size özel QR rozet tasmada küçük bir künye gibi sallanır. Numaranız rozette yazmaz; köpeğin adı ve QR yeter.",
    art: () => `<div class="intro-art intro-collar">${collarHtml(tagAt("ÖRNEK", "turuncu", "y40", {name: "Zeytin", link: SITE}), "#b8501a")}</div>`,
  },
  {
    bg: "linear-gradient(160deg,#0c5e37,#06291a)",
    title: "Bulan kişi okutur, sizi tek dokunuşla arar",
    text: "Telefon kamerasıyla okutan kişi köpeğinizin adını ve notunuzu görür; uygulama indirmeden sizi arar ya da WhatsApp'tan yazar.",
    art: () => `<svg viewBox="0 0 360 300" class="intro-art" role="img" aria-label="Telefon kamerası rozetteki QR'ı tarıyor, ardından arama ekranı açılıyor">
      <rect width="360" height="300" rx="22" fill="#e6f4ec"/>
      <g transform="translate(46 26)">
        <rect width="128" height="248" rx="22" fill="#111418"/>
        <rect x="8" y="10" width="112" height="228" rx="16" fill="#2b3240"/>
        <g stroke="#5ef2a0" stroke-width="4" fill="none" stroke-linecap="round"><path d="M22 70v-16h16M90 54h16v16M106 160v16H90M38 176H22v-16"/></g>
        ${miniBadge(64, 118, 40)}
        <rect class="intro-scan" x="22" y="116" width="84" height="3" rx="1.5" fill="#5ef2a0"/>
      </g>
      <path class="intro-nudge" d="M186 150h26m-10-10 10 10-10 10" stroke="#0c7a43" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(222 26)">
        <rect width="104" height="248" rx="22" fill="#111418"/>
        <rect x="8" y="10" width="88" height="228" rx="16" fill="#fff"/>
        <circle cx="52" cy="58" r="22" fill="#b8501a"/>${icon("paw", "#fff", `x="40" y="46" width="24" height="24"`)}
        <text x="52" y="102" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="700" font-size="14" fill="#111418">Ben Zeytin!</text>
        <rect x="18" y="112" width="68" height="7" rx="3.5" fill="#c9ced6"/><rect x="26" y="124" width="52" height="7" rx="3.5" fill="#c9ced6"/>
        <g class="intro-ring"><rect x="16" y="176" width="72" height="34" rx="9" fill="#0c7a43"/><g transform="translate(40 181)">${phoneIcon}</g></g>
      </g>
    </svg>`,
  },
  {
    bg: "linear-gradient(160deg,#a11d1d,#2b0808)",
    title: "Konumunu gönderir, kayıp modu uyarır",
    text: "Bulan kişi bulunduğu yeri tek dokunuşla size gönderir. Kayıp modunu açtığınızda okutan herkes durumun acil olduğunu görür.",
    art: () => `<svg viewBox="0 0 360 300" class="intro-art" role="img" aria-label="Telefonda kırmızı kayıp uyarısı ve haritada beliren konum">
      <rect width="360" height="300" rx="22" fill="#f1ece4"/>
      <g stroke="#fff" stroke-width="10"><path d="M0 90h360M0 200h360M110 0v300M250 0v300"/></g>
      <g stroke="#e6dccd" stroke-width="5"><path d="M0 40l360 120M180 0v300"/></g>
      <rect x="128" y="104" width="44" height="40" rx="6" fill="#9fd18f"/><rect x="266" y="214" width="60" height="50" rx="6" fill="#9fd18f"/>
      <g class="intro-drop">${pin(296, 150, 1.6)}</g>
      <circle class="intro-wave" cx="296" cy="150" r="10" fill="none" stroke="#e4002b" stroke-width="3"/>
      <g transform="translate(30 30)">
        <rect width="128" height="240" rx="22" fill="#111418"/>
        <rect x="8" y="10" width="112" height="220" rx="16" fill="#fff"/>
        <g class="intro-blink"><rect x="16" y="22" width="96" height="58" rx="10" fill="#b3261e"/>
          <text x="64" y="50" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="700" font-size="17" fill="#fff">🚨 KAYIP!</text>
          <text x="64" y="68" text-anchor="middle" font-family="Barlow,sans-serif" font-size="10" fill="#fff">Ödül: 1.000 TL</text></g>
        <rect x="16" y="94" width="96" height="10" rx="5" fill="#c9ced6"/><rect x="16" y="112" width="72" height="10" rx="5" fill="#c9ced6"/>
        <rect x="16" y="140" width="96" height="30" rx="8" fill="#0c7a43"/><text x="64" y="160" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="700" font-size="11" fill="#fff">Sahibimi ara</text>
        <rect x="16" y="178" width="96" height="30" rx="8" fill="#163a7a"/><text x="64" y="198" text-anchor="middle" font-family="Barlow,sans-serif" font-weight="700" font-size="11" fill="#fff">Konum gönder</text>
      </g>
    </svg>`,
  },
  {
    bg: "linear-gradient(160deg,#5b2a86,#1a0f2b)",
    title: "Tasarımını seç, 1 dakikada hazır",
    text: `${Object.keys(DESIGNS).length} tasarım, Ø25'ten Ø40 mm'ye ölçüler. Ücretsiz oluşturun, evde yazdırın ya da su geçirmez basılı rozetinizi sipariş edin.`,
    art: () => `<div class="intro-fan" role="img" aria-label="Üç farklı rozet tasarımı">
      ${[["kirmizi", "Bobi"], ["klasik", "Pamuk"], ["sari", "Fındık"]].map(([d, n], i) =>
        `<div class="intro-card c${i}">${tagAt("ÖRNEK", d, "y40", {name: n, link: SITE})}</div>`).join("")}
    </div>`,
  },
];

function showIntro({onCreate, onDone} = {}) {
  const wrap = document.createElement("div");
  wrap.className = "intro";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-label", "Tasma QR tanıtımı");
  const last = INTRO_SLIDES.length - 1;
  wrap.innerHTML = `
    <button class="intro-skip" type="button">Geç</button>
    <div class="intro-dots" aria-hidden="true">${INTRO_SLIDES.map((_, i) => `<span class="${i ? "" : "on"}"></span>`).join("")}</div>
    <div class="intro-reels">
      ${INTRO_SLIDES.map((sl, i) => `
        <section class="intro-slide" style="background:${sl.bg}" data-i="${i}">
          <div class="intro-artbox">${sl.art()}</div>
          <div class="intro-copy">
            <h1>${esc(sl.title)}</h1>
            <p>${esc(sl.text)}</p>
            ${i === last ? `<button class="btn intro-go" type="button">Rozetimi oluştur</button>
              <button class="btn intro-later" type="button">Önce siteyi gezeyim</button>`
              : `<button class="intro-next" type="button" aria-label="Sonraki">⌃ Yukarı kaydırın</button>`}
          </div>
        </section>`).join("")}
    </div>`;
  document.body.append(wrap);
  document.body.classList.add("intro-open");
  const reels = wrap.querySelector(".intro-reels"), dots = wrap.querySelectorAll(".intro-dots span");
  const slides = wrap.querySelectorAll(".intro-slide");
  // Görünür slaytın animasyonlarını yeniden başlat
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) { e.target.classList.remove("play"); return; }
    e.target.classList.add("play");
    dots.forEach((d, i) => d.classList.toggle("on", i === Number(e.target.dataset.i)));
  }), {root: reels, threshold: .6});
  slides.forEach(s => io.observe(s));
  const close = then => {
    io.disconnect();
    document.removeEventListener("keydown", onKey);
    document.body.classList.remove("intro-open");
    wrap.remove();
    onDone && onDone();
    then && then();
  };
  const onKey = ev => {
    if (ev.key === "Escape") close();
    if (["ArrowDown", "PageDown", " "].includes(ev.key)) { ev.preventDefault(); reels.scrollBy({top: reels.clientHeight, behavior: "smooth"}); }
    if (["ArrowUp", "PageUp"].includes(ev.key)) { ev.preventDefault(); reels.scrollBy({top: -reels.clientHeight, behavior: "smooth"}); }
  };
  document.addEventListener("keydown", onKey);
  wrap.querySelectorAll(".intro-next").forEach(b => b.onclick = () => reels.scrollBy({top: reels.clientHeight, behavior: "smooth"}));
  wrap.querySelector(".intro-skip").onclick = () => close();
  wrap.querySelector(".intro-later").onclick = () => close();
  wrap.querySelector(".intro-go").onclick = () => close(onCreate);
  wrap.querySelector(".intro-skip").focus();
}
