/**
 * API Router
 * Main entry point for all API requests.
 * Uses handler chain pattern.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleConvert } from './convert.js';
import { handleThemes } from './themes.js';
import { handleNotion } from './notion.js';
import { notFound } from '../../utils/http.js';

export interface ApiContext {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
}

/**
 * Main API handler
 * Routes requests to appropriate handlers.
 */
export async function handleApi(ctx: ApiContext): Promise<void> {
  // Conversion routes (main functionality)
  if (await handleConvert(ctx)) return;

  // Theme routes
  if (await handleThemes(ctx)) return;

  // Notion routes
  if (await handleNotion(ctx)) return;

  // No handler matched
  notFound(ctx.res);
}
