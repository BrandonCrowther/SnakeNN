const Game = require('./Game')
const NeuralTrainingInterface = require('./NeuralTrainingInterface')
const tf = require('@tensorflow/tfjs-node');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function run(){
    let model = await tf.loadLayersModel('file://./models/45/model.json');
    let input = new PretrainedNetworkInterface(model, tf);

    while(true){
        let game = new Game(input);
        let done = false;
        while(!done){
            done = game.tick();
            sleep(400)
            console.table(game.board)
        }
    }
}



async function train(){
    let topScore = 0;
    let run = 0;
    const interface = new NeuralTrainingInterface(tf);
    while(true){
        run++;
        console.log(`Run ${run} - topScore ${topScore}`)
        let game = new Game(interface)
        let done = false;
        while(!done){
            done = game.tick();
        }
        await interface.fitReplay()

        if(game.score > topScore){
            topScore = game.score;
            await interface.save(topScore)

            game.states.forEach(e => console.table(e))
            
            console.table(tf.memory())
            console.log(`New ${topScore} - at run ${run}`)
        }
    }
}

train();