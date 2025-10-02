import { G6GraphBuilder } from "./base";
import type { ChartSpec } from "../base";

/**
 * Force-Directed Graph Builder for G6 v5
 *
 * Network graph with physics-based force simulation.
 * Nodes repel each other while edges act as springs.
 */
export class ForceGraphBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { nodes: [], edges: [] };
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { Graph } = G6;

  const graph = new Graph({
    container: 'container',
    width: ${config.width},
    height: ${config.height},
    layout: {
      type: 'force',
      preventOverlap: true,
      nodeSize: 30,
      linkDistance: 150,
      nodeStrength: -300,
      edgeStrength: 0.6
    },
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
        offset: 5,
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
        lineWidth: 1,
        endArrow: {
          path: 'M 0,0 L 8,4 L 8,-4 Z',
          fill: '#e2e2e2'
        }
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    }
  });

  graph.data(${this.escapeGraphData(data)});
  graph.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
