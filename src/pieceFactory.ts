import { Piece } from "./domain/piece";
import { PieceView } from "./pieceView";
// import { Bishop } from "./pieces/bishop";
// import { King } from "./pieces/king";
// import { Knight } from "./pieces/knight";
// import { Pawn } from "./pieces/pawn";
// import { Queen } from "./pieces/queen";
// import { Rook } from "./pieces/rook";

type PieceKey = 'r' | 'n' | 'b' | 'q' | 'k' | 'p';
type Color = 'w' | 'b';

export class PieceFactory { // following factory pattern 
  private nextId = 0;

  create(role: PieceKey, color: Color) {
    const piece = new Piece(this.nextId++, color, role);
    const view = new PieceView(piece);
    return { piece, view };
  }

  // create(pieceKey: PieceKey, color: Color): PieceView {
  //   switch (pieceKey) {
  //     case 'r':
  //       return new Rook(color, this.nextId++);
  //     case 'n':
  //       return new Knight(color, this.nextId++);
  //     case 'b':
  //       return new Bishop(color, this.nextId++);
  //     case 'q':
  //       return new Queen(color, this.nextId++);
  //     case 'k':
  //       return new King(color, this.nextId++);
  //     case 'p':
  //       return new Pawn(color, this.nextId++);
  //     default:
  //       throw new Error(`Unsupported piece key: ${pieceKey}`);
  //   }
  // }
}
