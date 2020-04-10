const Game = require('./Game')
const GeneticInterface = require('./GeneticInterface')
global.tf = require('@tensorflow/tfjs-node-gpu'); 


global.POPULATION_SIZE = 1000
global.KEEP_SIZE = 50
global.MUTATION_RATE = 100
global.MUTATIONS_PER = 3
global.FRESH_GENES = 50


let oldMem = process.memoryUsage();
function mem(){
    console.table(tf.memory())
    const m = process.memoryUsage()
    for (var k in m){
        oldMem[k] = m[k] - oldMem[k]
    }
    // show memory diff
    console.table(oldMem)
    oldMem = m
    // show all memory
    console.table(oldMem)
}



async function trainGenetic(){
    var modelScoresFromBest = []

    var trainingLog = []

    // load best as starting genetic material
    if(process.argv[2]){
        console.log("Loading " + process.argv[2])
        const temp = await tf.loadLayersModel('file://./models/' + process.argv[2] + '/model.json');
        await temp.compile({
            loss: 'meanSquaredError', optimizer: 'sgd' 
        })
        modelScoresFromBest.push({model: temp, score: 1})
    }

    var round = 1;
    var topTotalScore = 0
    var games = []
    while(true){
        games = []

        var stats = {
            vanilla: 0,
            mutations: 0,
            crossovers: 0,
            // crossMutations: 0,
            freshGenes: 0,
        }

        var mutationsLeft = MUTATION_RATE
        var freshGenes = FRESH_GENES
        
        for(var i = 0; i < POPULATION_SIZE; i++){
            const a = new GeneticInterface()

            if(modelScoresFromBest.length > 0){
                const model1 = pickModel(modelScoresFromBest)
                const model2 = pickModel(modelScoresFromBest)
                // reinsert models from previous generation vanilla
                if(i == 0){
                    for(var j = 0; j < modelScoresFromBest.length; j++){
                        a.setModel(modelScoresFromBest[j].model)
                        i++
                        stats.vanilla++
                    }
                }
                if(freshGenes > 0){
                    freshGenes--
                    stats.freshGenes++
                }
                else{
    
                    if(mutationsLeft > 0){
                        a.setModel(model1)
                        a.mutate()
                        stats.mutations++
                        mutationsLeft--
                    }
                    // crossover between two models and mutate
                    else{
                        a.setModel(model1)
                        a.crossover(model2)
                        stats.crossovers++
                    }
                }


            }
            

            const b = new Game(a);
            games.push(b)
        }
        
        // console.log("Finished instantiation.")
        // console.table(stats)
        
        // dispose of these
        tf.dispose(modelScoresFromBest)

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
        
        const bestFromRun = games.slice(0, KEEP_SIZE).filter(e => e.score > 0)
        // console.table(games.map(e => [e.score, e.head.getLength()]))


        // bestFromRun[0].states.forEach(e => console.table(e))
        await bestFromRun[0].input.save(topRoundScore)
        await bestFromRun[0].input.save("lastSaved")


        const avgBest = bestFromRun.filter(e => e.score > 0).map(e =>e.score).reduce((i, j) => i+j) / bestFromRun.length
        const avgLen = bestFromRun.map(e => e.head.getLength()).reduce((i, j) => i+j) / bestFromRun.length

        modelScoresFromBest = bestFromRun.map(g => {
            return {
                model: g.input.cloneModel(),
                score: g.score
            }
        })
        games.forEach(g => g.input.model.dispose())


       //mem()

      trainingLog.push({
          topRoundLength: bestFromRun[0].head.getLength(),
          topRoundScore: topRoundScore,
          avgRoundScore: avgBest,
          avgRoundLength: avgLen,
          topTotal: topTotalScore
      })

    //   console.table(bestFromRun.map(e => [e.score, e.head.getLength()]))

      console.table(trainingLog)

      console.log(`Round ${round} | topRound ${topRoundScore} | avgBest ${avgBest} | topTotal ${topTotalScore}`)

      round++
    }
    
 
}


function pickModel(arr){
    const total = arr.map(i => i.score).reduce((i,j) => i + j)
    var scoreIndex = Math.floor(Math.random() * total)

    var ret = null
    arr.forEach(i => {
        if(i.score >= scoreIndex)
            ret = i.model
        else 
            scoreIndex -= i.score
    })

    return ret
}


trainGenetic();