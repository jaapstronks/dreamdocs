/**
 * Items API
 * Demo CRUD endpoints for items.
 */

import type { ApiContext } from './index.js';
import { ok, created, badRequest, notFound, json, matchPath } from '../../utils/http.js';
import { listItems, getItem, createItem, updateItem, deleteItem, type Item } from '../../storage/items.js';

/**
 * Handle item-related requests
 * Returns true if the request was handled, false otherwise.
 */
export async function handleItems(ctx: ApiContext): Promise<boolean> {
  const { req, res, url } = ctx;
  const method = req.method || 'GET';
  const path = url.pathname;

  // GET /api/items - List all items
  if (path === '/api/items' && method === 'GET') {
    const items = await listItems();
    ok(res, items);
    return true;
  }

  // POST /api/items - Create a new item
  if (path === '/api/items' && method === 'POST') {
    const body = await json<{ name: string; description?: string }>(req);

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      badRequest(res, 'Name is required');
      return true;
    }

    const item = await createItem({
      name: body.name.trim(),
      description: body.description?.trim() || '',
    });

    created(res, item);
    return true;
  }

  // GET /api/items/:id - Get a single item
  const getMatch = matchPath('/api/items/:id', path);
  if (getMatch && method === 'GET') {
    const item = await getItem(getMatch.id);
    if (!item) {
      notFound(res, 'Item not found');
      return true;
    }
    ok(res, item);
    return true;
  }

  // PUT /api/items/:id - Update an item
  const putMatch = matchPath('/api/items/:id', path);
  if (putMatch && method === 'PUT') {
    const existing = await getItem(putMatch.id);
    if (!existing) {
      notFound(res, 'Item not found');
      return true;
    }

    const body = await json<Partial<Item>>(req);

    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
      badRequest(res, 'Name cannot be empty');
      return true;
    }

    const updated = await updateItem(putMatch.id, {
      name: body.name?.trim() ?? existing.name,
      description: body.description?.trim() ?? existing.description,
    });

    ok(res, updated);
    return true;
  }

  // DELETE /api/items/:id - Delete an item
  const deleteMatch = matchPath('/api/items/:id', path);
  if (deleteMatch && method === 'DELETE') {
    const existing = await getItem(deleteMatch.id);
    if (!existing) {
      notFound(res, 'Item not found');
      return true;
    }

    await deleteItem(deleteMatch.id);
    ok(res);
    return true;
  }

  // Not handled
  return false;
}
