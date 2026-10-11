import { type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

interface AnimatedSvgProps {
    size: number;
    children: ReactNode;
    hoverHandlers?: { onMouseEnter: () => void; onMouseLeave: () => void };
    /** Outline icons (agent sidebar): lucide-like 2px stroke instead of filled shapes. */
    stroked?: boolean;
}

/**
 * Frame shared by the animated nav icons (24×24 viewBox). `reducedMotion="user"` makes framer-motion skip
 * transform animations when the OS asks for reduced motion: icons then jump straight to their state.
 */
export const AnimatedSvg = ({ size, children, hoverHandlers, stroked = false }: AnimatedSvgProps) => (
    <MotionConfig reducedMotion="user">
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroked ? "currentColor" : undefined}
            strokeWidth={stroked ? 2 : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            overflow="visible"
            aria-hidden
            {...hoverHandlers}
        >
            {children}
        </svg>
    </MotionConfig>
);
