/**
 * Initialize Chart Registry
 * Registers all G2 v5 and G6 v5 chart builders
 */

import { ChartRegistry } from './registry';
import {
  BarChartBuilder,
  BiDirectionalBarChartBuilder,
  LineChartBuilder,
  PieChartBuilder,
  DonutChartBuilder,
  ColumnChartBuilder,
  AreaChartBuilder,
  ScatterChartBuilder,
  BubbleChartBuilder,
  BubbleMapBuilder,
  HistogramBuilder,
  BoxplotBuilder,
  RadarChartBuilder,
  LiquidChartBuilder,
  WordCloudChartBuilder,
  SankeyChartBuilder,
  TreemapChartBuilder,
  DualAxesChartBuilder,
  FunnelChartBuilder,
  ViolinChartBuilder,
  VennChartBuilder,
  HeatmapChartBuilder,
  CalendarChartBuilder,
  SunburstChartBuilder,
  GaugeChartBuilder,
  BulletChartBuilder,
  WaterfallChartBuilder,
  CandlestickChartBuilder,
  DensityChartBuilder,
  MatrixChartBuilder,
  ContourPlotBuilder,
  ParallelCoordinatesBuilder,
  StreamGraphBuilder,
  ChordBuilder,
  ChoroplethMapBuilder,
  ColorMapBuilder,
  ArcDiagramG2Builder
} from './builders/g2';
import {
  FlowDiagramBuilder,
  NetworkGraphBuilder,
  MindMapLegacyBuilder,
  OrganizationChartLegacyBuilder,
  DendrogramBuilder,
  CompactTreeBuilder,
  ConcentricGraphBuilder,
  GridGraphBuilder,
  ArcDiagramBuilder,
  HierarchicalEdgeBundlingBuilder
} from './builders/g6';
import { FishboneDiagramBuilder } from './builders/custom';
import { z } from 'zod';

// Common schema components
const baseDataSchema = z.object({
  category: z.string().optional(),
  value: z.number().optional(),
  group: z.string().optional()
});

const baseStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  palette: z.array(z.string()).optional(),
  texture: z.enum(['default', 'rough']).optional()
}).optional();

const baseChartSchema = {
  width: z.number().optional(),
  height: z.number().optional(),
  theme: z
    .enum(['classic', 'dark', 'academy', 'light', 'classicDark', 'academyDark', 'default'])
    .optional()
    .default('classic'),
  title: z.string().optional(),
  axisXTitle: z.string().optional(),
  axisYTitle: z.string().optional(),
  style: baseStyleSchema
};

// Bar Chart
const barSchema = z.object({
  type: z.literal('bar'),
  data: z.array(z.object({
    category: z.string(),
    value: z.number(),
    group: z.string().optional()
  })),
  ...baseChartSchema,
  stack: z.boolean().optional(),
  group: z.boolean().optional()
});

// Line Chart
const lineSchema = z.object({
  type: z.literal('line'),
  data: z.array(z.object({
    time: z.string(),
    value: z.number(),
    group: z.string().optional()
  })),
  ...baseChartSchema,
  smooth: z.boolean().optional()
});

// Pie Chart
const pieSchema = z.object({
  type: z.literal('pie'),
  data: z.array(z.object({
    category: z.string(),
    value: z.number()
  })),
  ...baseChartSchema,
  innerRadius: z.number().optional()
});

// Donut Chart
const donutSchema = z.object({
  type: z.literal('donut-chart'),
  data: z.array(z.record(z.any())),
  ...baseChartSchema,
  innerRadius: z.number().min(0.1).max(0.9).optional(),
  encode: z.object({
    angleField: z.string().optional(),
    colorField: z.string().optional()
  }).optional(),
  labels: z.array(z.any()).optional(),
  legend: z.any().optional(),
  centerAnnotation: z.any().optional(),
  facet: z.any().optional(),
  markStyle: z.any().optional(),
  autoFit: z.boolean().optional()
});

// Column Chart
const columnSchema = z.object({
  type: z.literal('column'),
  data: z.array(z.object({
    category: z.string(),
    value: z.number(),
    group: z.string().optional()
  })),
  ...baseChartSchema,
  stack: z.boolean().optional()
});

