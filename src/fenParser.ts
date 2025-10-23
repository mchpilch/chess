import { Piece } from "./piece";
import { Pawn } from "./Pieces/pawn";

export type Board = Piece[][];
export class FenParser {

    //The sequence "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" 
    // describes the piece placement field of the starting position of a game of chess.
    private board!: Board;
    private activeColor!: 'w' | 'b';
    private castlingRights!: { K: true, Q: true, k: true, q: true }; // todo
    private enPassant!: string | null; // todo
    private halfMoveClock!: number; // todo
    private fullMoveNumber!: number; // todo

    constructor(fenPosition: string) {

        this.parse(fenPosition);
    }

    // public getBoard(): Board { // this was buggy - the same object refference filled the whole board -> only one pawn was on screen

    //     this.board = new Array(8).fill(new Array(8).fill(new Pawn('w')));
    //     return this.board;
    // }

    public getBoard(): Board {
        this.board = [];

        for (let i = 0; i < 8; i++) {
            const row = [];
            for (let j = 0; j < 8; j++) {
                row.push(new Pawn('w')); // or whatever logic your FEN parser uses
            }
            this.board.push(row);
        }

        this.board[0] = [
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b'),
            new Pawn('b')
        ];
        return this.board;
    }


    private parse(fenPosition: string) {

        const parts = fenPosition.split(' ')

        console.log('xxx parts', parts);
        if (parts.length !== 6) {
            throw new Error('Invalid FEN string - wrong number of segments');
        }

        // this.board = this.parseBoard(parts[0]);
        this.activeColor = this.parseActiveColor(parts[1]);
        // this.castlingRights = this.parseCastlingRights(parts[2]);
        // this.enPassant = this.parseEnPassant(parts[3]);
        // this.halfMoveClock = this.parseHalfMoveClock(parts[4]);
        // this.fullMoveNumber = this.parseFullMoveNumber(parts[5]);
    }

    private parseActiveColor(fenActiveColor: string): 'w' | 'b' {
        return fenActiveColor === 'w' ? 'w' : 'b';
    }
}
