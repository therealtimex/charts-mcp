import { G6GraphBuilder } from "./base";
import type { ChartSpec } from "../base";

/**
 * Tree Graph Builder for G6 v5
 *
 * Hierarchical tree layout for org charts, file systems, etc.
 * Supports top-down, left-right, and radial layouts.
 */
export class TreeGraphBuilder extends G6GraphBuilder {
  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? {};
    const direction = spec.direction ?? 'TB'; // TB, LR, RL, BT
    const config = this.buildG6Config(spec);

    const chartScript = `
  const { TreeGraph } = G6;

  const graph = new TreeGraph({
    container: 'container',
    width: ${config.width},
    height: ${config.height},
    layout: {
      type: 'compactBox',
      direction: ${JSON.stringify(direction)},
      getHeight: () => 16,
      getWidth: () => 16,
      getVGap: () => 20,
      getHGap: () => 50
    },
    defaultNode: {
      type: 'rect',
      size: [80, 40],
      style: {
        fill: '#C6E5FF',
        stroke: '#5B8FF9',
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
        radius: 10
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
