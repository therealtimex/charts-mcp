/**
 * G2 v5 Boxplot Builder
 * Builds boxplots using @antv/g2 v5
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class BoxplotBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const {
      data,
      theme = 'light',
      width = 600,
      height = 400,
      horizontal = false,
      showOutliers = true,
      style = {},
    } = spec;

    // Transform data to match G2 boxplot format
    const boxData = data.map((d: any) => ({
      x: d.category,
      y: d.value,
      ...(d.group && { series: d.group }),
    }));

    // Build coordinate config for horizontal boxplot
    const coordinateConfig = horizontal
      ? `coordinate: { transform: [{ type: 'transpose' }] },`
      : '';

    // Build style configuration
    const styleOptions: any = {};
    if (showOutliers === false) {
      styleOptions.point = false;
    }
    if (style.boxFill) styleOptions.boxFill = style.boxFill;
    if (style.boxFillOpacity !== undefined)
      styleOptions.boxFillOpacity = style.boxFillOpacity;
    if (style.pointStroke) styleOptions.pointStroke = style.pointStroke;
    if (style.pointR) styleOptions.pointR = style.pointR;

    const styleConfig =
      Object.keys(styleOptions).length > 0
        ? `style: ${JSON.stringify(styleOptions)},`
        : '';

    // Build encode configuration
    const hasGroup = data.some((d: any) => d.group);
    const encodeConfig = hasGroup
      ? `encode: { x: 'x', y: 'y', color: 'series', series: 'series' },`
      : `encode: { x: 'x', y: 'y' },`;

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
    type: 'boxplot',
    data: ${JSON.stringify(boxData)},
    ${encodeConfig}
    ${coordinateConfig}
    ${styleConfig}
    ${this.buildAxisConfig(spec)}
  });

  chart.render();
</script>`;
  }
}
