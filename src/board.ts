import { Container, Graphics } from "pixi.js";
import { boardConfig } from "./boardConfig";

export class Board {

    private board!: Container;
    private config = boardConfig;

    constructor() {

        this.board = this.generateBoard();
    }

    private generateBoard(): Container{

        const boardContainer = new Container;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {

                const color = (r + c) % 2 === 0 ? this.config.colorDark : this.config.colorLight;
                const square = new Graphics()
                    .rect(
                        this.config.offset.x + c * this.config.squareWidth - this.config.squareWidth / 2,
                        this.config.offset.y + r * this.config.squareWidth - this.config.squareWidth / 2,
                        this.config.squareWidth,
                        this.config.squareWidth
                    )
                    .fill(color);

                boardContainer.addChild(square);
            }
        }

        return boardContainer;
    };

    public getBoard(): Container{ return this.board; }

}