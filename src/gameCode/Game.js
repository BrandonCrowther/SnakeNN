const { Node, Snake } = require("./Objects");
const { BOARD_SIZE } = require("./config");

const EMPTY = "-";
const HEAD = "H";
const TAIL = "S";
const CHEESE = "C";

class Game {
  constructor(input) {
    this.input = input;
    this.snake = new Snake(
      Math.floor(BOARD_SIZE / 4 + Math.random() * (BOARD_SIZE / 4)),
      Math.floor(BOARD_SIZE / 4 + Math.random() * (BOARD_SIZE / 4))
    );
    this.cheese = new Node(
      Math.floor(BOARD_SIZE / 4 + Math.random() * (BOARD_SIZE / 4)),
      Math.floor(BOARD_SIZE / 4 + Math.random() * (BOARD_SIZE / 4))
    );
  }

  getState() {
    let boardState = [...Array(BOARD_SIZE)].map((e) =>
      Array(BOARD_SIZE).fill(EMPTY)
    );

    this.snake.tail.forEach((n, index) => {
      boardState[n.y][n.x] = index === 0 ? HEAD : TAIL;
    });
    boardState[this.cheese.y][this.cheese.x] = CHEESE;

    return boardState;
  }

  tick() {
    const nextMove = this.input.getMove();
    const newHead = new Node(
      this.snake.tail[0].x + nextMove[0],
      this.snake.tail[0].y + nextMove[1]
    );

    this.snake.extend(newHead.x, newHead.y);
    if (this.snake.checkCollisionCheese(this.cheese)) {
      this.replaceCheese();
    } else this.snake.shrink();

    return !this.snake.checkCollisionDeath();
  }

  replaceCheese() {
    this.cheese = new Node(
      Math.floor(Math.random() * BOARD_SIZE),
      Math.floor(Math.random() * BOARD_SIZE)
    );
  }
}

module.exports = { Game };
