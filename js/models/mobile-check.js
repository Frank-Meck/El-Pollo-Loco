/**
 * Resizes #game_container and #canvas while maintaining 720x480 ratio.
 */
function resizeGame() {
  const container = document.getElementById('game_container');
  const canvas = document.getElementById('canvas');
  if (!container || !canvas) return;
  const baseW = 720;
  const baseH = 480;
  const ratio = baseW / baseH;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  if (viewportW > 1024) {
    container.style.width = baseW + 'px';
    container.style.height = baseH + 'px';
    canvas.style.width = baseW + 'px';
    canvas.style.height = baseH + 'px';
    return;
  }
  let newW = viewportW;
  let newH = newW / ratio;
  if (newH > viewportH) {
    newH = viewportH;
    newW = newH * ratio;
  }
  container.style.width = newW + 'px';
  container.style.height = newH + 'px';
  canvas.style.width = newW + 'px';
  canvas.style.height = newH + 'px';
}


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
 * Orientation + Resize handler
 */
function handleResizeAndOrientation() {
  checkOrientation();
  resizeGame();
}


// Register events
window.addEventListener('load', handleResizeAndOrientation);
window.addEventListener('resize', handleResizeAndOrientation);
window.addEventListener('orientationchange', handleResizeAndOrientation);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleResizeAndOrientation);
  window.visualViewport.addEventListener('scroll', handleResizeAndOrientation);
}