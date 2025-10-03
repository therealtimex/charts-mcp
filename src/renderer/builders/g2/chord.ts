/**
 * Chord Builder for G2 v5
 *
 * Visualizes relationships/flows between entities in a circular layout
 * Uses arcs and ribbons to show connections
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ChordBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data = [], nodes: explicitNodes, scale, theme = 'light', width = 600, height = 600 } = spec;

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: false
  });

  // Data format: [{ source: "A", target: "B", value: 10 }, ...]
  const rawData = ${JSON.stringify(data)};
  const explicitNodes = ${JSON.stringify(explicitNodes || null)};
  const scaleConfig = ${JSON.stringify(scale || null)};

  // Extract or use explicit nodes
  let nodes;
  if (explicitNodes && explicitNodes.length > 0) {
    nodes = explicitNodes.map(n => n.id);
  } else if (scaleConfig?.color?.domain) {
    nodes = scaleConfig.color.domain;
  } else {
    const nodeSet = new Set();
    rawData.forEach(d => {
      nodeSet.add(d.source);
      nodeSet.add(d.target);
    });
    nodes = Array.from(nodeSet);
  }

  // Create adjacency matrix
  const matrix = nodes.map(() => nodes.map(() => 0));
  rawData.forEach(d => {
    const srcIdx = nodes.indexOf(d.source);
    const tgtIdx = nodes.indexOf(d.target);
    if (srcIdx >= 0 && tgtIdx >= 0) {
      matrix[srcIdx][tgtIdx] = d.value || 1;
    }
  });

  // Transform to chord data format
  const chordData = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (matrix[i][j] > 0) {
        chordData.push({
          source: nodes[i],
          target: nodes[j],
          value: matrix[i][j]
        });
      }
    }
  }

  // Use edge visualization with polar coordinates
  chart.coordinate({ type: 'polar', innerRadius: 0.4 });

  chart
    .interval()
    .data(chordData)
    .encode('x', 'source')
    .encode('y', 'value')
    .encode('color', 'source')
    .encode('size', 10)
    .transform({ type: 'stackY' })
    ${this.buildScaleConfig(spec)}
    .legend('color', {
      position: 'right',
      layout: { justifyContent: 'flex-start' }
    })
    .interaction('tooltip', {
      body: {
        items: [
          { channel: 'x', name: 'Source' },
          { channel: 'y', name: 'Value', valueFormatter: (v) => v.toFixed(2) }
        ]
      }
    });

  chart.render();
</script>`;
  }

  /**
   * Build scale configuration, prioritizing scale.color.range over style.palette
   */
  private buildScaleConfig(spec: ChartSpec): string {
    const { scale, style } = spec;

    // Prefer scale.color.range over style.palette
    const colorRange = scale?.color?.range || style?.palette;

    if (!colorRange || colorRange.length === 0) {
      return '';
    }

    return `.scale('color', { range: ${JSON.stringify(colorRange)} })`;
  }
}
