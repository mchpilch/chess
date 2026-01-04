import { Container, Graphics } from "pixi.js";
import { FieldView } from "./fieldView";
import { PieceView } from "./pieceView";
import { boardConfig } from "../configs/boardConfig";

export type FieldHighlight = 'quiet' | 'capture' | 'check';


export class BoardView { // rendering

    private boardView!: Container;
    private config = boardConfig;

    private fieldViews!: FieldView[][];
    private pieceViews = new Map<number, PieceView>();

    constructor() {

        this.fieldViews = [];
        this.boardView = this.generateBoardView();
    }

    private generateBoardView(): Container {

        const boardContainer = new Container;

        for (let r = 0; r < this.config.numberOfRows; r++) {

            let rowView = [];
            for (let f = 0; f < this.config.numberOfFiles; f++) {

                const id = this.config.numberOfRows * (this.config.numberOfRows - r - 1) + f; // improved id calc so a1 corresponds to 0 a2 to 1 and so on
                const notation = `${String.fromCharCode(97 + f)}${this.config.numberOfRows - r}`; // a1..h8 // 97 is a lowercase "a" // files got letters while rows have numbers
                const x = this.config.offset.x + f * this.config.squareWidth; //  - this.config.squareWidth / 2 is necessary as pieces are anchored in the middle of spites 
                const y = this.config.offset.y + r * this.config.squareWidth; // 
                const position = { x, y };
                const size = this.config.squareWidth;
                const notationTextValue = notation;

                const fieldView = new FieldView(
                    id,
                    position,
                    size,
                    notationTextValue,
                    this.config //temp?
                );

                const color = (r + f) % 2 === 0 ? this.config.colorLight : this.config.colorDark;
                fieldView.draw(color);

                rowView.push(fieldView);

                boardContainer.addChild(fieldView.getContainer());
            }
            this.fieldViews.push(rowView);

            if (this.config.gridActive === true) {
                const grid = this.generateGrid();
                boardContainer.addChild(grid);
            }

        }
        return boardContainer;
    };

    public getBoard(): Container { return this.boardView; }

    public highlightFields(possibleQuietMoves: number[], possibleCaptures: number[]): void { // , possibleCheck: number

        const fillFieldWithColor = (fieldView: FieldView, color: string) => {

            fieldView.draw(color);
        }

        for (let row of this.fieldViews) {

            for (let fieldView of row) {

                if (possibleQuietMoves.includes(fieldView.getId())) {

                    fillFieldWithColor(fieldView, this.config.possibleMoveColorHighlight);
                }

                if (possibleCaptures.includes(fieldView.getId())) {

                    fillFieldWithColor(fieldView, this.config.captureColorHighlight);
                }

            }

        }
    }

    public turnOffHighlights(): void {

        this.fieldViews.forEach((row, rowIndex) => {
            row.forEach((fieldView, colIndex) => {

                const color = (rowIndex + colIndex) % 2 === 0 ? this.config.colorDark : this.config.colorLight;
                fieldView.draw(color);
            });
        });
    }

    public getFieldViews(): FieldView[][] { return this.fieldViews; }

    public getFieldViewById(id: number): FieldView {

        return this.fieldViews[7 - Math.floor(id / 8)][id % 8];
    }

    public addPieceView(pieceView: PieceView) {

        this.pieceViews.set(pieceView.getId(), pieceView);
    }

    public getPieceViewById(id: number): PieceView | undefined {

        return this.pieceViews.get(id);
    }

    private generateGrid() {

        const grid = new Graphics();

        const { numberOfRows, numberOfFiles, squareWidth, offset, gridColor, gridStrokeWidth } = this.config;

        // Draw vertical lines
        for (let i = 0; i < numberOfFiles + 1; i++) {

            grid // Move to top of each line 
                .moveTo(offset.x + i * squareWidth, offset.x + 0)
                 // Draw down to bottom
                .lineTo(offset.x + i * squareWidth, offset.x + squareWidth * numberOfFiles);
        }

        // Draw horizontal lines
        for (let i = 0; i < numberOfRows + 1; i++) {
            
            grid // Move to start of each line
                .moveTo(offset.y + 0, offset.y + i * squareWidth)
                 // Draw across to end
                .lineTo(offset.y + squareWidth * numberOfRows, offset.y + i * squareWidth);
        }

        // Add stroke
        grid.stroke({ color: gridColor, width: gridStrokeWidth });
        return grid;
    }
}
