import styles from "./DemoCursor.module.css";

export interface CursorState {
    x: number;
    y: number;
    press: boolean;
    visible: boolean;
    /** Durée du déplacement vers (x, y), en ms. */
    duration: number;
}

/** Curseur de démonstration : glisse d'une cible à l'autre et « clique » avec une onde. */
export function DemoCursor({ cursor }: { cursor: CursorState }) {
    return (
        <span
            className={`${styles.cursor} ${cursor.visible ? styles.on : ""} ${cursor.press ? styles.press : ""}`}
            style={{
                transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                transitionDuration: `${cursor.duration}ms, 300ms`,
            }}
            aria-hidden
        >
            <svg width="22" height="24" viewBox="0 0 22 24">
                <path
                    d="M2 1.5 19 13l-7.3 1.3 4.3 7.6-2.9 1.6-4.3-7.7L3.6 20.6z"
                    fill="#fff"
                    stroke="#0B0E11"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                />
            </svg>
            <span className={styles.ripple} />
        </span>
    );
}
