// domain/piece.ts
export type PieceColor = 'w' | 'b';
export type PieceRole = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';

export class Piece {

  private hasMoved!: boolean;

  constructor(
    private readonly id: number,
    private readonly color: PieceColor,
    private readonly role: PieceRole
  ) {
    
    this.hasMoved = false;
  }

  getId(): number {
    return this.id;
  }

  getColor(): PieceColor {
    return this.color;
  }

  getRole(): PieceRole {
    return this.role;
  }

  markMoved() {
    this.hasMoved = true;
  }

  getHasMoved(): boolean {
    return this.hasMoved;
  }
}
