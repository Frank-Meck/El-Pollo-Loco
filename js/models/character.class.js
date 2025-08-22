class Character extends MoveableObject {
    height = 300;
    y = 40;
    lastY = 0;
    speed = 8;

    deadAnimationIndex = 0;
    deadAnimationIntervalId = null;
    deadFlyIntervalId = null;
    gravityInterval = null;
    isDead = false;

    idleTimer = null;
    sleeping = false;
    idleDelay = 3000; 
    
    IMAGES_WALKING = [
        './img/2_character_pepe/2_walk/W-21.png',
        './img/2_character_pepe/2_walk/W-22.png',
        './img/2_character_pepe/2_walk/W-23.png',
        './img/2_character_pepe/2_walk/W-24.png',
        './img/2_character_pepe/2_walk/W-25.png',
        './img/2_character_pepe/2_walk/W-26.png'
    ];

    IMAGES_JUMPING = [
        './img/2_character_pepe/3_jump/J-31.png',
        './img/2_character_pepe/3_jump/J-32.png',
        './img/2_character_pepe/3_jump/J-33.png',
        './img/2_character_pepe/3_jump/J-34.png',
        './img/2_character_pepe/3_jump/J-35.png',
        './img/2_character_pepe/3_jump/J-36.png',
        './img/2_character_pepe/3_jump/J-37.png',
        './img/2_character_pepe/3_jump/J-38.png',
        './img/2_character_pepe/3_jump/J-39.png'
    ];

    IMAGES_HURT = [
        './img/2_character_pepe/4_hurt/H-41.png',
        './img/2_character_pepe/4_hurt/H-42.png',
        './img/2_character_pepe/4_hurt/H-43.png'
    ];

    IMAGES_DEAD = [
        './img/2_character_pepe/5_dead_2/D-E1.png',
        './img/2_character_pepe/5_dead_2/D-E2.png',
        './img/2_character_pepe/5_dead_2/D-E3.png',
        './img/2_character_pepe/5_dead_2/D-E5.png',
        './img/2_character_pepe/5_dead_2/D-E7.png'
    ];

    IMAGES_CHILL = [
        './img/2_character_pepe/1_idle/idle/I-1.png',
        './img/2_character_pepe/1_idle/idle/I-2.png',
        './img/2_character_pepe/1_idle/idle/I-3.png',
        './img/2_character_pepe/1_idle/idle/I-4.png',
        './img/2_character_pepe/1_idle/idle/I-5.png',
        './img/2_character_pepe/1_idle/idle/I-6.png',
        './img/2_character_pepe/1_idle/idle/I-7.png',
        './img/2_character_pepe/1_idle/idle/I-8.png',
        './img/2_character_pepe/1_idle/idle/I-9.png',
        './img/2_character_pepe/1_idle/idle/I-10.png',
    ];

    IMAGES_SLEEP = [
        './img/2_character_pepe/1_idle/long_idle/I-11.png',
        './img/2_character_pepe/1_idle/long_idle/I-12.png',
        './img/2_character_pepe/1_idle/long_idle/I-13.png',
        './img/2_character_pepe/1_idle/long_idle/I-14.png',
        './img/2_character_pepe/1_idle/long_idle/I-15.png',
        './img/2_character_pepe/1_idle/long_idle/I-16.png',
        './img/2_character_pepe/1_idle/long_idle/I-17.png',
        './img/2_character_pepe/1_idle/long_idle/I-18.png',
        './img/2_character_pepe/1_idle/long_idle/I-19.png',
        './img/2_character_pepe/1_idle/long_idle/I-20.png',
    ];

    IMAGES_DEAD_RESURRECTION = [
        './img/2_character_pepe/6_dead_end_fly/DEAD_fly_1.png',
        './img/2_character_pepe/6_dead_end_fly/DEAD_fly_2.png',
        './img/2_character_pepe/6_dead_end_fly/DEAD_fly_3.png',
        './img/2_character_pepe/6_dead_end_fly/DEAD_fly_4.png'
    ];

    IMAGES_DEAD_FLY_TO_SKY = [
        './img/2_character_pepe/6_dead_end_fly/fly_1.png',
        './img/2_character_pepe/6_dead_end_fly/fly_2.png',
        './img/2_character_pepe/6_dead_end_fly/fly_3.png',
        './img/2_character_pepe/6_dead_end_fly/fly_4.png'
    ];

    world;
    offset = { top: 140, left: 30, right: 20, bottom: 15 };
    energy = 100;
    speedY = 0;
    acceleration = 2;
    isHurtFlag = false;
    otherDirection = false;

    /**
     * Constructor initializes character images, gravity, and animations.
     */
    constructor() {
        super().loadImage("./img/2_character_pepe/2_walk/W-21.png");

        Promise.all([
            this.loadImages(this.IMAGES_WALKING),
            this.loadImages(this.IMAGES_JUMPING),
            this.loadImages(this.IMAGES_DEAD),
            this.loadImages(this.IMAGES_HURT),
            this.loadImages(this.IMAGES_CHILL),
            this.loadImages(this.IMAGES_SLEEP),
            this.loadImages(this.IMAGES_DEAD_RESURRECTION),
            this.loadImages(this.IMAGES_DEAD_FLY_TO_SKY)
        ]).then(() => {
            this.applyGravity();
            this.animate();
            this.playAnimation(this.IMAGES_CHILL);
            this.resetIdleTimer(); // Start idle timer
            this.listenForKeys();  // Listen for input
        });
    }

    /**
     * Reset the idle timer, cancel sleep, and restart countdown.
     */
    resetIdleTimer() {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.sleeping = false;
        this.idleTimer = setTimeout(() => {
            this.sleeping = true;
        }, this.idleDelay);
    }

    /**
     * Listen for key events and reset idle timer when pressed.
     */
    listenForKeys() {
        window.addEventListener('keydown', () => {
            this.resetIdleTimer();
        });
    }

    /**
     * Apply gravity to the character over time.
     */
    applyGravity() {
        if (this.gravityInterval) clearInterval(this.gravityInterval);

        this.gravityInterval = setInterval(() => {
            this.lastY = this.y;
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    /**
     * Play a sequence of images as an animation.
     * @param {string[]} imageArray - Array of image paths.
     * @param {Function} callback - Function to call after animation.
     */
    playAnimationSequence(imageArray, callback) {
        let index = 0;
        if (this.deadAnimationIntervalId) clearInterval(this.deadAnimationIntervalId);

        this.deadAnimationIntervalId = setInterval(() => {
            if (index < imageArray.length) {
                this.img = this.imageCache[imageArray[index]];
                index++;
            } else {
                clearInterval(this.deadAnimationIntervalId);
                if (callback) callback();
            }
        }, 150);
    }

    /**
     * Make the character fly upwards after death.
     * @param {Function} callback - Function to call when animation ends.
     */
    flyToSky(callback) {
        if (this.deadFlyIntervalId) clearInterval(this.deadFlyIntervalId);
        this.deadAnimationIndex = 0;

        this.deadFlyIntervalId = setInterval(() => {
            if (this.deadAnimationIndex < this.IMAGES_DEAD_FLY_TO_SKY.length) {
                this.img = this.imageCache[this.IMAGES_DEAD_FLY_TO_SKY[this.deadAnimationIndex]];
                this.deadAnimationIndex++;
            }
            this.y -= 35;

            if (this.y + this.height <= 0) {
                clearInterval(this.deadFlyIntervalId);
                if (callback) callback();
            }
        }, 100);
    }

    /**
     * Reduce character's energy by a specified amount.
     * @param {number} amount - Damage to apply.
     */
    takeDamage(amount) {
        if (this.isDead) return;
        this.energy -= amount;
        if (this.energy <= 0) {
            this.startDeadSequence();
        } else {
            this.isHurtFlag = true;
        }
    }

    /**
     * Start the death sequence for the character.
     */
    startDeadSequence() {
        if (this.isDead) return;
        this.isDead = true;
        this.speed = 0;
        this.isHurtFlag = false;
        if (this.gravityInterval) clearInterval(this.gravityInterval);
        this.playDeadAnimation();
    }

    /**
     * Play dead animation then resurrection animation.
     */
    playDeadAnimation() {
        this.playAnimationSequence(this.IMAGES_DEAD, () => {
            setTimeout(() => this.playResurrectionAnimation(), 1000);
        });
    }

    /**
     * Play resurrection animation and fly character to the sky.
     */
    playResurrectionAnimation() {
        this.playAnimationSequence(this.IMAGES_DEAD_RESURRECTION, () => {
            this.flyToSky(() => {
                if (this.world && typeof this.world.endGame === 'function') {
                    this.world.endGame(false);
                }
            });
        });
    }

    /**
     * Animate movement and actions continuously.
     */
    animate() {
        this.handleMovement();
        this.handleAnimation();
    }

    /**
     * Handle movement based on keyboard input.
     */
    handleMovement() {
        managedSetInterval(() => {
            if (!this.isDead) {
                this.handleRight();
                this.handleLeft();
                this.handleJump();
                this.world.camera_x = 0 - this.x + 100;
            }
        }, 1000 / 60);
    }

    /**
     * Handle right movement input.
     */
    handleRight() {
        if (this.world.keyboard.RIGHT) {
            this.moveRight();
            this.otherDirection = false;
        }
    }

    /**
     * Handle left movement input.
     */
    handleLeft() {
        if (this.world.keyboard.LEFT) {
            this.moveLeft();
            this.otherDirection = true;
            if (this.x < 0) this.x = 0;
        }
    }

    /**
     * Handle jump input.
     */
    handleJump() {
        if (this.world.keyboard.SPACE && !this.isAboveGround()) {
            this.jump();
        }
    }

    /**
     * Handle animation based on state.
     */
    handleAnimation() {
        managedSetInterval(() => {
            if (this.isDead) return;
            if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
            } else if (this.isAboveGround()) {
                this.playAnimation(this.IMAGES_JUMPING);
            } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.sleeping) {
                this.playAnimation(this.IMAGES_SLEEP);
            } else {
                this.playAnimation(this.IMAGES_CHILL);
            }
        }, 100);
    }

    /**
     * Make the character jump.
     */
    jump() {
        this.speedY = 30;
    }

    /**
     * Check if character is currently hurt.
     * @returns {boolean} True if hurt, otherwise false.
     */
    isHurt() {
        return this.isHurtFlag;
    }
}