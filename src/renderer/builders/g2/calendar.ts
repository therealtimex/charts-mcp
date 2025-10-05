import { ChartBuilder } from "../base";
import type { ChartSpec } from "../base";

/**
 * Calendar Heatmap Chart Builder for G2 v5
 *
 * Displays data across days in a calendar grid format.
 * Similar to GitHub contribution graph - shows activity/values by date.
 */
export class CalendarChartBuilder extends ChartBuilder {
  protected buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  /**
   * Transform date data into calendar grid format
   * Adds week number and day of week for positioning
   */
  private transformCalendarData(data: any[]): any[] {
    return data.map((d: any) => {
      const date = new Date(d.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.floor(days / 7);

      return {
        ...d,
        week: weekNumber,
        day: dayOfWeek,
        dateStr: d.date
      };
    });
  }

  buildHtml(spec: ChartSpec): string {
    const data = spec.data ?? [];
    const colorScheme = spec.style?.colorScheme ?? ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

    const transformedData = this.transformCalendarData(data);

    const chartScript = `
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${spec.width ?? 800},
    height: ${spec.height ?? 150},
    theme: ${JSON.stringify(((spec.theme as any) === 'default' ? 'classic' : (spec.theme ?? 'light')))},
    autoFit: false,
    paddingLeft: 40
  });

  chart
    .cell()
    .data(${JSON.stringify(transformedData)})
    .encode('x', 'week')
    .encode('y', 'day')
    .encode('color', 'value')
    .scale('color', {
      type: 'threshold',
      domain: [0, 1, 5, 10, 20],
      range: ${JSON.stringify(colorScheme)}
    })
    .scale('y', {
      domain: [0, 1, 2, 3, 4, 5, 6],
      range: [0, 1]
    })
    .style('stroke', '#fff')
    .style('lineWidth', 2)
    .style('radius', 2)
    .axis('y', {
      tickMethod: () => [0, 1, 2, 3, 4, 5, 6],
      label: {
        formatter: (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]
      }
    })
    .axis('x', {
      title: { text: 'Week of Year' },
      label: { formatter: (d) => \`W\${d}\` }
    })
    .tooltip({
      title: 'dateStr',
      items: [{ field: 'value', name: 'Count' }]
    })
    .legend({ position: 'bottom' });

  chart.render();
`;

    return this.buildContainer(spec, chartScript);
  }
}
