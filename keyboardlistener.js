//keyboard listener executes commands from sequences.json on player, it is paused when an object is active

 export class KeyboardListener {
    constructor(player, onInvalidSequence) {
        this.player = player;
        this.onInvalidSequence = onInvalidSequence;
        this.keyBindings = new Map(); // Stores key sequences and combined keypress bindings
        this.activeKeys = new Set(); // Tracks currently pressed keys (without Shift)
        this.shiftKeyPressed = false; // Tracks if Shift key is pressed
        this.typedSequence = ""; // Stores recent typed characters
        this.sequenceTimeout = null; // Timer to reset sequence
        this.paused = false;

        document.addEventListener("keydown", (event) => this.handleKeyDown(event));
        document.addEventListener("keyup", (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        event.preventDefault();
        if (event.key === "Escape") {
            console.log('esc');
            window.location.href = "./StartPage/index.html"; 
        }

        const tag = event.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        if (this.paused) return;

        let key = event.key.toLowerCase();

        if (key === "shift" && !this.shiftKeyPressed) {
            this.shiftKeyPressed = true;
            console.log("shift pressed");
        } else if (this.shiftKeyPressed && key.length === 1) {
            const keyCombo = "shift+" + key;
            console.log("keyCombo", keyCombo);
            if (this.keyBindings.has(keyCombo)) {
                event.preventDefault();
                this.keyBindings.get(keyCombo)(); // Executes the callback for Shift+key
            }
        } else if (key.length === 1) {
            this.typedSequence += key;
            console.log("sequence: ", this.typedSequence);

            if (this.sequenceTimeout) clearTimeout(this.sequenceTimeout);
            this.sequenceTimeout = setTimeout(() => {
                this.typedSequence = "";
            }, 1000);
        }

        // First check if the whole sequence matches a key binding (e.g., "0" or "abc")
        if (this.keyBindings.has(this.typedSequence)) {
            event.preventDefault();
            this.keyBindings.get(this.typedSequence)();
            this.typedSequence = "";
            return;
        }

        // Then check for repeat patterns like 2a, 4right, but NOT 0a
        const match = this.typedSequence.match(/^(\d+)([a-zA-Z]+)$/);
        if (match) {
            const [, numStr, commandKey] = match;
            const repeat = parseInt(numStr, 10);

            // Only run if repeat > 0
            if (repeat > 0 && this.keyBindings.has(commandKey)) {
                event.preventDefault();
                for (let i = 0; i < repeat; i++) {
                    this.keyBindings.get(commandKey)();
                    console.log("commandKey:", commandKey);
                }
                this.typedSequence = "";
            } else {
                console.log("Invalid repeat count or unknown command.");
            }
        }
    }

    handleKeyUp(event) {
        const tag = event.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        if (this.paused) return;

        const key = event.key.toLowerCase();

        if (key === "shift") {
            this.shiftKeyPressed = false;
            console.log("shift back to false");
        }

        if (this.shiftKeyPressed && key.length === 1) {
            this.activeKeys.delete("shift+" + key);
        } else {
            this.activeKeys.delete(key);
        }
    }

    bindKey(keys, callback) {
        const keyCombo = keys.toLowerCase().split("+").sort().join("+");
        this.keyBindings.set(keyCombo, callback);
    }

    bindSequence(sequence, callback) {
        this.keyBindings.set(sequence.toLowerCase(), callback);
    }

    loadBindingsFromFile(data) {
        try {
            const bindings = JSON.parse(data);
            for (const [sequence, message] of Object.entries(bindings)) {
                this.bindSequence(sequence, () => this.executeCommand(message));
            }
        } catch (error) {
            console.error("Failed to load key bindings:", error);
        }
    }

    executeCommand(command) {
        if (this.paused) return;
        if (typeof this.player[command] === "function") {
            this.player[command](); // Calls the method dynamically
            console.log(this.player.getPosition());
        } else {
            console.warn(`Command "${command}" is not a valid function on Player.`);
            if (this.onInvalidSequence){
                this.onInvalidSequence(this.typedSequence);
            }
        }
    }
}

