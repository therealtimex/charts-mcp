import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Treemap Chart Builder for G2 v5
 *
 * Uses G2 v5's treemap mark to visualize hierarchical data.
 * Displays nested rectangles sized by value, ideal for showing proportions within a hierarchy.
 */
export class TreemapChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  /**
   * Flattens hierarchical data structure for G2 v5 treemap
   * Converts tree with children into flat array with path property
   */
  private flattenTreeData(nodes: any[]): any[] {
    const result: any[] = [];

    const flatten = (node: any, path: string[] = []) => {
      const currentPath = [...path, node.name];

      result.push({
        name: node.name,
        value: node.value,
        path: currentPath.join('/')
      });

      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => flatten(child, currentPath));
      }
    };

    nodes.forEach(node => flatten(node));
    return result;
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const palette = spec.style?.palette ?? ["#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E86452", "#6DC8EC", "#945FB9"];

    // Flatten hierarchical data for G2 v5
    const flatData = this.flattenTreeData(data);

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
    .treemap()
    .data(${JSON.stringify(flatData)})
    .encode('value', 'value')
    .encode('color', 'name')
    .scale('color', { range: ${JSON.stringify(palette)} })
    .style('stroke', '#fff')
    .style('lineWidth', 1)
    .label({
      text: 'name',
      position: 'inside',
      style: { fontSize: 12, fill: '#fff' }
    })
    .tooltip({
      title: 'name',
      items: [{ field: 'value', name: 'Value' }]
    });

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
