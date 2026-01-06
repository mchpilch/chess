import { Field } from "./field";
import { Piece } from "./piece";

export class BoardState {

    private pieces: { w: Piece[]; b: Piece[] } = { // maybe two sets in future? for now arrays
        w: [],
        b: [],
    };

    constructor(
        private readonly fields: Field[][],
        pieces: { w: Piece[]; b: Piece[] }
    ) {
        this.pieces = pieces;
    }

    public getFields(): Field[][] {
        return this.fields;
    }

    public getFieldById(id: number): Field { // also in moveGenerator

        return this.fields[7 - Math.floor(id / 8)][id % 8];
    }

    public getRowById(id: number): number {

        return (Math.floor(id / 8))
    }

    public getFileById(id: number): number {

        return (id % 8)
    }

    public getPiecesByColor(color: 'w' | 'b'): Piece[] {
        return this.pieces[color];
    }

    public getFieldByPiece(piece: Piece): Field | null {

        for (const row of this.fields) {
            for (const field of row) {
                if (field.getOccupiedBy() === piece) return field;
            }
        }
        return null;
    }

    public removePieceFromStorage(piece: Piece): void {
        const color = piece.getColor();
        const list = this.pieces[color];

        const index = list.findIndex(p => p === piece);
        if (index !== -1) {
            list.splice(index, 1);
        }
    }

    private printBoardStateArray(): void { // for debug purposes, printes board to console with FEN like pieces

        const rows = 8;
        const cols = 8;

        const boardStateArray: (string | null)[][] = [];

        for (let i = 0; i < rows; i++) {
            boardStateArray.push(Array(cols).fill(null));
        }


        for (let row of this.fields) {
            for (let field of row) {
                const occupiedBy = field.getOccupiedBy();
                if (occupiedBy !== null) {
                    let isWhite = occupiedBy.getColor() === 'w';
                    boardStateArray[7 - Math.floor(field.getId() / 8)][field.getId() % 8] = isWhite ? occupiedBy.getRole().toUpperCase() : occupiedBy.getRole().toLowerCase();
                }
            }

        }
        console.log('Debug Info: boardStateArray', boardStateArray);
    }

}