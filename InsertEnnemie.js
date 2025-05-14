import { Enemie } from "./Enemie.js";

export class InsertEnnemie extends Enemie {

    constructor(maze, start) {
        super(maze, start, "./images/iEnemy.png"); // Call super() FIRST

        // Set properties for CommandEnemie (using div)
        this.imageName = `div`; // Use div instead of img
        this.mode = 'i';
        this.pattern = [this.moveDown, this.moveLeft, this.moveRight, this.moveUp]; // Example pattern

        // Update element styling
        this.applyBaseStyling('green');
    }
}
