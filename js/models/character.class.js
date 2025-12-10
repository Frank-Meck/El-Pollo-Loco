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
        './img/2_character_pepe/1_idle/idle/I-10.png'
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
        './img/2_character_pepe/1_idle/long_idle/I-20.png'
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
     * Constructor: sets world and preloads images
     * @param {object} world
     */
    constructor(world) {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.world = world;
        this.preloadAllImages().then(() => {
            this.applyGravity();
            this.animate();
            this.playAnimation(this.IMAGES_CHILL);
            this.resetIdleTimer();
            this.listenForKeys();
        });
    }


    /**
     * Preloads all images for the character
     */
    async preloadAllImages() {
        await Promise.all([
            this.loadImages(this.IMAGES_WALKING),
            this.loadImages(this.IMAGES_JUMPING),
            this.loadImages(this.IMAGES_DEAD),
            this.loadImages(this.IMAGES_HURT),
            this.loadImages(this.IMAGES_CHILL),
            this.loadImages(this.IMAGES_SLEEP),
            this.loadImages(this.IMAGES_DEAD_RESURRECTION),
            this.loadImages(this.IMAGES_DEAD_FLY_TO_SKY)
        ]);
    }


    /**
     * Resets the idle timer for sleeping detection
     */
    resetIdleTimer() {
        if (this.idleTimer) clearTimeout(this.idleTimer);
        this.sleeping = false;
        this.idleTimer = setTimeout(() => this.sleeping = true, this.idleDelay);
    }


    /**
     * Listen for keys/mouse/touch to reset idle timer
     */
    listenForKeys() {
        const reset = () => this.resetIdleTimer();
        window.addEventListener('keydown', reset);
        window.addEventListener('mousedown', reset);
        window.addEventListener('touchstart', reset);
    }


    /**
     * Apply gravity using interval
     */
    applyGravity() {
        if (this.gravityInterval) clearInterval(this.gravityInterval);
        this.gravityInterval = setInterval(() => this.updateGravity(), 1000 / 25);
    }


    /**
     * Update position due to gravity
     */
    updateGravity() {
        this.lastY = this.y;

        this.y -= this.speedY;
        this.speedY -= this.acceleration;

        const groundY = 140;
        if (this.y > groundY) {
            this.y = groundY;
            this.speedY = 0;
        }
    }


    /**
     * Plays a sequence of images with optional callback
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
     * Fly character into the sky after death
     */
    flyToSky(callback) {
        if (this.deadFlyIntervalId) clearInterval(this.deadFlyIntervalId);
        this.deadAnimationIndex = 0;
        this.deadFlyIntervalId = setInterval(() => this.updateFly(callback), 100);
    }


    /**
     * Updates fly-to-sky animation
     */
    updateFly(callback) {
        if (this.deadAnimationIndex < this.IMAGES_DEAD_FLY_TO_SKY.length) {
            this.img = this.imageCache[this.IMAGES_DEAD_FLY_TO_SKY[this.deadAnimationIndex]];
            this.deadAnimationIndex++;
        }
        this.y -= 35;
        if (this.y + this.height <= 0) {
            clearInterval(this.deadFlyIntervalId);
            if (callback) callback();
        }
    }


    /**
     * Takes damage and triggers dead sequence if necessary
     */
    takeDamage(amount) {
        if (this.isDead) return;
        this.energy -= amount;
        if (this.energy <= 0) this.startDeadSequence();
        else this.isHurtFlag = true;
    }


    /**
     * Starts the death sequence
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
     * Play dead animation sequence
     */
    playDeadAnimation() {
        this.playAnimationSequence(this.IMAGES_DEAD, () => {
            setTimeout(() => this.playResurrectionAnimation(), 1000);
        });
    }


    /**
     * Play resurrection animation sequence
     */
    playResurrectionAnimation() {
        this.playAnimationSequence(this.IMAGES_DEAD_RESURRECTION, () => {
            this.flyToSky(() => {
                if (this.world?.endGame) this.world.endGame(false);
            });
        });
    }


    /**
     * Animate character continuously
     */
    animate() {
        this.handleMovement();
        this.handleAnimation();
    }


    /**
     * Handle movement logic
     */
    handleMovement() {
        managedSetInterval(() => {
            if (!this.isDead) {
                this.handleRight();
                this.handleLeft();
                this.handleJump();
                if (this.world) this.world.camera_x = 0 - this.x + 100;
            }
        }, 1000 / 60);
    }


    /**
     * Handle right movement
     */
    handleRight() {
        if (this.world?.keyboard?.RIGHT) {
            const levelEnd = this.world.level.level_end_x;
            if (this.x + this.width < levelEnd) this.moveRight(), this.otherDirection = false;
            else this.x = levelEnd - this.width;
        }
    }


    /**
     * Handle left movement
     */
    handleLeft() {
        if (this.world?.keyboard?.LEFT) {
            this.moveLeft();
            this.otherDirection = true;
            if (this.x < 0) this.x = 0;
        }
    }


    /**
     * Handle jump movement
     */
    handleJump() {
        if (this.world?.keyboard?.SPACE && !this.isAboveGround()) this.jump();
    }


    /**
     * Handle animation logic
     */
    handleAnimation() {
        managedSetInterval(() => {
            if (this.isDead) return;
            if (this.isHurt()) this.playAnimation(this.IMAGES_HURT);
            else if (this.isAboveGround()) this.playAnimation(this.IMAGES_JUMPING);
            else if (this.world?.keyboard?.RIGHT || this.world?.keyboard?.LEFT) this.playAnimation(this.IMAGES_WALKING);
            else if (this.sleeping) this.playAnimation(this.IMAGES_SLEEP);
            else this.playAnimation(this.IMAGES_CHILL);
        }, 100);
    }


    /**
     * Jump action
     */
    jump() {
        this.speedY = 30;
    }


    /**
     * Returns true if character is hurt
     */
    isHurt() {
        return this.isHurtFlag;
    }
}
