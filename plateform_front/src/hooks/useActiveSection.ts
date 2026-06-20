import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export const useActiveSection = (ids: string[]) => {
    const [activeId, setActiveId] = useState<string>(ids[0] ?? "");
    const { pathname } = useLocation();
    const lockedRef = useRef(false);
    const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selectId = useCallback((id: string) => {
        setActiveId(id);
        lockedRef.current = true;
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
            lockedRef.current = false;
        }, 900);
    }, []);

    useEffect(() => {
        setActiveId(ids[0] ?? "");
    }, [pathname, ids]);

    useEffect(() => {
        if (!ids.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (lockedRef.current) return;
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length > 0) setActiveId(visible[0].target.id);
            },
            { threshold: 0.2, rootMargin: "-10% 0px -55% 0px" },
        );

        const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [ids, pathname]);

    return [activeId, selectId] as const;
};
