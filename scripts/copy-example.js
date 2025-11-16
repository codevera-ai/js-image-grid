const fs = require('fs');
const path = require('path');

console.log('Copying example file...');

const distDir = path.join(__dirname, '..', 'dist');

try {
  const exampleContent = fs.readFileSync(path.join(__dirname, '..', 'example.html'), 'utf8');
  // Update paths in example to use minified files
  const updatedExample = exampleContent
    .replace('js-image-grid.css', 'js-image-grid.min.css')
    .replace('js-image-grid.js', 'js-image-grid.min.js');
  fs.writeFileSync(path.join(distDir, 'example.html'), updatedExample);
  console.log('✓ Example file copied');
} catch (error) {
  console.error('✗ Failed to copy example file:', error.message);
  process.exit(1);
}
