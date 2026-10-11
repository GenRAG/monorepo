import { useId } from "react";
import { motion } from "framer-motion";
import { AnimatedIconProps } from "./types";
import { useIconAnimationState } from "./useIconAnimationState";
import { AnimatedSvg } from "./AnimatedSvg";

const spring = { type: "spring", stiffness: 320, damping: 18 } as const;

// Front panel: its top edge lowers (height shrinks from the bottom, so the rounded corners stay intact).
const FRONT = {
    initial: { attrY: 10, height: 10 },
    hover: { attrY: 13, height: 7 },
    active: { attrY: 11.5, height: 8.5 },
};
// The gap carved around the front, so the sheet and the back never melt into it.
const GAP = 1.4;

/**
 * Hover: the front of the folder lowers and a sheet slides out. Everything behind the front (back panel, sheet)
 * is masked by a slightly larger copy of the front, which draws a constant gap between the layers.
 */
export const FolderIcon = ({ size = 20, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);
    const maskId = useId();
    const clipId = useId();

    const frontVariants = (inset: number) => ({
        initial: { attrY: FRONT.initial.attrY - inset, height: FRONT.initial.height + inset },
        hover: { attrY: FRONT.hover.attrY - inset, height: FRONT.hover.height + inset, transition: spring },
        active: { attrY: FRONT.active.attrY - inset, height: FRONT.active.height + inset, transition: spring },
    });

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers}>
            <defs>
                <mask id={maskId}>
                    <rect x={0} y={-6} width={24} height={30} fill="white" />
                    <motion.rect
                        x={3 - GAP}
                        width={18 + GAP * 2}
                        rx={2.5 + GAP}
                        fill="black"
                        variants={frontVariants(GAP)}
                        initial="initial"
                        animate={label}
                    />
                </mask>
                <clipPath id={clipId}>
                    <rect x={0} y={-6} width={24} height={26} />
                </clipPath>
            </defs>

            <g mask={`url(#${maskId})`}>
                <rect x={5} y={4} width={7} height={4} rx={1.2} fill="currentColor" opacity={0.6} />
                <rect x={3} y={7} width={18} height={13} rx={2.5} fill="currentColor" opacity={0.45} />
                <g clipPath={`url(#${clipId})`}>
                    <motion.g
                        variants={{
                            initial: { y: 3, opacity: 0 },
                            hover: { y: -3.5, opacity: 1, transition: { ...spring, delay: 0.05 } },
                            active: { y: -1, opacity: 1, transition: spring },
                        }}
                        initial="initial"
                        animate={label}
                    >
                        <rect x={7} y={8} width={10} height={9} rx={1.2} fill="currentColor" />
                    </motion.g>
                </g>
            </g>

            <motion.rect
                x={3}
                width={18}
                rx={2.5}
                fill="currentColor"
                variants={frontVariants(0)}
                initial="initial"
                animate={label}
            />
        </AnimatedSvg>
    );
};
