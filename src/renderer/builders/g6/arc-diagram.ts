/**
 * Arc Diagram Builder for G6 v5
 *
 * Nodes arranged in a line, connections shown as arcs above
 * Useful for visualizing sequential relationships
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

export class ArcDiagramBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { nodes: [], edges: [] };
    const config = this.buildG6Config(spec);
    const layout = spec.layout || 'linear';

    const chartScript = `
  const { Graph } = G6;

  const rawData = ${this.escapeGraphData(data)};
  const layout = '${layout}';

  const W = ${config.width}, H = ${config.height};
  const nodes = rawData.nodes || [];

  // Position nodes based on layout type
  if (layout === 'circular') {
    // Circular layout: arrange nodes in a circle
    const centerX = W / 2;
    const centerY = H / 2;
    const radius = Math.min(W, H) / 2 - 80;
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, idx) => {
      const angle = idx * angleStep - Math.PI / 2; // Start from top
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
  } else {
    // Linear layout: arrange nodes in a horizontal line
    const pad = 60;
    const y = H * 0.75; // Place nodes in lower 3/4
    const spacing = nodes.length > 1 ? (W - 2 * pad) / (nodes.length - 1) : 0;

    nodes.forEach((node, idx) => {
      node.x = nodes.length === 1 ? W / 2 : pad + idx * spacing;
      node.y = y;
    });
  }

  const graph = new Graph({
    container: 'container',
    width: W,
    height: H,
    data: rawData,
    node: {
      style: {
        size: 20,
        fill: '#5B8FF9',
        stroke: '#fff',
        lineWidth: 2,
        labelText: (d) => d.label || d.id,
        labelFill: '#333',
        labelFontSize: 11,
        labelPlacement: layout === 'circular' ? 'center' : 'bottom',
        labelOffsetY: layout === 'circular' ? 0 : 15
      }
    },
    edge: {
      style: {
        stroke: '#A3B1BF',
        lineWidth: 1.5,
        opacity: 0.6,
        endArrow: true
      },
      type: 'quadratic'
    },
    behaviors: ['drag-canvas', 'zoom-canvas']
  });

  graph.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
