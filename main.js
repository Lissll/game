const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
const canvas_width=canvas.width=8782;
const canvas_height=canvas.height=4000;
const foreground=document.getElementById('foreground');
const average_plan=document.getElementById('average_plan');
const background=document.getElementById('background');
const kubok=document.getElementById('kubok');
const question=document.getElementById('question');
const playbutton=document.getElementById('playbutton');
const cat=document.getElementById('cat');
const dog=document.getElementById('dog');
const background_menu=document.getElementById('background_menu');
const background_menu2=document.getElementById('background_menu2');
const heart=document.getElementById('heart');
const xpFull=document.getElementById('xp_full');
const hydrant=document.getElementById('hydrant');
let x=0;
let x2=8782
class Layer{
    constructor(image, speed, y_pos){
        this.x=0;
        this.y=y_pos;
        this.width=8782;
        this.height=4000;
        this.x2=this.width;
        this.image=image;
        this.speed_mov=speed;
    }
    draw(){
        ctx.drawImage(this.image, this.x, this.y);
        ctx.drawImage(this.image, this.x2, this.y);
    }
    update(){
        if(this.x<-8782){
            this.x=8782-this.speed_mov+this.x2;
        }
        else{
            this.x-=this.speed_mov;
        }
        if (this.x2<-8782){
            this.x2=8782-this.speed_mov+this.x;
        }
        else{
            this.x2-=this.speed_mov;
        }
    }
}
const cat_width=500;
const cat_height=300;
let jumpHeight = 2200;
let playerState='run';
let gameFrame=0;
let staggerFrames=1;
const spriteAnimations=[];
const statesAnimation=[
    {
        name:'idle',
        frames:6,
    },
    {
        name:'run',
        frames:12,
    },
    {
        name:'jump',
        frames:10,
    },
];
statesAnimation.forEach((state, index) =>{
    let frames={
        loc:[],
    }
    for(let j=0; j<state.frames;j++){
        let positionX=j*cat_width;
        let positionY=index*cat_height;
        frames.loc.push({x:positionX, y:positionY});
    }
    spriteAnimations[state.name]=frames;
});
const foregroundLayer=new Layer(foreground, 80, 1190);
const average_planLayer=new Layer(average_plan, 50, 600);
const backgroundLayer=new Layer(background, 20, 0);
const backgroundObject=[backgroundLayer, average_planLayer, foregroundLayer];
const dog_width=506;
const dog_height=198;
let dog_frameX=0;
const dog_staggerFrames=1;
document.addEventListener('keydown', function(event){
    if (event.code === 'Space' || event.code === 'ArrowUp'){
        if (playerState === 'run') {
            playerState = 'jump';
            jumpHeight-=50;
            setTimeout(() => {
                playerState = 'run'; 
            }, 500);
            setTimeout(() => {
                jumpHeight=2200; 
            }, 500); 
        }
    }
});
class Obstacle {
    constructor(image, x, y, width, height){
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 100;
    }
    update() {
        this.x -= this.speed;
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
let obstacles = [];
let lastObstacleTime = 0;
const obstacleInterval = 6000;
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function createHydrant() {
    let hydrantX = canvas_width + 800 + 100;
    let hydrantY = 3510; 
    let newHydrant = new Obstacle(hydrant, hydrantX, hydrantY, 800, 500); 
    obstacles.push(newHydrant);
}
function createDog() {
    let dogX = canvas_width + 2000 + 100;
    let dogY = 3420; 
    let newDog = new Obstacle(dog, dogX, dogY, 0, 0); 
  obstacles.push(newDog);
}
function animateDog(dog) {
    let dog_position = Math.floor(gameFrame / dog_staggerFrames) % 8;
    dog_frameX = dog_width * dog_position;
    ctx.drawImage(dog.image, dog_frameX, 0, dog_width, dog_height, dog.x, dog.y, 2000, 600);
}
let lives=3
let gameOver=false;
function animate() {
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    backgroundObject.forEach(object => {
      object.update();
      object.draw();
    });
    let position = Math.floor(gameFrame / staggerFrames) % spriteAnimations[playerState].loc.length;
    let frameX = cat_width * position;
    let frameY = spriteAnimations[playerState].loc[position].y;
    ctx.drawImage(cat, frameX, frameY, cat_width, cat_height, 0, jumpHeight, 4000, 1800);
    for (let i = 0; i < obstacles.length; i++){
        let obstacle = obstacles[i];
        obstacle.update();
        obstacle.draw();
        if (obstacle.image === dog){
          animateDog(obstacle);
        }
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            i--;
        } 
        else{
            if (playerState !== 'jump' && checkCollision(obstacle)) {
              handleCollision();
              obstacles.splice(i, 1);
              i--;
            }
        }
    }
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(xpFull, 20 + i * 700, 20, 600, 500);
    }
    for (let i = 0; i < 3 - lives; i++) {
        ctx.drawImage(heart, 20 + (2 - i) * 700, 20, 600, 500);
    }
    if (Date.now() - lastObstacleTime > obstacleInterval){
      lastObstacleTime = Date.now();
      if (random(0, 1) === 0) {
        createHydrant();
      } 
      else {
        createDog();
      }
    }
    gameFrame++;
    requestAnimationFrame(animate);
    if (gameOver) {
        drawGameOverMenu();
    }
}
function checkCollision(obstacle) {
    const catX = 0; 
    const catY = jumpHeight; 
    const catWidth = 4000; 
    const catHeight = 1800; 
    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;
    const obstacleTop = obstacle.y;
    const obstacleBottom = obstacle.y + obstacle.height;
    return (
      obstacleRight > catX &&
      obstacleLeft < catX + catWidth &&
      obstacleBottom > catY &&
      obstacleTop < catY + catHeight
    );
}
function handleCollision() {
    lives--;
    if (lives === 0) {
        gameOver = true;
        console.log("Game Over!");
    }
}
function drawGameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas_width, canvas_height);
}
document.addEventListener('keydown', function(event){
    if(event.code === 'KeyR' && gameOver){
        resetGame();
    }
});
function resetGame() {
    lives = 3;
    gameOver = false;
}
animate();
