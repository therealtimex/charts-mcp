#!/usr/bin/env tsx
/**
 * Render all example charts in all four output formats for visual validation
 *
 * Usage:
 *   npm run render-examples
 *
 * Output:
 *   - test-outputs/html/*.html (MCP-UI blob format - raw HTML)
 *   - test-outputs/html-tool-result/*.json (MCP-UI resource - actual tool response)
 *   - test-outputs/html-url/*.txt (URLs to interactive HTML)
 *   - test-outputs/png/*.txt (URLs to PNG images)
 *   - test-outputs/index.html (Interactive gallery for review)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, basename, dirname } from "node:path";
import { buildChartHtml } from "../src/renderer/chart";
import { generateChartUrl, generateChartResult, generateMap } from "../src/utils/generate";

// Chart type mapping
const CHART_TYPE_MAP: Record<string, string> = {
  "arc-diagram": "arc-diagram",
  area: "area",
  bar: "bar",
  boxplot: "boxplot",
  "choropleth-map": "choropleth-map",
  chord: "chord",
  column: "column",
  "compact-tree": "compact-tree",
  "concentric-graph": "concentric-graph",
  contour: "contour",
  dendrogram: "dendrogram",
  "district-map": "district-map",
  "dual-axes": "dual-axes",
  "fishbone-diagram": "fishbone-diagram",
  "flow-diagram": "flow-diagram",
  funnel: "funnel",
  "grid-graph": "grid-graph",
  "hierarchical-edge-bundling": "hierarchical-edge-bundling",
  histogram: "histogram",
  hybrid: "hybrid",
  line: "line",
  liquid: "liquid",
  "mind-map": "mind-map",
  "network-graph": "network-graph",
  "organization-chart": "organization-chart",
  "parallel-coordinates": "parallel-coordinates",
  "path-map": "path-map",
  pie: "pie",
  "pin-map": "pin-map",
  radar: "radar",
  sankey: "sankey",
  scatter: "scatter",
  "stream-graph": "stream-graph",
  treemap: "treemap",
  venn: "venn",
  violin: "violin",
  "word-cloud": "word-cloud",
};

// Map tool names (maps need special tool name format)
const MAP_TOOL_NAMES: Record<string, string> = {
  "pin-map": "generate_pin_map",
  "path-map": "generate_path_map",
  "district-map": "generate_district_map",
  "choropleth-map": "generate_choropleth_map",
};

interface Example {
  type: string;
  file: string;
  name: string;
  category: "charts" | "maps";
}

interface RenderResult {
  example: Example;
  html: { path: string; size: number };
  htmlToolResult: { path: string; mode: string; size: number } | { error: string };
  htmlUrl: { path: string; url: string } | { error: string };
  png: { path: string; url: string } | { error: string };
}

function loadExamples(): Example[] {
  const examples: Example[] = [];

  // Load chart examples
  const chartsDir = resolve("examples/charts");
  const chartFiles = readdirSync(chartsDir).filter(f => f.endsWith(".json"));

  for (const file of chartFiles) {
    const type = file.replace(/\.(basic|advanced)\.json$/, "");
    if (CHART_TYPE_MAP[type]) {
      examples.push({
        type: CHART_TYPE_MAP[type],
        file: resolve(chartsDir, file),
        name: file.replace(".json", ""),
        category: "charts",
      });
    }
  }

  // Load map examples
  const mapsDir = resolve("examples/maps");
  try {
    const mapFiles = readdirSync(mapsDir).filter(f => f.endsWith(".json"));
    for (const file of mapFiles) {
      const type = file.replace(/\.(basic|advanced)\.json$/, "");
      if (CHART_TYPE_MAP[type]) {
        examples.push({
          type: CHART_TYPE_MAP[type],
          file: resolve(mapsDir, file),
          name: file.replace(".json", ""),
          category: "maps",
        });
      }
    }
  } catch (e) {
    console.warn("No maps directory found, skipping map examples");
  }

  return examples;
}

async function renderExample(example: Example): Promise<RenderResult> {
  const data = JSON.parse(readFileSync(example.file, "utf-8"));
  const outputDir = resolve("test-outputs");

  // Ensure output directories exist
  mkdirSync(`${outputDir}/html`, { recursive: true });
  mkdirSync(`${outputDir}/html-tool-result`, { recursive: true });
  mkdirSync(`${outputDir}/html-url`, { recursive: true });
  mkdirSync(`${outputDir}/png`, { recursive: true });

  console.log(`Rendering ${example.name} (${example.type})...`);

  const isMap = example.category === "maps";

  // 1. HTML format (MCP-UI blob)
  // Note: Maps require geocoding/server, so we skip raw HTML generation for them
  let htmlPath = "";
  let htmlSize = 0;

  if (!isMap) {
    const html = await buildChartHtml(example.type, data);
    htmlPath = `${outputDir}/html/${example.name}.html`;
    writeFileSync(htmlPath, html, "utf-8");
    htmlSize = Buffer.byteLength(html, "utf-8");
  } else {
    htmlPath = `${outputDir}/html/${example.name}.html`;
    const placeholderHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Map Chart</title></head>
<body style="font-family:sans-serif;padding:20px;">
<p>Map charts require server-side rendering and geocoding.</p>
<p>Please use the HTML Tool Result or HTML-URL format to view this map.</p>
</body></html>`;
    writeFileSync(htmlPath, placeholderHtml, "utf-8");
    htmlSize = Buffer.byteLength(placeholderHtml, "utf-8");
  }

  const result: RenderResult = {
    example,
    html: {
      path: htmlPath,
      size: htmlSize,
    },
    htmlToolResult: { error: "Not implemented" },
    htmlUrl: { error: "Not implemented" },
    png: { error: "Not implemented" },
  };

  // 2. HTML Tool Result (MCP-UI resource format)
  try {
    // Maps use different generation function
    const isMap = example.category === "maps";
    let toolResult;

    if (isMap) {
      const toolName = MAP_TOOL_NAMES[example.type];
      if (!toolName) {
        throw new Error(`Unknown map tool for type: ${example.type}`);
      }
      toolResult = await generateMap(toolName, { ...data, format: "html" });
    } else {
      toolResult = await generateChartResult(example.type, { ...data, format: "html" });
    }

    const toolResultJson = JSON.stringify(toolResult, null, 2);
    const toolResultPath = `${outputDir}/html-tool-result/${example.name}.json`;
    writeFileSync(toolResultPath, toolResultJson, "utf-8");

    // Determine mode (blob vs server) by checking content type
    const contentItem = toolResult.content?.[0];
    let mode = "unknown";
    if (contentItem && typeof contentItem === "object") {
      const resource = (contentItem as any).resource;
      if (resource) {
        // Check mimeType to determine mode
        // text/html = blob mode (HTML embedded)
        // text/uri-list = server mode (URL reference)
        if (resource.mimeType === "text/uri-list") {
          mode = "server";
        } else if (resource.mimeType === "text/html" && (resource.text || resource.blob)) {
          mode = "blob";
        } else if (resource.uri) {
          mode = "unknown";
        }
      }
    }

    result.htmlToolResult = {
      path: toolResultPath,
      mode,
      size: Buffer.byteLength(toolResultJson, "utf-8"),
    };
    console.log(`  ✓ Tool Result: ${mode} mode (${(result.htmlToolResult.size / 1024).toFixed(2)} KB)`);
  } catch (error: any) {
    result.htmlToolResult = { error: error.message || "Failed to generate tool result" };
    console.log(`  ✗ Tool Result: ${error.message}`);
  }

  // 3. HTML-URL format (requires server)
  try {
    let htmlUrl: string;

    if (isMap && "mode" in result.htmlToolResult && result.htmlToolResult.mode === "server") {
      // For maps, extract URL from the already-generated tool result
      const toolResult = JSON.parse(readFileSync(result.htmlToolResult.path, "utf-8"));
      const resource = toolResult.content?.[0]?.resource;
      if (resource?.text && resource.mimeType === "text/uri-list") {
        htmlUrl = resource.text;
      } else {
        throw new Error("Map tool result does not contain a URL");
      }
    } else {
      // For charts, use generateChartUrl
      htmlUrl = await generateChartUrl(example.type, { ...data, format: "html" });
    }

    const htmlUrlPath = `${outputDir}/html-url/${example.name}.txt`;
    writeFileSync(htmlUrlPath, htmlUrl, "utf-8");
    result.htmlUrl = { path: htmlUrlPath, url: htmlUrl };
    console.log(`  ✓ HTML-URL: ${htmlUrl}`);
  } catch (error: any) {
    result.htmlUrl = { error: error.message || "Failed to generate HTML URL" };
    console.log(`  ✗ HTML-URL: ${error.message}`);
  }

  // 4. PNG format (requires server)
  try {
    let pngUrl: string;

    if (isMap && "mode" in result.htmlToolResult && result.htmlToolResult.mode === "server") {
      // For maps, extract URL from tool result and convert to PNG URL
      const toolResult = JSON.parse(readFileSync(result.htmlToolResult.path, "utf-8"));
      const resource = toolResult.content?.[0]?.resource;
      if (resource?.text && resource.mimeType === "text/uri-list") {
        // Replace .html with .png or add ?format=png
        const baseUrl = resource.text;
        pngUrl = baseUrl.replace(/\.html$/, ".png");
      } else {
        throw new Error("Map tool result does not contain a URL");
      }
    } else {
      // For charts, use generateChartUrl
      pngUrl = await generateChartUrl(example.type, { ...data, format: "png" });
    }

    const pngPath = `${outputDir}/png/${example.name}.txt`;
    writeFileSync(pngPath, pngUrl, "utf-8");
    result.png = { path: pngPath, url: pngUrl };
    console.log(`  ✓ PNG: ${pngUrl}`);
  } catch (error: any) {
    result.png = { error: error.message || "Failed to generate PNG" };
    console.log(`  ✗ PNG: ${error.message}`);
  }

  return result;
}

function generateIndexHtml(results: RenderResult[]): string {
  const rows = results.map(r => {
    const htmlSize = (r.html.size / 1024).toFixed(2);

    const htmlToolResultLink = "mode" in r.htmlToolResult
      ? `<a href="html-tool-result/${r.example.name}.json" target="_blank">View JSON</a>
         <br><span class="badge badge-${r.htmlToolResult.mode}">${r.htmlToolResult.mode}</span>
         <br><small>${(r.htmlToolResult.size / 1024).toFixed(2)} KB</small>`
      : `<span class="error">${r.htmlToolResult.error}</span>`;

    const htmlUrlLink = "url" in r.htmlUrl
      ? `<a href="${r.htmlUrl.url}" target="_blank">View</a>`
      : `<span class="error">${r.htmlUrl.error}</span>`;

    const pngLink = "url" in r.png
      ? `<a href="${r.png.url}" target="_blank">View</a> | <img src="${r.png.url}" alt="${r.example.name}" style="max-width: 100px; max-height: 60px; vertical-align: middle;">`
      : `<span class="error">${r.png.error}</span>`;

    return `
      <tr>
        <td>${r.example.category}</td>
        <td><strong>${r.example.name}</strong></td>
        <td>${r.example.type}</td>
        <td>
          <a href="html/${r.example.name}.html" target="_blank">View</a>
          <br><small>${htmlSize} KB</small>
        </td>
        <td>${htmlToolResultLink}</td>
        <td>${htmlUrlLink}</td>
        <td>${pngLink}</td>
      </tr>
    `;
  }).join("\n");

  const summary = {
    total: results.length,
    charts: results.filter(r => r.example.category === "charts").length,
    maps: results.filter(r => r.example.category === "maps").length,
    htmlToolResultSuccess: results.filter(r => "mode" in r.htmlToolResult).length,
    htmlToolResultBlob: results.filter(r => "mode" in r.htmlToolResult && r.htmlToolResult.mode === "blob").length,
    htmlToolResultServer: results.filter(r => "mode" in r.htmlToolResult && r.htmlToolResult.mode === "server").length,
    htmlUrlSuccess: results.filter(r => "url" in r.htmlUrl).length,
    pngSuccess: results.filter(r => "url" in r.png).length,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Charts MCP - Test Renders Gallery</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 20px;
      background: #f5f7fa;
      color: #333;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a202c;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .summary {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .summary h2 {
      font-size: 16px;
      margin-bottom: 8px;
      color: #1e40af;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .summary-item {
      background: white;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
    }
    .summary-item strong {
      display: block;
      font-size: 24px;
      color: #3b82f6;
      margin-bottom: 4px;
    }
    .summary-item span {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #1e293b;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    tr:hover {
      background: #f8fafc;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      text-decoration: underline;
    }
    .error {
      color: #dc2626;
      font-size: 12px;
      font-style: italic;
    }
    small {
      color: #64748b;
      font-size: 11px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-chart { background: #dbeafe; color: #1e40af; }
    .badge-map { background: #dcfce7; color: #166534; }
    .badge-blob { background: #ddd6fe; color: #5b21b6; }
    .badge-server { background: #fed7aa; color: #92400e; }
    .badge-unknown { background: #f3f4f6; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Charts MCP - Visual Test Gallery</h1>
    <p style="color: #64748b; margin-bottom: 20px;">
      Visual validation of all example charts in all three output formats
    </p>

    <div class="summary">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <strong>${summary.total}</strong>
          <span>Total Examples</span>
        </div>
        <div class="summary-item">
          <strong>${summary.charts}</strong>
          <span>Charts</span>
        </div>
        <div class="summary-item">
          <strong>${summary.maps}</strong>
          <span>Maps</span>
        </div>
        <div class="summary-item">
          <strong>${summary.htmlToolResultSuccess}</strong>
          <span>Tool Results</span>
        </div>
        <div class="summary-item">
          <strong>${summary.htmlToolResultBlob}</strong>
          <span>Blob Mode</span>
        </div>
        <div class="summary-item">
          <strong>${summary.htmlToolResultServer}</strong>
          <span>Server Mode</span>
        </div>
        <div class="summary-item">
          <strong>${summary.htmlUrlSuccess}</strong>
          <span>HTML URLs</span>
        </div>
        <div class="summary-item">
          <strong>${summary.pngSuccess}</strong>
          <span>PNGs</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Example</th>
          <th>Type</th>
          <th>HTML (blob)</th>
          <th>HTML Tool Result</th>
          <th>HTML-URL</th>
          <th>PNG</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <strong>Note:</strong> HTML-URL and PNG formats require a running render server.
      If you see errors, start the server with <code>npm run renderer:dev</code>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log("🎨 Charts MCP - Rendering Examples\n");
  console.log("This script generates all four output formats for each example:");
  console.log("  1. HTML (MCP-UI blob format - raw HTML)");
  console.log("  2. HTML Tool Result (MCP-UI resource - actual tool response)");
  console.log("  3. HTML-URL (URL to interactive page)");
  console.log("  4. PNG (URL to static image)\n");

  const examples = loadExamples();
  console.log(`Found ${examples.length} examples\n`);

  const results: RenderResult[] = [];

  for (const example of examples) {
    try {
      const result = await renderExample(example);
      results.push(result);
    } catch (error: any) {
      console.error(`  ✗ Failed to render ${example.name}: ${error.message}`);
      results.push({
        example,
        html: { path: "", size: 0 },
        htmlToolResult: { error: error.message },
        htmlUrl: { error: error.message },
        png: { error: error.message },
      });
    }
  }

  // Generate index.html
  const indexHtml = generateIndexHtml(results);
  const indexPath = resolve("test-outputs/index.html");
  writeFileSync(indexPath, indexHtml, "utf-8");

  console.log(`\n✅ Done! Generated ${results.length} examples`);
  console.log(`\n📁 Output directory: test-outputs/`);
  console.log(`🌐 View gallery: file://${indexPath}\n`);

  // Summary
  const htmlToolResultSuccess = results.filter(r => "mode" in r.htmlToolResult).length;
  const htmlToolResultBlob = results.filter(r => "mode" in r.htmlToolResult && r.htmlToolResult.mode === "blob").length;
  const htmlToolResultServer = results.filter(r => "mode" in r.htmlToolResult && r.htmlToolResult.mode === "server").length;
  const htmlUrlSuccess = results.filter(r => "url" in r.htmlUrl).length;
  const pngSuccess = results.filter(r => "url" in r.png).length;

  console.log("Summary:");
  console.log(`  HTML:         ${results.length}/${results.length} ✓`);
  console.log(`  Tool Result:  ${htmlToolResultSuccess}/${results.length} ${htmlToolResultSuccess === results.length ? "✓" : "⚠"} (${htmlToolResultBlob} blob, ${htmlToolResultServer} server)`);
  console.log(`  HTML-URL:     ${htmlUrlSuccess}/${results.length} ${htmlUrlSuccess === results.length ? "✓" : "⚠"}`);
  console.log(`  PNG:          ${pngSuccess}/${results.length} ${pngSuccess === results.length ? "✓" : "⚠"}\n`);

  if (htmlToolResultSuccess < results.length || htmlUrlSuccess < results.length || pngSuccess < results.length) {
    console.log("⚠ Some formats failed. Make sure the render server is running:");
    console.log("  npm run renderer:dev\n");
  }
}

main().catch(console.error);
