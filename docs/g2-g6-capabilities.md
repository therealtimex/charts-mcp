# G2 v5 & G6 v5 Capabilities Catalog

This document catalogs all chart types and layouts available in AntV G2 v5 and G6 v5.

## G2 v5 Marks (Chart Types)

G2 v5 uses a **marks-based system** instead of predefined chart types. Any visualization can be composed of one or more marks.

### Basic Geometric Marks
- ✅ **point** - Scatter plots, bubble charts
- ✅ **line** - Line charts, multi-series lines
- ✅ **area** - Area charts, stacked areas
- ✅ **interval** - Bar charts, column charts, histograms
- ✅ **rect** - Rectangles (heatmaps, matrix charts)
- ✅ **cell** - Cells (calendar charts, aggregated heatmaps)
- ✅ **polygon** - Closed shapes (treemaps, geographic visualizations)

### Specialized Marks
- ✅ **text** - Text annotations and labels
- ✅ **image** - Image-based visualizations
- ✅ **wordCloud** - Word cloud visualizations
- ✅ **box** - Box plots
- ✅ **link** - Connection graphs, network links
- ✅ **vector** - Vector visualizations
- ✅ **connector** - Connection lines

### Auxiliary Marks
- ✅ **lineX** - Vertical auxiliary lines
- ✅ **lineY** - Horizontal auxiliary lines
- ✅ **range** - Range visualizations
- ✅ **rangeX** - Horizontal range marks
- ✅ **rangeY** - Vertical range marks

### Advanced/Composite Marks
- ✅ **density** - Density visualizations
- ✅ **heatmap** - Heatmap visualizations
- ✅ **gauge** - Gauge charts
- ✅ **liquid** - Liquid fill gauges
- ✅ **shape** - Custom shape marks
- ✅ **sunburst** - Sunburst diagrams
- ✅ **sankey** - Sankey diagrams (using Polygon marks)

### Total: 30+ marks available

## G6 v5 Graph Layouts

G6 v5 provides comprehensive layout algorithms for graph and tree visualizations.

### General Graph Layouts
- ✅ **AntVDagreLayout** - Custom dagre-based layout
- ✅ **CircularLayout** - Circular arrangement
- ✅ **ComboCombinedLayout** - Layout for grouped nodes
- ✅ **ConcentricLayout** - Concentric circles
- ✅ **D3Force3DLayout** - 3D force-directed layout
- ✅ **D3ForceLayout** - D3-based force simulation
- ✅ **DagreLayout** - Hierarchical dagre layout
- ✅ **FishboneLayout** - Fishbone/Ishikawa diagram
- ✅ **ForceAtlas2Layout** - ForceAtlas2 physics
- ✅ **ForceLayout** - Basic force-directed
- ✅ **FruchtermanLayout** - Fruchterman-Reingold algorithm
- ✅ **GridLayout** - Grid arrangement
- ✅ **MDSLayout** - Multidimensional scaling
- ✅ **RadialLayout** - Radial arrangement
- ✅ **RandomLayout** - Random positioning
- ✅ **SnakeLayout** - Snake pattern

### Tree Layouts
- ✅ **CompactBoxLayout** - Compact tree
- ✅ **DendrogramLayout** - Dendrogram tree
- ✅ **MindmapLayout** - Mind map tree
- ✅ **IndentedLayout** - Indented tree

### Performance Features
- **Web Workers** - All general layouts (except trees) support background execution
- **WASM Acceleration** - Fruchterman, ForceAtlas, Force, Dagre
- **GPU Acceleration** - Fruchterman, GForce

### Total: 20+ layouts available

## Chart Type Mapping: Current → G2 v5

| Current (G2Plot) | G2 v5 Equivalent | Status |
|------------------|------------------|--------|
| Bar | `interval` mark (horizontal) | ✅ Direct mapping |
| Column | `interval` mark (vertical) | ✅ Direct mapping |
| Line | `line` mark | ✅ Direct mapping |
| Area | `area` mark | ✅ Direct mapping |
| Pie | `interval` + polar coords | ✅ Requires transform |
| Scatter | `point` mark | ✅ Direct mapping |
| Histogram | `interval` + binning transform | ✅ Requires transform |
| Boxplot | `box` mark | ✅ Direct mapping |
| Violin | Custom composite | ⚠️ Need custom impl |
| Radar | `area`/`line` + radar coords | ✅ Requires transform |
| Liquid | `liquid` mark | ✅ Direct mapping |
| Dual-axes | Multiple marks | ✅ Composite |
| Funnel | `interval` + funnel transform | ⚠️ Need custom impl |
| Sankey | `sankey` mark | ✅ Direct mapping |
| Treemap | `polygon` + treemap layout | ✅ Requires transform |
| Word Cloud | `wordCloud` mark | ✅ Direct mapping |
| Venn | Custom composite | ⚠️ Need custom impl |

