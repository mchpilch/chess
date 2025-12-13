import { Assets, Container, Sprite, FederatedPointerEvent, Graphics, Rectangle } from "pixi.js";
import { Signal } from "./signal";
import { GameState } from "./gameState";
import { pieceConfig } from "./Pieces/pieceConfig";
import { boardConfig } from "./boardConfig";

const roleMap = {
  king: 'k',
  queen: 'q',
  rook: 'r',
  bishop: 'b',
  knight: 'n',
  pawn: 'p',
};
type PieceType = keyof typeof roleMap; // so king, queen, etc.
type Role = typeof roleMap[PieceType]; // so k, q, etc.

export class Piece extends Container {

  private id!: number;
  private dragging!: boolean;// for reasurrance variable
  public onDragStarted!: Signal<{ pieceId: number, x: number, y: number }>;
  public onDropped!: Signal<{ pieceId: number, x: number, y: number }>;
  private color!: "w" | "b";
  private role!: Role;

  private key!: string;
  private gameState!: GameState;
  private config !: typeof pieceConfig;
  private boardConfig !: typeof boardConfig;

  constructor(type: PieceType, color: "w" | "b", id: number) {

    super();
    console.log('Piece constructor, type', type, color, id);
    this.init(type, color, id);
  }

  private init(type: PieceType, color: "w" | "b", id: number) {

    // Managers
    this.gameState = GameState.getInstance();
    this.config = pieceConfig;
    this.boardConfig = boardConfig;
    // Atributers
    this.id = id;
    this.color = color;


    this.role = roleMap[type];// as 'r' | 'n' | 'b' | 'q' | 'k' | 'p'; // improve later 
    const key = `${type}-${color}`;
    this.key = key;

    const texture = Assets.get(key);
    const sprite = new Sprite(texture); // in future can be spine or movieclip if i want my pieces animated
    sprite.anchor.set(this.config.pieceAnchor);
    sprite.scale.set(this.config.pieceScale); // 2 - 300, 1 - 150, 0.5  - 75

    let transparentBackground = new Graphics().rect(  // Bg to visualize hit area
      -this.boardConfig.squareWidth / 2, -this.boardConfig.squareWidth / 2, this.boardConfig.squareWidth, this.boardConfig.squareWidth
    ).fill(this.config.pieceHighlightColor);
    transparentBackground.alpha = this.config.pieceBgAlpha;
    this.addChild(transparentBackground);
    this.addChild(sprite);
    this.hitArea = new Rectangle(-this.boardConfig.squareWidth / 2, -this.boardConfig.squareWidth / 2, this.boardConfig.squareWidth, this.boardConfig.squareWidth);

    // Events and listeners
    this.onDragStarted = new Signal<{ pieceId: number, x: number, y: number }>();
    this.onDropped = new Signal<{ pieceId: number, x: number, y: number }>();

    // Flags
    this.dragging = false;

    if (this.gameState.getCurrentTurn() === this.color) { // 1st move is W

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
    // For now (2025-11-05): 
    // The parent of each Piece is the PIXI stage, since pieces are added directly to it in Game.ts.
    // The Board class only defines layout positions via the FEN parser — it does not own or contain the piece instances.
    // (later make board container and handle that)
    const stage = this.parent;

    this.onDragStarted.fire({
      pieceId: this.id,
      x: this.x,
      y: this.y
    });

    // console.log('xxx stage', stage);

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
      pieceId: this.id,
      x: this.x,
      y: this.y
    });
  }

  public getId(): number {
    return this.id;
  }
  public getColor(): string {
    return this.color;
  }
  public getRole(): string {
    return this.role;
  }

  public getKey(): string {
    return this.key;
  }

}