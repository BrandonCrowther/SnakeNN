const Game = require('./Game')
const NeuralTrainingInterface = require('./NeuralTrainingInterface')
const NeuralPreloadedInterface = require('./NeuralPreloadedInterface')
const GeneticInterface = require('./GeneticInterface')
global.tf = require('@tensorflow/tfjs-node-gpu'); 


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


let oldMem = process.memoryUsage();

function mem(){
    console.table(tf.memory())
    const m = process.memoryUsage()
    for (var k in m){
        oldMem[k] = m[k] - oldMem[k]
    }
    console.table(oldMem)
    oldMem = m
    console.table(oldMem)
    // var used = process.memoryUsage();
    // for (var key in used) {
        
    //     console.log(`${key} ${used[key]}`);
    //     console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    // }
}


async function run(){
    var model = await tf.loadLayersModel('file://./bbb/23/model.json');
    var input = new NeuralPreloadedInterface(model, tf);
    
    while(true){
        var game = new Game(input);
        var done = false;

        while(!done){
            done = game.tick();
            // sleep(400)
            // console.table(game.board)
        }
        console.log(game.ticks)
        mem()
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
        var interface = new GeneticInterface()
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

const POPULATION_SIZE = 1000
const MUTATION_RATE = 1
const KEEP_SIZE = 6
var weightsFromBest = []
var round = 1;
var test = []
var topTotalScore = 0
var shape;

async function trainGenetic(){

    const temp = await tf.loadLayersModel('file://./aaa/9/model.json');
    weightsFromBest = [await temp.layers[0].getWeights()[0].arraySync()]
    shape = temp.layers[0].getWeights()[0].shape

    while(true){
        var games = [];
        for(var i = 0; i < POPULATION_SIZE; i++){

            const a = new GeneticInterface()

            // console.log('BEFORE')
            // a.model.layers[0].getWeights()[0].print()



            if(weightsFromBest.length > 0){
                let newWeight;
                if((Math.random() * 100) > 10){
                    const index1 = Math.floor(Math.random() * weightsFromBest.length)
                    const index2 = Math.floor(Math.random() * weightsFromBest.length)
                    const cross1 = weightsFromBest[index1]
                    const cross2 = weightsFromBest[index2]
                    const crossed = crossover(cross1, cross2)
    
                    if(Math.random() * 100 > 5)
                        newWeight = tf.tidy(_ => tf.tensor(mutateWeights(crossed)).reshape(shape))
                    else
                        newWeight = tf.tidy(_ => tf.tensor(crossed).reshape(shape))

                }
                else{
                    newWeight = tf.tidy(_ => tf.randomUniform(shape, -1, 1))
                }

                tf.tidy(_ => {
                    const newLayer = [
                        newWeight,
                        tf.zeros([4])
                    ]

                    a.model.layers[0].setWeights(newLayer)
                    tf.dispose(newLayer)
                    tf.dispose(newWeight)
                })

                // console.log('AFTER')
                // a.model.layers[0].getWeights()[0].print()
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
        bestFromRun[0].states.forEach(e => console.table(e))

        if(bestFromRun.length > 0){
            if(bestFromRun[0].score == topTotalScore){
                await bestFromRun[0].input.save(topTotalScore)
            }
    
            weightsFromBest = bestFromRun.map(g => {
                var tmpWeights = g.input.model.layers[0].getWeights()[0]
                shape = tmpWeights.shape
                return tmpWeights.arraySync()
            })
        
        }
        console.log(`Round ${round++} | topRound ${topRoundScore} | topTotal ${topTotalScore}`);


        tf.disposeVariables()
        mem()
    }
    
 
}




function mutateWeights(weights){
    var toArray = weights
    
    for(var i = 0; i < MUTATION_RATE; i++){
        const randomY = Math.floor(Math.random() * toArray.length)
        const randomX = Math.floor(Math.random() * toArray[0].length)
        toArray[randomY][randomX] = Math.random() * 2 - 1
    }
    
    //const tensorOut = tf.tensor(toArray).reshape(shape)
    return toArray
}

function crossover(weight1, weight2){
    const toArray1 = weight1
    const toArray2 = weight2
    var arrayOut = [...toArray1]

    for(var y = 0; y < toArray1.length; y++)
        for(var x = 0; x < toArray1[0].length; x++){
            if(Math.random > 0.5)
                arrayOut[y][x] = toArray1[y][x]
            else
                arrayOut[y][x] = toArray2[y][x]
        }
    
    //const tensorOut = tf.tensor(arrayOut)
    return arrayOut
}



train();