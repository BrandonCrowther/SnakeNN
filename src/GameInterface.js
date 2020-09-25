import { Game } from "./Game"

class GameInterface{
    constructor(game, model){
        this.game = game
        this.model = model
        this.finishedGame = false
    }


    play(){
        let move = this.getMove()

        while(this.game.tick(move)){
            move = this.getMove()
        }
    }
    

    getMove(){
        throw new Error("Not implemented")
    }

    getGame(){
        return this.game
    }

    resetGame(newGame = new Game()){
        this.game = newGame
    }

}