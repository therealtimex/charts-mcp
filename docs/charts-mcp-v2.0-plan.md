# Implementation Roadmap: Charts MCP v2.0

**Vision**: The most comprehensive, self-hosted, MCP-UI compatible chart generation server powered by AntV G2 v5 + G6 v5.

## Executive Summary

| Metric | Current (v1.x) | Target (v2.0) |
|--------|---------------|---------------|
| Chart Types | 25 | **60+** |
| Rendering Engine | G2Plot (deprecated) | **G2 v5 + G6 v5** |
| Graph Layouts | 4 | **20+** |
| Export Formats | html, html-url, png | **+ SVG, PDF** |
| Dependencies | External services | **100% self-hosted** |
| MCP-UI Support | Basic | **Advanced interactive** |

**Target Release**: v2.0.0

---

## Phase 1: Research & Planning 

### Objectives
- ✅ Audit G2 v5 capabilities - **30+ marks identified**
- ✅ Audit G6 v5 capabilities - **20+ layouts identified**
- ✅ Design unified architecture
- ✅ Create migration strategy
- ✅ Document implementation plan

### Deliverables
- ✅ `docs/g2-g6-capabilities.md` - Complete capability catalog
- ✅ `docs/migration-strategy.md` - Migration guide from G2Plot
- ✅ `docs/architecture-design.md` - New architecture design
- ✅ `docs/implementation-roadmap.md` - This document

### Status: **COMPLETED** ✅

---

## Phase 2: Foundation

### Objectives
- Set up G2 v5 + G6 v5 development environment
- Create base infrastructure (registry, builders, dispatcher)
- Implement POC for 3 charts (bar, line, pie)
- Validate MCP-UI compatibility

### Tasks

#### 2.1 Infrastructure Setup
```bash
# Create new directory structure
mkdir -p src/renderer/builders/{g2,g6,hybrid}
mkdir -p src/renderer/templates
mkdir -p src/renderer/utils
mkdir -p src/charts/{g2,g6,hybrid}
```

#### 2.2 Core Components
- [ ] `src/renderer/registry.ts` - Chart type registry
- [ ] `src/renderer/chart-dispatcher.ts` - Routing logic
- [ ] `src/renderer/builders/base.ts` - Abstract builder
- [ ] `src/renderer/output-generator.ts` - Output handler

#### 2.3 G2 v5 POC Charts
- [ ] `src/renderer/builders/g2/bar.ts` - Bar chart builder
- [ ] `src/renderer/builders/g2/line.ts` - Line chart builder
- [ ] `src/renderer/builders/g2/pie.ts` - Pie chart builder

#### 2.4 Testing & Validation
- [ ] Create test suite for new builders
- [ ] Validate HTML output with MCP-UI clients
- [ ] Compare visual output with G2Plot versions
- [ ] Performance benchmarking

### Deliverables
- Working POC with 3 charts using G2 v5
- Validated MCP-UI compatibility
- Performance baseline established

### Success Criteria
- ✅ 3 charts render correctly
- ✅ MCP-UI integration working
- ✅ Visual quality matches G2Plot
- ✅ Performance within 10% of baseline

---

## Phase 3: Core Migration

### Objectives
- Migrate all 15 existing G2Plot charts to G2 v5
- Maintain 100% backward compatibility
- Update tests for all charts

### 3.1 Statistical Charts
- [ ] Bar chart (interval + transpose)
- [ ] Column chart (interval)
- [ ] Line chart (line)
- [ ] Area chart (area)
- [ ] Scatter chart (point)
- [ ] Histogram (rect + binX transform)
- [ ] Boxplot (box mark)

### 3.2 Specialized Charts 
- [ ] Pie chart (interval + polar coords)
- [ ] Liquid chart (liquid mark)
- [ ] Radar chart (area + radar coords)
- [ ] Word Cloud (wordCloud mark)
- [ ] Sankey (sankey mark)
- [ ] Treemap (polygon + hierarchy)
- [ ] Dual-axes (composite marks)
- [ ] Funnel (interval + funnel transform)

### 3.3 Complex Charts
- [ ] Violin plot (custom density calculation)
- [ ] Venn diagram (custom polygon overlay)

### 3.4 Testing & Validation
- [ ] Update unit tests for all charts
- [ ] Visual regression testing
- [ ] API compatibility validation
- [ ] Documentation updates

### Deliverables
- All 15 existing charts migrated to G2 v5
- Feature parity with v1.x maintained
- Updated test suite passing

