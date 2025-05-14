import {Entity} from "./Entity.js";

export class Obstacle extends Entity{
    command;
    description;
    commandParts = []; // Array to hold individual characters/special keys
    currentIndex = 0; // Current index of the command part to be typed
    commandDisplayContainer; // HTML element to display command spans

    constructor(maze, start, questionData) { 
        super(maze, start, "./images/obstacle.png");
        this.command = questionData.command;
        this.description = questionData.description;
        this._parseCommand();
    }

    _parseCommand() {
        // Simple parsing for <CR> for now. Can be extended.
        this.commandParts = this.command.replace(/<CR>/g, "\n").split(''); 
        // Replace \n with a visual symbol or handle differently if needed in display
    }

    _createCommandDisplay() {
        this.commandDisplayContainer = document.createElement('div');
        this.commandDisplayContainer.id = 'vimCommandDisplay';
        this.commandParts.forEach((part, index) => {
            const span = document.createElement('span');
            span.textContent = part === '\n' ? '↵' : part; // Display newline as arrow
            span.id = `cmd-part-${index}`;
            this.commandDisplayContainer.appendChild(span);
        });
        return this.commandDisplayContainer;
    }

    _updateCommandDisplay() {
        this.commandParts.forEach((part, index) => {
            const span = document.getElementById(`cmd-part-${index}`);
            if (span) {
                span.classList.remove('typed', 'current');
                if (index < this.currentIndex) {
                    span.classList.add('typed');
                } else if (index === this.currentIndex) {
                    span.classList.add('current');
                }
            }
        });
    }

    activate(player) {
        this.playerTryingToPass = player;
        this.currentIndex = 0; // Reset progress

        return new Promise((resolve) => {
            const obstacleInputOriginal = document.getElementById("obstacleInput");
            const obstacleQuestionP = document.getElementById("obstacleQuestion");
            const obstacleContainer = document.getElementById("Obstacle-Container");
            const wrongContainer = document.getElementById("Wrong-Answer-Container");

            if (obstacleInputOriginal) obstacleInputOriginal.style.display = 'none'; // Hide original input

            // Clear previous command display if any
            if (this.commandDisplayContainer && this.commandDisplayContainer.parentNode) {
                this.commandDisplayContainer.parentNode.removeChild(this.commandDisplayContainer);
            }
            
            obstacleQuestionP.textContent = `In VIM, om ${this.description}, typ:`; // Clear and set text
            const newCommandDisplay = this._createCommandDisplay();
            obstacleQuestionP.parentNode.insertBefore(newCommandDisplay, obstacleQuestionP.nextSibling); // Insert after the P
            this._updateCommandDisplay();

            obstacleContainer.style.display = "block";
            // No need to focus an input field anymore

            const handleDocumentKeyDown = (event) => {
                // Only prevent default for our specific keys to avoid blocking other functionality
                let expectedKey = this.commandParts[this.currentIndex];
                let typedKey = event.key;

                if (typedKey === 'Shift') {
                    return;
                }
                
                let correctKey = false;

                if (expectedKey === '\n' && typedKey === 'Enter') {
                    correctKey = true;
                    event.preventDefault(); // Prevent Enter from submitting forms etc.
                } else if (expectedKey !== '\n' && typedKey === expectedKey) {
                    correctKey = true;
                    // Only prevent default if it's a character that would affect the page
                    if (expectedKey.length === 1 || expectedKey === 'Backspace' || 
                        expectedKey === 'Tab' || expectedKey === 'Escape') {
                        event.preventDefault();
                    }
                }
                
                if (!correctKey) {
                    // Incorrect key, show wrong feedback
                    obstacleContainer.style.display = "none";
                    wrongContainer.style.display = "block";
                    setTimeout(() => {
                        wrongContainer.style.display = "none";
                        obstacleContainer.style.display = "block";
                    }, 1500); // Shorter delay for wrong key
                    return; // Stop processing this keydown
                }
                
                // If we reach here, the key was correct
                this.currentIndex++;
                this._updateCommandDisplay();

                if (this.currentIndex >= this.commandParts.length) {
                    // Successfully completed
                    document.removeEventListener("keydown", handleDocumentKeyDown, true);
                    if (this.commandDisplayContainer && this.commandDisplayContainer.parentNode) {
                        this.commandDisplayContainer.parentNode.removeChild(this.commandDisplayContainer);
                    }
                    if(obstacleInputOriginal) obstacleInputOriginal.style.display = ''; // Show original input if needed later
                    
                    // Direct keyboard state reset if we can access it
                    if (this.maze && this.maze.game && this.maze.game.keyboard) {
                        const keyboard = this.maze.game.keyboard;
                        // Reset all keyboard states
                        keyboard.shiftKeyPressed = false;
                        keyboard.activeKeys = new Set(); // Clear all active keys
                        keyboard.typedSequence = ""; // Reset any in-progress sequence
                    }
                    
                    // Create keyup events for common modifier keys that might be 'stuck'
                    const keysToReset = ['Shift', 'Control', 'Alt', 'Meta', 'Escape'];
                    keysToReset.forEach(keyName => {
                        const resetEvent = new KeyboardEvent('keyup', {
                            bubbles: true,
                            cancelable: true,
                            key: keyName,
                            code: keyName,
                            keyCode: keyName === 'Shift' ? 16 : 27, // Appropriate keyCode
                            which: keyName === 'Shift' ? 16 : 27,
                            view: window
                        });
                        
                        // Set target
                        Object.defineProperty(resetEvent, 'target', {
                            value: document.body,
                            enumerable: true
                        });
                        
                        document.dispatchEvent(resetEvent);
                    });
                    
                    // Try to set focus back to document/body
                    document.body.focus();
                    window.focus();
                    
                    this.pass();
                    resolve(true); 
                }
            };
            
            // Use capture phase to potentially override other listeners
            document.addEventListener("keydown", handleDocumentKeyDown, true);
        });
    }

