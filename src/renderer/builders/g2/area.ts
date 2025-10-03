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
    const children = this.buildChildren(spec);

    // Build options-style axis config
    const axisOptions = this.buildAxisOptions(spec);
    // Build options-style scale config
    const scaleOptions = this.buildScaleOptions(spec);

    // Build primary area child from top-level encodes/transforms if present
    const primaryAreaChild = this.buildPrimaryAreaChild(spec);
    const childrenArray = primaryAreaChild ? `[${primaryAreaChild}, ${children.slice(1, -1)}]` : children;

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
    ${scaleOptions}
    ${axisOptions}
    children: ${childrenArray}
  });

  chart.render();
</script>`;
  }

  // Build options-style axis configuration
  private buildAxisOptions(spec: ChartSpec): string {
    const axis: any = {};
    if (spec.axis?.x || spec.axisXTitle !== undefined) {
      axis.x = {};
      if (spec.axis?.x?.title !== undefined) axis.x.title = spec.axis.x.title;
      if (spec.axisXTitle && (axis.x.title === undefined || axis.x.title === '')) axis.x.title = spec.axisXTitle;
      if (spec.axis?.x?.labelFormatter) axis.x.labelFormatter = spec.axis.x.labelFormatter;
    }
    if (spec.axis?.y || spec.axisYTitle !== undefined) {
      axis.y = {};
      if (spec.axis?.y?.title !== undefined) axis.y.title = spec.axis.y.title;
      if (spec.axisYTitle && (axis.y.title === undefined || axis.y.title === '')) axis.y.title = spec.axisYTitle;
      if (spec.axis?.y?.labelFormatter) axis.y.labelFormatter = spec.axis.y.labelFormatter;
    }
    return Object.keys(axis).length ? `axis: ${JSON.stringify(axis)},` : '';
  }

  // Build options-style scale configuration
  private buildScaleOptions(spec: ChartSpec): string {
    if (!spec.scale) return '';
    const s: any = {};
    if (spec.scale.x) s.x = spec.scale.x;
    if (spec.scale.y) s.y = spec.scale.y;
    if (spec.scale.color) s.color = spec.scale.color;
    return Object.keys(s).length ? `scale: ${JSON.stringify(s)},` : '';
  }

  // Build a primary area child mark from top-level spec (encode/transform/shape/style)
  private buildPrimaryAreaChild(spec: ChartSpec): string | null {
    // Helper: detect function-like strings
    const isFunctionLike = (v: unknown) => typeof v === 'string' && (/=>/.test(v) || /function\s*\(/.test(v.trim()) || /^\s*\(/.test(v.trim()))
    const enc = (spec as any).encode || {};
    // Build encode only if at least x and y present via encode or data inferrable
    const data = spec.data as any;
    const first = Array.isArray(data) ? (data[0] || {}) : {};
    const xField = enc.x || ('x' in first ? 'x' : ('time' in first ? 'time' : ('year' in first ? 'year' : null)));
    const yField = enc.y || (('y' in first) ? 'y' : (('value' in first) ? 'value' : null));
    if (!xField || !yField) return null;

    const encParts: string[] = [];
    encParts.push(`x: ${isFunctionLike(xField) ? String(xField) : JSON.stringify(xField)}`);
    if (Array.isArray(yField)) encParts.push(`y: ${JSON.stringify(yField)}`); else encParts.push(`y: ${JSON.stringify(yField)}`);
    if (enc.color) encParts.push(`color: ${JSON.stringify(enc.color)}`);
    if (enc.series) encParts.push(`series: ${JSON.stringify(enc.series)}`);
    if (spec.shape) encParts.push(`shape: ${JSON.stringify(spec.shape)}`);

    // Split transforms: data-level vs mark-level
    const dataT: string[] = [];
    const markT: string[] = [];
    if (spec.transform && Array.isArray(spec.transform)) {
      spec.transform.forEach((t: any) => {
        if (t.type === 'fold' && t.fields) {
          dataT.push(`{ type: 'fold', fields: ${JSON.stringify(t.fields)}, key: ${JSON.stringify(t.key || 'key')}, value: ${JSON.stringify(t.value || 'value')} }`);
        } else if (t.type === 'map' && t.callback) {
          dataT.push(`{ type: 'map', callback: ${t.callback} }`);
        } else if (t.type === 'stackY') {
          const cfg: any = { type: 'stackY' };
          if (t.orderBy) cfg.orderBy = t.orderBy;
          if (t.offset) cfg.offset = t.offset;
          if (typeof t.reverse === 'boolean') cfg.reverse = t.reverse;
          if (typeof t.y === 'string') cfg.y = t.y;
          markT.push(JSON.stringify(cfg));
        } else if (t.type === 'normalizeY') {
          markT.push(`{ "type": "normalizeY" }`);
        } else if (t.type === 'diffY') {
          markT.push(`{ "type": "diffY" }`);
        }
      });
    }

    // Style
    const style: any = {};
    if (spec.style?.fill) style.fill = spec.style.fill;
    if (spec.style?.fillOpacity !== undefined) style.fillOpacity = spec.style.fillOpacity;
    if (spec.style?.stroke) style.stroke = spec.style.stroke;
    if (spec.style?.strokeOpacity !== undefined) style.strokeOpacity = spec.style.strokeOpacity;
    if (spec.style?.lineWidth !== undefined) style.lineWidth = spec.style.lineWidth;

    const stylePart = Object.keys(style).length ? `, style: ${JSON.stringify(style)}` : '';
    const dataPart = dataT.length ? `, data: { transform: [${dataT.join(', ')}] }` : '';
    const transformPart = markT.length ? `, transform: [${markT.join(', ')}]` : '';
    return `{ type: 'area', encode: { ${encParts.join(', ')} }${stylePart}${dataPart}${transformPart} }`;
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
    if (enc.color !== undefined) {
      parts.push(`.encode('color', ${isFunctionLike(enc.color) ? String(enc.color) : JSON.stringify(enc.color)})`);
    } else if (hasGroup) {
      parts.push(`.encode('color', 'group')`);
      parts.push(`.encode('series', 'group')`);
    } else {
      const color = this.getAreaColor(spec);
      parts.push(`.encode('color', ${color})`);
    }
    if (enc.series !== undefined) parts.push(`.encode('series', ${isFunctionLike(enc.series) ? String(enc.series) : JSON.stringify(enc.series)})`);

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
          if (typeof t.reverse === 'boolean') config.reverse = t.reverse;
          if (typeof t.y === 'string') config.y = t.y;
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
    if ((style as any).gradient) {
      styles.push(`.style('gradient', ${JSON.stringify((style as any).gradient)})`);
    }

    return styles.join('\n    ');
  }

  private buildChildren(spec: ChartSpec): string {
    if (!spec.children || spec.children.length === 0) return '[]';

    const children = spec.children.map((child: any) => {
      const parts: string[] = [`type: ${JSON.stringify(child.type)}`];

      // Helper: detect function-like strings
      const isFunctionLike = (v: unknown) => typeof v === 'string' && (/=>/.test(v) || /function\s*\(/.test(v.trim()) || /^\s*\(/.test(v.trim()));

      if (child.encode) {
        const encParts: string[] = [];
        const enc = child.encode;
        if (enc.x !== undefined) encParts.push(`x: ${isFunctionLike(enc.x) ? String(enc.x) : JSON.stringify(enc.x)}`);
        if (enc.y !== undefined) {
          if (Array.isArray(enc.y)) encParts.push(`y: ${JSON.stringify(enc.y)}`);
          else encParts.push(`y: ${isFunctionLike(enc.y) ? String(enc.y) : JSON.stringify(enc.y)}`);
        }
        if (enc.color !== undefined) encParts.push(`color: ${JSON.stringify(enc.color)}`);
        if (enc.size !== undefined) encParts.push(`size: ${JSON.stringify(enc.size)}`);
        if (enc.shape !== undefined) encParts.push(`shape: ${JSON.stringify(enc.shape)}`);
        if (encParts.length > 0) parts.push(`encode: { ${encParts.join(', ')} }`);
      }

      // Prepare data parts for child: value or fetch
      const dataParts: string[] = [];
      if (child.data) {
        const dt = child.data as any;
        if (Array.isArray(dt.value)) {
          dataParts.push(`value: ${JSON.stringify(dt.value)}`);
        }
        if (dt.type === 'fetch' && typeof dt.value === 'string') {
          dataParts.push(`type: 'fetch'`);
          dataParts.push(`value: ${JSON.stringify(dt.value)}`);
        }
      }

      if (child.style) {
        parts.push(`style: ${JSON.stringify(child.style)}`);
      }

      if (typeof child.tooltip === 'boolean') {
        parts.push(`tooltip: ${child.tooltip}`);
      } else if (child.tooltip && typeof child.tooltip === 'object') {
        const t = child.tooltip as any;
        const tp: string[] = [];
        if (t.title !== undefined) {
          if (typeof t.title === 'boolean') tp.push(`title: ${t.title}`);
          else if (typeof t.title === 'string' && isFunctionLike(t.title)) tp.push(`title: ${t.title}`);
          else tp.push(`title: ${JSON.stringify(t.title)}`);
        }
        if (Array.isArray(t.items)) {
          const items = t.items.map((it: any) => (typeof it === 'string' && isFunctionLike(it) ? it : JSON.stringify(it)));
          tp.push(`items: [${items.join(', ')}]`);
        }
        parts.push(`tooltip: { ${tp.join(', ')} }`);
      }

      const dataTransformParts: string[] = [];
      const markTransformParts: string[] = [];
      if (child.transform && Array.isArray(child.transform)) {
        child.transform.forEach((t: any) => {
          if (t.type === 'fold' && t.fields) {
            dataTransformParts.push(`{ type: 'fold', fields: ${JSON.stringify(t.fields)}, key: ${JSON.stringify(t.key || 'key')}, value: ${JSON.stringify(t.value || 'value')} }`);
          } else if (t.type === 'map' && t.callback) {
            dataTransformParts.push(`{ type: 'map', callback: ${t.callback} }`);
          } else if (t.type === 'stackY') {
            const cfg: any = { type: 'stackY' };
            if (t.orderBy) cfg.orderBy = t.orderBy;
            if (t.offset) cfg.offset = t.offset;
            if (typeof t.reverse === 'boolean') cfg.reverse = t.reverse;
            if (typeof t.y === 'string') cfg.y = t.y;
            markTransformParts.push(JSON.stringify(cfg));
          } else if (t.type === 'normalizeY') {
            markTransformParts.push(`{ "type": "normalizeY" }`);
          } else if (t.type === 'diffY') {
            markTransformParts.push(`{ "type": "diffY" }`);
          }
        });
      }
      if (child.data?.transform && Array.isArray(child.data.transform)) {
        child.data.transform.forEach((t: any) => {
          if (t.type === 'fold' && t.fields) {
            dataTransformParts.push(`{ type: 'fold', fields: ${JSON.stringify(t.fields)}, key: ${JSON.stringify(t.key || 'key')}, value: ${JSON.stringify(t.value || 'value')} }`);
          } else if (t.type === 'map' && t.callback) {
            dataTransformParts.push(`{ type: 'map', callback: ${t.callback} }`);
          }
        });
      }
      // Emit data object if value/fetch or transform exists
      if (dataParts.length || dataTransformParts.length) {
        const pieces = [...dataParts];
        if (dataTransformParts.length) pieces.push(`transform: [${dataTransformParts.join(', ')}]`);
        parts.push(`data: { ${pieces.join(', ')} }`);
      }
      if (markTransformParts.length) parts.push(`transform: [${markTransformParts.join(', ')}]`);

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
