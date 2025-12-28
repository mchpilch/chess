import { Piece } from "../domain/piece";
import { PieceView } from "../views/pieceView";

type PieceKey = 'r' | 'n' | 'b' | 'q' | 'k' | 'p';
type Color = 'w' | 'b';

export class PieceFactory { // following factory pattern 

  private nextId = 0;

  public create(role: PieceKey, color: Color) {

    const piece = new Piece(this.nextId++, color, role);
    const view = new PieceView(piece);

    return { piece, view };
  }

}
