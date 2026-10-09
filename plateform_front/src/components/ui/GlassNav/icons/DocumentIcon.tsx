import { useId } from "react";
import { motion, type Variants } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { AnimatedSvg } from "./AnimatedSvg";

const spring = { type: "spring", stiffness: 260, damping: 16 } as const;
const GAP = 1.3;

const backSheet = (hover: number, active: number): Variants => ({
    initial: { rotate: 0 },
    hover: { rotate: hover, transition: spring },
    active: { rotate: active, transition: spring },
});

const frontLift: Variants = {
    initial: { y: 0 },
    hover: { y: -1.5, transition: spring },
    active: { y: 0, transition: spring },
};

/**
 * Knowledge bases: a stack of sheets that fans out like a hand of cards on hover.
 * Back sheets share one group opacity (their overlap does not darken), a carved gap separates them from the
 * front sheet, and the text lines are cut out of it: the icon reads the same on light and dark surfaces.
 */
export const DocumentIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);
    const gapMaskId = useId();
    const linesMaskId = useId();

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers}>
            <defs>
                <mask id={gapMaskId}>
                    <rect x={-6} y={-6} width={36} height={36} fill="white" />
                    <motion.rect
                        x={6 - GAP}
                        y={3 - GAP}
                        width={12 + GAP * 2}
                        height={17 + GAP * 2}
                        rx={2 + GAP}
                        fill="black"
                        variants={frontLift}
                        initial="initial"
                        animate={label}
                    />
                </mask>
                <mask id={linesMaskId}>
                    <rect x={6} y={3} width={12} height={17} rx={2} fill="white" />
                    <rect x={9} y={8} width={6} height={1.6} rx={0.8} fill="black" />
                    <rect x={9} y={11.5} width={4} height={1.6} rx={0.8} fill="black" />
                </mask>
            </defs>

            <g mask={`url(#${gapMaskId})`} opacity={0.5}>
                {[backSheet(-22, -9), backSheet(22, 9)].map((variants, index) => (
                    <motion.rect
                        key={index}
                        x={6}
                        y={3}
                        width={12}
                        height={17}
                        rx={2}
                        fill="currentColor"
                        style={{ transformOrigin: "12px 21px" }}
                        variants={variants}
                        initial="initial"
                        animate={label}
                    />
                ))}
            </g>

            <motion.g variants={frontLift} initial="initial" animate={label}>
                <rect
                    x={6}
                    y={3}
                    width={12}
                    height={17}
                    rx={2}
                    fill="currentColor"
                    opacity={0.9}
                    mask={`url(#${linesMaskId})`}
                />
            </motion.g>
        </AnimatedSvg>
    );
};
