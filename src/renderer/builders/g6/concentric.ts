/**
 * Concentric Graph Builder for G6 v5
 *
 * Places nodes in concentric circles based on importance/degree
 * Central nodes are more important/connected
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

export class ConcentricGraphBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { nodes: [], edges: [] };
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { Graph } = G6;

  const rawData = ${this.escapeGraphData(data)};

  // Calculate node degrees for ranking
  const degrees = new Map();
  rawData.nodes.forEach(n => degrees.set(n.id, 0));
  rawData.edges.forEach(e => {
    degrees.set(e.source, (degrees.get(e.source) || 0) + 1);
    degrees.set(e.target, (degrees.get(e.target) || 0) + 1);
  });

  // Sort nodes by degree (most connected in center)
  const sortedNodes = [...rawData.nodes].sort((a, b) =>
    (degrees.get(b.id) || 0) - (degrees.get(a.id) || 0)
  );

  // Assign concentric positions
  const W = ${config.width}, H = ${config.height};
  const cx = W / 2, cy = H / 2;
  const maxRadius = Math.min(W, H) / 2 - 60;
  const levels = Math.ceil(Math.sqrt(sortedNodes.length));

  sortedNodes.forEach((node, idx) => {
    const level = Math.floor(idx / Math.max(1, Math.ceil(sortedNodes.length / levels)));
    const radius = (level / Math.max(1, levels - 1)) * maxRadius;
    const nodesInLevel = Math.ceil(sortedNodes.length / levels);
    const angleStep = (2 * Math.PI) / nodesInLevel;
    const angle = (idx % nodesInLevel) * angleStep;

    node.x = cx + radius * Math.cos(angle);
    node.y = cy + radius * Math.sin(angle);
  });

  const graph = new Graph({
    container: 'container',
    width: W,
    height: H,
    layout: false,
    node: {
      type: 'circle',
      style: {
        size: 24,
        fill: '#5B8FF9',
        stroke: '#fff',
        lineWidth: 2
      },
      labelCfg: {
        position: 'bottom',
        offset: 6,
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
