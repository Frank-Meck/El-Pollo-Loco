class StatusBar extends DrawableObject {
  
  percentage = 100;
  IMAGES = [];

  /**
   * Creates a status bar at position (x, y).
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   */
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.width = 150;
    this.height = 40;
  }

  /**
   * Loads images and sets initial percentage.
   * @param {string[]} images - Array of image paths.
   * @param {number} [percentage=100] - Initial percentage.
   */
  async loadAndInit(images, percentage = 100) {
    this.IMAGES = images;
    await this.loadImages(this.IMAGES);
    this.setPercentage(percentage);
  }

  /**
   * Sets the percentage and updates the image.
   * @param {number} percentage - New percentage value.
   */
  setPercentage(percentage) {
    this.percentage = percentage;
    let index = this.resolveImageIndex();
    let path = this.IMAGES[index];
    this.setImageFromCacheOrWarn(path);
  }

  /**
   * Sets image from cache or warns if missing.
   * @param {string} path - Image path.
   */
  setImageFromCacheOrWarn(path) {
    if (this.imageCache[path]) {
      this.img = this.imageCache[path];
    } else {
      console.warn("Image not loaded:", path);
      this.img = new Image(); // Prevents crash
    }
  }

  /**
   * Determines image index based on percentage.
   * @returns {number} Image index.
   */
  resolveImageIndex() {
    if (this.percentage >= 100) return 5;
    if (this.percentage >= 80) return 4;
    if (this.percentage >= 60) return 3;
    if (this.percentage >= 40) return 2;
    if (this.percentage >= 20) return 1;
    return 0;
  }
}
