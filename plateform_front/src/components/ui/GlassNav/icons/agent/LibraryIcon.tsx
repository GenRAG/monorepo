import { motion } from "framer-motion";
import { AnimatedIconProps } from "../types";
import { useIconAnimationState } from "../useIconAnimationState";
import { AnimatedSvg } from "../AnimatedSvg";

// Knowledge bases: the books on the shelf tip over one after the other, like dominoes, and stand back up.
const BOOKS = [
    { d: "M4 4v16", origin: "4px 20px" },
    { d: "M8 8v12", origin: "8px 20px" },
    { d: "M12 6v14", origin: "12px 20px" },
];

export const LibraryIcon = ({ size = 18, isActive = false, isHovered }: AnimatedIconProps) => {
    const { label, hoverHandlers } = useIconAnimationState(isActive, isHovered);

    return (
        <AnimatedSvg size={size} hoverHandlers={hoverHandlers} stroked>
            {BOOKS.map((book, index) => (
                <motion.path
                    key={book.d}
                    d={book.d}
                    style={{ transformOrigin: book.origin }}
                    variants={{
                        initial: { rotate: 0 },
                        hover: {
                            rotate: [0, 11, 0],
                            transition: { duration: 0.45, delay: index * 0.09, ease: "easeInOut" },
                        },
                        active: { rotate: 0 },
                    }}
                    initial="initial"
                    animate={label}
                />
            ))}
            {/* The leaning book catches the last domino and straightens up. */}
            <motion.path
                d="m16 6 4 14"
                style={{ transformOrigin: "20px 20px" }}
                variants={{
                    initial: { rotate: 0 },
                    hover: { rotate: [0, 0, 14, 0], transition: { duration: 0.6, times: [0, 0.45, 0.7, 1] } },
                    active: { rotate: 14 },
                }}
                initial="initial"
                animate={label}
            />
        </AnimatedSvg>
    );
};
