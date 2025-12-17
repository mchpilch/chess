import { Piece } from "./piece";

export class Field {

    private id!: number; // 0–63
    private notation!: string; // "a1","a2", ..., "h8"
    private occupiedBy!: Piece | null;

    constructor(
        id: number,
        notation: string,
        occupiedBy: (Piece | null),
    ) {

        this.id = id;
        this.notation = notation;
        this.occupiedBy = occupiedBy;
    }

    public setOccupiedBy(piece: Piece | null) {
        this.occupiedBy = piece;
    }

    public getOccupiedBy() {
        return this.occupiedBy;
    }

    public getNotation() {
        return this.notation;
    }

    public getId() {
        return this.id;
    }
}