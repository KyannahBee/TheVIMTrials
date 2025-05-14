import { Maze } from "../scripts/amDoolh.js";
import { Timer } from "../scripts/timer.js";
import { MazeDrawer } from "../scripts/mazeDrawer.js";

function rand(max) {
    return Math.floor(Math.random() * max);
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function changeBrightness(factor, sprite) {
    var virtCanvas = document.createElement("canvas");
    virtCanvas.width = 500;
    virtCanvas.height = 500;
    var context = virtCanvas.getContext("2d");
    context.drawImage(sprite, 0, 0, 500, 500);

    var imgData = context.getImageData(0, 0, 500, 500);

    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] *= factor;
        imgData.data[i + 1] *= factor;
        imgData.data[i + 2] *= factor;
    }
    context.putImageData(imgData, 0, 0);

    var spriteOutput = new Image();
    spriteOutput.src = virtCanvas.toDataURL();
    virtCanvas.remove();
    return spriteOutput;
}

function toggleVisibility(id) {
    const element = document.getElementById(id);
    element.style.visibility = (element.style.visibility === "visible") ? "hidden" : "visible";
}

// Global Variables
var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var maze, draw;
var cellSize;
var difficulty = 10; // start with 10
const maxDifficulty = 40;
let winCounter = 0;
let levelTimer;
const displayElement = document.getElementById('displayTime');

// Message related
let isWin = false;

window.onload = function () {
    resizeCanvas();
    //setTimeout(makeMaze, 500);
};

window.onresize = function () {
    resizeCanvas();
    if (maze) {
        cellSize = mazeCanvas.width / difficulty;
        draw.redrawMaze(cellSize);
    }
};

function resizeCanvas() {
    let viewWidth = $("#view").width();
    let viewHeight = $("#view").height();
    let size = Math.min(viewWidth, viewHeight) - (Math.min(viewWidth, viewHeight) / 100);
    ctx.canvas.width = size;
    ctx.canvas.height = size;
}

function makeMaze() {
    document.getElementById("mazeCanvas").classList.add("border");
    cellSize = mazeCanvas.width / difficulty;

    maze = new Maze(difficulty);
    draw = new MazeDrawer(maze, ctx, cellSize, difficulty);

    document.getElementById("mazeContainer").style.opacity = "100";

    if (!levelTimer) {
        levelTimer = new Timer(getStartingMinutes(), gameOver);
    } else {
        levelTimer.pause();
        levelTimer = new Timer(getStartingMinutes(), gameOver);
    }
    levelTimer.start(displayElement);
}

function getStartingMinutes() {
    if (difficulty >= 40) return 1;
    if (difficulty >= 30) return 2;
    if (difficulty >= 20) return 3;
    return 4;
}

function winGame() {
    isWin = true;
    document.getElementById("message").innerHTML = `
        <h1>Proficiat!</h1>
        <p>Je bent klaar!</p>
        <input id="okBtn" type="button" onclick="confirmMessage()" value="Top!">
    `;
    toggleVisibility("Message-Container");
}

function gameOver() {
    isWin = false;
    document.getElementById("message").innerHTML = `
        <h1>Je verloor :/</h1>
        <p>Probeer het opnieuw!</p>
        <input id="okBtn" type="button" onclick="confirmMessage()" value="Opnieuw proberen!">
    `;
    toggleVisibility("Message-Container");
}

function confirmMessage() {
    document.getElementById("Message-Container").style.visibility = "hidden";

    if (isWin) {
        winCounter++;
        if (winCounter % 3 === 0 && difficulty < maxDifficulty) {
            difficulty += 5;
            if (difficulty > maxDifficulty) difficulty = maxDifficulty;
        }
    }
    makeMaze();
}

window.makeMaze = makeMaze;
window.winGame = winGame;
window.toggleVisibility = toggleVisibility;
window.confirmMessage = confirmMessage;

