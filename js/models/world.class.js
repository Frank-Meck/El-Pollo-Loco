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
    this.run();
    this.draw();
  }


  /**
   * Sets up the canvas, rendering context, keyboard, and links the character to the world.
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
   * Initializes level-related data such as maximum coins and bottles.
   */
  initializeLevelData() {
    this.maxCoins = this.level.coins.length;
    this.maxBottles = this.level.bottles?.length ?? 0;
  }


  /**
   * Spawns initial chickens in the world at fixed offsets.
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
   * Plays the background and chicken noise sounds.
   */
  playBackgroundSounds() {
    soundManager.play("background");
    soundManager.play("chickenNoise");
  }


  /**
   * Sets up a listener for the endboss death animation to trigger character movement.
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
   * Assigns this world instance to the character.
   */
  setWorld() {
    this.character.world = this;
  }


  /**
   * Starts the game loop to periodically check for throwable objects and endboss hits.
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
   * Plays a specific sound by name.
   * @param {string} name - The sound identifier.
   */
  playSound(name) {
    soundManager.play(name);
  }


  /**
   * Checks if bottles hit the endboss and filters them from throwable objects.
   */
  checkEndbossHitsByBottles() {
    const endboss = this.getEndboss();
    if (!endboss || this.coinCounter !== this.maxCoins) return;

    this.throwableObjects = this.throwableObjects.filter(bottle =>
      this.isBottleHittingEndboss(bottle, endboss)
    );
  }


  /**
   * Determines whether a bottle hits the endboss and applies damage if so.
   * @param {ThrowableObject} bottle 
   * @param {Endboss} endboss 
   * @returns {boolean} - Returns false if the bottle hits the endboss.
   */
  isBottleHittingEndboss(bottle, endboss) {
    if (bottle.isColliding(endboss)) {
      this.handleEndbossHit(endboss);
      return false;
    }
    return true;
  }


  /**
   * Handles the event when the endboss is hit by a throwable object.
   * @param {Endboss} endboss 
   */
  handleEndbossHit(endboss) {
     this.endbossHitCount++;
    endboss.hurt();
    if (this.endbossStatusBar) {
      this.playSound('bossHit');
    }
    this.handleEndbossDamage(endboss);
  }


  /**
   * Applies damage to the endboss and updates the status bar if needed.
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
   * Checks if the player can throw a new bottle and spawns it if possible.
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
   * Determines whether a new bottle can be thrown.
   * @returns {boolean}
   */
  canThrowNewBottle() {
    if (this.bottleCounter <= 0) return false;
    if (this.throwableObjects.length === 0) return true;
    const lastBottle = this.throwableObjects[this.throwableObjects.length - 1];
    return lastBottle.speedY <= 0;
  }


  /**
   * Calculates the current coin collection percentage.
   * @returns {number}
   */
  calculateCoinPercentage() {
    return Math.min((this.coinCounter / this.maxCoins) * 100, 100);
  }


  /**
   * Calculates the current bottle availability percentage.
   * @returns {number}
   */
  calculateBottlePercentage() {
    if (this.maxBottles === 0) return 0;
    if (this.bottleCounter === 0) return 0;
    const rawPercentage = (this.bottleCounter / this.maxBottles) * 100;
    return this.roundPercentageStep(rawPercentage, 5);
  }


  /**
   * Rounds a percentage to the nearest step value.
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
   * Retrieves the endboss object from the current level.
   * @returns {Endboss | undefined}
   */
  getEndboss() {
    return this.level.enemies.find(e => e instanceof Endboss);
  }


  /**
   * Checks whether an object is within the visible viewport of the world.
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
   * Shows or hides mobile controls based on screen size and game state.
   * @param {boolean} visible 
   */
  setMobileControlsVisibility(visible) {
    if (!this.mobileControls) return;
    const isMobile = window.innerWidth <= 1024;
    const isGameRunning = !this.gameOver && !this.gameWon;
    this.mobileControls.style.display =
      (visible && isMobile && isGameRunning) ? 'flex' : 'none';
  }
}
