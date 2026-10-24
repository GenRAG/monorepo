import { useState } from "react";
import { Panel } from "../../components/Panel";
import { SectionIntro } from "../../components/ui";
import { reveal } from "../../components/reveal";
import { estimate, MONTHLY_CREDITS } from "./estimate";
import styles from "./pricing.module.css";

const MAX_CREDITS = 150_000;
const fmt = (n: number) => n.toLocaleString("fr-FR");
const facts = ["1 € = 1 000 crédits", "De 5 € à 1 000 €", "Sans expiration"];

/** Recharges et estimation du coût mensuel selon la consommation de crédits. */
export function Estimator() {
  const [credits, setCredits] = useState(30_000);
  const { included, extraCredits, topUpEuros, total } = estimate(credits);

  return (
    <Panel id="recharges" label="Besoin de plus ? Rechargez." tone="light" className={styles.topUp}>
      <div>
        <SectionIntro
          eyebrow="Recharges"
          title="Besoin de plus ? Rechargez."
          text="Les abonnés achètent des crédits en plus, au même tarif que l'abonnement. Ils n'expirent jamais et servent une fois le quota du mois épuisé."
        />
        <ul className={styles.facts} {...reveal(3)}>
          {facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className={styles.estimator} {...reveal(2)}>
        <p className={styles.estimatorTitle}>Combien allez-vous payer ?</p>
        <label className={styles.sliderLabel}>
          <span>Crédits par mois</span>
          <strong>{fmt(credits)}</strong>
          <input
            type="range"
            min={1_000}
            max={MAX_CREDITS}
            step={1_000}
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
            className={styles.slider}
            style={{ "--fill": `${(credits / MAX_CREDITS) * 100}%` } as React.CSSProperties}
          />
        </label>

        <div className={styles.meter} aria-hidden>
          <span className={styles.meterIncluded} style={{ width: `${(included / MAX_CREDITS) * 100}%` }} />
          <span className={styles.meterExtra} style={{ width: `${(extraCredits / MAX_CREDITS) * 100}%` }} />
          <span className={styles.meterQuota} style={{ left: `${(MONTHLY_CREDITS / MAX_CREDITS) * 100}%` }} />
        </div>
        <ul className={styles.legend}>
          <li>
            <span className={styles.dotIncluded} />
            {fmt(included)} inclus dans l'abonnement
          </li>
          <li>
            <span className={styles.dotExtra} />
            {topUpEuros} € de recharge
          </li>
        </ul>

        <p className={styles.total}>
          <span className={styles.totalAmount}>{total} €</span> par mois, hors taxes
        </p>
        <p className={styles.hint}>
          Estimation : quota mensuel utilisé en premier. Le nombre de crédits par réponse dépend des modèles et de la
          complexité de l'assistant.
        </p>
      </div>
    </Panel>
  );
}
