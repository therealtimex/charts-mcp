/**
 * Network Graph Builder (Alias for Force-Directed Layout)
 * Migrated from legacy implementation to G6 v5
 */

import { G6GraphBuilder } from './base';
import type { ChartSpec } from '../base';

/**
 * Network Graph - Uses circular layout with force simulation
 * Transforms legacy data format to G6 v5 format
 */
export class NetworkGraphBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    // Transform legacy format to G6 v5 format
    const transformedSpec = this.transformLegacyData(spec);
    return this.buildNetworkGraph(transformedSpec);
  }

  /**
   * Transform legacy data format (same as flow diagram)
   */
  private transformLegacyData(spec: ChartSpec): ChartSpec {
    const data = spec.data || { nodes: [], edges: [] };

    const nodes = Array.isArray(data.nodes)
      ? data.nodes
          .filter((n: any) => n && n.name)
          .map((n: any) => ({
            id: String(n.name),
            label: String(n.name)
          }))
      : [];

    const idSet = new Set(nodes.map((n: any) => n.id));

    const edges = Array.isArray(data.edges)
      ? data.edges
          .filter(
            (e: any) =>
              e && idSet.has(String(e.source)) && idSet.has(String(e.target))
          )
          .map((e: any) => ({
            source: String(e.source),
            target: String(e.target),
            label: e.name ? String(e.name) : undefined
          }))
      : [];

    return {
      ...spec,
      data: { nodes, edges }
    };
  }

  /**
   * Build network graph with circular pre-layout for stability
   */
  private buildNetworkGraph(spec: ChartSpec): string {
    const data = spec.data ?? { nodes: [], edges: [] };
    const config = this.buildG6Config(spec);

    // Pre-compute circular positions for stability
    const chartScript = `
  const { Graph } = G6;

  const data = ${this.escapeGraphData(data)};

  // Pre-compute circular positions
  const nodes = data.nodes || [];
  const N = nodes.length || 1;
  const cx = ${config.width} / 2;
  const cy = ${config.height} / 2;
  const r = Math.max(60, Math.min(${config.width}, ${config.height}) / 2 - 80);

  nodes.forEach((n, i) => {
    const angle = (i / N) * Math.PI * 2;
    n.x = Math.round(cx + r * Math.cos(angle));
    n.y = Math.round(cy + r * Math.sin(angle));
  });

  const graph = new Graph({
    container: 'container',
    width: ${config.width},
    height: ${config.height},
    layout: false, // Use pre-computed positions
    node: {
      type: 'circle',
      style: {
        size: 28,
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        lineWidth: 2
      },
      labelCfg: {
        position: 'bottom',
        offset: 8,
        style: {
          fontSize: 12,
          fill: '#333'
        }
      }
    },
    edge: {
      type: 'line',
      style: {
        stroke: '#e2e2e2',
        lineWidth: 1.5,
        endArrow: {
          path: 'M 0,0 L 8,4 L 8,-4 Z',
          fill: '#A3B1BF'
        }
      },
      labelCfg: {
        autoRotate: true,
        style: {
          fontSize: 11,
          fill: '#555'
        }
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    },
    fitView: true,
    fitViewPadding: 20
  });

  graph.data(data);
  graph.render();
  graph.fitView();
`;

    return this.buildContainer(spec, chartScript);
  }
}
