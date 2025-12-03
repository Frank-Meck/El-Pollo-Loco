let canvas;
let world;
let keyboard = new Keyboard();
const activeIntervals = [];
let gameStarted = false;
let originalCanvasWidth = 720;
let originalCanvasHeight = 480;
let wasFullscreen = false;


/**
 * Draws the loading screen with progress bar.
 */
function drawLoadingBar(ctx, percent) {
    const w = 400;
    const h = 30;
    const x = (ctx.canvas.width - w) / 2;
    const y = (ctx.canvas.height - h) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = 'yellow';
    ctx.fillRect(x, y, w * (percent / 100), h);

    ctx.fillStyle = 'white';
    ctx.font = '20px zabras';
    ctx.textAlign = 'center';
    ctx.fillText(percent + '%', ctx.canvas.width / 2, y + h / 1.5);
}


/**
 * Returns true if device supports touch input.
 */
function isTouchDevice() {
    return navigator.maxTouchPoints > 0 ||
           'ontouchstart' in window ||
           navigator.msMaxTouchPoints > 0;
}


/**
 * Creates interval and stores it for later cleanup.
 */
function managedSetInterval(callback, time) {
    const id = setInterval(callback, time);
    activeIntervals.push(id);
    return id;
}


/**
 * Clears all managed intervals.
 */
function clearAllIntervals() {
    activeIntervals.forEach(clearInterval);
    activeIntervals.length = 0;
}


/**
 * Creates all status bar objects.
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
 * Loads images and initializes all status bars.
 */
async function initializeStatusBars(statusBars) {
    await statusBars.healthBar.loadAndInit(statusBars.healthBar.IMAGES_HEALTH, 100);
    await statusBars.coinBar.loadAndInit(statusBars.coinBar.IMAGES_COIN, 0);
    await statusBars.bottleBar.loadAndInit(statusBars.bottleBar.IMAGES_BOTTLE, 0);
    await statusBars.endbossBar.loadAndInit(statusBars.endbossBar.IMAGES_ENDBOSS, 100);
}


/**
 * Assigns all status bars to the game world.
 */
function addStatusBarsToWorld(statusBars) {
    world.statusBar = statusBars.healthBar;
    world.coinStatusBar = statusBars.coinBar;
    world.bottleStatusBar = statusBars.bottleBar;
    world.endbossStatusBar = statusBars.endbossBar;
}


/**
 * Preloads all game image assets and displays loading progress.
 */
async function preloadGameAssets(drawables) {
    const ctx = getCanvasContext();
    const paths = collectAllImagePaths(drawables);

    if (!paths.length) return drawLoadingBar(ctx, 100);

    await loadImagesWithProgress(ctx, paths);
}


/**
 * Returns canvas drawing context.
 */
function getCanvasContext() {
    return canvas.getContext('2d');
}


/**
 * Collects all IMAGES_* paths from instances and their classes.
 */
function collectAllImagePaths(drawables) {
    const paths = [];

    drawables.forEach(obj => {
        collectImageConstants(obj.constructor, paths);
        collectImageConstants(obj, paths);
    });

    return paths;
}


/**
 * Extracts image constants from object.
 */
function collectImageConstants(source, list) {
    Object.getOwnPropertyNames(source).forEach(key => {
        if (isImageArray(source, key)) {
            list.push(...source[key]);
        }
    });
}


/**
 * Checks if property is IMAGES_* array.
 */
function isImageArray(source, key) {
    return typeof key === 'string' &&
           key.startsWith('IMAGES_') &&
           Array.isArray(source[key]);
}


/**
 * Loads images and updates loading bar.
 */
async function loadImagesWithProgress(ctx, paths) {
    let loaded = 0;

    await Promise.all(paths.map(path =>
        loadSingleImage(path, () => {
            loaded++;
            drawLoadingProgress(ctx, loaded, paths.length);
        })
    ));
}


/**
 * Loads a single image.
 */
function loadSingleImage(path, onLoad) {
    return new Promise(resolve => {
        if (!path) return resolve();

        const img = new Image();
        img.src = path;
        img.onload = img.onerror = () => {
            onLoad();
            resolve();
        };
    });
}


/**
 * Updates loading percentage.
 */
function drawLoadingProgress(ctx, loaded, total) {
    const percent = Math.round((loaded / total) * 100);
    drawLoadingBar(ctx, percent);
}


/**
 * Starts the game: shows loading, preloads assets, initializes world and UI.
 */
async function startGame() {
    showLoadingScreen();

    canvas = document.getElementById('canvas');

    registerAssetSources();
    const drawables = createDrawableInstances();

    await preloadGameAssets(drawables);
    hideLoadingScreenAndStartUI();

    gameStarted = true;

    await init();
    if (world) showMobileControlsIfTouch();
}


