# Phase 6: Advanced Features - Implementation Complete

This document describes the advanced features implemented in Phase 6, including hybrid charts, interactivity, export functionality, and accessibility support.

## Overview

Phase 6 adds enterprise-grade features to the charts-mcp project:

1. **Hybrid Charts** - Combine G2 statistical visualizations with G6 graph visualizations
2. **Advanced Interactivity** - Drill-down, filtering, tooltips, and dynamic interactions
3. **Export Functionality** - SVG, PDF, and PNG export with server-side and client-side options
4. **Accessibility** - WCAG 2.1 AA compliant with ARIA support and keyboard navigation

## 1. Hybrid Charts

### Location
`src/renderer/builders/hybrid.ts`

### Features

#### Composite Visualizations
Combine statistical charts (G2) with graph visualizations (G6) in a single view:

```typescript
import { HybridChartBuilder, HybridChartSpec } from './builders/hybrid';

const spec: HybridChartSpec = {
  type: 'hybrid',
  width: 800,
  height: 600,
  layout: 'split-horizontal', // or 'split-vertical', 'overlay', 'synchronized'

  g2Config: {
    type: 'bar',
    data: [
      { category: 'A', value: 30 },
      { category: 'B', value: 45 },
      { category: 'C', value: 60 }
    ],
    position: 'left',
    size: { width: 400, height: 600 }
  },

  g6Config: {
    type: 'graph',
    data: {
      nodes: [
        { id: 'A', name: 'Node A', category: 'A' },
        { id: 'B', name: 'Node B', category: 'B' },
        { id: 'C', name: 'Node C', category: 'C' }
      ],
      edges: [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' }
      ]
    },
    position: 'right',
    size: { width: 400, height: 600 }
  }
};

const builder = new HybridChartBuilder();
const html = builder.buildHtml(spec);
```

#### Layout Options

1. **Split Horizontal** - Side-by-side layout
2. **Split Vertical** - Stacked layout
3. **Overlay** - Charts overlaid with transparency
4. **Synchronized** - Linked interactions between charts

#### Synchronized Interactions

When using `layout: 'synchronized'`, interactions are automatically linked:
- Clicking a bar in G2 highlights corresponding nodes in G6
- Clicking a node in G6 filters data in G2
- Hover states are synchronized across both visualizations

### Use Cases

- **Network Analysis with Statistics** - Show network graph alongside statistical metrics
- **Timeline Networks** - Combine timeline chart with relationship graph
- **Geo-Networks** - Geographic data with network connections
- **Hierarchical Statistics** - Tree structure with aggregate statistics

## 2. Advanced Interactivity

### Location
`src/renderer/interactivity.ts`

### Features

#### Tooltip Configuration

Enhanced tooltips with custom formatting and positioning:

```typescript
import { buildG2Interactivity, InteractivityConfig } from './interactivity';

const config: InteractivityConfig = {
  tooltip: {
    enabled: true,
    shared: true,
    position: 'auto',
    customContent: `
      return '<div style="padding: 12px;">' +
        '<strong>' + title + '</strong><br/>' +
        items.map(item =>
          '<span style="color:' + item.color + '">' + item.name + ': ' + item.value + '</span>'
        ).join('<br/>') +
      '</div>';
    `
  }
};

const script = buildG2Interactivity(config);
```

#### Drill-Down Navigation

Multi-level drill-down with breadcrumb navigation:

```typescript
const config: InteractivityConfig = {
  drillDown: {
    enabled: true,
    levels: 3,
    breadcrumb: true,
    onDrill: `(data, level) => {
      // Custom drill-down logic
      return fetchDrillDownData(data.category, level);
    }`
  }
};
```

Features:
- Click to drill into data
- Breadcrumb navigation to return to previous levels
- Custom drill-down logic support
- Maintains drill-down stack

#### Dynamic Filters

Three types of filters:

1. **Range Filter** - Filter by numeric range
2. **Category Filter** - Filter by category selection
3. **Search Filter** - Free-text search across all fields

```typescript
const config: InteractivityConfig = {
  filter: {
    enabled: true,
    type: 'range', // or 'category', 'search'
    position: 'top',
    fields: ['value', 'category']
  }
};
```

#### Zoom Controls

```typescript
const config: InteractivityConfig = {
  zoom: {
    enabled: true,
    type: 'scroll', // or 'slider', 'pinch'
    direction: 'both' // or 'x', 'y'
  }
};
```

#### Brush Selection

```typescript
const config: InteractivityConfig = {
  brush: {
    enabled: true,
    type: 'rect', // or 'x', 'y', 'polygon'
    action: 'filter' // or 'highlight'
  }
};
```

#### Interactive Legend

```typescript
const config: InteractivityConfig = {
  legend: {
    enabled: true,
    position: 'top',
    interactive: true // Click to toggle series visibility
  }
};
```

### G6 Graph Interactivity

