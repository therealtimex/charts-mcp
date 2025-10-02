import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Dual-Axes Chart Builder for G2 v5
 *
 * Creates a combination chart with two y-axes, typically a column chart (left axis)
 * and a line chart (right axis). Useful for showing two metrics with different scales.
 */
export class DualAxesChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const categories = spec.categories ?? [];
    const series = spec.series ?? [];
    const palette = spec.style?.palette ?? ["#5B8FF9", "#5AD8A6"];

    // Transform series data into G2 format
    const chartData: any[] = [];
    series.forEach((s: any, idx: number) => {
      s.data.forEach((value: number, i: number) => {
        chartData.push({
          category: categories[i],
          value: value,
          type: s.axisYTitle || s.type,
          seriesType: s.type
        });
      });
    });

    const axisXTitle = spec.axisXTitle ? `.axis('x', { title: { text: ${JSON.stringify(spec.axisXTitle)} } })` : '';

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 600},
    height: ${spec.height ?? 400},
    theme: ${JSON.stringify(spec.theme ?? "light")},
    autoFit: false
  });

  const data = ${JSON.stringify(chartData)};

  // Column series (left axis)
  const columnData = data.filter(d => d.seriesType === 'column');
  if (columnData.length > 0) {
    chart
      .interval()
      .data(columnData)
      .encode('x', 'category')
      .encode('y', 'value')
      .encode('color', 'type')
      .scale('color', { range: [${JSON.stringify(palette[0])}] })
      ${axisXTitle}
      .axis('y', {
        title: { text: columnData[0].type },
        position: 'left'
      })
      .tooltip({ title: 'category', items: [{ field: 'value', name: columnData[0].type }] });
  }

  // Line series (right axis)
  const lineData = data.filter(d => d.seriesType === 'line');
  if (lineData.length > 0) {
    chart
      .line()
      .data(lineData)
      .encode('x', 'category')
      .encode('y', 'value')
      .encode('color', 'type')
      .scale('y', { independent: true, domainMin: 0 })
      .scale('color', { range: [${JSON.stringify(palette[1] || palette[0])}] })
      .axis('y', {
        title: { text: lineData[0].type },
        position: 'right'
      })
      .style('lineWidth', 2)
      .tooltip({ title: 'category', items: [{ field: 'value', name: lineData[0].type }] });

    // Add points to line
    chart
      .point()
      .data(lineData)
      .encode('x', 'category')
      .encode('y', 'value')
      .encode('color', 'type')
      .encode('shape', 'point')
      .encode('size', 3)
      .scale('y', { independent: true, domainMin: 0 })
      .scale('color', { range: [${JSON.stringify(palette[1] || palette[0])}] })
      .axis(false)
      .legend(false)
      .tooltip(false);
  }

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
