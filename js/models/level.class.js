/**
 * Represents a game level with all its elements.
 */
class Level {

    enemies;
    clouds;
    backgroundObjects;
    coins;
    bottles; 
    level_end_x = 4200;

    /**
     * Creates a new level instance.
     * @param {Array} enemies - Array of enemy objects in the level.
     * @param {Array} clouds - Array of cloud objects in the level.
     * @param {Array} backgroundObjects - Array of background objects.
     * @param {Array} coins - Array of collectible coins.
     * @param {Array} bottles - Array of throwable bottles.
     */
    constructor(enemies, clouds, backgroundObjects, coins, bottles) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.bottles = bottles;
    }
}
