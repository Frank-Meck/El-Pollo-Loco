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
    soundManager.add("background", "./audio/background_music_1.mp3", true);
    soundManager.add("chickenNoise", "./audio/chicken_noises_1.mp3", true);
    soundManager.add("coin", "./audio/get_coin_1.mp3");
    soundManager.add("stomp", "./audio/chicken_platt.mp3");
    soundManager.add("bossHit", "./audio/Falsche_klirren_1.mp3");
    soundManager.add("collectBottle", "./audio/collect_bottle.mp3");
    soundManager.add("win", "./audio/win_music_1.mp3");
}


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
