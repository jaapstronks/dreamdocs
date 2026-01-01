/**
 * Simple Client-Side Router
 * Uses History API for clean URLs.
 */

/** @type {Map<string, Function>} */
const routes = new Map();

/** @type {Function|null} */
let notFoundHandler = null;

/** @type {Function|null} */
let currentCleanup = null;

/**
 * Register a route
 * @param {string} pattern - Route pattern (e.g., '/items/:id')
 * @param {Function} handler - Route handler function
 */
export function route(pattern, handler) {
  routes.set(pattern, handler);
}

/**
 * Set the 404 handler
 * @param {Function} handler
 */
export function notFound(handler) {
  notFoundHandler = handler;
}

/**
 * Navigate to a path
 * @param {string} path
 * @param {Object} options
 */
export function navigate(path, { replace = false } = {}) {
  if (replace) {
    history.replaceState(null, '', path);
  } else {
    history.pushState(null, '', path);
  }
  handleRoute();
}

/**
 * Parse route pattern and extract params
 * @param {string} pattern
 * @param {string} path
 * @returns {Object|null}
 */
function matchRoute(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      // Dynamic segment
      const paramName = patternPart.slice(1);
      params[paramName] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      // Static segment mismatch
      return null;
    }
  }

  return params;
}

/**
 * Handle the current route
 */
async function handleRoute() {
  const path = window.location.pathname;
  const query = Object.fromEntries(new URLSearchParams(window.location.search));

  // Run cleanup from previous route
  if (currentCleanup) {
    try {
      await currentCleanup();
    } catch (error) {
      console.error('Route cleanup error:', error);
    }
    currentCleanup = null;
  }

  // Find matching route
  for (const [pattern, handler] of routes) {
    const params = matchRoute(pattern, path);
    if (params !== null) {
      try {
        const result = await handler({ params, query, path });
        if (typeof result === 'function') {
          currentCleanup = result;
        }
      } catch (error) {
        console.error('Route handler error:', error);
      }
      return;
    }
  }

  // No match - 404
  if (notFoundHandler) {
    try {
      const result = await notFoundHandler({ path, query });
      if (typeof result === 'function') {
        currentCleanup = result;
      }
    } catch (error) {
      console.error('Not found handler error:', error);
    }
  }
}

/**
 * Initialize the router
 */
export function startRouter() {
  // Handle browser back/forward
  window.addEventListener('popstate', handleRoute);

  // Handle link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip external links, downloads, new tabs
    if (
      link.origin !== window.location.origin ||
      link.hasAttribute('download') ||
      link.target === '_blank' ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey
    ) {
      return;
    }

    // Skip non-local hrefs
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    e.preventDefault();
    navigate(href);
  });

  // Initial route
  handleRoute();
}

/**
 * Get current path
 * @returns {string}
 */
export function currentPath() {
  return window.location.pathname;
}

/**
 * Get current query params
 * @returns {Object}
 */
export function currentQuery() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}
