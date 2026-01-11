export class GameState {

    private currentTurn!: 'w' | 'b';
    private moveCount!: number;
    private enPassantTargetFieldId!: number | null;

    private static instance: GameState;

    private constructor() {

        this.init();
    }

    private init() {

        this.currentTurn = 'w';
        this.moveCount = 0;
        this.enPassantTargetFieldId = null;
    }
    public static getInstance(): GameState {

        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }


    public setNextTurn() { // check may change that
        this.currentTurn = this.currentTurn === 'w' ? 'b' : 'w';
    }

    public incrementMoveCount() {
        this.moveCount += 1;
    }
    public getCurrentTurn(): 'w' | 'b' {
        return this.currentTurn;
    }
    
    public getMoveCount(): number {
        return this.moveCount;
    }

    public setEnPassantTargetFieldId(fieldId: number | null) {
        this.enPassantTargetFieldId = fieldId;
    }

    public getEnPassantTargetFieldId(): number | null {
        return this.enPassantTargetFieldId;
    }
}