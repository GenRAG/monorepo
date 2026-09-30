import { LinearLayoutStrategy } from './linear'

/** Chain from left to right, settings below (previews). */
export class HorizontalLayoutStrategy extends LinearLayoutStrategy {
    constructor() {
        super({
            name: 'horizontal',
            isVertical: false,
            gap: 280,
            initialPosition: { x: 80, y: 200 },
            settingDistance: 150,
            settingSpacing: 180,
        })
    }
}
