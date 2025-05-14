import {MovableEntity} from "./MovableEntity.js";

export class Enemie extends MovableEntity{

    modes = ['n', 'i', 'v', ':', 'R'];
    path = new Set(); 

    constructor(maze, start, image) {
        super(maze, start, image);

        this.isActive = true;
        this.lastTickTime = 0;
        this.mode = 'n'; // Default mode
    }

    // Helper to update opacity based on invisibility
    updateOpacity() {
         if (this.image) {
             this.image.style.opacity = this.invisible ? "0.5" : "1";
         }
    }

    applyBaseStyling(color) {
        if (this.image) {
            this.image.style.backgroundColor = color; // Or make this customizable if needed

            // Ensure size is set if square property is available
            if (this.square > 0) {
                this.image.style.width = `${this.square * 0.7}px`;
                this.image.style.height = `${this.square * 0.7}px`;
                this.image.style.margin = `${this.square * 0.15}px`;
                this.image.style.borderRadius = '50%';
            } else {
                this.image.style.width = `7px`;
                this.image.style.height = `7px`;
            }

            this.updateOpacity();
        }
    }



    repath(targetNode) {
        // Store the target node instead of pre-calculating the entire path
        // This allows dynamic recalculation each tick
        this.targetNode = targetNode;
        // For backward compatibility, still maintain the path Set
        if (this.node === targetNode) {
            this.path = new Set(); // Clear path if already at target
        } else {
           this.path = this.maze.pathFromTo(this.node, targetNode);
        }
    }

   gameTick(playerMode, playerNode) {
        this.invisible = this.mode === playerMode;
        this.updateOpacity();

        if (this.invisible) {
            // When invisible, enemy doesn't move
            this.isActive = false;
            return;
        } else this.isActive = true;
        
        // If the enemy is at the player's position, no need to move
        if (this.node === playerNode) {
            this.path = new Set(); // Clear path
            return;
        }
        
        // Use improved pathfinding system for smarter movement
        const nextNode = this.maze.getNextNodeInPath(this.node, playerNode);
        
       console.log(nextNode);
        if (nextNode !== null) {
            // Try to move to the next node on the path
            const moveSucceeded = this.moveTo(nextNode);
            
            if (!moveSucceeded) {
                console.log(`[Enemie@${this.node}] gameTick: Move to ${nextNode} FAILED.`);
            }
        } else {
            console.log(`[Enemie@${this.node}] gameTick: No valid path to player at ${playerNode}.`);
        }
    }
   moveBlind() {
       console.warn(`[Enemie@${this.node}] moveBlind() is not implemented.`);
   }
}
