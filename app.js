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

const EGG_FREQUENCY_CHANGE_A = 450;
const EGG_SPEED_CHANGE_A = 40;

const EGG_FREQUENCY_CHANGE_B = 800;
const EGG_SPEED_CHANGE_B = 80;

class Game {
  constructor() {
    this.score = 0;
    this.lives = 0;
    this.eggFrequency = 2000;
    this.eggSpeed = 1000;
    this.wolf = new Wolf();
    this.isEnded = false;
    this.intervalId = null;
    this.gameStarted = false;
    this.previousEggState = "";
    this.gameType = "A";
  }

  start() {
    document.addEventListener('keydown', this.handleKeyDown);

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
      if (!this.eggCrashed) {
        egg.fall(); // Start falling only if there is no crash
        egg.timeOfExistence = 0;
      }
      //slow down the game
      if (this.score % 100 == 0) {
        this.eggFrequency = 4000;
      }
      //remove lifes when the score is at some point
      if (this.score == 200 || this.score == 500 || this.score == 1000) {
        this.lives = 0;
        document.querySelectorAll('.life').forEach(lifeElement => {
          livesBoxElement.removeChild(lifeElement);
        });
      }
      //speeding up the game
      if (this.score % 10 == 0 && this.eggFrequency >= 1000 && this.eggSpeed >= 500 ) {
        if (this.gameType == "A") {
          this.eggFrequency -= EGG_FREQUENCY_CHANGE_A;
          this.eggSpeed -= EGG_SPEED_CHANGE_A;
        } else {
          this.eggFrequency -= EGG_FREQUENCY_CHANGE_B;
          this.eggSpeed -= EGG_SPEED_CHANGE_B;
        }
      };

      document.documentElement.style.setProperty("--animationDurationEgg", `${this.eggSpeed*4.1}ms`);
    }, this.eggFrequency);
  }

  end() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.isEnded = true;
    let gameOverSound = new Audio('sounds/gameOver.mp3');
    gameOverSound.play();
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
  }

  updateScore() {
    this.score += 1;
    scoreElement.innerHTML = this.score;
    let collectSound = new Audio('sounds/collect.mp3');
    collectSound.play();
  }

  updateLives() {
    this.lives += 1;
    if (this.lives <= 3) {
      let lifeSound = new Audio('sounds/lifeDown.mp3');
      lifeSound.play();
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
    this.state = "top-left";
  }

  moveLeft() {
    if (this.up) {
        wolfElement.style.backgroundImage = "url('assets/wolf_LeftUp.svg')";
        this.state = "top-left"; 
    } else {
        wolfElement.style.backgroundImage = "url('assets/wolf_LeftDown.svg')";
        this.state = "bottom-left"; 
    }
    document.documentElement.style.setProperty("--wolfPositionX", "calc(65px*var(--multiplier))");
    this.right = false;
    this.left = true;
  }

  moveRight() {
    if (this.up) {
        wolfElement.style.backgroundImage = "url('assets/wolf_RightUp.svg')";
        this.state = "top-right"; 
     } else {
        wolfElement.style.backgroundImage = "url('assets/wolf_RightDown.svg')";
        this.state = "bottom-right"; 
     }
    document.documentElement.style.setProperty("--wolfPositionX", "calc(125px*var(--multiplier))");
    this.right = true;
    this.left = false;
  }

  moveUp() {
    if (this.left) {
        wolfElement.style.backgroundImage = "url('assets/wolf_LeftUp.svg')";
        this.state = "top-left"; 
     } else {
        wolfElement.style.backgroundImage = "url('assets/wolf_RightUp.svg')";
        this.state = "top-right";
     }
    this.up = true;
    this.down = false;
  }

  moveDown() {
    if (this.left) {
        wolfElement.style.backgroundImage = "url('assets/wolf_LeftDown.svg')";
        this.state = "bottom-left"; 
     } else {
        wolfElement.style.backgroundImage = "url('assets/wolf_RightDown.svg')";
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
    // prevent eggs to slide directly after each other
    while (this.state === game.previousEggState) {
      this.state = eggOptions[Math.floor(Math.random() * eggOptions.length)];
    };
    game.previousEggState = this.state;
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
      if (self.timeOfExistence === 4 && !game.isEnded) {
        clearInterval(interval);
        game.wolf.checkCollision(self);
        gameBoardElement.removeChild(eggElement);
      }

      // let eggSound = new Audio('sounds/egg.mp3');
      // eggSound.play();
    
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

startBtn1.addEventListener('click', () => {
 if (game.isEnded) {
  location.reload();
 }
 if (!game.gameStarted) {
      game.start();
      game.gameStarted = true;
      game.gameType = "A";
    }
});

startBtn2.addEventListener('click', () => {
  if (game.isEnded) {
    location.reload();
  }
  if (!game.gameStarted) {
        game.eggSpeed = 1200;
        game.eggFrequency = 4000;
        game.start();
        game.gameStarted = true;
        game.gameType = "B";
        game.eggSpeed = 800;
        game.eggFrequency = 4000;
      }
});

function responsibility() {
  const gameContainerWidth = gameContainerElement.offsetWidth;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const regex = /\((.*?)px/;

  const containerHeightString = getComputedStyle(document.documentElement).getPropertyValue('--gameContainerHeight'); 
  const containerHeight = parseInt(containerHeightString.match(regex)[1]);

  const containerWidhtString = getComputedStyle(document.documentElement).getPropertyValue('--gameContainerWidth'); 
  const containerWidth = parseInt(containerHeightString.match(regex)[1]);

  const newMultiplierBasedOnHeight = windowHeight/containerHeight;
  const newMultiplierBasedOnWidth = windowWidth/containerWidth;

   if (windowWidth < 1400) {
    if (windowWidth / windowHeight < 1.6) {
      document.documentElement.style.setProperty("--multiplier", `${newMultiplierBasedOnWidth/2}`);
    } else {
      document.documentElement.style.setProperty("--multiplier", `${newMultiplierBasedOnHeight}`);
    }
   } else {
    document.documentElement.style.setProperty("--multiplier", "2.5");
   }
}

window.addEventListener('resize', responsibility);
window.addEventListener('load', responsibility);
