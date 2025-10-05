import { G6GraphBuilder } from "./base";
import type { ChartSpec } from "../base";

/**
 * Circular Graph Builder for G6 v5
 *
 * Arranges nodes in a circle, useful for showing cyclical relationships.
 * Often used with chord diagrams or for showing network patterns.
 */
export class CircularGraphBuilder extends G6GraphBuilder {
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
      type: 'circular',
      radius: Math.min(${config.width}, ${config.height}) / 2 - 100,
      startAngle: 0,
      endAngle: Math.PI * 2,
      divisions: 1,
      ordering: null
    },
    defaultNode: {
      type: 'circle',
      size: 25,
      style: {
        fill: '#5B8FF9',
        stroke: '#fff',
        lineWidth: 2
      },
      labelCfg: {
        position: 'bottom',
        offset: 8,
        style: {
          fill: '#333',
          fontSize: 11
        }
      }
    },
    defaultEdge: {
      type: 'line',
      style: {
        stroke: '#e2e2e2',
        lineWidth: 1,
        opacity: 0.6
      }
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas']
    }
  });

  graph.data(${this.escapeGraphData(data)});
  graph.render();
  graph.fitView();
`;

    return this.buildContainer(spec, chartScript);
  }
}
