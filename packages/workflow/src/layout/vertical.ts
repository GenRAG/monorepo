import { LinearLayoutStrategy } from './linear'

/** Chain from top to bottom, settings on the right (default builder layout). */
export class VerticalLayoutStrategy extends LinearLayoutStrategy {
    constructor() {
        super({
            name: 'vertical',
            isVertical: true,
            gap: 140,
            initialPosition: { x: 100, y: 80 },
            settingDistance: 280,
            settingSpacing: 130,
        })
    }
}
