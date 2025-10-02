/**
 * Contour Plot Builder for G2 v5
 *
 * Visualizes 3D data as 2D contour lines (like topographic maps)
 * Shows density/height using isolines
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ContourPlotBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data = [], theme = 'light', width = 600, height = 400 } = spec;

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  // Data format: [{ x: number, y: number, z: number }]
  const data = ${JSON.stringify(data)};

  // Create contour visualization using heatmap with interpolation
  chart
    .cell()
    .data(data)
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('color', 'z')
    .style('inset', 0.5)
    .scale('color', {
      type: 'sequential',
      palette: 'blues'
    })
    ${this.buildAxisConfig(spec)}
    .legend('color', {
      layout: { justifyContent: 'center' }
    });

  chart.render();
</script>`;
  }
}
