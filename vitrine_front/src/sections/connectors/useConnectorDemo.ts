import { connectors } from "../../content";
import { useScenario, type Point, type ScenarioApi } from "../../motion/scenario";

/**
 * Scénario en boucle de la section « Vos documents » : un curseur ouvre le connecteur de démo,
 * coche des fichiers, les ajoute (ils rejoignent la base et une ligne se trace par fichier),
 * puis revient les retirer. Les autres connecteurs restent branchés.
 */

/** Index du connecteur animé. */
export const DEMO = Math.max(
  0,
  connectors.sources.findIndex((s) => s.id === connectors.demo),
);

export type { Point };
export type Target =
  { kind: "tile"; index: number } | { kind: "file"; index: number } | { kind: "button" } | { kind: "rest" };

export interface DemoState {
  cursor: Point & { press: boolean; visible: boolean; duration: number };
  popup: null | "add" | "remove";
  popupAt: Point;
  checked: number[];
  added: { name: string; indexed: boolean }[];
  linked: boolean;
  /** Fichiers en cours de retrait (affichés estompés). */
  leaving: boolean;
}

interface DemoEnv {
  /** Position (relative au conteneur) d'une cible du curseur, ou null si non mesurable. */
  locate: (target: Target) => Point | null;
  /** Position de la mini-fenêtre pour un connecteur. */
  placePopup: (source: number) => Point;
  /** Recalcule le tracé des lignes après un changement de la base. */
  remeasure: () => void;
}

const idle: DemoState = {
  cursor: { x: 0, y: 0, press: false, visible: false, duration: 0 },
  popup: null,
  popupAt: { x: 0, y: 0 },
  checked: [],
  added: [],
  linked: false,
  leaving: false,
};

/** État figé affiché quand les animations sont réduites : le connecteur de démo est relié. */
export const staticState: DemoState = {
  ...idle,
  added: connectors.sources[DEMO].picked.map((j) => ({ name: connectors.sources[DEMO].files[j], indexed: true })),
  linked: true,
};

const play = async ({ update, wait, click, moveCursor, env }: ScenarioApi<DemoState, DemoEnv>) => {
  const move = (target: Target, ms = 650) => moveCursor(env().locate(target), ms);

  const toggleFiles = async (files: number[], on: boolean) => {
    for (const j of files) {
      await move({ kind: "file", index: j }, 520);
      await click();
      update((s) => ({ checked: on ? [...s.checked, j] : s.checked.filter((c) => c !== j) }));
      await wait(220);
    }
  };

  const cycle = async (source: number) => {
    const { files, picked } = connectors.sources[source];

    // 1. Ajout
    await move({ kind: "tile", index: source }, 900);
    await click();
    update({ popup: "add", popupAt: env().placePopup(source), checked: [] });
    await wait(420);
    await toggleFiles(picked, true);
    await move({ kind: "button" }, 520);
    await click();
    update({ popup: null });
    await wait(260);
    update({ added: picked.map((j) => ({ name: files[j], indexed: false })) });
    await wait(80);
    env().remeasure();
    await wait(80);
    update({ linked: true });
    await move({ kind: "rest" }, 900);
    await wait(700);
    update((s) => ({ added: s.added.map((a) => ({ ...a, indexed: true })) }));
    await wait(2200);

    // 2. Retrait
    await move({ kind: "tile", index: source }, 800);
    await click();
    update({ popup: "remove", popupAt: env().placePopup(source), checked: [...picked] });
    await wait(420);
    await toggleFiles(picked, false);
    await move({ kind: "button" }, 520);
    await click();
    update({ popup: null });
    await wait(200);
    update({ linked: false, leaving: true });
    await wait(750);
    update({ added: [], leaving: false });
    await wait(60);
    env().remeasure();
    await move({ kind: "rest" }, 800);
    await wait(500);
  };

  const start = env().locate({ kind: "rest" });
  if (start) update({ cursor: { ...start, press: false, visible: true, duration: 0 } });
  await wait(500);
  for (;;) await cycle(DEMO);
};

export const useConnectorDemo = (running: boolean, reduced: boolean, env: DemoEnv) =>
  useScenario({ running, reduced, idle, staticState, env, play, onStop: (e) => e.remeasure() });
