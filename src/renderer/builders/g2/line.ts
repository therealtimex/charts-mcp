/**
 * G2 v5 Line Chart Builder
 * Builds line charts using @antv/g2 v5
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class LineChartBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400 } = spec;
    const hasGroup = this.hasGroupField(data);
    const smooth = spec.smooth !== false; // Default to smooth

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  chart
    .line()
    .data(${JSON.stringify(data)})
    .encode('x', 'time')
    .encode('y', 'value')
    ${hasGroup ? `.encode('color', 'group')` : `.encode('color', ${this.getLineColor(spec)})`}
    ${hasGroup ? `.encode('series', 'group')` : ''}
    ${smooth ? `.style('shape', 'smooth')` : ''}
    ${this.buildColorConfig(spec)}
    ${this.buildAxisConfig(spec)}
    .legend(${hasGroup ? 'true' : 'false'});

  // Add points to the line
  chart
    .point()
    .data(${JSON.stringify(data)})
    .encode('x', 'time')
    .encode('y', 'value')
    ${hasGroup ? `.encode('color', 'group')` : `.encode('color', ${this.getLineColor(spec)})`}
    ${hasGroup ? `.encode('series', 'group')` : ''}
    .encode('shape', 'point')
    .encode('size', 3)
    ${this.buildColorConfig(spec)}
    .tooltip(false);

  chart.render();
</script>`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private getLineColor(spec: ChartSpec): string {
    const palette = spec.style?.palette;
    if (palette && palette.length > 0) {
      return JSON.stringify(palette[0]);
    }
    return JSON.stringify('#5B8FF9'); // Default G2 blue
  }
}
