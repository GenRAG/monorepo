import { createContext, useContext } from "react";

type ScrollTo = (id: string) => void;

export const MotionContext = createContext<ScrollTo>((id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
);

export const useScrollTo = () => useContext(MotionContext);

/** Handler de clic pour un lien d'ancre interne (#id) piloté par la scène. */
export function useAnchor() {
  const scrollTo = useScrollTo();
  return (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollTo(id);
    history.replaceState(null, "", `#${id}`);
  };
}
