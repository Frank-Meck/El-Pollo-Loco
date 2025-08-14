class DrawableObject {
    x = 120;
    y = 280;
    img;
    height = 150;
    width = 100;
    imageCache = {};  // Stores loaded images
    currentImage = 0;


    /**
     * Loads a single image from the given path.
     * @param {string} path - Path to the image file.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }


    /**
     * Loads multiple images and caches them.
     * @param {string[]} arr - Array of image paths.
     * @returns {Promise} Resolves when all images are loaded.
     */
    loadImages(arr) {
        let promises = arr.map(path => {
            return new Promise((resolve) => {
                let img = new Image();
                img.onload = () => resolve();
                img.src = path;
                this.imageCache[path] = img;
            });
        });

        return Promise.all(promises);
    }


    /**
     * Draws the object on the given canvas context.
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    draw(ctx) {
        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }


    /**
     * Draws a green frame around certain object types (debug).
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    drawFrame(ctx) {
        if (false){
            if (this instanceof Character || this instanceof Chicken || this instanceof Endboss || this instanceof Coin || this instanceof Bottle || this instanceof SmallChicken) {
                ctx.beginPath();
                ctx.lineWidth = "4";
                ctx.strokeStyle = "green"; 
                ctx.rect(this.x, this.y, this.width, this.height);
                ctx.stroke();
            }
        }
    }


    /**
     * Draws a red offset frame around certain object types (debug).
     * @param {CanvasRenderingContext2D} ctx - Canvas context.
     */
    drawOffsetFrame(ctx) {
        if (false){
            if (this instanceof Character || this instanceof Chicken || this instanceof Endboss || this instanceof Coin || this instanceof Bottle || this instanceof SmallChicken) {
                ctx.beginPath();
                ctx.lineWidth = "4";
                ctx.strokeStyle = "red";
                ctx.rect(this.x + this.offset.left, this.y + this.offset.top, this.width - this.offset.left - this.offset.right, this.height - this.offset.top - this.offset.bottom);
                ctx.stroke();
            }
        }
    }
}
