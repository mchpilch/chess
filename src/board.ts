import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { boardConfig } from "./boardConfig";
import { Piece } from "./piece";
import { Field } from "./field";
import { Listener } from "./listener";
import { GameState } from "./gameState";


export class Board {

    private board!: Container;
    private fields!: Field[][];
    private config = boardConfig;
    private gameState !: GameState;
    private dragOriginField: Field | null = null;

    constructor() {

        this.fields = [];
        this.board = this.generateBoard();
        this.gameState = GameState.getInstance();
        this.dragOriginField = null;
    }

    private generateBoard(): Container {

        const boardContainer = new Container;

        for (let r = 0; r < this.config.numberOfRows; r++) {

            let row = [];
            for (let f = 0; f < this.config.numberOfFiles; f++) {

                const id = this.config.numberOfRows * (this.config.numberOfRows - r - 1) + f; // improved id calc so a1 corresponds to 0 a2 to 1 and so on

                const notation = `${String.fromCharCode(97 + f)}${this.config.numberOfRows - r}`; // a1..h8 // 97 is a lowercase "a" // files got letters while rows have numbers
                const x = this.config.offset.x + f * this.config.squareWidth; //  - this.config.squareWidth / 2 is necessary as pieces are anchored in the middle of spites 
                const y = this.config.offset.y + r * this.config.squareWidth; // 

                const color = (r + f) % 2 === 0 ? this.config.colorDark : this.config.colorLight;
                const square = new Graphics()
                    .rect(
                        x,
                        y,
                        this.config.squareWidth,
                        this.config.squareWidth
                    )
                    .fill(color);

                // Wrap the square in a container
                const occupiedBy: Piece | null = null;
                const position = { x, y };
                const style = new TextStyle({
                    fontSize: 12,
                    fill: 0x000000,
                });
                const textNotation = new Text({ text: notation, style: style });
                textNotation.position.set(
                    x + this.config.textNotationOffset.x,
                    y + this.config.textNotationOffset.y
                );

                const textFieldId = new Text({ text: id, style: style });
                textFieldId.position.set(
                    x + this.config.textFieldIdOffset.x,
                    y + this.config.textFieldIdOffset.y
                );
                const field = new Field(
                    id,
                    notation,
                    occupiedBy,
                    position,
                    square, // graphics
                    textNotation
                );

                row.push(field);

                boardContainer.addChild(square);
                boardContainer.addChild(textNotation); // notation
                boardContainer.addChild(textFieldId); // ids
            }
            this.fields.push(row);
        }
        return boardContainer;
    };

    public getBoard(): Container { return this.board; }

    public updateFieldsWithFenParserResult(fenPieceBoard: (Piece | null)[][]) {

        // Attach listeners to all pieces
        for (const row of fenPieceBoard) {
            for (const piece of row) {

                if (piece === null) continue;

                piece.onDragStarted.add(
                    new Listener<{ pieceId: number; x: number; y: number }>(
                        payload => this.handlePieceDragStarted(payload)
                    )
                );

                piece.onDropped.add(
                    new Listener<{ pieceId: number; x: number; y: number }>(
                        payload => this.handlePieceDrop(payload)
                    )
                );
            }
        }

    }

    public getPiecesFromFields(): (Piece | null)[][] {
        const pieceBoard: (Piece | null)[][] = [];

        for (const row of this.fields) {
            const pieceRow: (Piece | null)[] = [];
            for (const field of row) {
                pieceRow.push(field.getOccupiedBy());
            }
            pieceBoard.push(pieceRow);
        }
        return pieceBoard;
    }

