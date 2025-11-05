import { Assets, Container, Sprite, FederatedPointerEvent, Graphics, Rectangle } from "pixi.js";

export class Piece extends Container {

  private piece: Container;
  // private dragOffset = { x: 0, y: 0 }; // on a start of drag piece will be moved a bit and during drag it will be moved by these values relative to cursor
  private dragging = false; // for reasurrance variable

  constructor(type: string, color: "w" | "b") {
    super();
    const key = `${type}-${color}`;
    const texture = Assets.get(key);
    // console.log('xxx key',key);
    // console.log('xxx texture',texture);

    const sprite = new Sprite(texture); // in future can be spine or movieclip if i want my pieces animated
    sprite.anchor.set(0.5);
    sprite.scale.set(2);
    this.piece = new Container();

    // Bg to visualize hit area
    let transparentBackground = new Graphics().rect(
      -150, -150, 300, 300
    ).fill(0xffff00);
    transparentBackground.alpha = 0.65;
    this.piece.addChild(transparentBackground);

    this.piece.addChild(sprite);
    this.piece.hitArea = new Rectangle(-150, -150, 300, 300);
    this.piece.eventMode = 'static';     // enable the piece to be interactive... this will allow it to respond to mouse and touch events - from https://pixijs.com/7.x/examples/events/dragging

    this.addChild(this.piece);
    this.addFieldEvents();
  }

  get display(): Container {
    return this.piece;
  }

  set display(newDisplay: Container) {
    this.removeChild(this.piece);
    this.piece = newDisplay;
    this.addChild(newDisplay);
  }

  // possible functions
  private addFieldEvents() {
    this.piece
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
      parentPos.x,// + this.dragOffset.x,
      parentPos.y,// + this.dragOffset.y
    );
    // For now (2025-11-05): 
    // The parent of each Piece is the PIXI stage, since pieces are added directly to it in Game.ts.
    // The Board class only defines layout positions via the FEN parser — it does not own or contain the piece instances.
    // (later make board container and handle that)
    const stage = this.parent;

    console.log('xxx stage', stage);

    stage?.on("pointermove", this.onDragMove, this);
  }

  private onDragMove(e: FederatedPointerEvent) {
    if (!this.dragging) return;

    const parentPos = this.parent?.toLocal(e.global) ?? { x: 0, y: 0 };
    this.position.set(
      parentPos.x,// + this.dragOffset.x,
      parentPos.y,// + this.dragOffset.y
    );
  }

  private onDragEnd(e: FederatedPointerEvent) {
    if (!this.dragging) return;

    this.dragging = false;
    this.alpha = 1;

    const stage = this.parent;
    stage?.off("pointermove", this.onDragMove, this);

    // Here: add snap-to-grid or target‐field logic
    // e.g., this.snapToField();
  }

}
// https://pixijs.com/7.x/examples/events/dragging 