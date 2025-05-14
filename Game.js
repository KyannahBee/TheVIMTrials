import { Player }           from "./Player.js";
import { Maze }             from "./Maze.js";
import { MazeDrawer }       from "./mazeDrawer.js";
import { Obstacle }         from "./Obstacle.js";
import { KeyboardListener } from "./keyboardlistener.js";
import { Timer }            from "./timer.js";
import { CommandEnnemie }   from "./CommandEnnemie.js";
import { InsertEnnemie }    from "./InsertEnnemie.js";
import { ReplaceEnnemie }   from "./ReplaceEnnemie.js";
import { VisualEnnemie }    from "./VisualEnnemie.js";

export class Game {
    constructor(level, onReadyCallback = null) {
        /* ---------- 1. Basis-waarden ---------- */
        this.level = level;
        this.onReadyCallback = onReadyCallback;
        this._gameOver = false;

        // Dimensie bepalen op basis van level
        if (this.level <= 20) { 
            this.dim = 10;
        } else if (this.level <= 40) { 
            this.dim = 15;
        } else { 
            this.dim = 20;
        }
        
        this.maze  = new Maze(this.dim);                   // nog ZONDER enemies/tutorial
        this.maze.game = this;                             // obstacles kunnen Game.endGame() aanroepen
        this.maze.generate();                              // één keer, asynchroon

        /* ---------- 2. Canvas & Drawer ---------- */
        this.canvas    = document.getElementById("mazeCanvas");
        this.ctx       = this.canvas.getContext("2d");
        this.cellSize  = this.canvas.width / this.dim;
        this.drawer    = new MazeDrawer(this.maze, this.ctx, this.cellSize, this.dim);
        this.paused    = false;
        this._winTriggered = false; 


        /* ---------- 3. Verzamel-arrays ---------- */
        this.player    = null;           // worden pas na maze-generatie gezet
        this.enemies   = [];
        this.obstacles = [];

        /* ---------- 4. Wacht tot doolhof klaar is ---------- */
        this.maze.obs.subscribe({
            complete : () => this._initEntitiesAndStart(),
            error    : err => console.error("[Maze] error:", err)
        });
    }

    /* =======================================================================
       ENTITIES + BESTURING + GAMELOOP
       =======================================================================*/
    _initEntitiesAndStart() {
        /* ---- speler ---- */
        this.player = new Player(this.maze, 0);             // start links-boven

        /* ---- vijanden ---- */
        if (this.level > 40) {
            this.maze.buildDistanceMatrix();
            for (let i = 0; i < this.level - 40; i++) {
                const ran = Math.floor(Math.random()*4);
                const enemieTypes = {
                    0: new CommandEnnemie(this.maze, this.maze.getRandomPos(this.player.node)),
                    1: new InsertEnnemie(this.maze, this.maze.getRandomPos(this.player.node)),
                    2: new ReplaceEnnemie(this.maze, this.maze.getRandomPos(this.player.node)),
                    3: new VisualEnnemie(this.maze, this.maze.getRandomPos(this.player.node))
                }
                this.enemies.push(enemieTypes[ran]);
            }
        }

        /* ---- obstakels (vragen) ---- */
        if (this.level > 20) {
            fetch("questions.json")
                .then(r => r.json())
                .then(qs => {
                    var n = 1;
                    if (this.level > 40) {
                        n = this.level - 40;
                    } else {
                        n = this.level - 20;
                    }
                    for (let i = n; i < 2*n; i++) {
                        this.obstacles.push(
                            new Obstacle(
                                this.maze,
                                this.maze.getRandomPos(this.player.node),
                                qs[i % qs.length]
                            )
                        );
                    }
                })
                .catch(err => console.error("Error loading questions:", err));
        } 

        this.keyboard = new KeyboardListener(
            this.player,
            this.handleInvalidSequence.bind(this)
        );
        fetch("sequences.json")
            .then(r => r.json())
            .then(data => this.keyboard.loadBindingsFromFile(JSON.stringify(data)))
            .catch(err => console.error("Error loading key bindings:", err));

        document.getElementById("levelDisplay").textContent = `${this.level}`;

        this._startLoop();

        if (typeof this.onReadyCallback === 'function') {
            this.onReadyCallback(this); // Pass current game to callback
        }

    }

    _startLoop() {
        this._loopTick = this._loopTick.bind(this);
        this.animationFrameId = requestAnimationFrame(this._loopTick);
    }

    /* ----------------------------- GAMELOOP ----------------------------- */
    _loopTick() {
        //console.log(this.level);
        if (!this.player || this.paused){
            this.animationFrameId = requestAnimationFrame(this._loopTick);
            return;
        }

        //console.log("tick");
        //console.log("Player node:", this.player.node, "Exit node:", this.maze.endCoords.x, " ", this.maze.endCoords.y);

        /* --- win? --- */
        if (this._playerReachedExit()) {
            this._triggerWin();
            return;
        }

        /* --- enemies --- */
        const now = performance.now();
        const pMode = this.player.gameMode || "n";
        const pNode = this.player.node;
        for (const e of this.enemies) {
            //console.log(e);
            if (now - e.lastTickTime >= 1500) { // 1000 ms = 1 second
                    e.gameTick(pMode, pNode);
                    e.lastTickTime = now;
                }

            if (e.collidesWith(this.player) && e.isActive) {
                this.endGame("Je bent geraakt door een vijand!");
                return;
            }
        }

        /* --- obstacles --- */
        for (const o of this.obstacles) {
            if (this.player.collidesWith(o)) {
                this._pauseGameLoop();
                this.player.movementLocked = true;
                this.keyboard.paused = true;
                this.keyboard.typedSequence = "";
                //console.log("movement LOCKED");

                o.activate(this.player).then(() => {
                    this._resumeGameLoop();
                    this.player.movementLocked = false;
                    this.keyboard.paused = false;
                    //console.log("movement UNLOCKED");
                });

                //return; 
            }
        }

        /* --- redraw --- */
        this.draw();

        /* volgende frame */
        this.animationFrameId = requestAnimationFrame(this._loopTick);
    }

