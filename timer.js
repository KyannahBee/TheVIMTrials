export class Timer {
    constructor(startingSeconds, onTimerEnd) {
        //this.startingMinutes = startingMinutes;
        //this.time = startingMinutes * 60;
        this.time = startingSeconds;
        this.onTimerEnd = onTimerEnd; // Function to call when time runs out
        this.interval = null;
    }

    updateCountdown(displayElement) {
        const minutes = Math.floor(this.time / 60);
        let seconds = this.time % 60;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

        displayElement.innerHTML = `${minutes}:${formattedSeconds}`;

        if (this.time <= 0) {
            this.pause(); // Stop the interval
            if (this.onTimerEnd) {
                this.onTimerEnd(); // Trigger game over
            }
        } else {
            this.time--;
        }
    }

    start(displayElement) {
        if (this.interval) {
            clearInterval(this.interval); // Always clear any previous interval
        }
        this.interval = setInterval(() => this.updateCountdown(displayElement), 1000);
    }

    pause() {
        clearInterval(this.interval);
        this.interval = null;
    }

    reset(displayElement) {
        this.pause();
        //this.time = this.startingMinutes * 60;
        this.time = this.startingSeconds;
        this.updateCountdown(displayElement);
    }
}
