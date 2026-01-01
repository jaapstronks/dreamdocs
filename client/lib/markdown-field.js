/**
 * Markdown Field
 * Textarea with write/preview toggle and optional toolbar.
 */

import { h, $ } from './dom.js';

/**
 * Simple markdown to HTML conversion
 * Supports: bold, italic, links, code, lists
 * @param {string} markdown
 * @returns {string}
 */
export function renderMarkdown(markdown) {
  if (!markdown) return '';

  let html = markdown
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>');

  return html;
}

/**
 * @typedef {Object} MarkdownFieldOptions
 * @property {string} [value='']
 * @property {string} [placeholder='']
 * @property {number} [rows=5]
 * @property {boolean} [toolbar=true]
 * @property {string} [focusKey]
 * @property {Function} [onChange] - Called with new value
 */

/**
 * Create a markdown field with write/preview toggle
 * @param {MarkdownFieldOptions} options
 * @returns {{ container: HTMLElement, getValue: () => string, setValue: (v: string) => void }}
 */
export function createMarkdownField(options = {}) {
  const {
    value = '',
    placeholder = '',
    rows = 5,
    toolbar = true,
    focusKey,
    onChange,
  } = options;

  let currentValue = value;
  let mode = 'write'; // 'write' | 'preview'

  // Textarea
  const textarea = h('textarea', {
    class: 'vk-markdown-textarea',
    placeholder,
    rows,
    'data-focus-key': focusKey,
  });
  textarea.value = currentValue;

  // Preview container
  const preview = h('div', {
    class: 'vk-markdown-preview',
    onclick: () => setMode('write'),
  });

  // Mode toggle buttons
  const writeBtn = h('button', {
    type: 'button',
    class: 'vk-markdown-mode-btn is-active',
    onclick: () => setMode('write'),
  }, ['Write']);

  const previewBtn = h('button', {
    type: 'button',
    class: 'vk-markdown-mode-btn',
    onclick: () => setMode('preview'),
  }, ['Preview']);

  const modeToggle = h('div', { class: 'vk-markdown-mode-toggle' }, [
    writeBtn,
    previewBtn,
  ]);

  // Toolbar buttons
  const toolbarEl = toolbar ? h('div', { class: 'vk-markdown-toolbar' }, [
    h('button', {
      type: 'button',
      class: 'vk-markdown-toolbar-btn',
      title: 'Bold',
      onclick: () => wrapSelection('**', '**'),
    }, [h('sl-icon', { name: 'type-bold' })]),
    h('button', {
      type: 'button',
      class: 'vk-markdown-toolbar-btn',
      title: 'Italic',
      onclick: () => wrapSelection('_', '_'),
    }, [h('sl-icon', { name: 'type-italic' })]),
    h('button', {
      type: 'button',
      class: 'vk-markdown-toolbar-btn',
      title: 'Link',
      onclick: () => insertLink(),
    }, [h('sl-icon', { name: 'link' })]),
    h('button', {
      type: 'button',
      class: 'vk-markdown-toolbar-btn',
      title: 'Code',
      onclick: () => wrapSelection('`', '`'),
    }, [h('sl-icon', { name: 'code' })]),
  ]) : null;

  // Content area (switches between textarea and preview)
  const content = h('div', { class: 'vk-markdown-content' }, [
    textarea,
    preview,
  ]);
  preview.hidden = true;

  // Event handlers
  textarea.addEventListener('input', () => {
    currentValue = textarea.value;
    if (onChange) {
      onChange(currentValue);
    }
  });

  function setMode(newMode) {
    mode = newMode;

    if (mode === 'write') {
      textarea.hidden = false;
      preview.hidden = true;
      writeBtn.classList.add('is-active');
      previewBtn.classList.remove('is-active');
      textarea.focus();
    } else {
      textarea.hidden = true;
      preview.hidden = false;
      preview.innerHTML = renderMarkdown(currentValue) || '<span class="text-muted">Nothing to preview</span>';
      writeBtn.classList.remove('is-active');
      previewBtn.classList.add('is-active');
    }
  }

  function wrapSelection(before, after) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentValue.substring(start, end);
    const replacement = before + selected + after;

    textarea.setRangeText(replacement, start, end, 'end');
    currentValue = textarea.value;
    textarea.focus();

    if (onChange) {
      onChange(currentValue);
    }
  }

  function insertLink() {
    const url = prompt('Enter URL:');
    if (!url) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentValue.substring(start, end) || 'link text';
    const replacement = `[${selected}](${url})`;

    textarea.setRangeText(replacement, start, end, 'end');
    currentValue = textarea.value;
    textarea.focus();

    if (onChange) {
      onChange(currentValue);
    }
  }

  // Container
  const container = h('div', { class: 'vk-markdown-field' }, [
    h('div', { class: 'vk-markdown-header' }, [
      toolbarEl,
      modeToggle,
    ]),
    content,
  ]);

  return {
    container,
    getValue: () => currentValue,
    setValue: (v) => {
      currentValue = v;
      textarea.value = v;
      if (mode === 'preview') {
        preview.innerHTML = renderMarkdown(v) || '<span class="text-muted">Nothing to preview</span>';
      }
    },
  };
}
