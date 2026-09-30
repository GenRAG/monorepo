import { useEffect, useState } from "react";

import { prefersReducedMotion } from "../motion/reduced";

/** Affiche `text` mot à mot quand `enabled` ; `key` relance l'animation. */
export function useTypewriter(text: string, enabled: boolean, key: string, speed = 38) {
  const words = text.split(" ");
  const [state, setState] = useState({ key, count: 0 });
  const count = state.key === key ? state.count : 0;

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setState((s) => {
        const c = s.key === key ? s.count : 0;
        if (c >= words.length) {
          window.clearInterval(id);
          return s;
        }
        return { key, count: c + 1 };
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [enabled, key, words.length, speed]);

  if (enabled && prefersReducedMotion()) return { text, done: true };
  return { text: words.slice(0, count).join(" "), done: count >= words.length };
}
