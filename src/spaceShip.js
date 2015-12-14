//*************************************************
// 
// SPACE SHIP
// another copter clone
// 
// Developed in pure JavaScript
// 
// Sam Taylor
// December 14, 2015
//
//*************************************************


//*************************************************
// INITIALIZATION
//*************************************************
var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 1)
    };
var canvas = document.createElement("canvas");
var width = 800;
var height = 400;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

var spaceShipUp = new Image();
var spaceShipDown = new Image();
var spaceShipFlat = new Image();
var explode = new Image();
spaceShipUp.src = "../images/spaceshipUp.png";
spaceShipDown.src = " ../images/spaceshipDown.png";
spaceShipFlat.src = " ../images/spaceShipFlat.png";
explode.src = " ../images/explosion.png";

var limeGreen = "#00ff00";
var newHighScore= false;
var displayText = true;
var score = 0;
var highScore = 0;
var gameOver = false;
var clickOrPress = false;
var minSlopeLen = 30;
var slopeLen = 0;
var speed = 6;


// initialize pipes
var pipeSpeed = getRandPipeYSpeed();
var pipeWidth = 16;
var pipeHeight = 325;
var numPipes = width/pipeWidth + 1;
var pipeX = 0;
var pipeY = ((canvas.height - pipeHeight) / 2);
var pipes = []; //array to store pipe objects

for(i = 0; i < numPipes; i++){
    pipes[i] = new Pipe(pipeX, pipeY, pipeWidth, pipeHeight);
    pipeX += pipeWidth;
}

// initialize walls
var wallHeight = 75;
var wallWidth = 25;
var wall = new Wall(600, getRandWallPos(), wallWidth, wallHeight);
var wall2 = new Wall(1000, getRandWallPos(), wallWidth, wallHeight);

// initialize spaceShip
var spaceShip = new SpaceShip(200, 200, 74, 40);



//*************************************************
// Functions to update the canvas
//
// repeatedly step until game over
//*************************************************

// display objects to canvas
var render = function () {
    context.fillStyle = limeGreen;
    context.fillRect(0, 0, canvas.width, canvas.height);
    for(i = 0; i < numPipes; i++){
        pipes[i].render();
    }
	spaceShip.render();
	wall.render();
    wall2.render();
};

var index;

// update objects
var update = function () {
    for(i = 0; i < numPipes; i++){
        pipes[i].update();
    }
    spaceShip.update();
    wall.update(); 
    wall2.update();
};

// animation function
var step = function () {
    if(gameOver)
        gameOverText();
    else {
        update();
        render();
        animate(step);
    }
};

//*************************************************
// SpaceShip Object Prototype and functions
//*************************************************
function SpaceShip(x, y, width, height) {
	this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 0;
}

SpaceShip.prototype.render = function () {
    if(gameOver){
        context.drawImage(explode, this.x, this.y, this.width, this.height);
    }
    else if(this.speed > -0.25 && this.speed < 0.25){
        context.drawImage(spaceShipFlat, this.x, this.y, this.width, this.height);
    }
    else if(this.speed > 0){
        context.drawImage(spaceShipDown, this.x, this.y, this.width, this.height);
    }
    else{
        context.drawImage(spaceShipUp, this.x, this.y, this.width, this.height);
    }   
};

SpaceShip.prototype.update = function () {
	if(clickOrPress)
        this.move(true); // pressing button - move up	
	else 
    	this.move(false); // not pressing button - move down
};

SpaceShip.prototype.move = function (up) {
    if(!didSpaceShipCollide()) {
        if(up) {
            if (this.speed > -9) {
                this.speed -= 0.3;
            }
            this.y += this.speed;
        }
        else {
            if (this.speed < 9) {
                this.speed += 0.3;
            }
            this.y += this.speed;
        }        
    }
};


//*************************************************
// Wall Object Prototype and functions
//*************************************************
function Wall(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
}

Wall.prototype.render = function() {
    context.fillStyle = limeGreen;
    context.fillRect(this.x, this.y, this.width, this.height);
};

Wall.prototype.update = function() {
    this.x -= this.speed;
    if((this.x + this.width) <= 0){
        this.x = width;
        this.y = getRandWallPos();
    }
};


//*************************************************
// gets a random number to place wall in a random y position
//*************************************************
function getRandWallPos() {
    var rightPipe = pipes[numPipes-1];
    return rightPipe.top + Math.random()*(rightPipe.bottom - rightPipe.top - wallHeight);
}


//*************************************************
// Pipe Object Prototype and functionsfunctions
//*************************************************
function Pipe(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.top = y;
    this.bottom = y + height;
}

Pipe.prototype.render = function() {
    context.fillStyle = "black";
    context.fillRect(this.x, this.y, this.width, this.height);
};

