images = [
    "assets/",
    "cur.png",
    "player.png",
    "e.png",
    "enemy.png",
    "hp.png",
    "xp.png",
    "grass.png",
    "sand.png",
    "sand2.png"
];

var player = {
    x:400,
    y:300,
    w:20,
    h:20,
    direction:0,
    xp:0,
    nextlvl:25,
    level:1,
    pts:0,
    hp:30,
    maxhp:30,
    damage:1,
    firerate:30,
    bspeed:5,
    speed:4,
};

var wall = {left:-2000,right:2000,top:-2000,bottom:2000};
var world=[];

var bullets = [];
var enemies = [];

var cooldown = 0;
var lvlUpText = 0;

var enemyCap = 500;
var spawnCounter = 0;
var dead = false;

for(var y=0;y<200;y++) {
    var temp = [];
    for(var x=0;x<200;x++) {
        var rng = rand(1,10);
        var spr;
        if(rng==10) {
            spr="sand";
        } else if(rng==9) {
            spr="sand2";
        } else {
            spr="grass";
        }
        temp.push(spr);
    }
    world.push(temp);
}

class enemy {
    constructor(x,y,size) {
        this.x = x;
        this.y = y;
        this.w = size;
        this.h = size;
        this.size = size;
        this.speed = size/10;
        this.hp = Math.floor(size/5);
        
        this.angle = 0;
        this.v = vel(this.angle,this.speed);

        while(dist(this,player)<200) {
            this.x = rand(-2000,2000);
            this.y = rand(-2000,2000);
        }
    }
    update() {
        for(let i = 0;i < bullets.length;i++) {
            if(rectrect(this,bullets[i])) {
                this.hp -= player.damage;
                bullets[i].die=true;
                if(this.hp <= 0) {
                    player.xp += Math.floor(this.size/5);
                    return true;
                }
            }
        }

        this.angle = pointTo(this,player);
        this.v = vel(this.angle,this.speed);
        this.x+=this.v.x;
        this.y+=this.v.y;

        if(rectrect(this,player)) {
            player.hp -= Math.floor(this.size/5);
            return true;
        }

    }
    draw() {
        var temp = false;
        for(let i = 0;i < bullets.length;i++) {
            if(rectrect(this,bullets[i])) {
                temp = true;
            }
        }
        /*if(temp) {
            rect(this.x,this.y,this.size,this.size,"orange");
        } else {
            rect(this.x,this.y,this.size,this.size,"red");
        }*/
        // var s = this.size<20 ? 20/this.size 
        var s=this.size/20;
        img(sprites.enemy,this.x,this.y,this.angle,s,s);
    }
}

class bullet {
    constructor(x,y,size,dir,speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.w = size;
        this.h = size;
        this.dir = dir;
        this.speed = speed;
        this.die=false;
    }
    update() {
        this.x += Math.cos(this.dir) * this.speed;
        this.y += Math.sin(this.dir) * this.speed;

        if(this.die||this.x>wall.right||this.x<wall.left||this.y>wall.bottom||this.y<wall.top) {
            return true;
        }
    }
    draw() {
        //rect(this.x,this.y,this.size,this.size,"black");
        img(sprites.e,this.x,this.y,this.dir);
    }
}

for(var i=0;i<30;i++) {
    enemies.push(new enemy(rand(-2000,2000),rand(-2000,2000),rand(10,30),player.level*2));
}

setup(60);

function stuffisloaded() {
    cursor.sprite = sprites.cur;
}

function draw() {
    var wy=-1990;
    for(var y=0;y<200;y++) {
        var wx=-1990;
        for(var x=0;x<200;x++) {
            img(sprites[world[y][x]],wx,wy);
            wx+=20;
        }
        wy+=20;
    }
    for(let i = 0;i < enemies.length;i++) {
        enemies[i].draw();
    }
    for(let i = 0;i < bullets.length;i++) {
        bullets[i].draw();
    }
    
    img(sprites.player,player.x,player.y,player.direction);
}

function parseNum(num) {
    return Math.round(num*10)/10;
}

