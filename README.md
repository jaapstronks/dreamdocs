# DreamDocs

Convert Notion pages and markdown to beautifully styled PDF documents with configurable themes.

## Features

- **Notion Integration** - Import directly from Notion pages
- **Markdown Support** - Paste or upload markdown files
- **Professional Themes** - Choose from multiple document styles
- **Table of Contents** - Auto-generated navigation
- **Code Highlighting** - Syntax highlighting for code blocks
- **Dual Export** - Download as PDF or HTML

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:3000` to use DreamDocs.

## Notion Integration

To enable Notion import:

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the API key to your `.env` file:
   ```
   NOTION_API_KEY=secret_xxx
   ```
4. Share pages with your integration (from the page menu, click "Add connections")

## Project Structure

```
dreamdocs/
├── client/                 # Browser code
│   ├── views/converter/   # Conversion UI
│   ├── lib/               # Utilities
│   └── styles/            # CSS
│
├── server/                # Node.js server
│   ├── services/          # Business logic
│   │   ├── pdf.ts        # PDF generation (Playwright)
│   │   ├── markdown.ts   # Markdown parsing
│   │   ├── notion.ts     # Notion API client
│   │   └── themes.ts     # Theme management
│   ├── routes/api/        # API endpoints
│   └── templates/         # Document templates
│
└── themes/                # Document themes
    └── default/          # Default theme
        ├── theme.json    # Theme config
        ├── styles.css    # Document styles
        └── fonts/        # Font files
```

## Themes

DreamDocs uses a theme system for document styling. Themes are stored in the `/themes` directory.

### Default Theme

The default theme uses Inter and JetBrains Mono fonts with a clean, minimal design.

### Creating Custom Themes

1. Create a new folder in `/themes/`
2. Add `theme.json` with metadata:
   ```json
   {
     "name": "My Theme",
     "description": "A custom document theme",
     "fonts": [
       { "family": "Inter", "weight": 400, "src": "fonts/Inter-Regular.woff2" }
     ],
     "colors": {
       "text": "#1a1a1a",
       "heading": "#000000",
       "link": "#0066cc",
       "code-bg": "#f5f5f5"
     },
     "pageSettings": {
       "format": "A4",
       "margins": { "top": "2.5cm", "right": "2cm", "bottom": "2.5cm", "left": "2cm" }
     }
   }
   ```
3. Add `styles.css` with document styles using `--doc-*` CSS variables:
   - `--doc-text` - Body text color
   - `--doc-heading` - Heading color
   - `--doc-link` - Link color
   - `--doc-code-bg` - Code block background
   - `--doc-border` - Border color

## Tech Stack

| Layer | Technology |
|-------|------------|
| Server | Node.js with native HTTP (TypeScript) |
| Client | Vanilla JavaScript + Shoelace web components |
| PDF Generation | Playwright (headless Chrome) |
| Markdown | markdown-it with plugins |
| Notion | Official @notionhq/client SDK |

## Scripts

```bash
npm run dev        # Start development server with hot reload
npm run start      # Start production server
npm run build      # Type check and build
npm run test       # Run unit tests
npm run test:e2e   # Run E2E tests
npm run lint       # Lint code
npm run format     # Format code
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/convert` | POST | Convert markdown to PDF/HTML |
| `/api/convert/preview` | POST | Generate HTML preview only |
| `/api/themes` | GET | List available themes |
| `/api/themes/:id` | GET | Get theme details |
| `/api/notion/fetch` | POST | Fetch Notion page as markdown |
| `/api/notion/status` | GET | Check Notion integration status |

### Convert Request

```json
{
  "source": "markdown",
  "content": "# Hello World\n\nThis is markdown.",
  "options": {
    "themeId": "default",
    "generateToc": true,
    "pageNumbers": true,
    "title": "My Document"
  }
}
```

### Convert Response

```json
{
  "pdf": "<base64 encoded PDF>",
  "html": "<complete HTML document>",
  "metadata": {
    "title": "My Document",
    "pageCount": 3,
    "generatedAt": "2024-01-15T10:30:00Z",
    "themeId": "default",
    "tocEntries": 5
  }
}
```

## License

MIT