Pipe.prototype.update = function() {
    this.x -= speed;

    if(Math.random() < 0.5 && slopeLen > minSlopeLen){
        if(pipeSpeed > 0){
            pipeSpeed = -getRandPipeYSpeed();   
        }
        else{
           pipeSpeed = getRandPipeYSpeed();   
        }
        slopeLen = 0;
    }

    if(this.x+this.width <= 0){
        if(pipeY+pipeHeight > canvas.height){
            pipeSpeed = -getRandPipeYSpeed();
            slopeLen = 0;
        }
        else if(pipeY < 0 ){
            pipeSpeed = getRandPipeYSpeed();
            slopeLen = 0;
        }
        pipeY += pipeSpeed;
        pipes.shift();
        var p = new Pipe(canvas.width+(this.x+this.width), pipeY, pipeWidth, pipeHeight);
        pipes.push(p);
        pipes[0].x -= speed;
        slopeLen++;

        document.getElementById("score").innerHTML = "Score: " + (++score);
        if(score > highScore){
            newHighScore = true;
            highScore = score;
            document.getElementById("caption").innerHTML = "High Score: " + highScore;
        }
    }
};

//*************************************************
// gets a random speed that pipes will move up or down
//*************************************************
function getRandPipeYSpeed() {
    return 1 + Math.random() * 3;
}


//*************************************************
// CHECK FOR SPACESHIP COLLISION
//*************************************************
function didSpaceShipCollide() {

    var pipe = pipes[Math.floor(spaceShip.x / pipeWidth)-1];

    if(spaceShip.y <= pipe.top || spaceShip.y+spaceShip.height >= pipe.bottom) {
        gameOver = true;
        return true;
    }
    if(wall.x <= spaceShip.x+spaceShip.width && wall.x+wall.width >= spaceShip.x){ // collides with wall
        if(spaceShip.y < wall.y+wall.height && spaceShip.y+spaceShip.height > wall.y) {
            gameOver = true;
            return true;
        }        
    }
    if(wall2.x <= spaceShip.x+spaceShip.width && wall2.x+wall2.width >= spaceShip.x){ // collides with wall2
        if(spaceShip.y < wall2.y+wall2.height && spaceShip.y+spaceShip.height > wall2.y) {
            gameOver = true;
            return true;
        }        
    }
    else {
        return false;
    }
}


//*************************************************
// RESET GAME
//*************************************************
function reset() {
    score = 0;
    gameOver = false;

    // reset spaceShip position and speed
    spaceShip.x = 200;
    spaceShip.y = 200;
    spaceShip.speed = 0;

    // reset wall positions
    wall.x = 600;
    wall.y = getRandWallPos();
    wall2.x = 1000;
    wall2.y = getRandWallPos();

    //reset pipes
    pipeY = ((canvas.height - pipeHeight) / 2);
    pipeSpeed = getRandPipeYSpeed();
    for(i = 0; i < numPipes; i++){
        pipes[i].y = pipeY;
    }

    // display reset spaceShip and walls
    render();

    // reset html
    document.getElementById("score").innerHTML = "Score: " + score;
    document.getElementById("bigText").innerHTML = "Click or Press any Key to Start";
    document.getElementById("mainText").onclick = beginGame;
    document.getElementById("smallText").innerHTML = "";
}



//*************************************************
// CHANGE TEXT STATE
//*************************************************
function hideText() {
    displayText = false;
    document.getElementById("mainText").style.visibility = "hidden";
}

// display Game Over Text
// click the div to play again
function gameOverText() {
    displayText = true;
    if(newHighScore){
        document.getElementById("bigText").innerHTML = "New High Score: " + highScore;
        newHighScore = false;
    }
    else{
        document.getElementById("bigText").innerHTML = "Game Over";    
    }
    document.getElementById("smallText").innerHTML = "click or press to play again";
    document.getElementById("mainText").style.visibility = "visible";
    document.getElementById("mainText").onclick = reset;
}



//*************************************************
// EVENT LISTENERS
// listen for mouse clicks or key presses
//*************************************************

// use any arrow key
window.addEventListener("keydown", function (event) {
    clickOrPress = true;
    if(displayText) {   // if text is on the screen
        if(gameOver)    // if display text is showing
            reset();
        else            // if click to play text is showing
            beginGame(); 
    }
});

window.addEventListener("keyup", function (event) {
    clickOrPress = false;
});

// or use mouse
window.addEventListener("mousedown", function (event) {
    clickOrPress = true;
});

window.addEventListener("mouseup", function (event) {
    clickOrPress = false;
});


//*************************************************
// ONLOAD FUNCTION
// display first screen before game starts
//*************************************************
window.onload = function() {
    document.body.appendChild(canvas);
    render();
}

//*************************************************
// BEGIN GAME
//*************************************************
function beginGame() {
    hideText();
    animate(step);
}