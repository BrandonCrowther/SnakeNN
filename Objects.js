
class Snake{
    constructor(x, y, next = undefined){
        this.x = x;
        this.y = y;
        this.next = next;
    }


    deleteLast () {
        if(this.next){
            if(this.next.next){
                return this.next.deleteLast()
            }
            else{
                this.next = null;
                return true;
            }
        }
    }

}

class Tail extends Snake{}

class Head extends Snake{
    checkCollision () {
        let node = this.next;

        while(node != null){
            if(this.x == node.x && this.y == node.y)
                return true;
            node = node.next;
        }

        if(this.x == BOARD_SIZE || this.x < 0)
            return true;
        if(this.y == BOARD_SIZE || this.y < 0)
            return true;

        return false;
    }
    
    getPositions () {
        let arr = [[this.x, this.y]]
        let node = this.next;
        while(node != null){
            arr.push([node.x, node.y])
            node = node.next;
        }
        return arr;
    }

    getLength(){
        return this.getPositions().length
    }
}

class Cheese{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}


// module.exports = {
//     Snake: Snake,
//     Tail: Tail,
//     Head: Head
// }

module.exports = [
    Snake, Tail, Head, Cheese
]