// mostly for debugging. only use from a browser lol

class KeyboardInterface{
    constructor(){
        this.lastPress = DOWN;
        document.addEventListener('keyup', (e) => {
            if(e.code === "ArrowUp")
                this.lastPress = UP;
            if(e.code === "ArrowRight")
                this.lastPress = RIGHT;
            if(e.code === "ArrowDown")
                this.lastPress = DOWN;
            if(e.code === "ArrowLeft")
                this.lastPress = LEFT;
        })

    }

    getMove() {
        return this.formatKeyPress()
    }

    formatKeyPress() {
        if(this.lastPress == UP)
            return [0, -1]
        if(this.lastPress == RIGHT)
            return [1, 0]
        if(this.lastPress == DOWN)
            return [0, 1]
        if(this.lastPress == LEFT)
            return [-1, 0]
    }
}


module.exports = KeyboardInterface