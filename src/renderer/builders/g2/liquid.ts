import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Liquid Chart Builder for G2 v5
 *
 * Uses G2 v5's liquid mark to create progress/percentage visualizations.
 * Supports multiple shapes: circle, rect, pin, triangle.
 */
export class LiquidChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const percent = spec.percent ?? 0;
    const shape = spec.shape ?? "circle";
    const color = spec.style?.color ?? "#5B8FF9";

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
    .liquid()
    .data({ value: ${percent} })
    .style('shape', ${JSON.stringify(shape)})
    .style('fill', ${JSON.stringify(color)})
    .style('outlineBorder', 4)
    .style('outlineDistance', 8)
    .style('waveLength', 128);

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
