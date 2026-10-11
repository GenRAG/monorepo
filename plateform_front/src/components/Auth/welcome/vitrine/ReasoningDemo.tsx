import { prefersReducedMotion } from "@vitrine/motion/reduced";
import { useReasoningDemo } from "@vitrine/sections/reasoning/useReasoningDemo";
import { ReasoningChat } from "@vitrine/sections/reasoning/ReasoningChat";

/** Démo de comparaison de sources reprise du site vitrine. */
export const ReasoningDemo = () => <ReasoningChat state={useReasoningDemo(true, prefersReducedMotion())} />;
