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
import { CastlingIntent } from "../commonTypes/tsTypes";
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
        // console.log('Debug Info: handlePieceDragStarted pieceID', pieceId, 'originFieldId', originFieldId);
        if (originFieldId === null) {
            this.dragOriginField = null;
            this.dragOriginFieldView = null;
            return;
        }

        const originField = this.boardState.getFieldById(originFieldId);
        const originFieldView = this.boardView.getFieldViewById(originFieldId);

        this.dragOriginField = originField;
        this.dragOriginFieldView = originFieldView;

        const { quietMoves, captures, castlingMoves } = this.moveGenerator.calculateMoves(originField);

        const piece = originField.getOccupiedBy()!;
        const originId = originField.getId();

        const legalQuietMoves = quietMoves.filter(moveDestination =>
            this.moveValidator.isMoveLegal(piece, originId, moveDestination)
        );

        const legalCaptures = captures.filter(moveDestination =>
            this.moveValidator.isMoveLegal(piece, originId, moveDestination)
        );

        const legalCastlingMoves = castlingMoves?.filter(moveDestination =>
            this.moveValidator.isMoveLegal(piece, originId, moveDestination)
        );

        this.boardView.highlightFields(legalQuietMoves, legalCaptures, legalCastlingMoves ?? []);
        this.currentPossibleMovesForDraggedPiece = [...legalQuietMoves, ...legalCaptures, ...legalCastlingMoves ?? []];
    }

    private handlePieceDrop({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {

        let nearestFieldId = this.findNearestFieldId(x, y);
        // console.log('Debug Info: HandlePieceDrop: pieceID', pieceId, 'nearestFieldId', nearestFieldId);

        if (nearestFieldId === null || pieceId === null) {

            this.dragOriginField = null;
            this.dragOriginFieldView = null;
            return;
        }

        let nearestField = this.boardState.getFieldById(nearestFieldId)
        let nearestFieldView = this.boardView.getFieldViewById(nearestFieldId)

        this.boardView.turnOffHighlights();

        let piece = this.findPieceById(pieceId);
        if (piece === null) return;
        // CASTLING INTENT DETECTION
        const castling = this.detectCastlingIntent(piece, nearestFieldId);

        if (castling.isCastlingIntent === true) {
            const { desiredKingDestinationId } = castling;

            nearestFieldId = desiredKingDestinationId;
            nearestField = this.boardState.getFieldById(nearestFieldId);
            nearestFieldView = this.boardView.getFieldViewById(nearestFieldId);
        }

        // IS ILLEGAL DROP
        let isMoveToStartingSquare = nearestField.getOccupiedBy()?.getId() === pieceId; // IS ILLEGAL DROP (1)
        let isMoveToOwnColor = nearestField.getOccupiedBy() !== null && nearestField.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn(); // IS ILLEGAL DROP
        
        if (isMoveToStartingSquare === true) { // IS ILLEGAL DROP
            if (this.dragOriginField === null) return;
            // block
            this.snapBackPieceToOrigin(pieceId);
            return;
        }
        if (isMoveToOwnColor === true && castling.isCastlingIntent === false) { // IS ILLEGAL DROP
            if (this.dragOriginField === null) return;
            // block
            this.snapBackPieceToOrigin(pieceId);
            return;
        }

        if ((this.config.applyPieceSpecyficMoveConstraints === true &&
            this.currentPossibleMovesForDraggedPiece.includes(nearestFieldId) === false)) {

            console.log('Debug Info: Illegal move for piece', pieceId, 'to field', nearestFieldId);
            // block
            this.snapBackPieceToOrigin(pieceId);
            return;
        }

        let isMoveToEnemySquare = nearestField.getOccupiedBy() !== null && nearestField.getOccupiedBy()?.getColor() !== this.gameState.getCurrentTurn();

        if (isMoveToEnemySquare === true) {

            this.capturePieceOnField(nearestField);
        }

        // CONDITIONS MET: MOVE THE PIECE (view + state)
        this.movePiece(pieceId, nearestFieldView); // Moves piece view to new field (so during castling sets correct positon of king, rook handled separately)
        nearestField.setOccupiedBy(piece);
        piece.markMoved();

        if (castling.isCastlingIntent === true) {
            // in future play castling gsap animation but for now move rook
            this.moveRookForCastling(nearestFieldView.getId());
        }

        this.finalizeTurn();

    }

    private detectCastlingIntent(piece: Piece, droppedFieldId: number): CastlingIntent {

        if (piece.getRole() !== 'k') {
            return { isCastlingIntent: false };
        }

        const isWhite = piece.getColor() === 'w';

        const rules = isWhite
            ? [
                { fields: [0, 1, 2], target: 2, },
                { fields: [6, 7], target: 6 },
            ]
            : [
                { fields: [56, 57, 58], target: 58 },
                { fields: [62, 63], target: 62 },
            ];


        const match = rules.find(rule =>
            rule.fields.includes(droppedFieldId)
        );

        if (!match) {
            return { isCastlingIntent: false };
        }

        return {
            isCastlingIntent: true,
            desiredKingDestinationId: match.target,
        };
    }

    private capturePieceOnField(field: Field): void {
        const piece = field.getOccupiedBy();
        if (!piece) return;

        const pieceView = this.boardView.getPieceViewById(piece.getId());
        if (pieceView) pieceView.visible = false;

        this.boardState.removePieceFromStorage(piece);
    }

    private moveRookForCastling(currentKingFieldViewId: number): void {

        // based on new position of king define new position of rook (logical + view)
        let rookCurrentFieldId: 0 | 7 | 56 | 63 = 0; // default to white queenside
        let rookDestinationFieldId: 3 | 5 | 59 | 61 = 3; // default to white queenside
        switch (currentKingFieldViewId) {
            case 2: // white queenside
                rookCurrentFieldId = 0;
                rookDestinationFieldId = 3;
                break;
            case 6: // white kingside
                rookCurrentFieldId = 7;
                rookDestinationFieldId = 5;
                break;
            case 58: // black queenside
                rookCurrentFieldId = 56;
                rookDestinationFieldId = 59;
                break;
            case 62: // black kingside
                rookCurrentFieldId = 63;
                rookDestinationFieldId = 61;
                break;
        }

        let rook = this.boardState.getFieldById(rookCurrentFieldId).getOccupiedBy();

        let rookDestinationField = this.boardState.getFieldById(rookDestinationFieldId);
        let rookDestinationFieldView = this.boardView.getFieldViewById(rookDestinationFieldId);
        this.movePiece(rook?.getId()!, rookDestinationFieldView);
        this.boardState.getFieldById(rookCurrentFieldId).setOccupiedBy(null); // state reflects that rook left its original square
        rookDestinationField.setOccupiedBy(rook); // set state of new destination to have the rook and from previus delete rook
        rookDestinationField.getOccupiedBy()!.markMoved();
    }

    private finalizeTurn(): void {

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

    private snapBackPieceToOrigin(pieceId: number): void {

        this.movePiece(pieceId, this.dragOriginFieldView!);
        this.dragOriginField = null;
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