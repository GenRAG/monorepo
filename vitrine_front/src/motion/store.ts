import { useSyncExternalStore } from "react";

/**
 * Petit store global : panel actif (navigation, thème du header) et panels déjà « entrés »
 * (déclenchement unique des animations internes des maquettes).
 */
let active = 0;
let entered = new Set<number>([0]);
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const panelStore = {
  getActive: () => active,
  setActive(index: number) {
    if (index === active) return;
    active = index;
    emit();
  },
  markEntered(index: number) {
    if (entered.has(index)) return;
    entered = new Set(entered).add(index);
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useActivePanel = () =>
  useSyncExternalStore(
    panelStore.subscribe,
    () => active,
    () => 0,
  );

export const useHasEntered = (index: number) =>
  useSyncExternalStore(
    panelStore.subscribe,
    () => entered.has(index),
    () => false,
  );