// Area Chart
const areaSchema = z.object({
  type: z.literal('area'),
  data: z.union([
    // Basic x/y
    z.array(z.object({
      x: z.union([z.string(), z.number()]),
      y: z.number(),
      group: z.string().optional()
    })),
    // Legacy time/value (G2 examples)
    z.array(z.object({
      time: z.string(),
      value: z.number(),
      group: z.string().optional()
    })),
    // G2 alias year/value
    z.array(z.object({
      year: z.union([z.string(), z.number()]),
      value: z.number(),
      group: z.string().optional()
    })),
    // Range area
    z.array(z.object({
      x: z.union([z.string(), z.number()]),
      low: z.number(),
      high: z.number()
    })),
    // Fallback: arbitrary records if encode provided in runtime (builder handles)
    z.array(z.record(z.any()))
  ]),
  ...baseChartSchema,
  stack: z.boolean().optional()
});

// Scatter Chart
const scatterSchema = z.object({
  type: z.literal('scatter'),
  data: z.array(z.object({
    x: z.number(),
    y: z.number(),
    size: z.number().optional(),
    group: z.string().optional()
  })),
  ...baseChartSchema
});

// Generic schema for other charts (will be refined later)
const genericSchema = z.object({
  type: z.string(),
  data: z.any(),
  ...baseChartSchema
});

/**
 * Initialize the chart registry with all available builders
 */
