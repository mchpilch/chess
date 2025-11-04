import { Application, Assets } from 'pixi.js';
import { Game } from './game';
import { assetsManifest } from './assetsManifest';
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



// import { Application, Assets, Sprite, Graphics } from "pixi.js";
// import { Board } from "./board";
// // https://pixijs.download/dev/docs/index.html - install pixi start project
// // https://pixijs.com/8.x/examples?example=events_dragging - draging example from playground

// // pieces svgs from Uray M. János https://greenchess.net/info.php?item=downloads CC license
// (async () => {
//   const app = new Application();
//   await app.init({ background: "#262726ff", resizeTo: window });
//   document.getElementById("pixi-container")!.appendChild(app.canvas);

//   // loading all textures
//   const texture = await Assets.load("/assets/bunny.png");
//   const bunny = new Sprite(texture);

//   const svgTexturePawnB = await Assets.load("/assets/pawn-b.svg")
//   const pawnB = new Sprite(svgTexturePawnB);

//   const svgTexturePawnW = await Assets.load("/assets/pawn-w.svg")
//   const pawnW = new Sprite(svgTexturePawnW);

//   const svgTextureKnightB = await Assets.load("/assets/knight-b.svg")
//   const knightB = new Sprite(svgTextureKnightB);

//   const svgTextureKnightW = await Assets.load("/assets/knight-w.svg")
//   const knightW = new Sprite(svgTextureKnightW);

//   const svgTextureBishopB = await Assets.load("/assets/bishop-b.svg")
//   const bishopB = new Sprite(svgTextureBishopB);

//   const svgTextureBishopW = await Assets.load("/assets/bishop-w.svg")
//   const bishopW = new Sprite(svgTextureBishopW);

//   const svgTextureRookB = await Assets.load("/assets/rook-b.svg")
//   const rookB = new Sprite(svgTextureRookB);

//   const svgTextureRookW = await Assets.load("/assets/rook-w.svg")
//   const rookW = new Sprite(svgTextureRookW);

//   const svgTexturQueenB = await Assets.load("/assets/queen-b.svg")
//   const queenB = new Sprite(svgTexturQueenB);

//   const svgTexturQueenW = await Assets.load("/assets/queen-w.svg")
//   const queenW = new Sprite(svgTexturQueenW);

//   const svgTextureKingB = await Assets.load("/assets/king-b.svg")
//   const kingB = new Sprite(svgTextureKingB);

//   const svgTextureKingW = await Assets.load("/assets/king-w.svg")
//   const kingW = new Sprite(svgTextureKingW);

//   // setting scale and anchor for all sprites
//   pawnB.anchor.set(0.5);
//   pawnB.scale.set(1);

//   pawnW.anchor.set(0.5);
//   pawnW.scale.set(1);

//   knightB.anchor.set(0.5);
//   knightB.scale.set(1);

//   knightW.anchor.set(0.5);
//   knightW.scale.set(1);

//   bishopB.anchor.set(0.5);
//   bishopB.scale.set(1);

//   bishopW.anchor.set(0.5);
//   bishopW.scale.set(1);

//   rookB.anchor.set(0.5);
//   rookB.scale.set(1);

//   rookW.anchor.set(0.5);
//   rookW.scale.set(1);

//   queenB.anchor.set(0.5);
//   queenB.scale.set(1);

//   queenW.anchor.set(0.5);
//   queenW.scale.set(1);

//   kingB.anchor.set(0.5);
//   kingB.scale.set(1);

//   kingW.anchor.set(0.5);
//   kingW.scale.set(1);
//   // bunny.position.set(app.screen.width / 2, app.screen.height / 2);



//   const board = new Board();
//   const chessBoard = board.generateBoard();
//   app.stage.addChild(chessBoard);

//   // (async () => {
//   //   const pieces = await board.generatePieces();
//   //   app.stage.addChild(pieces);
//   // })();

//   const pieces = await board.generatePieces();
//   app.stage.addChild(pieces);

//   // TODO -> FEN -> It differs from the Portable Game Notation (PGN) because it denotes only a single position instead of the moves that lead to it.
//   // https://www.chess.com/terms/chess-notation
//   // other -> Algebraic Notation 

//   // Testing dragining:
//   // Enable the bunny to be interactive... this will allow it to respond to mouse and touch events
//   bunny.eventMode = 'static';
//   // This button mode will mean the hand cursor appears when you roll over the bunny with your mouse
//   bunny.cursor = 'pointer';
//   // Center the bunny's anchor point
//   bunny.anchor.set(0.5);
//   // Make it a bit bigger, so it's easier to grab
//   bunny.scale.set(2);
//   // Setup events for mouse + touch using the pointer events
//   bunny.on('pointerdown', onDragStart, bunny);

//   let x = 600;
//   let y = 600;
//   // Move the sprite to its designated position
//   bunny.x = x;
//   bunny.y = y;


//   app.stage.addChild(bunny);

//   let dragTarget = null;

//   app.stage.eventMode = 'static';
//   app.stage.hitArea = app.screen;
//   app.stage.on('pointerup', onDragEnd);
//   app.stage.on('pointerupoutside', onDragEnd);


//   app.ticker.add((time) => {
//     // bunny.rotation += 0.1 * time.deltaTime;
//   });


//   function onDragStart() {
//     // Store a reference to the data
//     // * The reason for this is because of multitouch *
//     // * We want to track the movement of this particular touch *
//     console.log('xxx this', this);

//     this.alpha = 0.5;
//     dragTarget = this;
//     app.stage.on('pointermove', onDragMove);
//   }


//   function onDragMove(event) {
//     console.log('xxx event', event);
//     console.log('xxx dragTarget', dragTarget);
//     if (dragTarget) {
//       dragTarget.parent.toLocal(event.global, null, dragTarget.position);
//     }
//   }
//   function onDragEnd() {
//     if (dragTarget) {
//       app.stage.off('pointermove', onDragMove);
//       dragTarget.alpha = 1;
//       dragTarget = null;
//     }
//   }
// })();

