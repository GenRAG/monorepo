import { ArrowRight, Check, Rocket, Sprout } from "lucide-react";
import { pages } from "../../routes";
import { Panel } from "../../components/Panel";
import { ButtonLink } from "../../components/ui";
import { reveal } from "../../components/reveal";
import styles from "./pricing.module.css";

// Chiffres recopiés de plateform_back/src/plans/plans.config.ts : les garder alignés (comme estimate.ts).
const plans = [
  {
    name: "Découverte",
    badge: "Sur invitation",
    price: "0 €",
    period: "pendant la bêta",
    text: "Pour essayer GenRAG sur vos documents.",
    features: [
      "5 000 crédits offerts, une seule fois",
      "1 assistant",
      "2 bases de connaissances",
      "Éditeur et partage inclus",
    ],
    cta: "Demander une invitation",
  },
  {
    name: "Abonnement",
    badge: "Pour vos équipes",
    price: "50 €",
    period: "par mois",
    text: "Pour un usage quotidien par toute l'équipe.",
    features: [
      "50 000 crédits chaque mois",
      "10 assistants",
      "25 bases de connaissances",
      "Recharges de crédits à la demande",
      "Factures téléchargeables",
    ],
    cta: "Demander un accès",
    featured: true,
  },
];

const planIcons = [Sprout, Rocket];

export function Plans() {
  return (
    <Panel id="offres" label="Offres" tone="open" className={styles.plans}>
      {plans.map((plan, i) => {
        const Icon = planIcons[i];
        const featured = "featured" in plan && plan.featured;
        return (
          <article key={plan.name} className={styles.plan} data-featured={featured || undefined} {...reveal(i)}>
            <div className={styles.planHead}>
              <span className={styles.planIcon}>
                <Icon size={20} strokeWidth={1.8} aria-hidden />
              </span>
              <span className={styles.badge}>{plan.badge}</span>
            </div>
            <div>
              <h2 className={styles.planName}>{plan.name}</h2>
              <p className={styles.planText}>{plan.text}</p>
            </div>
            <p className={styles.price}>
              <span className={styles.amount}>{plan.price}</span>
              <span className={styles.period}>{plan.period}</span>
            </p>
            <div className={styles.included}>
              <p className={styles.includedLabel}>Inclus</p>
              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f}>
                    <span className={styles.check}>
                      <Check size={11} strokeWidth={3} aria-hidden />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <ButtonLink href={pages.contact.path} variant={featured ? "primary" : "ghost"}>
              {plan.cta}
              <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          </article>
        );
      })}
      <p className={styles.vat}>Prix hors taxes.</p>
    </Panel>
  );
}