    private handlePieceDragStarted({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {
        console.log(`handlePieceDragStarted id  ${pieceId}  x ${x} y ${y}`);

        const originField = this.findNearestField(x, y);
        this.dragOriginField = originField;
        console.log(`handlePieceDragStarted originField ${originField?.getNotation()}`);
        if (originField === null) {
            console.log('originField is null');
            return;
        }
        this.calculatePossibleMoves(pieceId, originField);
        // then show possible moves;
    }

    private handlePieceDrop({ pieceId, x, y }: { pieceId: number; x: number; y: number }): void {

        const nearest = this.findNearestField(x, y);
        this.turnOffHighlights();
        if (!nearest) {
            this.dragOriginField = null;
            return;
        };
        // console.log(`xxxxx Piece with id ${pieceId} snaps to field ${nearest.getNotation()}`);
        // console.log(`xxxxx nearest.getOccupiedBy()?.getColor() ${nearest.getOccupiedBy()?.getColor()}`);
        // console.log(`xxxxx this.gameState.getCurrentTurn() ${this.gameState.getCurrentTurn()}`);
        // console.log(`xxxxx nearest.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn() ${nearest.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn()}`);

        let isMoveToStartingSquare = nearest.getOccupiedBy()?.getId() === pieceId;
        let isMoveToWrongColor = nearest.getOccupiedBy() !== null && nearest.getOccupiedBy()?.getColor() === this.gameState.getCurrentTurn();
        let isMoveToEmptySquare = nearest.getOccupiedBy() === null;
        let isMoveToEnemySquare = nearest.getOccupiedBy() !== null && nearest.getOccupiedBy()?.getColor() !== this.gameState.getCurrentTurn();

        if (isMoveToStartingSquare === true || isMoveToWrongColor === true) {
            if (this.dragOriginField === null) return;
            this.movePiece(pieceId, this.dragOriginField);
            this.dragOriginField = null;
            return;
        }

        if (isMoveToEmptySquare === true) {
            this.movePiece(pieceId, nearest);
            nearest.setOccupiedBy(this.findPieceById(pieceId));
        }

        if (isMoveToEnemySquare === true) { // here more rules will be added
            nearest.getOccupiedBy()!.visible = false; // later: consider if this is enough or should it be rm from stage completely
            this.movePiece(pieceId, nearest);
            nearest.setOccupiedBy(this.findPieceById(pieceId));
        }

        this.gameState.incrementMoveCount();
        this.gameState.setNextTurn();


        this.dragOriginField?.setOccupiedBy(null);

        this.handleInteractivnessOfPiecesOnBoard();
        this.dragOriginField = null;

        // console.log('xxx this.gameState.getCurrentTurn()', this.gameState.getCurrentTurn());
        // console.log('xxx this.gameState.getMoveCount()', this.gameState.getMoveCount());
    }

    private findNearestField(px: number, py: number): Field | null {
        let nearest: Field | null = null;
        let shortest = Infinity;
        for (const row of this.fields) {
            for (const field of row) {

                const dx = px - field.getPosition().x - this.config.squareWidth / 2;
                const dy = py - field.getPosition().y - this.config.squareWidth / 2;
                const distSq = dx * dx + dy * dy;

                if (distSq < shortest) {
                    shortest = distSq;
                    nearest = field;
                }
            }
        }

        return nearest;
    }

    private findPieceById(id: number): Piece | null {
        for (const row of this.fields) {
            for (const field of row) {
                const piece = field.getOccupiedBy();
                if (piece && piece.getId() === id) return piece;
            }
        }
        return null;
    }

    private calculatePossibleMoves(pieceId: number, originField: Field): void {
        let piece = this.findPieceById(pieceId);
        console.log('xxx piece', piece?.getRole(), piece?.getColor());
        console.log('xxx originField', originField?.getNotation(), originField?.getId());
        let possibleMoves: Field[] = [];
        let tempPossibleMovesAsNotation: string[] = [];
        switch (piece?.getRole()) {
            case 'rook':
                tempPossibleMovesAsNotation = this.calculatePossibleMovesForRook(originField);
                break;
            // case 'n':
            //     this.possibleMoves = this.calculatePossibleMovesForKnight(pieceId, originField);
            //     break;
            // case 'b':
            //     this.possibleMoves = this.calculatePossibleMovesForBishop(pieceId, originField);
            //     break;
            // case 'q':
            //     this.possibleMoves = this.calculatePossibleMovesForQueen(pieceId, originField);
            //     break;
            // case 'k':
            //     this.possibleMoves = this.calculatePossibleMovesForKing(pieceId, originField);
            //     break;
            // case 'p':
            //     this.possibleMoves = this.calculatePossibleMovesForPawn(pieceId, originField);
            //     break;
            default:
                tempPossibleMovesAsNotation = [];
        }
    }

    private calculatePossibleMovesForRook(originField: Field): string[] {

        let originID = originField.getId();
        if (originID === null) {
            return [];
        }
        // let currentRow = Math.floor(originID / 8);
        // let currentFile = originID % 8;

        let possibleMovesWest: number[] = [];
        let possibleMovesNorth: number[] = [];
        let possibleMovesEast: number[] = [];
        let possibleMovesSouth: number[] = [];

        let possibleCaptures: number[] = [];

        let safetyCounter = 0;
        let tempFieldID = originID;

        while (tempFieldID % 8 !== 0) {
            tempFieldID = tempFieldID - 1;

            let possiblePiece = this.getFieldById(tempFieldID).getOccupiedBy()
            if (possiblePiece !== null) {
                if (possiblePiece.getColor() === originField.getOccupiedBy()!.getColor()) { // if possible piece is an enemy piece, we can move to that square
                    console.log('xxx own piece on way');

                    break;
                } else {
                    possibleCaptures.push(tempFieldID); // if possible piece is our own piece, we can only move to that square if there are no captures
                    break;
                }
            } else {
                possibleMovesWest.push(tempFieldID);
            }

            safetyCounter++;
            if (safetyCounter > 100) {
                console.log('SAFETY');
                break;
            }
        }

        tempFieldID = originID;
        while ((Math.floor(tempFieldID / 8)) !== 7) {
            tempFieldID = tempFieldID + 8;
            possibleMovesNorth.push(tempFieldID);
            if (this.getFieldById(tempFieldID).getOccupiedBy() !== null) {
                break;
            }
            safetyCounter++;
            if (safetyCounter > 100) {
                console.log('SAFETY');
                break;
            }
        }

        tempFieldID = originID;
        while (tempFieldID % 8 !== 7) {
            console.log('xxx loop')
            tempFieldID = tempFieldID + 1;
            possibleMovesEast.push(tempFieldID);
            if (this.getFieldById(tempFieldID).getOccupiedBy() !== null) {
                break;
            }
            safetyCounter++;
            if (safetyCounter > 100) {
                console.log('SAFETY');
                break;
            }
        }

        tempFieldID = originID;
        while ((Math.floor(tempFieldID / 8)) % 8 !== 0) {
            tempFieldID = tempFieldID - 8;
            possibleMovesSouth.push(tempFieldID);
            if (this.getFieldById(tempFieldID).getOccupiedBy() !== null) {
                break;
            }
            safetyCounter++;
            if (safetyCounter > 100) {
                console.log('SAFETY');

                break;
            }
        }

        let possibleMoves = [...possibleMovesWest, ...possibleMovesNorth, ...possibleMovesEast, ...possibleMovesSouth];
        console.log('XXXXXX possibleMovesWest ' + possibleMovesWest);
        console.log('XXXXXX possibleMovesNorth ' + possibleMovesNorth);
        console.log('XXXXXX possibleMovesEast ' + possibleMovesEast);
        console.log('XXXXXX possibleMovesSouth ' + possibleMovesSouth);
        console.log('XXXXXX all possibleMoves ' + possibleMoves);
        this.highlightFields(possibleMoves);
        return [''];
    }

    private highlightFields(possibleMoves: number[]): void {

        console.log('xxx possibleMoves', possibleMoves);

        for (let row of this.fields) {
            for (let field of row) {
                if (possibleMoves.includes(field.getId())) {

                    let { x, y } = field.getPosition();
                    console.log('xxx field', field.getNotation());
                    field.getGraphics().clear();
                    field.getGraphics().rect(x, y, this.config.squareWidth, this.config.squareWidth).fill(this.config.colorHighlight);
                }
            }
        }
        // let { x, y } = this.fields[0][0].getPosition();

        // later: change color without removing it from stage
        // this.fields[0][0].getGraphics().clear();
        // this.fields[0][0].getGraphics().fill({ color: this.config.colorHighlight });
        // this.fields[0][0].getGraphics().rect(x, y, this.config.squareWidth, this.config.squareWidth).fill(this.config.colorHighlight);


        // this.fields[0][0].setGraphics.alpha = 0.5;
    }

    private turnOffHighlights(): void {

        this.fields.forEach((row, rowIndex) => {
            row.forEach((field, colIndex) => {

                const { x, y } = field.getPosition();
                // console.log("row:", rowIndex, "col:", colIndex, field.getNotation());
                const color = (rowIndex + colIndex) % 2 === 0 ? this.config.colorDark : this.config.colorLight;
                field.getGraphics().clear();
                field.getGraphics()
                    .rect(x, y, this.config.squareWidth, this.config.squareWidth)
                    .fill(color);
            });
        });
    }

    private movePiece(pieceId: number, destination: Field): void { // set dragged piece in new position
        // Move the actual piece
        const piece = this.findPieceById(pieceId);
        if (piece) {
            piece.position.set(
                destination.getPosition().x + this.config.squareWidth / 2, // cause anchor of square is not in the middle
                destination.getPosition().y + this.config.squareWidth / 2
            );

        }
    }

    private handleInteractivnessOfPiecesOnBoard(): void {

        for (const row of this.fields) {
            for (const field of row) {

                const piece = field.getOccupiedBy();
                if (piece === null) continue;

                if (this.gameState.getCurrentTurn() === piece.getColor()) {
                    piece.eventMode = 'dynamic';
                } else {
                    piece.eventMode = 'none';
                }

            }
        }
    }

    public getFields(): Field[][] { return this.fields; }

    private getFieldById(id: number): Field {

        return this.fields[7 - Math.floor(id / 8)][id % 8];
    }

}