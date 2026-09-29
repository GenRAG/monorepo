import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Search,
  Pencil,
  Database,
  Sparkles,
  MessageSquareText,
  Trash2,
  Cpu,
  ChevronRight,
  FileText,
  Plus,
  Minus,
  Maximize,
  Save,
} from "lucide-react";
import { builder } from "../content";
import { GRAPHS, isShown, type GraphLayout, type MainNode, type OptionalBlock, type SettingNode } from "./builderGraph";
import styles from "./BuilderCanvas.module.css";

const nodeIcons = { question: Search, rewrite: Pencil, search: Database, rank: Sparkles, answer: MessageSquareText };
const MIN_SCALE = 0.56;
/** En dessous de cette largeur de canvas, le schéma passe en disposition verticale. */
const TALL_BELOW = 560;

export interface CanvasView {
  blocks: Record<OptionalBlock, boolean>;
  /** Index du modèle choisi dans `builder.catalog[block].models` ; absent = placeholder. */
  models: Partial<Record<OptionalBlock, number>>;
  selected: string | null;
  hover: string | null;
  fading: boolean;
}

const cls = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

function Node({ node, view, width }: { node: MainNode; view: CanvasView; width: number }) {
  const Icon = nodeIcons[node.id];
  const t = builder.nodes;
  return (
    <div
      className={cls(
        styles.node,
        !isShown(node, view.blocks) && styles.hidden,
        view.selected === node.id && styles.selected,
      )}
      style={{ left: node.x, top: node.y, width }}
    >
      <div className={styles.nodeHead} data-demo={`node-${node.id}`}>
        <span className={styles.nodeIcon}>
          <Icon size={13} strokeWidth={2} />
        </span>
        <span className={styles.nodeTitle}>{t[node.id]}</span>
        {node.tag && <span className={styles.tag}>{t[node.tag]}</span>}
        {node.deletable && <Trash2 size={13} className={styles.trash} />}
      </div>
      {node.rows.map((row) => (
        <div key={row.label + row.kind} className={`${styles.row} ${styles[row.kind]}`}>
          {t[row.label]}
          {row.kind === "setting" && <span className={styles.settingHandle} />}
        </div>
      ))}
    </div>
  );
}

function ModelNode({ node, view }: { node: SettingNode; view: CanvasView }) {
  const block = node.model === "answer" ? null : (node.model as OptionalBlock);
  const picked = block ? view.models[block] : undefined;
  const name = block
    ? picked === undefined
      ? null
      : builder.catalog[block].models[picked].name
    : builder.models.answer;
  return (
    <div
      data-demo={`model-${node.model}`}
      className={cls(
        styles.model,
        !name && styles.placeholder,
        !isShown(node, view.blocks) && styles.hidden,
        view.selected === node.id && styles.selected,
        view.hover === `model-${node.model}` && styles.hovered,
      )}
      style={{ left: node.x, top: node.y }}
    >
      <span className={styles.handleIn} />
      <span className={styles.modelIcon}>{name ? <Cpu size={15} /> : <Plus size={15} />}</span>
      <span className={styles.modelText} key={name ?? "empty"}>
        <span className={styles.modelLabel}>{builder.nodes.model}</span>
        <span className={styles.modelName}>{name ?? builder.modelPlaceholder}</span>
        <span className={styles.modelHint}>{builder.nodes.modelHint}</span>
      </span>
      <ChevronRight size={14} className={styles.chev} />
    </div>
  );
}

interface BuilderCanvasProps {
  view: CanvasView;
  rootRef?: RefObject<HTMLDivElement | null>;
  /** Calques posés sur le canvas (palette, panneau, curseur). */
  children?: ReactNode;
}

export function BuilderCanvas({ view, rootRef, children }: BuilderCanvasProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<GraphLayout>("wide");
  const [scale, setScale] = useState(1);
  const { canvas: CANVAS, node: metrics, mainNodes, settingNodes, mainEdges, settingEdges } = GRAPHS[layout];

  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const next: GraphLayout = width < TALL_BELOW ? "tall" : "wide";
      const { w, h } = GRAPHS[next].canvas;
      setLayout(next);
      // En vertical, la hauteur du canvas suit le schéma : seule la largeur compte.
      setScale(next === "tall" ? width / w : Math.max(MIN_SCALE, Math.min(width / w, height / h, 1.1)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={(el) => {
        frame.current = el;
        if (rootRef) rootRef.current = el;
      }}
      className={styles.canvas}
      data-layout={layout}
      style={layout === "tall" ? { aspectRatio: `${CANVAS.w} / ${CANVAS.h}` } : undefined}
    >
      <div className={cls(styles.scroller, view.fading && styles.fading)}>
        <div className={styles.sizer} style={{ width: CANVAS.w * scale, height: CANVAS.h * scale }}>
          <div className={styles.graph} style={{ width: CANVAS.w, height: CANVAS.h, transform: `scale(${scale})` }}>
            <svg className={styles.edges} viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`} aria-hidden>
              {settingEdges.map((e) => (
                <path
                  key={e.id}
                  d={e.d}
                  className={cls(styles.settingEdge, !isShown(e, view.blocks) && styles.settingOff)}
                />
              ))}
              {mainEdges.map((e) => {
                const on = isShown(e, view.blocks);
                return (
                  <g key={e.id} className={on ? styles.edgeOn : styles.edgeOff}>
                    <path d={e.d} pathLength={1} className={styles.edge} />
                    <circle cx={e.dot.x} cy={e.dot.y} r="5" className={styles.edgeDot} />
                  </g>
                );
              })}
            </svg>

            {mainNodes.map((n) => (
              <Node key={n.id} node={n} view={view} width={metrics.w} />
            ))}

            {settingNodes.map((s) =>
              s.type === "model" ? (
                <ModelNode key={s.id} node={s} view={view} />
              ) : (
                <div key={s.id} className={styles.instruction} style={{ left: s.x, top: s.y }}>
                  <span className={styles.handleIn} />
                  <div className={styles.instrHead}>
                    <FileText size={12} />
                    {builder.nodes.instruction}
                    <span className={styles.instrEdit}>
                      <Pencil size={10} /> Modifier
                    </span>
                  </div>
                  <p className={styles.instrText}>{builder.nodes.instructionText}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className={styles.toolbar} aria-hidden>
        <span data-demo="add" className={cls(styles.tool, view.hover === "add" && styles.toolHover)}>
          <Plus size={14} />
        </span>
        <Save size={14} />
      </div>
      <div className={styles.controls} aria-hidden>
        <Plus size={14} />
        <Minus size={14} />
        <Maximize size={13} />
      </div>
      <div className={styles.minimap} aria-hidden>
        <i style={{ left: 8, top: 10, width: 18 }} />
        <i style={{ left: 28, top: 18, width: 20 }} />
        <i className={styles.miniAi} style={{ left: 56, top: 12, width: 18 }} />
        <i style={{ left: 10, top: 34, width: 18 }} />
        <i style={{ left: 30, top: 42, width: 20 }} />
        <i className={styles.miniAi} style={{ left: 56, top: 30, width: 18 }} />
        <i style={{ left: 54, top: 46, width: 20 }} />
        <i className={styles.miniAi} style={{ left: 80, top: 42, width: 16 }} />
      </div>

      {children}
    </div>
  );
}
