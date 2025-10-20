import { Assets, Container, Graphics, Sprite } from "pixi.js";

export class Board {

    SQUARE = 120;
    COLOR_WHITE = "#c0c9cdff";
    COLOR_BLACK = "#346738ff";
    OFFSET = 120;
    OFFSET_PIECES = this.OFFSET + this.SQUARE / 2;

    chessboard: Graphics[] = [];
    constructor() {

    }

    public generateBoard(): Container {

        const boardContainer = new Container();
        // const chessboard: Graphics[] = [];

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {

                const color = (r + c) % 2 === 0 ? this.COLOR_BLACK : this.COLOR_WHITE;
                const square = new Graphics()
                    .rect(this.OFFSET + c * this.SQUARE, this.OFFSET + r * this.SQUARE, this.SQUARE, this.SQUARE)
                    .fill(color);

                // chessboard.push(square);
                boardContainer.addChild(square);
            }
        }

        return boardContainer;
    };
    public async generatePieces(): Promise<Container> {

        const svgTexturePawnW = await Assets.load("/assets/pawn-w.svg")
        const pawnW = new Sprite(svgTexturePawnW);

        const piecesContainer = new Container();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {

                let test = new Sprite(svgTexturePawnW);
                test.anchor.set(0.5);
                test.scale.set(1);
                test.position.set(this.OFFSET_PIECES + c * this.SQUARE, this.OFFSET_PIECES + r * this.SQUARE);
                piecesContainer.addChild(test);
            };
        }
        return piecesContainer;
    }
}