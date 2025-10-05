/**
 * G2 v5 Choropleth Map Builder
 * Builds choropleth maps using @antv/g2 v5 geoPath
 * Displays statistical data on geographic regions using color encoding
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ChoroplethMapBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { theme = 'light', width = 800, height = 600 } = spec;

    // Join configuration
    const geoKey = spec.joinKeys?.geo || 'id';
    const dataKey = spec.joinKeys?.data || 'id';
    const valueField = spec.valueField || 'value';

    // Color scale configuration
    const colorType = spec.colorScale?.type || 'quantile';
    const palette = spec.colorScale?.palette || 'ylGnBu';
    const unknown = spec.colorScale?.unknown || '#fff';

    // Build color scale
    const colorScaleConfig = this.buildColorScaleConfig(colorType, palette, unknown, spec.colorScale?.domain);

    // Style configuration
    const stroke = spec.style?.stroke || '#666';
    const lineWidth = spec.style?.lineWidth ?? 0.5;

    // Legend configuration
    const showLegend = spec.legend?.color ?? true;
    const legendLayout = spec.legend?.layout ? JSON.stringify(spec.legend.layout) : '{ justifyContent: "center" }';

    // Tooltip configuration
    const tooltipConfig = this.buildTooltipConfig(spec, valueField);

    // Projection configuration
    const projectionConfig = this.buildProjectionConfig(spec);

    return `<script>
  const { Chart } = G2;

  const geoData = ${JSON.stringify(spec.geoData)};
  const statisticalData = ${JSON.stringify(spec.data)};

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: false
  });

  chart.options({
    type: 'geoPath',
    ${projectionConfig}
    data: {
      value: geoData,
      transform: [
        {
          type: 'join',
          join: statisticalData,
          on: [${JSON.stringify(geoKey)}, ${JSON.stringify(dataKey)}],
          select: [${JSON.stringify(valueField)}, 'name']
        }
      ]
    },
    scale: {
      color: ${colorScaleConfig}
    },
    encode: {
      color: ${JSON.stringify(valueField)}
    },
    legend: {
      color: ${showLegend} ? {
        layout: ${legendLayout}
      } : false
    },
    style: {
      stroke: ${JSON.stringify(stroke)},
      strokeWidth: ${lineWidth}
    }${tooltipConfig}
  });

  chart.render();
</script>`;
  }

  private buildColorScaleConfig(type: string, palette: string | string[], unknown: string, domain?: number[]): string {
    let config = `{
      type: ${JSON.stringify(type)}`;

    // Handle palette - could be a named palette or custom array
    if (Array.isArray(palette)) {
      config += `,
      range: ${JSON.stringify(palette)}`;
    } else {
      config += `,
      palette: ${JSON.stringify(palette)}`;
    }

    // Add unknown color
    config += `,
      unknown: ${JSON.stringify(unknown)}`;

    // Add domain if specified (for threshold scales)
    if (domain && domain.length > 0) {
      config += `,
      domain: ${JSON.stringify(domain)}`;
    }

    config += `
    }`;

    return config;
  }

  private buildProjectionConfig(spec: ChartSpec): string {
    if (!spec.projection?.type) {
      return '';
    }

    let config = `coordinate: { type: ${JSON.stringify(spec.projection.type)}`;

    if (spec.projection.center) {
      config += `, center: ${JSON.stringify(spec.projection.center)}`;
    }

    if (spec.projection.scale) {
      config += `, scale: ${spec.projection.scale}`;
    }

    if (spec.projection.rotate) {
      config += `, rotate: ${JSON.stringify(spec.projection.rotate)}`;
    }

    config += ' },';
    return config;
  }

  private buildTooltipConfig(spec: ChartSpec, valueField: string): string {
    const hasCustomTooltip = spec.tooltip?.items && spec.tooltip.items.length > 0;

    if (!hasCustomTooltip) {
      // Default tooltip showing name and value
      return `,
    tooltip: {
      title: (d) => d.properties?.name || d.name || 'Region',
      items: [{ field: ${JSON.stringify(valueField)}, name: 'Value' }]
    }`;
    }

    // Custom tooltip
    const titleConfig = spec.tooltip?.title
      ? `(d) => d.${spec.tooltip.title}`
      : `(d) => d.properties?.name || d.name || 'Region'`;

    const items = spec.tooltip.items.map((item: any) => {
      let itemConfig = `{ name: ${JSON.stringify(item.name)}, field: ${JSON.stringify(item.field)}`;

      if (item.valueFormatter) {
        itemConfig += `, valueFormatter: ${item.valueFormatter}`;
      }

      itemConfig += ' }';
      return itemConfig;
    }).join(',\n        ');

    return `,
    tooltip: {
      title: ${titleConfig},
      items: [
        ${items}
      ]
    }`;
  }
}
