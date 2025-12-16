

import { Application } from 'pixi.js';
import { FenParser } from './fenParser';
import { Board } from './board';
import { GameState } from './gameState';
import { boardConfig } from "./boardConfig";
import { PieceFactory } from './pieceFactory';
type GameInitData = {
    app: Application,
};

export class Game {

    private static instance: Game;
    private initialized!: boolean;

    private app!: Application;
    // private fenParser!: FenParser;
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


        // setup managers
        this.app = gameInitData.app;
        this.gameState = GameState.getInstance();
        // console.log('this.app', this.app);


        // const fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        // const fenParser = new FenParser('r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w KQkq - 0 1');
        const fenParser = new FenParser('4k2r/6r1/8/8/8/8/3R4/R3K3 w Qk - 0 1');
        //  const fenParser = new FenParser('r7/8/8/R7/8/8/8/8 w KQkq i3 0 1'); // only rook
        //  const fenParser = new FenParser('rnbqkbnr/8/8/8/8/8/8/RNBQKBNR w KQkq i3 0 1'); // starting pos
        //  const fenParser = new FenParser('rQQQQQQQr/Qnbqkbnr/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ w - - 0 1'); // starting pos
        // const fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq i3 0 1'); // starting pos
        const fenBoard = fenParser.getFenBoard();
        const piecefactory = new PieceFactory();

        this.board = new Board();
        this.app.stage.interactive = true;
        this.app.stage.addChild(this.board.getBoard()); // adds actual board to scene - the background for the game

        const offsetX = boardConfig.offset.x;
        const offsetY = boardConfig.offset.y;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {

                const fenSquare = fenBoard[i][j];
                if (fenSquare !== null) {

                    const piece = piecefactory.create(fenSquare.role, fenSquare.color);

                    piece.position.set(
                        offsetX + j * boardConfig.squareWidth + boardConfig.squareWidth / 2,
                        offsetY + i * boardConfig.squareWidth + boardConfig.squareWidth / 2
                    );

                    this.board.getFields()[i][j].setOccupiedBy(piece);
                    this.app.stage.addChild(piece);
                }
            }
        }

        this.board.attachListenersToPieces();
    }
}
