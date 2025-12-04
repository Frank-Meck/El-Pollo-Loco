class World {
    character = new Character();
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar;
    coinStatusBar;
    bottleStatusBar;
    endbossStatusBar;
    throwableObjects = [];
    coinCounter = 0;
    bottleCounter = 0;
    maxCoins;
    maxBottles;
    countdown;
    endbossHasAppeared = false;
    endbossHitCount = 0;
    gameOver = false;
    gameWon = false;
    movingToEndboss = false;
    mobileControls;

    /**
     * Creates a new World instance and initializes canvas, level data, enemies, countdown, sounds, and controls.
     * @param {HTMLCanvasElement} canvas - The canvas element to render the game.
     * @param {Object} keyboard - The keyboard input handler.
     */
    constructor(canvas, keyboard) {
        this.level = createLevel1();
        this.initializeCanvasAndKeyboard(canvas, keyboard);
        this.initializeLevelData();
        this.spawnChickens();
        this.startCountdown();
        this.playBackgroundSounds();
        this.setupEndbossListener();

        this.mobileControls = document.querySelector('.mobile_controls');
        this.setupMobileControls();

        this.run();
        this.draw();
    }


    /**
     * Initializes canvas and keyboard references and sets the world for the character.
     * @param {HTMLCanvasElement} canvas 
     * @param {Object} keyboard 
     */
    initializeCanvasAndKeyboard(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.setWorld();
    }


    /**
     * Initializes maximum coins and bottles for the level.
     */
    initializeLevelData() {
        this.maxCoins = this.level.coins.length;
        this.maxBottles = this.level.bottles?.length ?? 0;
    }


    /**
     * Spawns chickens at fixed offsets in the level.
     */
    spawnChickens() {
        SmallChicken.spawnAtFixedOffset(this, 600);
        Chicken.spawnAtFixedOffset(this, 400);
    }


    /**
     * Starts the game countdown timer.
     */
    startCountdown() {
        this.countdown = new CountdownTimer(120);
        this.countdown.start();
    }


    /**
     * Plays background and chicken sounds.
     */
    playBackgroundSounds() {
        soundManager.play("background");
        soundManager.play("chickenNoise");
    }


    /**
     * Sets up a listener to detect when the endboss dead animation finishes.
     */
    setupEndbossListener() {
        window.addEventListener('endbossDeadAnimationFinished', () => {
            const endboss = this.getEndboss();
            if (!endboss) return;
            this.movingToEndboss = true;
            this.moveCharacterTowardsEndboss(endboss);
        });
    }


    /**
     * Assigns this world to the character instance.
     */
    setWorld() {
        this.character.world = this;
    }


    /**
     * Starts the main interval loop for the world.
     */
    run() {
        managedSetInterval(() => {
            this.checkThrowableObjects();
            this.checkEndbossHitsByBottles();
            if (this.movingToEndboss) {
                this.moveCharacterTowardsEndboss(this.getEndboss());
            }
        }, 100);
    }


    /**
     * Plays a sound by name.
     * @param {string} name 
     */
    playSound(name) {
        soundManager.play(name);
    }


    /**
     * Checks throwable objects to see if they hit the endboss.
     */
    checkEndbossHitsByBottles() {
        const endboss = this.getEndboss();
        if (!endboss || this.coinCounter !== this.maxCoins) return;

        this.throwableObjects = this.throwableObjects.filter(bottle =>
            this.isBottleHittingEndboss(bottle, endboss)
        );
    }


    /**
     * Checks if a bottle hits the endboss.
     * @param {ThrowableObject} bottle 
     * @param {Endboss} endboss 
     * @returns {boolean} True if the bottle should remain, false if it hit.
     */
    isBottleHittingEndboss(bottle, endboss) {
        if (bottle.isColliding(endboss)) {
            this.handleEndbossHit(endboss);
            return false;
        }
        return true;
    }


    /**
     * Handles an endboss hit by a bottle.
     * @param {Endboss} endboss 
     */
    handleEndbossHit(endboss) {
        this.endbossHitCount++;
        endboss.hurt();
        if (this.endbossStatusBar) this.playSound('bossHit');
        this.handleEndbossDamage(endboss);
    }


    /**
     * Applies damage logic to the endboss.
     * @param {Endboss} endboss 
     */
    handleEndbossDamage(endboss) {
        if (this.endbossHitCount % 2 === 0) {
            endboss.energy -= 20;
            if (endboss.energy < 0) endboss.energy = 0;
            if (this.endbossStatusBar) {
                this.endbossStatusBar.setPercentage(endboss.energy);
            }
        }
        if (endboss.energy <= 0 && !endboss.isDead) {
            endboss.isWalking = false;
            endboss.speed = 0;
            endboss.die();
            endboss.isDead = true;
        }
    }


    /**
     * Checks if a new bottle can be thrown and throws it if possible.
     */
    checkThrowableObjects() {
        if (this.keyboard.D && this.canThrowNewBottle()) {
            let bottle = new ThrowableObject(this.character.x + 60, this.character.y + 120);
            this.throwableObjects.push(bottle);
            this.bottleCounter--;
            this.bottleStatusBar.setPercentage(this.calculateBottlePercentage());
        }
    }


    /**
     * Determines if a new bottle can be thrown.
     * @returns {boolean}
     */
    canThrowNewBottle() {
        if (this.bottleCounter <= 0) return false;
        if (this.throwableObjects.length === 0) return true;
        const lastBottle = this.throwableObjects[this.throwableObjects.length - 1];
        return lastBottle.speedY <= 0;
    }


    /**
     * Calculates the percentage of collected coins.
     * @returns {number}
     */
    calculateCoinPercentage() {
        return Math.min((this.coinCounter / this.maxCoins) * 100, 100);
    }


    /**
     * Calculates the percentage of remaining bottles.
     * @returns {number}
     */
    calculateBottlePercentage() {
        if (this.maxBottles === 0 || this.bottleCounter === 0) return 0;
        const rawPercentage = (this.bottleCounter / this.maxBottles) * 100;
        return this.roundPercentageStep(rawPercentage, 5);
    }


    /**
     * Rounds a percentage to the nearest step.
     * @param {number} percentage 
     * @param {number} steps 
     * @returns {number}
     */
    roundPercentageStep(percentage, steps) {
        const step = 100 / steps;
        const rounded = Math.ceil(percentage / step) * step;
        return Math.max(0, Math.min(rounded, 100));
    }


    /**
     * Retrieves the endboss from the level enemies.
     * @returns {Endboss|null}
     */
    getEndboss() {
        return this.level.enemies.find(e => e instanceof Endboss);
    }


    /**
     * Checks if an object is currently visible in the viewport.
     * @param {Object} object 
     * @returns {boolean}
     */
    isInViewport(object) {
        const worldLeft = -this.camera_x;
        const worldRight = -this.camera_x + this.canvas.width;
        return object.x + object.width > worldLeft - 100 &&
               object.x < worldRight + 100;
    }


    /**
     * Sets visibility of mobile controls based on screen width and game state.
     * @param {boolean} visible 
     */
    setMobileControlsVisibility(visible) {
        if (!this.mobileControls) return;
        const isMobile = window.innerWidth <= 1024;
        const isGameRunning = !this.gameOver && !this.gameWon;
        this.mobileControls.style.display =
            (visible && isMobile && isGameRunning) ? 'flex' : 'none';
    }


    /**
     * Moves the character toward the endboss.
     * @param {Endboss} endboss 
     */
    moveCharacterTowardsEndboss(endboss) {
        if (!endboss) return;
        if (this.character.x < endboss.x - 50) this.character.x += this.character.speed;
        else this.movingToEndboss = false;
    }


    /**
     * Initializes mobile controls buttons.
     */
    setupMobileControls() {
        if (!this.mobileControls) return;

        this.bindMobileButton('btn_move_left', 'LEFT');
        this.bindMobileButton('btn_move_right', 'RIGHT');
        this.bindMobileButton('btn_jump', 'SPACE');
        this.bindMobileButton('btn_throw', 'D');
    }


    /**
     * Binds a mobile button to a keyboard key.
     * @param {string} buttonId 
     * @param {string} key 
     */
    bindMobileButton(buttonId, key) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.addEventListener('touchstart', e => {
            e.preventDefault();
            this.keyboard[key] = true;
        });

        button.addEventListener('touchend', e => {
            e.preventDefault();
            this.keyboard[key] = false;
        });
    }
}
