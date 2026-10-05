export type { LayoutStrategy, NodePlacement } from './types'
export { LinearLayoutStrategy } from './linear'
export type { LinearLayoutConfig } from './linear'
export { VerticalLayoutStrategy } from './vertical'
export { HorizontalLayoutStrategy } from './horizontal'

import { VerticalLayoutStrategy } from './vertical'
export const DEFAULT_LAYOUT = new VerticalLayoutStrategy()
