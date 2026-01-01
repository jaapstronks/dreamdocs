/**
 * Loading States
 * Full-screen and inline loading overlays.
 */

import { h, $ } from './dom.js';

/** @type {HTMLElement|null} */
let overlayEl = null;

/**
 * Show a full-screen loading overlay
 * @param {string} [message='Loading...']
 * @returns {() => void} Hide function
 */
export function showLoading(message = 'Loading...') {
  hideLoading(); // Remove any existing overlay

  overlayEl = h('div', {
    class: 'vk-loading-overlay',
    role: 'alert',
    'aria-busy': 'true',
    'aria-live': 'polite',
  }, [
    h('div', { class: 'vk-loading-content' }, [
      h('sl-spinner', { style: 'font-size: 2.5rem; --track-width: 4px;' }),
      h('p', { class: 'vk-loading-message', id: 'loading-message' }, [message]),
    ]),
  ]);

  document.body.appendChild(overlayEl);
  document.body.classList.add('is-loading');

  return hideLoading;
}

/**
 * Update the loading message
 * @param {string} message
 */
export function updateLoadingMessage(message) {
  if (overlayEl) {
    const messageEl = $('#loading-message', overlayEl);
    if (messageEl) {
      messageEl.textContent = message;
    }
  }
}

/**
 * Hide the loading overlay
 */
export function hideLoading() {
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }
  document.body.classList.remove('is-loading');
}

/**
 * Show loading while a promise resolves
 * @template T
 * @param {Promise<T>} promise
 * @param {string} [message='Loading...']
 * @returns {Promise<T>}
 */
export async function withLoading(promise, message = 'Loading...') {
  const hide = showLoading(message);
  try {
    return await promise;
  } finally {
    hide();
  }
}

/**
 * Show loading with progress messages
 * @template T
 * @param {(updateMessage: (msg: string) => void) => Promise<T>} fn
 * @param {string} [initialMessage='Loading...']
 * @returns {Promise<T>}
 */
export async function withLoadingProgress(fn, initialMessage = 'Loading...') {
  const hide = showLoading(initialMessage);
  try {
    return await fn(updateLoadingMessage);
  } finally {
    hide();
  }
}

/**
 * Create an inline loading indicator
 * @param {string} [message]
 * @returns {HTMLElement}
 */
export function inlineLoading(message) {
  return h('div', { class: 'vk-loading-inline' }, [
    h('sl-spinner'),
    message && h('span', {}, [message]),
  ]);
}
