import { ArrowRight } from "lucide-react";
import { hero, site } from "../content";
import { Panel } from "../components/Panel";
import { ButtonLink, DocIcon, SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useAnchor } from "../motion/MotionContext";
import { AssistantLogo } from "../components/Logo";
import styles from "./Hero.module.css";

/** Points d'ancrage des documents dans la boîte 560×560 ; le noyau est au centre. */
const ANCHORS = [
  { x: 128, y: 78 },
  { x: 440, y: 62 },
  { x: 78, y: 282 },
  { x: 480, y: 318 },
  { x: 136, y: 484 },
  { x: 416, y: 500 },
];
const CORE = { x: 280, y: 280 };

const beam = ({ x, y }: { x: number; y: number }) => {
  const mx = (x + CORE.x) / 2;
  return `M${x} ${y} C${mx} ${y} ${mx} ${CORE.y} ${CORE.x} ${CORE.y}`;
};

function Convergence() {
  return (
    <div
      className={styles.visual}
      role="img"
      aria-label="Des documents de différents formats reliés à une base de connaissances centrale"
    >
      <svg className={styles.svg} viewBox="0 0 560 560" aria-hidden>
        <defs>
          <radialGradient id="core-glow">
            <stop offset="0%" stopColor="#34D3A9" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#12B98C" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#12B98C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beam" x1="0" x2="1">
            <stop offset="0%" stopColor="#34D3A9" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#34D3A9" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle cx={CORE.x} cy={CORE.y} r="190" fill="url(#core-glow)" />
        <circle className={styles.orbit} cx={CORE.x} cy={CORE.y} r="112" />
        <circle className={`${styles.orbit} ${styles.orbitSlow}`} cx={CORE.x} cy={CORE.y} r="168" />
        {ANCHORS.map((a, i) => (
          <g key={i}>
            <path id={`beam-${i}`} d={beam(a)} className={styles.beam} />
            <circle r="2.6" className={styles.pulse}>
              <animateMotion dur={`${2.8 + (i % 3) * 0.5}s`} begin={`${i * 0.45}s`} repeatCount="indefinite">
                <mpath href={`#beam-${i}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
      </svg>

      <div className={styles.core}>
        <div className={styles.coreDisk}>
          <AssistantLogo size={40} />
        </div>
      </div>

      {hero.floatingDocs.map((doc, i) => (
        <div
          key={doc.name}
          className={styles.doc}
          style={{
            left: `${(ANCHORS[i].x / 560) * 100}%`,
            top: `${(ANCHORS[i].y / 560) * 100}%`,
            animationDelay: `${-i * 1.3}s`,
            animationDuration: `${6 + (i % 3)}s`,
          }}
        >
          <DocIcon kind={doc.kind} size={14} />
          <span>{doc.name}</span>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const anchor = useAnchor();
  return (
    <Panel id="accueil" label="Accueil" tone="open" glow full className={styles.grid}>
      <div className={styles.copy}>
        <SectionIntro index={1} eyebrow={hero.eyebrow} title={hero.title} text={hero.subtitle} as="h1" />
        <div className={styles.ctas} {...reveal(3)}>
          <ButtonLink href="#contact" onClick={anchor("contact")}>
            {site.primaryCta}
            <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <ButtonLink href="#etapes" variant="ghost" onClick={anchor("etapes")}>
            {site.secondaryCta}
          </ButtonLink>
        </div>
      </div>
      <div {...reveal(2)} className={styles.visualWrap}>
        <Convergence />
      </div>
    </Panel>
  );
}
