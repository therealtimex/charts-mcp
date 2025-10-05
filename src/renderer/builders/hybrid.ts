/**
 * Hybrid Chart Builder
 * Combines G2 statistical visualizations with G6 graph visualizations
 */

import { ChartBuilder, ChartSpec } from './base';

export interface HybridChartSpec extends ChartSpec {
  type: 'hybrid' | 'network-with-stats' | 'timeline-network' | 'geo-network';
  g2Config?: {
    type: 'bar' | 'line' | 'area' | 'scatter' | 'pie';
    data: any[];
    position?: 'top' | 'bottom' | 'left' | 'right';
    size?: { width: number; height: number };
  };
  g6Config?: {
    type: 'graph' | 'tree' | 'force' | 'circular';
    data: { nodes: any[]; edges: any[] };
    position?: 'top' | 'bottom' | 'left' | 'right';
    size?: { width: number; height: number };
  };
  layout?: 'split-horizontal' | 'split-vertical' | 'overlay' | 'synchronized';
}

export class HybridChartBuilder extends ChartBuilder {
  buildHtml(spec: HybridChartSpec): string {
    const width = spec.width || 800;
    const height = spec.height || 600;
    const layout = spec.layout || 'split-horizontal';

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${this.escapeHtml(spec.title || 'Hybrid Chart')}</title>
    ${this.buildHybridStyles(spec, layout)}
    ${this.buildScriptTags()}
  </head>
  <body>
    ${this.buildTitle(spec)}
    <div id="hybrid-container">
      <div id="g2-container"></div>
      <div id="g6-container"></div>
    </div>
    ${this.buildHybridScript(spec, layout)}
  </body>
</html>`;
  }

  protected buildScriptTags(): string {
    return `<script src="https://unpkg.com/@antv/g2@5.2.6/dist/g2.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@antv/g6@5.0.49/dist/g6.min.js"></script>`;
  }

  private buildHybridStyles(spec: HybridChartSpec, layout: string): string {
    const width = spec.width || 800;
    const height = spec.height || 600;
    const backgroundColor = spec.style?.backgroundColor || '#fff';

    const layoutStyles = this.getLayoutStyles(layout, width, height, spec);

    return `<style>
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Helvetica, Arial, sans-serif;
    background: ${backgroundColor};
  }
  #title {
    width: ${width}px;
    margin: 8px auto 0;
    font: 600 16px/1.3 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Helvetica, Arial, sans-serif;
    color: #111;
    text-align: center;
  }
  #hybrid-container {
    width: ${width}px;
    height: ${height}px;
    margin: 0 auto;
    position: relative;
    ${layoutStyles.container}
  }
  #g2-container {
    ${layoutStyles.g2}
  }
  #g6-container {
    ${layoutStyles.g6}
  }
</style>`;
  }

  private getLayoutStyles(layout: string, width: number, height: number, spec: HybridChartSpec): {
    container: string;
    g2: string;
    g6: string;
  } {
    const g2Position = spec.g2Config?.position || 'left';
    const g6Position = spec.g6Config?.position || 'right';

    const g2Size = spec.g2Config?.size || { width: width / 2, height };
    const g6Size = spec.g6Config?.size || { width: width / 2, height };

    switch (layout) {
      case 'split-horizontal':
        return {
          container: 'display: flex; flex-direction: row;',
          g2: `width: ${g2Size.width}px; height: ${g2Size.height}px;`,
          g6: `width: ${g6Size.width}px; height: ${g6Size.height}px;`
        };
      case 'split-vertical':
        return {
          container: 'display: flex; flex-direction: column;',
          g2: `width: ${width}px; height: ${g2Size.height}px;`,
          g6: `width: ${width}px; height: ${g6Size.height}px;`
        };
      case 'overlay':
        return {
          container: '',
          g2: `position: absolute; top: 0; left: 0; width: ${width}px; height: ${height}px; opacity: 0.7;`,
          g6: `position: absolute; top: 0; left: 0; width: ${width}px; height: ${height}px; opacity: 0.7;`
        };
      case 'synchronized':
        return {
          container: 'display: flex; flex-direction: row;',
          g2: `width: ${g2Size.width}px; height: ${g2Size.height}px;`,
          g6: `width: ${g6Size.width}px; height: ${g6Size.height}px;`
        };
      default:
        return {
          container: 'display: flex; flex-direction: row;',
          g2: `width: ${g2Size.width}px; height: ${g2Size.height}px;`,
          g6: `width: ${g6Size.width}px; height: ${g6Size.height}px;`
        };
    }
  }

  private buildHybridScript(spec: HybridChartSpec, layout: string): string {
    const g2Config = spec.g2Config || { type: 'bar', data: [] };
    const g6Config = spec.g6Config || { type: 'graph', data: { nodes: [], edges: [] } };

    return `<script>
