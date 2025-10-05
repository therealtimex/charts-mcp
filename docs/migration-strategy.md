# Migration Strategy: G2Plot → G2 v5

This document outlines the detailed strategy for migrating from @antv/g2plot to @antv/g2 v5.

## Executive Summary

**Goal**: Migrate all chart rendering from G2Plot (deprecated) to G2 v5 (actively maintained)

**Benefits**:
- ✅ Future-proof - G2 v5 is actively developed
- ✅ More flexible - Grammar-based approach enables custom charts
- ✅ Better performance - Modern rendering engine
- ✅ Unified ecosystem - Single library for all statistical charts
- ✅ Enable 30+ new chart types

**Timeline**: 8 weeks (phased approach)

## Current State Analysis

### What We Have (G2Plot)
```javascript
// Current approach - simple but limited
new G2Plot.Bar('container', {
  data,
  xField: 'value',
  yField: 'category'
});
```

**Current Charts (15 types)**:
- area, bar, boxplot, column, dual-axes
- funnel, histogram, line, liquid, pie
- radar, sankey, scatter, treemap, venn
- violin, word-cloud

### What We're Moving To (G2 v5)
```javascript
// G2 v5 - more verbose but powerful
const chart = new Chart({ container: 'container' });
chart
  .interval()
  .data(data)
  .encode('x', 'value')
  .encode('y', 'category')
  .transform({ type: 'sortX', reverse: true });
chart.render();
```

## Migration Patterns

### Pattern 1: Direct Mark Mapping

**Charts with 1:1 mapping**:
- Bar → `interval` (horizontal)
- Column → `interval` (vertical)
- Line → `line`
- Area → `area`
- Scatter → `point`
- Boxplot → `box`
- Word Cloud → `wordCloud`
- Liquid → `liquid`
- Sankey → `sankey`

**Example: Bar Chart**
```javascript
// G2Plot (before)
new G2Plot.Bar('container', {
  data,
  xField: 'value',
  yField: 'category',
  color: palette
});

// G2 v5 (after)
chart
  .interval()
  .data(data)
  .encode('x', 'value')
  .encode('y', 'category')
  .encode('color', palette)
  .coordinate({ type: 'transpose' }); // Makes it horizontal
```

### Pattern 2: Coordinate Transform

**Charts requiring coordinate transformation**:
- Pie → `interval` + polar coordinates
- Radar → `line`/`area` + radar coordinates

**Example: Pie Chart**
```javascript
// G2Plot (before)
new G2Plot.Pie('container', {
  data,
  angleField: 'value',
  colorField: 'category',
  innerRadius: 0.6
});

// G2 v5 (after)
chart
  .interval()
  .data(data)
  .encode('y', 'value')
  .encode('color', 'category')
  .transform({ type: 'stackY' })
  .coordinate({ type: 'theta', innerRadius: 0.6 })
  .legend('color', { position: 'right' });
```

### Pattern 3: Data Transform

**Charts requiring data transformation**:
- Histogram → `interval` + binning transform
- Violin → Custom density calculation
- Treemap → `polygon` + hierarchy transform
- Funnel → `interval` + funnel transform

**Example: Histogram**
```javascript
// G2Plot (before)
new G2Plot.Histogram('container', {
  data,
  binField: 'value',
  binWidth: 10
});

// G2 v5 (after)
chart
  .rect()
  .data(data)
  .transform({ type: 'binX', y: 'count', thresholds: 10 })
  .encode('x', 'x')
  .encode('y', 'y');
```

### Pattern 4: Composite Charts

**Charts requiring multiple marks**:
- Dual-axes → Multiple marks with different scales
- Venn → Custom polygon marks with intersection calculation

**Example: Dual Axes**
```javascript
// G2Plot (before)
new G2Plot.DualAxes('container', {
  data: [colData, lineData],
  xField: 'category',
  yField: ['colValue', 'lineValue']
});

// G2 v5 (after)
chart
  .interval()
  .data(colData)
  .encode('x', 'category')
  .encode('y', 'colValue')
  .scale('y', { domain: [0, 100] })
  .axis('y', { position: 'left' });

chart
  .line()
  .data(lineData)
  .encode('x', 'category')
  .encode('y', 'lineValue')
  .scale('y', { domain: [0, 500], independent: true })
  .axis('y', { position: 'right' });
```

## Implementation Strategy

### Step 1: Create Abstraction Layer

**Goal**: Minimize changes to existing codebase

```typescript
// src/renderer/g2v5-adapter.ts
export class G2V5Adapter {
  // Map G2Plot-style spec to G2 v5 API
  static createChart(type: string, spec: any): string {
    const chartBuilder = this.getBuilder(type);
    return chartBuilder.buildHtml(spec);
  }

  private static getBuilder(type: string): ChartBuilder {
    switch (type) {
      case 'bar': return new BarChartBuilder();
      case 'line': return new LineChartBuilder();
      // ... etc
    }
  }
}

// Chart builder interface
interface ChartBuilder {
  buildHtml(spec: any): string;
  buildG2Code(spec: any): string;
}
```

### Step 2: Parallel Implementation

**Approach**: Implement G2 v5 alongside G2Plot

