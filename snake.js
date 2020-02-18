import * as tf from '@tensorflow/tfjs-node-gpu'

const BOARD_SIZE = 10;
const EMPTY = 0;
const HEAD = 1;
const TAIL = 2;
const FOOD = 3;
const CHEESE = 4;

const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;

class Snake{
    constructor(x, y, next = undefined){
        this.x = x;
        this.y = y;
        this.next = next;
    }


    deleteLast = () => {
        if(this.next){
            if(this.next.next){
                return this.next.deleteLast()
            }
            else{
                this.next = null;
                return true;
            }
        }
    }

}

class Tail extends Snake{}

class Head extends Snake{
    checkCollision = () => {
        let node = this.next;

        while(node != null){
            if(this.x == node.x && this.y == node.y)
                return true;
            node = node.next;
        }

        if(this.x == BOARD_SIZE || this.x < 0)
            return true;
        if(this.y == BOARD_SIZE || this.y < 0)
            return true;

        return false;
    }
    
    getPositions = () => {
        let arr = [[this.x, this.y]]
        let node = this.next;
        while(node != null){
            arr.push([node.x, node.y])
            node = node.next;
        }
        return arr;
    }
}

class Cheese{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}





class Game{
    constructor(input){
        this.input = input;
        this.board = [...Array(BOARD_SIZE)].map(e => Array(BOARD_SIZE).fill(EMPTY));
        this.cheese = this.createNewCheese()
        this.score = 0
        this.head = new Head(
            Math.floor((BOARD_SIZE / 4) + (Math.random() * (BOARD_SIZE / 4))), 
            Math.floor((BOARD_SIZE / 4) + (Math.random() * (BOARD_SIZE / 4)))
        )
    }


    tick = () => {
        let move = this.input.getMove()
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
            this.score++;
        }
        else
            this.head.deleteLast()

        if(!gameOver)
            this.redraw()

        return gameOver;
    }


    checkCheese = () => {
        return (this.head.x == this.cheese.x 
            && this.head.y == this.cheese.y)
    }

    createNewCheese = () => {
        return new Cheese(  
            Math.floor(Math.random() * BOARD_SIZE), 
            Math.floor(Math.random() * BOARD_SIZE)
        );
    }


    redraw = () => {
        this.board = [...Array(BOARD_SIZE)].map(e => Array(BOARD_SIZE).fill(EMPTY));
        let positions = this.head.getPositions()

        positions.forEach((coords) => {
            this.board[coords[1]][coords[0]] = TAIL;
        })
        
        this.board[this.head.y][this.head.x] = HEAD;
        this.board[this.cheese.y][this.cheese.x] = CHEESE;
        
    }

    getScore = () => this.score
    
}


class KeyboardInterface{
    constructor(){
        this.lastPress = DOWN;

        document.addEventListener('keyup', (e) => {
            if(e.code === "ArrowUp")
                this.lastPress = UP;
            if(e.code === "ArrowRight")
                this.lastPress = RIGHT;
            if(e.code === "ArrowDown")
                this.lastPress = DOWN;
            if(e.code === "ArrowLeft")
                this.lastPress = LEFT;
        })

    }

    getMove() {
        return this.formatKeyPress()
    }

    formatKeyPress() {
        if(this.lastPress == UP)
            return [0, -1]
        if(this.lastPress == RIGHT)
            return [1, 0]
        if(this.lastPress == DOWN)
            return [0, 1]
        if(this.lastPress == LEFT)
            return [-1, 0]
    }
}


class NeuralInterface{
    constructor(){
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({units: 2, activation: "sigmoid", inputShape: [2]}),
                tf.layers.dense({units: 4, activation: "softmax"})
            ]
        })

        model.compile({
            optimizer: 'sgd',
            loss: 'categoricalCrossentropy',
            metrics: []
        })
    }

    getMove(head, cheese) {
        let distX = (head.x - cheese.x) / BOARD_SIZE
        let distY = (head.y - cheese.y) / BOARD_SIZE
        let canMoveUp =     new Head(head.x, head.y - 1, head.next).checkCollision() ? -1 : 1
        let canMoveRight =  new Head(head.x + 1, head.y, head.next).checkCollision() ? -1 : 1
        let canMoveDown =   new Head(head.x, head.y + 1, head.next).checkCollision() ? -1 : 1
        let canMoveLeft =   new Head(head.x - 1, head.y, head.next).checkCollision() ? -1 : 1

        let predict = this.model.predict([
            distX, 
            distY, 
            canMoveUp, 
            canMoveRight, 
            canMoveDown, 
            canMoveLeft
        ]).toArray()

        return this.formatMove(predict)
    }

    formatMove(tensor) {
        if(tensor[0] == 1) //N
            return [0, -1]
        if(tensor[1] == 1) //E
            return [1, 0]
        if(tensor[2] == 1) //S
            return [0, 1]
        if(tensor[3] == 1) //W
            return [-1, 0]
    }

    save(){
        this.model.save("/best")
    }

}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function run(){
    let input = new KeyboardInterface();
    let game = new Game(input);
    let done = false;
    while(!done){
        await sleep(1000);
        done = game.tick();
        console.table(game.board)
    }


    let topScore = 0;
    while(true){
        let nn = new NeuralInterface();
        let game = new Game(nn)
        let done = false;
        while(!done){
            done = game.tick();
        }
        if(game.score > topScore){
            nn.save()
            topScore = game.score;
        }
    }
}

run();
