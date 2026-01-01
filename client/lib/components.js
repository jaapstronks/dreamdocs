/**
 * Component Helpers
 * Factory functions for common UI patterns.
 */

import { h, empty } from './dom.js';

/**
 * Create a page header
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.subtitle]
 * @param {HTMLElement[]} [options.actions]
 * @returns {HTMLElement}
 */
export function pageHeader({ title, subtitle, actions = [] }) {
  return h('div', { class: 'vk-page-header' }, [
    h('div', { class: 'vk-page-header-content' }, [
      h('h1', { class: 'vk-page-header-title' }, [title]),
      subtitle && h('p', { class: 'vk-page-header-subtitle' }, [subtitle]),
    ]),
    actions.length > 0 && h('div', { class: 'vk-page-header-actions' }, actions),
  ]);
}

/**
 * Create a form group (label + input + help/error)
 * @param {Object} options
 * @param {string} options.label
 * @param {string} [options.id]
 * @param {boolean} [options.required]
 * @param {string} [options.help]
 * @param {string} [options.error]
 * @param {HTMLElement} options.input
 * @returns {HTMLElement}
 */
export function formGroup({ label, id, required = false, help, error, input }) {
  const groupClass = ['vk-form-group'];
  if (error) groupClass.push('is-invalid');

  // Set input id if provided
  if (id && input.id !== id) {
    input.id = id;
  }

  return h('div', { class: groupClass.join(' ') }, [
    h('label', { class: 'vk-form-label', for: id }, [
      label,
      required && h('span', { class: 'vk-required', 'aria-hidden': 'true' }, ['*']),
    ]),
    input,
    help && !error && h('p', { class: 'vk-form-help' }, [help]),
    error && h('p', { class: 'vk-form-error', role: 'alert' }, [error]),
  ]);
}

/**
 * Create form actions (buttons row)
 * @param {Object} options
 * @param {HTMLElement[]} options.buttons
 * @param {'start'|'end'|'between'} [options.align='end']
 * @returns {HTMLElement}
 */
export function formActions({ buttons, align = 'end' }) {
  const classes = ['vk-form-actions'];
  if (align === 'end') classes.push('is-end');
  if (align === 'between') classes.push('is-between');

  return h('div', { class: classes.join(' ') }, buttons);
}

/**
 * Create an empty state
 * @param {Object} options
 * @param {string} [options.icon]
 * @param {string} options.title
 * @param {string} [options.description]
 * @param {HTMLElement} [options.action]
 * @returns {HTMLElement}
 */
export function emptyState({ icon, title, description, action }) {
  return h('div', { class: 'vk-empty-state' }, [
    icon && h('sl-icon', { class: 'vk-empty-state-icon', name: icon }),
    h('h3', { class: 'vk-empty-state-title' }, [title]),
    description && h('p', { class: 'vk-empty-state-description' }, [description]),
    action,
  ]);
}

/**
 * Create a card
 * @param {Object} options
 * @param {string} [options.title]
 * @param {HTMLElement[]} [options.headerActions]
 * @param {HTMLElement|HTMLElement[]} options.body
 * @param {HTMLElement[]} [options.footer]
 * @returns {HTMLElement}
 */
export function card({ title, headerActions, body, footer }) {
  const children = [];

  if (title || headerActions) {
    children.push(
      h('div', { class: 'vk-card-header flex items-center justify-between' }, [
        title && h('h3', { class: 'vk-card-title' }, [title]),
        headerActions && h('div', { class: 'flex gap-2' }, headerActions),
      ])
    );
  }

  const bodyContent = Array.isArray(body) ? body : [body];
  children.push(h('div', { class: 'vk-card-body' }, bodyContent));

  if (footer) {
    children.push(h('div', { class: 'vk-card-footer' }, footer));
  }

  return h('div', { class: 'vk-card' }, children);
}

/**
 * Create a data table
 * @param {Object} options
 * @param {Array<{key: string, label: string, width?: string}>} options.columns
 * @param {Array<Object>} options.data
 * @param {Function} [options.renderCell] - Custom cell renderer (row, column) => HTMLElement|string
 * @param {Function} [options.renderActions] - Actions renderer (row) => HTMLElement[]
 * @param {string} [options.emptyMessage='No items']
 * @returns {HTMLElement}
 */
export function dataTable({ columns, data, renderCell, renderActions, emptyMessage = 'No items' }) {
  if (data.length === 0) {
    return emptyState({
      icon: 'inbox',
      title: emptyMessage,
    });
  }

  const headerCells = columns.map((col) =>
    h('th', { style: col.width ? `width: ${col.width}` : '' }, [col.label])
  );

  if (renderActions) {
    headerCells.push(h('th', { style: 'width: 100px' }, ['Actions']));
  }

  const rows = data.map((row) => {
    const cells = columns.map((col) => {
      const content = renderCell ? renderCell(row, col) : row[col.key];
      return h('td', {}, [content]);
    });

    if (renderActions) {
      cells.push(
        h('td', { class: 'vk-table-actions' }, renderActions(row))
      );
    }

    return h('tr', {}, cells);
  });

  return h('div', { class: 'vk-table-container' }, [
    h('table', { class: 'vk-table' }, [
      h('thead', {}, [h('tr', {}, headerCells)]),
      h('tbody', {}, rows),
    ]),
  ]);
}

/**
 * Create a loading spinner
 * @param {string} [message]
 * @returns {HTMLElement}
 */
export function loading(message) {
  return h('div', { class: 'vk-loading' }, [
    h('sl-spinner', { style: 'font-size: 2rem' }),
    message && h('p', { class: 'vk-loading-text' }, [message]),
  ]);
}

/**
 * Create a settings section
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.description]
 * @param {Array<{label: string, description?: string, control: HTMLElement}>} options.rows
 * @returns {HTMLElement}
 */
export function settingsSection({ title, description, rows }) {
  return h('div', { class: 'vk-settings-section' }, [
    h('h2', { class: 'vk-settings-section-title' }, [title]),
    description && h('p', { class: 'vk-settings-section-description' }, [description]),
    ...rows.map((row) =>
      h('div', { class: 'vk-settings-row' }, [
        h('div', { class: 'vk-settings-row-label' }, [
          h('h4', {}, [row.label]),
          row.description && h('p', {}, [row.description]),
        ]),
        h('div', { class: 'vk-settings-row-control' }, [row.control]),
      ])
    ),
  ]);
}
