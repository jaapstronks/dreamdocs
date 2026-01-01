/**
 * Download Utilities
 * File download helpers for PDF and HTML.
 */

/**
 * Download a file from string content
 * @param {string} content - File content
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Download a file from base64 content
 * @param {string} base64 - Base64 encoded content
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type
 */
export function downloadBase64(base64, filename, mimeType) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Download both PDF and HTML files
 * @param {string} pdfBase64 - Base64 encoded PDF
 * @param {string} htmlContent - HTML string
 * @param {string} baseFilename - Base filename (without extension)
 */
export function downloadDual(pdfBase64, htmlContent, baseFilename) {
  downloadBase64(pdfBase64, `${baseFilename}.pdf`, 'application/pdf');
  setTimeout(() => {
    downloadFile(htmlContent, `${baseFilename}.html`, 'text/html');
  }, 100);
}

/**
 * Sanitize a string for use as a filename
 * @param {string} name - Original name
 * @returns {string} Safe filename
 */
export function sanitizeFilename(name) {
  return (name || 'document')
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50);
}
