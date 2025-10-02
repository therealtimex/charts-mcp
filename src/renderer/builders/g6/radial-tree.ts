import { G6GraphBuilder } from "./base";
import type { ChartSpec } from "../base";

/**
 * Radial Tree Graph Builder for G6 v5
 *
 * Tree layout arranged in concentric circles radiating from the center.
 * Root at center, children arranged radially outward.
 */
export class RadialTreeGraphBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? {};
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { TreeGraph } = G6;

  const graph = new TreeGraph({
    container: 'container',
    width: ${config.width},
    height: ${config.height},
    layout: {
      type: 'dendrogram',
      radial: true,
      nodeSep: 30,
      rankSep: 100
    },
    defaultNode: {
      type: 'circle',
      size: 30,
      style: {
        fill: '#5AD8A6',
        stroke: '#5B8FF9',
        lineWidth: 2
      },
      labelCfg: {
        position: 'right',
        offset: 5,
        style: {
          fill: '#333',
          fontSize: 11
        }
      }
    },
    defaultEdge: {
      type: 'line',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 1.5
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
