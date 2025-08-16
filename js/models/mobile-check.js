/**
 * Resizes the canvas while maintaining 720x480 ratio.
 */
function resizeCanvas() {
  const canvas = document.getElementById('canvas');
  const ratio = 720 / 480;
  if (window.innerWidth <= 1024) {
    canvas.style.width = '100vw';
    canvas.style.height = `${window.innerWidth / ratio}px`;
  } else {
    canvas.style.width = '720px';
    canvas.style.height = '480px';
  }
}


/**
 * Registers load, resize, and orientation events.
 */
function registerEvents() {
  window.addEventListener('load', () => {
    checkOrientation();
    resizeCanvas();
  });
  window.addEventListener('resize', () => {
    checkOrientation();
    resizeCanvas();
  });
  window.addEventListener('orientationchange', () => {
    checkOrientation();
    resizeCanvas();
  });
}

registerEvents();


/**
 * Returns true if the viewport width is considered mobile/tablet.
 */
function isMobileViewport() {
  return window.matchMedia('(max-width: 1024px)').matches;
}


/**
 * Checks device orientation and toggles rotate message on mobile.
 */
function checkOrientation() {
  const rotateMessage = document.getElementById('rotate_message');
  const gameContainer = document.getElementById('game_container');
  const viewportH = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  const viewportW = (window.visualViewport && window.visualViewport.width) || window.innerWidth;
  const isPortrait = viewportH > viewportW;
  const mobile = isMobileViewport();
  if (mobile && isPortrait) {
    rotateMessage.style.display = 'flex';
    gameContainer.style.display = 'none';
  } else {
    rotateMessage.style.display = 'none';
    gameContainer.style.display = 'block';
  }
}


/**
 * Scales #game_container and #canvas to fit viewport, maintaining 720x480 ratio.
 */
function fitGameToViewport() {
  const container = document.getElementById('game_container');
  const canvas = document.getElementById('canvas');
  if (!container || !canvas) return;

  const baseW = 720;
  const baseH = 480;
  const viewportH = window.innerHeight;
  const viewportW = window.innerWidth;

  if (viewportW > 1024) {
    container.style.width = baseW + 'px';
    container.style.height = baseH + 'px';
    canvas.style.width = baseW + 'px';
    canvas.style.height = baseH + 'px';
  } else {
    container.style.width = viewportW + 'px';
    container.style.height = viewportH + 'px';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }
}


function handleResizeAndOrientation() {
  checkOrientation();
  fitGameToViewport();
}


window.addEventListener('load', handleResizeAndOrientation);
window.addEventListener('resize', handleResizeAndOrientation);
window.addEventListener('orientationchange', handleResizeAndOrientation);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleResizeAndOrientation);
  window.visualViewport.addEventListener('scroll', handleResizeAndOrientation);
}