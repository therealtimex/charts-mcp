/**
 * G2 v5 Bubble Chart Builder
 * Builds bubble charts using @antv/g2 v5
 * Bubble charts display multivariate data with position (x, y) and size
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class BubbleChartBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400 } = spec;
    const hasGroup = this.hasGroupField(data);

    // Default scale configuration for bubble charts
    const sizeScale = spec.scale?.size || { type: 'log', range: [4, 20] };

    // Default style for bubble charts
    const fillOpacity = spec.style?.fillOpacity ?? 0.3;
    const lineWidth = spec.style?.lineWidth ?? 1;
    const stroke = spec.style?.stroke;

    // Legend configuration - typically hide size legend for bubble charts
    const showSizeLegend = spec.legend?.size ?? false;
    const showColorLegend = spec.legend?.color ?? (hasGroup ? true : false);

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
    .point()
    .data(${JSON.stringify(data)})
    .encode('x', 'x')
    .encode('y', 'y')
    .encode('size', 'size')
    ${hasGroup ? `.encode('color', 'group')` : ''}
    .encode('shape', 'point')
    .scale('size', ${JSON.stringify(sizeScale)})
    ${this.buildXScale(spec)}
    ${this.buildYScale(spec)}
    ${this.buildColorConfig(spec)}
    ${this.buildAxisConfig(spec)}
    .legend('size', ${showSizeLegend})
    ${hasGroup ? `.legend('color', ${showColorLegend})` : ''}
    .style('fillOpacity', ${fillOpacity})
    ${stroke ? `.style('stroke', ${JSON.stringify(stroke)})` : ''}
    .style('lineWidth', ${lineWidth});

  chart.render();
</script>`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private buildXScale(spec: ChartSpec): string {
    if (spec.scale?.x?.type) {
      return `.scale('x', { type: ${JSON.stringify(spec.scale.x.type)} })`;
    }
    return '';
  }

  private buildYScale(spec: ChartSpec): string {
    if (spec.scale?.y?.type) {
      return `.scale('y', { type: ${JSON.stringify(spec.scale.y.type)} })`;
    }
    return '';
  }
}
