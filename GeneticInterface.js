const [Snake, Tail, Head, Cheese] = require('./Objects')

class GeneticInterface{
    constructor(){
        this.model = this.newModel()
        this.randomUniform()

        this.inputs = []
        this.scores = []
    }

    newModel(){
        const inputShape = 11//(BOARD_SIZE * BOARD_SIZE) * 3
         return tf.tidy(_ => {
            const mod = tf.sequential({
                layers: [
                    //tf.layers.dense({units: 11, activation: "sigmoid", }),
                    // tf.layers.dense({units: 32, activation: "sigmoid" }),
                    tf.layers.dense({units: 4, activation: 'softmax', inputShape: [8]})
                ]
            })
            mod.compile({
                loss: 'meanSquaredError', optimizer: 'sgd' 
            })
            return mod
         })
    }

    getMove2(head, cheese, score, board) {

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

        // flatten the various board representations into a linear sequence of numbers
        const params = cheeseBoard.flat().concat(scaryBoard.flat().concat(headBoard.flat()))


        return tf.tidy(_ => {
            const tensor =  tf.tensor2d(params, [1, params.length])
            const predict = this.model.predict(tensor).flatten().arraySync()
    
            return this.formatMove(predict)
        })
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
            // posX,
            // posY,
            // snakeLen,
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
        
        this.inputs.push(predict)

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

    
    mutate(){
        tf.tidy(_ => {
            const weights = this.model.getWeights()

            // pre choose indexes for mutation by computing total weights count
            var total = 0;
            var indexes = [];
            for(var i = 0; i < weights.length; i+=2){
                total += weights[i].shape.reduce((a, b) => a * b)
            }
            const chosenRate = Math.floor(Math.random() * MUTATIONS_PER) + 1
            for(i = 0; i < chosenRate; i++){
                indexes.push(Math.floor(Math.random() * total))
            }

            var newWeights = [] 
            for(var i = 0; i < weights.length; i++){
                // skip bias layers
                if(i % 2 == 0){
                    // flatten so easier to sample randomly
                    var layer = weights[i].flatten().dataSync()
    
                    const indexesInLayer = indexes.filter(e => e < layer.length)
    
                    indexesInLayer.forEach(a => {
                        layer[a] = (Math.random() * 4) - 2
                    })
    
                    newWeights.push(tf.tensor(layer, weights[i].shape))
                    indexes = indexes.map(e => e - layer.length)
                }
                // push bias layers with janky copy
                else newWeights.push(tf.clone(weights[i]))
            }
            
            this.model.setWeights(newWeights)
        })
    }
    
    crossover(other){
        return tf.tidy(_ => {
            const myWeights = this.model.getWeights()
            const otherWeights = other.model.getWeights()
            var retWeights = []

            for(var i = 0; i < myWeights.length; i++){
                const myLayer = myWeights[i].flatten().dataSync()
                const otherLayer = otherWeights[i].flatten().dataSync()
                var retLayer = []

                // sample randomly
                for(var j = 0; j < myLayer.length; j++){
                    const selector = Math.floor(Math.random() * 2) 
                    retLayer.push(selector ? myLayer[j] : otherLayer[j])
                }
                retWeights.push(tf.tensor(retLayer, myWeights[i].shape))
            }

            this.model.setWeights(retWeights)
        })

    }

    cloneModel(){
        return tf.tidy(_ => {
            const weights = this.model.getWeights().map(w => tf.clone(w))
            const clone = this.newModel()
            clone.setWeights(weights)
            return clone
        })
    }

    setModel(newModel){
        this.model.dispose()
        this.model = tf.tidy(_ => {
            const weights = newModel.getWeights().map(w => tf.clone(w))
            const clone = this.newModel()
            clone.setWeights(weights)
            return clone
        })
    }

    randomUniform(){
        this.model = tf.tidy(_ => {
            const weights = this.model.getWeights().map(
                (w, i) => (i % 2 == 1) 
                    ? tf.clone(w) 
                    : tf.randomUniform(w.shape, -2, 2))
  
            this.model.dispose()
            const clone = this.newModel()
            clone.setWeights(weights)
            return clone
        })
    }


}

module.exports = GeneticInterface