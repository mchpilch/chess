import { Container, Graphics, Text } from "pixi.js";
import { boardConfig } from "./boardConfig";
import { Piece } from "./piece";
import { Field } from "./field";
import { Listener } from "./listener";

// export type Field = {

//     id: number; // 0–63
//     notation: string; // "a1","a2", ..., "h8"
//     position: { x: number; y: number };
//     occupiedBy: Piece | null;
//     graphics: Graphics;  // the square background
//     text: Text;
// };

export class Board {

    private board!: Container;
    private pieceBoard!: (Piece | null)[][];
    private fields!: Field[][];
    private config = boardConfig;

    constructor() {

        this.fields = [];
        this.board = this.generateBoard();

        const listener = new Listener(({ pieceId, x, y }) => {
            console.log(`Piece ${pieceId} dropped at (${x},${y})`);
        });

    }

    private generateBoard(): Container {

        const boardContainer = new Container;

        for (let r = 0; r < this.config.numberOfRows; r++) {
            let row = [];
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

                // Wrap the square in a container
                const occupiedBy: Piece | null = null;
                const position = { x, y };

                const field = new Field(
                    id,
                    notation,
                    occupiedBy,
                    position,
                    // graphics: square,

                );

                row.push(field);

                boardContainer.addChild(square);
            }
            console.log('xxx row', row);
            this.fields.push(row);
        }

        console.log('xxx this.fields', this.fields);
        return boardContainer;
    };


    public updateOccupationOfFieds() {
        let rowNumber = 0;
        for (let r = 0; r < this.config.numberOfRows; r++) {
            rowNumber++;
            for (let f = 0; f < this.config.numberOfFiles; f++) {

            }
            this.fields.forEach(
                (row) => row.forEach((field) => {

                    field.setOccupiedBy(this.pieceBoard[Math.floor(field.id / 8)][field.id % 8]);
                }));
            console.log('xxx this.fields', this.fields);
        }
    }

    public getBoard(): Container { return this.board; }

    // PieceBoard is a datastructure to hold pieces (sprites) in arr[][]
    public setPieceBoard(pieceBoard: (Piece | null)[][]) { this.pieceBoard = pieceBoard; }
}