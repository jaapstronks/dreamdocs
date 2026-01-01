/**
 * Dialog Utilities
 * Helpers for common dialog patterns.
 */

import { h } from './dom.js';

/**
 * Show a confirmation dialog
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.confirmText='Confirm']
 * @param {string} [options.cancelText='Cancel']
 * @param {'primary'|'danger'} [options.variant='primary']
 * @returns {Promise<boolean>}
 */
export function confirm({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}) {
  return new Promise((resolve) => {
    const dialog = document.createElement('sl-dialog');
    dialog.label = title;

    // Message
    const messageEl = h('p', {}, [message]);
    dialog.appendChild(messageEl);

    // Footer buttons
    const footer = h('div', { slot: 'footer', class: 'flex gap-3 justify-end' }, [
      h('sl-button', {
        variant: 'default',
        onclick: () => {
          dialog.hide();
          resolve(false);
        },
      }, [cancelText]),
      h('sl-button', {
        variant: variant === 'danger' ? 'danger' : 'primary',
        onclick: () => {
          dialog.hide();
          resolve(true);
        },
      }, [confirmText]),
    ]);
    dialog.appendChild(footer);

    // Cleanup on close
    dialog.addEventListener('sl-after-hide', () => {
      dialog.remove();
    });

    document.body.appendChild(dialog);
    dialog.show();

    // Focus the confirm button
    requestAnimationFrame(() => {
      const confirmBtn = dialog.querySelector('sl-button[variant="primary"], sl-button[variant="danger"]');
      if (confirmBtn) {
        confirmBtn.focus();
      }
    });
  });
}

/**
 * Show a delete confirmation dialog
 * @param {string} itemName - Name of the item being deleted
 * @returns {Promise<boolean>}
 */
export function confirmDelete(itemName) {
  return confirm({
    title: 'Delete Item',
    message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger',
  });
}

/**
 * Show an alert dialog (just OK button)
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.okText='OK']
 * @returns {Promise<void>}
 */
export function alert({ title, message, okText = 'OK' }) {
  return new Promise((resolve) => {
    const dialog = document.createElement('sl-dialog');
    dialog.label = title;

    const messageEl = h('p', {}, [message]);
    dialog.appendChild(messageEl);

    const footer = h('div', { slot: 'footer', class: 'flex justify-end' }, [
      h('sl-button', {
        variant: 'primary',
        onclick: () => {
          dialog.hide();
          resolve();
        },
      }, [okText]),
    ]);
    dialog.appendChild(footer);

    dialog.addEventListener('sl-after-hide', () => {
      dialog.remove();
    });

    document.body.appendChild(dialog);
    dialog.show();
  });
}

/**
 * Show a prompt dialog
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.message]
 * @param {string} [options.label]
 * @param {string} [options.value='']
 * @param {string} [options.placeholder='']
 * @param {string} [options.confirmText='OK']
 * @param {string} [options.cancelText='Cancel']
 * @returns {Promise<string|null>}
 */
export function prompt({
  title,
  message,
  label,
  value = '',
  placeholder = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
}) {
  return new Promise((resolve) => {
    const dialog = document.createElement('sl-dialog');
    dialog.label = title;

    // Message
    if (message) {
      const messageEl = h('p', { class: 'mb-4' }, [message]);
      dialog.appendChild(messageEl);
    }

    // Input
    const input = document.createElement('sl-input');
    input.label = label || '';
    input.value = value;
    input.placeholder = placeholder;
    dialog.appendChild(input);

    // Footer buttons
    const footer = h('div', { slot: 'footer', class: 'flex gap-3 justify-end' }, [
      h('sl-button', {
        variant: 'default',
        onclick: () => {
          dialog.hide();
          resolve(null);
        },
      }, [cancelText]),
      h('sl-button', {
        variant: 'primary',
        onclick: () => {
          dialog.hide();
          resolve(input.value);
        },
      }, [confirmText]),
    ]);
    dialog.appendChild(footer);

    // Submit on Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        dialog.hide();
        resolve(input.value);
      }
    });

    dialog.addEventListener('sl-after-hide', () => {
      dialog.remove();
    });

    document.body.appendChild(dialog);
    dialog.show();

    // Focus input
    requestAnimationFrame(() => {
      input.focus();
    });
  });
}
