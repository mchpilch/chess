import { Assets, Container, Sprite } from "pixi.js";

export class Piece extends Container {
  private _display: Container;

  constructor(type: string, color: "w" | "b") {
    super();
    const key = `${type}-${color}`;
    const texture = Assets.get(key);
    // console.log('xxx key',key);
    // console.log('xxx texture',texture);
    
    const sprite = new Sprite(texture); // in future can be spine or movieclip if i want my pieces animated
    sprite.anchor.set(0.5);
    sprite.scale.set(2);
    this._display = sprite; // underscore for private fields
    this.addChild(sprite);
  }

  get display(): Container {
    return this._display;
  }

  set display(newDisplay: Container) {
    this.removeChild(this._display);
    this._display = newDisplay;
    this.addChild(newDisplay);
  }

}
 // https://pixijs.com/7.x/examples/events/dragging ???