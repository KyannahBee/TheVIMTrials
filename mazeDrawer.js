export class MazeDrawer {
    constructor(maze, ctx, cellSize, diff) {
        this.maze = maze;
        this.ctx = ctx;
        this.cellSize = cellSize;
        this.diff = diff;
        this.tree = maze.isPath;

        // Determine the correct image path based on current location
        const imagePath = window.location.pathname.includes('/Algoritme/') ? '../images/' : './images/';
        console.log("MazeDrawer: Using image path:", imagePath, "based on current path:", window.location.pathname);

        this.floorImg = new Image();
        this.floorImg.src = imagePath + "floor.jpg";
        this.floorImg.onerror = () => {
            this.floorImg = null; // fallback bij tekenen
        };
        this.floorImg.onload = () => {this.drawCells();}

        this.wallImg = new Image();
        this.wallImg.src = imagePath + "wall.jpg";
        this.wallImg.onerror = () => {
            console.error("Could not load wall image from", this.wallImg.src);
            this.wallImg = null;
        };
        this.wallImg.onload = () => {this.drawCells();}

        this.endImg = new Image();
        this.endImg.src = imagePath + "end.png";
        this.endImg.onerror = () => {
            console.error("Could not load end image from", this.endImg.src);
            this.endImg = null;
        };

        this.maze.obs.subscribe({next: x=> this.drawCell(x.node, x.color),
                                                complete: () => this.drawEnd(),
                                                error: err => console.error(err)});

      this.maze.generate();
    //this.drawCells();
    }

    drawCells() {
        for (let i = 0; i < this.tree.length; i++) {
            this.drawCell(i, this.maze.isPath[i]?"white":"black")
        }
    }

    drawCell(i, color) {
        let x = i % this.diff;
        let y = Math.floor(i / this.diff);
        let img = color === "white" ? this.floorImg : this.wallImg;

        if (img!==null && img.complete && img.naturalWidth !== 0) {
            this.ctx.drawImage(img, x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        } else {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
    }

    drawEnd() {
        const { ctx, cellSize } = this;
        let endCell = this.maze.endCoords;

        if (this.endImg!==null && this.endImg.complete && this.endImg.naturalWidth !== 0) {
            this.ctx.drawImage(this.endImg, endCell.x * cellSize, endCell.y * cellSize, cellSize, cellSize);
        } else {
            ctx.fillStyle = "green";
            ctx.fillRect(endCell.x * cellSize, endCell.y * cellSize, cellSize, cellSize);
        }
    }

    redrawMaze(newCellSize = this.cellSize) {
        this.cellSize = newCellSize;
        this.ctx.lineWidth = this.cellSize / 50;
        this.drawCells();
        this.drawEnd();
    }
}
