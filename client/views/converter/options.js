/**
 * Options Panel
 * Conversion options and actions.
 */

import { h, empty } from '../../lib/dom.js';
import { get, post } from '../../lib/api.js';
import { success, error, warning } from '../../lib/toast.js';
import { showLoading, hideLoading } from '../../lib/loading.js';
import { downloadFile, downloadBase64 } from '../../lib/download.js';
import { slSelect, slSwitch, slButton, sl } from '../../lib/shoelace.js';

/**
 * Create the options panel
 * @param {Object} callbacks
 * @param {Function} callbacks.getContent - Get current content
 * @param {Function} callbacks.getTitle - Get current title
 * @param {Function} callbacks.getSource - Get content source
 */
export function createOptionsPanel(callbacks) {
  const { getContent, getTitle, getSource } = callbacks;

  // State
  let themes = [];
  let selectedTheme = 'default';
  let generateToc = true;
  let pageNumbers = true;
  let lastResult = null;

  // Theme selector
  const themeSelect = slSelect({
    label: 'Theme',
    value: 'default',
    className: 'options-theme-select',
  });

  // ToC toggle
  const tocSwitch = slSwitch({
    checked: true,
    text: 'Table of Contents',
  });
  tocSwitch.addEventListener('sl-change', (e) => {
    generateToc = e.target.checked;
  });

  // Page numbers toggle
  const pageNumSwitch = slSwitch({
    checked: true,
    text: 'Page Numbers',
  });
  pageNumSwitch.addEventListener('sl-change', (e) => {
    pageNumbers = e.target.checked;
  });

  // Convert button
  const convertButton = slButton({
    variant: 'primary',
    size: 'large',
    className: 'options-convert-button',
    icon: 'file-earmark-pdf',
    text: 'Convert to PDF',
    onClick: () => convert(),
  });

  // Download buttons
  const pdfDownloadBtn = slButton({
    variant: 'default',
    icon: 'file-pdf',
    text: 'PDF',
    onClick: () => downloadPdf(),
  });

  const htmlDownloadBtn = slButton({
    variant: 'default',
    icon: 'file-code',
    text: 'HTML',
    onClick: () => downloadHtml(),
  });

  const downloadSection = h('div', { class: 'options-downloads' }, [
    h('div', { class: 'options-downloads-label' }, ['Download:']),
    h('div', { class: 'options-downloads-buttons' }, [pdfDownloadBtn, htmlDownloadBtn]),
  ]);
  downloadSection.hidden = true;

  // Metadata display
  const pagesValue = h('span', { class: 'options-metadata-value pages' }, ['-']);
  const tocValue = h('span', { class: 'options-metadata-value toc' }, ['-']);

  const metadataSection = h('div', { class: 'options-metadata' }, [
    h('div', { class: 'options-metadata-item' }, [
      h('span', { class: 'options-metadata-label' }, ['Pages:']),
      pagesValue,
    ]),
    h('div', { class: 'options-metadata-item' }, [
      h('span', { class: 'options-metadata-label' }, ['TOC Entries:']),
      tocValue,
    ]),
  ]);
  metadataSection.hidden = true;

  // Load themes
  async function loadThemes() {
    try {
      const result = await get('/api/themes');
      if (result.ok) {
        themes = result.data.themes;
        selectedTheme = result.data.defaultThemeId;

        // Populate theme selector
        empty(themeSelect);
        for (const theme of themes) {
          const option = sl('sl-option', { value: theme.id }, [theme.name]);
          themeSelect.appendChild(option);
        }
        themeSelect.value = selectedTheme;
      }
    } catch {
      // Use default theme
    }
  }

  // Theme change handler
  themeSelect.addEventListener('sl-change', (e) => {
    selectedTheme = e.target.value;
  });

  // Convert content
  async function convert() {
    const content = getContent();

    if (!content || content.trim().length === 0) {
      warning('Please enter some content first');
      return;
    }

    const hide = showLoading('Converting document...');

    try {
      const result = await post('/api/convert', {
        source: getSource(),
        content,
        options: {
          themeId: selectedTheme,
          generateToc,
          pageNumbers,
          title: getTitle(),
        },
      });

      if (!result.ok) {
        throw new Error(result.data?.error || 'Conversion failed');
      }

      lastResult = result.data;

      // Show download section
      downloadSection.hidden = false;

      // Update metadata
      metadataSection.hidden = false;
      pagesValue.textContent = result.data.metadata.pageCount;
      tocValue.textContent = result.data.metadata.tocEntries;

      success('Document converted successfully');
    } catch (err) {
      error(err.message || 'Conversion failed');
    } finally {
      hide();
    }
  }

  // Download PDF
  function downloadPdf() {
    if (!lastResult) return;

    const filename = sanitizeFilename(lastResult.metadata.title) + '.pdf';
    downloadBase64(lastResult.pdf, filename, 'application/pdf');
    success('PDF downloaded');
  }

  // Download HTML
  function downloadHtml() {
    if (!lastResult) return;

    const filename = sanitizeFilename(lastResult.metadata.title) + '.html';
    downloadFile(lastResult.html, filename, 'text/html');
    success('HTML downloaded');
  }

  // Sanitize filename
  function sanitizeFilename(name) {
    return (name || 'document')
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 50);
  }

  // Initialize
  loadThemes();

  return h('div', { class: 'options-panel' }, [
    h('div', { class: 'options-section' }, [
      h('div', { class: 'options-section-title' }, ['Options']),
      themeSelect,
      h('div', { class: 'options-toggles' }, [tocSwitch, pageNumSwitch]),
    ]),
    h('div', { class: 'options-section options-actions' }, [convertButton]),
    downloadSection,
    metadataSection,
  ]);
}
