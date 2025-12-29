

import { Application } from 'pixi.js';
import { FenParser } from '../domain/fenParser';
import { BoardController } from '../controllers/boardController';
import { GameState } from '../domain/gameState';
import { boardConfig } from "../configs/boardConfig";
import { PieceFactory } from '../factories/pieceFactory';
import { BoardView } from '../views/boardView';
type GameInitData = {
    app: Application,
};

export class Game {

    private static instance: Game;
    private initialized!: boolean;

    private app!: Application;
    // private fenParser!: FenParser;
    private boardController!: BoardController;
    private boardView!: BoardView;
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

        // const fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        // const fenParser = new FenParser('r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 w KQkq - 0 1');
        // const fenParser = new FenParser('4k2r/6r1/8/8/8/8/3R4/R3K3 w Qk - 0 1');
        //  const fenParser = new FenParser('r7/8/8/R7/8/8/8/8 w KQkq i3 0 1'); // only rook
        //  const fenParser = new FenParser('rnbqkbnr/8/8/8/8/8/8/RNBQKBNR w KQkq i3 0 1'); // starting pos
        //  const fenParser = new FenParser('rQQQQQQQr/Qnbqkbnr/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ/QQQQQQQQ w - - 0 1'); // starting pos
//    const fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq i3 0 1'); // starting pos
        // const fenParser = new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1N1QKBNR w Kkq i3 0 1'); // testing
        // const fenParser = new FenParser('8/n/n7/4n3/8/3N4/4N3/8 w KQkq i3 0 1'); // Knights testing
        // const fenParser = new FenParser('4k3/8/8/8/8/8/4K3/8 w KQkq i3 0 1'); // Kings
        const fenParser = new FenParser('rnb1kbnr/pppp1ppp/8/1B2p3/4P2q/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3'); // check
        const fenBoard = fenParser.getFenBoard();
        const piecefactory = new PieceFactory();

        this.boardView = new BoardView();
        this.boardController = new BoardController(this.boardView);

        this.app.stage.interactive = true;
        this.app.stage.addChild(this.boardView.getBoard());
        const offsetX = boardConfig.offset.x;
        const offsetY = boardConfig.offset.y;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {

                const fenSquare = fenBoard[i][j];
                if (fenSquare !== null) {

                    const { piece, view: pieceView } = piecefactory.create(fenSquare.role, fenSquare.color);
                    this.boardController.putPieceIntoStorage(piece, fenSquare.color);

                    pieceView.position.set(
                        offsetX + j * boardConfig.squareWidth + boardConfig.squareWidth / 2,
                        offsetY + i * boardConfig.squareWidth + boardConfig.squareWidth / 2
                    );

                    this.boardController.getBoardState().getFields()[i][j].setOccupiedBy(piece);
                    this.boardView.addPieceView(pieceView); //should be boardView?

                    this.app.stage.addChild(pieceView);
                }
            }
        }

        this.boardController.attachListenersToPieces();

    }
}
