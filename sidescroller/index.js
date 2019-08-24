images = [
    "",
    "p1.png",
    "p2.png",
    "p3.png",
    "back1.png",
    "back2.png",
    "arrow1.png"
];

audio = [
    "sounds/",
    "j1.wav",
    "j2.wav",
    "walk1.wav",
    "walk2.wav",
    "land.wav",
    "win.wav",
    "song.wav"
];
var walksoundtime = 0;

var intro = 9150;
player.x=intro;

var curBlockSizeX = 10;
var curBlockSizeY = 10;

var win = false;
var winTime = 0;

function draw() {
    
    let camy = player.y < 320 - ch/2 ? 320 - ch : 320;
    
    imgIgnoreCutoff(sprites.back1,player.x/3,camy);
    imgIgnoreCutoff(sprites.back1,player.x/3 + 1600,camy);
    if(player.x>2000) {
        imgIgnoreCutoff(sprites.back1,player.x/3 + 3200,camy);
    }
    if(player.x>3600) {
        imgIgnoreCutoff(sprites.back1,player.x/3 + 4800,camy);
    }
    if(player.x>5200) {
        imgIgnoreCutoff(sprites.back1,player.x/3 + 6400,camy);
    }
    imgIgnoreCutoff(sprites.back2,player.x/4,camy);
    imgIgnoreCutoff(sprites.back2,player.x/4 + 1600,camy);
    if(player.x>2000) {
        imgIgnoreCutoff(sprites.back2,player.x/4 + 3200,camy);
    }
    if(player.x>3600) {
        imgIgnoreCutoff(sprites.back2,player.x/4 + 4800,camy);
    }
    if(player.x>5200) {
        imgIgnoreCutoff(sprites.back2,player.x/4 + 6400,camy);
    }
    player.acount+=0.2;
    if(player.acount>3.8) {
        player.acount=0;
    }
    var f = 1;
    if(!player.onGround) {
        f=2;
    } else if (player.v.x) {
        switch(Math.floor(player.acount)) {
            case 0:
                f=1;
                break;
            case 1:
                f=2;
                break;
            case 2:
                f=1;
                break;
            case 3:
                f=3;    
                break;
        }
    } else {
        f=1;
    }
    player.img = sprites[`p${f}`];
    
    centerCameraOn(player.x,camy);

    if(intro) {
        centerCameraOn(intro,320);
        intro-=25;
        player.x-=25
        if(intro<0) {intro=0;}
    }
    text("no",-900,350,"#000000",8);
    text("yes",2147483647,3,c.gold,64);
    text("hi",9740,300,"black",24);
    drawBlocks();
    drawDeco();
    if(!intro) {
        img(player.img,player.x,player.y,0,player.dir);
    }

    //cursor.sprite = sprites.cursor;
}

function absoluteDraw() {
    rect(mousePosition().x,mousePosition().y,curBlockSizeX,curBlockSizeY,"#16f7e5");
    if(win) {
        winTime++;
        if(winTime>200) {
            winTime=0;
        }
        if(winTime==40) {
            play(sounds.win);
        }
        if(winTime>40) {
            text("You Win",200,100,"#d4d12f",16,100);
        }
    }
}

