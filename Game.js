const [Snake, Tail, Head, Cheese] = require('./Objects')

global.BOARD_SIZE = 10;
global.EMPTY = 0;
global.HEAD = 1;
global.TAIL = 2;
global.CHEESE = 3;


class Game{
    constructor(input){
        this.input = input;
        this.board = [...Array(BOARD_SIZE)].map(e => Array(BOARD_SIZE).fill(EMPTY));
        this.score = 1
        this.ticks = 0
        this.head = new Head(
            Math.floor((BOARD_SIZE / 4) + (Math.random() * (BOARD_SIZE / 4))), 
            Math.floor((BOARD_SIZE / 4) + (Math.random() * (BOARD_SIZE / 4)))
        )
        this.cheese = this.createNewCheese()

        this.states = []
    }


    tick = () => {
        let move = this.input.getMove(this.head, this.cheese, this.score)
        let oldNode = new Tail(this.head.x, this.head.y)

        if(this.head.next){
            oldNode.next = this.head.next
            this.head.next = oldNode
        }
        else{
            this.head.next = oldNode;
        }
        
        this.head.x += move[0]
        this.head.y += move[1]

        let gameOver = this.head.checkCollision()
        let cheeseFound = this.checkCheese()

        if(cheeseFound){
            this.cheese = this.createNewCheese()
            this.score++
            this.ticks = 0
        }
        else
            this.head.deleteLast()

        this.ticks++

        if(this.ticks == BOARD_SIZE * BOARD_SIZE){
            gameOver = true
        }

        if(!gameOver)
            this.redraw()

        return gameOver;
    }


    checkCheese = () => {
        return (this.head.x == this.cheese.x 
            && this.head.y == this.cheese.y)
    }

    createNewCheese = () => {
        let potX = Math.floor(Math.random() * BOARD_SIZE)
        let potY = Math.floor(Math.random() * BOARD_SIZE)

        const snakePos = this.head.getPositions()

        while(snakePos.find(x => x[0] == potX && x[1] == potY)){
            potX = Math.floor(Math.random() * BOARD_SIZE)
            potY = Math.floor(Math.random() * BOARD_SIZE)
        }

        return new Cheese(potX, potY);
    }


    redraw = () => {
        this.board = [...Array(BOARD_SIZE)].map(e => Array(BOARD_SIZE).fill(EMPTY));
        let positions = this.head.getPositions()

        positions.forEach((coords) => {
            this.board[coords[1]][coords[0]] = TAIL;
        })
        
        this.board[this.head.y][this.head.x] = HEAD;
        this.board[this.cheese.y][this.cheese.x] = CHEESE;

        this.states.push(this.board)
        
    }

    getScore = () => this.score * this.ticks
    
}


module.exports = Game