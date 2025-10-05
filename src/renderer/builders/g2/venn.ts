import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Venn Diagram Builder for G2 v5
 *
 * Note: G2 v5 doesn't have a native Venn mark, so we simulate it using circles
 * positioned manually. This is a simplified implementation for up to 3 sets.
 * For more complex Venn diagrams, consider using a dedicated library.
 */
export class VennChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  /**
   * Calculate positions for Venn circles based on number of sets
   * This is a simplified layout - production version would use proper Venn layout algorithms
   */
  private calculateVennLayout(data: any[]): any {
    const sets = new Set<string>();
    data.forEach((d: any) => d.sets?.forEach((s: string) => sets.add(s)));
    const setArray = Array.from(sets);

    const layout: any = { circles: [], labels: [] };

    if (setArray.length === 2) {
      // Two circles overlapping
      layout.circles = [
        { set: setArray[0], x: 0.35, y: 0.5, r: 0.25 },
        { set: setArray[1], x: 0.65, y: 0.5, r: 0.25 }
      ];
    } else if (setArray.length === 3) {
      // Three circles in triangle formation
      layout.circles = [
        { set: setArray[0], x: 0.5, y: 0.35, r: 0.22 },
        { set: setArray[1], x: 0.35, y: 0.65, r: 0.22 },
        { set: setArray[2], x: 0.65, y: 0.65, r: 0.22 }
      ];
    } else {
      // Single circle or fallback
      layout.circles = [{ set: setArray[0], x: 0.5, y: 0.5, r: 0.3 }];
    }

    return layout;
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const palette = spec.style?.palette ?? ["#5B8FF9", "#5AD8A6", "#5D7092"];
    const layout = this.calculateVennLayout(data);

    // Create visual data for circles
    const circleData = layout.circles.map((c: any, idx: number) => ({
      ...c,
      color: palette[idx % palette.length],
      // Find value for this set
      value: data.find((d: any) => d.sets?.length === 1 && d.sets[0] === c.set)?.value || 0
    }));

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 600},
    height: ${spec.height ?? 400},
    theme: ${JSON.stringify(spec.theme ?? "light")},
    autoFit: false,
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 40,
    paddingBottom: 40
  });

  // Draw circles using point mark with large size
  const circleData = ${JSON.stringify(circleData)};

  chart
    .point()
    .data(circleData)
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('size', (d) => d.r * 10000)
    .encode('color', 'set')
    .encode('shape', 'point')
    .scale('x', { domain: [0, 1] })
    .scale('y', { domain: [0, 1] })
    .scale('color', { range: ${JSON.stringify(palette)} })
    .style('fillOpacity', 0.3)
    .style('stroke', (d) => d.color)
    .style('lineWidth', 2)
    .axis(false)
    .legend({ position: 'bottom' })
    .tooltip({
      title: 'set',
      items: [{ field: 'value', name: 'Count' }]
    });

  // Add labels for sets
  chart
    .text()
    .data(circleData)
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('text', (d) => \`\${d.set}\\n\${d.value}\`)
    .style('fontSize', 14)
    .style('fontWeight', 'bold')
    .style('textAlign', 'center')
    .style('fill', '#333')
    .tooltip(false);

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
