function createCanvas(id) {
    var tempCanvas = document.createElement("canvas");
    tempCanvas.id = id;
    tempCanvas.width = canvases.cvs.width;
    tempCanvas.height = canvases.cvs.height;
    tempCanvas.style = "image-rendering:pixelated;display:none;";

    document.body.appendChild(tempCanvas);

    canvases[`${id}cvs`] = document.getElementById(id);
    canvases[`${id}ctx`] = canvases[`${id}cvs`].getContext("2d");
}

function startLoops() {
    try {draw} catch {console.warn("no draw function found");return null;}
    try {update} catch {console.warn("no update function found");return null;}
    try {input} catch {seperateInputLoop=false;}

    requestAnimationFrame(drawLoop);
    setInterval(updateLoop,1000/updateFPS);

    stuffisloaded();

    if(seperateInputLoop) {
        setInterval(inputLoop,4);
    }
}

function mousePosition() {
    if(drawMode===0) {
        return {x:(mousePos.x)-camera.x,y:(mousePos.y)-camera.y};
    } else if(drawMode===1) {
        var xoff = canvases.cvs.width/2;
        var yoff = canvases.cvs.height/2;
        return {x:((mousePos.x-xoff)/camera.zoom+xoff)-camera.x,y:((mousePos.y-yoff)/camera.zoom+yoff)-camera.y};
    } else {
        var xoff = canvases.cvs.width/2;
        var yoff = canvases.cvs.height/2;
        var tempPos = {x:((mousePos.x-xoff)/camera.zoom+xoff)-camera.x,y:((mousePos.y-yoff)/camera.zoom+yoff)-camera.y};

        var center = {x:-camera.x + cw/2, y:-camera.y + ch/2};
        var tempAngle = pointTo(center,tempPos) - camera.angle; 
        var tempDist = dist(center,tempPos);

        return {x:center.x + (Math.cos(tempAngle) * tempDist),y:center.y + (Math.sin(tempAngle) * tempDist)};
    }
}

function addFont() {
    var tempStyle = document.createElement("style");
    tempStyle.innerHTML = `
    @font-face { font-family: 'PixelArial11'; src: url('font/PixelArial11.eot?#iefix') format('embedded-opentype'), url('font/PixelArial11.woff') format('woff'), url('font/PixelArial11.ttf') format('truetype'), url('font/PixelArial11.svg#PixelArial11') format('svg'); font-weight: normal; font-style: normal; }
    html {font-family: 'PixelArial11' !important; font-size: 16px;}
    `;
    document.head.appendChild(tempStyle);
    canvases.ctx.textBaseline = "hanging";
    canvases.ctx.textAlign = "left";
}

function addStyle() {
    var tempStyle = document.createElement("style");
    tempStyle.id="gamejsstyle";
    document.head.appendChild(tempStyle);
}

