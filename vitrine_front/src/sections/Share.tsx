import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUp, Lock, RotateCw, FileText, Check } from "lucide-react";
import { share } from "../content";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useHasEntered } from "../motion/store";
import { sectionIndex } from "../motion/MotionContext";
import { prefersReducedMotion } from "../motion/reduced";
import styles from "./Share.module.css";

const INDEX = sectionIndex("partage");

function useTypedUrl(text: string, start: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start || prefersReducedMotion()) return;
    let i = 0;
    let id = 0;
    const delay = window.setTimeout(() => {
      id = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) window.clearInterval(id);
      }, 55);
    }, 500);
    return () => {
      window.clearTimeout(delay);
      window.clearInterval(id);
    };
  }, [start, text]);
  if (start && prefersReducedMotion()) return { typed: text, done: true };
  return { typed: text.slice(0, n), done: n >= text.length };
}

export function Share() {
  const [color, setColor] = useState(share.colors[0]);
  const entered = useHasEntered(INDEX);
  const { typed, done } = useTypedUrl(share.url, entered);

  return (
    <Panel id="partage" label="Partage" tone="slab" glow className={styles.grid}>
      <SectionIntro index={7} eyebrow={share.eyebrow} title={share.title} text={share.text}>
        <fieldset className={styles.picker} {...reveal(3)}>
          <legend>{share.colorLabel}</legend>
          <div className={styles.swatches}>
            {share.colors.map((c) => (
              <label key={c.value} className={styles.swatch} style={{ "--c": c.value } as CSSProperties}>
                <input
                  type="radio"
                  name="brand-color"
                  value={c.value}
                  checked={color.value === c.value}
                  onChange={() => setColor(c)}
                  className="sr-only"
                />
                <span className={styles.swatchDot} aria-hidden>
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="sr-only">{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </SectionIntro>

      <div {...reveal(2)}>
        <div className={styles.browser} style={{ "--brand": color.value, "--brand-ink": color.ink } as CSSProperties}>
          <div className={styles.chrome}>
            <span className={styles.lights} aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <div className={styles.url}>
              <Lock size={12} aria-hidden />
              <span>
                {typed}
                {!done && <span className={styles.caret} aria-hidden />}
              </span>
              <span className="sr-only">{share.url}</span>
            </div>
            <RotateCw size={13} className={styles.reload} aria-hidden />
          </div>

          <div className={`${styles.app} ${done ? styles.appIn : ""}`} aria-hidden>
            <header className={styles.appHead}>
              <span className={styles.brandMark}>{share.company[0]}</span>
              <div>
                <p className={styles.appName}>{share.company}</p>
                <p className={styles.appSub}>{share.assistantName}</p>
              </div>
            </header>
            <div className={styles.thread}>
              <p className={styles.welcome}>{share.welcome}</p>
              <p className={styles.user}>{share.question}</p>
              <div className={styles.bot}>
                <p>{share.answer}</p>
                <span className={styles.source}>
                  <FileText size={11} />
                  {share.source}
                </span>
              </div>
            </div>
            <div className={styles.input}>
              <span>Votre question…</span>
              <span className={styles.send}>
                <ArrowUp size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
