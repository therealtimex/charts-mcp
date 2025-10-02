/**
 * G2 v5 Histogram Builder
 * Builds histograms using @antv/g2 v5 with binning transform
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class HistogramBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400 } = spec;
    const binNumber = spec.binNumber || 10;
    const mode = spec.mode || 'frequency';

    // Process data: detect if it's multi-distribution or simple
    let processedData: any[] = [];
    let isMultiDistribution = false;

    if (Array.isArray(data) && data.length > 0) {
      // Check if data has group field (multi-distribution)
      if (typeof data[0] === 'object' && data[0] !== null && 'value' in data[0] && 'group' in data[0]) {
        processedData = data;
        isMultiDistribution = true;
      } else {
        // Convert simple number array to objects
        processedData = data.map((v: any) => ({ value: typeof v === 'number' ? v : v.value }));
      }
    }

    // Build transform chain
    const transforms = [`{ type: 'binX', y: 'count', thresholds: ${binNumber}${isMultiDistribution ? ", groupBy: ['group']" : ''} }`];

    // Add density normalization if mode is 'density'
    if (mode === 'density') {
      transforms.push(`{ type: 'normalizeY' }`);
    }

    // Determine Y-axis label
    const yAxisLabel = mode === 'density' ? 'Density' : 'Frequency';
    const yAxisFormat = mode === 'density' ? ".0%" : undefined;

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  chart
    .interval()
    .data(${JSON.stringify(processedData)})
    .encode('x', 'value')
    .encode('y', ${mode === 'density' ? "'density'" : "'count'"})
    ${isMultiDistribution ? ".encode('color', 'group')" : ''}
    .transform(
      ${transforms.join(',\n      ')}
    )
    .scale('y', { nice: true })
    ${isMultiDistribution && spec.style?.palette ? `.scale('color', { range: ${JSON.stringify(spec.style.palette)} })` : ''}
    ${this.buildAxisConfig(spec)}
    ${spec.axisYTitle ? '' : `.axis('y', { title: { text: '${yAxisLabel}' }${yAxisFormat ? `, labelFormatter: '${yAxisFormat}'` : ''} })`}
    .style({ ${isMultiDistribution ? 'fillOpacity: 0.7' : 'fill: "#1890FF", fillOpacity: 0.9'}, stroke: '#FFF', lineWidth: 1 })
    ${isMultiDistribution ? '.legend(true)' : ''};

  chart.render();
</script>`;
  }
}