export function initializeChartRegistry(): void {
  // Clear existing registrations
  ChartRegistry.clear();

  // Phase 2: POC Charts (G2 v5)
  ChartRegistry.register({
    type: 'bar',
    renderer: 'g2',
    category: 'statistical',
    builder: new BarChartBuilder(),
    schema: barSchema,
    description: 'Bar chart (horizontal/vertical) with advanced axis configuration and interactions using G2 v5'
  });

  ChartRegistry.register({
    type: 'bi-directional-bar',
    renderer: 'g2',
    category: 'statistical',
    builder: new BiDirectionalBarChartBuilder(),
    schema: genericSchema,
    description: 'Bi-directional bar chart (positive-negative) for comparing opposing categories using G2 v5'
  });

  ChartRegistry.register({
    type: 'line',
    renderer: 'g2',
    category: 'statistical',
    builder: new LineChartBuilder(),
    schema: lineSchema,
    description: 'Line chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'pie',
    renderer: 'g2',
    category: 'statistical',
    builder: new PieChartBuilder(),
    schema: pieSchema,
    description: 'Pie chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'donut-chart',
    renderer: 'g2',
    category: 'statistical',
    builder: new DonutChartBuilder(),
    schema: donutSchema,
    description: 'Donut chart (doughnut chart) for showing proportional relationships with better space utilization using G2 v5'
  });

  // Phase 3: Core Charts (G2 v5)
  ChartRegistry.register({
    type: 'column',
    renderer: 'g2',
    category: 'statistical',
    builder: new ColumnChartBuilder(),
    schema: columnSchema,
    description: 'Vertical column chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'area',
    renderer: 'g2',
    category: 'statistical',
    builder: new AreaChartBuilder(),
    schema: areaSchema,
    description: 'Area chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'scatter',
    renderer: 'g2',
    category: 'statistical',
    builder: new ScatterChartBuilder(),
    schema: scatterSchema,
    description: 'Scatter plot using G2 v5'
  });

  ChartRegistry.register({
    type: 'bubble-chart',
    renderer: 'g2',
    category: 'statistical',
    builder: new BubbleChartBuilder(),
    schema: genericSchema,
    description: 'Bubble chart for multivariate data visualization using G2 v5'
  });

  ChartRegistry.register({
    type: 'bubble-map',
    renderer: 'g2',
    category: 'statistical',
    builder: new BubbleMapBuilder(),
    schema: genericSchema,
    description: 'Bubble map for geographic data visualization using G2 v5 geoView'
  });

  ChartRegistry.register({
    type: 'histogram',
    renderer: 'g2',
    category: 'statistical',
    builder: new HistogramBuilder(),
    schema: genericSchema,
    description: 'Histogram using G2 v5'
  });

  ChartRegistry.register({
    type: 'boxplot',
    renderer: 'g2',
    category: 'statistical',
    builder: new BoxplotBuilder(),
    schema: genericSchema,
    description: 'Box plot using G2 v5'
  });

  ChartRegistry.register({
    type: 'radar',
    renderer: 'g2',
    category: 'statistical',
    builder: new RadarChartBuilder(),
    schema: genericSchema,
    description: 'Radar chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'liquid',
    renderer: 'g2',
    category: 'statistical',
    builder: new LiquidChartBuilder(),
    schema: genericSchema,
    description: 'Liquid fill gauge using G2 v5'
  });

  ChartRegistry.register({
    type: 'word-cloud',
    renderer: 'g2',
    category: 'statistical',
    builder: new WordCloudChartBuilder(),
    schema: genericSchema,
    description: 'Word cloud using G2 v5'
  });

  ChartRegistry.register({
    type: 'sankey',
    renderer: 'g2',
    category: 'statistical',
    builder: new SankeyChartBuilder(),
    schema: genericSchema,
    description: 'Sankey diagram using G2 v5'
  });

  ChartRegistry.register({
    type: 'treemap',
    renderer: 'g2',
    category: 'statistical',
    builder: new TreemapChartBuilder(),
    schema: genericSchema,
    description: 'Treemap using G2 v5'
  });

  ChartRegistry.register({
    type: 'dual-axes',
    renderer: 'g2',
    category: 'statistical',
    builder: new DualAxesChartBuilder(),
    schema: genericSchema,
    description: 'Dual-axes chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'funnel',
    renderer: 'g2',
    category: 'statistical',
    builder: new FunnelChartBuilder(),
    schema: genericSchema,
    description: 'Funnel chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'violin',
    renderer: 'g2',
    category: 'statistical',
    builder: new ViolinChartBuilder(),
    schema: genericSchema,
    description: 'Violin plot using G2 v5'
  });

  ChartRegistry.register({
    type: 'venn',
    renderer: 'g2',
    category: 'statistical',
    builder: new VennChartBuilder(),
    schema: genericSchema,
    description: 'Venn diagram using G2 v5'
  });

  // Phase 4: New Charts (G2 v5)
  ChartRegistry.register({
    type: 'heatmap',
    renderer: 'g2',
    category: 'statistical',
    builder: new HeatmapChartBuilder(),
    schema: genericSchema,
    description: 'Heatmap using G2 v5'
  });

  ChartRegistry.register({
    type: 'calendar',
    renderer: 'g2',
    category: 'statistical',
    builder: new CalendarChartBuilder(),
    schema: genericSchema,
    description: 'Calendar chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'sunburst',
    renderer: 'g2',
    category: 'statistical',
    builder: new SunburstChartBuilder(),
    schema: genericSchema,
    description: 'Sunburst chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'gauge',
    renderer: 'g2',
    category: 'statistical',
    builder: new GaugeChartBuilder(),
    schema: genericSchema,
    description: 'Gauge chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'bullet',
    renderer: 'g2',
    category: 'statistical',
    builder: new BulletChartBuilder(),
    schema: genericSchema,
    description: 'Bullet chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'waterfall',
    renderer: 'g2',
    category: 'statistical',
    builder: new WaterfallChartBuilder(),
    schema: genericSchema,
    description: 'Waterfall chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'candlestick',
    renderer: 'g2',
    category: 'statistical',
    builder: new CandlestickChartBuilder(),
    schema: genericSchema,
    description: 'Candlestick chart using G2 v5'
  });

  ChartRegistry.register({
    type: 'density',
    renderer: 'g2',
    category: 'statistical',
    builder: new DensityChartBuilder(),
    schema: genericSchema,
    description: 'Density plot using G2 v5'
  });

  ChartRegistry.register({
    type: 'matrix',
    renderer: 'g2',
    category: 'statistical',
    builder: new MatrixChartBuilder(),
    schema: genericSchema,
    description: 'Matrix chart using G2 v5'
  });

  // Phase 3: Migrated Legacy Charts (G6 v5 + Custom)
  ChartRegistry.register({
    type: 'fishbone-diagram',
    renderer: 'custom',
    category: 'custom',
    builder: new FishboneDiagramBuilder(),
    schema: genericSchema,
    description: 'Fishbone (Ishikawa) diagram for root cause analysis'
  });

  ChartRegistry.register({
    type: 'flow-diagram',
    renderer: 'g6',
    category: 'graph',
    builder: new FlowDiagramBuilder(),
    schema: genericSchema,
    description: 'Flow diagram using G6 v5 dagre layout'
  });

  ChartRegistry.register({
    type: 'network-graph',
    renderer: 'g6',
    category: 'graph',
    builder: new NetworkGraphBuilder(),
    schema: genericSchema,
    description: 'Network graph using G6 v5 circular layout'
  });

  ChartRegistry.register({
    type: 'mind-map',
    renderer: 'g6',
    category: 'graph',
    builder: new MindMapLegacyBuilder(),
    schema: genericSchema,
    description: 'Mind map using G6 v5 tree layout'
  });

  ChartRegistry.register({
    type: 'organization-chart',
    renderer: 'g6',
    category: 'graph',
    builder: new OrganizationChartLegacyBuilder(),
    schema: genericSchema,
    description: 'Organization chart using G6 v5 tree layout'
  });

  // Phase 4: Advanced Composite Charts
  ChartRegistry.register({
    type: 'contour',
    renderer: 'g2',
    category: 'statistical',
    builder: new ContourPlotBuilder(),
    schema: genericSchema,
    description: 'Contour plot showing 3D data as 2D isolines or color-coded cells'
  });

  ChartRegistry.register({
    type: 'contour-line',
    renderer: 'g2',
    category: 'statistical',
    builder: new ContourPlotBuilder(),
    schema: genericSchema,
    description: 'Contour line chart (alias for contour) showing 3D data as 2D isolines or color-coded cells'
  });

  ChartRegistry.register({
    type: 'parallel-coordinates',
    renderer: 'g2',
    category: 'statistical',
    builder: new ParallelCoordinatesBuilder(),
    schema: genericSchema,
    description: 'Parallel coordinates for multivariate data visualization'
  });

  ChartRegistry.register({
    type: 'stream-graph',
    renderer: 'g2',
    category: 'statistical',
    builder: new StreamGraphBuilder(),
    schema: genericSchema,
    description: 'Stream graph showing stacked data with smooth flowing shapes'
  });

  ChartRegistry.register({
    type: 'chord',
    renderer: 'g2',
    category: 'statistical',
    builder: new ChordBuilder(),
    schema: genericSchema,
    description: 'Chord diagram visualizing relationships in circular layout'
  });

  ChartRegistry.register({
    type: 'choropleth-map',
    renderer: 'g2',
    category: 'statistical',
    builder: new ChoroplethMapBuilder(),
    schema: genericSchema,
    description: 'Choropleth map for geographic data visualization using color-coded regions'
  });

  ChartRegistry.register({
    type: 'color-map',
    renderer: 'g2',
    category: 'statistical',
    builder: new ColorMapBuilder(),
    schema: genericSchema,
    description: 'Color map for visualizing relationships between two categorical dimensions using color-encoded grid cells'
  });

  // Phase 5: Advanced G6 Graph Layouts
  ChartRegistry.register({
    type: 'dendrogram',
    renderer: 'g6',
    category: 'graph',
    builder: new DendrogramBuilder(),
    schema: genericSchema,
    description: 'Dendrogram with uniform branch lengths for hierarchical clustering'
  });

  ChartRegistry.register({
    type: 'compact-tree',
    renderer: 'g6',
    category: 'graph',
    builder: new CompactTreeBuilder(),
    schema: genericSchema,
    description: 'Space-efficient tree layout minimizing whitespace'
  });

  ChartRegistry.register({
    type: 'concentric-graph',
    renderer: 'g6',
    category: 'graph',
    builder: new ConcentricGraphBuilder(),
    schema: genericSchema,
    description: 'Concentric circles layout based on node importance'
  });

  ChartRegistry.register({
    type: 'grid-graph',
    renderer: 'g6',
    category: 'graph',
    builder: new GridGraphBuilder(),
    schema: genericSchema,
    description: 'Regular grid arrangement for matrix-like displays'
  });

  ChartRegistry.register({
    type: 'arc-diagram',
    renderer: 'g2',
    category: 'graph',
    builder: new ArcDiagramG2Builder(),
    schema: genericSchema,
    description: 'Linear node arrangement with arc connections above'
  });

  ChartRegistry.register({
    type: 'hierarchical-edge-bundling',
    renderer: 'g6',
    category: 'graph',
    builder: new HierarchicalEdgeBundlingBuilder(),
    schema: genericSchema,
    description: 'Radial tree with bundled edges for reduced visual clutter'
  });
}

// Auto-initialize when module is imported
initializeChartRegistry();
