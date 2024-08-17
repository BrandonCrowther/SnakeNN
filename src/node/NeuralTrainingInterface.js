const { BOARD_SIZE, IS_NODE } = require("../shared/config");
// Lol, lmao
const { Node } = require("../shared/Objects");

class NeuralTrainingInterface {
  constructor(game, tfjs) {
    this.newModel();
    this.tf = tfjs;
    this.game = game;
    this.currentIteration = 1;
    this.snakeLength = 1;
    this.inputs = [];
    this.scores = [];
  }

  newModel() {
    this.tf.tidy(() => {
      this.model = this.tf.sequential({
        layers: [
          this.tf.layers.dense({
            units: 4,
            activation: "softmax",
            inputShape: [8],
          }),
        ],
      });
      this.model.compile({
        optimizer: "adam",
        loss: this.tf.metrics.categoricalCrossentropy,
      });
    });
    this.snakeLength = 1;
  }

  getMove() {
    const currentSnake = this.game.snake;
    const currentHead = currentSnake.getHead();
    const currentCheese = this.game.cheese;

    const distX = (currentCheese.x - currentHead.x) / BOARD_SIZE;
    const distY = (currentCheese.y - currentHead.y) / BOARD_SIZE;

    // distance in each direction
    const distSouth = distY >= 0 ? Math.abs(distY) : 0;
    const distNorth = distY <= 0 ? Math.abs(distY) : 0;
    const distEast = distX >= 0 ? Math.abs(distX) : 0;
    const distWest = distX <= 0 ? Math.abs(distX) : 0;

    // hack to check collisions
    const northNode = new Node(currentHead.x, currentHead.y - 1);
    const eastNode = new Node(currentHead.x + 1, currentHead);
    const southNode = new Node(currentHead.x, currentHead.y + 1);
    const westNode = new Node(currentHead.x - 1, currentHead.y);

    const canMoveUp =
      !northNode.isOOB() && currentSnake.checkCollision(northNode) ? 0 : 1;
    const canMoveRight =
      !eastNode.isOOB() && currentSnake.checkCollision(eastNode) ? 0 : 1;
    const canMoveDown =
      !southNode.isOOB() && currentSnake.checkCollision(southNode) ? 0 : 1;
    const canMoveLeft =
      !westNode.isOOB() && currentSnake.checkCollision(westNode) ? 0 : 1;

    const params = [
      // posX,
      // posY,
      // snakeLen,
      distNorth,
      distEast,
      distSouth,
      distWest,
      canMoveUp,
      canMoveRight,
      canMoveDown,
      canMoveLeft,
    ];

    const predict = this.tf.tidy((_) => {
      const tensor = this.tf.tensor2d(params, [1, params.length]);
      return this.model.predict(tensor).flatten().arraySync();
    });

    this.inputs.push(params);

    // for any valid moves apply a minimum training weight as 0.1
    // for any invalid moves, set to 0 because DO NOT WANT
    var testScore = [0, 0, 0, 0];
    if (canMoveUp > 0) testScore[0] = 0.1 + distNorth / 2 / 1.1;
    if (canMoveRight > 0) testScore[1] = 0.1 + distEast / 2 / 1.1;
    if (canMoveDown > 0) testScore[2] = 0.1 + distSouth / 2 / 1.1;
    if (canMoveLeft > 0) testScore[3] = 0.1 + distWest / 2 / 1.1;

    this.scores.push(testScore);

    const move = this.formatMove(predict);
    return move;
  }

  formatMove(move) {
    const processed = move.indexOf(Math.max(...move));
    switch (processed) {
      case 0:
        return [0, -1];
      case 1:
        return [1, 0];
      case 2:
        return [0, 1];
      case 3:
        return [-1, 0];
      default:
        throw new Error("Invalid move provided");
    }
  }

  async save() {
    if (typeof window !== "undefined") {
      // In the browser
      await this.model.save("downloads://" + this.currentIteration);
    } else if (typeof process !== "undefined") {
      const savePath = "file://" + this.currentIteration;
      await this.model.save(savePath);
    } else {
      throw new Error("Unknown environment. Cannot save the model.");
    }
  }

  async fitReplay() {
    const [inputsAsTensor, scoreAsTensor] = this.tf.tidy((_) => [
      this.tf.tensor2d(this.inputs, [
        this.inputs.length,
        this.inputs[0].length,
      ]),
      this.tf.tensor2d(this.scores, [
        this.scores.length,
        this.scores[0].length,
      ]),
    ]);

    await this.model.fit(inputsAsTensor, scoreAsTensor, { epochs: 100 });

    // reset replay
    this.scores = [];
    this.inputs = [];

    scoreAsTensor.dispose();
    inputsAsTensor.dispose();

    this.currentIteration++;
    if (this.currentIteration % 10 === 0) {
      console.log("SCORE: " + this.game.snake.length);
      await this.save();
    }
  }
}

module.exports = { NeuralTrainingInterface };
