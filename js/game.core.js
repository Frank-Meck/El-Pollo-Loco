let canvas;
let world;
let keyboard = new Keyboard();
const activeIntervals = [];
let gameStarted = false;
let originalCanvasWidth = 720;
let originalCanvasHeight = 480;
let wasFullscreen = false;


/**
 * Wraps setInterval and keeps track of active intervals.
 * @param {Function} callback 
 * @param {number} time 
 * @returns {number} interval ID
 */
function managedSetInterval(callback, time) {
    const id = setInterval(callback, time);
    activeIntervals.push(id);
    return id;
}


/**
 * Clears all active intervals.
 */
function clearAllIntervals() {
    activeIntervals.forEach(clearInterval);
    activeIntervals.length = 0;
}


/**
 * Draws the loading bar on the canvas.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} percent 
 */
function drawLoadingBar(ctx, percent) {
    const w = 400, h = 30;
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
 * Updates loading progress bar and text.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} loaded 
 * @param {number} total 
 */
function drawLoadingProgress(ctx, loaded, total) {
    const percent = Math.round((loaded / total) * 100);
    drawLoadingBar(ctx, percent);

    const bar = document.getElementById("loading_bar");
    const text = document.getElementById("loading_text");
    if (bar) bar.style.width = percent + "%";
    if (text) text.innerText = `Lade Spiel… ${percent}%`;
}


/**
 * Preloads game assets and updates progress.
 * @param {Array} drawables 
 */
async function preloadGameAssets(drawables) {
    const ctx = getCanvasContext();
    const paths = collectAllImagePaths(drawables);
    if (!paths.length) return drawLoadingBar(ctx, 100);
    await loadImagesWithProgress(ctx, paths);
}


/**
 * Returns the 2D context of the canvas.
 * @returns {CanvasRenderingContext2D}
 */
function getCanvasContext() {
    return canvas.getContext('2d');
}


/**
 * Collects all image paths from drawable objects.
 * @param {Array} drawables 
 * @returns {Array<string>}
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
 * Collects image constants from a source object or class.
 * @param {Object} source 
 * @param {Array} list 
 */
function collectImageConstants(source, list) {
    Object.getOwnPropertyNames(source).forEach(key => {
        if (isImageArray(source, key)) list.push(...source[key]);
    });
}


/**
 * Checks if a property is an image array.
 * @param {Object} source 
 * @param {string} key 
 * @returns {boolean}
 */
function isImageArray(source, key) {
    return typeof key === 'string' && key.startsWith('IMAGES_') && Array.isArray(source[key]);
}


/**
 * Loads multiple images with progress updates.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Array<string>} paths 
 */
async function loadImagesWithProgress(ctx, paths) {
    let loaded = 0;
    const total = paths.length;
    await Promise.all(
        paths.map(path =>
            loadSingleImage(path, () => {
                loaded++;
                drawLoadingProgress(ctx, loaded, total);
            })
        )
    );
}


/**
 * Loads a single image.
 * @param {string} path 
 * @param {Function} onLoad 
 * @returns {Promise}
 */
function loadSingleImage(path, onLoad) {
    return new Promise(resolve => {
        if (!path) { resolve(); return; }
        const img = new Image();
        img.src = path;
        img.onload = () => { resolve(); onLoad(); };
        img.onerror = () => { resolve(); onLoad(); };
    });
}


/**
 * Resizes canvas and adjusts UI elements.
 */
function resizeCanvasAndUI() {
    resizeGameCanvas();
    adjustUIElements();
    if (world) world.setMobileControlsVisibility(true);
}


/**
 * Resizes the game canvas to fullscreen or original size.
 */
function resizeGameCanvas() {
    if (!canvas) return;

    if (document.fullscreenElement) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width  = originalCanvasWidth;
        canvas.height = originalCanvasHeight;
    }

    canvas.style.width  = canvas.width + "px";
    canvas.style.height = canvas.height + "px";

    const container = document.getElementById('game_container');
    container.style.width  = canvas.width + "px";
    container.style.height = canvas.height + "px";

    if (world && world.setMobileControlsVisibility) {
        world.setMobileControlsVisibility(true);
    }
}


/**
 * Adjusts UI elements like buttons and audio controls.
 */
function adjustUIElements() {
    document.querySelectorAll('#restart_btn, .audio_controls').forEach(setUIElementStyle);
}


/**
 * Applies positioning and z-index to a UI element.
 * @param {HTMLElement} el 
 */
function setUIElementStyle(el) {
    el.style.position = 'absolute';
    el.style.zIndex = 10;
}


/**
 * Toggles fullscreen mode.
 */
function toggleFullscreen() {
    const container = document.getElementById('game_container');
    if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => {
            wasFullscreen = true;
            resizeGameCanvas();
        });
    } else {
        document.exitFullscreen().then(() => {
            wasFullscreen = false;
            resizeGameCanvas();
        });
    }
}


document.addEventListener('fullscreenchange', resizeCanvasAndUI);
window.addEventListener('resize', resizeCanvasAndUI);


/**
 * Starts the game, shows loading, initializes assets and world.
 */
async function startGame() {
    showLoadingScreen();
    setupCanvas();

    registerAssetSources();
    const drawables = createDrawableInstances();
    await preloadGameAssets(drawables);
    hideLoadingScreenAndStartUI();

    gameStarted = true;
    await init();

    setupMobileControls();
}


