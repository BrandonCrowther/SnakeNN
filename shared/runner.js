const { BOARD_SIZE, TICK_RATE } = require("./config");
const { Game } = require("./Game");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const repeat = true;

class Runner {
  constructor(input, publishFunction) {
    this.input = input;
    this.publishFunction = publishFunction;
    this.reset();
  }

  reset() {
    this.currentGame = new Game();
  }
}

async function runner(input, publishFunction) {
  do {
    const game = new Game();
    input.game = game;

    let expireGameIn = BOARD_SIZE * BOARD_SIZE;
    let currentLength = 1;

    publishFunction(game.getState());
    await sleep(TICK_RATE);
    while (game.tick(input.getMove())) {
      expireGameIn--;
      publishFunction(game.getState());
      if (currentLength !== game.snake.tail.length) {
        currentLength++;
        expireGameIn = BOARD_SIZE * BOARD_SIZE;
      }

      if (expireGameIn === 0) {
        break;
      }

      await sleep(TICK_RATE);
    }

    if (input.fitReplay) {
      await input.fitReplay();
    }
    // await sleep(1000);
  } while (repeat);
}

module.exports = {
  runner,
};
