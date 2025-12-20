import { Container, ContainerChild, Graphics, Text, TextStyle } from "pixi.js";
import { boardConfig } from "./boardConfig";
import { PieceView } from "./pieceView";
import { Field } from "./field";
import { Listener } from "./listener";
import { GameState } from "./gameState";
import { FieldView } from "./fieldView";
import { Piece } from "./domain/piece";

type SlidingPiece = 'r' | 'b' | 'q';

type Direction = {
    name: string;
    offset: number;
};

const ROOK_DIRECTIONS: Direction[] = [
    { name: 'west', offset: -1 },
    { name: 'east', offset: +1 },
    { name: 'north', offset: +8 },
    { name: 'south', offset: -8 },
];

const BISHOP_DIRECTIONS: Direction[] = [
    { name: 'northWest', offset: +7 },
    { name: 'northEast', offset: +9 },
    { name: 'southWest', offset: -9 },
    { name: 'southEast', offset: -7 },
];

const QUEEN_DIRECTIONS: Direction[] = [
    ...ROOK_DIRECTIONS,
    ...BISHOP_DIRECTIONS,
];

const SLIDING_DIRECTIONS: Record<SlidingPiece, Direction[]> = {
    r: ROOK_DIRECTIONS,
    b: BISHOP_DIRECTIONS,
    q: QUEEN_DIRECTIONS,
};


export class Board {

    private board!: Container;

    private fields!: Field[][]; // logical
    private fieldViews!: FieldView[][]; // pixi rendering // later move to boardView 
    private pieceViews = new Map<number, PieceView>(); // pixi rendering // later move to boardView 

    private config = boardConfig;
    private gameState !: GameState;
    private dragOriginField: Field | null = null;
    private dragOriginFieldView: FieldView | null = null;

    constructor() {

        this.fields = [];
        this.fieldViews = [];
        this.board = this.generateBoard();
        this.gameState = GameState.getInstance();
        this.dragOriginField = null;
        this.dragOriginFieldView = null;
    }

    private generateBoard(): Container {

        const boardContainer = new Container;

        for (let r = 0; r < this.config.numberOfRows; r++) {

            let rowLogical = [];
            let rowView = [];
            for (let f = 0; f < this.config.numberOfFiles; f++) {
             
                const id = this.config.numberOfRows * (this.config.numberOfRows - r - 1) + f; // improved id calc so a1 corresponds to 0 a2 to 1 and so on
                const notation = `${String.fromCharCode(97 + f)}${this.config.numberOfRows - r}`; // a1..h8 // 97 is a lowercase "a" // files got letters while rows have numbers
                const occupiedBy: PieceView | null = null;

                const field = new Field(
                    id,
                    notation,
                    occupiedBy,
                );

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

                const color = (r + f) % 2 === 0 ? this.config.colorDark : this.config.colorLight;
                fieldView.draw(color);

                rowLogical.push(field);
                rowView.push(fieldView);

                boardContainer.addChild(fieldView.getContainer());
            }
            this.fields.push(rowLogical);
            this.fieldViews.push(rowView);
        }
        return boardContainer;
    };

    public getBoard(): Container { return this.board; }

