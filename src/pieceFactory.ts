import { Piece } from "./piece";
import { Bishop } from "./Pieces/bishop";
import { King } from "./Pieces/king";
import { Knight } from "./Pieces/knight";
import { Pawn } from "./Pieces/pawn";
import { Queen } from "./Pieces/queen";
import { Rook } from "./Pieces/rook";

type PieceKey = 'r' | 'n' | 'b' | 'q' | 'k' | 'p';
type Color = 'w' | 'b';

export class PieceFactory { // following factory pattern 
  private nextId = 0;

  create(pieceKey: PieceKey, color: Color): Piece {
    switch (pieceKey) {
      case 'r':
        return new Rook(color, this.nextId++);
      case 'n':
        return new Knight(color, this.nextId++);
      case 'b':
        return new Bishop(color, this.nextId++);
      case 'q':
        return new Queen(color, this.nextId++);
      case 'k':
        return new King(color, this.nextId++);
      case 'p':
        return new Pawn(color, this.nextId++);
      default:
        throw new Error(`Unsupported piece key: ${pieceKey}`);
    }
  }
}
