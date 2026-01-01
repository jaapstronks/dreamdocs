/**
 * DreamDocs Application
 * Convert Notion pages and markdown to beautifully styled PDFs.
 */

import { route, notFound, startRouter, navigate } from './lib/router.js';
import { initTheme, createThemeToggle } from './lib/theme.js';
import { $, h, empty } from './lib/dom.js';
import { renderConverter } from './views/converter/index.js';
import { renderSettings } from './views/settings.js';

// Initialize theme
initTheme();

// Get app container
const app = $('#app');

/**
 * Render the app shell with content
 */
function renderShell(content, { activeNav = '' } = {}) {
  empty(app);

  // Using the header shell variant
  const shell = h('div', { class: 'vk-shell-header' }, [
    // Header
    h('header', { class: 'vk-header' }, [
      h('a', { href: '/', class: 'vk-header-logo' }, ['DreamDocs']),

      h('nav', { class: 'vk-header-nav' }, [
        h('a', {
          href: '/',
          class: activeNav === 'convert' ? 'is-active' : '',
        }, ['Convert']),
        h('a', {
          href: '/settings',
          class: activeNav === 'settings' ? 'is-active' : '',
        }, ['Settings']),
      ]),

      h('div', { class: 'vk-header-spacer' }),

      h('div', { class: 'vk-header-actions' }, [
        createThemeToggle(),
      ]),
    ]),

    // Main content
    h('main', { id: 'main', class: 'vk-main' }, [content]),
  ]);

  app.appendChild(shell);
}

/**
 * Render a not found page
 */
function render404() {
  const content = h('div', { class: 'text-center py-4' }, [
    h('h1', { class: 'text-2xl mb-4' }, ['Page Not Found']),
    h('p', { class: 'text-secondary mb-6' }, ['The page you are looking for does not exist.']),
    h('sl-button', {
      variant: 'primary',
      onclick: () => navigate('/'),
    }, ['Go Home']),
  ]);

  renderShell(content);
}

// Define routes

// Converter (home page)
route('/', async () => {
  const content = h('div', {});
  renderShell(content, { activeNav: 'convert' });
  return renderConverter(content);
});

// Settings
route('/settings', async () => {
  const content = h('div', {});
  renderShell(content, { activeNav: 'settings' });
  return renderSettings(content);
});

// 404 handler
notFound(() => {
  render404();
});

// Start the router
startRouter();
