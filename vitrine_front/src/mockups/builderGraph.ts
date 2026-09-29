/**
 * Géométrie de la maquette du builder, dans un repère logique mis à l'échelle ensuite.
 * - `wide` (1040×540) reprend la disposition de docs/screenshot/pipeline-workflow-dark.png ;
 * - `tall` (390×580) empile des nodes compacts pour les écrans étroits, modèles et instruction à droite.
 *
 * La Reformulation et le Classement sont optionnels : `requires` affiche un élément seulement quand
 * son bloc est présent, `unless` seulement quand il est absent (le lien direct qu'il remplace).
 */
export type OptionalBlock = "rewrite" | "rank";
export type GraphLayout = "wide" | "tall";

interface Conditional {
  requires?: OptionalBlock;
  unless?: OptionalBlock;
}

export const isShown = (el: Conditional, blocks: Record<OptionalBlock, boolean>) =>
  (!el.requires || blocks[el.requires]) && (!el.unless || !blocks[el.unless]);

/** Dimensions d'un node : largeur, hauteur d'en-tête et de ligne, point d'attache des réglages. */
export interface NodeMetrics {
  w: number;
  header: number;
  row: number;
  /** Décalage vertical du point d'entrée d'un node modèle / instruction. */
  modelDy: number;
  instructionDy: number;
}

export type RowKind = "in" | "out" | "setting";
type MainId = "question" | "rewrite" | "search" | "rank" | "answer";
type SettingId = "m-rewrite" | "m-rank" | "m-answer" | "instruction";
type Pt = { x: number; y: number };

export interface MainNode extends Conditional {
  id: MainId;
  x: number;
  y: number;
  rows: { kind: RowKind; label: "input" | "output" | "modelRow" | "instructionRow" | "rewriteRow" | "rankRow" }[];
  tag?: "start" | "end";
  deletable?: boolean;
}

export interface SettingNode extends Conditional {
  id: SettingId;
  type: "model" | "instruction";
  x: number;
  y: number;
  model?: "rewrite" | "rank" | "answer";
}

export interface MainEdge extends Conditional {
  id: string;
  d: string;
  dot: Pt;
}

export interface Graph {
  canvas: { w: number; h: number };
  node: NodeMetrics;
  mainNodes: MainNode[];
  settingNodes: SettingNode[];
  mainEdges: MainEdge[];
  settingEdges: ({ id: string; d: string } & Conditional)[];
}

const MAIN: Omit<MainNode, "x" | "y">[] = [
  { id: "question", rows: [{ kind: "out", label: "output" }], tag: "start" },
  {
    id: "rewrite",
    rows: [
      { kind: "in", label: "input" },
      { kind: "setting", label: "rewriteRow" },
      { kind: "out", label: "output" },
    ],
    deletable: true,
    requires: "rewrite",
  },
  {
    id: "search",
    rows: [
      { kind: "in", label: "input" },
      { kind: "out", label: "output" },
    ],
  },
  {
    id: "rank",
    rows: [
      { kind: "in", label: "input" },
      { kind: "setting", label: "rankRow" },
      { kind: "out", label: "output" },
    ],
    deletable: true,
    requires: "rank",
  },
  {
    id: "answer",
    rows: [
      { kind: "in", label: "input" },
      { kind: "setting", label: "modelRow" },
      { kind: "setting", label: "instructionRow" },
    ],
    tag: "end",
  },
];

const SETTINGS: Omit<SettingNode, "x" | "y">[] = [
  { id: "m-rewrite", type: "model", model: "rewrite", requires: "rewrite" },
  { id: "m-rank", type: "model", model: "rank", requires: "rank" },
  { id: "m-answer", type: "model", model: "answer" },
  { id: "instruction", type: "instruction" },
];

interface LayoutSpec {
  canvas: { w: number; h: number };
  node: NodeMetrics;
  main: Record<MainId, Pt>;
  settings: Record<SettingId, Pt>;
  /** Hauteur des retours de lien quand la cible n'est pas à droite de la source (voir `ortho`). */
  loops?: Partial<Record<"q-search" | "rewrite-search", number>>;
}

