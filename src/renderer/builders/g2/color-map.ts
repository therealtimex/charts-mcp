/**
 * G2 v5 Color Map Builder
 * Builds color maps using @antv/g2 v5 cell mark
 * Displays relationships between two categorical dimensions using color-encoded grid cells
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class ColorMapBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { theme = 'classic', width = 800, height = 600 } = spec;

    // Field names
    const xField = spec.xField || 'x';
    const yField = spec.yField || 'y';
    const valueField = spec.valueField || 'value';

    // Style configuration
    const inset = spec.style?.inset ?? 1;
    const stroke = spec.style?.stroke || '#fff';
    const strokeWidth = spec.style?.strokeWidth ?? 1;

    // Label configuration
    const showLabels = spec.label?.show !== false;
    const labelField = spec.label?.field || valueField;
    const labelFormatter = spec.label?.formatter;
    const labelTextColor = spec.label?.textColor;
    const labelFontSize = spec.label?.fontSize || 12;

    // Legend configuration
    const legendConfig = this.buildColorMapLegendConfig(spec);

    // Scale configuration for axis ordering
    const scaleConfig = this.buildScaleConfig(spec, valueField);

    // Axis configuration
    const axisConfig = this.buildColorMapAxisConfig(spec);

    // Tooltip configuration
    const tooltipConfig = this.buildColorMapTooltipConfig(spec, xField, yField, valueField);

    // Interaction configuration
    const interactionConfig = this.buildInteractionConfig(spec);

    // Link encoding
    const linkEncoding = this.buildLinkEncoding(spec, valueField);

    // Labels configuration
    const labelsConfig = showLabels ? this.buildLabelsConfig(labelField, labelFormatter, labelTextColor, labelFontSize) : '';

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: false
  });

  chart.options({
    type: 'view',
    autoFit: true,
    data: ${JSON.stringify(spec.data)},
    coordinate: {
      type: 'cartesian'
    },
    children: [
      {
        type: 'cell',
        encode: {
          x: ${JSON.stringify(xField)},
          y: ${JSON.stringify(yField)},
          color: ${JSON.stringify(valueField)}${linkEncoding}
        },
        style: {
          inset: ${inset},
          stroke: ${JSON.stringify(stroke)},
          strokeWidth: ${strokeWidth}
        }${labelsConfig}
      }
    ]${legendConfig}${scaleConfig}${axisConfig}${tooltipConfig}${interactionConfig}
  });

  chart.render();
</script>`;
  }

  private buildColorScaleConfig(spec: ChartSpec, valueField: string): string {
    if (!spec.colorScale) {
      return '';
    }

    const type = spec.colorScale.type || 'linear';
    const palette = spec.colorScale.palette || 'rdBu';
    const domain = spec.colorScale.domain;
    const reverse = spec.colorScale.reverse || false;

    let config = `color: {\n        type: ${JSON.stringify(type)}`;

    // Handle palette
    if (Array.isArray(palette)) {
      config += ',\n        range: ' + JSON.stringify(palette);
    } else {
      config += ',\n        palette: ' + JSON.stringify(palette);
    }

    // Add domain if specified
    if (domain && domain.length > 0) {
      config += ',\n        domain: ' + JSON.stringify(domain);
    }

    // Add reverse offset if needed
    if (reverse && !Array.isArray(palette)) {
      config += ',\n        offset: (t) => 1 - t';
    }

    config += '\n      }';

    return config;
  }

  private buildScaleConfig(spec: ChartSpec, valueField: string): string {
    const hasColorScale = spec.colorScale;
    const hasScaleValues = spec.scale?.x?.values || spec.scale?.y?.values;

    if (!hasColorScale && !hasScaleValues) {
      return '';
    }

    let config = ',\n    scale: {';
    const parts: string[] = [];

    // Add color scale if present
    if (hasColorScale) {
      parts.push('\n      ' + this.buildColorScaleConfig(spec, valueField));
    }

    // Add axis value ordering if present
    if (spec.scale?.x?.values) {
      parts.push(`\n      x: {\n        values: ${JSON.stringify(spec.scale.x.values)}\n      }`);
    }

    if (spec.scale?.y?.values) {
      parts.push(`\n      y: {\n        values: ${JSON.stringify(spec.scale.y.values)}\n      }`);
    }

    config += parts.join(',') + '\n    }';

    return config;
  }

  private buildColorMapLegendConfig(spec: ChartSpec): string {
    const show = spec.legend?.show !== false;

    if (!show) {
      return ',\n    legend: false';
    }

    const position = spec.legend?.position || 'right';
    const title = spec.legend?.title;
    const flipPage = spec.legend?.flipPage ?? false;

    let config = ',\n    legend: {\n      color: {\n        position: ' + JSON.stringify(position) + ',\n        flipPage: ' + flipPage;

    if (title) {
      config += ',\n        title: ' + JSON.stringify(title);
    }

    config += '\n      }\n    }';

    return config;
  }

  private buildColorMapAxisConfig(spec: ChartSpec): string {
    if (!spec.axis) {
      return '';
    }

    let config = ',\n    axis: {';
    const parts: string[] = [];

    if (spec.axis.x) {
      let xConfig = '\n      x: {';
      const xParts: string[] = [];

      if (spec.axis.x.title !== undefined) {
        xParts.push(`title: ${spec.axis.x.title === '' ? 'false' : JSON.stringify(spec.axis.x.title)}`);
      }

      // Grid - default false, but allow override
      const xGrid = spec.axis.x.grid ?? false;
      xParts.push(`grid: ${xGrid}`);

      // TickLine - default false, but allow override
      const xTickLine = spec.axis.x.tickLine ?? false;
      xParts.push(`tickLine: ${xTickLine}`);

      if (spec.axis.x.labelRotate !== undefined) {
        xParts.push(`labelRotate: ${spec.axis.x.labelRotate}`);
        // Use explicit labelOffset if provided, otherwise auto-set
        const offset = spec.axis.x.labelOffset ?? (spec.axis.x.labelRotate !== 0 ? 5 : undefined);
        if (offset !== undefined) {
          xParts.push(`labelOffset: ${offset}`);
        }
      } else if (spec.axis.x.labelOffset !== undefined) {
        xParts.push(`labelOffset: ${spec.axis.x.labelOffset}`);
      }

      xConfig += xParts.join(',\n        ') + '\n      }';
      parts.push(xConfig);
    }

    if (spec.axis.y) {
      let yConfig = '\n      y: {';
      const yParts: string[] = [];

      if (spec.axis.y.title !== undefined) {
        yParts.push(`title: ${spec.axis.y.title === '' ? 'false' : JSON.stringify(spec.axis.y.title)}`);
      }

      // Grid - default false, but allow override
      const yGrid = spec.axis.y.grid ?? false;
      yParts.push(`grid: ${yGrid}`);

      // TickLine - default false, but allow override
      const yTickLine = spec.axis.y.tickLine ?? false;
      yParts.push(`tickLine: ${yTickLine}`);

      yConfig += yParts.join(',\n        ') + '\n      }';
      parts.push(yConfig);
    }

    config += parts.join(',') + '\n    }';

    return config;
  }

  private buildLabelsConfig(labelField: string, formatter: string | undefined, textColor: string | undefined, fontSize: number): string {
    let config = ',\n        labels: [\n          {\n            text: ';

    // Label text
    if (formatter) {
      config += formatter;
    } else {
      config += JSON.stringify(labelField);
    }

    // Label style
    config += ',\n            style: {';
    const styleParts: string[] = [];

    if (textColor) {
      styleParts.push(`fill: ${textColor}`);
    }

    styleParts.push(`textAlign: 'center'`);
    styleParts.push(`fontSize: ${fontSize}`);

    config += '\n              ' + styleParts.join(',\n              ') + '\n            }';

    config += '\n          }\n        ]';

    return config;
  }

  private buildColorMapTooltipConfig(spec: ChartSpec, xField: string, yField: string, valueField: string): string {
    if (!spec.tooltip) {
      return '';
    }

    let config = ',\n    tooltip: {';

    // Title
    if (spec.tooltip.title) {
      config += `\n      title: ${spec.tooltip.title}`;
    } else {
      config += `\n      title: (d) => \`\${d.${xField}} - \${d.${yField}}\``;
    }

    // Items
    if (spec.tooltip.items && spec.tooltip.items.length > 0) {
      config += ',\n      items: [\n';
      const items = spec.tooltip.items.map((item: any) => {
        let itemConfig = `        { name: ${JSON.stringify(item.name)}, field: ${JSON.stringify(item.field)}`;

        if (item.valueFormatter) {
          itemConfig += `, valueFormatter: ${item.valueFormatter}`;
        }

        itemConfig += ' }';
        return itemConfig;
      }).join(',\n');
      config += items + '\n      ]';
    } else {
      config += `,\n      items: [{ field: ${JSON.stringify(valueField)}, name: 'Value' }]`;
    }

    config += '\n    }';

    return config;
  }

  private buildInteractionConfig(spec: ChartSpec): string {
    const showTooltip = spec.interaction?.tooltip !== false;
    const showHighlight = spec.interaction?.highlight !== false;

    const interactions: string[] = [];

    if (showTooltip) {
      interactions.push("{ type: 'tooltip' }");
    }

    if (showHighlight) {
      interactions.push("{ type: 'elementHighlight' }");
    }

    if (interactions.length === 0) {
      return '';
    }

    return ',\n    interaction: [' + interactions.join(', ') + ']';
  }

  private buildLinkEncoding(spec: ChartSpec, valueField: string): string {
    if (!spec.link?.enabled) {
      return '';
    }

    const linkField = spec.link.field || valueField;
    return `,\n          link: ${JSON.stringify(linkField)}`;
  }
}
