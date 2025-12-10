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
    applyFixedDesktopSize(container, canvas);
    return;
  }

  const { width, height } = calculateMobileSize(viewportW, viewportH, ratio);
  applyGameSize(container, canvas, width, height);
}


/**
 * Applies fixed size for large screens.
 */
function applyFixedDesktopSize(container, canvas) {
  container.style.width = '720px';
  container.style.height = '480px';
  canvas.style.width = '720px';
  canvas.style.height = '480px';
}


/**
 * Calculates scaled size for mobile viewports.
 */
function calculateMobileSize(viewportW, viewportH, ratio) {
  let width = viewportW;
  let height = width / ratio;

  if (height > viewportH) {
    height = viewportH;
    width = height * ratio;
  }

  return { width, height };
}


/**
 * Applies size to container and canvas.
 */
function applyGameSize(container, canvas, width, height) {
  container.style.width = width + 'px';
  container.style.height = height + 'px';
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
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

  const viewportH = window.visualViewport?.height || window.innerHeight;
  const viewportW = window.visualViewport?.width || window.innerWidth;

  const isPortrait = viewportH > viewportW;
  const mobile = isMobileViewport();

  if (mobile && isPortrait) {
    showRotateMessage(rotateMessage, gameContainer);
  } else {
    hideRotateMessage(rotateMessage, gameContainer);
  }
}


/**
 * Shows rotate hint and disables game visually (without killing events).
 */
function showRotateMessage(message, container) {
  message.style.display = 'flex';
  container.style.visibility = 'hidden';  
}


/**
 * Hides rotate hint and re-enables game.
 */
function hideRotateMessage(message, container) {
  message.style.display = 'none';
  container.style.visibility = 'visible';
}


/**
 * Handles resize and orientation events.
 */
function handleResizeAndOrientation() {
  checkOrientation();
  resizeGame();
}



window.addEventListener('load', handleResizeAndOrientation);
window.addEventListener('resize', handleResizeAndOrientation);
window.addEventListener('orientationchange', handleResizeAndOrientation);

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleResizeAndOrientation);
  window.visualViewport.addEventListener('scroll', handleResizeAndOrientation);
}
