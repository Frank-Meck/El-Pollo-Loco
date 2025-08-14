/**
 * Status bar for collected coins.
 */
class StatusBarCoins extends StatusBar {
    /**
     * Create a coin status bar at the top-left corner.
     */
    constructor() {
        super(20, 30);

        this.IMAGES = [
            './img/7_statusbars/1_statusbar/1_statusbar_coin/lightblue/0.png',
            './img/7_statusbars/1_statusbar/1_statusbar_coin/lightblue/20.png',
            './img/7_statusbars/1_statusbar/1_statusbar_coin/lightblue/40.png',
            './img/7_statusbars/1_statusbar/1_statusbar_coin/lightblue/60.png',
            './img/7_statusbars/1_statusbar/1_statusbar_coin/lightblue/80.png',
            './img/7_statusbars/1_statusbar/1_statusbar_coin/lightblue/100.png',
        ];
    }


    /**
     * Load images and initialize the status bar percentage.
     * @param {number} percentage - Initial percentage of the status bar.
     */
    async loadAndInit(percentage = 0) {
        await this.loadImages(this.IMAGES);
        this.setPercentage(percentage);
    }
}
