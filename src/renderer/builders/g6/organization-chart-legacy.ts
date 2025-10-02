/**
 * Organization Chart Builder
 * Hierarchical tree layout (top-down or left-right)
 * Migrated from legacy to G6 v5-compatible approach
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

/**
 * Organization Chart - Hierarchical tree structure
 * Supports vertical (TB) and horizontal (LR) orientations
 */
export class OrganizationChartLegacyBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data || { name: 'Root', children: [] };
    const orientation = spec.orient === 'horizontal' ? 'LR' : 'TB';
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { Graph } = G6;

  const treeData = ${JSON.stringify(data)};
  const orientation = ${JSON.stringify(orientation)};

  // Convert tree to nodes/edges
  function buildNodesEdges(root) {
    const nodes = [];
    const edges = [];
    const idMap = new Map();
    let idCounter = 0;

    function visit(node, parentId) {
      const id = 'node_' + (idCounter++);
      idMap.set(node, id);

      nodes.push({
        id,
        label: node.name || '',
        description: node.description || ''
      });

      if (parentId) {
        edges.push({ source: parentId, target: id });
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(child => visit(child, id));
      }
    }

    visit(root, null);
    return { nodes, edges };
  }

  const { nodes, edges } = buildNodesEdges(treeData);

  // Compute tree layout positions
  const W = ${config.width}, H = ${config.height};
  const pad = { top: 40, left: 40, right: 40, bottom: 40 };
  const usableW = Math.max(1, W - pad.left - pad.right);
  const usableH = Math.max(1, H - pad.top - pad.bottom);

  // Build depth and parent maps
  const depth = new Map();
  const parent = new Map();
  const children = new Map();

  nodes.forEach(n => children.set(n.id, []));
  edges.forEach(e => {
    children.get(e.source).push(e.target);
    parent.set(e.target, e.source);
  });

  // Find root
  let rootId = nodes[0] && nodes[0].id;
  for (const n of nodes) {
    if (!parent.has(n.id)) {
      rootId = n.id;
      break;
    }
  }

  // DFS to compute depths
  const order = [];
  function dfs(id, d) {
    depth.set(id, d);
    order.push(id);
    (children.get(id) || []).forEach(c => dfs(c, d + 1));
  }
  dfs(rootId, 0);

  const maxDepth = Math.max(...Array.from(depth.values()));
  const levels = Array.from({ length: maxDepth + 1 }, () => []);
  order.forEach(id => levels[depth.get(id)].push(id));

  // Position nodes
  if (orientation === 'TB') {
    const dy = Math.max(80, usableH / Math.max(1, levels.length));
    levels.forEach((arr, d) => {
      const y = pad.top + d * dy;
      const spacing = arr.length > 1 ? usableW / (arr.length + 1) : usableW / 2;
      arr.forEach((id, i) => {
        const x = pad.left + (i + 1) * spacing;
        const n = nodes.find(n => n.id === id);
        if (n) {
          n.x = Math.round(x);
          n.y = Math.round(y);
        }
      });
    });
  } else {
    // LR
    const dx = Math.max(160, usableW / Math.max(1, levels.length));
    const dyBase = 60;
    levels.forEach((arr, d) => {
      const x = pad.left + d * dx;
      const spacing = arr.length > 0 ? Math.max(dyBase, usableH / (arr.length + 1)) : dyBase;
      arr.forEach((id, i) => {
        const y = pad.top + (i + 1) * spacing;
        const n = nodes.find(n => n.id === id);
        if (n) {
          n.x = Math.round(x);
          n.y = Math.round(y);
        }
      });
    });
  }

  const graph = new Graph({
    container: 'container',
    width: W,
    height: H,
    layout: false,
    node: {
      type: 'rect',
      style: {
        size: [140, 40],
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
      type: orientation === 'TB' ? 'polyline' : 'polyline',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 1.5,
        endArrow: {
          path: 'M 0,0 L 8,4 L 8,-4 Z',
          fill: '#A3B1BF'
        }
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas']
    },
    fitView: true,
    fitViewPadding: 20
  });

  graph.data({ nodes, edges });
  graph.render();
  graph.fitView();
`;

    return this.buildContainer(spec, chartScript);
  }
}
