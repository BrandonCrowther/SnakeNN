class KeyboardNodeAgent {
  constructor() {
    this.lastPress = [0, 1];
    this.setupInputListener();
  }

  setupInputListener() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key) => {
      switch (key) {
        case "\u001B\u005B\u0041": // Up arrow
        case "w":
          this.lastPress = [0, -1];
          break;
        case "\u001B\u005B\u0043": // Right arrow
        case "d":
          this.lastPress = [1, 0];
          break;
        case "\u001B\u005B\u0042": // Down arrow
        case "s":
          this.lastPress = [0, 1];
          break;
        case "\u001B\u005B\u0044": // Left arrow
        case "a":
          this.lastPress = [-1, 0];
          break;
        case "\u0003": // Ctrl+C
          process.exit();
        // eslint-disable-next-line no-fallthrough
        default:
          throw new Error("Invalid input");
      }
    });
  }

  getMove() {
    return this.lastPress;
  }
}

module.exports = { KeyboardNodeAgent };
