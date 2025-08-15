class MoveableObject extends DrawableObject {

    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    coinCounter = 0;
    isDead = false;

    offset = { top: 0, left: 0, right: 0, bottom: 0 };


    /**
     * Applies gravity to the object by adjusting vertical speed and position.
     */
    applyGravity() {
        managedSetInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }


    /**
     * Moves the object to the right based on its speed.
     */
    moveRight() {
        this.x += this.speed;
    }


    /**
     * Moves the object to the left based on its speed.
     */
    moveLeft() {
        this.x -= this.speed;
    }


    /**
     * Makes the object jump by setting its vertical speed upwards.
     */
    jump() {
        this.speedY = 30;
    }


    /**
     * Checks if the object is above the ground level.
     * @returns {boolean} True if above ground, else false.
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < 140;
        }
    }


    /**
     * Checks if this object is colliding with another moveable object.
     * @param {MoveableObject} mo - The other moveable object.
     * @returns {boolean} True if colliding, else false.
     */
    isColliding(mo) {
        return this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
            this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
            this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
            this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom;
    }


    /**
     * Handles getting hit: reduces energy and handles death if energy is depleted.
     */
    hit() {
        this.energy -= 5;
        if (this.isEnergyDepleted()) {
            this.energy = 0;
            this.handleDeath();
        } else {
            this.lastHit = new Date().getTime();
        }
    }


    /**
     * Checks if the object's energy is depleted.
     * @returns {boolean} True if energy is 0 or less.
     */
    isEnergyDepleted() {
        return this.energy <= 0;
    }


    /**
     * Handles the death logic of the object.
     */
    handleDeath() {
        if (!this.isDead) {
            if (this instanceof Character) {
                this.startDeadSequence();
            }
        }
    }


    /**
     * Checks if the object was hurt recently (within 1 second).
     * @returns {boolean} True if hurt recently.
     */
    isHurt() {
        let timePassed = (new Date().getTime() - this.lastHit) / 1000;
        return timePassed < 1;
    }


    /**
     * Checks if the object is dead.
     * @returns {boolean} True if energy is exactly 0.
     */
    isDead() {
        return this.energy === 0;
    }

    
    /**
     * Plays an animation by cycling through given image paths.
     * @param {string[]} images - Array of image paths.
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }
}
