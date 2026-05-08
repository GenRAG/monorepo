// require is provided at runtime by the bundler / Node; declare it for TypeScript
// eslint-disable-next-line no-var
declare var require: ((module: string) => any) | undefined

import type { Edge } from '@xyflow/react'
import type { AppNode } from '../types/app-node'
import type { LayoutStrategy, NodePlacement } from './types'
import { VerticalLayoutStrategy } from './vertical'

const NODE_WIDTH = 220
const NODE_HEIGHT = 80

export class DagreLayoutStrategy implements LayoutStrategy {
    readonly name = 'dagre'
    readonly isVertical: boolean

    constructor(private readonly direction: 'TB' | 'LR' = 'TB') {
        this.isVertical = direction === 'TB'
    }

    getInitialPosition(): { x: number; y: number } {
        return { x: 100, y: 80 }
    }

    getSettingOffset(settingIndex: number, total: number): { x: number; y: number } {
        return new VerticalLayoutStrategy().getSettingOffset(settingIndex, total)
    }

    computePlacements(
        existingNodes: AppNode[],
        edges: Edge[],
        newNodeId: string,
    ): NodePlacement[] {
        let dagre: any
        try {
            dagre = require!('./dagre')
        } catch {
            return new VerticalLayoutStrategy().computePlacements(existingNodes, edges, newNodeId)
        }

        const g = new dagre.graphlib.Graph()
        g.setGraph({
            rankdir: this.direction,
            nodesep: 60,
            ranksep: 80,
        })
        g.setDefaultEdgeLabel(() => ({}))

        existingNodes.forEach(n => {
            g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
        })

        edges
            .filter(e => e.type !== 'settings')
            .forEach(e => {
                if (g.hasNode(e.source) && g.hasNode(e.target)) {
                    g.setEdge(e.source, e.target)
                }
            })

        dagre.layout(g)

        return existingNodes.map(n => {
            const pos = g.node(n.id)
            return {
                id: n.id,
                position: {
                    x: pos.x - NODE_WIDTH / 2,
                    y: pos.y - NODE_HEIGHT / 2,
                },
            }
        })
    }
}
