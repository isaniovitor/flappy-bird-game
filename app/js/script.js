console.log("hay ya!");

const sprites = new Image();
sprites.src = "./img/sprites.png";

const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");

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
  jmp: 5,
  mov: [
    { srcX: 0, srcY: 0 }, //up
    { srcX: 0, srcY: 26 }, // middle
    { srcX: 0, srcY: 52 }, // down
  ],
  wings() {
    //this.srcX = this.mov[0].srcX;
    if (bird.srcY == bird.mov[0].srcY) {
      bird.srcY = bird.mov[1].srcY;
    } else if (bird.srcY == bird.mov[1].srcY) {
      bird.srcY = bird.mov[2].srcY;
    } else {
      bird.srcY = bird.mov[0].srcY;
    }
  },
  jump() {
    //bird.canY = bird.canY - 50;
    bird.vel = -bird.jmp;
    console.log(bird.canY);
  },
};

const floor = {
  srcX: 0,
  srcY: 618,
  w: 220,
  h: 112,
  canX: 0,
  canY: canvas.height - 105,
  canW: canvas.width * 2, // width relative to game´s screen (320) -- * 2 for floor movimentation
};

function createPipe(x, y) {
  const pipe = {
    //???
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
    },
    moves() {
      fall();
      bird.wings();
      bgmovement();
      bird.wings();

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
    },
    moves() {
      bird.vel = 0;
    },
  },
};

// default screen
let activeScreen = screens.startScreen;

// click events
window.onclick = function () {
  // fist click
  if (
    activeScreen == screens.startScreen ||
    activeScreen == screens.gameOverScreen
  ) {
    bird.canY = 50;
    //resetgame();
    activeScreen = screens.gameScreen;
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

// function translatePipes(pipes){
//   pipes.floor.canX--;
//   pipes.sky.canX--;
// }
function resetPipes() {
  pipes[0] = createPipe(320, 230);
  pipes[1] = createPipe(501, 200);
}

function collision(pipe) {
  const birdHead = bird.canY;
  const birdFoot = bird.canY + bird.h;
  //console.log(pipe.sky.canY );

  // bird.canX + bird.w = bird's beak
  if (bird.canX + bird.w >= pipe.floor.canX) {
    //(canvas.height + pipe.sky.canY) sky.canY is oq soboru de tela para o cano
    //Ex: 200 (cade de baixo) + 80 (espace) = - 280
    // 400 - 280 = 120 -> sky pipe espace
    if (birdHead <= canvas.height + pipe.sky.canY) {
      //console.log(pipe.sky.canY);

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
  //console.log(bird.vel);

  return (bird.canY = bird.canY + bird.vel);
}

function bgmovement() {
  floor.canX = floor.canX - 2;

  // repit floor
  if (floor.canX <= -canvas.width) {
    floor.canX = 0;
    //console.log("move");
  }
}

function makeCollision() {
  if (bird.canY >= floor.canY - bird.h) {
    activeScreen = screens.gameOverScreen;
    resetPipes();
    console.log("over");
  }
}

// ----- MAIN -----
function loop() {
  //let activeScreen = { startScreen };
  //fall();
  // activeScreen = screens.startScreen;
  activeScreen.draw();
  activeScreen.moves();

  makeCollision();

  requestAnimationFrame(loop);
}

loop();
// setInterval(1000 / 30);
