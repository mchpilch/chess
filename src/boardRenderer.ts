import { FieldView } from "./fieldView";

// Responsible for rendering the board, PIXI details like graphics and textures, handled drawing board, highlighting squares
export class BoardRenderer { // goal: Game logic never touches PIXI objects. Field issues. Currently mixes game state and rendering state

    private static instance: BoardRenderer;
    private fieldViews = new Map<number, FieldView>();
    
    constructor(
        private config: BoardConfig
    ) { }

    public static getInstance(): BoardRenderer {
        if (!BoardRenderer.instance) {
            BoardRenderer.instance = new BoardRenderer();
        }
        return BoardRenderer.instance;
    }

    // highlight(possibleQuiet: number[], captures: number[]) { ... }

    // clearHighlights() { ... }

    // drawInitialBoard(): Container { ... }

    private highlightFields(possibleQuietMoves: number[], possibleCaptures: number[]): void {

        console.log('xxxxxxx possibleQuietMoves', possibleQuietMoves);
        console.log('xxxxxxx possibleCaptures', possibleCaptures);
        const fillFieldWithColor = (field: Field, color: string) => {
            let { x, y } = field.getPosition();
            // console.log('xxx field', field.getNotation());
            field.getGraphics().clear();
            field.getGraphics().rect(x, y, this.config.squareWidth, this.config.squareWidth).fill(color);
        }

        for (let row of this.fields) {
            for (let field of row) {

                if (possibleQuietMoves.includes(field.getId())) {

                    fillFieldWithColor(field, this.config.possibleMoveColorHighlight);
                }

                if (possibleCaptures.includes(field.getId())) {
                    console.log('xxx field.getOccupiedBy()?.getRole()', field.getOccupiedBy()?.getRole());
                    if (field.getOccupiedBy()?.getRole() === 'king') {
                        console.log('xxx check at field.getOccupiedBy()', field.getOccupiedBy());
                        fillFieldWithColor(field, this.config.possibleCheckColorHighlight);
                    } else {
                        console.log('xxx capture at field.getOccupiedBy()', field.getOccupiedBy());
                        fillFieldWithColor(field, this.config.captureColorHighlight);
                    }

                }

            }
        }
    }
}
