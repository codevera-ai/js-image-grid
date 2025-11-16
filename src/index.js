/**
 * JS Image Grid
 * A vanilla JavaScript library for overlaying resizable grids on images
 * Free for developers to use
 */

// Global grid manager to track multiple grids per image
const gridManagers = new WeakMap();
let nextGridId = 1;

export class ImageGrid {
  constructor(image, options = {}) {
    this.image = image;
    this.id = options.id || `grid-${nextGridId++}`;
    this.name = options.name || `Grid ${this.id.replace('grid-', '')}`;
    this.cols = options.cols || parseInt(image.dataset.jsImageGridCols) || 12;
    this.rows = options.rows || parseInt(image.dataset.jsImageGridRows) || 12;
    this.lineWidth = options.lineWidth || parseInt(image.dataset.jsImageGridLineWidth) || 1;
    this.color = options.color || image.dataset.jsImageGridColor || '#ff0000';
    this.maintainAspectRatio = options.maintainAspectRatio !== undefined
      ? options.maintainAspectRatio
      : image.dataset.jsImageGridMaintainAspectRatio === 'true';

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
    this.isActive = false;
    this.isVisible = true;

    this.init();
    this.registerWithManager();
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

  registerWithManager() {
    if (!gridManagers.has(this.image)) {
      gridManagers.set(this.image, new GridManager(this.image));
    }
    const manager = gridManagers.get(this.image);
    manager.addGrid(this);
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
    this.overlay.dataset.gridId = this.id;
    this.image.parentElement.appendChild(this.overlay);

    // Set initial size to match image
    this.updateOverlaySize();
  }

  updateOverlaySize() {
    const rect = this.image.getBoundingClientRect();
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

    const rect = this.overlay.getBoundingClientRect();
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

  setActive(active) {
    this.isActive = active;
    if (active) {
      this.overlay.classList.add('js-image-grid-active');
      this.show();
    } else {
      this.overlay.classList.remove('js-image-grid-active');
      this.hide();
    }
  }

  show() {
    this.isVisible = true;
    this.overlay.style.display = '';
  }

  hide() {
    this.isVisible = false;
    this.overlay.style.display = 'none';
  }

  destroy() {
    if (gridManagers.has(this.image)) {
      const manager = gridManagers.get(this.image);
      manager.removeGrid(this.id);
    }
    if (this.overlay && this.overlay.parentElement) {
      this.overlay.remove();
    }
  }
}

// Grid Manager class to handle multiple grids per image
class GridManager {
  constructor(image) {
    this.image = image;
    this.grids = [];
    this.activeGrid = null;
    this.picker = null;
  }

  addGrid(grid) {
    this.grids.push(grid);

    // Set first grid as active
    if (this.grids.length === 1) {
      this.setActiveGrid(grid.id);
    } else {
      // Hide new grids by default when there are multiple
      grid.hide();
    }

    // Show picker when we have 2+ grids
    this.updatePicker();
  }

  removeGrid(gridId) {
    const index = this.grids.findIndex(g => g.id === gridId);
    if (index !== -1) {
      this.grids.splice(index, 1);
    }

    // If active grid was removed, activate first grid
    if (this.activeGrid?.id === gridId && this.grids.length > 0) {
      this.setActiveGrid(this.grids[0].id);
    }

    this.updatePicker();
  }

  setActiveGrid(gridId) {
    // Hide all grids first
    this.grids.forEach(g => {
      g.setActive(false);
    });

    // Find and activate new grid
    const grid = this.grids.find(g => g.id === gridId);
    if (grid) {
      this.activeGrid = grid;
      grid.setActive(true);

      // Update picker UI
      this.updatePickerSelection();
    }
  }

  addNewGrid() {
    // Create varied grid configurations for testing
    const gridConfigs = [
      { cols: 12, rows: 12, lineWidth: 1, color: '#ff0000', name: 'Grid 1 (12×12 Red)' },
      { cols: 16, rows: 10, lineWidth: 1, color: '#0000ff', name: 'Grid 2 (16×10 Blue)' },
      { cols: 8, rows: 8, lineWidth: 3, color: '#00ff00', name: 'Grid 3 (8×8 Green Thick)' },
      { cols: 20, rows: 15, lineWidth: 1, color: '#ff6600', name: 'Grid 4 (20×15 Orange)' },
      { cols: 10, rows: 10, lineWidth: 2, color: '#ff00ff', name: 'Grid 5 (10×10 Magenta)' },
      { cols: 24, rows: 18, lineWidth: 1, color: '#00ffff', name: 'Grid 6 (24×18 Cyan)' },
    ];

    // Get the next config based on current grid count
    const configIndex = this.grids.length % gridConfigs.length;
    const config = gridConfigs[configIndex];

    const newGrid = new ImageGrid(this.image, {
      ...config,
      maintainAspectRatio: false
    });
    return newGrid;
  }

  updatePicker() {
    if (this.grids.length < 2) {
      this.hidePicker();
    } else {
      this.showPicker();
    }
  }

  showPicker() {
    if (!this.picker) {
      this.createPicker();
    }
    this.renderPicker();
    this.picker.style.display = '';
  }

  hidePicker() {
    if (this.picker) {
      this.picker.style.display = 'none';
    }
  }

  createPicker() {
    const wrapper = this.image.parentElement;

    // Create container for dropdown
    this.picker = document.createElement('div');
    this.picker.className = 'js-image-grid-dropdown-container';

    // Insert after the wrapper
    wrapper.parentNode.insertBefore(this.picker, wrapper.nextSibling);
  }

  renderPicker() {
    if (!this.picker) return;

    this.picker.innerHTML = '';

    // Create dropdown select
    const select = document.createElement('select');
    select.className = 'js-image-grid-dropdown';

    this.grids.forEach((grid, index) => {
      const option = document.createElement('option');
      option.value = grid.id;
      option.textContent = grid.name;
      if (grid.isActive) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      this.setActiveGrid(e.target.value);
    });

    this.picker.appendChild(select);
  }

  updatePickerSelection() {
    if (!this.picker) return;

    const select = this.picker.querySelector('.js-image-grid-dropdown');
    if (select && this.activeGrid) {
      select.value = this.activeGrid.id;
    }
  }
}

// Helper function to get grid manager for an image
export function getGridManager(image) {
  return gridManagers.get(image);
}

// Helper function to initialize grids on images with data attributes
export function initImageGrids() {
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
