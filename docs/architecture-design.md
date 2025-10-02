# Unified Architecture Design: G2 v5 + G6 v5

This document defines the new architecture for supporting comprehensive chart and graph visualizations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Server Layer                     │
│  - Tool definitions (generate_bar_chart, etc.)          │
│  - Schema validation (Zod)                              │
│  - Input normalization                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Chart Router/Dispatcher                │
│  - Route to appropriate renderer (G2/G6/Hybrid)         │
│  - Handle format selection (html/html-url/png)          │
│  - Apply global configurations                          │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  G2 v5 Renderer │    │  G6 v5 Renderer │
│  - Statistical  │    │  - Graphs       │
│  - 30+ marks    │    │  - 20+ layouts  │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Output Generator                     │
│  - HTML with embedded charts (MCP-UI compatible)        │
│  - HTML URL (served from built-in renderer)             │
│  - PNG screenshot (Puppeteer)                           │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Chart Configuration System

**Unified Spec Format**:
```typescript
interface UnifiedChartSpec {
  // Meta
  type: ChartType;
  renderer: 'g2' | 'g6' | 'hybrid';

  // Data
  data: any;

  // Dimensions
  width: number;
  height: number;

  // Theming
  theme?: 'default' | 'dark' | 'academy';
  style?: {
    backgroundColor?: string;
    palette?: string[];
    texture?: 'default' | 'rough';
  };

  // Annotations
  title?: string;
  axisXTitle?: string;
  axisYTitle?: string;

  // Output
  format: 'html' | 'html-url' | 'png';

  // Renderer-specific
  g2Options?: G2ChartOptions;
  g6Options?: G6GraphOptions;
}
```

### 2. Chart Registry

**Centralized chart type registry**:
```typescript
// src/renderer/registry.ts
export class ChartRegistry {
  private static charts = new Map<string, ChartDefinition>();

  static register(def: ChartDefinition) {
    this.charts.set(def.type, def);
  }

  static get(type: string): ChartDefinition | undefined {
    return this.charts.get(type);
  }

  static getAll(): ChartDefinition[] {
    return Array.from(this.charts.values());
  }
}

interface ChartDefinition {
  type: string;
  renderer: 'g2' | 'g6';
  category: 'statistical' | 'graph' | 'map' | 'hybrid';
  builder: ChartBuilder;
  schema: ZodSchema;
}

// Register all charts
ChartRegistry.register({
  type: 'bar',
  renderer: 'g2',
  category: 'statistical',
  builder: new BarChartBuilder(),
  schema: BarChartSchema
});
```

### 3. Chart Builder Pattern

**Abstract builder interface**:
```typescript
// src/renderer/builders/base.ts
export abstract class ChartBuilder {
  abstract buildHtml(spec: UnifiedChartSpec): string;

  protected buildContainer(spec: UnifiedChartSpec): string {
    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${spec.title || 'Chart'}</title>
          ${this.buildStyles(spec)}
          ${this.buildScripts()}
        </head>
        <body>
          ${this.buildTitle(spec)}
          <div id="container"></div>
          ${this.buildChartScript(spec)}
        </body>
      </html>
    `;
  }

  protected abstract buildScripts(): string;
  protected abstract buildChartScript(spec: UnifiedChartSpec): string;

  protected buildStyles(spec: UnifiedChartSpec): string {
    return `
      <style>
        html, body { margin: 0; padding: 0; }
        #container {
          width: ${spec.width}px;
          height: ${spec.height}px;
          margin: 0 auto;
        }
        ${spec.style?.backgroundColor ?
          `body { background: ${spec.style.backgroundColor}; }` : ''}
      </style>
    `;
  }

  protected buildTitle(spec: UnifiedChartSpec): string {
    if (!spec.title) return '';
    return `<h1 style="text-align:center;font-family:sans-serif">${spec.title}</h1>`;
  }
}
```

### 4. G2 v5 Chart Builders

**Example: Bar Chart**:
```typescript
// src/renderer/builders/g2/bar.ts
export class BarChartBuilder extends ChartBuilder {
  buildScripts(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5"></script>';
  }

  buildChartScript(spec: UnifiedChartSpec): string {
    const { data, theme, style } = spec;

    return `
      <script>
        const { Chart } = G2;
        const chart = new Chart({
          container: 'container',
          autoFit: true,
          theme: ${JSON.stringify(theme || 'light')}
        });

        chart
          .interval()
          .data(${JSON.stringify(data)})
          .encode('x', 'value')
          .encode('y', 'category')
          .coordinate({ type: 'transpose' })
          ${this.buildColorEncoding(spec)}
          ${this.buildAxis(spec)};

        chart.render();
      </script>
    `;
  }

  private buildColorEncoding(spec: UnifiedChartSpec): string {
    if (!spec.style?.palette) return '';
    return `.encode('color', 'category').scale('color', {
      range: ${JSON.stringify(spec.style.palette)}
    })`;
  }

