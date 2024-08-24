const {
  MOVES: { NORTH },
} = require("../config");
const { Agent } = require("./Agent");

// Simply takes count of all legal moves, and plays the one that moves it closer
// In the case of no available moves, commit suicide by going north.

class V1AlgorithmAgent extends Agent {
  constructor() {
    super();
  }

  getMove() {
    const moveData = this.getMoveData();
    const availableMoves = moveData
      .filter((i) => i.legal)
      .sort((i, j) => i.distance - j.distance);

    return availableMoves.length > 0 ? availableMoves[0].move : NORTH;
  }
}

module.exports = { V1AlgorithmAgent };