function absoluteDraw() {
    img(sprites.hp,16,12,0,2,2);
    img(sprites.xp,16,40,0,2,2);
    text(`[Z]: ${player.hp}/${player.maxhp}`,45,5,"white",2);
    text(`: ${player.xp}/${player.nextlvl}`,35,30,"white",2);
    text(`Level: ${player.level}`,0,60,"white",2);
    text(`Pts: ${player.pts}`,0,80,"white",2);

    text(`DMG[X]: ${parseNum(player.damage)}`,650,5,"white",2);
    text(`FR[C]: ${parseNum(player.firerate)}`,650,25,"white",2);
    text(`SPD[V]: ${parseNum(player.speed)}`,650,45,"white",2);
    text(`BSPD[B]: ${parseNum(player.bspeed)}`,650,65,"white",2);
    text(`HEAL[H]`,0,580,"white",2);
    
    if(lvlUpText > 0) {
        text(`Level Up!`,350,250,"white",2);
        lvlUpText--;
    }
    if(player.hp <= 0) {
        text(`Game Over`,0,0,"red",29);
        dead = true;
    }
}

function update() {
    if(!dead) {
    if(keyDown[k.w]) {
        player.y -= player.speed;
    }
    if(keyDown[k.a]) {
        player.x -= player.speed;
    }
    if(keyDown[k.s]) {
        player.y += player.speed;
    }
    if(keyDown[k.d]) {
        player.x += player.speed;
    }

    if(keyPress[k.z] && player.pts > 0) {
        player.maxhp += 5;
        player.hp += 5;
        player.pts--;
    }
    if(keyPress[k.x] && player.pts > 0) {
        player.damage++;
        player.pts--;
    }
    if(keyPress[k.c] && player.pts > 0) {
        player.firerate--;
        player.pts--;
    }
    if(keyPress[k.v] && player.pts > 0) {
        player.speed += 2;
        player.pts--;
    }
    if(keyPress[k.b] && player.pts > 0) {
        player.bspeed += 2;
        player.pts--;
    }

    if(keyPress[k.h] && player.pts > 0) {
        player.hp = player.maxhp;
        player.pts--;
    }

    if(player.x>wall.right){player.x=wall.right;}
    if(player.x<wall.left){player.x=wall.left;}
    if(player.y>wall.bottom){player.y=wall.bottom;}
    if(player.y<wall.top){player.y=wall.top;}

    if(mouseDown[0] && cooldown <= 0) {
        bullets.push(new bullet(player.x,player.y,5,pointTo(player,mousePosition()),player.bspeed));
        cooldown = player.firerate;
    }

    if(cooldown > 0) {
        cooldown--;
    }

    centerCameraOn(player.x,player.y); 
    player.direction = pointTo(player,mousePosition()) - Math.PI / 2;
    camera.zoom+=scroll/10;

    for(let i = 0;i < enemies.length;i++) {
        if(enemies[i].update()) {
            enemies.splice(i,1);
            i--;
        }
    }
    for(let i = 0;i < bullets.length;i++) {
        if(bullets[i].update()) {
            bullets.splice(i,1);
            i--;
        }
        // bullets[i].update();
    }

    if(player.xp >= player.nextlvl) {
        levelUp();
    }

    spawnCounter++;
    if(spawnCounter>10) {
        if(enemySpawn()) {
            enemies.push(new enemy(rand(-2000,2000),rand(-2000,2000),rand(player.level*5+5,player.level*2+18)));
        }
        spawnCounter=0;
    }
}
}

function levelUp() {
    player.level++;
    player.maxhp += 2;
    player.hp += 2;
    player.damage += 0.2;
    player.firerate -= 0.5;
    player.speed += 0.2;
    player.bspeed += 0.2;

    player.pts++;

    player.xp -= player.nextlvl;
    player.nextlvl = Math.floor(player.nextlvl * 1.25);
    lvlUpText = 120;
}

function enemySpawn() {
    var chance = 10 - Math.ceil(player.level/10);
    var chance = chance < 1 ? 1 : chance;
    if(rand(1,chance)==1) {
        console.log("spawned");
        return true;
    } else {
        return false;
    }
}

/*
rect(x,y,w,h,color)
circle(x,y,r,color)
shape(x,y,relitivePoints,color) - example: red triangle at 100,100 - shape(100,100,[{x:-10,y:-10},{x:-10,y:10},{x:10,y:0}],"red")
img(sprite,x,y,angle default=0,scale x default=1, scale y default=1)
text(string,x,y,color default="black",size=default,maxWidth=canvas width)
*/