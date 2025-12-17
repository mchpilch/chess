import { Graphics, Text } from "pixi.js";

export class FieldView {
    constructor(
        public readonly fieldId: number,
        private graphics: Graphics,
        private center: { x: number; y: number },
        private notationText?: Text
    ) {}

    getCenter() {
        return this.center;
    }

    fill(color: number, size: number) {
        this.graphics.clear();
        this.graphics
            .rect(
                this.center.x - size / 2,
                this.center.y - size / 2,
                size,
                size
            )
            .fill(color);
    }

    clear(color: number, size: number) {
        this.fill(color, size);
    }
}
