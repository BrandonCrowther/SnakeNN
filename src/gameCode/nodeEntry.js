const { Game } = require("./Game");
const {
  KeyboardInterfaceNode,
} = require("./inputInterfaces/KeyboardInterfaceNode");

const interface = new KeyboardInterfaceNode();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  while (true) {
    const game = new Game(interface);
    console.table(game.getState());
    await sleep(500);
    while (game.tick()) {
      console.table(game.getState());
      await sleep(500);
    }
    await sleep(3000);
  }
}

main();
