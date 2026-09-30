import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Binary, Boxes, FileUp, Search } from "lucide-react";
import { useDemoScript } from "hooks/demo/useDemoScript";
import { DEMO_EASE, DemoChapterLabel, DemoStage } from "components/ui/demo/DemoStage";
import type { DemoAnimationProps } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";
import { DocumentUpload, FileStackChip } from "./DocumentUpload";
import { DocumentChunks } from "./DocumentChunks";
import { DocumentVectorSpace } from "./DocumentVectorSpace";

const CHAPTERS = [
    { icon: FileUp, label: "Ingestion de documents" },
    { icon: Binary, label: "Vectorisation" },
    { icon: Boxes, label: "Stockage vectoriel" },
    { icon: Search, label: "Recherche sémantique" },
];

export interface DocumentSceneState {
    phase: "upload" | "chunk" | "space";
    dropActive: boolean;
    dropped: boolean;
    chunks: number;
    searchVisible: boolean;
    search: string;
    searchFocused: boolean;
    searched: boolean;
}

const INITIAL: DocumentSceneState = {
    phase: "upload",
    dropActive: false,
    dropped: false,
    chunks: 0,
    searchVisible: false,
    search: "",
    searchFocused: false,
    searched: false,
};

const phaseTransition = {
    initial: { opacity: 0, y: 14, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -14, filter: "blur(4px)" },
    transition: { duration: 0.4, ease: DEMO_EASE },
};

export const DocumentDatabaseAnimation = ({ onChapterChange }: DemoAnimationProps) => {
    const [scene, setScene] = useState(INITIAL);
    const update = (patch: Partial<DocumentSceneState>) => setScene((s) => ({ ...s, ...patch }));

    const demo = useDemoScript(
        async (ctx) => {
            setScene(INITIAL);
            ctx.chapter(0);
            await ctx.wait(300);
            ctx.carry(<FileStackChip />);
            ctx.press();
            await ctx.show();
            await ctx.moveTo("dropzone", { offset: { x: -30, y: -6 } });
            update({ dropActive: true });
            await ctx.wait(350);
            ctx.release();
            ctx.carry(null);
            update({ dropActive: false, dropped: true });
            await ctx.park();
            await ctx.wait(1700);

            ctx.chapter(1);
            update({ phase: "chunk" });
            for (let i = 1; i <= 3; i++) {
                await ctx.wait(650);
                update({ chunks: i });
            }
            await ctx.wait(1100);

            ctx.chapter(2);
            update({ phase: "space" });
            await ctx.wait(2200);

            ctx.chapter(3);
            update({ searchVisible: true });
            await ctx.wait(350);
            await ctx.moveTo("search", { anchor: "left" });
            await ctx.click();
            update({ searchFocused: true });
            await ctx.type("congés payés", (search) => update({ search }));
            await ctx.wait(200);
            await ctx.moveTo("search-submit");
            await ctx.click();
            update({ searched: true, searchFocused: false });
            await ctx.park("bottom-right");
            await ctx.wait(2200);
        },
        { chapters: CHAPTERS.length, onChapterChange },
    );

    const current = CHAPTERS[demo.chapter];

    return (
        <DemoStage demo={demo}>
            <DemoChapterLabel icon={current.icon} label={current.label} />
            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={scene.phase} {...phaseTransition} style={{ height: "100%" }}>
                    {scene.phase === "upload" && (
                        <DocumentUpload dropActive={scene.dropActive} dropped={scene.dropped} />
                    )}
                    {scene.phase === "chunk" && <DocumentChunks chunks={scene.chunks} />}
                    {scene.phase === "space" && <DocumentVectorSpace scene={scene} hovered={demo.hovered} />}
                </motion.div>
            </AnimatePresence>
        </DemoStage>
    );
};
