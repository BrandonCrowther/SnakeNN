const { BOARD_SIZE } = require("./config");
const { Game } = require("./Game");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runner(input, publishFunction) {
  while (true) {
    const game = new Game();
    input.game = game;

    let expireGameIn = BOARD_SIZE * BOARD_SIZE;
    let currentLength = 1;

    publishFunction(game.getState());
    await sleep(10);
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

      await sleep(10);
    }

    if (input.fitReplay) {
      await input.fitReplay();
    }
    await sleep(1000);
  }
}

module.exports = {
  runner,
};
