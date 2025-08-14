class ThrowableObject extends MoveableObject {

  /**
   * Creates a throwable object at the given position.
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   */
  constructor(x, y) {
    super().loadImage("./img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png");
    this.x = x;
    this.y = y;
    this.height = 60;
    this.width = 50;
    this.throwObject(); // For testing, throws object immediately
  }


  /**
   * Starts the throwing action by setting upward speed and gravity.
   */
  throwObject() {
    this.speedY = 30;  // Moves upwards
    this.applyGravity();  // Makes it fall down afterwards
    this.startThrowInterval();
  }


  /**
   * Moves the object to the right at a fixed interval.
   */
  startThrowInterval() {
    managedSetInterval(() => {
      this.x += 10;  // Moves right every 25 ms
    }, 25);
  }
}
