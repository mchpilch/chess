

import { Application } from 'pixi.js';
import { Pawn } from './Pieces/pawn';
import { Queen } from './Pieces/queen';
import { Knight } from './Pieces/knight';
import { FenParser } from './fenParser';
import { Rook } from './Pieces/rook';


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
        this.tempParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

        // setup managers
        this.app = gameInitData.app;

        console.log('this.app', this.app);

        const rook = new Rook("b");
        rook.position.set(1600, 500);

        const queen = new Queen("w");
        queen.position.set(1800, 500);


        // this.app.stage.addChild(pawnB, pawnW, kk, queenB, queenWW);
        this.app.stage.addChild(rook);
        this.app.stage.addChild(queen);

        const fenParser1 = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        let board = fenParser1.getBoard();
        console.log(board);
        const offsetX = 1250;
        const offsetY = 750;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {

                board[i][j].position.set( offsetX + j * 150, offsetY + i * 150);
                // console.log(`adding board[${i}][${j}]`, board[i][j]);
                this.app.stage.addChild(board[i][j]);
            }
        }
        // const fenParser2 = new FenParser('4k2r/6r1/8/8/8/8/3R4/R3K3 w Qk - 0 1');
    }
}


