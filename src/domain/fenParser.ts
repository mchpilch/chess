export type FenPiece = {
    role: 'r' | 'n' | 'b' | 'q' | 'k' | 'p';
    color: 'w' | 'b';
};

export type FenBoard = (FenPiece | null)[][];

export class FenParser {

    private board!: FenBoard;

    private activeColor!: 'w' | 'b';
    private castlingRights!: { K: true, Q: true, k: true, q: true }; // todo
    private enPassant!: string | null; // todo
    private halfMoveClock!: number; // todo
    private fullMoveNumber!: number; // todo

    constructor(fenPosition: string) {

        this.parse(fenPosition);
    }

    public getFenBoard(): FenBoard {

        return this.board;
    }

    private parse(fenPosition: string) {

        const parts = fenPosition.split(' ')

        if (parts.length !== 6) {
            throw new Error('Invalid FEN string - wrong number of segments');
        }

        this.board = this.parseBoard(parts[0]);
        this.activeColor = this.parseActiveColor(parts[1]);
        // this.castlingRights = this.parseCastlingRights(parts[2]);
        // this.enPassant = this.parseEnPassant(parts[3]);
        // this.halfMoveClock = this.parseHalfMoveClock(parts[4]);
        // this.fullMoveNumber = this.parseFullMoveNumber(parts[5]);
    }

    private parseBoard(notation: string): FenBoard {
        // possibilty of missing support for dash (-) for Castling Availability when neither side can castle anymore (3rd Field) and En Passant Target Square (4th Field)
        let board: FenBoard = [];

        for (let i = 0; i < 8; i++) {
            const row = [];
            for (let j = 0; j < 8; j++) {
                row.push(null);
            }
            board.push(row);
        }

        let rowIndex = 0;
        let colIndex = 0;

        for (const char of notation) {

            if (char === '/') { // new row
                rowIndex++;
                colIndex = 0;
                continue;
            }

            if (isNaN(Number(char)) === false) { // when char is number
                colIndex += Number(char);
                continue;
            }

            // Determine piece color
            const color: 'w' | 'b' = char === char.toUpperCase() ? 'w' : 'b';

            board[rowIndex][colIndex] = {
                role: char.toLowerCase() as FenPiece['role'],
                color,
            };

            colIndex++;
        }

        return board;
    }

    private parseActiveColor(fenActiveColor: string): 'w' | 'b' {
        return fenActiveColor === 'w' ? 'w' : 'b';
    }
}
