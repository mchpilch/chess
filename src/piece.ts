import { Assets, Container, Sprite, FederatedPointerEvent } from "pixi.js";

export class Piece extends Container {

  private piece: Container;
  private dragOffset = { x: 25, y: 25 }; // on a start of drag piece will be moved a bit and during drag it will be moved by these values relative to cursor

  constructor(type: string, color: "w" | "b") {
    super();
    const key = `${type}-${color}`;
    const texture = Assets.get(key);
    // console.log('xxx key',key);
    // console.log('xxx texture',texture);

    const sprite = new Sprite(texture); // in future can be spine or movieclip if i want my pieces animated
    sprite.anchor.set(0.5);
    sprite.scale.set(2);
    this.piece = sprite; // underscore for private fields
    this.addChild(sprite);


    // enable the piece to be interactive... this will allow it to respond to mouse and touch events - from https://pixijs.com/7.x/examples/events/dragging
    this.piece.eventMode = 'static';

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

  onDragStart(e: FederatedPointerEvent) {
    console.log('xxx onDragStart e', e);
    this.alpha = 0.7; // later haddle it differently like with glow around piece

    // if (!stage) return;
    this.piece.on("pointermove", (e) => this.onDragMove(e)) // arrow function, which automatically captures the this context from the surrounding scope.
  }

  private onDragMove(e: FederatedPointerEvent) {

    console.log('xxx onFieldDragMove e', e);

    // const globalPos = e.global;
    // if (typeof this.piece !== "undefined") {
    //   this.piece.toLocal(globalPos, undefined, this.piece.position);
    //   this.piece.toLocal(globalPos, undefined, this.piece.position);
    // }

    // globalna pozycja kursora
    const pos = e.global;
    this.position.set(pos.x + this.dragOffset.x, pos.y + this.dragOffset.y);
  }

  //   private onFieldDragStart(e: any) {
  //   // if (!field.occupiedBy) return; // only start if there’s a piece on it

  //   console.log('xxx onFieldDragStart e', e);
  //   // this.draggingPiece = field.occupiedBy;
  //   this.dragOffset = e.getLocalPosition();
  //   // this.dragOffset.x = this.draggingPiece.x - this.dragOffset.x;
  //   // this.dragOffset.y = this.draggingPiece.y - this.dragOffset.y;

  //   // this.draggingPiece.alpha = 0.6;
  //   // this.draggingPiece.zIndex = 1000;
  // }

  private onDragEnd(e: FederatedPointerEvent) {
    console.log('xxxx onDragEnd e', e);

    // if (typeof this.piece !== "undefined") {
    this.piece.alpha = 1;

    // }

    // this.draggingPiece.alpha = 1;
    // this.draggingPiece.zIndex = 0;

    // // find the closest field to snap
    // const closest = this.getClosestField(this.draggingPiece.position);
    // this.movePieceToField(this.draggingPiece, closest);

    // this.draggingPiece = null;
  }

  // private getClosestField(pos: { x: number; y: number }): Field {
  //   return this.fields.reduce(
  //     (acc, f) => {
  //       const dx = pos.x - f.position.x;
  //       const dy = pos.y - f.position.y;
  //       const dist = Math.sqrt(dx * dx + dy * dy);
  //       return dist < acc.dist ? { field: f, dist } : acc;
  //     },
  //     { field: this.fields[0], dist: Infinity }
  //   ).field;
  // }

  // private movePieceToField(piece: Piece, newField: Field) {
  //   // clear old field
  //   this.fields.forEach((f) => {
  //     if (f.occupiedBy === piece) f.occupiedBy = null;
  //   });

  //   newField.occupiedBy = piece;
  //   piece.position.set(newField.position.x, newField.position.y);
  // }

}
// https://pixijs.com/7.x/examples/events/dragging ???