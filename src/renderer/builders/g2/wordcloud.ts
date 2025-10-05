import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Word Cloud Chart Builder for G2 v5
 *
 * Uses G2 v5's wordCloud mark to visualize text frequency/importance.
 * Words are sized by their value and arranged to maximize space.
 */
export class WordCloudChartBuilder extends ChartBuilder {
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
    theme: ${JSON.stringify(((spec.theme as any) === 'default' ? 'classic' : (spec.theme ?? 'light')))},
    autoFit: false
  });

  chart
    .wordCloud()
    .data(${JSON.stringify(data)})
    .encode('color', 'text')
    .encode('fontSize', 'value')
    .scale('fontSize', { range: [10, 60] })
    .scale('color', { range: ${JSON.stringify(palette)} })
    .legend(false)
    .style('fontFamily', 'Verdana')
    .style('padding', 2)
    .style('spiral', 'archimedean')
    .style('random', () => 0.5);

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
