/**
 * Thème clair / sombre : attribut `data-scheme` sur <html>. Le script en tête de index.html le pose
 * avant le premier rendu (choix mémorisé, sinon clair) pour éviter un flash.
 */
export type Scheme = "light" | "dark";

export const SCHEME_KEY = "genrag-scheme";
const THEME_COLORS: Record<Scheme, string> = { dark: "#0B0E11", light: "#FFFFFF" };

export const currentScheme = (): Scheme => (document.documentElement.dataset.scheme === "dark" ? "dark" : "light");

export function setScheme(scheme: Scheme) {
  document.documentElement.dataset.scheme = scheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[scheme]);
  try {
    localStorage.setItem(SCHEME_KEY, scheme);
  } catch {
    // Stockage bloqué (navigation privée) : le choix vaut pour cette visite seulement.
  }
}
