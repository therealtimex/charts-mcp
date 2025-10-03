/**
 * Contour Plot Builder for G2 v5
 *
 * Visualizes 3D data as 2D contour lines (like topographic maps)
 * Supports two variants:
 * - 'cell': Heatmap-style with color gradients (default)
 * - 'line': Traditional contour outline chart with isolines
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ContourPlotBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const {
      data = [],
      theme = 'light',
      width = 600,
      height = 400,
      variant = 'cell',
      style = {}
    } = spec;

    // Determine if data is line-based or cell-based
    const isLineVariant = variant === 'line' || (data.length > 0 && 'level' in data[0] && 'lineId' in data[0]);

    if (isLineVariant) {
      return this.buildLineVariant(spec);
    } else {
      return this.buildCellVariant(spec);
    }
  }

  private buildCellVariant(spec: ChartSpec): string {
    const {
      data = [],
      theme = 'light',
      width = 600,
      height = 400,
      style = {},
      axisXTitle,
      axisYTitle,
      title
    } = spec;

    const palette = style.palette?.[0] || 'viridis';
    const strokeWidth = style.strokeWidth ?? 0.5;
    const inset = style.inset ?? 0.5;
    const xAxisTitle = axisXTitle ?? 'X';
    const yAxisTitle = axisYTitle ?? 'Y';

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: false
  });

  // Data format: [{ x: number, y: number, z: number }]
  const data = ${JSON.stringify(data)};

  // Create contour visualization using cell mark with color gradient
  chart.options({
    type: 'cell',
    data: data,
    encode: {
      x: 'x',
      y: 'y',
      color: 'z'
    },
    style: {
      stroke: '#333',
      strokeWidth: ${strokeWidth},
      inset: ${inset}
    },
    scale: {
      color: {
        palette: '${palette}',
        type: 'sequential'
      }
    },
    axis: {
      x: { title: '${xAxisTitle}' },
      y: { title: '${yAxisTitle}' }
    },
    legend: {
      color: {
        length: 300,
        layout: { justifyContent: 'center' },
        labelFormatter: (value) => {
          if (typeof value === 'number') {
            return Math.round(value).toString();
          }
          return value;
        }
      }
    },
    tooltip: {
      title: ${title ? `'${title}'` : "'Contour Information'"},
      items: [
        { field: 'x', name: '${xAxisTitle}' },
        { field: 'y', name: '${yAxisTitle}' },
        {
          field: 'z',
          name: 'Value',
          valueFormatter: (value) => {
            if (typeof value === 'number') {
              return Math.round(value).toString();
            }
            return value;
          }
        }
      ]
    }
  });

  chart.render();
</script>`;
  }

  private buildLineVariant(spec: ChartSpec): string {
    const {
      data = [],
      theme = 'light',
      width = 600,
      height = 400,
      style = {},
      axisXTitle,
      axisYTitle,
      title
    } = spec;

    const palette = style.palette?.[0] || 'oranges';
    const strokeWidth = style.strokeWidth ?? 2;
    const strokeOpacity = style.strokeOpacity ?? 0.8;
    const xAxisTitle = axisXTitle ?? 'Distance (km)';
    const yAxisTitle = axisYTitle ?? 'Distance (km)';

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  // Data format: [{ x: number, y: number, level: number, lineId: string }]
  const contourLines = ${JSON.stringify(data)};

  chart.options({
    type: 'line',
    data: contourLines,
    encode: {
      x: 'x',
      y: 'y',
      color: 'level',
      series: 'lineId'
    },
    style: {
      strokeWidth: ${strokeWidth},
      strokeOpacity: ${strokeOpacity}
    },
    scale: {
      color: {
        type: 'sequential',
        palette: '${palette}'
      },
      x: { nice: true },
      y: { nice: true }
    },
    axis: {
      x: { title: '${xAxisTitle}' },
      y: { title: '${yAxisTitle}' }
    },
    legend: {
      color: {
        title: ${title ? `'${title}'` : "'Elevation'"},
        layout: { justifyContent: 'center' }
      }
    },
    tooltip: {
      title: 'Contour Information',
      items: [
        {
          field: 'level',
          name: 'Level',
          valueFormatter: (value) => {
            if (typeof value === 'number') {
              return Math.round(value).toString();
            }
            return value;
          }
        }
      ]
    }
  });

  chart.render();
</script>`;
  }
}
