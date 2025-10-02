/**
 * G2 v5 Pie Chart Builder
 * Builds pie/donut charts using @antv/g2 v5 with polar coordinates
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class PieChartBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400 } = spec;
    const innerRadius = typeof spec.innerRadius === 'number' ? spec.innerRadius : 0;

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
    .interval()
    .data(${JSON.stringify(data)})
    .transform({ type: 'stackY' })
    .coordinate({ type: 'theta', innerRadius: ${innerRadius} })
    .encode('y', 'value')
    .encode('color', 'category')
    ${this.buildColorConfig(spec)}
    .legend('color', {
      position: 'right',
      layout: { justifyContent: 'center' }
    })
    .label({
      text: 'value',
      style: {
        fontWeight: 'bold',
        offset: 10
      }
    })
    .tooltip({
      items: [
        { channel: 'color', name: 'category' },
        { channel: 'y', name: 'value' }
      ]
    });

  chart.render();
</script>`;
  }
}
