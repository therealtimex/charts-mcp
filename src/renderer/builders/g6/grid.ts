/**
 * Grid Graph Builder for G6 v5
 *
 * Arranges nodes in a regular grid pattern
 * Useful for matrix-like relationships or organized displays
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

export class GridGraphBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { nodes: [], edges: [] };
    const config = this.buildG6Config(spec);
    const cols = spec.cols || Math.ceil(Math.sqrt(data.nodes?.length || 1));

    const chartScript = `
  const { Graph } = G6;

  const rawData = ${this.escapeGraphData(data)};
  const cols = ${cols};

  // Arrange nodes in grid
  const W = ${config.width}, H = ${config.height};
  const pad = 60;
  const nodes = rawData.nodes || [];
  const rows = Math.ceil(nodes.length / cols);

  const cellWidth = (W - 2 * pad) / Math.max(1, cols - 1);
  const cellHeight = (H - 2 * pad) / Math.max(1, rows - 1);

  nodes.forEach((node, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    node.x = cols === 1 ? W / 2 : pad + col * cellWidth;
    node.y = rows === 1 ? H / 2 : pad + row * cellHeight;
  });

  const graph = new Graph({
    container: 'container',
    width: W,
    height: H,
    layout: false,
    node: {
      type: 'rect',
      style: {
        size: [80, 40],
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        lineWidth: 2,
        radius: 4
      },
      labelCfg: {
        style: {
          fontSize: 11,
          fill: '#333'
        }
      }
    },
    edge: {
      type: 'line',
      style: {
        stroke: '#e2e2e2',
        lineWidth: 1,
        endArrow: {
          path: 'M 0,0 L 6,3 L 6,-3 Z',
          fill: '#A3B1BF'
        }
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
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
