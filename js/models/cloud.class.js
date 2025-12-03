class Cloud extends MoveableObject {
    y = 20;
    height = 150;
    width = 500;
    speed = 0.15;

    /**
     * Constructor for Cloud
     * @param {string} imagePath Path to cloud image
     * @param {number} startX Starting X position
     */
    constructor(imagePath = './img/5_background/layers/4_clouds/1.png', startX = 720) {
        super().loadImage(imagePath);
        this.x = startX;
        this.startMovingLeft();
    }

    /**
     * Starts the animation loop for moving left
     */
    startMovingLeft() {
        setInterval(() => this.moveLeft(), 1000 / 60);
    }

    /**
     * Moves the cloud to the left by its speed
     */
    moveLeft() {
        this.x -= this.speed;
    }
}
