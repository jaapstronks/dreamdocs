/**
 * Build Client
 * Bundles client JavaScript with esbuild.
 */

import * as esbuild from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const isDev = process.argv.includes('--dev');
const isWatch = process.argv.includes('--watch');

async function build() {
  const outdir = join(ROOT, 'client/dist');

  // Clean output directory
  await rm(outdir, { recursive: true, force: true });
  await mkdir(outdir, { recursive: true });

  // Copy Shoelace assets (icons, etc.)
  const shoelaceAssets = join(ROOT, 'node_modules/@shoelace-style/shoelace/dist/assets');
  const shoelaceAssetsOut = join(outdir, 'shoelace/assets');
  await mkdir(shoelaceAssetsOut, { recursive: true });
  await cp(shoelaceAssets, shoelaceAssetsOut, { recursive: true });

  // Copy Shoelace themes
  const shoelaceThemes = join(ROOT, 'node_modules/@shoelace-style/shoelace/dist/themes');
  const shoelaceThemesOut = join(outdir, 'shoelace/themes');
  await mkdir(shoelaceThemesOut, { recursive: true });
  await cp(shoelaceThemes, shoelaceThemesOut, { recursive: true });

  console.log('Copied Shoelace assets and themes');

  // Bundle configuration
  const config = {
    entryPoints: [join(ROOT, 'client/app.js')],
    bundle: true,
    format: 'esm',
    outdir,
    outbase: join(ROOT, 'client'),
    minify: !isDev,
    sourcemap: isDev,
    splitting: true,
    target: ['es2020'],
    // Handle various asset types
    loader: {
      '.woff': 'file',
      '.woff2': 'file',
      '.ttf': 'file',
      '.svg': 'file',
      '.png': 'file',
      '.jpg': 'file',
    },
    // Define for browser environment
    define: {
      'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
    },
  };

  if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    const result = await esbuild.build(config);
    console.log('Client build complete');
    if (result.errors.length > 0) {
      console.error('Build errors:', result.errors);
      process.exit(1);
    }
  }
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
