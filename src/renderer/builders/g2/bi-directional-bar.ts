/**
 * G2 v5 Bi-directional Bar Chart Builder
 * Builds positive-negative bar charts using @antv/g2 v5
 * Supports stacking and hollow/solid styling for type distinction
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class BiDirectionalBarChartBuilder extends ChartBuilder {
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
      orientation = 'horizontal',
      positiveType,
      negativeType,
      positiveTypes,
      negativeTypes,
      neutralType,
      hollowNegative = true,
      stack = false
    } = spec;

    const hasGroup = this.hasGroupField(data);
    const isHorizontal = orientation === 'horizontal';

    // Support both old (positiveType/negativeType) and new (positiveTypes/negativeTypes) API
    let posTypes: string[];
    let negTypes: string[];
    let neutralTypeValue: string | undefined = neutralType;

    if (positiveTypes && negativeTypes) {
      // New API with arrays
      posTypes = positiveTypes;
      negTypes = negativeTypes;
    } else {
      // Old API or auto-detect
      const types = this.getUniqueTypes(data);
      posTypes = positiveType ? [positiveType] : [types[0]];
      negTypes = negativeType ? [negativeType] : [types[1]];
    }

    // Build the color range for groups
    const palette = spec.style?.palette || [
      '#7593ed', '#95e3b0', '#6c7893', '#e7c450', '#7460eb'
    ];

    // Build the y-encoding function based on positive/negative/neutral types
    const yEncodingFunction = this.buildYEncodingFunction(posTypes, negTypes, neutralTypeValue);

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  const data = ${JSON.stringify(data)};
  const positiveTypes = ${JSON.stringify(posTypes)};
  const negativeTypes = ${JSON.stringify(negTypes)};
  const neutralType = ${JSON.stringify(neutralTypeValue)};
  const palette = ${JSON.stringify(palette)};

  chart
    .interval()
    ${isHorizontal ? `.coordinate({ transform: [{ type: 'transpose' }] })` : ''}
    .data(data)
    .encode('x', 'category')
    .encode('y', ${yEncodingFunction})
    ${hasGroup ? `.encode('color', 'group')` : `.encode('color', 'type')`}
    ${stack ? `.transform({ type: 'stackY' })` : ''}
    .scale('x', { padding: 0.5 })
    ${hasGroup ? `.scale('color', { type: 'ordinal', range: palette })` : ''}
    .axis('x', { title: ${JSON.stringify(spec.axisXTitle || '')} })
    .axis('y', {
      title: ${JSON.stringify(spec.axisYTitle || '')},
      labelFormatter: (d) => Math.abs(d)
    })
    ${hollowNegative ? this.buildHollowStyle(negTypes, neutralTypeValue) : ''}
    .tooltip({
      title: (d) => {
        ${hasGroup ? `return \`\${d.group} - \${d.category}\`;` : `return d.category;`}
      },
      items: [
        (d) => ({
          name: d.type,
          value: d.value
        })
      ]
    })
    .legend(${hasGroup ? 'true' : 'false'});

  chart.render();
</script>`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private getUniqueTypes(data: any[]): string[] {
    if (!Array.isArray(data)) return [];
    const types = new Set<string>();
    data.forEach(d => {
      if (d && d.type) types.add(d.type);
    });
    return Array.from(types);
  }

  /**
   * Build the y-encoding function that handles positive/negative/neutral types
   */
  private buildYEncodingFunction(positiveTypes: string[], negativeTypes: string[], neutralType?: string): string {
    // Build the function as a string that will be evaluated in the chart script
    return `(d) => {
      // Check if it's a negative type
      if (negativeTypes.includes(d.type)) {
        return -d.value;
      }
      // Check if it's a neutral type (split across axis)
      if (neutralType && d.type === neutralType) {
        return -d.value / 2;
      }
      // Otherwise it's positive
      return d.value;
    }`;
  }

  private buildHollowStyle(negativeTypes: string[], neutralType?: string): string {
    return `.style({
      fill: (d, i) => {
        // Make negative types transparent (hollow)
        if (negativeTypes.includes(d.type)) {
          return 'transparent';
        }
      },
      stroke: (d, i) => {
        // Add stroke to negative types
        if (negativeTypes.includes(d.type)) {
          // Use the index to get color from palette
          // For grouped data, colors are assigned by group
          return palette[Math.floor(i / 2) % palette.length];
        }
      },
      lineWidth: 2
    })`;
  }
}
