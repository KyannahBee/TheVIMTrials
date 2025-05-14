// Entity is an abstract class

export class Entity {

    imageName = "entity";
    imageSource = "";
    square = 10;

    constructor(maze, start, image) {
        if (this.constructor === Entity) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.maze = maze;
        this.node = start;
        this.image = new Image();
        
        // Determine correct path based on location
        if (image.startsWith('./')) {
            const imagePath = window.location.pathname.includes('/Algoritme/') ? '../' + image.slice(2) : image;
            this.image.src = imagePath;
        } else {
            this.image.src = image;
        }
        
        this.imageLoaded = false;
        this.image.onload = () => { this.imageLoaded = true; };
        this.image.onerror = () => console.warn("sprite niet gevonden", this.image.src);
    }

    //other is from type Entity
    //returns true is they collide
    collidesWith(other){
        return this.node === other.node;
    }

}
