import { Assets, Container, Sprite, FederatedPointerEvent, Graphics, Rectangle } from "pixi.js";
import { Signal } from "./signal";
import { GameState } from "./gameState";
import { pieceConfig } from "./configs/pieceConfig";
import { boardConfig } from "./configs/boardConfig";
import { Piece } from "./domain/piece";


type Role = "k" | "q" | "r" | "b" | "n" | "p";

const roleToName: Record<Role, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

export class PieceView extends Container {

  private piece!: Piece;

  private dragging!: boolean;// for reasurrance variable
  public onDragStarted!: Signal<{ pieceId: number, x: number, y: number }>;
  public onDropped!: Signal<{ pieceId: number, x: number, y: number }>;

  private gameState!: GameState;
  private config !: typeof pieceConfig;
  private boardConfig !: typeof boardConfig;

  constructor(piece: Piece) {

    super();

    this.init(piece);
  }

  private init(piece: Piece) {

    // Managers
    this.gameState = GameState.getInstance();
    this.config = pieceConfig;
    this.boardConfig = boardConfig;

    this.piece = piece;
    // Atributers
    const roleName = roleToName[this.piece.getRole()];
    const key = `${roleName}-${this.piece.getColor()}`;

    const texture = Assets.get(key);
    const sprite = new Sprite(texture); // in future can be spine or movieclip if i want my pieces animated
    sprite.anchor.set(this.config.pieceAnchor);
    sprite.scale.set(this.config.pieceScale); // 2 - 300, 1 - 150, 0.5  - 75

    let transparentBackground = new Graphics()
      .rect(  // Bg to visualize hit area
        -this.boardConfig.squareWidth / 2, -this.boardConfig.squareWidth / 2, this.boardConfig.squareWidth, this.boardConfig.squareWidth
      ).fill(this.config.pieceHighlightColor);

    transparentBackground.alpha = this.config.pieceBgAlpha;

    this.addChild(transparentBackground);
    this.addChild(sprite);

    this.hitArea = new Rectangle(
      -this.boardConfig.squareWidth / 2,
      -this.boardConfig.squareWidth / 2,
      this.boardConfig.squareWidth,
      this.boardConfig.squareWidth
    );

    // Events and listeners
    this.onDragStarted = new Signal<{ pieceId: number, x: number, y: number }>();
    this.onDropped = new Signal<{ pieceId: number, x: number, y: number }>();

    // Flags
    this.dragging = false;

    if (this.gameState.getCurrentTurn() === this.piece.getColor()) { // 1st move is W

      this.eventMode = 'dynamic';     // enable the piece to be interactive... this will allow it to respond to mouse and touch events - from https://pixijs.com/7.x/examples/events/dragging
    }

    this.addFieldEvents();
  }

  private addFieldEvents() {
    this
      .on("pointerdown", this.onDragStart, this)
      .on('pointerup', this.onDragEnd, this)
      .on("pointerupoutside", this.onDragEnd, this);
  }

  private onDragStart(e: FederatedPointerEvent) {

    this.dragging = true;
    this.alpha = 0.7;

    // bring to front if desired
    this.parent?.setChildIndex(this, this.parent.children.length - 1);

    // Compute offset: pointer global pos → local parent space
    const parentPos = this.parent?.toLocal(e.global) ?? { x: 0, y: 0 };

    this.position.set(
      parentPos.x,
      parentPos.y,
    );

    const stage = this.parent;

    this.onDragStarted.fire({
      pieceId: this.piece.getId(),
      x: this.x,
      y: this.y
    });

    stage?.on("pointermove", this.onDragMove, this);
  }

  private onDragMove(e: FederatedPointerEvent) {
    if (!this.dragging) return;

    const parentPos = this.parent?.toLocal(e.global) ?? { x: 0, y: 0 };
    this.position.set(
      parentPos.x,
      parentPos.y,
    );

  }

  private onDragEnd(e: FederatedPointerEvent) {
    if (!this.dragging) return;

    this.dragging = false;
    this.alpha = 1;

    const stage = this.parent;
    stage?.off("pointermove", this.onDragMove, this);

    // Fire the signal
    this.onDropped.fire({
      pieceId: this.piece.getId(),
      x: this.x,
      y: this.y
    });
  }

  public getId(): number {
    return this.piece.getId();
  }

  public getPiece(): Piece {
    return this.piece;
  }

}