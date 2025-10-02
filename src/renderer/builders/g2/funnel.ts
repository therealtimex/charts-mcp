import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Funnel Chart Builder for G2 v5
 *
 * Uses G2 v5's interval mark with funnel transform to visualize
 * progressive reduction through stages (e.g., conversion funnels).
 */
export class FunnelChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
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
    .interval()
    .coordinate({ type: 'transpose', transform: [{ type: 'symmetryY' }] })
    .transform({ type: 'stackY' })
    .data(${JSON.stringify(data)})
    .encode('x', 'category')
    .encode('y', 'value')
    .encode('color', 'category')
    .scale('color', { range: ${JSON.stringify(palette)} })
    .style('maxWidth', 80)
    .style('radius', 4)
    .label({
      text: (d) => \`\${d.category}: \${d.value}\`,
      position: 'inside',
      style: { fontSize: 12, fill: '#fff' }
    })
    .legend({ position: 'bottom' });

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
