// Logos repris de models.dev/logos/<slug>.svg, comme le sélecteur de modèles de l'app.
const logos = import.meta.glob<string>("../assets/providers/*.svg", { eager: true, query: "?url", import: "default" });

/** Fournisseurs mis en avant (bande du hero, section Modèles), dans l'ordre d'affichage. */
export const providers = [
  { slug: "openai", name: "OpenAI" },
  { slug: "anthropic", name: "Anthropic" },
  { slug: "google", name: "Gemini" },
  { slug: "mistral", name: "Mistral AI" },
  { slug: "xai", name: "xAI" },
  { slug: "meta", name: "Meta" },
  { slug: "deepseek", name: "DeepSeek" },
  { slug: "alibaba", name: "Qwen" },
  { slug: "cohere", name: "Cohere" },
  { slug: "moonshotai", name: "Moonshot AI" },
];

/** Valeur CSS pour `mask-image` : le logo prend la couleur du texte. Guillemets requis, Vite intègre les petits SVG en data URL. */
export const providerMask = (slug: string) => `url("${logos[`../assets/providers/${slug}.svg`]}")`;
