# Examples Directory

This directory contains example chart specifications organized by type and phase.

## Directory Structure

```
examples/
├── charts/           # All chart examples (basic + advanced)
│   ├── *.basic.json          # Basic chart examples
│   ├── *.advanced.json       # Advanced chart examples
│   ├── *.interactive.json    # Interactive features
│   └── *.accessible.json     # Accessibility examples
├── maps/             # Map visualization examples
└── README.md         # This file
```

## Chart Examples (`charts/`)

Basic statistical charts using G2:

### Core Charts
- `bar.basic.json` - Horizontal bar chart
- `column.basic.json` - Vertical column chart
- `line.basic.json` - Line chart with time series
- `area.basic.json` - Area chart
- `pie.basic.json` - Pie/donut chart
- `scatter.basic.json` - Scatter plot

### Statistical Charts
- `boxplot.basic.json` - Box plot
- `histogram.basic.json` - Histogram
- `violin.basic.json` - Violin plot
- `radar.basic.json` - Radar/spider chart

### Specialized Charts
- `dual-axes.basic.json` - Dual-axis chart (column + line)
- `funnel.basic.json` - Funnel chart
- `liquid.basic.json` - Liquid fill gauge

### Diagram Charts
- `fishbone-diagram.basic.json` - Cause-and-effect diagram
- `flow-diagram.basic.json` - Flow/process diagram
- `flow-diagram.advanced.json` - Complex flow diagram

### Graph Visualizations (G6)
- `network-graph.basic.json` - Network graph
- `mind-map.basic.json` - Mind map
- `organization-chart.basic.json` - Org chart
- `arc-diagram.basic.json` - Arc diagram
- `chord.basic.json` - Chord diagram
- `dendrogram.basic.json` - Dendrogram
- `compact-tree.basic.json` - Compact tree layout
- `concentric-graph.basic.json` - Concentric graph
- `contour.basic.json` - Contour visualization
- `grid-graph.basic.json` - Grid-based graph
- `hierarchical-edge-bundling.basic.json` - Edge bundling
- `parallel-coordinates.basic.json` - Parallel coordinates
- `stream-graph.basic.json` - Stream graph

### Advanced Features (Phase 6)

**Hybrid Visualizations**:
- `hybrid.advanced.json` - Hybrid G2+G6 composite chart
  - Combines bar chart with force-directed graph
  - Synchronized interactions between visualizations
  - Shared color palette
  - Use Case: Product relationship analysis with sales performance

**Interactive Features**:
- `bar.interactive.json` - Full-featured interactive bar chart
  - Enhanced tooltips with custom formatting
  - Multi-level drill-down with breadcrumb navigation
  - Dynamic category filters
  - Zoom controls
  - Interactive legend
  - Export to SVG/PNG/PDF
  - Use Case: Regional sales analysis with drill-down

**Accessibility**:
- `line.accessible.json` - WCAG 2.1 AA compliant line chart
  - Full ARIA support for screen readers
  - Keyboard navigation (Arrow keys, Home, End, Enter, Escape)
  - Screen reader announcements
  - High contrast mode support
  - Visible focus indicators
  - Hidden data table for assistive technologies
  - Use Case: Temperature data accessible to all users

See [Phase 6 Features Documentation](../docs/phase6-advanced-features.md) for complete details.

## Map Examples (`maps/`)

Geographic visualizations (if applicable).

## Usage

### With MCP Server

```bash
# Start the MCP server
npx charts-mcp

# Use create_chart tool in Claude Desktop with these examples
```

### Direct Rendering

```bash
# Install dependencies
npm install

# Render a specific example
npm run render-examples -- --file examples/charts/bar.basic.json

# Render all examples
npm run render-examples
```

### Programmatic Usage

```typescript
import { ChartDispatcher } from './src/renderer/chart-dispatcher';
import fs from 'fs';

// Load example
const spec = JSON.parse(fs.readFileSync('examples/charts/bar.basic.json', 'utf-8'));

// Generate chart
const result = await ChartDispatcher.dispatch(spec.type, spec);

// Save HTML
fs.writeFileSync('output.html', result.html);
```

## Example Format

All examples follow this JSON structure:

```json
{
  "type": "bar",
  "title": "Chart Title",
  "width": 600,
  "height": 400,
  "data": [
    { "category": "A", "value": 30 },
    { "category": "B", "value": 45 }
  ],
  "axisXTitle": "X Axis",
  "axisYTitle": "Y Axis",
  "style": {
    "palette": ["#5B8FF9", "#5AD8A6"],
    "backgroundColor": "#ffffff"
  }
}
```

## Creating New Examples

1. **Copy a similar example** as a starting point
2. **Modify the data** and configuration
3. **Follow naming convention**: `{type}.{variant}.json`
   - `type`: Chart type (bar, line, pie, etc.)
   - `variant`: basic, advanced, custom, etc.
4. **Test the example**:
   ```bash
   npm run render-examples -- --file examples/charts/your-example.json
   ```
5. **Add documentation** if introducing new features

## Example Categories

### Basic Examples
Simple, minimal configurations demonstrating core functionality.
- Naming: `*.basic.json`

### Advanced Examples
Complex configurations with multiple features.
- Naming: `*.advanced.json`

### Custom Examples
Specialized use cases or customizations.
- Naming: `*.custom.json`

### Phase Examples
Examples demonstrating phase-specific features.
- Location: `phase{N}/`

## Output Location

Rendered charts are saved to:
```
test-outputs/
├── bar-basic.png
├── line-basic.png
└── ...
```

**Note**: Test outputs are excluded from git (see `.gitignore`).

## Quality Guidelines

When creating examples:

✅ **DO**:
- Use realistic, representative data
- Include descriptive titles
- Provide clear axis labels
- Use appropriate color palettes
- Test rendering before committing

❌ **DON'T**:
- Use Lorem Ipsum or meaningless data
- Create examples without titles
- Use inaccessible color combinations
- Commit rendered outputs to git

## Contributing

When adding new examples:

1. Place in appropriate directory
2. Follow naming conventions
3. Test rendering
4. Update this README if adding new categories
5. Ensure examples work with latest code

## Related Documentation

- [Main README](../README.md)
- [Phase 6 Features](../docs/phase6-advanced-features.md)
- [Chart Type Schemas](../src/schemas/)
- [7-Phase Plan](../docs/7phase-plan.json)

## Support

For issues with examples:
1. Verify example JSON is valid
2. Check chart type is supported
3. Review error messages from renderer
4. Consult type-specific documentation

## License

Same as main project - MIT License
