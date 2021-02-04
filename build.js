#!/usr/bin/env node

const { build } = require('esbuild');

build({
  entryPoints: ['src/index.tsx'],
  outfile: 'dist/index.js',
  bundle: true,
  sourcemap: true,
  external: ['react'],
  target: 'es2016',
  format: 'cjs',
});
