import { Piece } from "./piece";
import { Bishop } from "./Pieces/bishop";
import { King } from "./Pieces/king";
import { Knight } from "./Pieces/knight";
import { Pawn } from "./Pieces/pawn";
import { Queen } from "./Pieces/queen";
import { Rook } from "./Pieces/rook";

export type Square = (Piece | null);
export type Board = Square[][];

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


        // for (let i = 0; i < 8; i++) {
        //     const row = [];
        //     for (let j = 0; j < 8; j++) {
        //         row.push(new Pawn('w'));
        //     }
        //     this.board.push(row);
        // }

        // this.board[0] = [
        //     new Pawn('b'),
        //     new Pawn('b'),
        //     null,
        //     new Pawn('b'),
        //     new Pawn('b'),
        //     new Pawn('b'),
        //     new Pawn('b'),
        //     new Pawn('b')
        // ];

        console.log("xxx  getBoard")
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
        // public parseBoard(notation: string): void {
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

        console.log('xxxx notation.length', notation.length)
        while (n < notation.length) {

            iterations++;
            if (iterations > maxIterations) {
                console.warn("Breaking loop: too many iterations!");
                break;
            }

            if (notation[n] === '/') { // new row
                console.log('xxxx / on index', n)
                n++;
                rowIndex++;
                colIndex = 0;
                continue;
            }

            if (isNaN(Number(notation[n])) === false) { // so it is a number then
                console.log('xxxx number ', Number(notation[n]), ' on index', n)

                colIndex += Number(notation[n]);
                n++;
                continue;
            }
            console.log('xxx n', n)

            switch (notation[n]) {
                case 'r':
                    board[rowIndex][colIndex] = new Rook('b');
                    break;

                case 'n':
                    board[rowIndex][colIndex] = new Knight('b');
                    break;

                case 'b':
                    board[rowIndex][colIndex] = new Bishop('b');
                    break;

                case 'q':
                    board[rowIndex][colIndex] = new Queen('b');
                    break;

                case 'k':
                    board[rowIndex][colIndex] = new King('b');
                    break;

                case 'p':
                    board[rowIndex][colIndex] = new Pawn('b');
                    break;

                case 'R':
                    board[rowIndex][colIndex] = new Rook('w');
                    break;

                case 'N':
                    board[rowIndex][colIndex] = new Knight('w');
                    break;

                case 'B':
                    board[rowIndex][colIndex] = new Bishop('w');
                    break;

                case 'Q':
                    board[rowIndex][colIndex] = new Queen('w');
                    break;

                case 'K':
                    board[rowIndex][colIndex] = new King('w');
                    break;

                case 'P':
                    board[rowIndex][colIndex] = new Pawn('w');
                    break;

                default:
                    // handle other FEN characters here (digits, '/', etc.)
                    break;
            }

            console.log('piece on index', n)
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



