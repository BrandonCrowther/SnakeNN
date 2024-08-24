const {
  MOVES: { NORTH, EAST, SOUTH, WEST },
  BOARD_SIZE,
} = require("../config");
const { Node } = require("../Objects");

class Agent {
  constructor() {
    this.game = "add later";
  }

  getMoveData() {
    const currentSnake = this.game.snake;
    const currentHead = currentSnake.getHead();
    const currentCheese = this.game.cheese;

    const northNode = new Node(currentHead.x, currentHead.y - 1);
    const eastNode = new Node(currentHead.x + 1, currentHead.y);
    const southNode = new Node(currentHead.x, currentHead.y + 1);
    const westNode = new Node(currentHead.x - 1, currentHead.y);

    const canMoveNorth =
      !northNode.isOOB() && !currentSnake.checkCollision(northNode);
    const canMoveEast =
      !eastNode.isOOB() && !currentSnake.checkCollision(eastNode);
    const canMoveSouth =
      !southNode.isOOB() && !currentSnake.checkCollision(southNode);
    const canMoveWest =
      !westNode.isOOB() && !currentSnake.checkCollision(westNode);

    const ret = [
      {
        legal: canMoveNorth ? 1 : 0,
        distance: this.getNodeDistance(northNode, currentCheese),
        node: northNode,
        move: NORTH,
      },
      {
        legal: canMoveEast ? 1 : 0,
        distance: this.getNodeDistance(eastNode, currentCheese),
        node: eastNode,
        move: EAST,
      },
      {
        legal: canMoveSouth ? 1 : 0,
        distance: this.getNodeDistance(southNode, currentCheese),
        node: southNode,
        move: SOUTH,
      },
      {
        legal: canMoveWest ? 1 : 0,
        distance: this.getNodeDistance(westNode, currentCheese),
        node: westNode,
        move: WEST,
      },
    ];
    const max = Math.max(...ret.map((i) => i.distance));
    return ret.map((i) => {
      i.distanceNormalized = i.distance / max;
      return i;
    });
  }

  getNodeDistance(node, targetNode) {
    const distX =
      node.x > targetNode.x ? node.x - targetNode.x : targetNode.x - node.x;
    const distY =
      node.y > targetNode.y ? node.y - targetNode.y : targetNode.y - node.y;
    return Math.sqrt(distX * distX + distY * distY);
  }
}

module.exports = { Agent };
