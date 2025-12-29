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
        console.log('xxx color', byColor);

        const enemyPieces = this.boardState.getPiecesByColor(byColor);

        for (const piece of enemyPieces) {

            const moves: MoveResult = this.moveGenerator.calculateMovesByPiece(piece);
            if (moves.captures.includes(fieldId) || moves.quietMoves.includes(fieldId)) {
                return true;
            }
        }
        return false;
    }

    public isKingInCheck(color: 'w' | 'b'): boolean {

        const list = this.boardState.getPiecesByColor(color);

        let king = list.find(piece => piece.getRole() === 'k'); // in future handle king rm rules from storage and add safe guards
        let kingField = this.boardState.getFieldByPiece(king!);

        let enemyColor = (color === 'w' ? 'b' : 'w') as 'w' | 'b';
        return this.isSquareAttacked(kingField!.getId(), enemyColor);
    }
}
