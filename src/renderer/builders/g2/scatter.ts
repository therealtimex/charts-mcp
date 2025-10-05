/**
 * G2 v5 Scatter Chart Builder
 * Builds scatter plots using @antv/g2 v5
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ScatterChartBuilder extends ChartBuilder {
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
    const pointSize = spec.size || 4;

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: false
  });

  chart
    .point()
    .data(${JSON.stringify(data)})
    .encode('x', 'x')
    .encode('y', 'y')
    ${hasGroup ? `.encode('color', 'group')` : `.encode('color', ${this.getPointColor(spec)})`}
    ${this.hasSizeField(data) ? `.encode('size', 'size')` : `.encode('size', ${pointSize})`}
    .encode('shape', 'point')
    ${this.buildColorConfig(spec)}
    ${this.buildAxisConfig(spec)}
    .legend(${hasGroup ? 'true' : 'false'})
    .style('fillOpacity', 0.7)
    .style('stroke', '#fff')
    .style('lineWidth', 1);

  chart.render();
</script>`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private hasSizeField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.size != null);
  }

  private getPointColor(spec: ChartSpec): string {
    const palette = spec.style?.palette;
    if (palette && palette.length > 0) {
      return JSON.stringify(palette[0]);
    }
    return JSON.stringify('#5B8FF9');
  }
}
