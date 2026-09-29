/**
 * Géométrie de la maquette du builder, dans un repère logique de 1040×540
 * (mis à l'échelle ensuite). Reprend la disposition de docs/screenshot/pipeline-workflow-dark.png.
 *
 * La Reformulation et le Classement sont optionnels : `requires` affiche un élément seulement quand
 * son bloc est présent, `unless` seulement quand il est absent (le lien direct qu'il remplace).
 */
export type OptionalBlock = "rewrite" | "rank";

interface Conditional {
  requires?: OptionalBlock;
  unless?: OptionalBlock;
}

export const isShown = (el: Conditional, blocks: Record<OptionalBlock, boolean>) =>
  (!el.requires || blocks[el.requires]) && (!el.unless || !blocks[el.unless]);

export const CANVAS = { w: 1040, h: 540 };
export const NODE_W = 200;
export const HEADER_H = 40;
export const ROW_H = 30;

export type RowKind = "in" | "out" | "setting";

export interface MainNode extends Conditional {
  id: "question" | "rewrite" | "search" | "rank" | "answer";
  x: number;
  y: number;
  rows: { kind: RowKind; label: "input" | "output" | "modelRow" | "instructionRow" | "rewriteRow" | "rankRow" }[];
  tag?: "start" | "end";
  deletable?: boolean;
}

export const mainNodes: MainNode[] = [
  { id: "question", x: 30, y: 30, rows: [{ kind: "out", label: "output" }], tag: "start" },
  {
    id: "rewrite",
    x: 290,
    y: 86,
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
    x: 40,
    y: 262,
    rows: [
      { kind: "in", label: "input" },
      { kind: "out", label: "output" },
    ],
  },
  {
    id: "rank",
    x: 300,
    y: 330,
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
    x: 590,
    y: 360,
    rows: [
      { kind: "in", label: "input" },
      { kind: "setting", label: "modelRow" },
      { kind: "setting", label: "instructionRow" },
    ],
    tag: "end",
  },
];

export interface SettingNode extends Conditional {
  id: string;
  type: "model" | "instruction";
  x: number;
  y: number;
  model?: "rewrite" | "rank" | "answer";
}

export const settingNodes: SettingNode[] = [
  { id: "m-rewrite", type: "model", model: "rewrite", x: 570, y: 58, requires: "rewrite" },
  { id: "m-rank", type: "model", model: "rank", x: 570, y: 222, requires: "rank" },
  { id: "m-answer", type: "model", model: "answer", x: 836, y: 318 },
  { id: "instruction", type: "instruction", x: 836, y: 432 },
];

/** Centre vertical de la n-ième ligne d'un node. */
const rowY = (id: MainNode["id"], n: number) => {
  const node = mainNodes.find((m) => m.id === id)!;
  return node.y + HEADER_H + ROW_H * n + ROW_H / 2;
};
const right = (id: MainNode["id"]) => mainNodes.find((m) => m.id === id)!.x + NODE_W;
const left = (id: MainNode["id"]) => mainNodes.find((m) => m.id === id)!.x;

type Pt = { x: number; y: number };

/** Lien orthogonal façon GenEdge : sort à droite, descend, entre par la gauche. */
function ortho(s: Pt, t: Pt, midY?: number) {
  if (t.x > s.x + 40) {
    const bx = s.x + 22;
    return { d: `M${s.x} ${s.y}H${bx}V${t.y}H${t.x}`, dot: { x: bx, y: (s.y + t.y) / 2 } };
  }
  const my = midY ?? (s.y + t.y) / 2;
  return {
    d: `M${s.x} ${s.y}H${s.x + 20}V${my}H${t.x - 20}V${t.y}H${t.x}`,
    dot: { x: (s.x + t.x) / 2, y: my },
  };
}

const curve = (s: Pt, t: Pt) => {
  const mx = (s.x + t.x) / 2;
  return `M${s.x} ${s.y}C${mx} ${s.y} ${mx} ${t.y} ${t.x} ${t.y}`;
};

export interface MainEdge extends Conditional {
  id: string;
  d: string;
  dot: Pt;
}

export const mainEdges: MainEdge[] = [
  {
    id: "q-search",
    ...ortho({ x: right("question"), y: rowY("question", 0) }, { x: left("search"), y: rowY("search", 0) }, 200),
    unless: "rewrite",
  },
  {
    id: "search-answer",
    ...ortho({ x: right("search"), y: rowY("search", 1) }, { x: left("answer"), y: rowY("answer", 0) }),
    unless: "rank",
  },
  {
    id: "q-rewrite",
    ...ortho({ x: right("question"), y: rowY("question", 0) }, { x: left("rewrite"), y: rowY("rewrite", 0) }),
    requires: "rewrite",
  },
  {
    id: "rewrite-search",
    ...ortho({ x: right("rewrite"), y: rowY("rewrite", 2) }, { x: left("search"), y: rowY("search", 0) }, 240),
    requires: "rewrite",
  },
  {
    id: "search-rank",
    ...ortho({ x: right("search"), y: rowY("search", 1) }, { x: left("rank"), y: rowY("rank", 0) }),
    requires: "rank",
  },
  {
    id: "rank-answer",
    ...ortho({ x: right("rank"), y: rowY("rank", 2) }, { x: left("answer"), y: rowY("answer", 0) }),
    requires: "rank",
  },
];

const settingLeft = (id: string, dy: number) => {
  const n = settingNodes.find((s) => s.id === id)!;
  return { x: n.x, y: n.y + dy };
};

export const settingEdges: ({ id: string; d: string } & Conditional)[] = [
  {
    id: "d-rewrite",
    d: curve({ x: right("rewrite"), y: rowY("rewrite", 1) }, settingLeft("m-rewrite", 33)),
    requires: "rewrite",
  },
  { id: "d-rank", d: curve({ x: right("rank"), y: rowY("rank", 1) }, settingLeft("m-rank", 33)), requires: "rank" },
  { id: "d-model", d: curve({ x: right("answer"), y: rowY("answer", 1) }, settingLeft("m-answer", 33)) },
  { id: "d-instr", d: curve({ x: right("answer"), y: rowY("answer", 2) }, settingLeft("instruction", 18)) },
];
