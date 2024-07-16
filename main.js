const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
let canvas_width=canvas.width=8782;
let canvas_height=canvas.height=4000;
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
const catMenu=document.getElementById('catMenu');
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
const dog_staggerFrames=3;
document.addEventListener('keydown', function(event){
    if (event.code === 'Space' || event.code === 'ArrowUp'){
        if (playerState === 'run') {
            playerState = 'jump';
            jumpHeight-=50;
            jump.play();
            jump.volume=1;
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
let score=0;
let maxScore=0;
function animate(){
    canvas.width=8782;
    canvas.height=4000;
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
    if (!gameOver){
        score++;
    }
    ctx.font = "400px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Счёт:"+score, 7000, 400);
    gameFrame++;
    requestAnimationFrame(animate);
    if (gameOver){
        if (score>maxScore){
            maxScore=score;
        }
        meow.play();
        meow.volume = 0.6;
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
    if (lives === 0){
        gameOver = true;
        console.log("Game Over!");
    }
}
const exit=document.getElementById('exit');
const restart=document.getElementById('restart');
function drawGameOverMenu(){
    ctx.fillRect(0, 0, canvas_width, canvas_height);
    canvas.height=600;
    canvas.width=800;
    ctx.drawImage(background_menu, 0, 0);
    ctx.fillStyle='#520408'
    ctx.save()
    ctx.globalAlpha=0.5;
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.restore();
    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Вы проиграли", 250, 300);
    ctx.fillText("Счёт: " + score, 50, 80);
    ctx.drawImage(restart, 250, 400);
    ctx.drawImage(exit, 500, 400);
    ctx.font='25px Arial'
    ctx.fillText("Начать заново", 200, 500);
    ctx.fillText("На главную", 500, 500);
}
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x >= 250 && x <= 250 + restart.width &&
        y >= 400 && y <= 400 + restart.height) {
        resetGame();
    }
});
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x >= 500 && x <= 500 + exit.width &&
        y >= 400 && y <= 400 + exit.height){
        resetGame();
        startmenu();
    }
});
document.addEventListener('keydown', function(event){
    if(event.code === 'KeyR' && gameOver){
        resetGame();
    }
});
function resetGame(){
    lives = 3;
    gameOver = false;
    score=0;
    obstacles = [];
    gameFrame = 0;
}
let audioBack=new Audio('audioBack.mp3');
let meow=new Audio('meow.mp3');
let jump=new Audio('jump.mp3');
function startmenu() {
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    canvas.width=800;
    canvas.height=600;
    audioBack.play();
    audioBack.volume=0.3
    function playMeow(){
        meow.oncanplaythrough = function() {
            meow.play();
            meow.volume = 0.5;
        };
    }
    setInterval(playMeow, 25000);
    ctx.drawImage(background_menu, 0, 0);
    ctx.drawImage(kubok, 5, 10);
    ctx.drawImage(question, 680, 10);
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Рекорд: " + maxScore, 7, 120);
    ctx.fillText("Правила игры", 635, 120);
    ctx.drawImage(playbutton, 310, 200, 200, 180);
    ctx.drawImage(catMenu, 200, 400, 350, 200);
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#07044b"); 
    gradient.addColorStop(1, "#2d1b34"); 
    ctx.font= "50px Arial";
    ctx.fillStyle = gradient;
    ctx.fillText("Cats adventures", 190, 70);
    ctx.textAlign = 'center';
    ctx.font= "45px Arial";
    ctx.fillText("in Japan", 380, 120);
    
    requestAnimationFrame(startmenu);
}
window.onload = startmenu;
canvas.addEventListener('click', function(event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        if (x >= 310 && x <= 510 && y >= 200 && y <= 380) {
            animate();
        }
        meow.pause();
        meow.currentTime=0;
});
