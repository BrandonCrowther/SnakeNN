

const [Snake, Tail, Head, Cheese] = require('./Objects')

class NeuralPreloadedInterface{
    constructor(model, tf){
        this.model = model
        this.tf = tf
    }

    getMove(head, cheese, score) {
        const distX = (cheese.x - head.x) / BOARD_SIZE
        const distY = (cheese.y - head.y) / BOARD_SIZE

        // distance in each direction
        let distSouth = distY >= 0 ? Math.abs(distY) : 0
        let distNorth = distY <= 0 ? Math.abs(distY) : 0
        let distEast =  distX >= 0 ? Math.abs(distX) : 0
        let distWest =  distX <= 0 ? Math.abs(distX) : 0

        // hack to check collisions because I didnt think far enough ahead
        let canMoveUp =     new Head(head.x, head.y - 1, head.next).checkCollision() ? -1 : 1
        let canMoveRight =  new Head(head.x + 1, head.y, head.next).checkCollision() ? -1 : 1
        let canMoveDown =   new Head(head.x, head.y + 1, head.next).checkCollision() ? -1 : 1
        let canMoveLeft =   new Head(head.x - 1, head.y, head.next).checkCollision() ? -1 : 1

        const params = [
            distNorth,
            distEast,
            distSouth,
            distWest,
            canMoveUp, 
            canMoveRight, 
            canMoveDown, 
            canMoveLeft
        ]

        const tensor =  this.tf.tensor2d(params, [1, params.length])
        let predict = this.model.predict(tensor).flatten().arraySync()

        return this.formatMove(predict)
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