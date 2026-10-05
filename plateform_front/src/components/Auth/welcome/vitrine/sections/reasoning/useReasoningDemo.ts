import { useEffect, useState } from "react";
import { reasoning } from "../../content";

/**
 * Scénario en boucle de la section « Recherche et raisonnement » : la question arrive, l'assistant
 * retrouve un passage dans chaque document, les compare critère par critère, puis rédige la synthèse.
 */

export interface ReasoningDemoState {
    asked: boolean;
    /** Étape de réflexion en cours (index dans `reasoning.trace`), `trace.length` quand tout est terminé. */
    step: number;
    /** Nombre de sources, de lignes du comparatif et de mots de la réponse affichés. */
    sources: number;
    rows: number;
    answer: number;
    fading: boolean;
}

const ABORT = Symbol("abort");
const ANSWER_WORDS = reasoning.answer.split(" ").length;

const idle: ReasoningDemoState = { asked: false, step: -1, sources: 0, rows: 0, answer: 0, fading: false };

/** État figé quand les animations sont réduites : comparatif et synthèse affichés. */
export const staticState: ReasoningDemoState = {
    asked: true,
    step: reasoning.trace.length,
    sources: reasoning.sources.length,
    rows: reasoning.rows.length,
    answer: ANSWER_WORDS,
    fading: false,
};

export function useReasoningDemo(running: boolean, reduced: boolean) {
    const [state, setState] = useState<ReasoningDemoState>(reduced ? staticState : idle);

    useEffect(() => {
        if (!running || reduced) return;
        let cancelled = false;

        const update = (patch: Partial<ReasoningDemoState>) => setState((s) => ({ ...s, ...patch }));

        const wait = async (ms: number) => {
            await new Promise((r) => setTimeout(r, ms));
            if (cancelled) throw ABORT;
        };

        const cycle = async () => {
            await wait(500);
            update({ asked: true });
            await wait(900);

            // 1. Recherche : un passage par document
            update({ step: 0 });
            for (let i = 1; i <= reasoning.sources.length; i++) {
                await wait(750);
                update({ sources: i });
            }
            await wait(600);

            // 2. Comparaison critère par critère
            update({ step: 1 });
            for (let i = 1; i <= reasoning.rows.length; i++) {
                await wait(800);
                update({ rows: i });
            }
            await wait(600);

            // 3. Synthèse
            update({ step: reasoning.trace.length });
            await wait(350);
            for (let i = 1; i <= ANSWER_WORDS; i++) {
                update({ answer: i });
                await wait(65);
            }
            await wait(4200);

            // Retour au début
            update({ fading: true });
            await wait(550);
            setState({ ...idle, fading: true });
            await wait(80);
            update({ fading: false });
            await wait(500);
        };

        const run = async () => {
            for (;;) await cycle();
        };

        run().catch((e) => {
            if (e !== ABORT) throw e;
        });

        return () => {
            cancelled = true;
            setState(idle);
        };
    }, [running, reduced]);

    return state;
}
