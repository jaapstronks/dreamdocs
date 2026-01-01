/**
 * Theme Management
 * Light/dark/system mode toggle with preference detection.
 */

const STORAGE_KEY = 'vibekit-theme';

/**
 * @typedef {'light'|'dark'|'system'} ThemePreference
 */

/**
 * Get the stored theme preference
 * @returns {ThemePreference}
 */
export function getThemePreference() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * Get the effective theme (resolved from system if needed)
 * @returns {'light'|'dark'}
 */
export function getEffectiveTheme() {
  const pref = getThemePreference();
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

/**
 * Set the theme preference
 * @param {ThemePreference} theme
 */
export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme();
}

/**
 * Cycle through themes: light → dark → system → light
 * @returns {ThemePreference} The new theme
 */
export function cycleTheme() {
  const current = getThemePreference();
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  setTheme(next);
  return next;
}

/**
 * Apply theme to document
 */
function applyTheme() {
  const effective = getEffectiveTheme();
  document.documentElement.classList.toggle('sl-theme-dark', effective === 'dark');
  document.documentElement.dataset.theme = effective;
}

/**
 * Initialize theme (call on page load)
 * This is also done in index.html to prevent flash.
 */
export function initTheme() {
  applyTheme();

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') {
      applyTheme();
    }
  });
}

/**
 * Get icon name for current theme state
 * @returns {string}
 */
function getThemeIcon() {
  const pref = getThemePreference();
  if (pref === 'light') return 'sun';
  if (pref === 'dark') return 'moon';
  return 'circle-half'; // system
}

/**
 * Get label for current theme state
 * @returns {string}
 */
function getThemeLabel() {
  const pref = getThemePreference();
  if (pref === 'light') return 'Light mode';
  if (pref === 'dark') return 'Dark mode';
  return 'System theme';
}

/**
 * Create a theme toggle button (cycles through light/dark/system)
 * @returns {HTMLElement}
 */
export function createThemeToggle() {
  const button = document.createElement('sl-icon-button');
  button.name = getThemeIcon();
  button.label = getThemeLabel();

  button.addEventListener('click', () => {
    cycleTheme();
    button.name = getThemeIcon();
    button.label = getThemeLabel();
  });

  return button;
}

/**
 * Create a theme dropdown selector
 * @returns {HTMLElement}
 */
export function createThemeSelector() {
  const select = document.createElement('sl-select');
  select.value = getThemePreference();
  select.hoist = true;
  select.size = 'small';

  const options = [
    { value: 'light', label: 'Light', icon: 'sun' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'system', label: 'System', icon: 'circle-half' },
  ];

  for (const opt of options) {
    const option = document.createElement('sl-option');
    option.value = opt.value;
    option.innerHTML = `<sl-icon slot="prefix" name="${opt.icon}"></sl-icon>${opt.label}`;
    select.appendChild(option);
  }

  select.addEventListener('sl-change', (e) => {
    setTheme(e.target.value);
  });

  return select;
}

// Legacy exports for backwards compatibility
export { getEffectiveTheme as getTheme };
