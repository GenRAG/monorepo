import { Plus } from "lucide-react";
import { Panel } from "../../components/Panel";
import { SectionIntro } from "../../components/ui";
import { reveal } from "../../components/reveal";
import styles from "./pricing.module.css";

const questions = [
  {
    q: "Qu'est-ce qu'un crédit ?",
    a: "C'est l'unité qui mesure l'usage de vos assistants, dans le playground comme pour votre équipe. Une réponse consomme plus ou moins de crédits selon les modèles choisis et la complexité de l'architecture de l'assistant. Les statistiques de chaque assistant montrent sa consommation.",
  },
  {
    q: "Comment consommer moins de crédits ?",
    a: "Gardez une architecture simple quand elle suffit, et réservez les modèles haut de gamme aux assistants qui en ont besoin. Le sélecteur de modèles compare la qualité, la vitesse et le prix de chacun.",
  },
  {
    q: "Que se passe-t-il quand mon quota du mois est épuisé ?",
    a: "Vos assistants utilisent vos crédits achetés. S'il n'en reste plus, les questions sont refusées jusqu'au renouvellement du quota ou à votre prochaine recharge.",
  },
  {
    q: "Les crédits non utilisés sont-ils reportés ?",
    a: "Le quota mensuel repart à 50 000 à chaque renouvellement, sans report. Les crédits achetés en recharge, eux, n'expirent jamais.",
  },
  {
    q: "Puis-je résilier mon abonnement ?",
    a: "Oui, à tout moment depuis l'espace Crédits. Votre abonnement reste actif jusqu'à la fin de la période déjà payée.",
  },
  {
    q: "Quels documents puis-je importer ?",
    a: "Des PDF, des documents Word (.docx), du texte, du Markdown et des pages HTML, jusqu'à 15 Mo par fichier. Vous pouvez aussi importer depuis Google Drive.",
  },
  {
    q: "Où trouver mes factures ?",
    a: "Dans l'espace Crédits de la plateforme : chaque paiement y a sa facture, à télécharger en PDF.",
  },
  {
    q: "Comment obtenir l'offre Découverte ?",
    a: "Pendant la bêta, elle est attribuée sur invitation. Demandez un accès, nous revenons vers vous.",
  },
];

export function Faq() {
  return (
    <Panel id="faq" label="Questions fréquentes" tone="open" className={styles.faq}>
      <SectionIntro eyebrow="Questions fréquentes" title="Tout ce qu'il faut savoir avant de commencer." />
      <div className={styles.questions}>
        {questions.map((item, i) => (
          <details key={item.q} className={styles.question} {...reveal(i)}>
            <summary>
              {item.q}
              <Plus size={18} aria-hidden className={styles.plus} />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </Panel>
  );
}