### Success Criteria
- ✅ All charts migrated
- ✅ Zero breaking changes to API
- ✅ All tests passing
- ✅ Visual regression < 5%

---

## Phase 4: G2 Expansion

### Objectives
- Add 15+ new chart types using G2 v5 capabilities
- Expand beyond G2Plot limitations

### 4.1 New Statistical Charts 
- [ ] **Heatmap** (rect/cell mark)
  - Schema, builder, tests, examples
- [ ] **Calendar Chart** (cell mark + calendar layout)
  - Schema, builder, tests, examples
- [ ] **Sunburst** (sunburst mark)
  - Schema, builder, tests, examples
- [ ] **Gauge** (gauge mark)
  - Schema, builder, tests, examples
- [ ] **Bullet Chart** (interval + reference lines)
  - Schema, builder, tests, examples

### 4.2 Advanced Charts (Week 6)
- [ ] **Waterfall** (interval + cumulative transform)
  - Schema, builder, tests, examples
- [ ] **Candlestick/Stock** (custom mark composition)
  - Schema, builder, tests, examples
- [ ] **Density Plot** (density mark)
  - Schema, builder, tests, examples
- [ ] **Contour Plot** (polygon + contour transform)
  - Schema, builder, tests, examples
- [ ] **Matrix Chart** (rect mark)
  - Schema, builder, tests, examples

### 4.3 Composite Charts
- [ ] **Parallel Coordinates** (line + parallel transform)
- [ ] **Stream Graph** (area + stack transform)
- [ ] **Chord Diagram** (link mark + circular)

### Deliverables
- 15+ new chart types implemented
- Comprehensive examples for all
- Updated documentation

### Success Criteria
- ✅ 15+ new charts added
- ✅ All charts fully tested
- ✅ Examples validated
- ✅ Documentation complete

---

## Phase 5: G6 Enhancement 

### Objectives
- Upgrade existing 4 G6 charts to v5
- Add 10+ new graph layouts

### 5.1 Upgrade Existing 
- [ ] **Flow Diagram** - Upgrade to G6 v5 dagre
- [ ] **Network Graph** - Upgrade to G6 v5 force
- [ ] **Mind Map** - Upgrade to G6 v5 mindmap
- [ ] **Org Chart** - Upgrade to G6 v5 compact-box

### 5.2 New Graph Types
- [ ] **Force-Directed Graph** (D3Force/ForceAtlas2)
  - Schema, builder, tests, examples
- [ ] **Circular Graph** (CircularLayout)
  - Schema, builder, tests, examples
- [ ] **Radial Graph** (RadialLayout)
  - Schema, builder, tests, examples
- [ ] **Dendrogram** (DendrogramLayout)
  - Schema, builder, tests, examples
- [ ] **Compact Tree** (CompactBoxLayout)
  - Schema, builder, tests, examples
- [ ] **3D Graph** (D3Force3DLayout)
  - Schema, builder, tests, examples
- [ ] **Concentric Graph** (ConcentricLayout)
  - Schema, builder, tests, examples
- [ ] **Grid Graph** (GridLayout)
  - Schema, builder, tests, examples

### 5.3 Advanced Graphs
- [ ] **Arc Diagram** (custom semi-circular)
- [ ] **Hierarchical Edge Bundling** (radial tree)

### Deliverables
- 4 existing graphs upgraded to G6 v5
- 10+ new graph layouts
- Performance improvements (WASM/GPU)

### Success Criteria
- ✅ All G6 charts on v5
- ✅ 10+ new layouts working
- ✅ Leverage WASM/GPU acceleration
- ✅ Examples for all layouts

---

## Phase 6: Advanced Features

### Objectives
- Implement hybrid charts (G2 + G6)
- Add advanced interactivity
- Implement SVG/PDF export

### 6.1 Hybrid Charts
- [ ] **Timeline + Graph** - Time-series with network evolution
  - Select time → update graph
- [ ] **Geo + Network** - Map with network overlay
  - Geographic nodes with connections
- [ ] **Dashboard Composite** - Multi-chart dashboards
  - Multiple G2/G6 charts coordinated

### 6.2 Advanced Interactivity 
- [ ] **Drill-down** - Click to expand detail
- [ ] **Filtering** - Interactive data filtering
- [ ] **Linked Charts** - Cross-chart interactions
- [ ] **Animation** - Smooth transitions

### 6.3 Export Formats 
- [ ] **SVG Export** - Vector graphics output
  - Generate SVG from chart spec
  - Download functionality
- [ ] **PDF Export** - Document-ready output
  - Puppeteer PDF generation
  - Multi-page support
