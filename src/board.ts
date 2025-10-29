import { Container, Graphics } from "pixi.js";
import { boardConfig } from "./boardConfig";
import { Piece } from "./piece";

export type Field = {

    id: number; // 0–63
    notation: string; // "a1","a2", ..., "h8"
    position: { x: number; y: number };
    occupiedBy: Piece | null;
    graphics: Graphics;
};

export class Board {

    private board!: Container;
    private fields: Field[] = [];

    private config = boardConfig;

    constructor() {

        this.board = this.generateBoard();
    }

    private generateBoard(): Container {

        const boardContainer = new Container;

        for (let r = 0; r < this.config.numberOfRows; r++) {
            for (let f = 0; f < this.config.numberOfFiles; f++) {

                const id = r * this.config.numberOfRows + f;
                const notation = `${String.fromCharCode(97 + f)}${this.config.numberOfRows - r}`; // a1..h8 // 97 is a lowercase "a" // files got letters while rows have numbers
                const x = this.config.offset.x + f * this.config.squareWidth - this.config.squareWidth / 2; //  - this.config.squareWidth / 2 is necessary as pieces are anchored in the middle of spites 
                const y = this.config.offset.y + r * this.config.squareWidth - this.config.squareWidth / 2; // 


                const color = (r + f) % 2 === 0 ? this.config.colorDark : this.config.colorLight;
                const square = new Graphics()
                    .rect(
                        x,
                        y,
                        this.config.squareWidth,
                        this.config.squareWidth
                    )
                    .fill(color);

                this.fields.push({ id, notation, position: { x, y }, occupiedBy: null, graphics: square });

                boardContainer.addChild(square);
            }
        }

        return boardContainer;
    };

    public getBoard(): Container { return this.board; }

}