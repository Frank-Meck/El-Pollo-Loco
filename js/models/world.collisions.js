/**
 * Checks all collision types in the world.
 */
World.prototype.checkCollisions = function () {
  this.checkCharacterStompsEnemy();
  this.checkEnemyCollisions();
  this.checkCoinCollisions();
  this.checkBottleCollisions();
  this.checkBottleHitsEnemies();
};

/**
 * Checks collisions between the character and enemies.
 */
World.prototype.checkEnemyCollisions = function () {
  this.level.enemies.forEach(enemy => {
    if (this.character.isColliding(enemy)) {
      if (enemy instanceof Endboss && enemy.energy <= 0) return;
      this.handleCharacterHit();
    }
  });
};

/**
 * Checks if bottles hit chicken enemies and removes them if hit.
 */
World.prototype.checkBottleHitsEnemies = function () {
  this.level.enemies = this.level.enemies.filter(enemy => {
    if (enemy instanceof SmallChicken) {
      for (let bottle of this.throwableObjects) {
        if (bottle.isColliding(enemy)) {
          return false;
        }
      }
    }
    return true;
  });
};

/**
 * Checks if the character stomps on enemies and handles damage.
 */
World.prototype.checkCharacterStompsEnemy = function () {
  this.level.enemies = this.level.enemies.filter(enemy => {
    if (this.isValidChickenEnemy(enemy) && this.character.isColliding(enemy)) {
      if (this.isCharacterStompingEnemy(enemy)) {
        this.handleEnemyStomp(enemy);
        return false;
      } else {
        this.handleCharacterHit();
      }
    }
    return true;
  });
};

/**
 * Checks whether an enemy is a valid Chicken type for stomping.
 * @param {Object} enemy 
 * @returns {boolean}
 */
World.prototype.isValidChickenEnemy = function (enemy) {
  return enemy instanceof Chicken && !(enemy instanceof SmallChicken);
};

/**
 * Determines whether the character is stomping an enemy.
 * @param {Object} enemy 
 * @returns {boolean}
 */
World.prototype.isCharacterStompingEnemy = function (enemy) {
  const horizontallyAligned = this.character.x + this.character.width > enemy.x &&
    this.character.x < enemy.x + enemy.width;

  const verticallyAbove = this.character.lastY + this.character.height <= enemy.y + 40;

  const standsOnTop = this.character.y + this.character.height >= enemy.y &&
    this.character.y + this.character.height <= enemy.y + 40 &&
    horizontallyAligned;

  const isFalling = this.character.speedY < 0;

  return (verticallyAbove && isFalling && horizontallyAligned) || standsOnTop;
};

/**
 * Handles logic when a chicken enemy is stomped.
 * @param {Object} enemy 
 */
World.prototype.handleEnemyStomp = function (enemy) {
  this.character.speedY = 20;
  this.playSound('stomp');
};

/**
 * Handles character getting hit by an enemy.
 */
World.prototype.handleCharacterHit = function () {
  this.character.hit();
  this.statusBar.setPercentage(this.character.energy);
};

/**
 * Checks collisions with coins.
 */
World.prototype.checkCoinCollisions = function () {
  this.level.coins = this.level.coins.filter(coin => {
    if (this.character.isColliding(coin)) {
      this.coinCounter++;
      this.coinStatusBar.setPercentage(this.calculateCoinPercentage());
      this.playSound('coin');
      return false;
    }
    return true;
  });
};

/**
 * Checks collisions with bottles and collects them.
 */
World.prototype.checkBottleCollisions = function () {
  this.level.bottles = this.level.bottles.filter(bottle => {
    if (this.character.isColliding(bottle)) {
      this.bottleCounter++;
      this.bottleStatusBar.setPercentage(this.calculateBottlePercentage());
      this.playSound('collectBottle');
      return false;
    }
    return true;
  });
};

/**
 * Main draw loop of the world, including collisions, camera, objects, and status bars.
 */
