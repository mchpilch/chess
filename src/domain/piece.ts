// domain/piece.ts
export type PieceColor = 'w' | 'b';
export type PieceRole = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';

export class Piece {
  constructor(
    private readonly id: number,
    private readonly color: PieceColor,
    private readonly role: PieceRole
  ) {}

  getId(): number {
    return this.id;
  }

  getColor(): PieceColor {
    return this.color;
  }

  getRole(): PieceRole {
    return this.role;
  }
}
