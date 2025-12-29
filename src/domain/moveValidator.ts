import { MoveResult } from "../commonTypes/tsTypes";
import { BoardState } from "./boardState";
import { GameState } from "./gameState";
import { MoveGenerator } from "./moveGenerator";
import { Piece } from "./piece";

export class MoveValidator {

    private boardState!: BoardState;
    private gameState!: GameState;
    private moveGenerator!: MoveGenerator;

    constructor(boardState: BoardState) {

        this.boardState = boardState;
        this.gameState = GameState.getInstance();
        this.moveGenerator = new MoveGenerator(this.boardState);
    }

    public isMoveLegal(piece: Piece, originFieldId: number, destinationFieldId: number): boolean {
        
        if (this.isKingAdjacencyViolation(piece, destinationFieldId) === true) return false;
        // if (this.isPinned(piece, fromId, toId)) return false;
        // if (this.leavesKingInCheck(piece, fromId, toId)) return false;
        return true;
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

        let enemyColor = this.gameState.getCurrentOpponentColor();
        return this.isSquareAttacked(kingField!.getId(), enemyColor);
    }

    private isKingAdjacencyViolation(movingPiece: Piece, destinationFieldId: number): boolean { // there has to be at leat one row and one column of difference between kings
        
        if (movingPiece.getRole() !== 'k') return false;

        // enemy king calcs
        let enemyColor = this.gameState.getCurrentOpponentColor();
        let enemyKing = this.boardState.getPiecesByColor(enemyColor).find(piece => piece.getRole() === 'k');
        let enemyKingFieldId = this.boardState.getFieldByPiece(enemyKing!)!.getId();

        const enemyKingRow = this.boardState.getRowById(enemyKingFieldId);
        const enemyKingFile = this.boardState.getFileById(enemyKingFieldId);

        // current king calcs 
        const currentKingRow = this.boardState.getRowById(destinationFieldId);
        const currentKingFile = this.boardState.getFileById(destinationFieldId);

        const rowDiff = Math.abs(enemyKingRow - currentKingRow);
        const fileDiff = Math.abs(enemyKingFile - currentKingFile);

        return (rowDiff <= 1 && fileDiff <= 1);
    }
}

// King adjacency rules - done
// Discovered checks
// Pinned-piece restrictions