function update() {
    let leftRight = false;
    
    if(intro==0) {
        if(player.y>1000) {
            player.y=450;
            player.x=0;
        }

        //9157.457142857227, y: -226
        if(player.x>9155 && player.y<-200) {
            win = true;
        }
        // right
        if(keyDown[k.d]) { 
            player.v.x += 0.3;
            if(player.v.x > 4) {player.v.x = 4;}
            player.dir = 1;
            leftRight = true;
        }

        var maxSpeed = -4;
        if(player.x >7175 && player.y> 500) {
            maxSpeed = -8;
        }
        // left
        if(keyDown[k.a]) { 
            player.v.x -= 0.3;
            if(player.v.x < maxSpeed) {player.v.x = maxSpeed;}
            player.dir = -1;
            leftRight = true;
        }

        // jump
        if((keyDown[k.w] || keyDown[k.SPACE]) && player.onGround) {
            player.v.y = -7;
            player.onGround -= 1;
            if(player.follow) {
                let b = movingBlocks[player.follow];
                player.v2.x = ((b.x2-b.x1)/b.speed) * b.dir;
                player.v.y += ((b.y2-b.y1)/b.speed) * b.dir;
            }
            play(sounds[`j${rand(1,2)}`]);
        }
    
   

        //friction
        if(!leftRight) {
            if(player.v.x > 0) {
                player.v.x -= 0.3;
            }
            if(player.v.x < 0) {
                player.v.x += 0.3;
            }
            if(player.v.x > -0.5 && player.v.x < 0.5) {
                player.v.x = 0;
            }
            if(player.v2.x > 0) {
                player.v2.x -= 0.3;
            }
            if(player.v2.x < 0) {
                player.v2.x += 0.3;
            }
            if(player.v2.x > -0.5 && player.v2.x < 0.5) {
                player.v2.x = 0;
            }
        } else {
            walksoundtime++;
            if(walksoundtime>15 && player.onGround) {
                play(sounds[`walk${rand(1,2)}`]);
                walksoundtime=0;
            }
        }

        if(player.follow) {
            player.onGround = 2;
        }

        //gravity
        if(player.v.y<10 && !player.onGround) {
            player.v.y += 0.2;
        }

        //x
        player.x += player.v.x;
        player.x += player.v2.x;
        let h = hittingStuff();
        let m = hittingMove();
        if(h||m) {
            player.x -= player.v.x;
            player.x -= player.v2.x;
            player.v.x = 0;
        }
        
        //y
        player.y += player.v.y;
        h = hittingStuff();
        m = hittingMove();
        if(h||m) {
            player.y -= player.v.y;

            if(player.v.y > 0) {
                if(h) {
                    if(player.v.y > 3 && player.last!=h[0]) {
                        play(sounds.land);
                        player.last=h[0];
                    } 
                }
                if(m) {
                    if(player.v.y > 3 && player.last!=m[0]) {
                        play(sounds.land);
                        player.last=m[0];
                    }
                }
                player.onGround = 2;
                if(m) {
                    player.follow = m[0];
                }
                if(h) {
                    player.y = blocks[h[0]].y - blocks[h[0]].h/2 - player.h/2 - 1;
                } else {
                    player.y = movingBlocks[m[0]].y - movingBlocks[m[0]].h/2 - player.h/2 - 1;
                }
            } else if(player.v.y < 0) {
                player.v.y = 0;
            }
        } else {
            player.onGround = 0;
        }
    
/*
        if(keyDown[k.SHIFT]) {
            curBlockSizeX += scroll;
        } else {
            curBlockSizeY += scroll
        }

        if(mousePress[0]) {
            console.log(`blocks.push(new block(${mousePosition().x},${mousePosition().y},${curBlockSizeX},${curBlockSizeY},c.));`);
        }
*/

        for(let i = 0;i < movingBlocks.length;i++) {
            movingBlocks[i].update(i);
        }
    }
}

var c = {
    green:"#498c31",
    dirt:"#4d3b26",
    rock:"#7d7d7d",
    rock2:"#4f4f4f",
    white:"#FFFFFF",
    gold:"#ede909"
};

