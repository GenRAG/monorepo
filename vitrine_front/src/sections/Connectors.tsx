import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Cloud, Share2, NotebookText, Upload, RefreshCw, Database, Loader2, Check, Pause, Play } from "lucide-react";
import { connectors } from "../content";
import { Panel } from "../components/Panel";
import { DocIcon, SectionIntro } from "../components/ui";
import { reveal } from "../components/reveal";
import { useActivePanel } from "../motion/store";
import { sectionIndex } from "../motion/MotionContext";
import { prefersReducedMotion } from "../motion/reduced";
import { DEMO, useConnectorDemo, type Point, type Target } from "./connectors/useConnectorDemo";
import styles from "./Connectors.module.css";

const icons = { drive: Cloud, sharepoint: Share2, notion: NotebookText, upload: Upload };
const INDEX = sectionIndex("connecteurs");
const POPUP_W = 260;
/** Écart vertical entre les départs de lignes d'un même connecteur. */
const FAN = 12;
/** Glissement des rangées et des lignes quand la base change (identique pour rester synchronisés). */
const SHIFT_MS = 520;
const SHIFT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const kindOf = (name: string) => (name.endsWith(".pdf") ? "pdf" : name.endsWith(".xlsx") ? "sheet" : "doc");

/**
 * Position d'un élément dans le conteneur de la démo, en coordonnées de mise en page :
 * insensible aux transformations en cours (dalle qui se pose, fondu d'apparition, glissements).
 */
function layoutRect(el: HTMLElement | null | undefined, root: HTMLElement | null) {
  if (!el || !root) return null;
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== root) return null;
  return { x, y, w: el.offsetWidth, h: el.offsetHeight, boxW: root.offsetWidth, boxH: root.offsetHeight };
}

type Line = { key: string; d: string; end: Point; source: number };

/** Fichiers déjà synchronisés par les connecteurs autres que celui de la démo. */
const connectedDocs = connectors.sources.flatMap((s, source) =>
  source === DEMO ? [] : s.picked.map((j) => ({ name: s.files[j], source })),
);

