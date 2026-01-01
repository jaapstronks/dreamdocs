// DreamDocs Type Definitions

// ============================================================================
// Conversion Types
// ============================================================================

export interface ConversionRequest {
  source: 'markdown' | 'notion';
  content: string;
  options: ConversionOptions;
}

export interface ConversionOptions {
  themeId: string;
  generateToc: boolean;
  pageNumbers: boolean;
  title?: string;
}

export interface ConversionResult {
  pdf: string; // Base64 encoded
  html: string;
  metadata: ConversionMetadata;
}

export interface ConversionMetadata {
  title: string;
  pageCount: number;
  generatedAt: string;
  themeId: string;
  tocEntries: number;
}

// ============================================================================
// Theme Types
// ============================================================================

export interface Theme {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  fonts?: FontDefinition[];
  colors?: Record<string, string>;
  pageSettings?: PageSettings;
}

export interface FontDefinition {
  family: string;
  weight?: number | string;
  style?: 'normal' | 'italic';
  src: string;
}

export interface PageSettings {
  format?: 'A4' | 'Letter';
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

// ============================================================================
// Markdown Types
// ============================================================================

export interface MarkdownResult {
  html: string;
  toc: TocEntry[];
  title?: string;
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

// ============================================================================
// Notion Types
// ============================================================================

export interface NotionPageResult {
  title: string;
  markdown: string;
  icon?: string;
  cover?: string;
}

// ============================================================================
// PDF Types
// ============================================================================

export interface PdfOptions {
  html: string;
  pageNumbers?: boolean;
  format?: 'A4' | 'Letter';
  margins?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiContext {
  req: import('http').IncomingMessage;
  res: import('http').ServerResponse;
  url: URL;
}
