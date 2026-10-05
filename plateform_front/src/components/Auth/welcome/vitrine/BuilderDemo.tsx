import { useRef } from "react";
import { Lock, RotateCw } from "lucide-react";
import { builder } from "./content";
import { DemoCursor } from "./components/DemoCursor";
import { AppSidebar } from "./mockups/AppSidebar";
import { BuilderCanvas } from "./mockups/BuilderCanvas";
import { prefersReducedMotion } from "./motion/reduced";
import { useBuilderDemo } from "./sections/builder/useBuilderDemo";
import { NodePalette } from "./sections/builder/NodePalette";
import { NodePanel } from "./sections/builder/NodePanel";
import styles from "./sections/Builder.module.css";

/** Démo de l'éditeur reprise du site vitrine : le curseur ajoute des blocs et leur choisit un modèle. */
export const BuilderDemo = () => {
    const canvas = useRef<HTMLDivElement | null>(null);

    const demo = useBuilderDemo(true, prefersReducedMotion(), {
        locate: (key) => {
            const root = canvas.current;
            if (!root) return null;
            const box = root.getBoundingClientRect();
            if (key === "rest") return { x: box.width * 0.6, y: box.height * 0.84 };
            const el = root.querySelector(`[data-demo="${key}"]`);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            if (!r.width) return null;
            const fx =
                key === "palette-search" ? 0.2 : key.startsWith("palette-") || key.startsWith("pick-") ? 0.4 : 0.5;
            return { x: r.left - box.left + r.width * fx, y: r.top - box.top + r.height * 0.55 };
        },
    });

    return (
        <div className={styles.browser}>
            <div className={styles.chrome}>
                <span className={styles.lights}>
                    <i />
                    <i />
                    <i />
                </span>
                <div className={styles.url}>
                    <Lock size={12} />
                    <span>{builder.url}</span>
                </div>
                <RotateCw size={13} className={styles.reload} />
            </div>
            <div className={styles.window}>
                <AppSidebar active={builder.sidebar.active} />
                <BuilderCanvas view={demo} rootRef={canvas}>
                    <NodePalette state={demo} />
                    <NodePanel state={demo} />
                    <DemoCursor cursor={demo.cursor} />
                </BuilderCanvas>
            </div>
        </div>
    );
};
