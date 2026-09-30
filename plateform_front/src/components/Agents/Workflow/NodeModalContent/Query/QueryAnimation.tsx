import { useState } from "react";
import { Layers, MessageSquare, Zap } from "lucide-react";
import { useDemoScript } from "hooks/demo/useDemoScript";
import { DemoChapterLabel, DemoStage } from "components/ui/demo/DemoStage";
import type { DemoAnimationProps } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";
import { QUERY_QUESTION, QueryScene, type QuerySceneState } from "./QueryScene";

const CHAPTERS = [
    { icon: MessageSquare, label: "Entrée utilisateur" },
    { icon: Layers, label: "Injection de contexte" },
    { icon: Zap, label: "Déclenchement du pipeline" },
];

const INITIAL: QuerySceneState = {
    phase: "input",
    text: "",
    focused: false,
    contextCount: 0,
    pipelineStep: 0,
};

export const QueryAnimation = ({ onChapterChange }: DemoAnimationProps) => {
    const [scene, setScene] = useState(INITIAL);
    const update = (patch: Partial<QuerySceneState>) => setScene((s) => ({ ...s, ...patch }));

    const demo = useDemoScript(
        async (ctx) => {
            setScene(INITIAL);
            ctx.chapter(0);
            await ctx.wait(350);
            await ctx.show();
            await ctx.moveTo("input", { anchor: "left" });
            await ctx.click();
            update({ focused: true });
            ctx.moveTo("input", { anchor: "bottom", offset: { x: 60, y: 22 }, duration: 0.6 }).catch(() => undefined);
            await ctx.wait(200);
            await ctx.type(QUERY_QUESTION, (text) => update({ text }));
            await ctx.wait(250);
            await ctx.moveTo("send");
            await ctx.click();

            ctx.chapter(1);
            update({ phase: "context", focused: false });
            await ctx.park();
            for (let i = 1; i <= 3; i++) {
                await ctx.wait(380);
                update({ contextCount: i });
            }
            await ctx.wait(900);

            ctx.chapter(2);
            update({ phase: "pipeline" });
            await ctx.wait(450);
            for (let i = 1; i <= 4; i++) {
                update({ pipelineStep: i });
                await ctx.wait(560);
            }
            await ctx.moveTo("pipeline-2", { anchor: "right" });
            await ctx.wait(1300);
        },
        { chapters: CHAPTERS.length, onChapterChange },
    );

    const current = CHAPTERS[demo.chapter];

    return (
        <DemoStage demo={demo}>
            <DemoChapterLabel icon={current.icon} label={current.label} />
            <QueryScene scene={scene} hovered={demo.hovered} />
        </DemoStage>
    );
};
