/**
 * G2 v5 Donut Chart Builder
 * Builds donut charts using @antv/g2 v5 with full capabilities:
 * - Customizable labels (multiple layers, percentages)
 * - Flexible legend configuration
 * - Center annotations
 * - Faceted small multiples
 * - Mark-specific styling
 * - Flexible data field mapping
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class DonutChartBuilder extends ChartBuilder {
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
      autoFit = false,
      facet
    } = spec;

    const innerRadius = typeof spec.innerRadius === 'number' ? spec.innerRadius : 0.6;
    const encode = spec.encode || {};
    const angleField = encode.angleField || 'value';
    const colorField = encode.colorField || 'category';

    // If faceting is enabled, build faceted chart
    if (facet && facet.field) {
      return this.buildFacetedChart(spec, angleField, colorField, innerRadius);
    }

    // Build single donut chart
    return this.buildSingleChart(spec, angleField, colorField, innerRadius);
  }

  private buildSingleChart(spec: ChartSpec, angleField: string, colorField: string, innerRadius: number): string {
    const { data, theme = 'light', width = 600, height = 400, autoFit = false } = spec;

    const legendConfig = this.buildLegendConfig(spec);
    const labelsConfig = this.buildLabelsConfig(spec, angleField, colorField);
    const markStyle = this.buildMarkStyle(spec);
    const centerAnnotation = this.buildCenterAnnotation(spec, width, height, innerRadius);

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: ${autoFit}
  });

  chart
    .interval()
    .data(${JSON.stringify(data)})
    .transform({ type: 'stackY' })
    .coordinate({ type: 'theta', innerRadius: ${innerRadius} })
    .encode('y', ${JSON.stringify(angleField)})
    .encode('color', ${JSON.stringify(colorField)})
    ${this.buildColorConfig(spec)}
    ${markStyle}
    ${legendConfig}
    ${labelsConfig}
    .tooltip({
      items: [
        { channel: 'color', name: ${JSON.stringify(colorField)} },
        { channel: 'y', name: ${JSON.stringify(angleField)} }
      ]
    });

  ${centerAnnotation}

  chart.render();
</script>`;
  }

  private buildFacetedChart(spec: ChartSpec, angleField: string, colorField: string, innerRadius: number): string {
    const { data, theme = 'light', width = 600, height = 400, autoFit = false, facet } = spec;
    const facetField = facet!.field;
    const columnCount = facet!.columnCount || 2;

    const legendConfig = this.buildLegendConfig(spec);
    const labelsConfig = this.buildLabelsConfig(spec, angleField, colorField);
    const markStyle = this.buildMarkStyle(spec);

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: ${autoFit}
  });

  chart.options({
    type: 'facetRect',
    data: ${JSON.stringify(data)},
    encode: { x: ${JSON.stringify(facetField)} },
    children: [
      {
        type: 'interval',
        transform: [{ type: 'stackY' }],
        coordinate: { type: 'theta', innerRadius: ${innerRadius} },
        encode: {
          y: ${JSON.stringify(angleField)},
          color: ${JSON.stringify(colorField)}
        },
        ${this.buildColorConfig(spec).replace(/^\s*\./, '')}
        ${markStyle.replace(/^\s*\./, '')}
        ${legendConfig.replace(/^\s*\./, '')}
        ${labelsConfig.replace(/^\s*\./, '')}
      }
    ]
  });

  chart.render();
</script>`;
  }

  private buildLegendConfig(spec: ChartSpec): string {
    const legend = spec.legend || {};

    if (legend.disabled) {
      return '.legend(false)';
    }

    const position = legend.position || 'bottom';
    const layout = legend.layout || { justifyContent: 'center' };

    return `.legend('color', {
      position: ${JSON.stringify(position)},
      layout: ${JSON.stringify(layout)}
    })`;
  }

  private buildLabelsConfig(spec: ChartSpec, angleField: string, colorField: string): string {
    const labels = spec.labels;

    if (!labels || labels.length === 0) {
      // Default label showing percentages
      return `.label({
      text: (d, i, data) => {
        const total = data.reduce((acc, curr) => acc + curr[${JSON.stringify(angleField)}], 0);
        const percent = ((d[${JSON.stringify(angleField)}] / total) * 100).toFixed(1);
        return \`\${percent}%\`;
      },
      style: {
        fontWeight: 'bold',
        fontSize: 12
      }
    })`;
    }

    // Build multiple labels
    const labelConfigs = labels.map((label: any) => {
      let textConfig: string;

      if (label.text === 'percentage') {
        textConfig = `(d, i, data) => {
        const total = data.reduce((acc, curr) => acc + curr[${JSON.stringify(angleField)}], 0);
        const percent = ((d[${JSON.stringify(angleField)}] / total) * 100).toFixed(1);
        return \`\${percent}%\`;
      }`;
      } else if (label.text === 'category') {
        textConfig = `${JSON.stringify(colorField)}`;
      } else if (label.text === 'value') {
        textConfig = `${JSON.stringify(angleField)}`;
      } else {
        textConfig = JSON.stringify(label.text);
      }

      const position = label.position ? `, position: ${JSON.stringify(label.position)}` : '';
      const style = label.style ? `, style: ${JSON.stringify(label.style)}` : '';

      return `{ text: ${textConfig}${position}${style} }`;
    }).join(',\n      ');

    return `.label([
      ${labelConfigs}
    ])`;
  }

  private buildMarkStyle(spec: ChartSpec): string {
    const markStyle = spec.markStyle;

    if (!markStyle || Object.keys(markStyle).length === 0) {
      // Default style with white stroke
      return `.style({
      stroke: '#fff',
      lineWidth: 2
    })`;
    }

    return `.style(${JSON.stringify(markStyle)})`;
  }

  private buildCenterAnnotation(spec: ChartSpec, width: number, height: number, innerRadius: number): string {
    const centerAnnotation = spec.centerAnnotation;

    if (!centerAnnotation || !centerAnnotation.text) {
      return '';
    }

    const style = centerAnnotation.style || {};
    const fontSize = style.fontSize || 24;
    const fontWeight = style.fontWeight || 'bold';
    const fill = style.fill || '#000';
    const textAlign = style.textAlign || 'center';

    return `
  // Add center annotation
  chart.text()
    .style({
      text: ${JSON.stringify(centerAnnotation.text)},
      x: '50%',
      y: '50%',
      fontSize: ${fontSize},
      fontWeight: ${JSON.stringify(fontWeight)},
      fill: ${JSON.stringify(fill)},
      textAlign: ${JSON.stringify(textAlign)},
      textBaseline: 'middle'
    });`;
  }
}
