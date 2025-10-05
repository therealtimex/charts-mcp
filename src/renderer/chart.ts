/**
 * Chart Rendering Module
 * Provides high-level API for building and rendering charts
 * Uses the modular builder system with ChartRegistry and ChartDispatcher
 */

import path from "node:path";
import crypto from "node:crypto";
import './init-registry'; // Ensure registry is initialized
import { ChartDispatcher } from './chart-dispatcher';
import { exportChart } from './export';
import type { ChartSpec } from './builders/base';

/**
 * Supported chart types
 */
export type ChartType =
  | "arc-diagram"
  | "area"
  | "bar"
  | "bi-directional-bar"
  | "boxplot"
  | "bubble-chart"
  | "bubble-map"
  | "bullet"
  | "calendar"
  | "candlestick"
  | "chord"
  | "column"
  | "compact-tree"
  | "concentric-graph"
  | "contour"
  | "dendrogram"
  | "density"
  | "dual-axes"
  | "fishbone-diagram"
  | "flow-diagram"
  | "funnel"
  | "gauge"
  | "grid-graph"
  | "heatmap"
  | "hierarchical-edge-bundling"
  | "histogram"
  | "hybrid"
  | "line"
  | "liquid"
  | "matrix"
  | "mind-map"
  | "network-graph"
  | "organization-chart"
  | "parallel-coordinates"
  | "pie"
  | "radar"
  | "sankey"
  | "scatter"
  | "stream-graph"
  | "sunburst"
  | "treemap"
  | "venn"
  | "violin"
  | "waterfall"
  | "word-cloud"
  | string;

/**
 * Build HTML for a chart using the modular builder system
 * @deprecated Use ChartDispatcher.dispatch() directly for better type safety
 */
export async function buildChartHtml(type: ChartType, spec: any): Promise<string> {
  // Ensure spec has the type field for the dispatcher
  const chartSpec: ChartSpec = { ...spec, type };

  try {
    const result = await ChartDispatcher.dispatch(type, chartSpec);
    return result.html;
  } catch (error) {
    // Fallback error HTML if chart type is not found
    if (error instanceof Error) {
      return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Error</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; }
      .error { background: #fee; border: 1px solid #c00; border-radius: 4px; padding: 20px; color: #c00; }
      h1 { margin-top: 0; }
      pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
  </head>
  <body>
    <div class="error">
      <h1>Chart Generation Error</h1>
      <p>${error.message}</p>
      ${ChartDispatcher.isSupported(type) ? '' : `<p>Available chart types: ${ChartDispatcher.getSupportedTypes().join(', ')}</p>`}
    </div>
  </body>
</html>`;
    }
    throw error;
  }
}

/**
 * Render a chart to a PNG file
 * @param type Chart type
 * @param spec Chart specification
 * @param outDir Output directory
 * @returns Path to the generated PNG file
 */
export async function renderChartToFile(type: ChartType, spec: any, outDir: string): Promise<string> {
  // Build the chart HTML
  const html = await buildChartHtml(type, spec);

  // Generate unique filename
  const id = crypto.randomBytes(8).toString('hex');
  const file = path.join(outDir, `${id}.png`);

  // Export to PNG using the export module
  await exportChart(html, file, {
    format: 'png',
    width: Number(spec.width || 600),
    height: Number(spec.height || 400),
    scale: 2, // High DPI output
  });

  return file;
}
