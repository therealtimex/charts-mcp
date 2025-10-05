import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Violin Chart Builder for G2 v5
 *
 * Uses G2 v5's violin mark to show distribution of data across categories.
 * Similar to boxplot but shows full distribution density.
 */
export class ViolinChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const palette = spec.style?.palette ?? ["#5B8FF9", "#5AD8A6", "#5D7092"];
    const axisXTitle = spec.axisXTitle || "";
    const axisYTitle = spec.axisYTitle || "";

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
    .violin()
    .data(${JSON.stringify(data)})
    .encode('x', 'category')
    .encode('y', 'value')
    .encode('color', ${data.some((d: any) => d.group) ? "'group'" : "'category'"})
    .encode('series', ${data.some((d: any) => d.group) ? "'group'" : "null"})
    .scale('color', { range: ${JSON.stringify(palette)} })
    .style('stroke', '#fff')
    .style('lineWidth', 1)
    ${axisXTitle ? `.axis('x', { title: { text: ${JSON.stringify(axisXTitle)} } })` : ''}
    ${axisYTitle ? `.axis('y', { title: { text: ${JSON.stringify(axisYTitle)} } })` : ''}
    .legend({ position: 'bottom' });

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
