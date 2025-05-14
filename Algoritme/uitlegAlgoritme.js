import { Maze } from '../Maze.js';
import { MazeDrawer } from '../mazeDrawer.js';


const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// Maze parameters
const dimension = 20;   // 20x20 maze
const cellSize = canvas.width / dimension;

// Functie om een nieuwe maze te maken en te tekenen
function startNewMaze() {
    const maze = new Maze(dimension, false, true);
    const mazeDrawer = new MazeDrawer(maze, ctx, cellSize, dimension);

    // Als het doolhof klaar is, opnieuw starten
    maze.obs.subscribe({
        complete: () => {
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leegmaken
                startNewMaze(); // Nieuwe maze starten
            }, 1000); // Eventueel korte pauze van 1 seconde
        }
    });
}



// Start de eerste maze
startNewMaze();
