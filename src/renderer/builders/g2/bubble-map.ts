/**
 * G2 v5 Bubble Map Builder
 * Builds bubble maps using @antv/g2 v5 geoView
 * Displays geographic data with bubbles on a map background
 */

import { ChartBuilder, type ChartSpec } from '../base';

export class BubbleMapBuilder extends ChartBuilder {
  buildScriptTags(): string {
    return '<script src="https://cdn.jsdelivr.net/npm/@antv/g2@5/dist/g2.min.js"></script>';
  }

  buildHtml(spec: ChartSpec): string {
    const chartScript = this.buildChartScript(spec);
    return this.buildContainer(spec, chartScript);
  }

  private buildChartScript(spec: ChartSpec): string {
    const { theme = 'light', width = 800, height = 600 } = spec;

    // Check if using multi-layer or single-layer mode
    const isMultiLayer = spec.layers && spec.layers.length > 0;
    const data = isMultiLayer ? null : spec.data;
    const hasGroup = !isMultiLayer && this.hasGroupField(data);

    // Default map background - simplified world outline
    const defaultMapBackground = [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-180, -60],
              [180, -60],
              [180, 75],
              [-180, 75],
              [-180, -60],
            ],
          ],
        },
      },
    ];

    const mapBackground = spec.mapBackground || defaultMapBackground;

    // Map background style
    const mapBgFill = spec.mapBackgroundStyle?.fill || '#f0f0f0';
    const mapBgStroke = spec.mapBackgroundStyle?.stroke || '#d0d0d0';
    const mapBgLineWidth = spec.mapBackgroundStyle?.lineWidth || 1;

    // Default bubble style (for single-layer or as fallback)
    const fillOpacity = spec.style?.fillOpacity ?? 0.8;
    const lineWidth = spec.style?.lineWidth ?? 2;
    const stroke = spec.style?.stroke || 'white';

    // Scale configuration
    const sizeScale = spec.scale?.size || { range: [8, 40] };

    // Legend configuration
    const showSizeLegend = spec.legend?.size ?? false;
    const showColorLegend = spec.legend?.color ?? (hasGroup ? true : false);

    // Tooltip configuration
    const tooltipTitle = spec.tooltip?.title || 'name';
    const hasCustomTooltip = spec.tooltip?.items && spec.tooltip.items.length > 0;

    // Projection configuration
    const projectionConfig = this.buildProjectionConfig(spec);

    // Animation configuration
    const hasAnimation = spec.animation?.enabled !== false && this.hasTimeField(isMultiLayer ? spec.layers : data);
    const animationScript = hasAnimation ? this.buildAnimationScript(spec) : '';

    // Build children based on single-layer or multi-layer mode
    const children = isMultiLayer
      ? this.buildMultiLayerChildren(spec, mapBackground, mapBgFill, mapBgStroke, mapBgLineWidth)
      : this.buildSingleLayerChildren(data, hasGroup, mapBackground, mapBgFill, mapBgStroke, mapBgLineWidth,
                                       sizeScale, fillOpacity, stroke, lineWidth, showSizeLegend, showColorLegend,
                                       spec, hasCustomTooltip, tooltipTitle);

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
    type: 'geoView',
    ${projectionConfig}
    children: ${children}
  });

  chart.render();
  ${animationScript}
