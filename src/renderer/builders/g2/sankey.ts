import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Sankey Chart Builder for G2 v5
 *
 * Uses G2 v5's sankey mark to visualize flow between nodes.
 * Shows source → target relationships with link width proportional to value.
 */
export class SankeyChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const nodeAlign = spec.nodeAlign ?? "justify";
    const palette = spec.style?.palette ?? ["#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E86452"];

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
    .sankey()
    .data(${JSON.stringify(data)})
    .encode('source', 'source')
    .encode('target', 'target')
    .encode('value', 'value')
    .scale('color', { range: ${JSON.stringify(palette)} })
    .style('nodeAlign', ${JSON.stringify(nodeAlign)})
    .style('nodePadding', 0.03)
    .style('linkOpacity', 0.4)
    .style('nodeWidth', 0.008)
    .legend(false);

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
