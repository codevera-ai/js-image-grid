import terser from '@rollup/plugin-terser';

export default [
  // ES Module build (unminified for bundlers)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/js-image-grid.esm.js',
      format: 'es',
      sourcemap: true
    }
  },
  // UMD build (minified for browsers)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/js-image-grid.min.js',
      format: 'iife',
      name: 'JSImageGrid',
      sourcemap: true,
      globals: {}
    },
    plugins: [
      terser({
        compress: {
          drop_console: false
        },
        mangle: true
      })
    ]
  },
  // UMD build (unminified for development)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/js-image-grid.js',
      format: 'iife',
      name: 'JSImageGrid',
      sourcemap: true,
      globals: {}
    }
  }
];
