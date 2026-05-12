import type { Edge } from '@xyflow/react'
import type { AppNode } from '../types/app-node'

export interface NodePlacement {
    id: string
    position: { x: number; y: number }
}

export interface LayoutStrategy {
    readonly name: string
    readonly isVertical: boolean
    computePlacements(
        existingNodes: AppNode[],
        edges: Edge[],
        newNodeId: string,
    ): NodePlacement[]
    getInitialPosition(): { x: number; y: number }
    getSettingOffset(settingIndex: number, total: number): { x: number; y: number }
}
