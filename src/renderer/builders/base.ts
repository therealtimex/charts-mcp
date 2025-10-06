/**
 * Abstract base class for chart builders
 * Provides common functionality for building HTML charts
 */

export interface ChartSpec {
  type: string;
  data?: any; // Optional since some charts (gauge, liquid) don't require array data
  width?: number;
  height?: number;
  autoFit?: boolean;
  theme?: 'default' | 'dark' | 'academy';
  title?: string;
  axisXTitle?: string;
  axisYTitle?: string;
  style?: {
    backgroundColor?: string;
    palette?: string[];
    texture?: 'default' | 'rough';
    [key: string]: any;
  };
  format?: 'html' | 'html-url' | 'png';
  [key: string]: any; // Allow additional properties
}

export abstract class ChartBuilder {
  /**
   * Build complete HTML for the chart
   */
  abstract buildHtml(spec: ChartSpec): string;

  /**
   * Build the base HTML container structure
   */
  protected buildContainer(spec: ChartSpec, chartScript: string): string {
    const width = spec.width || 600;
    const height = spec.height || 400;
    const backgroundColor = spec.style?.backgroundColor || '';

    // If builder returned a full <script> tag, don't wrap again
    const scriptBlock = /<\s*script[\s>]/i.test(chartScript)
      ? chartScript
      : `<script>\n    ${chartScript}\n    </script>`;

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${this.escapeHtml(spec.title || 'Chart')}</title>
    ${this.buildStyles(spec)}
    ${this.buildScriptTags()}
  </head>
  <body${backgroundColor ? ` style="background: ${backgroundColor};"` : ''}>
    ${this.buildTitle(spec)}
    <div id="container"></div>
    ${scriptBlock}
  </body>
</html>`;
  }

  /**
   * Build CSS styles for the chart
   */
  protected buildStyles(spec: ChartSpec): string {
    const width = spec.width || 600;
    const height = spec.height || 400;
    const containerWidth = spec.autoFit ? '100%' : `${width}px`;
    const titleWidth = spec.autoFit ? '100%' : `${width}px`;
    const containerHeight = spec.autoFit ? 'auto' : `${height}px`;

    return `<style>
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Helvetica, Arial, sans-serif;
  }
  #title {
    width: ${titleWidth};
    margin: 8px auto 0;
    font: 600 16px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Helvetica, Arial, sans-serif;
    color: #111;
    text-align: center;
  }
  #container {
    width: ${containerWidth};
    height: ${containerHeight};
    ${spec.autoFit ? 'min-height: 200px;' : ''}
    margin: 0 auto;
  }
</style>`;
  }

  /**
   * Build title element
   */
  protected buildTitle(spec: ChartSpec): string {
    if (!spec.title || !spec.title.trim()) {
      return '';
    }
    return `<div id="title">${this.escapeHtml(spec.title)}</div>`;
  }

  /**
   * Build script tags for loading libraries
   * Override in subclasses to load specific libraries
   */
  protected abstract buildScriptTags(): string;

  /**
   * Escape HTML special characters
   */
  protected escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Build color configuration based on palette
   */
  protected buildColorConfig(spec: ChartSpec): string {
    if (!spec.style?.palette || spec.style.palette.length === 0) {
      return '';
    }
    return `.scale('color', { range: ${JSON.stringify(spec.style.palette)} })`;
  }

  /**
   * Build axis configuration
   */
  protected buildAxisConfig(spec: ChartSpec): string {
    let config = '';

    if (spec.axisXTitle) {
      config += `.axis('x', { title: { text: ${JSON.stringify(spec.axisXTitle)} } })`;
    }

    if (spec.axisYTitle) {
      config += `.axis('y', { title: { text: ${JSON.stringify(spec.axisYTitle)} } })`;
    }

    return config;
  }
}
