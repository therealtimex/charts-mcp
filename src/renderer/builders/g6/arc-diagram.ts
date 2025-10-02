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

    const chartScript = `
  const { Graph } = G6;

  const rawData = ${this.escapeGraphData(data)};

  // Arrange nodes in a horizontal line
  const W = ${config.width}, H = ${config.height};
  const pad = 60;
  const nodes = rawData.nodes || [];
  const y = H * 0.75; // Place nodes in lower 3/4
  const spacing = nodes.length > 1 ? (W - 2 * pad) / (nodes.length - 1) : 0;

  nodes.forEach((node, idx) => {
    node.x = nodes.length === 1 ? W / 2 : pad + idx * spacing;
    node.y = y;
  });

  const graph = new Graph({
    container: 'container',
    width: W,
    height: H,
    layout: false,
    node: {
      type: 'circle',
      style: {
        size: 20,
        fill: '#5B8FF9',
        stroke: '#fff',
        lineWidth: 2
      },
      labelCfg: {
        position: 'bottom',
        offset: 8,
        style: {
          fontSize: 11,
          fill: '#333'
        }
      }
    },
    edge: {
      type: 'quadratic',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 1.5,
        opacity: 0.6,
        curveOffset: -80, // Arc above nodes
        endArrow: {
          path: 'M 0,0 L 6,3 L 6,-3 Z',
          fill: '#A3B1BF'
        }
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas']
    },
    fitView: true,
    fitViewPadding: 40
  });

  graph.data(rawData);
  graph.render();
  graph.fitView();
`;

    return this.buildContainer(spec, chartScript);
  }
}