```typescript
// Feature flag approach
const USE_G2V5 = process.env.USE_G2V5 === 'true';

export function buildChartHtml(type: ChartType, spec: any): string {
  if (USE_G2V5) {
    return buildG2V5Html(type, spec);
  } else {
    return buildG2PlotHtml(type, spec); // Current implementation
  }
}
```

### Step 3: Chart-by-Chart Migration

**Order of Migration** (easiest → hardest):

1. **Week 1**: Basic marks (bar, column, line, area, scatter)
2. **Week 2**: Specialized marks (pie, liquid, word-cloud, boxplot)
3. **Week 3**: Transform-based (histogram, radar)
4. **Week 4**: Complex charts (dual-axes, treemap, sankey, funnel)
5. **Week 5**: Custom implementations (violin, venn)
6. **Week 6**: Testing & refinement
7. **Week 7**: G6 updates
8. **Week 8**: Documentation & release

### Step 4: Testing Strategy

**3-Level Testing**:

1. **Unit Tests** - Schema validation, data transforms
2. **Visual Tests** - Screenshot comparison (existing system)
3. **Integration Tests** - MCP-UI compatibility

```bash
# Test both implementations
npm run test -- --g2plot  # Current
npm run test -- --g2v5    # New

# Visual regression
npm run visual-test:compare
```

### Step 5: Cutover Plan

**Gradual Rollout**:
1. Enable G2 v5 for new chart types only
2. Opt-in beta testing (env var)
3. A/B testing with users
4. Full cutover to G2 v5
5. Remove G2Plot code

## Code Generation Templates

### Template 1: Simple Chart
```typescript
export function buildBarChartG2V5(spec: BarChartSpec): string {
  return `<!doctype html>
  <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/@antv/g2@5"></script>
    </head>
    <body>
      <div id="container"></div>
      <script>
        const { Chart } = G2;
        const chart = new Chart({
          container: 'container',
          autoFit: true
        });

        chart
          .interval()
          .data(${JSON.stringify(spec.data)})
          .encode('x', 'value')
          .encode('y', 'category')
          .coordinate({ type: 'transpose' })
          .theme(${JSON.stringify(spec.theme || 'light')});

        chart.render();
      </script>
    </body>
  </html>`;
}
```

### Template 2: Complex Chart with Transforms
```typescript
export function buildHistogramG2V5(spec: HistogramSpec): string {
  const binNumber = spec.binNumber || 10;

  return `
    chart
      .rect()
      .data(${JSON.stringify(spec.data)})
      .transform({ type: 'binX', y: 'count', thresholds: ${binNumber} })
      .encode('x', 'x')
      .encode('y', 'y')
      .style('inset', 0.5);
  `;
}
```

## Backward Compatibility

### Maintaining API Compatibility

**Input schemas remain unchanged**:
```typescript
// Users send same data
{
  "data": [{ "category": "A", "value": 10 }],
  "theme": "dark",
  "width": 600,
  "height": 400
}

// We handle the translation internally
```

### Chart-Specific Mappings

**G2Plot Property → G2 v5 Equivalent**:
```typescript
const PROPERTY_MAPPINGS = {
  xField: (value) => chart.encode('x', value),
  yField: (value) => chart.encode('y', value),
  colorField: (value) => chart.encode('color', value),
  angleField: (value) => chart.encode('y', value), // For pie
  seriesField: (value) => chart.encode('series', value),
  smooth: (value) => chart.style('shape', value ? 'smooth' : 'line'),
  // ... etc
};
```

## Risk Mitigation

### Risk 1: Breaking Changes
- **Mitigation**: Feature flag, parallel implementation
- **Rollback**: Keep G2Plot code until fully validated

### Risk 2: Performance Degradation
- **Mitigation**: Performance benchmarks before/after
- **Acceptance**: Within 10% of G2Plot performance

### Risk 3: Visual Differences
- **Mitigation**: Pixel-perfect screenshot comparison
- **Acceptance**: 95% visual similarity threshold

### Risk 4: MCP-UI Compatibility
- **Mitigation**: Early testing with MCP clients
- **Acceptance**: All clients render correctly

## Success Metrics

### Phase 1 (Core Migration)
- ✅ 15 charts migrated to G2 v5
- ✅ All tests passing
- ✅ Visual regression < 5% difference
- ✅ Performance within 10% of baseline

### Phase 2 (New Features)
- ✅ 10+ new chart types added
- ✅ Enhanced interactivity
- ✅ Export formats (SVG, PDF)

### Phase 3 (Quality)
- ✅ Documentation complete
- ✅ Examples for all charts
- ✅ Zero critical bugs
- ✅ v2.0.0 released

## Resources & References

- [G2 v5 Migration Guide](https://g2.antv.antgroup.com/en/manual/core/migration)
- [G2 v5 API Reference](https://g2.antv.antgroup.com/en/manual/core/api)
- [G2 v5 Examples](https://g2.antv.antgroup.com/en/examples)
- [G2Plot to G2 Comparison](https://github.com/antvis/G2/issues/5000)

## Next Steps

1. ✅ Complete research (done)
2. → Create unified architecture design
3. → Set up G2 v5 development environment
4. → Implement POC for 3 charts (bar, line, pie)
5. → Validate MCP-UI compatibility
6. → Begin full migration
