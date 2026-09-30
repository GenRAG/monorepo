import { useEffect, useRef, useState } from "react";
import { share } from "../../content";
import type { CursorState } from "../../components/DemoCursor";

/**
 * Scénario en boucle de la section « Déploiement » : le curseur tape le sous-domaine, choisit une couleur,
 * clique sur Déployer ; l'adresse se tape dans la barre du navigateur et la page devient le chatbot de
 * l'entreprise, où le curseur pose une question.
 */

export type Point = { x: number; y: number };

export interface ShareDemoState {
  cursor: CursorState;
  phase: "setup" | "deploying" | "live";
  subdomain: string;
  focused: "subdomain" | "question" | null;
  /** Étapes de déploiement validées (0 → 3). */
  deployed: number;
  /** Adresse tapée dans la barre une fois en ligne. */
  url: string;
  question: string;
  sent: boolean;
  /** Nombre de mots de la réponse affichés. */
  answer: number;
  source: boolean;
  hover: string | null;
  fading: boolean;
}

interface DemoEnv {
  locate: (key: string) => Point | null;
  /** Couleur que la démo doit choisir (celle du visiteur s'il en a choisi une), et son application. */
  nextColor: (iteration: number) => number;
  pickColor: (index: number) => void;
}

const ABORT = Symbol("abort");
const ANSWER_WORDS = share.answer.split(" ").length;

const base: Omit<ShareDemoState, "cursor"> = {
  phase: "setup",
  subdomain: "",
  focused: null,
  deployed: 0,
  url: "",
  question: "",
  sent: false,
  answer: 0,
  source: false,
  hover: null,
  fading: false,
};

const idle: ShareDemoState = { ...base, cursor: { x: 0, y: 0, press: false, visible: false, duration: 0 } };

/** État figé quand les animations sont réduites : l'assistant déployé, conversation affichée. */
export const staticState: ShareDemoState = {
  ...idle,
  phase: "live",
  subdomain: share.subdomain,
  deployed: share.setup.steps.length,
  url: share.url,
  question: share.question,
  sent: true,
  answer: ANSWER_WORDS,
  source: true,
};

export function useShareDemo(running: boolean, reduced: boolean, env: DemoEnv) {
  const [state, setState] = useState<ShareDemoState>(reduced ? staticState : idle);
  const envRef = useRef(env);

  useEffect(() => {
    envRef.current = env;
  });

  useEffect(() => {
    if (!running || reduced) return;
    let cancelled = false;

    const update = (patch: Partial<ShareDemoState> | ((s: ShareDemoState) => Partial<ShareDemoState>)) =>
      setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

    const wait = async (ms: number) => {
      await new Promise((r) => setTimeout(r, ms));
      if (cancelled) throw ABORT;
    };

    const move = async (target: string, ms = 650) => {
      const p = envRef.current.locate(target);
      if (p) update((s) => ({ hover: null, cursor: { ...s.cursor, ...p, visible: true, press: false, duration: ms } }));
      await wait(ms + 60);
      update({ hover: target });
    };

    const click = async () => {
      update((s) => ({ cursor: { ...s.cursor, press: true } }));
      await wait(160);
      update((s) => ({ cursor: { ...s.cursor, press: false } }));
      await wait(140);
    };

    const type = async (key: "subdomain" | "question" | "url", text: string, speed: number) => {
      for (let i = 1; i <= text.length; i++) {
        update({ [key]: text.slice(0, i) });
        await wait(speed + Math.random() * speed * 0.6);
      }
    };

    /** Écarte le curseur du champ où l'on tape, pour ne pas masquer le texte. */
    const nudge = () =>
      update((s) => ({ cursor: { ...s.cursor, x: s.cursor.x + 70, y: s.cursor.y + 26, duration: 500 } }));

    const rest = () => {
      const p = envRef.current.locate("rest");
      if (p) update((s) => ({ hover: null, cursor: { ...s.cursor, ...p, duration: 900 } }));
    };

    const cycle = async (iteration: number) => {
      // 1. Configuration
      await move("subdomain", 900);
      await click();
      update({ focused: "subdomain" });
      nudge();
      await wait(250);
      await type("subdomain", share.subdomain, 85);
      await wait(350);
      update({ focused: null });
      const color = envRef.current.nextColor(iteration);
      await move(`swatch-${color}`, 600);
      await click();
      envRef.current.pickColor(color);
      await wait(550);
      await move("deploy", 600);
      await click();

      // 2. Déploiement
      update({ phase: "deploying" });
      for (let i = 1; i <= share.setup.steps.length; i++) {
        await wait(480);
        update({ deployed: i });
      }
      await wait(500);

      // 3. En ligne : l'adresse se tape, la page devient le chatbot
      rest();
      await type("url", share.url, 45);
      await wait(250);
      update({ phase: "live" });
      await wait(900);
      await move("question", 800);
      await click();
      update({ focused: "question" });
      nudge();
      await type("question", share.question, 45);
      await wait(250);
      await move("send", 450);
      await click();
      update({ sent: true, question: "", focused: null });
      rest();
      await wait(700);
      for (let i = 1; i <= ANSWER_WORDS; i++) {
        update({ answer: i });
        await wait(70);
      }
      await wait(350);
      update({ source: true });
      await wait(3200);

      // Retour au début
      update((s) => ({ fading: true, cursor: { ...s.cursor, visible: false } }));
      await wait(550);
      update((s) => ({ ...base, fading: true, cursor: s.cursor }));
      await wait(80);
      update({ fading: false });
      await wait(700);
    };

    const run = async () => {
      const start = envRef.current.locate("rest");
      if (start) update({ cursor: { ...start, press: false, visible: false, duration: 0 } });
      await wait(600);
      for (let i = 0; ; i++) await cycle(i);
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
