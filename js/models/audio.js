const STORAGE = window.localStorage;

/**
 * Sound manager for handling audio playback, mute, and volume.
 */
const soundManager = {
    isMuted: false,
    volume: 0.3,
    sounds: {},

    /**
     * Add a new sound to the manager.
     * @param {string} name - Name of the sound.
     * @param {string} src - Source path of the audio file.
     * @param {boolean} loop - Whether the sound should loop.
     * @returns {HTMLAudioElement} - The created audio element.
     */
    add(name, src, loop = false) {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = this.volume;
        audio.muted = this.isMuted;
        this.sounds[name] = audio;
        return audio;
    },


    /**
     * Play a sound by name from the manager.
     * @param {string} name - Name of the sound to play.
     */
    play(name) {
        const audio = this.sounds[name];
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    },


    /**
     * Stop a sound by name.
     * @param {string} name - Name of the sound to stop.
     */
    stop(name) {
        const audio = this.sounds[name];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    },


    /**
     * Toggle mute for all sounds.
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        Object.values(this.sounds).forEach(audio => audio.muted = this.isMuted);
        STORAGE.setItem('gameMuted', this.isMuted ? 'true' : 'false');

        document.querySelectorAll('#mute-btn-start, #mute_btn_game')
            .forEach(btn => btn.textContent = this.isMuted ? '🔇' : '🔊');
    },


    /**
     * Set volume for all sounds.
     * @param {number} value - Volume value (0.0 to 1.0).
     */
    setVolume(value) {
        this.volume = parseFloat(value);
        Object.values(this.sounds).forEach(audio => audio.volume = this.volume);
        STORAGE.setItem('gameVolume', String(this.volume));

        document.querySelectorAll('#volume-slider-start, #volume_slider_game')
            .forEach(slider => slider.value = this.volume);
    }
};


/**
 * Load saved mute and volume settings from localStorage.
 */
function loadSavedAudioSettings() {
    const savedMuteState = STORAGE.getItem('gameMuted');
    soundManager.isMuted = savedMuteState === 'true';

    const savedVolume = STORAGE.getItem('gameVolume');
    soundManager.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.3;
}


/**
 * Initialize all game sounds.
 */
function initializeSounds() {
    const background = soundManager.add("background", "./audio/background_music_1.mp3", true);
    background.volume = soundManager.volume * 0.7; 

    const standardVolume = soundManager.volume;
    soundManager.add("chickenNoise", "./audio/chicken_noises_1.mp3", true).volume = standardVolume;
    soundManager.add("coin", "./audio/get_coin_1.mp3").volume = standardVolume;
    soundManager.add("stomp", "./audio/chicken_platt.mp3").volume = standardVolume;
    soundManager.add("bossHit", "./audio/Falsche_klirren_1.mp3").volume = standardVolume;
    soundManager.add("collectBottle", "./audio/collect_bottle.mp3").volume = standardVolume;
    soundManager.add("win", "./audio/win_music_1.mp3").volume = standardVolume;
}


/**
 * Sets the master volume for all sounds managed by the soundManager.
 * 
 * This method updates the volume of each sound. If a sound is named "background",
 * its volume is reduced to 70% of the master volume. The new volume is stored
 * in persistent storage under the key 'gameVolume' and updates any 
 * volume sliders in the DOM with IDs 'volume-slider-start' and 'volume_slider_game'.
 * 
 * @param {number|string} value - The desired volume level (0.0 to 1.0). Strings
 *                                will be converted to a float.
 */
soundManager.setVolume = function(value) {
    this.volume = parseFloat(value);
    Object.entries(this.sounds).forEach(([name, audio]) => {
        if (name === "background") {
            audio.volume = this.volume * 0.7; 
        } else {
            audio.volume = this.volume; 
        }
    });
    STORAGE.setItem('gameVolume', String(this.volume));

    document.querySelectorAll('#volume-slider-start, #volume_slider_game')
        .forEach(slider => slider.value = this.volume);
};

/**
 * Apply current volume and mute settings to all sounds.
 */
function applyAudioSettingsToAllSounds() {
    Object.values(soundManager.sounds).forEach(audio => {
        audio.volume = soundManager.volume;
        audio.muted = soundManager.isMuted;
    });
}


/**
 * Sync mute and volume UI with current settings.
 */
function syncAudioUI() {
    document.querySelectorAll('#mute-btn-start, #mute_btn_game')
        .forEach(btn => btn.textContent = soundManager.isMuted ? '🔇' : '🔊');

    document.querySelectorAll('#volume-slider-start, #volume_slider_game')
        .forEach(slider => slider.value = soundManager.volume);
}


document.addEventListener('DOMContentLoaded', () => {
    loadSavedAudioSettings();
    initializeSounds();
    applyAudioSettingsToAllSounds();
    syncAudioUI();
});


/**
 * Toggle mute via global function.
 */
function toggleMute() {
    soundManager.toggleMute();
}


/**
 * Set volume via global function.
 * @param {number} value - Volume value (0.0 to 1.0)
 */
function setVolume(value) {
    soundManager.setVolume(value);
}
