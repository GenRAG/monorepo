import { useEffect, useState } from "react";

type BreakpointKey = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

const breakpointOrder: BreakpointKey[] = ["base", "sm", "md", "lg", "xl", "2xl"];

const getCurrentBreakpoint = (width: number): BreakpointKey => {
    if (width >= 1536) return "2xl";
    if (width >= 1280) return "xl";
    if (width >= 992) return "lg";
    if (width >= 768) return "md";
    if (width >= 480) return "sm";
    return "base";
};

const getResponsiveValue = <P extends Record<string, T>, T>(
    values: P,
    activeBreakpoint: BreakpointKey,
): T | undefined => {
    const activeIndex = breakpointOrder.indexOf(activeBreakpoint);

    for (let index = activeIndex; index >= 0; index -= 1) {
        const key = breakpointOrder[index] as keyof P;
        if (key in values && values[key] !== undefined) {
            return values[key];
        }
    }

    return undefined;
};

export const useAppResponsive = <P extends Record<string, T>, T = P[keyof P]>(
    values: P,
) => {
    const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey>(() => {
        if (typeof window === "undefined") {
            return "base";
        }

        return getCurrentBreakpoint(window.innerWidth);
    });

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const updateBreakpoint = () => {
            setActiveBreakpoint(getCurrentBreakpoint(window.innerWidth));
        };

        updateBreakpoint();
        window.addEventListener("resize", updateBreakpoint);

        return () => {
            window.removeEventListener("resize", updateBreakpoint);
        };
    }, []);

    return getResponsiveValue(values, activeBreakpoint) as "base" extends keyof P
        ? T
        : T | undefined;
};
