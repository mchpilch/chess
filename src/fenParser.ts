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
                row.push(new Pawn('w'));
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

    // private parseBoard(notation: string): Board {
    // // public parseBoard(notation: string): void {

    //     this.board = [];

    //     for (let i = 0; i < 8; i++) {
    //         const row = [];
    //         for (let j = 0; j < 8; j++) {
    //             row.push(new Pawn('w'));
    //         }
    //         this.board.push(row);
    //     }

    //     let i = 0;
    //     while (i < notation.length) {
    //         if (notation[i] === '/') {
    //             i++;
    //             continue;
    //         }
    //         if (isNaN(Number(notation[i])) === false) { // so it is a number then
    //             i+= Number(notation[i]);
    //         }
            
    //     }

    // }
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



