class Cloud extends MoveableObject {
    y = 20;
    height = 150;
    width = 500;


    /**
     * Creates a cloud object with its image and starting X position.
     * @param {string} imagePath - Path to the cloud image.
     * @param {number} startX - Initial X position.
     */
    constructor(imagePath, startX) {
        super().loadImage(imagePath);
        this.x = startX;
        this.speed = 0.15; // Own speed, independent of background
        this.animate();
    }


    /**
     * Animates the cloud by moving it left continuously.
     */
    animate() {
        setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
    }
}
