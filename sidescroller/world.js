function drawBlocks() {
    for(let i = 0;i < blocks.length;i++) {
        blocks[i].draw();
    }
    for(let i = 0;i < movingBlocks.length;i++) {
        movingBlocks[i].draw();
    }
}

function drawDeco() {
    img(sprites.arrow1,0,517,0,3,3);
}


var blocks = [];
var movingBlocks = [];

class block {
    constructor(x,y,w,h,c) {
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.c=c;
    }
    draw() {
        rect(this.x,this.y,this.w,this.h,this.c);
    }
}

class movingBlock {
    constructor(x1,x2,y1,y2,w,h,c,speed) {
        this.x1=x1;
        this.x2=x2;
        this.y1=y1;
        this.y2=y2;
        this.w=w;
        this.h=h;
        this.c=c;
        this.x=x1;
        this.y=y1;
        this.speed = speed;
        this.dir = 1;
    }
    update(i) {
        let xmove = ((this.x2-this.x1)/this.speed) * this.dir;
        if(this.x1 !== this.x2) {
            this.x += xmove;
            if(this.x >= this.x2 || this.x <= this.x1) {
                this.dir *= -1;
            }
        }

        if(rectrect(player,this) || i == player.follow) {
            player.x += xmove;
            if(hittingStuff()) {
                player.x -= xmove;
            }
        }

        let ymove = ((this.y2-this.y1)/this.speed) * this.dir;
        if(this.y1 !== this.y2) {
            this.y += ymove;
            if(this.y >= this.y2 || this.y <= this.y1) {
                this.dir *= -1;
            }
        }

        if(rectrect(player,this) || (i == player.follow && this.dir == 1)) {
            player.y += ymove;
            if(hittingStuff()) {
                player.y -= ymove;
            }
        }

        if(i == player.follow) {
            player.y += 2;

            if(!rectrect(player,this)) {
                player.follow = undefined;
            }
            player.y -= 2;
        }
    }
    draw() {
        rect(this.x,this.y,this.w,this.h,this.c);
    }
}

function hittingStuff() {
    
    for(let i=0;i<blocks.length;i++) {
        if(rectrect(player,blocks[i])) {
            return [i];
        }
    }
}

function hittingMove() {
    for(let i=0;i<movingBlocks.length;i++) {
        if(rectrect(player,movingBlocks[i])) {
            return [i];
        }
    }
}