import { useSyncExternalStore } from "react";

/**
 * Petit store global, indexé par l'id des sections : section active (navigation, thème du header) et
 * sections déjà « entrées » (déclenchement unique des animations internes des maquettes).
 */
let active = "";
let entered = new Set<string>();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const panelStore = {
  setActive(id: string) {
    if (id === active) return;
    active = id;
    emit();
  },
  markEntered(id: string) {
    if (entered.has(id)) return;
    entered = new Set(entered).add(id);
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
    () => "",
  );

export const useIsActivePanel = (id: string) => useActivePanel() === id;

export const useHasEntered = (id: string) =>
  useSyncExternalStore(
    panelStore.subscribe,
    () => entered.has(id),
    () => false,
  );
