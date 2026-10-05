import { useRef, useState, type CSSProperties } from "react";
import { share } from "./content";
import { prefersReducedMotion } from "./motion/reduced";
import { useShareDemo } from "./sections/share/useShareDemo";
import { ShareBrowser } from "./sections/share/ShareBrowser";

/** Démo de déploiement reprise du site vitrine : adresse, couleur, mise en ligne, première question. */
export const ShareDemo = () => {
    const browser = useRef<HTMLDivElement | null>(null);
    const [color, setColor] = useState(0);

    const demo = useShareDemo(true, prefersReducedMotion(), {
        locate: (key) => {
            const root = browser.current;
            if (!root) return null;
            const box = root.getBoundingClientRect();
            if (key === "rest") return { x: box.width * 0.78, y: box.height * 0.88 };
            const el = root.querySelector(`[data-demo="${key}"]`);
            const r = el?.getBoundingClientRect();
            if (!r?.width) return null;
            const fx = key === "subdomain" || key === "question" ? 0.2 : 0.5;
            return { x: r.left - box.left + r.width * fx, y: r.top - box.top + r.height * 0.55 };
        },
        nextColor: (iteration) => (iteration + 1) % share.colors.length,
        pickColor: setColor,
    });

    const brand = share.colors[color];

    return (
        <ShareBrowser
            ref={browser}
            state={demo}
            color={color}
            style={{ "--brand": brand.value, "--brand-ink": brand.ink } as CSSProperties}
        />
    );
};
