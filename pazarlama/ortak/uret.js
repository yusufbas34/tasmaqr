// Ortak paylaşım görsellerini index.html'den PNG olarak üretir: node pazarlama/ortak/uret.js (Playwright gerekir)
const path = require("path"), fs = require("fs");
const { chromium } = require(process.env.PW || "playwright");
(async () => {
  const out = path.join(__dirname, "png"); fs.mkdirSync(out, {recursive: true});
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1200, height: 2000}});
  p.on("pageerror", e => console.log("HATA", e.message));
  await p.goto("file://" + path.join(__dirname, "index.html")); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  for (const el of await p.$$(".ab")) { const n = await el.getAttribute("data-name"); await el.screenshot({path: path.join(out, n + ".png")}); console.log(n); }
  await b.close();
})();
