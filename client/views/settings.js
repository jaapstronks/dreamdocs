/**
 * Settings View
 * Demo settings page showing settings panel pattern.
 */

import { h, empty } from '../lib/dom.js';
import { pageHeader, settingsSection } from '../lib/components.js';
import { getTheme, setTheme } from '../lib/theme.js';
import { success } from '../lib/toast.js';

/**
 * Render the settings view
 * @param {HTMLElement} container
 * @returns {Function} Cleanup function
 */
export async function renderSettings(container) {
  render(container);

  return () => {
    // Cleanup
  };
}

/**
 * Render the settings UI
 */
function render(container) {
  empty(container);

  // Theme toggle
  const themeSelect = document.createElement('sl-select');
  themeSelect.value = getTheme();
  themeSelect.hoist = true;

  const lightOption = document.createElement('sl-option');
  lightOption.value = 'light';
  lightOption.textContent = 'Light';
  themeSelect.appendChild(lightOption);

  const darkOption = document.createElement('sl-option');
  darkOption.value = 'dark';
  darkOption.textContent = 'Dark';
  themeSelect.appendChild(darkOption);

  themeSelect.addEventListener('sl-change', (e) => {
    setTheme(e.target.value);
    success(`Theme changed to ${e.target.value}`);
  });

  // Notification toggle
  const notifySwitch = document.createElement('sl-switch');
  notifySwitch.checked = true;
  notifySwitch.addEventListener('sl-change', (e) => {
    success(e.target.checked ? 'Notifications enabled' : 'Notifications disabled');
  });

  // Email input
  const emailInput = document.createElement('sl-input');
  emailInput.type = 'email';
  emailInput.placeholder = 'your@email.com';
  emailInput.style.width = '250px';

  // Appearance section
  const appearanceSection = settingsSection({
    title: 'Appearance',
    description: 'Customize how the application looks.',
    rows: [
      {
        label: 'Theme',
        description: 'Choose between light and dark mode.',
        control: themeSelect,
      },
    ],
  });

  // Notifications section
  const notificationsSection = settingsSection({
    title: 'Notifications',
    description: 'Configure how you receive notifications.',
    rows: [
      {
        label: 'Push Notifications',
        description: 'Receive push notifications for important updates.',
        control: notifySwitch,
      },
      {
        label: 'Email Address',
        description: 'Email address for notification delivery.',
        control: emailInput,
      },
    ],
  });

  // Danger zone
  const dangerSection = h('div', { class: 'vk-settings-section mt-8' }, [
    h('h2', { class: 'vk-settings-section-title text-danger' }, ['Danger Zone']),
    h('p', { class: 'vk-settings-section-description' }, [
      'Irreversible actions that affect your account.',
    ]),
    h('div', { class: 'vk-card mt-4' }, [
      h('div', { class: 'vk-card-body flex items-center justify-between' }, [
        h('div', {}, [
          h('h4', { class: 'font-medium' }, ['Delete All Items']),
          h('p', { class: 'text-sm text-muted mt-1' }, [
            'Permanently delete all items. This cannot be undone.',
          ]),
        ]),
        h('sl-button', { variant: 'danger', outline: true }, ['Delete All']),
      ]),
    ]),
  ]);

  // Page header
  const header = pageHeader({
    title: 'Settings',
    subtitle: 'Manage your preferences',
  });

  container.appendChild(header);

  const settingsContainer = h('div', { class: 'vk-settings' }, [
    appearanceSection,
    notificationsSection,
    dangerSection,
  ]);

  container.appendChild(settingsContainer);
}
