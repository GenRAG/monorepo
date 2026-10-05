import { useState } from "react";
import { Box, useToken } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

export const LOADER_LOOP_S = 2.2;
const LOOP = `${LOADER_LOOP_S}s`;

/**
 * Position courante dans la boucle, calée sur l'horloge de la page : un loader remonté
 * (enchaînement de guards) reprend l'animation là où le précédent l'a laissée.
 */
export const useLoaderPhase = () => useState(() => (performance.now() / 1000) % LOADER_LOOP_S)[0];

/** Chaque trait se trace de gauche à droite, tient, puis s'écoule vers la flèche. */
const flow = keyframes`
    0% { stroke-dashoffset: 1.15; }
    38%, 58% { stroke-dashoffset: 0; }
    96%, 100% { stroke-dashoffset: -1.15; }
`;

/** La flèche s'allume quand les traits l'atteignent. */
const ignite = keyframes`
    0%, 30% { opacity: 0.28; transform: scale(0.9); }
    44% { opacity: 1; transform: scale(1.08); }
    58% { opacity: 1; transform: scale(1); }
    100% { opacity: 0.28; transform: scale(0.9); }
`;

const STROKES = [
    { d: "M40 40H300C392 40 402 135 498 135", width: 78 },
    { d: "M40 164H276", width: 80 },
    { d: "M40 290H300C392 290 402 198 498 198", width: 78 },
];

interface GenragLoaderProps {
    /** Largeur du logo en px. */
    size?: number;
}

/** Logo GenRAG animé pour les chargements : trois traits convergent et allument la flèche, en boucle. */
export const GenragLoader = ({ size = 96 }: GenragLoaderProps) => {
    const colors = useToken("colors", ["green.200", "green.400", "green.500"]);
    const [arrow] = useToken("colors", ["green.600"]);
    const phase = useLoaderPhase();

    return (
        <Box
            as="svg"
            viewBox="0 0 742 331"
            w={`${size}px`}
            h={`${(size * 331) / 742}px`}
            overflow="visible"
            role="img"
            aria-label="Chargement"
            sx={{
                "& path[data-stroke]": {
                    strokeDasharray: "1 1.15",
                    animation: `${flow} ${LOOP} cubic-bezier(0.65, 0, 0.35, 1) infinite`,
                },
                "& path[data-arrow]": {
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animation: `${ignite} ${LOOP} ease-in-out infinite`,
                },
                "@media (prefers-reduced-motion: reduce)": {
                    "& path[data-stroke], & path[data-arrow]": { animation: "none" },
                    "& path[data-stroke]": { strokeDasharray: "none" },
                },
            }}
        >
            {/* Silhouette fixe : le logo reste lisible pendant que les traits s'écoulent */}
            <g fill="none" strokeLinecap="round" opacity={0.16}>
                {STROKES.map((stroke, i) => (
                    <path key={stroke.d} d={stroke.d} stroke={colors[i]} strokeWidth={stroke.width} />
                ))}
            </g>
            <g fill="none" strokeLinecap="round">
                {STROKES.map((stroke, i) => (
                    <path
                        key={stroke.d}
                        data-stroke
                        d={stroke.d}
                        pathLength={1}
                        stroke={colors[i]}
                        strokeWidth={stroke.width}
                        style={{ animationDelay: `${i * 0.11 - phase}s` }}
                    />
                ))}
            </g>
            <path
                data-arrow
                d="M568 92c0-33 36-54 65-37l92 55c28 17 28 58 0 75l-92 55c-29 17-65-4-65-37z"
                fill={arrow}
                style={{ animationDelay: `${-phase}s` }}
            />
        </Box>
    );
};
