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

enum Castling {
    WHITE_KING_SIDE,
    BLACK_KING_SIDE,
    WHITE_QUEEN_SIDE,
    BLACK_QUEEN_SIDE,
}
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
        // console.log('xxx handlePieceDragStarted pieceID', pieceId, 'originFieldId', originFieldId);
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
        console.log('xxxxx quietMoves', quietMoves, 'captures', captures);

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

        console.log('www legalCastlingMoves', legalCastlingMoves);


        this.boardView.highlightFields(legalQuietMoves, legalCaptures, legalCastlingMoves ?? []);
        this.currentPossibleMovesForDraggedPiece = [...legalQuietMoves, ...legalCaptures, ...legalCastlingMoves ?? []];
    }

    private handlePieceDrop({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {

        let nearestFieldId = this.findNearestFieldId(x, y); // GameSense change: not const anymore as castling may change it for example, put king on h8 means black kingside castling so actually move to g8
        console.log('xxxwww  handlePieceDrop pieceID', pieceId, 'nearestFieldId', nearestFieldId);

        if (nearestFieldId === null) {

            this.dragOriginField = null;
            this.dragOriginFieldView = null;
            return;
        }

        let nearestField = this.boardState.getFieldById(nearestFieldId)
        let nearestFieldView = this.boardView.getFieldViewById(nearestFieldId)

        this.boardView.turnOffHighlights();

        // castling intent
        let isCaslingIntent = false;
        let piece = this.findPieceById(pieceId);

        if (piece?.getRole() === 'k') {
            console.log('www0', pieceId);
            if (piece?.getColor() === 'w') {
                if (nearestFieldId === 0 || nearestFieldId === 1 || nearestFieldId === 2) {

                    console.log('www 1', pieceId);
                    nearestFieldId = 2;
                    nearestField = this.boardState.getFieldById(nearestFieldId);
                    nearestFieldView = this.boardView.getFieldViewById(nearestFieldId);
                    isCaslingIntent = true;
                } else if (nearestFieldId === 6 || nearestFieldId === 7) {
                    console.log('www 2', pieceId);
                    nearestFieldId = 6;
                    nearestField = this.boardState.getFieldById(nearestFieldId);
                    nearestFieldView = this.boardView.getFieldViewById(nearestFieldId);
                    isCaslingIntent = true;
                }
            } else {
                if (nearestFieldId === 56 || nearestFieldId === 57 || nearestFieldId === 58) {
                    console.log('www 3', pieceId);
                    nearestFieldId = 58;
                    nearestField = this.boardState.getFieldById(nearestFieldId);
                    nearestFieldView = this.boardView.getFieldViewById(nearestFieldId);
                    isCaslingIntent = true;
                } else if (nearestFieldId === 62 || nearestFieldId === 63) {
                    console.log('www 4', pieceId);
                    nearestFieldId = 62;
                    nearestField = this.boardState.getFieldById(nearestFieldId);
                    nearestFieldView = this.boardView.getFieldViewById(nearestFieldId);
                    isCaslingIntent = true;
                }
            }
        }

        let isMoveToStartingSquare = nearestField.getOccupiedBy()?.getId() === pieceId;
        let isMoveToWrongColor = nearestField.getOccupiedBy() !== null && nearestField.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn();
        let isMoveToEnemySquare = nearestField.getOccupiedBy() !== null && nearestField.getOccupiedBy()?.getColor() !== this.gameState.getCurrentTurn();

        if (isMoveToStartingSquare === true) {
            if (this.dragOriginField === null) return;
            // block
            console.log('www snap1');

            this.snapBackPieceToOrigin(pieceId);
            return;
        }
        if (isMoveToWrongColor === true && isCaslingIntent === false) {
            if (this.dragOriginField === null) return;
            // block
            console.log('www snap2');

            this.snapBackPieceToOrigin(pieceId);
            return;
        }

        if ((this.config.applyPieceSpecyficMoveConstraints === true &&
            this.currentPossibleMovesForDraggedPiece.includes(nearestFieldId) === false)) {
            console.log('www currentPossibleMovesForDraggedPiece', this.currentPossibleMovesForDraggedPiece);
            console.log('www Illegal move for piece', pieceId, 'to field', nearestFieldId);
            // block
            this.snapBackPieceToOrigin(pieceId);
            return;
        }

        if (isMoveToEnemySquare === true) {
            let piece = nearestField.getOccupiedBy()!;
            let pieceView = this.boardView.getPieceViewById(piece.getId())!;
            pieceView.visible = false; // later: consider if this is enough or should it be rm from stage completely
            this.boardState.removePieceFromStorage(piece);
        }

        this.movePiece(pieceId, nearestFieldView); // moves piece view to new field and during castling sets correct positon of king
        nearestField.setOccupiedBy(this.findPieceById(pieceId));
        nearestField.getOccupiedBy()!.markMoved();
        console.log('www moive king to final field and chek castling inente, ', isCaslingIntent);

        if (isCaslingIntent === true) {
            // in future play castling gsap animation but for now move rook
            this.moveRookForCastling(nearestFieldView.getId());
        }

        this.gameState.incrementMoveCount();
        this.gameState.setNextTurn();

        this.dragOriginField?.setOccupiedBy(null);

        this.handleInteractivnessOfPiecesOnBoard();
        this.dragOriginField = null;
        isCaslingIntent = false; // make glaobal to reset //todo
    }

    private moveRookForCastling(currentKingFieldViewId: number): void {
        console.log('www moveRookFor Castling');

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
        console.log('www rookDestinationFieldId', rookDestinationFieldId);

        let rook = this.boardState.getFieldById(rookCurrentFieldId).getOccupiedBy();

        let rookDestinationField = this.boardState.getFieldById(rookDestinationFieldId);
        let rookDestinationFieldView = this.boardView.getFieldViewById(rookDestinationFieldId);

        console.log('www rookDestinationField', rookDestinationField,
            'rook', rook,
            'rookDestinationFieldView', rookDestinationFieldView,
            'rookDestinationFieldView.getId()', rookDestinationFieldView.getId()
        );

        this.movePiece(rook?.getId()!, rookDestinationFieldView);
        this.boardState.getFieldById(rookCurrentFieldId).setOccupiedBy(null); // state reflects that rook left its original square
        rookDestinationField.setOccupiedBy(rook); // set state of new destination to have the rook and from previus delete rook
        rookDestinationField.getOccupiedBy()!.markMoved();
       
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