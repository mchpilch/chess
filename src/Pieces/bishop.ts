import { Piece } from "../piece";

export class Bishop extends Piece {
  constructor(color: "w" | "b", id: number) {
    // Call the base class with type "bishop" and color
    super("bishop", color, id);
  }
}
