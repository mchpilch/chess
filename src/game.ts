

import { Application } from 'pixi.js';
import { Pawn } from './Pieces/pawn';


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
        // this.app.canvas.style.position = 'absolute';
        // document.body.appendChild(this.app.canvas);

        console.log('this.app', this.app);

        const pawnB = new Pawn("b");
        pawnB.position.set(0, 0);

        const pawnW = new Pawn("w");
        pawnW.position.set(222, 0);

        
        const pawnW3 = new Pawn("w");
        pawnW.position.set(160, 0);

        this.app.stage.addChild(pawnB, pawnW, pawnW3);

    }
}


