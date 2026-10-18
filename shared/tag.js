// Tasma QR: rozet tasarımları ve baskı ölçüleri. Web sitesi (index.html) kullanır; ileride Android uygulaması da kullanacak.
// Gerekenler: qrcode-generator (global `qrcode`) ve shared/tag.css.

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const upTR = s => String(s ?? "").toLocaleUpperCase("tr-TR");

// QR tek bir SVG olarak: yuvarlak rozetin içine de gömülebilir. M seviyesi: küçük rozette modüller iri kalsın diye.
function qrSvg(text, attrs = "", {fg = "#111", bg = "#fff"} = {}) {
  const q = qrcode(0, "M");
  q.addData(text); q.make();
  const n = q.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!q.isDark(r, c)) continue;
      const s = c;
      while (c + 1 < n && q.isDark(r, c + 1)) c++;
      d += `M${s} ${r}h${c - s + 1}v1h-${c - s + 1}z`;
    }
  }
  return `<svg ${attrs} viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges" aria-hidden="true">` +
    (bg ? `<rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="${bg}"/>` : "") + `<path d="${d}" fill="${fg}"/></svg>`;
}

// ---------------------------------------------------------------- ikonlar (renkler açıkça verilir: PDF'te SVG ayrı resim olarak çizilir)
const ICONS = {
  paw: {vb: "0 0 24 24", body: c => `<g fill="${c}"><ellipse cx="12" cy="16.2" rx="5.4" ry="4.6"/><ellipse cx="4.8" cy="10.2" rx="2.3" ry="2.9"/>` +
    `<ellipse cx="9.2" cy="5.4" rx="2.3" ry="3"/><ellipse cx="14.8" cy="5.4" rx="2.3" ry="3"/><ellipse cx="19.2" cy="10.2" rx="2.3" ry="2.9"/></g>`},
  bone: {vb: "0 0 24 24", body: c => `<g fill="${c}"><rect x="6" y="9.6" width="12" height="4.8"/><circle cx="5.6" cy="9.4" r="2.9"/>` +
    `<circle cx="5.6" cy="14.6" r="2.9"/><circle cx="18.4" cy="9.4" r="2.9"/><circle cx="18.4" cy="14.6" r="2.9"/></g>`},
  heart: {vb: "0 0 24 24", body: c => `<path fill="${c}" d="M12 21.2s-8.6-5.4-8.6-11.4a4.8 4.8 0 0 1 8.6-2.9 4.8 4.8 0 0 1 8.6 2.9c0 6-8.6 11.4-8.6 11.4z"/>`},
  star: {vb: "0 0 24 24", body: c => `<path fill="${c}" d="M12 1.8l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.6l-6.3 3.6 1.5-7.1L1.8 9.2 9 8.4z"/>`},
  nazar: {vb: "0 0 24 24", body: () => `<circle cx="12" cy="12" r="11.3" fill="#1565c0" stroke="#fff" stroke-width="1.2"/>` +
    `<circle cx="12" cy="12" r="7.6" fill="#fff"/><circle cx="12" cy="12" r="5" fill="#5ec8ff"/><circle cx="12" cy="12" r="2.6" fill="#111"/>`},
  dog: {vb: "0 0 40 34", body: () => `<ellipse cx="20" cy="18" rx="12" ry="12.5" fill="#c98b4f"/><path d="M9 7Q2 8 3 21q4.5 1.5 7.5-6zM31 7q7 1 6 14-4.5 1.5-7.5-6z" fill="#7a4a24"/>` +
    `<ellipse cx="20" cy="24.5" rx="7" ry="5.5" fill="#f1d3b0"/><circle cx="15" cy="16.5" r="2.1" fill="#222"/><circle cx="25" cy="16.5" r="2.1" fill="#222"/>` +
    `<ellipse cx="20" cy="21.5" rx="2.8" ry="1.9" fill="#222"/><path d="M20 23.4v2.2M17 26.4q3 2.2 6 0" stroke="#222" stroke-width="1" fill="none" stroke-linecap="round"/>` +
    `<path d="M18.8 27.4q1.2 4.2 2.4 0z" fill="#e8607a"/>`},
  cat: {vb: "0 0 40 34", body: () => `<path d="M8 15L7 2l10 7zM32 15l1-13-10 7z" fill="#5d5f6e"/><path d="M9.5 11.5L9 5l5 3.6zM30.5 11.5L31 5l-5 3.6z" fill="#f2a7b8"/>` +
    `<ellipse cx="20" cy="19" rx="13" ry="12" fill="#7b7e8f"/><path d="M14 9q6 3 12 0" stroke="#5d5f6e" stroke-width="1.6" fill="none"/>` +
    `<ellipse cx="20" cy="25" rx="6.5" ry="4.6" fill="#e9e6ef"/>` +
    `<path d="M11.8 17.6q3.4-3 6.2 0-3.1 2.6-6.2 0zM22 17.6q3.4-3 6.2 0-3.1 2.6-6.2 0z" fill="#9ccc3c"/><ellipse cx="14.9" cy="17.6" rx=".8" ry="1.6" fill="#111"/><ellipse cx="25.1" cy="17.6" rx=".8" ry="1.6" fill="#111"/>` +
    `<path d="M18.4 22.2h3.2L20 24z" fill="#e8607a"/><path d="M20 24v1.6M17.6 26.6q2.4 1.6 4.8 0" stroke="#333" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
    `<path d="M3 21.5l9-1.2M3.5 25.5l8.6-2.4M37 21.5l-9-1.2M36.5 25.5l-8.6-2.4" stroke="#333" stroke-width=".7" stroke-linecap="round"/>`},
};
const icon = (name, color, attrs = "") => {
  const i = ICONS[name] || ICONS.paw;
  return `<svg ${attrs} viewBox="${i.vb}" aria-hidden="true">${i.body(color)}</svg>`;
};

// ---------------------------------------------------------------- tasarımlar
// ring: dış halka / bant rengi, ink: halka üstündeki yazı, accent: beyaz zemindeki isim ve ikon, line: kenar çizgisi
const DESIGNS = {
  klasik:  {name: "Klasik lacivert", ring: "#163a7a", ink: "#fff", accent: "#163a7a", icon: "paw", side: "paw", top: "BENİ BULDUN!"},
  turuncu: {name: "Turuncu pati", ring: "#e8742a", ink: "#fff", accent: "#c4561a", icon: "paw", side: "paw", top: "BENİ BULDUN!"},
  kirmizi: {name: "Kırmızı uyarı", ring: "#c62828", ink: "#fff", accent: "#c62828", icon: "heart", side: "heart", top: "KAYBOLDUYSAM OKUT"},
  sari:    {name: "Sarı (çok görünür)", ring: "#ffd400", ink: "#111", accent: "#111", icon: "paw", side: "paw", top: "BENİ BULDUN!"},
  kemik:   {name: "Kemik", ring: "#7a4a24", ink: "#fff6e8", accent: "#7a4a24", icon: "bone", side: "bone", top: "SAHİBİMİ ARA"},
  kopek:   {name: "Köpek yüzü", ring: "#c98b4f", ink: "#2a1a10", accent: "#7a4a24", icon: "dog", side: "paw", top: "HAV HAV! OKUT"},
  kedi:    {name: "Kedi yüzü", ring: "#8a6fb3", ink: "#fff", accent: "#4a3a6b", icon: "cat", side: "paw", top: "MİYAV! OKUT"},
  yesil:   {name: "Orman yeşili", ring: "#1f7a4a", ink: "#fff", accent: "#1f7a4a", icon: "bone", side: "paw", top: "BENİ BULDUN!"},
  pembe:   {name: "Pembe kalp", ring: "#e05a8a", ink: "#fff", accent: "#c2185b", icon: "heart", side: "heart", top: "BENİ BULDUN!"},
  gece:    {name: "Gece (koyu)", ring: "#0d1530", ink: "#5ef2ff", accent: "#0d1530", icon: "star", side: "star", top: "BENİ BULDUN!"},
  nazar:   {name: "Nazar boncuğu", ring: "#0a3d91", ink: "#fff", accent: "#0a3d91", icon: "nazar", side: "star", top: "MAŞALLAH! OKUT"},
  sade:    {name: "Sade (az mürekkep)", ring: "#fff", ink: "#111", accent: "#111", line: "#111", icon: "paw", side: "paw", top: "BENİ BULDUN!"},
};
const RANDOM = "rastgele";
const pickRandom = () => { const k = Object.keys(DESIGNS); return k[Math.floor(Math.random() * k.length)]; };
const sideColor = D => D.ring === "#fff" ? "#111" : D.ink;

let tagUid = 0;

// Yuvarlak rozet: tek SVG. Üst yayda hayvanın adı, alt yayda “OKUT · SAHİBİMİ ARA”, ortada QR ve kod.
function roundTagSvg(code, D, link, name) {
  const id = "tq" + (++tagUid), top = name ? upTR(name) : D.top;
  const fsTop = Math.min(11.5, 104 / (top.length * .58)).toFixed(2);
  const rt = 39.6, rb = 46.4;
  const font = `font-family="'Barlow Condensed','Arial Narrow',Arial,sans-serif" font-weight="700"`;
  const side = (x) => icon(D.side, sideColor(D), `x="${x - 3.6}" y="46.4" width="7.2" height="7.2"`);
  return `<svg class="disc" viewBox="0 0 100 100" aria-hidden="true">
    <defs><path id="${id}t" d="M${50 - rt} 50A${rt} ${rt} 0 0 1 ${50 + rt} 50"/><path id="${id}b" d="M${50 - rb} 50A${rb} ${rb} 0 0 0 ${50 + rb} 50"/></defs>
    <circle cx="50" cy="50" r="49.5" fill="${D.ring}" stroke="${D.line || D.ring}" stroke-width="1"/>
    <circle cx="50" cy="50" r="36" fill="#fff" stroke="${D.line || "none"}" stroke-width=".8"/>
    <text ${font} font-size="${fsTop}" fill="${D.ink}" letter-spacing=".5"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${esc(top)}</textPath></text>
    <text ${font} font-size="8.6" fill="${D.ink}" letter-spacing=".5"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">OKUT • SAHİBİMİ ARA</textPath></text>
    ${side(7)}${side(93)}
    ${icon(D.icon, D.accent, `x="45" y="16" width="10" height="8"`)}
    ${qrSvg(link, `x="26" y="26" width="48" height="48"`)}
    <text ${font} x="50" y="81.2" font-size="5.6" fill="#333" text-anchor="middle" letter-spacing=".8">${esc(code)}</text>
  </svg>`;
}

// Dikdörtgen rozet: HTML; ölçü .grid üzerindeki --w/--h ile, iç ölçüler --k ile (40x60 mm = 1).
function rectTagHtml(code, D, link, name) {
  return `<div class="in">
      <div class="top">${icon(D.icon, D.icon === "dog" || D.icon === "nazar" ? "" : sideColor(D))}<span>${esc(D.top)}</span></div>
      <div class="name">${name ? esc(upTR(name)) : "SAHİBİMİ ARA"}</div>
      <div class="qr">${qrSvg(link)}</div>
      <div class="how">Kameranla okut, sahibime ulaş</div>
      <div class="code">${esc(code)}</div>
    </div>`;
}

// Tasarım metinleri sabit; hayvanın adı ve kod kaçışlanır.
function tagHtml(code, design, {link = tagLink(code), name = "", round = true} = {}) {
  const d = DESIGNS[design] ? design : "klasik", D = DESIGNS[d];
  const vars = `--ring:${D.ring};--ink:${D.ink};--accent:${D.accent};--line:${D.line || D.ring}`;
  return `<div class="sticker ${round ? "round" : "rect"} d-${d}" style="${vars}">${round ? roundTagSvg(code, D, link, name) : rectTagHtml(code, D, link, name)}</div>`;
}

// ---------------------------------------------------------------- tasmaya takılan fiziksel rozet
// Kulaklı yuvarlak rozet: üstte halka deliği olan bir kulak. viewBox 0 -16 100 116 (çap 100 birim + 16 birim kulak).
// kind: "epoksi" (renkli UV baskı + şeffaf epoksi kubbe) ya da "metal" (paslanmaz çelik, lazer kazıma, tek renk)
// file: üretim dosyası (parlama yok; kesim çizgisi kırmızı, metalde kazınacak yerler siyah)
const PRODUCTS = {
  epoksi: {name: "Renkli epoksi rozet", short: "Epoksi", desc: "Alüminyum gövde, UV renkli baskı, üstü şeffaf epoksi kubbe. Seçtiğiniz tasarım birebir basılır; su ve çizilmeye dayanıklı."},
  metal:  {name: "Metal lazer rozet", short: "Metal", desc: "Paslanmaz çelik, QR ve ad lazerle kazınır. Solmaz, paslanmaz; en dayanıklı seçenek. Tek renk (metal üzerine koyu kazıma)."},
};
const BADGE_SIZES = {"y25": "Ø25 mm (kedi, minik ırk köpek)", "y30": "Ø30 mm (küçük-orta boy)", "y35": "Ø35 mm (orta-büyük boy)"};
const TAB = 16; // kulak yüksekliği (birim); gerçek ölçü = çap × 0,16

// top: üst yazıyı zorlar (isimsiz stok rozet); verilmezse hayvanın adı, ad da yoksa tasarımın yazısı
function badgeSvg(code, design, {link = tagLink(code), name = "", kind = "epoksi", file = false, top: topText = ""} = {}) {
  const id = "tb" + (++tagUid), metal = kind === "metal";
  const D = metal ? {ring: "none", ink: "#2b3038", accent: "#2b3038", icon: "paw", side: "paw", top: "BENİ BULDUN!"} : DESIGNS[DESIGNS[design] ? design : "klasik"];
  const top = topText ? upTR(topText) : name ? upTR(name) : D.top;
  const fsTop = Math.min(11.5, 104 / (top.length * .58)).toFixed(2);
  const rt = 39.6, rb = 46.4, ink = file && metal ? "#000" : D.ink;
  const font = `font-family="'Barlow Condensed','Arial Narrow',Arial,sans-serif" font-weight="700"`;
  const outline = `M38 1.98V-4a12 12 0 0 1 24 0V1.98A49.5 49.5 0 1 1 38 1.98z`; // daire (r 49,5) + kulak
  const side = x => metal ? icon("paw", ink, `x="${x - 3.6}" y="46.4" width="7.2" height="7.2"`)
    : icon(D.side, sideColor(D), `x="${x - 3.6}" y="46.4" width="7.2" height="7.2"`);
  const fill = metal ? (file ? "none" : `url(#${id}m)`) : D.ring;
  return `<svg class="tagbadge" viewBox="0 -${TAB} 100 ${100 + TAB}" aria-hidden="true">
    <defs>
      <path id="${id}t" d="M${50 - rt} 50A${rt} ${rt} 0 0 1 ${50 + rt} 50"/><path id="${id}b" d="M${50 - rb} 50A${rb} ${rb} 0 0 0 ${50 + rb} 50"/>
      <mask id="${id}h"><rect x="-5" y="-20" width="110" height="125" fill="#fff"/><circle cx="50" cy="-5" r="5" fill="#000"/></mask>
      <linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f9"/><stop offset=".45" stop-color="#c3c9d2"/>
        <stop offset=".7" stop-color="#eef1f5"/><stop offset="1" stop-color="#a9b1bc"/></linearGradient>
      <radialGradient id="${id}g" cx=".3" cy=".3" r=".38"><stop offset="0" stop-color="#fff" stop-opacity="${metal ? .35 : .5}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <g mask="url(#${id}h)">
      <path d="${outline}" fill="${fill}" stroke="${file ? "#e4002b" : metal ? "#8e96a1" : D.line || D.ring}" stroke-width="${file ? .3 : 1}"/>
      ${metal ? "" : `<circle cx="50" cy="50" r="36" fill="#fff" stroke="${D.line || "none"}" stroke-width=".8"/>`}
      ${metal ? `<circle cx="50" cy="50" r="36.5" fill="none" stroke="${ink}" stroke-width="1"/>` : ""}
      <text ${font} font-size="${fsTop}" fill="${ink}" letter-spacing=".5"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${esc(top)}</textPath></text>
      <text ${font} font-size="8.6" fill="${ink}" letter-spacing=".5"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">OKUT • SAHİBİMİ ARA</textPath></text>
      ${side(7)}${side(93)}
      ${icon(D.icon, metal ? ink : D.accent, `x="45" y="16" width="10" height="8"`)}
      ${qrSvg(link, `x="26" y="26" width="48" height="48"`, metal ? {fg: ink, bg: null} : {})}
      <text ${font} x="50" y="81.2" font-size="5.6" fill="${metal ? ink : "#333"}" text-anchor="middle" letter-spacing=".8">${esc(code)}</text>
      ${file ? "" : `<path d="${outline}" fill="url(#${id}g)"/>`}
    </g>
    ${file ? `<circle cx="50" cy="-5" r="5" fill="none" stroke="#e4002b" stroke-width=".3"/>` : ""}
  </svg>`;
}

// Ekranda gerçek boyutta rozet: çap mm cinsinden; kulak dahil yükseklik çap × 1,16
const badgeAt = (code, design, size = "y30", opts = {}) => {
  const d = dims(size).w;
  return `<div class="badgebox" style="width:${d}mm;height:${(d * (100 + TAB) / 100).toFixed(2)}mm">${badgeSvg(code, design, opts)}</div>`;
};

// Üretim dosyası: gerçek mm ölçülü tek başına SVG (kırmızı = kesim, metalde siyah = kazıma)
function badgeFileSvg(code, design, {link, name, kind, size, top}) {
  const d = dims(size).w, h = d * (100 + TAB) / 100;
  return `<?xml version="1.0" encoding="UTF-8"?>\n` + badgeSvg(code, design, {link, name, kind, top, file: true})
    .replace('<svg class="tagbadge"', `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${d}mm" height="${h.toFixed(2)}mm"`)
    .replace(/ href="#/g, ' xlink:href="#')
    .replace(/\saria-hidden="true"/g, "");
}

// ---------------------------------------------------------------- baskı ölçüleri
// y: yuvarlak (çap), k: dikdörtgen (en x boy)
const SIZES = {
  "y25": "Yuvarlak Ø25 mm (küçük ırk)",
  "y30": "Yuvarlak Ø30 mm",
  "y35": "Yuvarlak Ø35 mm (standart rozet)",
  "y40": "Yuvarlak Ø40 mm (büyük ırk)",
  "k35x50": "Dikdörtgen 35×50 mm",
  "k40x60": "Dikdörtgen 40×60 mm",
  "k50x75": "Dikdörtgen 50×75 mm (kafes, çanta)",
};
const A4 = {W: 210, H: 297, M: 10, G: 3};
const dims = size => {
  const round = size[0] === "y", [w, h = w] = size.slice(1).split("x").map(Number);
  return {w, h, round, k: round ? w / 35 : Math.min(w / 40, h / 60)};
};
const sizeVars = size => { const {w, h, k} = dims(size); return `--w:${w}mm;--h:${h}mm;--k:${k}`; };
const perA4 = ({w, h}) => Math.floor((A4.W - 2 * A4.M + A4.G) / (w + A4.G)) * Math.floor((A4.H - 2 * A4.M + A4.G) / (h + A4.G));
const tagAt = (code, design, size, opts = {}) =>
  `<div class="grid" style="${sizeVars(size)}">${tagHtml(code, design, {...opts, round: dims(size).round})}</div>`;

// ---------------------------------------------------------------- basılı sipariş sayfası
// A4 vinil sayfa: aynı QR 7 ölçüde, toplam 29 rozet. 190×277 mm baskı alanına sığar (10 mm kenar boşluğu).
const ORDER_SHEET = [
  ["k50x75", "k50x75", "k40x60", "k40x60"],
  ["k35x50", "k35x50", "k35x50", "k35x50", "k35x50"],
  ["y40", "y40", "y40", "y40"],
  ["y35", "y35", "y35", "y35", "y35"],
  ["y30", "y30", "y30", "y30", "y30"],
  ["y25", "y25", "y25", "y25", "y25", "y25"],
];
const ORDER_COUNT = ORDER_SHEET.flat().length;

function orderSheetHtml(code, design, link, name) {
  return `<div class="sheet">${ORDER_SHEET.map(row => `<div class="sheet-row">${row.map(size =>
    tagAt(code, design, size, {link, name})).join("")}</div>`).join("")}</div>`;
}
