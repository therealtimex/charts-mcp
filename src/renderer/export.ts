/**
 * Chart Export Module
 * Provides SVG and PDF export functionality for charts
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

export interface ExportOptions {
  format: 'svg' | 'pdf' | 'png' | 'html';
  width?: number;
  height?: number;
  quality?: number; // For PNG (0-1)
  scale?: number; // For PDF/PNG (device scale factor)
  backgroundColor?: string;
  landscape?: boolean; // For PDF
  printBackground?: boolean; // For PDF
}

/**
 * Export chart HTML to various formats
 */
export async function exportChart(
  html: string,
  outputPath: string,
  options: ExportOptions
): Promise<void> {
  const format = options.format || 'png';

  switch (format) {
    case 'svg':
      await exportToSVG(html, outputPath, options);
      break;
    case 'pdf':
      await exportToPDF(html, outputPath, options);
      break;
    case 'png':
      await exportToPNG(html, outputPath, options);
      break;
    case 'html':
      await fs.writeFile(outputPath, html, 'utf-8');
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Export chart to SVG format
 */
async function exportToSVG(
  html: string,
  outputPath: string,
  options: ExportOptions
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const width = options.width || 800;
    const height = options.height || 600;

    await page.setViewport({ width, height });

    // Inject SVG extraction script into HTML
    const enhancedHtml = injectSVGExtractor(html);
    await page.setContent(enhancedHtml, { waitUntil: 'networkidle0' });

    // Wait for chart to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract SVG content
    const svgContent = await page.evaluate(() => {
      return (window as any).__extractedSVG || '';
    });

    if (!svgContent) {
      throw new Error('Failed to extract SVG from chart');
    }

    // Add XML declaration and ensure proper dimensions
    const svgWithDeclaration = addSVGMetadata(svgContent, width, height, options.backgroundColor);

    await fs.writeFile(outputPath, svgWithDeclaration, 'utf-8');
  } finally {
    await browser.close();
  }
}

/**
 * Export chart to PDF format
 */
async function exportToPDF(
  html: string,
  outputPath: string,
  options: ExportOptions
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const width = options.width || 800;
    const height = options.height || 600;

    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for chart to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate PDF
    await page.pdf({
      path: outputPath,
      width: `${width}px`,
      height: `${height}px`,
      landscape: options.landscape || false,
      printBackground: options.printBackground !== false,
      scale: options.scale || 1
    });
  } finally {
    await browser.close();
  }
}

/**
 * Export chart to PNG format (existing functionality)
 */
async function exportToPNG(
  html: string,
  outputPath: string,
  options: ExportOptions
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const width = options.width || 800;
    const height = options.height || 600;
    const scale = options.scale || 2;

    await page.setViewport({ width, height, deviceScaleFactor: scale });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for chart to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({
      path: outputPath as `${string}.png`,
      type: 'png',
      quality: undefined, // PNG doesn't use quality parameter
      fullPage: false
    });
  } finally {
    await browser.close();
  }
}

/**
 * Inject SVG extraction script into HTML
 */
function injectSVGExtractor(html: string): string {
  const extractorScript = `
<script>
(function() {
  window.__extractedSVG = '';

  function extractSVG() {
    // Try to extract from G2 chart
    const g2Container = document.querySelector('#container canvas, #container svg');
    if (g2Container && g2Container.tagName === 'CANVAS') {
      // G2 uses canvas, need to convert to SVG
      const canvas = g2Container;
      const svg = canvasToSVG(canvas);
      window.__extractedSVG = svg;
      return;
    }

    // Try to extract existing SVG (for G6 or custom charts)
    let svg = document.querySelector('svg');
    if (!svg) {
      // Check in containers
      svg = document.querySelector('#container svg, #g2-container svg, #g6-container svg, #graph svg');
    }

    if (svg) {
      window.__extractedSVG = svg.outerHTML;
      return;
    }

    // Try to convert canvas to SVG
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length > 0) {
      const svgElements = Array.from(canvases).map(canvas => canvasToSVG(canvas));
      window.__extractedSVG = wrapMultipleSVGs(svgElements);
    }
  }

  function canvasToSVG(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const dataURL = canvas.toDataURL('image/png');

    return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${width}" height="\${height}">
  <image href="\${dataURL}" width="\${width}" height="\${height}" />
</svg>\`;
  }

  function wrapMultipleSVGs(svgElements) {
    const container = document.getElementById('container') || document.body;
    const width = container.offsetWidth || 800;
    const height = container.offsetHeight || 600;

    return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${width}" height="\${height}">
  <g>
    \${svgElements.join('\\n')}
  </g>
</svg>\`;
  }

  // Wait for rendering to complete
  setTimeout(extractSVG, 1500);
})();
</script>
`;

  // Inject before closing body tag
  return html.replace('</body>', `${extractorScript}\n</body>`);
}

