/**
 * Shows the controls screen and hides the start screen.
 */
function showControls() {
    document.getElementById('start_screen').style.display = 'none';
    document.getElementById('controls_screen').style.display = 'block';
}


/**
 * Shows the info screen and hides the start screen.
 */
function showInfo() {
    document.getElementById('start_screen').style.display = 'none';
    document.getElementById('info_screen').style.display = 'block';
}


/**
 * Closes info and controls screens and shows the start screen.
 */
function closeInfo() {
    document.getElementById('info_screen').style.display = 'none';
    document.getElementById('controls_screen').style.display = 'none';
    document.getElementById('start_screen').style.display = 'block';
}


/**
 * Shows the impressum screen.
 */
function showImpressum() {
    const impressumScreen = document.getElementById('impressum_screen');
    if (impressumScreen) {
        impressumScreen.style.display = 'block';
    }
}


/**
 * Hides the impressum screen.
 */
function hideImpressum() {
    const impressumScreen = document.getElementById('impressum_screen');
    if (impressumScreen) {
        impressumScreen.style.display = 'none';
    }
}


/**
 * Sets up the restart button to restart the game when clicked.
 */
function setupRestartButton() {
    const restartBtn = document.getElementById('restart_btn');
    if (!restartBtn) return;

    restartBtn.addEventListener('click', async () => {
        restartBtn.style.display = 'none'; 
        await restartGame();
    });
}


/**
 * Sets up audio controls including mute button and volume slider.
 */
function setupAudioControls() {
    const muteBtn = document.getElementById('mute_btn_game');
    const volumeSlider = document.getElementById('volume_slider_game');

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (world) world.toggleMute?.();
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            if (world) world.setVolume?.(parseFloat(e.target.value));
        });
    }
}


/**
 * Shows in-game UI elements like canvas, restart button, and audio controls.
 */
function showGameUI() {
    document.querySelector('.canvas_container').style.display = 'block';
    document.getElementById('restart_btn').style.display = 'none';
    document.getElementById('mute_btn_game').style.display = 'inline-block';
    document.getElementById('volume_slider_game').style.display = 'inline-block';
    if (world) world.setMobileControlsVisibility(true);
}


/**
 * Hides in-game UI elements including canvas, restart button, and audio controls.
 */
function hideGameUI() {
    document.querySelector('.canvas_container').style.display = 'none';
    document.getElementById('restart_btn').style.display = 'none';
    document.getElementById('mute_btn_game').style.display = 'none';
    document.getElementById('volume_slider_game').style.display = 'none';
}
