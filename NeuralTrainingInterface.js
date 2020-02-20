// import * as tf from '@tensorflow/tfjs-node-gpu'
const tf = require('@tensorflow/tfjs-node');
const [Snake, Tail, Head, Cheese] = require('./Objects')

class NeuralTrainingInterface{
    constructor(){
        this.newModel()

        this.inputs = []
        this.scores = []
    }

    newModel(){      
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({units: 16, activation: "sigmoid", inputShape: [8]}),
                tf.layers.dense({units: 32, activation: "sigmoid"}),
                tf.layers.dense({units: 4, activation: "softmax"})
            ]
        })
        this.model.compile({
            optimizer: 'adam',
            loss: tf.metrics.categoricalCrossentropy,
        })
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

        // console.log(head.getPositions())


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

        const tensor =  tf.tensor2d(params, [1, params.length])

        let predict = this.model.predict(tensor).flatten().arraySync()

        this.inputs.push(params)


        const hack = distNorth + distEast + distSouth + distWest;

        // for any valid moves apply a minimum training weight as 0.1
        // for any invalid moves, set to 0 because DO NOT WANT
        let testScore = [0,0,0,0]
        if(canMoveUp > 0)
            testScore[0] = 0.1 + (distNorth / 2) / 1.1
        if(canMoveRight > 0)
            testScore[1] = 0.1 + (distEast / 2) / 1.1
        if(canMoveDown > 0)
            testScore[2] = 0.1 + (distSouth / 2) / 1.1
        if(canMoveLeft > 0)
            testScore[3] = 0.1 + (distWest / 2) / 1.1

        this.scores.push(testScore)

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

    async save(score){
        await this.model.save('file://./models/' + score)
    }

    async fitReplay(){

        let inputsAsTensor = tf.tensor2d(this.inputs, [this.inputs.length, this.inputs[0].length])
        let scoreAsTensor = tf.tensor2d(this.scores, [this.scores.length, this.scores[0].length])

        await this.model.fit(inputsAsTensor, scoreAsTensor, {
            epochs: 1
        })

        // reset replay
        this.scores = []
        this.inputs = []
    }

}

module.exports = NeuralTrainingInterface