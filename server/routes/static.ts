/**
 * Static File Server
 * Serves client files with proper MIME types.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { getRoot } from '../config/env.js';

interface StaticContext {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.ts': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
};

export async function serveStatic({ res, url }: StaticContext): Promise<void> {
  const root = getRoot();
  const clientDir = join(root, 'client');

  // Determine file path
  let pathname = url.pathname;

  // Default to index.html for root and SPA routes
  if (pathname === '/') {
    pathname = '/index.html';
  }

  let filePath = join(clientDir, pathname);

  try {
    // Check if path exists
    const stats = await stat(filePath);

    // If it's a directory, try index.html
    if (stats.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
  } catch {
    // File doesn't exist - serve index.html for SPA routing
    const ext = extname(pathname);
    if (!ext || !MIME_TYPES[ext]) {
      filePath = join(clientDir, 'index.html');
    } else {
      // Static file not found
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
  }

  try {
    const content = await readFile(filePath);
    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': content.length,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=31536000',
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}
