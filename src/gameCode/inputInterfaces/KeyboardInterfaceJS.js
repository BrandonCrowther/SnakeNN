class KeyboardInterfaceJs {
  constructor() {
    this.lastPress = [0, 1];
    document?.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "ArrowUp":
        case "w":
          lastPress = [0, -1];
        case "ArrowRight":
        case "d":
          lastPress = [1, 0];
        case "ArrowDown":
        case "s":
          lastPress = [0, 1];
        case "ArrowLeft":
        case "a":
          lastPress = [-1, 0];
      }
    });
  }

  getMove() {
    return this.lastPress;
  }
}

module.exports = { KeyboardInterfaceJs };