function onAssetsLoaded() {

    setType(sounds.song, "bgm");
    sounds.song.nodes[1].loop = true;
    play(sounds.song);
    setVolume(sounds.win,0.25);

    blocks.push(new block(-3500,5000,5000,10000,c.green));


    //plains
    blocks.push(new block(280,510,150,80,c.green));
    blocks.push(new block(280,520,150,60,c.dirt));
    blocks.push(new block(565,400,170,20,c.green));
    blocks.push(new block(880,440,170,220,c.green));
    blocks.push(new block(880,450,170,200,c.dirt));
    blocks.push(new block(1017,500,110,130,c.green));
    blocks.push(new block(1017,510,110,110,c.dirt));
    blocks.push(new block(1360,485,110,150,c.green));
    blocks.push(new block(1360,495,110,130,c.dirt));
    blocks.push(new block(1470,540,110,25,c.green));
    blocks.push(new block(1470,550,110,15,c.dirt));
    blocks.push(new block(1750,485,110,150,c.green));
    blocks.push(new block(1750,495,110,130,c.dirt));


    blocks.push(new block(0,560,4000,20,c.green));
    blocks.push(new block(0,600,4000,80,c.dirt));

    //cliffs
    movingBlocks.push(new movingBlock(2370,2370,280,480,140,10,c.rock,100));
    blocks.push(new block(2600,385,135,330,c.rock2));
    movingBlocks.push(new movingBlock(2870,2870,280,480,140,10,c.rock,100));
    movingBlocks.push(new movingBlock(3080,3280,250,250,150,10,c.rock,100));
    blocks.push(new block(3610,380,150,340,c.rock2));
    blocks.push(new block(3760,580,150,140,c.rock2));
    movingBlocks.push(new movingBlock(4330,4530,460,460,140,10,c.rock,100));
    movingBlocks.push(new movingBlock(4580,4780,360,360,140,10,c.rock,100));
    movingBlocks.push(new movingBlock(4830,5030,260,260,140,10,c.rock,100));
    blocks.push(new block(5420,375,120,350,c.rock2));

    blocks.push(new block(4000,600,4000,100,c.rock));

    //clouds
    blocks.push(new block(6300,500,100,100,c.white));
    blocks.push(new block(6400,500,100,300,c.white));
    blocks.push(new block(6500,500,100,500,c.white));
    blocks.push(new block(6600,500,100,700,c.white));
    blocks.push(new block(6700,500,100,900,c.white));
    blocks.push(new block(6900,500,300,1100,c.white));

    movingBlocks.push(new movingBlock(7160,7160,-100,480,125,10,c.white,200));
    blocks.push(new block(7300,-100,100,50,c.white));

    movingBlocks.push(new movingBlock(7460,7660,-150,-150,70,40,c.white,120));
    movingBlocks.push(new movingBlock(7480,7680,-160,-160,40,60,c.white,120));
    movingBlocks.push(new movingBlock(7950,7950,-300,-100,65,55,c.white,80));
    movingBlocks.push(new movingBlock(7950,7950,-270,-70,35,25,c.white,80));
    movingBlocks.push(new movingBlock(8200,8300,-300,-300,85,50,c.white,60));
    movingBlocks.push(new movingBlock(8250,8350,-300,-300,45,25,c.white,60));
    movingBlocks.push(new movingBlock(8650,8650,-250,0,60,75,c.white,140));
    movingBlocks.push(new movingBlock(8620,8620,-225,25,30,50,c.white,140));
    movingBlocks.push(new movingBlock(8750,9000,-300,-300,40,30,c.white,70));
    
    blocks.push(new block(9400,400,500,1200,c.gold));

    blocks.push(new block(8000,600,4000,100,c.white));
}
/*
                test world
                
blocks.push(new block(200,500,100,100,"red"));
    blocks.push(new block(450,450,100,200,"orange"));
    blocks.push(new block(550,500,100,100,"orange"));
    blocks.push(new block(700,300,150,25,"yellow"));
    blocks.push(new block(1000,350,150,25,"yellow"));
    blocks.push(new block(1350,430,100,240,"green"));
    blocks.push(new block(1450,490,100,125,"green"));
    movingBlocks.push(new movingBlock(1700,1700,200,400,100,25,"#001cd1"));
    movingBlocks.push(new movingBlock(2000,2000,100,300,100,25,"#001cd1"));
    blocks.push(new block(2250,300,100,600,"#7c00c9"));
    movingBlocks.push(new movingBlock(500,1000,100,500,100,100,"yellow"));
    movingBlocks.push(new movingBlock(0,200,500,500,100,100,"yellow"));

    blocks.push(new block(0,600,10000,100,"gray"));
*/
setup(60);