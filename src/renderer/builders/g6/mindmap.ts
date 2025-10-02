import { G6GraphBuilder } from "./base";
import type { ChartSpec } from "../base";

/**
 * Mind Map Graph Builder for G6 v5
 *
 * Specialized tree layout for mind mapping.
 * Central topic with branches spreading left and right.
 */
export class MindMapGraphBuilder extends G6GraphBuilder {
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
      type: 'mindmap',
      direction: 'H',
      getHeight: () => 16,
      getWidth: () => 16,
      getVGap: () => 10,
      getHGap: () => 50,
      getSide: (d) => {
        // Alternate sides for balanced mind map
        return d.depth % 2 === 0 ? 'right' : 'left';
      }
    },
    defaultNode: {
      type: 'rect',
      size: [100, 30],
      style: {
        fill: '#f0f0f0',
        stroke: '#5B8FF9',
        lineWidth: 2,
        radius: 15
      },
      labelCfg: {
        style: {
          fill: '#333',
          fontSize: 12
        }
      }
    },
    defaultEdge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#A3B1BF',
        lineWidth: 2
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
