import { prefersReducedMotion } from "./motion/reduced";
import { useReasoningDemo } from "./sections/reasoning/useReasoningDemo";
import { ReasoningChat } from "./sections/reasoning/ReasoningChat";

/** Démo de comparaison de sources reprise du site vitrine. */
export const ReasoningDemo = () => <ReasoningChat state={useReasoningDemo(true, prefersReducedMotion())} />;
