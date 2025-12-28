import { Listener } from "../events/listener";
import { GameState } from "../domain/gameState";
import { BoardState } from "../domain/boardState";
import { Piece } from "../domain/piece";
import { Field } from "../domain/field";
import { FieldView } from "../views/fieldView";
import { BoardView } from "../views/boardView";
import { MoveGenerator } from "../domain/moveGenerator";
import { MoveValidator } from "../domain/moveValidator";
import { boardConfig } from "../configs/boardConfig";
/*** 
 * Board - class responsible for controlling flow. Orchestrator. 
 * Merges boardView, boardState and MoveGeneration by calling subslasses.
*/
export class BoardController {

    private fields!: Field[][];
    private pieces!: { w: Piece[]; b: Piece[] };

    private boardView !: BoardView;
    private boardState !: BoardState;
    private moveGenerator !: MoveGenerator;
    private moveValidator !: MoveValidator;

    private gameState !: GameState;

    private dragOriginField: Field | null = null;
    private dragOriginFieldView: FieldView | null = null;

    private currentPossibleMovesForDraggedPiece!: number[];

    private config = boardConfig;

    constructor(boardView: BoardView) {

        this.fields = [];
        this.pieces = {
            w: [],
            b: [],
        };

        this.generateBoard();

        this.boardState = new BoardState(this.fields, this.pieces);
        this.moveGenerator = new MoveGenerator(this.boardState); // passing references to this.fields that later are mutated
        this.moveValidator = new MoveValidator(this.boardState); // passing references to this.fields that later are mutated

        this.boardView = boardView;
        this.gameState = GameState.getInstance();

        this.dragOriginField = null;
        this.dragOriginFieldView = null;

        this.currentPossibleMovesForDraggedPiece = [];
    }

    private generateBoard(): void {

        for (let r = 0; r < this.config.numberOfRows; r++) {

            let rowLogical = [];
            for (let f = 0; f < this.config.numberOfFiles; f++) {

                const id = this.config.numberOfRows * (this.config.numberOfRows - r - 1) + f; // improved id calc so a1 corresponds to 0 a2 to 1 and so on
                const notation = `${String.fromCharCode(97 + f)}${this.config.numberOfRows - r}`; // a1..h8 // 97 is a lowercase "a" // files got letters while rows have numbers
                const occupiedBy: Piece | null = null;

                const field = new Field(
                    id,
                    notation,
                    occupiedBy,
                );

                rowLogical.push(field);
            }
            this.fields.push(rowLogical);
        }
    };

    public attachListenersToPieces() {

        // Attach listeners to all pieces
        for (const row of this.fields) {
            for (const field of row) {

                let piece = field.getOccupiedBy();
                if (piece === null) continue;
                let pieceId = piece.getId();

                let pieceView = this.boardView.getPieceViewById(pieceId);

                if (typeof pieceView === 'undefined') continue;

                pieceView.onDragStarted.add(
                    new Listener<{ pieceId: number; x: number; y: number }>(
                        payload => this.handlePieceDragStarted(payload)
                    )
                );

                pieceView.onDropped.add(
                    new Listener<{ pieceId: number; x: number; y: number }>(
                        payload => this.handlePieceDrop(payload)
                    )
                );
            }
        }

    }

