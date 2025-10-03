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

    // Normalize data fields
    const boxData = (data || []).map((d: any) => ({
      x: d.category,
      y: d.value,
      ...(d.group && { series: d.group }),
    }));

    const hasGroup = Array.isArray(data) && data.some((d: any) => d && d.group != null);

    // Build style configuration for options API
    const styleOptions: any = {};
    if (showOutliers === false) styleOptions.point = false;
    if ((style as any).boxFill) styleOptions.boxFill = (style as any).boxFill;
    if ((style as any).boxFillOpacity !== undefined)
      styleOptions.boxFillOpacity = (style as any).boxFillOpacity;
    if ((style as any).pointStroke) styleOptions.pointStroke = (style as any).pointStroke;
    if ((style as any).pointR) styleOptions.pointR = (style as any).pointR;

    // Encode config for options API
    const encodeConfig = hasGroup
      ? `encode: { x: 'x', y: 'y', color: 'series', series: 'series' },`
      : `encode: { x: 'x', y: 'y' },`;

    // Coordinate config
    const coordinateConfig = horizontal
      ? `coordinate: { transform: [{ type: 'transpose' }] },`
      : '';

    // Axis config
    const axisParts: string[] = [];
    if (spec.axisYTitle) axisParts.push(`y: { title: ${JSON.stringify(spec.axisYTitle)} }`);
    if (spec.axisXTitle) axisParts.push(`x: { title: ${JSON.stringify(spec.axisXTitle)} }`);
    const axisConfig = axisParts.length ? `axis: { ${axisParts.join(', ')} },` : '';

    // Scale config for color palette
    const palette = spec.style?.palette;
    const scaleConfig = palette && palette.length > 0 ? `scale: { color: { range: ${JSON.stringify(palette)} } },` : '';

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
    ${axisConfig}
    ${scaleConfig}
    ${Object.keys(styleOptions).length ? `style: ${JSON.stringify(styleOptions)},` : ''}
  });

  chart.render();
</script>`;
  }
}
