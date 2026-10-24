import { ArrowRight, Bot, FileText } from "lucide-react";
import { pages } from "../routes";
import { useCases } from "../pages/cases";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import styles from "./CaseList.module.css";

/** Cas d'usage : une carte par équipe, avec un échange type, vers la page Cas d'usage. */
export function CaseList() {
  return (
    <Panel id="usages" label="Cas d'usage" tone="open">
      <SectionIntro
        eyebrow="Cas d'usage"
        title="Une même idée, trois équipes soulagées."
        text="Les questions répétitives trouvent leur réponse dans vos documents, quel que soit le métier."
        split
      />
      <ul className={styles.grid}>
        {useCases.map((item, i) => {
          const Icon = item.icon;
          return (
            <li key={item.id} {...reveal(2 + i)}>
              <a href={`${pages["cas-usage"].path}#${item.id}`} className={styles.card} data-tone={item.tone}>
                <div className={styles.stage} aria-hidden>
                  <p className={styles.question}>{item.question}</p>
                  <div className={styles.answer}>
                    <span className={styles.bot}>
                      <Bot size={13} />
                    </span>
                    <div>
                      <p>{item.answer}</p>
                      <span className={styles.source}>
                        <FileText size={11} />
                        {item.source}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.body}>
                  <div className={styles.head}>
                    <span className={styles.icon}>
                      <Icon size={17} strokeWidth={1.8} aria-hidden />
                    </span>
                    <h3 className={styles.team}>{item.team}</h3>
                  </div>
                  <p className={styles.docs}>{item.documents.join(" · ")}</p>
                  <span className={styles.more}>
                    Voir le cas d'usage
                    <ArrowRight size={15} aria-hidden />
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      <a href={pages["cas-usage"].path} className={styles.all} {...reveal(5)}>
        Voir les cas d'usage
        <ArrowRight size={16} aria-hidden />
      </a>
    </Panel>
  );
}