(async function() {
  // G2 Chart Configuration
  const g2Data = ${JSON.stringify(g2Config.data || [])};
  const g2Type = ${JSON.stringify(g2Config.type || 'bar')};

  // G6 Graph Configuration
  const g6Data = ${JSON.stringify(g6Config.data || { nodes: [], edges: [] })};
  const g6Type = ${JSON.stringify(g6Config.type || 'graph')};

  const layout = ${JSON.stringify(layout)};
  const palette = ${JSON.stringify(spec.style?.palette || ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A'])};

  // Initialize G2 Chart
  function initG2Chart() {
    const g2Container = document.getElementById('g2-container');
    const chart = new G2.Chart({
      container: g2Container,
      autoFit: true
    });

    chart.data(g2Data);

    // Configure based on chart type
    switch (g2Type) {
      case 'bar':
        chart.interval()
          .encode('x', 'value')
          .encode('y', 'category')
          .encode('color', 'category')
          .scale('color', { range: palette });
        break;
      case 'line':
        chart.line()
          .encode('x', 'time')
          .encode('y', 'value')
          .encode('color', palette[0])
          .style('lineWidth', 2);
        chart.point()
          .encode('x', 'time')
          .encode('y', 'value')
          .encode('color', 'time')
          .scale('color', { range: palette })
          .style('size', 4);
        break;
      case 'area':
        chart.area()
          .encode('x', 'time')
          .encode('y', 'value')
          .encode('color', palette[0])
          .style('fillOpacity', 0.6);
        break;
      case 'scatter':
        chart.point()
          .encode('x', 'x')
          .encode('y', 'y')
          .encode('color', 'category')
          .encode('size', 'size')
          .scale('color', { range: palette })
          .style('fillOpacity', 0.7);
        break;
      case 'pie':
        chart.coordinate({ type: 'theta', outerRadius: 0.8 });
        chart.interval()
          .encode('y', 'value')
          .encode('color', 'category')
          .scale('color', { range: palette })
          .legend('color', { position: 'right' });
        break;
    }

    ${spec.axisXTitle ? `chart.axis('x', { title: { text: ${JSON.stringify(spec.axisXTitle)} } });` : ''}
    ${spec.axisYTitle ? `chart.axis('y', { title: { text: ${JSON.stringify(spec.axisYTitle)} } });` : ''}

    chart.render();
    return chart;
  }

  // Initialize G6 Graph
  function initG6Graph() {
    const g6Container = document.getElementById('g6-container');
    const containerWidth = g6Container.offsetWidth;
    const containerHeight = g6Container.offsetHeight;

    let layoutConfig = {};
    switch (g6Type) {
      case 'force':
        layoutConfig = {
          type: 'force',
          preventOverlap: true,
          nodeSize: 30
        };
        break;
      case 'circular':
        layoutConfig = {
          type: 'circular',
          radius: Math.min(containerWidth, containerHeight) / 3
        };
        break;
      case 'tree':
        layoutConfig = {
          type: 'dendrogram',
          direction: 'LR',
          nodeSep: 50,
          rankSep: 100
        };
        break;
      default:
        layoutConfig = {
          type: 'force',
          preventOverlap: true,
          nodeSize: 30
        };
    }

    const graph = new G6.Graph({
      container: g6Container,
      width: containerWidth,
      height: containerHeight,
      layout: layoutConfig,
      node: {
        style: {
          fill: palette[0],
          stroke: palette[1],
          lineWidth: 2,
          size: 20
        },
        labelCfg: {
          style: {
            fill: '#111',
            fontSize: 12
          }
        }
      },
      edge: {
        style: {
          stroke: '#666',
          lineWidth: 1,
          endArrow: true
        }
      },
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node']
      }
    });

    // Ensure nodes have IDs
    const nodes = (g6Data.nodes || []).map((n, i) => ({
      id: n.id || n.name || String(i),
      label: n.label || n.name || n.id || String(i),
      ...n
    }));

    const edges = (g6Data.edges || []).map(e => ({
      source: e.source,
      target: e.target,
      label: e.label || e.name || '',
      ...e
    }));

    graph.data({ nodes, edges });
    graph.render();
    return graph;
  }

  // Synchronized interactions
  function setupSynchronization(g2Chart, g6Graph) {
    if (layout !== 'synchronized') return;

    // Example: clicking a G2 element highlights corresponding G6 nodes
    g2Chart.on('element:click', (evt) => {
      const data = evt.data;
      if (data && data.data) {
        const category = data.data.category;
        // Highlight matching nodes in G6
        const nodes = g6Graph.getNodes();
        nodes.forEach(node => {
          const model = node.getModel();
          if (model.category === category) {
            g6Graph.setItemState(node, 'selected', true);
          } else {
            g6Graph.setItemState(node, 'selected', false);
          }
        });
      }
    });

    // Example: clicking a G6 node filters G2 data
    g6Graph.on('node:click', (evt) => {
      const node = evt.item;
      const model = node.getModel();
      const category = model.category;

      if (category) {
        // Filter G2 data
        const filteredData = g2Data.filter(d => d.category === category);
        g2Chart.changeData(filteredData);
      }
    });
  }

  // Initialize both visualizations
  const g2Chart = initG2Chart();
  const g6Graph = initG6Graph();

  // Setup synchronization if needed
  setupSynchronization(g2Chart, g6Graph);
})();
</script>`;
  }
}
