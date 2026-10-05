import { FACES } from "./icoFaces";

/** Logo GenRAG redessiné en SVG d'après plateform_front/src/assets/logo/mainLogo.png. */
export function LogoMark({ size = 28 }: { size?: number }) {
    return (
        <svg width={size} height={(size * 331) / 742} viewBox="0 0 742 331" aria-hidden>
            <g fill="none" strokeLinecap="round">
                <path d="M40 40H300C392 40 402 135 498 135" stroke="#A8F3DF" strokeWidth="78" />
                <path d="M40 164H276" stroke="#34D3A9" strokeWidth="80" />
                <path d="M40 290H300C392 290 402 198 498 198" stroke="#12B98C" strokeWidth="78" />
            </g>
            <path d="M568 92c0-33 36-54 65-37l92 55c28 17 28 58 0 75l-92 55c-29 17-65-4-65-37z" fill="#07966F" />
        </svg>
    );
}

export function Logo() {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={34} />
            <span style={{ fontWeight: 700, fontSize: "1.125rem", letterSpacing: "-0.02em" }}>GenRAG</span>
        </span>
    );
}

export function AssistantLogo({ size = 40 }: { size?: number }) {
    return (
        <svg width={size} height={(size * 935) / 978} viewBox="0 0 978 935" aria-hidden>
            <g stroke="#34D3A9" strokeOpacity="0.35" strokeWidth="1.5" strokeLinejoin="round">
                {FACES.map((f) => (
                    <polygon key={f.points} points={f.points} fill={f.fill} />
                ))}
            </g>
        </svg>
    );
}
