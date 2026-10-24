import { ArrowUp, FileText } from "lucide-react";
import { Layout } from "../components/Layout";
import { CtaBand } from "../components/CtaBand";
import { PageHero } from "../components/PageHero";
import { Panel } from "../components/Panel";
import { reveal } from "../components/reveal";
import { useCases } from "./cases";
import { TeamsArt } from "../illustrations/TeamsArt";
import styles from "./pages.module.css";

type UseCase = (typeof useCases)[number];

/** Fenêtre de l'assistant de l'équipe : un échange type, réponse sourcée. */
function CaseChat({ item }: { item: UseCase }) {
  const Icon = item.icon;
  return (
    <div className={styles.chat} {...reveal(2)}>
      <div className={styles.chatHead}>
        <span className={styles.chatAvatar}>
          <Icon size={15} strokeWidth={1.9} aria-hidden />
        </span>
        <span className={styles.chatName}>
          {item.assistant}
          <small>
            <span className={styles.online} aria-hidden />
            Prêt à répondre
          </small>
        </span>
        <span className={styles.demoLabel}>Exemple fictif</span>
      </div>

      <div className={styles.chatBody}>
        <p className={styles.bubbleQuestion}>{item.question}</p>
        <div className={styles.bubbleAnswer}>
          <p>{item.answer}</p>
          <p className={styles.source}>
            <FileText size={12} aria-hidden />
            {item.source}
          </p>
        </div>
      </div>

      <div className={styles.chatInput} aria-hidden>
        Posez votre question…
        <span>
          <ArrowUp size={14} />
        </span>
      </div>
    </div>
  );
}

export function UseCasesPage() {
  return (
    <Layout page="cas-usage">
      <PageHero
        eyebrow="Cas d'usage"
        title="Une même idée, trois équipes soulagées."
        text="GenRAG répond à partir de vos documents. Voici ce que ça change selon le métier."
        art={<TeamsArt />}
      />
      {useCases.map((item, i) => {
        const Icon = item.icon;
        return (
          <Panel key={item.id} id={item.id} label={item.team} tone={i === 1 ? "light" : "open"}>
            <div className={styles.case} data-tone={item.tone} data-flip={i % 2 === 1 || undefined}>
              <div className={styles.caseCopy}>
                <p className={styles.caseIndex} {...reveal(0)}>
                  <span className={styles.caseIcon}>
                    <Icon size={18} strokeWidth={1.8} aria-hidden />
                  </span>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className={styles.caseTitle} {...reveal(1)}>
                  {item.team}
                </h2>
                <p className={styles.caseText} {...reveal(2)}>
                  {item.pitch}
                </p>
                <div {...reveal(3)}>
                  <p className={styles.docsLabel}>Documents connectés</p>
                  <ul className={styles.docs}>
                    {item.documents.map((d) => (
                      <li key={d}>
                        <FileText size={14} aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <CaseChat item={item} />
            </div>
          </Panel>
        );
      })}
      <CtaBand />
    </Layout>
  );
}
