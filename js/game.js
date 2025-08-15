let canvas;
let world;
let keyboard = new Keyboard(); 
let isFullscreenActive = false;

const activeIntervals = [];
let gameStarted = false;

document.addEventListener('fullscreenchange', () => {
  isFullscreenActive = !!document.fullscreenElement;
});


/**
 * Sets an interval and stores its ID for later management.
 */
function managedSetInterval(callback, time) {
  const id = setInterval(callback, time);
  activeIntervals.push(id);
  return id;
}


/**
 * Clears all stored intervals.
 */
function clearAllIntervals() {
  activeIntervals.forEach(clearInterval);
  activeIntervals.length = 0;
}


/**
 * Creates the status bar objects.
 */
function createStatusBars() {
  return {
    healthBar: new StatusBarHealth(),
    coinBar: new StatusBarCoins(),
    bottleBar: new StatusBarBottles(),
    endbossBar: new StatusBarEndboss()
  };
}


/**
 * Loads and initializes all status bars asynchronously.
 */
async function initializeStatusBars(statusBars) {
  await statusBars.healthBar.loadAndInit(statusBars.healthBar.IMAGES_HEALTH, 100);
  await statusBars.coinBar.loadAndInit(statusBars.coinBar.IMAGES_COIN, 0);
  await statusBars.bottleBar.loadAndInit(statusBars.bottleBar.IMAGES_BOTTLE, 0);
  await statusBars.endbossBar.loadAndInit(statusBars.endbossBar.IMAGES_ENDBOSS, 100);
}


/**
 * Adds the status bars to the game world.
 */
function addStatusBarsToWorld(statusBars) {
  world.statusBar = statusBars.healthBar;
  world.coinStatusBar = statusBars.coinBar;
  world.bottleStatusBar = statusBars.bottleBar;
  world.endbossStatusBar = statusBars.endbossBar;
}


/**
 * Starts the game, toggles UI elements, and initializes the game.
 */
function startGame() {
  document.getElementById('start_screen').style.display = 'none';
  document.querySelector('.canvas_container').style.display = 'block';
  document.getElementById('restart_btn').style.display = 'none';
  clearAllIntervals();
  if (window.innerWidth <= 1024) {
    const container = document.getElementById('game_container');
    if (container.requestFullscreen) {
      container.requestFullscreen();
    }
  }
  init().then(() => {
    if (world) {
      world.setMobileControlsVisibility(true);
    }
  });
}


/**
 * Shows the controls screen.
 */
function showControls() {
  document.getElementById('start_screen').style.display = 'none';
  document.getElementById('controls_screen').style.display = 'flex';
  document.getElementById('restart_btn').style.display = 'none';
}


/**
 * Shows the info screen.
 */
function showInfo() {
  document.getElementById('start_screen').style.display = 'none';
  document.getElementById('info_screen').style.display = 'flex';
  document.getElementById('restart_btn').style.display = 'none';
}


/**
 * Closes info/controls and shows start screen.
 */
function closeInfo() {
  document.getElementById('controls_screen').style.display = 'none';
  document.getElementById('info_screen').style.display = 'none';
  document.getElementById('start_screen').style.display = 'flex';
  document.getElementById('restart_btn').style.display = 'none';
}


/**
 * Shows the Impressum screen.
 */
function showImpressum() {
  document.getElementById('start_screen').style.display = 'none';
  document.getElementById('impressum_screen').style.display = 'flex';
}


/**
 * Closes the Impressum screen.
 */
function closeImpressum() {
  document.getElementById('impressum_screen').style.display = 'none';
  document.getElementById('start_screen').style.display = 'flex';
}


/**
 * Delays the display of the restart button after Game Over / You Win
 */
function showRestartButtonWithDelay() {
  const restartBtn = document.getElementById('restart_btn');
  restartBtn.style.display = 'none';
  restartBtn.disabled = true;

  setTimeout(() => {
    restartBtn.style.display = 'block';
    restartBtn.disabled = false;
  }, 2000); 
}


/**
 * Restarts the game by clearing timeouts, resetting the world and canvas,
 * reinitializing the game, updating UI elements, and restoring fullscreen if needed.
 */
async function restartGame() {
  clearWorldRestartTimeout();
  showGameUIElements();
  resetWorldAndCanvas();
  await initializeGame();
  restoreFullscreenAfterRestart();
}


/**
 * Clears any existing restart button timeout in the world object.
 */
function clearWorldRestartTimeout() {
  if (world?.restartButtonTimeout) {
    clearTimeout(world.restartButtonTimeout);
    world.restartButtonTimeout = null;
  }
}


