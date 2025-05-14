import { Game } from './Game.js';
import { Timer } from './timer.js';

let currentGame;
let gameTimer;

// Expose toggleVisibility globally for inline onclick
window.toggleVisibility = toggleVisibility;

function toggleVisibility(id) {
    const element = document.getElementById(id);
    if (element) { // Add null check
        element.style.visibility = (element.style.visibility === "visible") ? "hidden" : "visible";
    }
}



document.addEventListener('DOMContentLoaded', () => {
    //const startButton = document.getElementById('starMazeBtn');
    const timerDisplay = document.getElementById('timerDisplay'); // Get timer display here

        // For now, we default to level 10. Later, we'll read this from URL params.
        //const initialLevel = 49;
        const urlParams = new URLSearchParams(window.location.search);
        const levelParam = parseInt(urlParams.get("level"), 10);
        const initialLevel = Number.isNaN(levelParam) ? 10 : levelParam;


        // Clean up previous game instance if exists?
        if (currentGame && currentGame.animationFrameId) {
            cancelAnimationFrame(currentGame.animationFrameId);
            currentGame.animationFrameId = null;
        }
        if (gameTimer) {
            gameTimer.pause(); // Pause previous timer if any
        }
        // Optional: Clear previous canvas content or remove/recreate canvas
        const canvas = document.getElementById('mazeCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Make the maze container visible (CSS default opacity is 0)
        const mazeContainer = document.getElementById('mazeContainer');
        if (mazeContainer) mazeContainer.style.opacity = '1';

        // Show timer container on game start
        const timerContainer = document.getElementById('timerContainer');
        if (timerContainer) timerContainer.style.display = 'block';

        // Hide any previous messages
        const msgContainer = document.getElementById('Message-Container');
        if (msgContainer) msgContainer.style.visibility = 'hidden';

        // Create the game instance
        currentGame = new Game(initialLevel);

        // --- Start Timer Setup (reordered) ---
        if (!timerDisplay) {
            console.error('Timer display element (#timerDisplay) not found!');
        } else {
            const startingSeconds = 30; // seconds
            // Ensure endGame exists on currentGame before creating timer callback
            if (currentGame && typeof currentGame.endGame === 'function') {
                if (gameTimer) {
                    gameTimer.reset(timerDisplay);
                } else {
                    gameTimer = new Timer(startingSeconds, () => {
                        if(currentGame) currentGame.endGame('Tijd is om!');
                    });
                }
            } else {
                console.error('Cannot create timer: currentGame.endGame is not available.');
            }

            // Wrap BEFORE starting timer or game loop
            if (gameTimer) {
                // Ensure methods exist before wrapping
                if (currentGame && typeof currentGame._triggerWin === 'function'){
                    const origTriggerWin = currentGame._triggerWin.bind(currentGame);
                    // Wrap _triggerWin to pause timer
                    currentGame._triggerWin = () => {
                        if (gameTimer) gameTimer.pause();
                        origTriggerWin(); // Call original win logic
                        gameTimer = new Timer(startingSeconds, () => {
                            if(currentGame) currentGame,endGame("Tijd is om!");
                        });
                    };
                } else {
                    console.error('Cannot wrap _triggerWin: method not found on currentGame.');
                }
                if (currentGame && typeof currentGame.endGame === 'function'){
                    const origEndGame = currentGame.endGame.bind(currentGame);
                    // Wrap endGame to pause timer
                    currentGame.endGame = (reason) => {
                        if (gameTimer) gameTimer.pause();
                        origEndGame(reason); // Call original end game logic
                    };
                } else {
                    console.error('Cannot wrap endGame: method not found on currentGame.');
                }
                // Only start timer after wrapping
                gameTimer.start(timerDisplay);
            } else {
                console.log('Timer was not created or started.');
            }
        }
        // --- End Timer Setup ---

        currentGame.draw(); // Initial draw
        currentGame.startGameLoop();
  
});
