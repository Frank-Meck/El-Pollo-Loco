class Chicken extends MoveableObject {
    y = 370;
    height = 60;
    width = 80;

    IMAGES_WALKING = [
        './img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        './img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
    ];

    offset = { top: 0, left: 5, right: 10, bottom: 10 };


    /**
     * Creates a Chicken object at a given X position.
     * @param {number} x - Initial X position.
     */
    constructor(x) {
        super().loadImage("./img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.x = x;
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 1.3 + Math.random() * 0.25;
        this.animate();
    }


    /**
     * Animates the chicken by moving left and cycling through walking images.
     */
    animate() {
        managedSetInterval(() => {
            this.moveLeft();
            this.playAnimation(this.IMAGES_WALKING);
        }, 200);
    }
}


/**
 * Spawns chickens at fixed offsets along the level.
 * @param {Object} world - The game world containing the level.
 * @param {number} startX - X position to start spawning from.
 */
Chicken.spawnAtFixedOffset = function(world, startX) {
    let offsetX = startX;
    while (offsetX <= 5000) {
        let amount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < amount; i++) {
            let chicken = new Chicken(offsetX + i * 30);
            world.level.enemies.push(chicken);
        }
        offsetX += 720;
    }
};