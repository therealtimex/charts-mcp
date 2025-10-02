/**
 * Dendrogram Builder for G6 v5
 *
 * Tree layout with uniform branch lengths, commonly used in phylogenetics
 * Shows hierarchical clustering with equal spacing between levels
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

export class DendrogramBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { name: 'Root', children: [] };
    const direction = spec.direction || 'LR'; // LR, RL, TB, BT
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { Graph } = G6;

  const treeData = ${JSON.stringify(data)};

  // Convert tree to nodes/edges with computed positions
  function buildDendrogram(root, direction) {
    const nodes = [];
    const edges = [];
    let idCounter = 0;
    const depthMap = new Map();

    function visit(node, depth, parentId) {
      const id = 'node_' + (idCounter++);
      nodes.push({
        id,
        label: node.name || '',
        depth
      });

      if (!depthMap.has(depth)) depthMap.set(depth, []);
      depthMap.get(depth).push(id);

      if (parentId) {
        edges.push({ source: parentId, target: id });
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(child => visit(child, depth + 1, id));
      }
    }

    visit(root, 0, null);

    // Compute positions based on direction
    const W = ${config.width}, H = ${config.height};
    const pad = 60;
    const maxDepth = Math.max(...Array.from(depthMap.keys()));

    if (direction === 'LR' || direction === 'RL') {
      const dx = (W - 2 * pad) / Math.max(1, maxDepth);
      depthMap.forEach((nodeIds, depth) => {
        const x = direction === 'LR'
          ? pad + depth * dx
          : W - pad - depth * dx;
        const spacing = (H - 2 * pad) / Math.max(1, nodeIds.length - 1);
        nodeIds.forEach((id, idx) => {
          const node = nodes.find(n => n.id === id);
          if (node) {
            node.x = x;
            node.y = nodeIds.length === 1 ? H / 2 : pad + idx * spacing;
          }
        });
      });
    } else {
      const dy = (H - 2 * pad) / Math.max(1, maxDepth);
      depthMap.forEach((nodeIds, depth) => {
        const y = direction === 'TB'
          ? pad + depth * dy
          : H - pad - depth * dy;
        const spacing = (W - 2 * pad) / Math.max(1, nodeIds.length - 1);
        nodeIds.forEach((id, idx) => {
          const node = nodes.find(n => n.id === id);
          if (node) {
            node.y = y;
            node.x = nodeIds.length === 1 ? W / 2 : pad + idx * spacing;
          }
        });
      });
    }

    return { nodes, edges };
  }

  const { nodes, edges } = buildDendrogram(treeData, ${JSON.stringify(direction)});

  const graph = new Graph({
    container: 'container',
    width: ${config.width},
    height: ${config.height},
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
        position: ${JSON.stringify(direction === 'LR' || direction === 'RL' ? 'right' : 'bottom')},
        offset: 8,
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
        lineWidth: 1.5
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas']
    },
    fitView: true,
    fitViewPadding: 40
  });

  graph.data({ nodes, edges });
  graph.render();
  graph.fitView();
`;

    return this.buildContainer(spec, chartScript);
  }
}
