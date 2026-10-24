import { BookOpen, Briefcase, History, Mail, Share2, ShieldCheck, Sparkles, Tag, Workflow, Home } from "lucide-react";
import type { PageId } from "../routes";

/** Dégradé de la tuile d'icône dans les menus (classes de NavMenu.module.css). */
type Tone = "green" | "violet" | "mix" | "warm";

/** Icône et teinte de chaque page dans les menus (séparées des composants pour react-refresh). */
export const pageIcons: Record<PageId, { icon: typeof Home; tone: Tone }> = {
  accueil: { icon: Home, tone: "green" },
  creer: { icon: Workflow, tone: "green" },
  documents: { icon: BookOpen, tone: "mix" },
  deployer: { icon: Share2, tone: "violet" },
  "cas-usage": { icon: Briefcase, tone: "warm" },
  tarifs: { icon: Tag, tone: "green" },
  "mises-a-jour": { icon: Sparkles, tone: "violet" },
  "a-propos": { icon: History, tone: "warm" },
  securite: { icon: ShieldCheck, tone: "mix" },
  contact: { icon: Mail, tone: "green" },
};
