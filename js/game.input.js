/**
 * Handles keydown events and updates keyboard state.
 * @param {KeyboardEvent} e 
 */
function handleKeyDown(e) {
    switch (e.keyCode) {
        case 39: 
            keyboard.RIGHT = true;
            break;
        case 37: 
            keyboard.LEFT = true;
            break;
        case 32: 
        case "Space":
            e.preventDefault();
            keyboard.SPACE = true;
            break;
        case 68: 
            keyboard.D = true;
            break;
    }

    if (world?.character?.resetIdleTimer) {
        world.character.resetIdleTimer();
    }
}


/**
 * Handles keyup events and updates keyboard state.
 * @param {KeyboardEvent} e 
 */
function handleKeyUp(e) {
    switch (e.keyCode) {
        case 39:
            keyboard.RIGHT = false;
            break;
        case 37:
            keyboard.LEFT = false;
            break;
        case 32:
        case "Space":
            e.preventDefault();
            keyboard.SPACE = false;
            break;
        case 68:
            keyboard.D = false;
            break;
    }
}


window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);


/**
 * Sets up all mobile controls including movement and impressum button.
 */
function setupMobileControls() {
    setupMovementButtons();
    setupImpressumButton();
}


/**
 * Binds movement buttons (left, right, jump, throw) for mobile controls.
 */
function setupMovementButtons() {
    bindMobileButton('btn_move_left', 'LEFT');
    bindMobileButton('btn_move_right', 'RIGHT');
    bindMobileButton('btn_jump', 'SPACE');
    bindMobileButton('btn_throw', 'D');
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
        keyboard[key] = true;
        if (world?.character?.resetIdleTimer) world.character.resetIdleTimer();
    };

    const release = (e) => {
        e.preventDefault();
        keyboard[key] = false;
    };

    button.addEventListener('touchstart', press, { passive: false });
    button.addEventListener('touchend', release);
    button.addEventListener('touchcancel', release);

    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointerleave', release);

    button.addEventListener('mousedown', press);
    button.addEventListener('mouseup', release);
    button.addEventListener('mouseleave', release);
}


/**
 * Sets up the impressum button with touch and click events.
 */
function setupImpressumButton() {
    const impressumBtn = document.getElementById('impressum_btn');
    if (!impressumBtn) return;

    const show = (e) => {
        e.preventDefault();
        showImpressum();
    };

    impressumBtn.addEventListener('touchstart', show);
    impressumBtn.addEventListener('click', show);
}
