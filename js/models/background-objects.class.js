class BackgroundObject extends MoveableObject {
    width = 720;
    height = 480;

    /**
     * Constructor initializes background object with image and position.
     * @param {string} imagePath - Path to the background image.
     * @param {number} x - X coordinate of the background object.
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);      
        this.x = x;
        this.y = 480 - this.height;
    }
}
