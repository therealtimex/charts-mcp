/**
 * Parallel Coordinates Builder for G2 v5
 *
 * Visualizes multivariate data where each variable is represented by a vertical axis
 * Lines connect data points across all dimensions
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ParallelCoordinatesBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data = [], theme = 'light', width = 800, height = 400 } = spec;
    const dimensions = spec.dimensions || [];

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false,
    paddingLeft: 60,
    paddingRight: 60
  });

  // Data format: [{ name: "A", dim1: 10, dim2: 20, dim3: 30, ... }]
  const data = ${JSON.stringify(data)};
  const dimensions = ${JSON.stringify(dimensions)};

  // Transform data to parallel coordinates format
  const transformed = [];
  data.forEach((item, idx) => {
    dimensions.forEach((dim, dimIdx) => {
      transformed.push({
        name: item.name || 'Item ' + idx,
        dimension: dim,
        value: item[dim] || 0,
        dimIndex: dimIdx,
        itemIndex: idx
      });
    });
  });

  chart
    .line()
    .data(transformed)
    .encode('x', 'dimension')
    .encode('y', 'value')
    .encode('color', 'name')
    .encode('series', 'itemIndex')
    .style('lineWidth', 2)
    .style('opacity', 0.6)
    ${this.buildColorConfig(spec)}
    .scale('x', { type: 'point' })
    .axis('x', {
      title: false,
      labelAutoRotate: false
    })
    .axis('y', {
      grid: true,
      title: false
    })
    .legend('color', {
      position: 'top',
      layout: { justifyContent: 'center' }
    })
    .interaction('tooltip', { shared: true });

  chart.render();
</script>`;
  }
}
