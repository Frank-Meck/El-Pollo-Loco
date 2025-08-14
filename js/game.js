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
 * Restarts the game and ensures fullscreen if needed.
 */
async function restartGame() {
  clearAllIntervals();
  await init();
  toggleFullscreen();
  document.getElementById('restart_btn').style.display = 'none';
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

/**
 * Quits the game, clears intervals, exits fullscreen, and closes the window.
 */
function quitGame() {
  clearAllIntervals();
  world = null;

  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  window.open('', '_self'); 
  window.close();
}