    private handlePieceDragStarted({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {

        const originFieldId = this.findNearestFieldId(x, y);

        if (originFieldId === null) {
            this.dragOriginField = null;
            this.dragOriginFieldView = null;
            return;
        }

        const originField = this.boardState.getFieldById(originFieldId);
        const originFieldView = this.boardView.getFieldViewById(originFieldId);

        this.dragOriginField = originField;
        this.dragOriginFieldView = originFieldView;

        const { quietMoves, captures } = this.moveGenerator.calculateMoves(originField);
        this.boardView.highlightFields(quietMoves, captures);
        this.currentPossibleMovesForDraggedPiece = [...quietMoves, ...captures];
    }

    private handlePieceDrop({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {

        const nearestFieldId = this.findNearestFieldId(x, y);

        if (nearestFieldId === null) {

            this.dragOriginField = null;
            this.dragOriginFieldView = null;
            return;
        }

        const nearestField = this.boardState.getFieldById(nearestFieldId)
        const nearestFieldView = this.boardView.getFieldViewById(nearestFieldId)

        this.boardView.turnOffHighlights();

        let isMoveToStartingSquare = nearestField.getOccupiedBy()?.getId() === pieceId;
        let isMoveToWrongColor = nearestField.getOccupiedBy() !== null && nearestField.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn();
        let isMoveToEnemySquare = nearestField.getOccupiedBy() !== null && nearestField.getOccupiedBy()?.getColor() !== this.gameState.getCurrentTurn();

        if (isMoveToStartingSquare === true || isMoveToWrongColor === true) {
            if (this.dragOriginField === null) return;
            this.movePiece(pieceId, this.dragOriginFieldView!);
            this.dragOriginField = null;
            return;
        }

        if (this.config.applyPieceSpecyficMoveConstraints === true && this.currentPossibleMovesForDraggedPiece.includes(nearestFieldId) === false) {

            console.log('Illegal move for piece', pieceId, 'to field', nearestFieldId);
            this.movePiece(pieceId, this.dragOriginFieldView!);
            this.dragOriginField = null;
            return;
        }

        if (isMoveToEnemySquare === true) {
            let piece = nearestField.getOccupiedBy()!;
            let pieceView = this.boardView.getPieceViewById(piece.getId())!;
            pieceView.visible = false; // later: consider if this is enough or should it be rm from stage completely
            this.boardState.removePieceFromStorage(piece);
        }

        this.movePiece(pieceId, nearestFieldView);
        nearestField.setOccupiedBy(this.findPieceById(pieceId));
        nearestField.getOccupiedBy()!.markMoved();

        this.gameState.incrementMoveCount();
        this.gameState.setNextTurn();

        this.dragOriginField?.setOccupiedBy(null);

        this.handleInteractivnessOfPiecesOnBoard();
        this.dragOriginField = null;
    }

    private findNearestFieldId(px: number, py: number): number | null {
        let nearest: FieldView | null = null;
        let shortest = Infinity;
        for (const row of this.boardView.getFieldViews()) {
            for (const fieldView of row) {

                const dx = px - fieldView.getPosition().x - this.config.squareWidth / 2;
                const dy = py - fieldView.getPosition().y - this.config.squareWidth / 2;
                const distSq = dx * dx + dy * dy;


                if (distSq < shortest) {
                    shortest = distSq;
                    nearest = fieldView;
                }
            }
        }
        return nearest!.getId();
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

    private movePiece(pieceId: number, destination: FieldView): void { // set dragged piece in new position
        // Move the actual piece
        const pieceView = this.boardView.getPieceViewById(pieceId);

        if (pieceView) {
            pieceView.position.set(
                destination.getPosition().x + this.config.squareWidth / 2, // cause anchor of square is not in the middle
                destination.getPosition().y + this.config.squareWidth / 2
            );
        }
    }

    private handleInteractivnessOfPiecesOnBoard(): void {

        for (const row of this.fields) {
            for (const field of row) {

                const piece = field.getOccupiedBy();

                if (piece === null) continue;

                const pieceView = this.boardView.getPieceViewById(piece.getId())!; // "!"

                if (this.gameState.getCurrentTurn() === piece.getColor()) {

                    pieceView.eventMode = 'dynamic';
                } else {
                    pieceView.eventMode = 'none';
                }

            }
        }
    }

    public getBoardState(): BoardState {

        return this.boardState;
    }

    public putPieceIntoStorage(piece: Piece, color: 'w' | 'b'): void {

        this.pieces[color].push(piece);
    }
}