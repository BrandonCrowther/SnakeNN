const {
  MOVES: { NORTH },
} = require("../config");
const { Agent } = require("./Agent");

class V1AlgorithmAgent extends Agent {
  constructor(game) {
    super(game);
  }

  getMove() {
    const moveData = Object.values(this.getMoveData());
    const availableMoves = moveData
      .filter((i) => i.legal)
      .sort((i, j) => i.distance - j.distance);

    return availableMoves.length > 0 ? availableMoves[0].move : NORTH;
  }
}

module.exports = { V1AlgorithmAgent };