function rand(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function radToDeg(rad) {return rad / Math.PI * 180;}
function degToRad(deg) {return deg * Math.PI / 180;}

function velocity(angle) {
    return {x:Math.sin(angle),y:Math.cos(angle)};
}

function pointTo(point,targetPoint) {
    var adjacent = (targetPoint.x - point.x);
    var opposite = (targetPoint.y - point.y);
    var h = Math.atan2(opposite, adjacent);
    return h;
}

function loadImagesAndSounds() {
    var curpath="";
    context = new AudioContext();
    deeper(images,"image");
    deeper(audio,"sound");
    function deeper(curpos,type) {
        let addedPath="";
        for(let j=0;j<curpos.length;j++) {
            if(typeof curpos[j]=="string") {
                if(j==0) {
                    curpath+=curpos[j];
                    addedPath = curpos[j];
                } else {
                    if(type=="image") {
                        let name = curpath + curpos[j];
                        imagePaths.push(name);
                        let temp = new Image();
                        temp.src = name;
                        temp.onload = spriteLoad(name,temp);
                        imgs.push(temp);
                    } else if(type=="sound") {
                        audioPaths.push(curpath + curpos[j]);
                        addSound(curpath + curpos[j]);
                    }
                }
            }
            if(typeof curpos[j]=="object") {
               deeper(curpos[j],type);
            }
        }
        curpath = curpath.slice(0,curpath.length-addedPath.length);
    }
    loadLoop();
}

function loadLoop() {
    if(Object.keys(sprites).length == imagePaths.length && audioPaths.length == Object.keys(sounds).length) {
        startLoops();
        imagePaths=[];
        audioPaths=[];
        imgs=[];
    } else {
        requestAnimationFrame(loadLoop);
    }
}

function spriteLoad(path,image) {
    let startpos;
    let endpos = path.lastIndexOf(".");
    for(let j=endpos-1;acceptableChars.includes(path[j]);j--) {startpos=j;}
    let spriteName = path.slice(startpos,endpos)
    sprites[spriteName] = image;
}

function addSound(src) {
    let startpos;
    let endpos = src.lastIndexOf(".");
    for(let j=endpos-1;acceptableChars.includes(src[j]);j--) {startpos=j;}
    let soundName = src.slice(startpos,endpos);
    sounds[soundName] = [1];

    let loadingSound = new Audio();
    loadingSound.src = src;
    sounds[soundName].push(loadingSound);

    let soundNode = context.createMediaElementSource(loadingSound);
    let gainNode = context.createGain();

    soundNode.connect(gainNode);
    gainNode.connect(context.destination);

    abuffer.push(soundNode);
    volumeList.push(gainNode);
}

function play(sound) {
    sound[sound[0]].play();
    sound[0]++;
    if(sound[0]==sound.length) {
        sound[0]=1;
    }
}
function img(img,x,y,angle=0,sx=1,sy=1) {
    var nx = x+camera.x+difx;
    var ny = y+camera.y+dify;
    var hh = 100//img.width/2;
    var hw = 100//img.height/2;
    if(nx+hw>0&&nx-hw<cw&&ny+hh>0&&ny-hh<ch) {
        if(angle===0&&sx===1&&sy===1) {
            curCtx.drawImage(img,Math.round(x+camera.x+difx-(img.width/2)),Math.round(y+camera.y+dify-(img.height/2)));
        } else {
            curCtx.setTransform(sx, 0, 0, sy, Math.round(x+camera.x+difx), Math.round(y+camera.y+dify));
            curCtx.rotate(angle);
            curCtx.drawImage(img,Math.round(-img.width/2),Math.round(-img.height/2));
            curCtx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
}

function rect(x,y,w,h,color) {
    curCtx.fillStyle = color;
    curCtx.fillRect(x-(w/2)+camera.x+difx,y-(h/2)+camera.y+dify,w,h);
}

function circle(x,y,r,color) {
    curCtx.beginPath();
    curCtx.arc(x+camera.x+difx, y+camera.y+dify, r, 0, 2 * Math.PI, false);
    curCtx.fillStyle = color;
    curCtx.fill();
}

function shape(x,y,relitivePoints,color) {
    x+=camera.x+difx;
    y+=camera.y+dify;
    curCtx.fillStyle = color;
    curCtx.beginPath();
    curCtx.moveTo(x+relitivePoints[0].x, y+relitivePoints[0].y);
    for(let i=1,l=relitivePoints.length;i<l;i++) {
        curCtx.lineTo(x+relitivePoints[i].x, y+relitivePoints[i].y);
    }
    curCtx.fill();
}

function text(txt,x,y,color="black",size=1,maxWidth=cw) {
    curCtx.fillStyle = color;
    curCtx.font = `${Math.round(size)*8}px PixelArial11`;
                                                                                        //I hate text wrapping now 
    var txtList = txt.split("\n");                                                      //split string on enters
    for(let i=0;i<txtList.length;i++) {                                                 //go through array of strings
        if(curCtx.measureText(txtList[i]).width>maxWidth) {                             //if the string is too big, divide up into smaller strings
            var tempTxt = txtList[i].split(" ");                                        //split into individual words
            var tempStr="";                                                             //string for measuring size
            var addAmount=0;                                                            //track where in the txtList we are
            txtList.splice(i,1);                                                        //remove the too long string
            for(let j=0;j<tempTxt.length;j++) {                                         //go through the split up string
                if(curCtx.measureText(tempStr + tempTxt[j] + " ").width<maxWidth) {     //if adding a word doesn't make tempStr too long, add it, other wise, add tempStr to txtList;
                    tempStr += tempTxt[j] + " ";
                } else {
                    if(j==0) {tempStr+=tempTxt[j];}                                     //if we are here when j is 0, we have one word that is longer then the maxWidth, so we just draw it
                    txtList.splice(i+addAmount,0,tempStr);                              //put tempStr in txtList
                    addAmount++;                                                        //move the position we put the tempStr in
                    tempStr="";                                                         //reset tempStr
                    tempTxt.splice(0,(j==0?1:j));                                       //delete words that have been used
                    j=-1;                                                               //make it so in the next loop, j starts at 0
                }
            }
            if(tempStr.length!=0) {
                txtList.splice(i+addAmount,0,tempStr);                                  //add any leftover text
            }
        }
    }

    for(let i=0;i<txtList.length;i++) {
        curCtx.fillText(txtList[i],x+camera.x+difx,y+camera.y+dify+(i*8*size+(size*i)));
    }
}

function centerCameraOn(x,y) {
    camera.x = -x+canvases.cvs.width/2;
    camera.y = -y+canvases.cvs.height/2;
}

function moveCamera(x,y) {
    camera.x -= y * Math.sin(camera.angle);
    camera.y -= y * Math.cos(camera.angle);
    camera.x -= x * Math.sin(camera.angle + 1.57079632);
    camera.y -= x * Math.cos(camera.angle + 1.57079632);
}

function imgRotScale(x,y,angle,scale,pic,ctx) { //used for camera movement
    ctx.setTransform(scale, 0, 0, scale, x, y);
    ctx.rotate(angle);
    ctx.drawImage(pic,-pic.width/2,-pic.height/2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawCursor() {
    if(cursor.sprite&&mouseOnCanvas) {
        if(cursor.alignment) {
            canvases.ctx.drawImage(cursor.sprite,mousePos.x-Math.round(cursor.sprite.width/2),mousePos.y-Math.round(cursor.sprite.height/2));
        } else {
            canvases.ctx.drawImage(cursor.sprite,mousePos.x,mousePos.y);
        }
        cursor.show = false;
    } else {
        cursor.show = true;
    }
}

function render() {
    if(drawMode===1) {
        imgRotScale(canvases.cvs.width/2,canvases.cvs.height/2,0,camera.zoom,canvases.buffer1cvs,canvases.ctx);
    }
    if(drawMode===2) {
        imgRotScale(canvases.cvs.width/2,canvases.cvs.height/2,camera.angle,1,canvases.buffer2cvs,canvases.buffer1ctx);
        imgRotScale(canvases.cvs.width/2,canvases.cvs.height/2,0,camera.zoom,canvases.buffer1cvs,canvases.ctx);
    }
}

function clearCanvases() {
    canvases.ctx.clearRect(0,0,canvases.cvs.width,canvases.cvs.height);
    canvases.buffer1ctx.clearRect(0,0,canvases.buffer1cvs.width,canvases.buffer1cvs.height);
    canvases.buffer2ctx.clearRect(0,0,canvases.buffer2cvs.width,canvases.buffer2cvs.height);
}

function switchDrawMode() {
    if(camera.zoom<1) {camera.zoom=1;}
    if(camera.angle!=0) {
        drawMode=2;
    } else if(camera.zoom!=1) {
        drawMode=1;
    } else {
        drawMode=0;
    }
    switch (drawMode) {
        case 0: curCtx = canvases.ctx; break;
        case 1: curCtx = canvases.buffer1ctx; break;
        case 2: curCtx = canvases.buffer2ctx; break;
    }
}

function resizeBuffers() {
    var tempSize = maxCvsSize/camera.zoom;
    var tempSizeAndPadding = tempSize + (tempSize/4)

    canvases.buffer2cvs.width = tempSizeAndPadding;
    canvases.buffer2cvs.height = tempSizeAndPadding;
    
    if(drawMode===2) {
        difx = (canvases.buffer2cvs.width - canvases.cvs.width)/2;
        dify = (canvases.buffer2cvs.height - canvases.cvs.height)/2;
    } else {
        difx=0;
        dify=0;
    }
    canvases.buffer2ctx.imageSmoothingEnabled = false;
}

function scaleCanvases() { //scales canvas by canvas scale, if scale is 0, canvas will try to fit screen
    var style = document.getElementById("gamejsstyle");
    if(canvasScale==0) {
        var tempScale = Math.floor(window.innerWidth/canvases.cvs.width);
        tempScale=tempScale<1?1:tempScale;
        style.innerHTML = `#game {image-rendering:pixelated;width:${tempScale*canvases.cvs.width}px;cursor: ${cursor.show?"crosshair":"none"};}`;
    } else {
        style.innerHTML = `#game {image-rendering:pixelated;width:${Math.floor(canvasScale*canvases.cvs.width)}px;cursor: ${cursor.show?"crosshair":"none"};}`;
    }
}
var k={a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,0:48,1:49,2:50,3:51,4:52,5:53,6:54,7:55,8:56,9:57,BACKTICK:192,MINUS:189,EQUALS:187,OPENSQUARE:219,ENDSQUARE:221,SEMICOLON:186,SINGLEQUOTE:222,BACKSLASH:220,COMMA:188,PERIOD:190,SLASH:191,ENTER:13,BACKSPACE:8,TAB:9,CAPSLOCK:20,SHIFT:16,CONTROL:17,ALT:18,META:91,LEFTBACKSLASH:226,ESCAPE:27,HOME:36,END:35,PAGEUP:33,PAGEDOWN:34,DELETE:46,INSERT:45,PAUSE:19,UP:38,DOWN:40,LEFT:37,RIGHT:39,CONTEXT:93,SPACE:32,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123};
var keyPress = [];
var keyDown = [];
var mousePress = [];
var mouseDown = [];
var scroll = 0;
var mousePos = {
    x:0,
    y:0
}
var preventedEvents = [false,true,true];

function addListenersTo(elementToListenTo) {
    window.addEventListener("keydown",kdown);
    window.addEventListener("keyup",kup);
    elementToListenTo.addEventListener("mousedown",mdown);
    elementToListenTo.addEventListener("mouseup",mup);
    elementToListenTo.addEventListener("mousemove",mmove);
    elementToListenTo.addEventListener("contextmenu",cmenu);
    elementToListenTo.addEventListener("wheel",scrl);
}
function removeListenersFrom(elementToListenTo) {
    window.removeEventListener("keydown",kdown);
    window.removeEventListener("keyup",kup);
    elementToListenTo.removeEventListener("mousedown",mdown);
    elementToListenTo.removeEventListener("mouseup",mup);
    elementToListenTo.removeEventListener("mousemove",mmove);
    elementToListenTo.removeEventListener("contextmenu",cmenu);
    elementToListenTo.removeEventListener("wheel",scrl);
}
function resetInput() {
    for(var i=0;i<keyPress.length;i++){if(keyPress[i]){keyPress[i]=0}}
    for(var i=0;i<mousePress.length;i++){if(mousePress[i]){mousePress[i]=0}}
    scroll=0;
}
function kdown(e) {
    var h=e.keyCode;
    keyPress[h]=keyPress[h]==[][[]]?1:0;
    keyDown[h]=1;
    if(preventedEvents[0]) {e.preventDefault()}
}
function kup(e) {
    var h=e.keyCode;
    delete keyPress[h];
    delete keyDown[h];
}
function mdown(e) {
    var h=e.button;
    mousePress[h]=mousePress[h]==[][[]]?1:0;
    mouseDown[h]=1;
    if(preventedEvents[1]) {e.preventDefault()}
}
function mup(e) {
    var h=e.button;
    delete mousePress[h];
    delete mouseDown[h];
}
function mmove(e) {
    mousePos.x=e.offsetX/canvasScale;
    mousePos.y=e.offsetY/canvasScale;    
}
function cmenu(e) {
    if(preventedEvents[1]) {e.preventDefault()}
}
function scrl(e) {
    scroll+=-1*(e.deltaY/100);
    if(preventedEvents[2]) {e.preventDefault()}
}
function dist(point1,point2) {
    let one = (point2.x - point1.x);
    let two = (point2.y - point1.y);
    return Math.sqrt((one*one)+(two*two));
}

function circlecircle(circle1,circle2) {
    if( dist(circle1,circle2) < (circle1.r + circle2.r)) {
		return true;
	} else {
        return false;
    }
}

function circlepoint(circle,point) {
    if( dist(circle,point) < circle.r) {
		return true;
	} else {
        return false;
    }
}

function rectrect(rect1,rect2) {
    if(rect1.x + rect1.w/2 >= rect2.x - rect2.w/2 &&
       rect1.x - rect1.w/2 <= rect2.x + rect2.w/2 &&
       rect1.y + rect1.h/2 >= rect2.y - rect2.h/2 &&
       rect1.y - rect1.h/2 <= rect2.y + rect2.h/2) {
        return true;
    } else {
        return false;
    }
}

function rectpoint(rect,point) {
    if(rect.x + rect.w/2 >= point.x &&
       rect.x - rect.w/2 <= point.x &&
       rect.y + rect.h/2 >= point.y &&
       rect.y - rect.h/2 <= point.y ) {
        return true;
    } else {
        return false;
    }
}

function vel(ang,spd) {
    return {x:Math.cos(ang)*spd,y:Math.sin(ang)*spd};
}

function circlerect(circle,rect) { //credit: https://yal.cc/rectangle-circle-intersection-test/
    let rectHalfWidth  = rect.w/2;
    let rectHalfHeight = rect.h/2;
    let deltaX = circle.x - Math.max(rect.x - rectHalfWidth, Math.min(circle.x, rect.x + rectHalfWidth));
    let deltaY = circle.y - Math.max(rect.y - rectHalfHeight, Math.min(circle.y, rect.y + rectHalfHeight));
    return (deltaX * deltaX + deltaY * deltaY) < (circle.r * circle.r);
}

function circleOnSideRect(circle,rect) {
    let rectHalfWidth  = rect.w/2;
    let rectHalfHeight = rect.h/2;
    let left   = rect.x - rectHalfWidth;
    let right  = rect.x + rectHalfWidth;
    let top    = rect.y - rectHalfHeight;
    let bottom = rect.y + rectHalfHeight;
    let cx = circle.x;
    let cy = circle.y;
    if(cy < top && cx > left && cx < right) { // top side
        return 0;
    } else if(cy > bottom && cx > left && cx < right) { // bottom side
        return 2;
    } else if (cx < left && cy > top && cy < bottom) { // left side
        return 3;
    } else if (cx > right && cy > top && cy < bottom) { // right side
        return 1;
    } else {
        let returnValue=0; // 0 = top, 1 = right, 2 = bottom, 3 = left
        let topleft = dist (circle,{x:left,y:top});
        let topright = dist (circle,{x:right,y:top});
        let bottomleft = dist (circle,{x:left,y:bottom});
        let bottomright = dist (circle,{x:right,y:bottom});
        switch(Math.min(topleft,topright,bottomleft,bottomright)) { // find what corner the cricle is closer to, then determine what side it is closer to
            case topleft:
                var m = slope(rect,{x:left,y:top});
                var mperp = -(1/m);
                var b = yIntercept(rect,m);
                var bperp = yIntercept(circle,mperp);
                var mid = POI(m,b,mperp,bperp);
                if(cx<mid) {returnValue = 3;} else {returnValue = 0;}
                break;
            case topright:
                var m = slope(rect,{x:right,y:top});
                var mperp = -(1/m);
                var b = yIntercept(rect,m);
                var bperp = yIntercept(circle,mperp);
                var mid = POI(m,b,mperp,bperp);
                if(cx<mid) {returnValue = 0;} else {returnValue = 1;}
                break;
            case bottomleft:
                var m = slope(rect,{x:left,y:bottom});
                var mperp = -(1/m);
                var b = yIntercept(rect,m);
                var bperp = yIntercept(circle,mperp);
                var mid = POI(m,b,mperp,bperp);
                if(cx<mid) {returnValue = 3;} else {returnValue = 2;}
                break;
            case bottomright:
                var m = slope(rect,{x:right,y:bottom});
                var mperp = -(1/m);
                var b = yIntercept(rect,m);
                var bperp = yIntercept(circle,mperp);
                var mid = POI(m,b,mperp,bperp);
                if(cx<mid) {returnValue = 2;} else {returnValue = 1;}
                break;
        }
        return returnValue;
    }
}

function rectOnSideRect(rect1,rect2) {
    let rectHalfWidth2  = rect2.w/2;
    let rectHalfHeight2 = rect2.h/2;
    let left2   = rect2.x - rectHalfWidth2;
    let right2 = rect2.x + rectHalfWidth2;
    let top2   = rect2.y - rectHalfHeight2;
    let bottom2 = rect2.y + rectHalfHeight2;

    let rectHalfWidth1  = rect1.w/2;
    let rectHalfHeight1 = rect1.h/2;
    let rx1 = rect1.x;
    let ry1 = rect1.y;
    let left1   = rx1 - rectHalfWidth1;
    let right1 = rx1 + rectHalfWidth1;
    let top1   = ry1 - rectHalfHeight1;
    let bottom1 = ry1 + rectHalfHeight1;
    // find what point is closer to the rectangle 
    let topleft1 = dist (rect2,{x:left1,y:top1});
    let topright1 = dist (rect2,{x:right1,y:top1});
    let bottomleft1 = dist (rect2,{x:left1,y:bottom1});
    let bottomright1 = dist (rect2,{x:right1,y:bottom1});
    let topmiddle1 = dist (rect2,{x:rx1,y:top1});
    let rightmiddle1 = dist (rect2,{x:right1,y:ry1});
    let bottommiddle1 = dist (rect2,{x:rx1,y:bottom1});
    let leftmiddle1 = dist (rect2,{x:left1,y:ry1});
    let cx = rx1;
    let cy = ry1;
    switch(Math.min(topleft1,topright1,bottomleft1,bottomright1,topmiddle1,rightmiddle1,bottommiddle1,leftmiddle1)) {
        //set the point we are testing to the closest point to the rectangle
        case topleft1:
            cx -= rect1.w/2;
            cy -= rect1.h/2;
            break;
        case topright1:
            cx += rect1.w/2;
            cy -= rect1.h/2;
            break;
        case bottomleft1:
            cx -= rect1.w/2;
            cy += rect1.h/2;
            break;
        case bottomright1:
            cx += rect1.w/2;
            cy += rect1.h/2;
            break;
        case topmiddle1:
            cy -= rect1.h/2;
            break;
        case rightmiddle1:
            cx += rect1.w/2;
            break;
        case bottommiddle1:
            cy += rect1.h/2;
            break;
        case leftmiddle1:
            cx -= rect1.w/2;
            break;
    }
    if(cy < top2 && cx > left2 && cx < right2) { // top side
        return 0;
    } else if(cy > bottom2 && cx > left2 && cx < right2) { // bottom side
        return 2;
    } else if (cx < left2 && cy > top2 && cy < bottom2) { // left side
        return 3;
    } else if (cx > right2 && cy > top2 && cy < bottom2) { // right side
        return 1;
    } else {
        let returnValue=0; // 0 = top, 1 = right, 2 = bottom, 3 = left
        let determiningPoint = {x:cx,y:cy};
        let topleft = dist (determiningPoint,{x:left2,y:top2});
        let topright = dist (determiningPoint,{x:right2,y:top2});
        let bottomleft = dist (determiningPoint,{x:left2,y:bottom2});
        let bottomright = dist (determiningPoint,{x:right2,y:bottom2});
        switch(Math.min(topleft,topright,bottomleft,bottomright)) { // find what corner the point is closer to, then determine what side it is closer to
            case topleft:
                var m = slope(rect2,{x:left2,y:top2});
                var mperp = -(1/m);
                var b = yIntercept(rect2,m);
                var bperp = yIntercept(determiningPoint,mperp);
                var mid = POI(m,b,mperp,bperp);
                if(cx<mid) {returnValue = 3;} else {returnValue = 0;}
                break;
            case topright:
                var m = slope(rect2,{x:right2,y:top2});
                var mperp = -(1/m);
                var b = yIntercept(rect2,m);
                var bperp = yIntercept(determiningPoint,mperp);
                var mid = POI(m,b,mperp,bperp);
                if(cx<mid) {returnValue = 0;} else {returnValue = 1;}
                break;
            case bottomleft:
                var m = slope(rect2,{x:left2,y:bottom2});
                var mperp = -(1/m);
                var b = yIntercept(rect2,m);
                var bperp = yIntercept(determiningPoint,mperp);
                var mid = POI(m,b,mperp,bperp);
                if(cx<mid) {returnValue = 3;} else {returnValue = 2;}
                break;
            case bottomright:
                var m = slope(rect2,{x:right2,y:bottom2});
                var mperp = -(1/m);
                var b = yIntercept(rect2,m);
                var bperp = yIntercept(determiningPoint,mperp);
                var mid = POI(m,b,mperp,bperp);
                if(cx<mid) {returnValue = 2;} else {returnValue = 1;}
                break;
        }
        return returnValue;
    }
}

function slope(point1,point2) {
    return ((point2.y-point1.y)/(point2.x-point1.x));
}

function yIntercept(point,slope) {
    return point.y - (slope * point.x);
}

function POI(m1,b1,m2,b2) {
    x = (b2 - b1) / (m1 - m2);
    return x;
    //y = m1 * x + b1;
}

function ifRectOnEdgeBounce(rect) {
    let rx = rect.x;
    let ry = rect.y;
    let rw = rect.w/2;
    let rh = rect.h/2;
    if(rx+rw>edge.right) {
        rect.v.x *= -1;
        rect.x = edge.right-rw;
    }
    if(rx-rw<edge.left) {
        rect.v.x *= -1;
        rect.x = edge.left+rw;
    }
    if(ry+rh>edge.bottom) {
        rect.v.y *= -1;
        rect.y = edge.bottom-rh;
    }
    if(ry-rh<edge.top) {
        rect.v.y *= -1;
        rect.y = edge.top+rh;
    }
}

function ifCircleOnEdgeBounce(circle) {
    let cx = circle.x;
    let cy = circle.y;
    let cr = circle.r;
    if(cx+cr>edge.right) {
        circle.v.x *= -1;
        circle.x = edge.right-cr;
    }
    if(cx-cr<edge.left) {
        circle.v.x *= -1;
        circle.x = edge.left+cr;
    }
    if(cy+cr>edge.bottom) {
        circle.v.y *= -1;
        circle.y = edge.bottom-cr;
    }
    if(cy-cr<edge.top) {
        circle.v.y *= -1;
        circle.y = edge.top+cr;
    }
}

// create globals
var canvases={cvs:null,ctx:null,buffer1cvs:null,buffer1ctx:null,buffer2cvs:null,buffer2ctx:null}, // visable and hidden canvases
cw, // canvas width
ch, // canvas height
camera={zoom:1,angle:0,x:0,y:0}, // affects how everything is drawn
updateFPS=60,
gameStarted=false,
drawMode=0, // 0=normal, 1=zoomed, 2=zoomed/rotated, set automatically depending on camera
curCtx, // what canvas to draw to
maxCvsSize, // used by second buffer
canvasScale=1,
difx, // offsets for drawing
dify,
seperateInputLoop=true,
edge={top:null,bottom:null,left:null,right:null}, // used by if___OnEdgeBounce, set to canvas size at setup, can be changed whenever

images=[], // put image paths here
imagePaths=[],
imgs=[],
sprites={}, // loaded images

audio=[], // put audio paths here
audioPaths=[],
sounds={}, // loaded sounds
abuffer = [], // audio nodes shoved here
volumeList = [], // gain nodes shoved here

cursor = {sprite:null,alignment:1,show:true}, // 0=topleft, 1=centered
mouseOnCanvas=false;

const acceptableChars="qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890_-. ";//for image names

const AudioContext = window.AudioContext||window.webkitAudioContext;
var context;

document.getElementById("game").onmouseout = function()   {mouseOnCanvas = false;}
document.getElementById("game").onmouseover = function()   {mouseOnCanvas = true;}

//setup canvases and input
function setup(physicsFPS) {
    updateFPS = physicsFPS;
    
    canvases.cvs = document.getElementById("game");
    canvases.ctx = canvases.cvs.getContext("2d", { alpha: false });

    canvases.cvs.onmousedown = function () {if(!gameStarted){loadImagesAndSounds();gameStarted=true;}}

    createCanvas("buffer1");
    createCanvas("buffer2");

    canvases.ctx.imageSmoothingEnabled = false;
    canvases.buffer1ctx.imageSmoothingEnabled = false;
    canvases.buffer2ctx.imageSmoothingEnabled = false;

    maxCvsSize=Math.max(canvases.cvs.width,canvases.cvs.height);
    cw=canvases.cvs.width;
    ch=canvases.cvs.height;
    
    edge={top:0,bottom:ch,left:0,right:cw};

    addFont();
    addStyle();

    
    requestAnimationFrame(startButton);
    function startButton() {
        curCtx = canvases.ctx;
        rect(100,100,20,20,"green")
        shape(800/2,600/2,[{x:-10,y:-15},{x:-10,y:15},{x:10,y:0}],"green");
        if(!gameStarted){requestAnimationFrame(startButton)};
    }

    addListenersTo(canvases.cvs);
}

function drawLoop() {
    cw=canvases.cvs.width;
    ch=canvases.cvs.height;
    scaleCanvases();

    switchDrawMode();
    
    resizeBuffers();

    clearCanvases();

    draw();
    
    render();

    curCtx=canvases.ctx;
    difx=0;dify=0;
    var camCache = {x:camera.x,y:camera.y};
    camera.x=0;camera.y=0;
    try{absoluteDraw();} catch {}

    drawCursor();

    camera.x = camCache.x;
    camera.y = camCache.y;

    requestAnimationFrame(drawLoop);
}

function updateLoop() {
    update();

    if(seperateInputLoop===false) {
        resetInput();
    }
}


function inputLoop() {
    input();

    resetInput();
}