/**
 * Shows the loading screen overlay.
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById("loading_screen");
    loadingScreen.style.display = "flex";
}


/**
 * Hides loading and start screens, displays canvas and hides restart button.
 */
function hideLoadingScreenAndStartUI() {
    document.getElementById("loading_screen").style.display = "none";
    document.getElementById("start_screen").style.display = "none";
    document.querySelector(".canvas_container").style.display = "block";
    document.getElementById("restart_btn").style.display = "none";
}


/**
 * Creates instances of all asset classes.
 * @returns {Array} Array of drawable objects
 */
function createDrawableInstances() {
    return ASSET_SOURCES.map(cls => new cls());
}


/**
 * Restarts the game by clearing world, showing UI, drawing background, initializing game.
 */
async function restartGame() {
    clearWorldRestartTimeout();
    showGameUIElements();
    await clearAndDrawBackground();
    await initializeGame();
    fullscreenRestore();
}


/**
 * Clears the canvas and draws the initial background image if available.
 */
async function clearAndDrawBackground() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (typeof Background !== 'undefined' && Background.IMAGES_BACKGROUND?.length) {
        const bgImg = await loadImageAsync(Background.IMAGES_BACKGROUND[0]);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }
}


/**
 * Loads an image asynchronously.
 * @param {string} src Image path
 * @returns {Promise<Image>}
 */
function loadImageAsync(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => resolve(img);
    });
}


/**
 * Clears restart timeout if exists.
 */
function clearWorldRestartTimeout() {
    if (world?.restartButtonTimeout) {
        clearTimeout(world.restartButtonTimeout);
        world.restartButtonTimeout = null;
    }
}


/**
 * Toggles fullscreen mode for the game container.
 */
function toggleFullscreen() {
    const container = document.getElementById('game_container');
    if (!document.fullscreenElement) enterFullscreen(container);
    else exitFullscreen(container);
}


/**
 * Enters fullscreen and adjusts UI.
 * @param {HTMLElement} container
 */
function enterFullscreen(container) {
    container.requestFullscreen().then(() => {
        container.classList.add('fullscreen-active');
        wasFullscreen = true;
        resizeCanvasAndUI();
    });
}


/**
 * Exits fullscreen and adjusts UI.
 * @param {HTMLElement} container
 */
function exitFullscreen(container) {
    document.exitFullscreen().then(() => {
        container.classList.remove('fullscreen-active');
        wasFullscreen = false;
        resizeCanvasAndUI();
    });
}


/**
 * Restores previous fullscreen state if necessary.
 */
function fullscreenRestore() {
    if (wasFullscreen && !document.fullscreenElement) {
        document.getElementById('game_container').requestFullscreen();
    } else if (!wasFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
    }
}


/**
 * Resizes canvas and adjusts UI elements.
 */
function resizeCanvasAndUI() {
    resizeGameCanvas();
    adjustMobileControls();
    adjustUIElements();
}


/**
 * Adjusts canvas size based on fullscreen state.
 */
function resizeGameCanvas() {
    const canvasEl = document.getElementById('canvas');
    if (document.fullscreenElement) {
        canvasEl.style.width = window.innerWidth + "px";
        canvasEl.style.height = window.innerHeight + "px";
    } else {
        canvasEl.style.width = originalCanvasWidth + "px";
        canvasEl.style.height = originalCanvasHeight + "px";
    }
}


/**
 * Adjusts the position and visibility of mobile controls if touch device.
 */
function adjustMobileControls() {
    const mobileControls = document.querySelector('.mobile_controls');
    if (mobileControls && isTouchDevice() && gameStarted) {
        setMobileControlsStyle(mobileControls);
    }
}


/**
 * Sets style properties for mobile controls container.
 * @param {HTMLElement} mobileControls
 */
function setMobileControlsStyle(mobileControls) {
    mobileControls.style.display = 'flex';
    mobileControls.style.position = 'absolute';
    mobileControls.style.bottom = '10px';
    mobileControls.style.left = '50%';
    mobileControls.style.transform = 'translateX(-50%)';
    mobileControls.style.zIndex = 10;
}


/**
 * Adjusts common UI elements like restart button and audio controls.
 */
function adjustUIElements() {
    document.querySelectorAll('#restart_btn, .audio_controls').forEach(setUIElementStyle);
}


/**
 * Sets style for a single UI element.
 * @param {HTMLElement} el
 */
function setUIElementStyle(el) {
    el.style.position = 'absolute';
    el.style.zIndex = 10;
}


document.addEventListener('fullscreenchange', resizeCanvasAndUI);
window.addEventListener('resize', resizeCanvasAndUI);


/**
 * Shows game UI elements including mute, volume, and restart button.
 */
