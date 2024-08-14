const { BOARD_SIZE } = require("./config");

class Snake {
  constructor(x, y) {
    this.tail = [new Node(x, y)];
  }

  extend(x, y) {
    this.tail.unshift(new Node(x, y));
  }

  shrink() {
    this.tail.pop();
  }

  checkCollisionDeath() {
    const [headNode, ...restNodes] = this.tail;
    return (
      restNodes.some((n) => headNode.equals(n)) ||
      headNode.x === BOARD_SIZE ||
      headNode.y === BOARD_SIZE ||
      headNode.x === -1 ||
      headNode.y === -1
    );
  }

  checkCollisionCheese(node) {
    return this.tail.some((n) => node.equals(n));
  }

  getHead() {
    return this.tail[0];
  }
}

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(node) {
    return this.x === node.x && this.y === node.y;
  }
}
module.exports = { Node, Snake };
