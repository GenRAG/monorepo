import { Box, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { DEMO_EASE, DEMO_SPRING } from "components/ui/demo/DemoStage";
import type { DocumentSceneState } from "./DocumentAnimation";
import { QueryPoint, SearchBar } from "./DocumentSearch";

const CLUSTERS = [
    { label: "RH", x: 24, y: 58 },
    { label: "Tarifs", x: 74, y: 48 },
    { label: "Produit", x: 55, y: 77 },
];

const OFFSETS = [
    [-6, -9],
    [5, -11],
    [-10, 2],
    [8, 1],
    [-2, 10],
    [9, 11],
    [1, -1],
    [-11, -5],
];

const DOTS = CLUSTERS.flatMap((c, ci) =>
    OFFSETS.map(([dx, dy], i) => ({
        id: ci * OFFSETS.length + i,
        x: c.x + dx,
        y: c.y + dy * 1.1,
    })),
);

const QUERY = { x: 29, y: 53 };
const ASPECT = 0.56;
const NEIGHBORS = new Set(
    [...DOTS]
        .sort(
            (a, b) =>
                Math.hypot(a.x - QUERY.x, (a.y - QUERY.y) * ASPECT) -
                Math.hypot(b.x - QUERY.x, (b.y - QUERY.y) * ASPECT),
        )
        .slice(0, 4)
        .map((d) => d.id),
);

interface DocumentVectorSpaceProps {
    scene: DocumentSceneState;
    hovered: string | null;
}

export const DocumentVectorSpace = ({ scene, hovered }: DocumentVectorSpaceProps) => (
    <Box
        position="relative"
        h="100%"
        borderRadius="12px"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="borderDivider"
        overflow="hidden"
        backgroundImage="radial-gradient(var(--chakra-colors-borderDefault) 1px, transparent 1px)"
        backgroundSize="18px 18px"
    >
        <AnimatePresence>
            {scene.searchVisible && <SearchBar scene={scene} submitHovered={hovered === "search-submit"} />}
        </AnimatePresence>

        {CLUSTERS.map((c, i) => (
            <motion.div
                key={c.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: scene.searched ? 0.35 : 1 }}
                transition={{ delay: scene.searched ? 0 : 1 + i * 0.15, duration: 0.4 }}
                style={{
                    position: "absolute",
                    left: `${c.x}%`,
                    top: `${c.y - 20}%`,
                    transform: "translateX(-50%)",
                }}
            >
                <Text variant="caption-xs-muted">{c.label}</Text>
            </motion.div>
        ))}

        {scene.searched && (
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                }}
            >
                {DOTS.filter((d) => NEIGHBORS.has(d.id)).map((d, i) => (
                    <motion.line
                        key={d.id}
                        x1={QUERY.x}
                        y1={QUERY.y}
                        initial={{ x2: QUERY.x, y2: QUERY.y }}
                        animate={{ x2: d.x, y2: d.y }}
                        transition={{
                            duration: 0.5,
                            delay: 0.35 + i * 0.1,
                            ease: DEMO_EASE,
                        }}
                        stroke="var(--chakra-colors-iconAccent)"
                        strokeWidth={1.2}
                        strokeDasharray="3 2"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}
            </svg>
        )}

        {DOTS.map((d, i) => {
            const isMatch = scene.searched && NEIGHBORS.has(d.id);
            return (
                <motion.div
                    key={d.id}
                    initial={{ opacity: 0, scale: 0, x: -40 }}
                    animate={{
                        opacity: scene.searched && !isMatch ? 0.18 : isMatch ? 1 : 0.6,
                        scale: isMatch ? 1.6 : 1,
                        x: 0,
                    }}
                    transition={{
                        ...DEMO_SPRING,
                        delay: scene.searched ? 0.4 : i * 0.035,
                    }}
                    style={{
                        position: "absolute",
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        marginLeft: -3,
                        marginTop: -3,
                    }}
                >
                    <Box
                        w="6px"
                        h="6px"
                        borderRadius="999px"
                        bg="iconAccent"
                        boxShadow={isMatch ? "0 0 8px var(--chakra-colors-iconAccent)" : "none"}
                    />
                </motion.div>
            );
        })}

        {scene.searched && <QueryPoint x={QUERY.x} y={QUERY.y} />}
    </Box>
);
