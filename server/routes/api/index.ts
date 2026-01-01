/**
 * API Router
 * Main entry point for all API requests.
 * Uses handler chain pattern.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleItems } from './items.js';
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
  // Items (demo CRUD resource)
  if (await handleItems(ctx)) return;

  // Add more handlers here:
  // if (await handleUsers(ctx)) return;
  // if (await handleSettings(ctx)) return;

  // No handler matched
  notFound(ctx.res);
}
