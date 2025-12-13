import { Piece } from "./piece";
import { Bishop } from "./Pieces/bishop";
import { King } from "./Pieces/king";
import { Knight } from "./Pieces/knight";
import { Pawn } from "./Pieces/pawn";
import { Queen } from "./Pieces/queen";
import { Rook } from "./Pieces/rook";

export type Square = (Piece | null);
export type Board = Square[][];
// type PieceKey = 'r' | 'n' | 'b' | 'q' | 'k' | 'p'; // add

export class FenParser {

    //The sequence "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" 
    // describes the piece placement field of the starting position of a game of chess.
    private board!: Board;
    private nextPieceId = 0; // in future consider mechanism that generates unique ids not in fen parser but while instantiating the piece

    private activeColor!: 'w' | 'b';
    private castlingRights!: { K: true, Q: true, k: true, q: true }; // todo
    private enPassant!: string | null; // todo
    private halfMoveClock!: number; // todo
    private fullMoveNumber!: number; // todo

    constructor(fenPosition: string) {

        this.parse(fenPosition);
    }

    public getBoard(): Board {

        return this.board;
    }


    private parse(fenPosition: string) {

        const parts = fenPosition.split(' ')

        // console.log('xxxx parts', parts);
        if (parts.length !== 6) {
            throw new Error('Invalid FEN string - wrong number of segments');
        }

        this.board = this.parseBoard(parts[0]);
        this.activeColor = this.parseActiveColor(parts[1]);
        // this.castlingRights = this.parseCastlingRights(parts[2]);
        // this.enPassant = this.parseEnPassant(parts[3]);
        // this.halfMoveClock = this.parseHalfMoveClock(parts[4]);
        // this.fullMoveNumber = this.parseFullMoveNumber(parts[5]);
    }

    private parseBoard(notation: string): Board {
        let board: Board = [];

        for (let i = 0; i < 8; i++) {
            const row = [];
            for (let j = 0; j < 8; j++) {
                row.push(null);
            }
            board.push(row);
        }

        let n = 0;
        let rowIndex = 0;
        let colIndex = 0;

        let maxIterations = 72; // safety limit // 64 pieces 8 rows
        let iterations = 0;
        // instead of sting test PieceKey type later
        const pieceMap: Record<string, (color: 'w' | 'b') => Piece> = { // Record of (string,function) -> keys - strings (r,n,b...) and values are (color: 'w' | 'b') => Piece (functions that take 'w' or 'b' and return a Piece)
            'r': (color) => new Rook(color, this.nextPieceId++),
            'n': (color) => new Knight(color, this.nextPieceId++),
            'b': (color) => new Bishop(color, this.nextPieceId++),
            'q': (color) => new Queen(color, this.nextPieceId++),
            'k': (color) => new King(color, this.nextPieceId++),
            'p': (color) => new Pawn(color, this.nextPieceId++),
        };

        while (n < notation.length) {

            const char = notation[n];

            iterations++;
            if (iterations > maxIterations) { // just for safety with while loop
                console.warn("Breaking loop: too many iterations!");
                break;
            }

            if (char === '/') { // new row
                n++;
                rowIndex++;
                colIndex = 0;
                continue;
            }

            if (isNaN(Number(char)) === false) { // when char isnumber
                colIndex += Number(char);
                n++;
                continue;
            }

            // Determine piece color
            const color: 'w' | 'b' = char === char.toUpperCase() ? 'w' : 'b';
            const pieceKey = char.toLowerCase();

            // Examples:
            // const whiteRook = pieceMap['r']('w'); // returns a Rook instance with color 'w'
            // const blackPawn = pieceMap['p']('b'); // returns a Pawn instance with color 'b'

            const createPiece = pieceMap[pieceKey];
            if (createPiece) {
                board[rowIndex][colIndex] = createPiece(color);
            } else {
                console.warn(`Unknown piece symbol '${char}'`);
            }

            n++;
            colIndex++;
        }

        return board;
    }


    private parseActiveColor(fenActiveColor: string): 'w' | 'b' {
        return fenActiveColor === 'w' ? 'w' : 'b';
    }
}
