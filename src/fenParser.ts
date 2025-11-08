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

    // public getBoard(): Board { // this was buggy - the same object refference filled the whole board -> only one pawn was on screen

    //     this.board = new Array(8).fill(new Array(8).fill(new Pawn('w')));
    //     return this.board;
    // }

    public getBoard(): Board {

        return this.board;
    }


    private parse(fenPosition: string) {

        const parts = fenPosition.split(' ')

        console.log('xxxx parts', parts);
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
        console.log("xxxx  parseBoard")
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

        let maxIterations = 1000; // safety limit
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


// https://www.typescriptlang.org/play/?#code/GYVwdgxgLglg9mABABwIYCcDOBTAQnDAEwAow4pVYEAuRTKdGMAcwEpaA3OGQxAbwBQiYYgA22KIhiIAvIgAMAbgFCR4yQFtUADwCSUbOkrwwmWYgCM864sQB6O3VTAJATzEwNMKKuHqpBkZUpuZKKiKIEAiYcOIAdKJwzMQA5NrpiGQUwQnYLFAAFikANJnkxgi5+QWsvogA7gUw4ojE0gA8ZdkmVcyFrPzhESLehhWmANQTysMjwK2jQSZmAHyIWnqB45gDgrOzUaax2HH1GGDEAES46NioANZMzGJwcMi0UK-rqGDui9sAQkurBm+wiACNbg9QbMAL5DWYweakcrBADaMAAurIZHIUnYUrs6mCYFMYWDIghYGAQNhyRF4cS5q0suMMdjcXjUITBhSRIcYvFEskUqhEAgpGBCNh7pgSlIQUzEWSlcNDtTafSRPCSciYJgAHKoA3EA0gDTgwwo7oIdmsAacxDAVCiHC7eyOGIBKRmMU0i2GRCFPKqiIC44JJKpf2W9DipBMaWy+UwRV84ThoVRlIGJAxwOfeVmgPoa1srH25ShkaICZyYuxsvoitV9OUo5ZkXpbRSFO1VU67UqRkCByIAAq2HoAjQWDwBHQJFFACZuYqVEA// function parseBoard(notation: string): void {
//     let i = 0;

//     let maxIterations = 1000; // safety limit
//     let iterations = 0;

//     console.log('xxx notation.length', notation.length)
//     while (i < notation.length) {

//         iterations++;
//         if (iterations > maxIterations) {
//             console.warn("Breaking loop: too many iterations!");
//             break;
//         }

//         if (notation[i] === '/') {
//             i++;
//             continue;
//         }

//         if (notation[i] === 'a') {
//             console.log('a on indeks', i);
//             i++;
//             continue;
//         }
//         if (isNaN(Number(notation[i])) === false) { // so it is a number then
//             console.log('number on indeks', i);
//             console.log('ten number to', Number(notation[i]));

//             i += Number(notation[i]);

//             console.log('xxx i', i)

//         }
//     }

// }


// // Test // this code while rewaches 2 then skips the next 2 chards from string so it should do this for board so i will introduce index for board and index for while iterator
// parseBoard('a2a');
// SO TWO INDEXES TO DO NEXT PROGRAMING SESSION



// en passant ideas
// rnbqkbnr/ppp1pppp/8/8/4P3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3 - no en passant casue it is only just after the pwan moved two squres
// rnbqkbnr/ppp1pppp/8/3p4/4P3/3P4/PPP2PPP/RNBQKBNR b KQkq - 0 2 - no en passant casue it is only just after the pwan moved two squres
// rnbqkbnr/ppp2ppp/8/3p4/PP1Pp2P/8/2P1PPP1/RNBQKBNR b KQkq d3 0 4
// rnbqkbnr/ppp4p/8/3p1pp1/PP1PpPPP/8/2P1P3/RNBQKBNR b KQkq g3 0 6

// En passant can only be captured on the very next move after the pawn advances two squares. So only one possible, not even two per color. Just one. Good easier to handle.

// // chess.com and lichess are using dom elemts not canvas ? - > https://svelte.dev/
// GITHUB project out of this actually not just repo?