World.prototype.draw = function () {
  this.checkCollisions();
  this.checkEndbossChargeAttack();
  this.checkGameOver();
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this.camera_x = -this.character.x + 100;
  this.drawBackgroundWithCamera();
  this.drawGameObjectsWithCamera();
  this.drawStatusBarElements();
  this.drawCountdown();
  this.handleEndbossMovement();

  if (!this.gameOver || (this.showDeadBossTimer && Date.now() - this.showDeadBossTimer < 3000)) {
    this.animationFrameId = requestAnimationFrame(() => this.draw());
  }
};

/**
 * Draws background considering the camera position.
 */
World.prototype.drawBackgroundWithCamera = function () {
  this.ctx.translate(this.camera_x, 0);
  this.drawBackground();
  this.ctx.translate(-this.camera_x, 0);
};

/**
 * Draws game objects considering the camera position.
 */
World.prototype.drawGameObjectsWithCamera = function () {
  this.ctx.translate(this.camera_x, 0);
  this.drawGameObjects();
  this.ctx.translate(-this.camera_x, 0);
};

/**
 * Handles endboss movement and character interaction.
 */
World.prototype.handleEndbossMovement = function () {
  const endboss = this.getEndboss();
  this.checkAndStartMovingToEndboss(endboss);
  this.moveCharacterTowardsEndboss(endboss);
};

/**
 * Starts character movement towards the endboss if dead animation finished.
 * @param {Object} endboss 
 */
World.prototype.checkAndStartMovingToEndboss = function (endboss) {
  if (endboss && endboss.isDead && endboss.deadAnimationFinished && !this.gameOver) {
    if (!this.showDeadBossTimer) {
      this.showDeadBossTimer = Date.now();
      this.movingToEndboss = true;
    }
  }
};

/**
 * Moves character towards the endboss after boss death.
 * @param {Object} endboss 
 */
World.prototype.moveCharacterTowardsEndboss = function (endboss) {
  if (!this.movingToEndboss || !endboss) return;

  const targetX = endboss.x - 80;
  const speed = 3;

  if (this.character.x < targetX) {
    this.character.x += speed;
  } else {
    this.character.x = targetX;
    this.movingToEndboss = false;

    setTimeout(() => {
      this.endGame(true);
    }, 500);
  }
};

/**
 * Checks game over conditions and triggers end game sequence.
 */
World.prototype.checkGameOver = function () {
  const endboss = this.getEndboss();

  if (this.shouldStartDeadSequence()) {
    this.character.startDeadSequence(() => this.endGame(false));
  } else if (this.shouldEndGameFalse(endboss)) {
    this.endGame(false);
  }

  if (this.shouldEndGameTrue(endboss)) {
    this.endGame(true);
  }
};

/**
 * Determines if character dead sequence should start.
 * @returns {boolean}
 */
World.prototype.shouldStartDeadSequence = function () {
  return this.character.energy <= 0 && !this.character.deadAnimationDone && !this.gameOver;
};

/**
 * Determines if the game should end with failure.
 * @param {Object} endboss 
 * @returns {boolean}
 */
World.prototype.shouldEndGameFalse = function (endboss) {
  if (!endboss) return false;

  const bottleBarExists = this.bottleStatusBar && typeof this.bottleStatusBar.percentage === 'number';
  const allBottlesUsed = bottleBarExists && this.bottleStatusBar.percentage === 0 && this.bottleCounter === 0;
  const bottleWasFull = bottleBarExists && this.bottleStatusBar.percentage === 100;

  return (this.countdown.remainingTime <= 0 && endboss.energy > 0) ||
    (bottleWasFull && allBottlesUsed && endboss.energy > 0);
};


/**
 * Checks if the game should end with a win.
 * @param {Object} endboss - The endboss object.
 * @returns {boolean} True if endboss is dead and game not over.
 */
