import { Application, Assets, Sprite, Graphics } from "pixi.js";

(async () => {
  const app = new Application();
  await app.init({ background: "#000000ff", resizeTo: window });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const texture = await Assets.load("/assets/bunny.png");
  const bunny = new Sprite(texture);
  bunny.anchor.set(0.5);
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  const SQUARE = 80;
  const COLOR_WHITE = "#d4dbdeff";
  const COLOR_BLACK = "#223a24ff";
  const OFFSET = 120;

  const chessboard: Graphics[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {

      const color = (r + c) % 2 === 0 ? COLOR_BLACK : COLOR_WHITE;
      const square = new Graphics()
        .rect(OFFSET + c * SQUARE, OFFSET + r * SQUARE, SQUARE, SQUARE)
        .fill(color);

      chessboard.push(square);
      app.stage.addChild(square);
    }
  }

  // Testing dragining:
  // Enable the bunny to be interactive... this will allow it to respond to mouse and touch events
  bunny.eventMode = 'static';
  // This button mode will mean the hand cursor appears when you roll over the bunny with your mouse
  bunny.cursor = 'pointer';
  // Center the bunny's anchor point
  bunny.anchor.set(0.5);
  // Make it a bit bigger, so it's easier to grab
  bunny.scale.set(2);
  // Setup events for mouse + touch using the pointer events
  bunny.on('pointerdown', onDragStart, bunny);

  let x = 600;
  let y = 600;
  // Move the sprite to its designated position
  bunny.x = x;
  bunny.y = y;


  app.stage.addChild(bunny);

    let dragTarget = null;

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', onDragEnd);
  app.stage.on('pointerupoutside', onDragEnd);


  app.ticker.add((time) => {
    bunny.rotation += 0.1 * time.deltaTime;
  });


  function onDragStart() {
    // Store a reference to the data
    // * The reason for this is because of multitouch *
    // * We want to track the movement of this particular touch *
    console.log('xxx this', this);

    this.alpha = 0.5;
    dragTarget = this;
    app.stage.on('pointermove', onDragMove);
  }


  function onDragMove(event) {
    console.log('xxx event', event);
    console.log('xxx dragTarget', dragTarget);
    if (dragTarget) {
      dragTarget.parent.toLocal(event.global, null, dragTarget.position);
    }
  }
  function onDragEnd() {
    if (dragTarget) {
      app.stage.off('pointermove', onDragMove);
      dragTarget.alpha = 1;
      dragTarget = null;
    }
  }
})();

