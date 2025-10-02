import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Heatmap Chart Builder for G2 v5
 *
 * Uses G2 v5's cell/rect mark to create 2D heatmaps showing data intensity.
 * Color encodes the value, position encodes x/y dimensions.
 */
export class HeatmapChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const colorScheme = spec.style?.colorScheme ?? ['#f7fbff', '#08519c']; // Blue gradient

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
    .cell()
    .data(${JSON.stringify(data)})
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('color', 'value')
    .scale('color', {
      type: 'sequential',
      range: ${JSON.stringify(colorScheme)}
    })
    .style('stroke', '#fff')
    .style('lineWidth', 1)
    .style('inset', 0.5)
    .tooltip({
      title: (d) => \`(\${d.x}, \${d.y})\`,
      items: [{ field: 'value', name: 'Value' }]
    })
    .legend({ position: 'right', layout: { justifyContent: 'center' } });

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
