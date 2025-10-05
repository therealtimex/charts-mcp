import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Density Heatmap Chart Builder for G2 v5
 *
 * Shows 2D density distribution using color intensity.
 * Useful for visualizing point density in scatter plots.
 */
export class DensityChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const colorScheme = spec.style?.colorScheme ?? ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 600},
    height: ${spec.height ?? 400},
    theme: ${JSON.stringify(spec.theme ?? "light")},
    autoFit: false
  });

  chart
    .rect()
    .data(${JSON.stringify(data)})
    .transform({ type: 'bin', thresholdsX: 20, thresholdsY: 20 })
    .transform({ type: 'stackY' })
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('color', 'count')
    .scale('color', {
      type: 'sequential',
      range: ${JSON.stringify(colorScheme)}
    })
    .style('inset', 0.5)
    .tooltip({
      items: [
        { field: 'count', name: 'Density' }
      ]
    })
    .legend({ position: 'right' });

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
