import { Application, Assets } from 'pixi.js';
import { Game } from './game';
import { assetsManifest } from '../loaders/assetsManifest';
// import { AssetsLoader } from './Core/assetsLoader';

(async () => {
  const app = new Application();
  // @ts-ignore
  globalThis.__PIXI_APP__ = app; // pixi JS Dev tool // comment/uncomment when
  await app.init({
    background: "#000000ff",
    resizeTo: window
  });

  document.getElementById("pixi-container")!.appendChild(app.canvas);


  try {
    await Assets.init({ manifest: assetsManifest });
    await Assets.loadBundle("pieces");
  } catch (err) {
    console.error("Asset loading failed:", err);
  }


  await Assets.loadBundle("pieces");

  const game = Game.getInstance();
  const gameInitData = {
    app: app,
  };
  await game.init(gameInitData);
  // @ts-ignore
  globalThis.__PIXI_GAME__ = game;
})();
