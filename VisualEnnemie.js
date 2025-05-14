import { Enemie } from "./Enemie.js";

export class VisualEnnemie extends Enemie {

    constructor(maze, start) {
        super(maze, start, "./images/vEnemy.png"); // Call super() FIRST

        // Set properties for CommandEnemie (using div)
        this.imageName = `div`; // Use div instead of img
        this.mode = 'v';
        this.pattern = [this.moveDown, this.moveLeft, this.moveRight, this.moveUp]; // Example pattern

        // Update element styling
        this.applyBaseStyling('yellow');
    }
}