  private buildAxis(spec: UnifiedChartSpec): string {
    let axis = '';
    if (spec.axisXTitle) {
      axis += `.axis('x', { title: { text: '${spec.axisXTitle}' } })`;
    }
    if (spec.axisYTitle) {
      axis += `.axis('y', { title: { text: '${spec.axisYTitle}' } })`;
    }
    return axis;
  }
}
```

### 5. G6 v5 Graph Builders

**Example: Force-Directed Graph**:
```typescript
// src/renderer/builders/g6/force.ts
export class ForceGraphBuilder extends ChartBuilder {
  buildScripts(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g6@5"></script>';
  }

  buildChartScript(spec: UnifiedChartSpec): string {
    const { data, theme } = spec;
    const nodes = data.nodes || [];
    const edges = data.edges || [];

    return `
      <script>
        const { Graph } = G6;
        const graph = new Graph({
          container: 'container',
          width: ${spec.width},
          height: ${spec.height},
          theme: ${JSON.stringify(theme || 'light')},
          layout: {
            type: 'd3-force',
            preventOverlap: true,
            nodeStrength: 1000,
            edgeStrength: 200,
            linkDistance: 150
          },
          node: {
            style: {
              size: 20,
              fill: '#5B8FF9',
              stroke: '#fff',
              lineWidth: 2
            },
            labelText: (d) => d.id,
            labelPlacement: 'center',
            labelFill: '#fff'
          },
          edge: {
            style: {
              stroke: '#e2e2e2',
              endArrow: true
            }
          },
          behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node']
        });

        graph.setData({
          nodes: ${JSON.stringify(nodes)},
          edges: ${JSON.stringify(edges)}
        });

        graph.render();
      </script>
    `;
  }
}
```

### 6. Hybrid Chart Support

**Combining G2 + G6**:
```typescript
// src/renderer/builders/hybrid/timeline-graph.ts
export class TimelineGraphBuilder extends ChartBuilder {
  buildScripts(): string {
    return `
      <script src="https://cdn.jsdelivr.net/npm/@antv/g2@5"></script>
      <script src="https://cdn.jsdelivr.net/npm/@antv/g6@5"></script>
    `;
  }

  buildChartScript(spec: UnifiedChartSpec): string {
    return `
      <script>
        // Top: G2 timeline chart
        const chart = new G2.Chart({
          container: 'timeline',
          height: 200
        });
        chart.line()
          .data(${JSON.stringify(spec.data.timeline)})
          .encode('x', 'time')
          .encode('y', 'value');
        chart.render();

        // Bottom: G6 graph at selected time
        const graph = new G6.Graph({
          container: 'graph',
          height: ${spec.height - 200},
          layout: { type: 'd3-force' }
        });
        graph.setData(${JSON.stringify(spec.data.graph)});
        graph.render();

        // Interaction: clicking timeline updates graph
        chart.on('element:click', (e) => {
          const time = e.data.data.time;
          updateGraphForTime(time);
        });
      </script>
    `;
  }
}
```

## File Structure

```
src/
├── renderer/
│   ├── index.ts                 # Main entry point
│   ├── registry.ts              # Chart type registry
│   ├── chart-dispatcher.ts      # Route to correct renderer
│   │
│   ├── builders/
│   │   ├── base.ts              # Abstract ChartBuilder
│   │   ├── g2/
│   │   │   ├── bar.ts
│   │   │   ├── line.ts
│   │   │   ├── pie.ts
│   │   │   ├── heatmap.ts       # NEW
│   │   │   ├── sunburst.ts      # NEW
│   │   │   ├── gauge.ts         # NEW
│   │   │   └── ...
│   │   ├── g6/
│   │   │   ├── force.ts         # NEW
│   │   │   ├── circular.ts      # NEW
│   │   │   ├── radial.ts        # NEW
│   │   │   ├── dendrogram.ts    # NEW
│   │   │   └── ...
│   │   └── hybrid/
│   │       ├── timeline-graph.ts # NEW
│   │       └── geo-network.ts    # NEW
│   │
│   ├── templates/
│   │   ├── html-base.ts         # HTML template utilities
│   │   ├── g2-helpers.ts        # G2-specific helpers
│   │   └── g6-helpers.ts        # G6-specific helpers
│   │
│   └── utils/
│       ├── color-schemes.ts     # Color palette utilities
│       ├── data-transforms.ts   # Data transformation helpers
│       └── cdn-loader.ts        # CDN script management
│
├── charts/
│   ├── index.ts                 # Export all chart definitions
│   ├── base.ts                  # Base schemas
│   │
│   ├── g2/                      # G2 chart definitions
│   │   ├── bar.ts
│   │   ├── heatmap.ts           # NEW
│   │   └── ...
│   │
│   ├── g6/                      # G6 graph definitions
│   │   ├── force-graph.ts       # NEW
│   │   ├── circular-graph.ts    # NEW
│   │   └── ...
│   │
│   └── hybrid/                  # Hybrid chart definitions
│       └── timeline-graph.ts    # NEW
│
└── services/
    └── chart-service.ts         # Main service orchestration
