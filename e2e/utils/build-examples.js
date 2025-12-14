const path = require('node:path');
const fs = require('node:fs/promises');

const esbuild = require('esbuild');

const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.join(projectRoot, 'e2e', '.dist');

async function buildE2EExamples() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  const entryPoints = {
    'window-basic': path.join(projectRoot, 'examples', 'controls', 'window-basic', 'client.js'),
    'window-binding-counter': path.join(projectRoot, 'examples', 'controls', 'window-binding-counter', 'client.js'),
    'window-binding-sse': path.join(projectRoot, 'examples', 'controls', 'window-binding-sse', 'client.js'),
  };

  await esbuild.build({
    entryPoints,
    outdir: distDir,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: 'inline',
    define: {
      'process.env.NODE_ENV': '"test"',
    },
  });

  return { distDir, entryPoints };
}

module.exports = { buildE2EExamples, distDir };

