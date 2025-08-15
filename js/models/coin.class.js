class Coin extends MoveableObject {
    width = 100;
    height = 100;
    y;

    offset = { top: 35, left: 35, right: 35, bottom: 35 };

    static numberOfCoins = 16; 

    
    /**
     * Creates a new Coin at given coordinates.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     */
    constructor(x, y) {
        super().loadImage('./img/8_coin/coin_5.png');
        this.x = x;
        this.y = y;
    }


    /**
     * Generates an array of coins within specified ranges.
     * @param {number} count - Number of coins to generate.
     * @param {number[]} xRange - Min and max X coordinates.
     * @param {number[]} yRange - Min and max Y coordinates.
     * @returns {Coin[]} - Array of Coin instances.
     */
    static generateCoins(count = Coin.numberOfCoins, xRange = [400, 4100], yRange = [120, 380]) {
        const coins = [];
        const usedX = [];
        while (coins.length < count) {
            let x = Math.floor(Math.random() * (xRange[1] - xRange[0])) + xRange[0];
            let y = Math.floor(Math.random() * (yRange[1] - yRange[0])) + yRange[0];
            if (usedX.every(existingX => Math.abs(existingX - x) >= 100)) {
                coins.push(new Coin(x, y));
                usedX.push(x);
            }
        }
        return coins;
    }
}