```

## API Flow

### 1. Tool Invocation
```typescript
// User calls MCP tool
{
  "tool": "generate_bar_chart",
  "arguments": {
    "data": [...],
    "format": "html"
  }
}
```

### 2. Routing
```typescript
// src/services/chart-service.ts
export async function generateChart(
  toolName: string,
  args: any
): Promise<ChartResult> {
  // 1. Get chart definition from registry
  const chartType = toolNameToType(toolName);
  const definition = ChartRegistry.get(chartType);

  // 2. Validate input
  const validatedSpec = definition.schema.parse(args);

  // 3. Build unified spec
  const unifiedSpec: UnifiedChartSpec = {
    type: chartType,
    renderer: definition.renderer,
    ...validatedSpec
  };

  // 4. Dispatch to builder
  const html = definition.builder.buildHtml(unifiedSpec);

  // 5. Generate output based on format
  return await outputGenerator.generate(html, unifiedSpec.format);
}
```

### 3. Output Generation
```typescript
// src/renderer/output-generator.ts
export class OutputGenerator {
  async generate(html: string, format: OutputFormat): Promise<ChartResult> {
    switch (format) {
      case 'html':
        return { type: 'html', content: html };

      case 'html-url':
        const url = await this.serveHtml(html);
        return { type: 'url', url };

      case 'png':
        const imageUrl = await this.screenshot(html);
        return { type: 'image', url: imageUrl };
    }
  }

  private async screenshot(html: string): Promise<string> {
    // Use existing Puppeteer implementation
    return renderChartToFile(html);
  }
}
```

## Configuration Management

### Theme System
```typescript
// src/renderer/themes.ts
export const THEMES = {
  light: {
    backgroundColor: '#ffffff',
    colors: ['#5B8FF9', '#5AD8A6', '#5D7092', ...],
    axisColor: '#333',
    gridColor: '#e5e5e5'
  },
  dark: {
    backgroundColor: '#1a1a1a',
    colors: ['#6395F9', '#62DAAB', '#657798', ...],
    axisColor: '#ccc',
    gridColor: '#444'
  },
  academy: {
    // AntV academy theme
  }
};

// Apply theme to spec
export function applyTheme(spec: UnifiedChartSpec): UnifiedChartSpec {
  const theme = THEMES[spec.theme || 'light'];
  return {
    ...spec,
    style: {
      ...theme,
      ...spec.style // User overrides
    }
  };
}
```

### CDN Management
```typescript
// src/renderer/utils/cdn-loader.ts
export class CDNLoader {
  private static G2_V5 = 'https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js';
  private static G6_V5 = 'https://cdn.jsdelivr.net/npm/@antv/g6@5/dist/g6.min.js';

  static getScriptTag(library: 'g2' | 'g6'): string {
    const url = library === 'g2' ? this.G2_V5 : this.G6_V5;
    return `<script src="${url}"></script>`;
  }

  static async preload(): Promise<void> {
    // Optional: preload libraries for faster rendering
  }
}
```

## Migration Path

### Phase 1: Infrastructure
1. Create base architecture (registry, builders, dispatcher)
2. Set up CDN loading system
3. Implement output generator

### Phase 2: Core Charts (G2)
1. Migrate bar, column, line, area, scatter
2. Migrate pie (with polar coords)
3. Migrate specialized (liquid, word-cloud, box)

### Phase 3: Advanced Charts (G2)
1. Add heatmap, calendar, sunburst
2. Add gauge, bullet, waterfall
3. Add histogram (with transforms)

### Phase 4: Graphs (G6)
1. Upgrade existing (flow, network, mind-map, org-chart)
2. Add force-directed, circular, radial
3. Add dendrogram, compact-tree

### Phase 5: Hybrid & Advanced
1. Implement hybrid charts
2. Add advanced interactivity
3. Implement SVG/PDF export

## Performance Considerations

### 1. Code Splitting
```typescript
// Lazy load builders
const builders = {
  bar: () => import('./builders/g2/bar'),
  force: () => import('./builders/g6/force')
};

// Load on demand
const builder = await builders[chartType]();
```

### 2. CDN Caching
```typescript
// Add cache headers for served HTML
app.get('/pages/:id.html', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(html);
});
```

### 3. Render Optimization
```typescript
// Reuse Puppeteer instances
const browserPool = new BrowserPool(3);
const browser = await browserPool.acquire();
// ... render
await browserPool.release(browser);
```

## Next Steps

1. ✅ Research complete
2. ✅ Architecture designed
3. → Implement base infrastructure
4. → Create POC for 3 charts
5. → Validate and iterate
