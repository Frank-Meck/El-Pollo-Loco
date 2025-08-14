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
 * Hides the start screen and shows the impressum screen.
 */
function showImpressum() {
    document.getElementById('start_screen').style.display = 'none';
    document.getElementById('impressum_screen').style.display = 'block';
}


/**
 * Closes the impressum and info screens, shows the start screen,
 * and hides restart and volume controls if they exist.
 */
function closeImpressum() {
    document.getElementById('impressum_screen').style.display = 'none';
    document.getElementById('info_screen').style.display = 'none';
    document.getElementById('start_screen').style.display = 'flex';
    document.getElementById('restart_btn').style.display = 'none';

    const muteBtn = document.getElementById('mute-btn');
    const volumeBtn = document.getElementById('volume-btn');

    if (muteBtn) muteBtn.style.display = 'none';
    if (volumeBtn) volumeBtn.style.display = 'none';
}
