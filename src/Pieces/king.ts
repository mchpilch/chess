import { Piece } from "../piece";

export class King extends Piece {
  constructor(color: "w" | "b", id: number) {
    // Call the base class with type "king" and color
    super("king", color, id);
  }
}
