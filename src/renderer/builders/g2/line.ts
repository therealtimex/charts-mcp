/**
 * G2 v5 Line Chart Builder
 * Builds line charts using @antv/g2 v5
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class LineChartBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400, shape, point, style, axis, encode } = spec;

    // Field mappings with defaults
    const xField = encode?.x || 'time';
    const yField = encode?.y || 'value';
    const colorField = encode?.color || 'group';

    const hasGroup = Array.isArray(data) && data.length > 0 && data.some(d => d && typeof d[colorField] !== 'undefined');

    // Line mark configuration
    const lineShape = shape || 'line';
    const lineWidth = style?.lineWidth || 2;
    const lineDash = style?.lineDash;
    const singleSeriesStroke = style?.stroke || (style?.palette && style.palette[0]);

    // Point mark configuration
    const showPoints = point?.show === true;
    const pointShape = point?.shape || 'circle';
    const pointSize = point?.size || 3;

    // Palette configuration (type-safe)
    const palette = style?.palette;
    const paletteConfig = (hasGroup && palette) ? `.scale('color', { range: ${JSON.stringify(palette)} })` : '';
    const transformConfig = Array.isArray((spec as any).transform) && (spec as any).transform.length > 0
      ? (spec as any).transform.map((t: any) => `line.transform(${JSON.stringify(t)});`).join('\n  ')
      : '';

    const chartScript = `
  const { Chart } = G2;

  // Dynamic height helper to maintain aspect ratio and avoid scroll
  const __container = document.getElementById('container');
  const __ratio = ${height} / ${width};
  const __minH = 200; // sensible minimum
  const __vhCap = 0.85; // cap height to 85% of viewport height to avoid scroll
  function __fitHeight() {
    if (!__container) return;
    const maxH = Math.max(__minH, Math.floor(window.innerHeight * __vhCap));
    const target = Math.min(maxH, Math.max(__minH, Math.round(__container.clientWidth * __ratio)));
    __container.style.height = target + 'px';
  }
  // Initial sizing before chart creation so G2 reads correct size
  __fitHeight();
  window.addEventListener('resize', __fitHeight);

  const chartOptions = {
    container: 'container',
    ${spec.autoFit === true ? '' : `width: ${width},`}
    ${spec.autoFit === true ? '' : `height: ${height},`}
    theme: ${JSON.stringify((theme as any) === 'default' ? 'classic' : theme)},
    autoFit: ${JSON.stringify(spec.autoFit === true)}
  };

  const chart = new Chart(chartOptions);

  const line = chart
    .line()
    .data(${JSON.stringify(data)})
    .encode('x', ${JSON.stringify(xField)})
    .encode('y', ${JSON.stringify(yField)});

  // Encode shape if specified
  if (${JSON.stringify(lineShape)} !== 'line') {
    line.encode('shape', ${JSON.stringify(lineShape)});
  }

  // Encode color and series for multi-series or single series
  if (${hasGroup}) {
    line.encode('color', ${JSON.stringify(colorField)});
    line.encode('series', ${JSON.stringify(colorField)});
  } else if (${JSON.stringify(singleSeriesStroke)}) {
    line.style('stroke', ${JSON.stringify(singleSeriesStroke)});
  }

  // Apply styles
  line.style('lineWidth', ${lineWidth});
  if (${JSON.stringify(lineDash)}) {
    line.style('lineDash', ${JSON.stringify(lineDash)});
  }
  
  // Apply palette
  if (${hasGroup} && ${palette ? 'true' : 'false'}) {
    line.scale('color', { range: ${JSON.stringify(palette)} });
  }

  // Apply custom transforms (e.g., sample)
  ${transformConfig}

  ${this.buildLineAxisConfig(spec)}

  line.legend('color', ${hasGroup});

  ${showPoints ? `
  const pointMark = chart
    .point()
    .data(${JSON.stringify(data)})
    .encode('x', ${JSON.stringify(xField)})
    .encode('y', ${JSON.stringify(yField)})
    .encode('shape', ${JSON.stringify(pointShape)})
    .encode('size', ${pointSize})
    .tooltip(false);

  if (${hasGroup}) {
    pointMark.encode('color', ${JSON.stringify(colorField)});
    pointMark.encode('series', ${JSON.stringify(colorField)});
  } else if (${JSON.stringify(singleSeriesStroke)}) {
    pointMark.style('stroke', ${JSON.stringify(singleSeriesStroke)});
  }
  
  // Apply palette to points
  if (${hasGroup} && ${palette ? 'true' : 'false'}) {
    pointMark.scale('color', { range: ${JSON.stringify(palette)} });
  }
  ` : ''}

  chart.render();
`;
    return `<script>${chartScript}</script>`;
  }

  private hasGroupField(data: any[], colorField: string): boolean {
    return Array.isArray(data) && data.some(d => d && d[colorField] != null);
  }

  private getLineColor(spec: ChartSpec): string {
    const palette = spec.style?.palette;
    if (palette && palette.length > 0) {
      return JSON.stringify(palette[0]);
    }
    return JSON.stringify('#5B8FF9'); // Default G2 blue
  }

  /**
   * Build axis configuration merging both axis object and axisXTitle/axisYTitle
   */
  private buildLineAxisConfig(spec: ChartSpec): string {
    const { axis, axisXTitle, axisYTitle } = spec;
    let script = '';

    // Build X axis config
    const xAxisParts: string[] = [];
    const hasXAxisTitle = axis?.x?.title !== undefined || !!axisXTitle;
    const hasXAxisFormatter = !!axis?.x?.labelFormatter;

    if (hasXAxisTitle || hasXAxisFormatter) {
      if (axis?.x?.title === false) {
        xAxisParts.push('title: false');
      } else if (typeof axis?.x?.title === 'string') {
        xAxisParts.push(`title: { text: ${JSON.stringify(axis.x.title)} }`);
      } else if (axisXTitle) {
        xAxisParts.push(`title: { text: ${JSON.stringify(axisXTitle)} }`);
      }

      if (axis?.x?.labelFormatter) {
        xAxisParts.push(`labelFormatter: (d) => d + ${JSON.stringify(axis.x.labelFormatter)}`);
      }

      if (xAxisParts.length > 0) {
        script += `\n  line.axis('x', { ${xAxisParts.join(', ')} });`;
      }
    }

    // Build Y axis config
    const yAxisParts: string[] = [];
    const hasYAxisTitle = axis?.y?.title !== undefined || !!axisYTitle;
    const hasYAxisFormatter = !!axis?.y?.labelFormatter;

    if (hasYAxisTitle || hasYAxisFormatter) {
      if (axis?.y?.title === false) {
        yAxisParts.push('title: false');
      } else if (typeof axis?.y?.title === 'string') {
        yAxisParts.push(`title: { text: ${JSON.stringify(axis.y.title)} }`);
      } else if (axisYTitle) {
        yAxisParts.push(`title: { text: ${JSON.stringify(axisYTitle)} }`);
      }

      if (axis?.y?.labelFormatter) {
        yAxisParts.push(`labelFormatter: (d) => d + ${JSON.stringify(axis.y.labelFormatter)}`);
      }

      if (yAxisParts.length > 0) {
        script += `\n  line.axis('y', { ${yAxisParts.join(', ')} });`;
      }
    }

    return script;
  }
}
