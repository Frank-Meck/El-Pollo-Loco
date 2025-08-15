class Endboss extends MoveableObject {
    IMAGES_WALKING = [
        './img/4_enemie_boss_chicken/2_alert/G5.png',
        './img/4_enemie_boss_chicken/2_alert/G6.png',
        './img/4_enemie_boss_chicken/2_alert/G7.png',
        './img/4_enemie_boss_chicken/2_alert/G8.png',
        './img/4_enemie_boss_chicken/2_alert/G9.png',
        './img/4_enemie_boss_chicken/2_alert/G10.png',
        './img/4_enemie_boss_chicken/2_alert/G11.png',
        './img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_HURT = [
        './img/4_enemie_boss_chicken/4_hurt/G21.png',
        './img/4_enemie_boss_chicken/4_hurt/G22.png',
        './img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        './img/4_enemie_boss_chicken/5_dead/G24.png',
        './img/4_enemie_boss_chicken/5_dead/G25.png',
        './img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    IMAGES_ATTACK = [
        './img/4_enemie_boss_chicken/3_attack/G13.png',
        './img/4_enemie_boss_chicken/3_attack/G14.png',
        './img/4_enemie_boss_chicken/3_attack/G15.png',
        './img/4_enemie_boss_chicken/3_attack/G16.png',
        './img/4_enemie_boss_chicken/3_attack/G17.png',
        './img/4_enemie_boss_chicken/3_attack/G18.png',
        './img/4_enemie_boss_chicken/3_attack/G19.png',
        './img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    currentAnimation = 'WALKING';
    currentImage = 0;
    isDead = false;
    isCharging = false;
    energy = 100;
    x = 4300;
    y = 150;
    height = 300;
    width = 300;
    speed = 0;
    offset = { top: 50, left: 10, right: 190, bottom: 130 };
    deadAnimationFinished = false;


    /**
     * Initializes the endboss with the world and loads all images.
     * @param {Object} world - The game world reference.
     */
    constructor(world) {
        super();
        this.world = world;
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages([
            ...this.IMAGES_WALKING,
            ...this.IMAGES_HURT,
            ...this.IMAGES_DEAD,
            ...this.IMAGES_ATTACK
        ]).then(() => {
            this.animate();
        });
    }


    /**
     * Animates the endboss continuously.
     */
    animate() {
        setInterval(() => {
            this.playAnimation();
        }, 150);
    }


    /**
     * Plays the current animation based on state.
     */
    playAnimation() {
        if (this.isDead && this.currentAnimation !== 'DEAD') return;

        let imagesArray = this.getCurrentImagesArray();
        if (this.currentImage >= imagesArray.length) {
            if (this.currentAnimation === 'DEAD') {
                this.handleDeadAnimationEnd(imagesArray);
                return;
            }
            this.currentImage = 0;
        }
        this.img = this.imageCache[imagesArray[this.currentImage]];
        this.currentImage++;
    }


    /**
     * Returns the current animation image array.
     * @returns {string[]}
     */
    getCurrentImagesArray() {
        switch (this.currentAnimation) {
            case 'WALKING': return this.IMAGES_WALKING;
            case 'HURT': return this.IMAGES_HURT;
            case 'ATTACK': return this.IMAGES_ATTACK;
            case 'DEAD': return this.IMAGES_DEAD;
            default: return this.IMAGES_WALKING;
        }
    }


    /**
     * Handles the end of the dead animation.
     * @param {string[]} imagesArray 
     */
    handleDeadAnimationEnd(imagesArray) {
        this.currentImage = imagesArray.length - 1;
        this.img = this.imageCache[imagesArray[this.currentImage]];
        if (!this.deadAnimationFinished) {
            this.deadAnimationFinished = true;
            this.onDeathAnimationFinished();
        }
    }


    /**
     * Dispatches an event when dead animation finishes.
     */
    onDeathAnimationFinished() {
        window.dispatchEvent(new Event('endbossDeadAnimationFinished'));
    }


    /**
     * Puts the boss in hurt state.
     */
    hurt() {
        if (this.isDead || this.currentAnimation === 'HURT') return;
        this.isHurt = true;
        this.currentAnimation = 'HURT';
        this.currentImage = 0;
    }


    /**
     * Kills the boss and resets properties.
     */
    die() {
        this.isDead = true;
        this.currentAnimation = 'DEAD';
        this.currentImage = 0;
        this.speed = 0;
        if (this.chargeInterval) clearInterval(this.chargeInterval);
        if (this.reverseInterval) clearInterval(this.reverseInterval);
        this.isCharging = false;
        this.deadAnimationFinished = false;
    }


    /**
     * Starts the charging attack after a random delay.
     * @param {number} targetX - The target x coordinate.
     */
    startCharge(targetX) {
        if (this.isCharging || this.isDead) return;
        this.isCharging = true;
        const delay = Math.random() * 3000;
        setTimeout(() => {
            this.chargeAttack(targetX);
        }, delay);
    }


    /**
     * Executes the charge attack animation.
     * @param {number} targetX 
     */
    chargeAttack(targetX) {
        if (this.isDead) return;
        this.currentAnimation = 'ATTACK';
        this.currentImage = 0;
        const chargeSpeed = 6;
        const retreatSpeed = 8;
        const originalX = this.x;
        const destinationX = 3900;
        const direction = (this.x > destinationX) ? -1 : 1;
        this.moveForwardDuringCharge(chargeSpeed, direction, destinationX, originalX, retreatSpeed);
    }


    /**
     * Moves the boss forward during charge.
     */
    moveForwardDuringCharge(chargeSpeed, direction, destinationX, originalX, retreatSpeed) {
        const forward = managedSetInterval(() => {
            this.x += chargeSpeed * direction;
            if ((direction === -1 && this.x <= destinationX) ||
                (direction === 1 && this.x >= destinationX)) {
                clearInterval(forward);
                this.reverseChargeAttack(originalX, retreatSpeed);
            }
        }, 1000 / 60);
    }


    /**
     * Prepares reverse charge attack.
     */
    reverseChargeAttack(destinationX, speed) {
        this.currentAnimation = 'ATTACK';
        this.currentImage = this.IMAGES_ATTACK.length - 1;
        this.moveBackwardDuringCharge(destinationX, speed);
    }


    /**
     * Moves the boss backward after charge.
     */
    moveBackwardDuringCharge(destinationX, speed) {
        const backward = managedSetInterval(() => {
            const dir = (this.x < destinationX) ? +1 : -1;
            this.x += speed * dir;
            this.currentImage--;
            if (this.currentImage < 0) {
                this.currentImage = this.IMAGES_ATTACK.length - 1;
            }
            if ((dir > 0 && this.x >= destinationX) ||
                (dir < 0 && this.x <= destinationX)) {
                clearInterval(backward);
                this.currentAnimation = 'WALKING';
                this.currentImage = 0;
                this.isCharging = false;
            }
        }, 1000 / 60);
    }
}
