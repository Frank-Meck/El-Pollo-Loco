class StartScreen {
  /**
   * Creates the start screen controller.
   * @param {HTMLCanvasElement} canvas - The canvas element.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
   * @param {Function} onStart - Callback to execute when starting.
   */
  constructor(canvas, ctx, onStart) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onStartCallback = onStart;
    this.buttons = [];
    this.hoveredButton = null;
    this.fullscreenButtonRect = {};
    this.registerUnifiedEventHandlers();
  }


  /**
   * Draws the start screen background and buttons.
   */
  draw() {
    const background = new Image();
    background.src = './img/9_intro_outro_screens/start/startscreen_2.png';
    background.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);
      this.drawButtons();
      this.drawFullscreenButton();
    };
  }


  /**
   * Toggles fullscreen mode on the canvas.
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.canvas.requestFullscreen().catch(err => {
        alert(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setTimeout(() => this.draw(), 200);
  }


  /**
   * Shows or hides HTML screens based on type.
   * @param {string} type - The screen type ('start', 'controls', 'info').
   */
  showHTMLScreen(type) {
    document.querySelectorAll('.info_screen, .canvas_container, #start_screen')
      .forEach(el => el.style.display = 'none');
    if (type === 'start') {
      document.getElementById('start_screen').style.display = 'block';
      if (this.onStartCallback) this.onStartCallback();
    } else if (type === 'controls') {
      document.getElementById('controls_screen').style.display = 'block';
    } else if (type === 'info') {
      document.getElementById('info_screen').style.display = 'block';
    }
  }


  /**
   * Registers unified click and mousemove handlers on the canvas.
   */
  registerUnifiedEventHandlers() {
    this.canvas.onclick = (event) => this.handleCanvasClick(event);
    this.canvas.addEventListener('mousemove', (event) => this.handleCanvasMouseMove(event));
  }


  /**
   * Handles canvas click events.
   * @param {MouseEvent} event
   */
  handleCanvasClick(event) {
    const { x, y } = this.calculateCanvasCoordinates(event);
    if (this.isInsideRect(x, y, this.fullscreenButtonRect)) {
      this.toggleFullscreen();
      return;
    }
    for (let btn of this.buttons) {
      if (this.isInsideRect(x, y, btn)) {
        btn.action();
        return;
      }
    }
  }


  /**
   * Handles canvas mousemove events for button hover effect.
   * @param {MouseEvent} event
   */
  handleCanvasMouseMove(event) {
    const { x, y } = this.calculateCanvasCoordinates(event);
    let hovered = null;
    for (let btn of this.buttons) {
      if (this.isInsideRect(x, y, btn)) {
        hovered = btn;
        break;
      }
    }
    if (this.hoveredButton !== hovered) {
      this.hoveredButton = hovered;
      this.draw();
    }
  }


  /**
   * Converts mouse event coordinates to canvas coordinates.
   * @param {MouseEvent} event
   * @returns {{x: number, y: number}} Canvas coordinates.
   */
  calculateCanvasCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }


  /**
   * Checks if a point (x, y) lies inside a rectangle.
   * @param {number} x
   * @param {number} y
   * @param {{x: number, y: number, width: number, height: number}} rect
   * @returns {boolean}
   */
  isInsideRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }
}
