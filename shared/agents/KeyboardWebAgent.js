class KeyboardWebAgent {
  constructor() {
    this.lastPress = [0, 1];
    document.addEventListener("keyup", (e) => {
      console.log(e.code);
      switch (e.code) {
        case "ArrowUp":
        case "w":
          this.lastPress = [0, -1];
          break;
        case "ArrowRight":
        case "d":
          this.lastPress = [1, 0];
          break;
        case "ArrowDown":
        case "s":
          this.lastPress = [0, 1];
          break;
        case "ArrowLeft":
        case "a":
          this.lastPress = [-1, 0];
          break;
      }
    });
  }

  getMove() {
    return this.lastPress;
  }
}

module.exports = { KeyboardWebAgent };
