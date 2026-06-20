import { useEffect, useRef, useState } from "react";

const DYNAMIC_PLACEHOLDERS = [
    "Posez votre question...",
    "Résumez les points clés du document...",
    "Quelles informations contient... ?",
    "Comment fonctionne ce processus... ?",
    "Quelles sont les conditions de ... ?",
    "Expliquez-moi cette procédure...",
];

enum Phase {
    WAIT = "wait",
    ERASE = "erase",
    TYPE = "type",
}

export function useDynamicPlaceholder(placeholder?: string) {
    const useDynamic = !placeholder;
    const [displayed, setDisplayed] = useState(useDynamic ? DYNAMIC_PLACEHOLDERS[0] : (placeholder ?? ""));
    const [isAnimating, setIsAnimating] = useState(false);

    const animState = useRef({
        text: DYNAMIC_PLACEHOLDERS[0],
        index: 0,
        phase: Phase.WAIT,
    });

    useEffect(() => {
        if (!useDynamic) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const tick = () => {
            const s = animState.current;

            if (s.phase === Phase.WAIT) {
                s.phase = Phase.ERASE;
                setIsAnimating(true);
                timeoutId = setTimeout(tick, 2800);
            } else if (s.phase === Phase.ERASE) {
                if (s.text.length > 0) {
                    s.text = s.text.slice(0, -1);
                    setDisplayed(s.text);
                    timeoutId = setTimeout(tick, 35);
                } else {
                    s.index = (s.index + 1) % DYNAMIC_PLACEHOLDERS.length;
                    s.phase = Phase.TYPE;
                    timeoutId = setTimeout(tick, 140);
                }
            } else {
                const target = DYNAMIC_PLACEHOLDERS[s.index];
                if (s.text.length < target.length) {
                    s.text = target.slice(0, s.text.length + 1);
                    setDisplayed(s.text);
                    timeoutId = setTimeout(tick, 48);
                } else {
                    s.phase = Phase.WAIT;
                    setIsAnimating(false);
                    timeoutId = setTimeout(tick, 2800);
                }
            }
        };

        timeoutId = setTimeout(tick, 2800);
        return () => clearTimeout(timeoutId);
    }, [useDynamic]);

    return { displayed, isAnimating };
}
