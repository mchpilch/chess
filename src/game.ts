

import { Application } from 'pixi.js';
import { Pawn } from './Pieces/pawn';
import { Queen } from './Pieces/queen';
import { Knight } from './Pieces/knight';


type GameInitData = {
    app: Application,
};

export class Game {

    static instance: Game;
    private initialized!: boolean;

    private app!: Application;

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

        // setup managers
        this.app = gameInitData.app;

        console.log('this.app', this.app);

        const pawnB = new Pawn("b");
        pawnB.position.set(250, 500);

        const pawnW = new Pawn("w");
        pawnW.position.set(500, 500);

        const queenB = new Queen("b");
        queenB.position.set(750, 500);

        const queenWW = new Queen("w");
        queenWW.position.set(1000, 500);

        const kk = new Knight("w");
        kk.position.set(1250, 500);

        this.app.stage.addChild(pawnB, pawnW, kk, queenB, queenWW);

    }
}


