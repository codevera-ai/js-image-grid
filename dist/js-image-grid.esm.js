/**
 * JS Image Grid
 * A vanilla JavaScript library for overlaying resizable grids on images
 * Free for developers to use
 */

class ImageGrid {
  constructor(image) {
    this.image = image;
    this.cols = parseInt(image.dataset.jsImageGridCols) || 12;
    this.rows = parseInt(image.dataset.jsImageGridRows) || 12;
    this.lineWidth = parseInt(image.dataset.jsImageGridLineWidth) || 1;
    this.color = image.dataset.jsImageGridColor || '#ff0000';
    this.maintainAspectRatio = image.dataset.jsImageGridMaintainAspectRatio === 'true';

    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.isDragging = false;
    this.isResizing = false;
    this.currentHandle = null;
    this.startX = 0;
    this.startY = 0;
    this.gridWidth = 0;
    this.gridHeight = 0;
    this.gridX = 0;
    this.gridY = 0;
    this.aspectRatio = 0;

    this.init();
  }

  init() {
    // Create overlay container
    this.createOverlay();

    // Create canvas for grid
    this.createCanvas();

    // Create resize handles
    this.createHandles();

    // Draw initial grid
    this.drawGrid();

    // Add event listeners
    this.attachEvents();
  }

  createOverlay() {
    // Wrap image if not already wrapped
    if (!this.image.parentElement.classList.contains('js-image-grid-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'js-image-grid-wrapper';
      this.image.parentNode.insertBefore(wrapper, this.image);
      wrapper.appendChild(this.image);
    }

    this.overlay = document.createElement('div');
    this.overlay.className = 'js-image-grid-overlay';
    this.image.parentElement.appendChild(this.overlay);

    // Set initial size to match image
    this.updateOverlaySize();
  }

  updateOverlaySize() {
    this.image.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();

    this.gridWidth = imageRect.width;
    this.gridHeight = imageRect.height;
    this.gridX = 0;
    this.gridY = 0;

    // Store aspect ratio for maintain aspect ratio feature
    this.aspectRatio = this.gridWidth / this.gridHeight;

    this.overlay.style.width = this.gridWidth + 'px';
    this.overlay.style.height = this.gridHeight + 'px';
    this.overlay.style.left = '0px';
    this.overlay.style.top = '0px';
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'js-image-grid-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.overlay.appendChild(this.canvas);

    this.updateCanvasSize();
  }

  updateCanvasSize() {
    const rect = this.overlay.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.drawGrid();
  }

  createHandles() {
    const positions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];

    positions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `js-image-grid-handle js-image-grid-handle-${pos}`;
      handle.dataset.position = pos;
      this.overlay.appendChild(handle);
    });
  }

  drawGrid() {
    if (!this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Set grid style
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;

    // Draw vertical lines
    const colWidth = width / this.cols;
    for (let i = 0; i <= this.cols; i++) {
      const x = i * colWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    const rowHeight = height / this.rows;
    for (let i = 0; i <= this.rows; i++) {
      const y = i * rowHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  attachEvents() {
    // Handle dragging
    this.overlay.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Handle window resize
    window.addEventListener('resize', () => {
      this.updateOverlaySize();
      this.updateCanvasSize();
    });

    // Prevent default drag behavior
    this.overlay.addEventListener('dragstart', (e) => e.preventDefault());
  }

  onMouseDown(e) {
    const target = e.target;

    if (target.classList.contains('js-image-grid-handle')) {
      // Resizing
      this.isResizing = true;
      this.currentHandle = target.dataset.position;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.overlay.classList.add('js-image-grid-resizing');
    } else if (target === this.overlay || target === this.canvas) {
      // Dragging
      this.isDragging = true;
      this.startX = e.clientX - this.gridX;
      this.startY = e.clientY - this.gridY;
      this.overlay.classList.add('js-image-grid-dragging');
    }

    e.preventDefault();
  }

  onMouseMove(e) {
    if (this.isResizing) {
      this.handleResize(e);
    } else if (this.isDragging) {
      this.handleDrag(e);
    }
  }

  onMouseUp(e) {
    this.isDragging = false;
    this.isResizing = false;
    this.currentHandle = null;
    this.overlay.classList.remove('js-image-grid-dragging', 'js-image-grid-resizing');
  }

  handleDrag(e) {
    let newX = e.clientX - this.startX;
    let newY = e.clientY - this.startY;

    // Get image boundaries
    const imageRect = this.image.getBoundingClientRect();
    const maxX = imageRect.width - this.gridWidth;
    const maxY = imageRect.height - this.gridHeight;

    // Constrain position within image boundaries
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    this.gridX = newX;
    this.gridY = newY;

    this.overlay.style.left = newX + 'px';
    this.overlay.style.top = newY + 'px';
  }

  handleResize(e) {
    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    // Get image boundaries
    const imageRect = this.image.getBoundingClientRect();
    const maxWidth = imageRect.width;
    const maxHeight = imageRect.height;

    this.overlay.getBoundingClientRect();
    let newWidth = this.gridWidth;
    let newHeight = this.gridHeight;
    let newX = this.gridX;
    let newY = this.gridY;

    switch (this.currentHandle) {
      case 'se':
        newWidth = this.gridWidth + deltaX;
        newHeight = this.gridHeight + deltaY;
        break;
      case 'sw':
        newWidth = this.gridWidth - deltaX;
        newHeight = this.gridHeight + deltaY;
        newX = this.gridX + deltaX;
        break;
      case 'ne':
        newWidth = this.gridWidth + deltaX;
        newHeight = this.gridHeight - deltaY;
        newY = this.gridY + deltaY;
        break;
      case 'nw':
        newWidth = this.gridWidth - deltaX;
        newHeight = this.gridHeight - deltaY;
        newX = this.gridX + deltaX;
        newY = this.gridY + deltaY;
        break;
      case 'n':
        newHeight = this.gridHeight - deltaY;
        newY = this.gridY + deltaY;
        break;
      case 's':
        newHeight = this.gridHeight + deltaY;
        break;
      case 'e':
        newWidth = this.gridWidth + deltaX;
        break;
      case 'w':
        newWidth = this.gridWidth - deltaX;
        newX = this.gridX + deltaX;
        break;
    }

    // Enforce minimum size
    if (newWidth < 50) newWidth = 50;
    if (newHeight < 50) newHeight = 50;

    // Maintain aspect ratio if enabled
    if (this.maintainAspectRatio && this.aspectRatio > 0) {
      // Determine which dimension changed more
      const widthChanged = Math.abs(newWidth - this.gridWidth);
      const heightChanged = Math.abs(newHeight - this.gridHeight);

      if (widthChanged > heightChanged) {
        // Width changed more, adjust height
        newHeight = newWidth / this.aspectRatio;
      } else {
        // Height changed more, adjust width
        newWidth = newHeight * this.aspectRatio;
      }

      // Adjust position for handles that affect X/Y
      if (this.currentHandle.includes('w')) {
        newX = this.gridX + this.gridWidth - newWidth;
      }
      if (this.currentHandle.includes('n')) {
        newY = this.gridY + this.gridHeight - newHeight;
      }
    }

    // Constrain to image boundaries
    // Constrain X position (left edge can't be less than 0)
    if (newX < 0) {
      newWidth = newWidth + newX; // Reduce width by the amount X is negative
      newX = 0;
    }

    // Constrain Y position (top edge can't be less than 0)
    if (newY < 0) {
      newHeight = newHeight + newY; // Reduce height by the amount Y is negative
      newY = 0;
    }

    // Constrain width (right edge can't exceed image width)
    if (newX + newWidth > maxWidth) {
      newWidth = maxWidth - newX;
    }

    // Constrain height (bottom edge can't exceed image height)
    if (newY + newHeight > maxHeight) {
      newHeight = maxHeight - newY;
    }

    // Enforce minimum size again after constraints
    if (newWidth < 50) newWidth = 50;
    if (newHeight < 50) newHeight = 50;

    this.gridWidth = newWidth;
    this.gridHeight = newHeight;
    this.gridX = newX;
    this.gridY = newY;
    this.startX = e.clientX;
    this.startY = e.clientY;

    this.overlay.style.width = newWidth + 'px';
    this.overlay.style.height = newHeight + 'px';
    this.overlay.style.left = newX + 'px';
    this.overlay.style.top = newY + 'px';

    this.updateCanvasSize();
  }

  destroy() {
    if (this.overlay && this.overlay.parentElement) {
      this.overlay.remove();
    }
  }
}

// Helper function to initialize grids on images with data attributes
function initImageGrids() {
  const images = document.querySelectorAll('img[data-js-image-grid-cols], img[data-js-image-grid-rows]');
  const instances = [];

  images.forEach(image => {
    // Wait for image to load
    if (image.complete) {
      instances.push(new ImageGrid(image));
    } else {
      image.addEventListener('load', () => {
        instances.push(new ImageGrid(image));
      });
    }
  });

  return instances;
}

// Auto-initialize if in browser environment and not using a bundler
if (typeof window !== 'undefined' && !window.__JS_IMAGE_GRID_NO_AUTO_INIT__) {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageGrids);
  } else {
    initImageGrids();
  }
}

export { ImageGrid, initImageGrids };
//# sourceMappingURL=js-image-grid.esm.js.map
