/**
 * G2 v5 Area Chart Builder
 * Builds area charts with full G2 v5 capabilities
 * Supports: basic, range, stacked, percentage, difference area charts
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class AreaChartBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400 } = spec;

    // Determine chart type and configuration
    const chartType = spec.chartType || this.inferChartType(spec, data);
    const useChildren = spec.children && spec.children.length > 0;

    if (useChildren) {
      return this.buildComposedChart(spec);
    }

    return this.buildSimpleChart(spec, chartType);
  }

  private inferChartType(spec: ChartSpec, data: any[]): string {
    // Legacy stack support
    if (spec.stack === true) return 'stacked';

    // Check transforms
    if (spec.transform) {
      const hasNormalizeY = spec.transform.some((t: any) => t.type === 'normalizeY');
      const hasStackY = spec.transform.some((t: any) => t.type === 'stackY');
      const hasDiffY = spec.transform.some((t: any) => t.type === 'diffY');
      const hasWiggle = spec.transform.some((t: any) => t.type === 'stackY' && t.offset === 'wiggle');

      if (hasWiggle) return 'streamgraph';
      if (hasNormalizeY) return 'percentage';
      if (hasDiffY) return 'difference';
      if (hasStackY) return 'stacked';
    }

    // Check data structure
    if (data && data.length > 0 && data[0]) {
      if ('low' in data[0] && 'high' in data[0]) return 'range';
      if ('group' in data[0] || this.hasGroupField(data)) return 'stacked';
    }

    return 'basic';
  }

  private buildSimpleChart(spec: ChartSpec, chartType: string): string {
    const { data, theme = 'light', width = 600, height = 400 } = spec;
    const encode = this.buildEncode(spec, data, chartType);
    const transforms = this.buildTransforms(spec, chartType);
    const scale = this.buildScale(spec);
    const axis = this.buildAxisWithFormatter(spec);
    const style = this.buildStyle(spec);
    const shape = spec.shape ? `.encode('shape', ${JSON.stringify(spec.shape)})` : '';
    const connectNulls = spec.connectNulls ? `.style('connectNulls', true)` : '';

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
    .area()
    .data(${JSON.stringify(data)})
    ${encode}
    ${transforms}
    ${scale}
    ${axis}
    ${shape}
    ${style}
    ${connectNulls}
    .legend(${this.shouldShowLegend(spec, data)});

  chart.render();
</script>`;
  }

  private buildComposedChart(spec: ChartSpec): string {
    const { data, theme = 'light', width = 600, height = 400 } = spec;
    const scale = this.buildScale(spec);
    const axis = this.buildAxisWithFormatter(spec);
    const children = this.buildChildren(spec);

    return `<script>
  const { Chart } = G2;

  const chart = new Chart({
    container: 'container',
    width: ${width},
    height: ${height},
    theme: ${JSON.stringify(theme)},
    autoFit: false
  });

  chart.options({
    type: 'view',
    data: ${JSON.stringify(data)},
    ${scale}
    ${axis}
    children: ${children}
  });

  chart.render();
</script>`;
  }

  private buildEncode(spec: ChartSpec, data: any[], chartType: string): string {
    const parts: string[] = [];
    const firstRow = data[0] || {};

    // Helper to choose X from provided encode or data shape
    const pickX = () => {
      const enc = (spec as any).encode || {};
      if (enc.x) return enc.x;
      if ('x' in firstRow) return 'x';
      if ('time' in firstRow) return 'time';
      if ('date' in firstRow) return (d: any) => new Date(d.date);
      // Fallback: first string-like key
      const k = Object.keys(firstRow).find((key) => key !== 'y' && key !== 'value' && key !== 'group');
      return k || 'x';
    };

    // Helper to choose Y from provided encode or data shape
    const pickY = () => {
      const enc = (spec as any).encode || {};
      if (enc.y) return enc.y;
      if (chartType === 'range' && 'low' in firstRow && 'high' in firstRow) return ['low', 'high'];
      if ('y' in firstRow) return 'y';
      if ('value' in firstRow) return 'value';
      // Fallback: first numeric-like key
      const k = Object.keys(firstRow).find((key) => typeof (firstRow as any)[key] === 'number');
      return k || 'value';
    };

    const xEnc = pickX();
    const yEnc = pickY();

    // Helper: detect function-like strings (arrow or function keyword)
    const isFunctionLike = (v: unknown) => typeof v === 'string' && (/=>/.test(v) || /function\s*\(/.test(v.trim()) || /^\s*\(/.test(v.trim()));

    // Encode X/Y
    parts.push(`.encode('x', ${typeof xEnc === 'function' ? xEnc.toString() : (isFunctionLike(xEnc) ? String(xEnc) : JSON.stringify(xEnc))})`);
    if (Array.isArray(yEnc)) {
      parts.push(`.encode('y', ${JSON.stringify(yEnc)})`);
    } else {
      parts.push(`.encode('y', ${JSON.stringify(yEnc)})`);
    }

    // Color/Series
    const hasGroup = this.hasGroupField(data) || 'group' in firstRow;
    const enc = (spec as any).encode || {};
    if (enc.color) {
      parts.push(`.encode('color', ${JSON.stringify(enc.color)})`);
    } else if (hasGroup) {
      parts.push(`.encode('color', 'group')`);
      parts.push(`.encode('series', 'group')`);
    } else {
      const color = this.getAreaColor(spec);
      parts.push(`.encode('color', ${color})`);
    }
    if (enc.series) parts.push(`.encode('series', ${JSON.stringify(enc.series)})`);

    return parts.join('\n    ');
  }

  private buildTransforms(spec: ChartSpec, chartType: string): string {
    const transforms: string[] = [];

    // Custom transforms
    if (spec.transform && Array.isArray(spec.transform)) {
      spec.transform.forEach((t: any) => {
        if (t.type === 'stackY') {
          const config: any = { type: 'stackY' };
          if (t.orderBy) config.orderBy = t.orderBy;
          if (t.offset) config.offset = t.offset;
          transforms.push(`.transform(${JSON.stringify(config)})`);
        } else if (t.type === 'normalizeY') {
          transforms.push(`.transform({ type: 'normalizeY' })`);
        } else if (t.type === 'diffY') {
          transforms.push(`.transform({ type: 'diffY' })`);
        } else if (t.type === 'map' && t.callback) {
          transforms.push(`.transform({ type: 'map', callback: ${t.callback} })`);
        } else if (t.type === 'fold' && t.fields) {
          transforms.push(`.transform({
            type: 'fold',
            fields: ${JSON.stringify(t.fields)},
            key: ${JSON.stringify(t.key || 'key')},
            value: ${JSON.stringify(t.value || 'value')}
          })`);
        }
      });
    }

    // Auto transforms based on chart type
    if (transforms.length === 0) {
      if (chartType === 'streamgraph') {
        transforms.push(`.transform({ type: 'stackY', orderBy: 'series', offset: 'wiggle' })`);
      } else if (chartType === 'stacked') {
        transforms.push(`.transform({ type: 'stackY' })`);
      } else if (chartType === 'percentage') {
        transforms.push(`.transform({ type: 'stackY' })`);
        transforms.push(`.transform({ type: 'normalizeY' })`);
      } else if (chartType === 'difference') {
        transforms.push(`.transform({ type: 'diffY' })`);
      }
    }

    return transforms.join('\n    ');
  }

  private buildScale(spec: ChartSpec): string {
    if (!spec.scale) return '';

    const parts: string[] = [];

    if (spec.scale.x) {
      parts.push(`x: ${JSON.stringify(spec.scale.x)}`);
    }
    if (spec.scale.y) {
      parts.push(`y: ${JSON.stringify(spec.scale.y)}`);
    }
    if (spec.scale.color) {
      parts.push(`color: ${JSON.stringify(spec.scale.color)}`);
    }

    return parts.length > 0 ? `.scale({ ${parts.join(', ')} })` : '';
  }

  private buildAxisWithFormatter(spec: ChartSpec): string {
    const parts: string[] = [];

    // Custom axis config with formatters
    if (spec.axis) {
      if (spec.axis.x) {
        const xConfig: any = {};
        if (spec.axis.x.title !== undefined) xConfig.title = spec.axis.x.title;
        if (spec.axis.x.labelFormatter) xConfig.labelFormatter = spec.axis.x.labelFormatter;
        parts.push(`x: ${JSON.stringify(xConfig)}`);
      }
      if (spec.axis.y) {
        const yConfig: any = {};
        if (spec.axis.y.title !== undefined) yConfig.title = spec.axis.y.title;
        if (spec.axis.y.labelFormatter) yConfig.labelFormatter = spec.axis.y.labelFormatter;
        parts.push(`y: ${JSON.stringify(yConfig)}`);
      }
    }

    // Legacy axis titles
    if (!spec.axis) {
      if (spec.axisXTitle) parts.push(`x: { title: ${JSON.stringify(spec.axisXTitle)} }`);
      if (spec.axisYTitle) parts.push(`y: { title: ${JSON.stringify(spec.axisYTitle)} }`);
    }

    return parts.length > 0 ? `.axis({ ${parts.join(', ')} })` : this.buildAxisConfig(spec);
  }

  private buildStyle(spec: ChartSpec): string {
    const styles: string[] = [];
    const style = spec.style || {};

    // Fill and opacity
    if (style.fill) {
      styles.push(`.style('fill', ${JSON.stringify(style.fill)})`);
    }
    if (style.fillOpacity !== undefined) {
      styles.push(`.style('fillOpacity', ${style.fillOpacity})`);
    } else {
      styles.push(`.style('fillOpacity', 0.6)`);
    }

    // Stroke
    if (style.stroke) {
      styles.push(`.style('stroke', ${JSON.stringify(style.stroke)})`);
    }
    if (style.strokeOpacity !== undefined) {
      styles.push(`.style('strokeOpacity', ${style.strokeOpacity})`);
    }
    if (style.lineWidth !== undefined) {
      styles.push(`.style('lineWidth', ${style.lineWidth})`);
    }

    return styles.join('\n    ');
  }

  private buildChildren(spec: ChartSpec): string {
    if (!spec.children || spec.children.length === 0) return '[]';

    const children = spec.children.map((child: any) => {
      const parts: string[] = [`type: ${JSON.stringify(child.type)}`];

      if (child.encode) {
        const encodeObj: any = {};
        if (child.encode.x) encodeObj.x = child.encode.x;
        if (child.encode.y) encodeObj.y = child.encode.y;
        if (child.encode.color) encodeObj.color = child.encode.color;
        if (child.encode.size) encodeObj.size = child.encode.size;
        if (child.encode.shape) encodeObj.shape = child.encode.shape;
        parts.push(`encode: ${JSON.stringify(encodeObj)}`);
      }

      if (child.style) {
        parts.push(`style: ${JSON.stringify(child.style)}`);
      }

      if (child.tooltip) {
        parts.push(`tooltip: ${JSON.stringify(child.tooltip)}`);
      }

      return `{ ${parts.join(', ')} }`;
    });

    return `[${children.join(', ')}]`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private shouldShowLegend(spec: ChartSpec, data: any[]): string {
    const hasGroup = this.hasGroupField(data);
    const hasColorEncoding = spec.encode?.color !== undefined;
    return JSON.stringify(hasGroup || hasColorEncoding);
  }

  private getAreaColor(spec: ChartSpec): string {
    // Check for custom fill color first
    if (spec.style?.fill) {
      return JSON.stringify(spec.style.fill);
    }

    const palette = spec.style?.palette;
    if (palette && palette.length > 0) {
      return JSON.stringify(palette[0]);
    }
    return JSON.stringify('#5B8FF9');
  }
}
