import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScanSearch, Target, WandSparkles } from "lucide-react";
import { useDemoScript } from "hooks/demo/useDemoScript";
import { DEMO_EASE, DemoChapterLabel, DemoStage } from "components/ui/demo/DemoStage";
import { DemoChatInput } from "components/ui/demo/DemoChatInput";
import type { DemoAnimationProps } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";
import { REWRITER_EXAMPLES, RewriterScene, type RewriterSceneState } from "./RewriterScene";

const CHAPTERS = [
    { icon: ScanSearch, label: "Analyse de la question" },
    { icon: WandSparkles, label: "Reformulation" },
    { icon: Target, label: "Meilleure récupération" },
];

const INITIAL: RewriterSceneState = {
    example: 0,
    phase: "input",
    text: "",
    focused: false,
    analysed: 0,
    rewritten: false,
    scored: false,
};

export const RewriterAnimation = ({ onChapterChange }: DemoAnimationProps) => {
    const [scene, setScene] = useState(INITIAL);
    const update = (patch: Partial<RewriterSceneState>) => setScene((s) => ({ ...s, ...patch }));

    const demo = useDemoScript(
        async (ctx) => {
            const example = ctx.iteration % REWRITER_EXAMPLES.length;
            setScene({ ...INITIAL, example });
            ctx.chapter(0);
            await ctx.wait(300);
            await ctx.show();
            await ctx.moveTo("input", { anchor: "left" });
            await ctx.click();
            update({ focused: true });
            ctx.moveTo("input", { anchor: "bottom", offset: { x: 60, y: 22 }, duration: 0.6 }).catch(() => undefined);
            await ctx.type(REWRITER_EXAMPLES[example].original, (text) => update({ text }), 60);
            await ctx.wait(250);
            await ctx.moveTo("send");
            await ctx.click();
            update({ phase: "card", focused: false });
            await ctx.park();
            for (let i = 1; i <= 2; i++) {
                await ctx.wait(550);
                update({ analysed: i });
            }
            await ctx.wait(1000);

            ctx.chapter(1);
            update({ rewritten: true });
            await ctx.wait(2600);

            ctx.chapter(2);
            update({ scored: true });
            await ctx.wait(700);
            await ctx.moveTo("score-after", { anchor: "right" });
            await ctx.wait(1800);
        },
        { chapters: CHAPTERS.length, onChapterChange },
    );

    const current = CHAPTERS[demo.chapter];

    return (
        <DemoStage demo={demo}>
            <DemoChapterLabel icon={current.icon} label={current.label} />
            <AnimatePresence mode="wait" initial={false}>
                {scene.phase === "input" ? (
                    <motion.div
                        key="input"
                        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                        transition={{ duration: 0.3, ease: DEMO_EASE }}
                        style={{ height: "100%", display: "flex", alignItems: "center" }}
                    >
                        <div style={{ width: "100%" }}>
                            <DemoChatInput
                                value={scene.text}
                                placeholder="Posez votre question…"
                                focused={scene.focused}
                                sendHovered={demo.hovered === "send"}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <RewriterScene key="card" scene={scene} hovered={demo.hovered} />
                )}
            </AnimatePresence>
        </DemoStage>
    );
};