    pass() {
        const index = this.maze.game.obstacles.indexOf(this);
        if (index > -1) {
            this.maze.game.obstacles.splice(index, 1);
        }
        
        // Hide container
        document.getElementById("Obstacle-Container").style.display = "none";
        
        // Try to force a complete keyboard reset with a slight delay
        setTimeout(() => {
            // Direct manipulation of keyboard state for maximum reliability
            if (this.maze && this.maze.game && this.maze.game.keyboard) {
                const keyboard = this.maze.game.keyboard;
                // Reset ALL keyboard states explicitly
                keyboard.shiftKeyPressed = false;
                keyboard.activeKeys = new Set(); // Clear all active keys
                keyboard.typedSequence = ""; // Reset any in-progress sequence
                keyboard.paused = false; // Ensure the keyboard is unpaused
                
                console.log("Keyboard state fully reset"); // Debug message
            }
            
            // Dispatch keyup events for all common modifier keys
            const keysToReset = ['Shift', 'Control', 'Alt', 'Meta', 'Escape', 'CapsLock'];
            keysToReset.forEach(keyName => {
                const resetEvent = new KeyboardEvent('keyup', {
                    bubbles: true,
                    cancelable: true,
                    key: keyName,
                    code: keyName,
                    keyCode: keyName === 'Shift' ? 16 : (keyName === 'Control' ? 17 : 27),
                    which: keyName === 'Shift' ? 16 : (keyName === 'Control' ? 17 : 27),
                    view: window
                });
                
                // Set target
                Object.defineProperty(resetEvent, 'target', {
                    value: document.body,
                    enumerable: true
                });
                
                document.dispatchEvent(resetEvent);
            });
            
            // Focus and other standard attempts
            document.body.focus();
            window.focus();
        }, 50);
    }
}