/**
 * Shows main game UI elements and hides the restart button.
 */
function showGameUIElements() {
  document.querySelector('.canvas_container').style.display = 'block';
  document.getElementById('mute_btn_game').style.display = 'inline-block';
  document.getElementById('volume_slider_game').style.display = 'inline-block';
  document.getElementById('restart_btn').style.display = 'none';
}


/**
 * Stops all world animations, intervals, and clears the canvas.
 */
function resetWorldAndCanvas() {
  if (world) {
    world.stopAllAnimationsAndIntervals?.();
    world = null;
  }
  clearAllIntervals();
  removeAllKeyboardListeners();
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/**
 * Reinitializes the game and sets up keyboard events if character exists.
 */
async function initializeGame() {
  await init();
  if (world && world.character) {
    setupKeyboardEvents(keyboard, world.character);
  }
  world?.setMobileControlsVisibility(true);
}


/**
 * Restores fullscreen mode if it was active before the restart.
 */
function restoreFullscreenAfterRestart() {
  if (isFullscreenActive && !document.fullscreenElement) {
    setTimeout(async () => {
      try {
        await document.getElementById('game_container').requestFullscreen();
        console.log('Fullscreen restored after restart');
      } catch (err) {
        console.warn('Failed to restore fullscreen:', err);
      }
    }, 100);
  }
}


/**
 * Removes all keyboard event listeners by setting onkeydown and onkeyup to null.
 * This effectively disables any keyboard input handling.
 */
function removeAllKeyboardListeners() {
    window.onkeydown = null;
    window.onkeyup = null;
}


/**
 * Sets up keyboard event listeners for a given keyboard state and character.
 * Updates the keyboard's key states and calls the character's key handlers if defined.
 * 
 * @param {Object} keyboard - An object representing the current keyboard state (e.g., keys pressed).
 * @param {Object} character - The character object that may have handleKeyDown and handleKeyUp methods.
 */
function setupKeyboardEvents(keyboard, character) {
    window.onkeydown = (e) => {
        keyboard.keys[e.code] = true;
        character.handleKeyDown?.(e); 
    };
    window.onkeyup = (e) => {
        keyboard.keys[e.code] = false;
        character.handleKeyUp?.(e); 
    };
}


/**
 * Toggles fullscreen mode.
 */
function toggleFullscreen() {
  const container = document.getElementById('game_container');
  if (!document.fullscreenElement) {
    container.requestFullscreen();
    isFullscreenActive = true;
  } else {
    document.exitFullscreen();
    isFullscreenActive = false;
  }
}


/**
 * Initializes the game, canvas, and status bars.
 */
async function init() {
  canvas = document.getElementById('canvas');
  const statusBars = createStatusBars();
  await initializeStatusBars(statusBars);
  world = new World(canvas, keyboard);
  addStatusBarsToWorld(statusBars);
  if (window.innerWidth <= 1024) {
    setupMobileControls();
  }
}


/**
 * Keyboard event handling.
 */
window.addEventListener("keydown", (e) => {
  if (e.keyCode === 39) keyboard.RIGHT = true;
  if (e.keyCode === 37) keyboard.LEFT = true;
  if (e.code === "Space") {
    e.preventDefault();
    keyboard.SPACE = true;
  }
  if (e.keyCode === 68) keyboard.D = true;
});

window.addEventListener("keyup", (e) => {
  if (e.keyCode === 39) keyboard.RIGHT = false;
  if (e.keyCode === 37) keyboard.LEFT = false;
  if (e.code === "Space") {
    e.preventDefault();
    keyboard.SPACE = false;
  }
  if (e.keyCode === 68) keyboard.D = false;
});


/**
 * Sets up mobile touch controls.
 */
function setupMobileControls() {
  bindMobileButton('btn_move_left', 'LEFT');
  bindMobileButton('btn_move_right', 'RIGHT');
  bindMobileButton('btn_jump', 'SPACE');
  bindMobileButton('btn_throw', 'D');
  const impressumBtn = document.getElementById('impressum_btn');
  if (impressumBtn) {
    impressumBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      showImpressum();
    });
  }
}


/**
 * Binds a mobile button to a keyboard flag.
 */
function bindMobileButton(buttonId, key) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keyboard[key] = true;
  });
  button.addEventListener('touchend', (e) => {
    e.preventDefault();
    keyboard[key] = false;
  });
  button.addEventListener('mousedown', (e) => {
    e.preventDefault();
    keyboard[key] = true;
  });
  button.addEventListener('mouseup', (e) => {
    e.preventDefault();
    keyboard[key] = false;
  });
}
