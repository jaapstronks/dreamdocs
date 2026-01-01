/**
 * Notion API Routes
 * Fetch and preview Notion pages
 */

import type { ApiContext } from './index.js';
import { json, ok, badRequest, serverError } from '../../utils/http.js';
import { fetchNotionPage, isNotionAvailable, extractPageId } from '../../services/notion.js';

interface NotionFetchRequest {
  url: string;
}

/**
 * Handle Notion routes
 */
export async function handleNotion(ctx: ApiContext): Promise<boolean> {
  const { req, res, url } = ctx;
  const path = url.pathname;

  // GET /api/notion/status - Check if Notion integration is available
  if (path === '/api/notion/status' && req.method === 'GET') {
    ok(res, {
      available: isNotionAvailable(),
      message: isNotionAvailable()
        ? 'Notion integration is configured'
        : 'Set NOTION_API_KEY to enable Notion integration',
    });
    return true;
  }

  // POST /api/notion/fetch - Fetch a Notion page as markdown
  if (path === '/api/notion/fetch' && req.method === 'POST') {
    // Check if Notion is available
    if (!isNotionAvailable()) {
      badRequest(res, 'Notion integration is not configured. Set NOTION_API_KEY environment variable.');
      return true;
    }

    try {
      const body = await json<NotionFetchRequest>(req);

      if (!body.url) {
        badRequest(res, 'Notion page URL is required');
        return true;
      }

      // Validate the URL/ID format
      const pageId = extractPageId(body.url);
      if (!pageId) {
        badRequest(res, 'Invalid Notion page URL or ID');
        return true;
      }

      // Fetch the page
      const result = await fetchNotionPage(body.url);

      ok(res, result);
      return true;
    } catch (error) {
      const err = error as Error;

      // Handle specific Notion API errors
      if (err.message.includes('Could not find')) {
        badRequest(res, 'Page not found. Make sure the page is shared with your integration.');
        return true;
      }

      if (err.message.includes('unauthorized')) {
        badRequest(res, 'Access denied. Make sure the page is shared with your integration.');
        return true;
      }

      serverError(res, err);
      return true;
    }
  }

  // POST /api/notion/validate - Validate a Notion URL without fetching
  if (path === '/api/notion/validate' && req.method === 'POST') {
    try {
      const body = await json<NotionFetchRequest>(req);

      if (!body.url) {
        badRequest(res, 'URL is required');
        return true;
      }

      const pageId = extractPageId(body.url);

      ok(res, {
        valid: !!pageId,
        pageId,
        notionAvailable: isNotionAvailable(),
      });
      return true;
    } catch (error) {
      serverError(res, error as Error);
      return true;
    }
  }

  return false;
}
