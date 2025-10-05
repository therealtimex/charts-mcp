/**
 * G2 v5 Bar Chart Builder
 * Builds horizontal and vertical bar charts using @antv/g2 v5
 * Supports orientation, advanced axis configuration, and interactions
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class BarChartBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400, orientation = 'horizontal' } = spec;
    const hasGroup = this.hasGroupField(data);
    const isStacked = spec.stack === true;
    const isHorizontal = orientation === 'horizontal';

    // For horizontal bars: x=value, y=category with transpose
    // For vertical bars: x=category, y=value without transpose
    const xField = isHorizontal ? 'value' : 'category';
    const yField = isHorizontal ? 'category' : 'value';
    const stackType = isHorizontal ? 'stackX' : 'stackY';
    const dodgeType = isHorizontal ? 'dodgeX' : 'dodgeY';

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: false
  });

  chart
    .interval()
    .data(${JSON.stringify(data)})
    .encode('x', '${xField}')
    .encode('y', '${yField}')
    ${hasGroup ? `.encode('color', 'group')` : this.buildCategoryColor(spec)}
    ${hasGroup && isStacked ? `.transform({ type: '${stackType}' })` : ''}
    ${hasGroup && !isStacked ? `.transform({ type: '${dodgeType}' })` : ''}
    ${isHorizontal ? `.coordinate({ type: 'transpose' })` : ''}
    ${this.buildColorConfig(spec)}
    ${this.buildAxisConfig(spec)}
    ${this.buildAdvancedAxisConfig(spec, isHorizontal)}
    ${this.buildInteraction(spec)}
    .legend(${hasGroup ? 'true' : 'false'});

  chart.render();
</script>`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private buildCategoryColor(spec: ChartSpec): string {
    const palette = spec.style?.palette;
    if (!palette || palette.length === 0) {
      return '';
    }

    // Color by category when no grouping
    return `.encode('color', 'category')`;
  }

  private buildAdvancedAxisConfig(spec: ChartSpec, isHorizontal: boolean): string {
    const axisConfig = spec.axisConfig;
    if (!axisConfig) {
      return '';
    }

    // For horizontal bars: category is on y-axis, value on x-axis
    // For vertical bars: category is on x-axis, value on y-axis
    const categoryAxis = isHorizontal ? 'y' : 'x';
    const valueAxis = isHorizontal ? 'x' : 'y';

    let config = '';
    const axisOptions: any = {};

    if (axisConfig.labelFontSize) {
      axisOptions.labelFontSize = axisConfig.labelFontSize;
    }

    if (axisConfig.size) {
      axisOptions.size = axisConfig.size;
    }

    if (axisConfig.labelAutoEllipsis) {
      axisOptions.labelAutoEllipsis = axisConfig.labelAutoEllipsis;
    }

    if (axisConfig.labelAutoWrap) {
      axisOptions.labelAutoWrap = axisConfig.labelAutoWrap;
    }

    if (axisConfig.labelAutoRotate) {
      axisOptions.labelAutoRotate = axisConfig.labelAutoRotate;
    }

    if (axisConfig.labelAutoHide) {
      axisOptions.labelAutoHide = axisConfig.labelAutoHide;
    }

    if (Object.keys(axisOptions).length > 0) {
      config = `.axis('${categoryAxis}', ${JSON.stringify(axisOptions)})`;
    }

    return config;
  }

  private buildInteraction(spec: ChartSpec): string {
    const interaction = spec.interaction;
    if (!interaction) {
      return '';
    }

    const options: any = {
      type: interaction.type
    };

    if (interaction.background !== undefined) {
      options.background = interaction.background;
    }

    if (interaction.region !== undefined) {
      options.region = interaction.region;
    }

    return `.interaction(${JSON.stringify(options)})`;
  }
}
