import gsap from "gsap";

/**
 * Timelines internes d'un panel, pilotées par le scroll (mode épinglé) ou jouées une fois
 * à l'entrée (mode flux). Le panel déclare `data-scrub="<nom>"`.
 *
 * Convention DOM : chaque élément animé porte `data-step="<n>"` et `data-kind="attach" | "draw" | "fade"`.
 * Les étapes sont jouées dans l'ordre croissant.
 */
const STEP = 0.32;

function stepsTimeline(panel: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  const els = Array.from(panel.querySelectorAll<SVGPathElement | HTMLElement>("[data-step]"));
  const order = [...new Set(els.map((el) => Number(el.dataset.step)))].sort((a, b) => a - b);

  order.forEach((step, n) => {
    const at = n * STEP;
    els
      .filter((el) => Number(el.dataset.step) === step)
      .forEach((el) => {
        const kind = el.dataset.kind;
        if (kind === "draw" && el instanceof SVGPathElement) {
          const len = el.getTotalLength();
          tl.fromTo(
            el,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: STEP * 1.2, ease: "none" },
            at,
          );
        } else if (kind === "detach") {
          tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: STEP * 0.8 }, at);
        } else if (kind === "attach") {
          tl.fromTo(el, { opacity: 0, x: -26, scale: 0.95 }, { opacity: 1, x: 0, scale: 1, duration: STEP * 1.4 }, at);
        } else {
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: STEP }, at);
        }
      });
  });
  return tl;
}

export const scrubs: Record<string, (panel: HTMLElement) => gsap.core.Timeline> = {
  steps: stepsTimeline,
};
