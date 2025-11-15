

import { Application } from 'pixi.js';
import { FenParser } from './fenParser';
import { Board } from './board';

type GameInitData = {
    app: Application,
};

export class Game {

    private static instance: Game;
    private initialized!: boolean;

    private app!: Application;
    private fenParser!: FenParser;
    private gameBoard!: Board;

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
        // this.fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        // this.fenParser = new FenParser('r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w KQkq - 0 1');
        // this.fenParser = new FenParser('4k2r/6r1/8/8/8/8/3R4/R3K3 w Qk - 0 1');
        // this.fenParser = new FenParser('r7/8/8/8/8/8/8/8 w KQkq i3 0 1'); // only rook
        this.fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq i3 0 1'); // starting pos
        
        // setup managers
        this.app = gameInitData.app;

        console.log('this.app', this.app);

        this.gameBoard = new Board();
        this.app.stage.interactive = true;

        let pieceBoard = this.fenParser.getBoard();
        console.log('pieceBoard', pieceBoard);
        this.gameBoard.setPieceBoard(pieceBoard);
        this.app.stage.addChild(this.gameBoard.getBoard());

        const offsetX = 1250;
        const offsetY = 750;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {

                if (pieceBoard[i][j] !== null) {
                    pieceBoard[i][j]!.position.set(offsetX + j * 300 + 150, offsetY + i * 300 + 150);
                    this.gameBoard.getFields()[i][j].setOccupiedBy((pieceBoard[i][j]));
                    this.app.stage.addChild(pieceBoard[i][j]!);
                }

            }
        }

        // gameBoard.updateOccupationOfFieds();
    }
}


// this.app.stage.on('pointermove', e => {
//     const pos = e.global;
//     const boardLocal = this.gameBoard.getBoard().toLocal(pos);
//     // console.log('pppp board-local:', boardLocal.x, boardLocal.y);
// });