// Instagram görsellerini kit.html'den PNG olarak üretir: node pazarlama/uret.js (Playwright gerekir)
// Büyüme planının PDF'ini de üretir: pazarlama/Tasma-QR-Buyume-Plani.pdf
const path = require("path"), fs = require("fs");
const { chromium } = require(process.env.PW || "playwright");
(async () => {
  const out = path.join(__dirname, "instagram"); fs.mkdirSync(out, {recursive: true});
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1200, height: 2000}});
  p.on("pageerror", e => console.log("HATA", e.message));
  await p.goto("file://" + path.join(__dirname, "kit.html")); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.evaluate(() => fitAll()); await p.waitForTimeout(300);
  for (const el of await p.$$(".ab")) { const n = await el.getAttribute("data-name"); await el.screenshot({path: path.join(out, n + ".png")}); console.log(n); }
  const plan = await b.newPage();
  await plan.emulateMedia({colorScheme: "light"});
  await plan.goto("file://" + path.join(__dirname, "buyume-plani.html")); await plan.evaluate(() => document.fonts.ready);
  await plan.pdf({path: path.join(__dirname, "Tasma-QR-Buyume-Plani.pdf"), format: "A4", printBackground: true, margin: {top: "14mm", bottom: "14mm", left: "12mm", right: "12mm"}});
  console.log("Tasma-QR-Buyume-Plani.pdf");
  await b.close();
})();
