import type { Edge } from '@xyflow/react'
import type { AppNode } from '../types/app-node'
import { EdgeType } from '../types/edge'
import type { LayoutStrategy, NodePlacement } from './types'

type Point = { x: number; y: number }

export interface LinearLayoutConfig {
    name: string
    isVertical: boolean
    /** Distance between two consecutive chain nodes, along the chain axis. */
    gap: number
    initialPosition: Point
    /** Distance from a chain node to its first setting (to the right when vertical, below when horizontal). */
    settingDistance: number
    /** Spacing between the settings of one node. */
    settingSpacing: number
}

/**
 * Places the chain on one axis (top → bottom or left → right). The settings of a node always form a column:
 * centred on its right when the chain is vertical, stacked below it when horizontal (a row would overlap the
 * settings of the next node).
 */
export class LinearLayoutStrategy implements LayoutStrategy {
    readonly name: string
    readonly isVertical: boolean

    constructor(private readonly config: LinearLayoutConfig) {
        this.name = config.name
        this.isVertical = config.isVertical
    }

    getInitialPosition(): Point {
        return { ...this.config.initialPosition }
    }

    getSettingOffset(settingIndex: number, total: number): Point {
        const { settingDistance, settingSpacing } = this.config
        return this.isVertical
            ? { x: settingDistance, y: Math.round((settingIndex - (total - 1) / 2) * settingSpacing) }
            : { x: 0, y: settingDistance + settingIndex * settingSpacing }
    }

    computePlacements(existingNodes: AppNode[], edges: Edge[], newNodeId: string): NodePlacement[] {
        const mainEdges = edges.filter(e => e.type !== EdgeType.Settings)
        const nodeMap = new Map(existingNodes.map(n => [n.id, n]))

        const incomingEdge = mainEdges.find(e => e.target === newNodeId)
        const outgoingEdge = mainEdges.find(e => e.source === newNodeId)
        const parentNode = incomingEdge ? nodeMap.get(incomingEdge.source) : undefined
        const nextNode = outgoingEdge ? nodeMap.get(outgoingEdge.target) : undefined

        const step = this.isVertical ? { x: 0, y: this.config.gap } : { x: this.config.gap, y: 0 }
        let position: Point
        if (parentNode && nextNode) {
            position = {
                x: (parentNode.position.x + nextNode.position.x) / 2,
                y: (parentNode.position.y + nextNode.position.y) / 2,
            }
        } else if (parentNode) {
            position = { x: parentNode.position.x + step.x, y: parentNode.position.y + step.y }
        } else if (nextNode) {
            position = { x: nextNode.position.x - step.x, y: nextNode.position.y - step.y }
        } else {
            position = this.getInitialPosition()
        }
        return [{ id: newNodeId, position }]
    }
}
