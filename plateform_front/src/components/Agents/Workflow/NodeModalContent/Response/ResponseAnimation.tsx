import { useState } from "react";
import { BookOpen, Layers, PenLine, ShieldCheck } from "lucide-react";
import { useDemoScript } from "hooks/demo/useDemoScript";
import { DemoChapterLabel, DemoStage } from "components/ui/demo/DemoStage";
import type { DemoAnimationProps } from "components/Agents/Workflow/NodeModalContent/NodeOverviewLayout";
import { RESPONSE_QUESTION, ResponseScene, type ResponseSceneState } from "./ResponseScene";
import { ANSWER_WORD_COUNT } from "./ResponseAnswer";

const CHAPTERS = [
    { icon: Layers, label: "Agrégation du contexte" },
    { icon: PenLine, label: "Génération de la réponse" },
    { icon: ShieldCheck, label: "Affinage de la réponse" },
    { icon: BookOpen, label: "Résultat final" },
];

const INITIAL: ResponseSceneState = {
    text: RESPONSE_QUESTION,
    sent: false,
    contextCount: 0,
    words: 0,
    refined: false,
    cited: false,
};

export const ResponseAnimation = ({ onChapterChange }: DemoAnimationProps) => {
    const [scene, setScene] = useState(INITIAL);
    const update = (patch: Partial<ResponseSceneState>) => setScene((s) => ({ ...s, ...patch }));

    const demo = useDemoScript(
        async (ctx) => {
            setScene(INITIAL);
            ctx.chapter(0);
            await ctx.wait(300);
            await ctx.show();
            await ctx.moveTo("send");
            await ctx.click();
            update({ sent: true, text: "" });
            await ctx.park("right");
            for (let i = 1; i <= 3; i++) {
                await ctx.wait(380);
                update({ contextCount: i });
            }
            await ctx.wait(800);

            ctx.chapter(1);
            for (let i = 1; i <= ANSWER_WORD_COUNT; i++) {
                update({ words: i });
                await ctx.wait(65 + Math.random() * 50);
            }
            await ctx.wait(500);

            ctx.chapter(2);
            update({ refined: true });
            await ctx.wait(1700);

            ctx.chapter(3);
            update({ cited: true });
            await ctx.wait(600);
            await ctx.moveTo("cite-1");
            await ctx.wait(2200);
        },
        { chapters: CHAPTERS.length, onChapterChange },
    );

    const current = CHAPTERS[demo.chapter];

    return (
        <DemoStage demo={demo}>
            <DemoChapterLabel icon={current.icon} label={current.label} />
            <ResponseScene scene={scene} hovered={demo.hovered} />
        </DemoStage>
    );
};
