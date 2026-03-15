#!/usr/bin/env node
/**
 * Build script for the AI assistant plugin.
 *
 * npm dependencies (marked, etc.) are bundled into a single self-contained
 * ESM file that works with HyperRead's blob-URL dynamic import loader.
 *
 * Run: node build.js
 * Dev:  node build.js --watch
 */

const esbuild = require('esbuild')
const path = require('path')

const isWatch = process.argv.includes('--watch')

// Resolve npm packages from the parent project's node_modules.
// Plugin developers can add their own node_modules too — esbuild
// will find them via the standard Node resolution algorithm.
const PARENT_NODE_MODULES = path.resolve(__dirname, '../../node_modules')

const config = {
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'esm',
  outfile: 'main.js',
  nodePaths: [PARENT_NODE_MODULES], // resolve npm packages from parent project
  minify: false, // Keep readable for demo purposes
  banner: {
    js: '// AI Assistant Plugin v2.0 — built with esbuild + marked\n// Demonstrates npm dependency bundling in HyperRead plugins\n',
  },
}

if (isWatch) {
  esbuild.context(config).then(ctx => {
    ctx.watch()
    console.log('[ai-assistant] watching for changes...')
  })
} else {
  esbuild.build(config).then(() => {
    console.log('[ai-assistant] built successfully → main.js')
  }).catch(e => { console.error(e); process.exit(1) })
}
