import { useEffect, useRef, useState } from "react";
import { builder } from "../../content";
import type { CursorState } from "../../components/DemoCursor";

/**
 * Scénario en boucle de la section « Éditeur » : un curseur ouvre la palette de blocs, cherche et ajoute
 * la Reformulation, ouvre son aperçu animé, puis lui choisit un modèle. Même chose pour le Classement,
 * puis la maquette revient à son état de départ.
 */

export type BlockId = "rewrite" | "rank";
export type Point = { x: number; y: number };

export const BLOCK_ORDER: BlockId[] = ["rewrite", "rank"];

export interface BuilderDemoState {
  cursor: CursorState;
  blocks: Record<BlockId, boolean>;
  /** Index du modèle choisi dans `builder.catalog[block].models`. */
  models: Partial<Record<BlockId, number>>;
  /** Node mis en surbrillance sur le canvas (`rewrite`, `m-rewrite`…). */
  selected: string | null;
  /** Cible actuellement survolée par le curseur (`data-demo`). */
  hover: string | null;
  palette: { open: boolean; query: string; focused: boolean };
  panel: null | { block: BlockId; view: "overview" | "models" };
  /** Étape de l'aperçu animé (0 → 2). */
  chapter: number;
  /** Modèle affiché dans le détail du sélecteur, et modèle coché. */
  preview: number;
  picked: number | null;
  fading: boolean;
}

interface DemoEnv {
  /** Centre (relatif au canvas) de l'élément `[data-demo=key]`, ou point de repos. */
  locate: (key: string | "rest") => Point | null;
}

const ABORT = Symbol("abort");

const base: Omit<BuilderDemoState, "cursor"> = {
  blocks: { rewrite: false, rank: false },
  models: {},
  selected: null,
  hover: null,
  palette: { open: false, query: "", focused: false },
  panel: null,
  chapter: 0,
  preview: 0,
  picked: null,
  fading: false,
};

const idle: BuilderDemoState = { ...base, cursor: { x: 0, y: 0, press: false, visible: false, duration: 0 } };

/** État figé quand les animations sont réduites : le pipeline complet, modèles choisis. */
export const staticState: BuilderDemoState = {
  ...idle,
  blocks: { rewrite: true, rank: true },
  models: { rewrite: builder.catalog.rewrite.pick, rank: builder.catalog.rank.pick },
};

export function useBuilderDemo(running: boolean, reduced: boolean, env: DemoEnv) {
  const [state, setState] = useState<BuilderDemoState>(reduced ? staticState : idle);
  const envRef = useRef(env);

  useEffect(() => {
    envRef.current = env;
  });

  useEffect(() => {
    if (!running || reduced) return;
    let cancelled = false;

    const update = (patch: Partial<BuilderDemoState> | ((s: BuilderDemoState) => Partial<BuilderDemoState>)) =>
      setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

    const wait = async (ms: number) => {
      await new Promise((r) => setTimeout(r, ms));
      if (cancelled) throw ABORT;
    };

    const move = async (target: string, ms = 650) => {
      const p = envRef.current.locate(target);
      if (p) update((s) => ({ hover: null, cursor: { ...s.cursor, ...p, visible: true, press: false, duration: ms } }));
      await wait(ms + 60);
      update({ hover: target === "rest" ? null : target });
    };

    const click = async () => {
      update((s) => ({ cursor: { ...s.cursor, press: true } }));
      await wait(160);
      update((s) => ({ cursor: { ...s.cursor, press: false } }));
      await wait(140);
    };

    const addBlock = async (block: BlockId) => {
      const def = builder.blocks[block];
      const catalog = builder.catalog[block];

      // 1. Palette de blocs
      await move("add", 900);
      await click();
      update({ palette: { open: true, query: "", focused: false } });
      await wait(450);
      await move("palette-search", 520);
      await click();
      update((s) => ({ palette: { ...s.palette, focused: true } }));
      await wait(200);
      for (let i = 1; i <= def.query.length; i++) {
        update((s) => ({ palette: { ...s.palette, query: def.query.slice(0, i) } }));
        await wait(90 + Math.random() * 70);
      }
      await wait(350);
      await move(`palette-${block}`, 480);
      await wait(250);
      await click();
      update({ palette: { open: false, query: "", focused: false }, hover: null });
      await wait(320);

      // 2. Le bloc rejoint le schéma
      update((s) => ({ blocks: { ...s.blocks, [block]: true }, selected: block }));
      await wait(1100);

      // 3. Aperçu animé du bloc
      await move(`node-${block}`, 700);
      await click();
      update({ panel: { block, view: "overview" }, chapter: 0 });
      await wait(400);
      await move("panel-steps", 900);
      for (let c = 1; c < def.steps.length; c++) {
        await wait(2300);
        update({ chapter: c });
      }
      await wait(2400);
      await move("panel-close", 650);
      await click();
      update({ panel: null, selected: null });
      await wait(450);

      // 4. Choix du modèle
      await move(`model-${block}`, 800);
      await click();
      update({
        panel: { block, view: "models" },
        selected: `m-${block}`,
        preview: catalog.browse[0],
        picked: null,
      });
      await wait(550);
      for (const index of [...catalog.browse, catalog.pick]) {
        await move(`pick-${index}`, 480);
        update({ preview: index });
        await wait(1000);
      }
      await click();
      update({ picked: catalog.pick });
      await wait(450);
      await move("pick-select", 620);
      await click();
      update((s) => ({ panel: null, selected: null, hover: null, models: { ...s.models, [block]: catalog.pick } }));
      await move("rest", 900);
      await wait(1300);
    };

    const run = async () => {
      const start = envRef.current.locate("rest");
      if (start) update({ cursor: { ...start, press: false, visible: false, duration: 0 } });
      await wait(700);
      for (;;) {
        for (const block of BLOCK_ORDER) await addBlock(block);
        await wait(1800);
        update((s) => ({ fading: true, cursor: { ...s.cursor, visible: false } }));
        await wait(600);
        update((s) => ({ ...base, fading: true, cursor: s.cursor }));
        await wait(80);
        update({ fading: false });
        await wait(900);
      }
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
