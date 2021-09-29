const sprites = new Image();
sprites.src = "./img/sprites.png";

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
let frames = 0;
const FPS = 15;
let bestScore = 0;

// ----- OBJECTS -----

// bird object
const bird = {
  srcX: 0,
  srcY: 0,
  w: 33,
  h: 24,
  canX: 10,
  canY: 50,
  canW: 33,
  vel: 0,
  jmp: 4,
  mov: [
    { srcX: 0, srcY: 0 }, //up
    { srcX: 0, srcY: 26 }, // middle
    { srcX: 0, srcY: 52 }, // down
  ],
  wings() {
    if (bird.srcY == bird.mov[0].srcY) {
      bird.srcY = bird.mov[1].srcY;
    } else if (bird.srcY == bird.mov[1].srcY) {
      bird.srcY = bird.mov[2].srcY;
    } else {
      bird.srcY = bird.mov[0].srcY;
    }
  },
  jump() {
    bird.vel = -bird.jmp;
    //console.log(bird.canY);
  },
};

const floor = {
  srcX: 0,
  srcY: 618,
  w: 50,
  h: 120,
  canX: 0,
  canY: canvas.height - 105,
  canW: canvas.width * 2, // width relative to game´s screen (320) -- * 2 for floor movimentation
};

const coin = {
  //srcX: 47,
  //srcY: 122,
  w: 45,
  h: 45,
  canX: 90,
  canY: 140,
  canW: 40,
  coin: [
    { srcX: 0, srcY: 80 }, //1
    { srcX: 47, srcY: 80 }, // 2
    { srcX: 47, srcY: 124 }, // 3
    { srcX: 0, srcY: 124 }, //4
  ],
  scoreCoin() {
    //20px -> pass 1 pipe
    if (score.score <= 200) {
      coin.srcX = coin.coin[0].srcX;
      coin.srcY = coin.coin[0].srcY;
      console.log("1");
    } else if (score.score > 200 && score.score <= 400) {
      coin.srcX = coin.coin[1].srcX;
      coin.srcY = coin.coin[1].srcY;
      console.log("2");
    } else if (score.score > 400 && score.score <= 600) {
      coin.srcX = coin.coin[2].srcX;
      coin.srcY = coin.coin[2].srcY;
      console.log("3");
    } else if (score.score > 600) {
      coin.srcX = coin.coin[3].srcX;
      coin.srcY = coin.coin[3].srcY;
      console.log("4");
    }
  },
};

const score = {
  score: 0,
  draw(x, y) {
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
    ctx.font = "18px serif";
    ctx.fillStyle = "white";
    ctx.fillText(`${score.score}`, x, y);
  },
  drawBestScore() {
    if (score.score > bestScore) {
      bestScore = score.score;
    }

    ctx.font = "18px serif";
    ctx.fillStyle = "white";
    ctx.fillText(`${bestScore}`, 210, 185);
  },
  update() {
    if (frames % FPS == 0) {
      frames = 0;
      score.score++;
      //console.log(frames);
    }
  },
};

function createPipe(x, y) {
  const pipe = {
    w: 52,
    h: 400,
    canW: 52,
    floor: {
      canX: x, //modificar
      canY: y, //modificar
      srcX: 0,
      srcY: 170,
    },
    sky: {
      canX: x, //modificar
      canY: y - 480, //400 - height + 80 - space
      srcX: 52,
      srcY: 170,
    },
    espace: 80,
    setY(y) {
      pipe.floor.canY = y;
      pipe.sky.canY = y - 480;
    },
    translatePipes() {
      pipe.floor.canX--;
      pipe.sky.canX--;

      // infinite pipes
      if (pipe.floor.canX == -54) {
        pipe.floor.canX = 320;
        pipe.sky.canX = 320;

        // changing y randomly
        // Math.random() * (max - min) + min;
        y = Math.random() * (260 - 110) + 110;
        console.log(y);
        pipe.setY(y);
      }

      if (collision(pipe)) {
        activeScreen = screens.gameOverScreen;
        resetPipes();
      }
    },
    draw() {
      ctx.drawImage(
        sprites, // file
        pipe.floor.srcX,
        pipe.floor.srcY, // inicial position
        pipe.w,
        pipe.h, // original width & height
        pipe.floor.canX,
        pipe.floor.canY, // location in canvas
        pipe.canW,
        pipe.h // width & height in canvas
      );

      ctx.drawImage(
        sprites, // file
        pipe.sky.srcX,
        pipe.sky.srcY, // inicial position
        pipe.w,
        pipe.h, // original width & height
        pipe.sky.canX,
        pipe.sky.canY, // location in canvas
        pipe.canW,
        pipe.h // width & height in canvas
      );
    },
  };
  return pipe;
}

