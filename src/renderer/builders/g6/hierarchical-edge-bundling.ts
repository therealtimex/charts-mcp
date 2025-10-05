/**
 * Hierarchical Edge Bundling Builder for G6 v5
 *
 * Radial tree layout with bundled edges for reduced visual clutter
 * Shows hierarchical relationships with grouped connections
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

export class HierarchicalEdgeBundlingBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { name: 'Root', children: [], edges: [] };
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { Graph } = G6;

  const treeData = ${JSON.stringify(data)};

  // Convert tree to nodes with radial positions
  function buildRadialTree(root) {
    const nodes = [];
    const treeEdges = [];
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
        treeEdges.push({ source: parentId, target: id });
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(child => visit(child, depth + 1, id));
      }
    }

    visit(root, 0, null);

    // Compute radial positions
    const W = ${config.width}, H = ${config.height};
    const cx = W / 2, cy = H / 2;
    const maxDepth = Math.max(...Array.from(depthMap.keys()));
    const maxRadius = Math.min(W, H) / 2 - 60;

    let angleOffset = 0;
    depthMap.forEach((nodeIds, depth) => {
      const radius = depth === 0 ? 0 : (depth / maxDepth) * maxRadius;
      const angleStep = nodeIds.length > 1 ? (2 * Math.PI) / nodeIds.length : 0;

      nodeIds.forEach((id, idx) => {
        const angle = angleOffset + idx * angleStep;
        const node = nodes.find(n => n.id === id);
        if (node) {
          node.x = cx + radius * Math.cos(angle);
          node.y = cy + radius * Math.sin(angle);
        }
      });
    });

    // Add cross-links if provided
    const crossLinks = Array.isArray(treeData.edges) ? treeData.edges : [];
    const allEdges = [...treeEdges, ...crossLinks];

    return { nodes, edges: allEdges };
  }

  const { nodes, edges } = buildRadialTree(treeData);

  const graph = new Graph({
    container: 'container',
    width: ${config.width},
    height: ${config.height},
    layout: false,
    node: {
      type: 'circle',
      style: {
        size: 16,
        fill: '#5B8FF9',
        stroke: '#fff',
        lineWidth: 1.5
      },
      labelCfg: {
        position: 'bottom',
        offset: 6,
        style: {
          fontSize: 10,
          fill: '#333'
        }
      }
    },
    edge: {
      type: 'cubic',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 1,
        opacity: 0.4,
        endArrow: false
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
