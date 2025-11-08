import { Piece } from "../piece";

export class Rook extends Piece {
  constructor(color: "w" | "b", id: number) {
    // Call the base class with type "rook" and color
    super("rook", color, id);
  }
}
