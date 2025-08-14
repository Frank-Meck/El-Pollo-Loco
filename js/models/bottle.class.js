class Bottle extends MoveableObject {
    width = 80;
    height = 100;
    offset = { top: 20, left: 35, right: 20, bottom: 15 };

    static numberOfBottles = 25;

    /**
     * Constructor initializes bottle position and image.
     * @param {number} x - X coordinate of the bottle.
     * @param {number} y - Y coordinate of the bottle (default 100).
     */
    constructor(x, y = 100) {
        super().loadImage('./img/6_salsa_bottle/1_salsa_bottle_on_ground.png');
        this.x = x;
        this.y = y;
    }


    /**
     * Generate multiple bottles with random positions avoiding collisions.
     * @param {number} count - Number of bottles to generate.
     * @param {number[]} xRange - Range for X coordinates [min, max].
     * @param {Array} existingCoins - Array of existing coins to avoid.
     * @returns {Bottle[]} Array of generated Bottle objects.
     */
    static generateBottles(count = Bottle.numberOfBottles, xRange = [400, 4150], existingCoins = []) {
        const bottles = [];
        const usedX = [];

        while (bottles.length < count) {
            const position = this.generateRandomBottlePosition(xRange);

            if (this.isPositionValid(position.x, usedX, existingCoins)) {
                bottles.push(new Bottle(position.x, position.y));
                usedX.push(position.x);
            }
        }

        return bottles;
    }


    /**
     * Generate a random X and Y position for a bottle within the range.
     * @param {number[]} xRange - Range for X coordinates [min, max].
     * @returns {{x: number, y: number}} Random position object.
     */
    static generateRandomBottlePosition(xRange) {
        const x = Math.floor(Math.random() * (xRange[1] - xRange[0])) + xRange[0];
        const y = Math.floor(Math.random() * (200 - 70 + 1)) + 70;
        return { x, y };
    }


    /**
     * Check if a generated X position is valid (no collisions with other bottles or coins).
     * @param {number} x - X coordinate to check.
     * @param {number[]} usedX - Array of X coordinates already used for bottles.
     * @param {Array} existingCoins - Array of coin objects with X properties.
     * @returns {boolean} True if position is valid, false otherwise.
     */
    static isPositionValid(x, usedX, existingCoins) {
        const hasBottleDistance = usedX.every(existingX => Math.abs(existingX - x) >= 100);
        const hasCoinDistance = existingCoins.every(coin => Math.abs(coin.x - x) >= 150);
        return hasBottleDistance && hasCoinDistance;
    }
}
