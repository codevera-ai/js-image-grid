# JS Image Grid

A lightweight, vanilla JavaScript library for overlaying resizable grids on images. Perfect for checking image alignment, testing design systems, or validating layout consistency.

## Features

- Overlay customisable grids on any image
- Drag and resize grid with interactive handles
- Configure columns, rows, line width, and colour per image
- Zero dependencies - pure vanilla JavaScript
- Free for developers to use

## Installation

### Using the minified files (recommended)

Use the production-ready minified files from the `dist` folder:

```html
<link rel="stylesheet" href="dist/js-image-grid.min.css">
<script src="dist/js-image-grid.min.js"></script>
```

### Using the source files

Alternatively, use the unminified source files:

```html
<link rel="stylesheet" href="js-image-grid.css">
<script src="js-image-grid.js"></script>
```

## Usage

### With bundlers (Vite, Webpack, Rollup, etc.)

Install via npm (when published):
```bash
npm install js-image-grid
```

Import and use in your JavaScript:
```javascript
import { ImageGrid, initImageGrids } from 'js-image-grid';
import 'js-image-grid/dist/js-image-grid.min.css';

// Option 1: Auto-initialise all images with data attributes
initImageGrids();

// Option 2: Manually create grids
const image = document.querySelector('#my-image');
const grid = new ImageGrid(image);
```

### Direct browser usage

Add data attributes to your images to configure the grid:

```html
<img
  src="your-image.jpg"
  alt="Your image"
  data-js-image-grid-cols="12"
  data-js-image-grid-rows="8"
  data-js-image-grid-line-width="2"
  data-js-image-grid-color="#ff0000"
>
```

The library will automatically initialise when the page loads.

## Data Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-js-image-grid-cols` | Number of columns | 12 |
| `data-js-image-grid-rows` | Number of rows | 12 |
| `data-js-image-grid-line-width` | Width of grid lines in pixels | 1 |
| `data-js-image-grid-color` | Colour of grid lines (hex, rgb, or named colour) | #ff0000 |
| `data-js-image-grid-maintain-aspect-ratio` | Maintain aspect ratio when resizing (true/false) | false |

## Examples

### Basic grid with defaults
```html
<img src="image.jpg" data-js-image-grid-cols="12">
```

### Custom grid with blue lines
```html
<img
  src="image.jpg"
  data-js-image-grid-cols="16"
  data-js-image-grid-rows="10"
  data-js-image-grid-color="#0000ff"
>
```

### Thick grid lines
```html
<img
  src="image.jpg"
  data-js-image-grid-cols="8"
  data-js-image-grid-line-width="3"
  data-js-image-grid-color="#00ff00"
>
```

### Grid with aspect ratio maintained
```html
<img
  src="image.jpg"
  data-js-image-grid-cols="12"
  data-js-image-grid-rows="8"
  data-js-image-grid-maintain-aspect-ratio="true"
>
```

## Interactive Controls

Once the grid is loaded:

- **Drag** the grid overlay to reposition it
- **Resize** using the eight handles (corners and edges)
- The grid maintains its column and row count whilst resizing

## Manual Initialisation

If you need to initialise grids manually:

```javascript
// Initialise all images with grid data attributes
const instances = window.initImageGrids();

// Or create a grid on a specific image
const image = document.querySelector('#my-image');
const grid = new ImageGrid(image);
```

## Development

### Building from source

1. Install dependencies:
```bash
npm install
```

2. Run the build:
```bash
npm run build
```

This will create multiple build formats in the `dist` folder:
- `dist/js-image-grid.esm.js` - ES module for bundlers (Vite, Webpack, etc.)
- `dist/js-image-grid.min.js` - Minified IIFE for direct browser usage
- `dist/js-image-grid.js` - Unminified IIFE for development
- `dist/js-image-grid.min.css` - Minified CSS with source map
- `dist/example.html` - Example file using minified assets

### Build scripts

- `npm run build` - Build both JavaScript and CSS
- `npm run build:js` - Build JavaScript only
- `npm run build:css` - Build CSS only

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- Canvas API
- CSS transforms

## Licence

Free for developers to use.

## Example

See `example.html` for a working demonstration.
