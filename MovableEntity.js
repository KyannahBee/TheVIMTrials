import {Entity} from "./Entity.js";

export class MovableEntity extends Entity{

    xOffset = 0;
    yOffset = 0;
    movementLocked = false;

    constructor(maze, start, image) {
        super(maze, start, image);
        if (this.constructor === Entity) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    moveUp(){
        if (this.movementLocked) {console.log("movementup is locked"); return false;}
        //console.log("Attempting moveUp");
        let goTo = this.node - this.maze.dim; 
        let succeeded = this.moveTo(goTo);
        if (succeeded){
            this.yOffset -= this.square;
            this.translate();
        }
        return succeeded;
    }

    moveUpUntillWall(){
        console.log("Attempting to gg");
        while(this.moveUp());
    }

    moveDown(){
        if (this.movementLocked) {console.log("movementDown is locked"); return false;}
        //console.log("Attempting moveDown");
        let goTo = this.node + this.maze.dim; 
        let succeeded = this.moveTo(goTo);
        if (succeeded){
            this.yOffset += this.square;
            this.translate();

        }
        return succeeded;
    }

    moveDownUntillWall(){
        console.log("attempting to G");
        while(this.moveDown());
    }

    moveRight(){
        if (this.movementLocked) {console.log("movementRight is locked"); return false;}
        if (this.movementLocked) return false;
        let goTo = this.node+1;
        let succeeded = this.moveTo(goTo);
        if (succeeded) {
            this.xOffset += this.square;
            this.translate();

        }
        return succeeded;
    }

    moveRightUntillWall(){
        while(this.moveRight());
    }

    moveLeft() {
        if (this.movementLocked) {console.log("movementLeft is locked"); return false;}
        let goTo = this.node - 1;
        let succeeded = this.moveTo(goTo);
        if (succeeded) {
            this.xOffset -= this.square;
            this.translate();
        }
        return succeeded;
    }

    moveLeftUntillWall(){
        while(this.moveLeft());
    }

    moveTo(goTo){
        // Check bounds and if the target node is a valid path in the tree
        if (goTo >= 0 && goTo < this.maze.size && this.maze.tree[this.node][goTo]) {
            console.log(`Move successful: ${this.node} -> ${goTo}`);
            this.node = goTo;
            return true; 
        } else {
            console.log(`Move failed: ${this.node} -> ${goTo} (Wall or invalid)`);
             // Add more detail for debugging why move failed:
             if (!(goTo >= 0 && goTo < this.maze.size)) {
                 console.log(`Reason: Target node ${goTo} is out of bounds (0-${this.maze.size - 1})`);
             } else if (this.maze.isPath[goTo] === 0) { 
                 console.log(`Reason: Target node ${goTo} is a wall (isPath=0).`);
             } else if (this.maze.tree[this.node][goTo] !== 1) {
                 console.log(`Reason: No direct path in tree between ${this.node} and ${goTo}. tree[${this.node}][${goTo}]=${this.maze.tree[this.node][goTo]}`);
             }
            return false; 
        }
    }

    translate(){
        // Only update the transform style if this.image has a style property
        // This makes it compatible with both DOM-based and canvas-based rendering
        if (this.image && this.image.style) {
            this.image.style.transform = `translate(${this.xOffset}px, ${this.yOffset}px)`;
        }
    }

}
