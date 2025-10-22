import { Piece } from "../piece";

export class Knight extends Piece {
  constructor(color: "w" | "b") {
    // Call the base class with type "knight" and color
    super("knight", color);
  }
}
