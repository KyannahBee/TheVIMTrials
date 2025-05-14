import { MovableEntity } from "./MovableEntity.js";

export class Player extends MovableEntity {
    constructor(maze, start) {
        super(maze, start, "./images/player.png");
        this.gameMode = 'n';
        this._resetTimeout = null;
    }

    getPosition() {
        const col = this.node % this.maze.dim;
        const row = Math.floor(this.node / this.maze.dim);
        return { node: this.node, row: row, col: col };
    }

    _setGameModeTemporary(mode) {
        this.gameMode = mode;

        // Clear any existing timeout
        if (this._resetTimeout) {
            clearTimeout(this._resetTimeout);
        }

        // Reset to normal mode after 3 seconds
        this._resetTimeout = setTimeout(() => {
            this.gameMode = 'n';
            this._resetTimeout = null;
        }, 3000);
    }

    // Public generic method (can be kept for other uses)
    setTemporaryGameMode(mode) {
        this._setGameModeTemporary(mode);
    }

    // Restore specific game mode setters for keyboardlistener compatibility
    setGameModeVisual() {
        this._setGameModeTemporary('v');
    }

    setGameModeReplace() {
        this._setGameModeTemporary('R');
    }

    setGameModeInsert() {
        this._setGameModeTemporary('i');
    }

    setGameModeCommand() {
        this._setGameModeTemporary(':');
    }

    setGameModeNormal() {
        this.gameMode = 'n';
        // Clear any existing timeout if switching to normal mode
        if (this._resetTimeout) {
            clearTimeout(this._resetTimeout);
            this._resetTimeout = null;
        }
    }
}
