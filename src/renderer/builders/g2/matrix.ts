import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Matrix Chart Builder for G2 v5
 *
 * Correlation matrix or confusion matrix visualization.
 * Shows relationships between multiple variables in a grid.
 */
export class MatrixChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const colorScheme = spec.style?.colorScheme ?? ['#053061', '#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
    const showValues = spec.showValues ?? true;

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 600},
    height: ${spec.height ?? 600},
    theme: ${JSON.stringify(((spec.theme as any) === 'default' ? 'classic' : (spec.theme ?? 'light')))},
    autoFit: false
  });

  chart
    .cell()
    .data(${JSON.stringify(data)})
    .encode('x', 'xField')
    .encode('y', 'yField')
    .encode('color', 'value')
    .scale('color', {
      type: 'diverging',
      range: ${JSON.stringify(colorScheme)}
    })
    .style('stroke', '#fff')
    .style('lineWidth', 1)
    .style('inset', 0.5)
    ${showValues ? `.label({
      text: (d) => d.value.toFixed(2),
      position: 'inside',
      style: {
        fontSize: 10,
        fill: (d) => Math.abs(d.value) > 0.5 ? '#fff' : '#333'
      }
    })` : ''}
    .tooltip({
      title: (d) => \`(\${d.xField}, \${d.yField})\`,
      items: [{ field: 'value', name: 'Correlation' }]
    })
    .legend({ position: 'right' });

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
