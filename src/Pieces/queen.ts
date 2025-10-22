import { Piece } from "../piece";

export class Queen extends Piece {
  constructor(color: "w" | "b") {
    // Call the base class with type "queen" and color
    super("queen", color);
  }
}
