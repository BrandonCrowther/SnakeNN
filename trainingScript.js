const Game = require('./Game')
const NeuralTrainingInterface = require('./NeuralTrainingInterface')
const NeuralTrainingInterfaceOverkill = require('./NeuralTrainingInterfaceOverkill')
global.tf = require('@tensorflow/tfjs-node-gpu');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function mem(){
    console.table(tf.memory())
    console.table(process.memoryUsage())
    // var used = process.memoryUsage();
    // for (var key in used) {
        
    //     console.log(`${key} ${used[key]}`);
    //     console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    // }
}


async function run(){
    var model = await tf.loadLayersModel('file://./models/45/model.json');
    var input = new PretrainedNetworkInterface(model, tf);
    
    while(true){
        var game = new Game(input);
        var done = false;
        while(!done){
            done = game.tick();
            sleep(400)
            console.table(game.board)
        }
    }
}


// memory is now properly managed here lol
async function train(){
    var topScore = 0;
    var run = 0;
    const interface = new NeuralTrainingInterface();
    while(true){
        run++;
        console.log(`Run ${run} - topScore ${topScore}`)
        var game = new Game(interface)
        var done = false;
        while(!done){
            done = game.tick();
        }

        await interface.fitReplay()
        
        if(game.score > topScore){
            topScore = game.score;
            await interface.save(topScore)
            game.states.forEach(e => console.table(e))
            console.log(`New ${topScore} - at run ${run}`)
        }
        
        // interface.model.dispose()
        // tf.disposeVariables()
    }
}


async function trainRandom(){
    var topScore = 0;
    var run = 0;
    // tf.enableDebugMode() 
    while(true){
        mem()
        run++;
        console.log(`Run ${run} - topScore ${topScore}`)
        var interface = new NeuralTrainingInterfaceOverkill()
        mem()
        var game = new Game(interface)
        // console.table(tf.memory())
        var done = false;
        while(!done){
            done = game.tick();
        }
        
        if(game.score > topScore){
            topScore = game.score;
            await interface.save(topScore)
            
            game.states.forEach(e => console.table(e))
            
            console.log(`New ${topScore} - at run ${run}`)
        }
        interface.model.dispose()
        tf.disposeVariables()

        mem()
        console.log('===============================')
    }
    
}

const POPULATION_SIZE = 10000
const KEEP_SIZE = 6
var weightsFromBest = []
var round = 1;
var test = []
var topTotalScore = 0

async function trainGenetic(){

    while(true){
        var games = [];
        for(var i = 0; i < POPULATION_SIZE; i++){
            const a = new NeuralTrainingInterfaceOverkill(tf)
            if(weightsFromBest.length > 0){
                if((Math.random() * 1000) > 5){
                    const index1 = Math.floor(Math.random() * weightsFromBest.length)
                    const index2 = Math.floor(Math.random() * weightsFromBest.length)
                    const cross1 = weightsFromBest[index1]
                    const cross2 = weightsFromBest[index2]
                    const crossed = await crossover(cross1, cross2)
    
                    a.applyWeights(await mutateWeights(crossed))
                }
            }
            else{
                a.applyWeights(tf.randomUniform([8,4], -1, 1))
            }
            const b = new Game(a);
            games.push(b)
        }
        
        console.log("Finished instantiation.")
        
        var topRoundScore = 0;
        games.forEach(game => {
            while(!game.tick()){}
            if(topRoundScore < game.score)
                topRoundScore = game.score
            if(topTotalScore < game.score)
                topTotalScore = game.score
        })
        games.sort(function(a, b){
            return b.score - a.score
        })
        
        var bestFromRun = games.slice(0, KEEP_SIZE)
        if(bestFromRun[0].score == topTotalScore){
            await bestFromRun[0].input.save(topTotalScore)
        }
        weightsFromBest = bestFromRun.map(g => g.input.model.layers[0].getWeights()[0])
        // test = weightsFromBest.map(e => e.arraySync())
    
        console.log(`Round ${round++} | topRound ${topRoundScore} | topTotal ${topTotalScore}`);
        // games.forEach(e => e.input.model.dispose())
        // tf.disposeVariables()
        mem()
        // console.log(test)
    }
    
 
}




const MUTATION_RATE = 1
async function mutateWeights(weights){
    return await tf.tidy(_ => {
        const shape = weights.shape
        var toArray = weights.arraySync()
        const wArray = weights.arraySync()
        
        for(var i = 0; i < MUTATION_RATE; i++){
            const randomY = Math.floor(Math.random() * toArray.length)
            const randomX = Math.floor(Math.random() * toArray[0].length)
            toArray[randomY][randomX] = Math.random() * 2 - 1
        }
        
        const tensorOut = tf.tensor(toArray).reshape(shape)
        return tensorOut
    })
}

async function crossover(weight1, weight2){
    return await tf.tidy(_ => {
        const shape = weight1.shape
        const toArray1 = weight1.arraySync()
        const toArray2 = weight2.arraySync()
        var arrayOut = [...toArray1]

        for(var y = 0; y < toArray1.length; y++)
            for(var x = 0; x < toArray1[0].length; x++){
                if(Math.random > 0.5)
                    arrayOut[y][x] = toArray1[y][x]
                else
                    arrayOut[y][x] = toArray2[y][x]
            }
        
        const tensorOut = tf.tensor(arrayOut).reshape(shape)
        return tensorOut
    })
}



trainGenetic();