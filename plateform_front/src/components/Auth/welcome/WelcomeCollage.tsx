import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { BuilderDemo } from "./vitrine/BuilderDemo";
import { ReasoningDemo } from "./vitrine/ReasoningDemo";
import { ShareDemo } from "./vitrine/ShareDemo";
import scope from "./vitrine/scope.module.css";
import styles from "./WelcomeCollage.module.css";

const WIDTH = 980;
const HEIGHT = 860;
/** Marge laissée autour de la composition dans la colonne (px). */
const MARGIN = 40;

const order = (i: number) => ({ "--i": i }) as CSSProperties;

/** Démos animées du site vitrine, composées sur un repère 980×860 mis à l'échelle de la colonne. */
export const WelcomeCollage = () => {
    const frame = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const column = frame.current?.parentElement;
        if (!column) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setScale(Math.min(1, (width - 2 * MARGIN) / WIDTH, (height - 2 * MARGIN) / HEIGHT));
        });
        ro.observe(column);
        return () => ro.disconnect();
    }, []);

    return (
        <div
            ref={frame}
            className={`${scope.scope} ${styles.frame}`}
            style={{ width: WIDTH * scale, height: HEIGHT * scale }}
            aria-hidden
        >
            <div className={styles.canvas} style={{ transform: `scale(${scale})` }}>
                <div className={`${styles.layer} ${styles.builder} ${styles.enter}`} style={order(0)}>
                    <BuilderDemo />
                </div>
                <div className={`${styles.layer} ${styles.reasoning} ${styles.enter}`} style={order(1)}>
                    <div className={styles.blurred}>
                        <ReasoningDemo />
                    </div>
                </div>
                <div className={`${styles.layer} ${styles.share} ${styles.enter}`} style={order(2)}>
                    <ShareDemo />
                </div>
            </div>
        </div>
    );
};
