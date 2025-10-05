/**
 * Mind Map Builder
 * Custom tree layout with horizontal spreading from center
 * Migrated from legacy to G6 v5-compatible approach
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

/**
 * Mind Map - Tree structure radiating from center node
 * Uses custom positioning for left-right spreading
 */
export class MindMapLegacyBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data || { name: 'Root', children: [] };
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { Graph } = G6;

  const treeData = ${JSON.stringify(data)};

  // Convert tree to nodes/edges with manual positioning
  function buildNodesEdges(root) {
    const nodes = [];
    const edges = [];

    function visit(node, parentId, depth, branch) {
      const id = node.name + '_' + Math.random().toString(36).substr(2, 9);
      nodes.push({
        id,
        label: node.name,
        depth,
        branch // 'left' or 'right'
      });

      if (parentId) {
        edges.push({ source: parentId, target: id });
      }

      if (Array.isArray(node.children)) {
        const half = Math.ceil(node.children.length / 2);
        node.children.forEach((child, i) => {
          const childBranch = depth === 0 ? (i < half ? 'left' : 'right') : branch;
          visit(child, id, depth + 1, childBranch);
        });
      }
    }

    visit(root, null, 0, 'center');
    return { nodes, edges };
  }

  const { nodes, edges } = buildNodesEdges(treeData);

  // Compute positions: center root, spread children left/right
  const W = ${config.width}, H = ${config.height};
  const cx = W / 2, cy = H / 2;
  const hspacing = 160, vspacing = 80;

  // Group nodes by depth and branch
  const depthMap = {};
  nodes.forEach(n => {
    const key = n.depth + '_' + n.branch;
    if (!depthMap[key]) depthMap[key] = [];
    depthMap[key].push(n);
  });

  // Position nodes
  nodes.forEach(n => {
    if (n.depth === 0) {
      // Root at center
      n.x = cx;
      n.y = cy;
    } else {
      const group = depthMap[n.depth + '_' + n.branch] || [];
      const idx = group.indexOf(n);
      const total = group.length;

      const xOffset = n.branch === 'left' ? -hspacing * n.depth : hspacing * n.depth;
      const yStart = cy - ((total - 1) * vspacing / 2);
      n.x = Math.round(cx + xOffset);
      n.y = Math.round(yStart + idx * vspacing);
    }
  });

  const graph = new Graph({
    container: 'container',
    width: W,
    height: H,
    layout: false,
    node: {
      type: 'rect',
      style: {
        size: [120, 32],
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        lineWidth: 2,
        radius: 6
      },
      labelCfg: {
        style: {
          fontSize: 12,
          fill: '#333'
        }
      }
    },
    edge: {
      type: 'cubic-horizontal',
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
