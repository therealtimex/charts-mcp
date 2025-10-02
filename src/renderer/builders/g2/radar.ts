/**
 * G2 v5 Radar Chart Builder
 * Builds radar charts using @antv/g2 v5 with polar coordinates
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class RadarChartBuilder extends ChartBuilder {
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
    const lineWidth = spec.style?.lineWidth || 2;

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  // Area layer for filled regions
  chart
    .area()
    .data(${JSON.stringify(data)})
    .encode('x', 'name')
    .encode('y', 'value')
    ${hasGroup ? `.encode('color', 'group')` : `.encode('color', ${this.getRadarColor(spec)})`}
    ${hasGroup ? `.encode('series', 'group')` : ''}
    .coordinate({ type: 'polar' })
    ${this.buildColorConfig(spec)}
    .scale('x', { padding: 0.5, align: 0 })
    .scale('y', { domainMin: 0 })
    .style('fillOpacity', 0.3)
    .axis('x', {
      grid: true,
      gridLineWidth: 1,
      gridLineDash: [0, 0]
    })
    .axis('y', {
      gridLineWidth: 1,
      gridLineDash: [4, 4],
      gridConnect: 'line'
    });

  // Line layer for borders
  chart
    .line()
    .data(${JSON.stringify(data)})
    .encode('x', 'name')
    .encode('y', 'value')
    ${hasGroup ? `.encode('color', 'group')` : `.encode('color', ${this.getRadarColor(spec)})`}
    ${hasGroup ? `.encode('series', 'group')` : ''}
    .coordinate({ type: 'polar' })
    ${this.buildColorConfig(spec)}
    .scale('x', { padding: 0.5, align: 0 })
    .scale('y', { domainMin: 0 })
    .style('lineWidth', ${lineWidth})
    .legend(${hasGroup ? 'true' : 'false'})
    .tooltip(false);

  // Point layer
  chart
    .point()
    .data(${JSON.stringify(data)})
    .encode('x', 'name')
    .encode('y', 'value')
    ${hasGroup ? `.encode('color', 'group')` : `.encode('color', ${this.getRadarColor(spec)})`}
    ${hasGroup ? `.encode('series', 'group')` : ''}
    .coordinate({ type: 'polar' })
    ${this.buildColorConfig(spec)}
    .scale('x', { padding: 0.5, align: 0 })
    .scale('y', { domainMin: 0 })
    .encode('size', 3)
    .encode('shape', 'point')
    .tooltip(false);

  chart.render();
</script>`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private getRadarColor(spec: ChartSpec): string {
    const palette = spec.style?.palette;
    if (palette && palette.length > 0) {
      return JSON.stringify(palette[0]);
    }
    return JSON.stringify('#5B8FF9');
  }
}
