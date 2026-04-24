import type { Edge } from '@xyflow/react'
import type { AppNode } from '../types/app-node'
import type { LayoutStrategy, NodePlacement } from './types'

const VERTICAL_GAP = 140
const INITIAL_X = 100
const INITIAL_Y = 80

export class VerticalLayoutStrategy implements LayoutStrategy {
    readonly name = 'vertical'
    readonly isVertical = true

    getInitialPosition(): { x: number; y: number } {
        return { x: INITIAL_X, y: INITIAL_Y }
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
                position: { x: parentNode.position.x, y: parentNode.position.y + VERTICAL_GAP },
            }]
        }
        if (nextNode) {
            return [{
                id: newNodeId,
                position: { x: nextNode.position.x, y: nextNode.position.y - VERTICAL_GAP },
            }]
        }
        return [{ id: newNodeId, position: this.getInitialPosition() }]
    }
}
