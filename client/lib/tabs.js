/**
 * Tab Interface
 * Simple tab switching for multi-input interfaces.
 */

import { h, $ } from './dom.js';

/**
 * @typedef {Object} TabDefinition
 * @property {string} id - Unique tab ID
 * @property {string} label - Tab button label
 * @property {string} [icon] - Optional Shoelace icon name
 * @property {HTMLElement|Function} content - Tab content or render function
 */

/**
 * @typedef {Object} TabsOptions
 * @property {TabDefinition[]} tabs
 * @property {string} [activeTab] - Initially active tab ID
 * @property {Function} [onTabChange] - Callback when tab changes (tabId) => void
 */

/**
 * Create a tabbed interface
 * @param {TabsOptions} options
 * @returns {{ container: HTMLElement, setActiveTab: (id: string) => void, getActiveTab: () => string }}
 */
export function createTabs(options) {
  const { tabs, activeTab = tabs[0]?.id, onTabChange } = options;

  let currentTab = activeTab;

  // Tab buttons
  const tabList = h('div', {
    class: 'vk-tab-list',
    role: 'tablist',
  });

  // Tab panels container
  const panelContainer = h('div', { class: 'vk-tab-panels' });

  // Create tabs and panels
  const tabButtons = new Map();
  const tabPanels = new Map();

  for (const tab of tabs) {
    // Button
    const button = h('button', {
      class: 'vk-tab',
      role: 'tab',
      id: `tab-${tab.id}`,
      'aria-controls': `panel-${tab.id}`,
      'aria-selected': tab.id === currentTab ? 'true' : 'false',
      tabindex: tab.id === currentTab ? '0' : '-1',
      onclick: () => setActiveTab(tab.id),
    }, [
      tab.icon && h('sl-icon', { name: tab.icon }),
      tab.label,
    ]);
    tabButtons.set(tab.id, button);
    tabList.appendChild(button);

    // Panel
    const content = typeof tab.content === 'function' ? tab.content() : tab.content;
    const panel = h('div', {
      class: 'vk-tab-panel',
      role: 'tabpanel',
      id: `panel-${tab.id}`,
      'aria-labelledby': `tab-${tab.id}`,
      hidden: tab.id !== currentTab,
    }, [content]);
    tabPanels.set(tab.id, panel);
    panelContainer.appendChild(panel);
  }

  // Keyboard navigation
  tabList.addEventListener('keydown', (e) => {
    const tabIds = tabs.map((t) => t.id);
    const currentIndex = tabIds.indexOf(currentTab);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % tabIds.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabIds.length - 1;
    }

    if (newIndex !== currentIndex) {
      setActiveTab(tabIds[newIndex]);
      tabButtons.get(tabIds[newIndex])?.focus();
    }
  });

  function setActiveTab(tabId) {
    if (!tabButtons.has(tabId) || tabId === currentTab) return;

    // Update previous tab
    const prevButton = tabButtons.get(currentTab);
    const prevPanel = tabPanels.get(currentTab);
    if (prevButton) {
      prevButton.setAttribute('aria-selected', 'false');
      prevButton.tabIndex = -1;
    }
    if (prevPanel) {
      prevPanel.hidden = true;
    }

    // Update new tab
    const newButton = tabButtons.get(tabId);
    const newPanel = tabPanels.get(tabId);
    if (newButton) {
      newButton.setAttribute('aria-selected', 'true');
      newButton.tabIndex = 0;
    }
    if (newPanel) {
      newPanel.hidden = false;
    }

    currentTab = tabId;

    if (onTabChange) {
      onTabChange(tabId);
    }
  }

  function getActiveTab() {
    return currentTab;
  }

  const container = h('div', { class: 'vk-tabs' }, [tabList, panelContainer]);

  return {
    container,
    setActiveTab,
    getActiveTab,
  };
}
