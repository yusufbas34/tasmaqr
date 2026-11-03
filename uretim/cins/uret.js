// Cinslere göre rozet sayfalarını üretir: node uretim/cins/uret.js → cins-rozetleri.pdf (A4, 2 sayfa) ve sayfa PNG'leri
const path = require("path");
const { chromium } = require(process.env.PW || "playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 900, height: 1200}, deviceScaleFactor: 2});
  p.on("pageerror", e => console.log("HATA", e.message));
  await p.goto("file://" + path.join(__dirname, "index.html")); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  const pages = await p.$$(".page");
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({path: path.join(__dirname, `cins-rozetleri-${i + 1}.png`)});
  await p.emulateMedia({media: "print"});
  await p.pdf({path: path.join(__dirname, "cins-rozetleri.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true});
  console.log("cins-rozetleri.pdf");
  await b.close();
})();