World.prototype.shouldEndGameTrue = function (endboss) {
  return endboss && endboss.energy <= 0 && endboss.deadAnimationFinished && !this.gameOver;
};


/**
 * Ends the game.
 * @param {boolean} won - True if player won.
 */
World.prototype.endGame = function (won) {
  if (this.gameOver) return;

  this.setGameOverStatus(won);
  this.stopAllSounds();
  this.hideGameControls();
  this.setMobileControlsVisibility(false);

  setTimeout(() => this.stopAllAnimationsAndIntervals(), 2000);
  this.showEndScreenAfterDelay(won);
};


/**
 * Sets game over status flags.
 * @param {boolean} won - True if player won.
 */
World.prototype.setGameOverStatus = function (won) {
  this.gameOver = true;
  this.gameWon = won;
};


/**
 * Stops animations and intervals.
 */
World.prototype.stopAllAnimationsAndIntervals = function () {
  cancelAnimationFrame(this.animationFrameId);
  clearInterval(this.countdown.intervalId);
  clearAllIntervals();
};


/**
 * Stops all game sounds.
 */
World.prototype.stopAllSounds = function () {
  const sounds = ['background','chickenNoise','bossHit','win','stomp','coin','collectBottle'];
  sounds.forEach(sound => soundManager.stop(sound));
};


/**
 * Hides game controls.
 */
World.prototype.hideGameControls = function () {
  document.getElementById('mute_btn_game').style.display = 'none';
  document.getElementById('volume_slider_game').style.display = 'none';
};


/**
 * Visibel game controls.
 */
World.prototype.showGameControls = function () {
  document.getElementById('mute_btn_game').style.display = 'inline-block';
  document.getElementById('volume_slider_game').style.display = 'inline-block';
};


/**
 * Shows the end screen after a delay.
 * @param {boolean} won - True if player won.
 */
World.prototype.showEndScreenAfterDelay = function (won) {
  setTimeout(() => {
    this.showRestartButton();
    this.displayEndImage(won);
    if (won) this.playSound('win');
  }, 1000);
};



// === in world.collision.js ===

// Timeout-Handle als Property von World
World.prototype.restartButtonTimeout = null;

/**
 * Zeigt den Restart-Button an und bindet das onclick Event.
 */
World.prototype.showRestartButton = function () {
    const restartBtn = document.getElementById('restart_btn');
    if (restartBtn) {
        restartBtn.style.display = 'inline-block';   // erst sichtbar
        restartBtn.onclick = () => restartGame();     // dann aktiv
    }
};

/**
 * Zeigt das Endbild an (You Win / You Lose) und startet verzögert die Anzeige des Restart-Buttons.
 * @param {boolean} won - True, wenn Spieler gewonnen hat
 */
World.prototype.displayEndImage = function (won) {
    const image = new Image();
    image.src = won
        ? './img/You won, you lost/You Win A.png'
        : './img/You won, you lost/You lost.png';

    image.onload = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);

        // Restart-Button vorher unsichtbar & Event deaktivieren
        const restartBtn = document.getElementById('restart_btn');
        restartBtn.style.display = 'none';
        restartBtn.onclick = null;

        // alten Timeout abbrechen
        if (this.restartButtonTimeout) clearTimeout(this.restartButtonTimeout);

        // Restart-Button erst nach 2 Sekunden anzeigen
        this.restartButtonTimeout = setTimeout(() => {
            this.showRestartButton();
        }, 1000);
    };
};

/**
 * Draws background objects.
 */
World.prototype.drawBackground = function () {
  this.addObjectsToMap(this.level.backgroundObjects);
};


/**
 * Draws all status bar elements.
 */
World.prototype.drawStatusBarElements = function () {
  if (this.statusBar) this.addToMap(this.statusBar);
  if (this.coinStatusBar) this.addToMap(this.coinStatusBar);
  if (this.bottleStatusBar) this.addToMap(this.bottleStatusBar);

  this.updateEndbossAppearance();
  this.drawEndbossStatusBarIfNeeded();
};


