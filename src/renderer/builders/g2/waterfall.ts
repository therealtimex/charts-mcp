import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Waterfall Chart Builder for G2 v5
 *
 * Shows cumulative effect of sequential positive/negative values.
 * Useful for financial statements, inventory analysis, etc.
 */
export class WaterfallChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  /**
   * Transform data to waterfall format with cumulative calculations
   */
  private transformWaterfallData(data: any[]): any[] {
    let cumulative = 0;
    return data.map((d: any, idx: number) => {
      const isTotal = d.isTotal || false;
      const value = d.value;

      if (isTotal) {
        // Total columns start from 0
        return {
          ...d,
          start: 0,
          end: cumulative,
          value: cumulative,
          type: 'total'
        };
      } else {
        const start = cumulative;
        cumulative += value;
        const end = cumulative;

        return {
          ...d,
          start,
          end,
          value,
          type: value >= 0 ? 'increase' : 'decrease'
        };
      }
    });
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];

    // Normalize palette to object format
    const defaultPalette = {
      increase: '#30BF78',
      decrease: '#F4664A',
      total: '#5B8FF9'
    };

    const palette = Array.isArray(spec.style?.palette)
      ? {
          increase: spec.style.palette[0] ?? defaultPalette.increase,
          decrease: spec.style.palette[1] ?? defaultPalette.decrease,
          total: spec.style.palette[2] ?? defaultPalette.total
        }
      : { ...defaultPalette, ...(spec.style?.palette ?? {}) };

    const transformedData = this.transformWaterfallData(data);

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 600},
    height: ${spec.height ?? 400},
    theme: ${JSON.stringify(((spec.theme as any) === 'default' ? 'classic' : (spec.theme ?? 'light')))},
    autoFit: false
  });

  const data = ${JSON.stringify(transformedData)};

  chart
    .interval()
    .data(data)
    .encode('x', 'category')
    .encode('y', ['start', 'end'])
    .encode('color', 'type')
    .scale('color', {
      domain: ['increase', 'decrease', 'total'],
      range: [${JSON.stringify(palette.increase)}, ${JSON.stringify(palette.decrease)}, ${JSON.stringify(palette.total)}]
    })
    .style('maxWidth', 40)
    .label({
      text: (d) => d.value.toFixed(0),
      position: 'top',
      style: { fontSize: 12 }
    })
    .tooltip({
      title: 'category',
      items: [
        { field: 'value', name: 'Change' },
        { field: 'end', name: 'Cumulative' }
      ]
    })
    .legend({ position: 'top' });

  // Connect bars with lines
  const lineData = data.map((d, i) => ({
    category: d.category,
    value: d.end,
    nextCategory: data[i + 1]?.category,
    index: i
  })).filter(d => d.nextCategory);

  if (lineData.length > 0) {
    chart
      .line()
      .data(lineData)
      .encode('x', 'category')
      .encode('y', 'value')
      .style('stroke', '#999')
      .style('lineWidth', 1)
      .style('lineDash', [4, 4])
      .tooltip(false)
      .legend(false);
  }

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
