import { useState } from "react";
import { ArrowUpDown, CheckCircle2, FileStack, ScanSearch } from "lucide-react";
import { useDemoScript } from "hooks/demo/useDemoScript";
import { DemoChapterLabel, DemoStage } from "components/ui/demo/DemoStage";
import type { DemoAnimationProps } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";
import { RerankerScene, type RerankerSceneState } from "./ReRankerScene";

const CHAPTERS = [
    { icon: FileStack, label: "Résultats entrants" },
    { icon: ScanSearch, label: "Évaluation de la pertinence" },
    { icon: ArrowUpDown, label: "Réorganisation intelligente" },
    { icon: CheckCircle2, label: "Résultats optimisés" },
];

const INITIAL: RerankerSceneState = {
    visible: 0,
    scoring: false,
    scanned: 0,
    sorted: false,
    filtered: false,
};

export const RerankerAnimation = ({ onChapterChange }: DemoAnimationProps) => {
    const [scene, setScene] = useState(INITIAL);
    const update = (patch: Partial<RerankerSceneState>) => setScene((s) => ({ ...s, ...patch }));

    const demo = useDemoScript(
        async (ctx) => {
            setScene(INITIAL);
            ctx.chapter(0);
            for (let i = 1; i <= 4; i++) {
                await ctx.wait(200);
                update({ visible: i });
            }
            await ctx.wait(900);

            ctx.chapter(1);
            await ctx.show();
            await ctx.moveTo("rerank");
            await ctx.click();
            update({ scoring: true });
            for (let i = 1; i <= 4; i++) {
                await ctx.wait(330);
                update({ scanned: i });
            }
            await ctx.wait(700);

            ctx.chapter(2);
            update({ scoring: false, sorted: true });
            await ctx.park("right");
            await ctx.wait(1500);

            ctx.chapter(3);
            update({ filtered: true });
            await ctx.wait(600);
            await ctx.moveTo("row-b", { anchor: "left" });
            await ctx.wait(2000);
        },
        { chapters: CHAPTERS.length, onChapterChange },
    );

    const current = CHAPTERS[demo.chapter];

    return (
        <DemoStage demo={demo}>
            <DemoChapterLabel icon={current.icon} label={current.label} />
            <RerankerScene scene={scene} hovered={demo.hovered} pressed={demo.cursor.pressed} />
        </DemoStage>
    );
};
