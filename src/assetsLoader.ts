import { Assets, Texture } from "pixi.js";
import { assetsManifest } from "./assetsManifest";

export class AssetLoader {
  static async init() {
    await Assets.init({ manifest: assetsManifest });
  }

  static async loadPieces() {
    await Assets.loadBundle("pieces");
  }

  static getTexture(name: string): Texture {
    const texture = Assets.get(name);
    if (!texture) throw new Error(`Texture "${name}" not found`);
    return texture;
  }
}
