const PretrainedNetworkInterface = require('./NeuralPreloadedInterface')
const Game = require('./Game')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run(){
    let model = await tf.loadLayersModel('model/model.json');
    let input = new PretrainedNetworkInterface(model, tf);
    drawBoard()

    while(true){
        let game = new Game(input);
        let done = false;
        while(!done){
            done = game.tick();
            markBoard(game.board)
            await sleep(100)
        }

        await sleep(1000)
    }
}


function drawBoard(){
    var table = $('table')
    for(var i = 0; i < BOARD_SIZE; i++){
        var row = $('<tr>')
        for(var j = 0; j < BOARD_SIZE; j++){
            row.append($('<td>'))
        }
        table.append(row)
    }
}

function markBoard(board){
    var table = $('table')
    for(var i = 0; i < board.length; i++){
        for(var j = 0; j < board[0].length; j++){
            var element = $('table tr').eq(i).children().eq(j)
            element.removeClass()
            if(board[j][i] == HEAD)
                element.addClass('head')
            if(board[j][i] == TAIL)
                element.addClass('tail')
            if(board[j][i] == CHEESE)
                element.addClass('cheese')
        }
    }
}


// $("p:nth-child(3)"

$(() => {
    run()

})