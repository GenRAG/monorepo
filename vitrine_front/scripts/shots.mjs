// Captures de vérification, une par page, thème et largeur : node scripts/shots.mjs [baseUrl] [outDir]
// PAGES=/,/tarifs  THEMES=dark,light  WIDTHS=1440,390 pour restreindre.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = (process.argv[2] ?? "http://localhost:3001").replace(/\/$/, "");
const out = process.argv[3] ?? "shots";
const list = (name, fallback) => (process.env[name] ?? fallback).split(",");
const pages = list(
  "PAGES",
  "/,/produit/creer,/produit/documents,/produit/deployer,/cas-usage,/tarifs,/mises-a-jour,/a-propos,/securite,/contact",
);
const themes = list("THEMES", "dark,light");
const widths = list("WIDTHS", "1440,390").map(Number);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
let failed = false;

for (const theme of themes) {
  for (const width of widths) {
    const mobile = width < 768;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 844 : 900 },
      colorScheme: theme,
      isMobile: mobile,
      hasTouch: mobile,
    });
    // Le site ignore la préférence du système (clair par défaut) : le thème passe par le choix mémorisé.
    await context.addInitScript((t) => localStorage.setItem("genrag-scheme", t), theme);
    for (const path of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      await page.goto(base + path, { waitUntil: "networkidle" });
      // Fait défiler la page pour déclencher les révélations au scroll.
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 400) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        await wait(60);
      }
      await wait(1200);
      const name = `${theme}-${width}-${path === "/" ? "accueil" : path.slice(1).replaceAll("/", "-")}`;
      await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const scheme = await page.evaluate(() => document.documentElement.dataset.scheme);
      if (errors.length || overflow > 0) failed = true;
      console.log(`${name}: scheme=${scheme} overflow=${overflow} errors=${JSON.stringify(errors)}`);
      await page.close();
    }
    await context.close();
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
