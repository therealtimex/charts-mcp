/**
 * Compact Tree Builder for G6 v5
 *
 * Space-efficient tree layout that minimizes whitespace
 * Better for large hierarchies with many nodes
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

export class CompactTreeBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { name: 'Root', children: [] };
    const direction = spec.direction || 'TB';
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { Graph } = G6;

  const treeData = ${JSON.stringify(data)};

  const graph = new Graph({
    container: 'container',
    width: ${config.width},
    height: ${config.height},
    layout: {
      type: 'compactBox',
      direction: ${JSON.stringify(direction)},
      getWidth: () => 140,
      getHeight: () => 40,
      getHGap: () => 30,
      getVGap: () => 30
    },
    node: {
      type: 'rect',
      style: {
        size: [120, 36],
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        lineWidth: 2,
        radius: 6
      },
      labelCfg: {
        style: {
          fontSize: 11,
          fill: '#333'
        }
      }
    },
    edge: {
      type: 'polyline',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 1.5,
        radius: 8
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    },
    fitView: true,
    fitViewPadding: 40
  });

  // Transform tree data to G6 format
  function transformTree(node, parent = null) {
    const result = {
      id: node.name + '_' + Math.random().toString(36).substr(2, 9),
      label: node.name || '',
      children: []
    };

    if (Array.isArray(node.children)) {
      result.children = node.children.map(child => transformTree(child, result));
    }

    return result;
  }

  const g6Data = transformTree(treeData);
  graph.data(g6Data);
  graph.render();
  graph.fitView();
`;

    return this.buildContainer(spec, chartScript);
  }
}
