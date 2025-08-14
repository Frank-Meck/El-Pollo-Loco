/**
 * Status bar for collected bottles.
 */
class StatusBarBottles extends StatusBar {
    /**
     * Create a bottle status bar at the top-left corner.
     */
    constructor() {
        super(20, 60);

        this.IMAGES = [
            './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png',
            './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png',
            './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png',
            './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png',
            './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png',
            './img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png'
        ];
    }


    /**
     * Load images and initialize the status bar percentage.
     * @param {number} percentage - Initial percentage of the status bar.
     */
    async loadAndInit(percentage = 100) {
        await this.loadImages(this.IMAGES);
        this.setPercentage(percentage);
    }
}