function showGameUIElements() {
    document.querySelector('.canvas_container').style.display = 'block';
    document.getElementById('mute_btn_game').style.display = 'inline-block';
    document.getElementById('volume_slider_game').style.display = 'inline-block';
    document.getElementById('restart_btn').style.display = 'none';
    showMobileControlsIfTouch();
}


/**
 * Toggles mobile controls visibility based on device type and game state.
 */
function showMobileControlsIfTouch() {
    const mobileControls = document.querySelector('.mobile_controls');
    if (!mobileControls) return;
    mobileControls.style.display = (isTouchDevice() && gameStarted) ? 'flex' : 'none';
}


/**
 * Resets the world and clears the canvas.
 */
function resetWorldAndCanvas() {
    resetWorld();
    clearAllIntervals();
    clearCanvas();
}


/**
 * Stops all animations and clears the world reference.
 */
function resetWorld() {
    if (world) {
        world.stopAllAnimationsAndIntervals?.();
        world = null;
    }
}


/**
 * Clears the canvas completely.
 */
function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/**
 * Initializes the game including the world and mobile controls.
 */
async function initializeGame() {
    await init();
    showMobileControlsIfTouch();
}


/**
 * Sets up the world, canvas, and status bars.
 */
async function init() {
    setupCanvas();
    const statusBars = createStatusBars();
    await initializeStatusBars(statusBars);
    setupWorld(statusBars);
    if (isTouchDevice()) setupMobileControls();
}


/**
 * Assigns the canvas element to the global variable.
 */
function setupCanvas() {
    canvas = document.getElementById('canvas');
}


/**
 * Creates the world and adds status bars.
 * @param {Object} statusBars
 */
function setupWorld(statusBars) {
    world = new World(canvas, keyboard);
    addStatusBarsToWorld(statusBars);
}


/**
 * Handles keydown events for the keyboard.
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
    if (e.keyCode === 39) keyboard.RIGHT = true;
    if (e.keyCode === 37) keyboard.LEFT = true;
    if (e.code === "Space") {
        e.preventDefault();
        keyboard.SPACE = true;
    }
    if (e.keyCode === 68) keyboard.D = true;
}


/**
 * Handles keyup events for the keyboard.
 * @param {KeyboardEvent} e
 */
function handleKeyUp(e) {
    if (e.keyCode === 39) keyboard.RIGHT = false;
    if (e.keyCode === 37) keyboard.LEFT = false;
    if (e.code === "Space") {
        e.preventDefault();
        keyboard.SPACE = false;
    }
    if (e.keyCode === 68) keyboard.D = false;
}


window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);


/**
 * Sets up all mobile controls including movement buttons and impressum.
 */
function setupMobileControls() {
    setupMovementButtons();
    setupImpressumButton();
}


/**
 * Binds movement control buttons to keyboard actions.
 */
function setupMovementButtons() {
    bindMobileButton('btn_move_left', 'LEFT');
    bindMobileButton('btn_move_right', 'RIGHT');
    bindMobileButton('btn_jump', 'SPACE');
    bindMobileButton('btn_throw', 'D');
}


/**
 * Sets up the impressum button with touch event.
 */
function setupImpressumButton() {
    const impressumBtn = document.getElementById('impressum_btn');
    if (!impressumBtn) return;

    impressumBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showImpressum();
    });
}


/**
 * Binds a mobile button to a specific keyboard key.
 * @param {string} buttonId
 * @param {string} key
 */
function bindMobileButton(buttonId, key) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.addEventListener('touchstart', e => {
        e.preventDefault();
        keyboard[key] = true;
    });

    button.addEventListener('touchend', e => {
        e.preventDefault();
        keyboard[key] = false;
    });
}

/**
 * Hides the start screen and shows the controls screen.
 */
function showControls() {
    document.getElementById('start_screen').style.display = 'none';
    document.getElementById('controls_screen').style.display = 'block';
}


/**
 * Hides the start screen and shows the info screen.
 */
function showInfo() {
    document.getElementById('start_screen').style.display = 'none';
    document.getElementById('info_screen').style.display = 'block';
}


/**
 * Closes the info screen and returns to the start screen.
 */
function closeInfo() {
    const infoScreen = document.getElementById('info_screen');
    if (infoScreen) infoScreen.style.display = 'none';

    const controlsScreen = document.getElementById('controls_screen');
    if (controlsScreen) controlsScreen.style.display = 'none';

    const startScreen = document.getElementById('start_screen');
    if (startScreen) startScreen.style.display = 'block';
}


/**
 * Registers all asset classes used in the game.
 */
function registerAssetSources() {
    ASSET_SOURCES = [
        Character,
        Chicken,
        SmallChicken,
        Endboss,
        Cloud,
        Coin,
        Bottle,
        StatusBarHealth,
        StatusBarCoins,
        StatusBarBottles,
        StatusBarEndboss
    ];
}