/**
 * G2 v5 Bullet Chart Builder
 * Builds bullet charts using @antv/g2 v5
 * Compact KPI visualization showing actual vs target with performance ranges
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class BulletChartBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400 } = spec;
    const orientation = spec.orientation || 'horizontal';

    // Check if we have layered ranges
    const hasLayeredRanges = data && data.length > 0 && Array.isArray(data[0].ranges);

    // Build children based on whether we have layered or simple ranges
    const children = hasLayeredRanges
      ? this.buildLayeredRangesChildren(spec, data)
      : this.buildSimpleRangesChildren(spec, data);

    const coordinateTransform = orientation === 'horizontal'
      ? "coordinate: { transform: [{ type: 'transpose' }] },"
      : '';

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  chart.options({
    type: 'view',
    ${coordinateTransform}
    children: ${children}
  });

  chart.render();
</script>`;
  }

  private buildSimpleRangesChildren(spec: ChartSpec, data: any[]): string {
    const rangesColor = spec.colors?.ranges || '#f0efff';
    const measuresColor = spec.colors?.measures || '#5B8FF9';
    const targetColor = spec.colors?.target || '#3D76DD';

    const rangesWidth = spec.styleConfig?.rangesWidth || 30;
    const measuresWidth = spec.styleConfig?.measuresWidth || 20;
    const targetSize = spec.styleConfig?.targetSize || 8;

    const labelConfig = this.buildLabelConfig(spec);
    const axisConfig = this.buildBulletAxisConfig(spec);

    // Handle conditional coloring for measures
    const measuresColorConfig = spec.colors?.measures === 'conditional'
      ? `color: (d) => (d.measures > d.target ? '#52c41a' : '#ff7875')`
      : `color: ${JSON.stringify(measuresColor)}`;

    return `[
      {
        type: 'interval',
        data: ${JSON.stringify(data)},
        encode: { x: 'title', y: 'ranges', color: ${JSON.stringify(rangesColor)} },
        style: { maxWidth: ${rangesWidth} },
        ${axisConfig}
      },
      {
        type: 'interval',
        data: ${JSON.stringify(data)},
        encode: { x: 'title', y: 'measures', ${measuresColorConfig} },
        style: { maxWidth: ${measuresWidth} }
        ${labelConfig}
      },
      {
        type: 'point',
        data: ${JSON.stringify(data)},
        encode: {
          x: 'title',
          y: 'target',
          shape: 'line',
          color: ${JSON.stringify(targetColor)},
          size: ${targetSize}
        },
        tooltip: {
          title: false,
          items: [
            { channel: 'y', name: 'Target Value'${this.buildTooltipFormatter(spec)} }
          ]
        }
      }
    ]`;
  }

  private buildLayeredRangesChildren(spec: ChartSpec, data: any[]): string {
    const measuresColor = spec.colors?.measures || '#1890ff';
    const targetColor = spec.colors?.target || '#ff4d4f';

    const measuresWidth = spec.styleConfig?.measuresWidth || 16;
    const targetSize = spec.styleConfig?.targetSize || 8;

    // Default range level configuration
    const defaultLabels = ['Poor', 'Good', 'Excellent'];
    const defaultColors = ['#ffebee', '#fff3e0', '#e8f5e8'];

    const rangeLabels = spec.rangeLevels?.labels || defaultLabels;
    const rangeColors = spec.colors?.rangesLevels || spec.rangeLevels?.colors || defaultColors;

    // Transform data for stacked ranges
    const transformedData = this.buildTransformedRangesData(data, rangeLabels);

    const labelConfig = this.buildLabelConfig(spec);
    const axisConfig = this.buildBulletAxisConfig(spec);

    return `[
      {
        type: 'interval',
        data: ${transformedData},
        encode: { x: 'title', y: 'value', color: 'level' },
        transform: [{ type: 'stackY' }],
        scale: {
          color: {
            domain: ${JSON.stringify(rangeLabels)},
            range: ${JSON.stringify(rangeColors)}
          }
        },
        style: { maxWidth: 30 },
        ${axisConfig}
      },
      {
        type: 'interval',
        data: ${JSON.stringify(data)},
        encode: { x: 'title', y: 'measures', color: ${JSON.stringify(measuresColor)} },
        style: { maxWidth: ${measuresWidth} }
        ${labelConfig}
      },
      {
        type: 'point',
        data: ${JSON.stringify(data)},
        encode: {
          x: 'title',
          y: 'target',
          shape: 'line',
          color: ${JSON.stringify(targetColor)},
          size: ${targetSize}
        },
        tooltip: {
          title: false,
          items: [
            { channel: 'y', name: 'Target Value'${this.buildTooltipFormatter(spec)} }
          ]
        }
      }
    ]`;
  }

  private buildTransformedRangesData(data: any[], rangeLabels: string[]): string {
    const transformedData: any[] = [];

    data.forEach(item => {
      if (Array.isArray(item.ranges)) {
        item.ranges.forEach((value: number, index: number) => {
          transformedData.push({
            title: item.title,
            value: value,
            level: rangeLabels[index] || `Level ${index + 1}`
          });
        });
      }
    });

    return JSON.stringify(transformedData);
  }

  private buildLabelConfig(spec: ChartSpec): string {
    if (!spec.label?.enabled) {
      return '';
    }

    const position = spec.label.position || 'right';
    const formatter = spec.label.formatter || '(d) => d';

    // Position-specific styling
    const positionConfig = position === 'right'
      ? "position: 'right', textAlign: 'left', dx: 5"
      : position === 'top'
      ? "position: 'top', textAlign: 'center', dy: -5"
      : `position: '${position}'`;

    return `,
        label: {
          text: 'measures',
          ${positionConfig},
          formatter: ${formatter}
        }`;
  }

  private buildBulletAxisConfig(spec: ChartSpec): string {
    let config = 'axis: {';
    let hasAxis = false;

    if (spec.axisYTitle) {
      config += `\n          y: { grid: true, gridLineWidth: 2, title: ${JSON.stringify(spec.axisYTitle)} }`;
      hasAxis = true;
    } else {
      config += '\n          y: { grid: true, gridLineWidth: 2 }';
      hasAxis = true;
    }

    if (spec.axisXTitle !== undefined) {
      if (hasAxis) config += ',';
      config += `\n          x: { title: ${JSON.stringify(spec.axisXTitle)} }`;
    } else if (hasAxis) {
      config += ',\n          x: { title: false }';
    }

    config += '\n        }';
    return hasAxis ? config : '';
  }

  private buildTooltipFormatter(spec: ChartSpec): string {
    if (spec.label?.formatter) {
      return `, valueFormatter: ${spec.label.formatter}`;
    }
    return '';
  }
}
