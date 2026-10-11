import { useEffect, useState } from "react";

const LOGO_BASE_URL = "https://models.dev/logos";

/** Slugs du RAG engine (style OpenRouter) qui diffèrent de ceux de models.dev. */
const PROVIDER_ALIASES: Record<string, string> = {
  "meta-llama": "meta",
  "x-ai": "xai",
  qwen: "alibaba",
  mistralai: "mistral",
};

/** "OpenAI/gpt-4o" → "openai", "meta-llama/llama-3" → "meta". Un nouveau provider est tenté tel quel. */
export const getProviderSlug = (
  id: string,
  provider?: string,
): string | null => {
  const raw = provider ?? (id.includes("/") ? id.split("/")[0] : "");
  const slug = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(slug)) return null;
  return PROVIDER_ALIASES[slug] ?? slug;
};

const fetchSvg = async (slug: string): Promise<string | null> => {
  try {
    const res = await fetch(`${LOGO_BASE_URL}/${slug}.svg`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
};

// models.dev répond 200 avec un SVG générique pour un provider inconnu : on le récupère une fois
// pour le reconnaître et retomber sur la lettre plutôt que d'afficher un faux logo.
let placeholderSvg: Promise<string | null> | null = null;
const getPlaceholderSvg = () =>
  (placeholderSvg ??= fetchSvg("__unknown_provider__"));

const logoCache = new Map<string, Promise<string | null>>();

/**
 * Data URL du logo, ou null s'il n'existe pas / n'est pas joignable. Utilisée en `mask-image` (pas
 * d'injection de SVG tiers dans le DOM) ; le logo prend la couleur du texte via `currentColor`.
 */
export const loadProviderLogo = (slug: string): Promise<string | null> => {
  let cached = logoCache.get(slug);
  if (!cached) {
    cached = (async () => {
      const [svg, placeholder] = await Promise.all([
        fetchSvg(slug),
        getPlaceholderSvg(),
      ]);
      if (!svg || !svg.includes("<svg") || svg === placeholder) return null;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    })();
    logoCache.set(slug, cached);
  }
  return cached;
};

export const useProviderLogo = (slug: string | null): string | null => {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLogo(null);
    if (slug) {
      void loadProviderLogo(slug).then((url) => {
        if (!cancelled) setLogo(url);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return logo;
};