</script>`;
  }

  private hasGroupField(data: any[]): boolean {
    return Array.isArray(data) && data.some(d => d && d.group != null);
  }

  private hasTimeField(dataOrLayers: any): boolean {
    if (!dataOrLayers) return false;

    // Check if it's layers array
    if (Array.isArray(dataOrLayers) && dataOrLayers[0]?.data) {
      return dataOrLayers.some((layer: any) =>
        Array.isArray(layer.data) && layer.data.some((d: any) => d && d.time != null)
      );
    }

    // Check if it's single data array
    return Array.isArray(dataOrLayers) && dataOrLayers.some(d => d && d.time != null);
  }

  private buildProjectionConfig(spec: ChartSpec): string {
    if (!spec.projection?.type) {
      return '';
    }

    let config = `projection: { type: ${JSON.stringify(spec.projection.type)}`;

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

  private buildAnimationScript(spec: ChartSpec): string {
    const duration = spec.animation?.duration || 1000;
    const interval = spec.animation?.interval || 2000;
    const loop = spec.animation?.loop ?? true;
    const timeField = spec.animation?.timeField || 'time';

    return `
  // Time series animation
  let currentTimeIndex = 0;
  const allTimes = [...new Set(chart.options().children.flatMap(c =>
    c.data ? c.data.map(d => d.${timeField}).filter(t => t != null) : []
  ))].sort();

  function updateFrame() {
    if (allTimes.length === 0) return;

    const currentTime = allTimes[currentTimeIndex];
    chart.options().children.forEach((child, idx) => {
      if (child.type === 'point' && child.data) {
        const filteredData = child.data.filter(d => d.${timeField} === currentTime);
        chart.options().children[idx].data = filteredData;
      }
    });
    chart.render();

    currentTimeIndex = (currentTimeIndex + 1) % allTimes.length;
    if (!${loop} && currentTimeIndex === 0) return;

    setTimeout(updateFrame, ${interval});
  }

  setTimeout(() => updateFrame(), ${duration});`;
  }

  private buildSingleLayerChildren(
    data: any, hasGroup: boolean, mapBackground: any, mapBgFill: string,
    mapBgStroke: string, mapBgLineWidth: number, sizeScale: any, fillOpacity: number,
    stroke: string, lineWidth: number, showSizeLegend: boolean, showColorLegend: boolean,
    spec: ChartSpec, hasCustomTooltip: boolean, tooltipTitle: string
  ): string {
    return `[
      {
        type: 'geoPath',
        data: ${JSON.stringify(mapBackground)},
        style: {
          fill: ${JSON.stringify(mapBgFill)},
          stroke: ${JSON.stringify(mapBgStroke)},
          lineWidth: ${mapBgLineWidth}
        }
      },
      {
        type: 'point',
        data: ${JSON.stringify(data)},
        encode: {
          x: 'lng',
          y: 'lat',
          size: 'size',
          ${hasGroup ? `color: 'group',` : ''}
          shape: 'point'
        },
        scale: {
          size: ${JSON.stringify(sizeScale)}
          ${this.buildColorScale(spec)}
        },
        style: {
          opacity: ${fillOpacity},
          stroke: ${JSON.stringify(stroke)},
          lineWidth: ${lineWidth}
        },
        legend: {
          size: ${showSizeLegend}
          ${hasGroup ? `, color: ${showColorLegend}` : ''}
        }
        ${this.buildTooltipConfig(spec, hasCustomTooltip, tooltipTitle)}
      }
    ]`;
  }

  private buildMultiLayerChildren(
    spec: ChartSpec, mapBackground: any, mapBgFill: string,
    mapBgStroke: string, mapBgLineWidth: number
  ): string {
    const layers = spec.layers || [];

    // Build map background first
    let children = `[
      {
        type: 'geoPath',
        data: ${JSON.stringify(mapBackground)},
        style: {
          fill: ${JSON.stringify(mapBgFill)},
          stroke: ${JSON.stringify(mapBgStroke)},
          lineWidth: ${mapBgLineWidth}
        }
      }`;

    // Add each layer
    layers.forEach((layer: any, index: number) => {
      const hasGroup = this.hasGroupField(layer.data);
      const layerFillOpacity = layer.style?.fillOpacity ?? spec.style?.fillOpacity ?? 0.6;
      const layerLineWidth = layer.style?.lineWidth ?? spec.style?.lineWidth ?? 2;
      const layerStroke = layer.style?.stroke ?? spec.style?.stroke ?? 'white';
      const layerSizeScale = layer.scale?.size || spec.scale?.size || { range: [8, 40] };

      const showSizeLegend = spec.legend?.size ?? false;
      const showColorLegend = spec.legend?.color ?? (hasGroup ? true : false);

      const tooltipTitle = layer.tooltip?.title || spec.tooltip?.title || 'name';
      const hasCustomTooltip = (layer.tooltip?.items && layer.tooltip.items.length > 0) ||
                               (spec.tooltip?.items && spec.tooltip.items.length > 0);

      children += `,
      {
        type: 'point',
        data: ${JSON.stringify(layer.data)},
        encode: {
          x: 'lng',
          y: 'lat',
          size: 'size',
          ${hasGroup ? `color: 'group',` : ''}
          shape: 'point'
        },
        scale: {
          size: ${JSON.stringify(layerSizeScale)}
          ${this.buildColorScale(spec)}
        },
        style: {
          opacity: ${layerFillOpacity},
          stroke: ${JSON.stringify(layerStroke)},
          lineWidth: ${layerLineWidth}
        },
        legend: {
          size: ${showSizeLegend}
          ${hasGroup ? `, color: ${showColorLegend}` : ''}
        }
        ${this.buildTooltipConfig(layer.tooltip || spec.tooltip || {}, hasCustomTooltip, tooltipTitle)}
      }`;
    });

    children += `\n    ]`;
    return children;
  }

  private buildColorScale(spec: ChartSpec): string {
    if (!spec.style?.palette || spec.style.palette.length === 0) {
      return '';
    }
    return `,\n          color: { range: ${JSON.stringify(spec.style.palette)} }`;
  }

  private buildTooltipConfig(tooltipSpec: any, hasCustomTooltip: boolean, tooltipTitle: string): string {
    if (!hasCustomTooltip || !tooltipSpec.items) {
      return '';
    }

    // Build tooltip items
    const items = tooltipSpec.items.map((item: any) => {
      let itemConfig = `{ name: ${JSON.stringify(item.name)}`;

      if (item.field) {
        itemConfig += `, field: ${JSON.stringify(item.field)}`;
      }

      if (item.channel) {
        itemConfig += `, channel: ${JSON.stringify(item.channel)}`;
      }

      if (item.valueFormatter) {
        // Insert the formatter function directly (it's already a string)
        itemConfig += `, valueFormatter: ${item.valueFormatter}`;
      }

      itemConfig += ' }';
      return itemConfig;
    }).join(',\n            ');

    return `,
        tooltip: {
          title: ${JSON.stringify(tooltipTitle)},
          items: [
            ${items}
          ]
        }`;
  }
}
