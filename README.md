# Vibekit

A boring but accessible starter kit for building internal tool applications.

## Philosophy

**"Boring" UI that just works.** The application chrome should be invisible - users focus on the content they're creating, not the tool itself.

- **Minimal dependencies** - Every dependency is a liability
- **No magic** - Explicit over implicit, readable by newcomers
- **Accessible by default** - WCAG AA compliant, keyboard navigable
- **File-based everything** - No database setup required

## Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript (server), JavaScript (client) |
| UI Components | [Shoelace](https://shoelace.style/) web components |
| Styling | CSS Variables + minimal utilities |
| Server | Native Node.js HTTP (no framework) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Linting | ESLint + Prettier |

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/vibekit.git my-app
cd my-app
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the demo app.

## Project Structure

```
vibekit/
├── client/                 # Browser code (ESM)
│   ├── index.html         # Entry point
│   ├── app.js             # Application bootstrap
│   ├── lib/               # Utilities
│   │   ├── api.js         # API client
│   │   ├── dom.js         # DOM helpers
│   │   ├── router.js      # Client-side routing
│   │   ├── toast.js       # Notifications
│   │   ├── dialogs.js     # Confirm/alert/prompt
│   │   ├── theme.js       # Light/dark mode
│   │   └── components.js  # UI component helpers
│   ├── views/             # Route views
│   └── styles/            # CSS
│       ├── tokens.css     # Design tokens
│       ├── reset.css      # CSS reset
│       ├── shoelace-theme.css  # Shoelace overrides
│       ├── base.css       # Element styles
│       ├── components.css # Component styles
│       └── utilities.css  # Utility classes
│
├── server/                # Node.js server
│   ├── server.ts          # Entry point
│   ├── config/            # Configuration
│   ├── routes/            # HTTP handlers
│   │   ├── api/          # API endpoints
│   │   └── static.ts     # Static file server
│   ├── storage/           # Data access
│   └── utils/             # Helpers
│
├── shared/                # Shared code
│   └── types/            # TypeScript types
│
├── tests/                 # Tests
│   ├── unit/             # Vitest
│   └── e2e/              # Playwright
│
└── docs/                  # Documentation
```

## Available Scripts

```bash
npm run dev        # Start dev server with watch mode
npm run start      # Start production server
npm run build      # Build TypeScript
npm run lint       # Run ESLint
npm run format     # Run Prettier
npm run test       # Run unit tests
npm run test:e2e   # Run E2E tests
npm run check      # Run all checks
```

## UI Components

Vibekit uses [Shoelace](https://shoelace.style/) for UI components. Common patterns are wrapped in helper functions:

### Page Header

```javascript
import { pageHeader } from './lib/components.js';

pageHeader({
  title: 'Items',
  subtitle: '12 items',
  actions: [
    h('sl-button', { variant: 'primary' }, ['New Item'])
  ]
});
```

### Form Group

```javascript
import { formGroup } from './lib/components.js';

const input = document.createElement('sl-input');
input.required = true;

formGroup({
  label: 'Name',
  id: 'item-name',
  required: true,
  help: 'Enter the item name',
  error: null, // or error message
  input: input
});
```

### Data Table

```javascript
import { dataTable } from './lib/components.js';

dataTable({
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', width: '100px' }
  ],
  data: items,
  renderCell: (row, col) => row[col.key],
  renderActions: (row) => [
    h('sl-icon-button', { name: 'pencil', label: 'Edit' }),
    h('sl-icon-button', { name: 'trash', label: 'Delete' })
  ],
  emptyMessage: 'No items yet'
});
```

### Dialogs

```javascript
import { confirm, confirmDelete, alert, prompt } from './lib/dialogs.js';

// Confirmation
const confirmed = await confirm({
  title: 'Confirm Action',
  message: 'Are you sure?',
  confirmText: 'Yes',
  cancelText: 'No',
  variant: 'primary' // or 'danger'
});

// Delete confirmation
const shouldDelete = await confirmDelete('Item Name');

// Alert
await alert({
  title: 'Notice',
  message: 'Something happened'
});

// Prompt
const value = await prompt({
  title: 'Rename',
  label: 'New name',
  value: 'Current name'
});
```

### Toasts

```javascript
import { success, error, warning, info } from './lib/toast.js';

success('Item saved');
error('Failed to save');
warning('Check your input');
info('New version available');
```

## App Shell Variants

Three shell layouts are available via CSS classes:

### Minimal Shell
```html
<div class="vk-shell-minimal">
  <header class="vk-header">...</header>
  <main class="vk-main">...</main>
</div>
```

### Header Shell (default)
```html
<div class="vk-shell-header">
  <header class="vk-header">
    <a class="vk-header-logo">Logo</a>
    <nav class="vk-header-nav">...</nav>
    <div class="vk-header-spacer"></div>
    <div class="vk-header-actions">...</div>
  </header>
  <main class="vk-main">...</main>
</div>
```

### Sidebar Shell
```html
<div class="vk-shell-sidebar">
  <aside class="vk-sidebar">
    <div class="vk-sidebar-header">...</div>
    <nav class="vk-sidebar-nav">...</nav>
    <div class="vk-sidebar-footer">...</div>
  </aside>
  <div class="vk-content">
    <header class="vk-topbar">...</header>
    <main class="vk-main">...</main>
  </div>
</div>
```

## Adding a New Feature

1. **Create API endpoint** in `server/routes/api/`
2. **Add storage** in `server/storage/`
3. **Create view** in `client/views/`
4. **Add route** in `client/app.js`

See the Items feature for a complete example.

## Theming

Design tokens are in `client/styles/tokens.css`. Override Shoelace in `client/styles/shoelace-theme.css`.

The theme supports light and dark mode automatically based on system preference, with manual override available.

## Accessibility

Every Vibekit app includes:

- Skip link (first focusable element)
- Visible focus indicators
- ARIA labels on interactive elements
- Screen reader announcements for dynamic content
- Keyboard navigation support

## License

MIT