    _pauseGameLoop() {
    this.paused = true;
    }

    _resumeGameLoop() {
        if (this.paused) {
            this.paused = false;
            //console.log("_resumegameloop");
            this.animationFrameId = requestAnimationFrame(this._loopTick);
        }
    }


    /* =======================================================================
       HULPFUNCTIES
       =======================================================================*/
           draw() {
                /* 1) achter­grond / doolhof­tegels */
                this.drawer.redrawMaze(this.cellSize);
        
                /* 2) sprites */
                this._drawSprite(this.player);
                this.enemies.forEach(e => this._drawSprite(e));
                this.obstacles.forEach(o => this._drawSprite(o));
            }
        
            _drawSprite(entity) {
                if (!entity?.imageLoaded) return;  // nog niet geladen
        
                const { x, y } = this._nodeToXY(entity.node);
                this.ctx.save();
                if (entity.invisible) this.ctx.globalAlpha = 0.4;
                this.ctx.drawImage(entity.image, x, y, this.cellSize, this.cellSize);
                this.ctx.restore();
            }
        
            _nodeToXY(node) {
                return {
                    x: (node % this.dim) * this.cellSize,
                    y: Math.floor(node / this.dim) * this.cellSize
                };
            }

    _playerReachedExit() {
        if (!this.player) return false;
        const endNode = this.maze.isPath.findIndex(v => v === -1);
        const exit = endNode !== -1 ? endNode : (this.maze.size -1);
        return this.player.node === exit;
    }

    _triggerWin() {
        if (this._winTriggered || this._gameOver) return;
        this._winTriggered = true;
        this._gameOver = true; 
        
        cancelAnimationFrame(this.animationFrameId);

        const msgBox = document.getElementById("Message-Container");
        const msg = document.getElementById("message");
        if (msgBox && msg) {
            msg.innerHTML = `
                <h1>volgend level!</h1>
            `;
            msgBox.style.visibility = "visible";
        }

        setTimeout(() => {
            if (msgBox && msg) msgBox.style.visibility = "hidden";

            const newLevel = this.level + 1;
            const canvas = document.getElementById("mazeCanvas");
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const timerDisplay = document.getElementById("timerDisplay");

            // Create a new game
            const newGame = new Game(newLevel, (readyGame) => {
                window.currentGame = readyGame;

                // Create a NEW Timer for the new level
                const newTimer = new Timer(30, () => {
                    readyGame.endGame("Tijd is op!");
                });

                // Start it immediately
                newTimer.start(timerDisplay);

                // Save the new timer globally (if needed)
                window.gameTimer = newTimer;

                // Optional: expose win/lose pause hooks
                const origWin = readyGame._triggerWin.bind(readyGame);
                readyGame._triggerWin = () => {
                    newTimer.pause();
                    origWin();
                };

                const origEnd = readyGame.endGame.bind(readyGame);
                readyGame.endGame = (reason) => {
                    newTimer.pause();
                    origEnd(reason);
                };

                readyGame.draw();
                readyGame.startGameLoop();
            });
        }, 2000);
    }

    /*
    _triggerWin() {
        cancelAnimationFrame(this.animationFrameId);

        const msgBox = document.getElementById("Message-Container");
        if (msgBox) msgBox.style.visibility = "visible";
    }*/

    endGame(reason = "Game Over!") {
        if (this._gameOver) return; // Don't run if already won or ended
        this._gameOver = true;

        cancelAnimationFrame(this.animationFrameId);

        const msgBox = document.getElementById("Message-Container");
        const msg = document.getElementById("message");
        if (msgBox && msg) {
            msg.innerHTML = `
                <h1>Probeer opnieuw!</h1>
                <p>${reason}</p>
            `;
            msgBox.style.visibility = "visible";
        }
        
        this.obstacles = [];
        this.enemies = [];

        setTimeout(() => {
            if (msgBox && msg) msgBox.style.visibility = "hidden";

            const canvas = document.getElementById("mazeCanvas");
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const timerDisplay = document.getElementById("timerDisplay");

            // Restart 5 levels lower
            const newGame = new Game(this.level - 5, (readyGame) => {
                window.currentGame = readyGame;

                const newTimer = new Timer(30, () => {
                    readyGame.endGame("Tijd is op!");
                });

                newTimer.start(timerDisplay);
                window.gameTimer = newTimer;

                const origWin = readyGame._triggerWin.bind(readyGame);
                readyGame._triggerWin = () => {
                    newTimer.pause();
                    origWin();
                };

                const origEnd = readyGame.endGame.bind(readyGame);
                readyGame.endGame = (reason) => {
                    newTimer.pause();
                    origEnd(reason);
                };

                readyGame.draw();
                readyGame.startGameLoop();
            });
        }, 2000);
    }

    handleInvalidSequence(seq) {
        console.log(`Sequence "${seq}" heeft geen functie.`);
    }

    startGameLoop(){
        if(!this.animationFrameId) this._startLoop();
    }
}
