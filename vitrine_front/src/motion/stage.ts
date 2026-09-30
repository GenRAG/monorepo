import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { panelStore } from "./store";
import { scrubs } from "./scrubs";

gsap.registerPlugin(ScrollTrigger);

const REDUCED = "(prefers-reduced-motion: reduce)";

export interface MotionController {
  scrollToPanel: (index: number) => void;
  destroy: () => void;
}

/**
 * Scroll natif : les éléments [data-reveal] apparaissent quand ils arrivent à l'écran,
 * les timelines `data-scrub` se jouent une fois à l'entrée de leur section,
 * et le store suit la section active (navigation, thème du header).
 */
export function initMotion(stage: HTMLElement, progressBar: HTMLElement | null): MotionController {
  const panels = Array.from(stage.querySelectorAll<HTMLElement>(":scope > [data-panel]"));
  const reduced = () => window.matchMedia(REDUCED).matches;

  const mm = gsap.matchMedia();

  mm.add({ reduce: REDUCED, motion: `not ${REDUCED}` }, (ctx) => {
    const noMotion = Boolean(ctx.conditions?.reduce);

    const timelines = new Map<number, gsap.core.Timeline>();
    if (!noMotion) {
      panels.forEach((panel, i) => {
        const build = panel.dataset.scrub ? scrubs[panel.dataset.scrub] : undefined;
        if (build) timelines.set(i, build(panel).pause());

        // Les dalles « se posent » en arrivant : légère mise à l'échelle liée au scroll.
        if (panel.dataset.slab) {
          gsap.fromTo(
            panel,
            { scale: 0.94 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: panel, start: "top bottom", end: "top 45%", scrub: 0.4 },
            },
          );
        }
      });

      // La section d'ouverture s'efface doucement en montant, plutôt que de disparaître d'un bloc.
      const hero = panels[0]?.firstElementChild;
      if (hero) {
        gsap.to(hero, {
          y: 90,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: panels[0], start: "top top", end: "bottom top", scrub: 0.4 },
        });
      }
    }

    const panelIo = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = panels.indexOf(entry.target as HTMLElement);
          panelStore.markEntered(idx);
          timelines.get(idx)?.play();
        }),
      { threshold: 0.25 },
    );
    panels.forEach((p) => panelIo.observe(p));

    const revealIo = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-in", ""); // attribut : React ne l'écrase pas au re-rendu
          revealIo.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    stage.querySelectorAll("[data-reveal]").forEach((el) => revealIo.observe(el));

    const onScroll = () => {
      const probe = window.innerHeight * 0.45;
      let active = 0;
      let underHeader = 0;
      panels.forEach((p, i) => {
        const top = p.getBoundingClientRect().top;
        if (top <= probe) active = i;
        if (top <= 40) underHeader = i;
      });
      panelStore.setActive(active);
      document.body.dataset.panelTheme = panels[active]?.dataset.theme ?? "dark";
      document.body.dataset.headerTheme = panels[underHeader]?.dataset.theme ?? "dark";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (progressBar) {
      gsap.fromTo(
        progressBar,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
      );
    }

    return () => {
      panelIo.disconnect();
      revealIo.disconnect();
      window.removeEventListener("scroll", onScroll);
      timelines.forEach((tl) => tl.progress(1).kill());
    };
  });

  return {
    scrollToPanel: (index) => panels[index]?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" }),
    destroy: () => mm.revert(),
  };
}
