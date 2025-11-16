import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { boardConfig } from "./boardConfig";
import { Piece } from "./piece";
import { Field } from "./field";
import { Listener } from "./listener";
import { GameState } from "./gameState";


export class Board {

    private board!: Container;
    private fields!: Field[][];
    private config = boardConfig;
    private gameState !: GameState;

    constructor() {

        this.fields = [];
        this.board = this.generateBoard();
        this.gameState = GameState.getInstance();
    }

    private generateBoard(): Container {

        const boardContainer = new Container;

        for (let r = 0; r < this.config.numberOfRows; r++) {
            let row = [];
            for (let f = 0; f < this.config.numberOfFiles; f++) {

                const id = r * this.config.numberOfRows + f;
                const notation = `${String.fromCharCode(97 + f)}${this.config.numberOfRows - r}`; // a1..h8 // 97 is a lowercase "a" // files got letters while rows have numbers

                const x = this.config.offset.x + f * this.config.squareWidth; //  - this.config.squareWidth / 2 is necessary as pieces are anchored in the middle of spites 
                const y = this.config.offset.y + r * this.config.squareWidth; // 

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
                const style = new TextStyle({
                    fontSize: 48,
                    fill: 0x000000,
                });
                const text = new Text({ text: notation, style: style });
                text.position.set(
                    x + this.config.textOffset,
                    y + this.config.textOffset
                );
                const field = new Field(
                    id,
                    notation,
                    occupiedBy,
                    position,
                    square, // graphics
                    text
                );

                row.push(field);

                boardContainer.addChild(square);
                boardContainer.addChild(text);
            }
            this.fields.push(row);
        }
        return boardContainer;
    };

    public getBoard(): Container { return this.board; }

    public updateFieldsWithFenParserResult(fenPieceBoard: (Piece | null)[][]) {

        // Attach listeners to all pieces
        for (const row of fenPieceBoard) {
            for (const piece of row) {
                // const piece = field.getOccupiedBy();

                if (piece === null) continue;

                piece.onDropped.add(
                    new Listener<{ pieceId: number; x: number; y: number }>(
                        payload => this.handlePieceDrop(payload)
                    )
                );
            }
        }

    }

    public getPiecesFromFields(): (Piece | null)[][] {
        const pieceBoard: (Piece | null)[][] = [];

        for (const row of this.fields) {
            const pieceRow: (Piece | null)[] = [];
            for (const field of row) {
                pieceRow.push(field.getOccupiedBy());
            }
            pieceBoard.push(pieceRow);
        }
        return pieceBoard;
    }


    private handlePieceDrop({ pieceId, x, y }: { pieceId: number; x: number; y: number }) {

        const nearest = this.findNearestField(x, y);
        if (!nearest) return;

        console.log(`Piece with id ${pieceId} snaps to field ${nearest.getNotation()}`);
        if (nearest.getOccupiedBy() === null || nearest.getOccupiedBy()?.getId() === pieceId) { // so if there is no piece or piece lands where started
            nearest.setOccupiedBy(this.findPieceById(pieceId));
        } else {// another piece is already here
            // more logic will be here
            console.log(`Field is already occupied by:
                 color  ${nearest.getOccupiedBy()?.getColor()}
                 role   ${nearest.getOccupiedBy()?.getRole()}
                 id     ${nearest.getOccupiedBy()?.getId()}
                 key    ${nearest.getOccupiedBy()?.getKey()}
            `);

            nearest.getOccupiedBy()!.visible = false;
        }


        // Move the actual piece
        const piece = this.findPieceById(pieceId);
        if (piece) {
            piece.position.set(
                nearest.getPosition().x + this.config.squareWidth / 2, // cause anchor of square is not in the middle
                nearest.getPosition().y + this.config.squareWidth / 2
            );

        }

        this.gameState.incrementMoveCount();
        this.gameState.setNextTurn();
        console.log(this.gameState.getCurrentTurn());
        console.log(this.gameState.getMoveCount());

        // handle interactivness for board
        // this.updatePieceBoard(piece, nearest);
        this.updateFields();

        this.handleInteractivnessOfPiecesOnBoard();

        console.log('xxx getFields', this.getFields());
    }

    private findNearestField(px: number, py: number): Field | null {
        let nearest: Field | null = null;
        let shortest = Infinity;
        for (const row of this.fields) {
            for (const field of row) {

                const dx = px - field.getPosition().x - this.config.squareWidth / 2;
                const dy = py - field.getPosition().y - this.config.squareWidth / 2;
                const distSq = dx * dx + dy * dy;

                if (distSq < shortest) {
                    shortest = distSq;
                    nearest = field;
                }
            }
        }

        return nearest;
    }

    private findPieceById(id: number): Piece | null {
        for (const row of this.fields) {
            for (const field of row) {
                const piece = field.getOccupiedBy();
                if (piece && piece.getId() === id) return piece;
            }
        }
        return null;
    }

    private updateFields(): void {

        for (const row of this.fields) {
            for (const field of row) {


            }
        }
    }


    private handleInteractivnessOfPiecesOnBoard(): void {

        for (const row of this.fields) {
            for (const field of row) {

                const piece = field.getOccupiedBy();
                if (piece === null) continue;

                if (this.gameState.getCurrentTurn() === piece.getColor()) {
                    piece.eventMode = 'dynamic';
                } else {
                    piece.eventMode = 'none';
                }

            }
        }
    }

    public getFields(): Field[][] { return this.fields; }

}