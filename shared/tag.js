// Tasma QR: rozet tasarımları ve baskı ölçüleri. Web sitesi (index.html) kullanır; ileride Android uygulaması da kullanacak.
// Gerekenler: qrcode-generator (global `qrcode`) ve shared/tag.css.

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const upTR = s => String(s ?? "").toLocaleUpperCase("tr-TR");

// QR tek bir SVG olarak: yuvarlak rozetin içine de gömülebilir. M seviyesi: küçük rozette modüller iri kalsın diye.
function qrSvg(text, attrs = "") {
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
    `<rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
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

// Yuvarlak rozet: tek SVG. Üst yayda köpeğin adı, alt yayda “OKUT · SAHİBİMİ ARA”, ortada QR ve kod.
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

// Tasarım metinleri sabit; köpek adı ve kod kaçışlanır.
function tagHtml(code, design, {link = tagLink(code), name = "", round = true} = {}) {
  const d = DESIGNS[design] ? design : "klasik", D = DESIGNS[d];
  const vars = `--ring:${D.ring};--ink:${D.ink};--accent:${D.accent};--line:${D.line || D.ring}`;
  return `<div class="sticker ${round ? "round" : "rect"} d-${d}" style="${vars}">${round ? roundTagSvg(code, D, link, name) : rectTagHtml(code, D, link, name)}</div>`;
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
