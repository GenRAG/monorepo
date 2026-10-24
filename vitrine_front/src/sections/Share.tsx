import { useRef, useState, type CSSProperties } from "react";
import { Check, Pause, Play } from "lucide-react";
import { share } from "./share/data";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useIsActivePanel } from "../motion/store";
import { prefersReducedMotion } from "../motion/reduced";
import { useShareDemo } from "./share/useShareDemo";
import { ShareBrowser } from "./share/ShareBrowser";
import styles from "./Share.module.css";

const points = ["Déployé en un clic", "Sous-domaine dédié", "Couleurs de votre entreprise"];

const ID = "partage";

export function Share() {
  const browser = useRef<HTMLDivElement | null>(null);
  const [color, setColor] = useState(0);
  const [stopped, setStopped] = useState(false);
  // Dès que le visiteur choisit une couleur, la démo la reprend au lieu de faire défiler les siennes.
  const userColor = useRef<number | null>(null);
  const reduced = prefersReducedMotion();
  const isActive = useIsActivePanel(ID);

  const demo = useShareDemo(isActive && !stopped, reduced, {
    locate: (key) => {
      const root = browser.current;
      if (!root) return null;
      const box = root.getBoundingClientRect();
      if (key === "rest") return { x: box.width * 0.78, y: box.height * 0.88 };
      const el = root.querySelector(`[data-demo="${key}"]`);
      const r = el?.getBoundingClientRect();
      if (!r?.width) return null;
      const fx = key === "subdomain" || key === "question" ? 0.2 : 0.5;
      return { x: r.left - box.left + r.width * fx, y: r.top - box.top + r.height * 0.55 };
    },
    nextColor: (iteration) => userColor.current ?? (iteration + 1) % share.colors.length,
    pickColor: setColor,
  });

  const brand = share.colors[color];

  return (
    <Panel id="partage" label="Déploiement" tone="open" className={styles.grid}>
      <SectionIntro
        eyebrow="Déploiement"
        title="En ligne en un clic, à vos couleurs."
        text="Choisissez une adresse et les couleurs de votre entreprise, puis déployez. Votre équipe utilise l'assistant dans la minute, sans rien installer."
      >
        <ul className={styles.points} {...reveal(3)}>
          {points.map((p) => (
            <li key={p}>
              <Check size={14} strokeWidth={3} aria-hidden />
              {p}
            </li>
          ))}
        </ul>
        <fieldset className={styles.picker} {...reveal(4)}>
          <legend>Couleur de l'entreprise</legend>
          <div className={styles.swatches}>
            {share.colors.map((c, i) => (
              <label key={c.value} className={styles.swatch} style={{ "--c": c.value } as CSSProperties}>
                <input
                  type="radio"
                  name="brand-color"
                  value={c.value}
                  checked={color === i}
                  onChange={() => {
                    userColor.current = i;
                    setColor(i);
                  }}
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

      <div className={styles.demo} {...reveal(2)}>
        <ShareBrowser
          ref={browser}
          state={demo}
          color={color}
          style={{ "--brand": brand.value, "--brand-ink": brand.ink } as CSSProperties}
        />
        {!reduced && (
          <button
            type="button"
            className={styles.pause}
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? "Reprendre l'animation" : "Mettre en pause l'animation"}
          >
            {stopped ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
          </button>
        )}
      </div>
    </Panel>
  );
}
