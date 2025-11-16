const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building JS Image Grid...\n');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
  console.log('Created dist directory');
}

// Build JavaScript
console.log('Minifying JavaScript...');
try {
  execSync('npm run build:js', { stdio: 'inherit' });
  console.log('✓ JavaScript minified');
} catch (error) {
  console.error('✗ JavaScript minification failed');
  process.exit(1);
}

// Build CSS
console.log('\nMinifying CSS...');
try {
  execSync('npm run build:css', { stdio: 'inherit' });
  console.log('✓ CSS minified');
} catch (error) {
  console.error('✗ CSS minification failed');
  process.exit(1);
}

// Copy example.html to dist
console.log('\nCopying example file...');
try {
  const exampleContent = fs.readFileSync('example.html', 'utf8');
  // Update paths in example to use minified files
  const updatedExample = exampleContent
    .replace('js-image-grid.css', 'js-image-grid.min.css')
    .replace('js-image-grid.js', 'js-image-grid.min.js');
  fs.writeFileSync(path.join(distDir, 'example.html'), updatedExample);
  console.log('✓ Example file copied');
} catch (error) {
  console.error('✗ Failed to copy example file');
  process.exit(1);
}

console.log('\n✓ Build completed successfully!');
console.log('\nOutput files:');
console.log('  - dist/js-image-grid.min.js');
console.log('  - dist/js-image-grid.min.js.map');
console.log('  - dist/js-image-grid.min.css');
console.log('  - dist/js-image-grid.min.css.map');
console.log('  - dist/example.html');
