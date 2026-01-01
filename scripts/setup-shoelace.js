/**
 * Setup Shoelace
 * Copies Shoelace files to the vendor directory.
 */

import { cp, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

async function setup() {
  const shoelacePath = join(ROOT, 'node_modules/@shoelace-style/shoelace/dist');
  const vendorPath = join(ROOT, 'client/vendor/shoelace');

  console.log('Setting up Shoelace...');

  try {
    // Create vendor directory
    await mkdir(vendorPath, { recursive: true });

    // Copy Shoelace dist
    await cp(shoelacePath, vendorPath, { recursive: true });

    console.log('Shoelace copied to client/vendor/shoelace');
  } catch (error) {
    console.error('Failed to setup Shoelace:', error.message);
    console.log('');
    console.log('Make sure to run "npm install" first.');
    process.exit(1);
  }
}

setup();