const bg = {
  srcX: 390,
  srcY: 0,
  w: 275,
  h: 204,
  canX: 0,
  canY: canvas.height - 204,
  canW: canvas.width, // width relative to game´s screen (320)
};

const getReadyScreen = {
  srcX: 134,
  srcY: 0,
  w: 174,
  h: 152,
  canX: canvas.width / 2 - 174 / 2,
  canY: 50,
  canW: 174,
};

const gameOverScreen = {
  srcX: 134,
  srcY: 153,
  w: 226,
  h: 200,
  canX: canvas.width / 2 - 174 / 2,
  canY: 50,
  canW: 174,
};

// ----- SCREENS FUNCTIONS -----

// changing the screen
function changeScreen(screen) {
  activeScreen = screen;
}

// initial values
var pipes = [5];
pipes[0] = createPipe(320, 230);
pipes[1] = createPipe(501, 200);

const screens = {
  startScreen: {
    draw() {
      draw();
      draw(bg);
      draw(floor);
      draw(bird);
      draw(getReadyScreen);
    },
    moves() {
      bgmovement();
      bird.wings();

      // reset velues when is game over
      bird.vel = 0;
      score.score = 0;
    },
  },
  gameScreen: {
    draw() {
      draw();
      draw(bg);
      pipes.forEach((pipe) => {
        pipe.draw();
      });
      draw(floor);
      draw(bird);
      score.draw(10, 20);
    },
    moves() {
      fall();
      bird.wings();
      bgmovement();
      bird.wings();
      score.update();
      coin.scoreCoin();

      pipes.forEach((pipe) => {
        pipe.translatePipes();
      });
    },
  },
  gameOverScreen: {
    draw() {
      draw();
      draw(bg);
      draw(floor);
      draw(bird);
      draw(gameOverScreen);
      draw(coin);
      score.drawBestScore();
    },
    moves() {
      score.draw(210, 140);
      // bird.vel = 0;
      // score.score = 0;
    },
  },
};

// default screen
let activeScreen = screens.startScreen;

// click events
window.onclick = function () {
  // fist click
  if (activeScreen == screens.startScreen) {
    bird.canY = 50;
    activeScreen = screens.gameScreen;
  } else if (activeScreen == screens.gameOverScreen) {
    bird.canY = 50;
    activeScreen = screens.startScreen;
    console.log("!");
  } else {
    bird.jump();
  }
};

// ----- GAME FUNCTIONS -----
function draw(e = null) {
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

  // blue bg
  if (e == null) {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // objects
    ctx.drawImage(
      sprites, // file
      e.srcX,
      e.srcY, // inicial position
      e.w,
      e.h, // original width & height
      e.canX,
      e.canY, // location in canvas
      e.canW,
      e.h // width & height in canvas
    );
  }
}

function resetPipes() {
  pipes[0] = createPipe(320, 230);
  pipes[1] = createPipe(501, 200);
}

function collision(pipe) {
  const birdHead = bird.canY;
  const birdFoot = bird.canY + bird.h;

  // bird.canX + bird.w = bird's beak
  if (bird.canX + bird.w >= pipe.floor.canX) {
    // (canvas.height + pipe.sky.canY) sky.canY is oq soboru de tela para o cano
    // Ex: 200 (cade de baixo) + 80 (espace) = - 280
    // 400 - 280 = 120 -> sky pipe espace
    if (birdHead <= canvas.height + pipe.sky.canY) {
      console.log("cima");
      return true;
    }
    if (birdFoot >= pipe.floor.canY) {
      console.log("baixo");
      return true;
    }
  }
  return false;
}

function fall() {
  bird.vel = bird.vel + 0.25;
  return (bird.canY = bird.canY + bird.vel);
}

function bgmovement() {
  floor.canX = floor.canX - 2;

  // repit floor
  if (floor.canX <= -canvas.width) {
    floor.canX = 0;
  }
}

function makeCollision() {
  if (bird.canY >= floor.canY - bird.h) {
    activeScreen = screens.gameOverScreen;
    resetPipes();
  }
}

// ----- MAIN -----
function loop() {
  frames++;
  activeScreen.draw();
  activeScreen.moves();

  makeCollision();

  requestAnimationFrame(loop);
}

loop();
