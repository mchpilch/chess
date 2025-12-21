import { BoardState } from "./boardState";
import { Field } from "./field";
import { Piece } from "./piece";

export type MoveResult = {
    quietMoves: number[];
    captures: number[];
};

export type SlidingPiece = 'r' | 'b' | 'q';

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

const QUEEN_DIRECTIONS = [
    ...ROOK_DIRECTIONS,
    ...BISHOP_DIRECTIONS,
];

const SLIDING_DIRECTIONS: Record<SlidingPiece, Direction[]> = {
    r: ROOK_DIRECTIONS,
    b: BISHOP_DIRECTIONS,
    q: QUEEN_DIRECTIONS,
};

export class MoveGenerator {

    private boardState!: BoardState;
    constructor(boardState: BoardState) {
        this.boardState = boardState;
    }

    public calculateMoves(originField: Field): MoveResult {

        const piece = originField.getOccupiedBy();
        if (!piece) {
            return { quietMoves: [], captures: [] };
        }

        const role = piece.getRole();

        if (role === 'r' || role === 'b' || role === 'q') {
            return this.calculatePossibleMovesForSlidingPiece(originField, role);
        }

        if (role === 'n') {
            return this.calculatePossibleMovesForKnight(originField);
        }

        if (role === 'p') {
            return this.calculatePossibleMovesForPawn(originField);
        }

        console.warn(`Move calculation not implemented for role: ${role}`);
        return { quietMoves: [], captures: [] };
    }

    // then

    // let oppositeColorKingsFieldId = this.getOppositeColorKingFieldId();
    // then calc 1 -> possibleCaptures based on possibleCapturesOrCheck and oppositeColorKingsFieldId
    // then calc 2 -> possibleCheck field to highlight based on possibleCapturesOrCheck and oppositeColorKingsFieldId
    // this.boardView.highlightFields(possibleQuietMoves, possibleCaptures, possibleCheck);

    // this.boardView.highlightFields(possibleQuietMoves, possibleCapturesOrCheck);

    private calculatePossibleMovesForSlidingPiece(originField: Field, pieceType: SlidingPiece): MoveResult {

        const originID = originField.getId();

        if (originID === null) return { quietMoves: [], captures: [] };

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


                const field = this.boardState.getFieldById(id);
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
        return { quietMoves: possibleQuietMoves, captures: possibleCapturesOrCheck };
    }

    private calculatePossibleMovesForKnight(originField: Field): MoveResult {

        const originID = originField.getId();

        let knightOffsets = [-17, -15, -10, -6, 6, 10, 15, 17];
        let possibleMovesPreBoundriesCheck = knightOffsets.map(offset => originID + offset);
        let possibleMovesPreWrappingCheck = possibleMovesPreBoundriesCheck.filter(id => id >= 0 && id < 64);
        const checkWrapping = (id: number) => {

            let originRow = this.boardState.getRowById(originID);
            let originFile = this.boardState.getFileById(originID);

            let currentIdsRow = this.boardState.getRowById(id);
            let currentIdsFile = this.boardState.getFileById(id);

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
            const field = this.boardState.getFieldById(fieldID);
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
        return { quietMoves: possibleQuietMoves, captures: possibleCapturesOrCheck };
    }

    private calculatePossibleMovesForPawn(originField: Field): MoveResult {

        const originID = originField.getId();
        const pawn = originField.getOccupiedBy()!;
        const color = pawn.getColor();

        const possibleQuietMoves = this.calculatePossibleQuietMovesForPawn(originID, pawn, color);
        const possibleCapturesOrCheck = this.calculatePossibleCapturesOrCheksForPawn(originID, color);

        return {
            quietMoves: possibleQuietMoves,
            captures: possibleCapturesOrCheck,
        };
    }

    private calculatePossibleQuietMovesForPawn(originID: number, pawn: Piece, color: 'w' | 'b') {

        const possibleQuietMoves: number[] = [];

        const direction = color === 'w' ? 8 : -8;

        const oneStep = originID + direction;
        if (oneStep >= 0 && oneStep < 64) {
            if (this.boardState.getFieldById(oneStep).getOccupiedBy() === null) {
                possibleQuietMoves.push(oneStep);

                // double move (only if first move & path is clear)
                const twoStep = originID + direction * 2;
                if (
                    pawn.getHasMoved() === false &&
                    this.boardState.getFieldById(twoStep).getOccupiedBy() === null
                ) {
                    possibleQuietMoves.push(twoStep);
                }
            }
        }
        return possibleQuietMoves;
    }
    private calculatePossibleCapturesOrCheksForPawn(originID: number, color: 'w' | 'b') {

        const possibleCapturesOrCheck: number[] = [];

        const captureOffsets =
            color === 'w' ? [7, 9] : [-7, -9];

        for (const offset of captureOffsets) {
            const targetID = originID + offset;
            if (targetID < 0 || targetID > 63) continue; // beyond bounds - pass offset

            const originFile = this.boardState.getFileById(originID);
            const targetFile = this.boardState.getFileById(targetID);

            // prevent horizontal wrapping
            if (Math.abs(targetFile - originFile) !== 1) continue;

            const targetField = this.boardState.getFieldById(targetID);
            const targetPiece = targetField.getOccupiedBy();

            // regular capture
            if (targetPiece !== null && targetPiece.getColor() !== color) {
                possibleCapturesOrCheck.push(targetID);
            }

            // todo en passant
        }
        return possibleCapturesOrCheck;
    }
}
