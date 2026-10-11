import { share } from "../../content";
import { useScenario, type Point, type ScenarioApi } from "../../motion/scenario";
import type { CursorState } from "../../components/DemoCursor";

/**
 * Scénario en boucle de la section « Déploiement » : le curseur tape le sous-domaine, choisit une couleur,
 * clique sur Déployer ; l'adresse se tape dans la barre du navigateur et la page devient le chatbot de
 * l'entreprise, où le curseur pose une question.
 */

export type { Point };

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

const play = async ({ update, wait, click, moveCursor, env }: ScenarioApi<ShareDemoState, DemoEnv>) => {
  const move = async (target: string, ms = 650) => {
    await moveCursor(env().locate(target), ms, { hover: null });
    update({ hover: target });
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
    const p = env().locate("rest");
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
    const color = env().nextColor(iteration);
    await move(`swatch-${color}`, 600);
    await click();
    env().pickColor(color);
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

  const start = env().locate("rest");
  if (start) update({ cursor: { ...start, press: false, visible: false, duration: 0 } });
  await wait(600);
  for (let i = 0; ; i++) await cycle(i);
};

export const useShareDemo = (running: boolean, reduced: boolean, env: DemoEnv) =>
  useScenario({ running, reduced, idle, staticState, env, play });