/**
 * Updates if the endboss has appeared.
 */
World.prototype.updateEndbossAppearance = function () {
  if (this.character.x >= 3696) this.endbossHasAppeared = true;
};


/**
 * Draws the endboss status bar if needed.
 */
World.prototype.drawEndbossStatusBarIfNeeded = function () {
  if (this.endbossHasAppeared && this.coinCounter < this.maxCoins) {
    this.blinkMissingCoinsWarning();
  }
  if (this.endbossHasAppeared && this.coinCounter === this.maxCoins && this.endbossStatusBar) {
    this.endbossStatusBar.x = this.canvas.width - this.endbossStatusBar.width - 10;
    this.endbossStatusBar.y = 20;
    this.addToMap(this.endbossStatusBar);
  }
};


/**
 * Blinks warning for missing coins.
 */
World.prototype.blinkMissingCoinsWarning = function () {
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    this.ctx.save();
    this.ctx.font = "24px 'zabras', Arial, Helvetica, sans-serif";
    this.ctx.fillStyle = "red";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Dir fehlen noch Coins!", this.coinStatusBar.x + this.coinStatusBar.width + 160, this.coinStatusBar.y + 35);
    this.ctx.restore();
  }
};


/**
 * Draws all game objects.
 */
World.prototype.drawGameObjects = function () {
  this.addToMap(this.character);
  this.addObjectsToMap(this.level.enemies);
  this.addObjectsToMap(this.level.clouds);
  this.addObjectsToMap(this.level.coins);
  if (this.level.bottles) this.addObjectsToMap(this.level.bottles);
  this.addObjectsToMap(this.throwableObjects);
};


/**
 * Draws the countdown timer.
 */
World.prototype.drawCountdown = function () {
  const time = this.countdown.getFormattedTime();
  const isCritical = this.countdown.remainingTime <= 15;
  const shouldBlink = isCritical && Math.floor(Date.now() / 500) % 2 === 0;
  this.ctx.font = "30px 'zabras', Arial, Helvetica, sans-serif";
  this.ctx.textAlign = 'right';
  this.ctx.fillStyle = isCritical ? (shouldBlink ? 'red' : 'black') : 'black';
  this.ctx.fillText(time, this.canvas.width - 10, 30);
};


/**
 * Adds multiple objects to the canvas map.
 * @param {Array} objects - List of objects.
 */
World.prototype.addObjectsToMap = function (objects) {
  objects.forEach(o => this.addToMap(o));
};


/**
 * Adds a single object to the canvas map.
 * @param {Object} mo - Movable object.
 */
World.prototype.addToMap = function (mo) {
  if (mo.otherDirection) this.flipImage(mo);
  mo.draw(this.ctx);
  mo.drawFrame(this.ctx);
  mo.drawOffsetFrame(this.ctx);
  if (mo.otherDirection) this.flipImageBack(mo);
};


/**
 * Flips object image horizontally.
 * @param {Object} mo - Movable object.
 */
World.prototype.flipImage = function (mo) {
  this.ctx.save();
  this.ctx.translate(mo.width, 0);
  this.ctx.scale(-1, 1);
  mo.x = mo.x * -1;
};


/**
 * Restores object image after flip.
 * @param {Object} mo - Movable object.
 */
World.prototype.flipImageBack = function (mo) {
  mo.x = mo.x * -1;
  this.ctx.restore();
};


/**
 * Checks if endboss should start charge attack.
 */
World.prototype.checkEndbossChargeAttack = function () {
  const endboss = this.getEndboss();
  const character = this.character;
  if (
    endboss &&
    this.isInViewport(endboss) &&
    this.isInViewport(character) &&
    !endboss.isCharging &&
    this.coinCounter === this.maxCoins
  ) {
    endboss.startCharge(character.x);
  }
};