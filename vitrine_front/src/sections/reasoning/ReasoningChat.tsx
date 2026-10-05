import { Bot, Check, LoaderCircle } from "lucide-react";
import { reasoning } from "../../content";
import { DocIcon } from "../../components/ui";
import type { ReasoningDemoState } from "./useReasoningDemo";
import styles from "./ReasoningChat.module.css";

const words = reasoning.answer.split(" ");
const on = (shown: boolean) => (shown ? "" : undefined);

/** Conversation de démonstration : question, étapes de réflexion, comparatif des sources, synthèse. */
export function ReasoningChat({ state }: { state: ReasoningDemoState }) {
  const typing = state.step >= reasoning.trace.length && state.answer < words.length;

  return (
    <div className={styles.window} data-fading={on(state.fading)} role="img" aria-label={reasoning.alt}>
      <p className={styles.userMsg} data-on={on(state.asked)}>
        {reasoning.question}
      </p>

      <div className={styles.botMsg} data-on={on(state.step >= 0)}>
        <span className={styles.botAvatar}>
          <Bot size={14} aria-hidden />
        </span>
        <div className={styles.body}>
          <ol className={styles.trace}>
            {reasoning.trace.map((t, i) => {
              const status = state.step > i ? "done" : state.step === i ? "active" : "todo";
              return (
                <li key={t.label} className={styles.traceItem} data-status={status}>
                  <span className={styles.traceIcon}>
                    {status === "done" ? <Check size={11} strokeWidth={3} /> : <LoaderCircle size={12} />}
                  </span>
                  <span>{t.label}</span>
                  <span className={styles.traceDone}>{t.done}</span>
                </li>
              );
            })}
          </ol>

          <div className={styles.compare}>
            <div className={styles.head}>
              <span className={styles.criterion}>{reasoning.criterion}</span>
              {reasoning.sources.map((s, i) => (
                <span key={s.name} className={styles.source} data-on={on(state.sources > i)}>
                  <DocIcon kind={s.kind} size={14} />
                  <span className={styles.sourceText}>
                    <strong>{s.label}</strong>
                    <small>
                      {s.ref} · {s.name}
                    </small>
                  </span>
                </span>
              ))}
            </div>
            {reasoning.rows.map((row, i) => (
              <div key={row.label} className={styles.row} data-on={on(state.rows > i)}>
                <span className={styles.rowLabel}>{row.label}</span>
                {row.values.map((value) => (
                  <span key={value} className={styles.value}>
                    {value}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <p className={styles.answer}>
            {words.map((word, i) => (
              <span key={i} data-on={on(state.answer > i)}>
                {word}{" "}
              </span>
            ))}
            {typing && <span className={styles.cursor} />}
          </p>
        </div>
      </div>
    </div>
  );
}
