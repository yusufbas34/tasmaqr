// Reels videosunu üretir: node pazarlama/reels/render.js reels-1 [kare-saniyeleri...]
// Kare kare ekran görüntüsü alır, ffmpeg ile 1080×1920 30 fps MP4 yapar. Playwright ve ffmpeg gerekir.
const path = require("path"), fs = require("fs"), {execFileSync} = require("child_process");
const {chromium} = require(process.env.PW || "playwright");
const name = process.argv[2] || "reels-1", only = process.argv.slice(3).map(Number), FPS = 30;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  p.on("pageerror", e => console.log("HATA", e.message));
  await p.goto("file://" + path.join(__dirname, name + ".html")); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const dur = await p.evaluate(() => window.DURATION);
  if (only.length) { for (const t of only) { await p.evaluate(t => seek(t), t); await p.screenshot({path: path.join(__dirname, `${name}-t${t}.png`)}); } return b.close(); }
  const dir = fs.mkdtempSync(path.join(require("os").tmpdir(), "reels-"));
  for (let i = 0; i < dur * FPS; i++) {
    await p.evaluate(t => seek(t), i / FPS);
    await p.screenshot({path: path.join(dir, String(i).padStart(5, "0") + ".jpg"), type: "jpeg", quality: 92});
    if (i % 150 === 0) console.log(`${i}/${dur * FPS}`);
  }
  await b.close();
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "%05d.jpg"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "slow", "-movflags", "+faststart", path.join(__dirname, name + ".mp4")]);
  fs.rmSync(dir, {recursive: true});
  console.log(name + ".mp4");
})();
