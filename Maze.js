const Subject = window.Subject;

export class Maze{



    constructor(dim=1, enemies=false, tutorial = false){
        this.newMaze(dim, enemies, tutorial);
        this.obs= new Subject();
    }

    newMaze(dim, enemies=false, tutorial = false){
        this.dim = dim;
        this.size = dim*dim;
        this.graph = Array.from({ length: this.size }, () => ({}));
        this.tree = Array.from({ length: this.size }, () => ({}));
        this.isPath = Array(this.size).fill(false);
        this.endCoords = {x: null, y: null};
        this.enemies = enemies;
        this.tutorial = tutorial;

        this.initGraph();
    }

    generate(){
        this.generateMaze();
        if (this.enemies){
            this.buildDistanceMatrix();
        }
    }

    initGraph() {
        for (let i = 0; i < this.size; i++) {
            const row = Math.floor(i / this.dim);
            const col = i % this.dim;

            // Right neighbor
            if (col < this.dim - 1) {
                const right = i + 1;
                this.graph[i][right] = true;
                this.graph[right][i] = true;
            }

            // Bottom neighbor
            if (row < this.dim - 1) {
                const down = i + this.dim;
                this.graph[i][down] = true;
                this.graph[down][i] = true;
            }
        }
    }

    generateMaze() {
        this.isPath.fill(false);
        this.tree = Array.from({ length: this.size }, () => ({}));
        this.v = 0;
        this.isPath[this.v] = true;
        this.edges = Array(this.size).fill(1);

        const generateStep = () => {
            if (this.edges.filter(p => p===1).length === 0) {
                this.makeEnd();
                this.obs.complete();
                return;
            }
            this.generateNode();
            setTimeout(generateStep, this.tutorial ? 1000 : 0); // 0ms standaard, 1000ms bij tutorial
        };

        generateStep(); // Start de eerste stap
    }

    generateNode(){
            this.edges.fill(0);
            for (let i=0; i<this.size; i++){
                if (this.isPath[i]){
                    for (let j=0; j< this.size; j++){
                        if (!this.isPath[j] && j in this.graph[i]){
                            this.edges[j]++;
                        }
                    }
                }
            }


            let ran = Math.floor(Math.random() * this.edges.filter(x => x===1).length);
            let count =0;
            let found = false;
            let k=1;
            while (k<this.size && !found) {
                if (this.edges[k] === 1){
                    if(count === ran) {
                        this.v = k;
                        found = true;
                    }
                    count++;
                }
                k++;
            }
            this.isPath[this.v] = true;
            this.addToBoom(this.v);
            this.obs.next({ node: this.v, color: "white" });

    }

    addToBoom(v) {
        const neighbors = [];

        const row = Math.floor(v / this.dim);
        const col = v % this.dim;

        // Check all 4 directions with boundary checks
        if (col > 0) neighbors.push(v - 1);         // left
        if (col < this.dim - 1) neighbors.push(v + 1); // right
        if (row > 0) neighbors.push(v - this.dim);     // up
        if (row < this.dim - 1) neighbors.push(v + this.dim); // down

        for (const n of neighbors) {
            if (this.isPath[n]) {
                this.tree[v][n] = true;
                this.tree[n][v] = true;
            }
        }
    }

    /*addToBoom(v){
        let t = [v-1, v+1, v-this.dim, v+this.dim];
        for (let i=0; i<4;i++){
            if(this.isPath[t[i]] && this.isPath[t[i]]!==undefined){
                this.tree[v][t[i]]=true;
                this.tree[t[i]][v]=true;
                return;
            }
        }
    }*/

    makeEnd(){
        let end;
        for (let i=this.size-this.dim-1; i< this.size; i++){
            if (this.isPath[i]){
                end = i;
            }
        }
        let x = end % this.dim;
        let y = this.dim-1;
        this.isPath[end] = -1;
        this.endCoords.x = x;
        this.endCoords.y = y;
    }

    buildDistanceMatrix() {
        this.distMatrix = Array.from({ length: this.size }, () => Array(this.size).fill(0));

        const bfs = (start) => {
            const visited = Array(this.size).fill(false);
            const queue = [[start, 0]];
            visited[start] = true;

            while (queue.length > 0) {
                const [node, dist] = queue.shift();
                this.distMatrix[start][node] = dist;
                for (const neighbor in this.tree[node]) {
                    const numNeighbor = parseInt(neighbor);
                    if (!visited[numNeighbor]) {
                        visited[numNeighbor] = true;
                        queue.push([numNeighbor, dist + 1]);
                    }
                }
            }
        };

        for (let i = 0; i < this.size; i++) {
            bfs(i);
        }
    }

    getNextNodeInPath(from, to) {
        for (const vStr of Object.keys(this.tree[from])) {
            const v = parseInt(vStr);
            if (this.distMatrix[from][v] + this.distMatrix[v][to] === this.distMatrix[from][to]) {
                return v;
            }
        }
        return null;
    }


    printGraph() {
        for (let row = 0; row < this.size; row++) {
            console.log(this.tree[row]);
        }
    }

    printMaze(){
        for (let i=0; i<this.dim; i++){
            console.log(this.isPath.slice(i*this.dim,i*this.dim+this.dim).map(b => b?1:0).join(""));
        }
        console.log(this.endCoords())
    }

    getRandomPos(){
        let ran = Math.floor(Math.random() * this.size);
        while(!this.isPath[ran] || (ran%this.dim<this.dim/2 && ran/this.dim<this.dim/2)){
            ran = Math.floor(Math.random() * this.size);
        }
        return ran;
    }

}
