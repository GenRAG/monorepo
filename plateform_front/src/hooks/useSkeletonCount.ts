import { useEffect, useRef, useState } from "react";

interface UseSkeletonCountOptions {
    cardHeight: number;
    gap?: number;
    initialMultiplier?: number;
    max?: number;
}

export const useSkeletonCount = (
    columns: number,
    { cardHeight, gap = 12, initialMultiplier = 2, max = 60 }: UseSkeletonCountOptions,
) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(columns * initialMultiplier);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(([entry]) => {
            const rows = Math.max(1, Math.round((entry.contentRect.height + gap) / (cardHeight + gap)));
            setCount(Math.min(columns * rows, max));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [columns, cardHeight, gap, max]);

    return { containerRef, count };
};
