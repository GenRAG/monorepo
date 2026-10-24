import { ChevronDown } from "lucide-react";
import { Layout } from "../components/Layout";
import { CtaBand } from "../components/CtaBand";
import { PageHero } from "../components/PageHero";
import { Panel } from "../components/Panel";
import { reveal } from "../components/reveal";
import { UpdatesArt } from "../illustrations/ResourceArt";
import { entries } from "./updates/entries";
import styles from "./pages.module.css";

export function UpdatesPage() {
  return (
    <Layout page="mises-a-jour">
      <PageHero
        eyebrow="Mises à jour"
        title="Ce qui change sur GenRAG."
        text="Les nouveautés de la plateforme, mois après mois."
        art={<UpdatesArt entries={entries} />}
      />
      <Panel id="journal" label="Journal" tone="open" className={styles.timeline}>
        {entries.map((entry) => (
          <section key={entry.date} className={styles.month} aria-label={entry.date}>
            <div className={styles.monthHead}>
              <h2 className={styles.monthTitle}>{entry.date}</h2>
              <span className={styles.tag}>{entry.tag}</span>
            </div>
            <ul className={styles.changes}>
              {entry.items.map((item, i) => (
                <li key={item.title} {...reveal(i)}>
                  {item.details ? (
                    <details className={styles.change}>
                      <summary>
                        <h3>{item.title}</h3>
                        <ChevronDown size={18} aria-hidden className={styles.chevron} />
                        <span className={styles.changeText} dangerouslySetInnerHTML={{ __html: item.summary }} />
                      </summary>
                      <div className={styles.details} dangerouslySetInnerHTML={{ __html: item.details }} />
                    </details>
                  ) : (
                    <div className={`${styles.change} ${styles.changeHead}`}>
                      <h3>{item.title}</h3>
                      <span className={styles.changeText} dangerouslySetInnerHTML={{ __html: item.summary }} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Panel>
      <CtaBand />
    </Layout>
  );
}
