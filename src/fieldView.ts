// view/FieldView.ts
import { Graphics, TextStyle, Text, Container } from "pixi.js";
import { boardConfig } from "./boardConfig";

export class FieldView {

    private container: Container;
    private graphics: Graphics;
    private notationText?: Text;
    private idText?: Text;

    constructor(
        private readonly id: number, // readonly does NOT make the object immutable so better getter
        private readonly position: { x: number; y: number }, // for nearest-center snapping and for init pos of square on board/screen
        private size: number,
        private readonly notationTextValue: string,
        private config: typeof boardConfig // temp ?
    ) {

        this.container = new Container();
        this.graphics = new Graphics();
        this.container.addChild(this.graphics);
        this.createText();
    }

    public draw(color: string) {

        this.graphics.clear();
        this.graphics.rect(
            this.position.x,
            this.position.y,
            this.size,
            this.size
        ).fill(color);
    }

    public createText() { // private?

        const style = new TextStyle({
            fontSize: 12,
            fill: 0x000000,
        });

        this.notationText = new Text({
            text: this.notationTextValue,
            style
        });

        this.notationText.position.set(
            this.position.x + this.config.textNotationOffset.x,
            this.position.y + this.config.textNotationOffset.y
        );

        this.idText = new Text({
            text: String(this.id),
            style
        });
        this.idText.position.set(
            this.position.x + this.config.textFieldIdOffset.x,
            this.position.y + this.config.textFieldIdOffset.y
        );

        this.container.addChild(
            this.notationText,
            this.idText
        );
    }

    public getContainer(): Container {
        return this.container;
    }

    public getGraphics(): Graphics {
        return this.graphics;
    }

    public getNotationText(): Text | undefined {
        return this.notationText;
    }

    public getIdText(): Text | undefined {
        return this.idText;
    }

    public getPosition() {
        return this.position;
    }

    public getId() {
        return this.id;
    }

    // future
    highlight(color: string) {
        this.draw(color);
    }
}
