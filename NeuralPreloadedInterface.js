

const [Snake, Tail, Head, Cheese] = require('./Objects')

class NeuralPreloadedInterface{
    constructor(model, tf){
        this.model = model
        this.tf = tf
    }

    getMove(head, cheese, score) {
        const posX = head.x / BOARD_SIZE
        const posY = head.y / BOARD_SIZE
        const snakeLen = head.getLength() / (BOARD_SIZE * BOARD_SIZE)

        const distX = (cheese.x - head.x) / BOARD_SIZE
        const distY = (cheese.y - head.y) / BOARD_SIZE

        // distance in each direction
        const distSouth = distY >= 0 ? Math.abs(distY) : 0
        const distNorth = distY <= 0 ? Math.abs(distY) : 0
        const distEast =  distX >= 0 ? Math.abs(distX) : 0
        const distWest =  distX <= 0 ? Math.abs(distX) : 0

        // hack to check collisions because I didnt think far enough ahead
        const canMoveUp =     new Head(head.x, head.y - 1, head.next).checkCollision() ? 0 : 1
        const canMoveRight =  new Head(head.x + 1, head.y, head.next).checkCollision() ? 0 : 1
        const canMoveDown =   new Head(head.x, head.y + 1, head.next).checkCollision() ? 0 : 1
        const canMoveLeft =   new Head(head.x - 1, head.y, head.next).checkCollision() ? 0 : 1

        const params = [
            posX,
            posY,
            snakeLen,
            distNorth,
            distEast,
            distSouth,
            distWest,
            canMoveUp, 
            canMoveRight, 
            canMoveDown, 
            canMoveLeft
        ]

        
        const predict = tf.tidy(_ => {
            const tensor =  tf.tensor2d(params, [1, params.length])
            return this.model.predict(tensor).flatten().arraySync()
        })
        

        const move = this.formatMove(predict)
        return move
    }

    formatMove(move) {
        // console.log(move)
        const processed = move.indexOf(Math.max(...move));
        if(processed == 0) //N
            return [0, -1]
        if(processed == 1) //E
            return [1, 0]
        if(processed == 2) //S
            return [0, 1]
        if(processed == 3) //W
            return [-1, 0]
    }

}


module.exports = NeuralPreloadedInterface