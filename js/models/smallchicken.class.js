class SmallChicken extends MoveableObject {
    y = 380;
    height = 40;
    width = 60;

    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    offset = { top: 5, left: 15, right: 15, bottom: 5 };


    /**
     * Creates a small chicken at the given X position.
     * @param {number} x - The starting X position.
     */
    constructor(x) {
        super();
        this.x = x;
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 0.5 + Math.random();
        this.animate();
    }


    /**
     * Animates the chicken by moving it left and playing the walking animation loop.
     */
    animate() {
        managedSetInterval(() => {
            this.moveLeft();
            this.playAnimation(this.IMAGES_WALKING);
        }, 200);
    }
}


/**
 * Static method to spawn SmallChickens at fixed intervals.
 * @param {World} world - The world object to add the chickens to.
 * @param {number} startX - The starting X position for spawning.
 */
SmallChicken.spawnAtFixedOffset = function (world, startX) {
    let step = 720;
    let currentX = startX;
    while (currentX < 3900) {
        const amount = SmallChicken.calculateChickenAmount();
        SmallChicken.spawnChickensAtCurrentX(world, currentX, amount);
        currentX += step;
    }
}


/**
 * Calculates a random number of chickens between 1 and 3.
 * @returns {number} Number of chickens to spawn.
 */
SmallChicken.calculateChickenAmount = function () {
    return Math.floor(Math.random() * 3) + 1;  // 1 to 3 chickens
}


/**
 * Spawns a given number of SmallChickens at the current X position.
 * @param {World} world - The world to add the chickens to.
 * @param {number} currentX - The current X position.
 * @param {number} amount - The number of chickens to spawn.
 */
SmallChicken.spawnChickensAtCurrentX = function (world, currentX, amount) {
    for (let i = 0; i < amount; i++) {
        const x = currentX + i * 30; // 30px spacing between chickens
        const chicken = new SmallChicken(x);
        world.level.enemies.push(chicken);
    }
}