## New Chart Types We Can Add

### Statistical Charts (G2 v5)
- 🆕 **Heatmap** - Using `rect` or `cell` marks
- 🆕 **Calendar Chart** - Using `cell` mark with calendar layout
- 🆕 **Sunburst** - Using `sunburst` mark
- 🆕 **Gauge** - Using `gauge` mark
- 🆕 **Bullet Chart** - Using `interval` + reference lines
- 🆕 **Waterfall** - Using `interval` with cumulative transform
- 🆕 **Candlestick/Stock** - Using custom marks or `interval`
- 🆕 **Density Plot** - Using `density` mark
- 🆕 **Contour Plot** - Using `polygon` with contour transform
- 🆕 **Matrix Chart** - Using `rect` mark
- 🆕 **Parallel Coordinates** - Using `line` with parallel transform
- 🆕 **Stream Graph** - Using `area` with stack transform
- 🆕 **Chord Diagram** - Using `link` mark with circular layout

### Graph Visualizations (G6 v5)
- 🆕 **Force-Directed Graph** - D3ForceLayout/ForceAtlas2
- 🆕 **Circular Graph** - CircularLayout
- 🆕 **Radial Graph** - RadialLayout
- 🆕 **Dendrogram** - DendrogramLayout
- 🆕 **Compact Tree** - CompactBoxLayout
- 🆕 **3D Graph** - D3Force3DLayout
- 🆕 **Concentric Graph** - ConcentricLayout
- 🆕 **Grid Graph** - GridLayout
- 🆕 **Arc Diagram** - Custom with semi-circular layout
- 🆕 **Hierarchical Edge Bundling** - Custom with radial tree

### Hybrid/Advanced
- 🆕 **Combo Charts** - G2 + G6 combined
- 🆕 **Geo + Graph** - Map + network overlay
- 🆕 **Timeline Graph** - Time-series + graph

## Implementation Priority

### Phase 1: Core Migration (Week 1-2)
1. Migrate existing 15 G2Plot charts to G2 v5
2. Ensure backward compatibility
3. Validate MCP-UI integration

### Phase 2: Quick Wins (Week 3-4)
1. Add heatmap, calendar, sunburst (G2 native marks)
2. Add gauge, bullet charts
3. Add force-directed, circular, radial graphs (G6 native)

### Phase 3: Advanced Charts (Week 5-6)
1. Waterfall, candlestick charts
2. Dendrogram, compact tree layouts
3. Chord diagram, arc diagram

### Phase 4: Hybrid Features (Week 7-8)
1. Composite G2+G6 charts
2. Advanced interactivity
3. SVG/PDF export

## Technical Architecture

### Unified Renderer Pattern
```typescript
// Base renderer interface
interface ChartRenderer {
  type: 'g2' | 'g6' | 'hybrid';
  render(spec: ChartSpec): HTMLString;
  validate(spec: ChartSpec): boolean;
}

// G2 v5 renderer
class G2Renderer implements ChartRenderer {
  type = 'g2';
  buildChart(container: string, spec: G2Spec): Chart;
}

// G6 v5 renderer
class G6Renderer implements ChartRenderer {
  type = 'g6';
  buildGraph(container: string, spec: G6Spec): Graph;
}
```

### CDN Loading Strategy
- G2 v5: `https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js`
- G6 v5: `https://cdn.jsdelivr.net/npm/@antv/g6@5/dist/g6.min.js`
- Fallback for offline/custom builds

## Resources
- [G2 v5 Docs](https://g2.antv.antgroup.com/en/)
- [G6 v5 Docs](https://g6.antv.antgroup.com/en/)
- [G2 Marks Overview](https://g2.antv.antgroup.com/en/manual/core/mark/overview)
- [G6 Layouts Overview](https://g6.antv.antgroup.com/en/manual/layout/overview)
