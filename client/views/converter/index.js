/**
 * Converter View
 * Main document conversion interface with tabs for different input methods.
 */

import { h, empty } from '../../lib/dom.js';
import { createTabs } from '../../lib/tabs.js';
import { pageHeader } from '../../lib/components.js';
import { createPasteTab } from './paste-tab.js';
import { createUploadTab } from './upload-tab.js';
import { createNotionTab } from './notion-tab.js';
import { createOptionsPanel } from './options.js';

/**
 * Render the converter view
 */
export async function renderConverter(container) {
  empty(container);

  // State
  let content = '';
  let contentTitle = '';
  let contentSource = 'markdown'; // 'markdown' | 'notion'

  // Content change handler
  function handleContentChange(newContent, title = '', source = 'markdown') {
    content = newContent;
    contentTitle = title;
    contentSource = source;
  }

  // Check if Notion is available
  let notionAvailable = false;
  try {
    const response = await fetch('/api/notion/status');
    const data = await response.json();
    notionAvailable = data.available;
  } catch {
    // Notion not available
  }

  // Build tabs
  const tabs = [
    {
      id: 'paste',
      label: 'Paste',
      icon: 'clipboard',
      content: () => createPasteTab(handleContentChange),
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: 'upload',
      content: () => createUploadTab(handleContentChange),
    },
  ];

  // Only add Notion tab if integration is available
  if (notionAvailable) {
    tabs.unshift({
      id: 'notion',
      label: 'Notion',
      icon: 'box-arrow-in-right',
      content: () => createNotionTab(handleContentChange),
    });
  }

  const tabInterface = createTabs({
    tabs,
    activeTab: notionAvailable ? 'notion' : 'paste',
  });

  // Options panel
  const optionsPanel = createOptionsPanel({
    getContent: () => content,
    getTitle: () => contentTitle,
    getSource: () => contentSource,
  });

  // Layout
  const page = h('div', { class: 'converter-page' }, [
    pageHeader({
      title: 'DreamDocs',
      subtitle: 'Convert Notion pages and markdown to beautifully styled PDFs',
    }),

    h('div', { class: 'converter-layout' }, [
      // Left: Input tabs
      h('div', { class: 'converter-input' }, [tabInterface.container]),

      // Right: Options and actions
      h('div', { class: 'converter-sidebar' }, [optionsPanel]),
    ]),
  ]);

  container.appendChild(page);

  // Cleanup
  return () => {
    // Cleanup if needed
  };
}