Special interactivity for G6 graphs:
- Node tooltips on hover
- Double-click to expand/collapse nodes
- Drag nodes to rearrange
- Zoom and pan controls

## 3. Export Functionality

### Location
`src/renderer/export.ts`

### Server-Side Export

#### Export to SVG

```typescript
import { exportChart, ExportOptions } from './export';

const options: ExportOptions = {
  format: 'svg',
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
};

await exportChart(chartHtml, '/path/to/output.svg', options);
```

Features:
- Extracts SVG from canvas-based charts
- Preserves styling and colors
- Adds proper XML declarations and metadata
- Supports background colors

#### Export to PDF

```typescript
const options: ExportOptions = {
  format: 'pdf',
  width: 800,
  height: 600,
  landscape: false,
  printBackground: true,
  scale: 1
};

await exportChart(chartHtml, '/path/to/output.pdf', options);
```

Features:
- High-quality vector output
- Configurable page size and orientation
- Print backgrounds and styles
- Custom scale factor

#### Export to PNG

```typescript
const options: ExportOptions = {
  format: 'png',
  width: 800,
  height: 600,
  scale: 2, // 2x resolution for retina displays
  backgroundColor: '#ffffff'
};

await exportChart(chartHtml, '/path/to/output.png', options);
```

#### Multiple Charts to PDF

```typescript
import { exportMultipleChartsToPDF } from './export';

const charts = [
  { html: chart1Html, title: 'Sales Overview' },
  { html: chart2Html, title: 'Regional Performance' },
  { html: chart3Html, title: 'Trend Analysis' }
];

await exportMultipleChartsToPDF(charts, '/path/to/report.pdf', {
  format: 'pdf',
  landscape: true
});
```

### Client-Side Export

#### Export Button Integration

```typescript
import { createClientSideExport } from './export';

// Inject export button into chart HTML
const exportScript = createClientSideExport();
const htmlWithExport = chartHtml.replace('</body>', exportScript + '</body>');
```

Features:
- Floating export button with dropdown menu
- SVG export (downloads directly)
- PNG export (converts canvas/SVG to PNG)
- PDF export (requires server-side endpoint)
- User-friendly interface

### Export API

The export functionality works with:
- G2 charts (canvas-based)
- G6 graphs (SVG/canvas-based)
- Hybrid charts (mixed renderers)
- Custom visualizations

## 4. Accessibility Features

### Location
`src/renderer/accessibility.ts`

### WCAG 2.1 AA Compliance

All accessibility features follow WCAG 2.1 Level AA guidelines.

### Features

#### ARIA Support

```typescript
import { buildAccessibilityScript, AccessibilityConfig } from './accessibility';

const config: AccessibilityConfig = {
  enabled: true,
  description: 'Bar chart showing quarterly sales data for 2024',
  altText: 'Sales chart: Q1 $50k, Q2 $65k, Q3 $80k, Q4 $95k'
};

const script = buildAccessibilityScript(config);
```

Features:
- Semantic ARIA roles (role="img")
- Descriptive labels (aria-label, aria-describedby)
- SVG title and desc elements
- Screen reader only data tables

#### Keyboard Navigation

Full keyboard accessibility:

**Navigation Keys:**
- `Arrow Keys` - Navigate between chart elements
- `Home` - Jump to first element
- `End` - Jump to last element
- `Enter/Space` - Activate element
- `Escape` - Return focus to container

**Features:**
- Visible focus indicators
- Element highlighting on focus
- Audio announcements for screen readers
- Tab order management

#### Screen Reader Support

```typescript
const config: AccessibilityConfig = {
  announceData: true,
  description: 'Detailed chart description'
};
```

Features:
- Live regions for dynamic announcements
- Data summary on load
- Accessible data tables (hidden visually, available to screen readers)
- Value announcements during navigation

#### High Contrast Mode

```typescript
const config: AccessibilityConfig = {
  highContrast: true
};
```

Features:
- Automatic detection of user preference (`prefers-contrast: high`)
- Enhanced contrast ratios
- Bold text with stroke outlines
- Dark mode support (`prefers-color-scheme: dark`)

#### Focus Indicators

```typescript
const config: AccessibilityConfig = {
  focusIndicators: true
};
```

Features:
- 3px blue outline on focus
- 2px offset for visibility
- Animated focus indicator that follows elements
- `:focus-visible` support for keyboard-only indicators

### Accessibility Report

Generate compliance reports:

```typescript
import { generateAccessibilityReport } from './accessibility';

const report = generateAccessibilityReport(chartHtml);

console.log('Accessibility Score:', report.score);
console.log('Issues:', report.issues);
console.log('Recommendations:', report.recommendations);
```

Output example:
```javascript
{
  score: 85,
  issues: [
    'Missing ARIA role attributes',
    'Chart is not keyboard accessible'
  ],
  recommendations: [
    'Add role="img" to chart container',
    'Add tabindex and keyboard event handlers',
    'Consider adding high contrast mode support'
  ]
}
```

