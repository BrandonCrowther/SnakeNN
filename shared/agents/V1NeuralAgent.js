const { Agent } = require("./Agent");
const {
  MOVES: { NORTH, EAST, SOUTH, WEST },
} = require("../config");

class V1NeuralAgent extends Agent {
  constructor(tf, model = null) {
    super();
    this.tf = tf;
    this.trainingEnabled = model === null;
    if (model === null) {
      this.newModel();
    } else {
      this.model = model;
    }
    this.currentIteration = 1;
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
  }

  getMove() {
    const moveData = this.getMoveData();

    const northData = moveData[0];
    const eastData = moveData[1];
    const southData = moveData[2];
    const westData = moveData[3];

    const params = [
      northData.distanceNormalized,
      eastData.distanceNormalized,
      southData.distanceNormalized,
      westData.distanceNormalized,
      northData.legal,
      eastData.legal,
      southData.legal,
      westData.legal,
    ];

    const predict = this.tf.tidy((_) => {
      const tensor = this.tf.tensor2d(params, [1, params.length]);
      return this.model.predict(tensor).flatten().arraySync();
    });

    // for any valid moves apply a minimum training weight as 0.01
    // for any invalid moves, set to 0 because DO NOT WANT
    var suggestedOutput = [
      northData.legal ? 0.01 + (1 - northData.distanceNormalized) : 0,
      eastData.legal ? 0.01 + (1 - eastData.distanceNormalized) : 0,
      southData.legal ? 0.01 + (1 - southData.distanceNormalized) : 0,
      westData.legal ? 0.01 + (1 - westData.distanceNormalized) : 0,
    ];

    this.inputs.push(params);
    this.scores.push(suggestedOutput);
    console.log(params);

    const move = this.formatMove(predict);
    console.log(move);
    return move;
  }

  formatMove(move) {
    const processed = move.indexOf(Math.max(...move));
    switch (processed) {
      case 0:
        return NORTH;
      case 1:
        return EAST;
      case 2:
        return SOUTH;
      case 3:
        return WEST;
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
    if (!this.trainingEnabled) {
      return;
    }
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
    if (this.currentIteration % 100 === 0) {
      console.log("SCORE: " + this.game.snake.length);
      await this.save();
    }
  }
}

module.exports = { V1NeuralAgent };
