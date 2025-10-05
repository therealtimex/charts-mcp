import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Candlestick Chart Builder for G2 v5
 *
 * Financial chart showing open, high, low, close (OHLC) data.
 * Used for stock prices and financial analysis.
 */
export class CandlestickChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const upColor = spec.style?.upColor ?? '#30BF78';
    const downColor = spec.style?.downColor ?? '#F4664A';

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 800},
    height: ${spec.height ?? 400},
    theme: ${JSON.stringify(((spec.theme as any) === 'default' ? 'classic' : (spec.theme ?? 'light')))},
    autoFit: false
  });

  const data = ${JSON.stringify(data)}.map(d => ({
    ...d,
    direction: d.close >= d.open ? 'up' : 'down'
  }));

  // High-Low lines (wicks)
  chart
    .line()
    .data(data)
    .encode('x', 'date')
    .encode('y', ['low', 'high'])
    .encode('color', 'direction')
    .scale('color', {
      domain: ['up', 'down'],
      range: [${JSON.stringify(upColor)}, ${JSON.stringify(downColor)}]
    })
    .style('lineWidth', 1)
    .tooltip(false)
    .legend(false);

  // Open-Close boxes (bodies)
  chart
    .interval()
    .data(data)
    .encode('x', 'date')
    .encode('y', ['open', 'close'])
    .encode('color', 'direction')
    .scale('color', {
      domain: ['up', 'down'],
      range: [${JSON.stringify(upColor)}, ${JSON.stringify(downColor)}]
    })
    .style('maxWidth', 10)
    .tooltip({
      title: 'date',
      items: [
        { field: 'open', name: 'Open' },
        { field: 'high', name: 'High' },
        { field: 'low', name: 'Low' },
        { field: 'close', name: 'Close' }
      ]
    });

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
