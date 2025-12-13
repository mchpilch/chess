

import { Application } from 'pixi.js';
import { FenParser } from './fenParser';
import { Board } from './board';
import { GameState } from './gameState';
import { boardConfig } from "./boardConfig";
type GameInitData = {
    app: Application,
};

export class Game {

    private static instance: Game;
    private initialized!: boolean;

    private app!: Application;
    private fenParser!: FenParser;
    private board!: Board;
    private gameState!: GameState;
    private boardConfig = boardConfig;

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
        this.gameState = GameState.getInstance();
        this.initialized = true;
        // this.fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        // this.fenParser = new FenParser('r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w KQkq - 0 1');
        // this.fenParser = new FenParser('4k2r/6r1/8/8/8/8/3R4/R3K3 w Qk - 0 1');
        // this.fenParser = new FenParser('r7/8/8/R7/8/8/8/8 w KQkq i3 0 1'); // only rook
        // this.fenParser = new FenParser('rnbqkbnr/8/8/8/8/8/8/RNBQKBNR w KQkq i3 0 1'); // starting pos
        // this.fenParser = new FenParser('rQQQQQQQr/Qnbqkbnr/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ w - - 0 1'); // starting pos
        this.fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq i3 0 1'); // starting pos

        // setup managers
        this.app = gameInitData.app;
        this.gameState = GameState.getInstance();

        // console.log('this.app', this.app);

        this.board = new Board();
        this.app.stage.interactive = true;

        let fenPieceBoard = this.fenParser.getBoard();
        this.board.updateFieldsWithFenParserResult(fenPieceBoard);
        this.app.stage.addChild(this.board.getBoard());

        const offsetX = boardConfig.offset.x;
        const offsetY =  boardConfig.offset.y;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {

                if (fenPieceBoard[i][j] !== null) {
                    fenPieceBoard[i][j]!.position.set(
                        offsetX + j * boardConfig.squareWidth + boardConfig.squareWidth / 2,
                        offsetY + i * boardConfig.squareWidth + boardConfig.squareWidth / 2
                    );
                    this.board.getFields()[i][j].setOccupiedBy((fenPieceBoard[i][j]));
                    this.app.stage.addChild(fenPieceBoard[i][j]!);
                }

            }
        }
    }
}
