import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import {
  ArrowUp,
  Bot,
  FileText,
  Briefcase,
  Users,
  Calculator,
  Building2,
  Megaphone,
  Check,
  Pause,
  Play,
  PencilLine,
} from "lucide-react";
import { assistants } from "../content";
import { Panel } from "../components/Panel";
import { SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useActivePanel } from "../motion/store";
import { sectionIndex } from "../motion/MotionContext";
import { prefersReducedMotion } from "../motion/reduced";
import { useTypewriter } from "./useTypewriter";
import styles from "./Assistants.module.css";

const icons = { commercial: Briefcase, rh: Users, finance: Calculator, admin: Building2, marketing: Megaphone };
const INDEX = sectionIndex("assistants");
const AUTOPLAY_MS = 6000;
const SWIPE_PX = 50;
const items = assistants.items;
const n = items.length;

type Item = (typeof items)[number];

/** Décalage circulaire d'une carte par rapport à la carte active (-2 … 2). */
const offsetOf = (i: number, current: number) => {
  let off = (i - current + n) % n;
  if (off > n / 2) off -= n;
  return off;
};

function Card({ item, offset, onSelect }: { item: Item; offset: number; onSelect: () => void }) {
  const isActive = useActivePanel() === INDEX;
  const centered = offset === 0;
  const answer = useTypewriter(item.answer, isActive && centered, item.id);
  const Icon = icons[item.id as keyof typeof icons];
  const position = centered ? "center" : Math.abs(offset) === 1 ? "side" : "hidden";

  return (
    <article
      id={`assistant-${item.id}`}
      role="tabpanel"
      aria-labelledby={`tab-${item.id}`}
      aria-hidden={!centered}
      inert={!centered}
      className={styles.card}
      data-position={position}
      style={{ "--off": offset } as CSSProperties}
      onClick={centered ? undefined : onSelect}
    >
      <div className={styles.chatPane}>
        <p className={styles.userMsg}>{item.question}</p>
        <div className={styles.botMsg}>
          <span className={styles.botAvatar}>
            <Bot size={14} aria-hidden />
          </span>
          <div>
            <p className={styles.answer}>
              <span className="sr-only">{item.answer}</span>
              <span aria-hidden>
                {answer.text}
                {!answer.done && <span className={styles.cursor} />}
              </span>
            </p>
            <div className={`${styles.sources} ${answer.done ? styles.sourcesIn : ""}`}>
              <span className={styles.sourcesLabel}>{assistants.sourcesLabel}</span>
              {item.sources.map((s) => (
                <span key={s} className={styles.source}>
                  <FileText size={12} aria-hidden />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.input} aria-hidden>
          <span>{assistants.inputPlaceholder}</span>
          <span className={styles.send}>
            <ArrowUp size={14} />
          </span>
        </div>
      </div>

      <div className={styles.infoPane}>
        <div className={styles.identity}>
          <span className={styles.portrait}>
            <Icon size={26} strokeWidth={1.6} aria-hidden />
          </span>
          <div>
            <p className={styles.discover}>{assistants.discover}</p>
            <h3 className={styles.cardTitle}>
              {assistants.chatTitle} {item.label}
            </h3>
          </div>
        </div>
        <p className={styles.description}>{item.description}</p>
        <ul className={styles.skills}>
          {item.skills.map((skill) => (
            <li key={skill}>
              <span className={styles.check}>
                <Check size={12} strokeWidth={3} aria-hidden />
              </span>
              {skill}
            </li>
          ))}
        </ul>
        <p className={styles.more}>
          <PencilLine size={13} aria-hidden /> {assistants.editable} · {assistants.more}
        </p>
      </div>
    </article>
  );
}

export function Assistants() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const isActive = useActivePanel() === INDEX;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const swipeStart = useRef<number | null>(null);
  const pillRow = useRef<HTMLDivElement>(null);

  // Sur mobile la rangée de pastilles défile : on garde la pastille active visible.
  useEffect(() => {
    const row = pillRow.current;
    const pill = tabs.current[current];
    if (!row || !pill || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [current]);

  const autoplay = !prefersReducedMotion() && !stopped;
  const running = autoplay && isActive && !hovered;

  const select = (i: number, focus = false) => {
    const next = (i + n) % n;
    setCurrent(next);
    if (focus) tabs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") select(current + 1, true);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") select(current - 1, true);
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: PointerEvent) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > SWIPE_PX) select(current + (dx < 0 ? 1 : -1));
  };

  return (
    <Panel id="assistants" label="Assistants métier" tone="open" className={styles.layout}>
      <SectionIntro
        index={4}
        eyebrow={assistants.eyebrow}
        title={assistants.title}
        text={assistants.text}
        align="center"
        wide
      />

      <div className={styles.controls} {...reveal(3)}>
        <div ref={pillRow} role="tablist" aria-label="Modèles d'assistants" className={styles.pills} onKeyDown={onKey}>
          {items.map((a, i) => {
            const Icon = icons[a.id as keyof typeof icons];
            const selected = i === current;
            return (
              <button
                key={a.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`tab-${a.id}`}
                aria-selected={selected}
                aria-controls={`assistant-${a.id}`}
                tabIndex={selected ? 0 : -1}
                className={styles.pill}
                onClick={() => select(i)}
              >
                {selected && autoplay && (
                  <span
                    key={current}
                    className={styles.progress}
                    style={{
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: running ? "running" : "paused",
                    }}
                    onAnimationEnd={() => select(current + 1)}
                    aria-hidden
                  />
                )}
                <span className={styles.pillIcon}>
                  <Icon size={14} strokeWidth={1.8} aria-hidden />
                </span>
                <span className={styles.pillLabel}>{a.label}</span>
              </button>
            );
          })}
        </div>
        {!prefersReducedMotion() && (
          <button
            type="button"
            className={styles.pause}
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? assistants.play : assistants.pause}
          >
            {stopped ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
          </button>
        )}
      </div>

      <div
        className={styles.viewport}
        aria-roledescription="carrousel"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        {...reveal(4)}
      >
        <div className={styles.track}>
          {items.map((item, i) => (
            <Card key={item.id} item={item} offset={offsetOf(i, current)} onSelect={() => select(i)} />
          ))}
        </div>
      </div>
    </Panel>
  );
}
