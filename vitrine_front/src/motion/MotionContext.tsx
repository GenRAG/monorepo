import { createContext, useContext } from "react";
import { nav, type SectionId } from "../content";

type ScrollTo = (id: SectionId) => void;

export const MotionContext = createContext<ScrollTo>((id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
);

export const useScrollTo = () => useContext(MotionContext);

/** Handler de clic pour un lien d'ancre interne (#id) piloté par la scène. */
export function useAnchor() {
  const scrollTo = useScrollTo();
  return (id: SectionId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollTo(id);
    history.replaceState(null, "", `#${id}`);
  };
}

export const sectionIndex = (id: SectionId) => nav.findIndex((n) => n.id === id);
