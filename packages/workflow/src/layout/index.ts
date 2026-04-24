export type { LayoutStrategy, NodePlacement } from './types'
export { VerticalLayoutStrategy } from './vertical'
export { HorizontalLayoutStrategy } from './horizontal'
export { DagreLayoutStrategy } from './dagre'

import { VerticalLayoutStrategy } from './vertical'
export const DEFAULT_LAYOUT = new VerticalLayoutStrategy()
