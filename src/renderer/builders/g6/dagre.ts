import { G6GraphBuilder } from "./base";
import type { ChartSpec } from "../base";

/**
 * Dagre (DAG) Graph Builder for G6 v5
 *
 * Directed Acyclic Graph layout using Dagre algorithm.
 * Ideal for flowcharts, dependency graphs, workflow diagrams.
 */
export class DagreGraphBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? { nodes: [], edges: [] };
    const direction = spec.direction ?? 'TB'; // TB, BT, LR, RL
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { Graph } = G6;

  const graph = new Graph({
    container: 'container',
    width: ${config.width},
    height: ${config.height},
    layout: {
      type: 'dagre',
      rankdir: ${JSON.stringify(direction)},
      align: 'UL',
      nodesep: 20,
      ranksep: 50
    },
    defaultNode: {
      type: 'rect',
      size: [80, 40],
      style: {
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
        lineWidth: 2,
        radius: 4
      },
      labelCfg: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      }
    },
    defaultEdge: {
      type: 'polyline',
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
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    }
  });

  graph.data(${this.escapeGraphData(data)});
  graph.render();
  graph.fitView();
`;

    return this.buildContainer(spec, chartScript);
  }
}
