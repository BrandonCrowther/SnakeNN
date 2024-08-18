module.exports = {
  BOARD_SIZE: 10,
  TICK_RATE: 1,
  IS_NODE: typeof window === "undefined",
  ENTITY_CODES: {
    EMPTY: "-",
    HEAD: "H",
    TAIL: "S",
    CHEESE: "C",
  },
  MOVES: {
    NORTH: [0, -1],
    EAST: [1, 0],
    SOUTH: [0, 1],
    WEST: [-1, 0],
  },
};
