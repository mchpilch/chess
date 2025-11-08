import { Piece } from "../piece";

export class Pawn extends Piece {
  constructor(color: "w" | "b", id: number) {
    // Call the base class with type "pawn" and color
    super("pawn", color, id);
  }
}
