import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PageId } from "../routes";
import { initMotion, type MotionController } from "../motion/stage";
import { MotionContext } from "../motion/MotionContext";
import { Footer } from "../sections/Footer";
import { Header, ProgressBar, SideNav, type PanelLink } from "./Chrome";

/** Coque commune des pages : header, navigation de section, animations au scroll, pied de page. */
export function Layout({ page, children }: { page: PageId; children: ReactNode }) {
  const stage = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const motion = useRef<MotionController | null>(null);
  const [panels, setPanels] = useState<PanelLink[]>([]);

  useLayoutEffect(() => {
    const controller = initMotion(stage.current!, bar.current);
    motion.current = controller;
    if (import.meta.env.DEV) (window as unknown as { __motion?: MotionController }).__motion = controller;

    const found = Array.from(stage.current!.querySelectorAll<HTMLElement>(":scope > [data-panel]"));
    setPanels(found.map((p) => ({ id: p.id, label: p.getAttribute("aria-label") ?? p.id })));

    // Les id de section sont en ASCII : pas de décodage, qui lève une erreur sur une ancre mal formée.
    const hash = window.location.hash.slice(1);
    const target = hash ? found.find((p) => p.id === hash) : undefined;
    // Saut après le refresh : ScrollTrigger.refresh remet la page à sa position et annulerait un défilement en cours.
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      ScrollTrigger.refresh();
      target?.scrollIntoView();
    });

    return () => {
      controller.destroy();
      motion.current = null;
    };
  }, []);

  const scrollTo = useCallback((id: string) => motion.current?.scrollToPanel(id), []);

  return (
    <MotionContext.Provider value={scrollTo}>
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <ProgressBar ref={bar} />
      <Header current={page} />
      <SideNav panels={panels} />
      <main id="main" ref={stage} className="stage">
        {children}
      </main>
      <Footer />
    </MotionContext.Provider>
  );
}
