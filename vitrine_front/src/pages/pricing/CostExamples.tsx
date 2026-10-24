import { Database, Gauge, MessageSquareText, Pencil, Rocket, Sparkles, Zap } from "lucide-react";
import { Panel } from "../../components/Panel";
import { SectionIntro } from "../../components/ui";
import { reveal } from "../../components/reveal";
import { providerMask } from "../../components/providerLogos";
import { MONTHLY_CREDITS } from "./estimate";
import styles from "./CostExamples.module.css";

const blocks = {
  rewrite: { label: "Reformulation", icon: Pencil },
  search: { label: "Recherche", icon: Database },
  rank: { label: "Classement", icon: Sparkles },
  answer: { label: "Réponse", icon: MessageSquareText },
};

// Ordres de grandeur issus de nos tests (slide « Comparaison crédits ») : crédits seulement, jamais le coût en dollars.
const examples = [
  {
    level: "Simple",
    icon: Zap,
    tone: "green",
    hint: "Questions fréquentes, réponses courtes",
    model: { name: "DeepSeek V4.1 Flash", slug: "deepseek" },
    steps: ["search", "answer"],
    credits: 10,
  },
  {
    level: "Intermédiaire",
    icon: Gauge,
    tone: "mix",
    featured: true,
    hint: "Documents nombreux, réponses précises",
    model: { name: "Gemini 2.5 Flash", slug: "google" },
    steps: ["search", "rank", "answer"],
    credits: 32,
  },
  {
    level: "Avancé",
    icon: Rocket,
    tone: "violet",
    hint: "Questions complexes, raisonnement poussé",
    model: { name: "Opus 5.5", slug: "anthropic" },
    steps: ["rewrite", "search", "rank", "answer"],
    credits: 180,
  },
] as const;

const fmt = (n: number) => n.toLocaleString("fr-FR");
/** Questions couvertes par le quota mensuel, arrondies à la dizaine. */
const questions = (credits: number) => Math.round(MONTHLY_CREDITS / credits / 10) * 10;
const maxQuestions = questions(Math.min(...examples.map((e) => e.credits)));

/** Trois architectures types : étapes, modèle, crédits par question et questions incluses dans l'abonnement. */
export function CostExamples() {
  return (
    <Panel id="exemples" label="Exemples de consommation" tone="open" className={styles.layout}>
      <SectionIntro
        eyebrow="Exemples"
        title="Combien de questions avec 50 000 crédits ?"
        text="Le nombre de crédits par réponse dépend des étapes de l'assistant et du modèle choisi. Voici trois assistants types."
        align="center"
        wide
      />

      <ul className={styles.table} {...reveal(2)}>
        {examples.map((e) => {
          const count = questions(e.credits);
          const Tier = e.icon;
          return (
            <li key={e.level} className={styles.col} data-tone={e.tone} data-featured={"featured" in e || undefined}>
              {"featured" in e && <span className={styles.badge}>Recommandé</span>}
              <div className={styles.head}>
                <span className={styles.tier}>
                  <Tier size={16} strokeWidth={1.9} aria-hidden />
                </span>
                <div>
                  <p className={styles.level}>{e.level}</p>
                  <p className={styles.hint}>{e.hint}</p>
                </div>
              </div>

              <p className={styles.credits}>
                <span className={styles.label}>Crédits par question</span>
                <strong>~{fmt(e.credits)}</strong>
              </p>

              <div className={styles.pipeline}>
                <ol className={styles.nodes} aria-label="Étapes de l'assistant">
                  {Object.entries(blocks).map(([id, { label, icon: Icon }]) => {
                    const used = (e.steps as readonly string[]).includes(id);
                    return (
                      <li key={id} data-used={used || undefined} title={label}>
                        <Icon size={14} strokeWidth={1.9} aria-hidden />
                        <span className="sr-only">
                          {label}
                          {!used && " (non utilisée)"}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <p className={styles.stepNames} aria-hidden>
                  {e.steps.map((id) => blocks[id].label).join(" · ")}
                </p>
              </div>

              <p className={styles.model}>
                <span className={styles.logo} style={{ maskImage: providerMask(e.model.slug) }} aria-hidden />
                {e.model.name}
              </p>

              <div className={styles.footer}>
                <p className={styles.count}>
                  <strong>~{fmt(count)}</strong>
                  <span>questions par mois</span>
                </p>
                <span className={styles.bar} aria-hidden>
                  <span style={{ width: `${(count / maxQuestions) * 100}%` }} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className={styles.note} {...reveal(3)}>
        Ordres de grandeur mesurés ou estimés sur nos tests. La consommation réelle de chaque assistant s'affiche dans
        ses statistiques.
      </p>
    </Panel>
  );
}
