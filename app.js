const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const wolfElement = document.getElementById('wolf');
const gameContainerElement = document.querySelector('.game-container');
const gameBoardElement = document.getElementById('gameBoard');
const livesBoxElement = document.getElementById('livesBox');

const startBtn1 = document.getElementById('startBtn1');
const startBtn2 = document.getElementById('startBtn2');

const leftTopBtn = document.getElementById('leftTopBtn');
const leftBottomBtn = document.getElementById('leftBottomBtn');
const rightTopBtn = document.getElementById('rightTopBtn');
const rightBottomBtn = document.getElementById('rightBottomBtn');

class Game {
  constructor() {
    this.score = 0;
    this.lives = 0;
    this.eggFrequency = 3000;
    this.eggSpeed = 1000;
    this.wolf = new Wolf();
    this.isEnded = false;
    this.intervalId = null;
    this.gameStarted = false;
  }

  start() {
    document.addEventListener('keydown', this.handleKeyDown);
    this.intervalId = setInterval(() => {
      if (this.isEnded) { 
        clearInterval(this.intervalId);
        document.querySelectorAll('.egg').forEach(egg => {
          egg.style.animationPlayState = 'paused';
          gameBoardElement.removeChild(egg);
        });
        return;
      }
      const egg = new Egg();
      egg.fall();
    }, this.eggFrequency);
  }

  end() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.isEnded = true;
  }

  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowLeft':
        game.wolf.moveLeft();
        break;
      case 'ArrowRight':
        game.wolf.moveRight();
        break;
      case 'ArrowUp':
        game.wolf.moveUp();
        break;
      case 'ArrowDown':
        game.wolf.moveDown();
        break;
      default:
        break;
    }

    leftBottomBtn.addEventListener('click', () => {
      game.wolf.moveLeft();
      game.wolf.moveDown();
    });
    leftTopBtn.addEventListener('click', () => {
      game.wolf.moveLeft();
      game.wolf.moveUp();
    });
    rightBottomBtn.addEventListener('click', () => {
      game.wolf.moveRight();
      game.wolf.moveDown();
    });
    rightTopBtn.addEventListener('click', () => {
      game.wolf.moveRight();
      game.wolf.moveUp();
    });
  }

  updateScore() {
    this.score += 1;
    scoreElement.innerHTML = this.score;
  }

  updateLives() {
    this.lives += 1;
    if (this.lives <= 3) {
      let lifeElement = document.createElement('div');
      lifeElement.classList.add('life');
      livesBoxElement.appendChild(lifeElement); 
    }
    if (this.lives === 3) {
      this.end();
    }
  }

  chickenRun(state) {
    let side = state.split("-")[1];
    let chicken = document.createElement('div');
    chicken.classList.add('chicken-running');
    if (side === "left") {
      chicken.classList.add('running-left');
    } else {
      chicken.classList.add('running-right');
    }
    gameBoardElement.appendChild(chicken);
    setTimeout(() => {
      gameBoardElement.removeChild(chicken);
    }, 2000);
  }
}


class Wolf {
  constructor() {
    this.left = true;
    this.right = false;
    this.up = true;
    this.down = false;
    this.state = "bottom-left";
  }

  moveLeft() {
    if (this.up) {
        wolfElement.style.backgroundImage = "url('assets/wolf_leftUp.svg')";
        this.state = "top-left"; 
    } else {
        wolfElement.style.backgroundImage = "url('assets/wolf_leftDown.svg')";
        this.state = "bottom-left"; 
    }
    document.documentElement.style.setProperty("--wolfPositionX", "calc(65px*var(--multiplier))");
    this.right = false;
    this.left = true;
  }

  moveRight() {
    if (this.up) {
        wolfElement.style.backgroundImage = "url('assets/wolf_rightUp.svg')";
        this.state = "top-right"; 
     } else {
        wolfElement.style.backgroundImage = "url('assets/wolf_rightDown.svg')";
        this.state = "bottom-right"; 
     }
    document.documentElement.style.setProperty("--wolfPositionX", "calc(125px*var(--multiplier))");
    this.right = true;
    this.left = false;
  }

  moveUp() {
    if (this.left) {
        wolfElement.style.backgroundImage = "url('assets/wolf_leftUp.svg')";
        this.state = "top-left"; 
     } else {
        wolfElement.style.backgroundImage = "url('assets/wolf_rightUp.svg')";
        this.state = "top-right";
     }
    this.up = true;
    this.down = false;
  }

  moveDown() {
    if (this.left) {
        wolfElement.style.backgroundImage = "url('assets/wolf_leftDown.svg')";
        this.state = "bottom-left"; 
     } else {
        wolfElement.style.backgroundImage = "url('assets/wolf_rightDown.svg')";
        this.state = "bottom-right";
     }
    this.up = false;
    this.down = true;
  }

  checkCollision(egg) {
    if (this.state === egg.state) {
      game.updateScore();
    } else {
      game.updateLives();
      egg.crash();
    }
  }
}


class Egg {

  constructor() {
    let eggOptions = ["bottom-left", "bottom-right", "top-left", "top-right"];
    this.state = eggOptions[Math.floor(Math.random() * eggOptions.length)];
    this.timeOfExistence = 0;
  }

  fall() { 
    let eggElement = document.createElement('div');
    eggElement.classList.add('egg');
    eggElement.classList.add(`egg-${this.state}`);
    gameBoardElement.appendChild(eggElement);

    const self = this;

    const interval = setInterval(() => {
    self.timeOfExistence += 1;
    if (self.timeOfExistence === 4) {
      clearInterval(interval);
      game.wolf.checkCollision(self);
      gameBoardElement.removeChild(eggElement);
    }
      }, game.eggSpeed);
  }

  crash() {
    if (!game.isEnded) {
      let crashedEggElement = document.createElement('div');
      crashedEggElement.classList.add('egg-crashed');
      crashedEggElement.classList.add(`egg-crashed-${this.state}`);
      gameBoardElement.appendChild(crashedEggElement);

      setTimeout(() => {
        gameBoardElement.removeChild(crashedEggElement);
      }, 1000);

      game.chickenRun(this.state);
    }
  }
}

const game = new Game();

document.documentElement.style.setProperty("--animationDurationEgg", `${game.eggSpeed*4}ms`);

startBtn1.addEventListener('click', () => {
 if (!game.gameStarted) {
      game.start();
      game.gameStarted = true;
    }
});

startBtn2.addEventListener('click', () => {
  if (!game.gameStarted) {
        game.eggSpeed = 1200;
        game.eggFrequency = 4000;
        game.start();
        game.gameStarted = true;
      }
});


window.addEventListener('resize', () => {
  let gameContainerWidth = gameContainerElement.offsetWidth;
  let windowWidth = window.innerWidth;
  let multiplierChanged = windowWidth / 473;
   if (windowWidth < 1000) {
    document.documentElement.style.setProperty("--multiplier", `${multiplierChanged*0.7}`);
   } else if (windowWidth >= 1000 && windowWidth < 1200) {
    document.documentElement.style.setProperty("--multiplier", "2");
   } else {
    document.documentElement.style.setProperty("--multiplier", "2.5");
   }
   
});

