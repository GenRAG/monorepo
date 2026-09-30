/**
 * `@genrag/workflow/core`: the workflow model without React, Chakra or ReactFlow at runtime.
 * Types, task specs and model catalogs, graph builders, layouts, and the conversions with the
 * RAG pipeline (`blocks`). Usable from any front, a script, or a Node service.
 */
export * from "./types/index";
export * from "./graph/index";
export * from "./utils/serialize";
export * from "./utils/sanitize";
export type { LayoutStrategy, NodePlacement, LinearLayoutConfig } from "./layout";
export { LinearLayoutStrategy, VerticalLayoutStrategy, HorizontalLayoutStrategy, DEFAULT_LAYOUT } from "./layout";
export * from "./utils/pipeline-to-workflow";
