import { Graphics } from "pixi.js";
import { Piece } from "./piece";
import { Text, TextStyle } from "pixi.js";
export class Field {

    private id!: number; // 0–63
    private notation!: string; // "a1","a2", ..., "h8"
    private occupiedBy!: Piece | null;
    private position!: { x: number; y: number }; // for nearest-center snapping
    private graphics!: Graphics;  // the square background
    private text!: Text;

    constructor(
        id: number,
        notation: string,
        occupiedBy: (Piece | null),
        position?: { x: number; y: number },
        graphics?: Graphics,
        text?: Text,
    ) {

        this.id = id;
        this.notation = notation;
        this.occupiedBy = occupiedBy;
        // this.graphics.anchor.set(0.5);

        this.position = position ?? { x: 0, y: 0 };
    }

    public setOccupiedBy(piece: Piece | null) {
        this.occupiedBy = piece;
    }

    public getOccupiedBy() {
        return this.occupiedBy;
    }

    public getPosition() {
        return this.position;
    }

    public getNotation() {
        return this.notation;
    }

    public getGraphics() {
        return this.graphics;
    }

    public getId() {
        return this.id;
    }
}