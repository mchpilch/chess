import { MoveResult } from "../commonTypes/tsTypes";
import { BoardState } from "./boardState";
import { MoveGenerator } from "./moveGenerator";

export class MoveValidator {

    private boardState!: BoardState;
    private moveGenerator!: MoveGenerator;

    constructor(boardState: BoardState) {

        this.boardState = boardState;
        this.moveGenerator = new MoveGenerator(this.boardState);
    }

    public isSquareAttacked(fieldId: number, byColor: 'w' | 'b'): boolean {
        
        const enemyPieces = this.boardState.getPiecesByColor(byColor);

        for (const piece of enemyPieces) {
     
            const moves: MoveResult = this.moveGenerator.calculateMovesByPiece(piece);
            if (moves.captures.includes(fieldId) || moves.quietMoves.includes(fieldId)) {
                return true;
            }
        }
        return false;
    }

    // todo
    // public isKingInCheck(color) {

    // }

    // todo
    // public getLegalMoves() {

    // }
}
