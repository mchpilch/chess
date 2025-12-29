import { MoveResult } from "../commonTypes/tsTypes";
import { BoardState } from "./boardState";
import { MoveGenerator } from "./moveGenerator";
import { Piece } from "./piece";

export class MoveValidator {

    private boardState!: BoardState;
    private moveGenerator!: MoveGenerator;

    constructor(boardState: BoardState) {

        this.boardState = boardState;
        this.moveGenerator = new MoveGenerator(this.boardState);
    }

    public isMoveLegal(piece: Piece, originFieldId: number, destinationFieldId: number): boolean {

        if (this.isKingAdjacencyViolation(piece, destinationFieldId) === true) return false;
        if (this.leavesCurrentKingInCheck(piece, originFieldId, destinationFieldId) === true) return false; // Protects from moving pinned pieces
        return true;
    }

    private leavesCurrentKingInCheck(piece: Piece, originFieldId: number, destinationFieldId: number): boolean {

        const originField = this.boardState.getFieldById(originFieldId);
        const destinationField = this.boardState.getFieldById(destinationFieldId);

        // Save for future rollback
        const residentOfDestinationField = destinationField.getOccupiedBy(); // Can be null or a piece
        console.log('xxx residentOfDestinationField', residentOfDestinationField);

        originField.setOccupiedBy(null);
        destinationField.setOccupiedBy(piece);

        // Check if current king in that scenario is under attack
        const isInCheck = this.isKingInCheck(piece.getColor());

        // Rollback 
        destinationField.setOccupiedBy(residentOfDestinationField); // piece or null
        originField.setOccupiedBy(piece);
        console.log('xxx Leaves current king in check? : ', isInCheck);

        return isInCheck;
    }

    public isKingInCheck(color: 'w' | 'b'): boolean {

        const list = this.boardState.getPiecesByColor(color);

        let currentKing = list.find(piece => piece.getRole() === 'k'); 
        let currentKingField = this.boardState.getFieldByPiece(currentKing!);

        const attackedByColor = color === 'w' ? 'b' : 'w';

        return this.isSquareAttackedOrControlled(currentKingField!.getId(), attackedByColor);
    }


    public isSquareAttackedOrControlled(fieldId: number, byColor: 'w' | 'b'): boolean {

        const enemyPieces = this.boardState.getPiecesByColor(byColor);

        for (const piece of enemyPieces) {

            const moves: MoveResult = this.moveGenerator.calculateMovesByPiece(piece);
            if (moves.captures.includes(fieldId) || moves.quietMoves.includes(fieldId)) {
                return true;
            }
        }
        return false;
    }

    private isKingAdjacencyViolation(movingPiece: Piece, destinationFieldId: number): boolean { 
        // There has to be at leat one row and one column of difference between kings
        if (movingPiece.getRole() !== 'k') return false;

        // Enemy king calcs
        let enemyColor = movingPiece.getColor() === 'w' ? 'b' : 'w' as 'w' | 'b';
        let enemyKing = this.boardState.getPiecesByColor(enemyColor).find(piece => piece.getRole() === 'k');
        let enemyKingFieldId = this.boardState.getFieldByPiece(enemyKing!)!.getId();

        const enemyKingRow = this.boardState.getRowById(enemyKingFieldId);
        const enemyKingFile = this.boardState.getFileById(enemyKingFieldId);

        // Current king calcs 
        const currentKingRow = this.boardState.getRowById(destinationFieldId);
        const currentKingFile = this.boardState.getFileById(destinationFieldId);

        const rowDiff = Math.abs(enemyKingRow - currentKingRow);
        const fileDiff = Math.abs(enemyKingFile - currentKingFile);

        return (rowDiff <= 1 && fileDiff <= 1);
    }
}