export function Connectors() {
  const flow = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLLIElement | null)[]>([]);
  const files = useRef<(HTMLLIElement | null)[]>([]);
  const button = useRef<HTMLSpanElement>(null);
  const baseList = useRef<HTMLUListElement>(null);

  const [lines, setLines] = useState<Line[]>([]);
  const [stopped, setStopped] = useState(false);
  const reduced = prefersReducedMotion();
  const isActive = useActivePanel() === INDEX;

  const rel = (el: HTMLElement | null | undefined) => layoutRect(el, flow.current);

  /** Une ligne par fichier de la base, depuis son connecteur (départs en éventail). */
  const measure = useCallback((): Line[] => {
    const root = flow.current;
    const list = baseList.current;
    const listBox = layoutRect(list, root);
    if (!root || !list || !listBox) return [];
    const rows = Array.from(list.querySelectorAll<HTMLLIElement>("li[data-source]"));
    const count = new Map<number, number>();
    rows.forEach((row) => count.set(Number(row.dataset.source), (count.get(Number(row.dataset.source)) ?? 0) + 1));
    const seen = new Map<number, number>();
    return rows.flatMap((row) => {
      const source = Number(row.dataset.source);
      const tile = layoutRect(tiles.current[source], root);
      if (!tile) return [];
      const k = seen.get(source) ?? 0;
      seen.set(source, k + 1);
      const start = {
        x: tile.x + tile.w,
        y: tile.y + tile.h / 2 + (k - ((count.get(source) ?? 1) - 1) / 2) * FAN,
      };
      // Position finale de la rangée, même si elle est en train de glisser.
      const end = { x: listBox.x, y: listBox.y + row.offsetTop + row.offsetHeight / 2 };
      const mx = (start.x + end.x) / 2;
      return [
        {
          key: row.dataset.key ?? "",
          d: `M${start.x} ${start.y}C${mx} ${start.y} ${mx} ${end.y} ${end.x} ${end.y}`,
          end,
          source,
        },
      ];
    });
  }, []);

  const remeasure = useCallback(() => requestAnimationFrame(() => setLines(measure())), [measure]);

  const demo = useConnectorDemo(isActive && !stopped, reduced, {
    locate: (target: Target) => {
      if (target.kind === "rest") {
        const root = flow.current;
        return root ? { x: root.offsetWidth * 0.44, y: root.offsetHeight * 0.9 } : null;
      }
      const el =
        target.kind === "tile"
          ? tiles.current[target.index]
          : target.kind === "file"
            ? files.current[target.index]
            : button.current;
      const r = rel(el);
      if (!r) return null;
      // Sur une tuile, on vise le libellé plutôt que le centre.
      return target.kind === "tile"
        ? { x: r.x + r.w * 0.55, y: r.y + r.h / 2 }
        : { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    },
    placePopup: (index) => {
      const r = rel(tiles.current[index]);
      if (!r) return { x: 0, y: 0 };
      const stacked = r.boxW < 640;
      const x = stacked ? Math.min(r.x, r.boxW - POPUP_W) : Math.min(r.x + r.w + 14, r.boxW - POPUP_W);
      const y = stacked ? r.y + r.h + 8 : Math.max(0, r.y - 12);
      return { x: Math.max(0, x), y };
    },
    remeasure,
  });

  // Quand des fichiers entrent ou sortent de la base, les autres rangées glissent (FLIP)
  // et les lignes sont recalculées tout de suite : elles glissent avec la même courbe.
  const rowTops = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const list = baseList.current;
    if (!list) return;
    const next = new Map<string, number>();
    list.querySelectorAll<HTMLLIElement>("li[data-key]").forEach((row) => {
      const key = row.dataset.key!;
      const top = row.offsetTop;
      const before = rowTops.current.get(key);
      next.set(key, top);
      if (before === undefined || before === top || reduced) return;
      row.animate([{ transform: `translateY(${before - top}px)` }, { transform: "none" }], {
        duration: SHIFT_MS,
        easing: SHIFT_EASE,
      });
    });
    rowTops.current = next;
    const raf = requestAnimationFrame(() => setLines(measure()));
    return () => cancelAnimationFrame(raf);
  }, [demo.added, measure, reduced]);

  // Premier tracé, puis recalcul si une tuile, la liste ou le bloc change de taille
  // (chargement des polices, redimensionnement de la fenêtre).
  useLayoutEffect(() => {
    const el = flow.current;
    if (!el) return;
    let cancelled = false;
    const ro = new ResizeObserver(() => setLines(measure()));
    [el, baseList.current, ...tiles.current].forEach((node) => node && ro.observe(node));
    document.fonts?.ready.then(() => !cancelled && setLines(measure()));
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [measure]);

  const source = connectors.sources[DEMO];
  const SourceIcon = icons[source.id as keyof typeof icons];

  return (
    <Panel id="connecteurs" label="Vos documents" tone="light" className={styles.grid}>
      <SectionIntro index={5} eyebrow={connectors.eyebrow} title={connectors.title} text={connectors.text} />

      <div className={styles.demo} {...reveal(3)}>
        <div
          ref={flow}
          className={styles.flow}
          role="img"
          aria-label="Démonstration : SharePoint, Notion et l'import de fichiers alimentent déjà la base de connaissances ; on y ajoute des fichiers depuis Google Drive"
        >
          <ul className={styles.sources} aria-hidden>
            {connectors.sources.map((s, i) => {
              const Icon = icons[s.id as keyof typeof icons];
              const active = i === DEMO && (demo.popup !== null || demo.linked);
              return (
                <li
                  key={s.id}
                  ref={(el) => {
                    tiles.current[i] = el;
                  }}
                  className={styles.source}
                  data-active={active || undefined}
                  data-connected={i !== DEMO || undefined}
                >
                  <span className={styles.sourceIcon}>
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className={styles.sourceLabel}>{s.label}</span>
                </li>
              );
            })}
          </ul>

          <span className={styles.spacer} aria-hidden />

          <div className={styles.base} aria-hidden>
            <div className={styles.baseHead}>
              <span className={styles.baseIcon}>
                <Database size={18} strokeWidth={1.75} />
              </span>
              <div>
                <p className={styles.baseTitle}>{connectors.base.title}</p>
                <p className={styles.baseSub}>{connectors.base.subtitle}</p>
              </div>
            </div>
            <ul ref={baseList} className={styles.docs}>
              {demo.added.map((d) => (
                <li
                  key={d.name}
                  data-source={DEMO}
                  data-key={d.name}
                  className={`${styles.doc} ${styles.docNew} ${demo.leaving ? styles.docLeaving : ""}`}
                >
                  <DocIcon kind={kindOf(d.name)} size={14} />
                  <span className={styles.docName}>{d.name}</span>
                  <span className={`${styles.status} ${d.indexed ? "" : styles.pending}`}>
                    {!d.indexed && <Loader2 size={11} className={styles.spin} />}
                    {d.indexed ? connectors.base.indexed : connectors.base.pending}
                  </span>
                </li>
              ))}
              {connectedDocs.map(({ name, source }) => (
                <li key={name} data-source={source} data-key={name} className={styles.doc}>
                  <DocIcon kind={kindOf(name)} size={14} />
                  <span className={styles.docName}>{name}</span>
                  <span className={styles.status}>{connectors.base.indexed}</span>
                </li>
              ))}
            </ul>
            <p className={styles.sync}>
              <RefreshCw size={12} className={styles.spinSlow} />
              {connectors.base.sync}
            </p>
          </div>

          {/* Lignes fichier → base, en coordonnées du conteneur */}
          <svg className={styles.lines} aria-hidden>
            {lines.map((line, k) => (
              <g key={line.key} className={line.source !== DEMO || demo.linked ? styles.linked : undefined}>
                {/* `d` en style : animable en CSS (Chrome, Firefox) ; l'attribut sert de repli. */}
                <path d={line.d} style={{ d: `path("${line.d}")` }} pathLength={1} className={styles.line} />
                <circle r="3.5" className={styles.packet}>
                  <animateMotion dur="2.4s" begin={`${k * 0.6}s`} repeatCount="indefinite" path={line.d} />
                </circle>
              </g>
            ))}
          </svg>
          {lines.map((line) => (
            <span
              key={line.key}
              className={`${styles.port} ${line.source !== DEMO || demo.linked ? styles.portOn : ""}`}
              style={{ translate: `${line.end.x}px ${line.end.y}px` }}
              aria-hidden
            />
          ))}

          {/* Mini-fenêtre du connecteur */}
          <div
            className={`${styles.popup} ${demo.popup ? styles.popupOpen : ""}`}
            style={{ left: demo.popupAt.x, top: demo.popupAt.y, width: POPUP_W }}
            aria-hidden
          >
            <div className={styles.popupHead}>
              <span className={styles.popupIcon}>
                <SourceIcon size={14} strokeWidth={1.9} />
              </span>
              <div>
                <p className={styles.popupTitle}>{source.label}</p>
                <p className={styles.popupHint}>{connectors.picker.hint}</p>
              </div>
            </div>
            <ul className={styles.popupFiles}>
              {source.files.map((name, j) => {
                const checked = demo.checked.includes(j);
                return (
                  <li
                    key={name}
                    ref={(el) => {
                      files.current[j] = el;
                    }}
                    data-checked={checked || undefined}
                  >
                    <span className={styles.checkbox}>{checked && <Check size={11} strokeWidth={3.2} />}</span>
                    <DocIcon kind={kindOf(name)} size={12} />
                    <span className={styles.fileName}>{name}</span>
                  </li>
                );
              })}
            </ul>
            <div className={styles.popupFoot}>
              <span ref={button} className={styles.popupButton}>
                {demo.popup === "remove" ? connectors.picker.save : connectors.picker.add}
              </span>
            </div>
          </div>

          {/* Curseur */}
          <span
            className={`${styles.cursor} ${demo.cursor.visible ? styles.cursorOn : ""} ${demo.cursor.press ? styles.cursorPress : ""}`}
            style={{
              transform: `translate(${demo.cursor.x}px, ${demo.cursor.y}px)`,
              transitionDuration: `${demo.cursor.duration}ms, 300ms`,
            }}
            aria-hidden
          >
            <svg width="22" height="24" viewBox="0 0 22 24">
              <path
                d="M2 1.5 19 13l-7.3 1.3 4.3 7.6-2.9 1.6-4.3-7.7L3.6 20.6z"
                fill="#0B0E11"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.ripple} />
          </span>
        </div>

        {!reduced && (
          <button
            type="button"
            className={styles.pause}
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? connectors.play : connectors.pause}
          >
            {stopped ? <Play size={13} aria-hidden /> : <Pause size={13} aria-hidden />}
          </button>
        )}
      </div>
    </Panel>
  );
}
