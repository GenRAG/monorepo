// Captures de vérification : node scripts/shots.mjs [url] [outDir]
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3001/";
const out = process.argv[3] ?? "shots";
const only = process.env.ONLY;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });

async function desktop(w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(url, { waitUntil: "networkidle" });
  await wait(1500);
  for (let i = 0; i < 11; i++) {
    if (only && !only.split(",").includes(String(i))) continue;
    await page.evaluate((i) => window.__motion.scrollToPanel(i), i);
    await wait(2200);
    await page.screenshot({ path: `${out}/${w}x${h}-${i}.png` });
  }
  console.log(`${w}x${h} errors:`, errors);
  await page.close();
}

async function flow(w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += h / 2) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await wait(120);
  }
  await wait(2500);
  await page.screenshot({ path: `${out}/${w}-full.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`${w} errors:`, errors, "horizontal overflow:", overflow);
  await page.close();
}

const modes = (process.env.MODES ?? "1440,390").split(",");
if (modes.includes("1440")) await desktop(1440, 900);
if (modes.includes("1280")) await desktop(1280, 720);
if (modes.includes("390")) await flow(390, 844);
await browser.close();
