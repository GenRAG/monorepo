import { useEffect, useRef, useState } from "react";
import type { CursorState } from "../components/DemoCursor";

/**
 * Moteur commun des démos animées (builder, share, reasoning, connectors) : un scénario async en boucle
 * joué tant que la section est active, interrompu au nettoyage de l'effet, avec un état figé si les
 * animations sont réduites. Chaque démo ne décrit plus que ses étapes.
 */

export type Point = { x: number; y: number };

const ABORT = Symbol("abort");

type Patch<S> = Partial<S> | ((s: S) => Partial<S>);

export interface ScenarioApi<S, E> {
  update: (patch: Patch<S>) => void;
  /** Attend `ms` ; interrompt le scénario s'il est arrêté entre-temps (le minuteur est annulé). */
  wait: (ms: number) => Promise<void>;
  /** Appui puis relâchement du curseur sur sa position actuelle. */
  click: () => Promise<void>;
  /** Glisse le curseur vers `point` (sans effet s'il est introuvable) puis attend la fin du déplacement. */
  moveCursor: (point: Point | null, ms: number, extra?: Partial<S>) => Promise<void>;
  /** Environnement le plus récent fourni par le composant (mesures du DOM, callbacks). */
  env: () => E;
}

interface ScenarioOptions<S, E> {
  running: boolean;
  reduced: boolean;
  idle: S;
  staticState: S;
  env: E;
  /** Le scénario complet, qui boucle indéfiniment. */
  play: (api: ScenarioApi<S, E>) => Promise<void>;
  /** Appelé quand le scénario s'arrête (ex. recalculer des mesures). */
  onStop?: (env: E) => void;
}

// Les états qui ont un curseur le portent dans `cursor` ; reasoning n'en a pas et n'appelle jamais click/moveCursor.
const withCursor = <S>(state: S, cursor: Partial<CursorState>) =>
  ({ cursor: { ...(state as { cursor: CursorState }).cursor, ...cursor } }) as unknown as Partial<S>;

export function useScenario<S, E = undefined>(options: ScenarioOptions<S, E>): S {
  const { running, reduced, idle, staticState } = options;
  const [state, setState] = useState<S>(reduced ? staticState : idle);
  const latest = useRef(options);

  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    if (!running || reduced) return;
    const stop = new AbortController();

    const update = (patch: Patch<S>) =>
      setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        if (stop.signal.aborted) return reject(ABORT);
        const onAbort = () => {
          clearTimeout(timer);
          reject(ABORT);
        };
        const timer = setTimeout(() => {
          stop.signal.removeEventListener("abort", onAbort);
          resolve();
        }, ms);
        stop.signal.addEventListener("abort", onAbort, { once: true });
      });

    const click = async () => {
      update((s) => withCursor(s, { press: true }));
      await wait(160);
      update((s) => withCursor(s, { press: false }));
      await wait(140);
    };

    const moveCursor = async (point: Point | null, ms: number, extra?: Partial<S>) => {
      if (point) {
        update((s) => ({ ...extra, ...withCursor(s, { ...point, visible: true, press: false, duration: ms }) }));
      }
      await wait(ms + 60);
    };

    latest.current.play({ update, wait, click, moveCursor, env: () => latest.current.env }).catch((e: unknown) => {
      if (e !== ABORT) throw e;
    });

    return () => {
      stop.abort();
      setState(latest.current.idle);
      latest.current.onStop?.(latest.current.env);
    };
  }, [running, reduced]);

  return state;
}