    public attachListenersToPieces() {

        // Attach listeners to all pieces
        for (const row of this.fields) {
            for (const field of row) {

                let piece = field.getOccupiedBy();
                if (piece === null) continue;
                let pieceId = piece.getId();

                let pieceView = this.getPieceViewById(pieceId);

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

        const originField = this.getFieldById(originFieldId);
        const originFieldView = this.getFieldViewById(originFieldId);

        this.dragOriginField = originField;
        this.dragOriginFieldView = originFieldView;

        this.calculatePossibleMoves(pieceId, originField);
    }

    private handlePieceDrop({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {

        const nearestFieldId = this.findNearestFieldId(x, y);

        if (nearestFieldId === null) {

            this.dragOriginField = null;
            this.dragOriginFieldView = null;
            return;
        }

        const nearestField = this.getFieldById(nearestFieldId)
        const nearestFieldView = this.getFieldViewById(nearestFieldId)

        this.turnOffHighlights();

        let isMoveToStartingSquare = nearestField.getOccupiedBy()?.getId() === pieceId;
        let isMoveToWrongColor = nearestField.getOccupiedBy() !== null && nearestField.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn();
        let isMoveToEmptySquare = nearestField.getOccupiedBy() === null;
        let isMoveToEnemySquare = nearestField.getOccupiedBy() !== null && nearestField.getOccupiedBy()?.getColor() !== this.gameState.getCurrentTurn();

        if (isMoveToStartingSquare === true || isMoveToWrongColor === true) {
            if (this.dragOriginField === null) return;
            this.movePiece(pieceId, this.dragOriginFieldView!); // "!"
            this.dragOriginField = null;
            return;
        }

        if (isMoveToEmptySquare === true) {
            this.movePiece(pieceId, nearestFieldView);
            nearestField.setOccupiedBy(this.findPieceById(pieceId));
        }

        if (isMoveToEnemySquare === true) { // here more rules will be added
            let piece = nearestField.getOccupiedBy()!;
            let pieceView = this.getPieceViewById(piece.getId())!;
            pieceView.visible = false; // later: consider if this is enough or should it be rm from stage completely

            this.movePiece(pieceId, nearestFieldView);
            nearestField.setOccupiedBy(this.findPieceById(pieceId));
        }

        this.gameState.incrementMoveCount();
        this.gameState.setNextTurn();


        this.dragOriginField?.setOccupiedBy(null);

        this.handleInteractivnessOfPiecesOnBoard();
        this.dragOriginField = null;
    }

    private findNearestFieldId(px: number, py: number): number | null {
        let nearest: FieldView | null = null;
        let shortest = Infinity;
        for (const row of this.fieldViews) {
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

    private findPieceById(id: number): Piece | null { // ???
        for (const row of this.fields) {
            for (const field of row) {
                const piece = field.getOccupiedBy();
                if (piece && piece.getId() === id) return piece;
            }
        }
        return null;
    }

    private calculatePossibleMoves(pieceId: number, originField: Field): void {

        let piece = this.findPieceById(pieceId);

        const role = piece!.getRole(); // ! 

        let tempPossibleMovesAsNotation: string[] = [];

        if (role === 'r' || role === 'b' || role === 'q') {
            tempPossibleMovesAsNotation = this.calculatePossibleMovesForSlidingPiece(originField, role);
        } else {

            switch (piece?.getRole()) {
                case 'n':
                    tempPossibleMovesAsNotation = this.calculatePossibleMovesForKnight(originField);
                    break;
                // case 'k':
                // this.possibleMoves = this.calculatePossibleMovesForKing(pieceId, originField);
                // break;
                // case 'p':
                //     this.possibleMoves = this.calculatePossibleMovesForPawn(pieceId, originField);
                //     break;
                default:
                    tempPossibleMovesAsNotation = [];
            }
        }
    }

    private calculatePossibleMovesForSlidingPiece(originField: Field, pieceType: SlidingPiece): string[] { // decided to not include king as it behaves differently then other pieces in terms of checks

        const originID = originField.getId();

        if (originID === null) return [];

        const originColor = originField.getOccupiedBy()!.getColor();

        const possibleQuietMoves: number[] = []; // quiet move -> a move that does not capture a piece or deliver a check
        const possibleCapturesOrCheck: number[] = [];

        const collectMovesInDirection = (startID: number, offset: number) => {
            let id = startID;

            while (true) {
                id += offset;

                // Stop if outside board
                if (id < 0 || id > 63) break;

                // horizontal boundaries check
                if (offset === -1 && id % 8 === 7) break;   // west wrap
                if (offset === +1 && id % 8 === 0) break;   // east wrap

                // NW (+7) and SW (-9) - moving left - wrap when file = 7
                if ((offset === 7 || offset === -9) && id % 8 === 7) { // If  moving left (file - 1), the only way to land on file 7 is if  jumped across the board - illegal so break

                    break;
                }

                // NE (+9) and SE (-7) - moving right - wrap when file = 0
                if ((offset === 9 || offset === -7) && id % 8 === 0) break;


                const field = this.getFieldById(id);
                const piece: Piece | null = field.getOccupiedBy();

                if (piece !== null) {
                    // Blocked by own piece
                    if (piece.getColor() === originColor) {
                        break;
                    } else {
                        possibleCapturesOrCheck.push(id);
                        break;
                    }
                }

                if (piece === null) {
                    possibleQuietMoves.push(id);
                    continue;
                }

                // Enemy piece - capture possible, but path ends
                possibleCapturesOrCheck.push(id);
                break;
            }
        };

        for (const direction of SLIDING_DIRECTIONS[pieceType]) {
            collectMovesInDirection(originID, direction.offset);
        }

        this.highlightFields(possibleQuietMoves, possibleCapturesOrCheck);
        return possibleQuietMoves.map(String);
    }
    private calculatePossibleMovesForKnight(originField: Field): string[] {

        const originID = originField.getId();

        let knightOffsets = [-17, -15, -10, -6, 6, 10, 15, 17];
        let possibleMovesPreBoundriesCheck = knightOffsets.map(offset => originID + offset);
        let possibleMovesPreWrappingCheck = possibleMovesPreBoundriesCheck.filter(id => id >= 0 && id < 64);
        const checkWrapping = (id: number) => {

            let originRow = this.getRowById(originID);
            let originFile = this.getFileById(originID);

            let currentIdsRow = this.getRowById(id);
            let currentIdsFile = this.getFileById(id);

            const rowDiff = Math.abs(currentIdsRow - originRow);
            const fileDiff = Math.abs(currentIdsFile - originFile);

            return (
                (rowDiff === 2 && fileDiff === 1) ||
                (rowDiff === 1 && fileDiff === 2)
            );
        }
        let possibleMoves = possibleMovesPreWrappingCheck.filter(checkWrapping);

        const originColor = originField.getOccupiedBy()!.getColor();

        const possibleQuietMoves: number[] = []; // quiet move -> a move that does not capture a piece or deliver a check
        const possibleCapturesOrCheck: number[] = [];

        for (let fieldID of possibleMoves) {
            const field = this.getFieldById(fieldID);
            const piece: Piece | null = field.getOccupiedBy();
            if (piece !== null) {
                // Blocked by own piece
                if (piece.getColor() === originColor) {
                    continue;
                } else {
                    possibleCapturesOrCheck.push(fieldID);
                    continue;
                }
            } else {
                possibleQuietMoves.push(fieldID)
            }
        }


        this.highlightFields(possibleQuietMoves, possibleCapturesOrCheck);
        return possibleQuietMoves.map(String);
    }

    private highlightFields(possibleQuietMoves: number[], possibleCaptures: number[]): void {

        const fillFieldWithColor = (fieldView: FieldView, color: string) => {

            fieldView.draw(color);
        }

        for (let row of this.fieldViews) {

            for (let fieldView of row) {

                if (possibleQuietMoves.includes(fieldView.getId())) {

                    fillFieldWithColor(fieldView, this.config.possibleMoveColorHighlight);
                }

                let id = fieldView.getId();
                let field = this.getFieldById(id);

                if (possibleCaptures.includes(fieldView.getId())) {

                    if (field.getOccupiedBy()?.getRole() === 'k') {

                        fillFieldWithColor(fieldView, this.config.possibleCheckColorHighlight);
                    } else {

                        fillFieldWithColor(fieldView, this.config.captureColorHighlight);
                    }

                }

            }
        }
    }

    private turnOffHighlights(): void {

        this.fieldViews.forEach((row, rowIndex) => {
            row.forEach((fieldView, colIndex) => {

                const color = (rowIndex + colIndex) % 2 === 0 ? this.config.colorDark : this.config.colorLight;
                fieldView.draw(color);
            });
        });
    }

    private movePiece(pieceId: number, destination: FieldView): void { // set dragged piece in new position
        // Move the actual piece
        const pieceView = this.getPieceViewById(pieceId);

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

                const pieceView = this.getPieceViewById(piece.getId())!; // "!"

                if (this.gameState.getCurrentTurn() === piece.getColor()) {

                    pieceView.eventMode = 'dynamic';
                } else {
                    pieceView.eventMode = 'none';
                }

            }
        }
    }

    public getFields(): Field[][] { return this.fields; }

    public getFieldViews(): FieldView[][] { return this.fieldViews; }

    private getFieldById(id: number): Field {

        return this.fields[7 - Math.floor(id / 8)][id % 8];
    }

    private getFieldViewById(id: number): FieldView {

        return this.fieldViews[7 - Math.floor(id / 8)][id % 8];
    }

    private getRowById(id: number): number {

        return (Math.floor(id / 8))
    }

    private getFileById(id: number): number {

        return (id % 8)
    }

    public addPieceView(pieceView: PieceView) {

        this.pieceViews.set(pieceView.getId(), pieceView);
    }

    private getPieceViewById(id: number): PieceView | undefined {

        return this.pieceViews.get(id);
    }



}