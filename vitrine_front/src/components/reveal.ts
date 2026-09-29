import type { CSSProperties } from "react";

/** Attributs pour la révélation décalée (fade + translateY, stagger 80 ms). */
export const reveal = (i: number) => ({
  "data-reveal": "",
  style: { "--i": i } as CSSProperties,
});
