class CountdownTimer {
    totalTime;
    remainingTime;
    intervalId;

    
    /**
     * Initializes the countdown timer.
     * @param {number} durationInSeconds - Total duration in seconds.
     */
    constructor(durationInSeconds) {
        this.totalTime = durationInSeconds;
        this.remainingTime = durationInSeconds;
        this.intervalId = null;
    }


    /**
     * Starts the countdown timer.
     */
    start() {
        this.intervalId = managedSetInterval(() => {
            if (this.remainingTime > 0) {
                this.remainingTime--;
            } else {
                clearInterval(this.intervalId);
            }
        }, 1000);
    }


    /**
     * Returns the remaining time in MM:SS format.
     * @returns {string} - Formatted time.
     */
    getFormattedTime() {
        const minutes = Math.floor(this.remainingTime / 60)
            .toString()
            .padStart(2, '0');
        const seconds = (this.remainingTime % 60)
            .toString()
            .padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}