/**
 * Add SVG metadata and ensure proper structure
 */
function addSVGMetadata(
  svgContent: string,
  width: number,
  height: number,
  backgroundColor?: string
): string {
  // Remove existing XML declaration if present
  let svg = svgContent.replace(/<\?xml[^>]*\?>\s*/g, '');

  // Ensure xmlns attribute
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Ensure width and height
  if (!svg.includes('width=')) {
    svg = svg.replace('<svg', `<svg width="${width}"`);
  }
  if (!svg.includes('height=')) {
    svg = svg.replace('<svg', `<svg height="${height}"`);
  }

  // Add background if specified
  if (backgroundColor) {
    svg = svg.replace(
      '<svg',
      `<svg>\n  <rect width="100%" height="100%" fill="${backgroundColor}"/>\n  <svg`
    );
    svg = svg.replace('</svg>', '</svg>\n</svg>');
  }

  // Add XML declaration
  return `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`;
}

/**
 * Export multiple charts to a single PDF
 */
export async function exportMultipleChartsToPDF(
  charts: { html: string; title?: string }[],
  outputPath: string,
  options: ExportOptions = { format: 'pdf' }
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const width = options.width || 800;
    const height = options.height || 600;

    await page.setViewport({ width, height });

    // Create combined HTML with all charts
    const combinedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .chart-page { page-break-after: always; margin-bottom: 20px; }
    .chart-page:last-child { page-break-after: auto; }
    .chart-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
  </style>
</head>
<body>
  ${charts.map((chart, i) => `
    <div class="chart-page">
      ${chart.title ? `<div class="chart-title">${chart.title}</div>` : ''}
      <div class="chart-content">
        ${chart.html}
      </div>
    </div>
  `).join('\n')}
</body>
</html>
`;

    await page.setContent(combinedHtml, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.pdf({
      path: outputPath,
      format: 'A4',
      landscape: options.landscape || false,
      printBackground: options.printBackground !== false,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
  } finally {
    await browser.close();
  }
}

/**
 * Create downloadable SVG/PDF from browser context
 * Returns JavaScript code to inject into chart HTML for client-side export
 */
export function createClientSideExport(): string {
  return `
<script>
// Client-side export functionality
function createExportButton() {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 10000;';

  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export ▼';
  exportBtn.style.cssText = \`
    padding: 8px 16px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  \`;

  const menu = document.createElement('div');
  menu.style.cssText = \`
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    min-width: 120px;
  \`;

  ['SVG', 'PNG', 'PDF'].forEach(format => {
    const item = document.createElement('div');
    item.textContent = format;
    item.style.cssText = \`
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
    \`;
    item.onmouseover = () => item.style.background = '#f5f5f5';
    item.onmouseout = () => item.style.background = 'white';
    item.onclick = () => exportChart(format.toLowerCase());
    menu.appendChild(item);
  });

  exportBtn.onclick = () => {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  };

  buttonContainer.appendChild(exportBtn);
  buttonContainer.appendChild(menu);
  document.body.appendChild(buttonContainer);

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!buttonContainer.contains(e.target)) {
      menu.style.display = 'none';
    }
  });
}

function exportChart(format) {
  if (format === 'svg') {
    exportSVG();
  } else if (format === 'png') {
    exportPNG();
  } else if (format === 'pdf') {
    alert('PDF export requires server-side processing. Please use the API endpoint.');
  }
}

function exportSVG() {
  const svg = document.querySelector('svg');
  if (!svg) {
    // Try to convert canvas to SVG
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('No exportable content found');
      return;
    }
    downloadCanvasAsPNG(canvas, 'chart.png');
    return;
  }

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  downloadFile(url, 'chart.svg');
}

function exportPNG() {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    downloadCanvasAsPNG(canvas, 'chart.png');
    return;
  }

  // Convert SVG to PNG
  const svg = document.querySelector('svg');
  if (svg) {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      downloadCanvasAsPNG(canvas, 'chart.png');
      URL.revokeObjectURL(url);
    };

    img.src = url;
    return;
  }

  alert('No exportable content found');
}

function downloadCanvasAsPNG(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    downloadFile(url, filename);
  });
}

function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initialize export button when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createExportButton);
} else {
  createExportButton();
}
</script>
`;
}
