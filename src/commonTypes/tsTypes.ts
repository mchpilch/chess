export type MoveIDsByType = {
    quietMoves: number[];
    captures: number[];
    castlingMoves?: number[];
};

export type CastlingIntent =
    | { isCastlingIntent: false }
    | { isCastlingIntent: true; desiredKingDestinationId: number };
