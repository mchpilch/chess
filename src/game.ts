

import { Application } from 'pixi.js';
import { FenParser } from './fenParser';
import { Board } from './board';

//TODO:
// - move piece (drag system and release system - gravity to squre)
// - castling FEN
// - en passant FEN
// - half move clock FEN
// - full move number FEN
// - check and checkmate
// - move validation
// - promotion
// - game over
// - move history
// - undo move
// - restart game
type GameInitData = {
    app: Application,
};

export class Game {

    static instance: Game;
    private initialized!: boolean;

    private app!: Application;
    private tempParser!: FenParser

    private constructor() {
        this.initialized = false;
    }

    public static getInstance(): Game {
        if (!Game.instance) {
            Game.instance = new Game();
        }
        return Game.instance;
    }

    async init(gameInitData: GameInitData) { // gameInitData: GameInitData

        // ensuring init will be called once
        if (this.initialized) {
            console.warn('Game is already initialized. Ignoring duplicate init call.');
            return;
        }
        this.initialized = true;
        // this.tempParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        this.tempParser = new FenParser('r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w KQkq - 0 1');
        // this.tempParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq i3 0 1');

        // setup managers
        this.app = gameInitData.app;

        console.log('this.app', this.app);

        let gameBoard = new Board();
        this.app.stage.addChild(gameBoard.getBoard());

        // const fenParser1 = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        let board = this.tempParser.getBoard();
        console.log(board);
        const offsetX = 1250;
        const offsetY = 750;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {

                if (board[i][j] !== null) {
                    board[i][j]!.position.set(offsetX + j * 300, offsetY + i * 300);
                    // console.log(`adding board[${i}][${j}]`, board[i][j]);
                    this.app.stage.addChild(board[i][j]!);
                }

            }
        }


        // const fenParser2 = new FenParser('4k2r/6r1/8/8/8/8/3R4/R3K3 w Qk - 0 1');
    }
}


