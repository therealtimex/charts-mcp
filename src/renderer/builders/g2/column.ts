/**
 * G2 v5 Column Chart Builder
 * Builds vertical column charts using @antv/g2 v5
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ColumnChartBuilder extends ChartBuilder {
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
    const isStacked = spec.stack === true;

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
    .interval()
    .data(${JSON.stringify(data)})
    .encode('x', 'category')
    .encode('y', 'value')
    ${hasGroup ? `.encode('color', 'group')` : this.buildCategoryColor(spec)}
    ${hasGroup && isStacked ? `.transform({ type: 'stackY' })` : ''}
    ${hasGroup && !isStacked ? `.transform({ type: 'dodgeX' })` : ''}
    ${this.buildColorConfig(spec)}
    ${this.buildAxisConfig(spec)}
    .legend(${hasGroup ? 'true' : 'false'});

  chart.render();
</script>`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private buildCategoryColor(spec: ChartSpec): string {
    const palette = spec.style?.palette;
    if (!palette || palette.length === 0) {
      return '';
    }
    return `.encode('color', 'category')`;
  }
}
