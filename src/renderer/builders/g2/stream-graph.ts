/**
 * Stream Graph Builder for G2 v5
 *
 * Stacked area chart with organic, flowing shapes
 * Displays data over time with smooth transitions between categories
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class StreamGraphBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data = [], theme = 'light', width = 800, height = 400 } = spec;

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  // Data format: [{ time: "2020-01", category: "A", value: 100 }, ...]
  const data = ${JSON.stringify(data)};

  chart
    .area()
    .data(data)
    .encode('x', 'time')
    .encode('y', 'value')
    .encode('color', 'category')
    .encode('shape', 'smooth')
    .transform({ type: 'stackY' })
    .transform({ type: 'symmetryY' }) // Center the stream around y=0
    .style('fillOpacity', 0.85)
    ${this.buildColorConfig(spec)}
    ${this.buildAxisConfig(spec)}
    .scale('x', {
      type: 'band'
    })
    .axis('x', {
      title: false,
      labelAutoRotate: false
    })
    .axis('y', {
      labelFormatter: (d) => Math.abs(d).toString()
    })
    .legend('color', {
      position: 'top',
      layout: { justifyContent: 'center' }
    })
    .interaction('tooltip', {
      shared: true,
      sort: (a, b) => b.value - a.value
    });

  chart.render();
</script>`;
  }
}