### Injecting Accessibility

Automatically enhance existing charts:

```typescript
import { injectAccessibility } from './accessibility';

const accessibleHtml = injectAccessibility(chartHtml, {
  enabled: true,
  description: 'Chart showing...',
  keyboardNavigation: true,
  announceData: true,
  highContrast: true,
  focusIndicators: true
});
```

## Integration Examples

### Complete Example: Interactive, Exportable, Accessible Chart

```typescript
import { ChartBuilder } from './builders/base';
import { buildG2Interactivity } from './interactivity';
import { createClientSideExport } from './export';
import { injectAccessibility } from './accessibility';

// 1. Build chart
const chartHtml = chartBuilder.buildHtml(spec);

// 2. Add interactivity
const interactiveHtml = chartHtml.replace('</script>', `
  ${buildG2Interactivity({
    tooltip: true,
    drillDown: { enabled: true, levels: 2, breadcrumb: true },
    filter: { enabled: true, type: 'category' },
    zoom: true,
    legend: { enabled: true, interactive: true }
  })}
</script>`);

// 3. Add export button
const exportableHtml = interactiveHtml.replace(
  '</body>',
  createClientSideExport() + '</body>'
);

// 4. Add accessibility
const finalHtml = injectAccessibility(exportableHtml, {
  enabled: true,
  description: 'Sales performance chart with quarterly breakdown',
  keyboardNavigation: true,
  announceData: true,
  highContrast: true,
  focusIndicators: true,
  altText: 'Bar chart showing sales data from Q1 to Q4'
});

// 5. Save or serve
fs.writeFileSync('chart.html', finalHtml);
```

### Hybrid Chart with Full Features

```typescript
import { HybridChartBuilder } from './builders/hybrid';

const spec = {
  type: 'hybrid',
  layout: 'synchronized',
  g2Config: { /* ... */ },
  g6Config: { /* ... */ }
};

const builder = new HybridChartBuilder();
let html = builder.buildHtml(spec);

// Add all advanced features
html = injectAccessibility(html, { enabled: true });
html = html.replace('</body>', createClientSideExport() + '</body>');

// Export to PDF
await exportChart(html, 'hybrid-chart.pdf', { format: 'pdf' });
```

## Testing

All Phase 6 features include:
- TypeScript type definitions
- Error handling
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile support (touch events for brush/zoom)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Dependencies

- `puppeteer` - For server-side rendering and export
- `@antv/g2` - G2 v5 charting library
- `@antv/g6` - G6 v5 graph visualization library

## Performance Considerations

- **Export**: SVG export is fastest, PDF export requires rendering
- **Interactivity**: Event handlers are optimized with debouncing
- **Accessibility**: Screen reader announcements use `aria-live="polite"` to avoid overwhelming users
- **Hybrid Charts**: Renders both visualizations independently for better performance

## Future Enhancements

Potential improvements for future phases:
- WebGL-based rendering for large datasets
- Real-time data streaming support
- Collaborative features (multi-user interactions)
- Voice control integration
- AR/VR chart viewing
- Advanced animations and transitions

## API Reference

### Hybrid Charts API

```typescript
interface HybridChartSpec {
  type: 'hybrid' | 'network-with-stats' | 'timeline-network' | 'geo-network';
  g2Config?: G2Config;
  g6Config?: G6Config;
  layout?: 'split-horizontal' | 'split-vertical' | 'overlay' | 'synchronized';
}
```

### Interactivity API

```typescript
interface InteractivityConfig {
  tooltip?: boolean | TooltipConfig;
  drillDown?: boolean | DrillDownConfig;
  filter?: boolean | FilterConfig;
  zoom?: boolean | ZoomConfig;
  brush?: boolean | BrushConfig;
  legend?: boolean | LegendConfig;
}
```

### Export API

```typescript
function exportChart(
  html: string,
  outputPath: string,
  options: ExportOptions
): Promise<void>;

interface ExportOptions {
  format: 'svg' | 'pdf' | 'png' | 'html';
  width?: number;
  height?: number;
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  landscape?: boolean;
  printBackground?: boolean;
}
```

### Accessibility API

```typescript
function buildAccessibilityScript(
  config: AccessibilityConfig
): string;

function injectAccessibility(
  html: string,
  config: AccessibilityConfig
): string;

function generateAccessibilityReport(
  html: string
): AccessibilityReport;
```

## Summary

Phase 6 successfully implements all planned advanced features:

✅ Hybrid G2+G6 composite charts with synchronized interactions
✅ Advanced interactivity (tooltips, drill-down, filters, zoom, brush, legend)
✅ SVG and PDF export (server-side and client-side)
✅ Full accessibility support (ARIA, keyboard navigation, screen readers, high contrast)

All features are production-ready, well-documented, and tested across browsers and assistive technologies.
