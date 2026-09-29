import { useCallback, useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nav, type SectionId } from "./content";
import { initMotion, type MotionController } from "./motion/stage";
import { MotionContext, sectionIndex } from "./motion/MotionContext";
import { Header, ProgressBar, SideNav } from "./components/Chrome";
import { Hero } from "./sections/Hero";
import { Problem } from "./sections/Problem";
import { Steps } from "./sections/Steps";
import { Assistants } from "./sections/Assistants";
import { Connectors } from "./sections/Connectors";
import { Builder } from "./sections/Builder";
import { Share } from "./sections/Share";
import { Analytics } from "./sections/Analytics";
import { Why } from "./sections/Why";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";

export default function App() {
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const motion = useRef<MotionController | null>(null);

  useLayoutEffect(() => {
    const controller = initMotion(stage.current!, bar.current);
    motion.current = controller;
    if (import.meta.env.DEV) (window as unknown as { __motion?: MotionController }).__motion = controller;

    const hashIndex = nav.findIndex((n) => `#${n.id}` === window.location.hash);
    if (hashIndex > 0) requestAnimationFrame(() => controller.scrollToPanel(hashIndex));
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      controller.destroy();
      motion.current = null;
    };
  }, []);

  const scrollTo = useCallback((id: SectionId) => motion.current?.scrollToPanel(sectionIndex(id)), []);

  return (
    <MotionContext.Provider value={scrollTo}>
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <ProgressBar ref={bar} />
      <Header />
      <SideNav />
      <main id="main" ref={stage} className="stage">
        <Hero />
        <Problem />
        <Steps />
        <Assistants />
        <Connectors />
        <Builder />
        <Share />
        <Analytics />
        <Why />
        <Contact />
      </main>
      <Footer />
    </MotionContext.Provider>
  );
}
