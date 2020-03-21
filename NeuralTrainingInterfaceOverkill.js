const [Snake, Tail, Head, Cheese] = require('./Objects')

class NeuralTrainingInterfaceOverkill{
    constructor(){
        this.newModel()

        this.inputs = []
        this.scores = []
    }

    newModel(){
        const inputShape = 8//(BOARD_SIZE * BOARD_SIZE) * 3
        tf.tidy(() => {
            this.model = tf.sequential({
                layers: [
                    // tf.layers.dense({units: 8, inputShape: [inputShape]}),
                    // tf.layers.dense({
                    //     units: 16, activation: "sigmoid"}),
                    tf.layers.dense({units: 4, activation: "softmax", inputShape: [inputShape]})
                ]
            })
            this.model.compile({
                optimizer: 'adam',
                loss: tf.metrics.categoricalCrossentropy,
            })
        })
    }

    getMove(head, cheese, score, board) {

        const cheeseBoard = [...Array(BOARD_SIZE)].map(e => Array(BOARD_SIZE).fill(EMPTY));
        const scaryBoard = [...Array(BOARD_SIZE)].map(e => Array(BOARD_SIZE).fill(EMPTY));
        const headBoard = [...Array(BOARD_SIZE)].map(e => Array(BOARD_SIZE).fill(EMPTY));


        for(var i = 0; i < BOARD_SIZE; i++){
            for(var j = 0; j < BOARD_SIZE; j++){
                if(board[i][j] == CHEESE)
                    cheeseBoard[i][j] = 1
                if(board[i][j] == TAIL)
                    scaryBoard[i][j] = 1
                if(board[i][j] == HEAD)
                    headBoard[i][j] = 1
            }
        }

        // flatten the various board representations into a linearsequence of numbers
        const params = cheeseBoard.flat().concat(scaryBoard.flat().concat(headBoard.flat()))


        return tf.tidy(_ => {
            const tensor =  tf.tensor2d(params, [1, params.length])
            const predict = this.model.predict(tensor).flatten().arraySync()
    
            return this.formatMove(predict)
        })
    }

    getMove2(head, cheese, score) {
        const distX = (cheese.x - head.x) / BOARD_SIZE
        const distY = (cheese.y - head.y) / BOARD_SIZE

        // distance in each direction
        const distSouth = distY >= 0 ? Math.abs(distY) : 0
        const distNorth = distY <= 0 ? Math.abs(distY) : 0
        const distEast =  distX >= 0 ? Math.abs(distX) : 0
        const distWest =  distX <= 0 ? Math.abs(distX) : 0

        // hack to check collisions because I didnt think far enough ahead
        const canMoveUp =     new Head(head.x, head.y - 1, head.next).checkCollision() ? -1 : 1
        const canMoveRight =  new Head(head.x + 1, head.y, head.next).checkCollision() ? -1 : 1
        const canMoveDown =   new Head(head.x, head.y + 1, head.next).checkCollision() ? -1 : 1
        const canMoveLeft =   new Head(head.x - 1, head.y, head.next).checkCollision() ? -1 : 1

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

        
        const predict = tf.tidy(_ => {
            const tensor =  tf.tensor2d(params, [1, params.length])
            return this.model.predict(tensor).flatten().arraySync()
        })
        

        this.inputs.push(params)

        // for any valid moves apply a minimum training weight as 0.1
        // for any invalid moves, set to 0 because DO NOT WANT
        var testScore = [0,0,0,0]
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


    async applyWeights(weights){
        var temp = await this.model.layers[0].getWeights()
        temp[0] = tf.variable(weights)

        this.model.layers[0].setWeights(temp)
    }

}

module.exports = NeuralTrainingInterfaceOverkill