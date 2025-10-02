import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Sunburst Chart Builder for G2 v5
 *
 * Displays hierarchical data in concentric circles.
 * Inner circles represent higher hierarchy levels, outer circles represent deeper levels.
 */
export class SunburstChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  /**
   * Flatten hierarchical tree data for G2 v5
   * Adds path and depth information
   */
  private flattenHierarchy(nodes: any[], path: string[] = [], depth: number = 0): any[] {
    const result: any[] = [];

    nodes.forEach((node: any) => {
      const currentPath = [...path, node.name];

      result.push({
        name: node.name,
        value: node.value,
        path: currentPath.join('/'),
        depth: depth,
        fullPath: currentPath
      });

      if (node.children && node.children.length > 0) {
        result.push(...this.flattenHierarchy(node.children, currentPath, depth + 1));
      }
    });

    return result;
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const palette = spec.style?.palette ?? ["#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E86452", "#6DC8EC", "#945FB9", "#FF9845", "#1E9493", "#FF99C3"];

    const flatData = this.flattenHierarchy(data);

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 600},
    height: ${spec.height ?? 600},
    theme: ${JSON.stringify(spec.theme ?? "light")},
    autoFit: false
  });

  chart
    .interval()
    .data(${JSON.stringify(flatData)})
    .transform({ type: 'pack' })
    .coordinate({ type: 'polar', innerRadius: 0.2 })
    .encode('value', 'value')
    .encode('color', 'name')
    .scale('color', { range: ${JSON.stringify(palette)} })
    .style('stroke', '#fff')
    .style('lineWidth', 1.5)
    .label({
      text: 'name',
      position: 'inside',
      transform: [{ type: 'overlapHide' }],
      style: {
        fontSize: 10,
        fill: '#fff',
        fontWeight: 'bold'
      }
    })
    .tooltip({
      title: 'name',
      items: [
        { field: 'value', name: 'Value' },
        { field: 'path', name: 'Path' }
      ]
    })
    .legend(false);

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
