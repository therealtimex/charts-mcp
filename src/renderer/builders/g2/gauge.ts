import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Gauge Chart Builder for G2 v5
 *
 * Creates a circular gauge/meter showing a single value within a range.
 * Similar to a speedometer or progress indicator.
 */
export class GaugeChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const value = spec.value ?? 0;
    const min = spec.min ?? 0;
    const max = spec.max ?? 100;
    const color = spec.style?.color ?? '#5B8FF9';
    const ranges = spec.ranges ?? [
      { min: 0, max: 30, color: '#F4664A' },
      { min: 30, max: 70, color: '#FAAD14' },
      { min: 70, max: 100, color: '#30BF78' }
    ];

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 400},
    height: ${spec.height ?? 400},
    theme: ${JSON.stringify(spec.theme ?? "light")},
    autoFit: false
  });

  // Background arc
  chart
    .interval()
    .data([{ value: 1 }])
    .coordinate({ type: 'polar', innerRadius: 0.75, endAngle: Math.PI })
    .encode('y', 'value')
    .style('fill', '#e8e8e8')
    .style('radius', 10)
    .axis(false)
    .legend(false)
    .tooltip(false);

  // Value arc
  const percent = (${value} - ${min}) / (${max} - ${min});
  chart
    .interval()
    .data([{ value: percent }])
    .coordinate({ type: 'polar', innerRadius: 0.75, endAngle: Math.PI })
    .encode('y', 'value')
    .style('fill', ${JSON.stringify(color)})
    .style('radius', 10)
    .axis(false)
    .legend(false)
    .tooltip(false);

  // Center text
  chart
    .text()
    .data([{ value: ${value} }])
    .encode('text', (d) => \`\${d.value}\`)
    .style('x', '50%')
    .style('y', '70%')
    .style('fontSize', 48)
    .style('fontWeight', 'bold')
    .style('fill', '#333')
    .style('textAlign', 'center')
    .tooltip(false);

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