/**
 * Shows the loading screen.
 */
function showLoadingScreen() {
    document.getElementById("loading_screen").style.display = "flex";
}


/**
 * Hides the loading screen and shows the canvas/UI.
 */
function hideLoadingScreenAndStartUI() {
    document.getElementById("loading_screen").style.display = "none";
    document.getElementById("start_screen").style.display = "none";
    document.querySelector(".canvas_container").style.display = "block";
    document.getElementById("restart_btn").style.display = "none";
}


/**
 * Creates drawable instances from asset sources.
 * @returns {Array<Object>}
 */
function createDrawableInstances() {
    return ASSET_SOURCES.map(cls => new cls());
}


/**
 * Restarts the game and resets the world/canvas.
 */
async function restartGame() {
    resetWorldAndCanvas();
    showGameUI(); 
    await clearAndDrawBackground();
    await initializeGame();
/**    fullscreenRestore(); */
}



/**
 * Resets world and clears canvas and intervals.
 */
function resetWorldAndCanvas() {
    resetWorld();
    clearAllIntervals();
    clearCanvas();
}


/**
 * Resets the world object.
 */
function resetWorld() {
    if (world) {
        world.stopAllAnimationsAndIntervals?.();
        world = null;
    }
}


/**
 * Clears the canvas.
 */
function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/**
 * Clears and draws background image.
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
 * @param {string} src 
 * @returns {Promise<HTMLImageElement>}
 */
function loadImageAsync(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => resolve(img);
    });
}


/**
 * Initializes the game.
 */
async function initializeGame() {
    await init();
    if (world) world.setMobileControlsVisibility(true);
}


/**
 * Initializes canvas, status bars, and world.
 */
async function init() {
    setupCanvas();
    const statusBars = createStatusBars();
    await initializeStatusBars(statusBars);
    setupWorld(statusBars);

    setupMobileControls();
}


/**
 * Creates status bar instances.
 * @returns {Object}
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
 * Initializes all status bars.
 * @param {Object} statusBars 
 */
async function initializeStatusBars(statusBars) {
    await statusBars.healthBar.loadAndInit(statusBars.healthBar.IMAGES_HEALTH, 100);
    await statusBars.coinBar.loadAndInit(statusBars.coinBar.IMAGES_COIN, 0);
    await statusBars.bottleBar.loadAndInit(statusBars.bottleBar.IMAGES_BOTTLE, 0);
    await statusBars.endbossBar.loadAndInit(statusBars.endbossBar.IMAGES_ENDBOSS, 100);
}


/**
 * Adds status bars to the world.
 * @param {Object} statusBars 
 */
function addStatusBarsToWorld(statusBars) {
    world.statusBar = statusBars.healthBar;
    world.coinStatusBar = statusBars.coinBar;
    world.bottleStatusBar = statusBars.bottleBar;
    world.endbossStatusBar = statusBars.endbossBar;
}


/**
 * Sets up the canvas element.
 */
function setupCanvas() {
    canvas = document.getElementById('canvas');
    if (!canvas) throw new Error("Canvas-Element mit ID 'canvas' nicht gefunden!");
    canvas.width = originalCanvasWidth;
    canvas.height = originalCanvasHeight;
}


/**
 * Initializes the world object and binds status bars.
 * @param {Object} statusBars 
 */
function setupWorld(statusBars) {
    world = new World(canvas, keyboard);
    addStatusBarsToWorld(statusBars);
    if (world.setMobileControlsVisibility) world.setMobileControlsVisibility(true);
}


/**
 * Initializes mobile control buttons.
 */
function setupMobileControls() {
    setupMovementButtons();
    setupImpressumButton();
}


/**
 * Sets up movement buttons for mobile.
 */
function setupMovementButtons() {
    bindMobileButton('btn_move_left', 'LEFT');
    bindMobileButton('btn_move_right', 'RIGHT');
    bindMobileButton('btn_jump', 'SPACE');
    bindMobileButton('btn_throw', 'D');
}


/**
 * Sets up impressum button for touch and click.
 */
function setupImpressumButton() {
    const impressumBtn = document.getElementById('impressum_btn');
    if (!impressumBtn) return;

    ['touchstart', 'click'].forEach(evt =>
        impressumBtn.addEventListener(evt, e => {
            e.preventDefault();
            showImpressum();
        })
    );
}


/**
 * Binds a mobile button to a keyboard key with touch, pointer, and mouse support.
 * @param {string} buttonId 
 * @param {string} key 
 */
function bindMobileButton(buttonId, key) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const press = (e) => {
        e.preventDefault();
        if (world) world.keyboard[key] = true;
        if (world.character?.resetIdleTimer) world.character.resetIdleTimer();
    };

    const release = (e) => {
        e.preventDefault();
        if (world) world.keyboard[key] = false;
    };

    button.addEventListener('touchstart', press, { passive: false });
    button.addEventListener('touchend', release, { passive: false });
    button.addEventListener('touchcancel', release, { passive: false });

    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointerleave', release);

    button.addEventListener('mousedown', press);
    button.addEventListener('mouseup', release);
    button.addEventListener('mouseleave', release);
}


/**
 * Registers all asset source classes.
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


document.addEventListener('DOMContentLoaded', () => {
    setupMobileControls();
});

window.addEventListener('resize', () => {
    setupMobileControls();
});