const LAYOUTS: Record<GraphLayout, LayoutSpec> = {
  wide: {
    canvas: { w: 1040, h: 540 },
    node: { w: 200, header: 40, row: 30, modelDy: 33, instructionDy: 18 },
    main: {
      question: { x: 30, y: 30 },
      rewrite: { x: 290, y: 86 },
      search: { x: 40, y: 262 },
      rank: { x: 300, y: 330 },
      answer: { x: 590, y: 360 },
    },
    settings: {
      "m-rewrite": { x: 570, y: 58 },
      "m-rank": { x: 570, y: 222 },
      "m-answer": { x: 836, y: 318 },
      instruction: { x: 836, y: 432 },
    },
    loops: { "q-search": 200, "rewrite-search": 240 },
  },
  // Nodes compacts (voir .canvas[data-layout="tall"] dans BuilderCanvas.module.css)
  tall: {
    canvas: { w: 390, h: 580 },
    node: { w: 160, header: 30, row: 22, modelDy: 24, instructionDy: 14 },
    main: {
      question: { x: 30, y: 12 },
      rewrite: { x: 30, y: 88 },
      search: { x: 30, y: 208 },
      rank: { x: 30, y: 306 },
      answer: { x: 30, y: 426 },
    },
    settings: {
      "m-rewrite": { x: 226, y: 127 },
      "m-rank": { x: 226, y: 345 },
      "m-answer": { x: 226, y: 440 },
      instruction: { x: 226, y: 500 },
    },
  },
};

/** Lien orthogonal façon GenEdge : sort à droite, descend, entre par la gauche. */
function ortho(s: Pt, t: Pt, loopY: number) {
  if (t.x > s.x + 40) {
    const bx = s.x + 22;
    return { d: `M${s.x} ${s.y}H${bx}V${t.y}H${t.x}`, dot: { x: bx, y: (s.y + t.y) / 2 } };
  }
  return {
    d: `M${s.x} ${s.y}H${s.x + 20}V${loopY}H${t.x - 20}V${t.y}H${t.x}`,
    dot: { x: (s.x + t.x) / 2, y: loopY },
  };
}

const curve = (s: Pt, t: Pt) => {
  const mx = (s.x + t.x) / 2;
  return `M${s.x} ${s.y}C${mx} ${s.y} ${mx} ${t.y} ${t.x} ${t.y}`;
};

function buildGraph(layout: GraphLayout): Graph {
  const spec = LAYOUTS[layout];
  const mainNodes = MAIN.map((n) => ({ ...n, ...spec.main[n.id] }));
  const settingNodes = SETTINGS.map((n) => ({ ...n, ...spec.settings[n.id] }));

  const node = (id: MainId) => mainNodes.find((m) => m.id === id)!;
  const { w: NODE_W, header, row, modelDy, instructionDy } = spec.node;
  const rowY = (id: MainId, n: number) => node(id).y + header + row * n + row / 2;
  const right = (id: MainId) => node(id).x + NODE_W;
  const left = (id: MainId) => node(id).x;
  const bottom = (id: MainId) => node(id).y + header + row * node(id).rows.length;
  const settingLeft = (id: SettingId, dy: number) => {
    const n = settingNodes.find((s) => s.id === id)!;
    return { x: n.x, y: n.y + dy };
  };

  // Lien de la sortie de `from` vers l'entrée de `to` ; le retour passe entre les deux blocs.
  const link = (id: string, from: MainId, fromRow: number, to: MainId) => {
    const loopY = spec.loops?.[id as "q-search"] ?? (bottom(from) + node(to).y) / 2;
    return { id, ...ortho({ x: right(from), y: rowY(from, fromRow) }, { x: left(to), y: rowY(to, 0) }, loopY) };
  };

  return {
    canvas: spec.canvas,
    node: spec.node,
    mainNodes,
    settingNodes,
    mainEdges: [
      { ...link("q-search", "question", 0, "search"), unless: "rewrite" },
      { ...link("search-answer", "search", 1, "answer"), unless: "rank" },
      { ...link("q-rewrite", "question", 0, "rewrite"), requires: "rewrite" },
      { ...link("rewrite-search", "rewrite", 2, "search"), requires: "rewrite" },
      { ...link("search-rank", "search", 1, "rank"), requires: "rank" },
      { ...link("rank-answer", "rank", 2, "answer"), requires: "rank" },
    ],
    settingEdges: [
      {
        id: "d-rewrite",
        d: curve({ x: right("rewrite"), y: rowY("rewrite", 1) }, settingLeft("m-rewrite", modelDy)),
        requires: "rewrite",
      },
      {
        id: "d-rank",
        d: curve({ x: right("rank"), y: rowY("rank", 1) }, settingLeft("m-rank", modelDy)),
        requires: "rank",
      },
      { id: "d-model", d: curve({ x: right("answer"), y: rowY("answer", 1) }, settingLeft("m-answer", modelDy)) },
      {
        id: "d-instr",
        d: curve({ x: right("answer"), y: rowY("answer", 2) }, settingLeft("instruction", instructionDy)),
      },
    ],
  };
}

export const GRAPHS: Record<GraphLayout, Graph> = { wide: buildGraph("wide"), tall: buildGraph("tall") };
