import type { Edge } from '@xyflow/react'
import type { AppNode } from '../types/app-node'
import type { LayoutStrategy, NodePlacement } from './types'

const HORIZONTAL_GAP = 280
const INITIAL_Y = 200
const INITIAL_X = 80
const SETTING_Y = 150
const SETTING_X_SPACING = 180

export class HorizontalLayoutStrategy implements LayoutStrategy {
    readonly name = 'horizontal'
    readonly isVertical = false

    getInitialPosition(): { x: number; y: number } {
        return { x: INITIAL_X, y: INITIAL_Y }
    }

    getSettingOffset(settingIndex: number, total: number): { x: number; y: number } {
        return {
            x: Math.round((settingIndex - (total - 1) / 2) * SETTING_X_SPACING),
            y: SETTING_Y,
        }
    }

    computePlacements(
        existingNodes: AppNode[],
        edges: Edge[],
        newNodeId: string,
    ): NodePlacement[] {
        const mainEdges = edges.filter(e => e.type !== 'settings')
        const nodeMap = new Map(existingNodes.map(n => [n.id, n]))

        const incomingEdge = mainEdges.find(e => e.target === newNodeId)
        const outgoingEdge = mainEdges.find(e => e.source === newNodeId)
        const parentNode = incomingEdge ? nodeMap.get(incomingEdge.source) : undefined
        const nextNode = outgoingEdge ? nodeMap.get(outgoingEdge.target) : undefined

        if (parentNode && nextNode) {
            return [{
                id: newNodeId,
                position: {
                    x: (parentNode.position.x + nextNode.position.x) / 2,
                    y: (parentNode.position.y + nextNode.position.y) / 2,
                },
            }]
        }
        if (parentNode) {
            return [{
                id: newNodeId,
                position: { x: parentNode.position.x + HORIZONTAL_GAP, y: parentNode.position.y },
            }]
        }
        if (nextNode) {
            return [{
                id: newNodeId,
                position: { x: nextNode.position.x - HORIZONTAL_GAP, y: nextNode.position.y },
            }]
        }
        return [{ id: newNodeId, position: this.getInitialPosition() }]
    }
}
