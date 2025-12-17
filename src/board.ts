import { Container, ContainerChild, Graphics, Text, TextStyle } from "pixi.js";
import { boardConfig } from "./boardConfig";
import { Piece } from "./piece";
import { Field } from "./field";
import { Listener } from "./listener";
import { GameState } from "./gameState";
import { FieldView } from "./fieldView";

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
    private fieldViews!: FieldView[][]; // pixi rendering

    private config = boardConfig;
    private gameState !: GameState;
    private dragOriginField: Field | null = null;

    constructor() {

        this.fields = [];
        this.fieldViews = [];
        this.board = this.generateBoard();
        this.gameState = GameState.getInstance();
        this.dragOriginField = null;
    }

    private generateBoard(): Container {

        const boardContainer = new Container;

        for (let r = 0; r < this.config.numberOfRows; r++) {

            let rowLogical = [];
            let rowView = [];
            for (let f = 0; f < this.config.numberOfFiles; f++) {
                // for field and fieldView
                const id = this.config.numberOfRows * (this.config.numberOfRows - r - 1) + f; // improved id calc so a1 corresponds to 0 a2 to 1 and so on
                // for field 
                const notation = `${String.fromCharCode(97 + f)}${this.config.numberOfRows - r}`; // a1..h8 // 97 is a lowercase "a" // files got letters while rows have numbers
                const occupiedBy: Piece | null = null;

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

                console.log('xxx field', field);

                piece.onDragStarted.add(
                    new Listener<{ pieceId: number; x: number; y: number }>(
                        payload => this.handlePieceDragStarted(payload)
                    )
                );

                piece.onDropped.add(
                    new Listener<{ pieceId: number; x: number; y: number }>(
                        payload => this.handlePieceDrop(payload)
                    )
                );
            }
        }

    }

    public getPiecesFromFields(): (Piece | null)[][] {
        const pieceBoard: (Piece | null)[][] = [];

        for (const row of this.fields) {
            const pieceRow: (Piece | null)[] = [];
            for (const field of row) {
                pieceRow.push(field.getOccupiedBy());
            }
            pieceBoard.push(pieceRow);
        }
        return pieceBoard;
    }

    private handlePieceDragStarted({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {
        console.log(`handlePieceDragStarted id  ${pieceId}  x ${x} y ${y}`);

        const originField = this.findNearestField(x, y);
        this.dragOriginField = originField;
        console.log(`handlePieceDragStarted originField ${originField?.getNotation()}`);
        if (originField === null) {
            console.log('originField is null');
            return;
        }
        this.calculatePossibleMoves(pieceId, originField);
        // then show possible moves;
    }

    private handlePieceDrop({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {

        const nearest = this.findNearestField(x, y);
        this.turnOffHighlights();
        if (!nearest) {
            this.dragOriginField = null;
            return;
        };
        // console.log(`xxxxx Piece with id ${pieceId} snaps to field ${nearest.getNotation()}`);
        // console.log(`xxxxx nearest.getOccupiedBy()?.getColor() ${nearest.getOccupiedBy()?.getColor()}`);
        // console.log(`xxxxx this.gameState.getCurrentTurn() ${this.gameState.getCurrentTurn()}`);
        // console.log(`xxxxx nearest.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn() ${nearest.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn()}`);

        let isMoveToStartingSquare = nearest.getOccupiedBy()?.getId() === pieceId;
        let isMoveToWrongColor = nearest.getOccupiedBy() !== null && nearest.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn();
        let isMoveToEmptySquare = nearest.getOccupiedBy() === null;
        let isMoveToEnemySquare = nearest.getOccupiedBy() !== null && nearest.getOccupiedBy()?.getColor() !== this.gameState.getCurrentTurn();

        if (isMoveToStartingSquare === true || isMoveToWrongColor === true) {
            if (this.dragOriginField === null) return;
            this.movePiece(pieceId, this.dragOriginField);
            this.dragOriginField = null;
            return;
        }

        if (isMoveToEmptySquare === true) {
            this.movePiece(pieceId, nearest);
            nearest.setOccupiedBy(this.findPieceById(pieceId));
        }

        if (isMoveToEnemySquare === true) { // here more rules will be added
            nearest.getOccupiedBy()!.visible = false; // later: consider if this is enough or should it be rm from stage completely
            this.movePiece(pieceId, nearest);
            nearest.setOccupiedBy(this.findPieceById(pieceId));
        }

        this.gameState.incrementMoveCount();
        this.gameState.setNextTurn();


        this.dragOriginField?.setOccupiedBy(null);

        this.handleInteractivnessOfPiecesOnBoard();
        this.dragOriginField = null;

        // console.log('xxx this.gameState.getCurrentTurn()', this.gameState.getCurrentTurn());
        // console.log('xxx this.gameState.getMoveCount()', this.gameState.getMoveCount());
    }

    private findNearestField(px: number, py: number): FieldView | null {
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

        return nearest;
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

    private calculatePossibleMoves(pieceId: number, originField: Field): void {
        let piece = this.findPieceById(pieceId);

        console.log('xxx piece', piece?.getRole(), piece?.getColor());
        console.log('xxx originField', originField?.getNotation(), originField?.getId());

        const role = piece!.getRole(); // ! 
        console.log('xxx role', role);
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
        console.log('xxx calculatePossibleMovesForSlidingPiece', originField, pieceType);

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
                    console.log('xxx id', id);
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

        console.log('xxx calculatePossibleMovesForKnight', originField);

        if (originID === null) return [];
        let knightOffsets = [-17, -15, -10, -6, 6, 10, 15, 17];
        let possibleMovesPreBoundriesCheck = knightOffsets.map(offset => originID + offset);
        let possibleMoves = possibleMovesPreBoundriesCheck.filter(id => id >= 0 && id < 64);


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

        console.log('xxxxxxx possibleQuietMoves', possibleQuietMoves);
        console.log('xxxxxxx possibleCaptures', possibleCaptures);
        const fillFieldWithColor = (field: Field, color: string) => {
            let { x, y } = field.getPosition();
            // console.log('xxx field', field.getNotation());
            field.getGraphics().clear();
            field.getGraphics().rect(x, y, this.config.squareWidth, this.config.squareWidth).fill(color);
        }

        for (let row of this.fields) {
            for (let field of row) {

                if (possibleQuietMoves.includes(field.getId())) {

                    fillFieldWithColor(field, this.config.possibleMoveColorHighlight);
                }

                if (possibleCaptures.includes(field.getId())) {
                    console.log('xxx field.getOccupiedBy()?.getRole()', field.getOccupiedBy()?.getRole());
                    if (field.getOccupiedBy()?.getRole() === 'king') {
                        console.log('xxx check at field.getOccupiedBy()', field.getOccupiedBy());
                        fillFieldWithColor(field, this.config.possibleCheckColorHighlight);
                    } else {
                        console.log('xxx capture at field.getOccupiedBy()', field.getOccupiedBy());
                        fillFieldWithColor(field, this.config.captureColorHighlight);
                    }

                }

            }
        }
    }

    private turnOffHighlights(): void {

        this.fields.forEach((row, rowIndex) => {
            row.forEach((field, colIndex) => {

                const { x, y } = field.getPosition();
                // console.log("row:", rowIndex, "col:", colIndex, field.getNotation());
                const color = (rowIndex + colIndex) % 2 === 0 ? this.config.colorDark : this.config.colorLight;
                field.getGraphics().clear();
                field.getGraphics()
                    .rect(x, y, this.config.squareWidth, this.config.squareWidth)
                    .fill(color);
            });
        });
    }

    private movePiece(pieceId: number, destination: Field): void { // set dragged piece in new position
        // Move the actual piece
        const piece = this.findPieceById(pieceId);
        if (piece) {
            piece.position.set(
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

                if (this.gameState.getCurrentTurn() === piece.getColor()) {
                    piece.eventMode = 'dynamic';
                } else {
                    piece.eventMode = 'none';
                }

            }
        }
    }

    public getFields(): Field[][] { return this.fields; }

    private getFieldById(id: number): Field {

        return this.fields[7 - Math.floor(id / 8)][id % 8];
    }

}