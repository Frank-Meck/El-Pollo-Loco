/**
 * Returns the file path for a given layer based on index and layer number.
 * @param {number} index - The index to determine the file number.
 * @param {number} layerNumber - The layer number (1, 2, or 3).
 * @returns {string} The file path for the specified layer.
 */
function getLayerPath(index, layerNumber) {
  const basePath = './img/5_background/layers/';
  const layerFolders = {
    1: '1_first_layer/',
    2: '2_second_layer/',
    3: '3_third_layer/'
  };

  const fileNumber = index % 2 === 0 ? '2.png' : '1.png';
  return basePath + layerFolders[layerNumber] + fileNumber;
}


/**
 * Creates an array of background objects positioned at specified locations.
 * @returns {BackgroundObject[]} Array of background objects.
 */
function createBackgroundObjects() {
  const positions = [-720, 0, 720, 1440, 2160, 2880, 3600, 4320];
  const backgroundObjects = [];

  for (let i = 0; i < positions.length; i++) {
    let x = positions[i];
    backgroundObjects.push(new BackgroundObject('./img/5_background/layers/air.png', x));
    backgroundObjects.push(new BackgroundObject(getLayerPath(i, 3), x));
    backgroundObjects.push(new BackgroundObject(getLayerPath(i, 2), x));
    backgroundObjects.push(new BackgroundObject(getLayerPath(i, 1), x));
  }

  return backgroundObjects;
}


/**
 * Creates an array of clouds positioned at specified locations.
 * @returns {Cloud[]} Array of cloud objects.
 */
function createClouds() {
  const positions = [-720, 0, 720, 1440, 2160, 2880, 3600, 4320];
  const clouds = [];

  for (let i = 0; i < positions.length; i++) {
    const cloudImage = i % 2 === 0
      ? './img/5_background/layers/4_clouds/1.png'
      : './img/5_background/layers/4_clouds/2.png';

    clouds.push(new Cloud(cloudImage, positions[i]));
  }

  return clouds;
}


/**
 * Creates the first level instance with predefined enemies, clouds, backgrounds, coins and bottles.
 */
const level1 = new Level(
  [
    new Endboss()
  ],
  createClouds(),
  createBackgroundObjects(),
  Coin.generateCoins(),
  Bottle.generateBottles()
);
